import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {createApp as previewApp} from '../playtest/app.mjs';
import {createApp as mainApp} from '../2/app.mjs';
import {UI,LESSONS,LANGUAGES,localize} from '../tutorial-copy.mjs';
import {patchState,replayBorrow,borrowWon} from '../playtest/engine.mjs';
import {scoreCode} from '../2/engine.mjs';
const html=dir=>readFileSync(new URL(`../${dir}/index.html`,import.meta.url),'utf8');
function setup(dir,hash){const dom=new JSDOM(html(dir),{url:`https://qidolab.test/${dir}/${hash}`});const d=dom.window.document;let app=(dir==='2'?mainApp:previewApp)(d);return {dom,d,app,click(action){const b=d.querySelector(`[data-tour=${action}]`);assert.ok(b,action);b.click();},lang(lang){const s=d.querySelector('#language');s.value=lang;s.dispatchEvent(new dom.window.Event('change',{bubbles:true}));},close(){app.destroy();dom.window.close();}};}
test('all guide steps and controls have complete translations with matching placeholders',()=>{
 const rows=[...Object.values(UI),...Object.values(LESSONS).flat().flat()];
 for(const row of rows){assert.equal(row.length,4);for(const s of row){assert.ok(s.trim());assert.doesNotMatch(s,/暖身|undefined/);assert.deepEqual(s.match(/\{\w+\}/g),row[0].match(/\{\w+\}/g));}}
});
for(const lang of LANGUAGES)test(`four independent animated demos complete, reopen, and preserve gameplay in ${lang}`,()=>{
 for(const [dir,hash,game] of [['playtest','#patch/1','patch'],['playtest','#borrow/1','borrow'],['2','#24/1','twentyfour'],['2','#code/1','code']]){
  const u=setup(dir,hash);u.lang(lang);const before=u.d.querySelector('#play').innerHTML;
  const key=dir==='2'?'qidolab-v2-progress-v1':'qidolab-two-experiments-v1',saved=u.dom.window.localStorage.getItem(key);
  for(let i=0;i<LESSONS[game].length;i++){
   assert.equal(u.d.querySelector('#tour-title').textContent,localize(LESSONS[game][i][0],lang));
   assert.ok(u.d.querySelector('.tour-scene').textContent.trim());
   assert.ok(u.d.querySelectorAll('.tour-beat,.tour-highlight,.tour-digits').length);
   u.click('replay');assert.equal(u.d.querySelector('#tour-title').textContent,localize(LESSONS[game][i][0],lang));
   if(i<LESSONS[game].length-1)u.click('next');
  }
  u.click('close');assert.equal(u.d.querySelector('.tour-panel'),null);assert.ok(u.d.querySelector('[data-tour=open]'));
  assert.equal(u.d.querySelector('#play').innerHTML,before);assert.equal(u.dom.window.localStorage.getItem(key),saved);
  u.click('open');assert.equal(u.d.querySelector('#tour-title').textContent,localize(LESSONS[game][0][0],lang));
  u.click('next');u.click('back');assert.equal(u.d.querySelector('[data-tour=back]').disabled,true);
  u.close();
 }
});
test('first visit, language switching, game switching and reload preserve guide state separately',()=>{
 const u=setup('playtest','#patch/1');u.click('next');u.lang('zh-TW');assert.equal(u.d.querySelector('#tour-title').textContent,LESSONS.patch[1][0][2]);
 u.d.querySelector('[data-game=borrow]').click();assert.equal(u.d.querySelector('#tour-title').textContent,LESSONS.borrow[0][0][2]);u.click('close');
 u.d.querySelector('[data-game=patch]').click();assert.equal(u.d.querySelector('#tour-title').textContent,LESSONS.patch[1][0][2]);u.click('close');
 u.app.destroy();u.app=previewApp(u.d);assert.equal(u.d.querySelector('.tour-panel'),null);
 u.d.querySelector('[data-game=borrow]').click();assert.equal(u.d.querySelector('.tour-panel'),null);
 u.click('open');u.click('next');const ids=[...u.d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size);
 u.close();
});
test('unavailable tutorial storage never blocks dismissing or playing',()=>{
 const u=setup('playtest','#borrow/1');u.app.destroy();Object.defineProperty(u.dom.window,'localStorage',{get(){throw Error('blocked');}});u.app=previewApp(u.d);u.click('close');assert.equal(u.d.querySelector('.tour-panel'),null);
 u.d.querySelector('[data-action=borrow]').click();assert.equal(u.d.querySelector('.debt-card .big-value').textContent,'3');u.close();
});
test('independent demo calculations agree with game engines',()=>{
 const p={starts:[2,5],ops:[{kind:'+',n:1},{kind:'*',n:2},{kind:'-',n:1}],choices:[{kind:'*',n:2}],goals:[12,24],check:{lane:0,step:1,value:3}};
 assert.deepEqual(patchState(p).paths,[[2,3,6,5],[5,6,12,11]]);assert.ok(patchState(p,{slot:2,choice:0}).won);
 const b={start:4,loan:2,cards:[{kind:'*',n:3}],goal:16};assert.ok(borrowWon(b,replayBorrow(b,[{type:'borrow'},{type:'card',index:0},{type:'return'}])));assert.equal(replayBorrow(b,[{type:'borrow'},{type:'return'},{type:'card',index:0}]).value,12);
 assert.deepEqual(scoreCode('4270','1234'),{present:2,placed:1});assert.deepEqual(scoreCode('4270','4210'),{present:3,placed:3});assert.deepEqual(scoreCode('4270','4270'),{present:4,placed:4});assert.equal(((1+3)+2)*4,24);
});
