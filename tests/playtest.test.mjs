import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {PATCH,BORROW} from '../playtest/puzzles.mjs';
import {apply,patchState,solvePatch,initialBorrow,borrowStep,borrowWon,replayBorrow,solveBorrow} from '../playtest/engine.mjs';
import {COPY,LANGUAGES,t} from '../playtest/copy.mjs';
import {createApp} from '../playtest/app.mjs';
const html=readFileSync(new URL('../playtest/index.html',import.meta.url),'utf8');
function setup(hash='#patch/1',saved){const dom=new JSDOM(html,{url:'https://qidolab.test/playtest/'+hash});const d=dom.window.document;if(saved)dom.window.localStorage.setItem('qidolab-two-experiments-v1',saved);let app=createApp(d);return {d,w:dom.window,q:s=>d.querySelector(s),click(s){const e=d.querySelector(s);assert.ok(e,s);assert.equal(e.disabled,false,s);e.click();},lang(v){d.querySelector('#language').value=v;d.querySelector('#language').dispatchEvent(new dom.window.Event('change',{bubbles:true}));},state:()=>app.getState(),reload(){app.destroy();app=createApp(d);},close(){app.destroy();dom.window.close();}};}
const choose=(ui,a)=>ui.click(a.type==='card'?`[data-card="${a.index}"]`:`[data-action="${a.type}"]`);
test('twelve independent preview rounds have valid solutions; late patch rounds require the checkpoint',()=>{
 assert.equal(PATCH.length,6);assert.equal(BORROW.length,6);
 for(const p of PATCH){assert.ok(patchState(p).legal);assert.equal(patchState(p).won,false);const sols=solvePatch(p);assert.equal(sols.length,1);assert.ok(patchState(p,sols[0]).won);}
 for(const p of PATCH.slice(3)){const wrong=solvePatch(p,false).filter(s=>!patchState(p,s).checkpoint);assert.ok(wrong.length);for(const s of wrong)assert.equal(patchState(p,s).won,false);}
 for(const p of BORROW){const solutions=solveBorrow(p);assert.ok(solutions.length);for(const route of solutions){const state=replayBorrow(p,route);assert.equal(state.moves.length,p.cards.length+2);assert.equal(new Set(state.used).size,p.cards.length);assert.ok(borrowWon(p,state));}}
});
test('borrow accounting rejects invalid operations, reusing cards, returning early and unfinished wins',()=>{
 const p=BORROW[0],start=initialBorrow(p);assert.equal(borrowStep(p,start,{type:'return'}),null);
 const loan=borrowStep(p,start,{type:'borrow'});assert.equal(loan.value,5);assert.equal(borrowStep(p,loan,{type:'borrow'}),null);
 const doubled=borrowStep(p,loan,{type:'card',index:0});assert.equal(doubled.value,10);assert.equal(borrowStep(p,doubled,{type:'card',index:0}),null);
 assert.equal(borrowWon({...p,goal:10},doubled),false);
 const returned=borrowStep(p,doubled,{type:'return'});assert.equal(returned.value,7);assert.ok(borrowWon(p,returned));assert.equal(borrowStep(p,returned,{type:'return'}),null);
 assert.equal(apply(3,{kind:'/',n:2}),null);assert.equal(apply(0,{kind:'-',n:1}),null);assert.equal(apply(50,{kind:'*',n:2}),null);
});
for(const lang of LANGUAGES)test(`both previews can complete all six rounds through the ${lang} interface`,()=>{
 const ui=setup();ui.lang(lang);
 for(let i=0;i<6;i++){ui.click(`[data-round="${i}"]`);const s=solvePatch(PATCH[i])[0];ui.click(`[data-slot="${s.slot}"]`);ui.click(`[data-choice="${s.choice}"]`);assert.ok(ui.q('.won'));assert.equal(ui.state().progress.patch[i].solved,true);assert.equal(ui.q('h2').textContent,t('patch',lang));}
 ui.click('[data-game=borrow]');
 for(let i=0;i<6;i++){ui.click(`[data-round="${i}"]`);for(const action of solveBorrow(BORROW[i])[0])choose(ui,action);assert.ok(ui.q('.won'));assert.equal(ui.state().progress.borrow[i].solved,true);assert.equal(ui.q('.debt-card .big-value').textContent,'0');assert.equal(ui.q('.value-card .big-value').textContent,String(BORROW[i].goal));}
 ui.reload();assert.equal(ui.d.documentElement.lang,lang);assert.ok(ui.q('.won'));assert.equal(ui.state().progress.borrow.filter(r=>r.solved).length,6);ui.close();
});
test('one repair never accumulates edits; undo restores the previous repair; hints do not solve',()=>{
 const ui=setup('#patch/4'),p=PATCH[3],wrong=solvePatch(p,false).find(s=>!patchState(p,s).checkpoint),good=solvePatch(p)[0];
 ui.click('[data-action=hint]');ui.click('[data-action=solution]');assert.equal(ui.state().progress.patch[3].solved,false);assert.ok(ui.q('#solution-output').textContent);
 ui.click(`[data-slot="${wrong.slot}"]`);ui.click(`[data-choice="${wrong.choice}"]`);assert.ok(ui.q('.attempt-status').textContent.includes('checkpoint'));assert.equal(ui.q('.won'),null);
 const before=JSON.stringify(ui.state().progress.patch[3].repair);
 ui.click(`[data-slot="${good.slot}"]`);ui.click(`[data-choice="${good.choice}"]`);assert.ok(ui.q('.won'));assert.equal(ui.d.querySelectorAll('.instruction-strip .changed').length,1);
 ui.click('[data-action=undo]');assert.equal(JSON.stringify(ui.state().progress.patch[3].repair),before);assert.equal(ui.q('.won'),null);assert.equal(ui.state().progress.patch[3].helped,true);ui.close();
});
test('borrow undo, restart, dead-end hints, reload and locale switches preserve accounting',()=>{
 const ui=setup('#borrow/1');ui.click('[data-card="0"]');ui.click('[data-action=hint]');assert.ok(ui.q('.help-output').textContent.includes('cannot reach'));
 ui.click('[data-action=undo]');assert.equal(ui.q('.value-card .big-value').textContent,'2');ui.click('[data-action=borrow]');
 for(const lang of LANGUAGES){ui.lang(lang);assert.equal(ui.q('.value-card .big-value').textContent,'5');assert.equal(ui.q('.debt-card .big-value').textContent,'3');for(const e of ui.d.querySelectorAll('[data-text]'))assert.ok(e.textContent.trim());}
 ui.reload();assert.equal(ui.q('.debt-card .big-value').textContent,'3');ui.click('[data-card="0"]');ui.click('[data-action=return]');assert.ok(ui.q('.won'));ui.click('[data-action=undo]');assert.equal(ui.q('.debt-card .big-value').textContent,'3');assert.equal(ui.q('.won'),null);ui.click('[data-action=reset]');assert.equal(ui.q('.value-card .big-value').textContent,'2');assert.equal(ui.q('.debt-card .big-value').textContent,'0');ui.close();
});
test('translation placeholders match, IDs are unique, and broken storage leaves the preview playable',()=>{
 for(const [key,copies] of Object.entries(COPY)){assert.equal(copies.length,4);const params=s=>[...s.matchAll(/\{\w+\}/g)].map(x=>x[0]).sort();for(const copy of copies){assert.ok(copy.trim(),key);assert.deepEqual(params(copy),params(copies[0]),key);}}
 const ui=setup('#patch/1','{"patch":[{"repair":{"slot":999,"choice":0}}],"borrow":[{"moves":[null]}]}');assert.equal(ui.state().progress.patch[0].repair,null);
 Object.defineProperty(ui.w,'localStorage',{get(){throw Error('blocked');}});ui.reload();assert.equal(ui.q('#storage-error').hidden,false);const s=solvePatch(PATCH[0])[0];ui.click(`[data-slot="${s.slot}"]`);ui.click(`[data-choice="${s.choice}"]`);assert.ok(ui.q('.won'));assert.equal(ui.q('#storage-error').hidden,false);
 const ids=[...ui.d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size);ui.close();
});
