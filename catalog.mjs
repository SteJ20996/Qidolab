// Keep all eighteen original activities, routes, and saves.
export const visibleActivities = Object.freeze(['water','lights','coins','numbers','clock','tiles','sums','bridge','takeaway','path','search','logic','probability','sorting','schedule','coloring','fractions','reflection']);
export function activityRoute(hash) {
  const [parent, next, ...extra] = String(hash).replace(/^#/, '').split('/');
  if (!visibleActivities.includes(parent) || extra.length || next && !['next','extreme'].includes(next)) return {parent:'water', deeper:false};
  if(next==='extreme')return {parent,deeper:true,extreme:true};
  return {parent, deeper:next === 'next'};
}
