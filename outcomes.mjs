// Live outcomes differ from the monotonic completion check. A fresh successful
// transition may invite another exploration even after a previous completion.
const outcomes = new Map();
export function reportOutcome(id, successful) {
  const before=outcomes.get(id) || {successful:false,serial:0};
  const next={successful:Boolean(successful),serial:before.serial + (successful && !before.successful ? 1 : 0)};
  outcomes.set(id,next);
  if (next.successful !== before.successful && typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent('activityoutcome',{detail:{id,...next}}));
}
export const currentOutcome=id=>outcomes.get(id) || {successful:false,serial:0};
