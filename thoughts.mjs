import {t, registerTranslations} from './i18n.mjs';
export const THOUGHTS_LIMIT = 5000;
export const thoughtActivities = ['water', 'lights', 'coins', 'numbers', 'clock', 'tiles', 'sums', 'bridge', 'takeaway', 'path', 'search', 'logic', 'probability', 'sorting', 'schedule', 'coloring', 'fractions', 'reflection'];
registerTranslations({
  thoughtsConflict: {'zh-CN':'其他标签页也修改了这些想法。所有不同版本都保留在下方。复制需要的内容到上方，再确认合并。',en:'Another tab edited these notes. Different versions are preserved below. Copy anything you want into your note above, then confirm the merge.','es-MX':'Otra pestaña editó estas notas. Las versiones distintas se conservan abajo. Copia lo que quieras a tu nota de arriba y confirma la combinación.'},
  thoughtsVersion: {'zh-CN':'保留的版本 {count}',en:'Preserved version {count}','es-MX':'Versión conservada {count}'},
  thoughtsResolve: {'zh-CN':'保留上方文字并解决这些冲突',en:'Keep the note above and resolve these conflicts','es-MX':'Conservar la nota de arriba y resolver estos conflictos'},
  thoughtsTitle: {'zh-CN':'愿意分享你的想法吗？',en:'Do you want to share your thoughts?','es-MX':'¿Quieres compartir tus ideas?'},
  thoughtsHelper: {'zh-CN':'可选。只保存在这个浏览器中，不会发送给任何人，也不会评分。清除浏览器数据后，这些文字也会消失。计数使用 UTF-16 字符单位，部分表情符号占 2 个或更多单位。',en:'Optional. Kept only in this browser, never sent or graded. Clearing browser data removes these notes. Counts use UTF-16 text units; some emoji use 2 or more units.','es-MX':'Es opcional. Se guarda solo en este navegador; no se envía ni se califica. Si borras los datos del navegador, se perderán estas notas. El contador usa unidades de texto UTF-16; algunos emojis ocupan 2 o más unidades.'},
  thoughtsPlaceholder: {'zh-CN':'写下你的发现、疑问，或下一步想尝试的办法……',en:'Write a discovery, a question, or something you want to try…','es-MX':'Escribe un descubrimiento, una pregunta o algo que quieras intentar…'},
  thoughtsEmpty: {'zh-CN':'最多 {limit} 个字符单位，随时可以开始写。',en:'Up to {limit} text units. Write whenever you like.','es-MX':'Hasta {limit} unidades de texto. Escribe cuando quieras.'},
  thoughtsSaved: {'zh-CN':'已保存在此浏览器 · {count}/{limit}',en:'Saved in this browser · {count}/{limit}','es-MX':'Guardado en este navegador · {count}/{limit}'},
  thoughtsUnavailable: {'zh-CN':'暂时无法读取本地保存。新输入的文字会尝试保存；离开前请先复制备份。',en:'Local notes could not be loaded. New typing will try to save; copy your notes before leaving.','es-MX':'No se pudieron cargar las notas locales. Se intentará guardar lo que escribas; copia tus notas antes de salir.'},
  thoughtsFailed: {'zh-CN':'未能保存，只在本次打开期间保留。离开或刷新前请先复制备份。· {count}/{limit}',en:'Not saved; kept for this visit only. Copy your notes before leaving or reloading. · {count}/{limit}','es-MX':'No se guardó; solo se conserva durante esta visita. Copia tus notas antes de salir o recargar. · {count}/{limit}'}
});
export function installThoughts({doc = document, win = window, storage = () => localStorage} = {}) {
  const entries = new Map();
  // A distinct tab owns a distinct durable slot. No read/merge/write lock is
  // assumed: concurrent slots survive independently. Causal per-tab revision vectors tell
  // an acknowledged edit from a concurrent branch. Old raw-string keys remain.
  const token = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  const tab = token();
  const validText = value => typeof value === 'string' && value.length <= THOUGHTS_LIMIT;
  function records(entry, target) {
    const found = [];
    for(let i=0; i<target.length; i++) {
      const key = target.key(i);
      if(!key?.startsWith(entry.prefix)) continue;
      try {
        const record = JSON.parse(target.getItem(key));
        if(record && typeof record.tab === 'string' && /^[a-zA-Z0-9-]+$/.test(record.tab) && Number.isSafeInteger(record.seq) && record.seq > 0 && validText(record.text) && record.clock && typeof record.clock === 'object' && !Array.isArray(record.clock) && Object.entries(record.clock).every(([id,seq])=>/^[a-zA-Z0-9-]+$/.test(id) && Number.isSafeInteger(seq) && seq > 0) && record.clock[record.tab] === record.seq) found.push(record);
      } catch {}
    }
    return found;
  }
  // One maximum sequence per tab, rather than one random ID per keystroke.
  // Metadata grows with independently editing tabs, not with edit count.
  function ancestry(list) {
    const clock = Object.create(null);
    for(const record of list) for(const [id,seq] of Object.entries(record.clock)) clock[id] = Math.max(clock[id] || 0, seq);
    return clock;
  }
  function leaves(list) {
    return list.filter(record=>!list.some(other=>other !== record && (other.clock[record.tab] || 0) >= record.seq));
  }
  function refresh(entry, initial = false) {
    try {
      const target = storage(), all = records(entry, target), active = leaves(all);
      entry.records = all;
      const distinct = [...new Set(active.map(record=>record.text))];
      entry.variants = distinct.length > 1 ? distinct : [];
      // Never disturb focus, composition, uncommitted DOM text, or failed saves.
      if(initial || (!entry.editing && !entry.composing && entry.input.value === entry.lastText && entry.state !== 'thoughtsFailed')) {
        let text = entry.input.value;
        if(active.length) {
          const legacy = target.getItem(entry.key);
          text = distinct.includes(text) ? text : distinct.includes(legacy) ? legacy : active[0].text;
          if(distinct.length === 1) entry.parents = ancestry(all);
          else entry.parents = ancestry(active.filter(record=>record.text===text));
          entry.state = 'thoughtsSaved';
        } else {
          const saved = target.getItem(entry.key);
          if(saved !== null) {
            if(!validText(saved)) throw new Error('Invalid note');
            text = saved; entry.state = 'thoughtsSaved';
          }
        }
        entry.input.value = text; entry.lastText = text;
      }
    } catch { if(initial) entry.state = 'thoughtsUnavailable'; }
  }
  function save(entry, resolve = false) {
    if(entry.composing) return;
    entry.input.value = entry.input.value.slice(0, THOUGHTS_LIMIT);
    try {
      const target = storage();
      if(resolve) entry.parents = ancestry(entry.records);
      const seq = ++entry.sequence;
      const record = {tab, seq, text:entry.input.value, clock:{...entry.parents, [tab]:seq}};
      target.setItem(entry.prefix + tab, JSON.stringify(record));
      entry.parents = record.clock;
      entry.lastText = entry.input.value;
      // Mirror only after the independent branch is durable.
      target.setItem(entry.key, entry.input.value);
      entry.state = 'thoughtsSaved';
    } catch { entry.state = 'thoughtsFailed'; }
    refresh(entry); render(entry);
  }

  function size(entry) {
    if (entry.view.hidden) return;
    for(const input of [entry.input, ...entry.recovery.children].filter(element=>element.tagName === 'TEXTAREA')) {
      input.style.height = 'auto';
      // scrollHeight includes padding, but not borders. No cap: the whole page grows.
      input.style.height = `${Math.max(86, input.scrollHeight + input.offsetHeight - input.clientHeight)}px`;
    }
  }
  function render(entry) {
    entry.title.textContent = t('thoughtsTitle');
    entry.helper.textContent = t('thoughtsHelper');
    entry.input.setAttribute('placeholder', t('thoughtsPlaceholder'));
    if(['thoughtsFailed', 'thoughtsUnavailable'].includes(entry.state)) entry.status.setAttribute('role','status');
    else entry.status.removeAttribute('role');
    entry.status.textContent = t(entry.state, {count: entry.input.value.length, limit: THOUGHTS_LIMIT});
    entry.status.dataset.state = ['thoughtsFailed', 'thoughtsUnavailable'].includes(entry.state) ? 'error' : 'ok';
    entry.recovery.replaceChildren();
    entry.recovery.hidden = !entry.variants.length;
    if(entry.variants.length) {
      const warning = doc.createElement('p'); warning.textContent = t('thoughtsConflict'); warning.setAttribute('role', 'status');
      entry.recovery.append(warning);
      entry.variants.forEach((text, index)=>{
        const version = doc.createElement('textarea'); version.value = text; version.readOnly = true;
        version.setAttribute('readonly', ''); version.setAttribute('rows', '3'); version.setAttribute('aria-label',t('thoughtsVersion',{count:index+1}));
        entry.recovery.append(version);
      });
      const resolve = doc.createElement('button'); resolve.type = 'button'; resolve.textContent = t('thoughtsResolve'); resolve.disabled = !!entry.composing;
      resolve.addEventListener('click',()=>save(entry, true)); entry.recovery.append(resolve);
    }
    size(entry);
  }
  function mount() {
    for (const activity of thoughtActivities) {
      const view = doc.getElementById(`activity-${activity}`);
      if (!view || entries.has(activity)) continue;
      const section = doc.createElement('section'); section.className = 'thoughts';
      const title = doc.createElement('h2'), helper = doc.createElement('p'), input = doc.createElement('textarea'), status = doc.createElement('p');
      title.id = `thoughts-${activity}-title`; helper.id = `thoughts-${activity}-helper`; status.id = `thoughts-${activity}-status`; input.id = `thoughts-${activity}`;
      section.setAttribute('aria-labelledby', title.id);
      input.setAttribute('aria-labelledby', title.id); input.setAttribute('aria-describedby', `${helper.id} ${status.id}`);
      input.setAttribute('maxlength', String(THOUGHTS_LIMIT)); input.setAttribute('rows', '3');
      helper.className = 'thoughts-helper'; status.className = 'thoughts-status';
      const recovery = doc.createElement('div');
      const entry = {view, title, helper, input, status, recovery, state: 'thoughtsEmpty', key: `quidence-thoughts-${activity}-v1`, prefix:`quidence-thoughts-${activity}-branch-v1:`, parents:{}, sequence:0, records:[], variants:[], lastText:'', editing:false, composing:false};
      refresh(entry, true);
      input.addEventListener('focus',()=>{entry.editing=true;});
      input.addEventListener('blur',()=>{entry.editing=false; refresh(entry); render(entry);});
      input.addEventListener('compositionstart',()=>{entry.composing=true;});
      input.addEventListener('input', event => {
        if (event.isComposing || entry.composing) { entry.composing=true; size(entry); return; }
        save(entry);
      });
      input.addEventListener('compositionend', () => {entry.composing=false; save(entry);});
      section.append(title, helper, input, status, recovery);
      // Place reflection before expandable histories, outside every game form.
      const before = [...view.children].find(child => /\b(below-board|mini-below|number-history|more-history|quiet-note)\b/.test(child.className));
      view.insertBefore(section, before || null);
      entries.set(activity, entry); render(entry);
    }
  }
  function resize() { for (const entry of entries.values()) size(entry); }
  function language() { for (const entry of entries.values()) render(entry); }
  mount();
  win.addEventListener('activitiesready', mount);
  win.addEventListener('languagechange', language);
  win.addEventListener('hashchange', resize);
  win.addEventListener('resize', resize);
  const sync = () => {for(const entry of entries.values()){refresh(entry); render(entry);}};
  win.addEventListener('storage', event => {if(!event.key || event.key.startsWith('quidence-thoughts-')) sync();});
  win.addEventListener('focus', sync);
  doc.fonts?.ready.then(resize);
  return {entries, resize, sync};
}
if (typeof document !== 'undefined') installThoughts();
