/** Fixed rules: seats 1–72, clockwise, first count at 1, every third rests. */
export const JOSEPHUS_KEY='qidolab-chili-ring-v1';
export function chiliState(steps=0){
 if(!Number.isInteger(steps)||steps<0||steps>71)throw new RangeError('Steps must be 0–71');
 const alive=Array.from({length:72},(_,i)=>i+1),eaten=[];let cursor=0;
 for(let i=0;i<steps;i++){cursor=(cursor+2)%alive.length;eaten.push(alive.splice(cursor,1)[0]);cursor%=alive.length;}
 return {alive,eaten,steps,done:alive.length===1,nextStart:alive[cursor],last:eaten.at(-1)??null,winner:alive.length===1?alive[0]:null};
}
export function chiliWinner(n,k){if(!Number.isInteger(n)||n<1||n>10000||!Number.isInteger(k)||k<1||k>10000)throw new RangeError('Invalid ring');let seat=0;for(let size=2;size<=n;size++)seat=(seat+k)%size;return seat+1;}
