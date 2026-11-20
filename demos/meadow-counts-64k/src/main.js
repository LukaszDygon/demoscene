(()=>{
const $=s=>document.getElementById(s),cv=$('c'),Q=new URLSearchParams(location.search),MUTE=Q.has('mute'),T0=+Q.get('t')||0;
const gl=cv.getContext('webgl2',{antialias:false,depth:false,powerPreference:'high-performance'});
const BAR=SONG.BAR,BEAT=SONG.BEAT,LEN=SONG.LEN,B=b=>b*BAR,PI=Math.PI,s=Math.sin;
const ss=(a,b,x)=>(x=Math.min(1,Math.max(0,(x-a)/(b-a))),x*x*(3-2*x));
const nrm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
// palettes: [horizon, zenith, sun]
const PAL={gold:[[1,.68,.38],[.38,.55,.58],[1,.62,.3]],fold:[[.98,.7,.46],[.3,.5,.56],[1,.6,.33]],hex:[[1,.72,.42],[.34,.52,.55],[1,.66,.34]],
 dusk:[[.95,.5,.32],[.22,.33,.42],[1,.42,.22]],tv:[[1,.62,.36],[.33,.48,.55],[1,.55,.28]],set:[[1,.55,.3],[.28,.36,.48],[1,.45,.2]]};
const CUTS=[4,12,22,32,44,56,64].map(B);
const CHAP=[[4,'one','the meadow'],[12,'two','the seed'],[22,'three','the cell'],[32,'four','the fold'],[44,'five','the poles'],[56,'six','the television'],[64,'seven','the usual time']];
// ---------- storyboard: everything is a function of song time ----------
function meadow(L){return{S:1,L,c:[s(L*.07)*.6,2.4+.15*s(L*.4),10+L*2.2],f:[s(L*.05)*.15,.04+.02*s(L*.3),1],P:[1e4,0,0,1],D:nrm([.05,.1,1]),pal:PAL.gold,mo:1,bm:L>5?2:0}}
function state(t){const b=t/BAR;let r;
 if(b<4)r={S:0,L:t,c:[0,0,0],f:[0,0,1],P:[(t/(BEAT*2))%1,1-ss(B(3.5),B(3.95),t),0,0],D:[0,.1,1],pal:PAL.gold,mo:0};
 else if(b<12)r=meadow(t-B(4));
 else if(b<22)r={S:2,L:t-B(12),c:[0,0,0],f:[0,0,1],P:[0,0,0,0],D:[0,.1,1],pal:PAL.gold,mo:0};
 else if(b<32){const L=t-B(22),k=ss(B(28.5),B(32),t);
  r={S:3,L,c:[s(L*.08)*2,5.2+k*4.5,L*2.4],f:[s(L*.06)*.2,-.16-.14*k,1],P:[ss(B(26.6),B(28.8),t),0,0,0],D:nrm([.22,.1,1]),pal:PAL.hex,mo:1,bm:b<28?1:0}}
 else if(b<44){const L=t-B(32),k=ss(B(33),B(40.5),t),pu=ss(B(32.6),B(34.6),t)*.55-ss(B(36),B(38.5),t)*.4+ss(B(39),B(40.6),t)*.5-ss(B(42.6),B(43.9),t)*.3;
  r={S:1,L,c:[0,2.4,200+L*2.6],f:[s(L*.05)*.1,.04+pu,1],roll:ss(B(37.5),B(43.6),t)*PI,P:[3000*Math.pow(20/3000,k),0,0,1-ss(B(32),B(33.4),t)],
   Q:[0,b>39.2?245+L*2.6-(t-B(39.2))*.8:0,t*4.5,0],D:nrm([0,.08,1]),pal:PAL.fold,mo:1}}
 else if(b<56){const L=t-B(44);r={S:4,L,c:[.3+s(L*.1)*.3,1.7+s(L*.3)*.05,30-L*1.6],f:[s(L*.04)*.08-.03,.07,1],P:[0,0,.045+.06*ss(B(44),B(56),t),0],D:nrm([-.1,-.03,1]),pal:PAL.dusk,mo:0}}
 else if(b<64){const L=t-B(56),k=ss(B(56.2),B(63.9),t),cz=40-1.05-14*k,cy=.6+.9*k,cx=s(L*.2)*.4*k;
  r={S:1,L,c:[cx,cy,cz],f:[-.225*(1-k)-cx,.6-cy+.25*k,40-cz],P:[1e4,0,0,ss(B(57.5),B(60),t)],Q:[40,0,0,0],D:nrm([-.25,.07,1]),pal:PAL.tv,mo:k}}
 else{const L=t-B(64),k=ss(B(64.5),B(72.5),t);
  r={S:1,L,c:[0,2.6+k*55,600-L*1.4],f:[0,.03-k*.5,1],P:[1e4,ss(B(66),B(71.5),t),0,1-ss(B(64.2),B(65.6),t)],D:nrm([0,.035,1]),pal:PAL.set,mo:1-k,bm:2}}
 return r}
// camera basis from forward + roll (columns: right, up, forward)
function basis(f,roll=0){f=nrm(f);let r=nrm(cross([0,1,0],f)),u=cross(f,r);const c=Math.cos(roll),sn=Math.sin(roll);
 const r2=r.map((v,i)=>v*c+u[i]*sn),u2=u.map((v,i)=>v*c-r[i]*sn);return[...r2,...u2,...f]}
// clearance probe: each 3D scene lives at its own x offset so their geometry never overlaps
const BX=[[-1e3,-50,-1e3,1e3,1.75,2e3],[1e4-1e3,-50,-1e3,1e4+1e3,3.25,2e3],[2e4-1e3,-50,-1e3,2e4+1e3,0,2e3]];
for(let n=-3;n<20;n++){const c=n*28,k=1+Math.max(c,0)/55;BX.push([2e4-4.5-.15*k,0,c-.15*k,2e4-4.5+.15*k,9*k,c+.15*k],[2e4-4.5-1.6*k,8.2*k,c-.08*k,2e4-4.5+1.6*k,8.4*k,c+.08*k])}
BX.push([3e4-1e3,-50,-1e3,3e4+1e3,.3,2e3],[3e4-.95,0,39.45,3e4+.95,1.2,40.55]);
window.__probe={dur:LEN,boxes:BX,cam:t=>{const r=state(t),o=r.Q&&r.Q[0]?3e4:r.S==3?1e4:r.S==4?2e4:0;return r.S==1||r.S>2?[r.c[0]+o,r.c[1],r.c[2]]:[-5e4,0,0]}};
if(!gl){document.body.innerHTML='<p style="color:#eca;font:20px sans-serif;padding:2em">This film needs WebGL2.</p>';return}
// ---------- GL ----------
function prog(vs,fs){const p=gl.createProgram();for(const[ty,src]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const h=gl.createShader(ty);
  gl.shaderSource(h,src);gl.compileShader(h);if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(h));gl.attachShader(p,h)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const U={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);U[a.name]=gl.getUniformLocation(p,a.name)}p.U=U;return p}
const FSQ='#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}';
const PS=prog(FSQ,`$SCENE$`),PF=prog(FSQ,`$FILM$`),
 PC=prog(FSQ,'#version 300 es\nprecision highp float;uniform sampler2D A,B;uniform vec2 R;uniform float Fk;out vec4 o;void main(){vec2 u=gl_FragCoord.xy/R;o=vec4(mix(texture(A,u).rgb,texture(B,(u-.5)*.996+.5).rgb,Fk),1);}'),
 // drifting dandelion fluff and pollen, lit from behind by the sun
 // drifting dandelion fluff and pollen (Bm 0), bees (1), a flock arranged on a golden-angle spiral (2)
 PM=prog(`#version 300 es
uniform vec3 C,D;uniform mat3 M;uniform vec2 R;uniform float T,Mo,Bm;in vec4 a;out float v,k,fl;
void main(){vec3 bx=vec3(36,14,44),p;float n=float(gl_VertexID);fl=0.;
if(Bm>1.5){float r=sqrt(n)*1.4,th=n*2.39996+T*.11;
p=vec3(C.x-34.+T*.9,C.y+24.+sin(T*.2)*3.,C.z+130.)+vec3(r*cos(th),r*sin(th)*.5,r*sin(th)*.7)+sin(T*vec3(.7,.9,.5)+n)*.7;fl=sin(T*8.+n*1.7);}
else{p=a.xyz*bx+vec3(T*.7,sin(T*.4+a.w*9.)*.6+T*.15,T*.25+sin(T*.3+a.w*5.));if(Bm>.5)p=a.xyz*bx*.5+sin(T*vec3(5.3,7.1,4.2)+a.w*40.)*vec3(.6,.3,.6)+sin(T*.3+a.w*vec3(9,7,5))*4.;
p=C+mod(p-C,bx*(Bm>.5?.5:1.))-bx*(Bm>.5?.25:.5);}
vec3 q=transpose(M)*(p-C);v=0.;k=Bm>1.5?3.:Bm>.5?2.:step(.8,a.w);gl_PointSize=0.;gl_Position=vec4(2,2,2,1);
if(q.z>.4){float sz=R.y*(Bm>1.5?.9:Bm>.5?.012:.045*(.3+a.w))/q.z;
v=Bm>.5?.85*smoothstep(260.,60.,q.z)*min(1.,sz/1.5):Mo*(.2+1.3*pow(max(dot(normalize(p-C),D),0.),3.))*smoothstep(22.,7.,q.z)*min(1.,sz/2.);
gl_PointSize=clamp(sz,1.5,90.);gl_Position=vec4(q.x*1.6/q.z*R.y/R.x,q.y*1.6/q.z,0,1);}}`,
`#version 300 es
precision highp float;in float v,k,fl;out vec4 o;
void main(){vec2 d=gl_PointCoord*2.-1.;float r=length(d),a=atan(d.y,d.x);
if(k>2.5){float w=abs(d.y+abs(d.x)*fl*.7-.1);o=vec4(vec3(v*smoothstep(.25,.08,w)*step(abs(d.x),.9)),0);return;}
if(k>1.5){o=vec4(vec3(v*smoothstep(1.,.2,r)),0);return;}
float f=exp(-r*r*(k>.5?40.:5.))+k*.45*smoothstep(1.,.25,r)*pow(abs(cos(a*7.)),40.)*smoothstep(.0,.25,r);
o=vec4(vec3(1.,.86,.62)*f*v,0);}`);
const NP=520,pd=new Float32Array(NP*4);let sd=11;for(let i=0;i<pd.length;i++)pd[i]=(sd=sd*16807%2147483647)/2147483647;
const va=gl.createVertexArray();gl.bindVertexArray(va);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,pd,gl.STATIC_DRAW);
const al=gl.getAttribLocation(PM,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,4,gl.FLOAT,false,0,0);
const ev=gl.createVertexArray();
const HF=!!gl.getExtension('EXT_color_buffer_float');
function target(w,h,mip){const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);
 gl.texImage2D(gl.TEXTURE_2D,0,HF?gl.RGBA16F:gl.RGBA8,w,h,0,gl.RGBA,HF?gl.HALF_FLOAT:gl.UNSIGNED_BYTE,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 for(const p of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
 if(mip)gl.generateMipmap(gl.TEXTURE_2D);
 const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0);return{tx,fb,w,h}}
const ttx=gl.createTexture();
let sc=1,SW,SH,FS,FC=[];
const tcv=document.createElement('canvas'),c2=tcv.getContext('2d');let tkey='';
function size(){const k=Math.min(devicePixelRatio||1,1.5);cv.width=innerWidth*k|0;cv.height=innerHeight*k|0;
 const q=Math.min(1,Math.sqrt(480000/(cv.width*cv.height)))*sc;SW=Math.max(64,cv.width*q|0);SH=Math.max(36,cv.height*q|0);
 [FS,...FC].forEach(f=>f&&(gl.deleteTexture(f.tx),gl.deleteFramebuffer(f.fb)));FS=target(SW,SH);FC=[target(SW,SH,1),target(SW,SH,1)];
 tcv.width=1280;tcv.height=Math.round(1280*cv.height/cv.width);tkey=''}
addEventListener('resize',size);size();
// ---------- text, drawn into a canvas and burned into the film ----------
const FF='Futura,"Century Gothic","Avenir Next",Avenir,"Trebuchet MS","DejaVu Sans",Verdana,sans-serif';
function txt(str,x,y,px,o={}){c2.font=`${o.it?'italic ':''}${o.w||500} ${px}px ${FF}`;c2.textAlign=o.al||'center';c2.letterSpacing=(o.ls||0)+'px';
 c2.globalAlpha=o.a??1;c2.shadowColor='rgba(0,0,0,.85)';c2.shadowBlur=px*.35;c2.shadowOffsetY=px*.06;c2.fillStyle=o.c||'#f6e8c8';
 c2.fillText(str,x,y);c2.shadowBlur=px*.9;c2.globalAlpha=(o.a??1)*.5;c2.fillText(str,x,y)}
function text(t,started,wall,st,M){const W=tcv.width,H=tcv.height,u=H/720,ops=[];
 if(!started){const bl=(s(wall*2.2)>-.3)|0;
  ops.push(['an educational film for schools  ·  reel three',W/2,H*.36,20*u,{ls:4*u,a:.85}],['THE MEADOW COUNTS',W/2,H*.47,64*u,{ls:14*u,w:600}],
   ['fig. 1 — a field, counting',W/2,H*.53,19*u,{it:1,a:.8}]);if(bl)ops.push(['press anywhere to begin the lesson',W/2,H*.78,18*u,{ls:6*u,a:.75}])}
 else{const b=t/BAR;
  if(b<3.5){const n=8-Math.floor(t/(BEAT*2));ops.push([''+n,W/2,H/2+70*u,200*u,{w:600,c:'#1a1712',a:.9}])}
  for(const[cb,n,name]of CHAP){const a=ss(cb+.2,cb+.7,b)*(1-ss(cb+2.6,cb+3.2,b));
   if(a>0)ops.push([('part '+n).toUpperCase(),60*u,70*u,17*u,{al:'left',ls:6*u,a:+a.toFixed(1)}],[name,60*u,108*u,34*u,{al:'left',it:1,a:+a.toFixed(1)}])}
  for(const L of SONG.LINES){const lt=t-L.t;if(lt<-.05||lt>L.d+1.3)continue;
   const a=+(ss(-.05,.15,lt)*(1-ss(L.d+.6,L.d+1.3,lt))).toFixed(1),n=L.words.filter(w=>lt>=w[0]-.03).length;
   ops.push(['#cap',L.text,n,a,L.ch])}
  // educational-film diagrams
  const fa=(x,y)=>+(ss(x,x+.5,b)*(1-ss(y-.5,y,b))).toFixed(2),r2=v=>+v.toFixed(2);
  if(b>14.4&&b<19)ops.push(['#gold',fa(14.4,19),r2(ss(14.8,16,b)),r2(ss(16.9,18.3,b))]);
  if(b>24.2&&b<28.4)ops.push(['#hex',fa(24.2,28.4),r2(ss(24.4,26,b))]);
  if(b>34.2&&b<39)ops.push(['#fold',fa(34.2,39),r2(ss(34.6,37.6,b))]);
  if(b>53.4&&b<56){const n=Math.floor(ss(53.6,55.2,b)*15),pts=[];
   for(let j=0;j<n;j++){const k=1+j*28/55,d=[-4.5-st.c[0],10.4*k-st.c[1],j*28-st.c[2]],q=[0,3,6].map(i=>M[i]*d[0]+M[i+1]*d[1]+M[i+2]*d[2]);
    if(q[2]>1)pts.push([Math.round(W/2+q[0]*.8/q[2]*H),Math.round(H/2-q[1]*.8/q[2]*H),j+1])}
   ops.push(['#cnt',fa(53.4,56),pts])}
  if(b>72.27&&b<72.32)ops.push(['89',W/2,H*.6,240*u,{w:600,a:.7}]);
  if(b>73.3){const a=+ss(73.4,73.9,b).toFixed(1);
   ops.push(['end of lesson.',W/2,H*.45,46*u,{ls:6*u,a}],['please rewind the tape before returning it to the library.',W/2,H*.53,19*u,{it:1,a:a*.85}],
    ['THE MEADOW COUNTS  ·  64k  ·  2026',W/2,H*.8,14*u,{ls:6*u,a:a*.6}])}}
 const key=JSON.stringify(ops);if(key==tkey)return;tkey=key;
 c2.clearRect(0,0,W,H);
 for(const op of ops){if(op[0][0]!='#'){txt(...op);continue}
  if(op[0]!='#cap'){fig(op,W,H,u);continue}
  const[,str,n,a,ch]=op,ws=str.split(' '),px=31*u,o={a,it:ch,c:ch?'#d4ece4':'#f6e8c8'};
  c2.font=`${ch?'italic ':''}500 ${px}px ${FF}`;c2.letterSpacing='1px';const sp=c2.measureText(' ').width;let x=W/2-c2.measureText(str).width/2;
  ws.forEach((w,i)=>{const ww=c2.measureText(w).width;if(i<n)txt(w,x,H*.87,px,{...o,al:'left',ls:1});x+=ww+sp})}
 gl.bindTexture(gl.TEXTURE_2D,ttx);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,tcv);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)}
function fig(op,W,H,u){const[k,a]=op,cx=W-180*u,cy=175*u,TAU=2*PI,small={it:1,a:a*.85};
 c2.strokeStyle='#f6e8c8';c2.lineWidth=2.2*u;c2.shadowColor='rgba(0,0,0,.8)';c2.shadowBlur=6*u;c2.globalAlpha=a;c2.lineCap='round';
 const pl=(pts,cl)=>{c2.beginPath();pts.forEach((p,i)=>i?c2.lineTo(...p):c2.moveTo(...p));cl&&c2.closePath();c2.stroke()};
 if(k=='#gold'){const R=66*u,e=-PI/2,g=-137.5/180*PI*op[2];c2.beginPath();c2.arc(cx,cy,R,0,TAU);c2.stroke();
  pl([[cx+R*Math.cos(e),cy+R*Math.sin(e)],[cx,cy],[cx+R*Math.cos(e+g),cy+R*Math.sin(e+g)]]);
  c2.beginPath();c2.arc(cx,cy,R*.35,e+g,e,false);c2.stroke();
  txt((137.5*op[2]).toFixed(1)+'°',cx-R*.15,cy+R*.62,20*u,{a});txt('fig. 2 — the golden angle',cx,cy+R+34*u,16*u,small);
  if(op[3]>0){txt(Math.round(34*op[3])+'  one way',cx,cy+R+66*u,20*u,{a});txt(Math.round(55*op[3])+'  the other',cx,cy+R+94*u,20*u,{a})}}
 if(k=='#hex'){const r=26*u,n=Math.min(7,Math.floor(op[2]*7.99));
  for(let i=0;i<n;i++){const ox=i?cx+Math.cos(i*PI/3)*r*1.732:cx,oy=i?cy+Math.sin(i*PI/3)*r*1.732:cy;
   pl([0,1,2,3,4,5].map(j=>[ox+r*Math.cos(j*PI/3+PI/6),oy+r*Math.sin(j*PI/3+PI/6)]),1)}
  txt('120°',cx+r*1.25,cy+6*u,15*u,{a});txt('fig. 3 — six sides, no gaps',cx,cy+r*3.3+18*u,16*u,small)}
 if(k=='#fold'){const L=250*u,f=op[2]*TAU*.985,pts=[];
  for(let i=0;i<=48;i++){const s=(i/48-.5)*L;pts.push(f<.01?[cx+s,cy+40*u]:[cx+L/f*Math.sin(s*f/L),cy+40*u-L/f*(1-Math.cos(s*f/L))])}
  pl(pts);c2.beginPath();c2.arc(cx,cy+30*u,4*u,0,TAU);c2.stroke();
  txt('fig. 4 — a horizon, folded',cx,cy+82*u,16*u,small)}
 if(k=='#cnt')for(const[x,y,n]of op[2])txt(''+n,x,y,24*u,{a,w:600})}
// ---------- clock ----------
let actx,song,start=null,started=MUTE;
function now(){if(MUTE)return start===null?T0:T0+(performance.now()-start)/1000;return song?actx.currentTime-song.base:0}
async function go(){if(song||MUTE)return;started=true;actx=new AudioContext();await actx.resume();song=SONG.live(actx,T0)}
addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key==' '||e.key=='Enter')go()});
if(MUTE)start=performance.now();
// ---------- frame ----------
let last=performance.now(),ema=16,fr=0,pp=0;
function U3(U,n,v){gl.uniform3fv(U[n],v)}
function frame(){requestAnimationFrame(frame);const pn=performance.now(),W=pn/1000;
 ema=ema*.95+(pn-last)*.05;last=pn;if(++fr>90&&ema>24&&sc>.45){sc*=.85;size();ema=18;fr=0}
 const t=started?Math.min(now(),LEN):0,st=started?state(t):meadow(W*.6%60);
 let dc=1e9;for(const c of CUTS)if(t>=c)dc=t-c;
 const Fk=started?.14+.78*Math.exp(-dc*1.3):.3,b=t/BAR;
 const Lk=started?.1+.85*Math.exp(-dc*.9)+.3*Math.max(0,s(t*.23)*s(t*.071+1)):.35;
 let Tr=0;for(const x of[31.6,43.6,55.6,63.6])Tr+=ss(x,x+.3,b)*(1-ss(x+.6,x+1.1,b));
 const Bn=started?ss(B(72.5),B(73.6),t):0,K=started&&b>=8?SONG.kick(t):0,M=basis(st.f,st.roll);
 // scene
 gl.bindFramebuffer(gl.FRAMEBUFFER,FS.fb);gl.viewport(0,0,SW,SH);gl.disable(gl.BLEND);
 gl.useProgram(PS);let U=PS.U;gl.bindVertexArray(ev);
 gl.uniform2f(U.R,SW,SH);gl.uniform1f(U.T,started?t:W);gl.uniform1f(U.S,st.S);gl.uniform1f(U.L,st.L);gl.uniform1f(U.K,K);
 U3(U,'C',st.c);U3(U,'D',st.D);U3(U,'H0',st.pal[0]);U3(U,'H1',st.pal[1]);U3(U,'H2',st.pal[2]);gl.uniformMatrix3fv(U.M,false,M);gl.uniform4fv(U.P,st.P);gl.uniform4fv(U.Q,st.Q||[0,0,0,0]);
 gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,FC[pp^1].tx);gl.uniform1i(U.F,3);
 gl.drawArrays(gl.TRIANGLES,0,3);
 if(st.mo>0){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.useProgram(PM);U=PM.U;gl.bindVertexArray(va);
  gl.uniform2f(U.R,SW,SH);gl.uniform1f(U.T,started?t:W);gl.uniform1f(U.Mo,st.mo);U3(U,'C',st.c);U3(U,'D',st.D);gl.uniformMatrix3fv(U.M,false,M);
  gl.uniform1f(U.Bm,0);gl.drawArrays(gl.POINTS,0,NP);
  // birds and bees darken what is behind them
  if(st.bm){gl.blendFunc(gl.ZERO,gl.ONE_MINUS_SRC_COLOR);gl.uniform1f(U.Bm,st.bm);gl.drawArrays(gl.POINTS,0,st.bm>1?89:70)}gl.disable(gl.BLEND)}
 // feedback composite
 const A=FC[pp],Bk=FC[pp^1];pp^=1;
 gl.bindFramebuffer(gl.FRAMEBUFFER,A.fb);gl.useProgram(PC);U=PC.U;gl.bindVertexArray(ev);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,FS.tx);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,Bk.tx);
 gl.uniform1i(U.A,0);gl.uniform1i(U.B,1);gl.uniform2f(U.R,SW,SH);gl.uniform1f(U.Fk,Fk);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindTexture(gl.TEXTURE_2D,A.tx);gl.generateMipmap(gl.TEXTURE_2D);
 // film
 gl.activeTexture(gl.TEXTURE2);text(t,started,W,st,M);gl.bindTexture(gl.TEXTURE_2D,ttx);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.useProgram(PF);U=PF.U;
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,A.tx);gl.uniform1i(U.A,0);gl.uniform1i(U.X,2);
 gl.uniform2f(U.R,cv.width,cv.height);gl.uniform1f(U.T,started?t:W);gl.uniform1f(U.Fd,1);
 let Cu=0;for(const c of CUTS)if((t>c-7&&t<c-6.83)||(t>c-1&&t<c-.83))Cu=1;gl.uniform1f(U.Cu,Cu);let Ro=0;for(const x of[43.9,55.9])Ro+=ss(x,x+.14,b);gl.uniform1f(U.Ro,Ro%1);gl.uniform1f(U.Lk,Lk);gl.uniform1f(U.Tr,Tr);gl.uniform1f(U.Bn,Bn);
 gl.drawArrays(gl.TRIANGLES,0,3)}
frame()})();
