'use strict';
/* Hiệu ứng chỉ là trình diễn. Không bao giờ sửa trạng thái trận đấu. */
const BattleFX = (() => {
  const layer = () => document.getElementById('battle-fx-layer');
  const enabled = () => !document.documentElement.classList.contains('effects-off') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const center = (el) => {
    if (!el) return {x:innerWidth/2,y:innerHeight*.43};
    const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};
  };
  const player = id => document.querySelector('.seat[data-player-id="'+id+'"]');
  const removeSoon = (el,ms) => window.setTimeout(()=>el.remove(),ms);
  function playCard({playerId, targetId, handIndex, label, icon}) {
    if (!enabled() || !layer() || !document.querySelector('.stage')) return;
    const from=center(playerId===0 ? document.querySelector('.floating-hand .gc[data-hand-index="'+handIndex+'"]') : player(playerId));
    const to=center(targetId==null ? document.querySelector('.mid') : player(targetId));
    const el=document.createElement('div');el.className='fx-card';
    const ico=document.createElement('span');ico.textContent=icon||'✦';
    const name=document.createElement('b');name.textContent=label||'Bài';
    el.append(ico,name);el.style.left=(from.x-45)+'px';el.style.top=(from.y-66)+'px';layer().appendChild(el);
    const dx=to.x-from.x,dy=to.y-from.y;
    const anim=el.animate([
      {transform:'translate3d(0,0,0) rotate(-13deg) scale(.82)',opacity:.85,offset:0},
      {transform:`translate3d(${dx*.55}px,${dy*.55-100}px,0) rotate(6deg) scale(1.24)`,opacity:1,offset:.58},
      {transform:`translate3d(${dx}px,${dy}px,0) rotate(0deg) scale(.64)`,opacity:0,offset:1}
    ],{duration:720,easing:'cubic-bezier(.2,.65,.24,1)',fill:'forwards'});
    anim.onfinish=()=>el.remove();removeSoon(el,1000);
  }
  function floatText(id,txt,kind){
    if(!enabled()||!layer())return;
    const p=center(player(id));const el=document.createElement('div');el.className=kind;
    el.textContent=txt;el.style.left=p.x+'px';el.style.top=(p.y-20)+'px';layer().appendChild(el);removeSoon(el,1050);
  }
  return {
    playCard,
    damage:(id,amount)=>floatText(id,'−'+amount+' ♥','fx-damage'),
    reveal:(id,name)=>floatText(id,'✦ '+name+' ✦','fx-reveal')
  };
})();

window.BattleFX = BattleFX;