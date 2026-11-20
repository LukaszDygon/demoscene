const WHT=[.99,.98,.96],CR=[.98,.94,.86],SAL=[.98,.58,.52],MINT=[.66,.91,.8],BUT=[1,.9,.5],BLU=[.68,.82,.98],WOOD=[.96,.82,.64],PIN=[.98,.74,.82],SILV=[.86,.88,.93],STEEL=[.5,.55,.66],GRN=[.56,.86,.7],GOLD=[.97,.84,.5],TOAST=[.93,.66,.36],MARB=[.55,.75,.95],LAV=[.82,.76,.96],PEACH=[1,.8,.68],DARK=[.45,.4,.5],SKY=[.8,.92,1],TILE=[.9,.72,.5];
const PAL=[SAL,MINT,BUT,BLU,PIN,LAV,PEACH,GRN];
// shell: back wall, side walls, floors, roof
bx(-8.5,0,-.5,11,-2.5,-2.1,MINT);
bx(0,8.5,-.5,11,-2.5,-2.1,BLU);
sbx(-8.7,-8.5,-.5,11,-2.5,2.1,CR);
bx(-8.7,0,-.5,0,-2.5,2.1,WOOD);
bx(0,8.7,-.5,0,-2.5,2.1,WOOD);
bx(-.8,0,7.5,8,-2.5,2.1,WOOD);
bx(0,8.7,7.5,8,-2.5,2.1,WOOD);
bx(-8.9,0,11,11.4,-2.5,2.4,SAL);
bx(0,8.9,11,11.4,-2.5,2.4,SAL);
// wallpaper stripes and dots
for(let i=0;i<17;i++){const x=-8.4+i*.5;bx(x,x+.14,-.5,11,-2.1,-2.07,i&1?[.76,.95,.86]:MINT)}
for(let i=0;i<16;i++){const x=.1+i*.5;bx(x,x+.14,-.5,11,-2.1,-2.07,i&1?[.86,.93,1]:BLU)}
for(let i=0;i<17;i++)for(let j=0;j<8;j++)if((i+j)&1)O(TR(-8+i*.5,.6+j*1.3,-2.05),sph(.09),WHT,-8);
for(let i=0;i<16;i++)for(let j=0;j<8;j++)if((i+j)&1)O(TR(.5+i*.5,.6+j*1.3,-2.05),sph(.09),WHT,1);
// parquet tiles on the two floors
for(let i=0;i<19;i++)for(let j=0;j<5;j++){const x=-8.6+i*.9,z=-2.4+j*.9,c=(i+j)&1?TILE:WOOD;
 bx(x,x+.9,0,.02,z,z+.9,c);if(x+.9>-.8)bx(Math.max(x,-.8),x+.9,8,8.02,z,z+.9,c)}
// parlour: rug, bookcase, lamp, sofa
bx(-7.9,-2.4,0,.03,.2,1.7,PEACH);
bx(-7.9,-2.4,.03,.05,.2,.3,SAL);bx(-7.9,-2.4,.03,.05,1.6,1.7,SAL);
bx(-8.4,-7.4,0,3.8,-2.1,-1.2,WOOD);
for(let r=0;r<4;r++){const y=r*.95;bx(-8.4,-7.4,y+.9,y+.94,-2.1,-1.2,WOOD);
 for(let k=0;k<6;k++){const x=-8.3+k*.16,h=.5+hs(r,k)*.35;bx(x,x+.12,y+.94,y+.94+h,-1.9,-1.4,PAL[(r*6+k)%8])}}
O(TR(-5,.7,2),cyl(.03,.03,1.4),DARK,-5);
O(TR(-5,1.5,2),cyl(.2,.35,.4),BUT,-5,0,.4);
bx(-8.4,-7.4,0,.9,-2,-.6,SAL);bx(-8.4,-7.4,.9,1.7,-2,-1.7,SAL);
// stairs: sixteen steps from the top floor down to the parlour
for(let k=0;k<16;k++){const x1=-.8-.4*k;bx(x1-.4,x1,-.5,7.5-.5*k,-.7,.7,k&1?PIN:CR)}
// top floor: bedroom, dresser and drawer, bed, sconce
bx(1.4,3.2,8,9.6,-1.6,.4,BUT);
bx(4.6,7.8,8,8.7,-1.8,.2,MINT);
bx(4.8,5.6,8.7,8.95,-1.8,-1.5,WHT);
bx(4.8,7.6,8.7,9.2,-1.8,-1.7,PIN);
bx(4,5.4,9.2,10.4,-2.05,-2,WOOD);bx(4.2,5.2,9.4,10.2,-2,-1.98,PEACH);
O(t=>TR(2.3,8.55,.55+.9*sl(ph(E.drawer,E.drawer+.5,t))),bxm(1.6,.7,.3),SAL,1.4);
// attic window and curtains in the upper-left void
bx(-6.3,-4.3,9.1,10.5,-2.05,-2,SKY);
bx(-6.7,-6.4,8.6,10.9,-2,-1.8,PIN);bx(-4.2,-3.9,8.6,10.9,-2,-1.8,PIN);bx(-6.4,-4.2,10.5,10.6,-2.05,-2,WOOD);
bx(-6.4,-4.2,9.05,9.1,-2.05,-1.9,WOOD);
bx(-7.8,-5.2,9.6,9.7,-2.1,-1.6,WOOD);
O(TR(-7.5,9.9,-1.85),sph(.2),GRN,-7.5);O(TR(-7.1,10.1,-1.8),sph(.15),PIN,-7);
// conservatory: plants, cannon, crate, piano and hammer
for(let i=0;i<5;i++){const x=1.3+i*1.1;O(TR(x,.25,-1.3),cyl(.3,.25,.5),SAL,x);O(TR(x,.95,-1.3),sph(.45),GRN,x);O(TR(x+.2,1.3,-1.15),sph(.3),MINT,x)}
bx(1.2,2.4,0,.5,.5,1.3,BUT);
O(t=>{const dc=t-T(E.cannon),rc=dc>0?.3*Math.exp(-dc*8):0;return mm(TR(1.8,.7,.9),mm(RZ(-.9),TR(0,-rc,0)))},cyl(.16,.16,1.1),STEEL,1.8);
const CBALL=sph(.18);
O(t=>{const p=ph(E.cannon,E.hit,t);if(t<T(E.cannon)||p>=1)return TR(0,-50,0);return TR(2.23+2.97*p,1.04-.14*p+1.8*p*(1-p),.9)},CBALL,STEEL,2.2,.5);
bx(4.8,5.6,0,.8,.4,1.2,SAL);
bx(6.2,8.2,0,1,-1.3,-.5,LAV);
for(let i=0;i<24;i++){const x=6.27+i*.08;bx(x,x+.06,.9,.98,-.5,-.28,i%3===1?DARK:WHT)}
for(const x of[6.3,8.1])O(TR(x,.4,-.9),cyl(.05,.05,.8),DARK,x);
O(t=>mm(TR(6,2.6,-.3),mm(RZ(t<T(E.hit)?-1.3:t<T(E.piano)?-1.3*(1-sl(ph(E.hit,E.piano,t))):0),TR(0,-.95,0))),bxm(.14,1.9,.14),BUT,6);
// hall: lever and post, chandelier, pendulum clock
bx(-.12,.12,0,2.2,.7,.9,BUT);
const tc=T(E.cut),tr=T(E.crash);
O(t=>mm(TR(0,2.2,.8),mm(RZ(.7*sl(ph(E.lever,E.lever+.3,t))),TR(-.5,0,0))),bxm(1,.14,.22),BUT,0);
bx(.2,.8,0,2.8,-1.8,-1.2,WOOD);bx(.3,.7,1.8,2.5,-1.2,-1.15,CR);
O(t=>mm(TR(.5,2.6,-1.1),mm(RZ(.25*Math.cos(t*4.2)),TR(0,-.9,0))),cyl(.02,.02,1.8),GOLD,.5);
const CHY=t=>t<tc?5.9:5.9-5.4*Math.pow(cl((t-tc)/(tr-tc)),2);
const CHR=t=>t<tr?0:.5*sl(cl((t-tr)/.3));
const G=t=>mm(TR(0,CHY(t),0),RZ(CHR(t)));
O(t=>t<tc?TR(0,6.7,0):TR(0,-50,0),cyl(.02,.02,1.6),SILV,0);
const LC=(m,ms,c,sp,em)=>O(t=>mm(G(t),m),ms,c,0,sp,em);
LC(TR(0,-.1,0),sph(.28),GOLD,.6);
LC(TR(0,-.25,0),cyl(.75,.75,.06),GOLD,.4);
LC(TR(0,-.7,0),cyl(.45,.45,.06),GOLD,.4);
for(let k=0;k<8;k++)LC(TR(.75*Math.cos(k*Math.PI/4),-.42,.75*Math.sin(k*Math.PI/4)),sph(.1),WHT,.9,.25);
for(let k=0;k<6;k++)LC(TR(.45*Math.cos(k*Math.PI/3),-.95,.45*Math.sin(k*Math.PI/3)),sph(.1),BLU,.9,.25);
// chain: dominoes, title domino, marble, toaster, toast
const DM=bxm(.08,1,.5);
const TP=(x,z,t0)=>t=>mm(TR(x+.04,0,z),mm(RZ(-(Math.PI/2-.03)*sl(cl((t-t0)/.25))),TR(-.04,.5,0)));
const DC=[WHT,SAL,MINT];
for(let i=0;i<18;i++)O(TP(-6.7+i*.182,.9,T(E.dom+i/3)),DM,DC[i%3],-6.7+i*.182,.15);
O(TP(0,4.5,T(E.tap)),DM,WHT,0,.15);
const MB=t=>{
 if(t<T(E.drop))return[2.3,8.45,.55+.9*sl(ph(E.drawer,E.drawer+.5,t))];
 if(t<T(3.8))return[2.3,8.45-.2*Math.pow(ph(E.drop,3.8,t),2),1.45];
 if(t<T(E.stairs)){const p=ph(3.8,E.stairs,t);return[2.3-3.1*p,8.25,1.45-1.45*p]}
 if(t<T(E.dom)){const p=ph(E.stairs,E.dom,t);return[-.8-6.2*p,.25+7.5*(1-p)+.25*Math.abs(Math.sin(16*Math.PI*p)),0]}
 return[-7,.25,0]};
const MBM=t=>{const p=MB(t);return mm(TR(p[0],p[1],p[2]),RZ((2.3-p[0])/.25))};
O(MBM,sph(.25),MARB,-7,.8);
O(t=>mm(MBM(t),TR(.22,0,0)),sph(.07),DARK,-7);
bx(-2.3,-1.5,0,.6,.6,1.2,SILV);
bx(-2.1,-1.7,.6,.66,.8,1,STEEL);
const TOASTM=bxm(.6,.08,.6);
O(t=>{const p=ph(E.pop,E.lever,t);if(t<T(E.pop)||p>=1)return TR(0,-50,0);return mm(TR(-1.9+1.4*p,.9+1.4*p+2*p*(1-p),.9),RZ(4*p))},TOASTM,TOAST,-1.5);
