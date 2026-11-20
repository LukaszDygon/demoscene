(()=>{
const $=s=>document.getElementById(s),cv=$('c'),Q=new URLSearchParams(location.search),MUTE=Q.has('mute'),T0=+Q.get('t')||0;
const gl=cv.getContext('webgl2',{antialias:false,powerPreference:'high-performance'});
const DUR=100,ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
// camera keys: [t, eye x y z, look-at x y z]; Catmull-Rom through them
const K=[[0,0,0,0,40,0,420],[14,-8,6,60,30,0,420],[30,-20,-6,150,40,10,430],[46,30,-20,250,120,40,620],
 [62,-80,10,330,-150,-40,560],[78,20,-120,470,60,-60,600],[92,60,-60,640,520,-380,1900],[100,257,-188,940,520,-380,1900]];
function key(t){let i=0;while(i<K.length-2&&t>K[i+1][0])i++;
 const P=j=>K[Math.min(K.length-1,Math.max(0,j))],p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2),dt=p2[0]-p1[0],u=Math.min(1,Math.max(0,(t-p1[0])/dt));
 return [1,2,3,4,5,6].map(c=>{const a=p0[c],b=p1[c],e=p2[c],d=p3[c];return .5*(2*b+(e-a)*u+(2*a-5*b+4*e-d)*u*u+(3*b-a-3*e+d)*u*u*u)})}
// pod camera: look-at basis with a slight roll and weightless drift
function cam(t){const k=key(t),s=Math.sin;
 const p=[k[0]+s(t*.37)*.3,k[1]+s(t*.29+1)*.2,k[2]+s(t*.21+2)*.4];
 const g=[k[3]+s(t*.19+4)*.9,k[4]+s(t*.23+3)*.5,k[5]];
 let f=g.map((v,i)=>v-p[i]);let l=Math.hypot(...f);f=f.map(v=>v/l);
 const ro=.05*s(t*.31)+.02*s(t*.9),up=[Math.sin(ro),Math.cos(ro),0];
 let r=[f[1]*up[2]-f[2]*up[1],f[2]*up[0]-f[0]*up[2],f[0]*up[1]-f[1]*up[0]];l=Math.hypot(...r);r=r.map(v=>v/l);
 const u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]];
 return{p,m:[...r,...u,...f]}}
// clearance probe: the three hulls as boxes covering yaw and the capped split drift
window.__probe={dur:DUR,cam:t=>cam(t).p,boxes:[[-212.1,-58,614.5,-177.1,-22,644.4],[-204.0,-58,601.8,-169.0,-22,631.8],[-195.9,-58,589.2,-160.9,-22,619.1],[-187.8,-58,576.6,-152.7,-22,606.5],[-179.7,-58,564.0,-144.6,-22,593.9],[-171.6,-58,551.4,-136.5,-22,581.3],[-163.5,-58,538.7,-128.4,-22,568.6],[-155.4,-58,526.1,-120.3,-22,556.0],[-147.3,-58,513.5,-112.2,-22,543.4],[-139.1,-58,500.9,-104.1,-22,530.8],[-131.0,-58,488.2,-96.0,-22,518.2],[-122.9,-58,475.6,-87.9,-22,505.5],[-50.7,-18,426.9,-26.9,18,461.9],[-36.4,-18,422.4,-12.6,18,457.4],[-22.0,-18,418.0,1.7,18,453.0],[-7.7,-18,413.6,16.1,18,448.6],[6.6,-18,409.1,30.4,18,444.2],[20.9,-18,404.7,44.7,18,439.7],[35.3,-18,400.3,59.1,18,435.3],[49.6,-18,395.8,73.4,18,430.9],[63.9,-18,391.4,87.7,18,426.4],[78.3,-18,387.0,102.0,18,422.0],[92.6,-18,382.6,116.4,18,417.6],[106.9,-18,378.1,130.7,18,413.1],[-51.0,-18,410.4,-33.4,18,443.5],[-36.1,-18,409.1,-18.4,18,442.2],[-21.1,-18,407.8,-3.5,18,441.0],[-6.2,-18,406.6,11.4,18,439.7],[8.8,-18,405.3,26.4,18,438.5],[23.7,-18,404.1,41.3,18,437.2],[38.7,-18,402.8,56.3,18,435.9],[53.6,-18,401.5,71.2,18,434.7],[68.6,-18,400.3,86.2,18,433.4],[83.5,-18,399.0,101.1,18,432.2],[98.4,-18,397.8,116.1,18,430.9],[113.4,-18,396.5,131.0,18,429.6],[-51.4,-18,416.8,-31.3,18,450.8],[-36.6,-18,414.3,-16.5,18,448.3],[-21.8,-18,411.8,-1.7,18,445.8],[-7.0,-18,409.2,13.1,18,443.3],[7.7,-18,406.7,27.9,18,440.8],[22.5,-18,404.2,42.7,18,438.3],[37.3,-18,401.7,57.5,18,435.8],[52.1,-18,399.2,72.3,18,433.3],[66.9,-18,396.7,87.0,18,430.8],[81.7,-18,394.2,101.8,18,428.2],[96.5,-18,391.7,116.6,18,425.7],[111.3,-18,389.2,131.4,18,423.2],[164.5,52,658.9,197.2,88,692.6],[153.4,52,648.7,186.1,88,682.5],[142.4,52,638.6,175.1,88,672.3],[131.3,52,628.5,164.0,88,662.2],[120.3,52,618.3,152.9,88,652.1],[109.2,52,608.2,141.9,88,641.9],[98.1,52,598.1,130.8,88,631.8],[87.1,52,587.9,119.7,88,621.7],[76.0,52,577.8,108.7,88,611.5],[64.9,52,567.7,97.6,88,601.4],[53.9,52,557.5,86.6,88,591.3],[42.8,52,547.4,75.5,88,581.1],[145.2,52,534.7,180.3,88,564.2],[137.4,52,547.6,172.6,88,577.0],[129.7,52,560.4,164.8,88,589.8],[121.9,52,573.2,157.0,88,602.6],[114.1,52,586.1,149.2,88,615.5],[106.3,52,598.9,141.5,88,628.3],[98.5,52,611.7,133.7,88,641.1],[90.8,52,624.5,125.9,88,653.9],[83.0,52,637.4,118.1,88,666.8],[75.2,52,650.2,110.3,88,679.6],[67.4,52,663.0,102.6,88,692.4],[59.7,52,675.8,94.8,88,705.3],[140.5,52,679.1,175.8,88,707.2],[133.5,52,665.8,168.9,88,693.9],[126.6,52,652.5,161.9,88,680.6],[119.7,52,639.2,155.0,88,667.3],[112.7,52,625.9,148.1,88,654.0],[105.8,52,612.6,141.1,88,640.7],[98.9,52,599.3,134.2,88,627.4],[91.9,52,586.0,127.3,88,614.1],[85.0,52,572.7,120.3,88,600.8],[78.1,52,559.4,113.4,88,587.5],[71.1,52,546.1,106.5,88,574.2],[64.2,52,532.8,99.5,88,560.9]]};
// blasts: [x, y, z, start time in s]; silent in the piece, seen only
const EXP=[[40,0,420,34],[-60,-20,470,18],[120,70,620,48],[-150,-40,560,55],[120,70,620,57],[-60,-20,470,70]];
const EXF=new Float32Array(24);EXP.forEach((e,i)=>EXF.set(e,i*4));
// captions: [from s, to s, log entry]
const CAP=[[1.2,12.8,'POD 7. HULL INTACT.'],[19.5,29.5,'NO RESPONSE ON ANY CHANNEL'],[36.5,46,'CARRIER 3 SEVERED. BOTH HALVES DRIFTING.'],
 [64,75,'BEACON 7 SENT. NO ANSWER.'],[79.5,89,'ENTRY IN 14 s. HEAT SHIELD UNKNOWN.'],[93,96,'ATMOSPHERE CONTACT.']];
if(!gl){document.body.innerHTML='<p style="color:#ccc;font:20px serif;padding:2em">WebGL2 is required.</p>';return}
function prog(vs,fs){const p=gl.createProgram();for(const[ty,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(ty);
  gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));gl.attachShader(p,s)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);U[a.name]=gl.getUniformLocation(p,a.name)}p.U=U;return p}
const P=prog('#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}',`$SCENE$`);
let sc=1;
function size(){const w=innerWidth,h=innerHeight,k=Math.min(devicePixelRatio||1,1.5)*sc*Math.min(1,1152/w);cv.width=w*k|0;cv.height=h*k|0}
addEventListener('resize',size);size();
// overlays: caption, pod HUD, white-out, end card
const cap=$('cap'),hud=$('hud'),o2=$('o2'),wo=$('wo'),en=$('en');let lastCap='';
function ui(t){
 let s='',op=0;
 for(const[a,b,x]of CAP)if(t>=a&&t<b){const k=Math.min(x.length,Math.floor((t-a)*22));s=x.slice(0,k)+(k<x.length?'_':'');op=ss(a,a+.4,t)*(1-ss(b-.6,b,t))}
 if(s!==lastCap){cap.textContent=s;lastCap=s}
 cap.style.opacity=op;
 const on=t>40&&t<92;
 hud.style.opacity=on?ss(40,41,t)*(1-ss(91,92,t)):0;
 if(on){const o=Math.max(0,100-(t-40)*.9);o2.textContent=o.toFixed(0)+'%';o2.className=o<70?'w':''}
 wo.style.opacity=ss(94.5,97.2,t)*(1-ss(97.6,99,t));
 en.style.opacity=ss(97.6,99.2,t);
}
// clock: the audio clock drives everything once it starts; before the click the piece holds at t=0
let started=false,song=null,actx=null;const M0=performance.now();
function now(){if(MUTE)return T0+(performance.now()-M0)/1000;return song?Math.max(0,actx.currentTime-song.base):0}
async function go(){if(started||MUTE)return;started=true;$('ti').style.opacity=0;actx=new AudioContext();await actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
if(MUTE)$('ti').style.display='none';
// frame
let last=performance.now(),ema=16,fr=0;
function frame(){requestAnimationFrame(frame);
 const pn=performance.now();ema=ema*.95+(pn-last)*.05;last=pn;
 if(++fr>90&&ema>34&&sc>.5){sc*=.85;size();ema=20;fr=0}
 const t=Math.min(now(),DUR),c=cam(t),U=P.U;
 gl.viewport(0,0,cv.width,cv.height);gl.useProgram(P);
 gl.uniform2f(U.R,cv.width,cv.height);gl.uniform1f(U.T,t);gl.uniform3fv(U.CP,c.p);gl.uniformMatrix3fv(U.CM,false,c.m);
 gl.uniform4fv(U['EX[0]'],EXF);gl.uniform1f(U.PL,ss(84,93,t));gl.uniform1f(U.SH,ss(86,95,t)*(1-ss(96,97,t)));
 gl.drawArrays(gl.TRIANGLES,0,3);
 ui(t)}
frame();
})();
