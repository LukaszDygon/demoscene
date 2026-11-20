'use strict';
// INK & STEEL. Pass 1 raymarches ink density (R) and a crisp flag (B) at reduced resolution.
// Pass 2 turns that into cream paper with bleeding, dry-brush edges, rain, clash splashes, the slash and the vermilion drop.
const BAR=3;                                           // seconds per bar (80 BPM, 4/4), same as music.js
const $=id=>document.getElementById(id);
const cv=$('c');
const gl=cv.getContext('webgl2',{antialias:false,depth:false,stencil:false,alpha:false});
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const Z=t=>t<36?-2.5+1.2*(t-24):11.9+(t-36);          // figures' advance along the ridge (rooftop) and the grove
// hero stalks [x, z, fall time, height]: three cut during the chase (40/46/52 s), three fall at the strike (62.2-62.4 s)
const HERO=[[-3.2,15.9,40,7],[3.1,21.9,46,8],[-3,27.9,52,7.5],[-2.4,38.3,62.25,8],[1.8,38.7,62.4,7.5],[-.6,38,62.2,9]];
// clash splashes [seconds, screen x, screen y, seed]: the same bars as the music
const CLASH=[[24,.3,.4,.1],[27,.7,.44,.6],[31.5,.45,.64,.3],[36,.62,.36,.9],[42,.36,.44,.2],[48,.66,.6,.5],[54,.5,.34,.8]];

function cam(T){
 const W=[25.5,30.5,42.5,49];let ro,ta;
 if(T<8){ro=[-7,1.6,.03*T];ta=[0,1.3,0]}                         // wide still shot, side on
 else if(T<16){ro=[-3.5,1.1,-6];ta=[0,1.4,-2.5]}                  // closer, from behind one swordsman
 else if(T<24){ro=[-2.2,.3,.6];ta=[0,1.5,0]}                      // low, the robes in the wind
 else if(T<60){const z=Z(T);ro=T<36?[-3,2.3,z-5]:[.4*Math.sin(.4*T),2,z-4.5];ta=[0,1.1,z+1.8]}
 else{const zs=Z(60),b=Math.max(0,T-84);ro=[.5+.02*Math.max(0,T-60),1.5+.05*b,zs-4.2-.12*b];ta=[0,1.4,zs+.1]}
 W.forEach((w,i)=>{ta[0]+=(i%2?-1:1)*2.2*sm(w,w+.12,T)});         // sudden whip pans, alternating sides
 return{ro,ta}
}
function figs(T){
 let a=[0,0,-2.5,Math.PI/2],b=[0,0,2.5,-Math.PI/2],sa=T<8?-.3:.45,sb=sa;
 if(T>=24&&T<60){const z=Z(T);
  a=T<36?[0,0,z,Math.PI/2]:[-.6+.5*Math.sin(.9*T),0,z,Math.PI/2];
  b=T<36?[0,0,z+5,Math.PI/2]:[.6*Math.sin(.9*T+2),0,z+5,Math.PI/2];
  sa=.6+.6*Math.sin(5*T);sb=.6+.6*Math.sin(5*T+1)}
 if(T>=60){const zs=Z(60);a=[-.9,0,zs,0];b=[.9,0,zs+.2,Math.PI];sa=T<62.8?0:-.5;sb=.2}
 const L=sm(60,60.6,T),fall=1.45*sm(61.5,62.6,T);
 return{
  F:new Float32Array([a[0],a[1],a[2],a[3],b[0],b[1],b[2],b[3]]),
  P:new Float32Array([0,1.1*L*(1-sm(62,62.8,T)),sa,1, fall,1.1*L*(1-sm(61.5,62.4,T)),sb,0])
 }
}
const HER=new Float32Array(HERO.flat());
const CL=new Float32Array(32);for(let i=0;i<8;i++)CL[i*4]=-99;   // unused slots never fire
CLASH.forEach((c,i)=>CL.set(c,i*4));

const VS=`#version 300 es
void main(){float x=float((gl_VertexID<<1)&2),y=float(gl_VertexID&2);gl_Position=vec4(x*2.-1.,y*2.-1.,0.,1.);}`;

const FS1=`#version 300 es
precision highp float;
uniform vec2 uR;uniform float uT,uFade,uWorld;uniform vec3 uRo,uTa;
uniform vec4 uF[2],uP[2],uH[6];
out vec4 o;
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec3 hash3(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.103,.0973));q+=dot(q,q.yxz+33.33);return fract((q.xxy+q.yzz)*q.zyx);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
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
 r=min(r,cap(l,vec3(0,1.2,.1),hd,.05));
 if(z.w>.5)r=min(r,(length((l-vec3(0,1.64,0))/vec3(.42,.12,.42))-1.)*.12);
 r=min(r,cap(l,hd,hd+vec3(cos(z.z),sin(z.z),0.)*.95,.022));
 return r;
}
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
  d=min(d,max(length(q.xz)-.07,max(-q.y,q.y-(6.+3.*h.z))));
 }
 return d;
}
float map(vec3 p){
 float d=min(fig(p,uF[0],uP[0]),fig(p,uF[1],uP[1]));
 if(uWorld<.5)return min(d,box(p-vec3(0,-.5,0),vec3(1.6,.5,80.)));
 d=min(d,min(p.y,grove(p)));
 for(int k=0;k<6;k++)d=min(d,stalk(p,uH[k],.07));
 return d;
}
vec2 mtn(vec3 rd){                                       // far ridges as wet washes: (density, crisp)
 float a=atan(rd.x,rd.z),e=rd.y;vec2 r=vec2(0.);
 for(int L=0;L<3;L++){float f=float(L);
  float ridge=.25-.07*f+.1*fbm(vec2(a*(1.5+.8*f)+3.1*f,7.3*f));
  float m=(1.-smoothstep(ridge-.006,ridge+.006,e))*smoothstep(-.07,-.02,e);
  float dl=.2+.13*f+.12*fbm(vec2(a*9.+f,e*40.));
  r=mix(r,vec2(dl,0.),m);
 }
 return r;
}
void main(){
 if(uT<0.){o=vec4(0.);return;}
 vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;
 vec3 ww=normalize(uTa-uRo),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
 vec3 rd=normalize(uv.x*uu+uv.y*vv+1.7*ww);
 float t=0.,hit=-1.;
 for(int i=0;i<110;i++){float d=map(uRo+rd*t);if(d<.0015*t){hit=t;break;}t+=d*.8;if(t>90.)break;}
 vec2 r=vec2(0.);
 if(hit>0.){
  vec3 p=uRo+rd*hit;
  vec3 n=normalize(vec3(map(p+vec3(.002,0,0))-map(p-vec3(.002,0,0)),map(p+vec3(0,.002,0))-map(p-vec3(0,.002,0)),map(p+vec3(0,0,.002))-map(p-vec3(0,0,.002))));
  float ndl=max(dot(n,normalize(vec3(-.4,1.,-.6))),0.);
  float df=min(fig(p,uF[0],uP[0]),fig(p,uF[1],uP[1]));
  if(df<.01)r=vec2(.9,1.);
  else if(uWorld>.5&&p.y<.01)r=vec2(.2,0.);             // grove mist
  else r=vec2(.5+.4*ndl,1.);
  r.x*=1.-.6*(1.-exp(-hit*.04));                        // distance lightens the ink
 }else r=mtn(rd);
 for(int k=0;k<6;k++){                                  // flecks of ink thrown by the cut stalks
  vec4 h=uH[k];float age=uT-h.z;if(age<0.||age>3.5)continue;
  float a=1.5708*smoothstep(h.z,h.z+1.,uT);
  vec3 o0=vec3(h.x,0,h.y)+vec3(sign(h.x)*sin(a),cos(a),0)*h.w*.8;
  for(int j=0;j<6;j++){
   vec3 v=hash3(vec2(float(k*6+j),3.7))-.5;
   vec3 lp=o0+vec3(v.x*2.5*age,v.y*2.5*age+.6*age,v.z*2.5*age)-vec3(0,.25*age*age,0);
   lp.y=max(lp.y,.04);
   float tc=dot(lp-uRo,rd);
   if(tc>0.&&(hit<0.||tc<hit)&&length(uRo+rd*tc-lp)<.035)r=vec2(.85,1.);
  }
 }
 o=vec4(clamp(r.x*uFade,0.,1.),0.,r.y,1.);
}`;

const FS2=`#version 300 es
precision highp float;
uniform sampler2D uS;uniform vec2 uR,uTX;uniform float uT,uRain,uSl;uniform vec3 uSt,uDr;uniform vec4 uCl[8];
out vec4 o;
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
void main(){
 vec2 uv=gl_FragCoord.xy/uR;float asp=uR.x/uR.y;vec2 P=uv*vec2(asp,1.);
 vec2 s=uv+(vec2(vn(P*6.),vn(P*6.+9.))-.5)*.0045;      // ink bleeds: displace the lookup
 vec4 S0=texture(uS,s);
 float A=S0.r,cr=S0.b;
 float B=(texture(uS,s+vec2(2.*uTX.x,0)).r+texture(uS,s-vec2(2.*uTX.x,0)).r+texture(uS,s+vec2(0,2.*uTX.y)).r+texture(uS,s-vec2(0,2.*uTX.y)).r)*.25;
 float edge=length(vec2(texture(uS,s+vec2(uTX.x,0)).r-texture(uS,s-vec2(uTX.x,0)).r,texture(uS,s+vec2(0,uTX.y)).r-texture(uS,s-vec2(0,uTX.y)).r));
 float br=vn(vec2(P.x*16.,P.y*240.))*.6+vn(vec2(P.x*5.,P.y*70.))*.4;   // brush streaks
 float rag=smoothstep(.22,.62,mix(B,A,.6)+(br-.5)*.5);               // dry-brush edge on crisp shapes
 float ink=mix(B*.85,rag,cr)+edge*cr*(.5+br)*.9;                     // pooled ink along edges
 // rain: thin falling streaks
 float rn=0.;
 for(int k=0;k<2;k++){float f=float(k)+1.;
  vec2 g=vec2(uv.x*asp*(60.+30.*f)+uv.y*3.,uv.y*2.6+uT*(1.1+.5*f));
  vec2 id=floor(g),fr=fract(g);float h=hash(id+f*17.);
  rn+=step(.8,h)*(1.-smoothstep(.02,.05,abs(fr.x-.5)))*smoothstep(0.,.3,fr.y)*(1.-smoothstep(.4,.5,fr.y))*.6;
 }
 ink=max(ink,uRain*rn);
 // clash splashes: a blot with rough edges and flung droplets, fading over 4 s
 for(int i=0;i<8;i++){vec4 c=uCl[i];float a=uT-c.x;if(a<0.||a>4.)continue;
  vec2 d=(uv-c.yz)*vec2(asp,1.);float r=length(d);
  float R=.03+.16*(1.-exp(-a*6.));
  float wob=vn(vec2(atan(d.y,d.x)*1.5+c.w*7.,a*1.7))-.5;
  float bl=1.-smoothstep(R*.85,R*1.05,r+R*.5*wob);
  for(int k=0;k<6;k++){float fk=float(k);float an=fk*1.047+c.w*6.28;
   vec2 dp=vec2(cos(an),sin(an))*R*(1.35+.5*hash(vec2(fk,c.w*9.)));
   bl=max(bl,1.-smoothstep(.004,.008+.01*(1.-exp(-a*2.)),length(d-dp)));}
  ink=max(ink,bl*exp(-a*.85)*.95);
 }
 // the slash: one horizontal stroke across the frame, then it dries
 float sl=uT-uSl;
 if(sl>0.){float p=smoothstep(0.,.25,sl),x=uv.x;
  float yc=.47+.03*sin(x*2.2+.6);
  float w=.003+.024*sin(3.14159*x)*(.6+.4*vn(vec2(x*3.,4.)));
  float m=(1.-smoothstep(w*.6,w,abs(uv.y-yc)))*step(x,p)*(.7+.3*vn(vec2(x*160.,uv.y*70.)));
  ink=max(ink,m*exp(-max(sl-1.,0.)*.4));}
 // the opening brush stroke, drawn from the click point
 if(uT>0.){float x=uv.x,p=smoothstep(0.,1.3,uT);
  float yc=uSt.y+.012*sin(x*5.);
  float w=.02+.03*vn(vec2(x*40.,uv.y*6.))*(1.-.5*x);
  float m=(1.-smoothstep(w*.5,w,abs(uv.y-yc)))*step(uSt.x,x)*step(x,uSt.x+(1.-uSt.x)*p)*(.75+.25*vn(vec2(x*200.,uv.y*60.)));
  ink=max(ink,m*exp(-max(uT-3.,0.)*.7));}
 // vermilion: the final drop, spreading after the slash
 float vm=0.,a=uT-uDr.z;
 if(a>0.){vec2 d=(uv-uDr.xy)*vec2(asp,1.);float R=.03*(1.-exp(-a*5.));
  vm=1.-smoothstep(R*.85,R,length(d)+R*.25*(vn(vec2(atan(d.y,d.x)*2.,a))-.5));}
 vec3 paper=vec3(.955,.93,.85)*(.965+.035*vn(P*600.)+.02*vn(P*90.))*(.985+.03*fbm(P*2.5));
 vec3 col=mix(paper,vec3(.055,.055,.065),clamp(ink,0.,1.)*.94);
 col=mix(col,vec3(.78,.15,.11),clamp(vm,0.,1.)*.92);
 col*=1.-.12*dot(uv-.5,uv-.5);
 o=vec4(col,1.);
}`;

function P(fs){const p=gl.createProgram();
 [[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,fs]].forEach(([k,src])=>{const h=gl.createShader(k);gl.shaderSource(h,src);gl.compileShader(h);
  if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(h));gl.attachShader(p,h)});
 gl.linkProgram(p);return p}
const U=(p,names)=>Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));
const p1=P(FS1),p2=P(FS2);
const u1=U(p1,['uR','uT','uFade','uWorld','uRo','uTa','uF','uP','uH']);
const u2=U(p2,['uS','uR','uTX','uT','uRain','uSl','uSt','uDr','uCl']);

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

// the piece (seconds). The caption shows while its span is active.
const CAP=[
 [.6,7.6,'對峙','Standoff in the rain'],
 [8.6,22.6,'雨は静かに','The rain is quiet'],
 [25,34.5,'屋根を走る','Across the roofs'],
 [36.6,47,'竹林','Bamboo grove'],
 [47.5,58.5,'竹を断つ','Stalks cut through'],
 [60.6,61.9,'静','Stillness'],
 [62,70,'一閃','One stroke'],
 [63,77,'竹倒る','The bamboo falls'],
 [80,93,'墨は乾く','The ink dries'],
 [95,101.5,'終','FINIS']];
const cap=$('cap');let ck=null,ct=0;
function caption(T){const c=CAP.find(x=>T>=x[0]&&T<x[1]),k=c?c[2]:'';if(k===ck)return;ck=k;
 cap.classList.remove('on');clearTimeout(ct);
 ct=setTimeout(()=>{$('cj').textContent=c?c[2]:'';$('ce').textContent=c?c[3]:'';if(c)cap.classList.add('on')},k?350:0)}

let song=null,actx=null,SX=.5,SY=.5,started=false;
async function start(x,y){if(started)return;started=true;SX=x/innerWidth;SY=1-y/innerHeight;
 $('seal').classList.add('gone');
 actx=new (window.AudioContext||window.webkitAudioContext)();await actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',e=>start(e.clientX,e.clientY));
addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')start(innerWidth/2,innerHeight/2)});

let last=0,bad=0;
function frame(now){
 requestAnimationFrame(frame);
 const dt=now-last;last=now;
 bad=dt>45?bad+1:0;if(bad>45&&q>.45){q*=.8;bad=0;mk()}      // adaptive resolution on slow machines
 const T=song?actx.currentTime-song.base:-1,Tc=Math.max(T,0);
 const c=cam(Tc),pf=figs(Tc);
 gl.bindFramebuffer(gl.FRAMEBUFFER,S.f);gl.viewport(0,0,S.w,S.h);gl.useProgram(p1);
 gl.uniform2f(u1.uR,S.w,S.h);gl.uniform1f(u1.uT,T);gl.uniform1f(u1.uFade,sm(.2,1.8,T));gl.uniform1f(u1.uWorld,T>=36?1:0);
 gl.uniform3fv(u1.uRo,c.ro);gl.uniform3fv(u1.uTa,c.ta);gl.uniform4fv(u1.uF,pf.F);gl.uniform4fv(u1.uP,pf.P);gl.uniform4fv(u1.uH,HER);
 gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.useProgram(p2);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,S.t);gl.uniform1i(u2.uS,0);
 gl.uniform2f(u2.uR,cv.width,cv.height);gl.uniform2f(u2.uTX,1/S.w,1/S.h);gl.uniform1f(u2.uT,T);
 gl.uniform1f(u2.uRain,T>0?1:0);gl.uniform1f(u2.uSl,61.5);gl.uniform3f(u2.uSt,SX,SY,0);gl.uniform3f(u2.uDr,.62,.47,61.8);
 gl.uniform4fv(u2.uCl,CL);
 gl.drawArrays(gl.TRIANGLES,0,3);
 caption(T);
}
requestAnimationFrame(frame);

// clearance probe for check.mjs clearance: the ridge, grove stalk cells outside the lane, and the hero stalks
const BOX=[[-1.6,-1,-80,1.6,0,80]];
for(const i of[-2,2])for(let j=-1;j<=20;j++){const x=i*2.2,z=j*2.2;BOX.push([x-.45,0,z-.45,x+.45,10,z+.45])}
for(const[x,z,,hh]of HERO)BOX.push([x-.2,0,z-.2,x+.2,hh,z+.2]);
window.__probe={dur:102,cam:t=>cam(t).ro,boxes:BOX};
