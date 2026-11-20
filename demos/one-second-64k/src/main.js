const SNAP=147,CUT=148.5,END=150;
const $=i=>document.getElementById(i);
const cv=$('c'),gl=cv.getContext('webgl2',{antialias:false,alpha:false});
const SCENE=`/*SCENE*/`,POST=`/*POST*/`;
const VS='#version 300 es\nin vec2 q;void main(){gl_Position=vec4(q,0.,1.);}';
function prog(fs){const p=gl.createProgram();
 for(const[t,s]of[[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,fs]]){const h=gl.createShader(t);gl.shaderSource(h,s);gl.compileShader(h);
  if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(h));gl.attachShader(p,h)}
 gl.bindAttribLocation(p,0,'q');gl.linkProgram(p);return p}
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const PS=prog(SCENE),PP=prog(POST);
const ul=(p,names)=>Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));
const SU=ul(PS,['uRes','uEye','uTgt','uFocus','uS','uFall','uFire','uBeat','uSh','uShA','uShV','uBn','uBnA','uCa','uBd','uCr','uLf']);
const PU=ul(PP,['uT','uRes','uFN','uWhite','uOn']);

let sd=12345;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
const v3=()=>{const x=rnd()-.5,y=rnd()-.5,z=rnd()-.5,l=Math.hypot(x,y,z);return[x/l,y/l,z/l]};
const SH=new Float32Array(96),SHA=new Float32Array(96),SHV=new Float32Array(96);
for(let i=0;i<24;i++){SH.set([.6+(rnd()*2-1)*3.2,4.4+rnd()*4.2,(rnd()*2-1)*2.6,rnd()],i*4);SHA.set([...v3(),.3+rnd()*1.1],i*4);SHV.set([(rnd()-.5)*.25,0,(rnd()-.5)*.25,0],i*4)}
const BN=new Float32Array(64),BNA=new Float32Array(64);
for(let i=0;i<16;i++){BN.set([rnd()*8-4,1.6+rnd()*4.4,rnd()*8-5,rnd()],i*4);BNA.set([...v3(),.3+rnd()*.5],i*4)}
const CA=new Float32Array(64);for(let i=0;i<16;i++)CA.set([rnd()*9-4.5,.04,rnd()*7-5,rnd()],i*4);
const BD=new Float32Array(32);for(let i=0;i<8;i++)BD.set([2.7+rnd()*.7,1+rnd()*.7,-2.6+rnd()*.5,.035+rnd()*.05],i*4);
const CR=new Float32Array(48);for(let i=0;i<12;i++){const a=i/12*6.2832;CR.set([-4.5+1.2*Math.cos(a),6.55,-1+1.2*Math.sin(a),.07],i*4)}
const LF=new Float32Array(40);for(let i=0;i<10;i++){const a=i*.628;LF.set([-8.4+.5*Math.cos(a),1.4+.35*Math.sin(a*2),6+.5*Math.sin(a),.3+rnd()*.1],i*4)}

const KF=[
 [0,.5,1.6,6.5,.6,6.2,0,7.5],[8,.5,2.6,3.5,.6,6,0,6.2],
 [8,3,1.4,4.5,0,7.2,-2,6.5],[16,2.6,1.6,3.6,-.2,7.4,-2.5,6.5],
 [16,6.5,1.8,4,3.2,1,-2.6,6],[24,0,2.4,4,3,1.1,-2.5,6],
 [24,-4.5,.7,6.8,-2.4,1.2,-1,5],[32,-6.2,.8,4.3,-2.5,1.1,-1.2,4.5],
 [32,-.2,.6,2.6,-1.6,.05,.5,2.6],[40,-.9,.9,3.2,-1.8,.05,.5,2.8],
 [40,-1,2.5,5,0,3.2,0,6],[48,1.5,3,4,-.5,3,-1,5.5],
 [48,-6.5,1.2,2.2,-6.2,.4,-1.2,4.2],[56,-6.8,1.5,1.6,-6.2,.5,-1.2,4],
 [56,.2,.8,3.5,0,0,-1,3.5],[64,-1.5,1.2,2.6,-.5,0,-1.8,3],
 [64,-5.5,1.8,5,-9,1.5,-4,6],[72,-6,1.8,2.5,-9,1.5,-4.5,6.5],
 [72,2,1.5,5,4,1.1,1,3.4],[80,4.5,1.8,4.6,4.3,1,1.2,3.2],
 [80,-2.5,1.6,7.5,-6,.9,4.5,6],[88,-3.5,1.4,7.6,-7,1,4.8,6.5],
 [88,0,3.6,7,0,2.5,-9,16],[96,-.4,3.8,-3.5,-.9,2.5,-9.4,6.5],
 [96,-4.5,4.2,1,-9.8,5.4,-2,5.5],[104,-5,4.6,-1,-9.8,5.4,-2,4.6],
 [104,5.95,2.4,6.5,9.6,3.2,4,4],[112,5.95,2.6,-3,9.6,3.2,-2,4.5],
 [112,-2,1.8,6.5,-4.5,4.2,-3,8.5],[120,-3,2.2,6.8,-4.5,4.5,-3,8.5],
 [120,4.5,1.8,-.5,2.8,.1,-2.6,3],[128,5.5,2.4,-1.5,3.2,.1,-2.8,3.4],
 [128,-5.5,5,4.5,0,3,-1.5,11],[137,-5.8,5,4.2,0,3,-1.5,11],
 [137,-5.8,5,4.2,0,3,-1.5,11],[147,-5.2,4.8,4.4,0,3,-1.5,11],[END,-5.2,4.8,4.4,0,3,-1.5,11]
];
function cam(t){t=Math.max(0,t);let i=0;while(i<KF.length-1&&KF[i+1][0]<=t)i++;
 const a=KF[i],b=KF[i+1];
 if(!b)return{e:a.slice(1,4),t:a.slice(4,7),f:a[7]};
 const u0=(t-a[0])/(b[0]-a[0]),u=u0*u0*(3-2*u0),m=k=>a[k]+(b[k]-a[k])*u;
 return{e:[m(1),m(2),m(3)],t:[m(4),m(5),m(6)],f:m(7)}}
const beat=T=>T<8||T>=144?0:Math.exp(-7*(T%1))+.6*Math.exp(-7*((T+.7)%1));

const hasF=!!gl.getExtension('EXT_color_buffer_float');
const FMT=hasF?gl.RGBA16F:gl.RGBA8,TYPE=hasF?gl.HALF_FLOAT:gl.UNSIGNED_BYTE;
const tex=gl.createTexture(),fb=gl.createFramebuffer();
gl.bindTexture(gl.TEXTURE_2D,tex);
for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
let W=2,H=2,q=1;
function size(){const d=Math.min(devicePixelRatio||1,2),w=innerWidth*d,h=innerHeight*d,s=Math.min(1,Math.sqrt(7e5/(w*h)))*q;
 W=Math.max(2,Math.round(w*s));H=Math.max(2,Math.round(h*s));cv.width=W;cv.height=H;
 gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,FMT,W,H,0,gl.RGBA,TYPE,null)}

function draw(T){
 const S=T<SNAP?T/SNAP:1+(T-SNAP),F=Math.max(T-SNAP,0),c=cam(T);
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,W,H);gl.useProgram(PS);
 gl.uniform2f(SU.uRes,W,H);gl.uniform3fv(SU.uEye,c.e);gl.uniform3fv(SU.uTgt,c.t);gl.uniform1f(SU.uFocus,c.f);
 gl.uniform1f(SU.uS,S);gl.uniform1f(SU.uFall,4.9*F*F);gl.uniform1f(SU.uFire,F>0?.9+2.4*Math.exp(-5*F):.9);
 gl.uniform1f(SU.uBeat,beat(T));
 gl.uniform4fv(SU.uSh,SH);gl.uniform4fv(SU.uShA,SHA);gl.uniform4fv(SU.uShV,SHV);
 gl.uniform4fv(SU.uBn,BN);gl.uniform4fv(SU.uBnA,BNA);gl.uniform4fv(SU.uCa,CA);gl.uniform4fv(SU.uBd,BD);gl.uniform4fv(SU.uCr,CR);gl.uniform4fv(SU.uLf,LF);
 gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.useProgram(PP);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.uniform1i(PU.uT,0);gl.uniform2f(PU.uRes,W,H);gl.uniform1f(PU.uFN,c.f/40);
 gl.uniform1f(PU.uWhite,F>0?1.6*Math.exp(-7*F):0);gl.uniform1f(PU.uOn,T<CUT?1:0);
 gl.drawArrays(gl.TRIANGLES,0,3);
}
const tc=$('tc'),cap=$('cap'),en=$('en');
const SHOTS=[[0,'01 SKYLIGHT'],[8,'02 COFFERS'],[16,'03 MUZZLE FLASH'],[24,'04 ROBBER'],[32,'05 DROPPED GUN'],[40,'06 BANKNOTES'],[48,'07 MONEY BAG'],[56,'08 BRASS'],[64,'09 CABINETS'],[72,'10 TELLER'],[80,'11 PLANT AND ROPE'],[88,'12 VAULT'],[96,'13 CLOCK'],[104,'14 SCONCE'],[112,'15 CHANDELIER'],[120,'16 BLOOD'],[128,'17 LOBBY'],[137,'18 PUSH'],[SNAP,'19 SNAP']];
let shot=-1;
function hud(T){
 if(T>=CUT){tc.style.opacity=0;cap.style.opacity=0;en.className=T>=CUT+1.5?'on':'';return}
 const ms=Math.min(1000,Math.round(Math.min(T,SNAP)/SNAP*1000));
 tc.textContent='00:0'+(ms>=1000?1:0)+'.'+String(ms%1000).padStart(3,'0');
 let i=0;while(i<SHOTS.length-1&&SHOTS[i+1][0]<=T)i++;
 if(i!==shot){shot=i;cap.textContent=SHOTS[i][1]}
 const a=T-SHOTS[i][0];cap.style.opacity=T<0?0:Math.min(1,a*2,Math.max(0,4-a));
}

let actx=null,song=null;
async function go(){if(actx)return;
 try{actx=new AudioContext();await actx.resume();song=SONG.live(actx,0)}catch(e){console.error(e)}
 document.body.classList.add('go')}
addEventListener('click',go);
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter')go()});
addEventListener('resize',size);

let ema=16,last=performance.now();
function loop(now){
 ema=ema*.9+(now-last)*.1;last=now;
 const T=song?Math.max(0,actx.currentTime-song.base):0;
 if(ema>34&&q>.5){q*=.85;size()}
 draw(T);hud(T);
 if(T<END)requestAnimationFrame(loop);
}
size();requestAnimationFrame(loop);

const pb=[[2.5,0,1.6,5.5,1,2.4],[6.4,0,-6.6,7.6,9,-5.4],[6.4,0,-.6,7.6,9,.6],[6.4,0,5.4,7.6,9,6.6],
 [-7.6,0,-6.6,-6.4,9,-5.4],[-7.6,0,-.6,-6.4,9,.6],[-7.6,0,5.4,-6.4,9,6.6],[2,.2,-3.4,4.4,2.2,-1.4],
 [-4,0,-2.5,-1.2,2.8,-.4],[-2.3,0,-9.8,2.3,4.5,-9.4],[-10.1,4.2,-3.2,-9.7,6.6,-.8],[-5.7,5.4,-2.2,-3.3,7,.2],
 [-5.9,0,-6.4,-4.5,3.2,-4.6],[3.5,0,.6,4.7,1.4,1.4],[5.45,0,-10,6.15,9,-9.5],[-6.15,0,-10,-5.45,9,-9.5],
 [-9.4,0,-8,-8.4,2.3,-1],[-8.9,0,-8.2,-8.6,1,-2],[-8.8,.8,-4.8,-8.5,2,-3.6],
 [-8.9,0,5.4,-7.9,2.4,6.6],[-6.6,0,-1.5,-5.8,1,-.9],[-1.9,0,5.2,-1.7,1,5.8],[-4.7,0,5.2,-4.5,1,5.8],
 [-10.5,0,-10.5,-10,9,8.5],[10,0,-10.5,10.5,9,8.5],[-10.5,0,-10.5,10.5,9,-10],[-10.5,0,8,10.5,9,8.5]];
for(let i=0;i<24;i++){const x=SH[i*4],y=SH[i*4+1],z=SH[i*4+2];pb.push([x-.3,y-.3,z-.3,x+.3,y+.3,z+.3])}
for(let i=0;i<16;i++){const x=BN[i*4],y=BN[i*4+1],z=BN[i*4+2];pb.push([x-.25,y-.25,z-.25,x+.25,y+.25,z+.25])}
window.__probe={dur:END,cam:t=>cam(t).e,boxes:pb};
