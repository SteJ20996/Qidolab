import {t, registerTranslations} from './i18n.mjs';
import {crownCompletion,answerViewed} from './crown-progress.mjs';
import {branchCompletion} from './branch-progress.mjs';
export const COMPLETION_KEY = 'quidence-completed-v1';
export const activityIds = ['water','lights','coins','numbers','clock','tiles','sums','bridge','takeaway','path','search','logic','probability','sorting','schedule','coloring','fractions','reflection'];
registerTranslations({
  completedReplay: {'zh-CN':'已完成 · 可以再次探索',en:'Completed · Explore again','es-MX':'Completado · Explora de nuevo'},
  branchCompletedReplay: {'zh-CN':'再走一步也已完成 · 可以再探索',en:'Extra step completed too · Explore again','es-MX':'Paso extra completado también · Explora de nuevo'},
  crownCompletedReplay: {'zh-CN':'挑战极限已完成',en:'Extreme completed','es-MX':'Reto extremo completado'},
  solidCrownReplay: {'zh-CN':'未看答案完成 · 实心金色皇冠',en:'Solved without viewing the answer · Solid gold crown','es-MX':'Resuelto sin ver la solución · Corona dorada sólida'},
  hollowCrownReplay: {'zh-CN':'看过极限答案 · 空心金色皇冠',en:'Extreme answer viewed · Hollow gold crown','es-MX':'Solución del reto extremo vista · Corona dorada hueca'},
  fullyCompletedReplay: {'zh-CN':'三项集齐 · 这一题变金了',en:'All three cleared · Gold unlocked','es-MX':'Los tres retos superados · Dorado desbloqueado'},
  completionGuide: {'zh-CN':'✓ 原题拿下 · ★ 再走一步 · 皇冠：挑战极限。三项齐了，这一题就镀金。极限可以先挑战；看过答案的皇冠保持空心。想重玩就回来，进度保存在此浏览器。',en:'✓ Original · ★ Extra step · Crown: extreme. Collect all three to turn this stop gold. You can try the extreme before the extra step. Viewed answers leave hollow crowns. Come back anytime; progress stays in this browser.','es-MX':'✓ Reto original · ★ Paso extra · Corona: reto extremo. Junta los tres y este juego se vuelve dorado. Puedes probar el extremo antes del paso extra. Ver la solución deja la corona hueca. Vuelve cuando quieras; el progreso se guarda en este navegador.'},
  clockCompletionGuide: {'zh-CN':'想点亮完成标记？亲手走到目标 8 或 2。',en:'For the completion check, build a path to target 8 or 2.','es-MX':'Para obtener la marca de completado, llega a la meta 8 o 2.'},
  tilesCompletionGuide: {'zh-CN':'想点亮完成标记？试试“相邻少两格”，亲手铺满棋盘。',en:'For the completion check, cover the board with adjacent squares missing.','es-MX':'Para obtener la marca de completado, cubre el tablero con dos huecos vecinos.'}
});
export const completionActivityKey = id => `quidence-completed-${id}-v1`;
export function createCompletionStore(storage = () => localStorage) {
  const completed = new Set();
  function refresh() {
    const before = completed.size;
    try {
      const target = storage();
      try { const saved=JSON.parse(target.getItem(COMPLETION_KEY)); if(Array.isArray(saved)) for(const id of saved) if(activityIds.includes(id)) completed.add(id); } catch {}
      for(const id of activityIds) if(target.getItem(completionActivityKey(id)) === '1') completed.add(id);
      // Independent, write-once facts prevent lost updates between tabs. The old
      // aggregate remains a compatibility mirror, never the only durable source.
      for(const id of completed) try { target.setItem(completionActivityKey(id), '1'); } catch {}
    } catch {}
    return completed.size !== before;
  }
  refresh();
  return {refresh, has:id=>completed.has(id), values:()=>activityIds.filter(id=>completed.has(id)), mark(id){
    if(!activityIds.includes(id)) throw new RangeError('Unknown activity');
    const existed = completed.has(id);
    completed.add(id);
    refresh();
    try { storage().setItem(COMPLETION_KEY,JSON.stringify(activityIds.filter(id=>completed.has(id)))); } catch {}
    return !existed;
  }};
}
export const completion = createCompletionStore();
export function renderCompletion() {
  if(typeof document==='undefined')return;
  document.querySelectorAll('[data-activity]').forEach(link=>{
    const done=completion.has(link.dataset.activity);
    const extra=done && branchCompletion.has(link.dataset.activity);
    const crowned=done && crownCompletion.has(link.dataset.activity);
    const viewed=done && answerViewed.has(link.dataset.activity);
    const hasCrown=crowned||viewed;
    const fullyCompleted=done&&extra&&crowned;
    const crownLabel=viewed?t('hollowCrownReplay'):crowned?t('solidCrownReplay'):'';
    let crown=[...link.children].find(x=>(x.className||'').split(/\s+/).includes('orbit-crown'));
    if(!crown){crown=document.createElement('span');crown.className='orbit-crown';crown.setAttribute('aria-hidden','true');crown.innerHTML='<svg viewBox="0 0 32 24" focusable="false"><path d="M4 18 1 5l8 5 7-9 7 9 8-5-3 13Z"/><path d="M4 21h24"/></svg>';link.append(crown);}
    crown.hidden=!hasCrown;link.classList.toggle('has-crown',hasCrown);link.classList.toggle('has-hollow-crown',viewed);link.dataset.extremeCompleted=String(crowned);link.dataset.answerViewed=String(viewed);
    link.classList.toggle('is-completed',done);
    link.classList.toggle('has-branch-star',extra);
    link.classList.toggle('is-fully-completed',fullyCompleted);
    link.dataset.fullyCompleted=String(fullyCompleted);
    link.dataset.completed=String(done);
    link.dataset.branchCompleted=String(extra);
    if(done){link.setAttribute('aria-label',`${[...link.children].filter(child=>child.getAttribute?.('aria-hidden')!=='true').map(child=>child.textContent).join(' ').trim() || link.textContent.trim()} · ${t('completedReplay')}${extra?' · '+t('branchCompletedReplay'):''}${crowned?' · '+t('crownCompletedReplay'):''}${crownLabel?' · '+crownLabel:''}${fullyCompleted?' · '+t('fullyCompletedReplay'):''}`);link.setAttribute('title',fullyCompleted?t('fullyCompletedReplay')+' · '+crownLabel:crownLabel|| (extra?t('branchCompletedReplay'):t('completedReplay')));}
  });
  const nav=document.getElementById('activity-orbit');
  if(nav){const links=[...nav.querySelectorAll('[data-activity]')];nav.parentElement.classList.toggle('all-gold',links.length===activityIds.length&&links.every(link=>link.dataset.fullyCompleted==='true'));}
  for(const [id,key] of [['completion-guide','completionGuide'],['clock-completion-guide','clockCompletionGuide'],['tiles-completion-guide','tilesCompletionGuide']]){
    const el=document.getElementById(id);if(el)el.textContent=t(key);
  }
}
export function markCompleted(id){if(completion.mark(id))renderCompletion();}
if(typeof window!=='undefined')for(const event of ['languagechange','activitiesready','branchcompletion','extremecompletion','extremeanswerreveal'])window.addEventListener(event,renderCompletion);
renderCompletion();

if(typeof window!=='undefined') for(const event of ['storage','focus']) window.addEventListener(event,change=>{if(event==='storage' && change.key && !change.key.startsWith('quidence-completed-') && !change.key.startsWith('qidolab-branch-') && !change.key.startsWith('qidolab-extreme-'))return;completion.refresh();branchCompletion.refresh();crownCompletion.refresh();answerViewed.refresh();renderCompletion();});
