import {UI as BASE_UI,LESSONS as BASE_LESSONS,localize} from './tutorial-copy.mjs?v=2';
const KEY='qidolab-how-to-v1';
export function createTutorial(doc,extension={}){
 const UI={...BASE_UI,...extension.names},LESSONS={...BASE_LESSONS,...extension.lessons};
 const host=doc.getElementById('how-to');if(!host)return {sync(){},destroy(){}};
 const win=doc.defaultView,session={};let game,lang,step=0,open=false,seen={};
 try{const raw=JSON.parse(win.localStorage.getItem(KEY)||'{}');if(raw&&typeof raw==='object')seen=raw;}catch{}
 const t=k=>localize(UI[k],lang),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const chip=(s,active=false)=>`<span class="tour-chip${active?' tour-highlight':''}">${esc(s)}</span>`;
 const flow=items=>`<div class="tour-flow">${items.map((s,i)=>`<span class="tour-beat" style="--beat:${i}">${i?'<span class="tour-arrow" aria-hidden="true">→</span>':''}${chip(s)}</span>`).join('')}</div>`;
 const label=s=>`<p class="tour-label">${esc(s)}</p>`;
 const note=s=>`<p class="tour-note">${esc(s)}</p>`;
 function scene(){
  if(extension.scenes?.[game])return extension.scenes[game]({step,t,chip,flow,label,note,esc});
  if(game==='patch'){
   const changed=step>=3;
   let h=label(t('shared'))+flow(['+1','×2',changed?'×2':'−1']);
   if(step===2)h+=`<div class="tour-edit">${label(t('choose')+' · 3')}${chip('−1',true)}<span class="tour-arrow">→</span>${label(t('replace'))}${chip('×2',true)}</div>`;
   if(step===0)return h+note('A: 2 → '+t('target')+' 12')+note('B: 5 → '+t('target')+' 24');
   h+=`<div class="tour-lanes"><div>${label('A · '+t('target')+' 12')}${flow(['2','3','6',changed?'12 ✓':'5 ≠ 12'])}</div><div>${label('B · '+t('target')+' 24')}${flow(['5','6','12',changed?'24 ✓':'11 ≠ 24'])}</div></div>`;
   h+=note('✓ '+t('checkpoint')+': A · 2 + 1 = 3');
   return h+(step===4?note('✓ '+t('pass')):'');
  }
  if(game==='borrow'){
   if(step===4)return label(t('borrowed')+' → '+t('returned')+' → ×3')+flow(['4','6','4','12 ≠ 16']);
   const values=[4,6,18,16],debt=[0,2,2,0];
   return label(t('target')+' 16')+`<div class="tour-stats"><div>${label(t('current'))}${chip(values[step],true)}</div><div>${label(t('debt'))}${chip(debt[step])}</div></div>`+flow(step===0?['4','×3','+2','−2']:step===1?['4','+2','6']:step===2?['6','×3','18']:['18','−2','16'])+note(step===0?'×3 · '+t('borrowed')+' · '+t('returned'):step===1?t('borrowed'):step===2?'×3 · '+t('debt')+' = 2':'✓ '+t('pass'));
  }
  if(game==='twentyfour'){
   if(step===0)return label(t('target')+' 24')+flow(['1','2','3','4']);
   if(step===4)return flow(['2','÷ 4','1/2'])+note('4 ÷ 2 = 2 ≠ 1/2');
   const expressions=['','1 + 3 = 4','4 + 2 = 6','6 × 4 = 24'];
   const cards=[[],['2','4','4'],['4','6'],['24 ✓']];
   return label(t('choose'))+`<div class="tour-equation">${chip(expressions[step],true)}</div>`+flow(cards[step])+note(step===3?'✓ '+t('pass'):'(1 + 3)'+(step===2?' + 2 = 6':' = 4'));
  }
  const guess=step<3?'1234':step===3?'4210':'4270',total=step<3?2:step===3?3:4,placed=step<3?1:step===3?3:4;
  return label(t('secret'))+`<div class="tour-digits">${[...'4270'].map(n=>chip(n)).join('')}</div>`+(step===0?'':label(t('guess'))+`<div class="tour-digits">${[...guess].map(n=>chip(n)).join('')}</div>`+`<div class="tour-feedback">${note(t('correct')+': '+total)}${step>=2?note(t('placed')+': '+placed)+note(t('elsewhere')+': '+(total-placed)):''}</div>`)+(step===4?note('✓ '+t('pass')):'');
 }
 function render(focus){
  host.className='how-to';
  if(!open){host.innerHTML=`<button type="button" class="tour-watch" data-tour="open">▶ ${esc(t('watch'))}</button>`;if(focus)host.querySelector('button').focus({preventScroll:true});return;}
  const lesson=LESSONS[game][step];
  host.innerHTML=`<section class="tour-panel" aria-labelledby="tour-title"><div class="tour-top"><span>${esc(t(game))} · ${esc(t('step').replace('{n}',step+1).replace('{total}',LESSONS[game].length))}</span><button type="button" data-tour="close">${esc(t('skip'))}</button></div><p class="tour-example">${esc(t('demo'))}</p><div class="tour-content" aria-live="polite" aria-atomic="true"><h3 id="tour-title" tabindex="-1">${esc(localize(lesson[0],lang))}</h3><p class="tour-explain">${esc(localize(lesson[1],lang))}</p><div class="tour-scene">${scene()}</div></div><div class="tour-controls"><button type="button" data-tour="back" ${step===0?'disabled':''}>${esc(t('back'))}</button><button type="button" data-tour="replay">↻ ${esc(t('replay'))}</button><button type="button" class="tour-next" data-tour="${step===LESSONS[game].length-1?'close':'next'}">${esc(t(step===LESSONS[game].length-1?'done':'next'))}</button></div></section>`;
  if(focus){host.querySelector('#tour-title').focus({preventScroll:true});host.scrollIntoView?.({block:'start',behavior:'instant'});}
 }
 function click(e){const b=e.target.closest('[data-tour]');if(!b||!host.contains(b)||b.disabled)return;const action=b.dataset.tour;
  if(action==='open'){open=true;step=0;}else if(action==='close'){open=false;seen[game]=true;try{win.localStorage.setItem(KEY,JSON.stringify(seen));}catch{}}
  else if(action==='next')step=Math.min(step+1,LESSONS[game].length-1);else if(action==='back')step=Math.max(0,step-1);
  session[game]={open,step};render(true);
 }
 host.addEventListener('click',click);
 return {sync(nextGame,nextLang){if(nextGame===game&&nextLang===lang)return;if(!LESSONS[nextGame])return;if(nextGame!==game){game=nextGame;open=session[game]?.open??seen[game]!==true;step=session[game]?.step??0;}lang=nextLang;render(false);},destroy(){host.removeEventListener('click',click);}};
}
