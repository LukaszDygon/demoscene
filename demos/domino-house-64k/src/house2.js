// library: the marble bumps a row of standing books on the top floor and they topple toward the stairs
const TBK=(x,z,t0,y0,h,w)=>t=>mm(TR(x-w/2,y0,z),mm(RZ((Math.PI/2-.03)*sl(cl((t-t0)/.3))),TR(w/2,h/2,0)));
for(let k=0;k<8;k++){const h=.7+hs(k,21)*.25,x=1.8-k*.2;O(TBK(x,1,T(E.books)+k*.06,8,h,.12),bxm(.12,h,.5),PAL[k%8],x,.1)}
for(let r=0;r<2;r++){const y=9.4+r*.9;bx(-7.8,-5.2,y,y+.06,-2.1,-1.6,WOOD);
 for(let k=0;k<9;k++){const x=-7.7+k*.28,h=.45+hs(r,k+30)*.3;bx(x,x+.2,y+.06,y+.06+h,-1.95,-1.7,PAL[(r*9+k)%8])}}
// rails along the stairs, posts every second step
for(let k=0;k<16;k++){const x1=-.8-.4*k,top=7.5-.5*k;if(k&1)bx(x1-.06,x1-.02,top,top+.9,-.75,-.7,WOOD);bx(x1-.4,x1,top+.9,top+.95,-.75,-.7,WOOD)}
// pop-up hinge rods on the back wall (sit on the inner panel, so they turn with the spine)
for(const h of[-6.9,-3.6,3.59,6.89])O(TR(h,5.5,-2.02),cyl(.08,.08,11),GOLD,h*.999);
// pictures in the upper-left void and the parlour, sconces, a vase on the dresser, rug on the top floor
bx(-3.4,-2.2,9.1,10.1,-2.07,-2.02,WOOD);bx(-3.3,-2.3,9.2,10,-2.02,-2,PEACH);
bx(-1.8,-.9,9.4,10.1,-2.07,-2.02,WOOD);bx(-1.7,-1,9.5,10,-2.02,-2,MINT);
for(const x of[-7.6,-.6,1.2,7.6])O(TR(x,4.4,-2.0),sph(.12),BUT,x,0,.6);
O(TR(2.3,9.9,-.6),cyl(.15,.22,.5),SAL,2.3);for(let k=0;k<5;k++)O(TR(2.3+.2*Math.cos(k*1.26),10.2+.1*hs(k,40),-.6+.2*Math.sin(k*1.26)),sph(.1),PIN,2.3);
bx(1.2,3.2,8,8.03,.5,1.8,PIN);
// conservatory chairs and a hedge along the back of the atrium
for(const x of[3.4,7.2]){bx(x-.4,x+.4,.45,.5,.1,.9,PEACH);bx(x-.4,x+.4,.5,1.4,.1,.16,PEACH);for(const dx of[-.3,.3])for(const dz of[.2,.8])O(TR(x+dx,.22,dz),cyl(.04,.04,.45),DARK,x)}
for(let i=0;i<12;i++){const x=1.2+i*.6;O(TR(x,.35,-1.85),sph(.3),GRN,x,0,.03)}
// rubber duck on the library shelf and a few toys
O(TR(-6.6,9.6,-1.85),sph(.13),BUT,-6.6);O(TR(-6.46,9.67,-1.85),sph(.05),SAL,-6.6);
