const languages = ['en', 'zh-CN', 'zh-TW', 'es-MX'];
export const collectionCopy = {
  originalName: ['Think Again!', '十八般脑洞', '十八般腦洞', 'Dale una vuelta'],
  moreName: ['Just One More', '数字不打烊', '數字不打烊', '¡Una más!'],
  classicsName: ['Old Tricks, New Moves', '经典换个玩', '經典換個玩', 'Clásicos con giro'],
  originalDesc: ['18 little challenges', '十八道关，慢慢闯', '十八道關，慢慢闖', '18 pequeños retos'],
  moreDesc: ['New numbers. Another go.', '换个数字，再来一局', '換個數字，再來一局', 'Otros números. Otra ronda.'],
  classicsDesc: ['Four familiar puzzles to try', '四种经典谜题的新玩法', '四種經典謎題的新玩法', 'Cuatro acertijos conocidos para probar'],
  label: ['Choose a collection', '选择栏目', '選擇欄目', 'Elige una colección']
};

// Each game owns its language and saved progress. Only the shared navigation
// observes language changes; its links work even before JavaScript loads.
export function initCollectionNav(doc) {
  const nav = doc.querySelector('.collection-switch');
  if (!nav) return () => {};
  const win = doc.defaultView;
  const render = () => {
    const i = Math.max(0, languages.indexOf(doc.documentElement.lang));
    nav.setAttribute('aria-label', collectionCopy.label[i]);
    nav.querySelectorAll('[data-collection-text]').forEach(el => {
      el.textContent = collectionCopy[el.dataset.collectionText][i];
    });
  };
  render();
  win.addEventListener('languagechange', render);
  const observer = new win.MutationObserver(render);
  observer.observe(doc.documentElement, {attributes: true, attributeFilter: ['lang']});
  return () => { observer.disconnect(); win.removeEventListener('languagechange', render); };
}
if (typeof document !== 'undefined') initCollectionNav(document);
