const labels = {
  en: 'Questions or feedback? Email',
  'zh-CN': '如有问题或建议，请联系',
  'zh-TW': '如有問題或建議，請聯絡',
  'es-MX': '¿Tienes preguntas o sugerencias? Escríbenos a'
};

const label = document.querySelector('[data-contact-label]');
if (label) {
  const render = () => {
    const lang = document.documentElement.lang;
    const key = lang === 'zh-TW' || lang === 'zh-Hant' ? 'zh-TW'
      : lang === 'zh-CN' || lang === 'zh-Hans' ? 'zh-CN'
        : lang.startsWith('es') ? 'es-MX' : 'en';
    label.textContent = labels[key];
  };
  new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  render();
}
