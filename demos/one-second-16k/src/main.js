// Timeline (seconds of audio time): 0-69 frozen, 69-72 time resumes, 71.2 white flash + hit, 71.4 cut to black.
const $=id=>document.getElementById(id),cv=$('c'),g=cv.getContext('webgl2'),tc=$('tc');
const VS='#version 300 es\nvoid main(){float x=float((gl_VertexID<<1)&2),y=float(gl_VertexID&2);gl_Position=vec4(x*2.-1.,y*2.-1.,0.,1.);}';
function P(f){const p=g.createProgram();[[35633,VS],[35632,f]].forEach(([k,s])=>{const h=g.createShader(k);g.shaderSource(h,s);g.compileShader(h);if(!g.getShaderParameter(h,35713))console.error(g.getShaderInfoLog(h));g.attachShader(p,h)});g.linkProgram(p);return p}
const ps=P($('s1').textContent),pp=P($('s2').textContent),L=(p,n)=>g.getUniformLocation(p,n);
const u={R:L(ps,'uR'),P:L(ps,'uP'),T:L(ps,'uT'),M:L(ps,'uM'),S:L(ps,'uS'),Rp:L(pp,'uR'),W:L(pp,'uW'),B:L(pp,'uB')};
// camera keys: time, position, target
const KT=[0,12,24,36,48,60,69],KP=[[-4.5,4.2,6.5],[-1,1.6,3],[4,.6,.5],[2,2.8,-4.5],[-5.5,2.5,-3.5],[.2,1,1.2],[-1.5,3,2]],
KG=[[.5,4.5,-1],[1,1,-1],[-2.5,1.4,0],[5,2.4,-6.9],[-7.85,4.6,-3],[1.6,.5,-1],[0,2.5,-1]];
function cam(f){let i=0;while(i<5&&f>KT[i+1])i++;let k=(f-KT[i])/(KT[i+1]-KT[i]);k=k*k*(3-2*k);
 const Lr=(a,b)=>a.map((v,j)=>v+(b[j]-v)*k);return[Lr(KP[i],KP[i+1]).map((v,j)=>v+.04*Math.sin(f*.37+j)),Lr(KG[i],KG[i+1])]}
let tx,fb,W,H;
function rs(){W=Math.min(innerWidth,1024);H=Math.round(W*innerHeight/innerWidth);cv.width=W;cv.height=H;
 tx=g.createTexture();g.bindTexture(g.TEXTURE_2D,tx);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
 g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
 g.texImage2D(g.TEXTURE_2D,0,g.RGBA8,W,H,0,g.RGBA,g.UNSIGNED_BYTE,null);
 fb=g.createFramebuffer();g.bindFramebuffer(g.FRAMEBUFFER,fb);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,tx,0);g.bindFramebuffer(g.FRAMEBUFFER,null)}
let A=null,B=0,on=0;
function go(){if(on)return;on=1;A=new AudioContext();A.resume();B=SONG.live(A,0).base;$('x').style.display='none'}
addEventListener('pointerdown',go);addEventListener('keydown',go);addEventListener('resize',rs);
function fr(){
 const t=on?Math.max(0,A.currentTime-B):0,f=Math.min(t,69),S=Math.max(0,t-69);
 const c=cam(f),p=c[0],q=c[1],k=S*.03;
 p[0]+=k*Math.sin(S*53);p[1]+=k*Math.sin(S*41);
 g.bindFramebuffer(g.FRAMEBUFFER,fb);g.viewport(0,0,W,H);g.useProgram(ps);
 g.uniform2f(u.R,W,H);g.uniform3fv(u.P,p);g.uniform3fv(u.T,q);g.uniform1f(u.M,.01*f+S);g.uniform1f(u.S,S);
 g.drawArrays(g.TRIANGLES,0,3);
 g.bindFramebuffer(g.FRAMEBUFFER,null);g.viewport(0,0,W,H);g.useProgram(pp);g.bindTexture(g.TEXTURE_2D,tx);
 g.uniform2f(u.Rp,W,H);g.uniform1f(u.W,t>=71.2&&t<71.4?1:0);g.uniform1f(u.B,t>=71.4?1:0);
 g.drawArrays(g.TRIANGLES,0,3);
 const ms=Math.floor(f/69*1000);
 tc.textContent=t<71.4?'00:0'+Math.floor(ms/1000)+'.'+String(ms%1000).padStart(3,'0'):'';
 requestAnimationFrame(fr)}
rs();fr();
