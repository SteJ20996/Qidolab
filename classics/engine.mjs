// Original implementations of well-known puzzle mechanics. No borrowed prose or art.
export const FOX_DAYS = {4:4,5:6,6:8};
export function foxEscape(holes, plan){
  if(![4,5,6].includes(holes) || !Array.isArray(plan) || plan.some(n=>!Number.isInteger(n)||n<1||n>holes))throw new Error('Invalid search plan');
  // Keep one witness per possible position; this checks every allowed fox path.
  let paths=new Map(Array.from({length:holes},(_,i)=>[i+1,[i+1]]));
  for(let day=0;day<plan.length;day++){
    paths.delete(plan[day]);
    if(!paths.size)return null;
    if(day===plan.length-1)return [...paths.values()][0];
    const next=new Map();
    for(const [position,path] of paths){
      for(const neighbor of [position-1,position+1])if(neighbor>=1&&neighbor<=holes&&!next.has(neighbor))next.set(neighbor,[...path,neighbor]);
    }
    paths=next;
  }
  return [...paths.values()][0]??null;
}

export const RIVER_ITEMS=['wolf','goat','cabbage'];
export const initialRiver=()=>({boat:0,positions:{wolf:0,goat:0,cabbage:0}});
export function riverMove(state,item=null){
  if(item!==null&&!RIVER_ITEMS.includes(item))return null;
  if(item!==null&&state.positions[item]!==state.boat)return null;
  const next={boat:1-state.boat,positions:{...state.positions}};
  if(item!==null)next.positions[item]=next.boat;
  const unattended=1-next.boat,p=next.positions;
  if((p.wolf===unattended&&p.goat===unattended)||(p.goat===unattended&&p.cabbage===unattended))return null;
  return next;
}
export const riverWon=s=>s.boat===1&&RIVER_ITEMS.every(item=>s.positions[item]===1);

export const initialHanoi=n=>[Array.from({length:n},(_,i)=>n-i),[],[]];
export function hanoiMove(pegs,from,to){
  if(![0,1,2].includes(from)||![0,1,2].includes(to)||from===to||!pegs[from]?.length)return null;
  const moving=pegs[from].at(-1),target=pegs[to].at(-1);
  if(target!==undefined&&target<moving)return null;
  const next=pegs.map(peg=>[...peg]);next[from].pop();next[to].push(moving);return next;
}
export const hanoiWon=(pegs,n)=>pegs[2].length===n;

export const initialQueens=n=>Array(n).fill(-1);
export function queenConflicts(positions){
  const rows=new Set();
  for(let a=0;a<positions.length;a++)for(let b=a+1;b<positions.length;b++){
    if(positions[a]<0||positions[b]<0)continue;
    if(positions[a]===positions[b]||Math.abs(positions[a]-positions[b])===b-a){rows.add(a);rows.add(b);}
  }
  return rows;
}
export const queensWon=p=>p.every(c=>c>=0)&&queenConflicts(p).size===0;
