const PA=[[.98,.58,.52],[.66,.91,.8],[1,.9,.5],[.68,.82,.98],[.98,.74,.82],[.82,.76,.96],[1,1,1]];
const PBP=[[3.2,4.6],[6.2,3.2],[4.2,4.2],[2.4,2.6],[6.6,4.9],[4,2.4],[2,5],[5.6,3.9],[3.6,5.2]];
const PT=[];
const put=(x,y,z,s,c,a)=>PT.push(x,y,z,s,c[0],c[1],c[2],a);
function fx(t){PT.length=0;let flash=0;
 for(let i=0;i<60;i++)put((hs(i,1)-.5)*16,((hs(i,2)+t*.02*(.5+hs(i,3)))%1)*11,hs(i,4)*6-2,.07,[1,1,1],.35);
 S.BURST.forEach((bb,i)=>{const d=t-T(bb),Q0=PBP[i],tb=T(bb);
  if(d<0){const p=ph(bb-.4,bb,t);if(p>0){const x=5.2+(Q0[0]-5.2)*p,y=1.1+(Q0[1]-1.1)*p;for(let k=1;k<5;k++){const q=p-k*.03;if(q>0)put(5.2+(Q0[0]-5.2)*q,1.1+(Q0[1]-1.1)*q,.8,.12/k,[1,.96,.8],1-k/5)}put(x,y,.8,.16,[1,1,1],1)}return}
  const life=1.4;if(d>life)return;flash=Math.max(flash,Math.exp(-d*5));
  for(let j=0;j<36;j++){const k=i*40+j,th=6.2832*hs(k,1),fi=Math.acos(2*hs(k,2)-1),sp=.9+1.1*hs(k,3),dx=Math.sin(fi)*Math.cos(th),dy=Math.cos(fi),dz=Math.sin(fi)*Math.sin(th)*.25;
   put(Q0[0]+dx*sp*d,Q0[1]+dy*sp*d-1.1*d*d,.8+dz*sp*d,.3*(1-d/life)+.1,PA[(i+j)%6],1-d/life)}});
 const pz=T(E.cannon);
 if(t>pz&&t<pz+1.2)for(let j=0;j<14;j++){const d=t-pz,k=hs(j,11);put(2.5+k*1.8+d*1.5,1.1+d*(1.2+k),.6+hs(j,12)*.6,.25+d*.9,[.96,.96,.98],.5*(1-d/1.2))}
 const pp=T(E.piano);
 if(t>pp&&t<pp+1.5)for(let j=0;j<16;j++){const d=t-pp,k=hs(j,13);put(6.3+k*1.8,1+d*(1+hs(j,14)),-.4+hs(j,15)*.4,.12,PA[j%7],(1-d/1.5)*.9)}
 const td=t-T(E.crash);
 if(td>0&&td<2.5)for(let j=0;j<40;j++){const vx=(hs(j,7)-.5)*3.6,vy=1+hs(j,8)*3.2,vz=(hs(j,9)-.5)*3;put(vx*td,Math.max(.1,.5+vy*td-4.9*td*td),vz*td,.12,j&1?[1,1,1]:PA[3],1-td/2.5)}
 if(t>T(E.drop)&&t<T(E.dom)+1)for(let k=1;k<7;k++){const q=MB(t-k*.05);put(q[0],q[1],q[2],.1*(1-k/7),[1,1,1],.5*(1-k/7))}
 for(let j=0;j<60;j++){const u=hs(j,60),v=hs(j,61),q=((t*.05+u)%1);put(-5.3+(-3.4+5.3)*q+(hs(j,62)-.5)*.5,10-(10-8.2)*q+(hs(j,63)-.5)*.4,-2+(.5+2)*q,.1,[1,.95,.75],.22*Math.sin(q*Math.PI)*(.6+v*.4))}
 for(let j=0;j<30;j++){const ph2=(t*1.5+j/30)%1,th=t*1.4+j*.21,sp=1.6;put(-10+sp*ph2*Math.cos(th),.4+1.4*ph2*(1-ph2)*4,6+sp*ph2*Math.sin(th),.12,[.9,.98,1],.6*(1-ph2))}
 if(t>T(E.bath)&&t<T(E.launch))for(let j=0;j<12;j++){const q=(t*.6+j*.2)%1;put(-6.9+(hs(j,70)-.5)*1.6,WL(t)+q*.8,-1.2+(hs(j,71)-.5)*.6,.1,[1,1,1],.7*(1-q))}
 if(t>T(E.over)&&t<T(E.duck)+.6)for(let j=0;j<10;j++){const q=((t-T(E.over))*2+j/10)%1;put(-5.6+.05*hs(j,72),8.6-q*1.6,-1.2,.12,[.6,.85,1],.8*(1-q))}
 const ce=T(E.end);
 if(t>ce)for(let j=0;j<70;j++){const d=t-ce,y=9-d*(1.2+hs(j,50))+Math.sin(d*2+j)*.3;put((hs(j,51)-.5)*15+Math.sin(d+j)*.4,Math.max(0,y),(hs(j,52)-.5)*3,.22,PA[j%7],Math.max(0,1-d/8))}
 return flash}
