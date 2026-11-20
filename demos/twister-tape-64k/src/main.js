(()=>{
const $=s=>document.getElementById(s),cv=$('c'),gl=cv.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
if(!gl){document.body.insertAdjacentHTML('beforeend','<p style="color:#fff;font:20px monospace;padding:2em">WebGL2 required</p>');return}
const BAR=SONG.BAR,LEN=SONG.LEN,FL=SONG.FL,PT=[9.5,10.3,11.2,12.6,14].map(x=>x*BAR);
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
// camera keys [bar, px,py,pz, tx,ty,tz] (metres; funnel axis at z=400) and roll keys [bar, roll]
const K=[[0,-30,1.8,-20,-20,8,400],[5,-26,2,20,-10,7,400],[9,-40,2.5,60,0,30,400],[12,-80,2.2,140,-10,40,400],[14,-20,2.2,230,0,30,400],[16,40,2,250,20,50,400],[18,60,2,300,0,40,400],[19.6,62,.6,300,20,6,400],[22,45,.8,240,18,0,236],[30,34,1,230,18,0,236],[38.5,28,1.1,226,18,.3,236]];
const RL=[[0,0],[17.9,0],[18.3,1.5],[18.7,1.57],[22,1.57],[27,.25],[40,.25]];
const seg=(L,b)=>{let i=0;while(i<L.length-2&&b>L[i+1][0])i++;const a=L[i],c=L[i+1],u=ss(a[0],c[0],b);return a.slice(1).map((v,j)=>v+(c[j+1]-v)*u)};
function camera(t){const b=t/BAR,k=seg(K,b),s=Math.sin;
 const A=.03+.35*ss(3,9,b)+1.1*ss(11,13,b)*(1-ss(19.5,22,b))+.9*ss(17.8,18.2,b)*(1-ss(18.7,19.4,b));
 const jx=A*(s(t*7.3)+.6*s(t*11.1+1)),jy=A*.6*(s(t*8.7+2)+.5*s(t*13.7)),jz=A*.4*s(t*5.1);
 const P=[k[0]+jx,k[1]+jy,k[2]+jz],Tg=[k[3]+jx*.5,k[4]+jy*.4,k[5]];
 let f=[Tg[0]-P[0],Tg[1]-P[1],Tg[2]-P[2]];const fl=Math.hypot(...f);f=f.map(v=>v/fl);
 let r=[f[2],0,-f[0]];const rl=Math.hypot(...r);r=r.map(v=>v/rl);
 const u=[f[1]*r[2]-f[2]*r[1],f[2]*r[0]-f[0]*r[2],f[0]*r[1]-f[1]*r[0]];
 const ro=seg(RL,b)[0],cr=Math.cos(ro),sr=Math.sin(ro);
 const rr=r.map((v,i)=>v*cr+u[i]*sr),uu=u.map((v,i)=>-r[i]*sr+v*cr);
 return{p:P,m:[...rr,...uu,...f]}}
// lightning: each flash decays over about a second with a flicker
const flash=t=>{let L=0;for(const[f,a]of FL){const d=t-f*BAR;if(d>=0&&d<1.5)L+=a*Math.exp(-d*4)*(.6+.4*Math.sin(d*80))}return Math.min(L,1.6)};
// clock and audio start
let actx=null,song=null;
const now=()=>song?actx.currentTime-song.base:0;
function go(){if(song)return;actx=new AudioContext();actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',go);
addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
// GL setup
const VS='#version 300 es\nvoid main(){vec2 v=vec2(float(gl_VertexID&1),float(gl_VertexID>>1));gl_Position=vec4(v*4.-1.,0.,1.);}';
function sh(ty,src){const s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));return s}
function prog(fs,names){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={};names.split(' ').forEach(n=>U[n]=gl.getUniformLocation(p,n));U.p=p;return U}
const S1=prog(`$SCENE$`,'R T FN LT SU RD PT C M');
const S2=prog(`$POST$`,'S R T E AF GL RN MU HS BLU');
const va=gl.createVertexArray();gl.bindVertexArray(va);
const fb=gl.createFramebuffer(),tex=gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D,tex);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
// the scene is drawn at half the canvas resolution (VHS is soft anyway) and upsampled by the tape pass
let sc=1,FW=1,FH=1;
function size(){const w=innerWidth,h=innerHeight,k=Math.min(devicePixelRatio||1,1.5)*sc;cv.width=w*k|0;cv.height=h*k|0;
 FW=Math.max(1,cv.width>>1);FH=Math.max(1,cv.height>>1);
 gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,FW,FH,0,gl.RGBA,gl.UNSIGNED_BYTE,null)}
addEventListener('resize',size);size();
// on-screen display
const el={pl:$('pl'),rc:$('rc'),dt:$('dt'),tc:$('tc'),sp:$('sp')},p2=n=>String(n).padStart(2,'0');
function osd(t,b){const on=!!song,end=b>=38.6;
 el.pl.style.display=on?'none':'block';el.pl.style.opacity=(performance.now()%1000<700)?1:.15;
 el.rc.style.display=on&&!end?'block':'none';el.rc.style.opacity=(t%1.2<.9)?1:0;
 el.dt.style.display=on&&!end?'block':'none';
 el.tc.style.display=on&&!end?'block':'none';
 if(on&&!end){const s=Math.floor(t);el.tc.textContent='00:'+p2(s/60|0)+':'+p2(s%60)}
 el.sp.style.display=on&&end?'block':'none'}
// frame
let last=performance.now(),ema=16,fr=0;
function frame(){
 requestAnimationFrame(frame);
 const pn=performance.now();ema=ema*.95+(pn-last)*.05;last=pn;
 if(++fr>120&&ema>34&&sc>.5){sc*=.8;size();fr=0;ema=20}
 const t=Math.min(now(),LEN),b=t/BAR,c=camera(t),s=Math.sin;
 const FN=ss(8.8,10,b)*(1-ss(19.5,22,b)),LT=flash(t),SU=ss(21.5,25,b)*(1-ss(35,37,b)),RD=ss(29.8,30.5,b)*(1-ss(38.5,39,b));
 // pass 1: scene into the half-res target
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,FW,FH);gl.useProgram(S1.p);gl.bindVertexArray(va);
 gl.uniform2f(S1.R,FW,FH);gl.uniform1f(S1.T,t);gl.uniform1f(S1.FN,FN);gl.uniform1f(S1.LT,LT);gl.uniform1f(S1.SU,SU);gl.uniform1f(S1.RD,RD);
 gl.uniform1fv(S1.PT,PT);gl.uniform3fv(S1.C,c.p);gl.uniformMatrix3fv(S1.M,false,c.m);
 gl.drawArrays(gl.TRIANGLES,0,3);
 // pass 2: tape look to the canvas
 const BLU=song?Math.max(1-ss(0,.8,t),ss(38.6,39.2,b)):1;
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.useProgram(S2.p);
 gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(S2.S,0);
 gl.uniform2f(S2.R,cv.width,cv.height);gl.uniform1f(S2.T,t);
 gl.uniform1f(S2.E,1.35+.12*s(t*.9)+.08*s(t*2.3+1));
 gl.uniform1f(S2.AF,.25*(.5+.5*s(t*1.7))*(ss(0,3,b)+ss(11,12,b)));
 gl.uniform1f(S2.GL,(b>=19.2&&b<22?.9:0)+(b>=9&&b<19?.1:0));
 gl.uniform1f(S2.RN,.25+.75*ss(3,10,b)*(1-ss(23,27,b)));
 gl.uniform1f(S2.MU,.1+.35*ss(9,16,b)*(1-ss(23,28,b)));
 gl.uniform1f(S2.HS,1+(b>=19.2&&b<22?.5:0));
 gl.uniform1f(S2.BLU,BLU);
 gl.drawArrays(gl.TRIANGLES,0,3);
 osd(t,b);
}
frame();
})();
