import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {createApp} from '../2/app.mjs';
import {COPY,LANGUAGES} from '../2/copy.mjs';
import {ROUNDS24,CODES,initialCards,solve24} from '../2/engine.mjs';
const html=readFileSync(new URL('../2/index.html',import.meta.url),'utf8');
function setup(hash='#24/1',saved=null){const dom=new JSDOM(html,{url:'https://qidolab.test/2/'+hash});const w=dom.window,d=w.document;if(saved)w.localStorage.setItem('qidolab-v2-progress-v1',saved);let app=createApp(d);return {w,d,q:s=>d.querySelector(s),click:s=>{const el=d.querySelector(s);assert.ok(el,s);el.click();},change:(s,v)=>{const el=d.querySelector(s);el.value=v;el.dispatchEvent(new w.Event('change',{bubbles:true}));},input:(i,v)=>{const el=d.querySelector(`#digit-${i}`);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}));},submit:()=>d.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})),reload(){app.destroy();app=createApp(d);},close(){app.destroy();w.close();}};}
function guess(ui,s){[...s].forEach((v,i)=>ui.input(i,v));ui.submit();}
function solve(ui,numbers){for(const m of solve24(initialCards(numbers))){ui.click(`[data-card="${m.left}"]`);ui.click(`[data-card="${m.right}"]`);ui.click(`[data-op="${m.op}"]`);}}
function saved(ui){return JSON.parse(ui.w.localStorage.getItem('qidolab-v2-progress-v1'));}
test('before scripts load, static labels remain visible and controls wait for a ready puzzle',()=>{
  const dom=new JSDOM(html,{url:'https://qidolab.test/2/'}),d=dom.window.document;
  for(const el of d.querySelectorAll('[data-text]'))assert.equal(el.textContent,COPY[el.dataset.text][0]);
  assert.equal(d.querySelector('#game-24 .tab-icon img').getAttribute('src'),'/assets/games/twentyfour.svg?v=1');
  assert.ok(d.querySelector('#play [role="status"]').textContent.includes('Loading'));
  assert.ok(d.getElementById(d.querySelector('#play').getAttribute('aria-labelledby')));
  for(const el of d.querySelectorAll('[data-game],[data-mode],#language'))assert.equal(el.disabled,true);
  const app=createApp(d);
  for(const el of d.querySelectorAll('[data-game],[data-mode],#language'))assert.equal(el.disabled,false);
  assert.ok(d.querySelector('[data-card]'));
  assert.doesNotMatch(d.querySelector('#play').textContent,/Loading your puzzle/);
  app.destroy();dom.window.close();
});
test('every string and parameter exists in all four languages',()=>{
  for(const [key,variants] of Object.entries(COPY)){assert.equal(variants.length,4,key);for(const text of variants)assert.ok(text.trim(),key);const tokens=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();for(const text of variants)assert.deepEqual(tokens(text),tokens(variants[0]),key);}
});
for(const language of LANGUAGES)test(`all 20 starter rounds can be completed through the ${language} interface`,()=>{
  const ui=setup();ui.change('#language',language);assert.equal(ui.d.documentElement.lang,language);
  for(let i=0;i<10;i++){ui.click(`[data-round="${i}"]`);solve(ui,ROUNDS24[i]);assert.ok(ui.q('.win'));assert.equal(ui.q('#progress').textContent,COPY.progress[LANGUAGES.indexOf(language)].replace('{n}',i+1));}
  ui.click('[data-game="code"]');
  for(let i=0;i<10;i++){ui.click(`[data-round="${i}"]`);guess(ui,CODES[i]);assert.ok(ui.q('.win'));assert.equal(ui.d.querySelectorAll('.ledger tbody tr').length,1);assert.equal(ui.q('.placed').textContent,String(CODES[i].length));}
  assert.equal(saved(ui).twentyfour.filter(r=>r.solved).length,10);assert.equal(saved(ui).code.filter(r=>r.solved).length,10);
  ui.reload();assert.equal(ui.d.documentElement.lang,language);assert.ok(ui.q('.win'));assert.equal(ui.q('#language').value,language);ui.close();
});
test('undo, zero division, hints and answer exposure do not falsely complete a round',()=>{
  const ui=setup('#24/6');ui.click('[data-card="0"]');ui.click('[data-card="1"]');ui.click('[data-op="-"]');ui.click('[data-card="0"]');ui.click('[data-card="2"]');ui.click('[data-op="/"]');assert.equal(saved(ui).twentyfour[5].moves.length,1);assert.ok(ui.q('.notice').textContent.includes('zero'));ui.click('[data-action="undo"]');assert.equal(saved(ui).twentyfour[5].moves.length,0);
  ui.click('[data-action="hint"]');ui.click('[data-action="answer"]');assert.equal(saved(ui).twentyfour[5].solved,false);assert.ok(ui.q('#help-answer').textContent.includes('24'));solve(ui,ROUNDS24[5]);assert.ok(ui.q('[data-round="5"]').classList.contains('helped'));ui.click('[data-action="restart"]');assert.equal(saved(ui).twentyfour[5].solved,true);ui.close();
});
test('code entry validates incomplete/repeated/duplicate guesses, pastes, saves holes and switches languages',()=>{
  const ui=setup('#code/3');ui.input(1,'4');ui.input(3,'7');ui.change('#language','zh-TW');ui.reload();assert.equal(ui.q('#digit-0').value,'');assert.equal(ui.q('#digit-1').value,'4');assert.equal(ui.q('#digit-2').value,'');assert.equal(ui.q('#digit-3').value,'7');ui.submit();assert.equal(saved(ui).code[2].guesses.length,0);
  guess(ui,'1111');assert.equal(saved(ui).code[2].guesses.length,0);guess(ui,'1234');guess(ui,'1234');assert.equal(saved(ui).code[2].guesses.length,1);ui.click('[data-action="hint"]');assert.ok(ui.q('.help-output').textContent.includes('密碼'));
  const paste=new ui.w.Event('paste',{bubbles:true,cancelable:true});Object.defineProperty(paste,'clipboardData',{value:{getData:()=> '０４９７'}});ui.q('#digit-2').dispatchEvent(paste);ui.submit();assert.ok(ui.q('.win'));assert.equal(saved(ui).code[2].guesses.at(-1),'0497');ui.close();
});
test('free puzzles change, undo a new puzzle, preserve both code lengths and reload safely',()=>{
  const ui=setup('#24/free');const first=saved(ui).free.twentyfour.puzzle;ui.click('[data-card="0"]');ui.click('[data-card="1"]');ui.click('[data-op="+"]');ui.click('[data-action="new"]');assert.notDeepEqual(saved(ui).free.twentyfour.puzzle,first);ui.click('[data-action="previous"]');assert.deepEqual(saved(ui).free.twentyfour.puzzle,first);assert.equal(saved(ui).free.twentyfour.round.moves.length,1);ui.reload();assert.equal(ui.d.querySelectorAll('[data-card]').length,3);
  ui.click('[data-game="code"]');const four=saved(ui).free.code4.puzzle;ui.input(0,'0');ui.click('[data-length="5"]');assert.equal(ui.d.querySelectorAll('[data-digit]').length,5);const five=saved(ui).free.code5.puzzle;guess(ui,five);assert.ok(ui.q('.win'));ui.click('[data-length="4"]');assert.equal(saved(ui).free.code4.puzzle,four);assert.equal(ui.q('#digit-0').value,'0');ui.click('[data-action="new"]');assert.notEqual(saved(ui).free.code4.puzzle,four);ui.reload();assert.equal(ui.d.querySelectorAll('[data-digit]').length,4);ui.close();
});
test('storage failure leaves games playable and shows an explicit warning',()=>{
  const ui=setup();Object.defineProperty(ui.w,'localStorage',{get(){throw new Error('blocked');}});ui.reload();assert.equal(ui.q('#save-error').hidden,false);solve(ui,ROUNDS24[0]);assert.ok(ui.q('.win'));ui.close();
});

test('language changes keep button labels, icons, selected cards and expanded help intact',()=>{
  const ui=setup('#24/1');
  ui.click('[data-card="0"]');ui.click('[data-card="1"]');
  ui.click('[data-action="hint"]');ui.click('[data-action="answer"]');
  const before=saved(ui);
  for(const [i,language] of LANGUAGES.entries()){
    ui.change('#language',language);
    assert.equal(ui.d.title,COPY.title[i]);
    assert.equal(ui.q('h1').textContent,COPY.heading[i]);
    assert.equal(ui.q('#game-24 [data-text]').textContent,COPY.game24[i]);
    assert.equal(ui.q('#game-code [data-text]').textContent,COPY.gameCode[i]);
    assert.equal(ui.q('#game-24 .tab-icon img').getAttribute('src'),'/assets/games/twentyfour.svg?v=1');
    assert.equal(ui.q('#game-code .tab-icon img').getAttribute('src'),'/assets/games/code.svg?v=1');
    assert.equal(ui.d.querySelectorAll('[data-card][aria-pressed="true"]').length,2);
    assert.equal(ui.q('#answer').getAttribute('aria-expanded'),'true');
    assert.equal(ui.q('#answer').textContent,COPY.hideSolution[i]);
    assert.equal(ui.q('#help-answer').hidden,false);
    assert.ok(ui.q('#help-answer').textContent.includes('24'));
    assert.ok(ui.q('.help-output').textContent.trim());
    for(const el of ui.d.querySelectorAll('button,input,select')){
      const name=el.getAttribute('aria-label')||el.textContent||el.closest('label')?.textContent;
      assert.ok(name?.trim(),`${language}: unnamed ${el.outerHTML}`);
      assert.doesNotMatch(name,/\{\w+\}|undefined|Missing copy:/);
    }
    assert.deepEqual(saved(ui),before,'changing language keeps puzzle progress');
  }
  ui.close();
});

test('code errors, clues and revealed answers stay translated across all four languages',()=>{
  const ui=setup('#code/3');
  ui.submit();
  for(const [i,language] of LANGUAGES.entries()){
    ui.change('#language',language);
    assert.equal(ui.q('#code-message').textContent,COPY.incomplete[i].replace('{n}','4'));
  }
  guess(ui,'0123'); // Secret 0497: one correct digit, also in the correct place.
  ui.click('[data-action="hint"]');ui.click('[data-action="answer"]');
  const before=saved(ui);
  for(const [i,language] of LANGUAGES.entries()){
    ui.change('#language',language);
    assert.equal(ui.q('#code-message').textContent,COPY.result[i].replace('{present}','1').replace('{placed}','1'));
    assert.equal(ui.q('.ledger tbody td').textContent,'0123');
    assert.equal(ui.q('#answer').textContent,COPY.hideCode[i]);
    assert.equal(ui.q('#help-answer').textContent,COPY.answerCode[i].replace('{code}','0497'));
    assert.equal(ui.q('#help-answer').hidden,false);
    assert.deepEqual(saved(ui),before);
  }
  ui.close();
});
