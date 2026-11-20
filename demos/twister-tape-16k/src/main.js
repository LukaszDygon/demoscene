const C=document.getElementById('c'),g=C.getContext('webgl2'),$=i=>document.getElementById(i);
const VS='#version 300 es\nvoid main(){vec2 p=vec2(float(gl_VertexID&1),float(gl_VertexID>>1));gl_Position=vec4(p*4.-1.,0.,1.);}';
function sh(k,s){const o=g.createShader(k);g.shaderSource(o,s);g.compileShader(o);g.getShaderParameter(o,g.COMPILE_STATUS)||console.error(g.getShaderInfoLog(o));return o}
const P=g.createProgram();g.attachShader(P,sh(g.VERTEX_SHADER,VS));g.attachShader(P,sh(g.FRAGMENT_SHADER,$('fs').textContent.trim()));g.linkProgram(P);g.useProgram(P);
const UT=g.getUniformLocation(P,'T'),UR=g.getUniformLocation(P,'R');
function rs(){C.width=Math.min(innerWidth,1024);C.height=Math.round(C.width*innerHeight/innerWidth);g.viewport(0,0,C.width,C.height);g.uniform2f(UR,C.width,C.height)}
addEventListener('resize',rs);rs();
let A=null,song=null;
$('s').onclick=()=>{if(A)return;A=new AudioContext();A.resume();song=SONG.live(A,0);$('s').remove()};
const pad=n=>String(n).padStart(2,'0');
function fr(){
 const t=song?A.currentTime-song.base:-1;
 g.uniform1f(UT,t);g.drawArrays(g.TRIANGLES,0,3);
 $('o').style.opacity=t>0&&t<75?1:0;
 const s=Math.floor(Math.max(t,0));$('tc').textContent='00:'+pad(s/60|0)+':'+pad(s%60);
 $('k').style.opacity=t>43.2&&t<48?1:0;
 requestAnimationFrame(fr)}
fr();
