'use strict';
let zh=0,kh=0,showLog=false,rd=1;
let P=[],D=[],disc=[],UI=null,lg=[],over=null,used=0,cur=-1,N=0,setup=null,showRules=false,speed=380,showHeroes=false,showSkillsFor=null,heroFilter='Tất cả',heroQuery='',heroSelected=0;
const ACTIVE_SKILLS=['nhanduc','chehanh','capcuu','qixi','khonhuc'];
const SKILL_TIMING={gianhung:'Bị động · khi mất máu',phankich:'Phản ứng · khi mất máu',cuongliet:'Phản ứng · khi mất máu',lacthan:'Bị động · đầu lượt',nhanduc:'Chủ động · một lần mỗi lượt + bị động với Đào',vothanh:'Bị động · khi Sát bị né',baohao:'Bị động · khi ra Sát',khongthanh:'Bị động · phòng thủ',longdam:'Bị động · chuyển Sát/Thiểm',lietcung:'Bị động · khi ra Sát',anhtu:'Bị động · đầu lượt',chehanh:'Chủ động · một lần mỗi lượt',thienhuong:'Phản ứng · khi mất máu',vovsong:'Bị động · khi ra Sát',benguyet:'Bị động · cuối lượt',capcuu:'Chủ động · một lần mỗi lượt + bị động với Đào',yiji:'Phản ứng · khi mất máu',tuxi:'Đầu lượt · chọn người lấy bài',tieqi:'Bị động · khi ra Sát',qixi:'Chủ động · một lần mỗi lượt + bị động với Quá Hà',khonhuc:'Chủ động · một lần mỗi lượt',qianxun:'Bị động · phòng thủ',luanshe:'Bị động · khi dùng Vạn Tiễn',jiuchi:'Bị động · khi dùng Quyết Đấu',xiongyi:'Bị động · đầu lượt'};
for(const [id,skill] of Object.entries(EXTRA_SKILLS))SKILL_TIMING[id]=skill[2]+' · mô phỏng';
const rnd=n=>Math.floor(Math.random()*n);
const shuf=a=>{for(let i=a.length;i-->1;){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
let gid=0;const sleep=async ms=>{const g=gid;await new Promise(r=>setTimeout(r,ms));while(g===gid&&(showHeroes||showSkillsFor!==null||showRules))await new Promise(r=>setTimeout(r,75));if(g!==gid)throw 'abort'};
const alive=()=>P.filter(p=>p.alive);
const kd=p=>p.k||p.g[0].k;
const has=(p,id)=>p.g.some(g=>g.rev&&g.s===id);
const flip=p=>p.g.filter(g=>!g.rev&&(!p.k||g.k===p.k));
function drawc(p,n){for(let i=0;i<n;i++){if(!D.length){D=shuf(disc);disc=[]}if(D.length)p.hand.push(D.pop())}}
function say(m){lg.unshift(m);if(lg.length>60)lg.pop();render()}
function choose(msg,ok,btns){const g=gid;return new Promise((res,rej)=>{UI={msg,ok,btns,res,rej,targetMode:msg.startsWith('Chọn mục tiêu')};render();if(g!==gid)rej('abort')})}
function pickCard(i){if(UI&&UI.ok&&UI.ok(i)){const r=UI.res;UI=null;r({c:i});render()}}
function pickBtn(k){if(!UI||!UI.btns[k])return;const r=UI.res,v=UI.btns[k].v;UI=null;r({b:v});render()}
function reveal(p,g){if(!flip(p).includes(g))return false;if(!p.k)p.k=g.k;g.rev=true;say('🔓 '+p.name+' lật tướng '+g.n+' ('+g.k+')');window.BattleFX?.reveal(p.id,g.n);return true}
async function skillOn(p,id){
 const g=p.g.find(x=>x.s===id);if(!g)return false;if(g.rev)return true;if(!flip(p).includes(g))return false;
 let yes;
 if(p.human){const r=await choose('Lật tướng '+g.n+' để dùng kỹ năng?',null,[{t:'Lật tướng',v:1},{t:'Không lật',v:0}]);yes=r.b===1}
 else yes=Math.random()<.7;
 if(yes)reveal(p,g);return yes}
const match=(p,t,c)=>c===t||(has(p,'longdam')&&((t==='sat'&&c==='thieu')||(t==='thieu'&&c==='sat')));
const cardCount=p=>p.hand.length+Object.values(p.eq).filter(Boolean).length;
function distance(p,t){const seats=alive(),a=seats.indexOf(p),b=seats.indexOf(t),d=Math.abs(a-b);return Math.max(1,Math.min(d,seats.length-d)+(t.eq.plus?1:0)-(p.eq.minus?1:0))}
const range=p=>(EQUIP[p.eq.weapon]?.range||1)+(has(p,'tienphong')?1:0);
function targets(p,c){return alive().filter(t=>t!==p&&!(c==='sat'&&(distance(p,t)>range(p)||has(t,'khongthanh')&&!t.hand.length))&&!(c==='steal'&&(distance(p,t)>1||has(t,'qianxun')))&&!((c==='steal'||c==='dis')&&!cardCount(t)))}
function canUse(p,c){if(!c||!p.alive)return false;if(EQUIP[c])return true;if(c==='wuxie')return false;if(c==='sat'||(c==='thieu'&&has(p,'longdam')))return(used<(has(p,'cuongcong')?2:1)||has(p,'baohao')||p.eq.weapon==='crossbow')&&targets(p,'sat').length>0;if(c==='thieu')return false;if(c==='dao')return p.hp<p.max;if(TG.includes(c))return targets(p,c).length>0;return true}
function loseCard(p,keep){const opts=[...p.hand.map((c,i)=>({c,i})),...Object.entries(p.eq).filter(([,c])=>c).map(([slot,c])=>({c,slot}))];if(!opts.length)return null;
 const q=opts[rnd(opts.length)];if(q.slot)p.eq[q.slot]=null;else p.hand.splice(q.i,1);if(!keep)disc.push(q.c);return q.c}
async function need(p,t,n,why){
 if(!p.alive)return false;
 if(!p.human){const ix=[];p.hand.forEach((c,i)=>match(p,t,c)&&ix.push(i));if(ix.length<n)return false;ix.slice(0,n).reverse().forEach(i=>disc.push(p.hand.splice(i,1)[0]));say(p.name+' ra '+C[t][0]+(n>1?' x'+n:''));return true}
 for(let k=0;k<n;k++){const r=await choose(why+' Ra '+C[t][0]+' ('+(k+1)+'/'+n+')?',i=>match(p,t,p.hand[i]),[{t:'Không ra',v:0}]);if(r.b!==undefined)return false;disc.push(p.hand.splice(r.c,1)[0])}
 return true}
async function counterTrick(src,c,t){let stopped=false;
 for(let chain=0;chain<8;chain++){let reacted=false;
  for(let j=1;j<=N;j++){const p=P[(src.id+j)%N];if(!p.alive||!p.hand.includes('wuxie'))continue;
   const harmful=c!=='draw',enemy=t.k&&p.k&&t.k!==p.k,ally=t===p||(t.k&&p.k&&t.k===p.k);
   const want=harmful?(stopped?!!enemy:!!ally):(stopped?p===t||!!ally:p!==t&&!!enemy);
   let play=false;
   if(p.human){if(!want)continue;const r=await choose('Dùng Vô hiệu hóa '+(stopped?'để khôi phục':'để chặn')+' '+C[c][0]+' '+(t===src?'của '+src.name:'nhắm '+t.name)+'?',null,[{t:'Dùng Vô hiệu hóa',v:1},{t:'Bỏ qua',v:0}]);play=r.b===1}
   else play=want&&Math.random()<.78;
   if(play){disc.push(p.hand.splice(p.hand.indexOf('wuxie'),1)[0]);stopped=!stopped;say('☯ '+p.name+' dùng Vô hiệu hóa — '+(stopped?'chặn':'khôi phục')+' '+C[c][0]);reacted=true;break}
  }
  if(!reacted)break;
 }
 return stopped}
async function rescue(t){let tries=0;
 while(t.alive&&t.hp<=0&&tries++<18){let saved=false;
  const order=[t,...P.filter(p=>p!==t&&p.alive)];
  for(const p of order){if(!p.alive||!p.hand.includes('dao'))continue;
   let yes;if(p.human){const r=await choose((p===t?'Bạn':'Đồng đội '+t.name)+' đang hấp hối ('+t.hp+' máu). Dùng Đào cứu '+(p===t?'mình':t.name)+'?',i=>p.hand[i]==='dao',[{t:'Không cứu',v:0}]);yes=r.c!==undefined;if(yes){disc.push(p.hand.splice(r.c,1)[0])}}
   else{yes=p===t||(p.k&&t.k&&p.k===t.k&&Math.random()<.93);if(yes)disc.push(p.hand.splice(p.hand.indexOf('dao'),1)[0])}
   if(yes){t.hp=Math.min(t.max,t.hp+((p===t&&(has(p,'capcuu')||has(p,'cuuho')))?2:1));say('🍑 '+p.name+' dùng Đào cứu '+t.name);if(has(p,'nhanduc'))drawc(p,1);saved=true;break}
  }
  if(!saved)break;
 }
 return t.hp>0}
async function hurt(src,t,n=1){
 if(!t.alive)return;
 if(n>0&&has(t,'thietcot')&&!t.guardUsed){t.guardUsed=true;n=Math.max(0,n-1);say('🛡 '+t.name+' dùng Thiết Cốt giảm 1 sát thương')}
 if(n===0)return;
 t.hp-=n;say(t.name+' mất '+n+' máu ('+Math.max(t.hp,0)+'/'+t.max+')');window.BattleFX?.damage(t.id,n);
 if(t.hp>0){
  if(await skillOn(t,'gianhung')){drawc(t,1);say(t.name+' rút 1 lá (Gian Hùng)')}
  if(await skillOn(t,'yiji')){drawc(t,2);say(t.name+' rút 2 lá (Di Kế)')}
  if(t.hand.length<3&&await skillOn(t,'thienhuong')){drawc(t,3-t.hand.length);say(t.name+' bổ sung bài lên 3 lá (Thiên Hương)')}
  if(has(t,'tamtinh')){drawc(t,1);say(t.name+' rút 1 lá (Tâm Tĩnh)')}
  if(src&&src.alive&&src!==t&&src.hand.length&&await skillOn(t,'phankich')){t.hand.push(src.hand.splice(rnd(src.hand.length),1)[0]);say(t.name+' lấy 1 bài của '+src.name+' (Phản Kích)')}
  if(src&&src.alive&&src!==t&&has(t,'baothu')&&cardCount(src)){loseCard(src,false);say(src.name+' bỏ 1 bài (Báo Thù)')}
  if(src&&src.alive&&src!==t&&await skillOn(t,'cuongliet')){if(cardCount(src)){loseCard(src,false);say(src.name+' bỏ 1 bài (Cương Liệt)')}else await hurt(t,src)}}
 if(t.hp<=0){if(!(await rescue(t)))die(t,src)}}
function die(t,src){
 t.alive=false;disc.push(...t.hand);t.hand=[];t.g.forEach(g=>g.rev=true);t.k=kd(t);
 Object.values(t.eq).forEach(c=>{if(c)disc.push(c)});t.eq={weapon:null,armor:null,plus:null,minus:null};
 say('☠ '+t.name+' ('+t.g[0].n+' + '+t.g[1].n+', nước '+kd(t)+') bị loại');
 if(src&&src.alive&&src!==t){if(kd(src)!==kd(t)){drawc(src,3);say(src.name+' rút 3 lá vì hạ người khác nước')}else{disc.push(...src.hand);src.hand=[];say(src.name+' giết người cùng nước nên bỏ hết bài')}}
 const ks=[...new Set(alive().map(kd))];if(ks.length<=1)throw ks[0]||'Hòa'}
async function use(p,i,tid){
 const preview=p.hand[i];if(!preview)return;
 window.BattleFX?.playCard({playerId:p.id,targetId:tid,handIndex:i,label:C[preview]?.[0],icon:C[preview]?.[1]});
 const raw=p.hand.splice(i,1)[0];if(!raw)return;
 const c=raw==='thieu'&&has(p,'longdam')?'sat':raw;
 const t=tid!=null?P[tid]:null;
 if(EQUIP[c]){const slot=EQUIP[c].slot;if(p.eq[slot])disc.push(p.eq[slot]);p.eq[slot]=c;say('⚙ '+p.name+' trang bị '+C[c][0]);return}
 disc.push(raw);
 say(p.name+' dùng '+(raw!==c?'Thiểm hóa Sát (Long Đảm)':C[c][0])+(t?' lên '+t.name:''));
 if(c==='sat'){used++;const n=has(p,'vovsong')?2:1;
  const pierce=(has(p,'lietcung')&&t.hand.length<=2)||(has(p,'tieqi')&&Math.random()<.35)||(has(p,'xuyengiap')&&Math.random()<.30);
  let shielded=false,remain=n;
  if(!pierce&&has(t,'thietve')&&Math.random()<.35){say('🛡 '+t.name+' né được Sát nhờ Thiết Vệ');shielded=true}
  else if(!pierce&&t.eq.armor==='shield'&&Math.random()<.35){say('🛡 Nhân Vương Thuẫn của '+t.name+' chặn Sát');shielded=true}
  else if(!pierce&&t.eq.armor==='bagua'&&Math.random()<.45){say('☯ Bát Quái Trận giúp '+t.name+' né một lần Thiểm');remain--;shielded=remain===0}
  if(pierce)say('⚡ '+t.name+' không thể né đòn này');
  if(shielded)return;
  if(!pierce&&await need(t,'thieu',remain,p.name+' tấn công bạn!')){say(t.name+' né được');if(has(p,'vothanh')){drawc(p,1);say(p.name+' rút 1 lá (Võ Thánh)')}}
  else {const before=t.hp;await hurt(p,t);if(t.hp<before&&has(p,'lapcong')&&!p.skillUsed?.lapcong){p.skillUsed??={};p.skillUsed.lapcong=true;drawc(p,1);say(p.name+' rút 1 lá (Lập Công)')}}}
 else if(c==='dao'){p.hp=Math.min(p.max,p.hp+((has(p,'capcuu')||has(p,'cuuho'))?2:1));if(has(p,'nhanduc'))drawc(p,1)}
 else if(c==='draw'){if(!(await counterTrick(p,c,p)))drawc(p,2)}
 else if(c==='duel'){if(!(await counterTrick(p,c,t))){let a=t,b=p;while(a.alive&&b.alive){if(!(await need(a,'sat',1,'Quyết đấu với '+b.name+'!'))){await hurt(b,a);break}[a,b]=[b,a]}}}
 else if(c==='arrow'||c==='nam'){const ty=c==='arrow'?'thieu':'sat';for(let k=1;k<N;k++){const o=P[(p.id+k)%N];if(!o.alive)continue;if(await counterTrick(p,c,o))continue;if(!(await need(o,ty,1,C[c][0]+' của '+p.name+'!')))await hurt(p,o)}}
 else if(c==='steal'&&!await counterTrick(p,c,t)){const stolen=loseCard(t,true);if(stolen){p.hand.push(stolen);say(p.name+' lấy '+C[stolen][0]+' của '+t.name);if(has(p,'doatbai')&&!p.skillUsed?.doatbai){p.skillUsed.doatbai=true;drawc(p,1);say(p.name+' rút 1 lá (Đoạt Bài)')}}}
 else if(c==='dis'&&!await counterTrick(p,c,t)){if(loseCard(t,false)){say(t.name+' bị bỏ 1 bài');if(has(p,'doatbai')&&!p.skillUsed?.doatbai){p.skillUsed.doatbai=true;drawc(p,1);say(p.name+' rút 1 lá (Đoạt Bài)')}}}
 if(p.alive&&TRICK.includes(c)&&has(p,'quansu')&&!p.skillUsed?.quansu){p.skillUsed.quansu=true;drawc(p,1);say(p.name+' rút 1 lá (Quân Sư)')}
 if(p.alive&&c==='draw'&&has(p,'thuattoan')&&!p.skillUsed?.thuattoan){p.skillUsed.thuattoan=true;drawc(p,1);say(p.name+' rút 1 lá (Thuật Toán)')}
 if(p.alive&&((c==='dis'&&has(p,'qixi'))||(c==='arrow'&&has(p,'luanshe'))||(c==='duel'&&has(p,'jiuchi')))){drawc(p,1);say(p.name+' rút 1 lá nhờ kỹ năng')}
}
function pickT(p,c){const own=kd(p),ts=targets(p,c).filter(t=>!(t.k&&t.k===own));if(!ts.length)return null;
 const enemies=ts.filter(t=>t.k&&t.k!==own);if(enemies.length){enemies.sort((a,b)=>a.hp-b.hp);return enemies[rnd(Math.min(2,enemies.length))]}
 return Math.random()<.78?ts[rnd(ts.length)]:null}
function khoNhuc(p){return has(p,'khonhuc')&&p.hp>1&&!kh&&!p.skillUsed?.khonhuc}
async function doKho(p){kh=1;p.skillUsed??={};p.skillUsed.khonhuc=true;say(p.name+' dùng Khổ Nhục');await hurt(null,p);if(p.alive)drawc(p,2)}
function canSkill(p,id){
 if(!p?.alive||!ACTIVE_SKILLS.includes(id)||!has(p,id)||p.skillUsed?.[id])return false;
 if(id==='khonhuc')return khoNhuc(p);
 if(id==='chehanh')return !!p.hand.length&&!zh;
 if(id==='nhanduc')return !!p.hand.length&&alive().some(t=>t!==p);
 if(id==='capcuu')return !!p.hand.length&&alive().some(t=>t.hp<t.max);
 if(id==='qixi')return !!p.hand.length&&targets(p,'dis').length>0;
 return false
}
function skillTargets(p,id){if(id==='nhanduc')return alive().filter(t=>t!==p);if(id==='capcuu')return alive().filter(t=>t.hp<t.max);if(id==='qixi')return targets(p,'dis');return []}
async function executeSkill(p,id,t,cardIndex){
 if(!canSkill(p,id))return false;
 p.skillUsed??={};
 if(id==='khonhuc'){await doKho(p);return true}
 if(!Number.isInteger(cardIndex)||cardIndex<0||cardIndex>=p.hand.length)return false;
 if(id==='nhanduc'||id==='capcuu'||id==='qixi')if(!skillTargets(p,id).includes(t))return false;
 const card=p.hand.splice(cardIndex,1)[0];p.skillUsed[id]=true;
 if(id==='chehanh'){zh=1;disc.push(card);drawc(p,2);say('✨ '+p.name+' dùng Chế Hành: bỏ '+C[card][0]+', rút 2 lá')}
 else if(id==='nhanduc'){t.hand.push(card);drawc(p,1);say('✨ '+p.name+' dùng Nhân Đức: tặng '+C[card][0]+' cho '+t.name+', rút 1 lá')}
 else if(id==='capcuu'){disc.push(card);t.hp=Math.min(t.max,t.hp+1);say('✨ '+p.name+' dùng Cấp Cứu: hồi 1 máu cho '+t.name)}
 else if(id==='qixi'){disc.push(card);say('✨ '+p.name+' dùng Kỳ Tập lên '+t.name);if(!(await counterTrick(p,'dis',t))&&loseCard(t,false))say(t.name+' mất 1 lá bài vì Kỳ Tập')}
 return true
}
async function humanSkill(p,id){
 if(!canSkill(p,id))return;
 if(id==='khonhuc'){await executeSkill(p,id);return}
 let t=null;
 if(id!=='chehanh'){
  const q=await choose('Chọn mục tiêu cho kỹ năng '+G.find(g=>g[3]===id)[4].split(':')[0],null,[...skillTargets(p,id).map(x=>({t:x.name+' · '+(x.k||'Chưa lộ')+' · '+x.hp+'/'+x.max+'♥',v:x.id})),{t:'Hủy kỹ năng',v:-1}]);
  if(q.b===-1)return;t=P[q.b];if(!t||!t.alive)return
 }
 const q=await choose('Chọn một lá làm chi phí cho kỹ năng (sau khi chọn sẽ dùng ngay).',()=>true,[{t:'Hủy kỹ năng',v:-1}]);
 if(q.c===undefined)return;
 await executeSkill(p,id,t,q.c)
}
async function botSkills(p){
 if(canSkill(p,'capcuu')&&p.hp<p.max&&p.hand.length>1)await executeSkill(p,'capcuu',p,p.hand.findIndex(c=>c!=='dao')>=0?p.hand.findIndex(c=>c!=='dao'):0);
 if(canSkill(p,'nhanduc')&&p.hand.length>p.hp){const t=alive().find(x=>x!==p&&p.k&&x.k===p.k);if(t)await executeSkill(p,'nhanduc',t,0)}
 if(canSkill(p,'qixi')&&p.hand.length>2){const t=pickT(p,'dis');if(t){const i=p.hand.findIndex(c=>c!=='dao');if(i>=0)await executeSkill(p,'qixi',t,i)}}
}
async function drawPhase(p){
 let n=has(p,'anhtu')?3:2;
 if(has(p,'lacthan')&&p.hand.length<=2)n++;
 if(has(p,'xiongyi')&&p.hand.length<=p.hp)n++;
 if(has(p,'haucan')&&p.hand.length<=p.hp)n++;
 if(has(p,'khoiphuc')&&p.hp<=2&&p.hp<p.max){p.hp++;say('🌿 '+p.name+' hồi 1 máu (Khôi Phục)')}
 if(has(p,'tuxi')){let t=null;
  if(p.human){const ts=targets(p,'dis');if(ts.length){const q=await choose('Chọn mục tiêu cho Đột Tập (lấy 1 bài thay cho 1 lần rút).',null,[...ts.map(x=>({t:x.name+' · '+(x.k||'Chưa lộ')+' · '+cardCount(x)+' bài',v:x.id})),{t:'Bỏ qua Đột Tập',v:-1}]);if(q.b>=0)t=P[q.b]}}
  else t=pickT(p,'dis');
  if(t){const c=loseCard(t,true);if(c){p.hand.push(c);n=Math.max(1,n-1);say('⚡ '+p.name+' dùng Đột Tập lấy bài của '+t.name)}}}
 drawc(p,n);say(p.name+' rút '+n+' lá');
}
const handLimit=p=>Math.max(0,p.hp+(has(p,'binhtinh')?1:0));
async function bturn(p){
 await sleep(0);
 for(const g of p.g)if(!g.rev&&Math.random()<.72)reveal(p,g);
 await drawPhase(p);
 await botSkills(p);
 if(canSkill(p,'chehanh')&&p.hand.length>2)await executeSkill(p,'chehanh',null,p.hand.length-1);
 for(let k=0;k<20;k++){let did=false;
  if(khoNhuc(p)&&p.hp>=3&&p.hand.length<3){await sleep(P[0].alive?speed:70);await doKho(p);did=true}
  else for(const c of['dao','draw','crossbow','halberd','spear','bagua','shield','horseminus','horseplus','duel','sat','thieu','steal','dis','arrow','nam']){
   const i=p.hand.indexOf(c);if(i<0||!canUse(p,c))continue;
   if(EQUIP[c]&&p.eq[EQUIP[c].slot]){const old=p.eq[EQUIP[c].slot];if(old===c)continue;if(EQUIP[c].slot==='weapon'&&range(p)>=EQUIP[c].range&&c!=='crossbow')continue}
   if(c==='duel'&&!p.hand.some(x=>match(p,'sat',x)))continue;
   if((c==='arrow'||c==='nam')&&alive().filter(x=>x!==p&&x.k===p.k).length>alive().filter(x=>x!==p&&x.k&&x.k!==p.k).length)continue;
   let t=null;if(TG.includes(c)||(c==='thieu'&&has(p,'longdam'))){t=pickT(p,c==='thieu'?'sat':c);if(!t)continue}
   await sleep(P[0].alive?speed:70);await use(p,i,t?t.id:null);did=true;break
  }
  if(!did||!p.alive)break
 }
 while(p.alive&&p.hand.length>handLimit(p))disc.push(p.hand.shift());
 if(p.alive&&has(p,'benguyet')){drawc(p,1);say(p.name+' dùng Bế Nguyệt')}
}
async function hturn(p){
 while(flip(p).length){const opts=flip(p),r=await choose('Bạn có muốn lật tướng trước khi rút bài?',null,[...opts.map(g=>({t:'🔓 Lật '+g.n+' ('+g.k+')',v:g.n})),{t:'Tiếp tục, giữ tướng úp',v:0}]);if(r.b===0)break;reveal(p,p.g.find(g=>g.n===r.b))}
 await drawPhase(p);
 while(p.alive){
  const btns=[{t:'Kết thúc lượt',v:0},...flip(p).map(g=>({t:'🔓 Lật '+g.n,v:'f'+g.n}))];
  for(const id of ACTIVE_SKILLS)if(canSkill(p,id)){const g=p.g.find(x=>x.s===id);btns.push({t:'✨ '+g.sk.split(':')[0],v:'skill:'+id})}
  const r=await choose('Lượt của bạn: chọn bài viền xanh để dùng hoặc kết thúc lượt.',i=>canUse(p,p.hand[i]),btns);
  if(r.b===0)break;
  if(typeof r.b==='string'&&r.b.startsWith('skill:')){await humanSkill(p,r.b.slice(6));continue}
  if(typeof r.b==='string'){reveal(p,p.g.find(g=>g.n===r.b.slice(1)));continue}
  const c=p.hand[r.c];let tid=null;
  if(TG.includes(c)||(c==='thieu'&&has(p,'longdam'))){const q=await choose('Chọn mục tiêu cho '+(c==='thieu'?'Sát (Long Đảm)':C[c][0]),null,[...targets(p,c==='thieu'?'sat':c).map(t=>({t:t.name+' · '+(t.k||'Chưa lộ')+' · '+t.hp+'♥ · cự ly '+distance(p,t),v:t.id})),{t:'Hủy',v:-1}]);if(q.b===-1)continue;tid=q.b}
  await use(p,r.c,tid)
 }
 while(p.alive&&p.hand.length>handLimit(p)){const q=await choose('Cần bỏ '+(p.hand.length-handLimit(p))+' lá để còn tối đa '+handLimit(p)+' lá trên tay.',()=>true,[]);disc.push(p.hand.splice(q.c,1)[0])}
 if(p.alive&&has(p,'benguyet')){drawc(p,1);say(p.name+' dùng Bế Nguyệt')}
}
async function game(){
 try{let i=0;
  while(true){if(rd>120)throw 'Hòa';const p=P[i];
   if(p.alive){cur=i;used=0;zh=0;kh=0;p.skillUsed={};p.guardUsed=false;say('— Lượt của '+p.name+' —');await(p.human?hturn(p):bturn(p))}
   i=(i+1)%N;if(i===0)rd++
  }}
 catch(e){if(e==='abort')return;if(typeof e!=='string'){console.error('Lỗi game:',e);over='Lỗi';say('Không thể tiếp tục ván: '+e.message)}else over=e;
  P.forEach(p=>{p.g.forEach(g=>g.rev=true);p.k=kd(p)});cur=-1;render()}
}
function allPairs(){const groups={};for(const g of G)(groups[g[1]]??=[]).push(g);const pairs=[];
 for(const a of Object.values(groups)){shuf(a);while(a.length>=2)pairs.push([a.pop(),a.pop()])}
 return shuf(pairs)
}
function prepare(n){if(UI?.rej)UI.rej('abort');gid++;P=[];setup={n,pairs:allPairs()};over=null;showSkillsFor=null;render()}
function init(n,index=0){
 if(!setup||!setup.pairs[index])return;
 const draft=setup.pairs.slice(),mine=draft.splice(index,1)[0];N=n;gid++;rd=1;D=[];disc=[];
 const cnt={sat:30,thieu:19,dao:11,duel:4,arrow:3,nam:3,steal:5,dis:5,draw:5,wuxie:9,crossbow:2,spear:2,halberd:2,bagua:2,shield:2,horseplus:3,horseminus:3};
 for(const k in cnt)for(let i=0;i<cnt[k];i++)D.push(k);shuf(D);
 P=[];const chosen=[mine,...draft.slice(0,n-1)];
 for(let i=0;i<N;i++){const g=chosen[i].map(x=>({n:x[0],k:x[1],hp:x[2],s:x[3],sk:x[4],rev:false}));
  const max=Math.floor((g[0].hp+g[1].hp)/2);
  P.push({id:i,human:i===0,name:i?'Bot '+String.fromCharCode(64+i):'Bạn',g,k:null,max,hp:max,hand:[],skillUsed:{},guardUsed:false,eq:{weapon:null,armor:null,plus:null,minus:null},alive:true})}
 P.forEach(p=>drawc(p,4));lg=[];over=null;UI=null;used=0;cur=-1;setup=null;render();game()
}
function restart(){gid++;if(UI?.rej)UI.rej('abort');UI=null;P=[];setup=null;over=null;cur=-1;showSkillsFor=null;showHeroes=false;render()}