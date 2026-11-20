(()=>{
const $=s=>document.getElementById(s),cv=$('c'),gl=cv.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
if(!gl){document.body.insertAdjacentHTML('beforeend','<p style="color:#fff;font:20px monospace;padding:2em">WebGL2 required</p>');return}
const BAR=SONG.BAR,LEN=SONG.LEN,FL=SONG.FL,OFF=SONG.OFF,END=46;
const PT=[9.5,10.3,14,12.6,11.2,10.8,12,13.2,13.6,11.6,12.8,12.4,13.9].map(x=>(x+OFF)*BAR),WS=(10.2+OFF)*BAR;
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const seg=(L,b)=>{let i=0;while(i<L.length-2&&b>L[i+1][0])i++;const a=L[i],c=L[i+1],u=ss(a[0],c[0],b);return a.slice(1).map((v,j)=>v+(c[j+1]-v)*u)};
const FK=[[0,-30,2,-20,0,20,60],[4,-12,1.6,10,-8,1.2,40],[8,10,3,-4,0,22,60]];
const CK=[[5,0,1.3,240,0,8,400],[12,0,1.3,300,0,12,400],[19.1,0,1.3,330,0,20,400]];
const CC=[[0,0,1.4,0,.4,1.3,-1],[21,0,1.4,0,.4,1.3,-1],[21.5,0,1.4,0,.4,3.2,-1],[21.9,0,1.4,0,.4,6,-1]];
const K=[[0,-30,1.8,-20,-20,8,400],[5,-26,2,20,-10,7,400],[9,-40,2.5,60,0,30,400],[12,-80,2.2,140,-10,40,400],[14,-20,2.2,230,0,30,400],[16,40,2,250,20,50,400],[18,60,2,300,0,40,400],[19.6,62,.6,300,20,6,400],[22,45,.8,240,18,0,236],[30,34,1,230,18,0,236],[38.5,28,1.1,226,18,.3,236],[46,24,1.2,230,18,.3,236]];
const RL=[[0,0],[17.9,0],[18.3,1.5],[18.7,1.57],[22,1.57],[27,.25],[48,.25]];
const ZK=[[0,1],[2,1],[3.5,1.7],[5,1.7],[6,1.05],[12,1],[12.8,2.3],[13.5,2],[16,2.4],[17.6,1],[24,1],[30,1.6],[34,1],[38,1.3],[46,1.2]];
const tr=(x,a,c)=>x>=a&&x<c?.9:0;
function camera(t){const B=t/BAR,b=B-OFF,m=mode(B,b);
 const k=m==0?seg(FK,B):m==2?seg(CK,b):m==3?seg(CC,b):seg(K,b);
 const s=Math.sin,A=m==0?.02:m==3?.01:.03+.35*ss(3,9,b)+1.1*ss(11,13,b)*(1-ss(19.5,22,b))+.9*ss(17.8,18.2,b)*(1-ss(18.7,19.4,b))+(m==2?.05:0);
 const jx=A*(s(t*7.3)+.6*s(t*11.1+1)),jy=A*.6*(s(t*8.7+2)+.5*s(t*13.7)),jz=A*.4*s(t*5.1);
 const P=[k[0]+jx,k[1]+jy,k[2]+jz],Tg=[k[3]+jx*.5,k[4]+jy*.4,k[5]];
 let f=[Tg[0]-P[0],Tg[1]-P[1],Tg[2]-P[2]];const fl=Math.hypot(...f);f=f.map(v=>v/fl);
 let r=[f[2],0,-f[0]];const rl=Math.hypot(...r);r=r.map(v=>v/rl);
 const u=[f[1]*r[2]-f[2]*r[1],f[2]*r[0]-f[0]*r[2],f[0]*r[1]-f[1]*r[0]];
 const ro=m==1||m==2?seg(RL,b)[0]:0,cr=Math.cos(ro),sr=Math.sin(ro);
 const rr=r.map((v,i)=>v*cr+u[i]*sr),uu=u.map((v,i)=>-r[i]*sr+v*cr);
 return{p:P,m:[...rr,...uu,...f],z:m==1||m==2?seg(ZK,b)[0]:1}}
function mode(B,b){return B<OFF?0:b<5?1:b<19.2?2:b<21.9?3:1}
const flash=t=>{let L=0;for(const[f,a]of FL){const d=t-(f+OFF)*BAR;if(d>=0&&d<1.5)L+=a*Math.exp(-d*4)*(.6+.4*Math.sin(d*80))}return Math.min(L,1.6)};
let actx=null,song=null;
const now=()=>song?actx.currentTime-song.base:0;
function go(){if(song)return;actx=new AudioContext();actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',go);
addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
const VS='#version 300 es\nvoid main(){vec2 v=vec2(float(gl_VertexID&1),float(gl_VertexID>>1));gl_Position=vec4(v*4.-1.,0.,1.);}';
function sh(ty,src){const s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));return s}
function prog(fs,names){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={p};names.split(' ').forEach(n=>U[n]=gl.getUniformLocation(p,n));return U}
const S1=prog(`$SCENE$`,'R T FN LT SU RD PT C M Z NI WS RV WT DO MD');
const S2=prog(`$POST$`,'S R T E AF GL RN MU HS BLU HL SA');
const va=gl.createVertexArray();gl.bindVertexArray(va);
const fb=gl.createFramebuffer(),tex=gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D,tex);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
let sc=1,FW=1,FH=1;
function size(){const w=innerWidth,h=innerHeight,k=Math.min(devicePixelRatio||1,1.5)*sc;cv.width=w*k|0;cv.height=h*k|0;
 FW=Math.max(1,cv.width>>1);FH=Math.max(1,cv.height>>1);
 gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,FW,FH,0,gl.RGBA,gl.UNSIGNED_BYTE,null)}
addEventListener('resize',size);size();
const el={pl:$('pl'),rc:$('rc'),dt:$('dt'),tc:$('tc'),sp:$('sp'),bt:$('bt'),fo:$('fo'),zm:$('zm'),ro:$('ro')},p2=n=>String(n).padStart(2,'0');
let zl=1,dtT='';
function osd(t,B,b){const on=!!song,end=b>=END-.1,rec=on&&!end;
 el.pl.style.display=on?'none':'block';el.pl.style.opacity=(performance.now()%1000<700)?1:.15;
 el.rc.style.display=rec?'block':'none';el.rc.style.opacity=(t%1.2<.9)?1:0;
 el.dt.style.display=rec?'block':'none';el.tc.style.display=rec?'block':'none';
 const dd=B<OFF?'JUL 04 1986':'JUN 14 1987';if(dd!==dtT){dtT=dd;el.dt.textContent=dd}
 el.bt.style.display=rec&&b>=12&&b<19.8&&(t%.6<.35)?'block':'none';
 el.ro.style.display=on&&((B>=OFF-.1&&B<OFF+.5)||(b>=19.1&&b<19.5)||(b>=21.5&&b<21.9))?'block':'none';
 if(rec){const s=Math.max(0,Math.floor(t));el.tc.textContent='00:'+p2(s/60|0)+':'+p2(s%60)}
 el.sp.style.display=on&&end?'block':'none'}
let last=performance.now(),ema=16,fr=0;
function frame(){
 requestAnimationFrame(frame);
 const pn=performance.now();ema=ema*.95+(pn-last)*.05;last=pn;
 if(++fr>120&&ema>34&&sc>.5){sc*=.8;size();fr=0;ema=20}
 const t=Math.min(now(),LEN),B=t/BAR,b=B-OFF,c=camera(t),s=Math.sin,m=mode(B,b);
 const FN=ss(8.8,10,b)*(1-ss(19.5,22,b)),LT=flash(t),SU=ss(21.5,25,b)*(1-ss(35,37,b)),RD=ss(29.8,30.5,b)*(1-ss(END-.5,END,b));
 const NI=ss(26.5,28.5,b)*(1-ss(END-.5,END,b)),RV=m==1||m==2?.25+.75*ss(3,10,b)*(1-ss(23,27,b)):0,WT=ss(5,9,b)*(1-ss(40,46,b))*.6;
 const DO=m==3?(b>=21.5?2:(.02+.03*s(t*31)*s(t*7))*ss(19.2,19.5,b)):0;
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,FW,FH);gl.useProgram(S1.p);gl.bindVertexArray(va);
 gl.uniform2f(S1.R,FW,FH);gl.uniform1f(S1.T,t);gl.uniform1f(S1.FN,FN);gl.uniform1f(S1.LT,LT);gl.uniform1f(S1.SU,SU);gl.uniform1f(S1.RD,RD);gl.uniform1f(S1.Z,c.z);
 gl.uniform1f(S1.NI,NI);gl.uniform1f(S1.WS,WS);gl.uniform1f(S1.RV,RV);gl.uniform1f(S1.WT,WT);gl.uniform1f(S1.DO,DO);gl.uniform1f(S1.MD,m);
 gl.uniform1fv(S1.PT,PT);gl.uniform3fv(S1.C,c.p);gl.uniformMatrix3fv(S1.M,false,c.m);
 gl.drawArrays(gl.TRIANGLES,0,3);
 const BLU=song?Math.max(1-ss(0,.8,t),ss(END-.2,END+.4,b)):1;
 const AF=.25*(.5+.5*s(t*1.7))*(ss(0,3,b)+ss(11,12,b));
 const GLv=(b>=19.2&&b<22?.9:0)+(b>=9&&b<19?.1:0)+tr(B,OFF-.4,OFF+.2)+tr(b,19.1,19.3)+tr(b,21.5,21.9)*.7;
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.useProgram(S2.p);
 gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(S2.S,0);
 gl.uniform2f(S2.R,cv.width,cv.height);gl.uniform1f(S2.T,t);
 gl.uniform1f(S2.E,1.35+.12*s(t*.9)+.08*s(t*2.3+1)-.25*Math.min(LT,1));
 gl.uniform1f(S2.AF,AF);
 gl.uniform1f(S2.GL,GLv);
 gl.uniform1f(S2.RN,m==1||m==2?.25+.75*ss(3,10,b)*(1-ss(23,27,b)):0);
 gl.uniform1f(S2.MU,m==1||m==2?.1+.35*ss(9,16,b)*(1-ss(23,28,b)):0);
 gl.uniform1f(S2.HS,1+(b>=19.2&&b<22?.5:0));
 gl.uniform1f(S2.HL,m==1||m==2?ss(9.5,10.5,b)*(1-ss(18,19,b))*.8:0);
 gl.uniform1f(S2.BLU,BLU);
 gl.uniform1f(S2.SA,m==0?1.6:m==3?.5:1-.3*NI);
 const on=!!song;
 el.fo.style.display=on&&AF>.05&&m==2?'block':'none';
 el.fo.style.marginLeft=(s(t*5.3)*12*AF)+'px';el.fo.style.marginTop=(s(t*4.1)*8*AF)+'px';
 el.zm.style.display=on&&Math.abs(c.z-zl)>5e-4?'block':'none';zl=c.z;
 gl.drawArrays(gl.TRIANGLES,0,3);
 osd(t,B,b);
}
frame();
})();
