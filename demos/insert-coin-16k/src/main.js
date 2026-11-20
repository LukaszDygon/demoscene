const W=320,H=180,FY=150;
const cv=document.createElement('canvas');cv.width=W;cv.height=H;
const x=cv.getContext('2d'),g=document.getElementById('g'),gl=g.getContext('webgl');
const shd=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pg=gl.createProgram();
gl.attachShader(pg,shd(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 u;void main(){u=p*.5+.5;gl_Position=vec4(p,0.,1.);}'));
gl.attachShader(pg,shd(gl.FRAGMENT_SHADER,`/*POST*/`));
gl.linkProgram(pg);gl.useProgram(pg);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(pg,'p');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const uS=gl.getUniformLocation(pg,'sh');
function fit(){const k=Math.min(innerWidth/W,innerHeight/H);g.style.width=W*k+'px';g.style.height=H*k+'px';g.width=W*k*devicePixelRatio|0;g.height=H*k*devicePixelRatio|0;gl.viewport(0,0,g.width,g.height)}
addEventListener('resize',fit);fit();

const hs=n=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v)};
const R=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),w,h)};
const TX=(s,a,b,c,z,al)=>{x.font='bold '+z+'px monospace';x.textAlign=al||'left';x.fillStyle='#000';x.fillText(s,a+1,b+1);x.fillStyle=c;x.fillText(s,a,b)};
function BL(s,f,yb,p,hm,hr,cl,wc,ne){const o=s*40*f,i0=Math.floor(o/p);
 for(let i=i0;i<i0+W/p+2;i++){const bx=i*p-o,h=hm+hs(i)*hr;R(bx,yb-h,p-2,H,cl);
  for(let wy=yb-h+4,r=0;wy<yb-3;wy+=6,r++)for(let wx=bx+3,k=0;wx<bx+p-4;wx+=5,k++)if(hs(i*31+k*7+r*3)>.5)R(wx,wy,2,3,wc);
  if(ne&&hs(i+9)>.6)R(bx+2,yb-h+1,p-6,2,['#f4f','#4ff','#ff4','#f44'][hs(i+5)*4|0])}}

const LG=(c,p)=>{R(-4+p,-10,3,10,c);R(1-p,-10,3,10,c)};
const FC=()=>{R(-4,-32,8,8,'#e8b088');R(-2,-28,1,2,'#000');R(1,-28,1,2,'#000')};
const DR=[
(p,w)=>{LG('#334',p);R(-5,-24,10,14,'#222');FC();R(-2,-36,4,5,'#3e3');R(-7,-22,3,8,'#222');R(4,-22,3,8,'#222')},
(p,w)=>{LG('#246',p);R(-5,-24,10,14,'#f80');FC();x.fillStyle='#f60';x.beginPath();x.moveTo(-7,-31);x.lineTo(7,-31);x.lineTo(0,-47);x.fill();R(-3,-40,6,2,'#fff')},
(p,w)=>{LG('#111',p);R(-5,-24,10,14,'#111');R(-4,-32,8,8,'#111');R(-2,-29,2,1,'#f33');R(1,-29,2,1,'#f33');R(-5,-25,10,2,'#c22');R(-11,-24+w,7,2,'#c22')},
(p,w)=>{const b=w*.4;R(-12,-2+b,24,2,'#a63');R(-10,b,2,2,'#333');R(8,b,2,2,'#333');R(-3,-14,3,12,'#345');R(1,-14,3,12,'#345');R(-5,-24,10,11,'#e7a');R(-8,-22,3,6,'#f0c8a0');R(5,-22,3,6,'#f0c8a0');R(-4,-32,8,8,'#f0c8a0');R(-4,-34,8,3,'#ccc');R(-2,-37,4,3,'#ccc');R(-3,-28,6,1,'#333')},
(p,w)=>{R(-14,-22,28,22,'#dd3');for(let i=0;i<7;i++)R(-14+i*4,-30,4,8,i&1?'#e33':'#fff');R(-12,-22,24,4,'#e9b56a');R(-10,-24,20,2,'#b33');R(-12,0,4,4,'#333');R(8,0,4,4,'#333');R(-4,-40,8,8,'#e8b088');R(-5,-42,10,2,'#e33')},
(p,w)=>{R(-10,-22,8,22,'#444');R(2,-22,8,22,'#444');R(-14,-44,28,24,'#c44');R(-14,-26,28,4,'#fc2');R(-22,-42+w,8,20,'#c44');R(14,-42-w,8,20,'#c44');R(-8,-58,16,14,'#e8b088');R(-7,-52,5,2,'#222');R(2,-52,5,2,'#222');R(-3,-46,6,2,'#822')}
];
const NM=['PUNK','CONE HEAD','NINJA','SK8 GRANNY','HOT DOG','BIG BRUISER'],SPD=[200,200,380,160,200,200],HP=[1,2,1,3,2,12];
const WV=[[0,12,7,4],[1,48,4,6],[2,80,6,2],[3,96,3,8],[4,116,3,4],[5,128,1,1]];
const E=[];for(const[t,b,n,i]of WV)for(let j=0;j<n;j++)E.push({ty:t,c:(b+j*i)/2,n:HP[t],h:0,a:0,k:-1,st:-9});
const X0=e=>e.ty==5?150:122;

function HR(k,hx,hy){x.save();x.translate(hx,hy);x.scale(k,k);const p=T-pun<.16;
 LG('#2448a8',p?0:Math.sin(T*12)*2);R(-5,-24,10,14,'#eee');R(-4,-32,8,8,'#f5c08a');R(-5,-34,10,2,'#d22');R(5,-34,4,1,'#d22');
 R(-2,-29,1,2,'#000');R(1,-29,1,2,'#000');R(-7,-22,3,8,'#f5c08a');
 p?R(4,-22,14,4,'#f5c08a'):R(4,-22,3,8,'#f5c08a');x.restore()}

function PS(e){const v=SPD[e.ty],X=X0(e);
 if(e.k>=0){const s=(T-e.k)/.9;return s<1?[X+s*140,FY-Math.sin(s*3.14)*60,s*5]:0}
 if(T<e.c){const q=X+(e.c-T)*v;return q<W+20?[q,FY,0]:0}
 return[X+(T-e.st<.08?2:0),FY,0]}
function EN(e){const p=PS(e);if(!p)return;
 x.save();x.translate(p[0],p[1]);x.rotate(p[2]);const k=e.ty==5?2:1;x.scale(k,k);
 DR[e.ty](T<e.c?Math.sin(T*14)*2:0,Math.sin(T*10));x.restore();
 if(e.k<0&&e.ty!=5&&T>e.c-1.3&&T<e.c+.5)TX(NM[e.ty],p[0],FY-46,'#fff',7,'center');
 if(e.k<0&&e.ty!=5&&e.n>1)R(p[0]-6,FY-42,12,2,'#222'),R(p[0]-6,FY-42,12*(e.n-e.h)/e.n,2,'#f44')}

function scene(s){
 const g2=x.createLinearGradient(0,0,0,150);g2.addColorStop(0,'#1a0838');g2.addColorStop(.55,'#7a2262');g2.addColorStop(1,'#f2855a');x.fillStyle=g2;x.fillRect(0,0,W,H);
 BL(s,.25,110,22,18,44,'#3c2466','#ffb3ff',0);
 BL(s,.5,130,38,14,26,'#241640','#ffd27a',1);
 BL(s,1,146,60,10,14,'#14102a','#ffb24a',1);
 R(0,FY-2,W,4,'#6a5a7a');R(0,FY+2,W,H,'#2a2233');
 for(let i=-1;i<6;i++)R(i*60-(s*160)%60,FY+16,30,2,'#ffd27a');
}

let T=-1,S=0,Q,B0=0,hold=0,sa=0,combo=0,lh=-9,hp=100,sc=0,pun=-9,ST=[];
const SPK=[];

function HIT(e){
 e.h++;combo++;lh=T;sc+=100*combo;
 const ko=e.h>=e.n;e.st=T;pun=T;
 if(ko){e.k=T;hp=Math.min(100,hp+3);SONG.sfx(1)}else SONG.sfx(0);
 hold=performance.now()+(ko?90:50);sa=ko?6:3;
 for(let i=0;i<6;i++)SPK.push({x:X0(e)-4,y:FY-22,vx:(Math.random()-.5)*200,vy:-Math.random()*200,t:T});
 if(combo%5==0)ST.push({x:X0(e),y:FY-52,t:T});
}
function UPD(){
 for(const e of E){while(e.h<e.n&&T>=e.c+e.h*.5)HIT(e);if(!e.a&&e.h<e.n&&T>=e.c+.3){e.a=1;hp=Math.max(20,hp-6)}}
 if(T-lh>2)combo=0;
 ST=ST.filter(s=>T-s.t<.9);
}
function SPF(){for(const s of SPK){const a=T-s.t;if(a>0&&a<.35)R(s.x+s.vx*a,s.y+s.vy*a+300*a*a,2,2,'#ff4')}}

function HUD(){
 TX('1P',8,14,'#f44',8);R(8,18,48,4,'#222');R(8,18,48*hp/100,4,hp<35?'#f44':'#3f3');
 TX('SCORE '+String(sc).padStart(6,'0'),8,32,'#fff',7);
 TX('HI 050000',312,10,'#ff4',7,'right');
 if(combo>1)TX('COMBO x'+combo,312,28,'#ff4',9+(T-lh<.25?3:0),'right');
 if(T>6)TX('DEMO PLAY',8,176,(T*2|0)%2?'#fff':'#889',7);
 if((T*2|0)%2)TX('INSERT COIN',160,176,'#ff4',8,'center');
 const nx=E.find(e=>e.c>T);if(nx&&nx.c-T>1.5&&(T*4|0)%2==0)TX('GO →',312,100,'#ff4',12,'right');
 const b=E[E.length-1];if(T>b.c-.5&&b.k<0){R(100,18,120,4,'#222');R(100,18,120*(b.n-b.h)/b.n,4,'#f44');TX('BIG BRUISER',160,15,'#fff',7,'center')}
}

function SUP(){const s=T-70;
 if(s<1.2){for(let i=7;i>=0;i--){x.fillStyle=['#f4f','#4ff','#ff4','#fff'][i&3];x.beginPath();x.arc(96,FY-30,Math.max(0,s/1.2*440-i*45),0,6.3);x.fill()}
  HR(3,96,FY)}
 else if(s<1.5)R(0,0,W,H,'#fff');
 else{R(0,0,W,H,'#000');TX('SUPER!',160,96,'#ff4',20,'center')}}
function CNT(){R(0,0,W,H,'rgba(0,0,0,.6)');TX('CONTINUE?',160,60,'#fff',14,'center');
 if(T<76.5)TX(String(9-Math.floor((T-72)/.5)),160,140,'#ff4',40,'center')}
function RUN(){
 scene(Math.min(T,72));
 if(T<70){for(const e of E)EN(e);HR(1,96,FY);HUD()}
 SPF();
 if(T>=70&&T<72)SUP();
 if(T>=72)CNT();
}
function TTL(now){
 const g2=x.createLinearGradient(0,0,0,H);g2.addColorStop(0,'#0b0420');g2.addColorStop(1,'#4a1458');x.fillStyle=g2;x.fillRect(0,0,W,H);
 for(let i=0;i<40;i++)R(hs(i)*W,hs(i+40)*100,1,1,(now/300+i)%3<1?'#fff':'#557');
 BL(0,.5,140,36,20,30,'#120828','#ff8',1);
 R(0,FY,W,H,'#2a2233');
 HR(2,100,FY);x.save();x.translate(220,FY);x.scale(2,2);DR[1](0,0);x.restore();
 TX('CITY BLOCK',160,66,'#ff4',24,'center');
 if((now/400|0)%2)TX('PRESS START',160,120,'#fff',12,'center');
 TX('CREDIT 00',160,176,'#fff',7,'center');
}
function END(now){R(0,0,W,H,'#000');
 if((now/400|0)%2)TX('INSERT COIN',160,90,'#ff4',18,'center');
 TX('CREDIT 00',160,130,'#fff',9,'center')}

function go(){if(S)return;S=1;Q=new AudioContext();Q.resume();B0=SONG.live(Q,0).base}
addEventListener('pointerdown',go);addEventListener('keydown',go);
function F(){
 requestAnimationFrame(F);
 const now=performance.now();
 if(S)T=Q.currentTime-B0;
 if(T>=0)UPD();
 if(now>hold){x.setTransform(1,0,0,1,0,0);T<6?TTL(now):T>=77?END(now):RUN()}
 sa*=.88;gl.uniform2f(uS,(Math.random()-.5)*sa,(Math.random()-.5)*sa);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
F();
