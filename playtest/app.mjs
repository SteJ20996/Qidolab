import {createTutorial} from '../tutorial.mjs?v=2';
import {PATCH,BORROW} from './puzzles.mjs';
import {patchState,solvePatch,opText,initialBorrow,borrowStep,replayBorrow,borrowWon,solveBorrow} from './engine.mjs';
import {LANGUAGES,t as translate} from './copy.mjs';
const KEY='qidolab-two-experiments-v1';
export function createApp(doc=document){
 const tutorial=createTutorial(doc);
 const win=doc.defaultView,$=s=>doc.querySelector(s),all=s=>[...doc.querySelectorAll(s)];
 let language='en',game='patch',index=0,notice='',hint=false,answer=false,storageFailed=false,raw={};
 const blank=()=>({moves:[],repair:null,selected:null,attempts:[],assisted:false,solved:false,helped:false});
 const validRepair=(p,r)=>r && Number.isInteger(r.slot)&&r.slot>=0&&r.slot<p.ops.length&&Number.isInteger(r.choice)&&r.choice>=0&&r.choice<p.choices.length;
 try{language=win.localStorage.getItem('quidence-locale-v1')||'en';raw=JSON.parse(win.localStorage.getItem(KEY)||'{}');}catch{storageFailed=true;}
 const requested=new URL(win.location.href).searchParams.get('lang');if(LANGUAGES.includes(requested))language=requested;
 if(!LANGUAGES.includes(language))language='en';
 const progress={patch:PATCH.map((p,i)=>restore(p,raw?.patch?.[i],'patch')),borrow:BORROW.map((p,i)=>restore(p,raw?.borrow?.[i],'borrow'))};
 function restore(p,data,kind){const r=blank();if(!data||typeof data!=='object')return r;
  r.assisted=data.assisted===true;r.solved=data.solved===true;r.helped=data.helped===true;
  if(kind==='borrow')r.moves=replayBorrow(p,Array.isArray(data.moves)?data.moves.slice(0,p.cards.length+2):[]).moves;
  else{r.repair=validRepair(p,data.repair)?{slot:data.repair.slot,choice:data.repair.choice}:null;r.selected=Number.isInteger(data.selected)&&data.selected>=0&&data.selected<p.ops.length?data.selected:null;r.attempts=(Array.isArray(data.attempts)?data.attempts:[]).slice(-50).filter(a=>a===null||validRepair(p,a)).map(a=>a?{slot:a.slot,choice:a.choice}:null);}
  return r;
 }
 const t=(key,params)=>translate(key,language,params);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const puzzle=()=>game==='patch'?PATCH[index]:BORROW[index],record=()=>progress[game][index];
 const actionLabel=(p,a)=>a.type==='card'?opText(p.cards[a.index]):t(a.type==='borrow'?'borrowAction':'returnAction',{n:p.loan});
 function save(){try{win.localStorage.setItem(KEY,JSON.stringify(progress));win.localStorage.setItem('quidence-locale-v1',language);storageFailed=false;}catch{storageFailed=true;}}
 function markSolved(won){const r=record();if(won&&!r.solved){r.solved=true;r.helped=r.assisted;}}
 function route(){const parts=win.location.hash.slice(1).split('/');game=parts[0]==='borrow'?'borrow':'patch';index=/^[1-6]$/.test(parts[1])?Number(parts[1])-1:0;notice='';hint=false;answer=false;render();}
 function navigate(){win.history.pushState(null,'',`#${game}/${index+1}`);notice='';hint=false;answer=false;render();save();}
 function header(){return `<div class="puzzle-head"><div><p>${t('round',{n:index+1})}</p><h2>${t(game)}</h2></div><span>${t(index<2?'easy':'deeper')}</span></div><p class="instructions">${t(game+'Rules')}</p><p class="bounds">${t('bounds')}</p>`;}
 function bottom(){const r=record(),canUndo=game==='patch'?r.attempts.length:r.moves.length;return `<div class="bottom-actions"><button type="button" data-action="undo" ${canUndo?'':'disabled'}>${t('undo')}</button><button type="button" data-action="reset">${t('reset')}</button>${index<5?`<button type="button" class="next" data-action="next">${t('next')}</button>`:''}</div>`;}
 function help(p){const r=record();let tip='',solution='';
  if(game==='patch'){const sol=solvePatch(p)[0];if(hint)tip=t('hintPatch',{n:sol.slot+1});if(answer)solution=t('solutionPatch',{n:sol.slot+1,op:opText(p.choices[sol.choice])});}
  else{const s=replayBorrow(p,r.moves);if(hint){const path=solveBorrow(p,s)[0];tip=borrowWon(p,s)?t('borrowWon'):path?.length?t('hintBorrow',{action:actionLabel(p,path[0])}):t('noPath');}if(answer)solution=t('solutionFromStart')+' '+solveBorrow(p)[0].map(a=>actionLabel(p,a)).join(' → ');}
  return `<aside class="help"><div class="help-buttons"><button type="button" data-action="hint">${t('hint')}</button><button type="button" class="secondary" data-action="solution" aria-expanded="${answer}" aria-controls="solution-output">${t(answer?'hideSolution':'solution')}</button></div><p class="help-note">${t('helpNote')}</p>${r.assisted?`<p class="assisted">${t('assisted')}</p>`:''}<div class="help-output" role="status">${esc(tip)}</div><div id="solution-output" class="help-output" ${answer?'':'hidden'}>${esc(solution)}</div></aside>`;
 }
 function renderPatch(p,r){const s=patchState(p,r.repair),before=patchState(p);let status=t('patchWaiting');
  if(s.changed)status=s.won?t('patchWon'):!s.legal?t('illegal'):s.endpoints?t('checkMiss'):t('patchAttempt',{n:r.repair.slot+1,op:opText(s.ops[r.repair.slot])})+' '+t('endMiss');
  const timelines=s.paths.map((path,lane)=>`<section class="timeline"><h3>${'AB'[lane]} <span class="goal ${path.at(-1)===p.goals[lane]?'good':''}">${t('target',{n:p.goals[lane]})}</span></h3><table aria-label="${'AB'[lane]}"><thead><tr><th scope="col">${t('stepTitle')}</th><th scope="col">${t('operation')}</th><th scope="col">${t('original')}</th><th scope="col">${t('now')}</th></tr></thead><tbody>${path.map((n,j)=>{const check=p.check.lane===lane&&p.check.step===j;return `<tr class="${before.paths[lane][j]!==n?'diff ':''}${check?'check':''}"><td>${j||t('start')}</td><td>${j?opText(s.ops[j-1]):'—'}</td><td>${before.paths[lane][j]??'—'}</td><td class="${n===null?'bad-number':''}">${n??'—'}${check?`<small>${t('checkpointShort')}</small>`:''}</td></tr>`;}).join('')}</tbody></table></section>`).join('');
  return header()+`<div class="play-panel"><div class="goal-strip">${p.starts.map((n,lane)=>`<div><strong>${"AB"[lane]}</strong> ${t("start")} <b>${n}</b> <span aria-hidden="true">→</span> ${t("target",{n:p.goals[lane]})}</div>`).join("")}</div><p class="checkpoint-rule">${t('checkpoint',{lane:'AB'[p.check.lane],step:p.check.step,value:p.check.value})}</p><h3 class="label">${t('selectStep')}</h3><div class="instruction-strip">${s.ops.map((op,i)=>`<button type="button" data-slot="${i}" aria-pressed="${r.selected===i}" class="${s.changed&&r.repair.slot===i?'changed':''}" aria-label="${t('step',{n:i+1})}: ${opText(op)}"><small>${t('step',{n:i+1})}</small><strong>${opText(op)}</strong></button>`).join('')}</div><h3 class="label">${t('selectCard')}</h3><div class="replacement-cards">${p.choices.map((op,i)=>`<button type="button" data-choice="${i}" ${r.selected===null?'disabled':''} aria-pressed="${s.changed&&r.repair.slot===r.selected&&r.repair.choice===i}"><strong>${opText(op)}</strong></button>`).join('')}</div><p class="attempt-status ${s.won?'won':''}" role="status">${esc(status)}</p><div class="timeline-grid">${timelines}</div>${bottom()}</div>`+help(p);
 }
 function renderBorrow(p,r){const s=replayBorrow(p,r.moves),won=borrowWon(p,s),debt=s.borrowed&&!s.returned?p.loan:0;
  let status=won?t('borrowWon'):s.value===p.goal?(debt?t('debtPending',{n:debt}):t('unfinished')):s.moves.length===p.cards.length+2?t('stuck'):t('borrowWaiting');if(notice)status=t(notice);
  let prior=initialBorrow(p);const rows=s.moves.map(a=>{const next=borrowStep(p,prior,a),entry=`${prior.value} ${a.type==='card'?opText(p.cards[a.index]):(a.type==='borrow'?'+':'−')+p.loan} = ${next.value}`;prior=next;return `<li><span>${esc(actionLabel(p,a))}</span><br><strong>${entry}</strong></li>`;}).join('');
  return header()+`<div class="play-panel"><div class="borrow-layout"><div><div class="borrow-top"><div class="value-card"><p>${t('value')}</p><strong class="big-value">${s.value}</strong><span class="goal ${s.value===p.goal?'good':''}">${t('target',{n:p.goal})}</span></div><div class="debt-card"><p>${t('debt')}</p><strong class="big-value">${debt}</strong><p class="debt-caption">${t(s.returned?'returned':s.borrowed?'returnAction':'notBorrowed',{n:p.loan})}</p></div></div><div class="number-actions"><button type="button" data-action="borrow" ${s.borrowed||won?'disabled':''}>+ ${t('borrowAction',{n:p.loan})}</button><button type="button" data-action="return" ${!s.borrowed||s.returned||won?'disabled':''}>− ${t('returnAction',{n:p.loan})}</button></div><h3 class="label">${t('cards')}</h3><div class="operation-cards">${p.cards.map((op,i)=>`<button type="button" data-card="${i}" ${s.used.includes(i)||won?'disabled':''}><strong>${opText(op)}</strong>${s.used.includes(i)?`<small>✓ ${t('used')}</small>`:''}</button>`).join('')}</div><p class="card-count">${t('cardCount',{n:s.used.length,total:p.cards.length})}</p><p class="attempt-status ${won?'won':''} ${notice?'notice':''}" role="status">${esc(status)}</p></div><aside class="step-history"><h3>${t('history')}</h3>${rows?`<ol>${rows}</ol>`:`<p class="empty-history">${t('emptyHistory')}</p>`}</aside></div>${bottom()}</div>`+help(p);
 }
 function render(){const focus=doc.activeElement?.dataset;const focusKey=focus?['slot','choice','card','action'].find(k=>focus[k]!==undefined):null;const focusValue=focusKey?focus[focusKey]:null;
  tutorial.sync(game,language);
    doc.documentElement.lang=language;doc.title=t('title');all('[data-text]').forEach(e=>e.textContent=t(e.dataset.text));$('#language').value=language;
  $('.game-switch').setAttribute('aria-label',t('games'));all('[data-game]').forEach(e=>{e.disabled=false;e.setAttribute('aria-pressed',String(e.dataset.game===game));});
  $('#rounds').innerHTML=progress[game].map((r,i)=>`<button type="button" data-round="${i}" ${i===index?'aria-current="step"':''} aria-label="${t('roundLabel',{n:i+1})}${r.solved?': '+t(r.helped?'helped':'solved'):''}">${String(i+1).padStart(2,'0')}${r.solved?`<span class="round-mark" aria-hidden="true">${r.helped?'☆':'✓'}</span>`:''}</button>`).join('');
  $('#rounds').setAttribute('aria-label',t('round',{n:index+1}));$('#play').innerHTML=game==='patch'?renderPatch(puzzle(),record()):renderBorrow(puzzle(),record());
  $('#storage-error').hidden=!storageFailed;$('#storage-error').textContent=t('storageError');
  if(focusKey)all(`[data-${focusKey}]`).find(e=>e.dataset[focusKey]===focusValue && !e.disabled)?.focus({preventScroll:true});
 }
 function click(event){const b=event.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;if(d.tour)return;
  if(d.game){game=d.game==='borrow'?'borrow':'patch';index=0;navigate();return;}
  if(d.round!==undefined){index=Math.max(0,Math.min(5,Number(d.round)));navigate();return;}
  const p=puzzle(),r=record();notice='';
  if(d.slot!==undefined && game==='patch'){r.selected=Number(d.slot);}
  else if(d.choice!==undefined && game==='patch' && r.selected!==null){const repair={slot:r.selected,choice:Number(d.choice)};if(!validRepair(p,repair))return;r.attempts.push(r.repair);r.attempts=r.attempts.slice(-50);r.repair=repair;markSolved(patchState(p,repair).won);hint=false;}
  else if((d.card!==undefined||d.action==='borrow'||d.action==='return')&&game==='borrow'){const action=d.card!==undefined?{type:'card',index:Number(d.card)}:{type:d.action};const s=borrowStep(p,replayBorrow(p,r.moves),action);if(s){r.moves=s.moves;markSolved(borrowWon(p,s));hint=false;}else notice='illegal';}
  else if(d.action==='undo'){if(game==='patch'&&r.attempts.length){r.repair=r.attempts.pop();r.selected=r.repair?.slot??r.selected;}if(game==='borrow')r.moves.pop();hint=false;}
  else if(d.action==='reset'){r.moves=[];r.repair=null;r.selected=null;r.attempts=[];hint=false;answer=false;}
  else if(d.action==='next' && index<5){index++;navigate();return;}
  else if(d.action==='hint'){hint=true;r.assisted=true;}
  else if(d.action==='solution'){answer=!answer;if(answer)r.assisted=true;}
  else return;
  save();render();
 }
 function change(event){if(event.target.id!=='language')return;language=LANGUAGES.includes(event.target.value)?event.target.value:'en';const url=new URL(win.location.href);url.searchParams.set('lang',language);win.history.replaceState(null,'',url);save();render();}
 doc.addEventListener('click',click);doc.addEventListener('change',change);win.addEventListener('hashchange',route);route();
 return {destroy(){tutorial.destroy();doc.removeEventListener('click',click);doc.removeEventListener('change',change);win.removeEventListener('hashchange',route);},getState:()=>({game,index,language,progress}),render};
}
if(typeof document!=='undefined'&&document.querySelector('#play'))createApp(document);
