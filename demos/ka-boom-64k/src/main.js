const cv=document.getElementById('c'),gl=cv.getContext('webgl2',{antialias:false,alpha:false});
const C=1.25,DZW=7,FOV=.6981,DM=8,NP=1600,E=6,RED=[.9,.1,.07],BEAT=SONG.BEAT,BAR=SONG.BAR,HP=Math.PI/2,PQ='SILENCECRASHRUNFASTERBOOM',WORDS=['BANG','CRUNCH','WHAM','THUD'];
const SRC={lv:__LV__,lf:__LF__,fsq:__FSQ__,bg:__BG__,post:__POST__};
const CHS='ABCDEFGHIJKLMNOPQRSTUVWXYZ!-#0123456789?.,;',CW=160,CO=8,RO=6;
const AC=document.createElement('canvas');AC.width=CO*CW;AC.height=RO*CW;
const ax=AC.getContext('2d');ax.fillStyle='#fff';ax.font='bold 180px Helvetica, Arial, "Liberation Sans", sans-serif';ax.textAlign='center';ax.textBaseline='middle';
[...CHS].forEach((ch,i)=>{const x=(i%CO)*CW,y=((i/CO)|0)*CW;ch=='#'?ax.fillRect(x,y,CW,CW):ax.fillText(ch,x+CW/2,y+CW/2+6)});
const uvOf=ch=>{const i=CHS.indexOf(ch);return[(i%CO)/CO,((i/CO)|0)/RO,1/CO,1/RO]};
const mkSh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
const prog=(v,f)=>{const p=gl.createProgram();gl.attachShader(p,mkSh(gl.VERTEX_SHADER,v));gl.attachShader(p,mkSh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw gl.getProgramInfoLog(p);return p};
const pL=prog(SRC.lv,SRC.lf),pB=prog(SRC.fsq,SRC.bg),pP=prog(SRC.fsq,SRC.post);
const un=(p,ns)=>Object.fromEntries(ns.map(n=>[n,gl.getUniformLocation(p,n)]));
const uL=un(pL,['uProj','uView','uA','uInk','uPaper','uRed']),uB=un(pB,['uRes','uHalf','uCam','uT','uGrid','uTear','uBend','uRule','uDots','uDotX','uWipe','uG2','uInk','uPaper','uRed']),uQ=un(pP,['uS','uP','uRes','uPer','uT','uFl','uMis','uHT']);
const vao=gl.createVertexArray();gl.bindVertexArray(vao);
const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,NP*(E+1)*64,gl.DYNAMIC_DRAW);
for(let a=1;a<=4;a++){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,4,gl.FLOAT,false,64,(a-1)*16);gl.vertexAttribDivisor(a,1)}
const atlas=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,atlas);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,AC);
['MIN','MAG'].forEach(f=>gl.texParameteri(gl.TEXTURE_2D,gl['TEXTURE_'+f+'_FILTER'],gl.LINEAR));
['S','T'].forEach(a=>gl.texParameteri(gl.TEXTURE_2D,gl['TEXTURE_WRAP_'+a],gl.CLAMP_TO_EDGE));
const inst=new Float32Array(NP*(E+1)*16);
let W,H,S,ST,PV;
function size(){const d=Math.min(devicePixelRatio||1,1.5);W=Math.round(innerWidth*d);H=Math.round(innerHeight*d);cv.width=W;cv.height=H;
const mk=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);['MIN','MAG'].forEach(f=>gl.texParameteri(gl.TEXTURE_2D,gl['TEXTURE_'+f+'_FILTER'],gl.NEAREST));['S','T'].forEach(a=>gl.texParameteri(gl.TEXTURE_2D,gl['TEXTURE_WRAP_'+a],gl.CLAMP_TO_EDGE));return t};
PV=mk();ST=mk();S=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,S);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,ST,0);
const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,W,H);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
size();addEventListener('resize',size);
const pool=Array.from({length:NP},()=>({m:0}));
const rnd=()=>Math.random()*2-1,rot=()=>(Math.random()*4|0)*HP;
function lt(ch,x,y,z,sz,c,o){const q=pool.find(p=>!p.m);if(!q)return null;const f=o.f||[rnd()*C,rnd()*C,0],r=o.rt||0;
Object.assign(q,{m:1,p:[x+f[0],y+f[1],z+f[2]],v:[0,0,0],r:[0,o.ry||0,r],w:[0,0,0],tp:[x,y,z],tr:[0,o.ry||0,r],s:sz,ts:sz,uv:uvOf(ch),c,k:o.k||90,kp:o.kp?1:0,bl:o.bl?1:0,ms:o.ms||1,gp:o.gp||0,e:o.e?1:0,g:o.gr?1:0,life:0,tn:o.tn||0,ti:o.ti||0,pr:0});return q}
function tx(s,cx,cy,dx,dy,o={}){const n=s.length;for(let i=0;i<n;i++){if(s[i]==' ')continue;const f=i-(n-1)/2;lt(s[i],cx+f*dx,cy+f*dy,o.z||0,o.sz||1,o.c||0,o)}}
function shatter(o,cx,cy,spd,tg){const P=[...o.p],R=[...o.r],u=o.uv,s=o.s,c=o.c;o.m=0;
for(let i=0;i<2;i++)for(let j=0;j<2;j++){const q=pool.find(p=>!p.m);if(!q)return;
const x=P[0]+(i-.5)*s/2,y=P[1]+(j-.5)*s/2,dx=x-cx,dy=y-cy,L=Math.hypot(dx,dy)||1,sp=spd*(.6+Math.random()*.8);
Object.assign(q,{m:2,p:[x,y,P[2]],v:[dx/L*sp,dy/L*sp,-Math.random()*spd*.3],r:[...R],w:[rnd()*4.5,rnd()*4.5,rnd()*4.5],s:s/2,ts:s/2,uv:[u[0]+i*u[2]/2,u[1]+j*u[3]/2,u[2]/2,u[3]/2],c,k:0,kp:0,bl:0,ms:1,gp:0,e:0,g:0,life:2.5+Math.random()*2.5,tn:0,pr:0,tg:tg||0,off:[(i-.5)*s/2,(j-.5)*s/2]})}}
const cutAll=()=>{for(const o of pool)if(o.m===1&&!o.kp)o.m=0};
const burst=(cx,cy,spd,all)=>{for(const o of pool)if(o.m===1&&!o.bl&&(all||!o.kp))shatter(o,cx,cy,spd)};
const blast=(cx,cy,spd)=>{for(const o of pool)if(o.m===2){const dx=o.p[0]-cx,dy=o.p[1]-cy,L=Math.hypot(dx,dy)||1;o.v[0]+=dx/L*spd;o.v[1]+=dy/L*spd}};
const kick=(f,vx)=>{for(const o of pool)if(o.m===1&&f(o))o.v[0]+=vx/o.ms};
function step(dt){for(const o of pool){if(!o.m)continue;
if(o.m===1){
if(o.pr){o.p[0]+=o.v[0]*dt;o.p[1]+=o.v[1]*dt;if((o.life-=dt)<=0)o.m=0;continue}
if(o.tn)continue;
if(o.g){o.v[1]-=24*dt;o.p[1]+=o.v[1]*dt;if(o.p[1]<=o.tp[1]){o.g=0;o.p[1]=o.tp[1];o.v[1]=-o.v[1]*.35}}
else for(let i=0;i<3;i++){o.v[i]+=(o.k*(o.tp[i]-o.p[i])-DM*o.v[i])*dt/o.ms;o.p[i]+=o.v[i]*dt;o.w[i]+=(o.k*(o.tr[i]-o.r[i])-DM*o.w[i])*dt;o.r[i]+=o.w[i]*dt}
o.s+=(o.ts-o.s)*Math.min(1,dt*10)}
else{const d=Math.exp(-.8*dt);for(let i=0;i<3;i++){o.v[i]*=d;o.p[i]+=o.v[i]*dt;o.w[i]*=d;o.r[i]+=o.w[i]*dt}if((o.life-=dt)<=0)o.m=0}}}
let flip=0,grid=0,tear=0,bend=0,rule=-99,ht=0,g2=0,sh=0,fReq=0,wReq=0,fAt=-9,wAt=-9,ts=1,bx=-9,lastB=-1,lastNow=0,song=null,actx=null;
const hts=[0,0,0,0,0,0,0,0];
function cue(B){
const b=B>>2,k=B&3,R=rnd,hw=s=>(s.length-1)*C/2+.6;
flip=0;grid=0;tear=0;bend=0;rule=-99;ht=0;g2=0;
if(b<4){if(B===0)tx('SILENCE',0,0,C,0,{sz:1.15});return}
if(b<8){grid=.5;tear=.1;
 if(B===16){burst(0,0,8,0);tx('CRASH',0,0,C,0,{sz:1.15,f:[0,0,-30],k:160});sh=1.5;fReq=1;return}
 cutAll();flip=B&1;sh=.35;rule=B&1?2.6:-2.6;
 if(k===0)tx('CRASH',0,0,C,0,{sz:1.15});else if(k===1)tx('CRASH',0,0,0,-C*1.02,{sz:1});else if(k===2)tx('CRASH',R()*1.2,R()*1.2,C,0,{sz:1.5,rt:rot()});else tx('CRASH',0,0,C*.9,0,{sz:1.2,rt:HP});
 return}
if(b<16){grid=.7;tear=.15;rule=B&1?-2.2:2.2;cutAll();flip=B&1;sh=.35;
 const ld=((B-32)%8-4)*C,lg=b<12?2.4*C:1.25*C;
 tx('RUN',ld,0,C,0,{sz:1.2});tx('FASTER',ld-lg,-C*1.05,C,0,{sz:1,c:1});tx('FASTER!!',ld-2*lg,C*1.05,C,0,{sz:1});return}
if(b<24){grid=.6;tear=.25;bend=.1;
 if(B===64){cutAll();tx('BOOM',0,0,C,0,{sz:1.6});sh=.6;return}
 if(B===66){burst(0,0,9,0);sh=1.5;fReq=1;return}
 if(b<20)return;
 if(B===80){blast(0,0,10);fReq=1}
 cutAll();flip=B&1;sh=.5;
 const v=(B-80)&3;
 if(v===0)tx('BOOM',R()*1.2,R()*1.2,C*1.1,0,{sz:1.4+Math.random()*.4,rt:rot()});
 else if(v===1)for(const[x,y]of[[-2.6,1.6],[2.6,1.6],[-2.6,-1.6],[2.6,-1.6]])tx('BOOM',x,y,C*.7,0,{sz:.8,rt:rot()});
 else if(v===2){tx('ABCDEFGHIJKLM',0,1.4,C*.6,0,{sz:.5});tx('NOPQRSTUVWXYZ',0,-.9,C*.6,0,{sz:.5})}
 else tx('BOOM',0,0,0,C*1.05,{sz:1.1,rt:HP});
 if(k===2){burst(0,0,6,0);fReq=1}
 return}
if(b<32){grid=.8;tear=.05;ht=b>=24?.35:0;
 if(B===96){cutAll();for(const o of pool)if(o.m===2)o.m=0;hts.fill(0)}
 const i=B-96,c=i&7,h=hts[c]++;
 lt(PQ[i%PQ.length],-3.5*C+c*C,-3.2+h*C*.95,0,1,0,{f:[0,7,0],kp:1,k:60});
 flip=B&1;sh=.12;return}
if(b<40){grid=.9;
 if(B===128){burst(0,-5,6,1);sh=1.2;fReq=1;return}
 if(B<134){tx('NONONONO',0,3.1-(B-128)*C,C,0,{sz:1,kp:1,e:1,f:[R()*6,0,0],k:70});sh=.3;return}
 if(B===144){tx('######',-9,0,0,C,{sz:1.25,c:1,kp:1,bl:1,k:200});sh=1;fReq=1;return}
 if(B<152)return;
 if(B===152)for(const o of pool)if(o.bl)o.m=0;
 cutAll();flip=B&1;sh=.6;grid=.8;tx('NO',R()*2,R(),C,0,{sz:2.2,rt:rot()});return}
if(b<48){grid=1;tear=(B-160)/32;bend=(B-160)/64;rule=R()*3;cutAll();flip=B&1;sh=.4;
 tx('KA-',R()*3,R()*2,C*1.2,0,{sz:1.1+Math.random()*.6,rt:rot(),c:k===2?1:0,e:1});return}
if(b<56){grid=.9;
 if(B%2===0){cutAll();const j=((B-192)>>1)%4,A=WORDS[j],Q=WORDS[(j+1)%4];
  tx(A,-.2-hw(A),0,C,0,{sz:1.1,gp:1,f:[-4,0,0],k:90,e:1});
  tx(Q,.2+hw(Q),0,C,0,{sz:1.1,gp:2,f:[4,0,0],c:1,k:90,e:1})}
 else{kick(o=>o.gp===1,-5);kick(o=>o.gp===2,5);sh=1.2;fReq=1}
 if(B===224)wReq=1;
 return}
if(b<64){grid=.7;tear=.1;ht=1;
 if(B===224){cutAll();hts.fill(0)}
 const i=B-224,c=i&7,h=hts[c]++;
 lt('KABOOM'[i%6],-3.5*C+c*C,-3.2+h*C*.95,0,1,0,{f:[0,7,0],gr:1,k:60,e:1});
 sh=.25;fReq=(i&3)===0?1:0;return}
if(b<72){grid=.8;g2=b>=64?.5:0;
 if(B===256){burst(0,-3,6,0);cutAll();tx('BOOM',0,0,C,0,{sz:1.9,e:1});sh=1.5;fReq=1;return}
 for(const o of pool)if(o.m===1&&o.e)o.tr[1]+=HP;
 sh=.4;fReq=k===0?1:0;return}
if(b<80){grid=.6;g2=.6;tear=.3+(B-288)/64;cutAll();flip=B&1;sh=.5;
 if(B===288){tx('KA-BOOM!',0,0,C,0,{sz:1.45,f:[0,0,-30],k:160,e:1});sh=2;fReq=1;return}
 const L=(B-288)&3;
 if(L===1){tx('KA-',0,1.5,1.7,0,{sz:2,e:1});tx('BOOM!',0,-1.2,1.7,0,{sz:2,e:1});fReq=1}
 else if(L===2)tx('KA-BOOM!',0,0,0,C*.85,{sz:1.1,rt:HP,e:1});
 else tx('KA-BOOM!',0,0,C,0,{sz:1.45,e:1});
 if(B===304){burst(0,0,7,0);fReq=1}
 return}
if(b<82){grid=1;tear=1;bend=.5;if(B===320){burst(0,0,9,0);sh=2.5;fReq=1}return}
if(b<84){grid=.4;tear=.4;if(B===328)tx('STILL',0,0,C,0,{sz:1.2});return}
if(B>=336)return chap(B);
}
function lookAt(e,t){let f=[t[0]-e[0],t[1]-e[1],t[2]-e[2]],L=Math.hypot(...f);f=f.map(x=>x/L);let r=[-f[2],0,f[0]];L=Math.hypot(...r)||1;r=r.map(x=>x/L);const u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]],d=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];return new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-d(r,e),-d(u,e),d(f,e),1])}
const persp=(f,a,n,fa)=>{const t=1/Math.tan(f/2);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0])};
function draw(p){const{view,g2,orb,tt,per,fl,mis,hh,wipe,cam,eyeZ,asp,dots,dotX}=p;
const ink=flip?[1,1,1]:[.04,.04,.04],paper=flip?[.04,.04,.04]:[1,1,1];
gl.bindFramebuffer(gl.FRAMEBUFFER,S);gl.viewport(0,0,W,H);gl.disable(gl.DEPTH_TEST);gl.useProgram(pB);
gl.uniform2f(uB.uRes,W,H);gl.uniform2f(uB.uHalf,DZW,DZW/asp);gl.uniform2f(uB.uCam,cam[0],cam[1]);gl.uniform1f(uB.uT,tt);
gl.uniform1f(uB.uGrid,grid);gl.uniform1f(uB.uTear,tear);gl.uniform1f(uB.uBend,bend);gl.uniform1f(uB.uRule,rule);gl.uniform1f(uB.uDots,dots);gl.uniform1f(uB.uDotX,dotX);gl.uniform1f(uB.uWipe,wipe);gl.uniform1f(uB.uG2,g2);
gl.uniform3fv(uB.uInk,ink);gl.uniform3fv(uB.uPaper,paper);gl.uniform3fv(uB.uRed,RED);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
gl.enable(gl.DEPTH_TEST);gl.useProgram(pL);gl.bindVertexArray(vao);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlas);
gl.uniformMatrix4fv(uL.uProj,false,persp(FOV,asp,.5,200));gl.uniformMatrix4fv(uL.uView,false,view);gl.uniform3fv(uL.uInk,ink);gl.uniform3fv(uL.uPaper,paper);gl.uniform3fv(uL.uRed,RED);
let n=0;const push=(o,l,c,sd)=>{inst.set([o.p[0],o.p[1],o.p[2],o.s,o.r[0],o.r[1],o.r[2],l,o.uv[0],o.uv[1],o.uv[2],o.uv[3],c,sd,0,0],n*16);n++};
for(const o of pool){if(!o.m)continue;push(o,0,o.c,0);if(o.e&&o.m===1)for(let i=1;i<=E;i++)push(o,i,3,i/E)}
gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,inst,0,n*16);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n);
gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.disable(gl.DEPTH_TEST);gl.useProgram(pP);
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,ST);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,PV);
gl.uniform1i(uQ.uS,0);gl.uniform1i(uQ.uP,1);gl.uniform2f(uQ.uRes,W,H);gl.uniform1f(uQ.uPer,per);gl.uniform1f(uQ.uT,tt);gl.uniform1f(uQ.uFl,fl);gl.uniform1f(uQ.uMis,mis);gl.uniform1f(uQ.uHT,hh);
gl.drawArrays(gl.TRIANGLES,0,3);gl.bindTexture(gl.TEXTURE_2D,PV);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,W,H)}
function frame(now){requestAnimationFrame(frame);
const tt=now/1000,dt=Math.min(.05,(now-(lastNow||now))/1000);lastNow=now;
const T=song?actx.currentTime-song.base:-1;let cut=0;
if(T>=0){const Bn=Math.floor(T/BEAT);while(lastB<Bn){lastB++;cue(lastB);cut=1}}
if(fReq){fAt=tt;fReq=0}if(wReq){wAt=tt;wReq=0}
ts+=((T>=18*BAR&&T<20*BAR?.03:1)-ts)*Math.min(1,dt*12);
const bulldoz=T>=36*BAR&&T<38*BAR;
if(bulldoz){bx=-9+18*(T-36*BAR)/(2*BAR);for(const o of pool)if(o.bl)o.tp[0]=bx}
step(dt*ts);
if(bulldoz)for(const o of pool)if(o.m===1&&o.kp&&!o.bl&&o.p[0]<bx&&o.p[0]>bx-1.2)shatter(o,bx-4,o.p[1],7);
chapFrame(T,tt);sh*=Math.exp(-dt*6);
const kk=sh*.3,cam=[kk*Math.sin(tt*53)+.08*Math.sin(tt*.4),kk*Math.sin(tt*41+1)];
const asp=W/H,orb=lastB>=256&&lastB<288?1.6*Math.sin(tt*.9):0,eyeZ=DZW/(Math.tan(FOV/2)*asp)+.2*Math.sin(tt*.3)-(lastB>=288&&lastB<320?(lastB-288)/32*1.5:0);
const V=CAMO?lookAt(CAMO.e,CAMO.t):lookAt([cam[0]+orb,cam[1],eyeZ],[cam[0]+orb,cam[1],0]);draw({view:V,g2,orb,tt,per:cut?0:(ts<.5?.75:.4),fl:tt-fAt<.07?1:0,mis:tt-fAt<.12?.004:0,hh:bulldoz?.6:ht,wipe:tt-wAt<.4?-6+12*(tt-wAt)/.4:-99,cam,eyeZ,asp,dots:bulldoz?.8:0,dotX:bulldoz?bx:-99})}
lt('#',0,1.1,0,4.2,1,{kp:1,f:[0,0,0]});
tx('PRESS TO',0,-1.9,C,0,{sz:1,kp:1,f:[0,0,0]});
tx('DETONATE',0,-3,C,0,{sz:1,kp:1,f:[0,0,0]});
function go(){if(actx)return;actx=new AudioContext();
actx.resume().then(()=>{for(const o of pool)if(o.m===1)shatter(o,0,-3,6);song=SONG.live(actx,0);lastB=-1})}
addEventListener('pointerdown',go);
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter')go()});
requestAnimationFrame(frame);
