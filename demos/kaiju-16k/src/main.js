// KAIJU 16k: timeline, camera, atlas and uniforms. Lines starting with // are stripped by build.py.
const g=document.getElementById('c').getContext('webgl2'),o=document.getElementById('o'),
S=(a,b,t)=>(t=Math.min(Math.max((t-a)/(b-a),0),1),t*t*(3-2*t)),
clr=(x,z)=>Math.hypot(x,z+230)<44||x>29&&x<51&&z>-100&&z<-20||Math.abs(z+70)<6&&x>-6&&x<51||z>-180&&z<-100,
// camera keys: time, position, target
KY=[[0,.5,30,130,20,22,-60],[3,0,18,95,10,12,0],[5,0,2.4,60,0,3,20],[8,.3,2.2,-8,2,5,-45],[11,0,2.4,-46,14,8,-66],[13,0,2.6,-63,40,17,-70],[15,0,2.6,-75,40,17,-74],[16.5,0,2.2,-97,0,2.6,-130],[20,0,2,-130,0,2.2,-170],[24,0,2.2,-176,6,10,-232],[28,0,3.5,-191,6,18,-232],[31,-4,2,-196,6,24,-228],[33,-6,1.5,-198,6,27,-224],[36,-6,1.5,-199,6,28,-224],[40,-14,3,-206,6,20,-230],[44,-26,5,-232,6,17,-236],[48,-22,4,-214,0,22,-236],[52,0,1.5,-192,-10,30,-232],[60,.5,1.3,-190,-10,31,-232],[64,.5,1.3,-190,-10,31,-232]],
cam=t=>{let i=0;while(i<KY.length-2&&KY[i+1][0]<=t)i++;const k=j=>KY[Math.max(0,Math.min(KY.length-1,j))],a=k(i-1),b=k(i),d=k(i+1),e=k(i+2),u=Math.min(Math.max((t-b[0])/(d[0]-b[0]),0),1);
return b.map((p,n)=>.5*(2*p+(d[n]-a[n])*u+(2*a[n]-5*p+4*d[n]-e[n])*u*u+(3*p-a[n]-3*d[n]+e[n])*u*u*u)).slice(1)},
bx=[[-30,0,-176,-3,14,-100],[3,0,-176,30,14,-100],[-3,5,-176,3,14,-100],[0,0,-250,12,30,-224]],
BM=[0,2,4,5,6,7,10,12,20,21,22,23,29],
a=document.createElement('canvas'),x=a.getContext('2d'),J='"Hiragino Sans","Yu Gothic",Meiryo,"Noto Sans CJK JP",sans-serif',
f=(s,t,X,Y,w)=>{x.font=s;x.fillText(t,X,Y,w)};
for(let X=-55;X<60;X+=10)for(let Z=-295;Z<140;Z+=10)clr(X,Z)||bx.push([X-3.8,0,Z-3.8,X+3.8,28.6,Z+3.8]);
window.__probe={dur:64,cam:t=>cam(t).slice(0,3),boxes:bx};
// texture atlas: 8 vertical katakana columns, the logo, a warning banner
a.width=1024;a.height=512;x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
['ネオン','カラオケ','ラーメン','サイバー','パチンコ','ホテル','デンキ','キケン'].map((w,i)=>[...w].map((h,k)=>f('bold 58px '+J,h,i*64+32,55+k*100)));
f('900 140px "Arial Black",Impact,sans-serif','KAIJU',768,82,490);f('bold 44px '+J,'カ イ ジ ュ ウ',768,165);f('bold 46px '+J,'キケン カイジュウ注意',768,224,500);
const tx=g.createTexture(),P=g.createProgram(),U={};g.bindTexture(3553,tx);g.texImage2D(3553,0,6408,6408,5121,a);g.generateMipmap(3553);g.texParameteri(3553,10241,9987);
[[35633,'#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}'],[35632,document.getElementById('f').text.trim()]].map(([t,s])=>{const h=g.createShader(t);g.shaderSource(h,s);g.compileShader(h);g.getShaderParameter(h,35713)||console.error(g.getShaderInfoLog(h));g.attachShader(P,h)});
g.linkProgram(P);g.useProgram(P);[...'RTCGKABD'].map(k=>U[k]=g.getUniformLocation(P,k));
let A,song,end,q=1,ft=0,lt=0;const cv=g.canvas;
onclick=async()=>{A=A||new AudioContext();await A.resume();song&&song.stop();song=SONG.live(A);end=0;o.style.opacity=0};
function F(n){requestAnimationFrame(F);
// drop resolution if frames stay slow
ft=ft*.95+(n-lt)*.05;lt=n;if(song&&ft>50&&q>.5){q*=.8;cv.width=960*q;cv.height=540*q;g.viewport(0,0,cv.width,cv.height);ft=30}
const t=song?Math.max(0,A.currentTime-song.base):0,T=song?t:performance.now()/1e3,p=cam(t),
roar=S(32,33,t)-S(36,37,t)+S(52,53,t)-S(57,58,t),br=Math.max(S(33,33.3,t)-S(36,36.5,t),S(53,53.3,t)-S(57,57.5,t));
let k=roar*.25;BM.map(b=>song&&t>=b*2&&(k+=.3*Math.exp(-(t-b*2)*4)));
const j=n=>Math.sin(T*(37+n*11))*k;
if(t>63&&!end){end=1;o.lastChild.textContent='click to replay';o.style.opacity=1}
g.uniform2f(U.R,cv.width,cv.height);g.uniform1f(U.T,T);
g.uniform3f(U.C,p[0]+j(0)*.3,p[1]+j(1)*.3,p[2]);g.uniform3f(U.G,p[3]+j(2),p[4]+j(3),p[5]);
g.uniform3f(U.K,t<17?40:6,0,t<17?-56-20*Math.min(t/16,1):-238+6*S(40,48,t));
g.uniform4f(U.A,.25+.75*S(24,25,t),.5+.5*S(22,24,t)+S(31,33,t)-S(36,37,t)+S(51,53,t)-S(57,58,t),Math.max(S(32,32.8,t)-S(36,37.5,t),S(52,52.8,t)-S(57,58.5,t))+.05+.05*Math.sin(T),Math.max(S(31.5,32.8,t)-S(37,39,t),S(51,52.8,t))+.1*Math.sin(T*.7));
g.uniform4f(U.B,br,t>=53?t-53:t>=33?t-33:t>=24?t-24:99,t<48?0:S(48,50,t)*(t>50.5||Math.sin(T*50)>0?1:.3),song?S(0,1.2,t)*(1-S(61.5,64,t)):.6);
g.uniform4f(U.D,t<17?Math.PI:-Math.PI/2*S(48,51.5,t),t<17?1:S(39,40,t)-S(48,49,t),.6*(Math.max(0,1-Math.abs(t-33.1)*3)+Math.max(0,1-Math.abs(t-53.1)*3)),k);
g.drawArrays(4,0,3)}
F(0);
