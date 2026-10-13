import {createTutorial} from '../tutorial.mjs?v=1';
import {ROUNDS24,CODES,OPS,SYMBOL,initialCards,replay24,combine,won24,solve24,valueText,calculate,scoreCode,validGuess,candidateCodes,filterCandidates,fresh24,freshCode,restoreProgress,generate24,generateCode} from './engine.mjs';
import {LANGUAGES,translate} from './copy.mjs';

export function createApp(doc=document) {
  const tutorial=createTutorial(doc);
 const win=doc.defaultView, $=s=>doc.querySelector(s), all=s=>[...doc.querySelectorAll(s)];
  const storageKey='qidolab-v2-progress-v1';
  let language='en',raw=null,storageFailed=false;
  try{language=win.localStorage.getItem('quidence-locale-v1')||'en';raw=win.localStorage.getItem(storageKey);}catch{storageFailed=true;}
  if(!LANGUAGES.includes(language))language='en';
  const progress=restoreProgress(raw),previous={};
  let game='twentyfour',mode='free',round=0,length=4,selected=[],hint=false,answer=false,notice=null;
  const t=(k,p)=>translate(k,language,p), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const freeKey=()=>game==='twentyfour'?'twentyfour':`code${length}`;
  function ensureFree(){const key=freeKey();if(!progress.free[key])progress.free[key]={puzzle:game==='twentyfour'?generate24():generateCode(length),round:game==='twentyfour'?fresh24():freshCode()};}
  function current(){if(mode==='free'){ensureFree();return progress.free[freeKey()];}return {puzzle:game==='twentyfour'?ROUNDS24[round]:CODES[round],round:progress[game][round]};}
  function save(){try{win.localStorage.setItem(storageKey,JSON.stringify(progress));storageFailed=false;}catch{storageFailed=true;}showStorage();}
  function showStorage(){const el=$('#save-error');el.textContent=t('storageError');el.hidden=!storageFailed;}
  function clearTransient(){selected=[];hint=false;answer=false;notice=null;}
  function parseRoute(){const parts=win.location.hash.slice(1).split('/');game=parts[0]==='code'?'code':'twentyfour';mode=/^(10|[1-9])$/.test(parts[1])?'starter':'free';round=mode==='starter'?Number(parts[1])-1:0;length=parts[2]==='5'?5:4;clearTransient();render();}
  function navigate(){const hash=`#${game==='code'?'code':'24'}/${mode==='free'?`free${game==='code'?`/${length}`:''}`:round+1}`;win.history.pushState(null,'',hash);clearTransient();render();save();}
  const stateLabel=r=>r.solved?t(r.usedHint||r.revealed?'helped':'solved'):t((r.moves?.length||r.guesses?.length)?'inProgress':'ready');
  function render(){
    const focus=doc.activeElement?.id;
    tutorial.sync(game,language);
    doc.documentElement.lang=language;doc.title=t('title');
    all('[data-text]').forEach(el=>el.textContent=t(el.dataset.text));$('#language').value=language;
    $('.game-tabs').setAttribute('aria-label',t('games'));$('#modes').setAttribute('aria-label',t('mode'));$('#modes').setAttribute('role','group');
    all('[data-game]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.game===game)));
    all('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===mode)));
    all('[data-length]').forEach(el=>{el.textContent=t('digits',{n:el.dataset.length});el.setAttribute('aria-pressed',String(Number(el.dataset.length)===length));});
    $('#code-length').hidden=game!=='code'||mode!=='free';$('#free-note').hidden=mode!=='free';$('#free-note').textContent=t(game==='code'?'freeNoteCode':'freeNote');$('.collection-panel').hidden=mode!=='starter';
    $('#collection-title').textContent=t('rounds');$('#progress').textContent=t('progress',{n:progress[game].filter(r=>r.solved).length});
    $('#rounds').setAttribute('aria-label',t('rounds'));
    $('#rounds').innerHTML=progress[game].map((r,i)=>`<button type="button" data-round="${i}" ${i===round?'aria-current="step"':''} class="${r.solved?'done':''} ${r.solved&&(r.usedHint||r.revealed)?'helped':''}" aria-label="${esc(t('roundLabel',{n:i+1,state:stateLabel(r)}))}">${String(i+1).padStart(2,'0')}</button>`).join('');
    const {puzzle,round:r}=current();
    $('#play').innerHTML=game==='twentyfour'?render24(puzzle,r):renderCode(puzzle,r);
    all('[data-game],[data-mode],#language').forEach(el=>el.disabled=false);
    showStorage();
    if(focus)doc.getElementById(focus)?.focus({preventScroll:true});
  }
  function meta(puzzle){return `<div class="board-meta"><span>${t(mode==='free'?'freeRound':'round',{n:round+1})}</span><span class="difficulty">${game==='code'?t('digits',{n:puzzle.length}):mode==='free'?'24':t(round<3?'easy':round<7?'medium':'hard')}</span></div>`;}
  function controls(){return `<div class="next-wrap">${mode==='free'?`${previous[freeKey()]?`<button class="previous" type="button" data-action="previous">${t('previousPuzzle')}</button>`:''}<button class="next" type="button" data-action="new">${t(game==='code'?'newCode':'newPuzzle')}</button>`:round<9?`<button class="next" type="button" data-action="next">${t('next')}</button>`:`<p class="last-note">${t('allDone')}</p>`}</div>`;}
  function help(r,output){return `<section class="side-card"><div class="hint-actions"><button id="hint" class="hint-button" type="button" data-action="hint">${t('smallHint')}</button><button id="answer" class="hint-button secondary" type="button" data-action="answer" aria-expanded="${answer}" aria-controls="help-answer">${t(game==='code'?(answer?'hideCode':'revealCode'):(answer?'hideSolution':'solution'))}</button></div><p class="help-note">${t('helpNote')}</p>${r.usedHint||r.revealed?`<p class="help-flag">${t('hintUsed')}</p>`:''}<div class="help-output" role="status">${output}</div><div id="help-answer" class="help-output" ${answer?'':'hidden'}>${answer?answerText():''}</div></section>`;}
  function answerText(){const {puzzle}=current();if(game==='code')return esc(t('answerCode',{code:puzzle}));const path=solve24(initialCards(puzzle)),cards=replay24(puzzle,path);return `${esc(cards[0].expression)} = 24`;}
  function render24(numbers,r){
    const cards=replay24(numbers,r.moves),won=won24(cards);
    const pick=selected.length===2?t('chooseOp',{a:valueText(cards[selected[0]].value),b:valueText(cards[selected[1]].value)}):selected.length===1?t('chooseSecond',{a:valueText(cards[selected[0]].value)}):t('chooseTwo');
    let helpText='';if(hint&&!won){const path=solve24(cards);if(!path)helpText=t('deadEnd');else {const m=path[0],a=cards[m.left].value,b=cards[m.right].value;helpText=t('hint24',{a:valueText(a),b:valueText(b),op:SYMBOL[m.op],value:valueText(calculate(a,b,m.op))});}}
    let before=initialCards(numbers);const trail=r.moves.map(m=>{const a=before[m.left].value,b=before[m.right].value;before=combine(before,m);return `<li>${valueText(a)} ${SYMBOL[m.op]} ${valueText(b)} = ${valueText(before.at(-1).value)}</li>`;}).join('');
    return `<div class="play-grid"><div><div class="game-board">${meta(numbers)}<h2 id="round-title">${t('objective24')}</h2><p class="rules">${t('rules24')}</p><div class="start-line">${t('starting')} ${numbers.map(n=>`<span class="mini-card">${n}</span>`).join('')}</div><div class="cards">${cards.map((c,i)=>`<button type="button" id="card-${i}" data-card="${i}" aria-pressed="${selected.includes(i)}" aria-label="${esc(t('card',{n:i+1,value:valueText(c.value),expression:c.expression}))}" ${cards.length===1?'disabled':''}>${selected.includes(i)?`<span class="selection-order" aria-hidden="true">${selected.indexOf(i)+1}</span>`:''}${valueText(c.value)}${c.expression.length>2?`<span class="card-expression">${esc(c.expression)}</span>`:''}</button>`).join('')}</div><p class="pick-status" role="status">${cards.length>1?pick:''}</p><div class="operations">${OPS.map((op,i)=>`<button id="op-${i}" type="button" data-op="${op}" aria-label="${t(['add','subtract','multiply','divide'][i])}" ${selected.length===2?'':'disabled'}>${SYMBOL[op]}</button>`).join('')}</div><button id="swap" class="swap" type="button" data-action="swap" ${selected.length===2?'':'disabled'}>${t('reverse')}</button>${won?`<p class="win" role="status">${t('win24')}</p>`:cards.length===1?`<p class="notice" role="status">${t('not24',{value:valueText(cards[0].value)})}</p>`:''}${notice?`<p class="notice" role="status">${t(notice)}</p>`:''}<div class="board-bottom"><button id="undo" class="plain-action" type="button" data-action="undo" ${r.moves.length?'':'disabled'}>${t('undo')}</button><button class="plain-action" type="button" data-action="restart">${t('restart')}</button></div></div>${controls()}</div><aside class="sidebar"><section class="side-card"><h3>${t('trail')}</h3>${trail?`<ol class="trail">${trail}</ol>`:`<p class="empty">${t('emptyTrail')}</p>`}</section>${help(r,esc(helpText))}</aside></div>`;
  }
  const candidatesCache=new Map();
  function countCandidates(secret,guesses){const key=secret+':'+guesses.join(',');if(candidatesCache.has(key))return candidatesCache.get(key);let candidates=candidateCodes(secret.length);for(const guess of guesses)candidates=filterCandidates(candidates,guess,scoreCode(secret,guess));if(candidatesCache.size>10)candidatesCache.clear();candidatesCache.set(key,candidates.length);return candidates.length;}
  function renderCode(secret,r){
    const won=r.guesses.includes(secret),last=r.guesses.at(-1);let helpText='';
    if(hint){if(!last)helpText=t('codeHint');else {const n=countCandidates(secret,r.guesses);helpText=t(n===1?'oneCandidate':'candidates',{n});}}
    return `<div class="play-grid"><div><div class="game-board">${meta(secret)}<h2 id="round-title">${t('codeTitle',{n:secret.length})}</h2><p class="rules">${t('rulesCode')}</p><form id="code-form" novalidate><div class="code-inputs" style="--digits:${secret.length}">${Array.from({length:secret.length},(_,i)=>`<input type="text" id="digit-${i}" data-digit="${i}" inputmode="numeric" pattern="[0-9]" maxlength="1" autocomplete="off" spellcheck="false" aria-label="${t('digit',{n:i+1,total:secret.length})}" aria-describedby="input-caption" value="${r.draft[i]?.trim()||''}" ${won?'disabled':''}>`).join('')}</div><button class="submit-guess" type="submit" ${won?'disabled':''}>${t('guess')}</button><p id="input-caption" class="form-caption">${t('enterCode',{n:secret.length})}</p></form><div id="code-message" role="status">${notice?`<p class="notice">${t(notice,{n:secret.length})}</p>`:won?`<p class="win">${t('codeWin',{code:secret})}</p>`:last?`<p class="notice">${t('result',scoreCode(secret,last))}</p>`:''}</div><div class="board-bottom"><button class="plain-action" type="button" data-action="restart">${t('restart')}</button></div></div>${controls()}<section class="ledger-wrap"><h3>${t('ledger')}</h3>${r.guesses.length?`<div class="ledger-scroll"><table class="ledger"><thead><tr><th scope="col">${t('attempt')}</th><th scope="col">${t('present')}</th><th scope="col">${t('placed')}</th></tr></thead><tbody>${[...r.guesses].reverse().map(g=>{const s=scoreCode(secret,g);return `<tr><td>${g}</td><td><span class="count-pill">${s.present}</span></td><td><span class="count-pill placed">${s.placed}</span></td></tr>`;}).join('')}</tbody></table></div>`:`<p class="empty">${t('noGuesses')}</p>`}</section></div><aside class="sidebar"><section class="side-card"><h3>${t('ledger')}</h3><p class="clue-note">${t('legend')}</p><p class="clue-note">${t('example')}</p></section>${help(r,esc(helpText))}</aside></div>`;
  }
  function click(event){
    const el=event.target.closest('button');if(!el||el.disabled||el.dataset.tour)return;
    if(el.dataset.game){game=el.dataset.game;navigate();return;}
    if(el.dataset.mode){mode=el.dataset.mode;navigate();return;}
    if(el.dataset.length){length=Number(el.dataset.length);navigate();return;}
    if(el.dataset.round!==undefined){round=Number(el.dataset.round);navigate();return;}
    const {puzzle,round:r}=current();notice=null;
    if(el.dataset.card!==undefined){const i=Number(el.dataset.card);selected=selected.includes(i)?selected.filter(n=>n!==i):selected.length<2?[...selected,i]:[i];}
    else if(el.dataset.op&&selected.length===2){try{const move={left:selected[0],right:selected[1],op:el.dataset.op};const cards=combine(replay24(puzzle,r.moves),move);r.moves.push(move);if(won24(cards))r.solved=true;selected=[];hint=false;}catch{notice='zero';}}
    else switch(el.dataset.action){
      case 'swap':selected.reverse();break;
      case 'undo':r.moves.pop();selected=[];hint=false;break;
      case 'restart':if(game==='twentyfour')r.moves=[];else {r.guesses=[];r.draft='';}clearTransient();notice='resetNotice';break;
      case 'hint':r.usedHint=true;hint=true;break;
      case 'answer':answer=!answer;if(answer){r.revealed=true;r.usedHint=true;}break;
      case 'next':round++;navigate();return;
      case 'new':{const key=freeKey();previous[key]=structuredClone(progress.free[key]);progress.free[key]={puzzle:game==='twentyfour'?generate24(puzzle):generateCode(length,puzzle),round:game==='twentyfour'?fresh24():freshCode()};clearTransient();break;}
      case 'previous':{const key=freeKey(),p=progress.free[key];progress.free[key]=previous[key];previous[key]=p;clearTransient();break;}
      default:return;
    }
    save();render();
  }
  function captureDraft(){current().round.draft=all('[data-digit]').map(el=>el.value||' ').join('');save();}
  function fillDigits(value,start){const digits=value.normalize('NFKC').replace(/[^0-9]/g,''),inputs=all('[data-digit]');if(!digits)return;const offset=digits.length>=inputs.length?0:start;[...digits].slice(0,inputs.length-offset).forEach((d,i)=>inputs[offset+i].value=d);captureDraft();inputs[Math.min(offset+digits.length,inputs.length-1)].focus();}
  function input(event){const el=event.target;if(!el.matches('[data-digit]'))return;const cleaned=el.value.normalize('NFKC').replace(/[^0-9]/g,'');if(cleaned.length>1){fillDigits(cleaned,Number(el.dataset.digit));return;}el.value=cleaned;captureDraft();if(cleaned)doc.getElementById(`digit-${Number(el.dataset.digit)+1}`)?.focus();}
  function paste(event){if(!event.target.matches('[data-digit]'))return;event.preventDefault();fillDigits(event.clipboardData?.getData('text')||'',Number(event.target.dataset.digit));}
  function keydown(event){const el=event.target;if(!el.matches('[data-digit]'))return;const index=Number(el.dataset.digit);if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();doc.getElementById(`digit-${index+(event.key==='ArrowLeft'?-1:1)}`)?.focus();}else if(event.key==='Backspace'&&!el.value&&index>0){event.preventDefault();const before=doc.getElementById(`digit-${index-1}`);before.value='';before.focus();captureDraft();}}
  function submit(event){if(event.target.id!=='code-form')return;event.preventDefault();const {puzzle,round:r}=current();if(r.guesses.includes(puzzle))return;captureDraft();const guess=r.draft;notice=guess.length!==puzzle.length||!/^[0-9]+$/.test(guess)?'incomplete':!validGuess(guess,puzzle.length)?'repeated':r.guesses.includes(guess)?'duplicate':r.guesses.length>=1000?'limit':null;if(!notice){r.guesses.push(guess);if(guess===puzzle)r.solved=true;else r.draft='';hint=false;}save();render();if(!r.guesses.includes(puzzle))$('#digit-0')?.focus({preventScroll:true});}
  function change(event){if(event.target.id!=='language')return;language=LANGUAGES.includes(event.target.value)?event.target.value:'en';try{win.localStorage.setItem('quidence-locale-v1',language);}catch{}render();}
  doc.addEventListener('click',click);doc.addEventListener('input',input);doc.addEventListener('paste',paste);doc.addEventListener('keydown',keydown);doc.addEventListener('submit',submit);doc.addEventListener('change',change);win.addEventListener('popstate',parseRoute);win.addEventListener('hashchange',parseRoute);
  parseRoute();save();
  return {destroy(){tutorial.destroy();doc.removeEventListener('click',click);doc.removeEventListener('input',input);doc.removeEventListener('paste',paste);doc.removeEventListener('keydown',keydown);doc.removeEventListener('submit',submit);doc.removeEventListener('change',change);win.removeEventListener('popstate',parseRoute);win.removeEventListener('hashchange',parseRoute);}};
}
if(typeof document!=='undefined'&&document.getElementById('play'))createApp();
