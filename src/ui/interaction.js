'use strict';
/* Tương tác nâng cao: phím tắt, nghiêng bài theo chuột, bật/tắt hiệu ứng. */
function toggleBattleEffects(){
  document.documentElement.classList.toggle('effects-off');
  render();
}
document.addEventListener('keydown',e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
  if(e.key==='Escape'){
    if(showHeroes){closeGallery();e.preventDefault()}
    else if(showSkillsFor!==null){closeSkills();e.preventDefault()}
    else if(showRules){toggleRules();e.preventDefault()}
    return;
  }
  if(showHeroes||showSkillsFor!==null||showRules||!UI||cur!==0)return;
  if(/^[1-9]$/.test(e.key)){
    const i=Number(e.key)-1;if(UI.ok&&i<P[0].hand.length&&UI.ok(i)){pickCard(i);e.preventDefault()}
  }
  if(e.key.toLowerCase()==='e'){
    const i=UI.btns.findIndex(b=>b.t==='Kết thúc lượt');if(i>=0){pickBtn(i);e.preventDefault()}
  }
});
document.addEventListener('pointermove',e=>{
  if(document.documentElement.classList.contains('effects-off'))return;
  const card=e.target.closest?.('.floating-hand .gc');if(!card)return;
  const r=card.getBoundingClientRect();
  const nx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));
  const ny=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));
  card.style.setProperty('--hover-ry',(nx*7).toFixed(2)+'deg');
  card.style.setProperty('--hover-rx',(-ny*5).toFixed(2)+'deg');
});
document.addEventListener('pointerout',e=>{
  const card=e.target.closest?.('.floating-hand .gc');
  if(card&&!card.contains(e.relatedTarget)){
    card.style.removeProperty('--hover-ry');card.style.removeProperty('--hover-rx');
  }
});