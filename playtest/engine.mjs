// Independently implemented arithmetic prototypes. All states use exact integers.
export const LIMIT = 99;
export function apply(value, op) {
  if (!Number.isInteger(value) || !op || !Number.isInteger(op.n)) return null;
  let next;
  if (op.kind === '+') next = value + op.n;
  else if (op.kind === '-') next = value - op.n;
  else if (op.kind === '*') next = value * op.n;
  else if (op.kind === '/' && op.n !== 0 && value % op.n === 0) next = value / op.n;
  else return null;
  return Number.isInteger(next) && next >= 0 && next <= LIMIT ? next : null;
}
export const sameOp = (a,b) => Boolean(a && b && a.kind === b.kind && a.n === b.n);
export const opText = op => ({'*':'×','/':'÷','-':'−','+':'+'}[op.kind] || '?') + op.n;
export function trace(start, ops) {
  const values = [start];
  for (const op of ops) { const prev = values.at(-1); values.push(prev === null ? null : apply(prev,op)); }
  return values;
}
export function patchState(puzzle, repair = null) {
  const valid = repair && Number.isInteger(repair.slot) && Number.isInteger(repair.choice)
    && repair.slot >= 0 && repair.slot < puzzle.ops.length
    && repair.choice >= 0 && repair.choice < puzzle.choices.length;
  const changed = Boolean(valid && !sameOp(puzzle.ops[repair.slot],puzzle.choices[repair.choice]));
  const ops = puzzle.ops.map((op,i) => changed && i === repair.slot ? puzzle.choices[repair.choice] : op);
  const paths = puzzle.starts.map(start => trace(start,ops));
  const legal = paths.every(path=>path.every(n=>n!==null));
  const checkpoint = paths[puzzle.check.lane][puzzle.check.step] === puzzle.check.value;
  const endpoints = paths.every((path,i)=>path.at(-1) === puzzle.goals[i]);
  return {ops,paths,changed,legal,checkpoint,endpoints,won:changed && legal && checkpoint && endpoints};
}
export function solvePatch(puzzle, checkpoints=true) {
  const out=[];
  puzzle.ops.forEach((_,slot)=>puzzle.choices.forEach((_,choice)=>{
    const result=patchState(puzzle,{slot,choice});
    if(result.changed && result.legal && result.endpoints && (!checkpoints || result.checkpoint))out.push({slot,choice});
  }));
  return out;
}
export function initialBorrow(puzzle) { return {value:puzzle.start,borrowed:false,returned:false,used:[],moves:[]}; }
export function borrowStep(puzzle, state, action) {
  if (!state || !action) return null;
  let op;
  if(action.type==='borrow' && !state.borrowed) op={kind:'+',n:puzzle.loan};
  else if(action.type==='return' && state.borrowed && !state.returned) op={kind:'-',n:puzzle.loan};
  else if(action.type==='card' && Number.isInteger(action.index) && action.index>=0 && action.index<puzzle.cards.length && !state.used.includes(action.index)) op=puzzle.cards[action.index];
  else return null;
  const value=apply(state.value,op); if(value===null)return null;
  return {value,borrowed:state.borrowed || action.type==='borrow',returned:state.returned || action.type==='return',used:action.type==='card'?[...state.used,action.index]:[...state.used],moves:[...state.moves,{...action}]};
}
export function replayBorrow(puzzle, moves=[]) {
  let state=initialBorrow(puzzle);
  for(const move of moves){const next=borrowStep(puzzle,state,move);if(!next)break;state=next;}
  return state;
}
export function borrowWon(puzzle,state){return state.value===puzzle.goal && state.borrowed && state.returned && state.used.length===puzzle.cards.length;}
export function solveBorrow(puzzle, state=initialBorrow(puzzle)) {
  const routes=[];
  function visit(s,path){
    if(borrowWon(puzzle,s)){routes.push(path);return;}
    for(const action of [{type:'borrow'},{type:'return'},...puzzle.cards.map((_,index)=>({type:'card',index}))]){
      const next=borrowStep(puzzle,s,action);if(next)visit(next,[...path,action]);
    }
  }
  visit(state,[]);return routes;
}
