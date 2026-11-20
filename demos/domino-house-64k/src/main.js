const VB=gl.createBuffer(),VA=gl.createVertexArray(),EV0=gl.createVertexArray(),PB=gl.createBuffer(),PAV=gl.createVertexArray();
gl.bindBuffer(gl.ARRAY_BUFFER,VB);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(VD),gl.STATIC_DRAW);
gl.bindVertexArray(VA);
const ap=gl.getAttribLocation(OP,'p'),an=gl.getAttribLocation(OP,'n');
gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,24,0);
gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,24,12);
gl.bindVertexArray(PAV);gl.bindBuffer(gl.ARRAY_BUFFER,PB);
const aa=gl.getAttribLocation(PP,'a'),ac=gl.getAttribLocation(PP,'c');
gl.enableVertexAttribArray(aa);gl.vertexAttribPointer(aa,4,gl.FLOAT,false,32,0);
gl.enableVertexAttribArray(ac);gl.vertexAttribPointer(ac,4,gl.FLOAT,false,32,16);
gl.bindVertexArray(null);
const TC=[0,.5,4.5],TEYE=()=>[0,1.5,6.5*zo()];
const KF=[[0,36,7,6],[3,30,6,5],[7,24,3,1.5],[10,21,2.2,1.2],[13,20,3,2.5],[16,22,4,3.5],[18,27,4,3],[23,25,5,4],[27,26,4,3.5],[31,30,5,4],[35,48,8,5],[40,52,8,5],[44,40,7,6],[46,40,7,6]];
function kf(b){let i=0;while(i<KF.length-2&&b>KF[i+1][0])i++;const a=KF[i],c=KF[i+1],s=sl(cl((b-a[0])/(c[0]-a[0])));return[a[1]+(c[1]-a[1])*s,a[2]+(c[2]-a[2])*s,a[3]+(c[3]-a[3])*s]}
function zo(){return Math.max(1,.9/(cv.width/cv.height))}
function cam(t){const k=kf(S.B(t));return{e:[0,k[1],k[0]*zo()],c:[0,k[2],0]}}
const CAP=[[0,3,'Prologue','one domino, one tap'],[3,7,'I · Drawer','a marble is set loose'],[7,13,'II · Kitchen','dominoes, one beat apiece'],[13,15,'III · Toaster','toast takes flight'],[15,17,'IV · Attic','a telescope tips over'],[17,18,'V · Cannon','a hammer finds the keys'],[18,23,'VI · Fireworks','the conservatory lights up'],[23,27,'VII · Bathroom','a duck rides the flood'],[27,31,'VIII · Nursery','a train goes round the blocks'],[31,35,'IX · Garden','the house in its garden'],[35,40,'X · Pop-up','the house folds shut'],[40,44,'XI · Coda','the waltz remembers']];
const ck=document.querySelector('#cp .k'),cl2=document.querySelector('#cp .l'),cp=document.getElementById('cp'),en=document.getElementById('en'),ti=document.getElementById('ti');let cur=-1;
function caps(b){let j=-1;CAP.forEach((c,i)=>{if(b>=c[0]&&b<c[1])j=i});
 if(j!==cur&&j>=0){cur=j;ck.textContent=CAP[j][2];cl2.textContent=CAP[j][3]}
 cp.style.opacity=j>=0?Math.min(1,(b-CAP[j][0])*3,(CAP[j][1]-b)*3):0;
 en.style.opacity=cl((b-44)*1.5)}
let actx=null,song=null;
const now=()=>song?Math.max(0,actx.currentTime-song.base):0;
async function go(){if(actx)return;actx=new AudioContext();await actx.resume();song=S.live(actx);ti.style.opacity=0}
addEventListener('pointerdown',go);addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')go()});
function rs(){const d=Math.min(devicePixelRatio||1,1.5);cv.width=innerWidth*d|0;cv.height=innerHeight*d|0}
addEventListener('resize',rs);rs();
const tF=T(E.fold),tF2=T(E.fold2),DF=tF2-tF;
function frame(){requestAnimationFrame(frame);
 const t=now(),b=S.B(t),started=!!song,w=started?sl(cl(t/1.2)):0;
 const c=cam(t),e0=TEYE(),e=e0.map((v,i)=>v+(c.e[i]-v)*w),tg=TC.map((v,i)=>v+(c.c[i]-v)*w);
 const pf=(s,d)=>cl((t-tF-s*DF)/(d*DF)),phi=[(Math.PI/2)*sl(pf(0,1)),(Math.PI/4)*sl(pf(.15,.85)),(Math.PI/4)*sl(pf(.3,.7))];
 const FM=foldMats(phi),Vm=look(e,tg),Pm=persp(.8,cv.width/cv.height,.5,400),VP=mm(Pm,Vm);
 const flash=fx(t);
 gl.viewport(0,0,cv.width,cv.height);gl.clearColor(1,.95,.88,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.useProgram(BGP);gl.bindVertexArray(EV0);
 gl.uniform2f(UL(BGP,'R'),cv.width,cv.height);gl.uniform1f(UL(BGP,'F'),flash);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.DEPTH_TEST);gl.useProgram(OP);gl.bindVertexArray(VA);
 gl.uniformMatrix4fv(UL(OP,'V'),false,VP);gl.uniform3fv(UL(OP,'CP'),e);
 for(const o of OB){let M=typeof o.m==='function'?o.m(t):o.m;if(o.pn>=0)M=mm(FM[o.g][o.pn],M);
  gl.uniformMatrix4fv(UL(OP,'M'),false,M);gl.uniform3fv(UL(OP,'C'),o.c);gl.uniform1f(UL(OP,'S'),o.sp);gl.uniform1f(UL(OP,'Em'),o.em);gl.uniform1f(UL(OP,'K'),o.k);
  gl.drawArrays(gl.TRIANGLES,o.ms[0],o.ms[1])}
 if(PT.length){gl.useProgram(PP);gl.bindVertexArray(PAV);gl.bindBuffer(gl.ARRAY_BUFFER,PB);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(PT),gl.DYNAMIC_DRAW);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);
  gl.uniformMatrix4fv(UL(PP,'V'),false,VP);gl.uniform1f(UL(PP,'uS'),cv.height*Pm[5]*.5);
  gl.drawArrays(gl.POINTS,0,PT.length/8);gl.depthMask(true);gl.disable(gl.BLEND)}
 if(started)caps(b);
}
frame();
