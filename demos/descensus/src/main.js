(()=>{
const $=s=>document.getElementById(s),cv=$('c'),Q=new URLSearchParams(location.search),MUTE=Q.has('mute'),T0=+Q.get('t')||0;
const gl=cv.getContext('webgl2',{antialias:false,depth:true,powerPreference:'high-performance'});
const BAR=SONG.BAR,LEN=SONG.LEN,F=-85;
const ss=(a,b,x)=>(x=Math.min(1,Math.max(0,(x-a)/(b-a))),x*x*(3-2*x));
// ---------- camera: ROV keyframes [t, pos, target], cubic Hermite with time-scaled tangents + floaty drift ----------
const K=[[0,0,-2.5,0,0,6,6],[3,0,-2.8,.5,0,5,9],[8,0,-4.5,4,0,-1,16],[14,.5,-10,10,1,-14,24],[22,1.5,-20,17,-1,-25,30],[30,.5,-33,26,2,-37,42],
 [38,0,-50,40,-8,-41,64],[46,1,-52,46,5,-41,66],[53,0,-60,60,0,-71,100],[58.3,0,-75,80,0,-80,130],[64,0,-79.4,94,0,-80,140],
 [72,.6,-80.2,111,0,-80.5,143],[80,-.3,-80.5,124,0,-80.5,145],[86,0,-80.3,130,0,-79.8,146],[96,0,-80,132.5,0,-78.6,146]];
function key(t){let i=0;while(i<K.length-2&&t>K[i+1][0])i++;const a=K[i],b=K[i+1],dt=b[0]-a[0],u=Math.min(1,Math.max(0,(t-a[0])/dt));
 const tg=(j,c)=>{const p=K[Math.max(0,j-1)],n=K[Math.min(K.length-1,j+1)];return (n[c]-p[c])/(n[0]-p[0]||1)};
 const u2=u*u,u3=u2*u,h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
 return [1,2,3,4,5,6].map(c=>h00*a[c]+h10*dt*tg(i,c)+h01*b[c]+h11*dt*tg(i+1,c))}
const DC=Q.get('cam')&&Q.get('cam').split(',').map(Number);
function cam(t){const k=DC||key(t),s=Math.sin;
 const p=[k[0]+s(t*.31)*.22+s(t*.13+2)*.15,k[1]+s(t*.23+1)*.16,k[2]+s(t*.17+2)*.18],
  g=[k[3]+s(t*.21+4)*.5,k[4]+s(t*.19+3)*.35,k[5]];
 let f=g.map((v,i)=>v-p[i]),l=Math.hypot(...f);f=f.map(v=>v/l);
 const ro=.018*s(t*.21)+.01*s(t*.47);let up=[Math.sin(ro),Math.cos(ro),0];
 let r=[f[1]*up[2]-f[2]*up[1],f[2]*up[0]-f[0]*up[2],f[0]*up[1]-f[1]*up[0]];l=Math.hypot(...r);r=r.map(v=>-v/l);
 const u=[f[1]*r[2]-f[2]*r[1],f[2]*r[0]-f[0]*r[2],f[0]*r[1]-f[1]*r[0]];
 return{p,m:[...r,...u,...f]}}
// clearance probe: piers, arcade walls, altar, anglerfish, floor
const B=[];for(let k=0;k<7;k++)for(const x of[-5,5])B.push([x-1,F,104+7*k-1,x+1,F+7.2,104+7*k+1]);
for(const x of[-5,5])B.push([x-.4,F+6.6,103,x+.4,F+12.4,147]);
B.push([-3.2,F,140.8,3.2,F+2.1,145.2],[-3.2,F+2.6,145.3,3.2,F+8.8,153],[-11,F-1,95,11,F+.35,155]);
window.__probe={dur:LEN,cam:t=>cam(t).p,boxes:B};
if(!gl){document.body.innerHTML='<p style="color:#9cc;font:20px serif;padding:2em">WebGL2 necessarium est.</p>';return}
// ---------- GL ----------
function prog(vs,fs){const p=gl.createProgram();for(const[ty,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(ty);
  gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));gl.attachShader(p,s)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);U[a.name]=gl.getUniformLocation(p,a.name)}p.U=U;return p}
const P1=prog('#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}',`$SCENE$`),P2=prog(`$SNOWV$`,`$SNOWF$`);
const NP=4500,pd=new Float32Array(NP*4);let sd=7;for(let i=0;i<pd.length;i++)pd[i]=(sd=sd*16807%2147483647)/2147483647;
const va=gl.createVertexArray();gl.bindVertexArray(va);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,pd,gl.STATIC_DRAW);
const al=gl.getAttribLocation(P2,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,4,gl.FLOAT,false,0,0);
const ev=gl.createVertexArray();
let sc=1;function size(){const w=innerWidth,h=innerHeight,k=Math.min(devicePixelRatio||1,1)*sc*Math.min(1,1152/w);cv.width=w*k|0;cv.height=h*k|0}
addEventListener('resize',size);size();
// ---------- captions (bars) ----------
const CAP=[[.6,3.6,'I · Vesper','lux ultima super aquas'],[5,8.4,'II · Medusae','lux moritur, vita lucet'],[10.2,13.6,'III · Cetus','cetus canit in tenebris'],
 [14.6,16.8,'IV · Nox','de profundis clamavi'],[18.2,20.8,'V · Templum','templum sub fluctibus'],[21.4,24,'VI · Lucerna','et lux in tenebris lucet']];
const ck=document.querySelector('#cp .k'),cl=document.querySelector('#cp .l'),cp=$('cp'),en=$('en'),ti=$('ti');let cur=-1;
function captions(t){const b=t/BAR;let op=0,j=-1;CAP.forEach((c,i)=>{if(b>c[0]-.5&&b<c[1]+.5){j=i;op=ss(c[0],c[0]+.45,b)*(1-ss(c[1]-.45,c[1],b))}});
 if(j!=cur&&j>=0){cur=j;ck.textContent=CAP[j][2];cl.textContent=CAP[j][3]}
 cp.style.opacity=op;cp.style.transform=`translateY(${j>=0?-(b-CAP[j][0])*5:0}px)`;cp.style.filter=`blur(${(1-op)*3}px)`;
 const e=ss(89.5,92,t);en.style.opacity=e;en.style.filter=`blur(${(1-e)*4}px)`}
// ---------- clock ----------
let actx,song,start=null;
function now(){if(MUTE)return start===null?T0:T0+(performance.now()-start)/1000;return song?actx.currentTime-song.base:0}
async function go(){if(song||MUTE)return;ti.style.opacity=0;ti.style.filter='blur(6px)';
 actx=new AudioContext();await actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
if(MUTE){ti.style.display='none';start=performance.now()}
// ---------- frame ----------
let L0=MUTE?-1e9:performance.now(),last=performance.now(),ema=16,fr=0;
function frame(){requestAnimationFrame(frame);const pn=performance.now(),W=pn/1000;
 ema=ema*.95+(pn-last)*.05;last=pn;if(++fr>90&&ema>34&&sc>.5){sc*=.85;size();ema=20;fr=0}
 const t=Math.min(now(),LEN),c=cam(t),H=SONG.heart(t),s=Math.sin;
 let Lt=0;const u=t-58.3;if(u>0)Lt=(u<1.6?.25*(Math.sin(u*23)*Math.sin(u*7.3)>.1?1:.15)*u/1.6:.25+.75*ss(1.6,9,u))*(1-ss(83,91,t));
 const AP=[0,F+5.6+.25*s(t*.4),149],LP=[AP[0]+.47+.12*s(t*.7),AP[1]-2.4+.1*s(t*.9),AP[2]-6.2+.12*Math.cos(t*.6)];
 const WP=[-40+(t-30)*2.6,-42+s(t*.2)*.5,66];
 const Sg=[t<44?1-ss(30,44,t):0,t<56?1:0,t>27&&t<56?1:0,t>43?1:0];
 const Fd=Math.min(1,(pn-L0)/1500)*(1-ss(86.5,90.5,t));
 gl.viewport(0,0,cv.width,cv.height);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.depthFunc(gl.ALWAYS);gl.disable(gl.BLEND);
 gl.useProgram(P1);let U=P1.U;gl.bindVertexArray(ev);
 gl.uniform2f(U.R,cv.width,cv.height);gl.uniform1f(U.T,t);gl.uniform1f(U.W,W);gl.uniform1f(U.H,H);gl.uniform1f(U.Lt,Lt);gl.uniform1f(U.Fd,Fd);
 gl.uniform3fv(U.C,c.p);gl.uniform3fv(U.LP,LP);gl.uniform3fv(U.AP,AP);gl.uniform3fv(U.WP,WP);gl.uniformMatrix3fv(U.M,false,c.m);gl.uniform4fv(U.S,Sg);
 gl.drawArrays(gl.TRIANGLES,0,3);
 gl.useProgram(P2);U=P2.U;gl.bindVertexArray(va);gl.depthFunc(gl.LEQUAL);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 gl.uniform2f(U.R,cv.width,cv.height);gl.uniform1f(U.T,t);gl.uniform1f(U.H,H);gl.uniform1f(U.Lt,Lt);gl.uniform1f(U.Fd,Fd);
 gl.uniform3fv(U.C,c.p);gl.uniform3fv(U.LP,LP);gl.uniformMatrix3fv(U.M,false,c.m);
 gl.drawArrays(gl.POINTS,0,NP);
 captions(song||MUTE?t:-99)}
frame()})();
