import {EXTREME_COPY} from './extreme-content.mjs';
import {installChili} from './josephus.mjs';
import {completion, renderCompletion} from './completion.mjs';
import {branchCompletion, markBranchCompleted} from './branch-progress.mjs';
import {visibleActivities, activityRoute} from './catalog.mjs';
import {currentOutcome} from './outcomes.mjs';
import {registerTranslations, t, translateDOM, locales} from './i18n.mjs';
import {BRANCH_COPY, BRANCHES} from './branch-content.mjs';
import {branchKey, freshBranch, validBranch, predictBranch, inspectBranch, reviewBranch, restartBranch, branchObservation} from './branch-engine.mjs';

registerTranslations(Object.fromEntries(Object.entries(EXTREME_COPY).map(([key,values])=>['extreme.'+key,Object.fromEntries(locales.map((lang,i)=>[lang,values[i]]))])));
registerTranslations(Object.fromEntries(Object.entries(BRANCH_COPY).map(([key, values]) => ['branch.' + key, Object.fromEntries(locales.map((lang, i) => [lang, values[i]]))])));
registerTranslations({[BRANCH_COPY.meta[0]]:Object.fromEntries(locales.map((lang,i)=>[lang,BRANCH_COPY.meta[i]]))});
for (const [id, content] of Object.entries(BRANCHES)) {
  for (const [key, values] of Object.entries(content)) {
    if (key === 'board') continue;
    if (key === 'options') values.forEach((option, i) => registerTranslations({[`branch.${id}.option.${i}`]:Object.fromEntries(locales.map((lang, j) => [lang, option[j]]))}));
    else registerTranslations({[`branch.${id}.${key}`]:Object.fromEntries(locales.map((lang, i) => [lang, values[i]]))});
  }
}
const $ = id => document.getElementById(id);
const copy = (key, params) => t('branch.' + key, params);
const text = (id, key) => t(`branch.${id}.${key}`);
const center = $('activity-center');
const stage = $('activity-orbit').parentElement;
const records = new Map(), choices = new Map(), dismissed = new Map(), failed = new Set();
const optionOrders = new Map();
for (const id of visibleActivities) {
  let saved = null, raw = null;
  try { raw = localStorage.getItem(branchKey(id)); } catch { failed.add(id); }
  try { saved = JSON.parse(raw); } catch {}
  records.set(id, validBranch(id, saved) ? saved : freshBranch());
  choices.set(id, {prediction:null, review:null});
  // Keep uncertainty last and vary the decisive choices. Stable canonical IDs
  // retain the meaning of saved choices through translations and reloads.
  const options=BRANCHES[id].options, hasUncertain=options.at(-1)[1]==='Not sure yet';
  const order=Array.from({length:options.length-(hasUncertain?1:0)},(_,i)=>i);
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  if(hasUncertain)order.push(options.length-1);
  optionOrders.set(id,order);
  const section = document.createElement('section');
  section.id = `next-invite-${id}`; section.className = 'next-invite'; section.hidden = true;
  section.setAttribute('aria-label', copy('branchLabel'));
  const prompt = document.createElement('p');
  const actions = document.createElement('div'); actions.className = 'next-actions';
  const link = document.createElement('a'); link.className = 'next-link'; link.setAttribute('href', `#${id}/next`);
  const extremeLink=document.createElement('a');extremeLink.className='next-link extreme-link';extremeLink.setAttribute('href',`#${id}/extreme`);
  actions.append(link,extremeLink); section.append(prompt, actions);
  $('activity-' + id).append(section);
}
branchCompletion.refresh(); renderCompletion();
const dialogRoot = document.body || stage;
dialogRoot.insertAdjacentHTML('beforeend', `<dialog id="success-invitation" class="success-invitation" hidden aria-modal="true" aria-labelledby="success-invitation-title" aria-describedby="success-invitation-copy">
  <div class="success-invitation-card"><span class="invitation-symbol" aria-hidden="true">✓</span><h2 id="success-invitation-title"></h2><p id="success-invitation-copy"></p>
    <div class="success-invitation-actions"><button id="success-go-next" class="branch-button" type="button"></button><button id="success-go-extreme" class="branch-button extreme-button" type="button"></button><button id="success-later" class="invitation-later" type="button"></button></div>
  </div>
</dialog>`);
stage.insertAdjacentHTML('beforeend', '<div id="orbit-extension" class="orbit-extension" hidden><span class="outer-connector" aria-hidden="true"></span><a id="outer-next" class="outer-next" href="#water/next"></a></div>');
center.insertAdjacentHTML('beforeend', `<section id="activity-next" class="activity-view branch-view" hidden aria-labelledby="branch-title">
  <a id="branch-back" class="branch-back" href="#water"></a>
  <div class="intro"><p id="branch-label" class="eyebrow"></p><h1 id="branch-title"></h1><p id="branch-intro" class="premise"></p></div>
  <p id="branch-privacy" class="branch-quiet"></p>
  <div id="branch-diagram" class="branch-diagram" hidden></div>
  <section id="branch-prediction" class="branch-card" aria-labelledby="branch-question">
    <h2 id="branch-question"></h2><div id="branch-first-options" class="branch-options" role="group"></div>
    <button id="branch-commit" class="branch-button" type="button"></button>
  </section>
  <p id="branch-recorded" class="branch-quiet" hidden></p>
  <button id="branch-inspect" class="branch-button" type="button" hidden></button>
  <section id="branch-evidence" class="branch-card branch-evidence" hidden aria-labelledby="branch-evidence-title">
    <h2 id="branch-evidence-title"></h2><p id="branch-evidence-copy" class="branch-lines"></p>
  </section>
  <section id="branch-review" class="branch-card" hidden aria-labelledby="branch-review-title">
    <h2 id="branch-review-title"></h2><div id="branch-review-options" class="branch-options" role="group"></div>
    <button id="branch-commit-review" class="branch-button" type="button"></button>
  </section>
  <p id="branch-complete" class="branch-complete" hidden role="status"></p>
  <p id="branch-message" role="status" aria-live="polite"></p>
  <section id="branch-explanation" class="branch-card" hidden aria-labelledby="branch-explanation-title">
    <h2 id="branch-explanation-title"></h2><p id="branch-explanation-copy" class="branch-lines"></p>
  </section>
  <section id="branch-record" class="branch-record" hidden aria-labelledby="branch-record-title">
    <h2 id="branch-record-title"></h2><dl><dt id="branch-before-label"></dt><dd id="branch-before"></dd><dt id="branch-after-label"></dt><dd id="branch-after"></dd></dl>
    <p id="branch-observation"></p><p id="branch-limit" class="branch-quiet"></p>
  </section>
  <details id="branch-past" class="branch-past" hidden><summary id="branch-past-title"></summary><ol id="branch-past-list"></ol></details>
  <button id="branch-restart" class="text-button" type="button" hidden></button>
  <p id="branch-save-error" class="branch-quiet" role="status" hidden></p>
</section>`);

const chili=installChili($('branch-evidence'),()=>render());
let current = null, message = null, modalParent = null, previousFocus = null, inputParent = null;
// Capture a real interaction before game handlers run. Restoring a saved win,
// opening the page and changing language must not summon a success dialog.
for(const type of ['pointerdown','click','keydown','submit'])window.addEventListener(type,event=>{
  inputParent=null;
  for(let target=event.target;target;target=target.parentElement){
    const id=target.id?.replace(/^activity-/,'');
    if(visibleActivities.includes(id)){inputParent=id;break;}
  }
},{capture:true});
function closeInvitation() {
  if(!modalParent)return;
  dismissed.set(modalParent,currentOutcome(modalParent).serial); modalParent=null;
  const dialog=$('success-invitation'); dialog.hidden=true;
  if(typeof dialog.close==='function' && dialog.open)dialog.close();else dialog.removeAttribute('open');
  if(!previousFocus?.closest?.('[hidden]'))previousFocus?.focus?.({preventScroll:true});
  previousFocus=null;
}
function showInvitation(id) {
  if(modalParent)closeInvitation();
  modalParent=id; previousFocus=document.activeElement;
  renderInvitations();
  const dialog=$('success-invitation'); dialog.hidden=false;
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  $('success-go-next').focus?.({preventScroll:true});
}
$('success-later').addEventListener('click',closeInvitation);
$('success-go-next').addEventListener('click',()=>{
  const parent=modalParent;if(!parent)return;closeInvitation();location.hash=`#${parent}/next`;focusAfterNavigation();
});
$('success-go-extreme').addEventListener('click',()=>{const parent=modalParent;if(!parent)return;closeInvitation();location.hash=`#${parent}/extreme`;focusAfterNavigation();});
$('success-invitation').addEventListener('cancel',event=>{event.preventDefault();closeInvitation();});
$('success-invitation').addEventListener('close',closeInvitation);
$('success-invitation').addEventListener('click',event=>{if(event.target===$('success-invitation'))closeInvitation();});
$('success-invitation').addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();closeInvitation();}
  if(event.key==='Tab'){
    const first=$('success-go-next'),last=$('success-later');
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus?.();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus?.();}
  }
});
function save(id, value) {
  records.set(id, value);
  try { localStorage.setItem(branchKey(id), JSON.stringify(value)); failed.delete(id); } catch { failed.add(id); }
}
function renderInvitations() {
  for (const id of visibleActivities) {
    const invitation = $(`next-invite-${id}`), [prompt, actions] = invitation.children, [link] = actions.children;
    invitation.hidden = !completion.has(id);
    invitation.setAttribute('aria-label', copy('branchLabel'));
    prompt.textContent = copy(branchCompletion.has(id)?'replayEntry':'returnEntry'); link.textContent = copy('continue');
    link.setAttribute('aria-label', copy('openAria', {name:text(id,'name')}));
    actions.children[1].textContent=t('extreme.name');actions.children[1].setAttribute('aria-label',`${text(id,'name')} · ${t('extreme.name')}`);
  }
  const {parent, deeper} = activityRoute(location.hash);
  const unlocked = completion.has(parent);
  $('orbit-extension').hidden = !unlocked;
  const node = $('outer-next'); node.setAttribute('href', `#${parent}/next`); node.textContent = copy('begin');
  node.setAttribute('aria-label', copy('openAria', {name:text(parent,'name')}));
  if (deeper && unlocked) node.setAttribute('aria-current','page'); else node.removeAttribute('aria-current');
  $('success-invitation-title').textContent=copy('popupTitle');
  $('success-invitation-copy').textContent=t('extreme.popupCopy');
  $('success-go-extreme').textContent=t('extreme.name');
  $('success-go-next').textContent=copy('begin').replace(/\s*↗$/,'');
  $('success-later').textContent=copy('skip');
}
function choiceButtons(id, target, step, value) {
  const parent = $(target);
  if (parent.dataset.parent !== id) {
    parent.replaceChildren(); parent.dataset.parent = id;
    optionOrders.get(id).forEach(i => {
      const button = document.createElement('button'); button.type = 'button'; button.id = `branch-${step}-${i}`;
      button.dataset.choice = String(i);
      button.addEventListener('click', () => { choices.get(id)[step] = i; message = null; render(); });
      parent.append(button);
    });
  }
  parent.setAttribute('aria-label', step === 'prediction' ? text(id,'question') : copy('revise'));
  [...parent.children].forEach(button => { const i=Number(button.dataset.choice); button.textContent = text(id, 'option.' + i); button.setAttribute('aria-pressed', String(value === i)); });
}
function diagram(id, evidence) {
  const box = $('branch-diagram'); box.replaceChildren(); box.hidden = !BRANCHES[id].board;
  if (BRANCHES[id].board === 'tiles') {
    $('branch-privacy').parentElement.insertBefore(box,$('branch-prediction'));
    box.className = 'branch-diagram branch-tile-grid';
    const removed = [1,4,10,15];
    for (let i=0;i<16;i++) {
      const cell = document.createElement('span');
      cell.className = `branch-tile ${(Math.floor(i/4)+i%4)%2 ? 'light' : 'dark'}${removed.includes(i)?' missing':''}${evidence && i===0?' isolated':''}`;
      cell.textContent = removed.includes(i) ? '×' : evidence && i===0 ? '●' : '·';
      cell.setAttribute('aria-hidden','true'); box.append(cell);
    }
    // Coordinates and the isolated square are also stated in ordinary text.
    box.setAttribute('aria-hidden','true');
  } else if (BRANCHES[id].board === 'probability' && evidence) {
    $('branch-evidence').append(box);
    box.className = 'branch-diagram branch-weight-grid';
    for (let a=1;a<=4;a++) for (let b=1;b<=4;b++) {
      const cell = document.createElement('span'); cell.className = 'branch-weight' + (a+b>=6 || a===b ? ' in-event' : '');
      cell.textContent = `${a},${b}\n${b===4?'3':'1'}/24`; box.append(cell);
    }
    box.setAttribute('aria-hidden','true');
  } else box.hidden = true;
}
function render() {
  renderInvitations();
  const route = activityRoute(location.hash);
  if (!route.deeper || route.extreme || !completion.has(route.parent)) return;
  current = route.parent;
  const id = current, state = records.get(id), active = state.active, selected = choices.get(id), observation = branchObservation(id, active);
  $('branch-back').setAttribute('href', '#' + id);
  for (const [element, key] of Object.entries({'branch-back':'back','branch-label':'branchLabel','branch-privacy':'privacy','branch-commit':'commit','branch-recorded':'recorded','branch-inspect':'inspect','branch-evidence-title':'evidenceTitle','branch-review-title':'revise','branch-commit-review':'commitReview','branch-explanation-title':'explanation','branch-record-title':'record','branch-before-label':'before','branch-after-label':'after','branch-limit':'limit','branch-restart':'restart','branch-save-error':'saveError'})) $(element).textContent = copy(key);
  for (const [element, key] of Object.entries({'branch-title':'title','branch-intro':'intro','branch-question':'question','branch-evidence-copy':'evidence','branch-explanation-copy':'explanation'})) $(element).textContent = text(id, key);
  choiceButtons(id, 'branch-first-options', 'prediction', selected.prediction);
  choiceButtons(id, 'branch-review-options', 'review', selected.review);
  $('branch-prediction').hidden = Boolean(active);
  $('branch-recorded').hidden = !active || active.evidence;
  $('branch-inspect').hidden = !active || active.evidence;
  $('branch-evidence').hidden = !active?.evidence;
  $('chili-ring').hidden=id!=='search'||!active?.evidence;chili.render();
  $('branch-review').hidden = !active?.evidence||(id==='search'&&!chili.getState().done);
  $('branch-explanation').hidden = !observation.reviewed;
  $('branch-record').hidden = !active;
  $('branch-restart').hidden = !active;
  $('branch-save-error').hidden = !failed.has(id);
  $('branch-complete').hidden = !branchCompletion.has(id); $('branch-complete').textContent=copy('complete');
  if (active) {
    $('branch-before').textContent = text(id, 'option.' + active.prediction);
    $('branch-after').textContent = observation.reviewed ? text(id, 'option.' + active.reviews.at(-1)) : copy('notReviewed');
  }
  $('branch-observation').textContent = observation.reviewed ? copy(observation.changed ? 'changed' : 'kept') : '';
  $('branch-message').textContent = message ? copy(message) : observation.reviewed ? copy(observation.consistentWithEvidence ? 'follows' : 'revisit') : '';
  $('branch-past').hidden = !state.attempts.length;
  $('branch-past-title').textContent = copy('past', {count:state.attempts.length});
  $('branch-past-list').replaceChildren();
  for (const attempt of [...state.attempts].reverse()) {
    const li = document.createElement('li'); li.textContent = `${copy('before')}: ${text(id,'option.'+attempt.prediction)} → ${copy('after')}: ${attempt.reviews.length ? text(id,'option.'+attempt.reviews.at(-1)) : copy('notReviewed')}`; $('branch-past-list').append(li);
  }
  diagram(id, Boolean(active?.evidence));
}
function commit(action) {
  const route = activityRoute(location.hash);
  if (!current || !route.deeper || route.extreme || route.parent !== current || !completion.has(current)) return;
  const state = records.get(current), selected = choices.get(current);
  if (action==='prediction') {
    if (selected.prediction === null) { message='selectFirst'; render(); return; }
    save(current, predictBranch(current, state, selected.prediction));
  } else if (action==='inspect') save(current, inspectBranch(current, state));
  else if (action==='review') {
    if(current==='search'&&!chili.getState().done)return;
    if (selected.review === null) { message='selectReview'; render(); return; }
    save(current, reviewBranch(current, state, selected.review));
    if(branchObservation(current,records.get(current).active).consistentWithEvidence)markBranchCompleted(current);
  } else { save(current, restartBranch(current, state));if(current==='search')chili.reset(); choices.set(current,{prediction:null,review:null}); }
  message = null; render();
  if(action==='prediction')$('branch-inspect').focus?.({preventScroll:true});
  else if(action==='inspect'){$('branch-evidence-title').setAttribute('tabindex','-1');$('branch-evidence-title').focus?.({preventScroll:true});}
  else if(action==='restart')$('branch-first-options').children[0]?.focus?.({preventScroll:true});
}
for (const [id, action] of [['branch-commit','prediction'],['branch-inspect','inspect'],['branch-commit-review','review'],['branch-restart','restart']]) $(id).addEventListener('click', () => commit(action));
window.addEventListener('activitynavigation', () => { const route=activityRoute(location.hash); if(modalParent && (route.parent!==modalParent || route.deeper))closeInvitation(); if(route.parent!==current)message=null; render(); });
window.addEventListener('activityoutcome', event=>{
  renderInvitations();
  const route=activityRoute(location.hash),outcome=event.detail;
  if(inputParent===outcome.id && outcome.successful && !route.deeper && route.parent===outcome.id && dismissed.get(outcome.id)!==outcome.serial)showInvitation(outcome.id);
});
window.addEventListener('languagechange', render);
window.addEventListener('storage', render);
window.addEventListener('focus', render);
// Anchor activation alone moves focus; translation and game moves do not.
const focusAfterNavigation = event => {
  if(event?.defaultPrevented || event?.button!==undefined && event.button!==0 || event?.ctrlKey || event?.metaKey || event?.shiftKey || event?.altKey)return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
  const heading = $(center.getAttribute('aria-labelledby')); if (!heading) return;
  heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true});
  const behavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
  if (window.innerWidth < 980) center.scrollIntoView({behavior,block:'start'});
  else {const bounds=heading.getBoundingClientRect();if(bounds.top<0||bounds.bottom>window.innerHeight)heading.scrollIntoView({behavior,block:'start'});}
  }));
};
$('outer-next').addEventListener('click', focusAfterNavigation);
$('branch-back').addEventListener('click', focusAfterNavigation);
for (const id of visibleActivities) for(const link of $(`next-invite-${id}`).children[1].children)link.addEventListener('click', focusAfterNavigation);
translateDOM(); render();
