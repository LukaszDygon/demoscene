// "a little autumn walk" - visuals. Low-poly meshes built in code, flat shading from derivatives,
// sun shadow map, golden-hour sky + aerial fog, instanced falling leaves, HDR + bloom + god rays.
(()=>{
const Q=new URLSearchParams(location.search),MUTE=Q.has('mute'),T0=parseFloat(Q.get('t'))||0;
const {sin,cos,abs,min,max,sqrt,floor,PI,atan2,hypot,exp,round}=Math,TAU=2*PI;
const cl=(x,a=0,b=1)=>x<a?a:x>b?b:x,sm=(a,b,x)=>(x=cl((x-a)/(b-a)),x*x*(3-2*x)),mix=(a,b,k)=>a+(b-a)*k;
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],scl=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm=a=>scl(a,1/(hypot(...a)||1)),L3=(a,b,k)=>[mix(a[0],b[0],k),mix(a[1],b[1],k),mix(a[2],b[2],k)];
// ---------- mat4 (column major)
const mul=(a,b)=>{const o=Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o};
const MM=(...m)=>m.reduce(mul),T=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],S=(x,y=x,z=x)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
const Rx=a=>{const c=cos(a),s=sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]},Ry=a=>{const c=cos(a),s=sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]},
 Rz=a=>{const c=cos(a),s=sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]};
const tp=(m,v)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]];
const persp=(f,a,n,F)=>{const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(F+n)/(n-F),-1,0,0,2*F*n/(n-F),0]};
const ortho=(r,n,f)=>[1/r,0,0,0,0,1/r,0,0,0,0,-2/(f-n),0,0,0,-(f+n)/(f-n),1];
const look=(e,c)=>{const z=nrm(sub(e,c)),x=nrm(cross([0,1,0],z)),y=cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]};
// ---------- noise / rng
let sd=12345;const R=()=>(sd=sd*16807%2147483647)/2147483647;
const hs=(x,y)=>{const h=sin(x*127.1+y*311.7)*43758.5453;return h-floor(h)};
const vn=(x,y)=>{const i=floor(x),j=floor(y),f=x-i,g=y-j,u=f*f*(3-2*f),v=g*g*(3-2*g);return mix(mix(hs(i,j),hs(i+1,j),u),mix(hs(i,j+1),hs(i+1,j+1),u),v)};
const fbm=(x,y)=>vn(x,y)*.55+vn(x*2.1+5,y*2.1)*.3+vn(x*4.3,y*4.3+3)*.15;
// ---------- world layout
const SUN=nrm([-.8,.2,-.45]),CX=-11,CZ=68,WZ=CZ-2,WX=CX-1,WIN=[WX,1.39,WZ],CAKE=[CX-.85,1,CZ+.3];
const CAB_A=[CX-2.45,-.5,CZ-1.95],CAB_B=[CX+2.45,3.9,CZ+1.95],CRATE=[WX-.22,.45,WZ-.5];
const inCab=p=>p[0]>CAB_A[0]&&p[0]<CAB_B[0]&&p[2]>CAB_A[2]&&p[2]<CAB_B[2]&&p[1]<3.6;
// path: Catmull-Rom through control points, resampled by arc length (0.25 steps)
const CPT=[[0,-8],[1,2],[-3,11],[-10,18],[-19,21],[-25,28],[-25,38],[-19,46],[-14,53],[-12.5,59.5],[-12.22,WZ-1.25]];
const PS=[];{const n=CPT.length,g=i=>CPT[max(0,min(n-1,i))],raw=[];
 for(let i=0;i<n-1;i++)for(let k=0;k<30;k++){const t=k/30,a=g(i-1),b=g(i),c=g(i+1),d=g(i+2);
  raw.push([0,1].map(j=>.5*(2*b[j]+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t*t+(-a[j]+3*b[j]-3*c[j]+d[j])*t*t*t)))}
 raw.push(CPT[n-1]);let acc=0,j=0;PS.push(raw[0]);
 for(let i=1;i<raw.length;i++){const sl=hypot(raw[i][0]-raw[i-1][0],raw[i][1]-raw[i-1][1]);
  while(acc+sl>=(PS.length)*.25){const k=((PS.length)*.25-acc)/sl;PS.push([mix(raw[i-1][0],raw[i][0],k),mix(raw[i-1][1],raw[i][1],k)])}acc+=sl}}
const PL=(PS.length-1)*.25;
const P=s=>{s=cl(s,0,PL)/.25;const i=min(floor(s),PS.length-2),k=s-i;return[mix(PS[i][0],PS[i+1][0],k),0,mix(PS[i][1],PS[i+1][1],k)]};
const TG=s=>nrm(sub(P(s+.6),P(s-.6)));
const PC=PS.filter((_,i)=>i%2==0);
const dPath=(x,z)=>{let d=1e9,si=0;for(let i=0;i<PC.length;i++){const e=(PC[i][0]-x)**2+(PC[i][1]-z)**2;if(e<d){d=e;si=i}}return[sqrt(d),si*.5]};
const H=(x,z,d=dPath(x,z)[0])=>((fbm(x*.045,z*.045)-.42)*5+sm(35,75,hypot(x+20,z-30))*12)*sm(1.6,9,d)*sm(8,16,hypot(x-CX,z-CZ));
// ---------- unit meshes
function icoM(sub){const t=(1+sqrt(5))/2;let v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(nrm);
 let f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 for(let s=0;s<sub;s++){const nf=[],ca={},mid=(a,b)=>{const k=a<b?a+'_'+b:b+'_'+a;if(ca[k]==null){ca[k]=v.length;v.push(nrm(scl(add(v[a],v[b]),.5)))}return ca[k]};
  for(const[a,b,c]of f){const ab=mid(a,b),bc=mid(b,c),cA=mid(c,a);nf.push([a,ab,cA],[b,bc,ab],[c,cA,bc],[ab,bc,cA])}f=nf}return{v,f}}
function cylM(n,r1=1){const v=[],f=[];for(let i=0;i<n;i++){const a=i/n*TAU;v.push([cos(a),0,sin(a)],[cos(a)*r1,1,sin(a)*r1])}
 for(let i=0;i<n;i++){const j=(i+1)%n;f.push([2*i,2*j,2*i+1]);if(r1)f.push([2*j,2*j+1,2*i+1])}
 v.push([0,0,0],[0,1,0]);for(let i=0;i<n;i++){const j=(i+1)%n;f.push([2*n,2*j,2*i]);if(r1)f.push([2*n+1,2*i+1,2*j+1])}return{v,f}}
const BOX={v:[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],f:[[0,1,2],[0,2,3],[4,6,5],[4,7,6],[0,4,5],[0,5,1],[3,2,6],[3,6,7],[0,3,7],[0,7,4],[1,5,6],[1,6,2]]};
const ICO1=icoM(1),ICO0=icoM(0),CYL6=cylM(6),CYL5=cylM(5),CYL12=cylM(12),CONE4=cylM(4,0),CONE7=cylM(7,0),CYL8=cylM(8);
// ---------- static world geometry: x,y,z,r,g,b,material
const GP=[];
const tri=(a,b,c,k,m=0)=>{GP.push(a[0],a[1],a[2],k[0],k[1],k[2],m,b[0],b[1],b[2],k[0],k[1],k[2],m,c[0],c[1],c[2],k[0],k[1],k[2],m)};
const vary=(k,v)=>{const q=1+(R()-.5)*v;return[k[0]*q,k[1]*q,k[2]*q]};
function put(me,M,k,m=0,jit=0,cv=.1){const v=me.v.map(p=>tp(M,jit?scl(p,1+(R()-.5)*jit):p));for(const[a,b,c]of me.f)tri(v[a],v[b],v[c],vary(k,cv),m)}
const box=(x0,y0,z0,x1,y1,z1,k,m=0,cv=.06)=>put(BOX,MM(T((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),S((x1-x0)/2,(y1-y0)/2,(z1-z0)/2)),k,m,0,cv);
const blob=(x,y,z,sx,sy,sz,k,m=0,me=ICO1,j=0)=>put(me,MM(T(x,y,z),S(sx,sy,sz)),k,m,j);
// terrain
const X0=-95,X1=55,Z0=-55,Z1=112,CS=.9,NX=Math.ceil((X1-X0)/CS),NZ=Math.ceil((Z1-Z0)/CS);
{const hv=[],dv=[];for(let i=0;i<=NX;i++)for(let j=0;j<=NZ;j++){const x=X0+i*CS,z=Z0+j*CS,d=dPath(x,z)[0];dv.push(d);hv.push(H(x,z,d)+(d<.9?-.04:0))}
 const V=(i,j)=>[X0+i*CS,hv[i*(NZ+1)+j],Z0+j*CS];
 for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const a=V(i,j),b=V(i+1,j),c=V(i+1,j+1),e=V(i,j+1);
  for(const q of[[a,c,b],[a,e,c]]){const x=(q[0][0]+q[1][0]+q[2][0])/3,z=(q[0][2]+q[1][2]+q[2][2])/3,d=dPath(x,z)[0],dc=hypot(x-CX,z-CZ),nz=vn(x*.25,z*.25),r=R();
   let k=nz<.35?[.5,.27,.13]:nz<.6?[.72,.36,.12]:nz<.8?[.62,.22,.09]:[.5,.42,.2];
   if(r<.15)k=[.82,.52,.16];
   if(dc<11){const g=sm(8,11,dc);k=L3([.56,.55,.26],k,g)}
   if(d<1)k=L3([.6,.45,.3],k,sm(.75,1,d));
   tri(q[0],q[1],q[2],vary(k,.12))}}}
// trees
const TREES=[],grid={},gk=(x,z)=>floor(x/5)+','+floor(z/5),PROBE=[];
for(let i=0;i<14000&&TREES.length<1150;i++){const x=mix(X0+3,X1-3,R()),z=mix(Z0+3,Z1-3,R()),[d,s]=dPath(x,z),dc=hypot(x-CX,z-CZ+1);
 if(d<3||dc<10.5)continue;const far=d>15;if(far&&R()>.5)continue;
 const md=far?4.3:2.7;let ok=1;
 for(let a=-1;a<2;a++)for(let b=-1;b<2;b++)for(const o of grid[(floor(x/5)+a)+','+(floor(z/5)+b)]||[])if(hypot(o[0]-x,o[1]-z)<md)ok=0;
 if(!ok)continue;const sc=.85+R()*.55,kind=R(),r=(1.3+R()*.6)*sc;
 if(s<16&&d<r*1.7+2.6)continue;
 const o=[x,z,sc,kind,r,far,d];TREES.push(o);(grid[gk(x,z)]=grid[gk(x,z)]||[]).push(o)}
const LEAFK=[[.96,.5,.12],[.9,.32,.1],[.98,.72,.2],[.78,.24,.12],[.85,.56,.2],[.96,.42,.1],[.62,.6,.22]];
for(const[x,z,sc,kind,r,far,d]of TREES){const y=H(x,z)-.1,ic=far?ICO0:ICO1;
 if(kind<.13){const h=.9*sc;put(far?CYL5:CYL6,MM(T(x,y,z),S(.16*sc,h,.16*sc)),[.33,.22,.16]);
  for(let k=0;k<3;k++)put(CONE7,MM(T(x,y+h+k*1.05*sc,z),Ry(R()*3),S((1.6-k*.38)*sc,2.1*sc,(1.6-k*.38)*sc)),[.2,.32,.22],0,0,.15);
  if(d<14)PROBE.push([x-1.6*sc,y,z-1.6*sc,x+1.6*sc,y+4.3*sc,z+1.6*sc])}
 else{const birch=kind<.3,h=(birch?3.6:2.4)*sc+R(),tw=(birch?.11:.17)*sc;
  put(far?CYL5:CYL6,MM(T(x,y,z),S(tw,h+r*.4,tw)),birch?[.86,.83,.76]:[.36,.24,.17],0,0,.05);
  if(birch&&!far)for(let k=0;k<5;k++){const a=R()*TAU,yy=y+.4+R()*h;box(x+cos(a)*tw-.03,yy,z+sin(a)*tw-.03,x+cos(a)*tw+.03,yy+.05,z+sin(a)*tw+.03,[.12,.1,.1])}
  const nb=far?2:3,col=birch?[.98,.8,.28]:LEAFK[floor(R()*LEAFK.length)],rr=birch?r*.75:r;
  for(let k=0;k<nb;k++){const a=R()*TAU,o=k?rr*.55:0;blob(x+cos(a)*o,y+h+rr*(k?.1:.45)+R()*.3,z+sin(a)*o,rr*(k?.75:1),rr*(k?.65:.85),rr*(k?.75:1),vary(col,.15),1,ic,.35)}
  if(!far&&R()<.5){const a=R()*TAU;put(CYL5,MM(T(x,y+h*.7,z),Rz(.9),Ry(a),S(.05*sc,.9*sc,.05*sc)),[.36,.24,.17])}
  if(d<14)PROBE.push([x-tw-.05,y,z-tw-.05,x+tw+.05,y+h,z+tw+.05],[x-rr*1.3,y+h-rr*.4,z-rr*1.3,x+rr*1.3,y+h+rr*1.4,z+rr*1.3])}}
// ground details: leaf litter, mushrooms, rocks, bushes, fallen logs, grass
for(let i=0;i<11000;i++){const x=mix(-40,15,R()),z=mix(-15,80,R()),[d]=dPath(x,z);if(d>8||(d<.8&&R()<.6))continue;
 const y=H(x,z,d)+.02+(d<.9?-.04:0),a=R()*TAU,s=.06+R()*.07,k=LEAFK[floor(R()*6)];
 tri([x+cos(a)*s,y,z+sin(a)*s],[x+cos(a+2.4)*s*.6,y+.01,z+sin(a+2.4)*s*.6],[x+cos(a-2.4)*s*.6,y+.01,z+sin(a-2.4)*s*.6],vary(k,.25),1)}
for(let i=0;i<500;i++){const x=mix(-40,15,R()),z=mix(-15,78,R()),[d]=dPath(x,z),dc=hypot(x-CX,z-CZ);if((d<1.3||d>9)&&dc>11||dc<4)continue;
 const y=H(x,z,d);for(let k=0;k<4;k++){const a=R()*TAU,h=.12+R()*.2,c=[x+cos(a)*.05,z+sin(a)*.05];
  tri([c[0]-.025,y,c[1]],[c[0]+.025,y,c[1]],[c[0]+cos(a)*.08,y+h,c[1]+sin(a)*.08],dc<12?[.62,.62,.28]:[.6,.5,.25],1)}}
const mush=(x,z,s)=>{const y=H(x,z);put(CYL6,MM(T(x,y,z),S(.025*s,.09*s,.025*s)),[.95,.9,.8]);
 put(ICO1,MM(T(x,y+.085*s,z),S(.075*s,.05*s,.075*s)),[.85,.16,.1]);for(let k=0;k<4;k++){const a=k*1.7+R();blob(x+cos(a)*.05*s,y+.12*s,z+sin(a)*.05*s,.012*s,.008*s,.012*s,[1,.97,.9],0,ICO0)}};
for(let i=0;i<60;i++){const x=mix(-36,12,R()),z=mix(-10,78,R()),[d]=dPath(x,z);if(d<1.4||d>3.4)continue;const s=1+R()*.8;mush(x,z,s);if(R()<.6)mush(x+.12,z+.08,s*.6)}
for(let i=0;i<120;i++){const x=mix(-40,15,R()),z=mix(-15,80,R()),[d]=dPath(x,z);if(d<3.6||d>12||hypot(x-CX,z-CZ)<4)continue;
 const s=.25+R()*.5;put(ICO0,MM(T(x,H(x,z)+s*.1,z),Ry(R()*3),S(s,s*.6,s*.8)),[.55,.52,.48],0,.3,.12)}
for(let i=0;i<140;i++){const x=mix(-40,15,R()),z=mix(-15,78,R()),[d]=dPath(x,z),dc=hypot(x-CX,z-CZ);if(d<3.6||d>9||dc<9)continue;
 const s=.4+R()*.4;blob(x,H(x,z)+s*.3,z,s,s*.7,s,vary(LEAFK[floor(R()*6)],.2),1,ICO1,.4)}
for(let i=0;i<9;i++){const x=mix(-36,10,R()),z=mix(-5,60,R()),[d]=dPath(x,z);if(d<3.8||d>7)continue;
 const a=R()*TAU,y=H(x,z)+.2,M=MM(T(x,y,z),Ry(a),Rz(PI/2),T(0,-1.3,0));put(CYL8,MM(M,S(.22,2.6,.22)),[.4,.28,.18]);
 put(CYL8,MM(M,T(0,2.61,0),S(.19,.01,.19)),[.75,.6,.42])}
// ---------- cabin
const WOOD=[.55,.34,.2],LOG=[.5,.31,.18],ROOF=[.62,.2,.13],CREAM=[.92,.85,.7];
{const lv=k=>.16+k*.27,cut=(y,y0,y1)=>y+.16>y0&&y-.16<y1;
 const logX=(z,y,x0,x1)=>put(CYL8,MM(T(x0,y,z),Rz(-PI/2),S(.16,x1-x0,.16)),vary(LOG,.12),0,0,.08);
 const logZ=(x,y,z0,z1)=>put(CYL8,MM(T(x,y,z0),Rx(PI/2),S(.16,z1-z0,.16)),vary(LOG,.12),0,0,.08);
 for(let k=0;k<9;k++){const y=lv(k),x0=CX-2.8,x1=CX+2.8,ys=y+.135;
  // front wall: window [WX-.65,WX+.65]x[.92,1.86], door [CX+.75,CX+1.65]x[0,2.2]
  let segs=[[x0,x1]];const hole=(a,b)=>{segs=segs.flatMap(([p,q])=>q<=a||p>=b?[[p,q]]:[[p,a],[b,q]].filter(([u,v])=>v-u>.05))};
  if(cut(y,.92,1.86))hole(WX-.65,WX+.65);if(cut(y,0,2.15))hole(CX+.75,CX+1.65);
  segs.forEach(([p,q])=>logX(WZ,y,p,q));logX(CZ+2,y,x0,x1);
  if(ys<2.45){logZ(CX-2.5,ys,CZ-2.3,CZ+2.3);logZ(CX+2.5,ys,CZ-2.3,CZ+2.3)}}
 // gables + round attic window
 for(const z of[WZ,CZ+2]){tri([CX-2.7,2.45,z],[CX+2.7,2.45,z],[CX,3.72,z],[.6,.4,.24]);blob(CX,3.02,z+(z<CZ?-.03:.03),.2,.2,.04,[1,.75,.35],2+3,ICO1)}
 // roof slabs + shingle rows
 const th=atan2(1.45,3.1),Lr=hypot(1.45,3.1);
 for(const sg of[-1,1]){const M=MM(T(CX,3.78,CZ),Rz(-sg*th));
  put(BOX,MM(M,T(sg*Lr/2,0,0),S(Lr/2+.05,.08,2.55)),ROOF,0,0,.05);
  for(let r=0;r<7;r++)for(let c=0;c<10;c++)put(BOX,MM(M,T(sg*(r+.5)*Lr/7,.1,-2.55+(c+.5+(r%2)*.5)*.51),S(Lr/14+.02,.03,.24)),vary(r%2?[.7,.25,.15]:[.58,.19,.12],.15),0,0,0)}
 for(let i=0;i<40;i++){const sg=R()<.5?-1:1,u=R()*Lr,z=CZ-2.4+R()*4.8;const p=[CX+sg*u*cos(th),3.92-u*sin(th),z];
  tri(p,add(p,[.12,0,.05]),add(p,[.03,.02,.13]),LEAFK[floor(R()*4)],1)}
 // chimney
 box(CX+1.1,2.4,CZ+1.3,CX+1.7,4.45,CZ+1.9,[.5,.47,.44],0,.15);box(CX+1.05,4.4,CZ+1.25,CX+1.75,4.55,CZ+1.95,[.42,.4,.38]);
 // window frame, sill, shutters, crate
 box(WX-.78,.82,WZ-.32,WX+.78,.92,WZ+.2,CREAM);box(WX-.75,1.86,WZ-.22,WX+.75,1.97,WZ+.2,CREAM);
 box(WX-.73,.92,WZ-.22,WX-.65,1.86,WZ+.2,CREAM);box(WX+.65,.92,WZ-.22,WX+.73,1.86,WZ+.2,CREAM);
 for(const s of[-1,1]){const x0=WX+s*.76,x1=WX+s*1.36;box(min(x0,x1),.94,WZ-.24,max(x0,x1),1.84,WZ-.19,[.27,.5,.46]);
  box(min(x0,x1)+.05,1.36,WZ-.26,max(x0,x1)-.05,1.42,WZ-.23,[.22,.4,.37])}
 box(CRATE[0]-.4,0,CRATE[2]-.27,CRATE[0]+.4,.45,CRATE[2]+.27,[.7,.5,.3]);
 for(const y of[.1,.22,.34])box(CRATE[0]-.41,y,CRATE[2]-.28,CRATE[0]+.41,y+.04,CRATE[2]+.28,[.55,.37,.22],0,0);
 // door, wreath, lantern, step
 box(CX+.75,0,WZ-.1,CX+1.65,2.2,WZ+.1,[.5,.24,.14]);for(let i=0;i<4;i++)box(CX+.75+i*.225+.01,.05,WZ-.13,CX+.75+i*.225+.03,2.15,WZ-.1,[.38,.18,.1],0,0);
 for(let i=0;i<12;i++){const a=i/12*TAU;blob(CX+1.2+cos(a)*.2,1.5+sin(a)*.2,WZ-.15,.06,.06,.05,LEAFK[i%5],0,ICO0)}
 box(CX+1.08,1.0,WZ-.17,CX+1.12,1.1,WZ-.12,[.85,.7,.3]);
 box(CX+1.85,1.75,WZ-.32,CX+2.05,2.0,WZ-.12,[1,.7,.3],2+5);box(CX+1.83,2,WZ-.34,CX+2.07,2.05,WZ-.1,[.15,.12,.1]);
 box(CX+.6,0,WZ-.6,CX+1.8,.12,WZ-.15,[.55,.52,.48]);
 // pumpkins, woodpile
 for(const[x,z,s]of[[CX+2.2,WZ-.7,.28],[CX+2.6,WZ-.45,.2],[CX+.25,WZ-.55,.17],[WX-1.4,WZ-.6,.22]]){blob(x,s*.7,z,s,s*.7,s,[.95,.5,.1],0,ICO1);put(CYL5,MM(T(x,s*1.3,z),S(.025,.09,.025)),[.35,.4,.15])}
 for(let r=0;r<4;r++)for(let c=0;c<6-r;c++)put(CYL6,MM(T(CX+2.75,.15+r*.26,CZ-1.2+c*.27+r*.13),Rz(-PI/2),S(.13,.5,.13)),vary([.6,.42,.26],.2));
 // floor + rug
 for(let i=0;i<16;i++)box(CX-2.4+i*.3,0,CZ-1.95,CX-2.4+i*.3+.29,.06,CZ+1.95,vary(i%2?[.52,.33,.2]:[.6,.4,.24],.1),0,0);
 box(CAKE[0]-1.1,.06,CAKE[2]-.9,CAKE[0]+1.1,.075,CAKE[2]+.9,[.7,.2,.15]);box(CAKE[0]-.95,.07,CAKE[2]-.75,CAKE[0]+.95,.08,CAKE[2]+.75,[.9,.75,.5]);
 box(CAKE[0]-.85,.075,CAKE[2]-.65,CAKE[0]+.85,.085,CAKE[2]+.65,[.75,.25,.18]);
 // table, chair, tablecloth
 const [kx,,kz]=CAKE;box(kx-.62,.7,kz-.45,kx+.62,.76,kz+.45,WOOD);
 for(const a of[-1,1])for(const b of[-1,1])box(kx+a*.55-.04,0,kz+b*.38-.04,kx+a*.55+.04,.7,kz+b*.38+.04,[.45,.28,.16]);
 box(kx-.3,.761,kz-.47,kx+.3,.765,kz+.47,[.95,.92,.85]);
 box(kx-1.15,.42,kz-.22,kx-.75,.47,kz+.22,WOOD);box(kx-1.17,.47,kz-.22,kx-1.12,1.,kz+.22,WOOD);
 for(const b of[-1,1])box(kx-1.14,0,kz+b*.18-.03,kx-1.08,.42,kz+b*.18+.03,WOOD),box(kx-.82,0,kz+b*.18-.03,kx-.76,.42,kz+b*.18+.03,WOOD);
 // cake: plate, two tiers, frosting, drips, strawberries, candles (flames are dynamic)
 const y0=.766;put(CYL12,MM(T(kx,y0,kz),S(.36,.02,.36)),[.9,.93,.97],0,0,.02);
 put(CYL12,MM(T(kx,y0+.02,kz),S(.27,.15,.27)),[.98,.82,.78],0,0,.03);
 put(CYL12,MM(T(kx,y0+.17,kz),S(.185,.11,.185)),[1,.95,.88],0,0,.03);
 for(let i=0;i<16;i++){const a=i/16*TAU;blob(kx+cos(a)*.265,y0+.165,kz+sin(a)*.265,.035,.03,.035,[1,.97,.93],0,ICO0);
  blob(kx+cos(a+.2)*.272,y0+.12-(i%3)*.02,kz+sin(a+.2)*.272,.022,.045+(i%3)*.012,.022,[.95,.55,.65],0,ICO1)}
 for(let i=0;i<9;i++){const a=i/9*TAU+.3;blob(kx+cos(a)*.225,y0+.19,kz+sin(a)*.225,.028,.032,.028,[.9,.12,.15],0,ICO1);
  put(CONE4,MM(T(kx+cos(a)*.225,y0+.215,kz+sin(a)*.225),S(.02,.025,.02)),[.3,.6,.2])}
 for(let i=0;i<12;i++){const a=i/12*TAU;blob(kx+cos(a)*.18,y0+.28,kz+sin(a)*.18,.022,.02,.022,[.95,.6,.7],0,ICO0)}
 const CK=[[1,.6,.7],[.6,.8,1],[1,.88,.45],[.7,.92,.7],[.85,.7,1],[1,.75,.5]];
 for(let i=0;i<6;i++){const a=i/6*TAU,x=kx+cos(a)*.105,z=kz+sin(a)*.105;
  for(let j=0;j<3;j++)put(CYL6,MM(T(x,y0+.28+j*.03,z),S(.011,.03,.011)),j%2?[1,1,1]:CK[i],0,0,0);put(CYL5,MM(T(x,y0+.37,z),S(.002,.015,.002)),[.1,.1,.1])}
 // presents + mug
 box(kx+.32,.765,kz-.3,kx+.5,.93,kz-.12,[.55,.75,.95]);box(kx+.4,.765,kz-.305,kx+.42,.935,kz-.115,[1,.95,.6]);box(kx+.315,.765,kz-.22,kx+.505,.935,kz-.2,[1,.95,.6]);
 box(kx-.52,.765,kz+.1,kx-.36,.88,kz+.3,[.98,.6,.65]);box(kx-.45,.765,kz+.095,kx-.43,.885,kz+.305,[1,1,1]);
 put(CYL8,MM(T(kx+.35,.765,kz+.25),S(.05,.1,.05)),[.9,.85,.75]);
 // lamp over table
 put(CYL5,MM(T(kx,2,kz),S(.006,1.25,.006)),[.15,.12,.1]);put(CONE7,MM(T(kx,1.86,kz),S(.24,.22,.24)),[.35,.55,.45]);blob(kx,1.88,kz,.06,.06,.06,[1,.85,.55],2+5);
 // fireplace
 const fx=CX+1.3,fz=CZ+1.84;box(fx-.65,0,fz-.5,fx+.65,1.3,fz+.1,[.55,.52,.5],0,.18);box(fx-.4,.1,fz-.52,fx+.4,.75,fz-.3,[.08,.05,.04]);
 box(fx-.75,1.3,fz-.6,fx+.75,1.4,fz+.1,WOOD);box(fx-.35,1.4,fz-.25,fx+.35,2.45,fz+.1,[.55,.52,.5],0,.18);
 for(let i=0;i<3;i++)put(CYL6,MM(T(fx-.25,.15+i*.04,fz-.42+i*.05),Rz(-PI/2),Ry(i*.5),S(.05,.5,.05)),[.35,.2,.12]);
 put(CYL8,MM(T(fx-.5,1.4,fz-.3),S(.05,.12,.05)),[.9,.85,.7]);put(CYL8,MM(T(fx+.5,1.4,fz-.3),S(.06,.16,.06)),[.4,.6,.8]);
 // armchair + blanket
 box(fx-.3,.0,CZ-.2,fx+.4,.45,CZ+.6,[.6,.3,.25]);box(fx+.3,.45,CZ-.2,fx+.45,1.05,CZ+.6,[.6,.3,.25]);box(fx-.32,.45,CZ+.05,fx+.3,.5,CZ+.5,[.95,.85,.55]);
 // shelf with jars and books
 const sx=CX-2.3;for(const y of[1.25,1.7]){box(sx,y,CZ-.6,sx+.28,y+.04,CZ+1.0,WOOD);
  for(let i=0;i<5;i++){const z=CZ-.45+i*.3;if(i%2)put(CYL8,MM(T(sx+.14,y+.04,z),S(.06,.14+R()*.06,.06)),vary([[.9,.6,.2],[.6,.3,.5],[.4,.6,.3]][i%3],.2));
   else box(sx+.04,y+.04,z-.1,sx+.24,y+.25,z+.08,vary([.3,.4,.6],.4))}}
 // bunting + fairy lights near the ceiling
 const BC=[[1,.62,.7],[1,.86,.45],[.6,.88,.8],[.78,.68,1],[1,.7,.5]];
 const string=(a,b,n,fl)=>{for(let i=0;i<n;i++){const u=i/n,v=(i+1)/n,p=L3(a,b,u+.5/n);p[1]-=sin(PI*(u+.5/n))*.25;
  if(fl){const q=L3(a,b,u),r=L3(a,b,v);q[1]-=sin(PI*u)*.25;r[1]-=sin(PI*v)*.25;tri(q,r,add(p,[0,-.2,0]),BC[i%5],1)}
  else blob(p[0],p[1]-.03,p[2],.025,.025,.025,[1,.8,.45],2+5,ICO0)}};
 string([CX-2.3,2.3,WZ+.3],[CX+2.3,2.3,WZ+.3],14,1);string([CX-2.3,2.32,CZ+1.7],[CX+2.3,2.3,CZ-.2],14,1);
 string([CX-2.3,2.42,WZ+.22],[CX-2.3,2.42,CZ+1.75],18,0);string([CX-2.3,2.42,CZ+1.75],[CX+2.3,2.42,CZ+1.75],18,0);string([CX-2.3,2.38,WZ+.22],[CX+2.3,2.38,WZ+.22],18,0);
 // curtains
 for(const s of[-1,1])for(let i=0;i<3;i++)box(WX+s*(.52+i*.08)-.04,.88,WZ+.18,WX+s*(.52+i*.08)+.04,1.95,WZ+.25,i%2?[1,.95,.9]:[.8,.25,.22],0,0);
 PROBE.push([CX-2.66,0,WZ-.2,WX-.65,2.6,WZ+.2],[WX+.65,0,WZ-.2,CX+2.66,2.6,WZ+.2],[WX-.65,0,WZ-.32,WX+.65,.92,WZ+.2],[WX-.65,1.86,WZ-.2,WX+.65,2.6,WZ+.2],
  [kx-.62,0,kz-.45,kx+.62,1.15,kz+.45],[CX-2.66,0,CZ+1.84,CX+2.66,2.6,CZ+2.2],[fx-.75,0,fz-.6,fx+.75,2.45,fz+.1],[sx,1.2,CZ-.6,sx+.28,2,CZ+1],[kx-1.17,0,kz-.22,kx-.75,1,kz+.22])}
// ---------- GL
const cv=document.getElementById('c'),gl=cv.getContext('webgl2',{antialias:false,alpha:false});
if(!gl){document.getElementById('st').innerHTML='<p>WebGL2 is needed to watch this.</p>';return}
const FLT=!!gl.getExtension('EXT_color_buffer_float');
const SKYF=`vec3 sky(vec3 r){float s=max(dot(r,uSun),0.),y=r.y;
vec3 c=mix(vec3(1.3,.68,.36),vec3(.34,.44,.72),pow(clamp(y+.02,0.,1.),.5));c=mix(c,vec3(.62,.4,.33),clamp(-y*4.,0.,1.));
return c+vec3(1.4,.62,.22)*pow(s,5.)+vec3(1.3,.85,.45)*pow(s,48.);}`;
const VS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec4 aC;uniform mat4 uVP,uM;uniform vec4 uK;uniform float uT;out vec3 vP;out vec4 vC;
void main(){vec4 w=uM*vec4(aP,1);vC=vec4(aC.rgb*uK.rgb,aC.a+uK.a);
if(abs(vC.a-1.)<.5&&w.y>2.){float k=(w.y-2.)*.02;w.xz+=vec2(sin(uT*1.4+w.x*.3+w.z*.2),cos(uT*1.1+w.z*.3))*k;}
vP=w.xyz;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;in vec3 vP;in vec4 vC;out vec4 o;
uniform vec3 uCam,uSun,uWin,uCabA,uCabB,uLp[3],uLc[3];uniform mat4 uLVP;uniform highp sampler2DShadow uSh;uniform float uFog;
${SKYF}
void main(){vec3 n=normalize(cross(dFdx(vP),dFdy(vP)));vec3 a=pow(max(vC.rgb,0.),vec3(2.2));float m=vC.a;
vec3 V=uCam-vP;float d=length(V);V/=d;vec3 c;
float ins=float(all(greaterThan(vP,uCabA))&&all(lessThan(vP,uCabB)));
if(m>1.5)c=a*(m-1.);else{
vec4 q=uLVP*vec4(vP+n*.03,1);vec3 l=q.xyz*.5+.5;float sh=1.;
if(all(lessThan(abs(l-.5),vec3(.499)))){sh=0.;for(int i=0;i<4;i++)sh+=texture(uSh,vec3(l.xy+(vec2(i&1,i>>1)-.5)/1500.,l.z-.0006));sh*=.25;}
vec3 sc=vec3(3.,1.85,.95),amb=mix(vec3(.32,.19,.1),vec3(.34,.37,.56),n.y*.5+.5)*.45;
amb=mix(amb,vec3(.07,.04,.025),ins*.9);
c=a*(sc*max(dot(n,uSun),0.)*sh+amb);
if(m>.5)c+=a*sc*pow(max(dot(-V,uSun),0.),3.)*(.25+.6*sh);
for(int i=0;i<3;i++){vec3 L=uLp[i]-vP;float e=length(L);c+=a*uLc[i]*(max(dot(n,L/e),0.)*.8+.2)/(1.+e*e*2.)*ins;}
vec3 w=vP-uWin;if(w.z<0.&&ins<.5){vec3 u=-normalize(w);c+=a*vec3(2.4,1.3,.5)*max(dot(n,u),0.)*pow(max(u.z,0.),1.5)/(1.+dot(w,w)*1.3);}}
vec3 fc=sky(-V);fc=mix(fc,min(fc,vec3(1.5,1.,.65)),.6);c=mix(c,fc*.85,1.-exp(-d*uFog*exp(-.1*max(min(vP.y,uCam.y),0.))));o=vec4(c,1);}`;
const LVS=`#version 300 es
layout(location=0) in vec3 aP;uniform mat4 uVP;uniform vec3 uFoc,uCabA,uCabB,uCam;uniform float uLT;out vec3 vP;out vec4 vC;
float h(float n){return fract(sin(n)*43758.5453);}mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
void main(){float i=float(gl_InstanceID);vec3 r=vec3(h(i*1.13+.1),h(i*2.71+.3),h(i*3.37+.7));const vec3 B=vec3(30,11,30);float t=uLT*(.8+r.x*.4);
vec3 p=vec3(r.x*B.x+t*.45+sin(t*.8+i)*.7,r.y*B.y-t*(.4+r.z*.3),r.z*B.z+cos(t*.6+i*1.7)*.7);p=mod(p-uFoc+B*.5,B)-B*.5+uFoc;
vec3 q=aP*(.8+r.y*.6)*smoothstep(.35,1.3,distance(p,uCam));q.xy*=r2(t*1.7+i);q.yz*=r2(t*1.3+i*2.);vec3 w=p+q;
float k=h(i*5.3);vC=vec4(k<.4?vec3(.96,.46,.1):k<.6?vec3(.86,.24,.08):k<.85?vec3(.98,.7,.18):vec3(.62,.32,.12),1);vP=w;
gl_Position=all(greaterThan(p,uCabA-.4))&&all(lessThan(p,uCabB+.4))?vec4(0,0,-2,1):uVP*vec4(w,1);}`;
const QVS=`#version 300 es
void main(){vec2 p=vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.;gl_Position=vec4(p,1,1);}`;
const SKYFS=`#version 300 es
precision highp float;out vec4 o;uniform vec3 uSun,uF,uR,uU;uniform vec2 uRes;uniform float uTF,uAs,uT;
${SKYF}
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+1.),f.x),f.y);}
void main(){vec2 p=gl_FragCoord.xy/uRes*2.-1.;vec3 r=normalize(uF+p.x*uTF*uAs*uR+p.y*uTF*uU);vec3 c=sky(r);float s=max(dot(r,uSun),0.);
if(r.y>0.){vec2 q=r.xz/(r.y+.12)*vec2(1.,2.5)+vec2(uT*.01,0);float n=vn(q)*.55+vn(q*2.3+3.)*.3+vn(q*5.1)*.15;
float cv=smoothstep(.5,.78,n)*smoothstep(0.,.08,r.y)*(1.-smoothstep(.35,.7,r.y));
c=mix(c,mix(vec3(.85,.42,.45),vec3(1.7,1.,.55),pow(s,4.)*.8+.2),cv*.75);}
c+=vec3(30,20,10)*smoothstep(.9993,.9996,s);o=vec4(c,1);}`;
const PFS=`#version 300 es
precision highp float;out vec4 o;uniform sampler2D uS;uniform vec2 uRes,uSP;uniform float uSI,uFd,uT;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 u=gl_FragCoord.xy/uRes;vec3 c=texture(uS,u).rgb;
vec3 b=textureLod(uS,u,2.).rgb*.25+textureLod(uS,u,4.).rgb*.35+textureLod(uS,u,6.).rgb*.4;c+=max(b-.85,0.)*.7+b*.05;
if(uSI>0.){vec2 dl=(uSP-u)/48.,p=u;float a=0.,w=1.;for(int i=0;i<48;i++){p+=dl;vec3 s=textureLod(uS,clamp(p,0.,1.),1.).rgb;a+=max(dot(s,vec3(.3,.5,.2))-1.3,0.)*w;w*=.965;}c+=vec3(1.,.6,.28)*a*uSI*.045;}
c=c*(2.51*c+.03)/(c*(2.43*c+.59)+.14);c=pow(clamp(c,0.,1.),vec3(1./2.2));
c=mix(vec3(dot(c,vec3(.3,.55,.15))),c,1.15);c=mix(c,c*vec3(1.06,1.,.88),.6)+vec3(.03,.012,.04)*(1.-c);float v=length(u-.5);c*=1.-.9*v*v*v;
c+=(h(u*uRes+fract(uT*7.)*91.)-.5)*.045;o=vec4(c*uFd,1);}`;
function prog(vs,fs){const p=gl.createProgram();for(const[t,s]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);
 if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));return{p,u:{}}}
const PM=prog(VS,FS),PSH=prog(VS,`#version 300 es
precision mediump float;void main(){}`),PL2=prog(LVS,FS),PSK=prog(QVS,SKYFS),PPO=prog(QVS,PFS);
let cur;const use=P=>{gl.useProgram(P.p);cur=P},loc=n=>n in cur.u?cur.u[n]:(cur.u[n]=gl.getUniformLocation(cur.p,n));
const U=(n,...v)=>{const l=loc(n);if(l)gl['uniform'+v.length+'f'](l,...v)},UM=(n,m)=>gl.uniformMatrix4fv(loc(n),false,m),U3v=(n,a)=>gl.uniform3fv(loc(n),a);
// buffers
const vao=(data,stride,cols)=>{const v=gl.createVertexArray();gl.bindVertexArray(v);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,stride,0);if(cols){gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,stride,12)}
 gl.bindVertexArray(null);return{v,n:data.length*4/stride}};
const WORLD=vao(new Float32Array(GP),28,1);GP.length=0;
const flat=me=>new Float32Array(me.f.flatMap(f=>f.flatMap(i=>me.v[i])));
const MESH={i:vao(flat(ICO1),12),c:vao(flat(CONE4),12),y:vao(flat(CYL8),12),f:vao(flat(icoM(0)),12),
 l:vao(new Float32Array([0,0,.11,-.06,.012,0,0,.02,-.07, 0,0,.11,0,.02,-.07,.06,.012,0]),12),
 m:vao(new Float32Array([0,0,0,-.1,.02,.13,0,.01,.22, 0,0,0,0,.01,.22,.1,.02,.13, 0,0,0,-.16,.01,.04,-.1,.02,.13, 0,0,0,.1,.02,.13,.16,.01,.04, 0,0,0,-.06,0,-.08,.06,0,-.08]),12)};
// render targets
const SMS=2048,shT=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shT);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,SMS,SMS);
for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE],[gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
const shF=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shF);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shT,0);
let W=0,Hh=0,msF,rsF,rsT;const IF=FLT?gl.RGBA16F:gl.RGBA8;
function resize(){const d=min(devicePixelRatio||1,1.5),w=min(innerWidth*d|0,2560),h=min(innerHeight*d|0,1440);if(w==W&&h==Hh)return;W=cv.width=w;Hh=cv.height=h;
 if(msF){gl.deleteFramebuffer(msF);gl.deleteFramebuffer(rsF);gl.deleteTexture(rsT)}
 const smp=min(4,gl.getParameter(gl.MAX_SAMPLES));msF=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,msF);
 const c=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,c);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,smp,IF,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,c);
 const z=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,z);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,smp,gl.DEPTH_COMPONENT24,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,z);
 rsT=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,rsT);gl.texStorage2D(gl.TEXTURE_2D,1+floor(Math.log2(max(w,h))),IF,w,h);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 rsF=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,rsF);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,rsT,0)}
// ---------- fox timeline (pure functions of t)
const HOP=1.2,prof=t=>sm(10,11.5,t)*(1-sm(44.3,45.2,t))+sm(49,50.2,t)*(1-sm(70.2,72.2,t));
const SI=[0];for(let i=1;i<=13000;i++)SI.push(SI[i-1]+prof(i*.01)*.01);const SB=(PL-HOP)/SI[13000];
const sOf=t=>{const i=cl(t/.01,0,12999),k=floor(i);return SB*mix(SI[k],SI[k+1],i-k)+HOP*sm(47.6,48.3,t)};
const S_LAND=sOf(48.4),LEAF_AT=add(P(S_LAND+.12),[0,.015,0]);
function fox(t){const s=sOf(t),p=P(s),fw=TG(s),sp=prof(t),st={s,pos:p,yaw:atan2(fw[0],fw[2]),fw,y:0,pitch:0,crouch:0,wig:0,hy:0,hp:0,ht:0,legs:[0,0,0,0],wag:.12,wf:3,lift:0};
 const ph=s/.52*TAU,am=.55*min(1,sp*1.3);st.legs=[sin(ph)*am,-sin(ph)*am,-sin(ph)*am,sin(ph)*am];st.y=abs(cos(ph))*.025*min(1,sp*2);st.lift=sin(ph*2)*.08*sp;
 st.hp=-.05+sin(ph*2)*.03*sp;
 if(t>12&&t<20)st.hy=sin(t*.9)*.15;
 // the falling leaf: watch it, crouch, butt-wiggle, pounce on the downbeat
 if(t>42.5&&t<50){const w=sm(42.5,43.5,t)*(1-sm(48.8,49.6,t));st.hp=mix(st.hp,mix(-.55,.45,sm(43.5,46.8,t)),w);st.ht=.35*sm(43.8,44.4,t)*(1-sm(45.6,46.2,t));
  st.crouch=.08*sm(45.4,46,t)*(1-sm(47.45,47.65,t));st.wig=sin(t*24)*.16*sm(46.3,46.6,t)*(1-sm(47.3,47.5,t));
  const u=cl((t-47.6)/.7);if(u>0&&u<1){st.y=sin(PI*u)*.32;st.legs=[-.9,-.9,.8,.8].map(a=>a*sin(PI*u));st.pitch=.25*cos(PI*u)}
  if(t>48.3)st.wag=.3,st.wf=8}
 // arrive, hop onto the crate, look back at the camera, rear up to peek in the window
 if(t>72.4){const u=sm(72.6,73.25,t),e=P(PL);st.pos=[mix(e[0],CRATE[0],u),0,mix(e[2],CRATE[2],u)];st.y=CRATE[1]*u+sin(PI*u)*.3;st.yaw=0;st.fw=[0,0,1];
  if(u>0&&u<1)st.legs=[-.7,-.7,.6,.6].map(a=>a*sin(PI*u));else st.legs=[0,0,0,0];
  const lb=sm(76.4,77.2,t)*(1-sm(79.6,80.4,t)),re=sm(80.8,82,t);
  st.hp=mix(-.15,.1,lb);st.hy=-2*lb;st.yaw=-.35*lb*(1-re);st.ht=.4*lb+.18*sin(t*.7)*sm(95,97,t);st.wag=.12+.22*lb+.15*re;st.wf=3+6*lb+3*re;
  st.pitch=.9*re;st.hp+=.9*re-.08*re;st.legs=[-.35*re,-.35*re,.9*re*.0,0].map((a,i)=>i<2?a:st.pitch*.95);}
 // blink
 st.bl=(t%4.1<.12&&(t<76||t>80.5))?.15:1;return st}
// ---------- dynamic draw list: [mesh, matrix, rgb, material]
const OR=[.95,.45,.13],WH=[1,.95,.88],DK=[.15,.09,.07],BK=[.03,.025,.025],INR=[.5,.25,.18];
function dyn(t){const D=[],st=fox(t),E=(M,x,y,z,a,b,c,k,m=0,me='i')=>D.push([me,MM(M,T(x,y,z),S(a,b,c)),k,m]);
 const root=MM(T(st.pos[0],st.y-st.crouch,st.pos[2]),Ry(st.yaw)),hip=[0,.32,-.15],body=MM(root,T(...hip),Rx(-st.pitch),Ry(st.wig),T(0,-.32,.15));
 E(body,0,.37,0,.16,.15,.29,OR);E(body,0,.35,.15,.13,.13,.15,WH);E(body,0,.31,.0,.11,.07,.2,WH);
 [[.085,.17],[-.085,.17],[.085,-.17],[-.085,-.17]].forEach(([x,z],i)=>{const L=MM(body,T(x,.31,z),Rx(st.legs[i]));
  E(L,0,-.07,0,.05,.1,.055,OR);E(L,0,-.21,0,.036,.1,.04,DK);E(L,0,-.29,.02,.042,.026,.055,DK)});
 const Hd=MM(body,T(0,.5,.25),Ry(st.hy),Rx(st.hp),Rz(st.ht));
 E(Hd,0,.08,.06,.17,.15,.16,OR);for(const s of[-1,1]){E(Hd,s*.1,.02,.11,.085,.075,.085,WH);
  E(Hd,s*.072,.11,.195,.03,.04*st.bl,.022,BK);if(st.bl>.5)E(Hd,s*.072+.012,.127,.213,.01,.011,.006,[1,1,1],3);
  const ear=MM(Hd,T(s*.09,.18,.03),Rz(-s*.32),Rx(-.1+.06*sin(t*3+s)));E(ear,0,0,0,.07,.18,.035,OR,0,'c');E(ear,0,.005,.012,.045,.13,.02,INR,0,'c');E(ear,0,.115,0,.026,.066,.021,BK,0,'c');
  }
 E(Hd,0,.02,.2,.07,.055,.09,WH);E(Hd,0,.045,.285,.027,.022,.02,BK);E(Hd,0,-.025,.24,.03,.012,.03,DK);
 let M=MM(body,T(0,.42,-.25),Rx(mix(1.05,.68,min(1,prof(t)*1.5))+st.lift-st.pitch*.5));const TR=[.05,.075,.1,.12,.135,.14,.135,.12,.095,.058];
 TR.forEach((r,i)=>{M=MM(M,Ry(sin(t*st.wf-i*.5)*st.wag*(.3+i*.12)),Rx(i?-.17:0));E(M,0,0,-.04,r,r*.92,r*1.55,i>8?WH:i>7?[1,.82,.6]:OR);M=MM(M,T(0,0,-.08))});
 // hero leaf: falls in front of the fox and is caught on the downbeat of bar 16
 {const u=cl((t-42.2)/4.9),p=add(LEAF_AT,[sin(t*1.9)*.35*(1-u),2.4*(1-u)**1.3,cos(t*1.3)*.2*(1-u)]);
  if(t>42&&t<62)D.push(['m',MM(T(...p),Ry(t*(1-u)*2),Rx(sin(t*3)*.6*(1-u)),S(1.6)),[1,.3,.06],1])}
 // candle flames, fire, lamp, chimney smoke
 const fl=k=>1+.12*sin(t*13+k)+.08*sin(t*21.7+k*3);
 for(let i=0;i<6;i++){const a=i/6*TAU,x=CAKE[0]+cos(a)*.105,z=CAKE[2]+sin(a)*.105,f=fl(i);
  E(MM(T(x,1.153,z),Rz(sin(t*7+i)*.08)),0,0,0,.011,.03*f,.011,[1,.62,.22],8);E(T(x,1.147,z),0,0,0,.005,.012,.005,[1,.95,.75],12)}
 for(let i=0;i<5;i++){const f=fl(i*2)+.2*sin(t*9+i);E(MM(T(CX+1.05+i*.12,.2,CZ+1.47),Rz(sin(t*5+i)*.15)),0,0,0,.06,.3*f*(1-abs(i-2)*.18),.05,i%2?[1,.45,.1]:[1,.7,.2],7,'c')}
 for(let i=0;i<7;i++){const a=(t*.11+i/7)%1,s=(.18+a*.5)*(1-a**3);E(T(CX+1.4+a*1.2+sin(t*.7+i)*.15,4.6+a*3.6,CZ+1.6+a*.6),0,0,0,s,s*.85,s,[.85,.8,.78],0,'f')}
 return{D,st}}
// ---------- camera: shots blended over short windows (pure function of t)
const up=(p,h)=>[p[0],p[1]+h,p[2]],FH=st=>up(st.pos,st.y+.5);
const rt=f=>[-f[2],0,f[0]];
const shots=[
 [0,t=>{const u=sm(0,12,t),e0=up(P(7.5),1.1),e1=up(P(4.2),.48);return[L3(e0,e1,u),L3(add(e0,[-9,4.2,-3.5]),up(P(0),.38),sm(4,11.5,t)),mix(56,44,u)]}],
 [11.2,t=>{const st=fox(t),s=st.s;return[add(up(P(s+2.35+(t-12)*.03),.46),scl(rt(TG(s+2)),.25)),up(st.pos,.4),42]},1.2],
 [21,t=>{const st=fox(t),u=sm(21,27,t),th=PI*u,R2=mix(2.35,2.9,u),d=add(scl(st.fw,cos(th)),scl(rt(st.fw),sin(th)));
  return[up(add(st.pos,scl(d,R2)),mix(.46,1.,u)),up(add(st.pos,scl(st.fw,2.5*u*u*u)),.4),mix(42,52,u)]},.6],
 [27,t=>{const st=fox(t),s=st.s,w=sm(43.6,45,t)*(1-sm(49.4,51.5,t)),pm=P(sOf(46)+.6),f=TG(sOf(46));
  const e=add(up(P(s-2.8),1+.06*sin(t*.7)),scl(rt(TG(s-2.8)),.35)),g=up(P(s+3),.45);
  return[L3(e,add(up(pm,.55),add(scl(rt(f),-2.1),scl(f,-.3))),w),L3(g,up(pm,.22),w),mix(52,46,w)]},.5],
 [60,t=>{const st=fox(t),s=st.s,u=sm(60.5,68,t);return[add(up(P(s-3.2),mix(1,2.3,u)),scl(rt(TG(s-3.2)),.35)),L3(up(P(s+3),.45),[WX,1.2,WZ],u),52]},1],
 [72.6,t=>{const ws=[WX+.28,1.42,WZ-1.7],e=add(CRATE,[-1.95+.2*sm(72.6,80,t),.5+.1*sm(72.6,80,t),-.75]),f=add(CRATE,[0,.52,.05]);
  const u=sm(80.6,84,t);return[L3(e,ws,u),L3(f,[WX+.1,1.35,WZ+2.5],u),mix(44,50,u)]},0],
 [84,t=>{const u=sm(84,92.5,t);return[L3([WX+.28,1.42,WZ-1.7],[WX+.12,1.32,WZ+.95],u),L3([WX+.1,1.35,WZ+2.5],add(CAKE,[0,.05,0]),sm(.35,1,u)),mix(50,54,u)]},.3],
 [92.5,t=>{const u=sm(92.5,108,t),a=mix(.1,PI-.22,u),Rr=mix(1.2,.8,sm(92.5,99,t))+mix(0,.45,sm(99,108,t)),h=mix(.32,.12,sm(92.5,98,t))+mix(0,.22,sm(98,108,t));
  const e=add(CAKE,[sin(a)*Rr,h,-cos(a)*Rr]),g=L3(add(CAKE,[0,.07,0]),[WX-.75,1.25,mix(CAKE[2],WZ,.5)],sm(101,109,t));
  return[e,add(g,[0,.03*sin(t*.5),0]),mix(54,46,sm(100,110,t))]},.8]];
function cam(t){let i=0;while(i<shots.length-1&&t>=shots[i+1][0])i++;let[e,g,f]=shots[i][1](t);
 const bl=shots[i][2];if(i&&bl&&t<shots[i][0]+bl){const[e0,g0,f0]=shots[i-1][1](t),k=sm(shots[i][0],shots[i][0]+bl,t);e=L3(e0,e,k);g=L3(g0,g,k);f=mix(f0,f,k)}
 return{e,g,f}}
window.__probe={dur:126,cam:t=>cam(t).e,boxes:PROBE};
// ---------- captions
const HK=[[1.2,10.2,['秋の小径'],['a little autumn walk'],'t'],
 [14.5,24,['落ち葉舞う','金色の森','狐ゆく'],['falling leaves dancing —','through the golden forest','a little fox goes'],'r'],
 [29.5,40.5,['尾をふりて','夕日を運ぶ','秋の道'],['tail swishing,','carrying the sunset','down the autumn path'],'l'],
 [50,59.5,['一葉追う','跳ねる子狐','風笑う'],['chasing one leaf','the little fox leaps —','the wind laughs'],'r'],
 [63,72.5,['森の奥','窓にともしび','誰を待つ'],['deep in the woods','a lamp in the window —','who is it waiting for?'],'l'],
 [93,101.5,['ろうそくの','灯ひとつずつ','願いこめ'],['candle by candle,','each small flame','holding a wish'],'l']];
const capEl=document.getElementById('cap');
const CAPS=HK.map(([a,b,jp,en,pos])=>{const d=document.createElement('div');d.className='hk '+pos;
 d.innerHTML=`<div class=jp>${jp.map(s=>`<span>${s}</span>`).join('')}</div><div class=en>${en.map(s=>`<span>${s}</span>`).join('')}</div>`;capEl.appendChild(d);
 return{a,b,d,ls:[...d.querySelectorAll('span')],n:jp.length}});
const endEl=document.getElementById('end'),endLs=[...endEl.children];
function captions(t){for(const c of CAPS){const on=t>c.a-1&&t<c.b+1;c.d.style.display=on?'flex':'none';if(!on)continue;
  c.ls.forEach((e,i)=>{const j=i%c.n;e.style.opacity=cl((t-c.a-j*.75)/1.1)*cl((c.b-t)/1.4)})}
 [101.8,103,104.3,110,126.5].forEach((a,i)=>endLs[i].style.opacity=cl((t-a)/1.6));endEl.style.display=t>100?'flex':'none'}
// ---------- frame
let ac,song,t0=0,started=false,ended=false;const stEl=document.getElementById('st');
const now=()=>!started?0:Q.has('freeze')?T0:MUTE?performance.now()/1e3-t0:ac.currentTime-song.base;
function go(){if(started){if(ended)location.reload();return}started=true;stEl.style.opacity=0;setTimeout(()=>stEl.style.display='none',1200);
 if(MUTE){t0=performance.now()/1e3-T0;return}ac=new AudioContext();ac.resume();song=SONG.live(ac,T0)}
if(MUTE)go();else{addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()})}
function frame(){requestAnimationFrame(frame);resize();const t=now(),lt=started?t:performance.now()/1e3;if(t>126.5)ended=true;
 const C=cam(t),E=C.e,asp=W/Hh,PR=persp(C.f*PI/180,asp,.04,320),VW=look(E,C.g),VP=mul(PR,VW),inside=inCab(E);
 const{D,st}=dyn(t);
 // sun shadow map around the action, snapped to texels
 const foc=t<71?st.pos:L3(st.pos,[CX,0,CZ],sm(71,86,t)),Rs=22,LV=look(add(foc,scl(SUN,90)),foc),tx=2*Rs/SMS;
 LV[12]=round(LV[12]/tx)*tx;LV[13]=round(LV[13]/tx)*tx;const LVP=mul(ortho(Rs,1,220),LV);
 const fl=1+.12*sin(t*13)+.08*sin(t*21.7),ff=1+.2*sin(t*9)+.1*sin(t*17.3);
 const LP=[CAKE[0],1.25,CAKE[2],CX+1.3,.5,CZ+1.4,CAKE[0],1.82,CAKE[2]],LC=[2.2*fl,1.15*fl,.42*fl,2.8*ff,1.1*ff,.3*ff,1.5,.95,.5];
 const draw=P=>{gl.bindVertexArray(WORLD.v);UM('uM',T(0,0,0));U('uK',1,1,1,0);gl.drawArrays(gl.TRIANGLES,0,WORLD.n);
  for(const[me,M,k,m]of D){gl.bindVertexArray(MESH[me].v);UM('uM',M);U('uK',...k,m);gl.drawArrays(gl.TRIANGLES,0,MESH[me].n)}};
 gl.vertexAttrib4f(1,1,1,1,0);
 // shadow pass
 gl.bindFramebuffer(gl.FRAMEBUFFER,shF);gl.viewport(0,0,SMS,SMS);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.5,3);use(PSH);UM('uVP',LVP);U('uT',t);draw();gl.disable(gl.POLYGON_OFFSET_FILL);
 // main pass
 gl.bindFramebuffer(gl.FRAMEBUFFER,msF);gl.viewport(0,0,W,Hh);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const fw=nrm(sub(C.g,E)),rr=nrm(cross(fw,[0,1,0])),uu=cross(rr,fw);
 gl.disable(gl.DEPTH_TEST);use(PSK);U('uSun',...SUN);U('uF',...fw);U('uR',...rr);U('uU',...uu);U('uRes',W,Hh);U('uTF',Math.tan(C.f*PI/360));U('uAs',asp);U('uT',t);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.DEPTH_TEST);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shT);
 const common=()=>{UM('uVP',VP);U('uCam',...E);U('uSun',...SUN);U('uWin',...WIN);U('uCabA',...CAB_A);U('uCabB',...CAB_B);U3v('uLp',LP);U3v('uLc',LC);
  UM('uLVP',LVP);gl.uniform1i(loc('uSh'),1);U('uFog',inside?.002:.015);U('uT',t)};
 use(PM);common();draw();
 use(PL2);common();U('uFoc',E[0],H(E[0],E[2])+4.5,E[2]);U('uLT',lt);gl.bindVertexArray(MESH.l.v);gl.drawArraysInstanced(gl.TRIANGLES,0,6,2600);
 // resolve, mips, post
 gl.bindFramebuffer(gl.READ_FRAMEBUFFER,msF);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,rsF);gl.blitFramebuffer(0,0,W,Hh,0,0,W,Hh,gl.COLOR_BUFFER_BIT,gl.NEAREST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,rsT);gl.generateMipmap(gl.TEXTURE_2D);
 const sp=mul(VP,[1,0,0,0,0,1,0,0,0,0,1,0,...add(E,scl(SUN,100)),1]),sw=sp[15];
 use(PPO);gl.uniform1i(loc('uS'),0);U('uRes',W,Hh);U('uSP',(sp[12]/sw)*.5+.5,(sp[13]/sw)*.5+.5);U('uSI',inside||sw<0?0:sm(.2,.85,dot(fw,SUN)));
 U('uFd',(started?mix(.55,1,sm(0,2.5,t)):.55)*(1-.8*sm(119,124,t)));U('uT',t+lt);gl.disable(gl.DEPTH_TEST);gl.drawArrays(gl.TRIANGLES,0,3);
 captions(t)}
frame()})();
