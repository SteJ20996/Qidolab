import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {COPY,languages} from '../classics/copy.mjs';
import {collectionCopy,initCollectionNav} from '../collection-nav.mjs';
const markup=readFileSync(new URL('../classics/index.html',import.meta.url),'utf8');

test('traditional Chinese walkthrough and all four interactive games work; language can change',async()=>{
 const dom=new JSDOM(markup,{url:'https://qidolab.test/classics/?lang=zh-TW'});
 const w=dom.window;
 for(const key of ['document','location','localStorage','history','MutationObserver'])globalThis[key]=w[key];
 globalThis.addEventListener=w.addEventListener.bind(w);
 const click=(selector)=>{const button=w.document.querySelector(selector);assert.ok(button,selector);button.click();};
 const disposeNav=initCollectionNav(w.document);
 await import('../footer-contact.mjs?classics-ui');
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
 for(const [i,lang] of languages.entries()){
  w.document.querySelector('#language').value=lang;w.document.querySelector('#language').dispatchEvent(new w.Event('change',{bubbles:true}));
  await Promise.resolve();
  assert.equal(w.document.documentElement.lang,lang);
  for(const el of w.document.querySelectorAll('[data-copy]'))assert.equal(el.textContent,COPY[lang][el.dataset.copy],lang+': '+el.dataset.copy);
  assert.equal(w.document.querySelector('.game-tabs').getAttribute('aria-label'),COPY[lang].games);
  assert.equal(w.document.querySelector('.collection-switch').getAttribute('aria-label'),collectionCopy.label[i]);
  assert.equal(w.document.querySelector('.collection-switch [data-collection-text=classicsName]').textContent,collectionCopy.classicsName[i]);
  assert.equal(w.document.querySelector('.footer-contact [data-contact-label]').textContent,['Questions or feedback? Email','如有问题或建议，请联系','如有問題或建議，請聯絡','¿Tienes preguntas o sugerencias? Escríbenos a'][i]);
  assert.equal(w.document.querySelector('.feedback').textContent,COPY[lang].queensGood);
  assert.equal(w.document.querySelector('.footer-privacy').href,'https://qidolab.test/privacy/?lang='+lang);
  assert.equal(w.document.querySelector('.return-action').href,'https://qidolab.test/2/');
  assert.equal(w.document.querySelectorAll('.completed').length,4);
  assert.ok([...w.document.querySelectorAll('.completed')].every(el=>el.textContent==='✓'));
  assert.match(w.location.search,new RegExp('lang='+lang));
 }
 disposeNav();
 dom.window.close();
});
