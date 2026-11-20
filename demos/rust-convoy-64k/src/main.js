(()=>{
const{K,ss,Z,LEN}=SONG,$=s=>document.getElementById(s),cv=$('c'),ti=$('ti'),en=$('en');
const gl=cv.getContext('webgl2',{antialias:false,depth:false,powerPreference:'high-performance'});
if(!gl){document.body.innerHTML='<p style="color:#eee;font:20px sans-serif;padding:2em">WebGL2 is required.</p>';return}
const ZC=Z(65),ZA=ZC-18,ZB=ZC+18,TE=67.5;                 // canyon centre is where the convoy is at 65 s
const arc=z=>z>ZA&&z<ZB?8*Math.sin(Math.PI*(z-ZA)/(ZB-ZA)):0;   // jump arc over the canyon
// ---- keys: [time s, value] ----
const CXK=[[0,0],[6,.5],[12,-1.2],[18,1.2],[24,-.5],[30,0],[36,.3],[46,-.3],[52,0],[57,.6],[62,-.3],[68,.6],[74,-2],[82,2.5],[92,0],[105,1]];
const CYK=[[0,.8],[60,.9],[65,1.6],[70,2.5],[80,3.2],[105,4]];
const CZK=[[0,7],[30,7],[36,12],[62,12],[68,7],[75,13],[105,30]];
const YK=[[0,0],[7,0],[10,3.1416],[33,3.1416],[37,.25],[42,-.2],[50,0],[56,.2],[62,-.12],[67,0],[70,0],[105,-.05]];
const P0X=[[0,0],[30,0],[36,-3.6],[60,-3.6],[72,-15],[105,-40]];
const P0G=[[0,800],[9,640],[20,200],[26,40],[34,12],[40,4],[50,3],[56,5],[70,18],[72,40],[105,60]];
const P1X=[[0,0],[32,0],[38,3.6],[58,2],[70,2],[74,12],[105,30]];
const P1G=[[0,900],[10,760],[20,220],[30,50],[36,14],[40,3.5],[52,3.5],[58,6],[72,30],[105,80]];
const P2G=[[0,1000],[10,820],[20,340],[30,120],[40,30],[50,22],[60,18],[70,25],[105,250]];
// world state at time t: tanker, three pursuers as [x, y, z, gap]
function rig(t){
 const tz=Z(t),tx=-.6*ss(51,53,t);
 const P=[[K(P0X,t),K(P0G,t)],[K(P1X,t),K(P1G,t)],[0,K(P2G,t)]].map(([x,g])=>[x,arc(tz-g),tz-g,g]);
 return{tz,tx,ty:arc(tz),P};
}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm3=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
// chase camera: wheel height behind the tanker, yaw swoops, side tracking, micro shake
function view(t){
 const r=rig(t),yaw=K(YK,t),pit=-.05+.02*Math.sin(t*1.9),sh=.035*Math.sin(t*23.1)*(1+4*ss(62,68,t));
 const p=[r.tx+K(CXK,t)+sh,r.ty+K(CYK,t)+sh*.5,r.tz-K(CZK,t)];
 const f=[Math.sin(yaw)*Math.cos(pit),Math.sin(pit),Math.cos(yaw)*Math.cos(pit)];
 const rr=nrm3(cross(f,[0,1,0])),uu=cross(rr,f);
 return{p,f,rr,uu,r};
}
// per-frame effects: harpoon, sparks, blast, exhausts and dust sources
function fx(t,r){
 const P=r.P,hp=ss(50,51.5,t),A=[P[0][0]+1.8,P[0][1]+1.6,P[0][2]],Bt=[r.tx-1.8,r.ty+1.2,r.tz+.5];
 const DS=[[r.tx,r.ty+.6,r.tz-3,3],...P.map(([x,y,z,g])=>[x,y+1.2,z,2.5+.035*g])];
 const DA=[.5*(1-ss(.2,1.5,r.ty)),...P.map(([,,,g])=>(.03+.4*(1-ss(40,400,g)))*ss(5,10,t))];
 return{
  HA:A,HB:A.map((a,i)=>a+(Bt[i]-a)*hp),HL:ss(49.5,50,t)*(1-ss(59,60,t)),
  SK:[r.tx+1.9,r.ty+1,r.tz-3.2],SKI:ss(35,36,t)*(1-ss(49,50,t))*(.6+.4*Math.sin(t*31)),
  EXP:[r.tx,r.ty+2+Math.max(0,t-TE)*2.4,r.tz],EQ:1+5*ss(TE,TE+4,t),EI:ss(TE,TE+.15,t)*(1-.5*ss(85,105,t)),
  TA:1.1*ss(TE,TE+3.5,t),
  DS,DA,EX:[...P.map(([x,y,z])=>[x+1.2,y+2.9,z-2.3]),[r.tx+1,r.ty+2.9,r.tz+3.3]]
 };
}
// ---- GL ----
const VS='#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}';
function prog(vs,fs){const p=gl.createProgram();for(const[ty,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(ty);
  gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));gl.attachShader(p,s)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);U[a.name]=gl.getUniformLocation(p,a.name)}return{p,U}}
const{p:PR,U}=prog(VS,$('fs').textContent);
let sc=1,ema=16,last=performance.now(),fr=0;
function size(){const w=innerWidth,h=innerHeight,k=Math.min(devicePixelRatio||1,1)*sc*Math.min(1,1152/w);cv.width=w*k|0;cv.height=h*k|0}
addEventListener('resize',size);size();
// ---- clock and start ----
let actx=null,song=null;
async function go(){if(song)return;ti.style.opacity=0;ti.style.filter='blur(8px)';actx=new AudioContext();await actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
// clearance probe: the camera is tested against the vehicles at the time it was last sampled
let lastT=0;
window.__probe={dur:LEN,cam:t=>(lastT=t,view(t).p),get boxes(){const r=rig(lastT);
 return[[r.tx-2,r.ty,r.tz-5.5,r.tx+2,r.ty+3.1,r.tz+6],...r.P.map(([x,y,z])=>[x-1.8,y,z-2.8,x+1.8,y+2.9,z+2.8])]}};
// ---- frame ----
const u1=(n,x)=>gl.uniform1f(U[n],x),u3=(n,a)=>gl.uniform3fv(U[n],a);
function frame(){
 requestAnimationFrame(frame);
 const pn=performance.now();
 ema=ema*.95+(pn-last)*.05;last=pn;if(++fr>90&&ema>34&&sc>.5){sc*=.85;size();ema=20;fr=0}
 const t=song?Math.min(LEN,Math.max(0,actx.currentTime-song.base)):0;
 const v=view(t),r=v.r,e=fx(t,r),SD=nrm3([.42,.3-.2*ss(60,105,t),1]);
 gl.viewport(0,0,cv.width,cv.height);gl.useProgram(PR);
 gl.uniform2f(U.R,cv.width,cv.height);
 u1('T',pn/1000);u1('ZC',ZC);u1('DU',1+.8*ss(78,100,t));u1('HL',e.HL);u1('SKI',e.SKI);u1('EQ',e.EQ);u1('EI',e.EI);u1('TA',e.TA);
 u3('CP',v.p);u3('TP',[r.tx,r.ty,r.tz]);u3('P0',r.P[0].slice(0,3));u3('P1',r.P[1].slice(0,3));u3('P2',r.P[2].slice(0,3));
 u3('SD',SD);u3('HA',e.HA);u3('HB',e.HB);u3('SK',e.SK);u3('EXP',e.EXP);
 gl.uniformMatrix3fv(U.M,false,[...v.rr,...v.uu,...v.f]);
 gl.uniform4fv(U['DS[0]'],e.DS.flat());gl.uniform4fv(U.DA,e.DA);gl.uniform3fv(U['EX[0]'],e.EX.flat());
 gl.drawArrays(gl.TRIANGLES,0,3);
 en.style.opacity=ss(89,97,t);
}
frame();
})();
