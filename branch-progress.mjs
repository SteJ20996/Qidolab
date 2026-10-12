import {visibleActivities} from './catalog.mjs';
import {branchKey, validBranch, BRANCH_ANSWERS} from './branch-engine.mjs';
export const branchCompletionKey=id=>`qidolab-branch-completed-${id}-v1`;
export function hasCompletedBranchRecord(id,state) {
  if(!validBranch(id,state))return false;
  return [...state.attempts,state.active].some(attempt=>attempt?.evidence && attempt.reviews.includes(BRANCH_ANSWERS[id]));
}
// Independent write-once facts survive replay, resets and concurrent tabs.
export function createBranchCompletionStore(storage=()=>localStorage) {
  const completed=new Set();
  function refresh() {
    const before=completed.size;
    try {
      const target=storage();
      for(const id of visibleActivities){
        if(target.getItem(branchCompletionKey(id))==='1')completed.add(id);
        else try {if(hasCompletedBranchRecord(id,JSON.parse(target.getItem(branchKey(id)))))completed.add(id);}catch{}
      }
      for(const id of completed)try{target.setItem(branchCompletionKey(id),'1');}catch{}
    }catch{}
    return before!==completed.size;
  }
  refresh();
  return {refresh,has:id=>completed.has(id),values:()=>visibleActivities.filter(id=>completed.has(id)),mark(id){
    if(!visibleActivities.includes(id))throw new RangeError('Unknown activity');
    const existed=completed.has(id);completed.add(id);refresh();return !existed;
  }};
}
export const branchCompletion=createBranchCompletionStore();
export function markBranchCompleted(id) {
  const changed=branchCompletion.mark(id);
  if(changed && typeof window!=='undefined')window.dispatchEvent(new CustomEvent('branchcompletion',{detail:{id}}));
  return changed;
}
