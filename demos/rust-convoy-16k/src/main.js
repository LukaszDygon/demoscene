const D=document,$=i=>D.getElementById(i),C=$('c'),g=C.getContext('webgl2'),
sm=(a,b,x)=>(x=Math.min(Math.max((x-a)/(b-a),0),1),x*x*(3-2*x));
const HF=g.getExtension('EXT_color_buffer_float'),
pr=fs=>{const p=g.createProgram();[[35633,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}'],[35632,fs]].map(([k,s])=>{const h=g.createShader(k);g.shaderSource(h,s);g.compileShader(h);if(!g.getShaderParameter(h,35713))console.error(g.getShaderInfoLog(h));g.attachShader(p,h)});g.bindAttribLocation(p,0,'a');g.linkProgram(p);return p},
U=(p,n,...v)=>g['uniform'+v.length+'f'](g.getUniformLocation(p,n),...v),
P1=pr($('fs').text),P2=pr($('fp').text),FB=g.createFramebuffer();
g.bindBuffer(34962,g.createBuffer());g.bufferData(34962,new Float32Array([-1,-1,3,-1,-1,3]),35044);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,5126,0,0,0);
g.useProgram(P2);g.uniform1i(g.getUniformLocation(P2,'X'),1);
let RT,w,h,W,H,song,actx;
const tex=()=>{const t=g.createTexture();g.activeTexture(33985);g.bindTexture(3553,t);g.texParameteri(3553,10241,9987);g.texParameteri(3553,10240,9729);return t};
function rs(){W=C.width=innerWidth;H=C.height=innerHeight;const s=Math.min(1,1280/W);w=W*s|0;h=H*s|0;RT&&g.deleteTexture(RT);RT=tex();g.texImage2D(3553,0,HF?34842:6408,w,h,0,6408,HF?5131:5121,null);g.bindFramebuffer(36160,FB);g.framebufferTexture2D(36160,36064,3553,RT,0);g.bindFramebuffer(36160,null)}
onresize=rs;rs();
$('s').onclick=async()=>{if(song)return;actx=new AudioContext();await actx.resume();song=SONG.live(actx,0);$('s').style.display='none'};
function fr(){requestAnimationFrame(fr);const s=song?actx.currentTime-song.base:-1,an=performance.now()/1000,t=s<0?2+.3*Math.sin(an):Math.min(s,80);
 g.bindFramebuffer(36160,FB);g.viewport(0,0,w,h);g.useProgram(P1);U(P1,'R',w,h);U(P1,'T',t,an);g.drawArrays(4,0,3);
 g.bindFramebuffer(36160,null);g.activeTexture(33985);g.generateMipmap(3553);
 g.viewport(0,0,W,H);g.useProgram(P2);U(P2,'R',W,H);U(P2,'T',t,an);g.drawArrays(4,0,3);
 $('e').style.opacity=sm(54,60,t)*(1-sm(78,80,t));$('e').style.filter=`blur(${((1-sm(54,62,t))*14).toFixed(1)}px)`}
fr();
