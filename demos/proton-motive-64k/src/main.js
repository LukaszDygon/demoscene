// PROTON MOTIVE: timeline, cameras, scene parameters, captions and the render pipeline. The audio clock drives everything.
const $=i=>document.getElementById(i),cv=$('c'),gl=cv.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'high-performance'}),QS=new URLSearchParams(location.search);
const M=Math,PI=M.PI,BAR=SONG.BAR,ST=SONG.ST,cl=(x,a=0,b=1)=>M.min(b,M.max(a,x)),sm=x=>(x=cl(x),x*x*(3-2*x)),mx=(a,b,x)=>a+(b-a)*x,
// Catmull-Rom through control points, u in 0..1
CR=(P,u)=>{const n=P.length-1,f=cl(u)*n,i=M.min(n-1,f|0),x=f-i,a=P[M.max(i-1,0)],b=P[i],c=P[i+1],d=P[M.min(i+2,n)];
 return b.map((_,k)=>.5*(2*b[k]+(c[k]-a[k])*x+(2*a[k]-5*b[k]+4*c[k]-d[k])*x*x+(3*b[k]-a[k]-3*c[k]+d[k])*x*x*x))},
orb=(c,r,a,y)=>[c[0]+M.cos(a)*r,c[1]+y,c[2]+M.sin(a)*r],add=(a,b)=>a.map((v,i)=>v+b[i]);
const FL=gl.getExtension('EXT_color_buffer_float'),IF=FL?gl.RGBA16F:gl.RGBA8,TY=FL?gl.HALF_FLOAT:gl.UNSIGNED_BYTE;
// ---------------- programs ----------------
const VS='#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}',H3='#version 300 es\n';
function prog(vs,fs){const p=gl.createProgram();[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]].forEach(([t,s])=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);gl.attachShader(p,x);p.s=(p.s||[]).concat(x)});gl.linkProgram(p);p.u={};return p}
// shaders compile in parallel where the driver allows it; errors are reported once all are linked
const SCENE="$SCENE$",POST="$POST$",SPRV="$SPRV$",SPRF="$SPRF$",
SP=[0,1,2,3,4,5,6].map(s=>prog(VS,H3+'#define S '+s+'\n'+SCENE)),PP=[0,1,2,3].map(n=>prog(VS,H3+'#define P '+n+'\n'+POST)),SPR=prog(H3+SPRV,H3+SPRF);
const ALL=[...SP,...PP,SPR];
const U=(p,n)=>n in p.u?p.u[n]:p.u[n]=gl.getUniformLocation(p,n),
uf=(p,n,v)=>{const l=U(p,n);l&&(typeof v=='number'?gl.uniform1f(l,v):gl['uniform'+(v.length>4?4:v.length)+'fv'](l,v))};
// ---------------- noise volume: two gradient noises (1-unit cells), a finer one, cellular F1; 16-unit period ----------------
function noiseTex(){const N=64,D=new Float32Array(N*N*N*4);let sd=7;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
 const grad=P=>{const g=new Float32Array(P*P*P*3);for(let i=0;i<g.length;i+=3){let x,y,z,l;do{x=rnd()*2-1;y=rnd()*2-1;z=rnd()*2-1;l=x*x+y*y+z*z}while(l>1||l<.01);l=M.sqrt(l);g[i]=x/l;g[i+1]=y/l;g[i+2]=z/l}
  return(x,y,z)=>{const X=x|0,Y=y|0,Z=z|0,fx=x-X,fy=y-Y,fz=z-Z,q=t=>t*t*t*(t*(t*6-15)+10),u=q(fx),v=q(fy),w=q(fz);let r=0;
   for(let c=0;c<8;c++){const i=c&1,j=c>>1&1,k=c>>2,o=((X+i)%P+((Y+j)%P)*P+((Z+k)%P)*P*P)*3;r+=(g[o]*(fx-i)+g[o+1]*(fy-j)+g[o+2]*(fz-k))*(i?u:1-u)*(j?v:1-v)*(k?w:1-w)}return r}};
 const A=grad(16),B=grad(16),C=grad(32),FP=[];for(let i=0;i<4096;i++)FP.push([rnd(),rnd(),rnd()]);
 for(let z=0;z<N;z++)for(let y=0;y<N;y++)for(let x=0;x<N;x++){const o=(x+y*N+z*N*N)*4,X=x/4,Y=y/4,Z=z/4,cx=X|0,cy=Y|0,cz=Z|0;let m=9;
  D[o]=A(X,Y,Z)*1.6;D[o+1]=B(X,Y,Z)*1.6;D[o+2]=C(x/2,y/2,z/2)*1.6;
  for(let k=-1;k<2;k++)for(let j=-1;j<2;j++)for(let i=-1;i<2;i++){const a=cx+i,b=cy+j,c=cz+k,f=FP[(a+16)%16+(b+16)%16*16+(c+16)%16*256],dx=a+f[0]-X,dy=b+f[1]-Y,dz=c+f[2]-Z;m=M.min(m,dx*dx+dy*dy+dz*dz)}
  D[o+3]=M.sqrt(m)}
 const t=gl.createTexture();gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_3D,t);gl.texImage3D(gl.TEXTURE_3D,0,gl.RGBA16F,N,N,N,0,gl.RGBA,gl.FLOAT,D);
 for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_3D,k,gl.LINEAR);
 for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T,gl.TEXTURE_WRAP_R])gl.texParameteri(gl.TEXTURE_3D,k,gl.REPEAT);gl.activeTexture(gl.TEXTURE0)}
// ---------------- render targets: scene (rgb + hit distance), particles, bloom chain, streak ----------------
let W,H,BW,BH,BY,q=1,RT={};
function rt(w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,IF,w,h,0,gl.RGBA,TY,null);
 for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);
 for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return{t,f,w,h}}
// letterboxed to 2.39:1, the internal width capped at 1280 and scaled by the quality governor
function size(){const d=M.min(devicePixelRatio||1,2);cv.width=innerWidth*d|0;cv.height=innerHeight*d|0;BW=cv.width;BH=M.min(cv.height,BW/2.39|0);BY=(cv.height-BH)/2|0;
 W=M.round(M.min(BW,1152)*q);H=M.max(1,M.round(W*BH/BW));
 for(const k in RT){gl.deleteTexture(RT[k].t);gl.deleteFramebuffer(RT[k].f)}
 const w4=M.max(1,W>>2),h4=M.max(1,H>>2);RT={S:rt(W,H),P:rt(W,H),A:rt(w4,h4),B:rt(w4,h4),C:rt(M.max(1,W>>3),M.max(1,H>>3)),D:rt(M.max(1,W>>3),M.max(1,H>>3)),E:rt(w4,h4),F:rt(w4,h4)};
 const bar=(innerHeight-innerWidth/2.39)/2;$('cp').style.bottom=$('hd').style.bottom=M.max(14,bar*.3)+'px';}
// ---------------- music events → envelopes for the picture ----------------
const EV={};for(let b=0;b<SONG.BARS;b++)for(const[i,y,v,p]of SONG.ev(b))(EV[y]=EV[y]||[]).push([(b*16+i)*ST,v,p]);
const last=(y,t)=>{const a=EV[y]||[];let lo=0,hi=a.length-1,r=null;while(lo<=hi){const m=lo+hi>>1;a[m][0]<=t?(r=a[m],lo=m+1):hi=m-1}return r},
env=(y,t,d)=>{const e=last(y,t);return e&&t-e[0]<d*8?e[1]*M.exp(-(t-e[0])/d):0},
cnt=(y,t)=>{const a=EV[y]||[];let lo=0,hi=a.length;while(lo<hi){const m=lo+hi>>1;a[m][0]<=t?lo=m+1:hi=m}return lo};
// the proton gradient: builds through the relay and the lumen, peaks at the breakdown, is spent by the rotor
const PR=b=>b<40?0:b<56?.35*(b-40)/16:b<72?.35+.55*sm((b-56)/16):b<80?.9+.1*(b-72)/8:b<112?.45+.55*M.exp(-(b-80)*1.2):.1+.35*(1-sm((b-112)/8));
// rotor: still (straining in the last bars of the breakdown), then one 30-degree c-ring step per 16th from bar 80
const ROT=t=>{const b=t/BAR;if(b<80)return PI/3+(b>76?.025*M.sin(t*95)*(b-76)/4:0);const s=(t-80*BAR)/ST,i=M.floor(s),f=s-i;return PI/3+(i+1-(1-cl(f/.35))**3)*PI/6};
// electron transport chain stations (complex I clusters 0-6, Q, III, cyt c, IV)
const FES=k=>[mx(1.15,.45,k/6),mx(-4.8,-.75,k/6),mx(1.05,.88,k/6)+.1],QS0=[.35,-.3,.9],QS1=[5.4,-.2,.95],RK=[5.9,1.6,1.],CY0=[7.2,1.95,.7],CY1=[11.5,1.95,.7],CU=[12.3,1.25,1.],O2=[12.1,-.4,1.05];
function chain(t){const b=t/BAR,s=(b-M.floor(b))*16;let pos,prev,cy,cg=0,fi=-9;
 cy=s<12?CY0.map((v,k)=>mx(CY1[k],v,sm(s/8))):s<14?CY0.map((v,k)=>mx(v,CY1[k],sm((s-12)/2))):CY1;
 const h=SONG.HOPS;let k=0;while(k<10&&h[k+1]<=s)k++;const hs=h[k],age=(s-hs)*ST;
 const at=j=>j<7?FES(j):j==7?QS1:j==8?RK:j==9?cy:CU;
 pos=at(k);prev=k?at(k-1):[1.6,-5.6,1.2];
 if(k==7)pos=QS0.map((v,i)=>mx(v,QS1[i],sm((s-8)/2)));
 if(k==9){pos=add(cy,[0,0,.45]);cg=1}
 if(k==10&&s>15){prev=CU;pos=O2}
 if(k<7)fi=s;
 return{pos,prev,cy,cg,fi,age:k==10&&s>15?(s-15)*ST:age}}
// ---------------- shots ----------------
// [start bar, scene, camera(u,b,t) -> [position, target, roll, tan(fov/2), focus distance, aperture px]]
const MC=t=>[.3*M.sin(t*.21),.2*M.sin(t*.17),-.06*t],cz=b=>2-(b-24)*2.1,cxc=z=>-4.1*M.cos(PI*z/4),lum=z=>3*M.sin(z*.07)+1.5*M.sin(z*.023+1),
SPL=12*BAR,ZF=b=>-50.5*sm((b-56)/16.5);
const SHOTS=[
 [0,0,(u,b,t)=>{const c=MC(t),d=mx(13,5.6,sm(u));return[orb(c,d,.6+u*.9,mx(2.6,.8,sm(u))),c,0,.5,d,4]}],
 [8,0,(u,b,t)=>{const c=MC(t),d=mx(5.6,4.3,sm(u));return[orb(c,d,1.5+u*.7,.8-u*.6),c,.05,.5,d,5]}],
 [12,0,(u,b,t)=>{const c=MC(t),d=4.3+u*4.5,sh=.15*M.exp(-(t-SPL)*3);return[add(orb(c,d,2.2+u*.6,.2+u*1.6),[M.sin(t*41)*sh,M.sin(t*37)*sh,0]),add(c,[-u*u*3,u*u*1.5,-u*u*6]),-.04,.5,d,4]}],
 [16,1,u=>{const s=sm(u);return[CR([[-38,20,34],[-20,9,26],[-2,5,16],[7,2.2,5.6]],s),CR([[0,0,0],[0,0,0],[2,0,0],[5,0,1.5]],s),-.1+u*.15,.55,M.max(4,30*(1-s)),2]}],
 [21,2,u=>{const y=mx(4.5,-8.6,u**1.6);return[[.25,y,.15],[.3,y-6,.26],u*2.6,.62,3,3]}],
 [24,3,(u,b,t)=>{const z=cz(b),y=.85*M.sin((b-24)*.35);return[[cxc(z),y,z],[cxc(z-5)*.8,y*.4+.35,z-5],.12*M.sin(PI*z/4),.6,6,5]}],
 [40,4,u=>[CR([[3.6,-5.8,5],[3.2,-3.5,4.6],[2.6,-1.4,4.3]],u),CR([[.9,-4.4,.8],[.7,-2.6,.8],[.6,-1,.6]],u),.05,.5,4.2,6]],
 [44,4,u=>{const x=mx(-1,8.5,sm(u));return[[x,mx(1.25,1.6,u),5.2],[x+2.2,0,0],-.03,.5,5.3,5]}],
 [48,4,u=>[CR([[7.5,3.7,4.3],[10,3,3.7],[13.5,2.5,4]],u),CR([[7.5,1.6,.3],[10,1.7,.4],[12.2,.8,.3]],u),.04,.5,3.8,6]],
 [52,4,u=>{const s=sm(u);return[CR([[14,1.5,6],[9,3.6,10],[3,5.5,13]],s),[mx(11,4,s),0,0],0,.55,mx(6,13,s),3]}],
 [56,5,(u,b,t)=>{const z=ZF(b),e=sm((b-67)/4.5),sh=.03*PR(b);return[[lum(z)+M.sin(t*31)*sh,.15*M.sin(t*.7)+M.sin(t*27)*sh-e*.3,z],[lum(z-6),-.2-1.5*e,z-6],.06*M.sin(z*.07),.6,6,4]}],
 [72,6,u=>{const s=sm(u);return[orb([0,0,0],mx(10,7.5,s),.9+u*.25,mx(1,1.8,u)),[0,2.5,0],0,.55,8,3]}],
 [76,6,u=>{const s=sm(u);return[CR([[5.2,1,3.6],[4,3,3.4],[3.3,5.4,3]],s),CR([[0,2,0],[0,3,0],[0,3.9,0]],s),.03,.5,4.5,5]}],
 [80,6,(u,b,t)=>[orb([0,0,0],3.4,.6-(t-80*BAR)*.5,1.5),[0,.7,0],0,.55,3.4,7]],
 [84,6,u=>[orb([0,0,0],6.5,1.8+u*1.2,3.8),[0,3.2,0],-.05,.5,6.8,5]],
 [88,6,u=>[orb([0,0,0],2.9,3.2+u*.6,1.25),[0,3.6,0],.08,.62,3.4,5]],
 [92,6,u=>[orb([0,0,0],1.4,u*1.6,10.5),[0,4.2,0],u*.8,.5,5.6,6]],
 [96,6,u=>[orb([0,0,0],mx(7,10,u),4.5+u*2,mx(5,2,u)),[0,2.6,0],0,.5,8,4]],
 [100,6,u=>{const s=sm(u);return[CR([[8,3,8],[9,5,11],[8,7,14]],s),[-1.4,2,-1.3],0,.5,14,3]}],
 [104,3,(u,b,t)=>{const z=-60-(b-104)*3,y=-.4+(b-104)*.22;return[[cxc(z),y,z],[cxc(z-5)*.7,y*.3,z-5],.15*M.sin(PI*z/4),.62,7,4]}],
 [112,1,u=>{const s=sm(u);return[[0,mx(4,30,s),mx(26,140,s)],[0,0,-40],0,.55,40,0]}],
 [120,1,()=>[[0,30,140],[0,0,-40],0,.55,40,0]]];
// cuts: [bar, whip angle, flash]
const CUTS=[[16,.5,.2],[21,1.3,0],[24,2.1,.7],[40,-.4,.1],[44,.3,0],[48,-2.8,0],[52,.1,0],[56,2.7,.2],[72,.2,0],[76,1.4,0],[80,1.57,1],[84,0,.25],[88,-1.4,.2],[92,1.6,.3],[96,3,.2],[100,.4,.15],[104,1.,.5],[112,-1.1,.2]];
// ---------------- captions ----------------
const CAP=[[1,6,'Glucose','C₆H₁₂O₆ · fuel drifts into the cell'],[8,4,'Glycolysis','two phosphates spent to crack the ring'],[12.25,3.5,'2 × Pyruvate','three carbons each, bound for the mitochondrion'],
 [17,4,'Mitochondrion','the cristae shine through the outer membrane'],[21.25,2.6,'Double membrane','porin · import channel'],[25,6,'Cristae','the folded inner membrane, lit by its own respiration'],
 [40.25,3.5,'Complex I','NADH hands two electrons down seven iron–sulphur clusters'],[44.25,3.5,'Ubiquinone → Complex III','the electron rides Q through the lipid'],[48.25,2,'Cytochrome c','a small courier on the far side'],
 [50.5,3,'Complex IV','½O₂ + 2H⁺ + 2e⁻ → H₂O'],[57,6,'Proton gradient','every hop pumps protons into the lumen'],[66,4,'Pressure','Δp approaching 200 mV'],
 [72.5,5,'ATP synthase','F₀ in the membrane · F₁ in the matrix'],[80.25,4,'Rotor engaged','12 c-subunits · one 30° step per sixteenth'],
 [92.25,3.5,'α₃β₃','three catalytic sites · one ATP per beat'],[100.25,3.5,'Dimers','rows of synthases bend the cristae'],[104.25,4,'ATP','released into the matrix'],[112.5,4,'The cell at work','']];
let capI=-1;
function captions(b){let k=-1;CAP.forEach((c,i)=>{if(b>=c[0]&&b<c[0]+c[1])k=i});if(k!=capI){capI=k;const e=$('cp');
 if(k<0)e.style.opacity=0;else{e.innerHTML='<b>'+CAP[k][2]+'</b><i>'+CAP[k][3]+'</i>';e.style.opacity=1}}
 const hd=$('hd');if(b>40&&b<117){hd.style.opacity=1;const n=cnt(8,b*BAR)-0;hd.textContent='Δp '+String(M.round(205*PR(b))).padStart(3,'0')+' mV   ATP '+String(b>=80?n:0).padStart(6,'0')}else hd.style.opacity=0}
// ---------------- per-frame state ----------------
const L=new Float32Array(16),PA=new Float32Array(24);
function state(t){const b=t/BAR;let si=0;while(si<SHOTS.length-2&&b>=SHOTS[si+1][0])si++;
 const[b0,sc,cam]=SHOTS[si],u=cl((b-b0)/(SHOTS[si+1][0]-b0)),k=env(0,t,.12);let[p,ta,roll,fov,foc,ap]=cam(u,b,t);
 // the kick shakes the camera while the rotor turns
 if(b>=80&&b<112)p=add(p,[M.sin(t*53)*.03*k,M.cos(t*47)*.03*k,0]);
 const hh=env(1,t,.05),st=M.max(env(11,t,.25),env(12,t,.6),env(8,t,.2)),P=PR(b);
 let X=[0,0,0,0],Y=[0,0,0,0],ex=1,sh=0;L.fill(0);PA.fill(0);
 if(sc==0){const c=MC(t),sa=t-SPL;X=[sm(b/4),sm(b-8),sm(b-10),b>=12?sa:-1];Y=[...c,t*.12];ex=1.1+sm((b-14.5)/1.5)*1.6;
  if(b>=12){const f=M.exp(-sa*3);L.set([c[0]+.6,c[1],c[2]+.6,4*f,c[0]-.6,c[1],c[2]-.6,4*f])}
  for(const[bb,j]of[[9,0],[11,1]])if(b>=bb&&b<bb+1)L.set([c[0],c[1]+.6,c[2],2*M.exp(-(b-bb)*BAR*4)],8)}
 if(sc==1){if(b<112){X=[0,mx(.6,.9,sm((b-16)/3))*mx(1,.6,sm((b-19)/2)),.2,1];ex=1.2}else{X=[1,mx(1.3,.2,sm((b-112)/8)),mx(.5,0,sm((b-112)/7)),1];Y=[t*.02,0,0,0];ex=1.2}}
 if(sc==2){X=[mx(.6,1.3,sm((b-21)/2.5)),1,0,0];ex=1.05-sm((b-23.2)/.5)*.35+sm((b-23.75)/.25)*.6}
 if(sc==3){X=b<104?[0,.75+.3*st,0,0]:[1,1.15,1+env(8,t,.3),0];ex=b<104?1.35:1.1}
 if(sc==4){const c=chain(t);X=[P,c.fi,c.age,0];Y=[...c.cy,c.cg];L.set([...c.pos,1.2+1.5*M.exp(-c.age*12),...c.prev,0]);
  if(c.prev==CU)L.set([...O2,3*M.exp(-c.age*5)],8);ex=1.15}
 if(sc==5){X=[P,sm((b-60)/12),sm((b-66)/5),k];ex=1.1+P*.3;sh=sm((b-62)/10)*.9}
 if(sc==6){const n=M.floor((t-80*BAR)/(BAR/4)),on=b>=80;X=[on?.6:1.6,on?.5:P,b>=100?1:0,on?(t-80*BAR)%(BAR/4):9];Y=[on?((n%3)+3)%3:0,b<80?sm((b-74)/6):.2,0,0];ex=b<80?1.15:1.2;
  sh=b<80?sm((b-74)/5.5)*(b<79.75?1:0):0;
  if(on)for(let i=0;i<6;i++){const m=n-i,a=t-80*BAR-m*BAR/4;const an=PI/3+(m%3)*2*PI/3,r=1.9+2.2*a+.3*a*a;if(m<0||r>6)continue;
   PA.set([M.cos(an)*r,3+.5*a-.1*a*a,M.sin(an)*r,a+.01],i*4)}
  if(on){const an=PI/3+(n%3)*2*PI/3,f=M.exp(-((t-80*BAR)%(BAR/4))*8);L.set([M.cos(an)*1.9,3.1,M.sin(an)*1.9,2*f])}}
 // whips and flashes around the cuts
 let wh=0,wa=0,fl=0;for(const[cb,a,f]of CUTS){const d=t-cb*BAR,w=M.exp(-M.abs(d)/.08);if(w>wh){wh=w;wa=a}fl=M.max(fl,f*M.exp(-M.abs(d)*(d<0?30:4)))}
 const fade=sm(b/1.5)*(1-sm((b-118)/2));
 return{b,sc,p,ta,roll,fov,foc,ap,X,Y,k,hh,st,P,ex:ex*(1+.12*k*(b>=80&&b<112)),sh,wh:wh*.9,wa,fl,fade,A:ROT(t)}}
// ---------------- draw ----------------
function pass(p,dst,tx){const w=dst?dst.w:BW,h=dst?dst.h:BH;gl.bindFramebuffer(gl.FRAMEBUFFER,dst?dst.f:null);gl.viewport(0,dst?0:BY,w,h);gl.useProgram(p);
 tx.forEach((x,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,x.t);gl.uniform1i(U(p,'uS'+i),i)});uf(p,'uR',[w,h,FR]);uf(p,'uT',TT)}
let FR=0,TT=0;
function draw(t){const s=state(t),{X,Y}=s,cam=[s.roll,s.fov,s.foc,s.ap];TT=t;FR++;
 const prm=p=>{uf(p,'uC',s.p);uf(p,'uD',s.ta);uf(p,'uF',cam);uf(p,'uE',[s.k,s.hh,s.st,s.P]);uf(p,'uX',X);uf(p,'uY',Y);uf(p,'uB',s.b);uf(p,'uA',s.A)};
 const p=SP[s.sc];pass(p,RT.S,[]);prm(p);gl.uniform4fv(U(p,'uL'),L);gl.uniform4fv(U(p,'uP'),PA);gl.drawArrays(gl.TRIANGLES,0,3);
 // particles, additive, occluded by the scene's hit distance
 pass(SPR,RT.P,[RT.S]);prm(SPR);gl.uniform1i(U(SPR,'uS'),s.sc);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.POINTS,0,s.sc==5?5000:3200);gl.disable(gl.BLEND);
 // bloom: bright pass at 1/4, blur, a wider blur at 1/8, the anamorphic streak from the bright pass
 const bp=(pr,dst,src,dx,dy,thr)=>{pass(pr,dst,src);uf(pr,'uDir',[dx,dy]);thr!=null&&uf(pr,'uV',[thr,0,0,0]);gl.drawArrays(gl.TRIANGLES,0,3)};
 bp(PP[0],RT.A,[RT.S,RT.P],1/W,1/H,1.);bp(PP[1],RT.B,[RT.A],1/RT.A.w,0);bp(PP[1],RT.A,[RT.B],0,1/RT.A.h);
 bp(PP[1],RT.D,[RT.A],2/RT.A.w,0);bp(PP[1],RT.C,[RT.D],0,2/RT.A.h);
 bp(PP[2],RT.E,[RT.A],2.5/RT.A.w,0);bp(PP[2],RT.F,[RT.E],9/RT.A.w,0);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
 const f=PP[3];pass(f,null,[RT.S,RT.P,RT.A,RT.C,RT.F]);uf(f,'uQ',[s.wh,s.wa,s.sh,s.fl]);uf(f,'uV',[s.ex,s.fade*(PLAY?1:.55),.045,1+s.wh*4+s.sh*2]);uf(f,'uF',cam);uf(f,'uR',[BW,BH,BY]);gl.drawArrays(gl.TRIANGLES,0,3);
 return s}
// ---------------- boot ----------------
noiseTex();ALL.forEach(p=>{gl.useProgram(p);const l=U(p,'uN');l&&gl.uniform1i(l,7)});
ALL.forEach(p=>{if(!gl.getProgramParameter(p,gl.LINK_STATUS))p.s.forEach(x=>gl.getShaderParameter(x,gl.COMPILE_STATUS)||console.error(gl.getShaderInfoLog(x)))});
size();addEventListener('resize',size);
// pre-warm every pipeline (Metal/D3D build them lazily on first draw, which would hitch at each cut)
gl.bindFramebuffer(gl.FRAMEBUFFER,RT.S.f);gl.viewport(0,0,W,H);for(const p of SP){gl.useProgram(p);for(let i=0;i<2;i++)gl.drawArrays(gl.TRIANGLES,0,3)}
gl.bindFramebuffer(gl.FRAMEBUFFER,RT.P.f);gl.useProgram(SPR);gl.drawArrays(gl.POINTS,0,1);gl.bindFramebuffer(gl.FRAMEBUFFER,RT.A.f);for(const p of PP){gl.useProgram(p);gl.drawArrays(gl.TRIANGLES,0,3)}gl.finish();
let actx,song,PLAY=0,t0=0,qa=[];
const start=async()=>{if(PLAY)return;PLAY=1;$('ti').style.opacity=0;cv.style.cursor='none';
 actx=actx||new AudioContext();await actx.resume();const from=+(QS.get('t')||0);song=SONG.live(actx,from)};
addEventListener('click',start);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')start();if(e.key=='f')document.documentElement.requestFullscreen?.()});
// prepare the samples before the click so the first bar is ready instantly
setTimeout(()=>{try{actx=new AudioContext();SONG.prep(actx.sampleRate)}catch(e){}},50);
let lt=performance.now();
function loop(now){requestAnimationFrame(loop);if(PLAY&&song&&actx.currentTime-song.base>SONG.LEN)return;
 const dt=now-lt;lt=now;
 // quality governor: render scale follows the frame time
 qa.push(dt);if(qa.length>40){const a=qa.reduce((x,y)=>x+y)/qa.length;qa=[];const nq=a>36?M.max(.5,q*.85):a<19?M.min(1,q*1.08):q;if(M.abs(nq-q)>.02){q=nq;size()}}
 let t;if(PLAY&&song){t=actx.currentTime-song.base;if(t<0)t=0}else t=72.6*BAR+(now*.00025)%(3*BAR);
 const s=draw(t);
 if(PLAY){captions(s.b);$('en').style.opacity=s.b>117.5?1:0}}
requestAnimationFrame(loop);
/*DBG*/window.__dbg={draw,state,play(){PLAY=1},get RT(){return RT},get W(){return W},get H(){return H},setq(v){q=v;size()},gl};/*END*/
