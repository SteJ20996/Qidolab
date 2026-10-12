// Local descriptive records: choices before and after evidence, never trait scores.
export const BRANCH_CHOICES = Object.freeze({water:3,lights:3,coins:3,numbers:3,clock:3,tiles:3,sums:4,bridge:3,takeaway:5,path:3,search:4,logic:3,probability:4,sorting:3,schedule:3,coloring:3,fractions:3,reflection:4});
export const BRANCH_ANSWERS = Object.freeze({water:1,lights:0,coins:1,numbers:1,clock:0,tiles:1,sums:1,bridge:1,takeaway:1,path:1,search:1,logic:1,probability:1,sorting:1,schedule:1,coloring:1,fractions:1,reflection:1});
export const branchKey=id=>`qidolab-branch-${id}-${id==='reflection'?'v3':id==='search'?'v2':'v1'}`;
export function freshBranch() {return {version:1,attempts:[],active:null};}
function validChoice(id,value) {return Number.isInteger(value) && value>=0 && value<BRANCH_CHOICES[id];}
const dense=value=>Array.isArray(value) && Array.from({length:value.length},(_,i)=>Object.hasOwn(value,i)).every(Boolean);
export function validBranch(id,state) {
  if (!Object.hasOwn(BRANCH_CHOICES,id) || !state || state.version!==1 || !dense(state.attempts) || state.attempts.length>20) return false;
  const validAttempt=a=>a && validChoice(id,a.prediction) && typeof a.evidence==='boolean' && dense(a.reviews) && a.reviews.length<=20 && a.reviews.every(x=>validChoice(id,x)) && (!a.reviews.length || a.evidence);
  return state.attempts.every(validAttempt) && (state.active===null || validAttempt(state.active));
}
export function predictBranch(id,state,choice) {
  if (!validBranch(id,state) || !validChoice(id,choice)) throw new RangeError('Invalid prediction');
  if (state.active) throw new RangeError('A prediction is already recorded');
  return {...state,active:{prediction:choice,evidence:false,reviews:[]}};
}
export function inspectBranch(id,state) {
  if (!validBranch(id,state) || !state.active) throw new RangeError('Record a prediction first');
  return {...state,active:{...state.active,evidence:true}};
}
export function reviewBranch(id,state,choice) {
  if (!validBranch(id,state) || !state.active?.evidence || !validChoice(id,choice)) throw new RangeError('Inspect evidence before reviewing');
  return {...state,active:{...state.active,reviews:[...state.active.reviews,choice].slice(-20)}};
}
export function restartBranch(id,state) {
  if (!validBranch(id,state)) throw new RangeError('Invalid record');
  return {version:1,attempts:state.active?[...state.attempts,state.active].slice(-20):state.attempts,active:null};
}
export function branchObservation(id,attempt) {
  if (!attempt) return {reviewed:false};
  const last=attempt.reviews.at(-1);
  return {reviewed:last!==undefined,changed:last!==undefined && last!==attempt.prediction,consistentWithEvidence:last===BRANCH_ANSWERS[id]};
}
