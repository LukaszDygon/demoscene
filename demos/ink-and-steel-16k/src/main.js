const D=document,$=i=>D.getElementById(i),C=$('c'),g=C.getContext('webgl2');
const CAP=[[.6,'雨の屋根','RAIN ON THE ROOF'],[3.5,'静','STILLNESS'],[5,'一合','ONE CLASH'],[6,'竹林','BAMBOO GROVE'],[9,'疾風','GALE'],[12,'呼吸','BREATH'],[14.5,'止','STILL'],[15.6,'一閃','ONE FLASH'],[17,'一滴','ONE DROP'],[18.6,'終','FIN']];
const VS='#version 300 es\nvoid main(){vec2 p=vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.;gl_Position=vec4(p,0,1);}';
const sh=(t,s)=>{const o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);if(!g.getShaderParameter(o,g.COMPILE_STATUS))console.error(g.getShaderInfoLog(o));return o},
pr=g.createProgram();g.attachShader(pr,sh(g.VERTEX_SHADER,VS));g.attachShader(pr,sh(g.FRAGMENT_SHADER,$('f').text));g.linkProgram(pr);if(!g.getProgramParameter(pr,g.LINK_STATUS))console.error(g.getProgramInfoLog(pr));g.useProgram(pr);
const U=n=>g.getUniformLocation(pr,n),uR=U('R'),uB=U('B'),uK=U('K'),uT=U('T');
let A=0,sg=0,t0=-1,ci=-2;
function go(){if(A)return;A=new AudioContext();A.resume();sg=SONG.live(A,0);t0=performance.now();$('s').style.opacity=0;setTimeout(()=>$('s').remove(),1500)}
D.onpointerdown=go;
function cap(B){let i=-1;CAP.forEach((c,j)=>{if(B>=c[0])i=j});if(i===ci)return;ci=i;const e=$('cap');e.classList.remove('a');
 if(i>=0){$('cj').textContent=CAP[i][1];$('ce').textContent=CAP[i][2];void e.offsetWidth;e.classList.add('a')}}
function fr(now){requestAnimationFrame(fr);
 const t=now/1e3,B=sg?(A.currentTime-sg.base)/SONG.BAR:-1,K=t0<0?-1:(now-t0)/1e3;
 g.uniform2f(uR,C.width,C.height);g.uniform1f(uB,B);g.uniform1f(uK,K);g.uniform1f(uT,t);
 g.drawArrays(g.TRIANGLES,0,3);cap(B);$('e').style.opacity=B>=18.6?1:0}
function rs(){const s=Math.min(1,1280/innerWidth);C.width=innerWidth*s|0;C.height=innerHeight*s|0;g.viewport(0,0,C.width,C.height)}
onresize=rs;rs();requestAnimationFrame(fr);
