// upper-left mezzanine above the stairs: bathroom and nursery
bx(-8.7,-1.6,7.5,8,-2.5,2.1,WOOD);
bx(-8.2,-5.6,8,8.1,-1.8,-.6,WHT);
bx(-8.2,-8.1,8.1,8.6,-1.8,-.6,WHT);bx(-5.7,-5.6,8.1,8.6,-1.8,-.6,WHT);
bx(-8.2,-5.6,8.1,8.6,-1.8,-1.7,WHT);bx(-8.2,-5.6,8.1,8.6,-.7,-.6,WHT);
const WL=t=>8.15+.4*ph(E.bath,E.over,t);
O(t=>TR(-6.9,WL(t)-.05,-1.2),bxm(2.3,.1,.95),[.6,.85,1],-6.9,.9);
const BDX=t=>{const w=WL(t);
 if(t<T(E.duck))return[-6.9+.2*Math.sin(t),w+.22+.03*Math.sin(t*5),-1.2];
 if(t<T(E.seesaw)){const s=ph(E.duck,E.seesaw,t);return[-6.9+1*s,(w+.22)+(8.5-w-.22)*s+.3*Math.sin(Math.PI*s),-1.2+1.3*s]}
 if(t<T(E.launch)){const a=.3*sl(ph(E.seesaw,E.launch,t));return[-5.3-.8*Math.cos(a),8.25-.8*Math.sin(a)+.3,.1]}
 const yL=8.25-.24+.3,s=ph(E.launch,E.launch+.5,t);return[-6.1+2.8*s,yL+(8.3-yL)*s+1.6*s*(1-s),.1+.2*s]};
const BDK=t=>{const p=BDX(t);return TR(p[0],p[1],p[2])};
O(t=>BDK(t),sph(.22),BUT,-6,.3);
O(t=>mm(BDK(t),TR(.12,.2,.06)),sph(.13),BUT,-6,.3);
O(t=>mm(BDK(t),TR(.24,.19,.06)),bxm(.1,.05,.08),SAL,-6);
O(t=>mm(TR(-5.3,8.25,.1),RZ(.3*sl(ph(E.seesaw,E.launch,t)))),bxm(1.6,.08,.5),SAL,-5.3);
O(TR(-5.3,8.1,.1),cyl(.05,.4,.3),DARK,-5.3);
O(TR(-5.9,8.9,-1.2),cyl(.03,.03,.5),SILV,-5.9);
O(TR(-7.6,8.25,-.2),cyl(.3,.25,.4),WHT,-7.6);
// nursery: toy piano, rug, a circular track, a wind-up train and three block towers
bx(-4.6,-1.8,8,8.02,-.5,1.9,PIN);
bx(-2.9,-2.1,8,8.8,-1.9,-1.4,CR);
for(let k=0;k<9;k++)bx(-2.85+k*.08,-2.8+k*.08,8.8,8.84,-1.42,-1.36,k&1?DARK:WHT);
const NC=[-3.4,.6],NR=1;
for(let k=0;k<20;k++){const a=2*Math.PI*k/20,th=Math.atan2(-Math.cos(a),-Math.sin(a));
 O(mm(TR(NC[0]+NR*Math.cos(a),8.02,NC[1]+NR*Math.sin(a)),RY(th)),bxm(.26,.03,.1),GOLD,-3.4)}
const NW=3.4/(T(E.t3)-T(E.t1));
const TRA=t=>.8+NW*(t-T(E.t1));
O(t=>{const a=TRA(t),th=Math.atan2(-Math.cos(a),-Math.sin(a)),p=[NC[0]+NR*Math.cos(a),8.1,NC[1]+NR*Math.sin(a)];
 return mm(TR(...p),RY(th))},bxm(.5,.3,.3),SAL,-3.4,.2);
O(t=>{const a=TRA(t),th=Math.atan2(-Math.cos(a),-Math.sin(a));return mm(TR(NC[0]+NR*Math.cos(a),8.1,NC[1]+NR*Math.sin(a)),mm(RY(th),TR(-.55,0,0)))},bxm(.4,.25,.3),BUT,-3.4);
O(t=>{const a=TRA(t),th=Math.atan2(-Math.cos(a),-Math.sin(a));return mm(TR(NC[0]+NR*Math.cos(a),8.1,NC[1]+NR*Math.sin(a)),mm(RY(th),TR(.1,.42,0)))},cyl(.12,.12,.3),STEEL,-3.4);
const FALL=(x,y0,z,t0,w,h,d,dir)=>t=>mm(TR(x+dir*w/2,y0,z),mm(RZ(-dir*(Math.PI/2-.03)*sl(cl((t-t0)/.35))),TR(-dir*w/2,h/2,0)));
for(let k=0;k<3;k++){const an=[.8,2.3,4.2][k],tx=NC[0]+1.5*Math.cos(an),tz=NC[1]+1.5*Math.sin(an),dir=Math.cos(an)>0?1:-1,t0=T(E.t1+k*.8);
 for(let i=0;i<4;i++){const c=PAL[(k*4+i)%8];O(FALL(tx,8+.4*i,tz,t0+i*.04,.45,.4,.45,dir),bxm(.45,.4,.45),c,tx)}}
// attic: rocking horse, spinning globe and a telescope that tips over
const RH=t=>mm(TR(6.5,8,1.2),RZ(.18*Math.sin(t*2.6)));
O(t=>mm(RH(t),TR(0,.75,0)),bxm(1,.4,.4),SAL,6.5);
O(t=>mm(RH(t),TR(.55,1.15,0)),bxm(.25,.45,.25),SAL,6.5);
O(t=>mm(RH(t),TR(0,.2,.3)),bxm(1.2,.08,.1),DARK,6.5);
O(t=>mm(RH(t),TR(0,.2,-.3)),bxm(1.2,.08,.1),DARK,6.5);
O(TR(7.8,8.45,1.3),cyl(.06,.06,.7),STEEL,7.8);
O(t=>TR(7.8,9.2,1.3),sph(.4),BLU,7.8,.5);
for(let k=0;k<3;k++)O(t=>mm(TR(7.8,9.2,1.3),mm(RY(t*.8+k*2),TR(.38,.1*(k-1),0))),sph(.08),GRN,7.8);
O(TR(5.3,8.02,.6),cyl(.03,.03,.9),DARK,5.3);
O(t=>mm(TR(5.3,8.95,.6),mm(RX((Math.PI/2)*sl(ph(E.tele,E.tele+.3,t))),TR(0,.9,0))),cyl(.09,.12,1.8),STEEL,5.3);
// kitchen: a conveyor of teacups, an egg timer that rings, dishes
bx(-7.6,-2.8,0,1,1.5,2,WOOD);
bx(-7.6,-2.8,1,1.06,1.45,2.05,DARK);
for(let k=0;k<6;k++)O(t=>TR(-7.4+((t*.5+k*.75)%4.4),1.13,1.75),cyl(.11,.09,.14),PAL[k%8],-5,.3);
const RG=t=>t>T(E.ring)&&t<T(E.ring+.9)?1:0;
O(t=>TR(-3.6+.01*RG(t)*Math.sin(t*90),1.2,1.7),sph(.14),SAL,-3.6,.3);
for(let k=0;k<4;k++)O(TR(-6.8,1.05+k*.1,1.7),cyl(.2,.2,.08),WHT,-6.8);
// garden outside the house, untouched by the fold
W(TR(0,-.48,11),bxm(70,.04,18),[.72,.92,.6]);
for(let k=0;k<14;k++)W(TR(-12+k*1.85,.3,19.5),sph(.6),GRN);
W(TR(-13,.9,8),cyl(.2,.25,2.2),WOOD);W(TR(-13,2.6,8),sph(1.4),GRN);
W(TR(14,.9,6),cyl(.2,.25,2.2),WOOD);W(TR(14,2.6,6),sph(1.4),MINT);
W(TR(-10,-.2,6),cyl(.1,.12,.4),STEEL);
W(t=>mm(TR(-10,.05,6),mm(RY(t*1.4),TR(.8,0,0))),bxm(1.6,.05,.08),SILV);
O(TR(0,12.2,-.8),cyl(.03,.03,1.6),GOLD,0);
O(t=>mm(TR(0,13,-.8),RY(t*.3)),bxm(1.4,.04,.08),GOLD,0);
W(t=>mm(TR(11+.8*Math.sin(t*.9),13+.6*Math.cos(t*.7),10),RZ(.5+.2*Math.sin(t))),bxm(1.2,1.2,.04),PIN);
// soft contact shadows under the heavy furniture
for(const[x,z,w,d]of[[-7.9,-1.3,1.2,1.3],[5.8,-1.2,3.2,1.8],[7.2,-.9,2,1.2],[7.2,-.9,2,1.2]])O(TR(x,.012,z),bxm(w,.01,d),[.74,.68,.78],x);
