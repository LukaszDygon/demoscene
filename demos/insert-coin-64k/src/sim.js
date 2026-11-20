// INSERT COIN: the game. A scripted fight choreography (data) run through a deterministic brawler simulation.
// No DOM: the same file runs in the browser and in Node (test/check_sim.js). 60 frames per second, 150 BPM, so a beat is 24 frames.
// Script commands are per-actor queues; a command starts at its beat or as soon as the actor is free, whichever is later.
// Hits are never scheduled: an attack only lands if, on its strike frame, the fist/foot actually reaches the target's body.
var SIM=(()=>{
const FB=24,ab=Math.abs,sg=Math.sign,mx=Math.max,mn=Math.min;
// kind: [body half-width, hp, walk speed]
const KD={hero:[8,100,1.25],punk:[8,40,1],cone:[8,56,.9],ninja:[7,56,1.5],gran:[9,40,1.4],dog:[10,50,.9],boss:[16,200,.75]};
// moves: w windup, h strike hold, r recover, g ideal gap, R max gap (reach), d damage, k knockback, kd knockdown, s hitstop,
// c chip damage through a block, y contact height, P [wind pose, strike pose], pt score
const MV={
 jab:  {w:4, h:5, r:5, g:3,R:10,d:6, k:.8, s:4, y:30,P:['pw','p'],pt:100},
 cross:{w:6, h:6, r:7, g:4,R:12,d:8, k:1.2,s:5, y:31,P:['cw','c'],pt:150},
 kick: {w:8, h:7, r:9, g:6,R:17,d:12,k:2,  s:6, y:24,P:['kw','k'],pt:200},
 upper:{w:8, h:9, r:12,g:2,R:9, d:14,kd:1, s:8, y:36,P:['uw','u'],pt:300},
 spin: {w:10,h:9, r:12,g:6,R:18,d:16,kd:1, s:9, y:28,P:['sw','sk'],pt:500},
 punch:{w:12,h:6, r:12,g:3,R:10,d:8, k:1,  s:5, y:30,P:['pw','p']},
 head: {w:14,h:7, r:14,g:1,R:8, d:12,k:2,  s:7, y:38,P:['hw','hb']},
 nkick:{w:10,h:7, r:10,g:6,R:17,d:10,k:1.5,s:6, y:26,P:['kw','k']},
 swing:{w:16,h:8, r:14,g:7,R:20,d:10,k:1.5,s:6, y:32,P:['xw','x']},
 slam: {w:26,h:10,r:26,g:8,R:16,d:20,c:4,kd:1,s:10,y:40,P:['mw','m']},
 grab: {w:14,h:26,r:16,g:6,R:12,d:30,kd:1,s:12,y:20,P:['gw','gr']},
 ram:  {w:12,d:14,k:2.5,s:7,y:16},
 charge:{w:24,d:18,kd:1,s:9,y:30},
 stomp:{w:12,d:16,kd:1,s:9,y:4},
 shur: {w:14,d:8,k:1,s:4,y:30,sp:3.4},
 dog:  {w:16,d:36,kd:1,s:12,y:30,sp:2.6},
 sup:  {d:6,s:2,y:30,pt:300}
};
// wave camera locks; the camera may only advance to the next lock after the current wave is cleared
const WC=[0,320,640,960,1280,1280];
// The choreography. Each block belongs to a wave; its beats count from the moment the camera locks on that wave
// (the epilogue counts from the hero's victory pose). [beat, actor, command, ...args], x relative to the wave's lock.
// in: kind side(L/R/T top/D door) x y name | mv x y | a target move [ambush] | b attacker (block its next attack)
// d attacker dy (sidestep its next attack) | th target projectile | ram/ch/st target | sup target | win | tn frames | fl y (flee left)
// Between waves the hero walks on by himself: the wave is cleared, GO flashes, he walks right, the camera follows to the next lock.
const RAW=[
 [0,[ // wave 1: two punks
  [0,'H','in','hero','L',96,18,'KAZ'],
  [5,'P1','in','punk','R',196,12,'SPIKE'],
  [9,'P2','in','punk','L',26,28,'RAZOR'],
  [11,'H','a','P1','jab'],[11,'H','a','P1','cross'],[11,'H','a','P1','upper'],
  [14,'H','b','P2'],[15,'P2','a','H','punch'],
  [16,'H','a','P2','jab'],[16,'H','a','P2','cross'],[16,'H','a','P2','kick'],[16,'H','a','P2','upper'],
  [20,'P1','mv',230,22],[25,'P1','a','H','punch'],[24,'H','b','P1'],[24,'H','a','P1','kick']]],
 [1,[ // wave 2: a punk in front, the cone guy sneaks up from behind
  [0,'P3','in','punk','L',60,16,'DUKE'],
  [1,'C','in','cone','R',270,24,'CONEHEAD CARL'],
  [1,'H','a','P3','jab'],[1,'H','a','P3','cross'],[1,'H','a','P3','kick'],
  [2,'H','b','P3'],[4,'P3','a','H','punch'],[5,'P3','tn',80],[6,'P3','a','H','punch'],[4,'H','b','P3'],
  [5,'C','a','H','head',1],
  [6,'H','a','C','jab'],[6,'H','a','C','cross'],[6,'H','a','C','kick'],[6,'H','a','C','upper'],
  [10,'H','a','P3','upper'],[12,'H','a','C','spin']]],
 [2,[ // wave 3: ninjas drop from the rooftops; the shuriken is blocked, the kick sidestepped
  [0,'N1','in','ninja','T',200,10,'KAGE'],
  [1,'N2','in','ninja','T',250,30,'OBORO'],
  [2,'H','b','N2'],[3,'N2','th','H','shur'],
  [4,'H','d','N1',14],[5,'N1','a','H','nkick'],
  [5,'H','a','N1','jab'],[5,'H','a','N1','cross'],[5,'H','a','N1','kick'],[5,'H','a','N1','upper'],
  [8,'H','b','N2'],[9,'N2','a','H','nkick'],
  [9,'H','a','N2','jab'],[9,'H','a','N2','cross'],[9,'H','a','N2','kick'],[9,'H','a','N2','upper'],
  [12,'H','a','N1','spin'],[14,'H','a','N2','spin']]],
 [3,[ // wave 4: the skateboarding grandma rams in from behind; the hot-dog vendor swings, takes a beating and runs away
  [0,'G','in','gran','L',40,30,'GRANNY GRIND'],
  [1,'V','in','dog','R',250,10,'HOTDOG HANK'],
  [3,'G','ram','H',1],
  [4,'H','b','V'],[5,'V','a','H','swing'],
  [6,'H','a','G','jab'],[6,'H','a','G','cross'],[6,'H','a','G','kick'],[6,'H','a','G','upper'],
  [10,'H','a','V','jab'],[10,'H','a','V','cross'],[10,'H','a','V','kick'],[10,'H','a','V','upper'],
  [12,'V','fl',2,10]]],
 [4,[ // boss: MEGATON MACK walks out of his gym
  [0,'H','mv',96,22],
  [3,'M','in','boss','D',160,2,'MEGATON MACK'],
  [4,'M','mv',224,16],[5,'M','tn',60],
  [8,'H','d','M',-14],[9,'M','ch','H'],
  [14,'H','a','M','jab'],[14,'H','a','M','cross'],[14,'H','a','M','kick'],[14,'H','a','M','kick'],[14,'H','a','M','spin'],
  [20,'H','b','M'],[21,'M','a','H','slam'],
  [22,'H','a','M','jab'],[22,'H','a','M','cross'],[22,'H','a','M','kick'],
  [26,'M','a','H','grab'],
  [30,'H','d','M',14,'st'],[31,'M','st','H'],
  [32,'H','a','M','jab'],[32,'H','a','M','cross'],[32,'H','a','M','kick'],[32,'H','a','M','kick'],[32,'H','a','M','spin'],
  [38,'H','b','M'],[39,'M','a','H','slam'],
  [44,'H','sup','M'],[46,'H','win']]],
 [5,[ // epilogue: the vendor comes back
  [2,'V','in','dog','L',30,18,'HOTDOG HANK'],
  [4,'V','th','H','dog',1],[8,'V','tn',90],[14,'V','fl',4]]]
];
const SCRIPT=[];for(const [w,L] of RAW)for(let c of L){c=c.slice();c.w=w;const o=WC[w];
 if(c[2]=='in'){c[5]+=o}else if(c[2]=='mv')c[3]+=o;SCRIPT.push(c)}
const INV={kd:1,ly:1,dead:1,gu:1,held:1,gone:1};
const HB={atk:1,appr:1,walk:1,sup:1,dodge:1,kd:1,ly:1,gu:1,held:1,hurt:1};
const BUSY={atk:1,th:1,ram:1,ch:1,st:1,aln:1};
const METER=500,SUPHITS=11;

function run(END){
 const A=[],by={},PR=[],F=[],E=[],Q={},LAG=[],LOG=[];
 let f=0,stop=0,cam=0,hi=0,wave=0,clr=0,score=0,cb=0,lastHit=-99,en=null,enT=-999,dealt=0,meter=0,trail=100,trailT=0,dmgW=0,lockF=0,shake=0,sep=0,edge=0;
 const ev=(e,o)=>{o=o||{};o.f=f;o.e=e;E.push(o);return o};
 const LK=[0],PS=[0,0,0,0,0,0];SCRIPT.slice().sort((a,b)=>a.w-b.w||a[0]-b[0]).forEach(c=>{(Q[c[1]]=Q[c[1]]||[]).push(c);if(c[2]=='in')PS[c.w]++});
 const H=()=>by.H;
 function spawn(c){const [,id,,k,side,x,y,name]=c,w=c.w,K=KD[k];let a=by[id];
  if(!a){a=by[id]={id,k,hw:K[0],hp:K[1],mhp:K[1],sp:K[2],name,team:k=='hero'?0:1,wave:w,dist:0};A.push(a)}
  Object.assign(a,{on:0,x:side=='L'?cam-24:side=='R'?cam+344:x,y,z:side=='T'?150:0,vx:0,vz:0,f:side=='R'?-1:1,st:'walk',t:0,tx:x,ty:y,gone:0,fl:0,wave:w,born:f});
  if(side=='T'){a.st='drop';a.x=x}if(side=='D'){a.x=x}
  ev('spawn',{a:id,k,side})}
 const foes=a=>A.filter(b=>!b.gone&&b.team!=a.team&&b.st!='dead');
 const near=a=>{let best=null,d=1e9;for(const b of foes(a)){const q=ab(b.x-a.x)+ab(b.y-a.y)*2;if(q<d){d=q;best=b}}return best};
 const face=(a,b)=>{if(b&&ab(b.x-a.x)>.5)a.f=sg(b.x-a.x)};
 // bodies are solid: a move that would overlap someone on the same lane is refused, and the walker steps around in depth
 const solid=b=>!b.gone&&b.st!='dead'&&b.st!='held'&&b.z<=12;
 function free(a,x,y){if(a.z>12)return 1;for(const b of A)if(b!==a&&solid(b)&&ab(b.y-y)<7&&ab(b.x-x)-a.hw-b.hw<0&&!(ab(b.y-a.y)<7&&ab(b.x-a.x)-a.hw-b.hw<0))return 0;return 1}
 function blocker(a,x,y){return A.find(b=>b!==a&&solid(b)&&ab(b.y-y)<7&&ab(b.x-x)-a.hw-b.hw<0)}
 function step(a,tx,ty,sp){const dx=tx-a.x,dy=ty-a.y,vy=sp*.7;
  let mx_=ab(dx)<=sp?dx:sg(dx)*sp,my=ab(dy)<=vy?dy:sg(dy)*vy;
  if(!free(a,a.x+mx_,a.y+my)){const b=blocker(a,a.x+mx_,a.y+my);
   if(free(a,a.x+mx_,a.y))my=0;
   else{const d=b.y>a.y||(b.y==a.y&&a.y>18)?-1:1;if(free(a,a.x,a.y+d*vy))mx_=0,my=d*vy;else if(free(a,a.x,a.y+my))mx_=0;else mx_=my=0}}
  a.x+=mx_;a.y+=my;a.dist+=ab(mx_)+ab(my);a.mvd=ab(mx_)+ab(my)>.05;return ab(tx-a.x)<.01&&ab(ty-a.y)<.01}
 const slide=a=>{if(free(a,a.x+a.vx,a.y))a.x+=a.vx;else a.vx=0};
 function gapTo(a,b){return (b.x-a.x)*a.f-a.hw-b.hw}
 // the one place damage happens
 function land(a,b,mn_,m,dir,proj){
  const blk=b.st=='block'&&b.f==-dir&&mn_!='grab'&&mn_!='sup';
  if(blk){const c=m.c||0;b.hp-=c;b.vx=dir*1.2;stop=4;ev('block',{a:a.id,b:b.id,m:mn_,d:c,hp:b.hp,x:b.x-dir*b.hw,y:b.y,z:m.y*(a.k=='boss'?1.5:1),proj});
   if(b.team==0){dmgW+=c;if(c)trailT=f}return 'block'}
  if((b.st=='appr'||b.st=='aln'||b.st=='guard'||b.st=='block')&&b.cmd&&b.hp>m.d)Q[b.id].unshift(b.cmd);
  b.hp-=m.d;b.f=-dir;b.fl=3;stop=m.s;const lethal=b.hp<=0;
  ev('hit',{a:a.id,b:b.id,m:mn_,d:m.d,hp:b.hp,x:b.x-dir*b.hw,y:b.y,z:(m.y||30)*(a.k=='boss'?1.5:1)*(b.k=='boss'?1.3:1),s:m.s,proj});
  if(lethal)ev('ko',{a:b.id,by:a.id});
  if(a.team==0){score+=(m.pt||100)+(lethal?(b.k=='boss'?20000:1000):0);if(mn_!='sup'){dealt+=m.d;meter=mn(1,dealt/METER)}
   cb=f-lastHit<=70?cb+1:1;lastHit=f;en=b;enT=f}else{dmgW+=m.d;cb=0;en=a;enT=f;trailT=f}
  if(b.st=='atk'||b.st=='th'||b.st=='ram')ev('cancel',{a:b.id});
  if(b.k=='boss'&&!lethal){b.st='hurt';b.t=0;b.vx=dir*(m.k||1)*.3;b.ht=10;return 'hit'}
  if(lethal||m.kd){b.st='kd';b.t=0;b.vx=dir*(lethal?2.2:1.7)*(b.k=='boss'?1.4:1);b.vz=lethal?3.6:3;b.z=mx(b.z,1);if(mn_=='sup')b.vx=dir*3,b.vz=4.4}
  else{b.st='hurt';b.t=0;b.vx=dir*(m.k||1);b.ht=14}
  return 'hit'}
 // melee strike frame: does the limb reach the body?
 function strike(a,mn_){const m=MV[mn_],b=a.tg;if(!b||b.gone){ev('whiff',{a:a.id,m:mn_});return}
  const g=gapTo(a,b),dy=ab(b.y-a.y);
  if(g>=-1&&g<=m.R&&dy<=7&&b.z<14&&!INV[b.st])return land(a,b,mn_,m,a.f);
  ev('whiff',{a:a.id,b:b.id,m:mn_,g,dy,bst:b.st});return 'miss'}
 function begin(a,c){const k=c[2];a.since=f;a.cmd=c;a.t=0;
  if(k=='mv'){a.st='walk';a.tx=c[3];a.ty=c[4]}
  else if(k=='a'){a.st='appr';a.tg=by[c[3]];a.mv=c[4];a.amb=c[5]}
  else if(k=='b'||k=='d'){a.st='guard';a.from=by[c[3]];a.mode=k;a.ddy=c[4];a.only=c[5]}
  else if(k=='th'||k=='ram'||k=='ch'||k=='st'){a.st='aln';a.tg=by[c[3]];a.act=k;a.pk=c[4];a.amb=k=='ram'||k=='ch'||k=='st'?c[4]:c[5]}
  else if(k=='sup'){a.st='sup';a.tg=by[c[3]];meter=0;ev('sup',{a:a.id})}
  else if(k=='win'){a.st='win';LK[5]=f;ev('win',{a:a.id})}
  else if(k=='tn'){a.st='tn';a.dur=c[3]}
  else if(k=='fl'){a.st='flee';a.ty=c[3];ev('flee',{a:a.id})}}
 const threat=s=>s.st=='atk'?s.t<MV[s.mv].w:s.st=='th'?s.t<MV[s.pk].w:s.st=='ram'||s.st=='ch'?!s.hitOnce:s.st=='st'?s.t<MV.stomp.w+20:0;
 // the hero counts as busy while he is attacking, or about to start his next queued attack
 const hb=b=>HB[b.st]||b.st=='idle'&&Q[b.id]&&Q[b.id].length&&LK[Q[b.id][0].w]!=null&&LK[Q[b.id][0].w]+Q[b.id][0][0]*FB<=f&&/^(a|sup|mv)$/.test(Q[b.id][0][2]);
 const startAtk=(a,act)=>{a.st=act;a.t=0;a.wind=f;face(a,a.tg)};
 function upd(a){a.t++;a.mvd=0;const h=H();
  switch(a.st){
  case 'idle':face(a,near(a));break;
  case 'drop':a.z+=a.vz;a.vz-=.3;if(a.z<=0){a.z=0;a.vz=0;a.st='gu';a.t=0;ev('land',{a:a.id})}break;
  case 'walk':{const sp=a.id=='H'&&a.tx-a.x>60?1.75:a.sp;if(ab(a.tx-a.x)>.5)a.f=sg(a.tx-a.x);if(step(a,a.tx,a.ty,sp)){a.st='idle';face(a,near(a))}break}
  case 'appr':{const b=a.tg,m=MV[a.mv];if(!b||b.gone||b.st=='dead'){a.st='idle';ev('drop',{a:a.id});break}
   if(INV[b.st]||b.st=='hurt'&&b.t<4||a.team==0&&(b.st=='ch'||b.st=='ram'||b.st=='st'||b.st=='th')||a.team&&b.st=='appr'&&b.tg===a&&b.since<a.since)break;
   // attack token: enemies circle at a distance while the hero is busy, and only strike when he can answer
   const wait=b.team==0&&!a.amb&&(hb(b)||(b.st=='guard'||b.st=='block')&&b.from!==a),s0=a.x<=b.x?1:-1;
   // pick a free spot within reach: this side first, then slightly off-lane, then the far side
   let tx,ty;for(const [sd,oy] of [[s0,0],[s0,5],[s0,-5],[-s0,0],[-s0,5],[-s0,-5]]){tx=b.x-sd*(a.hw+b.hw+m.g+(wait?16:0));ty=mx(0,mn(36,b.y+oy));if(tx>cam+a.hw+2&&tx<cam+318-a.hw&&!A.some(o=>o!==a&&o!==b&&solid(o)&&ab(o.y-ty)<7&&ab(o.x-tx)-a.hw-o.hw<1))break}
   face(a,b);
   if(step(a,tx,ty,a.sp*(a.id=='H'?1.2:a.amb?2:1))&&!wait){a.st='atk';a.t=0;a.wind=f;face(a,b)}break}
  case 'atk':{const m=MV[a.mv];
   if(a.mv=='grab'){if(a.t==m.w){const b=a.tg,g=gapTo(a,b);if(g>=-1&&g<=m.R&&ab(b.y-a.y)<=7&&!INV[b.st]&&b.z<4){if(b.st=='guard'&&b.cmd)Q[b.id].unshift(b.cmd);a.hold=b;b.st='held';b.t=0;ev('grab',{a:a.id,b:b.id})}else ev('whiff',{a:a.id,b:b.id,m:'grab'})}
    if(a.hold){const b=a.hold,k=a.t-m.w;b.x=a.x+a.f*(a.hw+b.hw+2);b.y=a.y;b.z=k<16?k*2.2:mx(0,35-(k-16)*9);b.f=-a.f;
     if(k==20){a.hold=0;b.z=0;b.st='idle';land(a,b,'grab',m,a.f);b.vz=1.5;b.vx=a.f*.6}}}
   else if(a.t==m.w)strike(a,a.mv);
   if(a.t>=m.w+m.h+m.r){a.st='idle'}break}
  case 'hurt':slide(a);a.vx*=.85;if(a.t>=a.ht){a.st='idle';a.vx=0}break;
  case 'held':break;
  case 'kd':if(a.z>12)a.x+=a.vx;else slide(a);a.z+=a.vz;a.vz-=.32;if(a.z<=0&&a.vz<0){a.z=0;a.st='ly';a.t=0;a.vx*=.5;ev('down',{a:a.id,heavy:a.k=='boss'})}break;
  case 'ly':slide(a);a.vx*=.88;if(a.hp<=0){if(a.id=='H'){if(a.t==40)ev('hko',{a:'H'})}else if(a.t>=(a.k=='boss'?110:36)){a.st='dead';a.t=0}}
   else if(a.t>=44){a.st='gu';a.t=0}break;
  case 'dead':if(a.t>=48){a.gone=1;ev('gone',{a:a.id,x:a.x})}break;
  case 'gu':if(a.t>=16)a.st='idle';break;
  case 'guard':{const s=a.from;face(a,s);if(!s||s.gone){a.st='idle';break}
   if(s.tg===a&&threat(s)&&(!a.only||a.only==(s.st=='atk'?s.mv:s.st))){
    if(a.mode=='b'){a.st='block';a.t=0;ev('guard',{a:a.id,b:s.id})}
    else{a.st='dodge';a.t=0;a.y0=a.y;ev('dodge',{a:a.id,b:s.id})}}
   else if(a.t>400){a.st='idle';ev('timeout',{a:a.id})}break}
  case 'block':{const s=a.from;face(a,s);const live=PR.some(p=>p.o===s);
   if(!BUSY[s.st]&&!live){a.rel=(a.rel||0)+1;if(a.rel>4){a.st='idle';a.rel=0}}else a.rel=0;if(a.vx)slide(a);a.vx*=.8;break}
  case 'dodge':{const k=mn(a.t/12,1);a.y=a.y0+a.ddy*(k*k*(3-2*k));a.z=Math.sin(k*Math.PI)*5;if(a.t>=12){a.z=0;a.st='idle'}break}
  case 'aln':{const b=a.tg;face(a,b);if(step(a,a.x,b.y,a.sp)&&(a.amb||!hb(b)&&!((b.st=='guard'||b.st=='block')&&b.from!==a))){
   if(a.act=='th'){a.st='th'}else if(a.act=='ram'){a.st='ram'}else if(a.act=='ch'){a.st='ch'}else{a.st='st';a.jx=0}a.t=0;a.wind=f;face(a,b)}break}
  case 'th':{const m=MV[a.pk];if(a.t==m.w){PR.push({k:a.pk,o:a,tg:a.tg,x:a.x+a.f*(a.hw+4),y:a.y,z:m.y,vx:a.f*m.sp,f:a.f,t:0});ev('throw',{a:a.id,k:a.pk})}
   if(a.t>=m.w+18)a.st='idle';break}
  case 'ram':case 'ch':{const m=MV[a.st=='ram'?'ram':'charge'],b=a.tg;if(a.t<m.w)break;
   const v=a.st=='ram'?3:3.6;if(!free(a,a.x+a.f*v,a.y)&&a.hitOnce){ev('crash',{a:a.id});a.st=a.k=='boss'?'dz':'rb';a.t=0;a.vx=0;break}a.x+=a.f*v;a.dist+=v;
   if(!a.hitOnce&&!INV[b.st]&&b.st!='dodge'){const g=gapTo(a,b);if(g>=-1&&g<=4&&ab(b.y-a.y)<=7&&b.z<10){land(a,b,a.st=='ram'?'ram':'charge',m,a.f);a.hitOnce=1;
    if(a.st=='ram'){a.st='rb';a.t=0;a.vx=-a.f*1.6;a.hitOnce=0}break}}
   if(a.x<cam+a.hw+6||a.x>cam+314-a.hw){a.x=mx(cam+a.hw+6,mn(cam+314-a.hw,a.x));ev('crash',{a:a.id});a.hitOnce=0;if(a.k=='boss'){a.st='dz';a.t=0}else{a.st='rb';a.t=0;a.vx=-a.f*1.2}}break}
  case 'rb':slide(a);a.vx*=.92;if(a.t>=20)a.st='idle';break;
  case 'dz':if(a.t>=150)a.st='idle';break;
  case 'tn':if(a.t>=a.dur)a.st='idle';break;
  case 'st':{const m=MV.stomp,b=a.tg;if(a.t==1){a.sx=a.x;const side=a.x<=b.x?1:-1;a.ex=b.x-side*(a.hw+b.hw+3);a.ey=b.y;a.sy=a.y}
   if(a.t>m.w){const k=mn((a.t-m.w)/40,1);a.x=a.sx+(a.ex-a.sx)*k;a.y=a.sy+(a.ey-a.sy)*k;a.z=Math.sin(k*Math.PI)*46;
    if(k>=1&&!a.landed){a.landed=1;a.z=0;ev('quake',{a:a.id});const g=gapTo(a,b);if(g<=14&&ab(b.y-a.y)<=10&&b.z<2&&!INV[b.st])land(a,b,'stomp',m,a.f);else ev('whiff',{a:a.id,b:b.id,m:'stomp',dy:ab(b.y-a.y)})}}
   if(a.t>=m.w+40+40){a.st='idle';a.landed=0}break}
  case 'sup':{const b=a.tg;face(a,b);const k=a.t-48;
   if(k>=0&&k%5==0&&k<SUPHITS*5){const g=gapTo(a,b);if(g>=-1&&g<=300&&ab(b.y-a.y)<=24&&!INV[b.st])land(a,b,'sup',MV.sup,a.f);else ev('whiff',{a:a.id,b:b.id,m:'sup'})}
   if(k>=SUPHITS*5+30)a.st='idle';break}
  case 'flee':{const dy=a.ty-a.y;a.f=-1;if(ab(dy)>.5){step(a,a.x,a.ty,a.sp*1.5);if(ab(a.ty-a.y)<.5)a.y=a.ty}else{a.x-=2;a.dist+=2}
   if(a.x<cam-30){a.gone=1;ev('gone',{a:a.id,x:a.x,fled:1})}break}
  }
  if(a.fl>0)a.fl--;
 }
 const pose=a=>{const t=a.t,m=MV[a.mv];
  switch(a.st){
  case 'walk':case 'appr':case 'flee':case 'aln':if(!a.mvd&&a.st!='flee')return a.k=='gran'?'rd0':'i'+(f/20%2|0);return a.k=='gran'?'rd'+(a.dist/10%2|0):'w'+(a.dist/(a.st=='flee'?8:6)%4|0);
  case 'atk':return a.mv=='grab'?(a.hold?(a.t-m.w<16?'gr':'m'):(t<m.w?'gw':'gr')):t<m.w?m.P[0]:t<m.w+m.h?m.P[1]:m.P[0];
  case 'hurt':case 'held':return 'hu';case 'kd':return 'fl';case 'ly':case 'dead':return 'ly';case 'gu':case 'rb':return 'gu';
  case 'block':return 'bl';case 'dodge':case 'drop':return 'jp';case 'th':return t<MV[a.pk].w?'tw':'t';
  case 'ram':return 'ch';case 'ch':return t<MV.charge.w?'gu':'ch';case 'dz':return 'dz';
  case 'st':return t<MV.stomp.w||t>MV.stomp.w+40?'gu':'jp';
  case 'sup':return a.t<48?'s1':'s2';case 'win':return 'vi';case 'tn':return 'tn'+(t/12%2|0);
  default:return 'i'+(f/20%2|0)}};
 END=END||66*96;
 for(f=0;f<END;f++){
  if(stop>0){stop--}else{
   // dispatch commands
   for(const id in Q){const q=Q[id];while(q.length){const c=q[0];if(LK[c.w]==null||LK[c.w]+c[0]*FB>f)break;const a=by[id];
     if(c[2]=='in'){if(a&&!a.gone)break;spawn(c);PS[c.w]--;q.shift();continue}
     if(!a||a.gone||a.st=='dead'||a.hp<=0){if(a&&(a.hp<=0||a.st=='dead')){q.shift();LOG.push('drop '+c.join(' '));continue}break}
     if(a.st!='idle'||c[2]=='fl'&&a.hp>(c[4]||99))break;q.shift();LAG.push([c,f-LK[c.w]-c[0]*FB]);begin(a,c)}}
   for(const a of A)if(!a.gone)upd(a);
   for(let i=PR.length;i--;){const p=PR[i],m=MV[p.k],b=p.tg;p.t++;
    if(p.dead){p.z+=p.vz;p.vz-=.3;p.x+=p.vx;if(p.z<0){PR.splice(i,1)}continue}
    p.x+=p.vx;
    if(!INV[b.st]&&ab(p.x-b.x)<=b.hw+2&&ab(p.y-b.y)<=6&&b.z<10){const r=land(p.o,b,p.k,m,p.f,1);p.hx=p.x;
     if(r=='block'){p.dead=1;p.vx=-p.vx*.4;p.vz=2.5}else PR.splice(i,1);continue}
    if(p.x<cam-40||p.x>cam+360)PR.splice(i,1)}
   // separation: standing bodies on the same lane may not overlap
   for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){const a=A[i],b=A[j];if(a.gone||b.gone||a.st=='dead'||b.st=='dead'||a.st=='held'||b.st=='held'||a.z>12||b.z>12)continue;
    if(ab(a.y-b.y)<7){const g=ab(a.x-b.x)-a.hw-b.hw;if(g<0){sep++;const s=a.x<b.x?-1:1,ha=a.k=='boss'||a.st=='ly',hb=b.k=='boss'||b.st=='ly',wa=ha==hb?.5:ha?0:1;
     a.x-=s*g*wa;b.x+=s*g*(1-wa);LOG.push('sep f'+f+' '+a.id+'/'+b.id+' '+g.toFixed(1))}}}
   // the screen edges are walls for everyone who has walked in (and is not running away)
   for(const a of A){if(a.gone)continue;a.y=mx(0,mn(36,a.y));const l=cam+a.hw+2,r=cam+318-a.hw;
    if(a.x>=l&&a.x<=r)a.on=1;if(a.on&&a.team&&a.st!='flee'&&a.z<=12){if(a.x<l)a.x=l,a.vx=0;if(a.x>r)a.x=r,a.vx=0}}
   // camera and wave logic
   const h=H();if(h){
    const wE=A.filter(a=>a.team&&a.wave==wave&&!(a.wave==3&&a.id=='V'&&wave>3));
    if(!clr&&wave<4&&!PS[wave]&&wE.every(a=>a.gone)){clr=1;hi=WC[wave+1];ev('clear',{w:wave,perfect:dmgW==0});if(dmgW==0)score+=5000;
     Q.H.unshift(Object.assign([0,'H','mv',hi+140,18],{w:wave}))}
    const want=mn(hi,h.x-130);if(want>cam)cam=mn(want,cam+2);
    if(clr&&cam>=hi){wave++;clr=0;dmgW=0;lockF=f;LK[wave]=f;ev('lock',{w:wave})}
    if(h.x>cam+306&&!h.gone){h.x=cam+306;edge++}if(h.x<cam+10){h.x=cam+10}
   }
  }
  if(trailT<f-24&&trail>H().hp)trail=mx(H().hp,trail-.6);
  // HUD derived from the state above
  const h=H(),go=clr&&cam<hi;
  F.push({c:Math.round(cam),s:stop>0,
   a:A.filter(a=>!a.gone).map(a=>({id:a.id,k:a.k,x:a.x,y:a.y,z:a.z,f:a.f,p:pose(a),fl:a.fl>0,bl:a.st=='dead'&&(a.t>>2)%2,hp:a.hp,st:a.st,dz:a.st=='dz',low:a.k=='boss'&&a.hp<=a.mhp*.35&&a.hp>0})),
   p:PR.map(p=>({k:p.k,x:p.x,y:p.y,z:p.z,f:p.f,t:p.t,dead:p.dead})),
   h:{sc:score,cb,cbs:cb>=2&&f-lastHit<75,hp:h?h.hp:100,tr:trail,en:en&&f-enT<200?{n:en.name,hp:en.hp,m:en.mhp,id:en.id}:null,mt:meter,go,tm:mx(0,99-((f-lockF)/60|0)),w:wave}});
 }
 return{F,E,LAG,LOG,sep,edge,WC,MV,KD,A}}
return{run,FB,MV,KD,WC,SCRIPT}})();
if(typeof module!='undefined')module.exports=SIM;
