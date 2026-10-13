import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {createApp as baseApp} from '../2/app.mjs';
import {createApp as extraApp} from '../playtest/app.mjs';
const root=new URL('../',import.meta.url);
for(const [file,create] of [['2/index.html',baseApp],['2/experiments/index.html',extraApp]])test(`${file}: four named destinations, working local assets, and every language`,()=>{
 const html=readFileSync(new URL(file,root),'utf8'),url='https://qidolab.test/'+file.replace('index.html','');
 const dom=new JSDOM(html,{url}),d=dom.window.document,app=create(d);
 for(const lang of ['en','zh-CN','zh-TW','es-MX']){
  const select=d.querySelector('#language');select.value=lang;select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  const entries=[...d.querySelector('.jom-games').children];assert.equal(entries.length,4);
  for(const e of entries)assert.ok(e.textContent.trim());
  assert.equal(entries.filter(e=>e.getAttribute('aria-pressed')==='true').length,1);
  for(const a of d.querySelectorAll('.jom-games>a')){const path=new URL(a.href).pathname;assert.ok(existsSync(new URL(path.slice(1)+'index.html',root)),path);assert.ok(new URL(a.href).hash);}
  assert.ok(d.querySelector('#tour-title'));assert.doesNotMatch(d.body.textContent,/暖身/);
 }
 for(const tag of d.querySelectorAll('script[src],link[rel=stylesheet],link[rel=icon],img[src]')){
  const u=new URL(tag.getAttribute('src')||tag.getAttribute('href'),url);assert.ok(existsSync(new URL(u.pathname.slice(1),root)),u.href);
 }
 const imports=JSON.parse(d.querySelector('script[type=importmap]').textContent).imports;
 for(const value of Object.values(imports)){const u=new URL(value,url);assert.ok(existsSync(new URL(u.pathname.slice(1),root)),u.href);}
 if(file.includes('experiments')){
  assert.ok(imports['../../playtest/copy.mjs']);
  assert.equal(d.querySelector('meta[name=robots]'),null);
  assert.equal(d.querySelector('.collection-choice[aria-current=page]').getAttribute('href'),'/2/');
  d.querySelector('[data-game=borrow]').click();assert.ok(d.querySelector('.borrow-layout'));
  d.querySelector('[data-action=borrow]').click();assert.equal(d.querySelector('.debt-card .big-value').textContent,'3');
 }
 app.destroy();dom.window.close();
});
