(()=>{
const{K,ss,Z,LEN,JC}=SONG,$=s=>document.getElementById(s),cv=$('c'),ti=$('ti'),en=$('en');
const gl=cv.getContext('webgl2',{antialias:false,depth:false,powerPreference:'high-performance'});
if(!gl){document.body.innerHTML='<p style="color:#eee;font:20px sans-serif;padding:2em">WebGL2 is required.</p>';return}
const ZC=Z(JC),ZA=ZC-18,ZB=ZC+18,TE=JC+2.5,ZO=Z(98)+60;
const arc=z=>z>ZA&&z<ZB?8*Math.sin(Math.PI*(z-ZA)/(ZB-ZA)):0;
const gh=(x,z)=>{const r=ss(14,30,Math.abs(x));const d=r*(3*Math.sin(x*.13+z*.03)*Math.sin(z*.07-x*.05)+4+2*Math.sin(z*.21)+3*(1-Math.abs(Math.sin(x*.05+z*.02)))*r);const s=ss(7,12,Math.abs(z-ZC));return -30*(1-s)+d*s};
const CXK=[[0,0],[15,0],[21,.5],[27,-1.2],[33,1.2],[39,-.5],[45,0],[51,.3],[61,-.3],[67,.6],[72,0],[80,-.6],[92,0],[100,-2],[108,2],[116,0],[121,.4],[125,-.3],[130,.6],[150,0]];
const CYK=[[0,.8],[80,.9],[90,1.2],[117,.9],[125,1.6],[130,2.5],[140,3.2],[150,4]];
const CZK=[[0,7],[45,7],[51,12],[77,12],[83,7],[90,7],[100,9],[117,9],[120,7],[127,13],[150,30]];
const YK=[[0,3.1416],[11,3.1416],[14,0],[24,0],[25,3.1416],[48,3.1416],[52,.25],[57,-.2],[65,0],[71,.2],[80,0],[117,0],[121,-.12],[124,0],[150,.3]];
const P0X=[[0,0],[38,0],[42,-3.6],[65,-3.6],[80,-15],[150,-40]];
const P0G=[[16,180],[25,640],[33,220],[41,50],[46,12],[52,4],[65,3],[72,4],[78,12],[86,30],[100,400],[120,500],[130,40],[150,40]];
const P1X=[[0,0],[38,0],[42,3.6],[65,2],[85,2],[90,12],[150,30]];
const P1G=[[16,200],[30,50],[37,20],[42,14],[52,3.5],[72,3.5],[78,6],[86,30],[100,500],[130,60],[150,60]];
const P2X=[[0,0],[37,0],[42,2],[43,12],[45,16],[150,16]];
const P2G=[[16,300],[25,820],[33,340],[41,120],[47,30],[52,22],[60,18],[70,25],[150,250]];
const P2R=[[0,0],[42,0],[43,0],[48,9]];
const P3X=[[0,-6],[150,-6]];
const P3G=[[0,700],[30,500],[72,300],[80,10],[90,6],[110,300],[150,500]];
function rig(t){
 const tz=Z(t),pb=1-ss(12,16,t),tx=-.6*ss(66,68,t)+(t>=92&&t<118?3*Math.sin((t-92)*.9)*ss(92,94,t)*(1-ss(117,119,t)):0),ty=arc(tz);
 const V=[[tx,ty,tz,0,0,0]];
 [[K(P0X,t),K(P0G,t)*(1-pb)+(tz+40)*pb,0,1],[K(P1X,t),K(P1G,t)*(1-pb)+(tz+40)*pb,0,2],[K(P2X,t),K(P2G,t)*(1-pb)+(tz+40)*pb,K(P2R,t),3],[K(P3X,t),K(P3G,t),0,1]].forEach(([x,g,roll,k])=>{const z=tz-g;V.push([x,Math.max(arc(z),gh(x,z)),z,g,roll,k])});
 return{tz,tx,ty,V};
}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm3=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
const lerp=(a,b,w)=>a.map((v,i)=>v+(b[i]-v)*w);
function view(t,r){
 const yaw=K(YK,t),pit=-.05+.02*Math.sin(t*1.9),sh=.035*Math.sin(t*23.1)*(1+4*ss(62,68,t));
 let p=[r.tx+K(CXK,t)+sh,r.ty+K(CYK,t)+sh*.5,r.tz-K(CZK,t)];
 let f=[Math.sin(yaw)*Math.cos(pit),Math.sin(pit),Math.cos(yaw)*Math.cos(pit)];
 const wo=t>27.5&&t<33,wc=ss(TE-2.5,TE+.5,t)*(1-ss(140,143,t)),we=t>=128,a=(t-128)*.09;
 if(wo){const op=[r.tx+9*Math.sin(t*.5),r.ty+2.2,r.tz+9*Math.cos(t*.5)];p=op;f=nrm3([r.tx-op[0],r.ty+1-op[1],r.tz-op[2]])}
 if(wc>0){p=lerp(p,[p[0],p[1]+5,p[2]-8],wc);f=lerp(f,nrm3([r.tx-p[0],r.ty+8-p[1],r.tz+10-p[2]]),wc)}
 if(we){p=[r.tx+14*Math.sin(a),r.ty+1.2,r.tz+14*Math.cos(a)];f=nrm3([r.tx-p[0],r.ty+1-p[1],r.tz-p[2]])}
 f=nrm3(f);
 const rr=nrm3(cross(f,[0,1,0])),uu=cross(rr,f);
 return{p,f,rr,uu};
}
function fx(t,r){
 const V=r.V,hp=ss(65,66.5,t),A=[V[1][0]+1.8,V[1][1]+1.6,V[1][2]],Bt=[r.tx-1.8,r.ty+1.2,r.tz+.5];
 const DS=[],DAm=[],EX=[],EF=[];
 V.forEach((v,i)=>{
  const[x,y,z,g]=v,a=i?(.03+.4*(1-ss(40,400,g)))*ss(5,10,t):.5*(1-ss(.2,1.5,y));
  const burst=i==3?1.5*ss(41.5,42,t)*(1-ss(48,56,t)):0;
  DS.push([x,y+1.2,z,i?2.5+.035*g:3]);DAm.push(a+burst);
  EX.push(i?[x+1.2,y+2.9,z-2.3]:[x+1,y+2.9,z+3.3]);EF.push(i?ss(12,14,t):1);
 });
 V.forEach((v,i)=>{const[x,y,z]=v;DS.push([x,y+.6,z-6,(i?2.5+.035*v[3]:3)*1.3]);DAm.push(DAm[i]*.6)});
 EX.push([V[2][0]+1.1,V[2][1]+2.9,V[2][2]-1.2]);EF.push(ss(50,52,t)*(1-ss(64,66,t))*(1.5+.8*Math.sin(t*17)));
 EX.push([-14,14,-98],[-18,14,-98]);EF.push(1,1);
 const fight=t>58&&t<67,surv=t>137;
 return{
  HA:A,HB:A.map((a,i)=>a+(Bt[i]-a)*hp),HL:ss(64.5,65,t)*(1-ss(74,75,t)),
  SK:[r.tx+1.9,r.ty+1,r.tz-3.2],SKI:ss(50,51,t)*(1-ss(64,65,t))*(.6+.4*Math.sin(t*31)),
  EXP:[r.tx,r.ty+2+Math.max(0,t-TE)*2.4,r.tz],EQ:1+5*ss(TE,TE+4,t),EI:ss(TE,TE+.15,t)*(1-.5*ss(140,150,t)),
  FA:fight?[r.tx+.5,r.ty+2.7,r.tz-1+.3*Math.sin(t*5)]:[0,-500,0],
  FB:fight?[r.tx-.5,r.ty+2.7,r.tz+.8+.3*Math.cos(t*4.3)]:surv?[r.tx+3+.8*(t-137),0,r.tz]:[0,-500,0],
  H1:[r.tx-.9,r.ty+1.1,r.tz+4.3],H2:[r.tx+.9,r.ty+1.1,r.tz+4.3],
  DS,DAm,EX,EF
 };
}
const VS='#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}';
function prog(vs,fs){const p=gl.createProgram();for(const[ty,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(ty);
 gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));gl.attachShader(p,s)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);U[a.name]=gl.getUniformLocation(p,a.name)}return{p,U}}
const{p:PR,U}=prog(VS,$('fs').textContent);
let sc=1,ema=16,last=performance.now(),fr=0;
function size(){const w=innerWidth,h=innerHeight,k=Math.min(devicePixelRatio||1,1)*sc*Math.min(1,1152/w);cv.width=w*k|0;cv.height=h*k|0}
addEventListener('resize',size);size();
let actx=null,song=null;
async function go(){if(song)return;ti.style.opacity=0;ti.style.filter='blur(8px)';actx=new AudioContext();await actx.resume();song=SONG.live(actx,0)}
addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
let lastT=0;
window.__probe={dur:LEN,cam:t=>(lastT=t,view(t,rig(t)).p),get boxes(){
 const r=rig(lastT),t=lastT,B=r.V.map(v=>{const d=v[5]?3.6:5.5;return[v[0]-2,v[1],v[2]-d,v[0]+2,v[1]+3,v[2]+(v[5]?3.5:6)]});
 for(let x=-30;x<30;x+=3)for(let z=r.tz-30;z<r.tz+12;z+=3)B.push([x,-40,z,x+3,Math.max(gh(x,z),gh(x+3,z),gh(x,z+3),gh(x+3,z+3)),z+3]);
 B.push([-26,0,-93,26,8,-91],[-8.6,0,ZO-.6,-7.4,9,ZO+.6],[7.4,0,ZO-.6,8.6,9,ZO+.6],[-9,0,ZO-1.5,0,9.4,ZO+1.5]);
 if(t>=92&&t<118)for(let z=r.tz-30;z<r.tz+12;z+=22)B.push([7.9,0,z,11.1,3,z+22],[-11.1,0,z,-7.9,3,z+22]);
 return B}};
const u1=(n,x)=>gl.uniform1f(U[n],x),u3=(n,a)=>gl.uniform3fv(U[n],a),u4=(n,a)=>gl.uniform4fv(U[n],a);
function frame(){
 requestAnimationFrame(frame);
 const pn=performance.now();
 ema=ema*.95+(pn-last)*.05;last=pn;if(++fr>90&&ema>34&&sc>.5){sc*=.85;size();ema=20;fr=0}
 const t=song?Math.min(LEN,Math.max(0,actx.currentTime-song.base)):0;
 const r=rig(t),v=view(t,r),e=fx(t,r),storm=ss(72,74,t)*(1-ss(90,93,t));
 const SD=nrm3([.42,-.15+.45*ss(0,14,t)-.2*ss(60,120,t)-.6*ss(124,140,t),1]);
 const LT=storm*Math.pow(Math.max(0,Math.sin(pn/190)*Math.sin(pn/700+.4)),6)*2;
 gl.viewport(0,0,cv.width,cv.height);gl.useProgram(PR);
 gl.uniform2f(U.R,cv.width,cv.height);
 u1('T',pn/1000);u1('ZC',ZC);u1('DU',1+3*storm+.8*ss(136,148,t));u1('FG',.0025+.02*storm);u1('HL',e.HL);u1('SKI',e.SKI);u1('EQ',e.EQ);u1('EI',e.EI);
 u1('NI',ss(128,134,t));u1('CI',t>=92&&t<118?1:0);u1('OA',1.2*ss(98,101,t));u1('ZO',ZO);u1('LT',LT);u1('HI',storm);
 u3('CP',v.p);u3('SD',SD);u3('HA',e.HA);u3('HB',e.HB);u3('SK',e.SK);u3('EXP',e.EXP);u3('FA',e.FA);u3('FB',e.FB);u3('H1',e.H1);u3('H2',e.H2);
 gl.uniformMatrix3fv(U.M,false,[...v.rr,...v.uu,...v.f]);
 u4('VA[0]',r.V.flatMap(x=>[x[0],x[1],x[2],x[4]]));
 u4('VB[0]',r.V.flatMap((x,i)=>[x[5],i?0:1.1*ss(TE,TE+3.5,t),0,0]));
 u4('DS[0]',e.DS.flat());gl.uniform1fv(U['DAm[0]'],e.DAm);gl.uniform1fv(U['EF[0]'],e.EF);gl.uniform3fv(U['EX[0]'],e.EX.flat());
 gl.drawArrays(gl.TRIANGLES,0,3);
 en.style.opacity=ss(143,149,t);
}
frame();
})();
