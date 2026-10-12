import {visibleActivities} from './catalog.mjs';
export const crownKey=id=>`qidolab-extreme-completed-${id}-v1`;
export const answerViewedKey=id=>`qidolab-extreme-answer-viewed-${id}-v1`;
// Completion and answer exposure are independent, monotonic facts. A draft,
// replay, reset or older tab must never turn an exposed answer into a solid crown.
function createFactStore(key,storage){const facts=new Set();const refresh=()=>{try{const s=storage();for(const id of visibleActivities)if(s.getItem(key(id))==='1')facts.add(id);for(const id of facts)try{s.setItem(key(id),'1');}catch{}}catch{}};refresh();return {refresh,has:id=>facts.has(id),values:()=>visibleActivities.filter(id=>facts.has(id)),mark(id){if(!visibleActivities.includes(id))throw new RangeError('Unknown activity');const fresh=!facts.has(id);facts.add(id);refresh();return fresh;}};}
export const createCrownStore=(storage=()=>localStorage)=>createFactStore(crownKey,storage);
export const createAnswerViewedStore=(storage=()=>localStorage)=>createFactStore(answerViewedKey,storage);
export const crownCompletion=createCrownStore();
export const answerViewed=createAnswerViewedStore();
export function markCrowned(id){answerViewed.refresh();const changed=crownCompletion.mark(id);if(changed&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent('extremecompletion',{detail:{id}}));return changed;}
export function markAnswerViewed(id){const changed=answerViewed.mark(id);if(changed&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent('extremeanswerreveal',{detail:{id}}));return changed;}
