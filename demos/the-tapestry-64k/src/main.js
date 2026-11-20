
(()=>{
const cv=document.getElementById('c'),gl=cv.getContext('webgl2');
const VS='#version 300 es\nin vec2 v;void main(){gl_Position=vec4(v,0.,1.);}';
const FS=`/*SHADER*/`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const at=gl.getAttribLocation(pr,'v');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
const U=n=>gl.getUniformLocation(pr,n),uR=U('R'),uT=U('T'),uC=U('CX'),uZ=U('ZC'),uF=U('FD');
function rs(){cv.width=innerWidth;cv.height=innerHeight;gl.viewport(0,0,cv.width,cv.height)}
addEventListener('resize',rs);rs();
const CAPS=['HIC EXERCITUS CASTRUM OBSIDET','PRINCIPES CONSILIUM HABENT','MACHINA LAPIDES IACIT','MURUS ARDET','TURRIS CADIT','CUNICULUS SUB MURO','EQUITES IMPETUM FACIUNT','MILITES IN PUGNA','DRACO ADVENIT','IGNIS PERFORAT TELAM','CAPTIVI DUCUNTUR','CONVIVIUM VICTORIAE','CIVITAS CECIDIT','FINIS OPERIS'];
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
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const pull=sm(130,138,T);
const cx=Math.min(2+T/2.4,56-A)*(1-pull)+34.8*pull;
let zc=(4.2+(1.732-4.2)*sm(0,9,T))*(1-pull)+4.2*pull;
for(const [a,b] of [[18,21],[47,50],[84,87],[112,115]])if(T>a&&T<b)zc*=1-.6*Math.sin(Math.PI*(T-a)/(b-a));
gl.uniform2f(uR,cv.width,cv.height);
gl.uniform1f(uT,T);
gl.uniform1f(uC,cx);
gl.uniform1f(uZ,zc);
gl.uniform1f(uF,actx?Math.max(0,Math.min(1,1-(T-140)/4)):.35);
const k=Math.min(13,Math.max(0,Math.floor((T+4.8)/9.6)));
if(actx&&k!==lastK){lastK=k;cs.textContent=CAPS[k]}
en.style.opacity=actx&&T>140?1:0;
gl.drawArrays(gl.TRIANGLES,0,3);
requestAnimationFrame(frame);
}
cap.style.opacity=0;
requestAnimationFrame(frame);
})();
