import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const markup=readFileSync(new URL('../classics/index.html',import.meta.url),'utf8');

test('traditional Chinese walkthrough and all four interactive games work; language can change',async()=>{
 const dom=new JSDOM(markup,{url:'https://qidolab.test/classics/?lang=zh-TW'});
 const w=dom.window;
 for(const key of ['document','location','localStorage','history'])globalThis[key]=w[key];
 globalThis.addEventListener=w.addEventListener.bind(w);
 const click=(selector)=>{const button=w.document.querySelector(selector);assert.ok(button,selector);button.click();};
 await import('../classics/app.mjs');
 assert.equal(w.document.documentElement.lang,'zh-TW');
 assert.match(w.document.querySelector('.intro h1').textContent,/經典換個玩/);
 assert.match(w.document.querySelector('#walkthrough').textContent,/第 1 \/ 3 步/);
 click('[data-action=guide-next]');click('[data-action=guide-next]');click('[data-action=guide-next]');
 for(const den of [4,3,2,4,3,2])click(`[data-action=fox-pick][data-value="${den}"]`);
 click('[data-action=fox-check]');assert.match(w.document.querySelector('.feedback').textContent,/保證找到了/);
 click('[data-game=river]');for(const passenger of ['goat','solo','wolf','goat','cabbage','solo','goat']){click(`[data-action=passenger][data-value="${passenger}"]`);click('[data-action=river-cross]');}
 assert.match(w.document.querySelector('.feedback').textContent,/平安到對岸/);
 click('[data-game=hanoi]');for(const peg of [0,2,0,1,2,1,0,2,1,0,1,2,0,2])click(`[data-action=peg][data-value="${peg}"]`);
 assert.match(w.document.querySelector('.feedback').textContent,/搬好了/);
 click('[data-game=queens]');for(const [r,c] of [1,3,0,2].entries())click(`[data-action=queen][data-row="${r}"][data-col="${c}"]`);
 assert.match(w.document.querySelector('.feedback').textContent,/自己的位置/);
 assert.equal(w.document.querySelectorAll('.completed').length,4);
 assert.ok([...w.document.querySelectorAll('.completed')].every(el=>el.textContent==='✓'));
 w.document.querySelector('#language').value='es-MX';w.document.querySelector('#language').dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(w.document.documentElement.lang,'es-MX');assert.match(w.document.querySelector('.intro h1').textContent,/Clásicos/);
 assert.match(w.location.search,/lang=es-MX/);
 dom.window.close();
});
