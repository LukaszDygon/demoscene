'use strict';
const BAR=3,O=60,$=id=>document.getElementById(id),cv=$('c');
const gl=cv.getContext('webgl2',{antialias:false,depth:false,stencil:false,alpha:false});
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const bump=(T,c,w)=>{const d=T-c;return d>=0&&d<w?Math.sin(Math.PI*d/w):0};
const Z=t=>t<36?-2.5+1.2*(t-24):11.9+(t-36);
const HERO=[[-3.2,15.9,40,7],[3.1,21.9,46,8],[-3,27.9,52,7.5],[-2.4,38.3,62.25,8],[1.8,38.7,62.4,7.5],[-.6,38,62.2,9]];
const HER=new Float32Array(HERO.flatMap(([x,z,tf,h])=>[x,z,tf+O,h]));
const CLA=[[24,.3,.4,.1],[27,.7,.44,.6],[31.5,.45,.64,.3],[36,.62,.36,.9],[42,.36,.44,.2],[48,.66,.6,.5],[54,.5,.34,.8],[61.5,.5,.47,.7]].map(([t,x,y,s])=>[t+O,x,y,s]);
const BRA=[[29,.2,.55,.2],[31,.8,.5,.4],[33.5,.35,.3,.6],[35,.7,.7,.8],[37,.5,.45,.5],[39.5,.25,.6,.9]];
const CL=new Float32Array(64);for(let i=0;i<16;i++)CL[i*4]=-99;
[...BRA,...CLA].forEach((c,i)=>CL.set(c,i*4));
const CUTS=[24,42,60,66,96,162];
const WORLD=T=>T<24?3:T<42?4:T<60?5:T<O+6?2:T<O+36?0:T<162?1:6;
const TH=[[-1.8,-1.2],[1.9,-1.4],[-.6,-2.4],[1,-.4]],TF=[39.4,39.8,38.8,41];

function pack(list){const F=new Float32Array(24),P=new Float32Array(24);
 for(let k=0;k<6;k++){const s=list[k];F.set(s?s.f:[0,-200,0,0],k*4);P.set(s?s.p:[0,0,0,0],k*4)}return{F,P}}

function camA(T){
 const W=[25.5,30.5,42.5,49];let ro,ta;
 if(T<6){ro=[-2,2.6,-18+.2*T];ta=[-6,6,40]}
 else if(T<13){ro=[-7,1.6,.03*T];ta=[0,1.3,0]}
 else if(T<19){ro=[-3.5,1.1,-6];ta=[0,1.4,-2.5]}
 else if(T<24){ro=[-2.2,.3,.6];ta=[0,1.5,0]}
 else if(T<36){const z=Z(T);ro=[-3,2.3,z-5];ta=[0,1.1,z+1.8]}
 else if(T<60){const z=Z(T);ro=[.4*Math.sin(.4*T),2,z-4.5];ta=[0,1.1,z+1.8]}
 else{const zs=Z(60),b=Math.max(0,T-84);ro=[.5+.02*Math.max(0,T-60),1.5+.05*b,zs-4.2-.12*b+.8*sm(60,61.5,T)];ta=[0,1.4,zs+.1]}
 W.forEach((w,i)=>{ta[0]+=(i%2?-1:1)*2.2*sm(w,w+.12,T)});
 return{ro,ta}
}
function figsA(u){
 let a=[0,0,-2.5,Math.PI/2],b=[0,0,2.5,-Math.PI/2],sa=u<8?-.3:.45,sb=sa;
 if(u>=24&&u<60){const z=Z(u);
  a=u<36?[0,0,z,Math.PI/2]:[-.6+.5*Math.sin(.9*u),0,z,Math.PI/2];
  b=u<36?[0,0,z+5,Math.PI/2]:[.6*Math.sin(.9*u+2),0,z+5,Math.PI/2];
  sa=.6+.6*Math.sin(5*u);sb=.6+.6*Math.sin(5*u+1);
  let hop=0,lu=0;
  CLA.forEach(([c],i)=>{const v=c-O;if(v>=60)return;hop+=.55*bump(u,v,.6);lu+=(i%2?1:-1)*.4*bump(u,v,.5);sa+=1.4*bump(u,v,.4);sb-=1.4*bump(u,v,.4)});
  a[1]=b[1]=hop;a[0]+=lu;b[0]-=lu;
 }
 if(u>=60){const zs=Z(60);a=[-.9,0,zs,0];b=[.9,0,zs+.2,Math.PI];sa=u<62.8?0:-.5;sb=.2}
 const L=sm(60,60.6,u),fall=1.45*sm(61.5,62.6,u);
 return pack([{f:a,p:[0,1.1*L*(1-sm(62,62.8,u)),sa,1]},{f:b,p:[fall,1.1*L*(1-sm(61.5,62.4,u)),sb,0]}]);
}
function figsB(T){
 let hx=0;BRA.forEach(([c],i)=>{hx+=(i%2?.35:-.35)*bump(T,c,.5)});
 const L=[{f:[hx,0,.6,-Math.PI/2],p:[0,0,.5*Math.sin(3*T),1]}];
 TH.forEach((th,k)=>{let lu=0,hp=0;
  BRA.forEach(([c],i)=>{if(i%4===k){const b=bump(T,c,.6);lu+=.7*b;hp=Math.max(hp,.5*b)}});
  const dx=hx-th[0],dz=.6-th[1],dl=Math.hypot(dx,dz);
  L.push({f:[th[0]+dx/dl*lu,hp,th[1]+dz/dl*lu,Math.atan2(dz,dx)],p:[1.4*sm(TF[k],TF[k]+.8,T),0,0,0]})});
 return pack(L);
}
function camG(T){
 if(T<24){const z=Math.min(2+2*T,46);return{ro:[-3.5,1.6,z-6],ta:[0,1.5,z+2]}}
 if(T<42){const s=T-24;return{ro:[.4*Math.sin(s*.6),1.7,4],ta:[.2*Math.sin(s*5)*sm(36,37,T),1.6,-5.8]}}
 if(T<60){const s=T-42;return{ro:[-6,1.8,-8+.1*s],ta:[0,2,0]}}
 if(T<162)return camA(T-O);
 const s=T-162;return{ro:[2.2+.08*s,1.4,-4.2],ta:[0,1.1,.5]};
}
function figsG(T){
 if(T<24){const z=Math.min(2+2*T,46);return pack([{f:[0,0,z,Math.PI/2],p:[0,.04*Math.abs(Math.sin(T*6)),-.25,1]}])}
 if(T<42)return figsB(T);
 if(T<60){const s=T-42;return pack([{f:[-1.1+.15*Math.sin(s*.7),0,.2,0],p:[0,0,.4+.5*Math.sin(s*2.2),0]},{f:[1.1-.15*Math.sin(s*.7),0,.2,Math.PI],p:[0,0,.4+.5*Math.sin(s*2.2+1),0]}])}
 if(T<162)return figsA(T-O);
 return pack([]);
}
function tearsAt(T){const v=new Float32Array(9);[[-2.3,1.2,30],[.8,1.9,34],[2.6,.8,38]].forEach(([x,y,t],k)=>v.set([x,y,.42*sm(t,t+.3,T)],k*3));return v}

const VS=`#version 300 es
void main(){float x=float((gl_VertexID<<1)&2),y=float(gl_VertexID&2);gl_Position=vec4(x*2.-1.,y*2.-1.,0.,1.);}`;

const FS1=`#version 300 es
precision highp float;
uniform vec2 uR;uniform float uT,uFade,uWorld,uSeason;uniform vec3 uRo,uTa,uTear[3];
uniform vec4 uF[6],uP[6],uH[6];
out vec4 o;
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec3 hash3(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.103,.0973));q+=dot(q,q.yxz+33.33);return fract((q.xxy+q.yzz)*q.zyx);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
bool hitp(vec3 ro,vec3 rd,float th,vec3 lp,float rad){float tc=dot(lp-ro,rd);return tc>0.&&(th<0.||tc<th)&&length(ro+rd*tc-lp)<rad;}
float fig(vec3 p,vec4 f,vec4 z){
 vec3 d=p-vec3(f.x,f.y+z.y,f.z);
 if(length(d)>2.6)return length(d)-2.2;
 float c=cos(f.w),s=sin(f.w);
 vec3 l=vec3(dot(d,vec3(c,0,s)),d.y,dot(d,vec3(-s,0,c)));
 l.xy=rot(l.xy,z.x);
 l.x+=.035*sin(3.*l.y-2.6*uT+f.x*2.)*smoothstep(.3,.9,l.y);
 vec3 hd=vec3(.25,1.02,.22);
 float r=min(cap(l,vec3(0,.05,0),vec3(0,1.1,0),.24),cap(l,vec3(0,.02,0),vec3(0,.3,0),.36));
 r=min(r,length(l-vec3(0,1.52,0))-.13);
 r+=.012*sin(l.y*18.+l.x*9.)*smoothstep(.2,.5,l.y);
 r=min(r,cap(l,vec3(0,1.2,.1),hd,.05));
 r=min(r,cap(l,vec3(0,1.15,0),vec3(.25,.95,.22),.085));
 r=min(r,cap(l,vec3(-.12,1.1,-.12),vec3(-.5,.5,-.2),.03));
 if(z.w>.5)r=min(r,(length((l-vec3(0,1.64,0))/vec3(.42,.12,.42))-1.)*.12);
 r=min(r,cap(l,hd,hd+vec3(cos(z.z),sin(z.z),0.)*.95,.022));
 return r;
}
float figs(vec3 p){float d=1e2;for(int k=0;k<6;k++)d=min(d,fig(p,uF[k],uP[k]));return d;}
float stalk(vec3 p,vec4 h,float r){
 float a=1.5708*smoothstep(h.z,h.z+1.,uT);
 vec3 q=vec3(h.x,0,h.y);
 return cap(p,q,q+vec3(sign(h.x)*sin(a),cos(a),0)*h.w,r);
}
float grove(vec3 p){
 vec2 id=floor(p.xz/2.2+.5);float d=1e2;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
  vec2 c=id+vec2(float(i),float(j));
  if(abs(c.x)<1.5)continue;
  vec3 h=hash3(c);
  vec3 q=p-vec3(c.x*2.2+(h.x-.5)*.6,0,c.y*2.2+(h.y-.5)*.6);
  float H=6.+3.*h.z;
  d=min(d,max(length(q.xz)-.07,max(-q.y,q.y-H)));
  d=min(d,(length((q-vec3(0,H-.6,0))/vec3(.9,.25,.9))-1.)*.2);
 }
 return d;
}
float reed(vec3 p){
 vec2 id=floor(p.xz/.9+.5);float d=1e2;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
  vec2 c=id+vec2(float(i),float(j));
  if(abs(c.x)<3.5)continue;
  vec3 h=hash3(c+7.);
  vec3 q=p-vec3(c.x*.9+(h.x-.5)*.3,0,c.y*.9+(h.y-.5)*.3);
  d=min(d,max(length(q.xz)-.018,max(-q.y,q.y-(1.1+1.2*h.z))));
 }
 return d;
}
float pagoda(vec3 p){
 vec3 q=p-vec3(-9.,0.,70.);float d=1e2,y=0.;
 for(int k=0;k<5;k++){
  float w=6.-float(k)*1.05,h=3.2-float(k)*.35;
  d=min(d,box(q-vec3(0.,y+h*.5,0.),vec3(w*.5,h*.5,w*.5)));
  d=min(d,box(q-vec3(0.,y+h+.12,0.),vec3(w*.5+.5,.12,w*.5+.5)));
  y+=h+.25;
 }
 return d;
}
float rings(vec2 q){vec2 g=floor(q*3.),f=fract(q*3.)-.5;float s=0.;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=g+vec2(float(i),float(j));vec3 h=hash3(c);
  float ph=fract(uT*(.5+.4*h.z)+h.x);vec2 dq=f-vec2(float(i),float(j))-(h.xy-.5)*.6;
  float rr=length(dq)/ph;s+=smoothstep(.1,.0,abs(rr-.5))*(1.-ph)*step(.02,ph);}
 return s;}
float cliff(vec3 p){return box(p-vec3(-16.,9.,50.),vec3(5.,9.,6.));}
float lantern(vec3 p){
 float zc=9.*floor(p.z/9.+.5);
 vec3 q=vec3(p.x-2.4-.05*sin(uT*1.3+zc),p.y,p.z-zc);
 return min(length(q-vec3(0,2.1,0))-.26,cap(q,vec3(0),vec3(0,2.1,0),.015));
}
float pines(vec3 p){
 float zc=4.*floor(p.z/4.+.5);vec3 h=hash3(vec2(zc,3.1));float d=1e2;
 for(int s=-1;s<=1;s+=2){vec3 q=p-vec3(float(s)*(6.5+h.x),0.,zc);
  d=min(d,max(length(q.xz)-.9*(1.-q.y/4.),max(-q.y,q.y-4.)));}
 return d;
}
float houses(vec3 p){
 float xs=5.*floor(p.x/5.+.5);vec3 h=vec3(p.x-xs,p.y,p.z-62.);
 return min(box(h-vec3(0.,1.6,0.),vec3(1.8,1.6,1.8)),box(h-vec3(0.,3.4,0.),vec3(2.1,.25,2.1)));
}
float chairs(vec3 p){
 float d=1e2;
 for(int k=0;k<2;k++){float a=uT-(k==0?33.:36.5);
  if(a>0.){vec3 c=vec3(-1.5+3.*float(k),max(.45,.6+2.5*a-2.*a*a),-1.2+.5*min(a,1.2));
   vec3 q=p-c;q.xy=rot(q.xy,min(a,1.2)*5.);d=min(d,box(q,vec3(.4,.4,.35)));}
 }
 return d;
}
float rocks(vec3 p){
 vec2 id=floor(p.xz/3.+.5);if(abs(id.x)<2.)return 1e2;
 vec3 h=hash3(id+5.);vec3 q=p-vec3((id.x+h.x-.5)*.6,.2,id.y*3.);
 return length(q*vec3(1.,1.4,1.))-(.4+.4*h.z);
}
float pads(vec3 p){
 vec2 id=floor(p.xz/1.6+.5);vec3 h=hash3(id+11.);
 vec3 q=p-vec3((id.x+h.x-.5)*.6,.03,(id.y+h.y-.5)*.6);
 return max(length(q.xz)-(.3+.2*h.z),abs(q.y)-.02);
}
float bare(vec3 p){
 vec3 q=p-vec3(-2.4,0.,-.6);float d=cap(q,vec3(0),vec3(0,2.4,0),.07);
 d=min(d,cap(q,vec3(0,1.2,0),vec3(.9,2.6,.2),.04));d=min(d,cap(q,vec3(0,1.6,0),vec3(-.8,2.9,.3),.04));
 d=min(d,cap(q,vec3(0,2.,0),vec3(.2,3.4,-.5),.035));d=min(d,cap(q,vec3(.9,2.6,.2),vec3(1.5,3.,.5),.03));
 return min(d,cap(q,vec3(-.8,2.9,.3),vec3(-1.4,3.5,.1),.03));
}
float tree(vec3 p){
 float d=cap(p,vec3(0.),vec3(0.,3.,0.),.18);
 d=min(d,cap(p,vec3(0.,2.,0.),vec3(1.8,3.8,.4),.1));
 d=min(d,cap(p,vec3(0.,2.4,0.),vec3(-1.6,3.4,-.5),.1));
 d=min(d,cap(p,vec3(0.,2.8,0.),vec3(.2,4.6,1.2),.08));
 return min(d,length(p-vec3(0.,4.6,0.))-2.4+.6*vn(p.xz*1.1+p.y*.8));
}
float pass(vec3 p){
 float g=abs(p.z-27.)<7.?p.y+7.:p.y;
 float cl=min(box(p-vec3(-11.,6.,27.),vec3(2.,6.,7.)),box(p-vec3(11.,6.,27.),vec3(2.,6.,7.)));
 float zb=clamp(1.2*floor((p.z-20.)/1.2+.5)+20.,20.,34.);
 float br=(p.z>19.&&p.z<35.)?box(vec3(p.x,p.y,p.z-zb),vec3(1.1,.06,.42)):1e2;
 float rope=min(cap(p,vec3(-1.2,.9,20.),vec3(-1.2,.9,34.),.02),cap(p,vec3(1.2,.9,20.),vec3(1.2,.9,34.),.02));
 float gate=min(box(p-vec3(-2.,2.,50.),vec3(.2,2.,.2)),box(p-vec3(2.,2.,50.),vec3(.2,2.,.2)));
 gate=min(gate,box(p-vec3(0.,4.3,50.),vec3(3.,.2,.6)));
 float wall=box(p-vec3(0.,.6,50.8),vec3(9.,.6,.25));
 return min(min(min(g,min(br,rope)),min(min(gate,wall),figs(p))),min(min(pines(p),houses(p)),min(cl,rocks(p))));
}
float brawl(vec3 p){
 float d=-box(p-vec3(0.,2.,0.),vec3(4.5,2.,6.));
 d=min(d,box(p-vec3(0.,.42,0.),vec3(.7,.42,.4)));
 vec3 q=p-vec3(0.,2.,-5.8);
 float scr=box(q-vec3(0.,0.,.04*sin(p.x*3.+uT*4.)),vec3(4.4,2.,.05));
 for(int k=0;k<3;k++){vec3 tc=uTear[k];scr=max(scr,-(length(q.xy-tc.xy)-tc.z));}
 d=min(min(d,scr),min(figs(p),chairs(p)));
 d=min(d,box(p-vec3(.2*sin(uT),3.2,0.),vec3(.3,.3,.3)));
 return d;
}
float cherry(vec3 p){
 float d=min(p.y,min(tree(p),tree(p-vec3(-14.,0.,18.))));
 d=min(d,box(p-vec3(-3.,.9,1.6),vec3(.12,.9,.12)));
 d=min(d,min(box(p-vec3(3.,.5,2.),vec3(.25,.5,.25)),box(p-vec3(3.,1.3,2.),vec3(.4,.12,.4))));
 return min(d,figs(p));
}
float epi(vec3 p){
 float st=box(p-vec3(0.,1.1,0.),vec3(.25,1.1,.12));
 st=min(st,cap(p,vec3(-.25,2.2,0.),vec3(.25,2.2,0.),.12));
 float mound=(length(p*vec3(1.,3.,.8)-vec3(0.,0.,1.))-1.)/3.;
 vec3 gh=hash3(floor(p.xz/.5+.5));
 vec3 gq=p-vec3(floor(p.x/.5+.5)*.5+(gh.x-.5)*.2,0.,floor(p.z/.5+.5)*.5+(gh.y-.5)*.2);
 float gr=length(p.xz)<6.?cap(gq,vec3(0.),vec3(.05*sin(uT+gh.x*6.),.25+.2*gh.z,0.),.012):1e2;
 return min(min(p.y-.02*vn(p.xz*.8),min(st,mound)),min(gr,bare(p)));
}
float map(vec3 p){
 if(uWorld>5.5)return epi(p);
 if(uWorld>4.5)return cherry(p);
 if(uWorld>3.5)return brawl(p);
 if(uWorld>2.5)return pass(p);
 if(uWorld>1.5&&uWorld<2.5)return min(min(p.y,reed(p)),min(min(pagoda(p),cliff(p)),pads(p)));
 if(uWorld<.5)return min(figs(p),min(box(p-vec3(0,-.5,0),vec3(1.6,.5,80.)),lantern(p)));
 float d=min(figs(p),p.y);
 for(int k=0;k<6;k++)d=min(d,stalk(p,uH[k],.07));
 return min(d,grove(p));
}
vec3 mtn(vec3 rd){
 float a=atan(rd.x,rd.z),e=rd.y;float r=0.;
 for(int L=0;L<4;L++){float f=float(L);
  float ridge=.27-.055*f+.1*fbm(vec2(a*(1.5+.7*f)+3.1*f,7.3*f));
  float m=(1.-smoothstep(ridge-.006,ridge+.006,e))*smoothstep(-.07,-.02,e);
  float dl=.16+.1*f+.12*fbm(vec2(a*9.+f,e*40.))+.06*vn(vec2(a*60.,e*200.));
  r=mix(r,dl,m);
 }
 r+=.07*smoothstep(-.02,.03,e)*smoothstep(.12,.0,e)*fbm(vec2(a*5.,e*30.));
 float mo=dot(rd,normalize(vec3(-.35,.5,1.)));
 if(mo>.9988)return vec3(0.);
 return vec3(max(r,.26*smoothstep(.993,.9988,mo)),0.,0.);
}
void main(){
 if(uT<0.){o=vec4(0.);return;}
 vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;
 vec3 ww=normalize(uTa-uRo),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
 vec3 rd=normalize(uv.x*uu+uv.y*vv+1.7*ww);
 float t=0.,hit=-1.;
 for(int i=0;i<110;i++){float d=map(uRo+rd*t);if(d<.0015*t){hit=t;break;}t+=d*.8;if(t>90.)break;}
 vec2 r=vec2(0.);float sn=0.;
 if(hit>0.){
  vec3 p=uRo+rd*hit;
  vec3 n=normalize(vec3(map(p+vec3(.002,0,0))-map(p-vec3(.002,0,0)),map(p+vec3(0,.002,0))-map(p-vec3(0,.002,0)),map(p+vec3(0,0,.002))-map(p-vec3(0,0,.002))));
  float ndl=max(dot(n,normalize(vec3(-.4,1.,-.6))),0.);
  if(figs(p)<.01)r=vec2(.9,1.);
  else if(uWorld<.5){
   if(lantern(p)<.02)r=vec2(.3,0.);
   else r=vec2(.5+.4*ndl+.1*step(.5,fract(p.x*7.))+.2*rings(p.xz*2.),1.);
  }
  else if(uWorld<1.5){if(p.y<.01)r=vec2(.2,0.);else r=vec2(.5+.4*ndl,1.);}
  else if(uWorld<2.5){
   if(p.y<.01){r=vec2(max(mtn(vec3(rd.x,-rd.y,rd.z)).x*.85,rings(p.xz*2.)*.14)+.05,0.);}
   else if(cliff(p)<.02)r=vec2(.35+.4*vn(vec2(p.x*40.,p.y*4.-uT*10.)),0.);
   else r=vec2(.5+.3*ndl,1.);
  }
  else if(uWorld<3.5){
   if(abs(p.x)>8.9&&abs(p.z-27.)<7.&&p.y>-.5&&p.y<12.)r=vec2(.35+.4*vn(vec2(p.z*12.,p.y*1.5-uT*6.)),0.);
   else if(p.y<-6.9)r=vec2(.12,0.);
   else if(p.y<.01)r=vec2(.25,0.);
   else if(abs(p.x)<1.25&&p.z>19.&&p.z<35.)r=vec2(.6,1.);
   else r=vec2(.7,1.);
  }
  else if(uWorld<4.5){
   if(abs(p.z+5.8)<.08)r=vec2(.42,1.);
   else if(abs(p.z+5.99)<.05&&abs(p.x)<1.2&&p.y>1.&&p.y<3.)r=vec2(.2+.5*step(.6,vn(p.xy*vec2(7.,13.))),1.);
   else if(p.y<.9&&abs(p.x)<.7&&abs(p.z)<.4)r=vec2(.8,1.);
   else r=vec2(.3,0.);
  }
  else if(uWorld<5.5){if(p.y<.01)r=vec2(.22+.3*step(.7,vn(p.xz*9.)),0.);else r=vec2(.6+.3*ndl+.1*vn(p.xy*30.),1.);}
  else{
   if(abs(p.z+.12)<.02&&abs(p.x)<.2&&p.y>.4&&p.y<1.9)r=vec2(.15+.6*step(.55,vn(p.xy*vec2(14.,6.))),1.);
   else if(p.y<.01)r=vec2(.3*(1.-.6*uSeason)+.1*vn(p.xz*3.),0.);
   else r=vec2(.55+.3*ndl,1.);
  }
  if(uWorld>.5&&uWorld<3.5)r.x+=.12*smoothstep(3.,0.,p.y)*vn(p.xz*.6+vec2(uT*.05));
  r.x*=1.-.6*(1.-exp(-hit*.04));
 }else{vec3 m=mtn(rd);r=m.xy;}
 for(int k=0;k<6;k++){
  vec4 h=uH[k];float age=uT-h.z;if(age<0.||age>3.5)continue;
  float a=1.5708*smoothstep(h.z,h.z+1.,uT);
  vec3 o0=vec3(h.x,0,h.y)+vec3(sign(h.x)*sin(a),cos(a),0)*h.w*.8;
  for(int j=0;j<6;j++){
   vec3 v=hash3(vec2(float(k*6+j),3.7))-.5;
   vec3 lp=o0+vec3(v.x*2.5*age,v.y*2.5*age+.6*age,v.z*2.5*age)-vec3(0,.25*age*age,0);
   lp.y=max(lp.y,.04);
   if(hitp(uRo,rd,hit,lp,.035))r=vec2(.85,1.);
  }
 }
 if(uWorld>4.5&&uWorld<5.5){
  for(int k=0;k<40;k++){vec3 h=hash3(vec2(float(k),2.3));
   vec3 lp=vec3((h.x-.5)*14.+.5*sin(uT*.9+h.z*6.),fract(h.y-uT*.07)*7.,(h.z-.5)*14.);
   if(hitp(uRo,rd,hit,lp,.05))r=vec2(.6,1.);
  }
 }
 if(uWorld>5.5){
  for(int k=0;k<84;k++){vec3 h=hash3(vec2(float(k),9.1));
   vec3 lp=vec3((h.x-.5)*12.+.6*sin(uT*.8+h.z*6.),fract(h.y-uT*(.05+.05*h.z))*6.,(h.z-.5)*12.);
   if(k<24){if(uSeason<.5&&hitp(uRo,rd,hit,lp,.04))r=vec2(.85,1.);}
   else if(uSeason>.5&&hitp(uRo,rd,hit,lp,.035))sn=1.;
  }
 }
 o=vec4(clamp(r.x*uFade,0.,1.),sn,r.y,1.);
}`;

const FS2=`#version 300 es
precision highp float;
uniform sampler2D uS;uniform vec2 uR,uTX;uniform float uT,uRain,uSl,uTint;uniform vec3 uSt,uDr;uniform vec4 uCl[16];
out vec4 o;
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
void main(){
 vec2 uv=gl_FragCoord.xy/uR;float asp=uR.x/uR.y;vec2 P=uv*vec2(asp,1.);
 vec2 s=uv+(vec2(vn(P*6.),vn(P*6.+9.))-.5)*.0045;
 vec4 S0=texture(uS,s);
 float A=S0.r,cr=S0.b;
 vec2 e=uTX;
 float B=(texture(uS,s+vec2(2.*e.x,0)).r+texture(uS,s-vec2(2.*e.x,0)).r+texture(uS,s+vec2(0,2.*e.y)).r+texture(uS,s-vec2(0,2.*e.y)).r)*.25;
 float W=(texture(uS,s+vec2(7.*e.x,3.*e.y)).r+texture(uS,s-vec2(7.*e.x,3.*e.y)).r+texture(uS,s+vec2(-7.*e.x,3.*e.y)).r+texture(uS,s+vec2(3.*e.x,-7.*e.y)).r)*.25;
 float edge=length(vec2(texture(uS,s+vec2(e.x,0)).r-texture(uS,s-vec2(e.x,0)).r,texture(uS,s+vec2(0,e.y)).r-texture(uS,s-vec2(0,e.y)).r));
 float br=vn(vec2(P.x*16.,P.y*240.))*.6+vn(vec2(P.x*5.,P.y*70.))*.4;
 float dry=vn(vec2(P.x*90.,P.y*700.));
 float soft=mix(B,W,.5)*.8+.15*(br-.5)*B;
 float rag=smoothstep(.22,.62,mix(B,A,.6)+(br-.5)*.5)*(.85+.3*dry);
 float ink=mix(soft,rag,cr)+edge*cr*(.5+br)*.9+.15*edge*(1.-cr);
 ink*=1.-S0.g;
 float rn=0.;
 for(int k=0;k<2;k++){float f=float(k)+1.;
  vec2 g=vec2(uv.x*asp*(60.+30.*f)+uv.y*3.,uv.y*2.6+uT*(1.1+.5*f));
  vec2 id=floor(g),fr=fract(g);float h=hash(id+f*17.);
  rn+=step(.8,h)*(1.-smoothstep(.02,.05,abs(fr.x-.5)))*smoothstep(0.,.3,fr.y)*(1.-smoothstep(.4,.5,fr.y))*.6;
 }
 ink=max(ink,uRain*rn);
 for(int i=0;i<16;i++){vec4 c=uCl[i];float a=uT-c.x;if(a<0.||a>5.)continue;
  vec2 d=(uv-c.yz)*vec2(asp,1.);float r=length(d);
  float R=.03+.14*(1.-exp(-a*6.));
  float wob=vn(vec2(atan(d.y,d.x)*1.5+c.w*7.,a*1.7))-.5;
  float bl=1.-smoothstep(R*.85,R*1.05,r+R*.5*wob);
  for(int k=0;k<14;k++){float fk=float(k),h=hash(vec2(fk,c.w*31.));
   vec2 v=vec2(cos(fk*.449+c.w*6.3),sin(fk*.449+c.w*6.3))*(.15+.35*h);
   float tt=min(a,1.4);vec2 dp=v*tt-vec2(0.,.6*tt*tt);
   float rr=.004+.006*h;
   bl=max(bl,(1.-smoothstep(rr*.6,rr,length(d-dp)))*exp(-max(a-1.4,0.)*1.4));}
  for(int k=0;k<8;k++){float an=float(k)*.785+c.w;vec2 dir=vec2(cos(an),sin(an));
   float L=.22*(1.-exp(-a*12.))*exp(-a*3.);float tp=dot(d,dir);
   float pp=abs(dot(d,vec2(-dir.y,dir.x)));
   bl=max(bl,step(0.,tp)*step(tp,L)*(1.-smoothstep(.001,.003,pp))*.9);}
  ink=max(ink,bl*exp(-a*.85)*.95);
  ink+=.2*fbm(d*8.+c.w)*exp(-a*1.5)*(1.-smoothstep(0.,R*4.,r));
 }
 float sl=uT-uSl,fl=0.;
 if(sl>0.){float p=smoothstep(0.,.25,sl),x=uv.x;
  float yc=.47+.03*sin(x*2.2+.6);
  float w=.003+.024*sin(3.14159*x)*(.6+.4*vn(vec2(x*3.,4.)));
  float m=(1.-smoothstep(w*.6,w,abs(uv.y-yc)))*step(x,p)*(.7+.3*vn(vec2(x*160.,uv.y*70.)));
  ink=max(ink,m*exp(-max(sl-1.,0.)*.4));
  fl=exp(-sl*4.)*.4;}
 if(uT>0.){float x=uv.x,p=smoothstep(0.,1.3,uT);
  float yc=uSt.y+.012*sin(x*5.);
  float w=.02+.03*vn(vec2(x*40.,uv.y*6.))*(1.-.5*x);
  float m=(1.-smoothstep(w*.5,w,abs(uv.y-yc)))*step(uSt.x,x)*step(x,uSt.x+(1.-uSt.x)*p)*(.75+.25*vn(vec2(x*200.,uv.y*60.)));
  ink=max(ink,m*exp(-max(uT-3.,0.)*.7));}
 for(int i=0;i<4;i++){float k=uT-(i==0?24.:i==1?42.:i==2?60.:162.);
  if(k>-.4&&k<.7){float y=1.-(k+.4)/1.1;float m=(1.-smoothstep(.004,.012,abs(uv.y-y)))*(.7+.3*vn(vec2(uv.x*180.,y*60.)));ink=max(ink,m*.9);}}
 float vm=0.,a=uT-uDr.z;
 if(a>0.){vec2 d=(uv-uDr.xy)*vec2(asp,1.);float R=.03*(1.-exp(-a*5.));
  vm=1.-smoothstep(R*.85,R,length(d)+R*.25*(vn(vec2(atan(d.y,d.x)*2.,a))-.5));}
 vec3 paper=vec3(.955,.93,.85)*(.965+.035*vn(P*600.)+.02*vn(P*90.))*(.985+.03*fbm(P*2.5));
 vec3 inkc=mix(vec3(.04,.04,.05),vec3(.07,.1,.24),uTint);
 vec3 ic=mix(mix(vec3(.09,.09,.1),inkc,.5),inkc,clamp(ink,0.,1.));
 vec3 col=mix(paper,ic,clamp(ink,0.,1.)*.94);
 col=mix(col,vec3(.78,.15,.11),clamp(vm,0.,1.)*.92);
 col=mix(col,paper,fl);
 col*=1.-.12*dot(uv-.5,uv-.5);
 o=vec4(col,1.);
}`;

function P(fs){const p=gl.createProgram();
 [[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,fs]].forEach(([k,src])=>{const h=gl.createShader(k);gl.shaderSource(h,src);gl.compileShader(h);
  if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(h));gl.attachShader(p,h)});
 gl.linkProgram(p);return p}
const U=(p,names)=>Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));
const p1=P(FS1),p2=P(FS2);
const u1=U(p1,['uR','uT','uFade','uWorld','uSeason','uRo','uTa','uTear','uF','uP','uH']);
const u2=U(p2,['uS','uR','uTX','uT','uRain','uSl','uTint','uSt','uDr','uCl']);

function tgt(w,h){const t=gl.createTexture(),f=gl.createFramebuffer();
 gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]]
  .forEach(([k,v])=>gl.texParameteri(gl.TEXTURE_2D,k,v));
 gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
 return{t,f,w,h}}
let S=null,q=1;
function mk(){const sh=Math.round(Math.min(cv.height,620)*q),sw=Math.round(sh*cv.width/cv.height);
 if(S){gl.deleteTexture(S.t);gl.deleteFramebuffer(S.f)}S=tgt(sw,sh)}
function resize(){const d=Math.min(window.devicePixelRatio||1,1.5);
 cv.width=Math.round(innerWidth*d);cv.height=Math.round(innerHeight*d);mk()}
addEventListener('resize',resize);resize();

const CAP=[
 [1,11,'峠道','The mountain pass'],
 [12.5,18,'吊橋','The rope bridge'],
 [19,23.5,'門','The village gate'],
 [25,29,'酒楼','The teahouse'],
 [29.5,37,'紙障子','Paper screens tear'],
 [38,41.5,'静寂','Silence'],
 [42.5,50,'追憶','Memory'],
 [50.5,59,'桜の下で','Under the cherry tree'],
 [O+.6,O+5.8,'月下','Moonlight on still water'],
 [O+6.6,O+13,'對峙','Standoff in the rain'],
 [O+13.6,O+22.6,'雨は静かに','The rain is quiet'],
 [O+25,O+34.5,'屋根を走る','Across the roofs'],
 [O+36.6,O+47,'竹林','Bamboo grove'],
 [O+47.5,O+58.5,'竹を断つ','Stalks cut through'],
 [O+60.6,O+61.9,'静','Stillness'],
 [O+62,O+70,'一閃','One stroke'],
 [O+63,O+77,'竹倒る','The bamboo falls'],
 [O+80,O+93,'墨は乾く','The ink dries'],
 [163,170,'秋','Autumn leaves'],
 [170.5,177,'雪','Snow settles']];
const STAMP=[[.4,'序'],[24,'破'],[42,'想'],[60,'壱'],[84,'弐'],[120,'参'],[176,'終']];
const cap=$('cap');let ck=null,ct=0,si=0;
function caption(T){const c=CAP.find(x=>T>=x[0]&&T<x[1]),k=c?c[2]:'';if(k===ck)return;ck=k;
 cap.classList.remove('on');clearTimeout(ct);
 ct=setTimeout(()=>{$('cj').innerHTML=c?[...c[2]].map((ch,i)=>`<span class="ch" style="animation-delay:${(i*.13).toFixed(2)}s">${ch}</span>`).join(''):'';
  $('ce').textContent=c?c[3]:'';if(c)cap.classList.add('on')},k?350:0)}
function stamp(T){if(si<STAMP.length&&T>=STAMP[si][0]){const e=$('stamp');e.textContent=STAMP[si][1];e.classList.remove('go');void e.offsetWidth;e.classList.add('go');si++}}

let song=null,actx=null,SX=.5,SY=.5,started=false,last=0,bad=0;
async function start(x,y){if(started)return;started=true;SX=x/innerWidth;SY=1-y/innerHeight;
 $('seal').classList.add('gone');
 actx=new (window.AudioContext||window.webkitAudioContext)();await actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',e=>start(e.clientX,e.clientY));
addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')start(innerWidth/2,innerHeight/2)});

function frame(now){
 requestAnimationFrame(frame);
 const dt=now-last;last=now;
 bad=dt>45?bad+1:0;if(bad>45&&q>.45){q*=.8;bad=0;mk()}
 const T=song?actx.currentTime-song.base:-1,Tc=Math.max(T,0);
 const c=camG(Tc),pf=figsG(Tc);
 const cut=1-.8*CUTS.reduce((s,k)=>s+Math.exp(-(((Tc-k)/.12)**2)),0);
 gl.bindFramebuffer(gl.FRAMEBUFFER,S.f);gl.viewport(0,0,S.w,S.h);gl.useProgram(p1);
 gl.uniform2f(u1.uR,S.w,S.h);gl.uniform1f(u1.uT,T);gl.uniform1f(u1.uFade,sm(.2,1.8,T)*cut*(1-sm(176,180,T)));
 gl.uniform1f(u1.uWorld,WORLD(Tc));gl.uniform1f(u1.uSeason,sm(164,170,Tc));
 gl.uniform3fv(u1.uRo,c.ro);gl.uniform3fv(u1.uTa,c.ta);gl.uniform3fv(u1.uTear,tearsAt(Tc));
 gl.uniform4fv(u1.uF,pf.F);gl.uniform4fv(u1.uP,pf.P);gl.uniform4fv(u1.uH,HER);
 gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.useProgram(p2);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,S.t);gl.uniform1i(u2.uS,0);
 gl.uniform2f(u2.uR,cv.width,cv.height);gl.uniform2f(u2.uTX,1/S.w,1/S.h);gl.uniform1f(u2.uT,T);
 gl.uniform1f(u2.uRain,T>=O&&T<162?1:0);gl.uniform1f(u2.uTint,sm(41.5,43,Tc)*(1-sm(59.5,61,Tc)));
 gl.uniform1f(u2.uSl,O+61.5);gl.uniform3f(u2.uSt,SX,SY,0);gl.uniform3f(u2.uDr,.62,.47,O+61.8);gl.uniform4fv(u2.uCl,CL);
 gl.drawArrays(gl.TRIANGLES,0,3);
 caption(T);stamp(T);
}
requestAnimationFrame(frame);

const PRO=[[-3,0,49,3,4.5,51.5],[-9,0,50,9,1.5,51],[-13,0,20,-9,12,34],[9,0,20,13,12,34]],BRIDGE=[[-1.2,-1,20,1.2,0,34]];
const ROOM=[[-5,-1,-7,-4.5,5,7],[4.5,-1,-7,5,5,7],[-5,-1,5.5,5,5,7],[-5,-1,-7,5,5,-6],[-4.5,0,-5.9,4.5,4,-5.7],[-1.9,0,-1.6,-1.1,1.2,-.8],[1.1,0,-1.7,1.9,1.2,-.9],[-.3,2.9,-.3,.3,3.5,.3]];
const CHER=[[-.25,0,-.25,.25,3,.25],[-3.5,2,-3.5,3.5,7,3.5],[-3.1,0,1.5,-2.9,1.9,1.7],[2.6,0,1.6,3.4,1.8,2.4]];
const POND=[[3,0,-30,30,2.4,40],[-30,0,-30,-3,2.4,40],[-21,0,44,-11,18,56]];
const RIDGE=[[-1.6,-1,-80,1.6,0,80],[2.1,0,-80,2.7,2.4,80]];
const GROVE=[];for(const i of[-2,2])for(let j=-1;j<=20;j++){const x=i*2.2,z=j*2.2;GROVE.push([x-.45,0,z-.45,x+.45,10,z+.45])}
const HB=HERO.map(([x,z,,hh])=>[x-.2,0,z-.2,x+.2,hh,z+.2]);
const EPI=[[-.4,0,-.25,.4,2.4,.25],[-1.4,-1,.4,1.4,.4,1.4],[-4,0,-2,-.8,3.6,.8]];
const boxesAt=T=>T<24?[...PRO,...BRIDGE]:T<42?ROOM:T<60?CHER:T<O+6?POND:T<O+36?RIDGE:T<162?[...GROVE,...HB]:EPI;
let lastT=0;
window.__probe={dur:180,cam:t=>{lastT=t;return camG(t).ro},get boxes(){return boxesAt(lastT)}};
