// KA-BOOM! visuals. Letters are instanced quads textured from a canvas-rasterized glyph atlas, driven by
// springs (cuts and kinetic arrivals) and shatter physics (quads split into 2x2 shards). The background is a
// Swiss grid that bends and tears. The post pass blends the previous frame for motion blur, and cuts reset it.
const CANVAS=document.getElementById('c');
const gl=CANVAS.getContext('webgl2',{antialias:false,alpha:false});
const C=1.25,DZW=7,FOV=40*Math.PI/180,DM=8,N=360,RED=[.9,.1,.07],BEAT=SONG.BEAT,BAR=SONG.BAR;
const SRC={lv:__LV__,lf:__LF__,fsq:__FSQ__,bg:__BG__,post:__POST__};
const CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZ!-#',CW=160,COLS=8,ROWS=4,PQ='SILENCECRASHRUNFASTERBOOM';

// ---- glyph atlas (2D canvas) ----
const AC=document.createElement('canvas');AC.width=COLS*CW;AC.height=ROWS*CW;
const ax=AC.getContext('2d');ax.fillStyle='#fff';ax.font='bold 180px Helvetica, Arial, "Liberation Sans", sans-serif';ax.textAlign='center';ax.textBaseline='middle';
[...CHARS].forEach((ch,i)=>{const x=(i%COLS)*CW,y=((i/COLS)|0)*CW;if(ch==='#')ax.fillRect(x,y,CW,CW);else ax.fillText(ch,x+CW/2,y+CW/2+6)});
const uvOf=ch=>{const i=CHARS.indexOf(ch),c=i%COLS,r=(i/COLS)|0;return[c/COLS,r/ROWS,1/COLS,1/ROWS]};

// ---- GL programs ----
const mkSh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
const prog=(v,f)=>{const p=gl.createProgram();gl.attachShader(p,mkSh(gl.VERTEX_SHADER,v));gl.attachShader(p,mkSh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw gl.getProgramInfoLog(p);return p};
const pL=prog(SRC.lv,SRC.lf),pB=prog(SRC.fsq,SRC.bg),pP=prog(SRC.fsq,SRC.post);
const un=(p,names)=>Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));
const uL=un(pL,['uProj','uEye','uA','uInk','uPaper','uRed']),uB=un(pB,['uRes','uHalf','uCam','uT','uGrid','uTear','uBend','uRule','uDots','uDotX','uInk','uPaper','uRed']),uQ=un(pP,['uS','uP','uRes','uPer','uT','uFl']);

const vao=gl.createVertexArray();gl.bindVertexArray(vao);
const qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
const ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,N*64,gl.DYNAMIC_DRAW);
for(let a=1;a<=4;a++){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,4,gl.FLOAT,false,64,(a-1)*16);gl.vertexAttribDivisor(a,1)}
const atlas=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,atlas);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,AC);
['TEXTURE_MIN_FILTER','TEXTURE_MAG_FILTER'].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,gl[p],gl.LINEAR));
['TEXTURE_WRAP_S','TEXTURE_WRAP_T'].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,gl[p],gl.CLAMP_TO_EDGE));
const inst=new Float32Array(N*16);

// ---- render targets: scene FBO (with depth) and the previous output for motion blur ----
let W,H,S,SD,ST,PV;
function size(){const d=Math.min(devicePixelRatio||1,1.5);W=Math.round(innerWidth*d);H=Math.round(innerHeight*d);CANVAS.width=W;CANVAS.height=H;
  const tx=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    ['TEXTURE_MIN_FILTER','TEXTURE_MAG_FILTER'].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,gl[p],gl.NEAREST));
    ['TEXTURE_WRAP_S','TEXTURE_WRAP_T'].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,gl[p],gl.CLAMP_TO_EDGE));return t};
  PV=tx();ST=tx();S=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,S);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,ST,0);
  SD=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,SD);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,W,H);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,SD);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
size();addEventListener('resize',size);

// ---- letter pool and physics ----
const pool=Array.from({length:N},()=>({m:0}));   // m: 0 free, 1 spring letter, 2 shard
const rnd=()=>Math.random()*2-1,rot=()=>(Math.random()*4|0)*Math.PI/2;
function letter(ch,tx,ty,tz,sz,col,o){const q=pool.find(p=>!p.m);if(!q)return null;
  const f=o.from||[rnd()*C,rnd()*C,0],rz=o.rot||0;
  Object.assign(q,{m:1,p:[tx+f[0],ty+f[1],tz+f[2]],v:[0,0,0],r:[0,0,rz],w:[0,0,0],tp:[tx,ty,tz],tr:[0,0,rz],s:sz,ts:sz,uv:uvOf(ch),c:col,k:o.k||90,keep:o.keep?1:0,blade:o.blade?1:0,life:0});
  return q}
function txt(s,cx,cy,dx,dy,o={}){const n=s.length;
  for(let i=0;i<n;i++){if(s[i]===' ')continue;const f=i-(n-1)/2;letter(s[i],cx+f*dx,cy+f*dy,o.z||0,o.sz||1,o.col||0,o)}}
function shatter(o,cx,cy,spd){const P=[...o.p],R=[...o.r],uv=o.uv,s=o.s,c=o.c;o.m=0;
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const q=pool.find(p=>!p.m);if(!q)return;
    const px=P[0]+(i-.5)*s/2,py=P[1]+(j-.5)*s/2,dx=px-cx,dy=py-cy,L=Math.hypot(dx,dy)||1,sp=spd*(.6+Math.random()*.8);
    Object.assign(q,{m:2,p:[px,py,P[2]],v:[dx/L*sp,dy/L*sp,-Math.random()*spd*.3],r:R,w:[rnd()*4.5,rnd()*4.5,rnd()*4.5],s:s/2,ts:s/2,
      uv:[uv[0]+i*uv[2]/2,uv[1]+j*uv[3]/2,uv[2]/2,uv[3]/2],c,k:0,keep:0,blade:0,life:2.5+Math.random()*2.5})}}
const cutAll=()=>{for(const o of pool)if(o.m===1&&!o.keep)o.m=0};
const burst=(cx,cy,spd,all)=>{for(const o of pool)if(o.m===1&&!o.blade&&(all||!o.keep))shatter(o,cx,cy,spd)};
const blast=(cx,cy,spd)=>{for(const o of pool)if(o.m===2){const dx=o.p[0]-cx,dy=o.p[1]-cy,L=Math.hypot(dx,dy)||1;o.v[0]+=dx/L*spd;o.v[1]+=dy/L*spd}};
function step(dt){for(const o of pool){if(!o.m)continue;
  if(o.m===1){for(let i=0;i<3;i++){o.v[i]+=(o.k*(o.tp[i]-o.p[i])-DM*o.v[i])*dt;o.p[i]+=o.v[i]*dt;o.w[i]+=(o.k*(o.tr[i]-o.r[i])-DM*o.w[i])*dt;o.r[i]+=o.w[i]*dt}
    o.s+=(o.ts-o.s)*Math.min(1,dt*10)}
  else{const d=Math.exp(-.8*dt);for(let i=0;i<3;i++){o.v[i]*=d;o.p[i]+=o.v[i]*dt;o.w[i]*=d;o.r[i]+=o.w[i]*dt}if((o.life-=dt)<=0)o.m=0}}}

// ---- Swiss state, read by the background shader ----
let flip=0,grid=0,tear=0,bend=0,rule=-99,sh=0,flashReq=0,flashAt=-9,ts=1,bx=-9,lastB=-1,lastNow=0,song=null,actx=null;
const heights=[0,0,0,0,0,0,0,0];

// ---- director: one call per beat, B = 4*bar + beat. Hard cuts land on the beat. ----
function cue(B){
const b=B>>2,k=B&3,R=rnd;
flip=0;grid=0;tear=0;bend=0;rule=-99;
// 0-3: SILENCE sits alone
if(b<4){if(B===0)txt('SILENCE',0,0,C,0,{sz:1.15});return}
// 4-7: CRASH smashes through SILENCE, then cuts on every beat
if(b<8){grid=.5;tear=.1;
  if(B===16){burst(0,0,8,0);txt('CRASH',0,0,C,0,{sz:1.15,from:[0,0,-30],k:160});sh=1.5;flashReq=1;return}
  cutAll();flip=B&1;sh=.35;rule=B&1?2.6:-2.6;
  const L=B&3;
  if(L===0)txt('CRASH',0,0,C,0,{sz:1.15});
  else if(L===1)txt('CRASH',0,0,0,-C*1.02,{sz:1});
  else if(L===2)txt('CRASH',R()*1.2,R()*1.2,C,0,{sz:1.5,rot:rot()});
  else txt('CRASH',0,0,C*.9,0,{sz:1.2,rot:Math.PI/2});
  return}
// 8-15: RUN is chased by FASTER, which is chased by FASTER!!; the chase tightens after bar 12
if(b<16){grid=.7;tear=.15;rule=B&1?-2.2:2.2;cutAll();flip=B&1;sh=.35;
  const lead=((B-32)%8-4)*C,lag=b<12?2.4*C:1.25*C;
  txt('RUN',lead,0,C,0,{sz:1.2});
  txt('FASTER',lead-lag,-C*1.05,C,0,{sz:1,col:1});
  txt('FASTER!!',lead-2*lag,C*1.05,C,0,{sz:1});
  return}
// 16-23: BOOM detonates into shrapnel; the shards hang in slow motion (bars 18-19) and the break returns on bar 20
if(b<24){grid=.6;tear=.25;bend=.1;
  if(B===64){cutAll();txt('BOOM',0,0,C,0,{sz:1.6});sh=.6;return}
  if(B===66){burst(0,0,9,0);sh=1.5;flashReq=1;return}
  if(b<20)return;
  if(B===80){blast(0,0,10);flashReq=1}
  cutAll();flip=B&1;sh=.5;
  txt('BOOM',R()*1.2,R()*1.2,C*1.1,0,{sz:1.4+Math.random()*.4,rot:rot()});
  if(k===2){burst(0,0,6,0);flashReq=1}
  return}
// 24-31: letters fall one per beat and pile up in eight columns
if(b<32){grid=.8;tear=.05;
  if(B===96){cutAll();for(const o of pool)if(o.m===2)o.m=0;heights.fill(0)}
  const i=B-96,c=i&7,h=heights[c]++;
  letter(PQ[i%PQ.length],-3.5*C+c*C,-3.2+h*C*.95,0,1,0,{from:[0,7,0],keep:1,k:60});
  flip=B&1;sh=.12;return}
// 32-39: a wall of NO builds row by row, a red blade bulldozes it (bars 36-37), then NO fragments
if(b<40){grid=.9;
  if(B===128){burst(0,-5,6,1);sh=1.2;flashReq=1;return}
  if(B<134){txt('NONONONO',0,3.1-(B-128)*C,C,0,{sz:1,keep:1,from:[R()*6,0,0],k:70});sh=.3;return}
  if(B===144){txt('######',-9,0,0,C,{sz:1.25,col:1,keep:1,blade:1,k:200});sh=1;flashReq=1;return}
  if(B<152)return;
  if(B===152)for(const o of pool)if(o.blade)o.m=0;
  cutAll();flip=B&1;sh=.6;grid=.8;
  txt('NO',R()*2,R(),C,0,{sz:2.2,rot:rot()});
  return}
// 40-47: KA- stamps on every beat while the grid bends and tears
if(b<48){grid=1;tear=(B-160)/32;bend=(B-160)/64;rule=R()*3;
  cutAll();flip=B&1;sh=.4;
  txt('KA-',R()*3,R()*2,C*1.2,0,{sz:1.1+Math.random()*.6,rot:rot(),col:k===2?1:0});
  return}
// 48-51: KA-BOOM! fills the screen and cycles through layouts
if(b<52){grid=.6;tear=.3+(B-192)/40;cutAll();flip=B&1;sh=.5;
  if(B===192){txt('KA-BOOM!',0,0,C,0,{sz:1.45,from:[0,0,-30],k:160});sh=2;flashReq=1;return}
  const L=(B-192)&3;
  if(L===1){txt('KA-',0,1.5,1.7,0,{sz:2});txt('BOOM!',0,-1.2,1.7,0,{sz:2});flashReq=1}
  else if(L===2)txt('KA-BOOM!',0,0,0,C*.85,{sz:1.1,rot:Math.PI/2});
  else txt('KA-BOOM!',0,0,C,0,{sz:1.45});
  return}
// 52-53: the word shatters
if(b<54){grid=1;tear=1;bend=.5;
  if(B===208){burst(0,0,9,0);sh=2.5;flashReq=1}
  return}
// 54+: end card, a red square on white with KA-BOOM! beneath it
if(B===216){cutAll();
  letter('#',2.4,1.1,0,4.8,1,{keep:1,from:[0,6,0],k:50});
  txt('END',2.4,1.1,C*.9,0,{sz:1.3,col:2,keep:1,from:[0,6,0],k:50});
  txt('KA-BOOM!',0,-2.6,C,0,{sz:1.1,keep:1,from:[0,-6,0],k:50});
  sh=1;flashReq=1}
}

// ---- drawing ----
const persp=(f,a,n,fa)=>{const t=1/Math.tan(f/2);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0])};
function draw(tt,per,fl,cam,eyeZ,asp,dots,dotX){
const ink=flip?[1,1,1]:[.04,.04,.04],paper=flip?[.04,.04,.04]:[1,1,1];
gl.bindFramebuffer(gl.FRAMEBUFFER,S);gl.viewport(0,0,W,H);gl.disable(gl.DEPTH_TEST);
gl.useProgram(pB);
gl.uniform2f(uB.uRes,W,H);gl.uniform2f(uB.uHalf,DZW,DZW/asp);gl.uniform2f(uB.uCam,cam[0],cam[1]);gl.uniform1f(uB.uT,tt);
gl.uniform1f(uB.uGrid,grid);gl.uniform1f(uB.uTear,tear);gl.uniform1f(uB.uBend,bend);gl.uniform1f(uB.uRule,rule);
gl.uniform1f(uB.uDots,dots);gl.uniform1f(uB.uDotX,dotX);
gl.uniform3fv(uB.uInk,ink);gl.uniform3fv(uB.uPaper,paper);gl.uniform3fv(uB.uRed,RED);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
gl.enable(gl.DEPTH_TEST);gl.useProgram(pL);gl.bindVertexArray(vao);
gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlas);
gl.uniformMatrix4fv(uL.uProj,false,persp(FOV,asp,.5,200));gl.uniform3f(uL.uEye,cam[0],cam[1],eyeZ);
gl.uniform3fv(uL.uInk,ink);gl.uniform3fv(uL.uPaper,paper);gl.uniform3fv(uL.uRed,RED);
let n=0;for(const o of pool){if(!o.m)continue;inst.set([o.p[0],o.p[1],o.p[2],o.s,o.r[0],o.r[1],o.r[2],1,o.uv[0],o.uv[1],o.uv[2],o.uv[3],o.c,0,0,0],n*16);n++}
gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferSubData(gl.ARRAY_BUFFER,0,inst,0,n*16);
gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n);
// post: blend with the previous frame, flash, grain; then keep this frame for the next one
gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.disable(gl.DEPTH_TEST);
gl.useProgram(pP);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,ST);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,PV);
gl.uniform1i(uQ.uS,0);gl.uniform1i(uQ.uP,1);gl.uniform2f(uQ.uRes,W,H);gl.uniform1f(uQ.uPer,per);gl.uniform1f(uQ.uT,tt);gl.uniform1f(uQ.uFl,fl);
gl.drawArrays(gl.TRIANGLES,0,3);
gl.bindTexture(gl.TEXTURE_2D,PV);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,W,H);
}

function frame(now){
requestAnimationFrame(frame);
const tt=now/1000,dt=Math.min(.05,(now-(lastNow||now))/1000);lastNow=now;
const T=song?actx.currentTime-song.base:-1;
let cut=0;
if(T>=0){const Bn=Math.floor(T/BEAT);while(lastB<Bn){lastB++;cue(lastB);cut=1}}
if(flashReq){flashAt=tt;flashReq=0}
// slow motion across the hang (bars 18-19)
ts+=((T>=18*BAR&&T<20*BAR?.03:1)-ts)*Math.min(1,dt*12);
const bulldoz=T>=36*BAR&&T<38*BAR;
if(bulldoz){bx=-9+18*(T-36*BAR)/(2*BAR);for(const o of pool)if(o.blade)o.tp[0]=bx}
step(dt*ts);
if(bulldoz)for(const o of pool)if(o.m===1&&o.keep&&!o.blade&&o.p[0]<bx&&o.p[0]>bx-1.2)shatter(o,bx-4,o.p[1],7);
sh*=Math.exp(-dt*6);
const kk=sh*.3,cam=[kk*Math.sin(tt*53)+.08*Math.sin(tt*.4),kk*Math.sin(tt*41+1)];
const asp=W/H,eyeZ=DZW/(Math.tan(FOV/2)*asp)+.2*Math.sin(tt*.3);
draw(tt,cut?0:(ts<.5?.75:.4),tt-flashAt<.07?1:0,cam,eyeZ,asp,bulldoz?.8:0,bulldoz?bx:-99);
}

// ---- start screen: a red square on white, PRESS TO DETONATE ----
letter('#',0,1.1,0,4.2,1,{keep:1,from:[0,0,0]});
txt('PRESS TO',0,-1.9,C,0,{sz:1,keep:1,from:[0,0,0]});
txt('DETONATE',0,-3,C,0,{sz:1,keep:1,from:[0,0,0]});

// the first press starts the audio clock; the start letters blow apart and SILENCE takes over
function go(){if(actx)return;actx=new AudioContext();
  actx.resume().then(()=>{for(const o of pool)if(o.m===1)shatter(o,0,-3,6);song=SONG.live(actx,0);lastB=-1})}
addEventListener('pointerdown',go);
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter')go()});
requestAnimationFrame(frame);
