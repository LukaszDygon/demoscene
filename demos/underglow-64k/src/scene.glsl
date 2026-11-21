// The world, raymarched: a garage, a wet downtown grid with a car meet in one block, a tunnel, and a hill road over the city.
uniform mat3 M[4];
out vec4 O;
const float HK=.04488;    // the hill road swings left and right every 70 m
float mt;                 // material of the last map() call
vec4 cm;                  // which cars the current ray passes close to
float pk;                 // >1 while marching: lets rays that skim the ground take longer steps over it
float hq,hl,hr;           // hill road: across-road coordinate, distance beyond the left edge and beyond the right edge
vec4 gP;                  // parked car under the last map() call: point in its frame, hash
float gO,gV;              // and whether it stands at the kerb (1) or in the lot (0), and which variant it is
#define UN(m) if(e<d){d=e;mt=m;}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float rb(vec3 p,vec3 b,float r){vec3 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,max(d.y,d.z)),0.)-r;}
float b2(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float seg(vec3 p,vec3 a,vec3 b){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}
// closest approach of a ray to a segment: s = position on the segment, tr = distance along the ray
float rseg(vec3 ro,vec3 rd,vec3 a,vec3 b,out float s,out float tr){
 vec3 ab=b-a,ao=ro-a;float l=dot(ab,ab),m=dot(ab,rd);
 s=clamp((dot(ab,ao)-m*dot(rd,ao))/(l-m*m+1e-4),0.,1.);
 tr=max(dot(a+ab*s-ro,rd),0.);
 return length(ro+rd*tr-a-ab*s);
}
float fre(vec3 n,vec3 rd,float e){return pow(1.-clamp(dot(n,-rd),0.,1.),e);}
// hill road: height, then centre line and its slope
float RY(float z){return 40.+.09*smin(z,ZP-40.,40.);}
vec2 RX(float z){return 28.*smoothstep(ZP-30.,ZP-170.,z)*vec2(sin(z*HK),HK*cos(z*HK));}
// ground height relative to the road: a retaining wall and a wooded slope on the right, a drop to the plain on the left
float terr(vec3 p,bool fine){
 vec2 r=RX(p.z);
 hq=(p.x-r.x)*inversesqrt(1.+r.y*r.y);
 hl=-hq-6.6-11.*smoothstep(30.,16.,abs(p.z-ZP));
 hr=hq-5.6;
 float k=fine?vn(p.xz*.04)*.7+vn(p.xz*.11)*.3:0.;
 return hr>0.?smoothstep(0.,3.5,hr)*5.+hr*.75+k*12.*smoothstep(2.,30.,hr):hl>0.?-hl*1.1-k*9.*smoothstep(0.,25.,hl):0.;
}
// pixel glyphs for signs: q in cells, one glyph per cell
float gly(vec2 q,float id){
 vec2 c=floor(q),f=(fract(q)-.5)*1.3+.5;
 return f.x<0.||f.x>1.||f.y<0.||f.y>1.?0.:step(.45,h1(floor(vec2(abs(f.x-.5)*6.,f.y*5.))+c*7.+id));
}
// spray paint: fat letters of colour inside a dark outline, in a strip q.y 0..1 high; alpha in w
vec4 graf(vec2 q,float id){
 float k=fbm(q*vec2(1.3,2.)+id*7.)+.2*sin(q.x*3.+id)-abs(q.y-.5)*.9;
 return vec4(mix(vec3(.02),hue(id+floor(q.x*.4)*.37+.25*floor(k*12.)),smoothstep(.5,.52,k)),smoothstep(.42,.45,k));
}
float lamp(vec3 a){return min(max(length(a.xz)-.09,a.y-6.6),rb(a-vec3(-.9,6.6,0),vec3(.9,.05,.06),.03));}
// car in its own frame: x right, y up, z forward, wheels on y=0. returns (distance, part)
// variants: 0 wide-body coupe, 1 boxy notchback, 2 long lowrider, 3 slammed wagon
// parts: 0 paint 1 glass 2 tyre 3 rim 4 trim 5 roof light bar
vec2 car(vec3 p,int id){
 vec3 q=vec3(abs(p.x),p.yz);
 bool lr=id==2;
 float L=id==0?2.2:id==1?2.05:lr?2.6:2.3,cz=id==0?-.4:id==1?-.25:lr?-.35:-.55,cl=id==3?1.2:.78,wr=lr?.31:.34,e,sub;
 vec3 w=vec3(q.x-.84,q.y-wr,abs(q.z)-(lr?1.6:1.35));
 if(id==3)w.xy*=rot(.14);   // stance: the wagon's wheels lean in
 float lw=length(w.yz),wh=max(lw-wr,abs(w.x)-.13)-.03,
 hull=rb(q-vec3(0,.5,0),vec3(.76,.18,L-.14),id==1?.08:.14);
 if(id==0)hull=max(hull,dot(q.yz-vec2(.5,2.32),vec2(.95,.31)));   // wedge nose
 float cab=rb(q-vec3(0,.96,cz),vec3(id==1?.56:.5,.13,cl),id==1?.1:.2);
 cab=max(cab,dot(q.yz-vec2(.8,cz+cl+.3),id==1?vec2(.77,.64):vec2(.6,.8)));
 // fastback on the coupe, a notch on the two saloons, a square tail on the wagon
 if(id<3)cab=max(cab,dot(q.yz-vec2(1.26,cz-cl+(id==0?.8:.25)),id==0?vec2(.95,-.3):vec2(.8,-.6)));
 float d=smin(hull,cab,id==1?.07:.15);
 sub=cab<hull&&q.y>.87?1.:0.;
 // wheel arches (the lowrider's rear wheels hide behind skirts), flared on the coupe and the wagon
 if(!lr||p.z>0.)d=max(d,-max(lw-wr-.07,.5-q.x));
 if(id==0||id==3)d=smin(d,max(length(vec2(lw-wr-.11,q.x-.83))-.06,-w.y-.05),.06);
 d=min(d,rb(q-vec3(.88,.95,cz+cl-.12),vec3(.07,.04,.035),.02));
 if(wh<d){d=wh;sub=lw<wr*.7?3.:2.;}
 e=max(length(q.xy-vec2(.45,.27))-.055,abs(q.z+L)-.12);
 if(e<d){d=e;sub=4.;}
 if(id==0){
  // wing on two uprights, splitter, side skirts
  e=min(min(rb(q-vec3(0,1.3,-2.05),vec3(.95,.025,.2),.02),rb(q-vec3(.55,1.08,-2.),vec3(.025,.2,.1),.01)),
   min(rb(q-vec3(0,.16,2.2),vec3(.86,.012,.22),.01),rb(q-vec3(.84,.2,0),vec3(.04,.05,.95),.02)));
  if(e<d){d=e;sub=4.;}
 }else if(id==1){
  // pop-up lamps, a duck tail, a chin
  e=rb(q-vec3(.5,.8,1.55),vec3(.17,.07,.12),.02);
  if(e<d){d=e;sub=0.;}
  e=min(rb(vec3(q.x,(q.yz-vec2(.8,-1.98))*rot(.5)),vec3(.74,.015,.14),.015),rb(q-vec3(0,.22,2.02),vec3(.8,.03,.12),.02));
  if(e<d){d=e;sub=4.;}
 }else if(lr){
  // chrome bumpers, tail fins
  e=rb(vec3(q.x,q.y-.42,abs(q.z)-2.62),vec3(.84,.05,.06),.04);
  if(e<d){d=e;sub=4.;}
  e=rb(q-vec3(.72,.82,-2.2),vec3(.02,.1,.4),.03);
  if(e<d){d=e;sub=0.;}
 }else{
  // roof bars with a light bar across the front, a lip
  e=min(rb(vec3(q.x,q.y-1.36,abs(q.z+.6)-.5),vec3(.56,.02,.03),.01),rb(q-vec3(0,.17,2.3),vec3(.84,.012,.16),.01));
  if(e<d){d=e;sub=4.;}
  e=rb(q-vec3(0,1.4,.35),vec3(.45,.035,.04),.02);
  if(e<d){d=e;sub=5.;}
 }
 return vec2(d,sub);
}
// parked row at the lot: local frame and hash of the car in the bay under l
vec3 bay(vec2 l,float y,out float k){
 k=h1(vec2(floor((l.x+28.)/3.4),sign(l.y)*3.));
 return vec3(mod(l.x+28.,3.4)-1.7,y,26.-abs(l.y));
}
// the ring of people round the pit: local frame and hash of the nearest one
vec3 folk(vec2 l,float y,out float k){
 float r=length(l),sa=.10472,an=atan(l.y,l.x),g=step(17.3,r);
 k=h1(vec2(floor(an/sa),g));
 if(l.x<0.&&abs(l.y)<7.)k=0.;   // the way in stays clear
 return vec3((mod(an,sa)-sa*.5)*r,y-.07*KICK*fract(k*5.),r-16.6-g*1.4-k*.5);
}
float map(vec3 p){
 float d=1e5,e;
 mt=0.;
 if(ZONE<.5){
  // the garage: a room with a roller door, tyres, a tool chest, a bench, a neon moon on the back wall
  d=p.y*pk;mt=1.;
  e=min(max(-b2(p.xz,vec2(5,7)),-max(max(abs(p.x)-3.,p.y-3.2),6.9-p.z)),4.2-p.y);UN(6.)
  e=rb(p-vec3(0,1.65+DOOR*3.3,7.2),vec3(3.1,1.65,.05),.02);UN(13.)
  vec3 a=vec3(p.x+4.1,p.y,abs(p.z+5.2)-.45);
  e=min(length(vec2(length(a.xz)-.3,a.y-.135-clamp(floor(a.y/.27),0.,3.)*.27))-.13,
   length(vec2(length(vec2(p.y-2.7,p.z-clamp(round(p.z),-1.,2.)))-.3,p.x-4.85))-.1);UN(14.)
  e=min(min(rb(p-vec3(4.3,.55,-3),vec3(.45,.55,.9),.03),rb(p-vec3(0,.85,-6.5),vec3(2.4,.05,.45),.02)),rb(p-vec3(0,2.2,-6.8),vec3(2.4,.03,.2),.01));UN(15.)
  a.xy=p.xy-vec2(-2.4,2.7);
  e=length(vec2(max(length(a.xy)-.7,.56-length(a.xy-vec2(.3,.12))),p.z+6.93))-.04;UN(16.)
  e=rb(vec3(abs(p.x)-2.,p.y-4.12,p.z),vec3(.06,.04,2.4),.02);UN(17.)
 }else if(ZONE<1.5){
  d=p.y*pk;mt=1.;
  vec2 c=floor(p.xz/80.),l=p.xz-c*80.-40.,al=abs(l),s=mod(p.xz+40.,80.)-40.;
  if(c==floor(LOT/80.)){
   // the lot: a lit canopy on columns and a kiosk along the east side, two masts, rows of parked cars, people
   vec3 a=vec3(l.x-25.,p.y,l.y);
   e=rb(a-vec3(0,3,0),vec3(6,3,20.5),0.);
   if(e<1.){
    e=min(min(rb(a-vec3(0,5.5,0),vec3(5.5,.3,20),.1),max(length(vec2(abs(a.x)-4.,abs(abs(a.z)-9.)-7.))-.28,p.y-5.5)),rb(a-vec3(3.2,1.5,0),vec3(1.6,1.5,6),.05));
    e=min(e,rb(vec3(a.x+4.,p.y-1.3,abs(a.z)-10.),vec3(.6,1.3,1.6),.04));UN(10.)
   }else d=min(d,e);
   e=max(length(vec2(l.x+30.,al.y-30.))-.22,p.y-15.);UN(5.)
   e=rb(vec3(l.x+31.,p.y-7.,l.y-9.),vec3(.25,4,1.3),.05);UN(4.)
   // bulbs on sagging wires from the mast heads to the canopy
   vec3 fd=vec3(49.5,-9,-10),fp=vec3(l.x+30.,p.y-15.,al.y-30.);
   float ft=clamp(dot(fp,fd)/dot(fd,fd),0.,1.);
   e=length(fp-fd*ft)-2.8;
   if(e<.5){ft=floor(ft*26.+.5)/26.;e=length(fp-fd*ft+vec3(0,10.*ft*(1.-ft),0))-.16;UN(12.)}
   else d=min(d,e);
   e=rb(vec3(l.x+6.,p.y-.8,al.y-26.),vec3(22,.8,2.8),0.);
   if(e<.6){
    float k;
    a=bay(l,p.y,k);
    if(k>.12){vec2 r=car(a,int(k*4.));e=min(r.x,2.45-abs(a.x));if(e<d){d=e;mt=60.+r.y;gP=vec4(a,k);gO=0.;gV=floor(k*4.);}}
   }else d=min(d,e);
   e=max(abs(length(l)-17.3)-1.5,p.y-2.2);
   if(e<.5){
    float k;
    a=folk(l,p.y,k);
    if(k>.22){
     e=min(seg(a,vec3(0,.3,0),vec3(0,1.25+.2*fract(k*9.),0))-.2,length(a-vec3(0,1.6+.2*fract(k*9.),0))-.13);
     // some hold a phone up
     if(fract(k*7.)>.5)e=min(e,seg(a,vec3(.2,1.3,0),vec3(.26+.25*sin(TM*5.+k*40.)*HYPE,1.9,-.22))-.05);
     e=min(e,1.2-abs(a.x));UN(11.)
    }
   }else d=min(d,e);
  }else{
   e=max(max(al.x,al.y)-34.,p.y-.15);UN(2.)
   // four buildings to a block
   vec2 m=al-16.;
   float h=h1(c*2.+step(0.,l)),g=fract(h*57.),H=12.+42.*g*g*g+10.*fract(h*91.),w=14.-3.*fract(h*13.);
   vec3 a=vec3(abs(m.x)-w,p.y-H,abs(m.y)-w);
   e=min(max(a.x,max(a.y,a.z)),0.)+length(max(a,0.));
   // a slimmer upper storey on the tall ones
   if(g>.45){a=vec3(abs(m.x)-w*.62,p.y-H*1.28,abs(m.y)-w*.62);e=min(e,min(max(a.x,max(a.y,a.z)),0.)+length(max(a,0.)));}
   UN(3.)
   // blade signs over the pavement on both street sides
   if(fract(h*31.)>.35){
    e=min(rb(vec3(m.x-w-.9,p.y-8.-5.*g,m.y-fract(h*7.)*14.+7.),vec3(.75,2.6,.12),.04),rb(vec3(m.y-w-.9,p.y-8.-5.*fract(g*5.),m.x-fract(h*11.)*14.+7.),vec3(.75,2.6,.12),.04));UN(4.)
   }
   // a billboard on some of the low roofs
   if(g<.35&&h>.4){e=rb(vec3(m.x-w+1.,p.y-H-3.,m.y),vec3(.15,2.4,6),.05);UN(18.)}
   // cars left at the kerb for the night
   e=rb(vec3(al.x-35.1,p.y-.8,l.y),vec3(1,.8,25),0.);
   if(e<.6){
    float sl=floor(l.y/10.+.5),k=h1(c*3.1+vec2(sl,sign(l.x)));
    if(k<.16){
     a=vec3(al.x-35.1,p.y,l.y-sl*10.);
     vec2 r=car(a,int(k*25.));
     e=min(r.x,5.6-abs(a.z));
     if(e<d){d=e;mt=60.+r.y;gP=vec4(a,k*6.+.03);gO=1.;gV=floor(k*25.);}
    }
   }else d=min(d,e);
   // a water tank on legs on some of the low roofs
   if(g<.45&&fract(h*23.)>.5&&p.y>H){
    a=vec3(m.x+3.,p.y-H-3.4,m.y-4.);
    e=min(max(length(a.xz)-1.6,abs(a.y)-1.3),max(length(abs(a.xz)-1.)-.12,abs(a.y+2.2)-1.2));UN(3.)
   }
   // never step past the next plot
   m=min(m+17.,33.-m);
   d=min(d,min(m.x,m.y));
  }
  // the nearer street: q = (across, along), os = how far along from the crossing
  bool zs=abs(s.x)<abs(s.y);
  vec2 q=zs?vec2(s.x,p.z):vec2(s.y,p.x);
  float os=abs(zs?s.y:s.x);
  vec3 a=vec3(abs(q.x)-6.9,p.y,mod(q.y,20.)-10.);
  // street lamps; the ones at a crossing carry a signal head
  e=lamp(a);
  if(os<12.)e=min(e,rb(a-vec3(-.25,5.2,0),vec3(.16,.45,.16),.03));
  UN(5.)
  // paper lanterns strung across some streets
  e=abs(p.y-8.1)-.9;
  if(e<.3){
   float oz=mod(q.y,16.)-8.;
   if(h1(vec2(floor(q.y/16.),floor((zs?p.x:p.z)/80.+.5)+(zs?0.:50.)))>.55&&abs(q.x)<7.4&&os>10.){
    e=abs(oz)-.25;
    if(e<.3){e=length(vec3(mod(q.x+1.2,2.4)-1.2,p.y-7.6-.012*q.x*q.x,oz))-.2;UN(12.)}
   }else e=8.2-abs(oz);
  }
  d=min(d,e);
  // an elevated line runs over the street at x=80; a train of lit windows goes by
  e=abs(p.x-80.)-5.;
  if(e<1.){
   e=min(b2(vec2(p.x-80.,p.y-9.5),vec2(3.6,.5)),max(length(vec2(abs(p.x-80.)-3.,mod(p.z,20.)-10.))-.45,p.y-9.5));UN(5.)
   e=rb(vec3(p.x-80.,p.y-11.8,p.z-TRZ),vec3(1.4,1.5,35),.3);UN(12.)
  }else d=min(d,e);
 }else if(ZONE<2.5){
  // the tunnel: a tiled tube that ends at ZE, service kerbs, jet fans
  d=p.y*pk;mt=1.;
  e=max((8.6-length(vec2(p.x,(p.y-1.2)*1.1)))*.9,p.z-ZE);UN(7.)
  e=b2(vec2(abs(p.x)-7.7,p.y-.25),vec2(1,.25));UN(2.)
  e=max(length(vec2(abs(p.x)-2.3,p.y-6.3))-.6,abs(mod(p.z,150.)-75.)-2.2);UN(5.)
 }else{
  float y=p.y-RY(p.z),H=terr(p,false);
  if(hr<0.&&hl<0.){d=min(y*pk,.3-hr);mt=1.;}
  else if(y-H>18.)d=(y-H-13.)*.45;
  else{
   H=terr(p,true);
   d=(y-H)*.45;mt=8.;
   if(y-H<15.){
    // pines on a 9 m grid, cherry trees along the top of the wall
    vec2 tc=floor(p.xz/9.),tl=p.xz-tc*9.-4.5,r=RX(p.z);
    float th=h1(tc),k=fract(th*31.),yy=y-H;
    vec2 to=tl-(vec2(th,fract(th*17.))-.5)*2.4;
    // where the trunk stands relative to the road edges
    float o=(to.x-r.y*to.y)*inversesqrt(1.+r.y*r.y);
    if(th>.3&&(hr-o>4.5||hl+o>3.5)){
     if(hr-o>4.5&&hr-o<13.&&k<.4){
      e=(length(vec3(to.x,yy-5.2,to.y))-2.6+.25*sin(p.x*3.)*sin(p.y*3.+1.)*sin(p.z*3.))*.7;UN(19.)
      e=max(length(to)-.22,yy-4.);UN(9.)
     }else{e=max(length(to)-max(1.-yy/(7.+6.*k),0.)*2.6*step(1.2,yy)-.2,yy-7.-6.*k)*.7;UN(9.)}
    }
    d=min(d,4.9-max(abs(tl.x),abs(tl.y)));
   }
  }
  // one old cherry tree at the end of the overlook
  vec3 a=p-vec3(-11,110.4,ZP+20.);
  e=length(a)-9.;
  if(e<1.){
   e=(length(a-vec3(0,6,0))-3.6+.3*sin(p.x*2.5)*sin(p.y*2.5+1.)*sin(p.z*2.5))*.7;UN(19.)
   e=max(length(a.xz)-.3,a.y-5.);UN(9.)
  }else d=min(d,e);
  // two vending machines keep the overlook company
  a=p-vec3(-15,110.4,ZP+15.5);
  e=length(a)-3.;
  if(e<1.){e=rb(vec3(abs(a.x)-.55,a.y-.95,a.z),vec3(.5,.95,.38),.03);UN(12.)}
  else d=min(d,e);
  // a cat on the rail, watching the cars: body, head, ears, a tail that hangs and swings
  a=(p-vec3(-17.15,111.16,ZP-7.2))/1.3;
  e=length(a)-.8;
  if(e<.3){
   e=min(min(smin(length(a/vec3(.14,.18,.13)-vec3(0,.95,0))*.13-.13,length(a-vec3(.04,.41,0))-.085,.05),
    seg(vec3(a.xy,abs(a.z)),vec3(.04,.47,.05),vec3(.03,.55,.07))-max(.035-.4*(a.y-.47),0.)),
    seg(a,vec3(-.1,.06,0),vec3(-.15,-.28,.12*sin(BT*6.2832)))-.025)*1.2;UN(11.)
  }else d=min(d,e);
  // guard rail along the drop
  e=min(b2(vec2(hl+.45,y-.62),vec2(.04,.16)),max(b2(vec2(hl+.5,y-.3),vec2(.05,.38)),abs(mod(p.z,4.)-2.)-.06));UN(2.)
 }
 for(int i=0;i<4;i++){
  if(cm[i]>0.){
   vec3 c=p-CAR(i).xyz;
   e=length(c-vec3(0,.6,0))-CX(i).w;
   if(e<.4){vec2 r=car(M[i]*c,i);e=r.x;if(e<d){d=e;mt=20.+float(i)*10.+r.y;}}
   else d=min(d,e);
  }
 }
 return d;
}
// paint, glass, rubber and lamps of car variant v at local point c with local normal nl.
// g: its glow colour, k>0: repaint (a parked car), hd/tl: head and tail lamp levels, wa: wheel angle
void cmat(int v,float sub,vec3 c,vec3 nl,float fr,vec3 g,float k,float hd,float tl,float wa,out vec3 al,out vec3 em,out float rf,out float mtl){
 vec3 w=vec3(abs(c.x),c.yz);
 bool lr=v==2;
 float L=v==0?2.2:v==1?2.05:lr?2.6:2.3,wr=lr?.31:.34,y=w.y,sd=step(.6,abs(nl.x));
 vec2 wv=vec2(w.y-wr,abs(c.z)-(lr?1.6:1.35));
 float lw=length(wv);
 em=vec3(0);rf=.1;mtl=0.;
 if(sub<.5){
  // pearl white that flips to violet, teal metallic, candy red flake, matte black
  al=v==0?mix(vec3(.42,.42,.47),hue(fr*.7+.62)*.7,.3):v==1?vec3(.01,.2,.24):lr?vec3(.45,.02,.03):vec3(.012);
  if(k>0.&&v<3)al=hue(k*37.)*.35+.03;
  al*=.8+.4*h1(floor(c.xz*90.)+floor(c.y*90.));
  rf=v==3?.04:lr?.45:.14;mtl=lr||v==1?1.:0.;
  // liveries: a wave down the flank and twin stripes over the top; an eighties tri-stripe over black cladding;
  // gold pinstripes and a lace roof; a sticker-bombed wing and a line of electroluminescent wire
  if(v==0){
   if(sd>0.&&abs(y-.52-.09*sin(c.z*1.4+.5))<.04||nl.y>.6&&abs(w.x-.2)<.05)al=g*.4+.04;
  }else if(v==1){
   float s=floor((c.z*.9+y*1.6-.5)/.13);
   if(sd>0.&&s>=0.&&s<3.)al=s<1.?vec3(.9,.1,.5):s<2.?vec3(.95,.7,.1):vec3(.9);
   if(y<.36)al=vec3(.02),rf=.05,mtl=0.;
  }else if(lr){
   if(sd>0.&&(abs(y-.63)<.012||abs(y-.4)<.012))al=vec3(.9,.7,.25);
   if(nl.y>.7&&y>1.05)al=mix(al,vec3(.9,.75,.4),smoothstep(.1,.05,abs(length(fract(c.xz*4.)-.5)-.3)));
  }else{
   if(sd>0.&&c.z>.9&&y<.76)al=hue(h1(floor(vec2(c.z,y)*9.))*6.)*.5*step(.1,fract(c.z*9.)),rf=.1;
   if(sd>0.&&abs(y-.69)<.012)em=g*2.5;
  }
  al*=1.-.7*smoothstep(.02,0.,min(abs(c.z-.45),abs(c.z+.55)))*sd;
  if(v==0&&nl.y>.7&&abs(c.z-1.2)<.3&&abs(w.x-.38)<.14)al*=.15+.85*step(.5,fract(c.z*14.));
  // the tubes under the sills
  if(y<.3)em+=g*2.5;
  if(nl.z>.5&&c.z>L-.75){
   // grille (an intercooler on the wagon), then each car's own lamps
   if(w.x<.4&&abs(y-.42)<.09)al=v==3?vec3(.5)*step(.5,fract(c.x*14.)):vec3(.01);
   if((v==0?max(abs(y-.6)-.035,max(.3-w.x,w.x-.72)):v==1?max(.73-y,abs(w.x-.5)-.15):lr?min(length(vec2(w.x-.54,y-.56)),length(vec2(w.x-.72,y-.56)))-.075:max(abs(w.x-.58)-.14,abs(y-.6)-.05))<0.)
    al=vec3(.3),em=vec3(5,4.6,3.9)*hd;
  }
  if(nl.z<-.5&&c.z<.25-L){
   // tail lamps: twin rings, a segmented bar, fin blades, a hairline
   if(v==0?abs(min(length(vec2(w.x-.38,y-.62)),length(vec2(w.x-.66,y-.62)))-.07)<.022:v==1?abs(y-.62)<.05&&w.x<.74&&fract(w.x*6.)>.15:lr?abs(w.x-.72)<.04&&abs(y-.7)<.16:abs(y-.7)<.018&&w.x<.78)
    al=vec3(.1,0,0),em=vec3(5,.12,.06)*tl;
   if(w.x<.25&&abs(y-.42)<.065)al=vec3(.8)*(1.-gly(vec2(c.x*8.,(y-.355)/.13),float(v))),em=al*1.5*tl;
  }
 }else if(sub<1.5){
  // glass with the dash glowing behind it; a banner across the coupe's screen, louvres on the notchback's
  al=vec3(.01);rf=.35;em=g*.05;
  if(v==0&&c.z>0.&&y>1.13)al=vec3(.7)*(1.-gly(vec2(c.x*6.,(y-1.13)*8.),3.)),rf=.1;
  if(v==3&&sd>0.&&c.z<-1.)al=vec3(.5)*step(.7,h1(floor(vec2(c.z,y)*7.)));
  if(v==1&&c.z<-.9)al=vec3(.02),rf=.3*step(.5,fract(y*14.));
 }else if(sub<2.5){al=vec3(lr&&abs(lw-wr*.82)<.035?.75:.015);rf=.03;}
 else if(sub<3.5){
  // wheels: wires on the lowrider, five spokes elsewhere, a neon ring on all of them
  float a=(atan(wv.x,wv.y)+wa)/6.2832;
  al=mix(lw<wr*.5&&!lr?wv.x>.02&&wv.y>0.?g*.5+.1:vec3(.2):vec3(.02),lr?vec3(.9,.85,.7):v==0?vec3(.75,.6,.25):v==1?vec3(.85):vec3(.08),smoothstep(.2,.3,abs(fract(a*(lr?24.:5.))-.5)));
  rf=.5;mtl=1.;
  em=g*2.5*smoothstep(.035,.012,abs(lw-wr*.62));
 }else if(sub<4.5){al=lr?vec3(.8,.8,.75):vec3(.02);rf=lr?.7:.12;mtl=lr?1.:0.;}
 else{al=vec3(.02);em=vec3(6,5.6,5)*hd*step(.3,fract(c.x*7.));}
}
// mark the cars whose bounding sphere the ray (or its backward extension) comes near
void cull(vec3 ro,vec3 rd){
 for(int i=0;i<4;i++){vec3 c=CAR(i).xyz+vec3(0,.6,0)-ro;float b=dot(c,rd),r=CX(i).w+1.5;cm[i]=step(dot(c,c)-b*b,r*r)*step(.1,CX(i).w);}
}
// the plain below the hill: suburbs at its foot, a river that carries the moon, a bridge, and a core of towers beyond it.
// c comes in as the sky; rays that go down get the ground instead, and the towers are added over either.
vec3 vista(vec3 ro,vec3 rd,vec3 c){
 float t=-ro.y/rd.y;
 vec2 h=ro.xz+rd.xz*t,dc=h-vec2(-900,1350);
 if(rd.y<0.){
  float core=exp(-dot(dc,dc)/3.2e5),
  dens=core+.5*smoothstep(-100.,-260.,h.x)*(.25+.75*smoothstep(.3,.7,fbm(h*.0012)))*smoothstep(5000.,1800.,length(dc));
  c=vec3(0);
  if(abs(h.x+470.+130.*sin(h.y*.0016))<100.){
   // the moon lies on the water in pieces; a bridge crosses on two strings of lamps
   vec3 n=normalize(vec3(vn(h*.05+TM*.3)-.5,2.5,vn(h*.05-TM*.25+7.)-.5));
   c=MOONC*pow(max(dot(reflect(rd,n),MOON),0.),40.)*6.;
   if(abs(abs(h.y-1260.)-7.)<2.+t*.003&&fract(h.x/24.)<.35)c+=vec3(3,2,.8);
  }else{
   // lights at two scales, cross-faded, so that distance thins them into a glow instead of a shimmer
   float lv=log2(max(t/200.,1.)),f=fract(lv);
   for(int i=0;i<2;i++){
    vec2 g=h/(7.*exp2(floor(lv)+float(i))),ce=floor(g);
    float k=h1(ce),k2=fract(k*43.);
    c+=(k2<.6?vec3(1,.62,.28):k2<.85?vec3(.9,.95,1):hue(k2*9.))*smoothstep(.45,.15,length(fract(g)-.5-(vec2(k2,fract(k*91.))-.5)*.4))
     *step(1.-dens*.55,k)*(i==0?1.-f:f)*(.6+.8*fract(k*7.))*(.8+.2*sin(TM*2.+k*40.));
   }
   // avenues: strings of sodium lamps on a skewed grid
   vec2 gr=abs(mod(h*mat2(.96,.28,-.28,.96),320.)-160.);
   float av=smoothstep(4.+t*.004,0.,min(gr.x,gr.y));
   // sodium lamps along them, and traffic: white one way, red the other
   vec2 gg=h*mat2(.96,.28,-.28,.96);
   float tr=gr.x<gr.y?gg.y:gg.x,dr=sign(mod(gr.x<gr.y?gg.x:gg.y,640.)-320.);
   c=c*4.+av*(.3+dens)*(vec3(1.5,.8,.3)+(dr>0.?vec3(4,4,3.5):vec3(5,.3,.15))*step(.86,fract(tr/55.+dr*TM*.25+h1(vec2(dr,floor(tr/55.+dr*TM*.25))))));
  }
  // haze swallows the far lights and glows over the core
  c=mix(c,HOR*(.7+2.5*core)+vec3(.3,.14,.06)*core,1.-exp(-t*.0002));
 }
 // towers: the same ray sampled on four higher planes, lit wherever a block reaches that high
 for(float k=1.;k<5.;k++){
  t=(k*26.-ro.y)/rd.y;
  if(t>0.&&t<9e3){
   h=ro.xz+rd.xz*t;dc=h-vec2(-900,1350);
   vec2 ck=floor(h/42.),w=floor(h/5.),fk=fract(h/42.);
   float hh=h1(ck)*exp(-dot(dc,dc)/3.2e5)*7.;
   if(hh>k&&min(fk.x,fk.y)>.15)
    c+=((h1(w+k)>.5?vec3(1,.8,.5):vec3(.6,.8,1))*step(.55,h1(w*1.3+k*7.))*1.5
     +(hh<k+1.?vec3(9,.3,.15)*step(.5,fract(TM*.6+h1(ck)))*smoothstep(.12,.04,length(fk-.57)):vec3(0)))*exp(-t*.0002);
  }
 }
 return c;
}
vec3 sky(vec3 ro,vec3 rd,bool lo){
 if(ZONE<.5){
  // the street outside the garage door: haze and neon out of focus
  vec2 g=rd.xy/max(rd.z,.1)*5.+3.,c=floor(g);
  return(FOGC*4.+hue(h1(c)*3.)*smoothstep(.45,.15,length(fract(g)-.5))*step(.55,h1(c+7.))*3.)*DOOR;
 }
 float y=rd.y,md=max(dot(rd,MOON),0.),az=atan(rd.x,rd.z);
 vec3 c=mix(HOR,ZEN,pow(max(y,0.),.4))+MOONC*(pow(md,40.)*.3+pow(md,6.)*.07);
 if(lo)return c+MOONC*smoothstep(cos(MOONR*1.6),1.,md)*5.;
 // the moon: seas, a darker limb
 vec3 mr=normalize(cross(vec3(0,1,0),MOON));
 vec2 mp=vec2(dot(rd,mr),dot(rd,cross(MOON,mr)))/MOONR;
 float ml=length(mp),cl=smoothstep(.45,.9,fbm(rd.xz/(abs(y)+.25)*2.2+TM*.012))*smoothstep(0.,.25,y);
 if(md>0.&&ml<1.)c=vec3(1.7,1.65,1.5)*(1.-.4*smoothstep(.35,.6,fbm(mp*2.3+3.))-.15*fbm(mp*9.))*(.5+.5*sqrt(1.-ml*ml))*3.;
 else{
  c+=vec3(1.7,1.65,1.5)*smoothstep(1.25,1.,ml)*step(0.,dot(rd,MOON))*.25;
  vec3 s=floor(rd*230.);
  c+=step(.9985,h1(s.xy+s.z*7.))*max(y,0.)*(1.-cl)*(1.4+sin(TM*3.+s.x));
 }
 // thin cloud drifting across, silver where the moon stands behind it
 c=mix(c,HOR*.6+MOONC*(.12+pow(md,12.)*1.3),cl*.65);
 if(ZONE<1.5){
  // far skyline at the end of every avenue
  float a=az*60.,hh=.012+.1*pow(h1(vec2(floor(a),3.)),3.);
  if(y<hh)c=mix(c,HOR*.3+step(.72,h1(floor(vec2(a*5.,y*520.))))*vec3(1,.7,.4)*.6,.9);
 }else if(ZONE<2.5){
  // beyond the tunnel mouth: a black ridge under the moon
  if(y<.03+.05*vn(vec2(az*7.,1.)))c=HOR*.2;
 }else{
  // a shooting star; a ridge behind the plain with one red lamp on it
  vec3 sa=normalize(vec3(-.75+.3*METEOR,.52-.12*METEOR,.5));
  c+=vec3(1.4,1.5,1.8)*smoothstep(.004,0.,seg(rd,sa,normalize(sa+vec3(-.05,.02,0))))*sin(METEOR*3.14);
  if(y>0.&&y<.02+.035*vn(vec2(az*7.,3.)))c=HOR*.3+vec3(5,.2,.1)*step(.5,fract(TM*.5))*step(length(vec2(az+1.3,y-.045)),.004);
  // the glow a city throws up into the haze
  c+=vec3(.4,.22,.12)*exp(-max(y,0.)*10.)*(.25+.75*pow(max(dot(normalize(rd.xz),normalize(vec2(-900,1350)-ro.xz)),0.),4.));
  if(y<.15)c=vista(ro,rd,c);
 }
 return c;
}
vec3 glows(vec3 ro,vec3 rd,float tm){
 vec3 g=vec3(0);float s,tr,d;
 for(int i=0;i<4;i++){
  if(CX(i).w>0.){
   // headlight shafts in the haze
   vec3 a=CAR(i).xyz+vec3(0,.6,2.1)*M[i];
   d=rseg(ro,rd,a,a+vec3(0,-.35,16)*M[i],s,tr);
   if(tr<tm)g+=vec3(1,.92,.75)*CX(i).y*(1.-s)*.09/(1.+d*d/(.08+s*s*3.));
   // flame out of the tail pipe
   float f=CX(i).x;
   if(f>.05){
    a=CAR(i).xyz+vec3(.45,.3,i==2?-2.7:-2.25)*M[i];
    d=rseg(ro,rd,a,a-vec3(0,0,f*1.6)*M[i],s,tr);
    if(tr<tm)g+=vec3(2,.6,.15)*(1.-s)*(.6+.4*sin(s*20.-TM*50.))/(1.+d*d*70.);
   }
  }
 }
 return g;
}
void main(){
 cam();
 vec2 uv=(2.*gl_FragCoord.xy-U[0].xy)/U[0].y;
 vec3 ro=U[1].xyz,rd=normalize(uv.x*CR+uv.y*CU+U[1].w*CF),col=vec3(0),att=vec3(1),ro0=ro,rd0=rd;
 float t0=1e4;
 for(int b=0;b<2;b++){
  float t=.05,d=0.,tm=b==0?700.:70.;
  int N=b==0?76:18;
  pk=max(1.,1./(max((ZONE>2.5?.09*rd.z:0.)-rd.y,0.)+.2));
  cull(ro,rd);
  // nothing lies below the plain
  if(ZONE>2.5&&rd.y<0.)tm=min(tm,-ro.y/rd.y);
  for(int i=0;i<N&&t<tm;i++){d=map(ro+rd*t);if(d<.002+t*.0008)break;t+=max(d*.9,t*.004);}
  pk=1.;
  float m=mt;
  bool hit=t<tm&&d<.006*t+.05;
  if(b==0&&hit)t0=t;
  /*DBG*/if(DBGM>0.){O=vec4(hit?m:0.,t,0,t0);return;}/*END*/
  if(!hit){col+=att*sky(ro,rd,b>0);break;}
  vec3 p=ro+rd*t;
  vec2 k=vec2(.002+t*.0006,0);
  vec3 n=m<1.5?vec3(0,1,0):normalize(vec3(map(p+k.xyy),map(p+k.yxy),map(p+k.yyx))-map(p)),al=vec3(.05),em=vec3(0),tint=vec3(1);
  float rf=0.,sss=0.,mtl=0.,gl=1.,fr=fre(n,rd,1.);
  int ci=-1;
  // the downtown plot under p
  vec3 pi=p-n*.1;
  vec2 bc=floor(pi.xz/80.),bl=pi.xz-bc*80.-40.,bm=abs(bl)-16.,lt=p.xz-LOT;
  float id=h1(bc*2.+step(0.,bl)),bg=fract(id*57.),H=12.+42.*bg*bg*bg+10.*fract(id*91.),bw=14.-3.*fract(id*13.);
  if(ZONE>2.5)terr(p,false);
  if(m<1.5){
   if(ZONE<.5){
    // sealed concrete, a painted bay
    float v=vn(p.xz*3.);
    al=vec3(.1+.05*v);rf=.1+.12*v;gl=.5;
    if(abs(abs(p.x)-2.2)<.05&&abs(p.z)<4.5||abs(abs(p.z)-4.5)<.05&&abs(p.x)<2.2)al=vec3(.5,.4,.05);
   }else if(ZONE<1.5){
    // wet asphalt: puddles, paint, and in the lot the bays, the pit and the rubber laid down in it
    vec2 s=mod(p.xz+40.,80.)-40.,as=abs(s);
    float pud=smoothstep(.45,.7,vn(p.xz*.23)*.6+vn(p.xz*.9)*.4)*WET,mk=0.,r=length(lt);
    al=vec3(.035+.03*vn(p.xz*vec2(4,.6)));
    vec3 pc=vec3(.6);
    if(max(abs(lt.x),abs(lt.y))<32.){
     if(abs(abs(lt.y)-26.)<3.2&&abs(lt.x+6.)<22.){
      float h;
      vec3 a=bay(lt,0.,h);
      mk=smoothstep(.09,.04,1.7-abs(a.x));
      // every parked car has a glow of its own
      if(h>.12)em=al*hue(h*7.)*exp(-max(b2(a.xz,vec2(.8,2.)),0.)*1.4)*14.*(.5+BASS);
     }
     mk+=smoothstep(.12,.06,abs(r-13.5));
     al*=1.-.8*RUB*smoothstep(.3,.05,abs(fract(r*.8+vn(lt*.5)*1.5)-.5))*step(r,9.5)*step(2.5,r);
    }else{
     // which street this is: a across it, o along it from the nearest crossing
     bool zs=as.x<as.y;
     float a=zs?s.x:s.y,o=abs(zs?s.y:s.x),aa=abs(a);
     if(o>10.)mk=smoothstep(.1,.05,abs(aa-3.))*step(.5,fract(o/6.))+smoothstep(.07,.03,abs(aa-.2)),pc=aa<1.?vec3(.6,.45,.05):pc;
     else if(o>6.6&&o<9.4&&aa<5.6)mk=step(.5,fract(a/1.2));
     // manhole covers
     if(length(mod(p.xz+vec2(1.6,13.),40.)-20.)<.42)al=vec3(.02),rf=.3;
    }
    al=mix(al,pc,min(mk,1.)*.75);
    rf+=.04+.1*WET+.55*pud;gl=.3+.7*pud;
    tint=mix(vec3(1),hue(vn(p.xz*.7)*2.+fr*2.)*1.4,pud*.3);
    n=normalize(vec3(vn(p.xz*6.)-.5,6./(1.-pud*.9),vn(p.xz*6.+9.)-.5));
   }else if(ZONE<2.5){
    al=vec3(.04+.03*vn(p.xz*vec2(4,.5)));rf=.12;gl=.5;
    al=mix(al,vec3(.6),(smoothstep(.1,.05,abs(abs(p.x)-3.3))*step(.5,fract(p.z/6.25))+smoothstep(.1,.05,abs(abs(p.x)-6.5)))*.7);
   }else if(hq<-6.6){
    // gravel on the overlook
    al=vec3(.1,.095,.085)*(.5+vn(p.xz*9.));
    n=normalize(vec3(vn(p.xz*14.)-.5,2,vn(p.xz*14.+5.)-.5));
   }else{
    // the hill road: a broken centre line, edge lines, rubber through every bend
    float z=p.z*HK;
    al=vec3(.06+.03*vn(p.xz*vec2(.7,5.)));rf=.04;gl=.3;
    al*=1.-.6*smoothstep(.3,.08,abs(abs(hq-1.2*sin(z)+vn(vec2(p.z*.05,1.))*2.-1.)-.8))*abs(sin(z));
    al=mix(al,vec3(.55),(smoothstep(.1,.05,abs(hq))*step(.5,fract(p.z/8.))+smoothstep(.1,.05,abs(abs(hq)-5.2)))*.7);
    n=normalize(vec3(0,1,-.09*step(p.z,ZP-60.)));
   }
  }else if(m<2.5){
   if(ZONE<1.5){
    // pavement
    al=vec3(.1)*(.7+.5*h1(floor(p.xz/1.5)))*step(.04,fract(p.x/1.5))*step(.04,fract(p.z/1.5));rf=.03+.1*WET;gl=.4;
   }else if(ZONE<2.5){
    al=vec3(.09);
    if(n.x*p.x<0.&&p.y>.2)em=vec3(1.5,.6,.05)*step(.93,fract(p.z/6.25))*(.5+KICK);
   }else{
    // steel rail, a reflector on every post
    al=vec3(.4);rf=.25;
    if(abs(mod(p.z,4.)-2.)<.08&&p.y-RY(p.z)<.5)al=vec3(.9,.3,.03),em=al*.15;
    else if(sin(p.z*HK)<-.75)al=vec3(.9,.7,.05)*step(.5,fract(p.z*.6+p.y*2.)),em=al*.06;
   }
  }else if(m<3.5){
   // buildings: shop fronts, sign boards, windows, a red lamp on the roof
   float u=abs(n.x)>abs(n.z)?p.z:p.x,v=p.y,sh=h1(vec2(floor(u/8.),id*9.));
   vec2 wc=floor(vec2(u/2.2,v/3.2)),wf=fract(vec2(u/2.2,v/3.2));
   al=mix(vec3(.03,.035,.05),vec3(.07,.05,.04),fract(id*5.));
   if(v>H+.1&&bg<.45)al=vec3(.07,.05,.04)*(.5+.5*step(.2,fract(atan(bm.x+3.,bm.y-4.)*4.)));
   else if(n.y>.5){al=vec3(.03);em=vec3(5,.12,.06)*step(.99,h1(floor(p.xz/3.)))*step(.5,fract(TM*.5+id));}
   else if(v<4.4){
    if(sh>.3){
     // lit glass between pillars, shelves of something bright behind it
     al=vec3(.02);rf=.3;
     em=(hue(sh*5.+id)*.85+.2)*(.3+.7*v/4.4)*step(.06,fract(u/8.))*step(.08,fract(u/2.))*(.3+.7*vn(vec2(u*3.,v*4.)));
    }else{
     // a shutter, tagged
     vec4 gf=graf(vec2(u*.4,v/4.4),id*9.);
     al=mix(vec3(.08)*(.6+.4*step(.5,fract(v*4.))),gf.rgb*.5,gf.a);
    }
   }else if(v<5.7){
    if(sh>.3)em=hue(sh*9.+.3)*(.25+2.5*gly(vec2(u*.9,(v-4.5)*.9),id))*step(.04,fract(u/8.))*(.7+.5*BELL);
   }else{
    em=smoothstep(.1,.16,wf.x)*smoothstep(.9,.84,wf.x)*smoothstep(.2,.27,wf.y)*smoothstep(.85,.78,wf.y)*step(h1(wc+id*91.),.13)
     *(h1(wc.yy+id*7.)<.6?vec3(1,.7,.35):h1(wc+3.)<.6?vec3(.45,.75,1):hue(id*9.))*(.15+.9*h1(wc*1.7+id))*smoothstep(500.,200.,t);
    // a neon line up the corner of the tall ones
    if(bg>.6&&max(abs(bm.x),abs(bm.y))>bw-.5&&min(abs(bm.x),abs(bm.y))>bw*.62-.6)em+=hue(id*5.)*step(.3,fract(v/9.-TM*.2))*1.5;
   }
   em+=(HOR+ZEN)*.5*fr*fr*fr;
  }else if(m<4.5){
   // blade signs: a column of glyphs in neon, some of them failing
   bool sx=abs(n.z)>abs(n.x);
   float h=id*17.+float(sx);
   vec2 q=sx?vec2(bm.x-bw-.15,p.y):vec2(bm.y-bw-.15,p.y);
   al=vec3(.01);
   em=hue(h)*(.2+3.*gly(q/1.5,h))*(fract(h*3.)<.15?step(.4,h1(vec2(floor(TM*9.),h))):1.)*(.75+.5*BELL);
  }else if(m<5.5){
   // lamp heads, mast heads, the red lamp on a tunnel fan
   al=vec3(.03);rf=.2;
   if(ZONE<1.5&&(n.y<-.5&&p.y>6.5&&p.y<6.6||p.y>14.2))em=p.y>7.?vec3(5,6,8):vec3(7,3.8,1.3);
   // signals turn green as the lead car comes near
   if(ZONE<1.5&&abs(p.y-5.2)<.5&&p.y<5.7)em=length(p.xz-CAR(0).xz)<75.?vec3(.1,3,.7)*step(abs(p.y-4.92),.11):vec3(4,.15,.08)*step(abs(p.y-5.48),.11);
  }else if(m<6.5){
   // garage walls: a dark dado, stained paint, a board of tools, a poster
   al=n.y<-.5?vec3(.15):p.y<1.1?vec3(.05,.06,.08):vec3(.25,.24,.22)*(.6+.5*vn(p.xy*.8+p.z));
   if(p.z<-6.9&&abs(p.x)<2.2&&p.y>1.1&&p.y<2.)al*=.25+.75*step(.5,h1(floor(p.xy*vec2(6,2.5))));
   if(p.x>4.9&&abs(p.z+3.)<.8&&abs(p.y-2.3)<.55)al=hue(floor(p.y*5.)*.13+.6)*.35;
  }else if(m<7.5){
   // tunnel: tiles to head height with an orange band, bare concrete above, strip lights, a green exit sign now and then
   float a=abs(atan(p.x,p.y-1.2));
   if(p.y<3.4){
    al=vec3(.28,.26,.22)*step(.06,fract(p.z*2.))*step(.08,fract(p.y*3.3))*(.7+.3*vn(vec2(p.z*.3,p.y)));rf=.2;gl=.6;
    if(abs(p.y-1.5)<.15)al=vec3(.5,.2,.04);
    float gi=floor(p.z/30.);
    vec4 gf=graf(vec2(p.z*.35,p.y/3.4),gi+sign(p.x));
    if(h1(vec2(gi,sign(p.x)))>.45)al=mix(al,gf.rgb*.6,gf.a);
   }else al=vec3(.05)*(.6+.8*vn(vec2(p.z*.2,a*9.)));
   if(abs(a-.75)<.06&&abs(mod(p.z,12.5)-6.25)<4.)em=vec3(1,.55,.18)*(3.+3.*KICK);
   if(abs(mod(p.z,100.)-50.)<.6&&abs(p.y-2.7)<.25&&p.x>0.)em=vec3(.1,2,.5);
  }else if(m<8.5){
   // hillside: a block wall along the road, scrub and soil beyond
   float v=fbm(p.xz*.4);
   vec4 gf=graf(vec2(p.z*.3,(p.y-RY(p.z))/5.),floor(p.z/35.));
   al=hr>0.&&hr<3.9&&n.y<.9?mix(vec3(.13,.13,.12)*(.5+.5*step(.06,fract(p.y*1.2))*step(.03,fract(p.z*.5+floor(p.y*1.2)*.5)))*(.5+v),gf.rgb*.5,gf.a*step(.6,h1(vec2(floor(p.z/35.),2.))))
    :mix(vec3(.04,.065,.03),vec3(.12,.1,.07),smoothstep(.4,.7,v+1.-n.y));
   n=normalize(n+(vec3(vn(p.xz*2.),0,vn(p.xz*2.+5.))-.5)*.5);
   // chevron boards on the wall where the road bends away from it
   v=p.y-RY(p.z);
   if(hr>0.&&hr<3.9&&sin(p.z*HK)>.75&&abs(v-2.)<.5)al=vec3(.9,.7,.05)*step(.5,fract(p.z*.6+abs(v-2.)*1.5)),em=al*.06;
  }else if(m<9.5){al=vec3(.02,.045,.028)*(.5+vn(p.xz*5.+p.y*3.));}
  else if(m<10.5){
   // canopy: light panels underneath, a neon line round the edge; the kiosk is all vending machines
   al=vec3(.5);
   if(p.y>5.&&n.y<-.5)em=vec3(.85,1,1.1)*5.*step(.12,fract(lt.x/2.5))*step(.12,fract(lt.y/2.5));
   else if(p.y>5.1)em=vec3(1,.08,.5)*step(abs(p.y-5.5),.08)*(3.+3.*BELL)+vec3(.2,1,.9)*gly(vec2(lt.y*.9,(p.y-5.56)*4.),2.)*step(n.x,-.5)*step(abs(lt.y),8.)*2.;
   else if(lt.x<21.&&p.y<2.7){
    vec2 f=fract(vec2(abs(lt.y)-8.4,p.y)/1.3+vec2(.27,0))-.5;
    float r=length(f);
    al=vec3(.02+.05*step(r,.12));
    if(n.x<-.5)em=hue(floor(BT*4.)*.21+.7)*smoothstep(.04,0.,abs(r-.3-.08*BASS))*(1.+3.*BASS)+vec3(.25)*BASS*step(r,.3);
   }else if(lt.x>26.3&&n.x<-.5)al=vec3(.03),em=hue(floor(lt.y/1.2)*.37)*step(.1,fract(lt.y/1.2))*step(.3,p.y)*step(p.y,2.3)*(.5+.5*step(.5,fract(p.y*3.)))*1.6;
  }else if(m<11.5){
   // people: dark clothes, a phone held up, a flash now and then. On the hill, the cat: black, with eyes that catch the light
   float h;
   vec3 a=ZONE>2.5?(p-vec3(-17.15,111.16,ZP-7.2))/1.3:folk(lt,p.y,h);
   al=ZONE>2.5?vec3(.012):a.y>1.45?vec3(.06,.04,.03):hue(h*9.)*.08+.015;
   if(ZONE>2.5){if(length(vec3(a.x-.12,a.y-.425,abs(a.z)-.035))<.02)em=vec3(.5,2.5,.4);}
   else if(a.y>1.82)em=vec3(3)+vec3(12)*step(.96-.1*HYPE,h1(vec2(h*99.,floor(TM*11.))));
  }else if(m<12.5){
   if(ZONE>2.5){
    // vending machines: a lit window of cans over a dark base
    vec3 a=p-vec3(-15,110.4,ZP+15.5);
    al=a.x>0.?vec3(.5,.04,.04):vec3(.04,.15,.5);
    if(n.z<-.5&&a.y>.7)em=mix(vec3(.8,.95,1),hue(floor(a.x*9.)*.37+floor(a.y*4.)*.21),step(.25,fract(a.x*9.))*step(.3,fract(a.y*4.))*.8)*1.6;
   }else if(abs(p.x-80.)<5.){
    // train: a band of windows, doors, a red lamp at the tail
    float z=p.z-TRZ;
    al=vec3(.3,.32,.35);rf=.25;
    if(abs(p.y-12.1)<.5&&abs(n.x)>.5)em=vec3(1,.9,.65)*2.*step(.18,fract(z/2.3))*step(.06,fract(z/17.5));
    if(z<-34.8)em=vec3(6,.2,.1)*step(abs(p.y-11.),.2);
   }else em=mix(vec3(3,.5,.12),vec3(3,1.5,.35),h1(floor(p.xz/2.4)))*(.8+.2*sin(TM*3.+p.x+p.z));
  }else if(m<13.5){al=vec3(.22,.23,.25)*(.6+.4*step(.15,fract(p.y*4.-DOOR*13.2)));rf=.12;gl=.5;}
  else if(m<14.5){al=vec3(.015);n=normalize(n+.3*sin(atan(p.z+5.2,p.x+4.1)*40.)*vec3(0,1,0));}
  else if(m<15.5){al=p.z<-6.?vec3(.2,.12,.06):vec3(.4,.03,.02)*step(.06,fract(p.y*5.));rf=.15;}
  else if(m<16.5){em=vec3(1,.25,.8)*5.*(.85+.15*step(.9,h1(vec2(floor(TM*9.),1.))));}
  else if(m<17.5){al=vec3(.5);em=vec3(.9,1,1.1)*8.*TUBE;}
  else if(m<18.5){
   // billboard: a pale disc over moving stripes
   float v=p.y-H-3.;
   al=vec3(.02);
   if(abs(n.x)>.5||abs(n.z)>.5)em=length(vec2(bm.y,v))<1.5?vec3(2.4,2.2,1.9):hue(id*3.+floor(TM*.25)*.3)*(.4+.6*step(.5,fract((bm.y+v)*.3-TM*.3)));
  }else if(m<19.5){
   // cherry blossom
   al=vec3(.8,.4,.52)*(.5+.7*vn(p.xy*4.+p.z*4.));sss=1.;
  }else{
   vec3 c,nl,g;
   float sub,hd,tl,wa=0.,kp=0.;
   int v;
   if(m<59.){
    ci=int((m-20.)/10.);v=ci;
    sub=m-20.-float(ci)*10.;
    c=M[ci]*(p-CAR(ci).xyz);nl=M[ci]*n;g=CG(ci).rgb;hd=CX(ci).y;tl=CG(ci).w;wa=CX(ci).z;
   }else{
    map(p);
    c=gP.xyz;kp=gP.w;
    sub=m-60.;v=int(gV);nl=gO<.5?vec3(n.x,n.y,-sign(lt.y)*n.z):n;g=gO<.5?hue(kp*7.)*(.5+BASS):vec3(0);hd=0.;tl=.25;
   }
   cmat(v,sub,c,nl,fr,g,kp,hd,tl,wa,al,em,rf,mtl);
  }
  // ---- light ----
  float ao=b>0||m<1.5||m>2.5&&m<4.5?1.:.35+.65*clamp(map(p+n*.5)/.5,0.,1.),nm=(dot(n,MOON)+sss*.5)/(1.+sss*.5);
  vec3 lit=al*mix(HOR*.4,ZEN+HOR*.2,n.y*.5+.5)*ao*1.5,l;
  if(nm>0.){
   // on the hill the moon is the key light: cars, trees and the rail throw long soft shadows over the road
   float sh=1.,ts=.2;
   if(b==0&&ZONE>2.5&&(m<2.5||m>19.5)){
    cull(p,MOON);
    for(int i=0;i<7;i++){float h=map(p+n*.05+MOON*ts);sh=min(sh,8.*h/ts);ts+=clamp(h,.25,6.);if(sh<.02||ts>50.)break;}
   }
   lit+=(al*nm+pow(max(dot(reflect(rd,n),MOON),0.),50.)*(rf+.04)*3.)*MOONC*ao*clamp(sh,0.,1.);
  }
  if(b==0){
   float dd;
   if(ZONE<.5){
    // the neon moon, the ceiling tubes, the street through the door
    l=vec3(-2.4,2.7,-6.6)-p;dd=dot(l,l);
    lit+=al*vec3(1,.25,.8)*max(dot(n,l),0.)*3./(sqrt(dd)*(dd+2.));
    l=vec3(2.*sign(p.x),4.05,clamp(p.z,-2.4,2.4))-p;dd=dot(l,l);
    lit+=al*vec3(.9,1,1.1)*TUBE*max(dot(n,l),0.)*30./(sqrt(dd)*(dd+3.));
    dd=7.-p.z;
    lit+=al*FOGC*DOOR*clamp((DOOR*3.2-p.y)/(dd*.4+.3)+.5,0.,1.)*max(n.z*.6+.4+n.y*.3,0.)*60./(4.+dd);
   }else if(ZONE<1.5){
    // the two nearest street lamps; at the lot, the canopy and the masts
    vec2 s=mod(p.xz+40.,80.)-40.;
    bool zs=abs(s.x)<abs(s.y);
    float a=zs?s.x:s.y,o=zs?p.z:p.x;
    for(float i=-1.;i<2.;i+=2.){
     l=vec3(i*5.4-a,6.4-p.y,floor(o/20.)*20.+10.-o);
     if(!zs)l=l.zyx;
     dd=dot(l,l);
     lit+=al*vec3(1,.55,.2)*max(dot(n,l),0.)*90./(sqrt(dd)*(dd+12.));
    }
    if(abs(lt.x)<60.&&abs(lt.y)<60.){
     l=vec3(25.-lt.x,5.1-p.y,clamp(lt.y,-18.,18.)-lt.y);dd=dot(l,l);
     lit+=al*vec3(.85,1,1.1)*max(dot(n,l),0.)*180./(sqrt(dd)*(dd+20.))*ao;
     l=vec3(-30.-lt.x,15.-p.y,sign(lt.y)*30.-lt.y);dd=dot(l,l);
     lit+=al*vec3(.6,.7,1)*max(dot(n,l),0.)*350./(sqrt(dd)*(dd+60.));
    }
   }else if(ZONE>2.5){
    l=vec3(-15,111.7,ZP+14.6)-p;dd=dot(l,l);
    lit+=al*vec3(.7,.9,1)*max(dot(n,l),0.)*9./(sqrt(dd)*(dd+2.));
   }else{
    // strip lights, both sides, the two nearest along the tube
    for(float i=0.;i<2.;i++){
     l=vec3(sign(p.x)*5.6-p.x,5.6-p.y,(floor(p.z/12.5)+i)*12.5-p.z);dd=dot(l,l);
     lit+=al*vec3(1,.55,.18)*max(dot(n,l),0.)*(1.+KICK)*60./(sqrt(dd)*(dd+14.));
    }
   }
   // every car's underglow, headlights and tail lights
   for(int i=0;i<4;i++){
    vec3 c=p-CAR(i).xyz;
    if(dot(c,c)<2500.&&ci!=i&&CX(i).w>0.){
     c=M[i]*c;
     float z=c.z-2.;
     lit+=(al+.015)*(CG(i).rgb*18.*exp(-max(b2(c.xz,vec2(.85,2.1)),0.)*1.2)*step(abs(c.y),1.6)
      +(z>0.?vec3(1,.9,.75)*CX(i).y*3.5*smoothstep(z*.4+1.2,z*.15,abs(c.x))*smoothstep(0.,4.,z)/(1.+z*z*.012)*step(c.y,2.5):vec3(1,.05,.02)*CG(i).w*3.*exp((z+4.)*.25-abs(c.x)*.6)*step(z,-4.))
      +vec3(2,.6,.15)*CX(i).x*5./(1.+dot(c+vec3(0,0,3),c+vec3(0,0,3))*.2));
    }
   }
  }
  lit+=em+al*max(dot(n,-rd),0.)*(ci<0?0.:.1)+al*FX.w*3.;
  float fa=1.-exp(-t*FOGD);
  col+=att*mix(lit,FOGC*(1.+2.*pow(max(dot(rd,MOON),0.),8.)),fa);
  att*=(1.-fa)*(rf+(1.-rf)*fre(n,rd,5.))*gl*tint*mix(vec3(1),al*1.6,mtl);
  if(b>0||rf<.01||att.x+att.y+att.z<.1)break;
  ro=p+n*.03;rd=reflect(rd,n);
 }
 O=vec4(col+glows(ro0,rd0,t0),t0);
}
