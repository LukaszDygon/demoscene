// ONE SECOND: visuals, camera and timeline. T = seconds since the click; S = frozen seconds (1/100 speed until the snap).
const HIT=97,CUT=98.5,END=100;
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
const SU=ul(PS,['uRes','uEye','uTgt','uFocus','uS','uFall','uFire','uBeat','uSh','uShA','uShV','uBn','uBnA','uCa','uBd']);
const PU=ul(PP,['uT','uRes','uFN','uWhite','uOn']);

// fixed scatter of the frozen debris (seeded, so every run is the same frame)
let sd=12345;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
const nrm=()=>{const x=rnd()-.5,y=rnd()-.5,z=rnd()-.5,l=Math.hypot(x,y,z);return[x/l,y/l,z/l]};
const SH=new Float32Array(72),SHA=new Float32Array(72),SHV=new Float32Array(72);
for(let i=0;i<18;i++){SH.set([.6+(rnd()*2-1)*3.2,4.4+rnd()*4.2,(rnd()*2-1)*2.6,rnd()],i*4);
 SHA.set([...nrm(),.3+rnd()*1.1],i*4);SHV.set([(rnd()-.5)*.25,0,(rnd()-.5)*.25,0],i*4)}
const BN=new Float32Array(40),BNA=new Float32Array(40);
for(let i=0;i<10;i++){BN.set([rnd()*8-4,1.6+rnd()*4.4,rnd()*8-5,rnd()],i*4);BNA.set([...nrm(),.3+rnd()*.5],i*4)}
const CA=new Float32Array(48);for(let i=0;i<12;i++)CA.set([rnd()*9-4.5,.04,rnd()*7-5,rnd()],i*4);
const BD=new Float32Array(24);for(let i=0;i<6;i++)BD.set([2.7+rnd()*.7,1+rnd()*.7,-2.6+rnd()*.5,.035+rnd()*.05],i*4);

// camera keyframes [t, eye, target, focus distance]; equal times are cuts
const KF=[
 [0,.5,1.6,6.5, .6,6.2,0, 7.5],[16,.5,2.6,3.5, .6,6,0, 6.2],                       // A skylight: dolly up through the shafts
 [16,6.5,1.8,4, 3.2,1,-2.6, 6],[32,0,2.4,4, 3,1.1,-2.5, 6],                       // B muzzle flashes: orbit the guard
 [32,-4.5,.7,6, -2.4,1.2,-1, 5],[44,-5.5,.8,4.5, -2.5,1.1,-1.2, 4.5],             // C robber mid-stride, low
 [44,.2,.8,3.5, 0,0,-1, 3.5],[56,-1.5,1.2,2.6, -.5,0,-1.8, 3],                        // D brass casings on the marble
 [56,0,3.6,7, 0,2.5,-9, 16],[72,-.4,3.8,-3.5, -.9,2.5,-9.4, 6.5],                      // E vault ajar under the alarm
 [72,-4.5,4.2,1, -9.8,5.4,-2, 5.5],[84,-5,4.6,-1, -9.8,5.4,-2, 4.6],              // F wall clock, frozen second hand
 [84,4.5,4,6.5, 0,3.5,-1, 11],[96,-5.5,5,4.5, 0,3,-1.5, 11],[100,-5.5,5,4.5, 0,3,-1.5, 11] // G wide orbit, H the snap
];
function cam(t){t=Math.max(0,t);let i=0;while(i<KF.length-1&&KF[i+1][0]<=t)i++;
 const a=KF[i],b=KF[i+1];
 if(!b)return{e:a.slice(1,4),t:a.slice(4,7),f:a[7]};
 const u0=(t-a[0])/(b[0]-a[0]),u=u0*u0*(3-2*u0),m=k=>a[k]+(b[k]-a[k])*u;
 return{e:[m(1),m(2),m(3)],t:[m(4),m(5),m(6)],f:m(7)}}
// heartbeat pulse, lub-dub once a second from bar 2 to the snap
const beat=T=>T<8||T>=96?0:Math.exp(-7*(T%1))+.6*Math.exp(-7*((T+.7)%1));

// render target: half float when the GPU allows it, else 8-bit (alpha still carries depth)
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
 const S=T<HIT?T*.01:HIT*.01+(T-HIT),F=Math.max(T-HIT,0),c=cam(T);
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,W,H);gl.useProgram(PS);
 gl.uniform2f(SU.uRes,W,H);gl.uniform3fv(SU.uEye,c.e);gl.uniform3fv(SU.uTgt,c.t);gl.uniform1f(SU.uFocus,c.f);
 gl.uniform1f(SU.uS,S);gl.uniform1f(SU.uFall,4.9*F*F);gl.uniform1f(SU.uFire,F>0?.9+2.4*Math.exp(-5*F):.9);
 gl.uniform1f(SU.uBeat,beat(T));
 gl.uniform4fv(SU.uSh,SH);gl.uniform4fv(SU.uShA,SHA);gl.uniform4fv(SU.uShV,SHV);
 gl.uniform4fv(SU.uBn,BN);gl.uniform4fv(SU.uBnA,BNA);gl.uniform4fv(SU.uCa,CA);gl.uniform4fv(SU.uBd,BD);
 gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.useProgram(PP);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.uniform1i(PU.uT,0);gl.uniform2f(PU.uRes,W,H);gl.uniform1f(PU.uFN,c.f/40);
 gl.uniform1f(PU.uWhite,F>0?1.6*Math.exp(-7*F):0);gl.uniform1f(PU.uOn,T<CUT?1:0);
 gl.drawArrays(gl.TRIANGLES,0,3);
}
const tc=$('tc');
function timecode(T){
 if(T>=CUT){tc.style.opacity=0;return}
 const ms=Math.min(1000,Math.round(T/HIT*1000));
 tc.textContent='00:0'+(ms>=1000?1:0)+'.'+String(ms%1000).padStart(3,'0');
}

// the start screen is the frozen frame; the first click starts the audio clock, which drives everything
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
 draw(T);timecode(T);
 if(T<END)requestAnimationFrame(loop);
}
size();requestAnimationFrame(loop);

// clearance probe: the camera path against rough boxes for the set (walls, columns, counter, figures, door, clock)
window.__probe={dur:END,cam:t=>cam(t).e,boxes:[
 [2.5,0,1.6,5.5,1,2.4],
 [6.4,0,-6.6,7.6,9,-5.4],[6.4,0,-.6,7.6,9,.6],[6.4,0,5.4,7.6,9,6.6],
 [-7.6,0,-6.6,-6.4,9,-5.4],[-7.6,0,-.6,-6.4,9,.6],[-7.6,0,5.4,-6.4,9,6.6],
 [2,.2,-3.4,4.4,2.2,-1.4],[-4,0,-2.5,-1.2,2.8,-.4],[-2.3,0,-9.8,2.3,4.5,-9.4],[-10.1,4.2,-3.2,-9.7,6.6,-.8],
 [-10.5,0,-10.5,-10,9,8.5],[10,0,-10.5,10.5,9,8.5],[-10.5,0,-10.5,10.5,9,-10],[-10.5,0,8,10.5,9,8.5]]};
