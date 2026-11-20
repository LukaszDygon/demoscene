// Runs the choreography headless in Node and checks the game logic independently from the snapshots.
//   node test/check_sim.js [-v]
const SIM=require('../src/sim.js');
const R=SIM.run(68*96),{F,E,LAG,LOG}=R,MV=SIM.MV,V=process.argv.includes('-v');
const bb=f=>(f/96|0)+'.'+((f%96)/24|0)+'.'+(f%24);
let fail=0;const bad=(...m)=>{fail++;if(fail<40)console.log('FAIL',...m)};
const at=(f,id)=>F[f].a.find(a=>a.id==id);
// 1. every hit/block: both bodies within reach on that very frame, attacker in its strike pose, target already reacting
let nHit=0,nBlk=0;
for(const e of E.filter(e=>e.e=='hit'||e.e=='block')){
 const a=at(e.f,e.a),b=at(e.f,e.b);if(!a||!b){bad('missing body',e);continue}
 const dir=e.proj?Math.sign(b.x-e.x||1):a.f,dy=Math.abs(a.y-b.y),gap=(b.x-a.x)*dir-SIM.KD[a.k][0]-SIM.KD[b.k][0];
 e.e=='hit'?nHit++:nBlk++;
 if(e.proj){const p=F[e.f-1].p.find(p=>p.k==e.m);if(!p)bad('projectile not in flight',e);else{const px=p.x+p.f*MV[e.m].sp;
   if(Math.abs(px-b.x)>SIM.KD[b.k][0]+2.01||Math.abs(p.y-b.y)>6)bad('projectile not touching',e.m,bb(e.f))}}
 else{const m=MV[e.m],R=e.m=='sup'?300:e.m=='ram'||e.m=='charge'?4:e.m=='stomp'?14:m.R,DY=e.m=='sup'?24:e.m=='stomp'?10:7;
  if(gap<-1.01||gap>R+.01||dy>DY)bad('out of reach',e.a,'->',e.b,e.m,'gap',gap.toFixed(1),'dy',dy.toFixed(1),bb(e.f));
  if(m.P&&e.m!='grab'&&a.p!=m.P[1])bad('attacker not in strike pose',e.a,e.m,a.p,bb(e.f));
  if(a.f!=Math.sign(b.x-a.x))bad('target behind attacker',e.a,e.b,bb(e.f))}
 const want=e.e=='block'?['block']:['hurt','kd','ly'];if(!want.includes(b.st))bad('target not reacting on contact frame',e.b,b.st,bb(e.f));
 if(e.e=='hit'&&!b.fl)bad('no hit flash',bb(e.f))}
// 2. no overlap and no walking through anyone (standing bodies on the same lane)
const solid=a=>a.st!='dead'&&a.st!='held'&&a.z<=12;
for(let f=0;f<F.length;f++){const L=F[f].a.filter(solid);
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];
  if(Math.abs(a.y-b.y)<7&&Math.abs(a.x-b.x)-SIM.KD[a.k][0]-SIM.KD[b.k][0]<-.01)bad('overlap',a.id,b.id,bb(f));
  if(f){const pa=at(f-1,a.id),pb=at(f-1,b.id);if(pa&&pb&&solid(pa)&&solid(pb)&&Math.abs(pa.y-pb.y)<7&&Math.abs(a.y-b.y)<7&&Math.sign(pa.x-pb.x)!=Math.sign(a.x-b.x))bad('walked through',a.id,b.id,bb(f))}}}
// 3. health never negative; a knockout is exactly zero
for(const fr of F)for(const a of fr.a)if(a.hp<0)bad('negative hp',a.id,a.hp);
for(const e of E.filter(e=>e.e=='ko')){const h=E.filter(x=>x.e=='hit'&&x.b==e.a&&x.f<=e.f).pop();if(h.hp!=0)bad('KO overkill',e.a,h.hp)}
// 4. every enemy enters from off screen, and leaves the screen after defeat (blinks out or runs off)
const ids=[...new Set(E.filter(e=>e.e=='spawn').map(e=>e.a))];
for(const e of E.filter(e=>e.e=='spawn'&&e.a!='H')){const a=at(e.f,e.a),c=F[e.f].c,sx=a.x-c,top=a.z>100;if(!top&&sx>-SIM.KD[a.k][0]&&sx<320+SIM.KD[a.k][0]&&e.side!='D')bad('spawned on screen',e.a)}
for(const id of ids.filter(i=>i!='H')){const ko=E.find(e=>e.e=='ko'&&e.a==id),gone=E.filter(e=>e.e=='gone'&&e.a==id);
 if(ko){const g=gone.find(g=>g.f>ko.f);if(!g||g.f-ko.f>300)bad('defeated enemy did not leave',id)}
 const last=gone.pop();if(!last)bad('enemy still on screen at the end',id);else if(last.fled&&last.x>F[last.f].c-20)bad('fled but on screen',id)}
// 5. the camera only scrolls when no enemy is standing
for(let f=1;f<F.length;f++)if(F[f].c!=F[f-1].c){const alive=F[f].a.filter(a=>a.id!='H'&&a.st!='dead'&&a.hp>0);if(alive.length)bad('scrolled during a fight',bb(f),alive.map(a=>a.id))}
// 6. story order: boss KO by the super, then the hero is knocked out, then CONTINUE (bar 58)
const bko=E.find(e=>e.e=='ko'&&e.a=='M'),hko=E.find(e=>e.e=='ko'&&e.a=='H'),sup=E.find(e=>e.e=='sup');
if(!bko||bko.by!='H'||E.filter(e=>e.e=='hit'&&e.b=='M').pop().m!='sup')bad('boss not finished by the super');
if(!hko||hko.f>59*96-24)bad('hero KO missing or too late for CONTINUE (bar 59)',hko&&bb(hko.f));
if(!sup||F[sup.f-1].h.mt<1)bad('super without a full meter');
// 7. every command ran; expected whiffs only against a dodging target
const nCmd=SIM.SCRIPT.filter(c=>c[2]!='in').length+4,ran=new Set(LAG.map(l=>l[0]));if(ran.size!=nCmd)bad('commands not executed',nCmd-ran.size,LOG.filter(l=>l.startsWith('drop')));
for(const e of E.filter(e=>e.e=='whiff')){const b=e.b&&at(e.f,e.b);if(!b||!E.some(d=>d.e=='dodge'&&d.a==e.b&&e.f-d.f<60))bad('unexpected whiff',e.a,e.m,bb(e.f),b&&b.st)}
for(const e of E.filter(e=>e.e=='timeout'||e.e=='drop'))bad(e.e,e.a,bb(e.f));
if(R.edge)bad('hero pushed against the locked screen edge',R.edge,'frames');
const clears=E.filter(e=>e.e=='clear');if(clears.length!=4)bad('waves cleared',clears.length);
// report
const lag=LAG.map(l=>l[1]),late=LAG.filter(l=>l[1]>48);
console.log(`frames ${F.length} (${(F.length/60).toFixed(1)} s)  hits ${nHit}  blocks ${nBlk}  separations ${R.sep}  max command lag ${Math.max(...lag)} f`);
console.log('waves cleared at bars',clears.map(e=>bb(e.f)+(e.perfect?' PERFECT':'')).join(', '));
console.log('boss KO',bko&&bb(bko.f),' hero KO',hko&&bb(hko.f),' final score',F[F.length-1].h.sc);
if(V){for(const e of E)if(!['spawn'].includes(e.e)||1)console.log(bb(e.f).padEnd(9),e.e.padEnd(6),e.a||'',e.b||'',e.m||'',e.hp!=null?'hp '+e.hp:'',e.perfect?'PERFECT':'');
 for(const l of late)console.log('late',l[1],l[0].join(' '));console.log(LOG.filter(l=>l.startsWith('sep')).slice(0,30).join('\n'))}
console.log(fail?`${fail} FAILURES`:'ALL CHECKS PASS');process.exit(fail?1:0);
