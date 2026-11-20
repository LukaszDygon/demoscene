(()=>{
const $=i=>document.getElementById(i),cv=$('c'),gl=cv.getContext('webgl2');
const sh=(k,s)=>{const o=gl.createShader(k);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(o));return o};
const P=gl.createProgram();
gl.attachShader(P,sh(gl.VERTEX_SHADER,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}'));
gl.attachShader(P,sh(gl.FRAGMENT_SHADER,$('fs').textContent));
gl.linkProgram(P);gl.useProgram(P);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(P,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
const U=n=>gl.getUniformLocation(P,n),ramp=(x,a,b)=>Math.min(1,Math.max(0,(x-a)/(b-a)));
// hull debris: x, y, z, radius (static positions, shader tumbles them)
const ROCKS=[[-22,-6,34,1.6],[-6,10,58,1.2],[-2,-24,64,2],[-30,-14,90,2.4],[8,20,40,1],[40,8,96,1.5],[-48,6,130,2],[-10,-22,120,2.2],[22,30,140,1.4],[-70,-10,60,3]];
gl.uniform4fv(U('K'),new Float32Array(ROCKS.flat()));
// pod camera keys: t, pos, target, roll
const KF=[[0,4,-3,-40,12,-6,80,0],[10,-6,2,-10,-14,4,70,.05],[18,-6,6,10,0,2,100,-.03],[27,14,20,68,30,-6,110,.04],[36,20,14,60,34,-8,112,-.02],[44,-14,6,48,-40,10,150,.03],[52,0,-4,40,0,-12,130,-.04],[62,20,-30,120,260,-380,700,.02],[72,90,-120,300,260,-380,700,0],[76,157,-211,369,260,-380,700,0],[80,157,-211,369,260,-380,700,0]];
const camAt=t=>{let i=0;while(i<KF.length-2&&t>KF[i+1][0])i++;const a=KF[i],b=KF[i+1];
 let u=Math.min(1,Math.max(0,(t-a[0])/(b[0]-a[0])));u=u*u*(3-2*u);const v=a.map((x,j)=>x+(b[j]-x)*u);
 return{p:[v[1]+Math.sin(t*.23)*.8,v[2]+Math.sin(t*.17+1)*.5,v[3]+Math.cos(t*.19)*.6],t:[v[4],v[5],v[6]],r:v[7]+Math.sin(t*.11)*.03}};
// captions: start, end, text
const CAP=[[1.5,6,'POD 7. HULL INTACT.'],[17,23,'FLEET HOLDING ORBIT'],[28.5,33.5,'BRIDGE LOST.'],[36.7,42,'POD 7. HULL INTACT.'],[47.5,53,'NO RESPONSE ON ANY CHANNEL'],[59,64,'DRIFTING TOWARD THE LIGHT']];
const PLv=t=>ramp(t,60,72)*(1-ramp(t,75,77));
let A=null,song=null,cur='';
$('s').onclick=()=>{if(song)return;A=new AudioContext();A.resume();song=SONG.live(A,0);$('s').style.display='none'};
const rs=()=>{cv.width=Math.min(1280,Math.round(innerWidth*devicePixelRatio));cv.height=Math.round(cv.width*innerHeight/innerWidth)};
rs();onresize=rs;
const jt=s=>(Math.random()-.5)*s;
const frame=()=>{
 const t=song?Math.max(0,A.currentTime-song.base):0,cam=camAt(t),pl=PLv(t);
 gl.uniform2f(U('R'),cv.width,cv.height);gl.uniform1f(U('T'),t);
 gl.uniform3f(U('CP'),cam.p[0],cam.p[1],cam.p[2]);
 gl.uniform3f(U('CT'),cam.t[0]+jt(pl*2),cam.t[1]+jt(pl*2),cam.t[2]+jt(pl*2));
 gl.uniform1f(U('ROLL'),cam.r+jt(pl*.05));gl.uniform1f(U('PL'),pl);gl.uniform1f(U('EX'),.25+.75*ramp(t,0,6));
 gl.drawArrays(gl.TRIANGLES,0,3);
 const win=(t>10&&t<17)||(t>58&&t<72);
 $('w').style.opacity=$('o').style.opacity=win?1:0;
 $('o').textContent='O2 '+Math.max(0,Math.round(94-1.52*(t-10)))+'%';
 const k=CAP.find(c=>t>=c[0]&&t<c[1]),txt=k?k[2]:'';
 if(txt!==cur){cur=txt;$('t').textContent=txt}
 $('t').style.opacity=k?Math.min(1,(t-k[0])/.8,(k[1]-t)/.8):0;
 $('wh').style.opacity=ramp(t,71,76.7)*(1-ramp(t,76.7,78.5));
 $('e').style.opacity=ramp(t,77.5,79.5);
 requestAnimationFrame(frame);
};
frame();
//DEV{
window.__probe={dur:80,cam:t=>camAt(t).p,boxes:[...ROCKS.map(([x,y,z,r])=>[x-1.6*r,y-1.6*r,z-1.6*r,x+1.6*r,y+1.6*r,z+1.6*r]),[-30,-2,60,2,12,80],[10,-16,98,50,4,122],[-60,0,136,-14,30,166]]};
//}DEV
})();
