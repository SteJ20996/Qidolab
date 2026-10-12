import {registerTranslations,t} from './i18n.mjs';
registerTranslations({'mobileChooseAnother':{'zh-CN':'↑ 选择另一个实验','en':'↑ Choose another experiment','es-MX':'↑ Elegir otro experimento'}});
const center=document.getElementById('activity-center');
const nav=document.getElementById('activity-orbit');
const back=document.createElement('button');
back.type='button';back.className='mobile-back';back.textContent=t('mobileChooseAnother');back.setAttribute('aria-label',t('mobileChooseAnother').replace(/^↑\s*/,''));
center.prepend(back);
const behavior=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
back.addEventListener('click',()=>{
  nav.querySelector('[aria-current]')?.focus({preventScroll:true});
  nav.scrollIntoView({behavior:behavior(),block:'start'});
});
// Only an explicit title activation scrolls to the activity; startup, resizing,
// language changes and in-game moves keep the reader's position.
nav.addEventListener('click',event=>{
  const link=event.target.closest('a[data-activity]');
  if(!link||event.defaultPrevented||(event.button!==undefined&&event.button!==0)||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const heading=document.getElementById(center.getAttribute('aria-labelledby'));
    if(!heading)return;
    heading.setAttribute('tabindex','-1');
    heading.focus({preventScroll:true});
    if(window.innerWidth<980){
      center.scrollIntoView({behavior:behavior(),block:'start'});
    }else{
      const bounds=heading.getBoundingClientRect();
      if(bounds.top<0||bounds.bottom>window.innerHeight)
        heading.scrollIntoView({behavior:behavior(),block:'start'});
    }
  }));
});
window.addEventListener('languagechange',()=>{back.textContent=t('mobileChooseAnother');back.setAttribute('aria-label',t('mobileChooseAnother').replace(/^↑\s*/,''));});
