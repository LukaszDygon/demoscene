// RECURSOR: timeline, 4D projection, cut logic and rendering. The audio clock drives everything.
const $=i=>document.getElementById(i),cv=$('c'),gl=cv.getContext('webgl2',{antialias:false}),QS=new URLSearchParams(location.search);
const BAR=SONG.BAR,ST=SONG.ST,PI=Math.PI,hs=x=>{x=Math.sin(x*127.1+.3)*43758.5453;return x-Math.floor(x)},fr=x=>x-Math.floor(x);
const VS='#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}';
function prog(fs){const p=gl.createProgram();[[gl.VERTEX_SHADER,VS],[gl.FRAGMENT_SHADER,fs]].forEach(([t,s])=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);
 if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));gl.attachShader(p,x)});gl.linkProgram(p);p.u={};return p}
const U=(p,n)=>n in p.u?p.u[n]:p.u[n]=gl.getUniformLocation(p,n);
const SCN=prog("$SCENE$"),PST=prog("$POST$");
// render targets: 0 scene, 1/2 feedback ping-pong
let W,H,q=1,tex=[],fbo=[],pp=1;
function rt(i){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR);
 for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
 const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);tex[i]=t;fbo[i]=f}
function size(){const d=Math.min(devicePixelRatio||1,2);W=Math.round(Math.min(innerWidth*d,1280)*q);H=Math.max(1,Math.round(W*innerHeight/innerWidth));cv.width=W;cv.height=H;
 for(let i=0;i<3;i++){if(tex[i]){gl.deleteTexture(tex[i]);gl.deleteFramebuffer(fbo[i])}rt(i)}}
size();addEventListener('resize',size);
// ---- 4D polytopes: tesseract (16 vertices, 32 edges) and 24-cell (24 vertices, 96 edges) ----
const TV=[],CV=[];for(let i=0;i<16;i++)TV.push([0,1,2,3].map(k=>(i>>k&1)*2-1));
for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)for(let s=0;s<4;s++){const v=[0,0,0,0];v[a]=s&1?1:-1;v[b]=s&2?1:-1;CV.push(v)}
const ed=(V,d)=>{const E=[];V.forEach((a,i)=>V.forEach((b,j)=>{j>i&&Math.abs(a.reduce((s,x,k)=>s+(x-b[k])**2,0)-d)<.01&&E.push([i,j])}));return E};
const PT=[[TV,ed(TV,4),4.5,2,1],[CV,ed(CV,2),3.2,1.42,1.25]],PL=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],LA=new Float32Array(384),LZA=new Float32Array(96);
function proj(pi,A,br){const [V,E,dw,wm,sk]=PT[pi],P=V.map(v=>{v=v.slice();PL.forEach(([i,j],k)=>{const c=Math.cos(A[k]),s=Math.sin(A[k]),x=v[i],y=v[j];v[i]=c*x-s*y;v[j]=s*x+c*y});
  const k=1/(dw-v[3]),k2=2.6/(4-v[2]*k)*sk;return[v[0]*k*k2,v[1]*k*k2,v[3]]});
 E.forEach(([a,b],i)=>{LA.set([P[a][0],P[a][1],P[b][0],P[b][1]],i*4);LZA[i]=br*(.3+.7*((P[a][2]+P[b][2])/4/wm+.5))});return E.length}
// ---- cuts: snares on the grid, edit markers and crashes; some cuts get a (rate-limited) inversion flash ----
const CT=[],CF=[];let lf=-9;
for(let b=0;b<SONG.BARS;b++){const E=SONG.ev(b),s=E.s;E.e.forEach(([st,ty,v,p])=>{if(ty>=4||ty==1&&v==1&&p==1){const t=b*BAR+st*ST;if(CT.length&&t-CT[CT.length-1]<.06)return;
 CT.push(t);const f=[0,1,1,0,1,1,0,1,0][s]&&hs(CT.length*7.1)<(s==7?.45:.22)&&t-lf>.45;if(f)lf=t;CF.push(f)}})}
const cutAt=t=>{let a=0,z=CT.length-1;if(t<CT[0])return-1;while(a<z){const m=a+z+1>>1;CT[m]<=t?a=m:z=m-1}return a};
const lastHit=(t,ty)=>{const b=Math.floor(t/BAR);let l=-9;for(let k=b-1;k<=b;k++)if(k>=0&&k<SONG.BARS)for(const e of SONG.ev(k).e)if(e[1]==ty||ty==1&&e[1]==4){const x=k*BAR+e[0]*ST;if(x<=t)l=x}return t-l};
// ---- narration display (word timings come from the same phoneme layout the voice uses) ----
const NW=VOICE.N.map(l=>{const s=l[0]*BAR+l[1]*ST;return{s,e:s+VOICE.lay(l[3])[1]*ST,w:VOICE.words(l).map(([u,w])=>[s+u*ST,w])}});
const GL='#%&@$/\\<>[]01X=+',scr=(w,n)=>w.replace(/[^ .]/g,(c,i)=>GL[(n*7+i*13)%GL.length]);
let lastN='';
function narr(t){let L=0;for(const n of NW)if(t>=n.s-.02&&t<n.e+BAR*1.3)L=n;
 let h='';if(L){const out=t>L.e+BAR*1.1,f=Math.floor(t*30);L.w.forEach(([wt,w])=>{if(t>=wt)h+='<b>'+(t-wt<.07||out&&hs(f+wt)<.6?scr(w,f):w)+'</b> '})}
 if(h!=lastN)$('nr').innerHTML=lastN=h}
// ---- boot log, typed on the 16th grid during the first bars ----
const LOG=[[2,'mount /dev/tesseract ........ ok'],[6,'w-axis ...................... unbounded'],[10,'interior volume ............. > exterior'],[14,'recursion limit ............. none'],[17,'subject ..................... acquired'],[26,'depth ....................... 0'],[30,'begin descent']];let lastL='';
function log(t){const s=t/ST;let h='';if(s<112)for(const [a,l] of LOG)if(s>=a)h+='> '+l.slice(0,Math.min(l.length,(s-a)*12|0))+'\n';if(h!=lastL)$('lg').textContent=lastL=h}
// ---- scenes ----
const DEP=['00','01','02','02','03','04','04','ERR','00'],PQ=[[7,3],[5,4],[4,5],[6,4],[8,3],[4,6],[5,5]];
let S,NL,LV,P,Q,C,X,mo,te,fb,iv,K,Sn,sd,dq,cr,ps;
function sPoly(tt,pi,ang,f,sc,tw,lv,br,acc){S=0;NL=proj(pi,ang,br);LV=lv;P=[f,sc,tw,tt*1.7];Q=[acc,0,0,0]}
function sCorr(tt,ci,ca,h){S=1;C=[0,0,4+(tt-24*BAR)*9];P=[(h(1)*4|0)*PI/2+(h(2)-.5)*ca*2.2,1.15-.3*K,0,0];Q=[0,0,0,0];X=[tt>32*BAR?.09+.07*Math.sin(tt*.4):0,0,0,0]}
function sMeng(tt,ci,ca,h){S=3;C=[0,0,(tt-48*BAR)*1.6];P=[(h(1)*8|0)*PI/4+(h(2)-.5)*ca*3,1-.22*K,fr(tt/BAR/2),[0,.42,PI/4,.9,.2,PI/6][h(5)*6|0]];
 Q=[Math.sin(tt*.9)*.12,Math.cos(tt*.7)*.12,0,ci%4]}
function sHyp(tt,ci,ca,h){S=4;const pq=PQ[h(4)*7|0],m=Math.tanh(Math.min(ca,2)*.8),d=h(6)*6.283;P=[pq[0],pq[1],tt*.25+h(7)*6,h(12)<.4?1:0];Q=[Math.cos(d)*m,Math.sin(d)*m,0,0]}
function sSlice(tt,ci,ca,h,cutA){S=5;C=[2,2,(tt-16*BAR)*3];Q=[2+Math.sin(tt*.6)*.5,2+Math.cos(tt*.5)*.5,C[2]+3,ci%5];P=[(h(1)*4|0)*PI/2+(h(2)-.5)*ca,1.2-.25*K,tt*.12,0];X=[0,1,2,3].map(cutA)}
function sVert(tt,ci,ca,h){S=6;P=[(h(1)*6|0)*PI/3+(h(2)-.5)*ca*1.5,1.3-.2*K,fr(tt/BAR),[0,.5,1.2,PI/3,2.1,.9][h(5)*6|0]];Q=[0,0,0,ci%4]}
// apollonian flight: a straight path found offline to stay >= .24 from the surface for every inversion strength used
const AP=[-.2213,.9952,.7016],AV=[-.4845,-.0076,.8748];
function sFoam(tt,ci,ca,h){S=7;const k=fr(tt/(8*BAR))*1.2;C=AP.map((p,i)=>p+AV[i]*k);Q=C.map((p,i)=>p+AV[i]+(i<2?Math.sin(tt*(.7+i*.2))*.25:0));Q[3]=ci%2;P=[(h(1)*4|0)*PI/2+(h(2)-.5)*ca,1.1-.2*K,0,[1.08,1.15,1.22,1.3][h(5)*4|0]]}
function sHoney(tt,ci,ca,h){S=8;P=[(h(1)*4|0)*PI/2+(h(2)-.5)*ca,1.15-.2*K,Math.tanh(fr(tt*.7)*.53),tt*.3+h(4)*6];Q=[0,0,0,ci%5]}
const CARD={8:'DEPTH 01',16:'8 CELLS',24:'DEPTH 02',40:'INTERIOR',48:'DEPTH 03',64:'VERTEX',72:'DEPTH 04',80:'INVERSION',88:'24-CELL',96:'DEPTH ERR',104:'COLLAPSE',120:'ZERO'};
function plan(t,title){
 const b=Math.max(0,Math.min(Math.floor(t/BAR),127)),E=SONG.ev(b),s=title?0:E.s,st=t/ST-b*16,u=t/BAR,g=E.gap,inG=!title&&g&&st>=g[0]&&st<g[1];
 const tt=inG?(b*16+g[0])*ST:t,ci=title?0:cutAt(t),ca=title?t:t-(CT[ci]||0),h=k=>hs(ci*13.7+k);
 K=title?0:Math.exp(-lastHit(t,0)*9);Sn=title?0:Math.exp(-lastHit(t,1)*11);sd=ci;
 mo=[0,.05,.08,0,.12,.1,0,.25,0][s];te=[.06,.22,.3,.03,.4,.3,.03,.55,0][s]+.25*Sn*(s%3>0);fb=.35;iv=!title&&CF[ci]&&ca<.1?1:0;C=[0,0,0];X=[0,0,0,0];dq=[0,0];cr=0;ps=0;
 const cutA=k=>h(k)*6.283+ca*(h(k+6)-.5)*5+tt*.2,wire=(pi,sc,tw)=>sPoly(tt,pi,[0,1,2,3,4,5].map(cutA),fr(u),sc,tw,3,1,1);
 if(s==0){sPoly(tt,0,[tt*.13,0,tt*.31,0,tt*.21,tt*.17],fr(tt*.08),1,.2,2,Math.min(1,u/2.5+(title?1:0)),0);fb=.8}
 else if(s==1){if(b<16){sPoly(tt,0,[0,1,2,3,4,5].map(cutA),fr(u),1.1+.12*K,.35,3,1,Sn);fb=.6}else{sSlice(tt,ci,ca,h,cutA);h(3)>.85&&ca<ST*2&&wire(0,1.3,.4)}}
 else if(s==2){sCorr(tt,ci,ca,h);h(3)>.82&&ca<ST*3&&wire(0,1.3,.4)}
 else if(s==3){S=2;const v=u-40,e=x=>x*x*(3-2*x),z=v<5?-7+5.2*e(v/5):v<6?-1.8+.9*e(v-5):-.9+1.3*e(Math.min(1,(v-6)/2));
  C=[Math.sin(v*.5)*.7*Math.max(0,1-v/5),.25*Math.max(0,1-v/5.5),z];Q=[C[0]*.2,C[1]-.06,z+4,0];P=[Math.sin(v*.4)*.06,1.4,0,0];fb=.15}
 else if(s==4){if(b<64){sMeng(tt,ci,ca,h);b>=56&&b<60&&ci%2&&sFoam(tt,ci,ca,h);b>=60&&h(3)>.72&&sCorr(tt,ci,ca,h);iv^=S==3&&(b-48)>>2&1;fb=.45}else{sVert(tt,ci,ca,h);fb=.5}}
 else if(s==5){b<80?sHyp(tt,ci,ca,h):sHoney(tt,ci,ca,h);fb=.25}
 else if(s==6){sPoly(tt,1,[tt*.11,tt*.07,tt*.19,tt*.05,tt*.23,tt*.13],fr(tt*.1),1.1,.15,2,1,0);fb=.9}
 else if(s==7){const k=h(9)*8|0;mo+=.5*Math.exp(-ca*8);fb=.4;if(b>=110&&b<112||b>=116||h(10)>.8)dq=[.62+.08*Math.sin(tt*3),tt*.7*(h(11)<.5?1:-1)];
  [()=>sHoney(tt,ci,ca,h),()=>wire(h(8)<.5?0:1,1.2+.15*K,.5),()=>sCorr(tt,ci,ca,h),()=>sMeng(tt,ci,ca,h),()=>sHyp(tt,ci,ca,h),()=>sSlice(tt,ci,ca,h,cutA),()=>sVert(tt,ci,ca,h),()=>sFoam(tt,ci,ca,h)][k]()}
 else{cr=Math.min(1,Math.max(0,(t-125*BAR)/(BAR*.6)));const v=Math.max(0,1-(t-120*BAR)/(5*BAR));sPoly(tt,1,[tt*.11,tt*.07,tt*.5,tt*.05,tt*.6,tt*.13],0,1.1*v*v,0,1,v,0);fb=.85}
 te+=.5*Math.exp(-lastHit(t,6)*25);if(s==7)ps=.25+.4*Math.exp(-ca*5);if(inG){mo=.92;te=.5;ps=.5}
 if(t>SONG.BARS*BAR){S=0;NL=0;LV=0;P=[0,0,0,0];fb=0;mo=0;te=0}
 if(!title){const cb=Math.floor(t/BAR),cd=CARD[cb]&&t-cb*BAR<ST*6?CARD[cb]:'';$('cd').textContent=cd;$('cd').style.opacity=cd&&(t/ST|0)%2==0?1:.15;
  $('hd').textContent=inG?'//// SIGNAL LOST ////':`RCSR // DEPTH ${DEP[s]} // ${b.toString(16).padStart(2,0)}:${(st|0).toString(16)} // CUT ${ci}`;narr(t)}}
// ---- draw ----
function draw(t){
 gl.viewport(0,0,W,H);gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[0]);gl.useProgram(SCN);
 gl.uniform2f(U(SCN,'R'),W,H);gl.uniform1f(U(SCN,'T'),t);gl.uniform1f(U(SCN,'K'),K);gl.uniform1f(U(SCN,'Sn'),Sn);gl.uniform1i(U(SCN,'S'),S);
 gl.uniform1i(U(SCN,'NL'),NL||0);gl.uniform1i(U(SCN,'LV'),LV||0);gl.uniform4fv(U(SCN,'P'),P);gl.uniform4fv(U(SCN,'Q'),Q);gl.uniform3fv(U(SCN,'C'),C);gl.uniform4fv(U(SCN,'X'),X);
 if(S==0){gl.uniform4fv(U(SCN,'L'),LA);gl.uniform4fv(U(SCN,'LZ'),LZA)}
 gl.drawArrays(gl.TRIANGLES,0,3);
 const a=pp,bb=3-pp;pp=bb;gl.useProgram(PST);
 const pu=(n,v)=>gl.uniform1f(U(PST,n),v);
 gl.uniform2f(U(PST,'R'),W,H);pu('T',t);pu('Mo',mo);pu('Te',te);pu('Iv',iv);pu('Fb',fb);pu('Sd',sd%97);pu('Cr',cr);pu('Ps',ps);pu('F',0);gl.uniform2fv(U(PST,'Dq'),dq);
 gl.uniform1i(U(PST,'A'),0);gl.uniform1i(U(PST,'B'),1);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex[0]);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tex[a]);
 gl.bindFramebuffer(gl.FRAMEBUFFER,fbo[bb]);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex[bb]);pu('F',1);gl.drawArrays(gl.TRIANGLES,0,3)}
// ---- start, clock, loop ----
let A,song,on=0,lt=0,avg=16;
function go(){if(on)return;on=1;A=new AudioContext();A.resume();song=SONG.live(A,+QS.get('t')||0);window.__play=1;
 $('ti').style.opacity=0;document.body.style.cursor='none'}
addEventListener('click',go);addEventListener('keydown',e=>{(e.key==' '||e.key=='Enter')&&go();e.key=='f'&&document.documentElement.requestFullscreen?.()});
function loop(now){requestAnimationFrame(loop);
 const dt=now-lt;lt=now;avg+=(Math.min(dt,100)-avg)*.05;if(avg>38&&q>.45){q*=.85;avg=20;size()}
 if(on){const t=A.currentTime-song.base;plan(t,0);draw(t);$('en').style.opacity=t>125.8*BAR?1:0;log(t)}
 else{const t=now/1000;plan(t,1);draw(t)}}
requestAnimationFrame(loop);
// clearance probe: the corridor flight (bars 24-40), camera on the tube axis vs. walls and ribs
{const B=[[1,-3,-9,3,3,170],[-3,-3,-9,-1,3,170],[-3,1,-9,3,3,170],[-3,-3,-9,3,-1,170]];
 for(let z=1;z<170;z+=2)B.push([.88,-1,z-.06,1,1,z+.06],[-1,-1,z-.06,-.88,1,z+.06],[-1,.88,z-.06,1,1,z+.06],[-1,-1,z-.06,1,-.88,z+.06]);
 window.__probe={dur:16*BAR,cam:t=>[0,0,4+t*9],boxes:B}}
/*DBG*/window.__stat=t=>{for(let i=0;i<6;i++){plan(t+i/60,0);window.__ov&&window.__ov();draw(t+i/60)}const px=new Uint8Array(W*H*4);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);let s=0,w=0,c=0;for(let i=0;i<px.length;i+=4){const l=(px[i]+px[i+1]+px[i+2])/765;s+=l;w+=l>.8;c+=Math.max(px[i],px[i+1],px[i+2])-Math.min(px[i],px[i+1],px[i+2])>90}const n=px.length/4;return[S,+(s/n).toFixed(3),+(w/n).toFixed(3),+(c/n).toFixed(3)]}/*END*/
/*DBG*/window.__ascii=t=>{window.__stat(t);const px=new Uint8Array(W*H*4);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);let o='';const cw=72,ch=24;for(let y=ch-1;y>=0;y--){for(let x=0;x<cw;x++){let s=0,c=0;for(let j=0;j<4;j++)for(let i=0;i<4;i++){const X=((x+i/4)*W/cw)|0,Y=((y+j/4)*H/ch)|0,k=(Y*W+X)*4;s+=(px[k]+px[k+1]+px[k+2])/765;c+=Math.max(px[k],px[k+1],px[k+2])-Math.min(px[k],px[k+1],px[k+2])>90}s/=16;o+=c>8?'*':' .:-=+#%@'[Math.min(8,s*9|0)]}o+='|\n'}return o}/*END*/
