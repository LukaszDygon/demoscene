const D=document,$=i=>D.getElementById(i),C=$('c'),g=C.getContext('webgl2');
const sh=(t,s)=>{const h=g.createShader(t);g.shaderSource(h,s);g.compileShader(h);if(!g.getShaderParameter(h,35713))throw g.getShaderInfoLog(h);return h},
P=g.createProgram();
g.attachShader(P,sh(35633,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}'));
g.attachShader(P,sh(35632,$('fs').text));
g.bindAttribLocation(P,0,'a');g.linkProgram(P);g.useProgram(P);
g.bindBuffer(34962,g.createBuffer());g.bufferData(34962,new Float32Array([-1,-1,3,-1,-1,3]),35044);
g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,5126,false,0,0);
const uR=g.getUniformLocation(P,'R'),uT=g.getUniformLocation(P,'T');
const rs=()=>{C.width=Math.min(innerWidth,1280);C.height=Math.round(C.width*innerHeight/innerWidth);g.viewport(0,0,C.width,C.height)};
rs();onresize=rs;
// caption band: pseudo-Latin, keyed to the musical bar it lands on
const CP=[[0,'HIC INCIPIT TELA'],[8,'HIC EXERCITVS CASTRVM OBSIDET'],[26,'TVRRIS CADIT'],[32,'IGNIS MVROS VORAT'],[40,'DRACO ADVENIT'],[44,'FLAMMA PERFORAT TELAM'],[52,'HOSTES FVGIVNT'],[64,'HIC FINIS']];
let A=null,S=null,ci=-1;
$('s').onclick=async()=>{if(A)return;A=new AudioContext();await A.resume();S=SONG.live(A,0);$('s').style.display='none'};
const fr=()=>{const t=S?Math.max(0,A.currentTime-S.base):0;
 g.uniform2f(uR,C.width,C.height);g.uniform1f(uT,t);g.drawArrays(4,0,3);
 let n=0;while(n<CP.length-1&&t>=CP[n+1][0])n++;
 if(n!==ci){ci=n;$('b').textContent=CP[n][1]}
 $('f').style.opacity=Math.min(1,Math.max(0,(t-68)/4));
 requestAnimationFrame(fr)};
requestAnimationFrame(fr);
