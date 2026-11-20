(()=>{
const $=s=>document.getElementById(s),cv=$('c'),Q=new URLSearchParams(location.search),MUTE=Q.has('mute'),T0=+Q.get('t')||0;
const gl=cv.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
const DUR=100,ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const K=[[0,0,0,0,40,0,420],[14,-8,6,60,30,0,420],[30,-20,-6,150,40,10,430],[46,30,-20,250,120,40,620],
 [62,-70,-25,322,-150,-40,560],[78,20,-120,470,60,-60,600],[92,60,-60,640,520,-380,1900],[100,257,-188,940,520,-380,1900]];
function key(t){let i=0;while(i<K.length-2&&t>K[i+1][0])i++;
 const P=j=>K[Math.min(K.length-1,Math.max(0,j))],p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2),dt=p2[0]-p1[0],u=Math.min(1,Math.max(0,(t-p1[0])/dt));
 return [1,2,3,4,5,6].map(c=>{const a=p0[c],b=p1[c],e=p2[c],d=p3[c];return .5*(2*b+(e-a)*u+(2*a-5*b+4*e-d)*u*u+(3*b-a-3*e+d)*u*u*u)})}
function cam(t){const k=key(t),s=Math.sin;
 const p=[k[0]+s(t*.37)*.3,k[1]+s(t*.29+1)*.2,k[2]+s(t*.21+2)*.4];
 const g=[k[3]+s(t*.19+4)*.9,k[4]+s(t*.23+3)*.5,k[5]];
 let f=g.map((v,i)=>v-p[i]);let l=Math.hypot(...f);f=f.map(v=>v/l);
 const ro=.05*s(t*.31)+.02*s(t*.9),up=[Math.sin(ro),Math.cos(ro),0];
 let r=[f[1]*up[2]-f[2]*up[1],f[2]*up[0]-f[0]*up[2],f[0]*up[1]-f[1]*up[0]];l=Math.hypot(...r);r=r.map(v=>v/l);
 const u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]];
 return{p,m:[...r,...u,...f]}}
// ships: x y z yaw scale splitTime type(0 carrier, 1 frigate)
const SHIPS=[[40,0,420,.3,1,34,0],[-150,-40,560,1,1,1e4,0],[120,70,620,2.4,1,57,0],[-260,30,780,.9,.7,1e4,1],[200,-40,760,-.5,.8,1e4,1],[-20,80,900,1.6,1.2,1e4,2]];
const SHP=new Float32Array(24),SPL=new Float32Array(24);
SHIPS.forEach((s,i)=>{SHP.set(s.slice(0,4),i*4);SPL.set([s[5],s[4],s[6],0],i*4)});
// blasts: x y z start time
const EXP=[[40,0,420,34],[-60,-20,470,18],[120,70,620,48],[-150,-40,560,55],[120,70,620,57],[-60,-20,470,70],[-260,30,780,74],[200,-40,760,66],[40,0,420,44],[-150,-40,560,62]];
const EXF=new Float32Array(40);EXP.forEach((e,i)=>EXF.set(e,i*4));
const CAP=[[1.2,12.8,'POD 7. HULL INTACT.'],[19.5,29.5,'NO RESPONSE ON ANY CHANNEL'],[36.5,46,'CARRIER 3 SEVERED. BOTH HALVES DRIFTING.'],
 [50,58,'O2 RESERVE: 61 MIN'],[64,75,'BEACON 7 SENT. NO ANSWER.'],[79.5,89,'ENTRY IN 14 s. HEAT SHIELD UNKNOWN.'],[93,96,'ATMOSPHERE CONTACT.']];
// clearance probe, built from the same parameters the shader uses
const fr=x=>x-Math.floor(x);
function h3(a,b,c){let p=[fr(a*.1031),fr(b*.1031),fr(c*.1031)];const d=p[0]*(p[2]+31.32)+p[1]*(p[1]+31.32)+p[2]*(p[0]+31.32);p=p.map(v=>v+d);return fr((p[0]+p[1])*p[2])}
function rotY(a,v){const c=Math.cos(a),s=Math.sin(a);return[c*v[0]+s*v[2],v[1],-s*v[0]+c*v[2]]}
function probeBoxes(){
 const B=[],add=(lo,hi)=>B.push([...lo.map((v,i)=>Math.round(v*10)/10),...hi.map((v,i)=>Math.round(v*10)/10)]);
 const hullBoxes=(s,amt,sgn)=>{const[x,y,z,yaw,k,ts,ty]=s,L=ty==2?112:ty?82:106,n=ty?24:30;
  for(let i=0;i<n;i++){const x0=-L+i*2*L/n,x1=x0+2*L/n;if(sgn>0&&x1<=0)continue;if(sgn<0&&x0>=0)continue;
   const o=[0,.4*amt,.9*amt];
   const yh=ty?14:(x0>-45&&x1<6||x0>24&&x1<36?20:10),zh=ty==2?10:ty?11:13.5,pts=[];for(const a of[x0-1,x1+1])for(const b of[-yh,yh])for(const c of[-zh,zh]){
    const q=[a,b,c].map((v,j)=>v*k+(j<3?(sgn*o[j]*k):0));const w=rotY(yaw,q);pts.push([x+w[0],y+w[1],z+w[2]])}
   add([0,1,2].map(j=>Math.min(...pts.map(p=>p[j]))),[0,1,2].map(j=>Math.max(...pts.map(p=>p[j]))))}};
 for(const s of SHIPS){const ts=s[5];
  hullBoxes(s,0,0);
  if(ts<1e4){const sd=100-ts,A=Math.min(Math.pow(sd,1.5)*.6,50)+.2*sd;
   for(const a of[A/2,A]){hullBoxes(s,a,1);hullBoxes(s,a,-1)}}}
 for(let ix=-7;ix<=7;ix++)for(let iy=-1;iy<=1;iy++)for(let iz=-7;iz<=7;iz++){
  const hh=h3(ix,iy,iz);if(Math.hypot(ix,iz)>7||Math.hypot(ix,iz)<1.5||hh>.3)continue;
  const c=[h3(ix+1,iy+5,iz+9),h3(ix+4,iy+2,iz+6),h3(ix+8,iy+3,iz+2)].map(v=>(v-.5)*30);
  const sz=1.2+3.5*h3(ix+6,iy+6,iz+6),ty=Math.floor(h3(ix+2,iy+7,iz+1)*5);
  const Rb=[1.3,3.4,1.3,2.1,1.5][ty]*sz,ctr=[ix*60+c[0],iy*60+c[1],iz*60+c[2]];
  add(ctr.map(v=>v-Rb),ctr.map(v=>v+Rb))}
 const R=1000,n=12;for(let i=0;i<n;i++){const y0=-R+2*R*i/n,y1=y0+2*R/n,ym=Math.max(Math.abs(y0),Math.abs(y1)),w=Math.sqrt((R*R-ym*ym)/2);
  if(w>20)add([520-w,y0-380,1900-w],[520+w,y1-380,1900+w])}
 return B}
window.__probe={dur:DUR,cam:t=>cam(t).p,boxes:probeBoxes()};
if(!gl){document.body.innerHTML='<p style="color:#ccc;font:20px serif;padding:2em">WebGL2 is required.</p>';return}
function prog(vs,fs){const p=gl.createProgram();for(const[ty,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(ty);
  gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));gl.attachShader(p,s)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);U[a.name]=gl.getUniformLocation(p,a.name)}p.U=U;return p}
const P=prog('#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}',`$SCENE$`);
let sc=1;
function size(){const w=innerWidth,h=innerHeight,k=Math.min(devicePixelRatio||1,1.5)*sc*Math.min(1,1152/w);cv.width=w*k|0;cv.height=h*k|0}
addEventListener('resize',size);size();
const cap=$('cap'),hud=$('hud'),o2=$('o2'),tm=$('tm'),bc=$('bc'),wo=$('wo'),en=$('en');let lastCap='';
function ui(t){
 let s='',op=0;
 for(const[a,b,x]of CAP)if(t>=a&&t<b){const k=Math.min(x.length,Math.floor((t-a)*22));s=x.slice(0,k)+(k<x.length?'_':'');op=ss(a,a+.4,t)*(1-ss(b-.6,b,t))}
 if(s!==lastCap){cap.textContent=s;lastCap=s}
 cap.style.opacity=op;
 const on=t>40&&t<92;
 hud.style.opacity=on?ss(40,41,t)*(1-ss(91,92,t)):0;
 if(on){const o=Math.max(0,100-(t-40)*.9),sec=Math.floor(t);o2.textContent=o.toFixed(0)+'%';o2.className=o<70?'w':'';
  tm.textContent='T+ '+String(sec/60|0).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
  bc.textContent=t>62&&t<75?'BEACON ▮▮▮▯▯':'BEACON ▮▮▮▮▮'}
 wo.style.opacity=ss(94.5,97.2,t)*(1-ss(97.6,99,t));
 en.style.opacity=ss(97.6,99.2,t);
}
let started=false,song=null,actx=null;const M0=performance.now();
function now(){if(MUTE)return T0+(performance.now()-M0)/1000;return song?Math.max(0,actx.currentTime-song.base):0}
async function go(){if(started||MUTE)return;started=true;$('ti').style.opacity=0;actx=new AudioContext();await actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
if(MUTE)$('ti').style.display='none';
let last=performance.now(),ema=16,fr2=0;
function frame(){requestAnimationFrame(frame);
 const pn=performance.now();ema=ema*.95+(pn-last)*.05;last=pn;
 if(++fr2>90&&ema>34&&sc>.5){sc*=.85;size();ema=20;fr2=0}
 const t=Math.min(now(),DUR),c=cam(t),U=P.U;
 gl.viewport(0,0,cv.width,cv.height);gl.useProgram(P);
 gl.uniform2f(U.R,cv.width,cv.height);gl.uniform1f(U.T,t);gl.uniform3fv(U.CP,c.p);gl.uniformMatrix3fv(U.CM,false,c.m);
 gl.uniform4fv(U['EX[0]'],EXF);gl.uniform4fv(U['SHP[0]'],SHP);gl.uniform4fv(U['SPL[0]'],SPL);
 gl.uniform1f(U.PL,ss(84,93,t));gl.uniform1f(U.SH,ss(86,95,t)*(1-ss(96,97,t)));
 gl.uniform1f(U.FZ,ss(40,80,t)*(.5+.5*ss(60,90,t)));gl.uniform1f(U.HD,ss(61,64,t)*(1-ss(72,75,t)));
 gl.drawArrays(gl.TRIANGLES,0,3);
 ui(t)}
frame();
})();
