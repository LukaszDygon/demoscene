// PLEASE ASSEMBLE — a 64k intro. Orthographic toy-box geometry that only works from one side.
// Impossible objects are real 3D objects pushed along the view axis; occlusion is faked per instance
// (depth offsets, depth mirroring and a stencil "seam" mask) and switched off whenever the camera turns.
(()=>{
'use strict';
const D=document,C=D.getElementById('c'),OV=D.getElementById('o'),S=D.getElementById('s');
const gl=C.getContext('webgl2',{antialias:true,stencil:true,alpha:false});
if(!gl){S.querySelector('u').textContent='WebGL2 required';return}
const X=OV.getContext('2d');
const Q=new URLSearchParams(location.search),MUTE=Q.has('mute'),T0=+Q.get('t')||0;
const {PI,sin,cos,abs,min,max,floor,sqrt,exp,round,atan2}=Math;
const cl=(x,a=0,b=1)=>x<a?a:x>b?b:x,mx=(a,b,t)=>a+(b-a)*t,ss=(a,b,x)=>(x=cl((x-a)/(b-a)),x*x*(3-2*x));
const bk=x=>(x=cl(x),1+2.70158*(x-1)**3+1.70158*(x-1)**2);
const fr=x=>x-floor(x),hs=n=>fr(sin(n*127.1+311.7)*43758.5453);
const tick=(e,k=3)=>floor(e)+bk(fr(e)*k);
const hx=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
const PAPER=hx(0xf3efe6),INK=hx(0x1f2747),WHT=hx(0xfbfaf6),COB=hx(0x2f55d4),PINK=hx(0xff6fa8),MINT=hx(0x4fd1a8),LEM=hx(0xffd23d),RED=hx(0xff5a4e),SKY=hx(0x7cc6ff),LIL=hx(0xb99cff),ORG=hx(0xff9f43);
const CAN=[COB,PINK,LEM,MINT,RED,SKY,LIL,ORG];
const l3=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),pas=(c,k=.7)=>l3(c,[1,1,1],k);
const ad=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sb=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],sc=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
 dt=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],nm=a=>sc(a,1/(Math.hypot(...a)||1));
const ryv=(p,a)=>[p[0]*cos(a)+p[2]*sin(a),p[1],-p[0]*sin(a)+p[2]*cos(a)];
const mean=P=>sc(P.reduce(ad,[0,0,0]),1/P.length);

// ---------- mat4, column major ----------
function mul(a,b){const o=Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
const ch=(...m)=>m.reduce(mul),Tm=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],Tv=p=>Tm(...p),Sm=(x,y=x,z=x)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
 Rx=a=>{const c=cos(a),s=sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]},
 Ry=a=>{const c=cos(a),s=sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]},
 Rz=a=>{const c=cos(a),s=sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]};
const xf=(m,p)=>[0,1,2,3].map(i=>m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i]);
function look(e,c,up){const z=nm(sb(e,c)),x=nm(cr(up,z)),y=cr(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dt(x,e),-dt(y,e),-dt(z,e),1]}
const ortho=(l,r,b,t,n,f)=>[2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];
const basis=(x,y,z,p)=>[...x,0,...y,0,...z,0,...p,1];

// ---------- meshes: pos3 + aux2 ----------
const BOX=[];for(let a=0;a<3;a++)for(const s of[-.5,.5]){const b=(a+1)%3,c=(a+2)%3,P=(u,w)=>{const p=[0,0,0,0,0];p[a]=s;p[b]=u;p[c]=w;return p};
 BOX.push(...P(-.5,-.5),...P(.5,-.5),...P(.5,.5),...P(-.5,-.5),...P(.5,.5),...P(-.5,.5))}
function lathe(pr,n){const v=[];for(let i=0;i<n;i++)for(let j=0;j<pr.length-1;j++){const q=[[j,i],[j,i+1],[j+1,i+1],[j+1,i]].map(([k,s])=>[pr[k][0]*cos(s/n*2*PI),pr[k][1],pr[k][0]*sin(s/n*2*PI),0,0]);
 for(const k of[0,1,2,0,2,3])v.push(...q[k])}return v}
const SPH=lathe([...Array(9)].map((_,i)=>[sin(i/8*PI)*.5,-cos(i/8*PI)*.5]),14),CYL=lathe([[0,-.5],[.5,-.5],[.5,.5],[0,.5]],20),CONE=lathe([[0,-.5],[.5,-.5],[0,.5]],20);
const MOB=[];{const nu=144,f=(u,s)=>{const r=1+s*.34*cos(u/2);return[r*cos(u),s*.34*sin(u/2),r*sin(u),u/(2*PI),s]};
 for(let i=0;i<nu;i++)for(let j=0;j<4;j++){const u0=i/nu*2*PI,u1=(i+1)/nu*2*PI,s0=j/2-1,s1=(j+1)/2-1,A=f(u0,s0),Dd=f(u0,s1),w=s=>i<nu-1?f(u1,s):[...f(0,-s).slice(0,3),1,s],B=w(s0),Cc=w(s1);MOB.push(...A,...B,...Cc,...A,...Cc,...Dd)}}
const IB=gl.createBuffer(),F32=new Float32Array(24*12000);
const MESH=[BOX,SPH,CYL,CONE,MOB].map(a=>{const vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,20,12);
 gl.bindBuffer(gl.ARRAY_BUFFER,IB);for(let i=2;i<8;i++){gl.enableVertexAttribArray(i);gl.vertexAttribDivisor(i,1)}return{vao,n:a.length/5}});
const EVAO=gl.createVertexArray();

// ---------- shaders ----------
function prog(v,f){const p=gl.createProgram();for(const[t,s]of[[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const o=gl.createShader(t);gl.shaderSource(o,'#version 300 es\nprecision highp float;'+s);gl.compileShader(o);
 if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);gl.attachShader(p,o)}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw gl.getProgramInfoLog(p);
 const U={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i).name;U[a]=gl.getUniformLocation(p,a)}return[p,U]}
const [PM,UM]=prog(`layout(location=0)in vec3 P;layout(location=1)in vec2 X;layout(location=2)in mat4 M;layout(location=6)in vec4 C;layout(location=7)in vec4 E;
uniform mat4 V;uniform vec3 vd;uniform float mg;out vec3 w,lp,sc;out vec4 c;out vec2 x;
void main(){vec4 W=M*vec4(P,1);w=W.xyz;lp=P;x=X;c=C;sc=vec3(length(M[0].xyz),length(M[1].xyz),length(M[2].xyz));
vec3 d=W.xyz;if(E.w>.5)d-=2.*dot(d-E.xyz,vd)*vd;else d-=E.xyz*mg;gl_Position=V*W;gl_Position.z=(V*vec4(d,1)).z;}`,
`in vec3 w,lp,sc;in vec4 c;in vec2 x;uniform mat4 L;uniform vec3 ld,bg;uniform float px,pt,st,sh,rv;uniform highp sampler2DShadow sm;out vec4 o;
void main(){vec3 n=normalize(cross(dFdx(w),dFdy(w)));int f=int(c.a+.5);vec3 a=c.rgb;float s=1.;
if(sh>0.){vec4 q=L*vec4(w+n*.03,1);q.xyz=q.xyz*.5+.5;q.z-=.002;s=texture(sm,q.xyz);}
float df=max(dot(n,ld),0.);
if(f==4){if(x.x>rv)discard;float u=gl_FrontFacing?x.x*.5:.5+x.x*.5;a=mod(floor(x.x*40.+st),2.)<1.?vec3(.31,.82,.66):vec3(1,.84,.3);if(u<pt)a=vec3(1,.44,.66);if(abs(x.y)>.88)a*=.6;}
vec3 col=a*(.62*vec3(.9,.9,1.05)+.45*df);
if(f==2)col=a;
if(f==3){vec3 fw=fwidth(w)+1e-4,g=1.-clamp(abs(fract(w+.5)-.5)/fw-.5,0.,1.),h=1.-clamp(abs(fract(w*.25+.125)-.5)*4./fw-.8,0.,1.);float l=0.;
for(int i=0;i<3;i++){float k=1.-abs(n[i]);l=max(l,k*max(g[i]*.2,h[i]*.4));}col=mix(a,vec3(.45,.62,.95),l)*mix(vec3(.8,.78,.93),vec3(1),s);}
if(f==0||f==5){vec3 e=(.5-abs(lp))*sc;float m1=min(e.x,min(e.y,e.z)),m3=max(e.x,max(e.y,e.z)),m2=e.x+e.y+e.z-m1-m3;col*=mix(.55,1.,smoothstep(px*.6,px*1.6,m2));
if(f==5)col=mix(col,bg,smoothstep(.8,4.,(.5-lp.y)*sc.y));}
o=vec4(col,1);}`);
const [PS,US]=prog(`layout(location=0)in vec3 P;layout(location=2)in mat4 M;uniform mat4 L;void main(){gl_Position=L*M*vec4(P,1);}`,`void main(){}`);
const [PB,UB]=prog(`void main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}`,
`uniform vec3 bg;uniform vec2 rs;uniform float gr;out vec4 o;void main(){vec2 p=gl_FragCoord.xy,q=p/rs-.5;float z=rs.y/16.;vec2 g=abs(fract(p/z+.5)-.5)*z;
float l=1.-smoothstep(.5,1.5,min(g.x,g.y));vec3 c=bg*(1.-.1*dot(q,q))-l*gr*vec3(.07,.035,0);c+=(fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453)-.5)*.02;o=vec4(c,1);}`);
// shadow map
const SMS=2048,STX=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,STX);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,SMS,SMS);
for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
const SFB=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,SFB);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,STX,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
const LD=nm([-.3,1,.55]);

// ---------- instance groups: mesh*3 + layer (0 plain, 1 seam-mask writer, 2 masked) ----------
let GR,cam,TAGS,CLK;const Z4=[0,0,0,0];
function put(me,m,c,f=0,ex=Z4,ly=0){GR[me*3+ly].push([m,c,f,ex])}
const ISO=Math.atan(1/sqrt(2)),Y45=PI/4;

// ---------- timing (shared with music) ----------
const BS=SONG.BS,MT=SONG.M,E8=SONG.E,SI=SONG.SI,SB=SONG.SB;
const bt=(b,e=0)=>BS[b]+e*E8;
const barAt=t=>{let b=0;while(b<SONG.BARS-1&&BS[b+1]<=t)b++;return b};

// ---------- props ----------
function pawn(Mb,c,sq=1){put(2,ch(Mb,Tm(0,.06,0),Sm(.56,.12,.56)),WHT,1);put(3,ch(Mb,Tm(0,.12+.3*sq,0),Sm(.44,.6*sq,.44)),c,1);put(1,ch(Mb,Tm(0,.2+.62*sq,0),Sm(.38)),c,1)}
function gear(P,gc,R,a,c){P.push({me:2,p:gc,s:[2*R,.3,2*R],c,f:1,r:a});for(let i=0;i<8;i++){const q=a+i*PI/4;P.push({me:0,p:ad(gc,[cos(q)*R,0,-sin(q)*R]),s:[.5*R,.26,.42*R],c:pas(c,.35),f:0,r:q})}}
// Penrose stairs: 32 steps in flights of 12/12/4/4, rise 1/4 per tread → the ends are exactly (8,8,8) apart, i.e. closed along the view axis
const ST=[];{let p=[0,0,0];for(const[dx,dz,n]of[[1,0,12],[0,1,12],[-1,0,4],[0,-1,4]])for(let i=0;i<n;i++){ST.push(p);p=[p[0]+dx,p[1]+.25,p[2]+dz]}}
const NS=ST.length;
const STC=mean(ST);
function stairPos(s){const i=floor(s),f=s-i,j=(i%NS+NS)%NS,a=ST[j],b=j==NS-1?ad(ST[0],[8,8,8]):ST[j+1],g=ss(0,.7,f);return[ad(l3(a,b,g),[0,sin(PI*g)*.5,0]),1-.22*sin(PI*g)]}
// Reutersvärd triangle of cubes, n per side; closes along (1,1,1)
const TRI=n=>{const P=[];for(let i=0;i<n;i++)P.push([i,0,0]);for(let i=0;i<n;i++)P.push([n,i,0]);for(let i=0;i<n;i++)P.push([n,n,i]);return P};
// draw a construct designed for the iso view; k = quarter turns done, tau in (0,1) = re-forming during a turn
function cons(P,cen,k,tau,mg){const n=P.length;P.forEach((q,i)=>{if(q.dy>50)return;const e=tau>0?ss(0,1,tau*1.8-i/n*.8):0,a=(k+e)*PI/2,rp=ryv(sb(q.p,cen),a);
 put(q.me,ch(Tm(cen[0]+rp[0],cen[1]+rp[1]+sin(PI*e)*1.5+(q.dy||0),cen[2]+rp[2]),Ry(a+(q.r||0)),Sm(...q.s)),q.c,q.f||0,Z4,mg?q.l||0:0)})}
const ground=(x,y,z)=>put(0,ch(Tm(x,y-.1,z),Sm(400,.2,400)),PAPER,3);

// ================= scenes =================
const NP=78,slot=i=>[2.6+i*1.3,0,0];
function piece(i,Mb){const c=CAN[i%8];switch(i%10){
 case 7:{const G=[];gear(G,[0,.15,0],.36,0,c);G.forEach(q=>put(q.me,ch(Mb,Tv(q.p),Ry(q.r),Sm(...q.s)),q.c,q.f||0));break}
 case 8:put(4,ch(Mb,Tm(0,.4,0),Rx(.6),Sm(.4)),c,4);break;
 case 9:for(let k=0;k<3;k++)for(const u of[-.5,.5])for(const v of[-.5,.5]){const q=[0,0,0],z=[.07,.07,.07];q[(k+1)%3]=u;q[(k+2)%3]=v;z[k]=1.07;put(0,ch(Mb,Tm(0,.4,0),Sm(.72),Tv(q),Sm(...z)),k==1?INK:c,2)}break;
 case 0:put(0,ch(Mb,Tm(0,.4,0),Sm(.8)),c);break;case 1:put(1,ch(Mb,Tm(0,.42,0),Sm(.84)),c,1);break;case 2:put(3,ch(Mb,Tm(0,.45,0),Sm(.8,.9,.8)),c,1);break;
 case 3:put(2,ch(Mb,Tm(0,.35,0),Sm(.75,.7,.75)),c,1);break;case 4:pawn(Mb,c);break;
 case 5:put(0,ch(Mb,Tm(-.2,.2,0),Sm(.4,.4,.8)),c);put(0,ch(Mb,Tm(.2,.4,0),Sm(.4,.8,.8)),c);break;default:put(0,ch(Mb,Tm(0,.1,0),Sm(.9,.2,.9)),c)}}
function kitBox(op,fl,sr,hop){if(sr<=0)return;const B=ch(Tm(0,hop,0),Sm(sr,fl*sr,sr));
 put(0,ch(B,Tm(0,.05,0),Sm(2.6,.1,2.6)),WHT);for(const s of[-1,1]){put(0,ch(B,Tm(s*1.25,.9,0),Sm(.1,1.8,2.6)),WHT);put(0,ch(B,Tm(0,.9,s*1.25),Sm(2.4,1.8,.1)),WHT);
  put(0,ch(B,Tm(s*1.31,.5,0),Sm(.02,.28,2.62)),COB);put(0,ch(B,Tm(0,.5,s*1.31),Sm(2.62,.28,.02)),COB)}
 put(0,ch(B,Tm(0,1.15,1.32),Sm(.9,.42,.02)),PINK);put(0,ch(B,Tm(1.32,1.15,0),Sm(.02,.42,.9)),LEM);
 const A=op.map(o=>o*3.6);
 put(0,ch(B,Tm(1.25,1.89,0),Rz(-A[0]),Tm(-.65,0,0),Sm(1.3,.06,2.6)),LEM);put(0,ch(B,Tm(-1.25,1.89,0),Rz(A[1]),Tm(.65,0,0),Sm(1.3,.06,2.6)),LEM);
 put(0,ch(B,Tm(0,1.83,1.25),Rx(A[2]),Tm(0,0,-.65),Sm(2.6,.06,1.3)),PINK);put(0,ch(B,Tm(0,1.83,-1.25),Rx(-A[3]),Tm(0,0,.65),Sm(2.6,.06,1.3)),PINK)}
// steps 1 & 0: open the box, count the pieces
function sBox(t){const e=t/E8;ground(0,0,0);cam.sh=1;
 const hop=t<bt(4)?.25*sin(PI*cl((t-BS[barAt(t)])/(2*E8))):0;
 kitBox([0,1,2,3].map(i=>bk((t-bt(4,i))/(1.6*E8))),1,1,hop);
 const t5=bt(5),nl=(t-t5)/E8-2;
 cam.c=[ss(0,1,(t-bt(4))/2)*1.3+(nl>0?max(0,1.3*nl-2.8)*ss(0,8,nl):0),.5,0];cam.H=mx(3.6,4.6,ss(bt(3),bt(5),t))+ss(bt(5),bt(9),t)*1.4+ss(bt(12),bt(15),t)*2.6;
 for(let i=0;i<NP;i++){const tl=t5+i*E8,s=slot(i),tau=(t-tl)/(2*E8);if(tau<0)break;let M;
  if(tau<1){if(i<8){const p=ad(l3([0,1.2,0],s,tau),[0,3.5*4*tau*(1-tau),0]);M=ch(Tv(p),Tm(0,.4,0),Rz(-2*PI*tau),Tm(0,-.4,0))}else M=ch(Tv(ad(s,[0,12*(1-tau)**2,0])),Ry(PI*(1-tau)))}
  else{const q=(tau-1)*2*E8;if(q<.35)CLK.push([s,q]);const k=1-.3*sin(q*24)*exp(-q*9);let y=0;if(t>bt(13)){y=.45*max(0,sin(PI*(e*.5-i*.13)))}M=ch(Tm(s[0],y,s[2]),Sm(1/sqrt(k),k,1/sqrt(k)))}
  piece(i,M);if(tau>1&&t<bt(16))TAGS.push([[s[0],1.35,s[2]],t>bt(10)+i*E8*.22?'∞':''+(i+1)])}}
// step 8: put everything back
function sBack(t){const t0=bt(102);ground(0,0,0);cam.sh=t>bt(107);
 const cur=NP-1-(t-t0)/(E8*.5);cam.c=[max(0,1.3*cur-1)+ss(bt(106),bt(108),t)*0,.5,0];cam.H=mx(7.5,4.6,ss(t0,bt(108),t));
 for(let i=0;i<NP;i++){const tl=t0+(NP-1-i)*E8*.5,s=slot(i),d=s[0],fd=.45+d/16,tau=(t-tl)/fd;if(tau>=1)continue;
  if(tau<0){piece(i,Tv(s));continue}const p=ad(l3(s,[0,.6,0],tau),[0,(2+d*.3)*4*tau*(1-tau),0]);piece(i,ch(Tv(p),Ry(2*PI*tau),Sm(1-tau*tau*.4)))}
 const fl=1-.97*ss(bt(110),bt(110,2.5),t),sr=1-ss(bt(110,4),bt(111,4),t);
 kitBox([3,2,1,0].map(i=>1-bk((t-bt(108,i))/(1.6*E8))),fl,sr,t>bt(109)&&t<bt(110)?.3*sin(PI*cl((t-bt(109))/(2*E8))):0)}
// one stair block: a body that fades out below and a coloured tread cap
function step(x,y,z,s,k,r){put(0,ch(Tm(x,y-2.6*s,z),Sm(1.3*s,5*s,1.3*s)),pas(CAN[(r*3)%8],.78),5);put(0,ch(Tm(x,y-.07*s,z),Sm(1.32*s,.14*s,1.32*s)),CAN[(r*3+(k&1))%8])}
// step 2: Penrose stairs
function sStairs(t){const e=t/E8,t0=bt(16);cam.sh=1;
 const yv=bk((t-bt(25,6))/(3*E8))-bk((t-bt(28,4))/(3*E8));cam.y=Y45+yv*PI/2;cam.H=7.4+ss(0,1,yv)*1.6;
 const up=ss(bt(29),bt(32),t)*14;if(yv>.98)TAGS.push([ad(sb(l3(ST[NS-1],ad(ST[0],[8,8,8]),.5),STC),[0,1.8,0]),'DO NOT LOOK']);cam.c=[0,up+.5,0];
 for(let r=0;r<3;r++){const tr=r?bt(28+r,3):t0;if(t<tr)break;
  ST.forEach((p,k)=>{const tk=tr+k*E8*(r?.25:1);if(t<tk)return;const dy=(1-bk((t-tk)/(1.3*E8)))*5,q=ad(sb(p,STC),[0,r*9,0]),ag=t-tk-.8*E8;if(!r&&ag>0&&ag<.35)CLK.push([q,ag]);
   step(q[0],q[1]+dy,q[2],1,k,r)});
  if(t>bt(22)+r*2)for(let i=0;i<10;i++){const[p]=stairPos(-(t-bt(22))/E8*.75+i*2.4+.35);put(1,ch(Tv(ad(sb(p,STC),[0,r*9+.25,0])),Sm(.42)),SKY,1)}
  [[RED,0,bt(21)],[ORG,16,bt(21,4)],[LIL,8,bt(23)]].forEach(([c,o,ts])=>{if(t<ts+r*2)return;const[p,sq]=stairPos(tick((t-ts)/E8,1.4)+o);
   const q=ad(sb(p,STC),[0,r*9,0]);pawn(ch(Tv(q),Sm(.9)),c,sq);if(!r&&!o&&t>bt(21)&&t<bt(32))TAGS.push([ad(q,[0,1.7,0]),'YOU'])})}}
// step 3: Reutersvärd triangle, seam masked; turns reveal / re-form it
const TP=TRI(5).map((p,i)=>({me:0,p,s:[1,1,1],c:[COB,PINK,LEM][floor(i/5)],l:i<3?1:i>12?2:0})),TC=mean(TRI(5));
function sTri(t){const t0=bt(32);cam.sh=t>bt(41,2);cam.H=5.6;cam.c=[...TC];ground(TC[0],-.5,TC[2]);
 TP.forEach((q,i)=>{const ag=t-t0-(i*2+2.9)*E8;if(ag>0&&ag<.35)CLK.push([q.p,ag]);q.dy=(1-bk((t-t0-(i*2+2)*E8)/(1.4*E8)))*7;if(t<t0+(i*2+2)*E8)q.dy=99});
 const tr=bt(41,5),j=floor((t-tr)/(5*E8));
 if(j<0){const yv=ss(bt(36,5),bt(37,1),t)-ss(bt(39,6),bt(40,2),t);cam.y=Y45+yv*PI/2;cam.m=yv==0;cons(TP,TC,0,0,cam.m);if(yv>.98)TAGS.push([[0,1.3,0],'START'],[[5,6.3,4],'END'])}
 else{const jj=min(j,5),tau=j>4?1:cl((t-tr-jj*5*E8)/(3*E8)),k=tau>=1?jj+1:jj,cy=ss(0,.7,tau);cam.y=Y45+(jj+cy)*PI/2;cam.m=cy==1;cons(TP,TC,k,tau<1?tau:0,cam.m)}}
// step 4: the room with three floors
const PERM=[[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],[0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1]];PERM.push(mul(PERM[1],PERM[1]));
const FLIPS=[[44,0],[48,1],[50,2],[52,0],[54,1]].map(([b,g])=>[bt(b),g]);
const BALLS=[[1.2,4.6,1],[1.9,3.4,.6],[.7,1.5,4.2],[1.6,.8,3.3],[4.4,1.1,1.7],[3.1,1.9,.8]];
function fall(h,t){const g=30;let a=sqrt(2*max(h,0)/g);if(t<a)return h-g*t*t/2;t-=a;let v=g*a*.45;for(let i=0;i<6;i++){const d=2*v/g;if(t<d)return v*t-g*t*t/2;t-=d;v*=.45}return 0}
function sRoom(t){const e=t/E8,Sz=6;cam.H=6.3;cam.c=[0,0,0];cam.sh=1;
 let r=0;FLIPS.forEach(([tf],i)=>{if(i)r+=bk((t-tf)/.5)*2*PI/3});cam.r=r;
 const fu=[0,1,2].map(g=>(1-bk((t-bt(44,1+g*2))/(2*E8)))*PI/2),WS=[PERM[0],ch(Rz(fu[1]),PERM[1]),ch(Rx(-fu[2]),PERM[2])];
 WS.forEach((W,g)=>{const wc=pas([MINT,PINK,LEM][g],.72);
  put(0,ch(W,Tm(Sz/2,-.1,Sz/2),Sm(Sz,.2,Sz)),wc,3);
  for(let k=0;k<4;k++){const h=.5*(k+1);put(0,ch(W,Tm(5.25-.7*k,h/2,5),Sm(.7,h,1.2)),CAN[(k+g*2)%8])}
  for(const x of[2.8,4.2])put(0,ch(W,Tm(x,.9,3.3),Sm(.3,1.8,.3)),COB);put(0,ch(W,Tm(3.5,1.95,3.3),Sm(1.8,.3,.45)),RED);
  const G=[];gear(G,[5,.15,2.9],.5,tick(e/2)*PI/8,[ORG,SKY,LIL][g]);G.forEach(q=>put(q.me,ch(W,Tv(q.p),Ry(q.r),Sm(...q.s)),q.c,q.f||0));
  const pw=fr(e/14),zz=2.6+1.4*(pw<.5?pw*2:2-pw*2);pawn(ch(W,Tm(3.5,.25*abs(sin(PI*e)),zz),Sm(.8)),[RED,COB,MINT][g]);
  const sk=floor(e)%8,k2=sk<4?sk:7-sk;pawn(ch(W,Tm(5.25-.7*k2,.5*(k2+1),5),Sm(.7)),[LIL,ORG,PINK][g],1-.2*abs(sin(PI*e)))});
 BALLS.forEach((h,i)=>{let p=[h[0],h[1]+3,h[2]];for(let f=0;f<FLIPS.length&&FLIPS[f][0]<=t;f++){const te=min(t,FLIPS[f+1]?FLIPS[f+1][0]:1e9),tau=te-FLIPS[f][0]-(f?.15:0),a=[1,0,2][FLIPS[f][1]],q=[...p];
  if(tau<0)continue;q[a]=.35+fall(p[a]-.35,tau);for(let o=0;o<3;o++)if(o!=a)q[o]=mx(p[o],h[o],ss(0,1.2,tau));p=q}
  put(1,ch(Tv(p),Sm(.7)),CAN[(i+1)%8],1)});
 for(let i=0;i<9;i++){const sp=fr(tick(e,2)/36+i/9)*3,g=floor(sp),f=sp-g,a=4.6,P3=[[a,0,0],[0,0,a],[0,a,0]],p=l3(P3[g],P3[(g+1)%3],f);
  if(t>bt(45,4))pawn(ch(Tv(p),PERM[g],Tm(0,.12*abs(sin(PI*e)),0),Sm(.55)),CAN[(i+4)%8],1-.15*abs(sin(PI*e)))}}
// step 5: Necker cubes, depth mirrored on the beat
function sNeck(t){const e=t/E8,t0=bt(56),lt=t-t0;cam.sh=0;cam.gr=1;
 const iso=ss(bt(64,4),bt(65,4),t);cam.p=mx(.42,ISO,iso);cam.H=5.4;
 const lt2=max(0,t-bt(58)),rv=[cos(Y45),0,-sin(Y45)],c0=sc(rv,lt2*1.25+lt2*lt2*.02);cam.c=c0;const sp=3.6;
 const ci=round(c0[0]/sp),cj=round(c0[2]/sp);
 for(let i=ci-6;i<=ci+6;i++)for(let j=cj-6;j<=cj+6;j++){const p=[i*sp,0,j*sp],d=sb(p,c0);if(abs(d[0]-d[2])>13||abs(d[0]+d[2])>11)continue;
  const sd=hs(i*7.3+j*1.7),a=mx(lt*1.1+sd*6,0,iso),fl=t>bt(58)&&((floor(e/2)+i+j)&1)?1:0,cc=CAN[((i+j*3)%8+8)%8],ex=fl?[...p,1]:Z4;
  const hero=!i&&!j,gr=hero?mx(3.2,1.25,ss(bt(57,4),bt(58),t)):1.25*bk((t-bt(58)-Math.hypot(d[0],d[2])*.06)/.3);if(gr<=0)continue;
  const M=ch(Tv(p),Ry(a),Sm(gr));let ek=0;
  for(let k=0;k<3;k++)for(const u of[-.5,.5])for(const v of[-.5,.5]){const q=[0,0,0],s=[.055,.055,.055],ta=bt(56,1+ek++*.6);if(hero&&t<ta)continue;q[(k+1)%3]=u;q[(k+2)%3]=v;s[k]=1.055*(hero?bk((t-ta)/(1.2*E8)):1);
   if(hero&&t-ta<.35&&t-ta>.1)CLK.push([xf(M,q),t-ta-.1]);put(0,ch(M,Tv(q),Sm(...s)),k==1?INK:cc,2,ex)}
  if(!hero||t>bt(57))put(0,ch(M,Tm(0,0,.5),Sm(1,1,.02*bk((t-bt(57))/.3))),pas(cc,.55),2,ex);
  if(t>bt(59)&&t<bt(64,4)&&abs(d[0]-d[2])<5&&!((i+j*2)%3))TAGS.push([ad(p,[0,1.5,0]),t<bt(62)?'?':fl?'YES':'NO'])}}
// step 6: Möbius ribbon; a pawn paints it in one stroke
let PT=0,STR=0,RV=1;
function sMob(t){const tt=min(t,bt(80)),e=tt/E8;cam.H=4.5;cam.c=[0,.2,0];cam.sh=1;
 // the ribbon turns under the painter like a treadmill. Lap 1 the painter works on the far side (its face looks at us
 // across the hole), lap 2 on the near side; the ribbon spins half a turn as the painter passes underneath
 const u=4*PI*ss(0,1,cl((tick((tt-bt(68,4))/E8,2)/58))),al=PI*1.25-PI*ss(1.6*PI,2.4*PI,u);PT=u/(4*PI);STR=tick(e,2);
 const Ms=ch(Ry(PI/4),Rx(.12),Ry(-PI/4),Ry(u-al),Sm(3.3));put(4,Ms,[1,1,1],4);RV=ss(bt(68),bt(68,5),t);
 const P=[cos(u),0,sin(u)],du=[-sin(u),0,cos(u)],dv=[cos(u/2)*cos(u),sin(u/2),cos(u/2)*sin(u)],N=nm(cr(du,dv)),Tt=nm(du),B=cr(Tt,N);
 pawn(ch(Ms,basis(Tt,N,B,ad(P,sc(N,.012))),Sm(.24)),RED,1-.2*abs(sin(PI*e)));
 for(let i=0;i<16;i++){const v=i/16*4*PI+tick(e,2)*PI/24,du=[-sin(v),0,cos(v)],dv=[cos(v/2)*cos(v),sin(v/2),cos(v/2)*sin(v)],n=nm(cr(du,dv)),tt=nm(du),q=ad([cos(v),0,sin(v)],sc(n,.045)),sv=.2*(i%2?1:-1);
  put(0,ch(Ms,basis(tt,n,cr(tt,n),ad(q,sc(dv,sv))),Sm(.07)),CAN[i%8])}
}
// step 7: the tower; climb while the camera turns and everything re-forms
function level(j){const P=[],ty=j%4,c=k=>CAN[(k+j*3)%8];
 if(ty==0)ST.forEach((p,k)=>{const q=sc(sb(p,STC),.55);P.push({me:0,p:[q[0],q[1]-1.43,q[2]],s:[.715,2.75,.715],c:pas(c(0),.78),f:5},{me:0,p:[q[0],q[1]-.04,q[2]],s:[.726,.077,.726],c:c(k&1)})});
 else if(ty==1){const T=TRI(4),m=mean(T);T.forEach((p,i)=>P.push({me:0,p:sc(sb(p,m),.85),s:[.85,.85,.85],c:c(floor(i/4)),l:i<3?1:i>9?2:0}))}
 else if(ty==3)P.push({me:4,p:[0,0,0],s:[2.4,2.4,2.4],c:[1,1,1],f:4});
 return P}
function sTower(t){const e=t/E8,t0=bt(82),lt=t-t0;cam.sh=1;cam.H=6.6;cam.gr=.5;
 const vy=lt*1.9;cam.c=[0,vy,0];
 cam.r=bk((t-bt(87))/(1.2*7*E8))*PI-bk((t-bt(98))/(1.2*7*E8))*PI;
 let k=0,tau=0;for(let b=84;b<102;b+=2){const ta=bt(b);if(t>=ta){const q=(t-ta)/(3*E8);if(q<1){tau=q;break}k++}}
 const cy=tau?ss(0,.7,tau):0;cam.y=Y45+(k+cy)*PI/2;cam.m=!tau||cy==1;
 const j0=max(0,floor((vy-16)/7)),j1=floor((vy+16)/7);
 PT=fr(t/9);STR=tick(e,2);RV=1;for(let j=j0;j<=j1;j++){const y=j*7,ty=j%4,P=level(j);
  if(ty==2){gear(P,[-1.2,0,.6],1.2,tick(e,2)*PI/8,CAN[(j+2)%8]);gear(P,[1.2,0,-.6],1.2,-tick(e,2)*PI/8+PI/8,CAN[(j+5)%8]);gear(P,[0,1.6,0],.8,tick(e/2,2)*PI/4,CAN[(j+1)%8])}
  P.forEach(q=>q.p=ad(q.p,[0,y,0]));cons(P,[0,y,0],ty<2?k:0,ty<2?tau:0,cam.m);
  if(ty==0){const a=(k+(tau?ss(0,1,tau):0))*PI/2;[[RED,0],[MINT,12]].forEach(([c,o])=>{const[p,sq]=stairPos(tick(e+j*5,1.4)+o),q=ryv(sc(sb(p,STC),.55),a);pawn(ch(Tm(q[0],q[1]+y,q[2]),Sm(.55)),c,sq);
   if(!o&&t>bt(91)&&t<bt(94)&&abs(q[1]+y-vy)<5)TAGS.push([[q[0],q[1]+y+1.1,q[2]],'SLOT A'])})}
  if(j==j0)towerExtra(t,vy,k,tau);
  if(ty==2)[[-1.2,.6],[1.2,-.6]].forEach(([x,z],i)=>{const q=[x,0,z];pawn(ch(Tm(q[0],y+.3+.3*abs(sin(PI*(e+i))),q[2]),Sm(.6)),i?LEM:PINK)})}}

// too many corners: small re-forming triangles around the tower
function towerExtra(t,vy,k,tau){const e=t/E8,n=floor(ss(bt(94),bt(97),t)*6.99);
 for(let m=0;m<n;m++){const y=vy+(m%3-1)*4.2,P=TRI(3).map((p,i)=>({me:0,p:ad(sc(p,.4),[(m%2?3.6:-5.2),y-.6,(m%2?-5.2:3.6)]),s:[.4,.4,.4],c:CAN[(m*3+floor(i/3))%8],l:i<3?1:i>6?2:0}));cons(P,[0,y,0],k,tau,cam.m)}
}
const SCN=[sBox,sBox,sStairs,sTri,sRoom,sNeck,sMob,sMob,sTower,sBack];
const TITLES=['','OPEN THE BOX','BUILD A STAIRCASE','JOIN THE CORNERS','CHOOSE A DOWN','LOOK AT THE CUBE','PAINT THE RIBBON','','CLIMB','PUT IT ALL BACK'];

// ================= render =================
let W=0,H=0,DPR=1;
function resize(){DPR=min(devicePixelRatio||1,2);const w=innerWidth,h=innerHeight;if(w*DPR==W&&h*DPR==H)return;W=C.width=OV.width=w*DPR|0;H=C.height=OV.height=h*DPR|0}
function drawGroups(sh,mg){let off=0;const ofs=[];for(let g=0;g<15;g++){ofs.push(off);for(const[m,c,f,ex]of GR[g]){F32.set(m,off);F32.set(c,off+16);F32[off+19]=f;F32.set(ex,off+20);off+=24}}
 gl.bindBuffer(gl.ARRAY_BUFFER,IB);gl.bufferData(gl.ARRAY_BUFFER,F32.subarray(0,off),gl.STREAM_DRAW);
 return(pass)=>{for(let g=0;g<15;g++){const n=GR[g].length;if(!n)continue;const me=MESH[g/3|0],ly=g%3;gl.bindVertexArray(me.vao);gl.bindBuffer(gl.ARRAY_BUFFER,IB);
  for(let i=0;i<6;i++)gl.vertexAttribPointer(2+i,4,gl.FLOAT,false,96,ofs[g]*4+i*16);
  if(pass&&mg&&ly){gl.enable(gl.STENCIL_TEST);if(ly==1){gl.stencilFunc(gl.ALWAYS,1,255);gl.stencilOp(gl.KEEP,gl.REPLACE,gl.REPLACE)}else{gl.stencilFunc(gl.NOTEQUAL,1,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP)}}else gl.disable(gl.STENCIL_TEST);
  gl.drawArraysInstanced(gl.TRIANGLES,0,me.n,n)}gl.disable(gl.STENCIL_TEST)}}
function frame(t){resize();GR=[...Array(15)].map(()=>[]);TAGS=[];CLK=[];RV=1;cam={y:Y45,p:ISO,r:0,c:[0,0,0],H:6,m:1,sh:1,gr:0};
 const b=barAt(max(t,0)),s=SI[b];SCN[s](max(t,0));
 // order layers so that 0 and 1 draw before 2
 const asp=W/H,d=[cos(cam.p)*sin(cam.y),sin(cam.p),cos(cam.p)*cos(cam.y)],V=look(ad(cam.c,sc(d,90)),cam.c,[0,1,0]);
 const hh=cam.H*max(1,.75/asp*1.6),VP=ch(ortho(-hh*asp,hh*asp,-hh*1.12,hh*.88,1,260),Rz(cam.r),V);
 const ldv=ryv(LD,cam.y-Y45),LM=ch(ortho(-24,24,-24,24,1,160),look(ad(cam.c,sc(ldv,70)),cam.c,[0,1,0]));
 const draw=drawGroups(0,cam.m?1:0);
 if(cam.sh){gl.bindFramebuffer(gl.FRAMEBUFFER,SFB);gl.viewport(0,0,SMS,SMS);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(PS);gl.uniformMatrix4fv(US.L,false,LM);draw(0);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
 gl.viewport(0,0,W,H);gl.clearColor(...PAPER,1);gl.clearStencil(0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
 gl.disable(gl.DEPTH_TEST);gl.useProgram(PB);gl.uniform3fv(UB.bg,PAPER);gl.uniform2f(UB.rs,W,H);gl.uniform1f(UB.gr,cam.gr);gl.bindVertexArray(EVAO);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.DEPTH_TEST);gl.useProgram(PM);gl.uniformMatrix4fv(UM.V,false,VP);gl.uniformMatrix4fv(UM.L,false,LM);gl.uniform3fv(UM.vd,d);gl.uniform1f(UM.mg,cam.m?1:0);
 gl.uniform3fv(UM.ld,ldv);gl.uniform3fv(UM.bg,PAPER);gl.uniform1f(UM.px,2*hh/H);gl.uniform1f(UM.pt,PT);gl.uniform1f(UM.st,STR);gl.uniform1f(UM.rv,RV);gl.uniform1f(UM.sh,cam.sh);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,STX);gl.uniform1i(UM.sm,0);draw(1);
 overlay(t,b,s,VP)}

// ================= overlay: captions, tags, wipes =================
const FONT='"Avenir Next",Futura,"Century Gothic","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
const css=c=>`rgb(${c.map(v=>v*255|0)})`;
function font(sz,w=700){X.font=`${w} ${sz}px ${FONT}`}
function rr(x,y,w,h,r){X.beginPath();X.roundRect?X.roundRect(x,y,w,h,r):X.rect(x,y,w,h)}
function card(x,y,w,h,r,sh,fill='#fffdf8',edge=css(INK)){X.fillStyle=css(sh);rr(x+r*.45,y+r*.45,w,h,r);X.fill();X.fillStyle=fill;rr(x,y,w,h,r);X.fill();X.lineWidth=max(2,r*.12);X.strokeStyle=edge;X.stroke()}
function overlay(t,b,s,VP){const w=W,h=H,u=min(w,h)/100;X.clearRect(0,0,w,h);X.textBaseline='middle';
 // number tags
 font(2.6*u,800);X.textAlign='center';for(const[p,txt]of TAGS){const q=xf(VP,[...p,1]),x=(q[0]+1)/2*w,y=(1-q[1])/2*h;if(x<-50||x>w+50)continue;
  const tw=max(3.4*u,X.measureText(txt).width+2*u);card(x-tw/2,y-1.8*u,tw,3.6*u,1.8*u,COB);X.fillStyle=css(INK);X.fillText(txt,x,y+.1*u)}
 // click stickers
 for(const[p,a]of CLK){const q=xf(VP,[...p,1]),x=(q[0]+1)/2*w,y=(1-q[1])/2*h-3*u,k=a/.35;X.globalAlpha=1-k;X.strokeStyle=X.fillStyle=css(INK);X.lineWidth=.35*u;
  for(let i=0;i<5;i++){const an=-PI/2+(i-2)*.45;X.beginPath();X.moveTo(x+cos(an)*(1.5+k*2)*u,y+sin(an)*(1.5+k*2)*u);X.lineTo(x+cos(an)*(2.6+k*3)*u,y+sin(an)*(2.6+k*3)*u);X.stroke()}
  font(1.8*u,800);X.textAlign='center';X.fillText('click',x,y+.6*u);X.globalAlpha=1}
 // instruction icons: quarter-turn arrow while the camera turns, gravity badge in the room
 const yr=(cam.y-Y45)/(PI/2),rl=s==4?cam.r/(2*PI/3):cam.r/PI,turn=abs(yr-round(yr))>.004?(yr-floor(yr)):abs(rl-round(rl))>.004?rl-floor(rl):-1;
 if(turn>=0||s==4){const x=w-9*u,y=9*u;card(x-5.5*u,y-5.5*u,11*u,11*u,5.5*u,s==4?MINT:PINK);X.strokeStyle=X.fillStyle=css(INK);X.lineWidth=.6*u;
  if(turn>=0){const a0=-PI/2+turn*PI*2;X.beginPath();X.arc(x,y,3.2*u,a0,a0+4.6);X.stroke();const ax=x+cos(a0+4.6)*3.2*u,ay=y+sin(a0+4.6)*3.2*u,ta=a0+4.6+PI/2;
   X.beginPath();X.moveTo(ax+cos(ta)*1.2*u,ay+sin(ta)*1.2*u);X.lineTo(ax+cos(ta+2.4)*1.2*u,ay+sin(ta+2.4)*1.2*u);X.lineTo(ax+cos(ta-2.4)*1.2*u,ay+sin(ta-2.4)*1.2*u);X.fill();
   font(1.9*u,800);X.textAlign='center';X.fillText(s==4?'120°':s==8&&abs(rl-round(rl))>.004?'180°':'90°',x,y+.2*u)}
  else{let g=0;FLIPS.forEach(([tf,gg])=>{if(t>=tf)g=gg});const dv=[[0,-1,0],[-1,0,0],[0,0,-1]][g],q0=xf(VP,[0,0,0,1]),q1=xf(VP,[...dv,1]),an=atan2(-(q1[1]-q0[1])*h,(q1[0]-q0[0])*w);
   X.save();X.translate(x,y);X.rotate(an);X.beginPath();X.moveTo(-2.8*u,0);X.lineTo(1.4*u,0);X.stroke();X.beginPath();X.moveTo(3.2*u,0);X.lineTo(1*u,-1.5*u);X.lineTo(1*u,1.5*u);X.fill();X.restore();
   font(1.5*u,800);X.textAlign='center';X.fillText('DOWN',x,y+8*u)}}
 // intro title
 if(t<bt(5)){const T='PLEASE ASSEMBLE',out=ss(bt(4,2),bt(5),t);font(min(10*u,w/12),800);X.textAlign='left';const tw=X.measureText(T).width;let x=w/2-tw/2;const y=h*.2-out*h*.4;
  [...T].forEach((c,i)=>{const ti=bt(0,1+i*1.6),k=bk((t-ti)/(1.2*E8));const cw=X.measureText(c).width;if(t>=ti&&c!=' '){X.save();X.translate(x+cw/2,y);X.rotate((hs(i)-.5)*.2*(1-k*.6));X.scale(k,k);
   X.fillStyle=css(INK);X.fillText(c,-cw/2+.6*u,.6*u);X.fillStyle=css(CAN[i%8]);X.fillText(c,-cw/2,0);X.restore()}x+=cw});
  if(t>bt(2)){X.globalAlpha=ss(bt(2),bt(2,4),t)*(1-out);font(2.6*u,600);X.textAlign='center';X.fillStyle=css(INK);X.fillText('A S S E M B L Y   K I T   N º  7 / 8',w/2,y+8*u);X.globalAlpha=1}}
 // step header + pips
 const st=['','1','2','3','4','5','6','6½','7','8'][s];
 if(s&&t<bt(111,4)){X.textAlign='left';const a=ss(BS[SB[s]],BS[SB[s]]+.3,t);X.globalAlpha=a;font(2.2*u,800);X.fillStyle=css(COB);X.fillText('STEP '+st+(TITLES[s]?'  ·  '+TITLES[s]:''),4*u,5*u);
  for(let i=0;i<8;i++){X.fillStyle=i<parseInt(st)?css(CAN[i]):'rgba(31,39,71,.15)';rr(4*u+i*3*u,8*u,2.2*u,2.2*u,.5*u);X.fill()}X.globalAlpha=1}
 // narration card
 const L=SONG.LINES;let li=-1;for(let i=0;i<L.length;i++)if(L[i].t<=t+.05)li=i;
 if(li>=0){const l=L[li],nx=L[li+1]?L[li+1].t:1e9,sv=LIVE[li],te=!TTS?l.end:sv&&sv.done?sv.te:t+1,a=min(ss(l.t-.05,l.t+.15,t),1-ss(min(nx-.2,te+2.2),min(nx,te+2.6),t));
  if(a>0){const fs=3.3*u,pad=2.4*u,maxw=min(w*.84,95*u);font(fs,700);const sp=X.measureText(' ').width;
   let lines=[[]],lw=0,bw=7*u;for(const wd of l.words){const ww=X.measureText(wd.w).width;if(lw+ww>maxw-bw-2*pad&&lines[lines.length-1].length){lines.push([]);lw=0}lines[lines.length-1].push([wd,ww,lw]);lw+=ww+sp}
   const cw=min(maxw,max(...lines.map(r=>{const z=r[r.length-1];return z[2]+z[1]}))+bw+2*pad),chh=lines.length*fs*1.35+2*pad,cx=w/2-cw/2,cy=h-chh-5*u+(1-a)*3*u;
   X.globalAlpha=a;card(cx,cy,cw,chh,1.6*u,s==8?pas(PINK,.3):pas(COB,.25));
   const bx=cx+pad+2.6*u,by=cy+chh/2;X.fillStyle=css(s==8?PINK:COB);X.beginPath();X.arc(bx,by,2.8*u,0,7);X.fill();
   let bd=st||'★';if(s==8)bd=['7','8','7','A','∞','7½'][floor(t/E8/7)%6];font(2.6*u,800);X.textAlign='center';X.fillStyle='#fff';X.fillText(bd,bx,by+.1*u);
   font(fs,700);X.textAlign='left';const cur=curWord(li,t),talking=TTS?sv&&!sv.done:t<l.end+.1;
   lines.forEach((r,ri)=>r.forEach(([wd,ww,x0])=>{const i=l.words.indexOf(wd),x=cx+pad+bw+x0,y=cy+pad+fs*.68+ri*fs*1.35;
    if(i==cur&&talking){X.fillStyle=css(pas(PINK,.45));rr(x-.4*u,y-fs*.62,ww+.8*u,fs*1.24,.6*u);X.fill()}
    X.fillStyle=i<=cur?css(INK):'#b4b7c6';let dx=0;if(l.g&&i==cur)dx=(hs(floor(t*30)+i)-.5)*l.g*1.2*u;X.fillText(wd.w,x+dx,y)}));X.globalAlpha=1}}
 // break: dotted fold line + scissors
 if(s==7){const k=ss(bt(80),bt(81),t);X.setLineDash([1.2*u,1.2*u]);X.lineWidth=.5*u;X.strokeStyle=css(INK);X.beginPath();X.moveTo(0,h*.92);X.lineTo(w*k,h*.92-w*k*.55);X.stroke();X.setLineDash([]);
  font(5*u,400);X.save();X.translate(w*k,h*.92-w*k*.55);X.rotate(-.5);X.fillStyle=css(INK);X.fillText('✂',-2.5*u,0);X.restore()}
 C.style.transform=s==7?`perspective(${w/DPR*1.5}px) rotate3d(1,1.8,0,${ss(bt(81),bt(82),t)*-95}deg)`:'';
 // end card
 if(t>bt(111,3)){const a=ss(bt(111,3),bt(112),t);X.globalAlpha=a;const cw=min(w*.86,80*u),chh=38*u,cx=w/2-cw/2,cy=h/2-chh/2+(1-a)*4*u;card(cx,cy,cw,chh,2.4*u,COB);
  X.textAlign='center';font(3*u,800);X.fillStyle=css(MINT);X.fillText('✓',w/2,cy+6*u);font(6.5*u,800);X.fillStyle=css(INK);X.fillText('ASSEMBLY COMPLETE',w/2,cy+13*u);
  font(2.4*u,600);X.fillStyle=css(COB);X.fillText('PIECES USED: ∞   ·   PIECES MISSING: 0   ·   CORNERS LEFT OVER: 1',w/2,cy+21*u);
  X.fillStyle='#8a8fa8';X.fillText('PLEASE ASSEMBLE  ·  a 64k intro  ·  WebGL2 + WebAudio, no samples',w/2,cy+27*u);X.fillText('keep this kit away from mirrors',w/2,cy+31.5*u);X.globalAlpha=1}
 // page wipes between steps
 for(const k of[2,3,4,5,6,8,9]){const ts=BS[SB[k]],p=(t-ts)/.32;if(p<=-1||p>=1)continue;const vert=k%2,o=p<0?(1+p):(1-p),e=1-(1-o)**3;
  X.fillStyle=css(PAPER);X.strokeStyle=css(INK);X.lineWidth=.4*u;X.save();if(vert){const y=p<0?h*(1-e):0;X.fillRect(0,y,w,h*e);X.fillStyle=css(pas(COB,.6));X.fillRect(0,p<0?y:h*e-u,w,u)}
  else{const x=p<0?w*(1-e):0;X.fillRect(x,0,w*e,h);X.fillStyle=css(pas(PINK,.5));X.fillRect(p<0?x:w*e-u,0,u,h)}
  X.globalAlpha=e;font(14*u,800);X.textAlign='center';X.fillStyle=css(pas(COB,.75));X.fillText(['','','2','3','4','5','6','','7','8'][k],w/2,h/2);X.restore()}}

// ================= narration: the browser's own speech voice =================
// Lines are cued from the audio clock in the frame loop. TTS can't go through WebAudio, so the music ducks on
// onstart/onend. Captions follow onboundary word events where the engine sends them and estimate otherwise.
const SS=window.speechSynthesis,SU=window.SpeechSynthesisUtterance,TTS=!!(SS&&SU&&!MUTE);let VOICE=null,SAID=0,ACT=[],LIVE=[],ENDED=0;
function pickVoice(){const V=SS.getVoices(),en=V.filter(v=>/^en/i.test(v.lang));VOICE=null;
 for(const n of['Samantha','Google US English','Microsoft Aria','Microsoft Jenny','Karen','Moira','Tessa','Google UK English Female','Microsoft Zira','Serena'])if(!VOICE)VOICE=en.find(v=>v.name.includes(n));
 VOICE=VOICE||en.find(v=>v.localService)||en[0]||null}
// split each line into utterances; glitchy lines get pitch/rate jumps, a cut-off false start and a repeated fragment
const PLAN=SONG.LINES.map((L,li)=>{const Rn=k=>hs(li*13.7+k),W=L.words,g=L.g,C=[];let a=0;
 W.forEach((w,i)=>{if(i==W.length-1||/-$/.test(w.w)||g&&/[.,?!]$/.test(w.w)||g>.2&&Rn(i)<g*.5){C.push({a,b:i+1});a=i+1}});
 C.forEach((c,j)=>{c.p=cl(1.3+(g?(Rn(j+40)-.5)*g*2.2:0),.3,2);c.r=cl(1.02+(g?(Rn(j+70)-.5)*g:0),.55,1.7)});
 if(g>=.45)C.unshift({a:0,b:min(2,W.length),p:1.3,r:1.02,cut:.35+Rn(9)*.25});
 if(g>=.55)C.splice(2,0,{...C[1]});
 return C});
function sayFrom(li,j0){const L=SONG.LINES[li],P=PLAN[li],st=LIVE[li];
 for(let j=j0;j<P.length;j++){const c=P[j],ws=L.words.slice(c.a,c.b).map(w=>w.w.replace(/-$/,'')),u=new SU(ws.join(' ')),off=[];let o=0;ws.forEach(w=>{off.push(o);o+=w.length+1});
  if(VOICE){u.voice=VOICE;u.lang=VOICE.lang}else u.lang='en-US';u.pitch=c.p;u.rate=c.r;
  u.onstart=()=>{if(LIVE[li]!=st)return;st.c=c;st.cs=now();st.off=off;st.bd=0;st.w=c.a;song&&song.duck(.55);if(c.cut)ACT.push([st.cs+c.cut,()=>{if(LIVE[li]==st){SS.cancel();sayFrom(li,j+1)}}])};
  u.onboundary=e=>{if(LIVE[li]!=st||e.name&&e.name!='word')return;let k=0;off.forEach((x,i)=>{if(e.charIndex>=x)k=i});st.bd=1;st.w=c.a+k};
  u.onend=u.onerror=()=>{if(LIVE[li]==st&&j==P.length-1){st.done=1;st.te=now();song&&song.duck(1)}};
  SS.speak(u);if(c.cut)break}}
function curWord(li,t){const L=SONG.LINES[li];let k=-1;if(!TTS){L.words.forEach((w,i)=>{if(w.t<=t)k=i});return k}
 const st=LIVE[li];if(!st||!st.c)return-1;if(st.done)return L.words.length-1;if(st.bd)return st.w;
 const ch=(t-st.cs)*st.c.r/.068;st.off.forEach((x,i)=>{if(ch>=x)k=i});return min(st.c.a+max(k,0),st.c.b-1)}
function speech(t){
 while(SAID<SONG.LINES.length&&SONG.LINES[SAID].t<=t+.05){const L=SONG.LINES[SAID];if(L.t>t-1){SS.cancel();ACT=[];LIVE[SAID]={};song&&song.duck(1);sayFrom(SAID,0)}SAID++}
 ACT=ACT.filter(([at,f])=>at>t||f());
 if(t>SONG.LEN-3&&!ENDED){ENDED=1;SS.cancel();song&&song.duck(1)}}
if(TTS){SS.cancel();addEventListener('pagehide',()=>SS.cancel());addEventListener('beforeunload',()=>SS.cancel())}

// ================= run =================
let actx,song,p0,started=0;
const now=()=>actx&&song?actx.currentTime-song.base:(performance.now()-p0)/1000+T0;
function loop(){const t=started?now():0;if(started&&TTS)speech(t);frame(t);requestAnimationFrame(loop)}
p0=performance.now();loop();if(Q.has('scan'))window.__f=t=>{frame(t);return GR.reduce((a,g)=>a+g.length,0)};
S.onclick=async()=>{if(started)return;S.style.display='none';
 // prime speech inside the gesture so Safari/iOS allow the later, clock-cued lines
 if(TTS){pickVoice();SS.onvoiceschanged=pickVoice;const u=new SU(' ');u.volume=0;SS.speak(u)}
 if(!MUTE){try{actx=new AudioContext();await actx.resume();song=SONG.live(actx,T0)}catch(e){actx=0}}
 p0=performance.now();started=1};
})();
