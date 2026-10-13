import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import * as E from '../next/engine.mjs';
import {PUZZLES} from '../next/puzzles.mjs';
import {COPY,LANGUAGES} from '../next/copy.mjs';
import {lessons} from '../next/guides.mjs';
import {createApp} from '../next/app.mjs';
const html=readFileSync(new URL('../next/index.html',import.meta.url),'utf8');
function setup(hash='#echo/1',saved){const dom=new JSDOM(html,{url:'https://qidolab.test/next/'+hash}),w=dom.window,d=w.document;if(saved)w.localStorage.setItem('qidolab-four-new-v1',saved);let app=createApp(d);return {d,w,q:s=>d.querySelector(s),state:()=>app.getState(),click(s){const e=d.querySelector(s);assert.ok(e,s);assert.equal(e.disabled,false,s);e.click();},lang(lang){d.querySelector('#language').value=lang;d.querySelector('#language').dispatchEvent(new w.Event('change',{bubbles:true}));},input(i,value){const e=d.querySelector(`#code-${i}`);e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}));},submit(){d.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));},reload(){app.destroy();app=createApp(d);},close(){app.destroy();w.close();}};}
function assignment(p,code){const used=new Set();return p.guesses.map(g=>{const id=p.feedback.findIndex((f,i)=>!used.has(i)&&E.equal(f,E.score(code,g)));used.add(id);return id;});}
function solveUI(u,g,p){
 if(g==='echo')for(const m of E.solveEcho(p)[0]){u.click(`[data-side="${m.side}"]`);u.click(`[data-echo-card="${m.card}"]`);}
 if(g==='tally')E.solveTally(p)[0].forEach((bit,i)=>{if(bit)u.click(`[data-tile="${i}"]`);});
 if(g==='both')for(const id of E.solveBoth(p)[0])u.click(`[data-both-card="${id}"]`);
 if(g==='mixed'){const code=E.solveMixed(p)[0];assignment(p,code).forEach((id,row)=>{u.click(`[data-feedback="${id}"]`);u.click(`[data-guess-row="${row}"]`);});[...code].forEach((n,i)=>u.input(i,n));assert.equal(u.q('.game-status.won'),null);u.submit();}
 assert.ok(u.q('.game-status.won'),g+': '+p.id);
}
test('all forty independently generated puzzles satisfy their full solution constraints',()=>{
 for(const [g,ps]of Object.entries(PUZZLES)){assert.equal(ps.length,10);assert.equal(new Set(ps.map(p=>JSON.stringify(p))).size,10);
 for(const p of ps){if(g==='echo'){const sols=E.solveEcho(p);assert.ok(sols.length);assert.equal(E.echoWon(p,E.initialEcho(p)),false);for(const moves of sols){let s=E.initialEcho(p);for(const m of moves){s=E.echoStep(p,s,m);assert.ok(s.phases.every(ph=>ph.values.every(v=>Number.isInteger(v)&&v>=0&&v<=99)));}assert.ok(E.echoWon(p,s));assert.equal(s.pending,null);}}
 if(g==='tally'){assert.equal(E.solveTally(p).length,1);assert.equal(E.tallyState(p).won,false);}
 if(g==='both'){const sols=E.solveBoth(p);assert.equal(sols.length,1);assert.equal(new Set(sols[0]).size,p.cards.length);assert.ok(E.bothState(p,sols[0]).won);assert.equal(E.bothState(p,sols[0].slice(0,-1)).won,false);}
 if(g==='mixed'){const sols=E.solveMixed(p);assert.equal(sols.length,1);assert.ok(E.mixedWon(p,sols[0],assignment(p,sols[0])));assert.equal(E.mixedWon(p,sols[0],[null,null,null,null]),false);}
 }}
});
test('echo ordering, delayed target, final flush, invalid atomicity and card reuse',()=>{
 const p={starts:[2,7],goals:[6,15],cards:[{kind:'+',n:3},{kind:'*',n:2},{kind:'-',n:2}]};let s=E.initialEcho(p);
 s=E.echoStep(p,s,{card:0,side:0});assert.deepEqual(s.values,[5,7]);assert.deepEqual(s.pending,{card:0,side:1});
 s=E.echoStep(p,s,{card:1,side:1});assert.deepEqual(s.phases.map(x=>x.values),[[5,14],[5,17]]);assert.equal(E.echoStep(p,s,{card:1,side:0}),null);
 s=E.echoStep(p,s,{card:2,side:0});assert.deepEqual(s.phases.map(x=>x.values),[[3,17],[6,17],[6,15]]);assert.ok(E.echoWon(p,s));assert.equal(E.echoWon(p,{...s,pending:{card:2,side:1}}),false);
 const overflow={starts:[48,4],cards:[{kind:'+',n:4},{kind:'*',n:2}],goals:[1,1]},old=E.echoStep(overflow,E.initialEcho(overflow),{card:0,side:1}),saved=JSON.stringify(old);assert.equal(E.echoStep(overflow,old,{card:1,side:0}),null);assert.equal(JSON.stringify(old),saved);
 assert.equal(E.echoStep(p,E.initialEcho(p),{card:2,side:7}),null);assert.deepEqual(E.replayEcho(p,[null]).moves,[]);
});
test('mixed feedback is inclusive, reusable only by swapping, and identical cards are equivalent',()=>{
 assert.deepEqual(E.score('0425','3025'),[3,2]);assert.deepEqual(E.assignFeedback([0,1,null,null],1,0),[1,0,null,null]);assert.deepEqual(E.assignFeedback([0,null,null,null],1,0),[null,0,null,null]);
 const p={digits:'012345',guesses:['1234','2134','0245','3140'],feedback:[]};p.feedback=p.guesses.map(g=>E.score('0425',g));assert.deepEqual(p.feedback[0],p.feedback[1]);assert.ok(E.mixedWon(p,'0425',[1,0,2,3]));assert.equal(E.mixedWon(p,'0425',[0,0,2,3]),false);assert.equal(E.validCode(p,'0025'),false);assert.equal(E.validCode(p,'0426'),false);assert.ok(E.validCode(p,'0425'));
});
test('both-way example reverses order, not operations; tally flips one row and one column',()=>{
 const p={starts:[3,8],goals:[16,63],cards:[{kind:'*',n:3},{kind:'-',n:3},{kind:'*',n:2},{kind:'+',n:4}]};assert.deepEqual(E.bothState(p,[0,1,2,3]).paths,[[3,9,6,12,16],[8,12,24,21,63]]);assert.equal(E.bothState(p,[0,0,2,3]).won,false);assert.equal(E.bothState({...p,cards:[{kind:'/',n:2}],goals:[1.5,4]},[0]).won,false);
 const q=PUZZLES.tally[0],before=E.tallyState(q),flips=Array(9).fill(false);flips[4]=true;const after=E.tallyState(q,flips),delta=q.pairs[4][1]-q.pairs[4][0];assert.equal(after.rows[1]-before.rows[1],delta);assert.equal(after.cols[1]-before.cols[1],-delta);assert.equal(after.rows[0],before.rows[0]);assert.equal(after.cols[2],before.cols[2]);
});
for(const lang of LANGUAGES)test(`complete all forty rounds through the ${lang} UI, without tutorial progress interference`,()=>{
 const u=setup();u.lang(lang);for(const g of Object.keys(PUZZLES)){u.click(`[data-game=${g}]`);const unchanged=JSON.stringify(u.state().progress[g]);for(let i=0;i<4;i++){assert.ok(u.q('#tour-title'));u.click('[data-tour=next]');}u.click('[data-tour=close]');assert.equal(JSON.stringify(u.state().progress[g]),unchanged);
 for(let i=0;i<10;i++){u.click(`[data-round="${i}"]`);solveUI(u,g,PUZZLES[g][i]);}assert.equal(u.state().progress[g].filter(r=>r.solved).length,10);}
 u.reload();assert.ok(u.q('.game-status.won'));assert.equal(u.d.documentElement.lang,lang);assert.ok(u.q('[data-tour=open]'));u.close();
});
test('undo restores final echoes, flip state, removed cards, pair swaps and code typing',()=>{
 const u=setup();solveUI(u,'echo',PUZZLES.echo[0]);u.click('[data-action=undo]');const r=u.state().progress.echo[0];assert.ok(E.replayEcho(PUZZLES.echo[0],r.moves).pending);assert.equal(u.q('.game-status.won'),null);
 u.click('[data-game=tally]');u.click('[data-tile="4"]');u.click('[data-action=undo]');assert.equal(u.state().progress.tally[0].flips[4],false);
 u.click('[data-game=both]');u.click('[data-both-card="2"]');u.click('[data-both-card="0"]');u.click('[data-remove="0"]');u.click('[data-action=undo]');assert.deepEqual(u.state().progress.both[0].order,[2,0]);
 u.click('[data-game=mixed]');u.click('[data-feedback="0"]');u.click('[data-guess-row="0"]');u.click('[data-feedback="1"]');u.click('[data-guess-row="1"]');u.click('[data-feedback="0"]');u.click('[data-guess-row="1"]');assert.deepEqual(u.state().progress.mixed[0].assignment,[1,0,null,null]);u.click('[data-action=undo]');assert.deepEqual(u.state().progress.mixed[0].assignment,[0,1,null,null]);u.input(1,'4');assert.equal(u.q('[data-action=undo]').disabled,false);u.click('[data-action=undo]');assert.equal(u.q('#code-1').value,'');u.close();
});
test('language and reload preserve drafts, feedback, selected side and optional assistance',()=>{
 const u=setup('#mixed/2');u.input(1,'4');u.input(3,'0');u.click('[data-feedback="1"]');u.click('[data-guess-row="2"]');u.click('[data-action=hint]');u.click('[data-action=solution]');assert.equal(u.state().progress.mixed[1].solved,false);
 for(const lang of LANGUAGES){u.lang(lang);assert.equal(u.q('#code-1').value,'4');assert.equal(u.q('#code-3').value,'0');assert.equal(u.state().progress.mixed[1].assignment[2],1);assert.ok(u.q('#new-solution').textContent);}
 u.reload();assert.equal(u.q('#code-0').value,'');assert.equal(u.q('#code-1').value,'4');u.click('[data-action=reset]');assert.equal(u.q('#code-1').value,'');assert.equal(u.q('[data-action=undo]').disabled,true);u.submit();assert.equal(u.q('.game-status.won'),null);
 const paste=new u.w.Event('paste',{bubbles:true,cancelable:true});Object.defineProperty(paste,'clipboardData',{value:{getData:()=> '０１２３'}});u.q('#code-0').dispatchEvent(paste);assert.equal(u.state().progress.mixed[1].draft,'0123');u.click('[data-action=undo]');assert.equal(u.q('#code-0').value,'');u.close();
});
test('malformed and unavailable storage cannot crash or create invalid play states',()=>{
 const u=setup('#both/1',JSON.stringify({both:[{order:[0,0,99],history:[null]}],mixed:[{draft:'<svg',assignment:[1,1,8,null]}],echo:[{moves:[{card:999,side:0}]}]}));assert.deepEqual(u.state().progress.both[0].order,[0]);u.click('[data-game=mixed]');assert.deepEqual(u.state().progress.mixed[0].assignment,[1,null,null,null]);assert.equal(u.q('#play svg'),null);
 Object.defineProperty(u.w,'localStorage',{get(){throw Error('blocked');}});u.reload();assert.equal(u.q('#storage-error').hidden,false);u.click('[data-game=tally]');u.click('[data-tile="1"]');assert.equal(u.q('#storage-error').hidden,false);u.close();
});
test('all regional copy and guide steps have nonempty strings and matching variables',()=>{
 const rows=[...Object.values(COPY),...Object.values(lessons).flat().flat()];for(const row of rows){assert.equal(row.length,4);for(const s of row){assert.ok(s.trim());assert.deepEqual((s.match(/\{\w+\}/g)||[]).sort(),(row[0].match(/\{\w+\}/g)||[]).sort());}}
 const u=setup();for(const g of Object.keys(PUZZLES)){u.click(`[data-game=${g}]`);const ids=[...u.d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size);}u.close();
});
