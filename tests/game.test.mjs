import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scripts=['src/data/catalog.js','src/data/assets.js','src/game/engine.js','src/ui/render.js','src/main.js'];
function sandbox(){
 const app={innerHTML:''};
 const doc={getElementById:id=>id==='app'?app:null,documentElement:{style:{setProperty(){}},classList:{contains(){return false}}}};
 const ctx=vm.createContext({document:doc,window:{BattleFX:{playCard(){},damage(){},reveal(){}}},console,setTimeout,clearTimeout,confirm:()=>false});
 for(const name of scripts)vm.runInContext(readFileSync(path.join(root,name),'utf8'),ctx,{filename:name});
 return {ctx,app,run:src=>vm.runInContext(src,ctx)};
}

test('96 tướng, 24 tướng mỗi phe, không trùng tên',()=>{
 const {run}=sandbox();
 const result=run(`({count:G.length, unique:new Set(G.map(g=>g[0])).size, factions:Object.fromEntries(['Ngụy','Thục','Ngô','Quần'].map(k=>[k,G.filter(g=>g[1]===k).length]))})`);
 assert.equal(result.count,96);assert.equal(result.unique,96);
 for(const n of Object.values(result.factions))assert.equal(n,24);
});

test('96 chân dung và các tài nguyên UI được tách thành file thật',()=>{
 const {run}=sandbox();
 const paths=run(`[...Object.values(IMG),BG,CB,PP,HT,...Object.values(BN)]`);
 assert.equal(paths.length,104);
 for(const name of paths){
  const filename=path.resolve(root,name);
  assert.ok(filename.startsWith(root+path.sep));
  assert.ok(existsSync(filename),`Thiếu ${name}`);
  assert.ok(statSync(filename).size>100,`File rỗng ${name}`);
 }
 for(const file of scripts)assert.ok(!readFileSync(path.join(root,file),'utf8').includes('data:image/webp;base64,'));
});

test('48 cặp tướng cùng nước và không dùng trùng một tướng',()=>{
 const {run}=sandbox();
 const result=run(`(()=>{const pairs=allPairs();return {count:pairs.length,same:pairs.every(p=>p.length===2&&p[0][1]===p[1][1]),unique:new Set(pairs.flat().map(g=>g[0])).size}})()`);
 assert.equal(result.count,48);assert.ok(result.same);assert.equal(result.unique,96);
});

test('bàn chọn trận, chọn tướng và bàn đấu 5-8 người có thể dựng HTML',()=>{
 for(const n of [5,6,7,8]){
  const {run,app}=sandbox();
  assert.match(app.innerHTML,/Chọn bàn chơi/);
  run(`prepare(${n})`);
  assert.match(app.innerHTML,/Chọn cặp tướng/);
  run(`init(${n},0)`);
  assert.match(app.innerHTML,/class="stage"/);
  assert.equal((app.innerHTML.match(/data-player-id=/g)||[]).length,n);
  assert.equal((app.innerHTML.match(/data-hand-index=/g)||[]).length,4);
  assert.match(app.innerHTML,/Bộ bài/);
  assert.match(app.innerHTML,/Kết thúc lượt/);
  assert.match(app.innerHTML,/3D: Bật/);
 }
});

test('tầm đánh, ngựa và vũ khí; kỹ năng chỉ mở khi tướng đã lật',()=>{
 const {run}=sandbox();
 const result=run(`(()=>{
   P=[0,1,2,3].map(i=>({id:i,alive:true,g:[{n:'T',k:'Thục',s:'tienphong',rev:false}],k:null,hand:['sat'],eq:{weapon:null,armor:null,plus:null,minus:null},hp:4,max:4,skillUsed:{}}));N=4;
   const p=P[0],t=P[2];const base=distance(p,t);const noSkill=range(p);
   p.g[0].rev=true;p.k='Thục';const withSkill=range(p);
   p.eq.weapon='halberd';const weapon=range(p);
   t.eq.plus='horseplus';const withHorse=distance(p,t);
   p.eq.minus='horseminus';const withBoth=distance(p,t);
   return {base,noSkill,withSkill,weapon,withHorse,withBoth};
 })()`);
 assert.equal(result.base,2);assert.equal(result.noSkill,1);assert.equal(result.withSkill,2);
 assert.equal(result.weapon,4);assert.equal(result.withHorse,3);assert.equal(result.withBoth,2);
});

test('giới hạn bài, kỹ năng Chế Hành và thao tác bật nút kết thúc lượt',async()=>{
 const {run}=sandbox();
 const result=run(`(()=>{
   P=[{id:0,human:true,name:'Bạn',alive:true,g:[{n:'Tôn Quyền',k:'Ngô',hp:4,s:'chehanh',sk:'Chế Hành',rev:true}],k:'Ngô',hand:['sat','thieu'],eq:{weapon:null,armor:null,plus:null,minus:null},hp:3,max:4,skillUsed:{}}];N=1;cur=0;
   return {limit:handLimit(P[0]),skill:canSkill(P[0],'chehanh'),noOther:canSkill(P[0],'khonhuc')};
 })()`);
 assert.equal(result.limit,3);assert.equal(result.skill,true);assert.equal(result.noOther,false);
 const promise=run(`choose('Chọn mục tiêu thử nghiệm',null,[{t:'Kết thúc lượt',v:0}])`);
 run('pickBtn(0)');
 const chosen=await promise;assert.equal(chosen.b,0);
});

test('đánh Sát gây 1 sát thương khi mục tiêu không có Thiểm',async()=>{
 const {run}=sandbox();
 const result=await run(`(async()=>{
  const make=(id,hand,k)=>({id,human:false,name:'Bot '+id,alive:true,g:[{n:'T',k,s:'none',sk:'Không có',rev:true}],k,hand,eq:{weapon:null,armor:null,plus:null,minus:null},hp:4,max:4,skillUsed:{},guardUsed:false});
  P=[make(0,['sat'],'Thục'),make(1,[],'Ngụy')];N=2;cur=0;D=['dao'];disc=[];used=0;lg=[];
  await use(P[0],0,1);
  return {hp:P[1].hp,used,attacker:P[0].hand.length,discard:disc.join(',')};
 })()`);
 assert.equal(result.hp,3);assert.equal(result.used,1);assert.equal(result.attacker,0);assert.equal(result.discard,'sat');
});

test('Đào cứu người hấp hối trước khi bị loại',async()=>{
 const {run}=sandbox();
 const result=await run(`(async()=>{
  const p={id:0,human:false,name:'Bot',alive:true,g:[{n:'T',k:'Thục',s:'none',sk:'',rev:true}],k:'Thục',hand:['dao'],eq:{weapon:null,armor:null,plus:null,minus:null},hp:0,max:4,skillUsed:{},guardUsed:false};
  P=[p];N=1;D=[];disc=[];lg=[];cur=0;
  const saved=await rescue(p);return {saved,hp:p.hp,cards:p.hand.length,discard:disc.join(',')};
 })()`);
 assert.equal(result.saved,true);assert.equal(result.hp,1);assert.equal(result.cards,0);assert.equal(result.discard,'dao');
});

test('Chế Hành bỏ một lá rút hai lá và không thể dùng hai lần trong lượt',async()=>{
 const {run}=sandbox();
 const result=await run(`(async()=>{
  const p={id:0,human:false,name:'Bot',alive:true,g:[{n:'Tôn Quyền',k:'Ngô',s:'chehanh',sk:'Chế Hành',rev:true}],k:'Ngô',hand:['sat','thieu'],eq:{weapon:null,armor:null,plus:null,minus:null},hp:3,max:4,skillUsed:{},guardUsed:false};
  P=[p];N=1;D=['dao','draw'];disc=[];lg=[];cur=0;zh=0;
  const first=await executeSkill(p,'chehanh',null,0);const second=canSkill(p,'chehanh');
  return {first,second,hand:p.hand.length,discard:disc.join(',')};
 })()`);
 assert.equal(result.first,true);assert.equal(result.second,false);assert.equal(result.hand,3);assert.equal(result.discard,'sat');
});