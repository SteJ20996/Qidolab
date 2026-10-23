import {FOX_DAYS,foxEscape,RIVER_ITEMS,initialRiver,riverMove,riverWon,initialHanoi,hanoiMove,hanoiWon,initialQueens,queenConflicts,queensWon} from './engine.mjs';
import {COPY,languages,format} from './copy.mjs?v=2';
import {syncLanguageURL} from '../language-url.mjs';
const $=selector=>document.querySelector(selector);
const games=['fox','river','hanoi','queens'];
const icons={fox:'🦊',river:'⛵',hanoi:'🗼',queens:'♛'};
const itemNames={en:['Wolf','Goat','Cabbage'],'zh-CN':['狼','羊','菜'],'zh-TW':['狼','羊','菜'],'es-MX':['Lobo','Cabra','Col']};
const itemIcons={wolf:'🐺',goat:'🐐',cabbage:'🥬'};
const read=(key,fallback)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
const write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
const readList=key=>{try{const value=JSON.parse(read(key,'[]'));return Array.isArray(value)?value.filter(item=>games.includes(item)):[];}catch{return [];}};
let locale=new URL(location.href).searchParams.get('lang')||read('quidence-locale-v1','en');
if(!languages.includes(locale))locale='en';
let copy=COPY[locale],game=games.includes(location.hash.slice(1))?location.hash.slice(1):'fox';
let seen=new Set(readList('qidolab-classics-guides')),completed=new Set(readList('qidolab-classics-completed'));
let guideStep=0,guideOpen=!seen.has(game),foxHoles=5,foxPlan=[],river=initialRiver(),riverHistory=[],riverPassenger=null,hanoiN=3,pegs=initialHanoi(3),hanoiHistory=[],selectedPeg=null,queensN=4,queens=initialQueens(4),queensHistory=[],feedback=null;
const t=(key,parts)=>format(copy[key],parts),html=(str)=>String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=(key,parts={},route=null)=>{feedback={key,parts,route};};
const feedbackText=()=>feedback?t(feedback.key,feedback.parts)+(feedback.route?' '+feedback.route.map((den,i)=>t('foxRoute',{day:i+1,den})).join(' · '):''):'';
function setLocale(next){if(!languages.includes(next))return;locale=next;copy=COPY[locale];document.documentElement.lang=locale;$('#language').value=locale;syncLanguageURL(document,locale);document.defaultView.dispatchEvent(new document.defaultView.Event('languagechange'));document.querySelectorAll('[data-copy]').forEach(el=>{el.textContent=copy[el.dataset.copy];});document.querySelectorAll('[data-copy-aria]').forEach(el=>{el.setAttribute('aria-label',copy[el.dataset.copyAria]);});render();}
function mark(){completed.add(game);write('qidolab-classics-completed',JSON.stringify([...completed]));document.querySelectorAll('[data-game]').forEach(el=>el.querySelector('.completed').textContent=completed.has(el.dataset.game)?'✓':'');}
function changeGame(next){if(!games.includes(next))return;game=next;feedback=null;guideStep=0;guideOpen=!seen.has(game);if(location.hash!=='#'+game)history.replaceState(null,'','#'+game);render();}
function finishGuide(){guideOpen=false;seen.add(game);write('qidolab-classics-guides',JSON.stringify([...seen]));render();}
function render(){document.querySelectorAll('.game-tabs a').forEach(el=>{el.toggleAttribute('aria-current',el.dataset.game===game);el.querySelector('.completed').textContent=completed.has(el.dataset.game)?'✓':'';});renderGuide();renderPlay();}
function demoArt(){const step=guideStep;return {
 fox:['<div class="demo-den">①　②　🦊　④　⑤</div>','<div class="demo-den">①　🦊 ↔ ③　④　⑤</div>','<div class="demo-den">🔎① → 🔎② → 🔎③</div>'],
 river:['<div class="demo-den">🐺　🐐　🥬　⛵</div>','<div class="demo-den">🐺　🥬　〰️　⛵🐐</div>','<div class="demo-den">🐺　⛵ → 🐐　🥬</div>'],
 hanoi:['<div class="demo-tower"><i></i><i></i><i></i></div>','<div class="demo-den">🟫　⇢　🟨　⇢　🟩</div>','<div class="demo-tower goal"><i></i><i></i><i></i></div>'],
 queens:['<div class="demo-den">♛ ↗　↑　↖</div>','<div class="demo-den">♛　·　·　·<br>·　·　♛　·</div>','<div class="demo-den">♛　·　·　·<br>·　·　♛　·<br>·　·　·　♛</div>']
 }[game][step];}
function renderGuide(){const host=$('#walkthrough');if(!guideOpen){host.innerHTML='<button class="subtle" type="button" data-action="replay">'+html(t('replay'))+' ↻</button>';return;}
 host.innerHTML='<div class="guide-top"><span class="eyebrow">'+html(t('demo'))+'</span><span>'+html(t('step',{n:guideStep+1}))+'</span></div><div class="guide-stage" key="'+game+'-'+guideStep+'"><div class="guide-art" aria-hidden="true">'+demoArt()+'</div><p>'+html(copy.guide[game][guideStep])+'</p></div><div class="guide-bottom"><div class="step-dots" aria-hidden="true">'+[0,1,2].map(i=>'<i class="'+(i===guideStep?'active':'')+'"></i>').join('')+'</div><button type="button" data-action="skip" class="subtle">'+html(t('skip'))+'</button><button type="button" data-action="guide-next" class="primary">'+html(t(guideStep===2?'start':'next'))+'</button></div>';}
const button=(action,label,extra='')=>'<button type="button" data-action="'+action+'" '+extra+'>'+html(label)+'</button>';
function renderPlay(){const head='<div class="play-head"><span class="round-icon" aria-hidden="true">'+icons[game]+'</span><div><span class="eyebrow">'+html(copy.title)+'</span><h2>'+html(copy[game])+'</h2></div></div><p>'+html(copy[game+'Rule'])+'</p><p class="goal">'+html(copy[game+'Goal'])+'</p>';
 let body='';if(game==='fox')body=foxUI();if(game==='river')body=riverUI();if(game==='hanoi')body=hanoiUI();if(game==='queens')body=queensUI();
 $('#play').innerHTML=head+body+'<div class="tools">'+button('hint',t('hint'))+button('undo',t('undo'))+button('reset',t('reset'))+'</div><p class="feedback" role="status">'+html(feedbackText())+'</p>';
}
function sizes(action,values,active,label){return '<div class="sizes" role="group" aria-label="'+html(label)+'">'+values.map(n=>button(action,String(n),`data-value="${n}" aria-pressed="${n===active}"`)).join('')+'</div>';}
function foxUI(){const days=FOX_DAYS[foxHoles];return sizes('fox-size',[4,5,6],foxHoles,t('foxDays',{n:foxHoles,days}))+`<p class="counter">${html(t('foxDays',{n:foxHoles,days}))}</p><h3>${html(t('foxPlan'))}</h3><div class="plan">${Array.from({length:days},(_,i)=>'<span class="'+(foxPlan[i]?'filled':'')+'">'+(foxPlan[i]?'🔎 '+foxPlan[i]:'○ '+(i+1))+'</span>').join('')}</div><p>${html(t('foxPick',{day:Math.min(foxPlan.length+1,days)}))}</p><div class="dens">${Array.from({length:foxHoles},(_,i)=>button('fox-pick',String(i+1),`data-value="${i+1}" ${foxPlan.length===days?'disabled':''}`)).join('')}</div><button class="primary check" type="button" data-action="fox-check" ${foxPlan.length===days?'':'disabled'}>${html(t('foxCheck'))}</button>`;}
function riverUI(){return `<p class="counter">${html(t('riverTrips',{n:riverHistory.length}))}</p><div class="banks">${[0,1].map(side=>`<div class="bank ${river.boat===side?'has-boat':''}"><h3>${html(t(side?'riverRight':'riverLeft'))}</h3><div class="bank-items">${RIVER_ITEMS.filter(item=>river.positions[item]===side).map(item=>`<span>${itemIcons[item]} ${html(itemNames[locale][RIVER_ITEMS.indexOf(item)])}</span>`).join('')||'·'}</div>${river.boat===side?'<div class="boat">⛵</div>':''}</div>`).join('<div class="water" aria-hidden="true">〰️<br>〰️</div>')}</div><p>${html(t('riverChoose'))}</p><div class="passengers" role="group" aria-label="${html(t('riverChoose'))}">${button('passenger',t('riverSolo'),`data-value="solo" aria-pressed="${riverPassenger===null}"`)}${RIVER_ITEMS.filter(item=>river.positions[item]===river.boat).map(item=>button('passenger',itemIcons[item]+' '+itemNames[locale][RIVER_ITEMS.indexOf(item)],`data-value="${item}" aria-pressed="${riverPassenger===item}"`)).join('')}</div><button class="primary check" type="button" data-action="river-cross">${html(t(river.boat?'riverReturn':'riverCross'))}</button>`;}
function hanoiUI(){return sizes('hanoi-size',[3,4,5],hanoiN,t('hanoiDiscs',{n:hanoiN}))+`<p class="counter">${html(t('hanoiDiscs',{n:hanoiN}))} · ${html(t('hanoiMoves',{n:hanoiHistory.length}))}</p><p>${html(t('hanoiPick'))}</p><div class="pegs">${pegs.map((peg,i)=>`<button type="button" data-action="peg" data-value="${i}" aria-label="${html(t('hanoiPeg',{n:i+1}))}" aria-pressed="${selectedPeg===i}"><span class="pole"></span><span class="disks">${peg.map(d=>`<span class="disk" style="--disk:${d};--total:${hanoiN}"></span>`).join('')}</span><span>${html(t('hanoiPeg',{n:i+1}))}</span></button>`).join('')}</div>`;}
function queensUI(){const clashes=queenConflicts(queens),count=queens.filter(c=>c>=0).length;return sizes('queens-size',[4,6,8],queensN,t('queensSize',{n:queensN}))+`<p class="counter">${html(t('queensSize',{n:queensN}))} · ${html(t('queensCount',{n:count,total:queensN}))}</p><div class="board" style="--board-size:${queensN}" role="group" aria-label="${html(copy.queens)}">${Array.from({length:queensN},(_,r)=>Array.from({length:queensN},(_,c)=>`<button type="button" class="cell ${(r+c)%2?'dark':''} ${queens[r]===c&&clashes.has(r)?'clash':''}" data-action="queen" data-row="${r}" data-col="${c}" aria-label="${html(t('queensCell',{r:r+1,c:c+1}))}${queens[r]===c?' ♛':''}" aria-pressed="${queens[r]===c}">${queens[r]===c?'♛':''}</button>`).join('')).join('')}</div>`;}
$('#language').addEventListener('change',e=>setLocale(e.target.value));
document.querySelector('.game-tabs').addEventListener('click',e=>{const link=e.target.closest('a[data-game]');if(link){e.preventDefault();changeGame(link.dataset.game);}});
addEventListener('hashchange',()=>changeGame(location.hash.slice(1)));
document.addEventListener('click',e=>{const el=e.target.closest('button[data-action]');if(!el)return;const action=el.dataset.action,value=el.dataset.value;
 if(action==='replay'){guideStep=0;guideOpen=true;renderGuide();return;}
 if(action==='skip'){finishGuide();return;}
 if(action==='guide-next'){if(guideStep===2)finishGuide();else{guideStep++;renderGuide();}return;}
 if(action==='hint'){say(game+'Hint');renderPlay();return;}
 if(action==='reset'){if(game==='fox')foxPlan=[];if(game==='river'){river=initialRiver();riverHistory=[];riverPassenger=null;}if(game==='hanoi'){pegs=initialHanoi(hanoiN);hanoiHistory=[];selectedPeg=null;}if(game==='queens'){queens=initialQueens(queensN);queensHistory=[];}feedback=null;renderPlay();return;}
 if(action==='undo'){if(game==='fox')foxPlan.pop();if(game==='river'){river=riverHistory.pop()||river;riverPassenger=null;}if(game==='hanoi'){pegs=hanoiHistory.pop()||pegs;selectedPeg=null;}if(game==='queens')queens=queensHistory.pop()||queens;feedback=null;renderPlay();return;}
 if(action==='fox-size'){foxHoles=Number(value);foxPlan=[];feedback=null;}
 if(action==='fox-pick'&&foxPlan.length<FOX_DAYS[foxHoles]){foxPlan.push(Number(value));feedback=null;}
 if(action==='fox-check'){if(foxPlan.length<FOX_DAYS[foxHoles])say('foxNeed',{days:FOX_DAYS[foxHoles]});else{const escape=foxEscape(foxHoles,foxPlan);if(escape)say('foxBad',{},escape);else say('foxGood');if(!escape)mark();}}
 if(action==='passenger')riverPassenger=value==='solo'?null:value;
 if(action==='river-cross'){const next=riverMove(river,riverPassenger);if(!next)say('riverBad');else{riverHistory.push(river);river=next;riverPassenger=null;feedback=null;if(riverWon(river)){say('riverGood');mark();}}}
 if(action==='hanoi-size'){hanoiN=Number(value);pegs=initialHanoi(hanoiN);hanoiHistory=[];selectedPeg=null;feedback=null;}
 if(action==='peg'){const target=Number(value);if(selectedPeg===null){if(pegs[target].length)selectedPeg=target;}else if(selectedPeg===target)selectedPeg=null;else{const next=hanoiMove(pegs,selectedPeg,target);if(next){hanoiHistory.push(pegs);pegs=next;feedback=null;if(hanoiWon(pegs,hanoiN)){say('hanoiGood',{n:hanoiHistory.length});mark();}}else say('hanoiBad');selectedPeg=null;}}
 if(action==='queens-size'){queensN=Number(value);queens=initialQueens(queensN);queensHistory=[];feedback=null;}
 if(action==='queen'){const r=Number(el.dataset.row),c=Number(el.dataset.col);queensHistory.push(queens);queens=[...queens];queens[r]=queens[r]===c?-1:c;const clashes=queenConflicts(queens);feedback=null;if(queensWon(queens)){say('queensGood');mark();}else if(clashes.size)say('queensConflict',{n:clashes.size});}
 renderPlay();});
setLocale(locale);
