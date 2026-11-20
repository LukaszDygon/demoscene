const C=document.getElementById('c'),g=C.getContext('webgl2'),$=i=>document.getElementById(i),
S=$('s'),CAP=[[.5,4.4,'DOMINO HOUSE','A ROLLING CHAIN REACTION'],[52,1e9,'THANK YOU','EVERY DOMINO LANDED']],
sm=(a,b,x)=>{x=Math.min(Math.max((x-a)/(b-a),0),1);return x*x*(3-2*x)};
const p=g.createProgram();
[[35633,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}'],[35632,$('fs').text]].forEach(([k,s])=>{const h=g.createShader(k);g.shaderSource(h,s);g.compileShader(h);g.attachShader(p,h)});
g.bindAttribLocation(p,0,'a');g.linkProgram(p);g.useProgram(p);
g.bindBuffer(34962,g.createBuffer());g.bufferData(34962,new Float32Array([-1,-1,3,-1,-1,3]),35044);
g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,5126,0,0,0);
const U=(n,...v)=>g['uniform'+v.length+'f'](g.getUniformLocation(p,n),...v);
function rs(){const s=Math.min(1,1280/innerWidth);C.width=innerWidth*s|0;C.height=innerHeight*s|0;g.viewport(0,0,C.width,C.height)}
onresize=rs;rs();
let song=null,actx,ci=-1;
function fr(){requestAnimationFrame(fr);const t=song?Math.max(actx.currentTime-song.base,0):0;
 U('R',C.width,C.height);U('T',t);
 U('E',0,4+1.5*sm(24,50,t),19-4*sm(3,26,t)+3*sm(38,50,t));U('G',0,3.7+1.5*sm(24,50,t),0);
 g.drawArrays(4,0,3);
 const k=song?CAP.findIndex(c=>t>=c[0]&&t<c[1]):-1;
 if(k!=ci){ci=k;$('t').innerHTML=k<0?'':`<b>${CAP[k][2]}</b><i>${CAP[k][3]}</i>`}}
S.onclick=async()=>{if(song)return;actx=new AudioContext();await actx.resume();song=SONG.live(actx,0);S.className='x'};
fr();
