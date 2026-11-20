const D=document,$=i=>D.getElementById(i),C=$('c'),g=C.getContext('webgl2'),Q=new URLSearchParams(location.search),MU=Q.has('mute'),
JP=getComputedStyle(D.body).fontFamily,
sm=(a,b,x)=>(x=Math.min(Math.max((x-a)/(b-a),0),1),x*x*(3-2*x)),mx=(a,b,k)=>a+(b-a)*k;
// ---- camera: speed keyframes integrated into a z table ----
const VK=[[0,7],[6,12],[8.5,28],[23,30],[24.5,38],[31.5,38],[33,30],[47,30],[56,0],[99,0]],
vel=t=>{for(let i=1;;i++)if(t<VK[i][0])return mx(VK[i-1][1],VK[i][1],sm(VK[i-1][0],VK[i][0],t))},
ZT=[0];for(let i=1;i<4800;i++)ZT[i]=ZT[i-1]+vel(i/60)/60;
const zz=t=>{const i=Math.min(Math.max(t*60,0),4798),j=i|0;return mx(ZT[j],ZT[j+1],i-j)},
TZ=[zz(24.4),zz(31.6)],LZ=zz(56)+60;
function pos(t){const tun=sm(23,24.3,t)*(1-sm(31.8,33,t)),en=sm(47,55,t),sw=(1-tun)*(1-en)*sm(7,10,t);
 return[sw*Math.sin(t*.9)+(1-tun)*(1-en)*.4*Math.sin(t*2.3),
  2.6+52*(1-sm(0,9,t))+tun*.4+sm(33,36,t)*(1-en)*2.5*(.5-.5*Math.cos((t-33)*.7))+en*5.5,zz(t)]}
function cam(t){const p=pos(t),a=pos(t+.6),en=sm(47,55.5,t),k=1-sm(0,9,t);
 return[p,[mx(a[0],0,en),mx(a[1]-6*k,82,en),mx(p[2]+14,LZ,en)],-(a[0]-p[0])*.25]}
//DEV{
window.__probe={dur:62,cam:t=>pos(t),boxes:[[2.2,0,-1e4,1e4,60,1e4],[-1e4,0,-1e4,-2.2,60,1e4],[-1e4,-5,-1e4,1e4,0,1e4],
 [-15,0,TZ[0],-4,14,TZ[1]],[4,0,TZ[0],15,14,TZ[1]],[-15,6.8,TZ[0],15,14,TZ[1]],[-2.5,0,LZ-2.5,2.5,35,LZ+2.5]]};
//}DEV
// ---- atlas: katakana billboards + the KAIJU logo, drawn with OS fonts ----
const A=D.createElement('canvas'),x=A.getContext('2d');A.width=A.height=2048;
x.fillRect(0,0,2048,2048);x.fillStyle=x.strokeStyle='#fff';x.textAlign='center';x.textBaseline='middle';
const fit=(s,cx,cy,w,px,f,st)=>{x.font=`900 ${px}px ${f}`;const m=x.measureText(s).width;x.save();x.translate(cx,cy);x.scale(Math.min(1,w/m),1);
 if(st){x.fillStyle='#777';x.fillText(s,0,0);x.lineWidth=st;x.strokeText(s,0,0)}else x.fillText(s,0,0);x.restore()};
'ネオン カイジュウ ラーメン サイバー トーキョー ロボット パチンコ ゲーム'.split(' ').map((s,i)=>fit(s,512+i%2*1024,128+(i>>1)*256,940,200,JP));
'ホテル カラオケ キケン デンキ'.split(' ').map((s,i)=>[...s].map((c,j)=>fit(c,128+i*256,1024+(4-s.length)*128+128+j*256,240,215,JP)));
fit('KAIJU',1536,1250,940,420,'Impact,"Arial Black",sans-serif',14);
x.fillRect(1130,1478,812,10);fit('カイジュウ',1536,1590,820,190,JP);fit('怪 獣  ·  デモパーティ  ·  16K',1536,1745,760,64,JP);
const tex=(u,f)=>{const t=g.createTexture();g.activeTexture(g.TEXTURE0+u);g.bindTexture(3553,t);f();
 g.texParameteri(3553,10241,9987);g.texParameteri(3553,10240,9729);return t};
tex(0,()=>{g.texImage2D(3553,0,6408,6408,5121,A);g.generateMipmap(3553)});
// ---- shaders ----
const HF=g.getExtension('EXT_color_buffer_float'),
pr=fs=>{const p=g.createProgram();[[35633,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}'],[35632,fs]].map(([t,s])=>{
 const h=g.createShader(t);g.shaderSource(h,s);g.compileShader(h);g.attachShader(p,h)});
 g.bindAttribLocation(p,0,'a');g.linkProgram(p);return p},
U=(p,n,...v)=>g['uniform'+v.length+'f'](g.getUniformLocation(p,n),...v),
P1=pr($('fs').text),P2=pr($('fp').text);g.useProgram(P2);g.uniform1i(g.getUniformLocation(P2,'F'),1);
g.bindBuffer(34962,g.createBuffer());g.bufferData(34962,new Float32Array([-1,-1,3,-1,-1,3]),35044);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,5126,0,0,0);
const FB=g.createFramebuffer();let RT,w,h,W,H;
function rs(){W=C.width=innerWidth;H=C.height=innerHeight;const s=Math.min(1,1280/W);w=W*s|0;h=H*s|0;
 RT&&g.deleteTexture(RT);RT=tex(1,()=>g.texImage2D(3553,0,HF?34842:6408,w,h,0,6408,HF?5131:5121,null));
 g.bindFramebuffer(36160,FB);g.framebufferTexture2D(36160,36064,3553,RT,0)}
onresize=rs;rs();
// ---- captions / HUD ----
const CAP=[[1.5,7,'ネオ・トーキョー','NEO-TOKYO · 03:00'],[10,15.5,'ハヤク、ヒクク','STAY LOW. DON\'T BRAKE.'],[24.6,30.5,'トンネル・ゼロ','NO SIGNAL DOWN HERE'],
 [34,40,'ナニカ ガ メザメタ','SOMETHING WOKE UP'],[42,47,'ミアゲロ','LOOK UP'],[58.5,1e3,'アリガトウ','KAIJU · 16K INTRO · 120 BPM']];
let ci=-1,actx,song,t0=performance.now(),T0=+Q.get('t')||0;
function now(){return song?actx.currentTime-song.base:MU?T0+(performance.now()-t0)/1000:-1}
$('s').onclick=async()=>{if(song)return;actx=new AudioContext();await actx.resume();song=SONG.live(actx,0);$('s').remove()};
if(MU)$('s').remove();
function fr(){requestAnimationFrame(fr);const st=now(),t=Math.max(st,0),an=performance.now()/1000,[p,l,r]=cam(t),
 b=t/2,kk=t>8&&t<56||t>=56&&t<57?Math.exp(-(t%.5)*9):0;
 g.bindFramebuffer(36160,FB);g.viewport(0,0,w,h);g.useProgram(P1);
 U(P1,'R',w,h);U(P1,'T',t,st<0?an:t);U(P1,'P',...p);U(P1,'L',...l);U(P1,'Z',...TZ,LZ);U(P1,'K',kk);U(P1,'W',r);
 g.drawArrays(4,0,3);g.activeTexture(g.TEXTURE1);g.generateMipmap(3553);
 g.bindFramebuffer(36160,null);g.viewport(0,0,W,H);g.useProgram(P2);
 U(P2,'R',W,H);U(P2,'Q',st<0?.45:sm(0,1.5,t)*(1-sm(60,63,t)*.85),an);g.drawArrays(4,0,3);
 const k=CAP.findIndex(c=>t>=c[0]&&t<c[1]&&st>=0);
 if(k!=ci){ci=k;$('t').innerHTML=k<0?'':`<b>${CAP[k][2]}</b><i>${CAP[k][3]}</i>`}
 $('h').innerHTML=st<0?'':`ALT ${p[1].toFixed(1).padStart(5,0)}M  SPD ${((vel(Math.min(t,98))*7.2|0)+'').padStart(3,0)}KM/H<br>BAR ${(b|0)+1}/30`;
 $('w').style.opacity=t>44&&t<58&&an*4%2>1?1:0}
fr();
