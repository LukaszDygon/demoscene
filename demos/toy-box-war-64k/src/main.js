(()=>{
const $=i=>document.getElementById(i),cv=$('c'),gl=cv.getContext('webgl2',{antialias:false});
if(!gl)throw'WebGL2 needed';
const BAR=SONG.BAR,Z=[0,0,0],I4=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
// real seconds -> scene seconds: slow motion in bars 27-33, frozen from bar 42
const SEG=[[0,1],[27*BAR,.3],[33*BAR,1],[42*BAR,0]];
const W=t=>{let w=0;for(let i=0;i<SEG.length;i++){const a=SEG[i][0],e=i+1<SEG.length?SEG[i+1][0]:1e9;if(t>a)w+=(Math.min(t,e)-a)*SEG[i][1]}return w};
const at=b=>W(b*BAR),ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const R=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// column-major matrices
const mm=(a,b)=>{const o=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o};
const Tm=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],Sm=s=>[s[0],0,0,0,0,s[1],0,0,0,0,s[2],0,0,0,0,1];
const Rx=a=>[1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1];
const Ry=a=>[Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1];
const Rz=a=>[Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1];
const GR=(p,r=Z)=>mm(Tm(...p),mm(Ry(r[1]),mm(Rx(r[0]),Rz(r[2]))));
// instance store: 16 floats matrix + rgb + material (0 plastic, 1 plush, 2 cardboard, 3 carpet)
const MX=2600,IB=new Float32Array(MX*20),IS=new Float32Array(MX*20);let nb=0,ns=0;
const PUT=(k,M,c,m)=>{const A=k?IS:IB,o=(k?ns++:nb++)*20;for(let i=0;i<16;i++)A[o+i]=M[i];A[o+16]=c[0];A[o+17]=c[1];A[o+18]=c[2];A[o+19]=m};
const IN=(G,p,r,s,c,m,k)=>PUT(k,mm(mm(G,GR(p,r)),Sm(s)),c,m);
const B=(G,p,r,s,c,m=0)=>IN(G,p,r,s,c,m,0),S=(G,p,r,s,c,m=0)=>IN(G,p,r,s,c,m,1);
const GRN=[.2,.42,.1],GRN2=[.32,.58,.18],TAN=[.85,.66,.4],BRN=[.5,.3,.15],WHT=[.92,.88,.82],OLV=[.32,.36,.18],DRK=[.1,.1,.1],GOLD=[.9,.7,.2],YEL=[.95,.75,.2];
const BRK=[[.8,.08,.05],[.95,.72,.05],[.05,.27,.85],[.1,.6,.2]],SOCK=[[.95,.94,.9],[.85,.1,.1],[.1,.3,.85],[.55,.15,.7],[.95,.8,.2]];
const POP=[[.9,.1,.2],[.1,.7,.9],[.95,.8,.1],[.2,.8,.3],[.9,.4,.8],[.3,.3,.9]],TWR=[[.9,.2,.2],[.2,.5,.9],[.95,.8,.1],[.2,.7,.3],[.9,.5,.1],[.6,.2,.8]];
// explosions: [bar, position]; confetti, fluff and popcorn bursts share the event
const EV=[[16.5,[-.5,1.5,1]],[18.5,[.2,2.2,-3]],[19.5,[-1,1,-2]],[21,[0,2,0]],[22.5,[-.5,1,-2]],[24,[-1,1,-4]],[29.5,[-4,1.8,2]],[31,[-4,2,1]],[33,[-3,1,2]]];
// camera keys: [bar, eye, target, fov]
const CK=[[0,[0,3,16],[-6,0,0],40],[3,[-20,2.2,16],[-8,.8,0],38],[8,[-9,1.4,9],[2,.8,-1],36],[12,[-10,1.3,16],[8,1,-2],34],[16,[-7,2.6,-2],[0,2,-4],34],[19,[-14,1.2,-12],[-2,1,-12],36],[22,[-22,.9,-8],[-8,.5,-14],30],[27,[-2,3,13],[-4,1.4,3],30],[30,[-12,2.6,9],[-5,1.5,2],26],[33,[2,12,20],[0,0,0],38],[38,[24,2.4,14],[-4,1,0],34],[42,[26,2.2,10],[-4,1,0],34]];
function camAt(T){let i=0;while(i<CK.length-2&&T>=at(CK[i+1][0]))i++;
 const a=CK[i],b=CK[i+1],u=ss(at(a[0]),at(b[0]),T),mx=(p,q)=>p.map((v,k)=>v+(q[k]-v)*u),e=mx(a[1],b[1]);
 return{e:[e[0]+Math.sin(T*.9)*.05,e[1]+Math.sin(T*1.3)*.04,e[2]+Math.cos(T*.7)*.05],g:mx(a[2],b[2]),fov:(a[3]+(b[3]-a[3])*u)*Math.PI/180}}
function build(T){
 nb=ns=0;
 B(I4,[0,-.5,0],Z,[300,.5,300],[.5,.4,.3],3);                                     // carpet
 // lego fortress at x=0; the top course's odd bricks scatter when it falls at bar 21
 const cf=at(21);
 for(let L=0;L<3;L++)for(let k=0;k<12;k++){const id=L*12+k,dt=L==2&&k%2?Math.max(0,T-cf):0;
  let p=[(L%2)*.25,.3+L*.6,-5.5+k],r=Z;
  if(dt>0){p=[p[0]+dt*(R(id)-.5)*6,Math.max(.3,p[1]+dt*(2+R(id+1)*2)-4.9*dt*dt),p[2]+dt*(R(id+2)-.5)*6];r=[dt*R(id+3)*5,dt*4,dt*3]}
  const g=GR(p,r),c=BRK[(id*7)%4];
  B(g,Z,Z,[.25,.3,.5],c);S(g,[0,.3,0],Z,[.12,.08,.12],c)}
 // block tower at (8,-6), toppling toward the sock avalanche
 const tw=GR([7.3,0,-6],[0,0,-ss(at(13.2),at(15),T)*1.4]);
 for(let k=0;k<6;k++)B(tw,[.7,.7+k*1.4,0],Z,[.7,.7,.7],TWR[k]);
 // sock avalanche: a pile at x=14.5, socks slide to the floor from bar 13
 B(I4,[14.5,2.5,-8],Z,[3,2.5,4.5],[.6,.55,.5]);
 for(let j=0;j<60;j++){
  const u=Math.min(1,Math.max(0,(T-at(13)-R(j)*BAR*.5)/(BAR*1.2))),e=u*u*(3-2*u);
  const sx=12+R(j*3)*5,sy=5+R(j*5)*4,sz=-12+R(j*7)*8,ex=4+R(j*11)*6,ez=-8+R(j*13)*8;
  B(I4,[sx+(ex-sx)*e,sy+(.18-sy)*e+Math.sin(u*3.14)*2,sz+(ez-sz)*e],[u*R(j)*9,u*5,u*3],[.3,.12,.6],SOCK[j%5])}
 // green army, 30 men: marches in bars 9-16, dies in battle or at the last stand
 const ad=ss(at(9),at(16),T)*6;
 for(let i=0;i<30;i++){
  const dth=i%3?at(15+(i*7%17)*.5):at(29+(i%6)*.4),lie=ss(dth,dth+.3,T)*1.5708,bob=lie>0?0:Math.abs(Math.sin(T*9+i))*.06;
  const g=GR([-22+(i%6)*1.4+ad,0,-5+((i/6)|0)*2.2],[0,Math.PI/2,-lie]);
  B(g,[0,.5+bob,0],Z,[.2,.3,.14],GRN);S(g,[0,1+bob,0],Z,[.14,.14,.14],GRN2);
  S(g,[0,1.13+bob,0],Z,[.16,.09,.16],GRN);B(g,[.12,.55+bob,.25],Z,[.04,.04,.38],DRK)}
 // plush division: five fall in the battle, three hold behind the cereal box
 for(let j=0;j<8;j++){
  const hold=j>4,dth=hold?at(29.5+(j-5)*.6):at(17+j*.8),lie=ss(dth,dth+.4,T)*1.5708,up=lie>0?0:Math.abs(Math.sin(T*4+j))*.05;
  const g=GR([hold?-3.2:4.5+j*1.4,0,hold?(j-6)*1.6+.4:-4],[0,-Math.PI/2,-lie]);
  S(g,[0,1+up,0],Z,[.6,.8,.5],BRN,1);S(g,[0,2+up,0],Z,[.5,.45,.45],BRN,1);
  S(g,[.3,2.4+up,0],Z,[.15,.15,.1],BRN,1);S(g,[-.3,2.4+up,0],Z,[.15,.15,.1],BRN,1);
  S(g,[0,1.85+up,.45],Z,[.22,.16,.16],TAN,1);
  S(g,[.6,1.1+up,.1],Z,[.22,.5,.22],BRN,1);S(g,[-.6,1.1+up,.1],Z,[.22,.5,.22],BRN,1);
  S(g,[.35,.3,.3],Z,[.28,.3,.28],BRN,1);S(g,[-.35,.3,.3],Z,[.28,.3,.28],BRN,1);
  if(j==0)B(g,[0,1.2+up,.5],Z,[.14,.14,.03],GOLD)}
 // plush rabbit general at the back
 const rb=GR([6.5,0,0],[0,-Math.PI/2,0]),hop=Math.abs(Math.sin(T*3))*.1;
 S(rb,[0,1+hop,0],Z,[.6,.7,.6],WHT,1);S(rb,[0,2+hop,0],Z,[.45,.42,.42],WHT,1);
 S(rb,[.15,2.9+hop,0],Z,[.12,.45,.1],WHT,1);S(rb,[-.15,2.9+hop,0],Z,[.12,.45,.1],WHT,1);
 // toy tank on the rug at z=-14, firing at bars 19.5, 22.5 and 24
 const tx=-28+ss(at(19),at(27),T)*36,rc=[19.5,22.5,24].reduce((m,b)=>{const d=T-at(b);return d>=0&&d<.4?Math.max(m,.5*(1-d/.4)):m},0),tk=GR([tx,0,-14]);
 B(tk,[0,.9,0],Z,[2.2,.6,1.4],OLV);B(tk,[0,.4,1.4],Z,[2.3,.36,.36],DRK);B(tk,[0,.4,-1.4],Z,[2.3,.36,.36],DRK);
 B(tk,[0,1.7,0],Z,[1.2,.5,1],OLV);B(tk,[2.6-rc,1.7,0],Z,[1.4,.14,.14],DRK);
 // cereal box for the last stand, with plush holdouts behind it
 B(GR([-5,1.6,2],[0,Math.PI/2,0]),Z,Z,[1.9,1.6,.7],YEL,2);
 // explosions: 56 particles each, confetti / fluff / popcorn, ballistic from the event point
 for(let e=0;e<EV.length;e++){const d0=T-at(EV[e][0]);if(d0<0||d0>2.5)continue;const P=EV[e][1];
  for(let j=0;j<56;j++){const id=e*100+j,ty=j<24?0:j<38?1:2,an=R(id)*6.283,sp=(ty?2.2:4)+R(id+.5)*3.5,g=ty==1?.5:ty==2?6:3.5,vy=(.5+R(id+.2))*sp;
   const x=P[0]+Math.cos(an)*sp*d0*.5,y=Math.max(.06,P[1]+vy*d0-g*d0*d0*.5),z=P[2]+Math.sin(an)*sp*d0*.5;
   if(ty==0)B(I4,[x,y,z],[d0*9+id,d0*6,d0*4],[.09,.012,.06],POP[j%6]);
   else if(ty==1)S(I4,[x,y,z],Z,[.09,.09,.09],WHT,1);
   else S(I4,[x,y,z],[d0*5,0,0],[.07,.07,.07],[.98,.9,.6])}}
 // confetti shower after bar 35; it freezes with everything else
 if(T>at(35)){const d=T-at(35);for(let j=0;j<90;j++){const y=14-((d*1.5+R(j)*14)%14);B(I4,[R(j*2)*26-13,y,R(j*3)*26-13],[d*4+j,d*3,j],[.09,.012,.06],POP[j%6])}}
}
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
const link=(v,f)=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p};
const VS=`#version 300 es
layout(location=0) in vec3 P;layout(location=1) in vec3 N;
layout(location=2) in vec4 M0;layout(location=3) in vec4 M1;layout(location=4) in vec4 M2;layout(location=5) in vec4 M3;
layout(location=6) in vec4 C;
uniform mat4 VP;uniform float T;
out vec3 wp,wn,lp,co;out float mt;
void main(){mat4 M=mat4(M0,M1,M2,M3);vec3 q=P;
 if(C.w==1.)q+=N*.05*sin(P.x*9.+P.y*7.+T*.8)*sin(P.z*6.+T*.5);
 vec4 w=M*vec4(q,1.);wp=w.xyz;wn=mat3(M)*N;lp=P;co=C.rgb;mt=C.w;gl_Position=VP*w;}`;
const FS=`#version 300 es
precision highp float;
in vec3 wp,wn,lp,co;in float mt;
uniform vec3 EY;uniform float LA,FL,FX;
out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
void main(){
 vec3 N=normalize(wn),V=normalize(EY-wp),K=normalize(vec3(-.5,.9,.4)),D=normalize(vec3(1.,.3,-.2));
 vec3 c=co;
 if(mt==3.){float n=hs(floor(wp.xz*48.));c*=.7+.5*n;c*=.85+.15*sin((wp.x+wp.z)*160.);}
 if(mt==2.&&lp.y>.35&&lp.y<.6)c=vec3(.85,.1,.05);
 float ao=mix(.3,1.,smoothstep(0.,1.2,wp.y));
 float nk=dot(N,K),wr=mt==1.?max((nk+.6)/1.6,0.):max(nk,0.);
 float sp=mt==0.?pow(max(dot(N,normalize(K+V)),0.),80.)*1.2:0.;
 float rim=pow(1.-max(dot(N,V),0.),3.);
 vec3 lc=vec3(1.,.7,.4)*LA*2.4,fc=vec3(1.,.93,.82)*FL*2.2;
 vec3 L=lc*wr+fc*max(dot(N,D),0.)+vec3(.09,.07,.06)*(.6+.4*N.y);
 vec3 r=c*L*ao;
 if(mt==1.)r+=c*(rim*.5+pow(max(dot(V,-K),0.),2.)*.6)*lc*ao;
 r+=lc*sp*ao+c*FX*.6+c*rim*.12*(1.-mt);
 o=vec4(r,1.);}`;
const VP_=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
// post: tilt-shift blur grows toward top and bottom, glow, vignette, warm grade, flash, flood, grain
const FP=`#version 300 es
precision highp float;
uniform sampler2D S;uniform vec2 RS;uniform float FX,FL;
out vec4 o;
void main(){
 vec2 p=gl_FragCoord.xy/RS,q=p-.5;float dy=abs(p.y-.5)*2.;
 float k=smoothstep(.2,1.,dy),rr=k*16.*RS.y/900.;
 vec3 s=texture(S,p).rgb,b=vec3(0.);
 for(int i=0;i<16;i++){float a=float(i)*2.4,r2=sqrt((float(i)+.5)/16.);b+=texture(S,p+vec2(cos(a),sin(a))*rr*r2/RS).rgb;}
 b/=16.;
 vec3 c=mix(s,b,k);
 c+=max(b-.6,vec3(0.))*.5;
 c*=1.-.9*dot(q,q);
 c*=vec3(1.05,1.,.9);
 c+=FX*vec3(1.,.9,.7)*.5+FL*vec3(1.,.95,.85)*(.35+.65*p.x);
 c=1.-exp(-c*1.3);
 c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9,78.2)))*43758.5)-.5)*.03;
 o=vec4(c,1.);}`;
const po=link(VS,FS),pp=link(VP_,FP),U=(p,n)=>gl.getUniformLocation(p,n);
const uVP=U(po,'VP'),uT=U(po,'T'),uEY=U(po,'EY'),uLA=U(po,'LA'),uFL=U(po,'FL'),uFX=U(po,'FX');
const uS=U(pp,'S'),uRS=U(pp,'RS'),uFX2=U(pp,'FX'),uFL2=U(pp,'FL');
function geo(kind){const V=[],I=[];
 if(kind==0){for(let i=0;i<3;i++)for(const s of[-1,1]){const j=(i+1)%3,k=(i+2)%3,b=V.length/6;
   for(const[cj,ck]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const p=[0,0,0],n=[0,0,0];p[i]=n[i]=s;p[j]=cj;p[k]=ck;V.push(...p,...n)}
   I.push(b,b+1,b+2,b,b+2,b+3)}}
 else{for(let y=0;y<=10;y++)for(let x=0;x<=14;x++){const th=y/10*Math.PI,ph=x/14*2*Math.PI,p=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];V.push(...p,...p)}
   for(let y=0;y<10;y++)for(let x=0;x<14;x++){const a=y*15+x,b=a+15;I.push(a,b,a+1,a+1,b,b+1)}}
 return[new Float32Array(V),new Uint16Array(I)]}
function vao(kind){const[V,I]=geo(kind),v=gl.createVertexArray(),vb=gl.createBuffer(),ib=gl.createBuffer(),ix=gl.createBuffer();
 gl.bindVertexArray(v);
 gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,V,gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
 gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ix);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,I,gl.STATIC_DRAW);
 gl.bindBuffer(gl.ARRAY_BUFFER,ib);
 for(let k=0;k<5;k++){gl.enableVertexAttribArray(2+k);gl.vertexAttribPointer(2+k,4,gl.FLOAT,false,80,16*k);gl.vertexAttribDivisor(2+k,1)}
 gl.bindVertexArray(null);
 return{v,ib,n:I.length}}
const BOX=vao(0),SPH=vao(1),EMPTY=gl.createVertexArray();
let W_=0,H_=0,MS=null,RT=null;
function size(){const d=Math.min(devicePixelRatio||1,1.5);W_=cv.width=Math.round(innerWidth*d);H_=cv.height=Math.round(innerHeight*d);
 MS=gl.createFramebuffer();const cb=gl.createRenderbuffer(),db=gl.createRenderbuffer();
 gl.bindFramebuffer(gl.FRAMEBUFFER,MS);
 gl.bindRenderbuffer(gl.RENDERBUFFER,cb);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,4,gl.RGBA8,W_,H_);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,cb);
 gl.bindRenderbuffer(gl.RENDERBUFFER,db);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,4,gl.DEPTH_COMPONENT24,W_,H_);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,db);
 const f=gl.createFramebuffer(),t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W_,H_,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const[p,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
 gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
 RT={f,t};gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
const view=(e,g)=>{const z=unit(e.map((v,i)=>v-g[i])),x=unit(crs([0,1,0],z)),y=crs(z,x);
 return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]};
const proj=(f,a,n,F)=>{const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(F+n)/(n-F),-1,0,0,2*F*n/(n-F),0]};
const draw=(m,arr,n)=>{gl.bindVertexArray(m.v);gl.bindBuffer(gl.ARRAY_BUFFER,m.ib);gl.bufferData(gl.ARRAY_BUFFER,arr.subarray(0,n*20),gl.DYNAMIC_DRAW);gl.drawElementsInstanced(gl.TRIANGLES,m.n,gl.UNSIGNED_SHORT,0,n)};
// captions: [start bar, end bar, text], typed out
const CAP=[[0,2.9,'DAY 3. THE BOOKSHELF HAS FALLEN.'],[3,5.9,'THE PLUSH DIVISION ADVANCES AT DAWN.'],[6.5,9.4,'CARPET SECTOR 4. THE GREEN LINE HOLDS.'],[12.5,15.2,'AN AVALANCHE OF SOCKS IS UNDERWAY.'],[16.2,19,'THE BRICK FORTRESS HAS FALLEN.'],[22.2,24.9,'THE TANK ADVANCES ALONG THE RUG.'],[26.8,32.4,'LAST STAND BEHIND THE CEREAL BOX.'],[33.6,38.4,'THE PLUSH DIVISION HOLDS THE CARPET.'],[40.6,41.9,'MOM: "DINNER!"']];
const cp=$('cp'),en=$('en'),ti=$('ti');let ct='';
function caps(r){let txt='',op=0;for(const[a,b,s]of CAP)if(r>=a*BAR&&r<b*BAR){const u=r-a*BAR;txt=s.slice(0,Math.floor(u*24));op=Math.min(1,u*4,(b*BAR-r)*4)}
 if(txt!==ct){cp.textContent=txt;ct=txt}cp.style.opacity=op}
let song=null,actx=null;
function go(){if(actx)return;actx=new(window.AudioContext||window.webkitAudioContext)();actx.resume();song=SONG.live(actx,0);ti.style.opacity=0}
addEventListener('pointerdown',go);addEventListener('keydown',go);
gl.enable(gl.DEPTH_TEST);addEventListener('resize',size);size();
function frame(){
 const r=song?actx.currentTime-song.base:-1,T=W(Math.max(r,0)),c=camAt(T);
 build(T);
 let FX=0;for(const[b]of EV){const d=T-at(b);if(d>=0&&d<1.5)FX+=Math.exp(-d*6)*.4}
 const LA=ss(3*BAR,3*BAR+.2,r),FL=ss(42.5*BAR,43.5*BAR,r);
 caps(r);en.style.opacity=ss(43.8*BAR,44.8*BAR,r);
 const VP=mm(proj(c.fov,W_/H_,.05,500),view(c.e,c.g));
 gl.bindFramebuffer(gl.FRAMEBUFFER,MS);gl.viewport(0,0,W_,H_);gl.clearColor(.02,.015,.012,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.useProgram(po);gl.uniformMatrix4fv(uVP,false,VP);gl.uniform1f(uT,T);gl.uniform3fv(uEY,c.e);gl.uniform1f(uLA,LA);gl.uniform1f(uFL,FL);gl.uniform1f(uFX,FX);
 draw(BOX,IB,nb);draw(SPH,IS,ns);
 gl.bindFramebuffer(gl.READ_FRAMEBUFFER,MS);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,RT.f);gl.blitFramebuffer(0,0,W_,H_,0,0,W_,H_,gl.COLOR_BUFFER_BIT,gl.NEAREST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W_,H_);gl.useProgram(pp);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT.t);
 gl.uniform1i(uS,0);gl.uniform2f(uRS,W_,H_);gl.uniform1f(uFX2,FX);gl.uniform1f(uFL2,FL);
 gl.bindVertexArray(EMPTY);gl.drawArrays(gl.TRIANGLES,0,3);
 requestAnimationFrame(frame)}
// headless probe: camera stays out of these boxes (fortress, tower, cereal box)
window.__probe={dur:42*BAR,cam:t=>camAt(W(t)).e,boxes:[[-.3,0,-6,.6,3,6],[7.3,0,-6.7,8.7,6,-5.3],[-5.7,0,.1,-4.3,3.2,3.9]]};
requestAnimationFrame(frame);
})();
