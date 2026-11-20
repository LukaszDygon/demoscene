// INSERT COIN: renderer. The game runs once at load (SIM), then every frame is looked up from the audio clock.
// Everything is drawn into a 320x180 canvas with integer positions, then shown through a WebGL CRT (persistence, bloom, scanlines, curvature).
const NW=320,NH=180,GY=136,$c=document.getElementById('c'),G=document.createElement('canvas');G.width=NW;G.height=NH;
const g=G.getContext('2d');g.imageSmoothingEnabled=false;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]};
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647,ri=(a,b)=>a+(rnd()*(b-a+1)|0),pick=a=>a[ri(0,a.length-1)];
const hs=n=>{n=Math.sin(n*127.1)*43758.5;return n-Math.floor(n)};
// ---------- the game ----------
const RUN=SIM.run(68*96),FR=RUN.F,EV=RUN.E,EB=[];for(const e of EV)(EB[e.f]=EB[e.f]||[]).push(e);
const evf=(t,a)=>EV.find(e=>e.e==t&&(!a||e.a==a)),CONT=59*96,OVER=64*96,ENDC=65*96;
const SUPF=evf('sup'),BKO=evf('ko','M'),WINF=evf('win'),HHIT=EV.find(e=>e.e=='hit'&&e.b=='H'&&e.m=='dog'),BOSSLK=EV.find(e=>e.e=='lock'&&e.w==4),BSPAWN=evf('spawn','M');
// ---------- pixel font (5x5, base-32 rows) ----------
const FC="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.,:->'x/+<",FD="ehvhhuhuhufgggfuhhhuvgugvvguggfgnhfhhvhhv444v722ichisihggggvhrlhhhpljhehhheuhuggehliduhuihfge1uv4444hhhhehhha4hhlrhha4ahha444v248vejlpec444eu1egvu1e1uhhv11vgu1ueguhev1244eheheehf1e44404eh60400004000480404000e0042v24440000a4a01248g04e4048v84";
const GL={};for(let i=0;i<FC.length;i++)GL[FC[i]]=[...FD.substr(i*5,5)].map(c=>parseInt(c,32));
const TC=new Map();
// text -> cached canvas: s = pixel scale, cols = gradient rows top->bottom, o = outline colour
function txt(str,s,cols,o){const k=str+s+cols+o;let c=TC.get(k);if(c)return c;if(TC.size>400)TC.clear();
 const w=str.length*6*s+2,h=5*s+2,[cv,x]=mk(w,h);
 const put=(dx,dy,col)=>{let X=1+dx;for(const ch of str){const gl=GL[ch];if(gl)for(let r=0;r<5;r++)for(let q=0;q<5;q++)if(gl[r]>>(4-q)&1){x.fillStyle=col||cols[Math.min(cols.length-1,r*s*cols.length/(5*s)|0)];
   if(!col&&s>1)for(let yy=0;yy<s;yy++){x.fillStyle=cols[Math.min(cols.length-1,(r*s+yy)*cols.length/(5*s)|0)];x.fillRect(X+q*s,1+dy+r*s+yy,s,1)}else x.fillRect(X+q*s+(col?0:0),1+dy+r*s,s,s)}X+=6*s}};
 if(o)for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[1,-1],[-1,1],[1,2],[0,2]])put(dx,dy,o);
 put(0,0);TC.set(k,cv);return cv}
const YEL=['#fff8c0','#ffe040','#ffb020','#f86818','#e02818'],WHT=['#ffffff','#d8d8f0'],RED=['#ff9090','#ff3030','#c01020'],CYN=['#e0ffff','#60e8ff','#2090ff'],PNK=['#ffd0f0','#ff60c8','#c020a0'],GRN=['#e0ffd0','#70ff50','#20b030'];
function T(str,x,y,s,cols,o,al){const c=txt(str,s,cols,o===undefined?'#140a1a':o);if(al==1)x-=c.width>>1;else if(al==2)x-=c.width;g.drawImage(c,x|0,y|0);return c.width}
// ---------- backgrounds (pre-rendered, procedural) ----------
const R=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a|0,b|0,w|0,h|0)};
const shade=(h,k)=>{const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.min(255,v*k|0));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`};
const [SKY,sx]=mk(NW,NH);
for(let y=0;y<140;y++){const k=y/130,c=[10+k*60,6+k*14,26+k*44];for(let x=0;x<NW;x++){const d=((x+y*2)%4)/4*.06;sx.fillStyle=`rgb(${c[0]*(1+d)|0},${c[1]|0},${c[2]*(1+d)|0})`;sx.fillRect(x,y,1,1)}}
for(let i=0;i<90;i++)R(sx,rnd()<.2?'#fff':'#a8a0d8',rnd()*NW,rnd()*80,1,1);
for(let y=-14;y<=14;y++)for(let x=-14;x<=14;x++){const d=x*x+y*y;if(d<=196){const l=d>160?'#c8b8e0':(x-4)**2+(y+3)**2<20||(x+5)**2+(y-5)**2<9?'#d8d0e8':'#f4eefc';R(sx,l,262+x,34+y,1,1)}}
function skyline(w,base,hmin,hmax,col,win,wp,ant){const [c,x]=mk(w,NH);let p=0;while(p<w){const bw=ri(18,46),bh=ri(hmin,hmax),top=base-bh;R(x,col,p,top,bw,NH);
  if(rnd()<.3){R(x,col,p+bw/2-1,top-ri(6,14),2,14)}if(rnd()<.25)R(x,col,p+3,top-4,bw-6,4);
  for(let yy=top+4;yy<base+30;yy+=wp+1)for(let xx=p+3;xx<p+bw-3;xx+=3)if(rnd()<.34)R(x,pick(win),xx,yy,1,wp>3?2:1);
  if(ant)ant.push([p+bw/2,top-14]);p+=bw+ri(0,3)}return c}
const FAN=[],MAN=[];
const FAR=skyline(640,104,30,92,'#1e1638',['#5a4a70','#f0c860','#60c0e0','#3a3058'],2,FAN);
const MID=skyline(900,118,24,70,'#2e2048',['#f8d878','#ffe8a0','#5a4870','#80e0ff','#463860'],3,MAN);
// billboards on the mid layer
{const x=MID.getContext('2d');for(const [bx,t,cl] of [[80,'COLA',RED],[330,'NEO TV',CYN],[610,'JUMBO',YEL],[820,'RAMEN',PNK]]){R(x,'#140c20',bx-2,40,52,22);R(x,'#3a2a5a',bx,42,48,18);for(let i=0;i<48;i+=2)R(x,'#4a3a6a',bx+i,42,1,18);
 x.drawImage(txt(t,1,cl,'#140a1a'),bx+24-t.length*3,47);R(x,'#140c20',bx+8,62,2,14);R(x,'#140c20',bx+38,62,2,14)}}
// street layer: storefronts, sidewalk, road
const SW=1920,[ST,s2]=mk(SW,NH),NEON=[],SHUT={};
const FAC=['#7a3438','#6a4634','#38566a','#5a3a6a','#7a6a50','#4a5a48','#683050'];
const SHOPS=[['ARCADE',CYN],['NOODLES',RED],['PAWN',YEL],['LAUNDRY',CYN],['PIZZA',RED],['DINER',PNK],['RECORDS',GRN],['TATTOO',PNK],['HOT DOGS',YEL],['KARAOKE',PNK],['BAR',RED],['PHARMACY',GRN],["MACK'S GYM",RED],['VIDEO',CYN]];
function brick(x,a,b,w,h,c){R(x,c,a,b,w,h);for(let yy=b;yy<b+h;yy+=4){R(x,shade(c,.62),a,yy+3,w,1);const o=(yy/4&1)*4;for(let xx=a+o;xx<a+w;xx+=8){R(x,shade(c,.62),xx,yy,1,3);if(rnd()<.35)R(x,shade(c,rnd()<.5?1.12:.86),xx+1,yy,7,3)}}}
function windowAt(x,a,b,lit){R(x,'#1a1226',a-1,b-1,12,16);R(x,lit?'#f8d878':'#26304e',a,b,10,14);
 if(lit){R(x,'#f0b850',a,b+8,10,6);if(rnd()<.5)R(x,'#d89048',a+ri(1,5),b+5,3,9);R(x,'#fff0b0',a+1,b+1,3,2)}else{R(x,'#3a4a70',a+6,b+1,1,4);R(x,'#3a4a70',a+5,b+5,1,2);R(x,'#3a4a70',a+2,b+9,1,4)}
 R(x,'#1a1226',a+4,b,1,14);R(x,'#1a1226',a,b+6,10,1);R(x,'#9a90b0',a-2,b+14,14,2);R(x,'#4a4060',a-2,b+16,14,1)}
{let p=0,i=0;const x=s2;
 while(p<SW){const sh=SHOPS[i%SHOPS.length],gym=sh[0][0]=='M',w=gym?176:pick([128,144,160]),top=ri(10,40),col=FAC[i%FAC.length];i++;
  if(gym){const off=1280+160-w/2-p;if(off>0){R(x,'#140c22',p,60,off,70);p+=off}}
  brick(x,p,top,w,128-top,col);R(x,shade(col,1.35),p,top,w,3);R(x,'#140c1c',p,top+3,w,1);R(x,shade(col,.5),p,78,w,2);R(x,shade(col,1.25),p,77,w,1);
  R(x,shade(col,.55),p,top,2,128-top);R(x,shade(col,.55),p+w-2,top,2,128-top);
  const fe=rnd()<.35;
  for(let yy=top+10;yy<64;yy+=24)for(let xx=p+10;xx<p+w-18;xx+=24){windowAt(x,xx,yy,rnd()<.38);if(rnd()<.2){R(x,'#8a8aa0',xx,yy+18,10,5);R(x,'#5a5a70',xx,yy+22,10,1);R(x,'#3a3a4a',xx+2,yy+19,6,2)}}
  if(fe){const fx=p+w-46;for(let yy=top+24;yy<70;yy+=24){R(x,'#100a18',fx,yy,36,2);for(let k=0;k<36;k+=3)R(x,'#100a18',fx+k,yy-6,1,6);R(x,'#100a18',fx,yy-7,36,1);for(let k=0;k<22;k++)R(x,'#100a18',fx+6+k,yy+2+k,2,1)}}
  // shop front
  R(x,'#120a18',p+6,80,w-12,15);NEON.push([p+w/2,84,sh[0],sh[1],i]);
  const aw=pick([['#c02838','#f0e8e0'],['#208860','#f0e8e0'],['#2a48a8','#f8d848'],['#a02890','#f0d0f0']]);
  for(let k=0;k<w-8;k++){const c=aw[(k>>2)&1];R(x,shade(c,1.15),p+4+k,96,1,2);R(x,c,p+4+k,98,1,4);R(x,shade(c,.7),p+4+k,102,1,2+((k>>2)&1))}R(x,'#140c1c',p+4,96,w-8,1);
  if(gym){R(x,'#06040a',p+w/2-30,104,60,24);SHUT.x=p+w/2-28;SHUT.w=56;R(x,'#3a3448',p+w/2-32,103,64,2)}
  else{const gx=p+10,gw=w-40;R(x,'#140c1c',gx-1,105,gw+2,22);for(let yy=0;yy<20;yy++)R(x,`rgb(${40+yy*4},${30+yy*3},${50+yy})`,gx,106+yy,gw,1);
   for(let k=0;k<5;k++){const ix=gx+4+rnd()*(gw-14)|0;R(x,pick(['#e8c060','#c05070','#60a0c0','#a0d060']),ix,116+ri(0,4),ri(4,9),ri(4,8))}
   for(let k=0;k<gw;k+=22){R(x,'#4a5070',gx+k+6,106,1,20);R(x,'#4a5070',gx+k+8,110,1,10)}R(x,'#140c1c',gx+gw/2,105,1,22);
   const dx=p+w-26;R(x,'#140c1c',dx-1,103,16,25);R(x,'#3a2430',dx,104,14,24);R(x,'#2a3a5a',dx+2,106,10,10);R(x,'#d8b048',dx+10,117,2,2)}
  R(x,'#1c1424',p,126,w,2);p+=w;if(rnd()<.3&&!gym){R(x,'#120a1c',p,50,18,78);for(let yy=60;yy<126;yy+=10)R(x,'#0c0612',p+2,yy,14,2);R(x,'#3a3048',p+3,108,12,18);R(x,'#2a2438',p+3,108,12,2);p+=18}}
 // ground: sidewalk with slabs and lamp pools, curb, asphalt with markings
 for(let y=128;y<150;y++){R(x,y<130?'#6c6684':'#57516e',0,y,SW,1)}
 for(let xx=0;xx<SW;xx+=24){for(let y=128;y<150;y++)R(x,'#45405a',xx-((y-128)*.4|0),y,1,1)}R(x,'#4a4560',0,139,SW,1);
 for(let k=0;k<SW;k+=200){for(let y=130;y<150;y++)for(let xx=-40;xx<40;xx++)if((xx/40)**2+((y-140)/9)**2<1&&(xx+y)%2==0)R(x,'#7a7088',k+100+xx,y,1,1)}
 for(let k=0;k<420;k++)R(x,pick(['#4a4460','#625c7a','#3c3650']),rnd()*SW,ri(130,149),1,1);
 R(x,'#9a94b0',0,150,SW,1);R(x,'#77718e',0,151,SW,1);R(x,'#2a2438',0,152,SW,2);
 for(let y=154;y<NH;y++)R(x,y<157?'#1a1626':'#25213a',0,y,SW,1);
 for(let k=0;k<1600;k++)R(x,pick(['#2e2a44','#1c1830','#34304a']),rnd()*SW,ri(156,179),1,1);
 for(let xx=0;xx<SW;xx+=32){R(x,'#a08a40',xx,168,16,1);R(x,'#7a6a34',xx,169,16,1)}
 for(let k=60;k<SW;k+=330){for(let y=-2;y<=2;y++)R(x,'#1a1622',k-9+Math.abs(y),160+y,18-Math.abs(y)*2,1);R(x,'#3a3450',k-7,159,14,1)}
 // street furniture at the back of the sidewalk
 for(let k=30;k<SW;k+=ri(70,130)){const t=ri(0,3);
  if(t==0){R(x,'#140c1c',k-1,117,9,12);R(x,'#c82c38',k,118,7,10);R(x,'#f05060',k+1,118,2,9);R(x,'#140c1c',k-2,120,11,2);R(x,'#c82c38',k-1,120,9,1)}
  else if(t==1){R(x,'#140c1c',k-1,113,12,16);R(x,'#5a6070',k,114,10,14);R(x,'#7a8090',k+1,114,2,14);R(x,'#3a3e4a',k,118,10,1);R(x,'#3a3e4a',k,123,10,1);R(x,'#6a7080',k-1,112,12,2)}
  else if(t==2){R(x,'#140c1c',k-1,112,11,17);R(x,'#2a58b0',k,113,9,15);R(x,'#4878d0',k+1,113,2,15);R(x,'#b0c0e0',k+2,115,5,3)}
  else{R(x,'#140c1c',k-1,118,28,4);R(x,'#7a4a2c',k,118,26,2);R(x,'#140c1c',k+1,122,2,7);R(x,'#140c1c',k+23,122,2,7)}}
}
// projectiles and small props, hand-pixelled from strings
const PXI=(rows,pal)=>{const [c,x]=mk(rows[0].length,rows.length);rows.forEach((r,y)=>[...r].forEach((ch,X)=>{if(ch!='.')R(x,pal[ch],X,y,1,1)}));return c};
const SHUR=[PXI(['...o...','..oao..','.oobao.','oabcbao','.oabao.','..oao..','...o...'],{o:'#140a1a',a:'#8890a8',b:'#d0d8f0',c:'#fff'}),PXI(['o.....o','.oa.ao.','.abcba.','..cbc..','.abcba.','.oa.ao.','o.....o'],{o:'#140a1a',a:'#8890a8',b:'#d0d8f0',c:'#fff'})];
const DOG=PXI(['..oooooooooo..','.obbbbbbbbbbo.','osssmssmssmsso','ossmssmssmssso','.obbbbbbbbbbo.','..oooooooooo..'],{o:'#140a1a',b:'#e8b060',s:'#c44a2c',m:'#f8e020'});
// ---------- WebGL CRT ----------
const gl=$c.getContext('webgl2',{antialias:false,alpha:false});
const VS='#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}';
function prog(fs){const p=gl.createProgram();[[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,fs]].forEach(([t,s])=>{const h=gl.createShader(t);gl.shaderSource(h,s);gl.compileShader(h);if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(h));gl.attachShader(p,h)});gl.linkProgram(p);return p}
const PP=prog("$PERSIST$"),PC=prog("$CRT$");
function tex(mip){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,NW,NH,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,mip?gl.LINEAR:gl.NEAREST);
 for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);return t}
const GT=tex(0),PT=[tex(1),tex(1)],FB=PT.map(t=>{const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return f});
let pp=0,W=1,H=1;
function size(){const d=Math.min(devicePixelRatio||1,2);W=$c.width=innerWidth*d|0;H=$c.height=innerHeight*d|0}size();addEventListener('resize',size);
function present(fl){gl.bindTexture(gl.TEXTURE_2D,GT);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,G);
 gl.bindFramebuffer(gl.FRAMEBUFFER,FB[pp]);gl.viewport(0,0,NW,NH);gl.useProgram(PP);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,GT);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,PT[1-pp]);
 gl.uniform1i(gl.getUniformLocation(PP,'C'),0);gl.uniform1i(gl.getUniformLocation(PP,'P'),1);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindTexture(gl.TEXTURE_2D,PT[pp]);gl.generateMipmap(gl.TEXTURE_2D);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.useProgram(PC);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,PT[pp]);
 const s=Math.max(1,Math.floor(Math.min(W/NW,H/NH)));gl.uniform1i(gl.getUniformLocation(PC,'S'),0);
 gl.uniform4f(gl.getUniformLocation(PC,'V'),(W-NW*s)>>1,(H-NH*s)>>1,s,fl||0);gl.uniform1f(gl.getUniformLocation(PC,'T'),performance.now()/1e3);
 gl.drawArrays(gl.TRIANGLES,0,3);pp=1-pp}
// ---------- drawing helpers ----------
const RC=new Map(),red=c=>{let r=RC.get(c);if(!r){const [v,x]=mk(c.width,c.height);x.drawImage(c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(255,40,60,.45)';x.fillRect(0,0,c.width,c.height);RC.set(c,r=v)}return r};
const SPRITE=(k,id)=>id=='P2'?'punk2':k;
function shadow(x,y,w){for(let i=-2;i<=2;i++){const ww=Math.round(w*Math.sqrt(1-(i/3)**2));g.fillRect(x-ww,y+i,ww*2,1)}}
function spark(x,y,a,big,blue){const r=(a<2?a*3+2:7-a*.5)*(big?1.5:1),c=blue?['#ffffff','#a0e0ff','#4080ff']:['#ffffff','#fff060','#ff8020'];
 if(a>7)return;for(let k=0;k<8;k++){const an=k*Math.PI/4+(big?.4:0),l=k&1?r*.6:r;for(let j=a<3?0:(l*.5|0);j<l;j++){g.fillStyle=c[j<l*.35?0:j<l*.7?1:2];g.fillRect(x+Math.round(Math.cos(an)*j),y+Math.round(Math.sin(an)*j),j<2&&a<3?2:1,1)}}
 if(a<2){g.fillStyle='#fff';g.fillRect(x-2,y-2,5,5)}}
function puff(x,y,a,n){g.fillStyle=a<8?'#b8b0c8':'#8a84a0';if(a>18)return;for(let k=0;k<n;k++){const d=a*(.8+hs(k)*.7),s=Math.max(1,4-a/5|0);g.fillRect(x+(k&1?d:-d)+hs(k*3)*4|0,y-a*.3-hs(k+9)*3|0,s,s)}}
function stars(x,y,f){for(let k=0;k<3;k++){const an=f*.12+k*2.1,px=x+Math.round(Math.cos(an)*9),py=y+Math.round(Math.sin(an)*3);g.fillStyle='#fff060';g.fillRect(px-1,py,3,1);g.fillRect(px,py-1,1,3)}}
function bar(x,y,w,h,v,tr,col,flash){g.fillStyle='#140a1a';g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle='#5a1020';g.fillRect(x,y,w,h);
 if(tr>v){g.fillStyle='#ff4040';g.fillRect(x,y,Math.round(w*tr),h)}g.fillStyle=flash?'#fff':col;g.fillRect(x,y,Math.round(w*v),h);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x,y,Math.round(w*v),1)}
const HEAD=SPR.render('hero','i0',0,20,20,10,1,1),CUT=SPR.render('hero','i0',3,96,64,48,4,1);
const pad=(n,l)=>String(n).padStart(l,'0');
// ---------- one frame of the game at frame index fi ----------
function frame(fi,tt){const F=FR[Math.min(fi,FR.length-1)],cam=F.c;let shx=0,shy=0,flash=0;
 for(let k=Math.max(0,fi-12);k<=fi;k++)for(const e of EB[k]||[]){const a=fi-k;let m=0;if(e.e=='hit')m=(e.s||4)/3.2*(1-a/10);if(e.e=='quake'||e.e=='crash')m=5*(1-a/12);if(e.e=='down'&&e.heavy)m=4*(1-a/12);if(m>0){shx+=Math.round(Math.sin(fi*2.7+k)*m);shy+=Math.round(Math.cos(fi*3.3+k)*m*.6)}}
 g.setTransform(1,0,0,1,0,0);g.drawImage(SKY,0,0);
 // parallax: far 0.15, mid 0.4, street 1.0, foreground poles 1.3
 for(const [L,k,y] of [[FAR,.15,0],[MID,.4,0]]){const o=Math.round(cam*k)%L.width;g.drawImage(L,-o+shx,y);g.drawImage(L,L.width-o+shx,y)}
 for(const [ax,ay] of FAN)if((fi>>5)%2){const X=Math.round(ax-cam*.15)%640;g.fillStyle='#ff3050';g.fillRect(X+shx,ay,1,1)}
 g.setTransform(1,0,0,1,shx,shy);
 g.drawImage(ST,-cam,0);
 // neon signs: flicker on their own clocks
 for(const [nx,ny,t,cl,i] of NEON){const X=nx-cam;if(X<-60||X>380)continue;const off=hs(i*7+(fi>>3))<.04||(i%5==2&&hs(fi>>2)<.15);
  T(t,X,ny,1,off?['#3a2a40']:cl,off?'#140a1a':cl[2],1)}
 // gym shutter: rises while the boss walks out
 if(SHUT.x){const X=SHUT.x-cam;if(X>-80&&X<400){let o=0;if(BOSSLK&&fi>BOSSLK.f){o=Math.min(1,(fi-BOSSLK.f-14)/56);o=Math.max(0,o)}const hgt=Math.round(23*(1-o));
   for(let y=0;y<hgt;y++){g.fillStyle=y%3==2?'#3a3e50':y%3?'#6a7088':'#8a90a8';g.fillRect(X,104+y,SHUT.w,1)}g.fillStyle='#140c1c';g.fillRect(X,104+hgt,SHUT.w,1)}}
 // bodies, depth sorted by feet y; shadows first
 const act=F.a.slice().sort((a,b)=>a.y-b.y||(a.id<b.id?-1:1));
 g.fillStyle='rgba(10,4,20,.55)';for(const a of act){if(a.bl)continue;const s=Math.max(.4,1-a.z/70),w=(SIM.KD[a.k][0]+5)*s;shadow(Math.round(a.x-cam),GY+Math.round(a.y),w)}
 const sup=SUPF&&fi>=SUPF.f&&fi<SUPF.f+130?fi-SUPF.f:-1;
 for(const a of act){if(a.bl)continue;const c=SPR.get(SPRITE(a.k,a.id),a.p),X=Math.round(a.x-cam),Y=Math.round(GY+a.y-a.z)-c.height+2;
  let img=a.fl?SPR.white(c):a.low&&(fi>>3)%2?red(c):c;
  g.save();g.translate(X,Y);if(a.f<0){g.scale(-1,1)}
  if(a.id=='H'&&sup>=0&&sup<60&&(fi&2)){g.globalAlpha=.7;const w=SPR.white(c);for(const [dx,dy] of [[-1,0],[1,0],[0,-1]])g.drawImage(w,-(c.width>>1)+dx,dy);g.globalAlpha=1}
  g.drawImage(img,-(c.width>>1),0);
  g.restore();
  if(a.dz)stars(X,Y+(a.k=='boss'?20:8),fi)}
 for(const p of F.p){const X=Math.round(p.x-cam),Y=Math.round(GY+p.y-p.z);if(p.k=='shur')g.drawImage(SHUR[(p.t>>2)&1],X-3,Y-3);else{g.save();g.translate(X,Y);if(p.f<0)g.scale(-1,1);g.drawImage(DOG,-7,-3);g.restore()}}
 // effects from recent events
 for(let k=Math.max(0,fi-24);k<=fi;k++)for(const e of EB[k]||[]){const a=fi-k,X=Math.round((e.x||0)-cam),Y=Math.round(GY+(e.y||0)-(e.z||0));
  if(e.e=='hit')spark(X,Y,a,e.s>7||e.m=='sup');if(e.e=='block')spark(X,Y,a,0,1);
  if(e.e=='down'||e.e=='land'||e.e=='quake'){const b=F.a.find(q=>q.id==e.a)||{x:0,y:0};puff(Math.round(b.x-cam),GY+Math.round(b.y),a,e.e=='quake'?10:6);if(e.e=='quake'&&a<14){g.strokeStyle='rgba(255,240,200,'+(1-a/14)+')';g.beginPath();g.ellipse(Math.round(b.x-cam),GY+Math.round(b.y),a*5,a*1.4,0,0,7);g.stroke()}}
  if(e.e=='ko'&&e.a!='M'&&e.a!='H'&&a<24){const b=F.a.find(q=>q.id==e.a);if(b)T('+1000',Math.round(b.x-cam),Math.round(GY+b.y-56-a),1,YEL,undefined,1)}}
 // super move: cut-in, then a beam that floods the screen
 g.setTransform(1,0,0,1,0,0);
 if(sup>=0){const h=F.a.find(q=>q.id=='H'),m=F.a.find(q=>q.id=='M');
  if(sup<48){g.fillStyle='rgba(6,0,20,'+Math.min(.7,sup/10)+')';g.fillRect(0,0,NW,NH);
   const sl=Math.min(1,sup/8),y0=62;g.fillStyle='#ffe040';g.fillRect(0,y0-2,NW,1);g.fillRect(0,y0+53,NW,1);g.fillStyle='#200840';g.fillRect(0,y0,NW,52);
   for(let k=0;k<24;k++){g.fillStyle=k&1?'#ff40c0':'#40e0ff';g.fillRect(((k*53+sup*14)%380)-40,y0+2+hs(k)*48|0,30+hs(k+1)*40|0,1)}
   g.save();g.beginPath();g.rect(0,y0,NW,52);g.clip();g.drawImage(CUT,Math.round(-96+sl*120),y0-4);g.restore();
   T('NEON',Math.round(360-sl*210),y0+8,3,YEL);T('TYPHOON!',Math.round(380-sl*230),y0+28,3,YEL)}
  else if(h&&m){const k=sup-48,X=Math.round(h.x-cam)+12*h.f,Y=Math.round(GY+h.y-30),grow=Math.min(1,k/14),fill=k>18&&k<62?Math.min(1,(k-18)/8):0;
   if(fill){const cx=Math.round(m.x-cam),cy=Math.round(GY+m.y-40);for(let r=0;r<24;r++){g.fillStyle=['#ff40c0','#ffe040','#40e0ff','#ffffff'][(r+(k>>1))%4];g.beginPath();g.moveTo(cx,cy);const a0=r/24*6.283+k*.05;g.arc(cx,cy,500,a0,a0+6.283/24);g.fill()}
    g.globalAlpha=fill;g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,0,NW,NH);g.globalAlpha=1;
    const c=SPR.get('boss',m.p);g.save();g.translate(cx,Math.round(GY+m.y-m.z)-c.height+2);if(m.f<0)g.scale(-1,1);g.globalCompositeOperation='source-over';g.drawImage(c,-(c.width>>1),0);g.restore()}
   const bh=Math.round(4+grow*26*(1+.15*Math.sin(k*1.7)));for(let i=0;i<5;i++){g.fillStyle=['#ff40c0','#40e0ff','#ffe040','#fff8d0','#ffffff'][i];const hh=bh*(1-i*.18);g.fillRect(h.f>0?X:0,Math.round(Y-hh/2),h.f>0?NW-X:X,Math.round(hh))}}}
 if(BKO&&fi>=BKO.f&&fi<BKO.f+8){g.fillStyle='rgba(255,255,255,'+(1-(fi-BKO.f)/8)+')';g.fillRect(0,0,NW,NH)}
 hud(F,fi);overlays(F,fi);return flash}
function hud(F,fi){const h=F.h,ov=fi>=CONT;if(fi>=ENDC)return;
 g.drawImage(HEAD,4,2);T('KAZ',26,3,1,WHT);T(pad(h.sc,7),62,3,1,YEL);
 const lowH=h.hp<35&&h.hp>0;bar(26,11,96,5,Math.max(0,h.hp)/100,h.tr/100,lowH&&(fi>>3)%2?'#ff8020':'#ffd830');
 T('SUPER',26,19,1,CYN);const full=h.mt>=1;bar(58,20,40,2,h.mt,0,full?['#ff40c0','#40e0ff','#ffe040'][(fi>>2)%3]:'#40c0ff');if(full&&(fi>>4)%2)T('READY!',102,18,1,PNK);
 const M=F.a.find(a=>a.id=='M'),en=M&&M.st!='dead'?{n:'MEGATON MACK',hp:M.hp,m:200}:h.en;if(en){T(en.n,26,26,1,['#ffd8b0','#ff9a60']);bar(26,34,M&&en.m==200?120:64,3,Math.max(0,en.hp)/en.m,0,M&&en.m==200?'#ff4060':'#ff8a30')}
 if(h.w<5){T('TIME',160,2,1,WHT,undefined,1);T(pad(h.tm,2),160,9,2,YEL,undefined,1)}
 if((fi>>5)%2)T('2P INSERT COIN',316,3,1,WHT,undefined,2);else T('CREDIT 00',316,3,1,WHT,undefined,2);
 if(!ov&&(fi>>5)%3)T('DEMO PLAY',160,172,1,['#ffffff','#b0b0d0'],undefined,1);
 if(h.cbs){const n=h.cb,b=EV.filter(e=>e.e=='hit'&&e.a=='H'&&e.f<=fi).pop(),pop=b&&fi-b.f<4?3:2;T(n+' HITS',312,44,pop,n>=8?PNK:YEL,undefined,2);T('COMBO!',312,44+pop*5+4,1,WHT,undefined,2)}
 if(h.go&&(fi>>4)%2){T('GO',282,74,3,YEL,undefined,1);const x=274,y=96;g.fillStyle='#140a1a';for(let i=0;i<8;i++)g.fillRect(x+i-1,y-8+i-1,3,18-i*2+2);g.fillStyle='#ffe040';for(let i=0;i<7;i++)g.fillRect(x+i,y-7+i,1,15-i*2);g.fillRect(x-14,y-2,14,5)}}
function overlays(F,fi){
 // stage card, then FIGHT!
 if(fi<120){g.fillStyle='rgba(8,0,24,.55)';g.fillRect(0,64,NW,40);T('STAGE 1',160,70,3,YEL,undefined,1);T('NEON BLOCK',160,92,1,CYN,undefined,1)}
 else if(fi<190&&(fi>>2)%4)T('FIGHT!',160,72,4,RED.concat(YEL),undefined,1);
 // PERFECT! stamps on clears without damage
 for(const e of EV)if(e.e=='clear'&&e.perfect&&fi>=e.f&&fi<e.f+130){const a=fi-e.f,s=a<3?6:a<5?5:4;T('PERFECT!',160,64-(s-4)*4,s,YEL,undefined,1);if(a>10)T('BONUS 5000',160,96,1,WHT,undefined,1)}
 for(const e of EV)if(e.e=='clear'&&!e.perfect&&fi>=e.f&&fi<e.f+80)T('CLEAR!',160,70,3,CYN,undefined,1);
 // the boss wave
 if(BOSSLK&&fi>=BOSSLK.f&&fi<BOSSLK.f+150){const a=fi-BOSSLK.f;if((a>>3)%2){g.fillStyle='#c01020';g.fillRect(0,58,NW,4);g.fillRect(0,100,NW,4)}if((a>>3)%2||a>100)T('WARNING!',160,68,4,RED,undefined,1)}
 if(BSPAWN&&fi>=BSPAWN.f+40&&fi<BSPAWN.f+200){const a=fi-BSPAWN.f-40;T('MEGATON MACK',Math.max(160,400-a*12),132,2,YEL,undefined,1);if(a>20)T('RING KING OF THE NEON BLOCK',160,148,1,WHT,undefined,1)}
 if(BKO&&fi>=BKO.f&&fi<(HHIT?HHIT.f:1e9)){const a=fi-BKO.f;if(a<90){const s=a<3?8:a<6?6:5;T('K.O.',160,64-(s-5)*4,s,RED.concat(YEL),undefined,1)}else if(WINF&&(a>>3)%3)T('STAGE CLEAR!',160,70,3,YEL,undefined,1)}
 // continue?
 if(fi>=CONT&&fi<ENDC){const a=fi-CONT;g.fillStyle='rgba(6,0,16,'+Math.min(.72,a/40)+')';g.fillRect(0,0,NW,NH);
  if(fi<OVER){const n=9-Math.floor(a/48);T('CONTINUE?',160,40,3,CYN,undefined,1);const p=a%48;T(String(Math.max(0,n)),160,70-(p<3?6:0),p<3?10:8,YEL,undefined,1);if((fi>>4)%2)T('INSERT COIN',160,124,2,WHT,undefined,1)}
  else T('GAME OVER',160,74,4,RED,undefined,1)}
 if(fi>=ENDC){g.fillStyle='#06020e';g.fillRect(0,0,NW,NH);const a=fi-ENDC;
  for(let k=0;k<40;k++){g.fillStyle=['#2a1048','#1a2a58','#3a1040'][k%3];g.fillRect(0,(k*9+a/2)%NH|0,NW,1)}
  if(a%60<40)T('INSERT COIN',160,62,4,YEL,undefined,1);T('NEON KNUCKLES',160,102,1,CYN,undefined,1);T('AN INSERT COIN 64K INTRO',160,114,1,WHT,undefined,1);
  T('EVERY PIXEL AND NOTE MADE BY CODE',160,150,1,['#9a90c0'],undefined,1);T('CREDIT 00',160,162,1,['#9a90c0'],undefined,1)}}
// ---------- title screen (attract) ----------
const LOGO=['NEON','KNUCKLES'];
function title(t){g.setTransform(1,0,0,1,0,0);const cam=(t*12)%1280;g.drawImage(SKY,0,0);for(const [L,k] of [[FAR,.15],[MID,.4]]){const o=Math.round(cam*k)%L.width;g.drawImage(L,-o,0);g.drawImage(L,L.width-o,0)}
 g.drawImage(ST,-Math.round(cam),0);g.fillStyle='rgba(6,0,20,.45)';g.fillRect(0,0,NW,NH);
 const fi=t*60|0;T(LOGO[0],160,22,5,CYN,'#140a1a',1);T(LOGO[1],160,56,5,YEL,'#140a1a',1);
 const sh=(fi%180)*3-60;g.fillStyle='rgba(255,255,255,.55)';for(let y=56;y<84;y++)g.fillRect(sh+(84-y)/2|0,y,4,1);
 const hc=SPR.get('hero',(fi>>4)%2?'i0':'i1'),pc=SPR.get('punk','i'+((fi>>4)%2));
 g.fillStyle='rgba(10,4,20,.55)';shadow(120,166,13);shadow(200,166,13);g.drawImage(hc,80,166-hc.height+2);g.save();g.translate(200,166-pc.height+2);g.scale(-1,1);g.drawImage(pc,-40,0);g.restore();
 if((fi>>4)%2)T('PRESS START',160,96,2,WHT,undefined,1);
 T('CLICK OR PRESS ANY KEY \xb7 SOUND ON'.replace('\xb7','-'),160,112,1,['#b0a8d8'],undefined,1);
 T('HI 0050000',160,4,1,YEL,undefined,1);T('CREDIT 00',316,172,1,WHT,undefined,2);T('INSERT COIN 64K',4,172,1,['#9a90c0']);present()}
// ---------- start ----------
let A=null,song=null,t0=performance.now();
SPR.prewarm();
SONG.fx=[];for(const e of EV){const t=e.f/60;
 if(e.e=='hit')SONG.fx.push([t,e.m=='sup'?5:e.s>=8||e.m=='kick'||e.m=='spin'?1:0,e.d]);else if(e.e=='block')SONG.fx.push([t,2]);else if(e.e=='ko')SONG.fx.push([t,e.a=='H'?7:3]);
 else if(e.e=='whiff'||e.e=='dodge')SONG.fx.push([t,4]);else if(e.e=='quake'||e.e=='crash'||e.e=='down')SONG.fx.push([t,6,e.heavy||e.e!='down'?1:0]);else if(e.e=='throw')SONG.fx.push([t,4]);else if(e.e=='sup')SONG.fx.push([t,8])}
for(let k=0;k<10;k++)SONG.fx.push([(CONT+k*48)/60,9]);SONG.fx.push([ENDC/60,10]);SONG.fx.sort((a,b)=>a[0]-b[0]);
async function start(){if(A)return;A=new AudioContext();await A.resume();song=SONG.live(A,0)}
addEventListener('click',start);addEventListener('keydown',e=>{if(e.key=='f'&&A)document.documentElement.requestFullscreen?.();else start()});
function loop(){requestAnimationFrame(loop);if(!song){title((performance.now()-t0)/1e3);return}
 const t=Math.max(0,A.currentTime-song.base),fi=Math.floor(t*60);frame(fi,t);present(0)}
loop();window.__F=frame;window.__G=G;
