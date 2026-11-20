(()=>{
const $=i=>document.getElementById(i),cv=$('c'),gl=cv.getContext('webgl2',{antialias:false});
if(!gl)throw'WebGL2 needed';
const BAR=SONG.BAR,Z=[0,0,0],I4=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const SEG=[[0,1],[28*BAR,.3],[33.5*BAR,1],[72*BAR,0]];
const W=t=>{let w=0;for(let i=0;i<SEG.length;i++){const a=SEG[i][0],e=i+1<SEG.length?SEG[i+1][0]:1e9;if(t>a)w+=(Math.min(t,e)-a)*SEG[i][1]}return w};
const at=b=>W(b*BAR),ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)},mx=(a,b,u)=>a+(b-a)*u;
const R=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const mm=(a,b)=>{const o=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o};
const Tm=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],Sm=s=>[s[0],0,0,0,0,s[1],0,0,0,0,s[2],0,0,0,0,1];
const Rx=a=>[1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1];
const Ry=a=>[Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1];
const Rz=a=>[Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1];
const GR=(p,r=Z)=>mm(Tm(...p),mm(Ry(r[1]),mm(Rx(r[0]),Rz(r[2]))));
const MX=5000,IB=new Float32Array(MX*20),IS=new Float32Array(MX*20);let nb=0,ns=0;
const PUT=(k,M,c,m)=>{const A=k?IS:IB,o=(k?ns++:nb++)*20;for(let i=0;i<16;i++)A[o+i]=M[i];A[o+16]=c[0];A[o+17]=c[1];A[o+18]=c[2];A[o+19]=m};
const IN=(G,p,r,s,c,m,k)=>PUT(k,mm(mm(G,GR(p,r)),Sm(s)),c,m);
const B=(G,p,r,s,c,m=0)=>IN(G,p,r,s,c,m,0),S=(G,p,r,s,c,m=0)=>IN(G,p,r,s,c,m,1);
const C={g:[.2,.42,.1],g2:[.32,.58,.18],tan:[.85,.66,.4],brn:[.5,.3,.15],wht:[.92,.88,.82],olv:[.32,.36,.18],drk:[.1,.1,.1],gold:[.9,.7,.2],yel:[.95,.75,.2],red:[.8,.08,.05],blu:[.05,.27,.85],grn:[.1,.6,.2],felt:[.25,.4,.2],car:[.8,.12,.1],metal:[.35,.36,.4],wood:[.55,.34,.16],rubber:[.06,.06,.07],rug:[.55,.1,.12],rugIn:[.85,.7,.4],bed:[.4,.55,.8],crumb:[.4,.22,.1],canopy:[.9,.5,.1],skin:[.85,.7,.55],sh:[.2,.16,.12],wall:[.7,.82,.6],lint:[.7,.7,.68],fibre:[.5,.4,.3],glass:[.2,.3,.4],lamp:[1,.95,.8]};
const BRK=[C.red,C.yel,C.blu,C.grn],SOCK=[[.95,.94,.9],C.red,C.blu,[.55,.15,.7],[.95,.8,.2],[.2,.6,.5]],POP=[[.9,.1,.2],[.1,.7,.9],[.95,.8,.1],[.2,.8,.3],[.9,.4,.8],[.3,.3,.9]],TWR=[[.9,.2,.2],[.2,.5,.9],[.95,.8,.1],[.2,.7,.3],[.9,.5,.1],[.6,.2,.8]];
const EV=[[17,[12,.3,-6]],[18.5,[0,1.5,1]],[19.5,[-1,1,-2]],[21,[0,2,0]],[22.5,[-.5,1,-2]],[24,[-1,1,-4]],[25.6,[-9,.8,-8.5]],[29.5,[-4,1.8,2]],[31,[-4,2,1]],[33,[-3,1,2]],[35,[0,3,-21]],[36.5,[0,3.5,-21]],[38,[-3,6,0]],[40,[6,1,6]],[47,[-12,3.8,27]],[49.5,[0,4,30]],[51,[8,4,24]],[55,[22,3,-20]],[57,[18,2,-24]],[61,[-18,1,-8]],[63,[-14,1,6]],[67,[6,4,-6]],[69,[6,4,-4]]];
const CK=[[0,[-14,6,-10],[-6,6,-29],40],[3,[-8,5,-14],[-2,6,-29],40],[6,[-20,2.2,16],[-8,.8,0],38],[8,[-9,1.4,9],[2,.8,-1],36],[12,[-10,1.3,16],[8,1,-2],34],[16,[-7,2.6,-2],[3,2,-6],34],[19,[-14,1.2,-12],[-2,1,-12],36],[22,[-22,.9,-6],[-8,.5,-9],30],[25,[-16,3,8],[-6,0,-4],30],[28,[-2,3,13],[-4,1.4,3],30],[31,[-12,2.6,9],[-5,1.5,2],26],[34,[-2,4,-5],[0,4,-21],32],[38,[10,10,4],[0,2,-20],36],[42,[20,2.4,6],[24,2,-4],34],[45,[-8,12,12],[0,2,30],36],[52,[22,20,-6],[22,4,-20],34],[58,[-30,4,-8],[-20,1,-4],30],[65,[6,3,-2],[6,2,-6],36],[70,[16,2.2,-1],[31,2.4,-6],34],[72,[20,2.2,-2],[31,2.4,-6],34]];
function camAt(T){let i=0;while(i<CK.length-2&&T>=at(CK[i+1][0]))i++;
 const a=CK[i],b=CK[i+1],v=ss(at(a[0]),at(b[0]),T),e=a[1].map((x,k)=>mx(x,b[1][k],v));
 return{e:[e[0]+Math.sin(T*.9)*.05,e[1]+Math.sin(T*1.3)*.04,e[2]+Math.cos(T*.7)*.05],g:a[2].map((x,k)=>mx(x,b[2][k],v)),fov:mx(a[3],b[3],v)*Math.PI/180}}
function build(T){
 nb=ns=0;
 const u=(a,b)=>ss(at(a),at(b),T);
 B(I4,[0,-.5,0],Z,[300,.5,300],[.5,.4,.3],3);
 B(I4,[0,6,-30],Z,[60,6,.5],C.wall,6);
 for(let k=0;k<30;k++)B(I4,[-58+k*4,6,-29.4],Z,[.3,6,.08],[.9,.95,.8],6);
 B(I4,[0,.4,-29.2],Z,[60,.4,.15],C.wht);
 B(I4,[1,.05,0],Z,[12.5,.05,8.5],C.rug,6);
 B(I4,[1,.09,0],Z,[11,.04,7],C.rugIn,6);
 for(let k=0;k<40;k++){const x=1-12.5+k*.625;B(I4,[x,.02,-9.1],Z,[.04,.08,.2],C.rugIn,6);B(I4,[x,.02,8.6],Z,[.04,.08,.2],C.rugIn,6)}
 for(let k=0;k<260;k++)B(I4,[R(k*11)*60-30,.3,R(k*13)*40-24],[(R(k)-.5)*.4,R(k*2)*6.3,(R(k*3)-.5)*.5],[.02,.3,.02],C.fibre,6);
 for(let k=0;k<60;k++)S(I4,[R(k*17)*50-25,.15,R(k*19)*40-20],Z,[.25,.12,.2],C.lint,6);
 for(let k=0;k<90;k++)S(I4,[R(k*3)*50-25,.05,R(k*5)*36-18],Z,[.07,.04,.07],C.crumb);
 for(let k=0;k<16;k++)B(I4,[R(k*23)*40-20,.5,R(k*29)*30-14],[0,R(k)*6.3,0],[.5,.5,.5],TWR[k%6],5);
 B(I4,[22,3,-20],Z,[7,2,5],C.bed,6);
 B(I4,[22,5.6,-20],Z,[6.2,.6,4.4],[.95,.95,.9],6);
 S(I4,[17.5,6.4,-20],Z,[1.6,.6,1.6],[.9,.9,.95],6);
 for(const[x,z]of[[15,-16],[29,-16],[15,-24],[29,-24]])B(I4,[x,1.5,z],Z,[.5,1.5,.5],C.wood,5);
 B(I4,[0,1,-22],Z,[9,1,3.2],C.wood,5);
 for(let k=0;k<14;k++)B(I4,[-8+k*1.3,2.9+(k%3)*.1,-22+(k%2)*.2],Z,[.4,.9+R(k)*.3,.7],TWR[k%6],2);
 B(I4,[-30,4,-22],Z,[6,4,2.5],C.wood,5);
 for(let k=0;k<3;k++){B(I4,[-30,1.5+k*2.6,-19.6],Z,[5.6,1.1,.2],C.wood,5);S(I4,[-30,1.5+k*2.6,-19.3],Z,[.25,.2,.2],C.metal,4)}
 B(I4,[-18,1.5,-18],Z,[4,1.5,2.5],C.wood,5);B(I4,[-18,3.2,-18],Z,[4.1,.2,2.6],C.wood,5);
 B(I4,[-26,.3,-14],Z,[1.8,.3,1.8],C.metal,4);B(I4,[-26,2.5,-14],[0,0,.5],[.15,2,.15],C.metal,4);B(I4,[-25,4.4,-13.2],[0,0,-.4],[.9,.2,.5],C.lamp,4);
 S(I4,[-6,1.2,-12],Z,[1.2,1.2,1.2],[.9,.2,.2],7);
 for(let k=0;k<22;k++)B(I4,[-30+k*1.6,.1,-27],Z,[.2,.1,1.1],C.wood,5);
 const cf=at(21);
 for(let L=0;L<4;L++)for(let k=0;k<14;k++){const id=L*14+k,dt=L==3&&k%2?Math.max(0,T-cf):0;
  let p=[(L%2)*.25,.3+L*.6,-6+k*.9],r=Z;
  if(dt>0){p=[p[0]+dt*(R(id)-.5)*6,Math.max(.3,p[1]+dt*(2+R(id+1)*2)-4.9*dt*dt),p[2]+dt*(R(id+2)-.5)*6];r=[dt*R(id+3)*5,dt*4,dt*3]}
  const g=GR(p,r),c=BRK[(id*7)%4];B(g,Z,Z,[.25,.3,.45],c);S(g,[0,.3,0],Z,[.12,.08,.12],c)}
 const tw=GR([7.3,0,-6],[0,0,-u(13.2,15)*1.4]);
 for(let k=0;k<6;k++)B(tw,[.7,.7+k*1.4,0],Z,[.7,.7,.7],TWR[k],5);
 B(I4,[14.5,2.5,-8],Z,[3,2.5,4.5],[.6,.55,.5]);
 for(let j=0;j<100;j++){
  const q=Math.min(1,Math.max(0,(T-at(13)-R(j)*BAR*.5)/(BAR*1.2))),e=q*q*(3-2*q);
  const sx=12+R(j*3)*5,sy=5+R(j*5)*4,sz=-12+R(j*7)*8,ex=4+R(j*11)*6,ez=-8+R(j*13)*8,p=[sx+(ex-sx)*e,sy+(.18-sy)*e+Math.sin(q*3.14)*2,sz+(ez-sz)*e],rr=[q*R(j)*9,q*5,q*3];
  B(I4,p,rr,[.3,.12,.6],SOCK[j%6]);S(GR(p,rr),[0,0,.5],Z,[.12,.12,.12],SOCK[(j+2)%6])}
 const ad=u(9,16)*6;
 for(let i=0;i<48;i++){
  const dth=i%3?at(15+(i*7%17)*.5):at(29+(i%6)*.4),lie=ss(dth,dth+.3,T)*1.5708,bob=lie>0?0:Math.abs(Math.sin(T*9+i))*.06;
  const g=GR([-22+(i%6)*1.4+ad,0,-5+((i/6)|0)*2.2],[0,Math.PI/2,-lie]);
  B(g,[0,.5+bob,0],Z,[.2,.3,.14],C.g);S(g,[0,1+bob,0],Z,[.14,.14,.14],C.g2);
  S(g,[0,1.13+bob,0],Z,[.16,.09,.16],C.g);B(g,[.12,.55+bob,.25],Z,[.04,.04,.38],C.drk);
  B(g,[0,.75+bob,-.2],Z,[.13,.18,.08],C.felt,6);B(g,[.2,.9+bob,0],Z,[.02,.02,.2],C.drk)}
 for(let j=0;j<12;j++){
  const hold=j>8,dth=hold?at(29.5+(j-9)*.6):at(17+j*.5),lie=ss(dth,dth+.4,T)*1.5708,up=lie>0?0:Math.abs(Math.sin(T*4+j))*.05;
  const g=GR([hold?-3.2:4.5+j*1.2,0,hold?(j-10)*1.6+.4:-4-(j>5)*4],[0,-Math.PI/2,-lie]);
  S(g,[0,1+up,0],Z,[.6,.8,.5],C.brn,1);S(g,[0,2+up,0],Z,[.5,.45,.45],C.brn,1);
  S(g,[.3,2.4+up,0],Z,[.15,.15,.1],C.brn,1);S(g,[-.3,2.4+up,0],Z,[.15,.15,.1],C.brn,1);
  S(g,[0,1.85+up,.45],Z,[.22,.16,.16],C.tan,1);
  S(g,[.6,1.1+up,.1],Z,[.22,.5,.22],C.brn,1);S(g,[-.6,1.1+up,.1],Z,[.22,.5,.22],C.brn,1);
  S(g,[.35,.3,.3],Z,[.28,.3,.28],C.brn,1);S(g,[-.35,.3,.3],Z,[.28,.3,.28],C.brn,1);
  S(g,[.18,2.1+up,.4],Z,[.06,.06,.06],C.drk);S(g,[-.18,2.1+up,.4],Z,[.06,.06,.06],C.drk);
  B(g,[0,.9+up,.45],Z,[.25,.06,.05],C.red,1);
  if(j==0)B(g,[0,1.2+up,.5],Z,[.14,.14,.03],C.gold)}
 const ru=u(32,34),rb=GR([mx(6.5,-2,ru),mx(0,2.1,ru),mx(0,-22,ru)],[0,-Math.PI/2,0]),hop=Math.abs(Math.sin(T*3))*.1*(1-ru);
 S(rb,[0,1+hop,0],Z,[.6,.7,.6],C.wht,1);S(rb,[0,2+hop,0],Z,[.45,.42,.42],C.wht,1);
 S(rb,[.15,2.9+hop,0],Z,[.12,.45,.1],C.wht,1);S(rb,[-.15,2.9+hop,0],Z,[.12,.45,.1],C.wht,1);
 S(rb,[.2,2.2+hop,.35],Z,[.06,.06,.06],C.drk);S(rb,[-.2,2.2+hop,.35],Z,[.06,.06,.06],C.drk);
 for(let k=0;k<4;k++){
  const dq=u(15.8+k*.5,17+k*.5),pt=[mx(20-k,12-k*1.5,dq),mx(5.5,.3,dq*dq),mx(-19+k*.8,-6-k*1.2,dq)],co=u(16.2+k*.5,16.6+k*.5)*(1-u(17.2+k*.5,17.8+k*.5)),pg=GR(pt,[0,0,(1-dq)*.6]);
  S(pg,[0,1,0],Z,[.25,.45,.2],C.felt,6);S(pg,[0,1.7,0],Z,[.2,.2,.2],C.skin);
  S(pg,[0,3.1,0],Z,[1.8*co+.02,.6*co+.02,1.8*co+.02],C.canopy,6);
  for(const x of[-1,1])B(pg,[x*.8*co,1.9,0],[0,0,x*.3],[.02,1.1*co+.02,.02],C.drk)}
 const tx=-28+u(19,27)*36,rc=[19.5,22.5,24].reduce((m,b)=>{const d=T-at(b);return d>=0&&d<.4?Math.max(m,.5*(1-d/.4)):m},0),tk=GR([tx,0,-16]);
 B(tk,[0,.9,0],Z,[2.2,.6,1.4],C.olv);B(tk,[0,.4,1.4],Z,[2.3,.36,.36],C.rubber,7);B(tk,[0,.4,-1.4],Z,[2.3,.36,.36],C.rubber,7);
 B(tk,[0,1.7,0],Z,[1.2,.5,1],C.olv);B(tk,[2.6-rc,1.7,0],Z,[1.4,.14,.14],C.metal,4);
 B(tk,[-.2,2.3,-.5],Z,[.25,.1,.25],C.metal,4);B(tk,[-.8,3.1,-.5],[0,0,.1],[.04,1.1,.04],C.metal,4);
 B(tk,[3.9-rc,1.7,0],Z,[.2,.2,.2],C.drk,4);
 for(let k=0;k<6;k++)for(const z of[1.4,-1.4])S(tk,[-1.6+k*.64,.36,z],Z,[.2,.2,.14],C.rubber,7);
 const cx=mx(-34,-9,u(22,25.5)),cr=u(25.6,26)*.6,cg=GR([cx,0,-8.5],[0,0,cr]);
 B(cg,[0,.7,0],Z,[1.4,.4,.8],C.car,4);B(cg,[-.2,1.4,0],Z,[.8,.35,.7],C.car,4);
 B(cg,[.4,1.4,0],Z,[.05,.3,.6],C.glass,4);B(cg,[-.6,1.4,0],Z,[.05,.3,.6],C.glass,4);
 for(const z of[.5,-.5])S(cg,[1.45,.7,z],Z,[.1,.1,.1],C.lamp);
 S(cg,[-.4,1.2,.1],Z,[.2,.2,.2],C.skin);B(cg,[-.4,.9,0],Z,[.15,.3,.15],C.g,0);
 for(const[x,z]of[[.9,.85],[.9,-.85],[-.9,.85],[-.9,-.85]]){S(cg,[x,.3,z],Z,[.35,.35,.2],C.rubber,7);S(cg,[x,.3,z],Z,[.18,.18,.22],C.metal,4)}
 B(GR([-5,1.6,2],[0,Math.PI/2,0]),Z,Z,[1.9,1.6,.7],C.yel,2);
 B(GR([-5,1.6,2],[0,Math.PI/2,0]),[0,-.8,0],Z,[1.95,.3,.75],C.red,2);
 for(const[eb,P]of EV){const d0=T-at(eb);if(d0<0||d0>2.5)continue;
  for(let j=0;j<130;j++){const id=eb*100+j,ty=j<50?0:j<85?1:j<110?2:3,an=R(id)*6.283,sp=(ty?2.2:4)+R(id+.5)*3.5,g=ty==1?.5:ty==2?6:3.5,vy=(.5+R(id+.2))*sp,
   x=P[0]+Math.cos(an)*sp*d0*.5,y=Math.max(.06,P[1]+vy*d0-g*d0*d0*.5),z=P[2]+Math.sin(an)*sp*d0*.5;
   if(ty==0)B(I4,[x,y,z],[d0*9+id,d0*6,d0*4],[.09,.012,.06],POP[j%6]);
   else if(ty==1)S(I4,[x,y,z],Z,[.09,.09,.09],C.wht,1);
   else if(ty==2)S(I4,[x,y,z],[d0*5,0,0],[.07,.07,.07],[.98,.9,.6]);
   else S(I4,[x,y,z],[an,d0*3,0],[.1,.02,.02],C.wht,1)}}
 if(T>at(38)){const d=T-at(38);for(let j=0;j<150;j++){const y=14-((d*1.5+R(j)*14)%14);B(I4,[R(j*2)*26-13,y,R(j*3)*26-13],[d*4+j,d*3,j],[.09,.012,.06],POP[j%6])}}
 B(I4,[32,4,-9.6],Z,[.4,4.2,.4],C.wood,5);B(I4,[32,4,-2.4],Z,[.4,4.2,.4],C.wood,5);B(I4,[32,8.3,-6],Z,[.4,.4,4],C.wood,5);
 B(I4,[31.6,4,-6],Z,[.25,4,3.5],C.lamp,8);
 S(I4,[31.2,4,-5],Z,[.12,.12,.12],C.metal,4);scene2(T,u);scene3(T,u);
}
function scene2(T,u){
 if(T>at(25.4)&&T<at(28.2)){const p=u(25.5,28.2),SP=[mx(-26,8,p),7,-6],sd=unit([4,-7,6]),L=4.7;
  S(I4,SP.map((v,i)=>v+sd[i]*L),[Math.asin(-sd[1]),Math.atan2(sd[0],sd[2]),0],[1.2,1.2,L],C.lamp,9)}
 for(let k=0;k<8;k++){const v=u(33+k*.2,35.5+k*.2),dth=at(36.5+k*.3),lie=ss(dth,dth+.3,T)*1.5708,p=[-6+k*1.8,mx(0,2.1,v),mx(-16,-19.6,v)],g=GR(p,[0,Math.PI,-lie]);
  B(g,[0,.5,0],Z,[.2,.3,.14],C.g);S(g,[0,1,0],Z,[.14,.14,.14],C.g2);S(g,[0,1.13,0],Z,[.16,.09,.16],C.g);B(g,[.12,.55,.25],Z,[.04,.04,.38],C.drk)}
 B(GR([-3.9,1.2,-18.2],[-1.1,0,0]),Z,Z,[.1,1.9,.1],C.wood,5);B(GR([-3.1,1.2,-18.2],[-1.1,0,0]),Z,Z,[.1,1.9,.1],C.wood,5);
 for(let k=0;k<5;k++)B(GR([-3.5,.6+k*.4,-18.4]),Z,Z,[.45,.04,.04],C.wood,5);
 S(I4,[12,.6,12],Z,[.6,.5,.45],C.yel,7);S(I4,[12.5,1.25,12],Z,[.38,.38,.38],C.yel,7);B(I4,[12.9,1.1,12],Z,[.2,.1,.12],[1,.5,.1],7);
 B(GR([-12,0,4],[.15*Math.sin(T*9),T*20,0]),[0,.9,0],Z,[.35,.9,.35],C.wood,5);
 const dn=GR([-14,0,14],[0,.8,0]);B(dn,[0,1,0],Z,[1.2,.5,.5],C.g);B(dn,[.9,1.9,0],Z,[.5,.5,.35],C.g);B(dn,[1.3,1.9,0],Z,[.4,.2,.25],C.g2);B(dn,[-1.3,1.1,0],Z,[.8,.25,.25],C.g);
 for(const z of[.3,-.3])B(dn,[0,.4,z],Z,[.2,.4,.12],C.g);
 const mo=GR([10,0,-12],[0,-.6,0]);S(mo,[0,.5,0],Z,[.6,.4,.9],C.metal,4);S(mo,[0,1,.8],Z,[.35,.35,.35],C.metal,4);
 for(const x of[-.3,.3])S(mo,[x,1.3,.5],Z,[.12,.12,.04],C.tan,4);B(mo,[0,.8,-1.2],[.3,0,0],[.04,.04,.9],C.drk,7);
 for(let k=0;k<8;k++)S(I4,[R(k*31)*30-15,.25,R(k*37)*20-10],Z,[.25,.25,.25],POP[k%6]);
 for(let k=0;k<40;k++)S(I4,[31+R(k)*.8,R(k*2)*8,-9+R(k*3)*6+Math.sin(T+k)*.2],Z,[.05,.05,.05],C.lamp,8);
}
function scene3(T,u){
 const sd=(x,z,r)=>S(I4,[x,.02,z],Z,[r,.01,r],C.sh,12);
 if(T<at(3)){
  B(I4,[-6,6.5,-29.2],Z,[6,3.2,.12],C.wood,5);
  B(I4,[-6,6.5,-28.98],Z,[5.6,2.8,.04],[.85,.7,.45],6);
  for(let k=0;k<8;k++)S(I4,[-11+k*1.9,6.6+(k%3)*.9,-28.8],Z,[.14,.14,.14],C.red);
  for(let k=0;k<7;k++)B(GR([-10+k*1.9,6.5+(k%2)*.4,-28.8],[0,0,k%2?.4:-.3]),Z,Z,[1,.03,.03],C.drk,7);
  for(let k=0;k<6;k++)B(GR([-9.4+k*1.5,5.4+(k%2)*.8,-28.9],[0,0,k*.4]),Z,Z,[.8,.04,.02],[.1,.2,.7],6);
  const g=GR([-9,0,-24.5],[0,Math.PI,0]);
  B(g,[0,.5,0],Z,[.2,.3,.14],C.g);S(g,[0,1,0],Z,[.14,.14,.14],C.g2);S(g,[0,1.13,0],Z,[.16,.09,.16],C.g);
  B(g,[.45,1.2,.3],[-.9,0,0],[.07,.07,.5],C.g);
  sd(-9,-24.5,.5)}
 if(T>at(45)&&T<at(53)){
  B(I4,[0,.6,30],Z,[14,.6,8],C.wht);
  B(I4,[0,4.5,21.6],Z,[14,4,.5],C.wht);B(I4,[0,4.5,38.4],Z,[14,4,.5],C.wht);
  B(I4,[-13.6,4.5,30],Z,[.5,4,8],C.wht);B(I4,[13.6,4.5,30],Z,[.5,4,8],C.wht);
  B(I4,[0,3.4,30],Z,[13.2,.1,7.3],[.2,.5,.7],10);
  for(let k=0;k<4;k++){const x=-9+k*6+Math.sin(T*.7+k)*1.2,z=26+(k%2)*6+Math.cos(T*.5+k)*.6,h=GR([x,3.6+Math.sin(T*2+k)*.1,z],[Math.sin(T*.8+k)*.05,Math.cos(T*.6+k)*.3,0]);
   B(h,Z,Z,[1.6,.5,.6],[[.8,.1,.1],[.1,.3,.8],[.9,.7,.1],[.2,.6,.3]][k]);B(h,[0,1.2,0],Z,[.05,1,.05],C.wht);B(h,[0,1.2,.3],Z,[.02,.7,.5],[.95,.95,.9],6)}
  const dk=GR([-2+Math.sin(T*.4)*2,3.6,33],[0,Math.sin(T*.3)*.2,.04*Math.sin(T*2)]);
  S(dk,[0,2,0],Z,[3,2.4,2.2],C.yel,7);S(dk,[1.8,4.6,0],Z,[1.6,1.6,1.6],C.yel,7);B(dk,[3.1,4.4,0],Z,[.8,.4,.6],[1,.5,.1],7);
  B(dk,[0,4.8,0],Z,[2.2,.15,1.6],C.olv);B(dk,[-.4,5.1,.2],Z,[.5,.15,.4],C.red);B(dk,[.6,5.1,-.4],Z,[.5,.15,.4],C.blu);
  sd(-2,33,1.2)}
 if(T>at(52)&&T<at(65)){
  for(let k=0;k<6;k++){const a=T*.6+k*1.05,rd=9+k*1.1,g=GR([22+Math.cos(a)*rd,6+Math.sin(k)*1.5,-20+Math.sin(a)*rd],[0,-a+Math.PI/2,.25*Math.sin(a*2)]);
   B(g,Z,Z,[.1,.03,1.2],C.wht,2);B(g,[0,0,.2],Z,[.9,.02,.3],C.wht,2)}
  const hg=GR([22+Math.cos(T)*6,9,-20+Math.sin(T)*6],[0,-T,0]);
  S(hg,Z,Z,[1.2,.9,.9],C.car,4);B(hg,[-1.8,.2,0],Z,[1.2,.15,.15],C.car,4);B(hg,[0,1.2,0],[0,T*30,0],[1.8,.05,.1],C.drk,4);
  for(let k=0;k<3;k++)S(I4,[22+Math.cos(T*3+k*2)*5,8+k,-20+Math.sin(T*3+k*2)*5],Z,[.2,.2,.2],C.lamp,9);
  sd(22,-20,8)}
 if(T>at(58)&&T<at(66)){
  const w=T-at(58);
  B(I4,[-32,2,6],Z,[7,2,6],[.85,.9,.95]);B(I4,[-32,2,12.1],Z,[7.2,2.2,.2],[.8,.85,.9]);
  for(let k=0;k<50;k++)S(I4,[R(k*41)*30-24,.1,R(k*43)*30-2],Z,[.4,.12,.4],C.wht,11);
  for(let k=0;k<70;k++)S(I4,[R(k*7)*40-20,.1,R(k*9)*30-5],Z,[.3,.1,.3],C.wht,6);
  for(let k=0;k<10;k++)S(I4,[-32+R(k)*10-5,2.5+R(k*2)*2,6+R(k*3)*4],Z,[2.4,1.2,2.4],C.wht,9);
  for(let k=0;k<8;k++){const x=-20+((k*3.1+w*.7)%24),z=-2+(k%2)*4,g=GR([x,0,z],[0,Math.PI/2,0]),bb=Math.abs(Math.sin(T*5+k))*.1;
   B(g,[0,.5+bb,0],Z,[.2,.3,.14],C.g);S(g,[0,1+bb,0],Z,[.14,.14,.14],C.g2);S(g,[0,1.13+bb,0],Z,[.16,.09,.16],C.g);B(g,[.12,.55+bb,.25],Z,[.04,.04,.38],C.drk);sd(x,z,.4)}}
 if(T>at(65)){
  B(I4,[6,.6,-6],Z,[4,.6,3],[.6,.4,.2],2);B(I4,[6,1.6,-6],Z,[3,.6,2.2],[.62,.42,.22],2);B(I4,[6,2.6,-6],Z,[2,.4,1.4],[.64,.44,.24],2);
  for(let k=0;k<3;k++){const x=4.6+k*1.4,g=GR([x,3,-6.2],[0,Math.PI/2,0]),bb=Math.sin(T*2+k)*.02;
   S(g,[0,1+bb,0],Z,[.5,.6,.4],C.brn,1);S(g,[0,1.9,0],Z,[.4,.4,.4],C.brn,1);S(g,[0,1.6,.4],Z,[.1,.1,.05],C.gold);
   S(I4,[x,Math.max(3.6,12-Math.max(0,T-at(66+k*.5))*6),-6.2],Z,[.25,.25,.08],C.gold,4)}
  sd(6,-6,2.6)}
}
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o};
const link=(v,f)=>{const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);return p};
const VS=`#version 300 es
layout(location=0) in vec3 P;layout(location=1) in vec3 N;
layout(location=2) in vec4 M0;layout(location=3) in vec4 M1;layout(location=4) in vec4 M2;layout(location=5) in vec4 M3;
layout(location=6) in vec4 C;
uniform mat4 VP;uniform float T,BM;
out vec3 wp,wn,lp,co;out float mt;
void main(){mat4 M=mat4(M0,M1,M2,M3);vec3 q=P;if((C.w==9.)!=(BM>.5)){gl_Position=vec4(9.);return;}
if(C.w==1.)q+=N*.05*sin(P.x*9.+P.y*7.+T*.8)*sin(P.z*6.+T*.5);
vec4 w=M*vec4(q,1.);wp=w.xyz;wn=mat3(M)*N;lp=P;co=C.rgb;mt=C.w;gl_Position=VP*w;}`;
const FS=`#version 300 es
precision highp float;
in vec3 wp,wn,lp,co;in float mt;
uniform vec3 EY,SP,SD;uniform float LA,FL,FX,SA,T;
out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
void main(){
vec3 N=normalize(wn),V=normalize(EY-wp),K=normalize(vec3(-.5,.9,.4)),D=normalize(vec3(1.,.3,-.2));
vec3 c=co;float m=mt;if(m==9.){o=vec4(c*.3*pow(1.-abs(dot(N,V)),1.5)*(1.+.3*sin(wp.y*6.)),1.);return;}
if(m==12.){o=vec4(c,1.);return;}
if(m==10.){N=normalize(N+vec3(sin(wp.x*7.+T*2.)*.05,0.,cos(wp.z*6.+T*1.7)*.05));c=vec3(.12,.38,.52);}
if(m==11.)c=vec3(.9,.95,1.)*(.8+.2*hs(floor(wp.xz*60.)));
if(m==3.){float n=hs(floor(wp.xz*48.));c*=.7+.5*n;c*=.85+.15*sin((wp.x+wp.z)*160.);}
if(m==2.&&lp.y>.35&&lp.y<.6)c=vec3(.85,.1,.05);
if(m==5.)c*=.82+.18*sin((lp.x*5.+sin(lp.y*4.)*.8+lp.z*3.)*14.);
if(m==6.)c*=.9+.1*hs(floor(wp*70.).xz);
if(m==0.&&abs(lp.x)<.04)c*=.75;
float ao=mix(.3,1.,smoothstep(0.,1.2,wp.y));
float nk=dot(N,K);
float wr=m==1.?max((nk+.6)/1.6,0.):m==6.?max((nk+.3)/1.3,0.):max(nk,0.);
float spec=m==7.||m==6.?0.:pow(max(dot(N,normalize(K+V)),0.),m==0.?80.:m==4.?200.:20.)*(m==4.?3.:m==0.?1.2:.3);
float rim=pow(1.-max(dot(N,V),0.),3.);
vec3 lc=vec3(1.,.7,.4)*LA*2.4,fc=vec3(1.,.93,.82)*FL*2.2;
vec3 sv=SP-wp;float dl=length(sv);sv/=dl;
vec3 spc=vec3(1.,.95,.8)*SA*smoothstep(.9,.97,dot(-sv,SD))*max(dot(N,sv),0.)*9./(1.+dl*dl*.02);
vec3 L=lc*wr+fc*max(dot(N,D),0.)+spc+vec3(.09,.07,.06)*(.6+.4*N.y);
vec3 r=c*L*ao;
if(m==4.)r+=c*mix(vec3(.05,.04,.04),vec3(.5,.4,.3),smoothstep(-.2,.8,N.y));
if(m==1.)r+=c*(rim*.5+pow(max(dot(V,-K),0.),2.)*.6)*lc*ao;
r+=lc*spec*ao+c*FX*.6+c*rim*.12*(m==0.?1.:0.);
if(m==0.)r+=c*pow(max(dot(V,-K),0.),3.)*.15*lc;
if(m==8.)r=c*2.6;
o=vec4(r,1.);}`;
const VP_=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const FP=`#version 300 es
precision highp float;
uniform sampler2D S;uniform vec2 RS;uniform float FX,FL;
out vec4 o;
void main(){
vec2 p=gl_FragCoord.xy/RS,q=p-.5;float dy=abs(p.y-.5)*2.;
float k=smoothstep(.2,1.,dy),rr=k*16.*RS.y/900.;
vec3 s=texture(S,p).rgb,b=vec3(0.);
for(int i=0;i<16;i++){float a=float(i)*2.4,r2=sqrt((float(i)+.5)/16.);b+=texture(S,p+vec2(cos(a),sin(a))*rr*r2/RS).rgb;}
b/=16.;
vec3 c=mix(s,b,k);
c+=max(b-.6,vec3(0.))*.5;
c*=1.-.9*dot(q,q);
c*=vec3(1.05,1.,.9);
c+=FX*vec3(1.,.9,.7)*.5+FL*vec3(1.,.95,.85)*(.35+.65*p.x);
c=1.-exp(-c*1.3);
c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9,78.2)))*43758.5)-.5)*.03;
o=vec4(c,1.);}`;
const po=link(VS,FS),pp=link(VP_,FP),U=(p,n)=>gl.getUniformLocation(p,n);
const uVP=U(po,'VP'),uT=U(po,'T'),uEY=U(po,'EY'),uLA=U(po,'LA'),uFL=U(po,'FL'),uFX=U(po,'FX'),uSP=U(po,'SP'),uSD=U(po,'SD'),uSA=U(po,'SA'),uBM=U(po,'BM');
const uS=U(pp,'S'),uRS=U(pp,'RS'),uFX2=U(pp,'FX'),uFL2=U(pp,'FL');
function geo(kind){const V=[],I=[];
 if(kind==0){for(let i=0;i<3;i++)for(const s of[-1,1]){const j=(i+1)%3,k=(i+2)%3,b=V.length/6;
  for(const[cj,ck]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const p=[0,0,0],n=[0,0,0];p[i]=n[i]=s;p[j]=cj;p[k]=ck;V.push(...p,...n)}
  I.push(b,b+1,b+2,b,b+2,b+3)}}
 else{for(let y=0;y<=12;y++)for(let x=0;x<=16;x++){const th=y/12*Math.PI,ph=x/16*2*Math.PI,p=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];V.push(...p,...p)}
  for(let y=0;y<12;y++)for(let x=0;x<16;x++){const a=y*17+x,b=a+17;I.push(a,b,a+1,a+1,b,b+1)}}
 return[new Float32Array(V),new Uint16Array(I)]}
function vao(kind){const[V,I]=geo(kind),v=gl.createVertexArray(),vb=gl.createBuffer(),ib=gl.createBuffer(),ix=gl.createBuffer();
 gl.bindVertexArray(v);
 gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,V,gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
 gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ix);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,I,gl.STATIC_DRAW);
 gl.bindBuffer(gl.ARRAY_BUFFER,ib);
 for(let k=0;k<5;k++){gl.enableVertexAttribArray(2+k);gl.vertexAttribPointer(2+k,4,gl.FLOAT,false,80,16*k);gl.vertexAttribDivisor(2+k,1)}
 gl.bindVertexArray(null);
 return{v,ib,n:I.length}}
const BOX=vao(0),SPH=vao(1),EMPTY=gl.createVertexArray();
let W_=0,H_=0,MS=null,RT=null;
function size(){const d=Math.min(devicePixelRatio||1,1.5),n=Math.min(4,gl.getParameter(gl.MAX_SAMPLES)||0);W_=cv.width=Math.round(innerWidth*d);H_=cv.height=Math.round(innerHeight*d);
 MS=gl.createFramebuffer();const cb=gl.createRenderbuffer(),db=gl.createRenderbuffer();
 gl.bindFramebuffer(gl.FRAMEBUFFER,MS);
 gl.bindRenderbuffer(gl.RENDERBUFFER,cb);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,n,gl.RGBA8,W_,H_);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,cb);
 gl.bindRenderbuffer(gl.RENDERBUFFER,db);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,n,gl.DEPTH_COMPONENT24,W_,H_);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,db);
 const f=gl.createFramebuffer(),t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W_,H_,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const[p,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
 gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
 RT={f,t};gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],crs=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
const view=(e,g)=>{const z=unit(e.map((v,i)=>v-g[i])),x=unit(crs([0,1,0],z)),y=crs(z,x);
 return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]};
const proj=(f,a,n,F)=>{const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(F+n)/(n-F),-1,0,0,2*F*n/(n-F),0]};
const draw=(m,arr,n)=>{gl.bindVertexArray(m.v);gl.bindBuffer(gl.ARRAY_BUFFER,m.ib);gl.bufferData(gl.ARRAY_BUFFER,arr.subarray(0,n*20),gl.DYNAMIC_DRAW);gl.drawElementsInstanced(gl.TRIANGLES,m.n,gl.UNSIGNED_SHORT,0,n)};
const CAP=[[0,2.9,'DAY 3. THE BOOKSHELF HAS FALLEN.'],[3,5.9,'THE PLUSH DIVISION ADVANCES AT DAWN.'],[6.5,9.4,'CARPET SECTOR 4. THE GREEN LINE HOLDS.'],[12.5,15.2,'AN AVALANCHE OF SOCKS IS UNDERWAY.'],[15.6,18.2,'A PARATROOPER DROPS FROM THE BED.'],[18.6,21.4,'THE BRICK FORTRESS HAS FALLEN.'],[22.4,25.2,'THE DIE-CAST CHARGE BEGINS ON THE RUG.'],[25.6,28,'NIGHT RAID. ONLY THE FLASHLIGHT SEES.'],[28.4,33.4,'LAST STAND BEHIND THE CEREAL BOX.'],[34,36.6,'THE BOOKSHELF SIEGE. THE RABBIT HOLDS THE TOP SHELF.'],[37.4,41.6,'THE PLUSH DIVISION HOLDS THE CARPET.'],[45.4,47.8,'THE BATHTUB FLEET ENGAGES AT FULL SOAP.'],[52.6,55,'PAPER AIRCRAFT CONTACT OVER THE BED.'],[58.6,61.2,'THE FREEZER DRAWER IS OPEN. WINTER CAMPAIGN.'],[65.4,67.8,'MEDAL CEREMONY ON THE SHOEBOX PODIUM.'],[70.2,71.7,'MOM: "DINNER!"']];
const cp=$('cp'),en=$('en'),ti=$('ti');let ct='';
function caps(r){let txt='',op=0;for(const[a,b,s]of CAP)if(r>=a*BAR&&r<b*BAR){const u=r-a*BAR;txt=s.slice(0,Math.floor(u*24));op=Math.min(1,u*4,(b*BAR-r)*4)}
 if(txt!==ct){cp.textContent=txt;ct=txt}cp.style.opacity=op}
let song=null,actx=null;
function go(){if(actx)return;actx=new(window.AudioContext||window.webkitAudioContext)();actx.resume();song=SONG.live(actx,0);ti.style.opacity=0}
addEventListener('pointerdown',go);addEventListener('keydown',go);
gl.enable(gl.DEPTH_TEST);addEventListener('resize',size);size();
function frame(){
 const r=song?actx.currentTime-song.base:-1,T=W(Math.max(r,0)),c=camAt(T);
 build(T);
 let FX=0;for(const[b]of EV){const d=T-at(b);if(d>=0&&d<1.5)FX+=Math.exp(-d*6)*.4}
 const off=ss(25.4*BAR,25.5*BAR,r)*(1-ss(28.2*BAR,28.3*BAR,r)),LA=ss(3*BAR,3*BAR+.2,r)*(1-off),FL=ss(72.5*BAR,73.5*BAR,r),p=ss(25.5*BAR,28.2*BAR,r);
 const SP=[mx(-26,8,p),7,-6],sd=unit([4,-7,6]);
 caps(r);en.style.opacity=ss(73.8*BAR,74.8*BAR,r);
 const VP=mm(proj(c.fov,W_/H_,.05,500),view(c.e,c.g));
 gl.bindFramebuffer(gl.FRAMEBUFFER,MS);gl.viewport(0,0,W_,H_);gl.clearColor(.02,.015,.012,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.useProgram(po);gl.uniformMatrix4fv(uVP,false,VP);gl.uniform1f(uT,T);gl.uniform3fv(uEY,c.e);gl.uniform1f(uLA,LA);gl.uniform1f(uFL,FL);gl.uniform1f(uFX,FX);
 gl.uniform3fv(uSP,SP);gl.uniform3fv(uSD,sd);gl.uniform1f(uSA,off);
 gl.uniform1f(uBM,0);draw(BOX,IB,nb);draw(SPH,IS,ns);gl.uniform1f(uBM,1);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);draw(SPH,IS,ns);gl.depthMask(true);gl.disable(gl.BLEND);
 gl.bindFramebuffer(gl.READ_FRAMEBUFFER,MS);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,RT.f);gl.blitFramebuffer(0,0,W_,H_,0,0,W_,H_,gl.COLOR_BUFFER_BIT,gl.NEAREST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W_,H_);gl.useProgram(pp);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT.t);
 gl.uniform1i(uS,0);gl.uniform2f(uRS,W_,H_);gl.uniform1f(uFX2,FX);gl.uniform1f(uFL2,FL);
 gl.bindVertexArray(EMPTY);gl.drawArrays(gl.TRIANGLES,0,3);
 requestAnimationFrame(frame)}
window.__probe={dur:72*BAR,cam:t=>camAt(W(t)).e,boxes:[[-14,0,21.5,14,9,38.5],[-.3,0,-6,.6,3,6],[7.3,0,-6.7,8.7,6,-5.3],[-5.7,0,.1,-4.3,3.2,3.9],[15,0,-25,29,5.6,-15],[-9,0,-25.2,9,2,-18.8],[31.4,0,-9.8,32.4,8.4,-1.8]]};
requestAnimationFrame(frame);
})();
