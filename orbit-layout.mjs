// Size the true ellipse for every angle of rotation, not just the resting slots.
// An adjacent pair's difference traces an ellipse with chord-scaled radii. Its
// expanded label rectangle must fit inside that ellipse; all other pairs have
// larger chords. The center uses the same test with label half-extents added.
// A zero-size panel is the narrow-screen, natural-flow fallback below the ring.
export function requiredOrbitHeight({width,panelWidth=0,panelHeight=0,labelWidth,labelHeight,labelCount=18,insetX=88,insetY=36,gap=10,labelGap=8,minHeight=760}) {
  const rx=width/2-insetX;
  if (!(rx>0)) throw new RangeError('The ellipse needs a positive horizontal radius');
  let height=minHeight;
  if(labelCount>1){
    const chord=2*Math.sin(Math.PI/labelCount);
    const horizontal=(labelWidth+labelGap)/(chord*rx);
    if(horizontal>=1) throw new RangeError('The title labels are too wide for their ellipse');
    height=Math.max(height,2*insetY+2*(labelHeight+labelGap)/(chord*Math.sqrt(1-horizontal**2)));
  }
  if(panelWidth>0&&panelHeight>0){
    const horizontal=(panelWidth+labelWidth+2*gap)/(2*rx);
    if(horizontal>=1) throw new RangeError('The center panel is too wide for its ellipse');
    height=Math.max(height,2*insetY+(panelHeight+labelHeight+2*gap)/Math.sqrt(1-horizontal**2));
  }
  return Math.ceil(height);
}
// Eighteen resting positions lie on the SAME ellipse. Equal vertical spacing
// down each side avoids pole crowding while preserving readable full titles.
const sideAngles=[.78,.56,.34,.12,-.12,-.34,-.56,-.78].map(y=>Math.acos(y)*180/Math.PI);
export const mobileAngles=[0,...sideAngles,180,...sideAngles.map(a=>360-a).reverse()];
// At very narrow widths the opposing boxes can no longer share a vertical
// level. Interleave their levels instead, still using one exact ellipse and
// retaining the pole at twelve o'clock. No label size or text is sacrificed.
const narrowMobileAngles=[0,...Array.from({length:8},(_,i)=>Math.acos(1-2*(2*i+1)/17)*180/Math.PI),180,
  ...Array.from({length:8},(_,i)=>360-Math.acos(1-2*(16-2*i)/17)*180/Math.PI)];
export function mobileOrbitAngles({width,labelWidth,insetX,gap=8}) {
  const rx=width/2-insetX;
  return 2*rx*Math.sqrt(1-.78**2)>=labelWidth+gap?mobileAngles:narrowMobileAngles;
}
export function requiredMobileOrbitHeight({width,labelWidth,labelHeight,insetX,insetY,gap=8}) {
  const rx=width/2-insetX;
  const angles=mobileOrbitAngles({width,labelWidth,insetX,gap});
  let ry=200;
  for(let i=0;i<angles.length;i++) for(let j=i+1;j<angles.length;j++) {
    const a=angles[i]*Math.PI/180,b=angles[j]*Math.PI/180;
    if(Math.abs(rx*(Math.sin(a)-Math.sin(b)))<labelWidth+gap) {
      const vertical=Math.abs(Math.cos(a)-Math.cos(b));
      if(vertical<1e-9)throw new RangeError('The mobile title labels are too wide');
      ry=Math.max(ry,(labelHeight+gap)/vertical);
    }
  }
  return Math.ceil(2*(ry+insetY));
}
export function installOrbitLayout({stage,center,nav,win=window,ResizeObserverClass=globalThis.ResizeObserver}) {
  let frame=0,lastHeight=null,lastMobile=null,lastLabelHeight=null;
  function update() {
    frame=0;
    const mobile=win.innerWidth<980;
    if(mobile!==lastMobile){stage.style.removeProperty(mobile?'--orbit-stage-height':'--orbit-nav-height');lastHeight=null;lastMobile=mobile;}
    const links=[...nav.querySelectorAll('a')];
    const selected=Math.max(0,links.findIndex(el=>el.hasAttribute('aria-current')));
    const styles=win.getComputedStyle(stage),labels=links.map(el=>el.getBoundingClientRect());
    if(!labels.length)return;
    const panel=center.getBoundingClientRect();
    const measure={width:stage.getBoundingClientRect().width,panelWidth:mobile?0:panel.width,panelHeight:mobile?0:panel.height,
      labelWidth:Math.max(...labels.map(r=>r.width)),labelHeight:Math.max(...labels.map(r=>r.height)),labelCount:labels.length,
      insetX:parseFloat(styles.getPropertyValue('--orbit-inset-x')),insetY:parseFloat(styles.getPropertyValue('--orbit-inset-y')),minHeight:760};
    if(measure.labelHeight!==lastLabelHeight){stage.style.setProperty('--orbit-label-height', `${measure.labelHeight}px`);lastLabelHeight=measure.labelHeight;}
    if(mobile){const angles=mobileOrbitAngles(measure);links.forEach((el,i)=>el.style.setProperty('--mobile-slot',`${angles[(i-selected+links.length)%links.length]}deg`));}
    const height=mobile?requiredMobileOrbitHeight(measure):requiredOrbitHeight(measure);
    // Width determines the panel wrapping; changing only stage height cannot feed back into it.
    if(height!==lastHeight){stage.style.setProperty(mobile?'--orbit-nav-height':'--orbit-stage-height',`${height}px`);lastHeight=height;}
  }
  function schedule(){if(!frame)frame=win.requestAnimationFrame(update);}
  const observer=ResizeObserverClass?new ResizeObserverClass(schedule):null;
  observer?.observe(center);observer?.observe(stage);
  win.addEventListener('resize',schedule);
  win.addEventListener('hashchange',schedule);
  win.addEventListener('languagechange',schedule);
  win.addEventListener('activitiesready',schedule);
  for(const type of ['extremecompletion','extremeanswerreveal','branchcompletion','storage','focus'])win.addEventListener(type,schedule);
  // Mutation observation also supports browsers without ResizeObserver and catches disclosures.
  const mutations=win.MutationObserver?new win.MutationObserver(schedule):null;
  mutations?.observe(center,{subtree:true,childList:true,characterData:true,attributes:true});
  // Crown/title changes affect the measured label box; ignore our own slot styles.
  mutations?.observe(nav,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden']});
  center.ownerDocument?.fonts?.ready.then(schedule);
  update();
  if (typeof document !== 'undefined' && document.documentElement?.dataset) delete document.documentElement.dataset.orbitPending;
  return {update,disconnect(){observer?.disconnect();mutations?.disconnect();win.cancelAnimationFrame(frame);for(const type of ['resize','hashchange','languagechange','activitiesready','extremecompletion','extremeanswerreveal','branchcompletion','storage','focus'])win.removeEventListener(type,schedule);}};
}
if(typeof document!=='undefined') {
  const stage=document.querySelector('.orbit-stage'),center=document.getElementById('activity-center'),nav=document.getElementById('activity-orbit');
  if(stage&&center&&nav)installOrbitLayout({stage,center,nav});
}
