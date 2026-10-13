import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {createApp as classic} from '../2/app.mjs';
import {createApp as experiments} from '../playtest/app.mjs';
import {createApp as additional} from '../next/app.mjs';
import {COPY} from '../next/copy.mjs';
import {initCollectionNav} from '../collection-nav.mjs';
const names=['game24','gameCode','patch','borrow','echo','mixed','tally','both'];
for(const [path,app] of [['2',classic],['2/experiments',experiments],['next',additional]]){
 test(`${path}: all eight games stay reachable and translated without losing icons`,async()=>{
  const dom=new JSDOM(readFileSync(new URL(`../${path}/index.html`,import.meta.url),'utf8'),{url:`https://qidolab.test/${path}/`});
  const {document:d}=dom.window;const game=app(d),dispose=initCollectionNav(d);
  const nav=d.querySelector('.jom-games'),items=[...nav.children];assert.equal(items.length,8);
  const icons=items.map(el=>el.querySelector('[aria-hidden]'));assert.ok(icons.every(Boolean));
  const art=icons.map(el=>el.querySelector('img.game-art'));
  assert.ok(art.every(Boolean));assert.equal(new Set(art.map(el=>el.getAttribute('src'))).size,8);
  for(const img of art){
   assert.equal(img.alt,'');assert.equal(img.getAttribute('draggable'),'false');
   const svg=readFileSync(new URL('..'+new URL(img.src).pathname,import.meta.url),'utf8');
   const asset=new JSDOM(svg,{contentType:'image/svg+xml'});
   assert.equal(asset.window.document.documentElement.getAttribute('viewBox'),'0 0 72 72');
   assert.equal(asset.window.document.querySelector('script,foreignObject,image'),null);
   asset.window.close();
  }
  for(const a of nav.querySelectorAll('a')){
   const url=new URL(a.href);assert.ok(existsSync(new URL(`..${url.pathname}index.html`,import.meta.url)),url.pathname);
   assert.ok(/^#(?:24|code|patch|borrow|echo|mixed|tally|both)\//.test(url.hash),url.hash);
  }
  for(const [i,lang] of ['en','zh-CN','zh-TW','es-MX'].entries()){
   const select=d.getElementById('language');select.value=lang;select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));await Promise.resolve();
   items.forEach((el,j)=>{assert.ok(el.textContent.includes(COPY[names[j]][i]),el.textContent);assert.equal(el.querySelector('[aria-hidden]'),icons[j]);assert.equal(el.querySelector('img.game-art'),art[j]);assert.doesNotMatch(el.textContent,/undefined|暖身/);});
   assert.equal(d.querySelectorAll('.collection-switch [aria-current=page]').length,1);
   assert.equal(d.querySelector('.collection-switch [aria-current=page]').dataset.collection,'more');
  }
  game.destroy();dispose();dom.window.close();
 });
}
