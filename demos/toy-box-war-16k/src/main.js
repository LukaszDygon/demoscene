const $=i=>document.getElementById(i);
const cv=$('c'),gl=cv.getContext('webgl2');
if(!gl)throw Error('WebGL2 is needed');
const VS='#version 300 es\nvoid main(){vec2 p=vec2(float(gl_VertexID<<1&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0,1);}';
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(o));return o};
const pg=fs=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));return p};
const PS=pg($('fs').textContent),PP=pg($('fp').textContent);
gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(3),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,1,gl.FLOAT,false,0,0);
const L=(p,n)=>gl.getUniformLocation(p,n);
const uR=L(PS,'R'),uT=L(PS,'T'),uA=L(PS,'LA'),uE=L(PS,'EV'),uS=L(PP,'S'),uPR=L(PP,'R'),uD=L(PP,'DR');
const tx=gl.createTexture(),fb=gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.bindTexture(gl.TEXTURE_2D,tx);
for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tx,0);
function fit(){const k=Math.min(1,1280/innerWidth);cv.width=innerWidth*k|0;cv.height=innerHeight*k|0;gl.bindTexture(gl.TEXTURE_2D,tx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,cv.width,cv.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null)}
// song seconds -> scene seconds: slow motion for the last stand (48-56 s), frozen from 67 s
const W=s=>s<48?s:s<56?48+(s-48)*.35:s<67?50.8+(s-56):61.8;
// explosion sites, one per SONG.P entry (confetti / fluff / popcorn bursts)
const EP=[[-.9,.1,-.45],[-1.1,.12,-.4],[.1,.15,-1.1],[.8,.3,-.8],[.8,.25,-.8],[0,.35,0],[.05,.3,.02],[-.3,.2,-.6]];
const EV=new Float32Array(32);
// title cards: [song second, text]
const CAP=[[.3,'DAY 3. THE BOOKSHELF HAS FALLEN.'],[4,'THE PLUSH DIVISION ADVANCES AT DAWN'],[12,'GENERAL BARNABY COMMANDS FROM THE BLANKET.'],[16,'THE GREEN LINE HOLDS AT THE BRICK FORTRESS.'],[24,'THE SOCK AVALANCHE BURIES SECTOR SEVEN.'],[30,'THE BLOCK TOWER FALLS AT 0900 HOURS.'],[36,'THE PLUSH RABBIT FLANKS VIA THE CARPET FIBRES.'],[42,'PRIVATE PLASTIC ENTRENCHES BEHIND THE CEREAL BOX.'],[48,'HE HOLDS THE LINE. HE HOLDS IT ALONE.'],[56,'THE STUFFING SETTLES OVER THE RUG.'],[62,'THE RABBIT RETREATS TO THE BEANBAG.'],[66,'MOM: "DINNER!"']];
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const capEl=$('t');
function caption(s){
 let c=null;for(const x of CAP)if(s>=x[0])c=x;
 if(!c){capEl.textContent='';return}
 const n=Math.min(c[1].length,Math.floor((s-c[0])*26));
 const txt=c[1].slice(0,n)+(n<c[1].length?'_':'');
 if(capEl.textContent!==txt)capEl.textContent=txt;
}
let song=0,actx=0;
function frame(){
 const s=song?Math.max(0,actx.currentTime-song.base):0,T=W(s);
 const LA=s<4?.04:s<4.3?(Math.floor(s*30)%2?1:.25):1;
 const DR=sm(67.4,68.8,s);
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,cv.width,cv.height);gl.useProgram(PS);
 gl.uniform2f(uR,cv.width,cv.height);gl.uniform1f(uT,T);gl.uniform1f(uA,LA);gl.uniform4fv(uE,EV);
 gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.useProgram(PP);gl.bindTexture(gl.TEXTURE_2D,tx);
 gl.uniform1i(uS,0);gl.uniform2f(uPR,cv.width,cv.height);gl.uniform1f(uD,DR);
 gl.drawArrays(gl.TRIANGLES,0,3);
 caption(s);
 capEl.style.display=s>=70?'none':'';
 $('e').style.opacity=s>=70?1:0;
 requestAnimationFrame(frame);
}
$('s').onclick=()=>{
 if(song)return;
 actx=new AudioContext();actx.resume();song=SONG.live(actx,0);
 $('s').style.display='none';
};
SONG.P.forEach((p,i)=>EV.set([...EP[i],W(p)],i*4));
fit();addEventListener('resize',fit);
requestAnimationFrame(frame);
