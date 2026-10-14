import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import {headers,publicPages} from '../scripts/build-headers.mjs';
import {syncLanguageURL,languageCodes,pages} from '../language-url.mjs';
const root=new URL('../',import.meta.url);

test('CSP allows exactly the published inline scripts and leaves revalidation enabled',()=>{
 const value=fs.readFileSync(new URL('_headers',root),'utf8');assert.equal(value,headers());
 assert.match(value,/frame-ancestors 'self'/);assert.match(value,/X-Frame-Options: SAMEORIGIN/);
 assert.doesNotMatch(value.match(/script-src ([^;]+)/)[1],/unsafe-inline|unsafe-eval/);
 assert.match(value,/max-age=0, must-revalidate/);
 for(const file of publicPages){const doc=new JSDOM(fs.readFileSync(new URL(file,root),'utf8')).window.document;assert.ok(doc.querySelector('[data-privacy-link]')||file==='privacy/index.html',file);}
});

test('the English static homepage is readable before JavaScript and preserves translation keys',()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('index.html',root),'utf8')),d=dom.window.document;
 for(const el of d.querySelectorAll('option,script,style'))el.remove();
 assert.doesNotMatch(d.body.textContent,/[\u3400-\u9fff]/);
 for(const el of d.querySelectorAll('[aria-label]'))assert.doesNotMatch(el.getAttribute('aria-label'),/[\u3400-\u9fff]/);
 assert.match(d.querySelector('#activity-water .intro p:last-child').textContent,/4 L\.\s+Can/);
 assert.match(d.querySelector('#activity-water .quiet-note').textContent,/time\.\s+Go/);
 assert.match(d.querySelector('#activity-lights .quiet-note').textContent,/undo\.\s+Make/);
 assert.match(d.querySelector('#activity-coins .quiet-note').textContent,/coin\.\s+Evidence/);
 assert.match(d.querySelector('#activity-numbers .quiet-note').textContent,/guessing\.\s+Test/);
 assert.ok(d.querySelectorAll('[data-i18n]').length>30);dom.window.close();
});

test('language URLs keep the game route and expose matching canonical and alternate languages',()=>{
 for(const route of Object.keys(pages))for(const lang of languageCodes){
  const dom=new JSDOM(fs.readFileSync(new URL('.'+route+'index.html',root),'utf8'),{url:'https://qidolab.test'+route+'?campaign=sample#coins'}),d=dom.window.document;
  syncLanguageURL(d,lang);const url=new URL(dom.window.location.href);
  assert.equal(url.hash,'#coins');assert.equal(url.searchParams.get('campaign'),'sample');assert.equal(url.searchParams.get('lang'),lang);
  assert.equal(d.querySelector('link[rel=canonical]').href,'https://qidolab.com'+route+'?lang='+lang);
  assert.equal(d.querySelectorAll('link[hreflang]').length,5);assert.ok(d.querySelector('meta[name=description]').content.length>20);dom.window.close();
 }
});

test('a slow Traditional selection cannot overwrite a newer language or game progress',async()=>{
 const dom=new JSDOM('<select id="language-select"><option value="en">English</option><option value="zh-TW">繁體中文</option><option value="es-MX">Español</option></select>',{url:'https://qidolab.test/?lang=en#water'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,location:dom.window.location,localStorage:dom.window.localStorage,CustomEvent:dom.window.CustomEvent});
 localStorage.setItem('quidence-water-v1','saved-moves');
 const api=await import('../i18n.mjs?race-test');const pending=api.setLocale('zh-TW');await api.setLocale('es-MX');await pending;
 assert.equal(api.locale,'es-MX');assert.equal(document.documentElement.lang,'es-MX');assert.equal(localStorage.getItem('quidence-water-v1'),'saved-moves');dom.window.close();
});

test('unavailable Traditional copy leaves English controls, progress and a retry message intact',async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qidolab-locale-'));
 try{
  for(const name of ['i18n.mjs','translations.mjs','branch-content.mjs','language-url.mjs'])fs.copyFileSync(new URL(name,root),path.join(tmp,name));
  const dom=new JSDOM('<select id="language-select"><option value="en">English</option><option value="zh-TW">繁體中文</option></select>',{url:'https://qidolab.test/?lang=en'});
  Object.assign(globalThis,{window:dom.window,document:dom.window.document,location:dom.window.location,localStorage:dom.window.localStorage,CustomEvent:dom.window.CustomEvent});localStorage.setItem('quidence-water-v1','saved-moves');
  const api=await import(pathToFileURL(path.join(tmp,'i18n.mjs')));await api.setLocale('zh-TW');
  assert.equal(api.locale,'en');assert.equal(document.getElementById('language-select').value,'en');assert.ok(document.getElementById('language-load-error'));assert.equal(localStorage.getItem('quidence-water-v1'),'saved-moves');await api.setLocale('en');assert.equal(document.getElementById('language-load-error'),null);dom.window.close();
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
