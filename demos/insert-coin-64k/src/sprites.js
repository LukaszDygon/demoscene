// Procedural pixel-art characters: a jointed puppet per kind, posed, rasterised at native resolution with
// 4-shade lighting from the top left, a dark outline and darker "selout" edges where a front limb crosses the body.
var SPR=(()=>{
const R=Math.PI/180,sin=Math.sin,cos=Math.cos;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
// a 4-shade ramp from one base colour: shadows lean purple, highlights lean warm
function ramp(h){const c=hex(h);return[mix(c.map(v=>v*.42),[46,18,70],.35),mix(c.map(v=>v*.7),[70,40,110],.18),c,mix(c,[255,250,225],.38)].map(v=>255<<24|(v[2]&255)<<16|(v[1]&255)<<8|(v[0]&255))}
const OUT=255<<24|(32<<16)|(14<<8)|26;
const col=h=>{const c=hex(h);return 255<<24|c[2]<<16|c[1]<<8|c[0]};
// body proportions: th thigh, sh shin, tl torso, hr head, ua/fa arm segments, lr/sr leg radii, ar/fr arm radii, fi fist, w0/w1 waist/chest
const B={th:8.6,sh:8.6,tl:13,hr:5,ua:7,fa:6.5,lr:2.9,sr:2.3,ar:2.6,fr:2.1,fi:2.4,w0:4.4,w1:6.2};
const KINDS={
 hero:{m:{sk:'#e8a46c',top:'#f2efe6',ua:'#e8a46c',pa:'#3a5cc0',sh:'#d83434',hr:'#2a2034',bd:'#e0262a',tp:'#f8f8f0',bl:'#6a4020'}},
 punk:{m:{sk:'#f0c4a4',top:'#3c2c50',ua:'#3c2c50',pa:'#7a8aa8',sh:'#34303c',hr:'#58e040',st:'#e8e8f8'}},
 punk2:{m:{sk:'#d89870',top:'#5a2430',ua:'#5a2430',pa:'#4a5878',sh:'#34303c',hr:'#ff58c8',st:'#e8e8f8'}},
 cone:{m:{sk:'#c48a62',top:'#e8f024',ua:'#6a7488',pa:'#2c3a6c',sh:'#7a5030',cn:'#ff7a18',wh:'#f8f8f8',hr:'#3a2a20'},b:{w0:4.6,w1:6}},
 ninja:{m:{sk:'#e8b088',top:'#262c56',ua:'#262c56',pa:'#262c56',sh:'#1c1c2c',hr:'#262c56',sa:'#d82838'},b:{th:9.5,sh:9.5,tl:11.5,w0:3.6,w1:5}},
 gran:{m:{sk:'#f0c8a8',top:'#9452b4',ua:'#9452b4',pa:'#e6d2bc',sh:'#f2f2f2',hr:'#d8d8e4',sk2:'#c8a0e0',dk:'#c27a3a',gr:'#2c2c3c',wl:'#f8d040',gl:'#a8e8ff',bg:'#7a3a8a'},b:{th:7.5,sh:7.5,tl:10.5,hr:5,ua:6,fa:5.5,lr:2.2,sr:1.7,ar:2,fr:1.7,fi:1.9,w0:4.2,w1:4.8}},
 dog:{m:{sk:'#e8a878',top:'#f4f4f0',ua:'#f4f4f0',pa:'#565868',sh:'#2a2a30',hr:'#302018',rd:'#d83030',bn:'#e8b060',ss:'#c44a2c',mu:'#f8e020'},b:{tl:12.5,w0:6,w1:6.4,th:8.2,sh:8.2,lr:3.1,sr:2.6,ar:2.8}},
 boss:{m:{sk:'#d08a52',top:'#d08a52',ua:'#d08a52',pa:'#6a2ab4',sh:'#c42234',hr:'#f0c020',bt:'#e02020',gd:'#f0c020',wh:'#f8f8f8'},b:{th:14,sh:13,tl:21,hr:7,ua:12,fa:11,lr:5,sr:4.2,ar:4.6,fr:4,fi:4.4,w0:8,w1:11.5}}
};
// poses: [lean, crouch, back thigh, back knee, front thigh, front knee, back shoulder, back elbow, front shoulder, front elbow, body rotation, head tilt]
const P={
 i0:[4,1.5,-20,10,22,16,30,105,48,96,0,0], i1:[5,2.5,-20,14,22,20,28,100,44,92,0,2],
 w0:[6,0,-22,6,22,10,26,100,52,90,0,0], w1:[6,1,-4,34,6,4,32,104,46,94,0,0],
 w2:[6,0,22,10,-22,6,36,108,40,88,0,0], w3:[6,1,6,4,-4,34,30,102,48,94,0,0],
 pw:[-6,1,-14,8,16,12,30,110,-25,120,0,0], p:[10,1,-16,4,18,10,24,110,90,0,0,0],
 cw:[-10,1,-14,8,16,12,-30,110,40,100,0,0], c:[16,1,-20,2,20,14,92,0,20,115,0,0],
 kw:[-6,2,-8,8,72,110,20,90,50,80,0,0], k:[-20,0,-6,2,92,0,-40,30,30,70,0,-4],
 uw:[14,6,-22,30,24,40,30,100,8,40,0,0], u:[-8,0,-24,6,12,8,10,60,172,8,0,-6],
 sw:[14,4,-26,30,-34,64,10,70,-20,60,0,0], sk:[-26,0,4,2,104,0,-70,20,-40,40,0,-6],
 hu:[-22,2,-16,12,10,22,-40,30,20,30,0,-14], fl:[-16,0,30,50,52,22,150,20,128,40,-38,-10],
 ly:[-4,0,10,10,-4,28,118,20,96,30,-90,0], gu:[26,10,-40,82,48,100,40,40,62,30,0,0],
 bl:[-6,3,-16,10,14,14,58,112,70,124,0,4], jp:[4,0,22,70,48,92,40,64,62,72,0,0],
 vi:[-4,0,-16,2,16,2,-40,-80,176,4,0,-6], s1:[2,6,-32,22,36,28,-44,100,-34,92,0,0],
 s2:[14,2,-36,2,30,26,86,2,96,0,0,0], tw:[-12,1,-14,6,16,12,30,90,-150,40,0,-4],
 t:[14,1,-18,4,20,12,20,90,100,0,0,0], tn0:[-16,0,-12,2,12,2,-24,96,-14,100,0,-14],
 tn1:[-10,2,-12,6,12,6,-20,92,-12,96,0,-8], dz:[12,3,-6,14,6,18,4,8,-4,10,0,10],
 ch:[38,5,-42,18,40,60,62,20,70,24,0,10], hw:[-26,1,-14,6,16,10,-40,40,-30,40,0,-8],
 hb:[40,2,-24,4,22,16,-56,20,-46,24,0,14], xw:[-10,1,-14,6,16,12,30,100,-160,30,0,-4],
 x:[18,2,-20,4,22,16,20,100,72,8,0,4], mw:[-10,0,-16,4,16,6,174,12,168,16,0,-8],
 m:[30,7,-22,22,24,30,62,8,56,10,0,10], gw:[16,2,-16,6,18,12,78,24,74,28,0,0],
 gr:[-12,1,-16,4,18,8,150,30,146,36,0,-6], rd0:[10,3,-8,18,16,26,26,90,40,80,0,0],
 rd1:[14,3,-40,4,14,30,30,94,44,84,0,2]
};
// --- rasteriser ---
function raster(W,H,parts){const C=new Uint32Array(W*H),O=new Int16Array(W*H).fill(-1),L=[-.46,-.62,.64];
 parts.forEach((p,i)=>{if(p.t=='x'){const x=p.p[0]|0,y=p.p[1]|0;if(x>=0&&y>=0&&x<W&&y<H&&(p.o||O[y*W+x]>=0)){C[y*W+x]=p.k;O[y*W+x]=1e3}return}
  let x0,x1,y0,y1;
  if(p.t=='c'){const r=Math.max(p.r0,p.r1);x0=Math.min(p.a[0],p.b[0])-r;x1=Math.max(p.a[0],p.b[0])+r;y0=Math.min(p.a[1],p.b[1])-r;y1=Math.max(p.a[1],p.b[1])+r}
  else if(p.t=='e'){const r=Math.max(p.rx,p.ry);x0=p.c[0]-r;x1=p.c[0]+r;y0=p.c[1]-r;y1=p.c[1]+r}
  else{x0=Math.min(...p.q.map(v=>v[0]));x1=Math.max(...p.q.map(v=>v[0]));y0=Math.min(...p.q.map(v=>v[1]));y1=Math.max(...p.q.map(v=>v[1]))}
  for(let y=Math.max(0,y0|0);y<=Math.min(H-1,y1+1);y++)for(let x=Math.max(0,x0|0);x<=Math.min(W-1,x1+1);x++){const px=x+.5,py=y+.5;let nx,ny,ok=0;
   if(p.t=='c'){const dx=p.b[0]-p.a[0],dy=p.b[1]-p.a[1],l=dx*dx+dy*dy||1;let t=((px-p.a[0])*dx+(py-p.a[1])*dy)/l;t=t<0?0:t>1?1:t;
    const qx=p.a[0]+dx*t,qy=p.a[1]+dy*t,r=p.r0+(p.r1-p.r0)*t,ex=px-qx,ey=py-qy;if(ex*ex+ey*ey<=r*r){ok=1;nx=ex/r;ny=ey/r}}
   else if(p.t=='e'){const c=cos(p.g||0),s=sin(p.g||0),ex=px-p.c[0],ey=py-p.c[1],u=(ex*c+ey*s)/p.rx,v=(-ex*s+ey*c)/p.ry;if(u*u+v*v<=1){ok=1;nx=u*c-v*s;ny=u*s+v*c}}
   else{let c=0;const q=p.q;for(let i=0,j=q.length-1;i<q.length;j=i++)if((q[i][1]>py)!=(q[j][1]>py)&&px<(q[j][0]-q[i][0])*(py-q[i][1])/(q[j][1]-q[i][1])+q[i][0])c^=1;
    if(c){ok=1;nx=(px-(x0+x1)/2)/((x1-x0)/2+.5)*.85;ny=(py-(y0+y1)/2)/((y1-y0)/2+.5)*.6}}
   if(!ok)continue;const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),l=nx*L[0]+ny*L[1]+nz*L[2];
   let s=l>.6?3:l>.18?2:l>-.28?1:0;if(p.dk)s=Math.max(0,s-1);if(p.fl!=null)s=p.fl;
   C[y*W+x]=p.m[s];O[y*W+x]=i}});
 // selout: front parts get their darkest shade where they cross something behind them
 const C2=C.slice();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,o=O[i];if(o<0||o>=1e3||!parts[o].so)continue;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const q=O[Y*W+X];if(q>=0&&q<o&&parts[q].m!=parts[o].m){C2[i]=parts[o].m[0];break}}}
 // dark outline around the silhouette
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(O[i]>=0)continue;
  if(x>0&&O[i-1]>=0||x<W-1&&O[i+1]>=0||y>0&&O[i-W]>=0||y<H-1&&O[i+W]>=0)C2[i]=OUT}
 return C2}
// --- puppet: builds parts for a kind in a pose. local space: feet on y=0, +x = facing direction, y down ---
function build(kn,pn,fr,headOnly){
 const K=KINDS[kn],b=Object.assign({},B,K.b||{}),M={};for(const k in K.m)M[k]=ramp(K.m[k]);
 const q=P[pn].map((v,i)=>i==1?v:v*R);let [ln,cr,bt,bk,ft,fk,bs,be,fs,fe,rot,ht]=q;
 if(kn=='gran'&&pn!='ly'&&pn!='fl')ln+=12*R;
 const parts=[],cap=(a,b2,r0,r1,m,o)=>parts.push(Object.assign({t:'c',a,b:b2,r0,r1,m},o)),ell=(c,rx,ry,m,o)=>parts.push(Object.assign({t:'e',c,rx,ry,m},o)),
  poly=(qq,m,o)=>parts.push(Object.assign({t:'p',q:qq,m},o)),pix=(p,k,o)=>parts.push({t:'x',p,k,o});
 const ad=(p,v,k)=>[p[0]+v[0]*k,p[1]+v[1]*k],dir=a=>[sin(a),cos(a)];
 const board=kn=='gran'&&pn!='ly'&&pn!='fl'&&pn!='hu';
 const Hp=[0,-(b.th+b.sh+2.4)+cr-(board?4:0)],U=[sin(ln),-cos(ln)],N=ad(Hp,U,b.tl),S=ad(Hp,U,b.tl-2.2);
 const hc=ad(ad(N,U,b.hr*.95),[1,0],.6),T=ln+ht;
 const leg=(hx,t,k,dk,so)=>{const h=[Hp[0]+hx,Hp[1]],kn_=ad(h,dir(t),b.th),an=ad(kn_,dir(t-k),b.sh);
  cap(h,kn_,b.lr,b.lr*.92,M[kn=='boss'?'sk':'pa'],{dk,so});
  cap(kn_,an,b.lr*.9,b.sr,M[kn=='boss'?'sk':'pa'],{dk,so});
  if(kn=='boss')cap(ad(kn_,dir(t-k),2),an,b.sr+.6,b.sr+.4,M.sh,{dk,so});
  const sd=dir(t-k+90*R);ell(ad(an,[1,0],b.sr*.8+.6),b.sr+1.6,b.sr*.8+.4,M.sh,{dk,so,g:t-k-0*R});return an};
 const arm=(sx,s,e,dk,so,item)=>{const sp=[S[0]+sx,S[1]],el=ad(sp,dir(s),b.ua),hn=ad(el,dir(s+e),b.fa);
  cap(sp,el,b.ar+.3,b.ar,M.ua,{dk,so});cap(el,hn,b.ar,b.fr,M[kn=='dog'||kn=='hero'||kn=='boss'?'sk':'ua'],{dk,so});
  if(kn=='hero'||kn=='boss')cap(ad(el,dir(s+e),b.fa*.62),ad(el,dir(s+e),b.fa*.9),b.fr+.5,b.fr+.6,M[kn=='hero'?'tp':'wh'],{dk,so});
  ell(hn,b.fi,b.fi,M[kn=='ninja'?'ua':'sk'],{dk,so});
  if(item){const d=dir(s+e+70*R),a1=ad(hn,d,-5),a2=ad(hn,d,10);cap(a1,a2,2.6,2.6,M.bn,{so:1});cap(ad(a1,d,-1.5),ad(a2,d,1.5),1.5,1.5,M.ss,{so:1});
   for(let i=0;i<6;i++){const p=ad(a1,d,i*2+1);pix([p[0]+(i%2?1:-1)*.6,p[1]-1.2],M.mu[3])}ell(hn,b.fi,b.fi,M.sk,{so:1})}
  return hn};
 const dogItem=kn=='dog'&&pn!='t'&&pn!='hu'&&pn!='fl'&&pn!='ly'&&pn!='gu';
 if(!headOnly){
  // back arm, back leg
  arm(-1.2,bs,be,1,0);
  if(kn=='gran'&&pn=='rd1')leg(-1,bt,bk,1,0);else leg(-1.2,bt,bk,1,0);
  // torso
  cap(Hp,N,b.w0,b.w1,M.top,{});
  if(kn=='cone'){for(const k of[4.5,8])cap(ad(ad(Hp,U,k),[-1,0],b.w1),ad(ad(Hp,U,k),[1,0],b.w1),.6,.6,M.wh,{fl:3})}
  if(kn=='punk'||kn=='punk2'){for(let i=0;i<3;i++)pix(ad(ad(S,U,-i*2.4),[1,0],b.w1-1),M.st[3])}
  if(kn=='boss'){cap(ad(N,U,-2),ad(ad(N,U,-9),[1,0],3),5,4,M.sk,{});}
  // hips / pants / skirt / belt
  if(kn=='gran')poly([ad(ad(Hp,U,3),[-1,0],b.w0+.5),ad(ad(Hp,U,3),[1,0],b.w0+.5),[Hp[0]+b.w0+3.5+sin(ft)*3,Hp[1]+b.th*.85],[Hp[0]-b.w0-3,Hp[1]+b.th*.85]],M.sk2,{});
  else if(kn=='boss'){cap(ad(Hp,U,-2),ad(Hp,U,3),b.w0+1.2,b.w0+1,M.pa,{});cap(ad(ad(Hp,U,4),[-1,0],b.w0+1.5),ad(ad(Hp,U,4),[1,0],b.w0+1.8),2.2,2.2,M.gd,{});ell(ad(ad(Hp,U,4),[1,0],b.w0+.5),3.6,3.2,M.gd,{fl:3})}
  else{cap(ad(Hp,U,-1.5),ad(Hp,U,2.5),Math.min(b.w0,4.6)+.6,Math.min(b.w0,4.6)+.5,M.pa,{});if(kn=='hero')cap(ad(ad(Hp,U,2.6),[-1,0],b.w0),ad(ad(Hp,U,2.6),[1,0],b.w0),.8,.8,M.bl,{});
   if(kn=='ninja')cap(ad(ad(Hp,U,2.4),[-1,0],b.w0+.8),ad(ad(Hp,U,2.4),[1,0],b.w0+.8),1.2,1.2,M.sa,{}),cap(ad(ad(Hp,U,2.4),[-1,0],b.w0),[Hp[0]-b.w0-5,Hp[1]+4+(fr&1)],1,.6,M.sa,{})}
  if(kn=='dog'){const bc=ad(ad(Hp,U,5),[1,0],2.6);ell(bc,6,6.4,M.top,{so:1});for(let i=-1;i<=2;i++)for(let j=-5;j<6;j++)if(i*i+j*j/1.2<20)pix([bc[0]+i*2.4,bc[1]+j],M.rd[i>1?1:2])}
  leg(1.2,ft,fk,0,1);
  if(board){const y=-3.2;cap([-10,y],[10,y],1.3,1.3,M.dk,{});cap([-9,y-1.2],[9,y-1.2],.5,.5,M.gr,{fl:1});ell([-6.5,-1.2],1.3,1.3,M.wl,{});ell([6.5,-1.2],1.3,1.3,M.wl,{})}
 }
 // neck + head
 const hp=(x,y)=>[hc[0]+x*cos(T)-y*sin(T),hc[1]+x*sin(T)+y*cos(T)];
 cap(ad(N,U,-1),ad(N,U,2),b.hr*.38,b.hr*.36,M.sk,{});
 const r=b.hr;
 if(kn=='ninja'){ell(hc,r,r*1.04,M.hr,{g:T});cap(hp(-.5,-.6),hp(r*.85,-.6),1.1,1.1,M.sk,{g:T});pix(hp(r*.55,-.8),col('#101018'),1);{const t0=hp(-r*.9,-1);cap(t0,ad(t0,[-5,2+(fr&1)],1),1,.7,M.hr,{nr:1})}}
 else if(kn=='boss'){ell(hc,r,r*1.05,M.hr,{g:T});cap(hp(r*.85,1),hp(r*1.05,2.5),1.6,1.4,M.sk,{});
  poly([hp(-1,-r*.95),hp(2,-r*.5),hp(.4,-r*.3),hp(3.4,r*.3),hp(.2,-.1),hp(1.6,-r*.4)],M.bt,{fl:2});
  ell(hp(r*.5,-1.2),1.8,1.3,M.wh,{fl:3,g:T});pix(hp(r*.62,-1),col('#101018'),1);pix(hp(r*.85,2.6),col('#5a2010'),1)}
 else{ell(hc,r,r*1.06,M.sk,{g:T});ell(hp(r*.92,.6),1,1.1,M.sk,{});
  const E=hp(r*.48,-.4);pix(E,col('#141020'),1);pix([E[0],E[1]+1],col('#141020'),1);
  if(kn!='gran')pix([E[0]-1,E[1]-1.6],col('#2a1418'),1),pix([E[0]+.4,E[1]-1.8],col('#2a1418'),1);
  pix(hp(r*.62,r*.55),M.sk[0],1);pix(hp(-r*.15,.6),M.sk[1],1);
  if(kn=='hero'){poly([hp(-r-.6,-1),hp(-r*.7,-r-1),hp(0,-r-2.2),hp(r*.7,-r-.6),hp(r*.85,-r*.35),hp(-r*.2,-r*.55),hp(-r-3.2,-r*.4),hp(-r-1.2,.6),hp(-r-3.6,1.6)],M.hr,{});
   cap(hp(-r*.95,-r*.42),hp(r*.95,-r*.42),1.05,1.05,M.bd,{});const w=sin(fr*1.9)*1.6;const t0=hp(-r*.9,-r*.4);cap(t0,ad(t0,[-4,-1+w],1),1,.8,M.bd,{nr:1});cap(t0,ad(t0,[-8,1+w*.4],1),.8,.6,M.bd,{nr:1})}
  if(kn=='punk'||kn=='punk2'){for(let i=0;i<4;i++){const a=-r*.7+i*r*.5;poly([hp(a-1.4,-r*.75),hp(a-1.6-i*.3,-r-4.5+i*.4),hp(a+1.4,-r*.8)],M.hr,{})}pix(hp(-r*.2,.6+1),M.st[3],1)}
  if(kn=='cone'){poly([hp(-r-1.6,-r*.45),hp(r+1.6,-r*.45),hp(r*.25,-r-9),hp(-r*.25,-r-9)],M.cn,{});cap(hp(-r-1.8,-r*.4),hp(r+1.8,-r*.4),1,1,M.cn,{fl:1});
   cap(hp(-r*.55,-r-2.8),hp(r*.55,-r-2.8),.7,.7,M.wh,{fl:3});cap(hp(-r*.35,-r-5.6),hp(r*.35,-r-5.6),.6,.6,M.wh,{fl:3});for(let i=0;i<3;i++)pix(hp(r*.2+i,r*.6),M.hr[1],1)}
  if(kn=='gran'){ell(hp(-r*.7,-r*.6),2.4,2.4,M.hr,{});ell(hp(-.5,-r*.7),r*.95,r*.5,M.hr,{});pix(hp(r*.42,-.5),M.gl[3],1);pix(hp(r*.62,-.5),M.gl[3],1);pix(hp(r*.2,-.5),col('#403060'),1);pix(hp(r*.3,1.4),col('#f08090'),1)}
  if(kn=='dog'){poly([hp(-r*.8,-r*.55),hp(r*.85,-r*.55),hp(r*.6,-r-3.5),hp(-r*.7,-r-3.5)],M.top,{});cap(hp(-r*.85,-r*.5),hp(r*.9,-r*.5),.8,.8,M.rd,{fl:2});
   cap(hp(r*.25,r*.25),hp(r+1.4,r*.45),1.1,.9,M.hr,{fl:1})}
 }
 // front arm last
 arm(1.2,fs,fe,0,1,dogItem);
 if(kn=='gran'&&!headOnly&&pn!='ly'){const e=ad([S[0]+1.2,S[1]],dir(fs),b.ua);cap(e,ad(e,[0,1],3),1.6,2.2,M.bg,{so:1})}
 return{parts,hip:Hp,rot,hc}}
function pixels(kn,pn,fr,W,H,ox,sc,headOnly){
 const {parts,hip,rot,hc}=build(kn,pn,fr,headOnly),c=cos(rot),s=sin(rot);sc=sc||1;
 const piv=headOnly?hc:hip,T=p=>{const x=p[0]-piv[0],y=p[1]-piv[1];return[(x*c-y*s)*sc,(x*s+y*c)*sc]};
 const tp=parts.map(p=>{p=Object.assign({},p);if(p.nr){const a=T(p.a);p.b=[a[0]+(p.b[0]-p.a[0])*sc,a[1]+(p.b[1]-p.a[1])*sc];p.a=a}else for(const k of['a','b','c','p'])if(p[k])p[k]=T(p[k]);if(p.q)p.q=p.q.map(T);
  for(const k of['r0','r1','rx','ry'])if(p[k])p[k]*=sc;if(p.t=='e')p.g=(p.g||0)+rot;return p});
 let my=-1e9;for(const p of tp){if(p.t=='c')my=Math.max(my,p.a[1]+p.r0,p.b[1]+p.r1);else if(p.t=='e')my=Math.max(my,p.c[1]+Math.max(p.rx,p.ry)*.9);else if(p.q)for(const v of p.q)my=Math.max(my,v[1])}
 const dx=ox,dy=headOnly?H/2:H-2-my;
 for(const p of tp){for(const k of['a','b','c','p'])if(p[k])p[k]=[p[k][0]+dx,p[k][1]+dy];if(p.q)p.q=p.q.map(v=>[v[0]+dx,v[1]+dy])}
 return raster(W,H,tp)}
function render(kn,pn,fr,W,H,ox,sc,headOnly){const px=pixels(kn,pn,fr,W,H,ox,sc,headOnly),cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),id=g.createImageData(W,H);
 new Uint32Array(id.data.buffer).set(px);g.putImageData(id,0,0);return cv}
const S={},WH={};
function white(c){if(WH[c.id])return WH[c.id];const w=document.createElement('canvas');w.width=c.width;w.height=c.height;const g=w.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#fff';g.fillRect(0,0,w.width,w.height);return WH[c.id]=w}
let uid=0;
function get(kn,pn){const k=kn+pn;if(!S[k]){const big=kn=='boss',c=render(kn,pn,pn.charCodeAt(1)||0,big?120:80,big?100:66,big?60:40);c.id=uid++;S[k]=c}return S[k]}
function prewarm(){for(const k in KINDS)for(const p in P)get(k,p)}
return{get,white,render,pixels,prewarm,P,KINDS}})();
if(typeof module!='undefined')module.exports=SPR;
