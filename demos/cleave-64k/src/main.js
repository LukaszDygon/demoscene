// CLEAVE: timeline, blastomere mechanics, epithelial profile, reaction-diffusion and rendering.
// The audio clock drives everything: t = audio time, B = bar (with the tempo map from SONG.T).
const $=i=>document.getElementById(i),cv=$('c'),gl=cv.getContext('webgl2',{antialias:false,alpha:false}),QS=new URLSearchParams(location.search);
if(!gl)document.body.innerHTML='<p style="font:16px sans-serif;padding:2em">CLEAVE needs WebGL2.</p>';
gl.getExtension('EXT_color_buffer_float');const FLIN=gl.getExtension('OES_texture_float_linear');
const VS='#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}';
function prog(fs){const p=gl.createProgram();[[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,fs]].forEach(([t,s])=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);
 if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));gl.attachShader(p,x)});gl.linkProgram(p);p.u={};return p}
const SRC="$SCENE$",SP=[0,1,2,3,4].map(k=>prog(SRC.replace('es\n','es\n#define SC '+k+'\n'))),PST=prog("$POST$"),RDP=prog("$RD$");
let cur;const UN={},UI={RD:0,PF:2,CE:3},use=p=>gl.useProgram(cur=p),
 uf=(n,...v)=>UN[n]=v,
 // set every collected uniform on the current program (unknown names are skipped)
 applyU=()=>{for(const n in UN){const v=UN[n],l=U(n);l&&(v[0].length?gl['uniform'+(n=='C'?4:2)+'fv'](l,v[0]):gl['uniform'+v.length+'f'](l,...v))}for(const n in UI){const l=U(n);l&&gl.uniform1i(l,UI[n])}},
 U=n=>n in cur.u?cur.u[n]:cur.u[n]=gl.getUniformLocation(cur,n),
 u=(n,...v)=>gl['uniform'+v.length+'f'](U(n),...v),
 PI=Math.PI,cl=(x,a=0,b=1)=>Math.min(Math.max(x,a),b),mx=(a,b,x)=>a+(b-a)*x,
 ss=(a,b,x)=>(x=cl((x-a)/(b-a)),x*x*(3-2*x)),hs=x=>{x=Math.sin(x*127.1+.3)*43758.5453;return x-Math.floor(x)},
 // keyframes [x0,v0,x1,v1,...] with smooth interpolation
 kf=(k,x)=>{let i=0;while(i<k.length-2&&x>k[i+2])i+=2;return i>=k.length-2?k[i+1]:mx(k[i+1],k[i+3],ss(k[i],k[i+2],x))};
// ---- render targets ----
function tx(w,h,f,t,flt,wr){const x=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,x);gl.texImage2D(gl.TEXTURE_2D,0,f,w,h,0,gl.RGBA,t,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,flt);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,flt==gl.NEAREST?flt:gl.LINEAR);
 for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,wr);
 const b=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,b);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,x,0);return[x,b]}
let W,H,q=1,ST,HD;
function size(){const d=Math.min(devicePixelRatio||1,2);W=Math.round(Math.min(innerWidth*d,1280)*q);H=Math.max(1,Math.round(W*innerHeight/innerWidth));cv.width=W;cv.height=H;
 for(const r of[ST,HD])r&&(gl.deleteTexture(r[0]),gl.deleteFramebuffer(r[1]));
 ST=tx(W,H,gl.RGBA16F,gl.HALF_FLOAT,gl.LINEAR_MIPMAP_LINEAR,gl.CLAMP_TO_EDGE);HD=tx(W,H,gl.RGBA16F,gl.HALF_FLOAT,gl.LINEAR,gl.CLAMP_TO_EDGE)}
size();addEventListener('resize',size);
// warm up every program once so the driver compiles them before the show
gl.bindFramebuffer(gl.FRAMEBUFFER,ST[1]);gl.viewport(0,0,1,1);for(const p of[...SP.slice(0,4),PST])gl.useProgram(p),gl.drawArrays(gl.TRIANGLES,0,3);
const RS=256,RT=[0,1].map(()=>tx(RS,RS,gl.RGBA32F,gl.FLOAT,FLIN?gl.LINEAR:gl.NEAREST,gl.REPEAT));
let rdI=0,rdN=0,rdS=0;
// profile distance field (rebuilt each frame while the epithelium moves) and the cell pattern on the sphere (once)
const PFT=tx(160,320,gl.RGBA16F,gl.HALF_FLOAT,gl.LINEAR,gl.CLAMP_TO_EDGE),CTT=tx(1024,512,gl.RGBA8,gl.UNSIGNED_BYTE,gl.LINEAR,gl.REPEAT);
let ctD=0;
const pass=(r,w,h,m)=>{use(SP[4]);applyU();gl.bindFramebuffer(gl.FRAMEBUFFER,r[1]);gl.viewport(0,0,w,h);u('R',w,h);u('S',m,0,0);gl.drawArrays(gl.TRIANGLES,0,3)};
// ---- tempo map ----
const TT=SONG.T,NB=SONG.BARS,
 bar=t=>{if(t<0)return t/2;if(t>=TT[NB])return NB+(t-TT[NB])/1.846;let a=0,z=NB;while(z-a>1){const m=a+z>>1;TT[m]<=t?a=m:z=m}return a+(t-TT[a])/(TT[a+1]-TT[a])};
// ---- blastomeres: synchronous cleavage along alternating axes, then a stateless relaxation inside the zona ----
const CB=new Float32Array(128),AX=[[1,0,0],[0,0,1],[0,1,0],[1,.2,0],[0,.3,1]],DV=[36,40,44,48];
function cells(B,T){let g=1,f=1;for(const d of DV)if(B>d-1)g++,f=ss(d-1,d,B);
 let P=[[0,0,0,.95]];
 for(let l=1;l<=g;l++){const fl=l==g?f:1,Q=[];P.forEach((p,k)=>{const rd=p[3]*.794,r=mx(p[3],rd,fl),o=rd*.97*fl;
   let a=AX[l-1].map((v,j)=>v+.35*(hs(k*7+l*13+j)-.5)),n=Math.hypot(...a);a=a.map(v=>v/n);
   Q.push([p[0]+a[0]*o,p[1]+a[1]*o,p[2]+a[2]*o,r],[p[0]-a[0]*o,p[1]-a[1]*o,p[2]-a[2]*o,r])});P=Q}
 const n=P.length,cm=ss(48,51,B),ov=.86-.08*cm;
 for(let it=0;it<10;it++){for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=P[i],b=P[j];if((i^1)==j&&f<1)continue;
   let dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],d=Math.hypot(dx,dy,dz)+1e-6,m=(a[3]+b[3])*ov;
   if(d<m){const k=(m-d)/d*.25;a[0]-=dx*k;a[1]-=dy*k;a[2]-=dz*k;b[0]+=dx*k;b[1]+=dy*k;b[2]+=dz*k}}
  for(const a of P){const L=Math.hypot(a[0],a[1],a[2]),lim=1.1-a[3]*.86;if(L>lim){a[0]*=lim/L;a[1]*=lim/L;a[2]*=lim/L}}}
 P.forEach((a,i)=>{CB.set([a[0]+.006*Math.sin(T*1.3+i),a[1]+.006*Math.sin(T*1.1+i*2),a[2],a[3]*(1+.04*cm)],i*4)});
 return[n,f]}
// ---- epithelial profile: a sphere whose vegetal plate invaginates into a gut tube (archenteron) ----
const PB=new Float32Array(64);
function profile(v){const t0=PI*.7,rl=Math.sin(t0),yl=Math.cos(t0),Lg=.1+1.25*v,ra=.2+.06*(1-v),e=Math.min(1,v*4),
  G=[[rl,yl],[rl*.8,yl+.02],[ra+.08,yl+.1],[ra,yl+.22],[ra,yl+.1+Lg],[ra*.6,yl+.1+Lg+ra*.6],[0,yl+.1+Lg+ra*.8]],
  S=[0];for(let i=1;i<G.length;i++)S.push(S[i-1]+Math.hypot(G[i][0]-G[i-1][0],G[i][1]-G[i-1][1]));
 for(let k=0;k<32;k++){const m=k/31,th=m*PI;let r=Math.sin(th),y=Math.cos(th);
  if(m>.7){const w=(m-.7)/.3*S[6];let i=0;while(i<5&&S[i+1]<w)i++;const h=(w-S[i])/(S[i+1]-S[i]||1);
   r=mx(r,mx(G[i][0],G[i+1][0],h),e);y=mx(y,mx(G[i][1],G[i+1][1],h),e)}
  PB[k*2]=r;PB[k*2+1]=y}}
// ---- HUD text ----
const STG=[[0,'interphase'],[8,'prophase'],[16,'prometaphase'],[19,'metaphase'],[24,'anaphase'],[28,'telophase · cytokinesis'],[32,'cleavage'],[48,'morula · compaction'],[52,'blastula'],[60,'gastrulation'],[72,'pattern formation'],[88,'morphogenesis'],[100,'zygote']],
 // lab notebook: one observed fact per stage, typed out under the stage name
 NOTE=[[0,'nucleus intact · chromatin diffuse · two nucleoli'],[8,'chromatin condenses ~10 000-fold · centrosomes part'],[16,'nuclear envelope breaks down · microtubules search and capture'],[19,'every kinetochore attached · sisters wait on the plate'],[20,'crossed polarisers: only the ordered spindle fibres shine'],[24,'cohesin cleaved · sisters drawn to opposite poles'],[28,'an actomyosin ring contracts at the equator'],[32,'no growth between divisions · each blastomere halves in volume'],[36,'second cleavage: meridional, at right angles to the first'],[40,'third cleavage: equatorial · eight blastomeres'],[44,'sixteen · the outer cells and the inner cells begin to differ'],[48,'cells flatten against each other and seal their junctions'],[52,'a single epithelium around a fluid-filled blastocoel'],[60,'the vegetal plate buckles inward: the archenteron, a gut'],[62,'the lip of the fold (orange) organises everything that follows'],[64,'H&E · nuclei haematoxylin violet · cytoplasm eosin pink'],[72,'Turing 1952 · Gray–Scott F .035 k .065: spots that divide'],[81,'F .029 k .057: the spots stretch into stripes'],[88,'reaction, diffusion, growth · no blueprint, only rules'],[92,'the first look'],[100,'two pronuclei meet · it starts again']],
 MOD=[[0,'PHASE CONTRAST · 40× / 0.65 · PH2'],[8,'DIC · 63× / 1.40 OIL · NOMARSKI'],[20,'POLARISED LIGHT · LC-POLSCOPE · BIREFRINGENCE'],[24,'DIC · 63× / 1.40 OIL · NOMARSKI'],[32,'SEM · 5.0 kV · SE DETECTOR'],[48,'SEM · 15 kV · BSE DETECTOR'],[52,'SEM · 5.0 kV · SE DETECTOR'],[64,'BRIGHTFIELD · H&E · 7 µm SECTION'],[72,'SEM · 3.0 kV · FALSE COLOUR'],[92,'UNAIDED EYE'],[100,'PHASE CONTRAST · 40× / 0.65 · PH2']],
 CAP=[[1.5,'one cell, alone'],[16.5,'the chromosomes find the middle'],[24.1,'and are pulled apart'],[30,'a waist, a furrow, a cut'],[36.1,'each one does it again'],[44.1,'and again'],[52.2,'a hollow ball of cells'],[60.2,'the sheet folds into itself'],[72.3,'chemistry starts drawing'],[80.3,'no one draws the stripes'],[85.3,'a body, built from the inside out'],[92.2,'and the form opens its eye'],[100.5,'one']],
 at=(L,B)=>{let r=L[0];for(const x of L)if(B>=x[0])r=x;return r},
 SUP='⁰¹²³⁴⁵⁶⁷⁸⁹',sup=n=>String(n).split('').map(c=>SUP[c]).join(''),
 grp=n=>Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ');
let hud={},lk=0,V0f=0;const set=(k,v)=>{if(hud[k]!==v){hud[k]=v;$(k).innerHTML=v}},TL=$('tl'),MK=document.createElement('b');
// developmental timeline strip: a tick per stage and a moving marker
STG.forEach(([b])=>{const i=document.createElement('i');i.style.left=b/1.04+'%';TL.appendChild(i)});TL.appendChild(MK);
function cells2(B){// log2 of the cell count the counter shows
 return B<32||B>=100?0:B<52?1+DV.filter(d=>B>=d).length:B<64?6+(B-52)/2:B<72?12+(B-64)*.12:13+(B-72)*1.33}
function HUD(B,t){
 set('st',at(STG,B)[1]);{const n=at(NOTE,B);set('nt',n[1].slice(0,Math.max(0,(B-n[0])*48|0)))}{const m=at(MOD,B);set('md',(B-m[0]<.5&&on&&B>1?'▸ ':'')+m[1])}
 const k=Math.min(Math.floor(cells2(B)),45);MK.style.left=Math.min(B,104)/1.04+'%';
 if(k>lk){const x=$('x2');x.className='';void x.offsetWidth;x.className='f'}lk=k;
 set('nn',k<20?grp(2**k):'2'+sup(k));
 set('ns',k<20?(k?'2'+sup(k)+' cells':'cell'):'≈ '+grp(2**k)+' cells');
 const hp=B<32?B/32*1.5:B<72?1.5+(B-32)*.35:15.5+(B-72)*2;
 set('tc','t + '+(B<100?hp:0).toFixed(1)+' h &nbsp; time-lapse ×'+(B<32?60:B<72?600:B<92?3600:1)+' &nbsp; z '+(B<32||B>=100?(V0f*90).toFixed(1)+' µm':'—')+(B>=72&&B<83?' &nbsp; Gray–Scott 256² &middot; '+rdN+' it':''));
 const c=at(CAP,B),ca=B-c[0];set('cp',c[1]);$('cp').style.opacity=ca>=0&&ca<3.2?Math.min(ca*3,1,(3.2-ca)*2):0;
 const sem=B>=32&&B<64||B>=72&&B<92;$('db').style.opacity=sem?.9:0;
 set('sc',held>0&&B>=held&&B<held+.5?'SCANNING '+'▮'.repeat((B-held)*16|0):'FRAME '+String(Math.floor(t*25)).padStart(5,'0'));
 const sl=$('sl').style;sl.opacity=B>64&&B<71.5?1:0;sl.transform='translateX('+(1-ss(64,65,B))*-40+'px)';
 if(sem){const z=B<64?Math.round(4800/Math.hypot(...cam.o.map((v,i)=>v-cam.t[i]))):Math.round(900/Math.hypot(...cam.o.map((v,i)=>v-cam.t[i])));set('mg','×'+grp(z));}
}
// ---- cameras ----
let cam={o:[0,0,4],t:[0,0,0]};
// cleavage: a hard cut to a new angle on every division downbeat
function camE(B,K){const g=DV.filter(d=>B>=d).length,a=B<52?-.55+.055*(B-32)+[0,.8,-.6,.5,-.2][g]:mx(.55,0,ss(52,58,B)),D=(B<52?mx(3.9,3.05,ss(32,50,B))*[1,.9,1,.88,1][g]:mx(3.5,2.9,ss(56,63.5,B)))*(1-.012*K),
  y=B<52?.45+.15*Math.sin(B*.3)+[0,.5,-.2,.8,.3][g]:mx(.6,.1,ss(54,60,B));
 cam={o:[Math.sin(a)*D,y,Math.cos(a)*D],t:[0,B<52?-.05:mx(-.05,.1,ss(54,60,B)),0]}}
const EC=[.6,.3,.45],EN=[.8,.28,.55].map(v=>v/Math.hypot(.8,.28,.55));
function camF(B){const top=[.2,.6,.1];let o,t;
 // macro: hard cuts every two bars between the four seeded spots (all dividing in step)
 if(B<80){const S=[[.2,.1],[-.33,.4],[.59,-.33],[-.09,-.23]][(B-72)/2&3],y=.6*Math.sqrt(Math.max(.05,1-(S[0]/1.05)**2-(S[1]-.05)**2)),h=mx(.2,.34,ss(72,80,B)),w=.03*Math.sin(B*.4);
  o=[S[0]+w,y+h,S[1]+h*.25];t=[S[0]-w,y,S[1]]}
 else if(B<88){const x=ss(80,88,B),e=x*x;o=[mx(.2,3.9,e),mx(.94,1.7,x),mx(.18,1.9,e)];t=[mx(.2,0,x),mx(.6,-.1,x),mx(.1,-1.1,x)]}
 else{const x=ss(88,92,B),dd=B<96?mx(1.2,.62,ss(88,96,B)):mx(.62,.212,ss(96,99.8,B)),a=.25*(1-x);
  const c=EC.map((v,i)=>v+EN[i]*dd),s=[3.9,1.7,1.9];o=c.map((v,i)=>mx(s[i],v,ss(88,91.5,B))+(i==1?a*.2:0));t=EC.map((v,i)=>mx([0,-.1,-1.1][i],v,ss(88,91,B)))}
 cam={o,t}}
// ---- frame ----
let A,song,on=0,t0=performance.now(),held=-1,lastB=-9,fr=[],sc=0;
function frame(t){
 const B=bar(t),bi=Math.floor(B),bf=(B-bi)*4,kb=Math.floor(bf),Bl=(TT[Math.min(bi+1,NB)]-TT[Math.min(bi,NB-1)])||1.85,
  K=on&&bi<NB&&SONG.kon(bi,kb)?Math.exp(-(bf-kb)*Bl/4/.11):0;
 let sA=B<32?0:B<64?1:B<72?2:B<100?3:0,sB=0,xm=0;
 if(B>=63.5&&B<64.25)sA=1,sB=2,xm=ss(63.5,64.25,B);
 // ---- reaction-diffusion (only during the pattern scenes) ----
 if(B>=72&&B<100){use(RDP);
  if(!rdS){rdS=1;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT[1][0]);gl.bindFramebuffer(gl.FRAMEBUFFER,RT[0][1]);gl.viewport(0,0,RS,RS);u('P',0,0,1,0);gl.drawArrays(gl.TRIANGLES,0,3);rdI=0;rdN=0}
  const want=Math.min((t-TT[72])*620,6e4),F=mx(.035,.029,ss(81,89,B)),k=mx(.065,.057,ss(81,89,B));let n=0;
  gl.viewport(0,0,RS,RS);
  while(rdN<want&&n++<(rdN<1?400:48)){gl.bindFramebuffer(gl.FRAMEBUFFER,RT[1-rdI][1]);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT[rdI][0]);u('P',F+.0006*K,k,0,ss(81,86,B));gl.drawArrays(gl.TRIANGLES,0,3);rdI=1-rdI;rdN++}
 }else if(B<72)rdS=0;
 // ---- scene uniforms ----
 if((lastB<32&&B>=32||lastB<52&&B>=52)&&lastB>0){gl.bindFramebuffer(gl.READ_FRAMEBUFFER,ST[1]);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,HD[1]);gl.blitFramebuffer(0,0,W,H,0,0,W,H,gl.COLOR_BUFFER_BIT,gl.NEAREST);held=B<52?32:52}
 lastB=B;
 uf('R',W,H);uf('T',t);uf('B',B);uf('K',K);
 // cell under the microscope (also the end: a new cell, and the title screen)
 const cb=!on?1.5:B<32?B:2+(B-100)*1.6,beat=x=>Math.floor(x*4)/4+ss(0,.45,x*4%1)/4;
 uf('Q1',on?ss(19.6,20.4,cb)*(1-ss(23.4,24.2,cb)):0);
 uf('Q0',ss(7,9,cb),ss(5,10,cb),ss(9,16,cb),on&&B>=99.9?.02+.98*ss(100,104,B):0);
 uf('M0',ss(8.5,15,cb),ss(16.5,22,cb),ss(24,28.5,beat(cb)),ss(29,32,cb));
 uf('M1',ss(24.5,30,cb),ss(28,31.9,cb),ss(15.5,20,beat(cb)),1-ss(14.5,16.5,cb));
 // view: (cx, cy, zoom, blur)
 if(sA==2||sB==2)uf('V0',.03*Math.sin(B*.4)*ss(64,66,B),mx(.1,-.42,ss(64,71,B)),mx(1.81,.95,ss(64.2,71.5,B)),0);
 else uf('V0',.04*Math.sin(cb*.2),.02*Math.cos(cb*.15),kf([0,1.55,8,1.15,16,.95,22,.72,25,.72,31,1.3],cb)*(B>=100?1.4:1),.028*(1-ss(0,2.5,cb))+.0025*(.5+.5*Math.sin(t*.6))+.02*ss(31.3,32,cb));V0f=UN.V0[3];
 // embryo
 if(sA==1){const[n,f]=cells(B,t);uf('C',CB);UI.NC=n;uf('E0',f,ss(48,51,B),B>=52?1:0,ss(54,58.5,B));uf('E2',ss(48,48.3,B)*(1-ss(51.7,52,B)));camE(B,K)}
 profile(ss(59.5,71,B)*.82);uf('PR',PB);
 uf('E1',ss(59.5,71,B)*.82,ss(32.5,36,B),ss(60.5,70,B),B<48?1:1-ss(48,51.5,B));
 if(sA==3)camF(B);
 uf('CO',...cam.o);uf('CT',...cam.t);
 const fd=Math.hypot(...cam.o.map((v,i)=>v-cam.t[i]));
 uf('F0',ss(92,92.7,B)*(1-Math.max(0,1-Math.abs(B-95.1)*7)),ss(92,94.5,B),ss(96.3,99.6,B)-.2*ss(92,93,B)*(1-ss(94,96,B)),K);
 uf('F1',fd,sA==3?mx(.8,.05,ss(80,86,B))*(B<88?1:.3):.05,sA==3?mx(1.5,1.9,ss(80,88,B)):1.6,ss(93,95.5,B));
 for(const k of[2,3])gl.activeTexture(gl.TEXTURE0+k),gl.bindTexture(gl.TEXTURE_2D,null);
 if(!ctD){ctD=1;pass(CTT,1024,512,11)}
 if(sA==1&&B>=51.9)pass(PFT,160,320,10);
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,PFT[0]);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,CTT[0]);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT[rdI][0]);
 // draw scene A, then blend scene B over it for crossfades
 gl.bindFramebuffer(gl.FRAMEBUFFER,ST[1]);gl.viewport(0,0,W,H);
 use(SP[sA]);applyU();gl.drawArrays(gl.TRIANGLES,0,3);
 if(xm>0){gl.enable(gl.BLEND);gl.blendColor(0,0,0,xm);gl.blendFunc(gl.CONSTANT_ALPHA,gl.ONE_MINUS_CONSTANT_ALPHA);use(SP[sB]);applyU();gl.drawArrays(gl.TRIANGLES,0,3);gl.disable(gl.BLEND)}
 gl.bindTexture(gl.TEXTURE_2D,ST[0]);gl.generateMipmap(gl.TEXTURE_2D);
 // ---- post ----
 use(PST);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,HD[0]);gl.uniform1i(U('H'),1);
 gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,RT[rdI][0]);gl.uniform1i(U('D'),4);u('P3',on?ss(72.5,73.5,B)*(1-ss(82,83,B)):0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,ST[0]);gl.uniform1i(U('A'),0);
 u('R',W,H);u('T',t);
 let fl=0;for(const d of[36,40,44,48,92])fl+=.14*Math.exp(-Math.max(B-d,-9)*9)*(B>=d);
 fl+=ss(71.3,72,B)*(B<72)+(B>=72)*Math.exp(-(B-72)*5);
 const sr=held>0&&B>=held&&B<held+.5?(B-held)*2:-1,
  ep=!on?.36:B<100?mx(.36,1.6,ss(.3,6,B)):mx(1.6,.38,ss(100,102.5,B)),
  fade=!on?1:B<100?1-ss(97,99.8,B):ss(100,101,B)*(1-.7*ss(104,105.5,B));
 u('P0',ep,fade,fl,sr);
 // the picture itself divides for a beat on each cleavage downbeat: 2, 4, 8, 16, 32 tiles
 {let tn=[1,1],ta=0;[32,36,40,44,48].forEach((d,i)=>{if(B>=d&&B<d+.25){tn=[2<<(i>>1)>>0,1<<(i+1>>1)];ta=1-ss(d+.12,d+.25,B)}});u('P4',tn[0],tn[1],ta)}
 let zb=0;for(const d of[8,20,24,32,52,64,72,100])zb=Math.max(zb,1-Math.abs(B-d)/.6);u('P2',on?zb*.9:0);
 u('P1',sA==1?1:sA==3?.7*(1-ss(92,94,B)):0,sA==0||sA==2?1:.5,sA==3?.9+.5*K:sA==2?.12:sA==0?.3:.5,sA==2?1:0);
 gl.drawArrays(gl.TRIANGLES,0,3);
 if(on)HUD(B,t);
 $('en').style.opacity=on&&B>104.3?1:0;$('hd').style.opacity=on&&B<103.6?1:0;
 return B}
function go(){if(on)return;on=1;A=new AudioContext();A.resume();song=SONG.live(A,+QS.get('t')||0);document.body.classList.add('on')}
addEventListener('click',go);addEventListener('keydown',e=>{(e.key==' '||e.key=='Enter')&&go();e.key=='f'&&document.documentElement.requestFullscreen?.()});
function loop(now){requestAnimationFrame(loop);/*DBG*/if(window.__stop)return;/*END*/
 const t=on?A.currentTime-song.base:(now-t0)/1e3-9;
 frame(t);
 // adaptive resolution: hold ~45+ fps
 fr.push(now);if(fr.length>40){const dt=(now-fr.shift())/40;if(dt>24&&q>.5){q*=.85;size()}else if(dt<15&&q<1){q=Math.min(1,q/.9);size()}fr=[]}}
/*DBG*/window.__frame=(t,o)=>{on=1;window.__stop=1;A={currentTime:0};song={base:0};const B=frame(t);if(o==2)return B;const w=o>2?o:48,h=o>2?o*27/48|0:27,cr=window.__crop||[0,0,1,1],px=new Uint8Array(W*H*4);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);let s=0,mn=255,mxx=0,nanish=0;const g=[];for(let y=0;y<h;y++){let r='';for(let x=0;x<w;x++){const i=(((cr[1]+(cr[3]-cr[1])*y/h)*H|0)*W+((cr[0]+(cr[2]-cr[0])*x/w)*W|0))*4;let l=(px[i]+px[i+1]+px[i+2])/3;if(window.__rng){let a=255,z=0;for(let v=0;v<4;v++)for(let u=0;u<4;u++){const j=i+(v*W+u)*4,m=(px[j]+px[j+1]+px[j+2])/3;a=Math.min(a,m);z=Math.max(z,m)}l=(z-a)*4}s+=l;mn=Math.min(mn,l);mxx=Math.max(mxx,l);r+=' .:-=+*#%@'[Math.min(9,l/25.6|0)]}g.unshift(r)}return{B:+B.toFixed(2),mean:+(s/w/h).toFixed(1),min:mn|0,max:mxx|0,map:o?g.join('\n'):undefined,rgb:[px[(H/2*W+W/2|0)*4],px[(H/2*W+W/2|0)*4+1],px[(H/2*W+W/2|0)*4+2]]}};/*END*/
requestAnimationFrame(loop);
