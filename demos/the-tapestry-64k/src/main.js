// WebGL loop and the audio clock. The page's own caption and end card are DOM; the cloth is the shader.
(()=>{
const cv=document.getElementById('c'),gl=cv.getContext('webgl2');
const VS='#version 300 es\nin vec2 v;void main(){gl_Position=vec4(v,0.,1.);}';
const FS=`/*SHADER*/`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const at=gl.getAttribLocation(pr,'v');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
const U=n=>gl.getUniformLocation(pr,n),uR=U('R'),uT=U('T'),uC=U('CX'),uF=U('FD');
function rs(){cv.width=innerWidth;cv.height=innerHeight;gl.viewport(0,0,cv.width,cv.height)}
addEventListener('resize',rs);rs();
const CAPS=['HIC EXERCITUS CASTRUM OBSIDET','MACHINA LAPIDES IACIT','MURUS ARDET','TURRIS CADIT','MILITES IN PUGNA','DRACO ADVENIT','IGNIS PERFORAT TELAM','CAPTIVI DUCUNTUR','CIVITAS CECIDIT','FINIS OPERIS'];
const ti=document.getElementById('ti'),cap=document.getElementById('cap'),cs=document.getElementById('cs'),en=document.getElementById('en');
let actx=null,song=null,lastK=-1;
function start(){
 if(actx)return;
 actx=new AudioContext();actx.resume();song=SONG.live(actx,0);
 ti.style.opacity=0;cap.style.opacity=1;
}
addEventListener('pointerdown',start);
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter')start()});
function frame(){
 const T=actx&&song?Math.max(0,actx.currentTime-song.base):0,A=cv.width/cv.height;
 gl.uniform2f(uR,cv.width,cv.height);
 gl.uniform1f(uT,T);
 gl.uniform1f(uC,Math.min(2+T/2.4,40-A));          // steady pan: one panel every 9.6 s, stops at the cloth's end
 gl.uniform1f(uF,actx?Math.max(0,Math.min(1,1-(T-98)/2.8)):.35);
 const k=Math.min(9,Math.max(0,Math.floor((T+4.8)/9.6)));
 if(actx&&k!==lastK){lastK=k;cs.textContent=CAPS[k]}
 en.style.opacity=actx&&T>97?1:0;
 gl.drawArrays(gl.TRIANGLES,0,3);
 requestAnimationFrame(frame);
}
cap.style.opacity=0;
requestAnimationFrame(frame);
})();
