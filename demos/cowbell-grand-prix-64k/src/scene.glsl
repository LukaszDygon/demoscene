// The world: a curving skyway through a megacity, four cars and the props they throw at each other, raymarched.
uniform mat3 M[4];
out vec4 O;
const float AP=33.3333;   // arch spacing: one arch per beat at cruising speed
float mt;                 // material of the last map() call
vec3 gB;                  // building under the last map() call: height, id hash, second hash
bool noIce;
vec4 cm;                  // which cars the current ray passes close to
float pk;                 // >1 while marching: lets rays that skim the road take longer steps over it
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
// road centre line: straight, with S-bends. main.js sends the six nearest bends (z, sideways step) and a base offset.
float TX(float z){float x=U[32].w;for(int i=33;i<36;i++)x+=U[i].y*smoothstep(U[i].x-90.,U[i].x+90.,z)+U[i].w*smoothstep(U[i].z-90.,U[i].z+90.,z);return x;}
float TY(float z){return 4.*sin(z*.007)+.15*(max(z-RPA,0.)-max(z-RPB,0.));}
float fre(vec3 n,vec3 rd,float e){return pow(1.-clamp(dot(n,-rd),0.,1.),e);}
// the airship flies over the road, ahead of the pack
vec3 blp(vec3 p){return p-vec3(TX(BLZ),TY(BLZ)+45.,BLZ);}
vec3 GC(int i){return i==0?CLD>-1e3?hue(TM*.4):vec3(.1,.9,1):i==1?vec3(1,.07,.04):i==2?vec3(.7,.2,1):vec3(.5,1,.1);}

float bld(vec3 q,float cw){
 float ax=abs(q.x)-cw;
 if(ax<0.)return 2.-ax;
 if(q.y>340.)return q.y-338.;
 // above the clouds the city plan is twice the size: fewer, grander towers (and half the steps)
 float k=CLD>-1e3?2.:1.;
 vec2 a=vec2(ax,q.z)/k,c=floor(a/vec2(44,AP*2.)),l=mod(a,vec2(44,AP*2.))-vec2(22,AP);
 // whole 4x4 superblocks are left empty: vistas for the eye, long steps for the ray
 if(h1(floor(c/4.)+sign(q.x)*3.)<U[17].z*.8-.12){a=mod(a,vec2(176,AP*8.));a=min(a,vec2(176,AP*8.)-a);return(min(a.x,a.y)+2.)*k;}
 float h=h1(c+sign(q.x)*7.),g=fract(h*57.),H=h<U[17].z?-1e3:(18.+40.*g+260.*g*g*g*g*g)*(.3+.25*min(c.x,3.));
 vec2 s=vec2(16.+4.*fract(h*13.),AP-6.-8.*fract(h*29.));
 gB=vec3(H,h,g);
 vec3 d=vec3((abs(l)-s)*k,q.y-H);
 if(g>.7)d.xy=vec2(length(l)-s.x,-1.)*k;   // some towers are round
 float e=min(max(d.x,max(d.y,d.z)),0.)+length(max(d,0.));
 d=vec3((abs(l)-s*.6)*k,q.y-H*1.3);
 e=min(e,min(max(d.x,max(d.y,d.z)),0.)+length(max(d,0.)));
 return min(e,(min(22.-abs(l.x),AP-abs(l.y))+2.)*k);
}
float piano(vec3 p){
 float k=length(p.xz-vec2(-1.75,-1.1)),c=max(rb(p-vec3(0,1,0),vec3(.7,.14,1.1),.03),k-2.75);
 vec3 l=p-vec3(-.72,1.2,0);l.xy*=rot(.55);
 c=min(c,max(rb(l-vec3(.72,0,0),vec3(.72,.015,1.12),.01),k-2.78));
 c=min(c,max(min(length(vec2(abs(p.x)-.55,p.z+.85)),length(p.xz-vec2(-.35,.9)))-.07,abs(p.y-.45)-.45));
 return min(c,rb(p-vec3(0,.93,-1.2),vec3(.68,.05,.14),.01));
}
float duck(vec3 p){
 float b=(length((p-vec3(0,.62,0))/vec3(.75,.6,.95))-1.)*.6;
 b=smin(b,length(p-vec3(0,1.32,.5))-.45,.25);
 b=smin(b,length(p-vec3(0,.95,-.9))-.22,.3);
 b=smin(b,(length((vec3(abs(p.x),p.yz)-vec3(.68,.7,-.05))/vec3(.16,.32,.5))-1.)*.16,.08);
 return min(b,(length((p-vec3(0,1.24,.98))/vec3(.26,.1,.26))-1.)*.1);
}
// car in its own frame: x right, y up, z forward, wheels on y=0. returns (distance, sub-material)
// 0 paint 1 glass 2 tyre 3 rim 4 trim 5 glove/speaker 6 rocket 7 magnet
vec2 car(vec3 p,int id){
 vec3 q=vec3(abs(p.x),p.yz);
 bool pk=id==3;
 float wr=pk?.6:.37,L=id==0?2.2:id==1?2.35:id==2?2.5:1.7,cz=id==0?-.3:id==1?-.6:id==2?-.25:0.,cl=pk?.6:.72,e,sub;
 vec3 w=vec3(q.x-(pk?1.02:.9),q.y-wr,abs(q.z)-(pk?1.15:1.4));
 float lw=length(w.yz),wh=max(lw-wr,abs(w.x)-(pk?.28:.15))-.03;
 q.y-=pk?.5:0.;
 float hull=rb(q-vec3(0,.52,0),vec3(.82,pk?.3:.2,L-.14),.14);
 if(id==0)hull=max(hull,dot(q.yz-vec2(.5,2.34),vec2(.96,.28)));
 float cab=rb(q-vec3(0,pk?1.15:.98,cz-.15),vec3(.5,pk?.3:.13,cl+.15),.2);
 cab=max(cab,dot(q.yz-vec2(.8,cz+cl+.3),vec2(.64,.77)));
 if(id!=1&&!pk)cab=max(cab,dot(q.yz-vec2(1.3,cz-cl+.5),vec2(.87,-.5)));
 float d=smin(hull,cab,.15);
 sub=cab<hull&&q.y>.9?1.:0.;
 d=max(d,-max(lw-wr-.08,.6-q.x));
 if(wh<d){d=wh;sub=lw<wr*.68?3.:2.;}
 if(id==0){
  // wing, splitter, and whatever the item box put on the roof
  e=min(min(rb(q-vec3(0,1.33,-2.08),vec3(1.02,.03,.22),.02),rb(q-vec3(.6,1.1,-2.),vec3(.03,.22,.12),.01)),rb(q-vec3(0,.17,2.2),vec3(.9,.015,.22),.01));
  if(e<d){d=e;sub=4.;}
  if(RKT>0.){
   vec3 g=(p-vec3(0,1.3+.34*RKT,-.4))/RKT;
   e=max(length(g.xy)-.32*min(1.,(1.7-g.z)*1.4),abs(g.z-.35)-1.35);
   e=min(e,min(rb(g+vec3(0,0,.75),vec3(.62,.02,.22),.01),rb(g+vec3(0,0,.75),vec3(.02,.62,.22),.01)))*RKT*.8;
   if(e<d){d=e;sub=6.;}
  }
  if(MAG>0.){
   vec3 g=(p-vec3(0,1.3+.2*MAG,0))/MAG;g.yz*=rot(-.6);
   e=(g.z>0.?max(length(vec2(abs(g.x)-.42,g.y))-.15,g.z-.9):length(vec2(length(g.xz)-.42,g.y))-.15)*MAG;
   if(e<d){d=e;sub=7.;}
  }
 }else if(id==1){
  // blower through the hood, side pipes
  e=min(rb(q-vec3(0,1.02,.95),vec3(.26,.16,.38),.06),max(length(q.xy-vec2(1.03,.3))-.09,abs(q.z-.2)-.9));
  if(e<d){d=e;sub=4.;}
 }else if(id==2){
  // tail fins and bull horns
  e=min(rb(q-vec3(.84,.98,-2.05),vec3(.03,.16,.42),.03),seg(q,vec3(.12,.85,2.25),vec3(.7,1.15,2.5))-.08+.05*clamp((q.x-.12)/.58,0.,1.));
  if(e<d){d=e;sub=4.;}
  if(GLV.x>0.){
   // boxing glove on a spring, out of the door
   vec3 g=vec3(p.x*GLV.y,p.y-.8,p.z+.1);
   float x=g.x-.9,ex=GLV.x;
   e=max(length(vec2(length(g.yz)-.2,(fract(x/ex*5.-atan(g.z,g.y)/6.2832)-.5)*ex/5.))-.04,abs(x-ex*.5)-ex*.5)*.7;
   g.x-=1.35+ex;
   e=min(e,smin(length(g*vec3(.8,1,1))-.5,length(g-vec3(-.1,.36,.3))-.22,.12));
   e=min(e,max(length(g.yz)-.4,abs(g.x+.52)-.12));
   if(e<d){d=e;sub=5.;}
  }
 }else{
  e=rb(q-vec3(0,1.85,-.1),vec3(.6,.2,.5),.05);
  if(e<d){d=e;sub=5.;}
 }
 return vec2(d,sub);
}
float map(vec3 p){
 float d=1e5,e;
 vec3 q=vec3(p.x-TX(p.z),p.y-TY(p.z),p.z);
 float ax=abs(q.x);
 mt=0.;
 if(ZONE<1.5||ZONE>2.5){
  float tz=max(TU0-q.z,q.z-TU1),az=mod(q.z+AP*.5,AP)-AP*.5,gz=min(abs(q.z-12.),abs(q.z-ZF));
  bool un=ZONE>2.5;
  if(un){
   // undercity: street level under the deck, blade signs
   d=q.y*pk;mt=1.;
   e=b2(q.xy-vec2(0,24),vec2(15,1.5));UN(3.)
   e=rb(vec3(ax-14.2,q.y-7.,mod(q.z,22.)-11.),vec3(1.1,2.2,.1),.05);UN(12.)
  }
  // deck, barrier, pillars, arches and gantries all live inside one box round the road
  e=max(ax,q.y)-11.5;
  if(un||e<1.){
   if(!un){
    d=ax<9.4&&q.y>0.?q.y*pk:b2(q.xy+vec2(0,.7),vec2(9.4,.7));mt=1.;
    e=b2(vec2(ax-9.1,q.y-.4),vec2(.16,.4))-.1;UN(2.)
    if(q.y<0.){e=max(length(vec2(q.x,mod(q.z,AP*4.)-AP*2.))-1.6,q.y+1.);UN(3.)}
   }
   e=abs(az)-.35;if(e<d){e=max(max(b2(q.xy-vec2(0,3.6),vec2(10.9,4.75)),-b2(q.xy-vec2(0,3.3),vec2(10.3,4.35))),e);UN(3.)}
   e=gz-2.;if(e<2.)e=rb(vec3(q.x,q.y-9.6,gz),vec3(10.8,1.2,.25),.05);UN(11.)
  }else d=e;
  // a tall neon gate every sixteenth arch
  e=abs(mod(q.z+AP*8.,AP*16.)-AP*8.)-.8;
  if(e<d&&!un){e=max(e,max(b2(q.xy-vec2(0,14),vec2(17.2,16)),-b2(q.xy-vec2(0,13),vec2(16,15.6))));UN(14.)}
  // a monorail runs beside the road: an oncoming train passes every four bars
  if(q.x<-11.&&q.x>-16.&&q.y<9.&&gz>62.&&CLD<-1e3&&!un){
   e=b2(q.xy-vec2(-13.2,3.6),vec2(.3,.3));UN(3.)
   e=rb(q-vec3(-13.2,5.6,TRZ),vec3(1.1,1.3,40),.4);UN(16.)
  }
  // grandstands flank the start and the finish
  if(gz<62.&&!un){e=max(max(ax-17.,12.-ax),max(q.y-(ax-12.)*1.2-1.,gz-60.));UN(13.)}
  // the megawall and its bore, or the city
  e=tz;if(e<1.)e=max(max(tz,q.y-95.),11.-length(q.xy-vec2(0,1.5)));UN(5.)
  if(tz>0.){e=bld(vec3(q.x,p.y,q.z),ZONE>2.5?13.:16.);UN(4.)}
  if(BOX.x>0.){
   vec3 b=q-vec3(0,1.3,BOX.x);
   float ix=floor(clamp(b.x/4.+2.,0.,3.));
   if(mod(floor(BOX.y/exp2(ix)),2.)>.5){b.x-=ix*4.-6.;b.xz*=rot(TM*2.);b.xy*=rot(.6);e=rb(b,vec3(.55),.12);UN(7.)}
  }
 }
 for(int i=0;i<4;i++){
  if(cm[i]>0.){
   vec3 c=p-CAR(i).xyz;
   e=length(c)-CX(i).w;
   if(e<.5){vec2 r=car(M[i]*c,i);e=r.x*CAR(i).w;if(e<d){d=e;mt=20.+float(i)*10.+r.y;}}
   else d=min(d,e);
  }
 }
 if(CLD>-1e3){
  vec3 a=blp(p);
  e=length(a)-54.;
  if(e<4.){
   e=(length(a*vec3(1,1,.22))-11.)*.9;UN(15.)
   e=rb(a+vec3(0,12,0),vec3(2,1.5,8),1.);UN(3.)
  }else d=min(d,e);
 }
 if(ICE>0.&&!noIce){
  vec3 c=M[0]*(p-CAR(0).xyz);
  e=rb(c-vec3(0,.85,0),ICE*vec3(1.1,.75,2.4),.3*ICE)+.03*sin(c.x*5.)*sin(c.y*6.+1.)*sin(c.z*4.);UN(6.)
 }
 if(BALL.w>0.){e=length(p-BALL.xyz)-BALL.w;UN(8.)}
 if(PIA.w>0.){
  vec3 a=p-PIA.xyz;
  e=length(a)-2.6*PIA.w;
  if(e<.5){a.yz*=rot(PIR.x);a.xy*=rot(PIR.y);e=piano(a/PIA.w+vec3(0,.6,0))*PIA.w;UN(9.)}
  else d=min(d,e);
 }
 if(DUK.w>0.){
  vec3 a=p-DUK.xyz;
  e=length(a-vec3(0,DUK.w,0))-2.4*DUK.w;
  if(e<.5){a/=DUK.w;a.xz*=rot(DK2.y);a.y/=DK2.x;a.xz*=sqrt(DK2.x);e=duck(a)*DUK.w*min(DK2.x,1.)*.8;UN(10.)}
  else d=min(d,e);
 }
 return d;
}
// falling through the black hole: neon city light pulled into streaks around a throat
vec3 worm(vec3 rd){
 float r=length(rd.xy)+1e-4,a=atan(rd.y,rd.x)/6.2832,z=rd.z/r;
 a+=.03*z+.06*sin(TM+z*.3);
 vec2 g=vec2(a*48.,z*.12+TM*3.),c=floor(g);
 float h=h1(vec2(mod(c.x,48.),c.y)),A=a*6.2832;
 vec3 col=hue(h*3.+a+TM*.05)*step(.5,h)*smoothstep(.5,.1,abs(fract(g.x)-.5))*smoothstep(0.,.2,fract(g.y))*smoothstep(1.,.5,fract(g.y))*3.;
 col+=vec3(.3,.06,.5)*fbm(vec2(cos(A)*1.5+z*.2+TM,sin(A)*1.5-z*.1))+vec3(.02,.01,.05);
 col*=smoothstep(0.,.45,r);
 return col+vec3(.8,.9,1.2)*(EXIT*EXIT*40.+.3)*exp(-r*r*(60.-50.*EXIT))*step(0.,rd.z);
}
// mark the cars whose bounding sphere the ray (or its backward extension) comes near
void cull(vec3 ro,vec3 rd){
 for(int i=0;i<4;i++){vec3 c=CAR(i).xyz-ro;float b=dot(c,rd),r=CX(i).w+1.5;cm[i]=step(dot(c,c)-b*b,r*r);}
}
vec3 fogc(vec3 rd){return (HOR+ZEN)*.35+SUNC*pow(max(dot(rd,SUN),0.),6.)*.2+FLASH*vec3(.4,.5,.7);}
vec3 sky(vec3 ro,vec3 rd,bool lo){
 if(ZONE>1.5&&ZONE<2.5)return worm(rd);
 float y=rd.y,sd=max(dot(rd,SUN),0.),az=atan(rd.x,rd.z);
 vec3 c=mix(HOR,ZEN,pow(max(y,0.),.45));
 if(lo)return c+SUNC*(pow(sd,300.)*12.+pow(sd,24.)*.35+pow(sd,3.)*.12);
 c+=SUNC*(mix(pow(sd,900.)*40.,smoothstep(.9982,.9988,sd)*(4.+8.*vn(rd.xy*70.)),step(.9,NIGHT))+pow(sd,24.)*.35+pow(sd,3.)*.12);
 c+=(HOR*.5+SUNC*.12)*smoothstep(.45,.8,vn(rd.xz/(abs(y)+.12)*vec2(.7,2.2)+TM*.01)*.6+vn(rd.xz/(abs(y)+.12)*vec2(2.,5.))*.4)*max(y,0.);
 vec3 s=floor(rd*200.);
 c+=NIGHT*step(.998,h1(s.xy+s.z*7.))*max(y,0.)*4.;
 // lightning bolt
 if(FLASH>0.)c+=FLASH*vec3(.6,.7,1.)*(.25+8.*smoothstep(.02,0.,abs(az-.3-(vn(vec2(y*14.,floor(TM*9.)))-.5)*.3))*step(.03,y));
 if(y>.015){
  // searchlights sweep the night
  if(NIGHT>.3&&CLD<-1e3)for(float a=-1.9;a<2.;a+=1.3)c+=NIGHT*vec3(.5,.6,.9)*.1*smoothstep(.015+y*.06,0.,abs(az-a-y*sin(TM*.6+a*7.)*1.4))*(1.-y);
  // a drone show hangs in the night sky: someone knows how this ends
  vec2 dr=vec2(az+.7,y-.42)*3.;
  if(NIGHT>.9&&CLD<-1e3&&min(min(length(dr-vec2(-.05,-.12))-.3,length(dr-vec2(.2,.2))-.17),max(abs(dr.x-.43)-.09,abs(dr.y-.18)-.04))<0.)
   c+=vec3(1.,.85,.3)*smoothstep(.25,.1,length(fract(dr*28.)-.5))*(1.5+sin(TM*5.+dr.x*40.));
  // lanes of flying traffic overhead
  float t=(150.-ro.y)/y;vec2 h=ro.xz+rd.xz*t;
  float l=floor(h.x/90.),v=h.y*.03+TM*(mod(l,2.)>.5?1.5:-1.2);
  c+=(mod(l,2.)>.5?vec3(1.,.15,.1):vec3(.9,.95,1.))*smoothstep(1.+t*.006,0.,abs(mod(h.x,90.)-45.))*smoothstep(.3,.5,abs(fract(v)-.5))*step(.3,h1(vec2(floor(v),l)))*60./(40.+t*.2)*step(CLD,-1e3);
  // far skyline
  float a=az*50.,hh=.015+.11*pow(h1(vec2(floor(a),3.)),3.);
  if(y<hh&&CLD<-1e3)c=mix(c,HOR*.25+step(.75,h1(floor(vec2(a*5.,y*500.))))*vec3(1.,.7,.4)*.5*NIGHT,.9);
 }else if(CLD>-1e3){
  // sea of cloud under the road, lit from the low sun
  float t=(CLD-ro.y)/min(y,-1e-3);vec2 h=(ro.xz+rd.xz*t)*.004;
  float n=fbm(h+TM*.004),k=clamp((n-fbm(h+TM*.004+SUN.xz*.12))*4.+.5,0.,1.);
  c=mix(mix(vec3(.3,.22,.38),vec3(1.5,.85,.5),k)+SUNC*pow(sd,6.)*.2+vec3(.5,.35,.3)*smoothstep(.5,.8,vn(h*2.3*.9+TM*.02)),c,1.-exp(-t*.0007));
 }else{
  // the city floor far below: avenues and a sea of lights
  float t=(-170.-ro.y)/min(y,-1e-3);vec2 h=ro.xz+rd.xz*t,g=abs(mod(h,80.)-40.);
  c=mix((step(.86,h1(floor(h/7.)))*vec3(1.,.75,.45)+vec3(1.,.45,.15)*smoothstep(3.,0.,min(g.x,g.y)))*(.4+NIGHT),HOR*.7,1.-exp(-t*.0016));
 }
 return c;
}
vec3 glows(vec3 ro,vec3 rd,float tm){
 vec3 g=vec3(0);float s,tr,d;
 for(int i=0;i<4;i++){
  float f=CX(i).x;
  // headlight shafts in the haze
  if(CX(i).w>0.&&NIGHT>.2){
   vec3 a=CAR(i).xyz+vec3(0,.6,2.2)*M[i];
   d=rseg(ro,rd,a,a+vec3(0,-.3,18)*M[i],s,tr);
   if(tr<tm)g+=vec3(1.,.9,.7)*(1.-s)*(.3+.7*NIGHT)*.1/(1.+d*d/(.1+s*s*4.));
  }
  if(f>.06){
   bool rk=i==0&&RKT>0.;
   for(float k=-1.;k<2.;k+=2.){
    vec3 a=CAR(i).xyz+(rk?vec3(0,1.3+.34*RKT,-1.9):vec3(k*.45,i==3?.86:.36,-2.3))*M[i],b=a-vec3(0,0,f*(rk?7.:2.5))*M[i];
    d=rseg(ro,rd,a,b,s,tr);
    if(tr<tm)g+=(i==0?vec3(.35,.6,2.):vec3(2.,.55,.12))*(1.-s)*(.6+.4*sin(s*20.-TM*50.))*(rk?1.6:1.)/(1.+d*d*(rk?25.:60.));
   }
  }
 }
 if(BEAM.w>0.){
  // magnet tractor beam (hero roof to target) or freeze ray (villain to hero)
  // (or 3: a lightning bolt finds the piano)
  bool fz=BEAM.w>1.5&&BEAM.w<2.5,lt=BEAM.w>2.5;
  vec3 a=lt?PIA.xyz:fz?CAR(1).xyz+vec3(0,.9,0):CAR(0).xyz+vec3(0,2.,0),b=fz?CAR(0).xyz+vec3(0,.9,0):BEAM.xyz;
  for(float k=0.;k<3.;k++){
   vec3 o=sin(vec3(1,2,3)*k*2.+TM*(30.+k*7.))*(lt?4.:.15)*k;
   d=rseg(ro,rd,a+o*.3,b+o,s,tr);
   if(tr<tm)g+=(lt?vec3(3.,3.5,6.):fz?vec3(.3,.9,1.8):vec3(1.8,.3,1.4))*(.5+.5*sin(s*40.-TM*60.+k))/(1.+d*d*80.);
  }
 }
 return g;
}
void main(){
 cam();
 vec2 uv=(2.*gl_FragCoord.xy-U[0].xy)/U[0].y;
 vec3 ro=U[1].xyz,rd=normalize(uv.x*CR+uv.y*CU+U[1].w*CF),col=vec3(0),att=vec3(1),ro0=ro,rd0=rd;
 float t0=1e4;
 int left=1;
 noIce=false;
 for(int b=0;b<3;b++){
  float t=.05,d=0.,tm=b==0?700.:90.;
  int N=b==0?76:18;
  pk=max(1.,1./(max(-rd.y,0.)+.2));
  cull(ro,rd);
  // nothing below the cloud deck is ever seen
  if(CLD>-1e3&&rd.y<0.)tm=min(tm,(CLD-ro.y)/rd.y);
  for(int i=0;i<N&&t<tm;i++){d=map(ro+rd*t);if(d<.002+t*.0008)break;t+=max(d*.9,t*.004);}
  pk=1.;
  float m=mt;
  bool hit=t<tm&&d<.006*t+.05;
  if(b==0&&hit)t0=t;
  if(!hit){col+=att*sky(ro,rd,b>0);break;}
  vec3 p=ro+rd*t;
  vec2 k=vec2(.002+t*.0006,0);
  vec3 n=m<1.5?normalize(vec3(0,1,-.028*cos(p.z*.007)-.15*step(RPA,p.z)*step(p.z,RPB))):normalize(vec3(map(p+k.xyy),map(p+k.yxy),map(p+k.yyx))-map(p)),B=gB,
  al=vec3(.05),em=vec3(0),q=vec3(p.x-TX(p.z),p.y-TY(p.z),p.z);
  float rf=0.,ax=abs(q.x),sss=0.,mtl=0.,gl=1.;
  vec3 tint=vec3(1);
  int ci=-1;
  if(m<1.5){
   // wet asphalt: puddles, skid marks, lane paint, chequered lines, and the disco floor
   float pud=smoothstep(.4,.65,vn(q.xz*vec2(.3,.1))*.65+vn(q.xz*vec2(1.1,.4))*.35)*WET,gz=min(abs(q.z-12.),abs(q.z-ZF)),
   mk=gz<1.5?mod(floor(q.x/1.5)+floor(q.z/1.5),2.):smoothstep(.15,.08,abs(ax-3.))*step(.5,fract(q.z/12.))+smoothstep(.15,.08,abs(ax-8.4));
   al=mix(vec3(.03+.03*vn(q.xz*vec2(5,.4)))*(1.-.6*smoothstep(.6,.8,vn(vec2(q.x*1.3,q.z*.04)+3.))),vec3(.6),mk*.8*step(ax,9.));
   rf=.03+.1*WET+.5*pud;gl=.25+.75*pud;
   tint=mix(vec3(1),hue(vn(q.xz*.7)*2.+fre(n,rd,1.)*2.)*1.5,pud*.45);
   em=vec3(1.5,1.1,.5)*NIGHT*step(.92,fract(q.z/6.))*smoothstep(.12,.05,abs(ax-3.))*step(1.5,gz)
    +LAMP*KICK*KICK*2.5*smoothstep(.25,.1,abs(mod(q.z+AP*.5,AP)-AP*.5))*step(ax,8.3);
   float bz=BOX.x-q.z;
   if(bz>0.&&bz<90.)em+=vec3(.1,.9,1.)*step(.6,fract((bz+abs(mod(q.x,4.)-2.)*1.5)*.2+TM*3.))*step(abs(mod(q.x,4.)-2.),1.2)*(1.-bz/90.);
   n=normalize(n+vec3(vn(q.xz*vec2(7,.8))-.5,0,vn(q.xz*vec2(7,.8)+9.)-.5)*.12*(1.-pud));
   if(RAIN>0.){vec2 g=q.xz*1.5,c=floor(g);float r=length(fract(g)-.5),w=fract(h1(c)+TM*1.7);n=normalize(n+vec3(1,0,1)*sin(r*40.-w*12.)*.15*RAIN*pud*smoothstep(.5,.2,r)*(1.-w));}
   if(BALL.w>0.){vec2 g=q.xz/3.;em+=hue(h1(floor(g)+floor(BT*4.)))*smoothstep(30.,6.,length(p.xz-BALL.xz))*step(.08,min(fract(g.x),fract(g.y)))*step(.4,h1(floor(g)-floor(BT*8.)))*1.3;}
  }else if(m<2.5){
   al=vec3(.12);rf=.05;
   if(q.y>.72)em=mix(vec3(1,.1,.6),vec3(.1,.8,1),step(.5,fract(q.z/AP*.5)))*(.3+2.*BELL)*step(.3,fract(q.z*.15-TM*4.));
  }else if(m<3.5){
   al=vec3(.04);
   if(n.y<-.5&&q.y>7.&&q.y<8.&&ax<9.)em=LAMP*5.;
  }else if(m<4.5){
   // towers: windows, a neon sign column here and there, a crown light
   float u=abs(n.x)>abs(n.z)?p.z:q.x,v=p.y,id=B.y;
   vec2 wc=floor(vec2(u/2.4,v/3.4)),wf=fract(vec2(u/2.4,v/3.4));
   al=vec3(.03,.035,.05);
   em=mix(vec3(.6,.55,.5)*(.06+.12*NIGHT),smoothstep(.08,.14,wf.x)*smoothstep(.92,.86,wf.x)*smoothstep(.15,.22,wf.y)*smoothstep(.9,.8,wf.y)*step(h1(wc+id*91.),.1+.2*NIGHT)
    *mix(vec3(1,.75,.4),vec3(.5,.8,1),step(.6,h1(wc.yy+id*7.)))*(.3+1.5*h1(wc*1.7+id)),smoothstep(420.,160.,t));
   float sg=h1(vec2(id*37.,floor(u/9.)));
   if(sg>.82&&v<B.x*.8&&v>-30.)em=hue(sg*13.+id)*step(.4,h1(floor(vec2(u*1.2,v*.6))+floor(TM*2.*sg)))*2.5*step(abs(fract(u/9.)-.5),.2)*(.6+.8*BELL);
   em+=hue(id*5.)*(smoothstep(1.2,.2,abs(v-B.x))*3.*step(.5,B.z)+.6*step(.955,fract(v/40.+id)));
   // holo billboards: someone is advertising rubber ducks
   vec2 hb=vec2(fract(u/26.)-.5,(v-16.)/18.);
   if(fract(id*23.)>.6&&abs(hb.y)<.5&&abs(hb.x)<.42&&B.x>30.){
    float dk=min(min(length(hb-vec2(-.03,-.12))-.2,length(hb-vec2(.12,.13))-.11),max(abs(hb.x-.27)-.06,abs(hb.y-.11)-.03));
    em=(dk<0.?vec3(2.5,1.7,.1):hue(id*3.+.5)*(.25+.2*sin(hb.y*90.+TM*4.)))*(.8+.2*sin(TM*30.*fract(id*7.)));
   }
   if(n.y>.5){al=vec3(.02);em=vec3(6,.15,.08)*step(.985,h1(floor(q.xz/3.)))*step(.5,fract(TM*.6+id));}
   em+=mix(HOR,ZEN,.5)*.4*fre(n,rd,3.);
  }else if(m<5.5){
   // megawall face with a neon ring round the bore; inside, tiled tube with strip lights
   float a=atan(q.x,q.y-1.5),r=length(q.xy-vec2(0,1.5));
   if(abs(n.z)>.7){al=vec3(.04);em=vec3(1,.15,.5)*smoothstep(1.6,.3,abs(r-12.3))*3.*(.6+.6*KICK)+step(.985,h1(floor(q.xy/4.)))*vec3(1,.7,.3)*2.;}
   else{
    al=vec3(.1)*step(.06,fract(a*6.))*step(.03,fract(q.z/4.));
    em=LAMP*8.*smoothstep(.03,.015,abs(abs(a)-.6))*step(.25,fract(q.z/AP*2.+.125))+vec3(.1,1,.4)*smoothstep(.02,.01,abs(abs(a)-1.4))*step(.5,fract(q.z/AP-TM*.6))*2.
     +LAMP*KICK*KICK*3.*smoothstep(.5,.2,abs(mod(q.z+AP*.5,AP)-AP*.5))
     +vec3(1.5,.5,.05)*step(.7,fract((q.z-abs(abs(a)-1.05)*9.)*.25-TM*5.))*step(abs(abs(a)-1.05),.12);
   }
  }else if(m<6.5){al=vec3(.04,.07,.09);}
  else if(m<7.5){
   // item box: a glowing cube with a question mark on every face
   vec3 b=q-vec3(0,1.3,BOX.x);
   b.x-=floor(clamp(b.x/4.+2.,0.,3.))*4.-6.;b.xz*=rot(TM*2.);b.xy*=rot(.6);
   vec2 f=abs(b.x)>max(abs(b.y),abs(b.z))?b.zy:abs(b.y)>abs(b.z)?b.xz:b.xy;
   al=vec3(0);rf=.25;
   em=min(min(max(abs(length(f-vec2(0,.14))-.16)-.05,-max(f.x,f.y-.14)),max(abs(f.x)-.05,abs(f.y+.1)-.09)),length(f+vec2(0,.33))-.06)<0.?vec3(5.)
    :(BOX.z>0.?vec3(1,.6,.08):hue(q.x*.13+TM*.7))*(1.2+.4*sin(TM*9.+q.x));
  }
  else if(m<8.5){
   // mirror ball: snap the normal to a facet
   vec3 v=n;v.xz*=rot(TM*1.5);
   vec2 g=floor(vec2(atan(v.z,v.x)*5.,acos(clamp(v.y,-1.,1.))*7.));
   float th=(g.x+.5)/5.,ph=(g.y+.5)/7.;
   v=vec3(sin(ph)*cos(th),cos(ph),sin(ph)*sin(th));v.xz*=rot(-TM*1.5);
   n=v;rf=.9;al=vec3(.02);em=hue(h1(g))*.2;
  }else if(m<9.5){
   vec3 a=p-PIA.xyz;a.yz*=rot(PIR.x);a.xy*=rot(PIR.y);a=a/PIA.w+vec3(0,.6,0);
   al=vec3(.01);rf=.3;
   if(a.z<-1.05&&a.y>.95)al=vec3(.85)*step(.12,fract(a.x*8.))*(a.z>-1.2&&fract(a.x*8.+.5)<.55?0.:1.),rf=.1;
   else if(a.y>1.1&&a.y<1.19&&abs(a.x)<.66&&a.z>-.95)al=vec3(.7,.5,.15)*(.4+.6*step(.5,fract(a.x*25.))),rf=.4,mtl=1.;
  }else if(m<10.5){
   vec3 a=(p-DUK.xyz)/DUK.w;a.xz*=rot(DK2.y);a.y/=DK2.x;a.xz*=sqrt(DK2.x);
   al=vec3(1.,.6,.02);rf=.06;sss=1.;
   if(a.z>.78&&a.y>1.1&&a.y<1.4&&abs(a.x)<.3)al=vec3(1.,.2,.01);
   if(length(vec3(abs(a.x),a.yz)-vec3(.21,1.52,.83))<.085){al=vec3(0);rf=.6;}
  }else if(m<11.5){
   if(abs(q.z-ZF)<2.){al=vec3(mod(floor(q.x)+floor(q.y),2.));em=al*.25;}
   else{
    al=vec3(.02);
    if(abs(q.x)<4.5&&length(vec2(mod(q.x+1.5,3.)-1.5,q.y-9.6))<.8)em=LITE>3.5?vec3(.2,6.,.6):LITE>floor(q.x/3.+1.5)+.5?vec3(8.,.2,.1):vec3(.04,0,0);
   }
  }else if(m>15.5&&m<16.5){
   al=vec3(.3);rf=.3;
   if(abs(q.y-6.1)<.45)em=vec3(1.,.9,.6)*step(.25,fract(q.z*.35))*2.;
  }else if(m>14.5&&m<15.5){
   // airship: silver hull with a lit screen along its flank and a tail light
   vec3 a=blp(p);
   al=vec3(.5,.52,.6);rf=.2;
   if(abs(a.y)<5.&&abs(a.z)<26.)em=hue(a.z*.02-TM*.3)*(.4+step(.5,fract(a.z*.4-TM*2.)))*step(.3,fract(a.y*.8))*1.5;
   em+=vec3(8,.2,.1)*step(46.,-a.z)*step(.5,fract(TM));
  }else if(m>13.5&&m<14.5){
   vec3 k=hue(floor(q.z/AP/16.)*.37+.8);
   al=vec3(.03);em=abs(n.z)>.5?k*step(.5,fract((ax+abs(q.y-14.))*.15-TM))*.7:k*(2.+3.*BELL);
  }else if(m>12.5&&m<13.5){
   // the crowd: specks of colour and camera flashes
   vec2 g=floor(q.zy*vec2(2.,3.));
   al=hue(h1(g)*9.)*(.15+.25*smoothstep(.5,1.,sin(q.z*.15-TM*3.)))*step(.4,h1(g+5.));em=vec3(9.)*step(.997,h1(g+floor(TM*10.)));
  }else if(m<12.5){
   float k=h1(vec2(floor(q.z/22.),sign(q.x)));
   al=vec3(0);em=hue(k*7.)*(.4+step(.35,h1(floor(q.zy*vec2(2.5,1.5))+floor(TM*3.*k))))*2.5*step(.2,k);
  }else{
   ci=int((m-20.)/10.);
   float sub=m-20.-float(ci)*10.,fr=fre(n,rd,1.);
   vec3 g=GC(ci),c=M[ci]*(p-CAR(ci).xyz),w=vec3(abs(c.x),c.yz);
   bool pk=ci==3;
   float y=w.y-(pk?.5:0.),L=ci==0?2.2:ci==1?2.35:ci==2?2.5:1.7,wr=pk?.6:.37;
   vec2 v=vec2(w.y-wr,abs(c.z)-(pk?1.15:1.4));
   float lw=length(v);
   if(sub<.5){
    // paint: chameleon flip, matte black, gold flake, hot pink
    al=(ci==0?hue(fr*.8+.55+c.z*.03)*.5:ci==1?vec3(.012):ci==2?vec3(.9,.6,.15):vec3(1.,.07,.4))*(.8+.4*h1(floor(c.xz*90.)+floor(c.y*90.)));
    rf=ci==1?.04:ci==2?.5:.12;mtl=ci==2?1.:0.;
    // liveries: twin stripes, hot-rod flames, candy fade, polka dots
    float fl=c.z*.5+.2-abs(y-.55)*1.6+(vn(vec2(c.z*3.,y*9.))-.5);
    if(ci==0&&abs(w.x-.22)<.09)al=vec3(.85);
    if(ci==1&&fl>0.&&abs(n.x)>.5)al=mix(vec3(1,.2,.02),vec3(1,.8,.1),clamp(fl*2.,0.,1.)),em=al*.25;
    if(ci==2)al=mix(vec3(.5,.03,.02),al,smoothstep(-1.6,.6,c.z+sin(y*14.)*.25))*(1.-.9*U[32].z*vn(c.zy*4.)),rf*=1.-U[32].z;
    if(pk&&length(fract(vec2(c.z,y)*2.4)-.5)<.2)al=vec3(.95);
    // door seams, a number roundel for the hero, a grille, and each car's own headlights
    al*=1.-.7*smoothstep(.025,0.,min(abs(c.z-.5),abs(c.z+.65)))*step(.5,abs(n.x));
    if(ci==0&&length(vec2(c.z+.08,y-.62))<.2&&abs(n.x)>.5)al=vec3(.9);
    if(y<.3)em=g*(1.5+2.5*KICK);
    if(w.z>L-.14){
     if(w.x<.42&&abs(y-.46)<.11)al=vec3(.01)+(ci==1?.5*step(.6,fract(c.x*10.)):.3*step(.6,fract(y*24.)));
     if((ci==0?max(abs(y-.6)-.035,.35-w.x):pk?length(vec2(w.x-.48,y-.72))-.17:max(length(vec2(w.x-.62,abs(y-.6)-(ci==2?.11:0.)))-(ci==2?.085:.13),ci==1?y-.52-w.x*.2:-1.))<0.)em=ci==1?vec3(6.,1.2,.3):vec3(5.,4.5,3.8);
    }
    if(w.z<.1-L&&abs(y-.66)<.06)em=vec3(5.,.12,.06);
    if(w.z<.1-L&&w.x<.26&&abs(y-.44)<.07)em=vec3(1.6);   // number plate
    if(ci==1&&abs(y-.62)<.015)em=vec3(2.,.05,.02);
   }else if(sub<1.5){al=vec3(.01);rf=.35;em=g*.12*NIGHT;}   // dashboard glow behind the glass
   else if(sub<2.5){al=vec3(ci==2&&abs(lw-wr*.8)<.03?.8:.015);}
   else if(sub<3.5){
    // spinner rims with a neon ring
    al=(ci==0?vec3(1.,.75,.3):ci==1?vec3(.6,.05,.05):vec3(.8))*(.3+.7*smoothstep(.2,.3,abs(fract((atan(v.x,v.y)*sign(c.z)+CX(ci).z+TM*3.)*5./6.2832)-.5)));
    rf=.5;mtl=1.;em=g*3.*smoothstep(.04,.01,abs(lw-wr*.6));
   }else if(sub<4.5){al=ci==2?vec3(.85,.8,.65):vec3(.03);rf=ci==1?.7:.15;if(ci==0&&c.z<-2.27&&y>1.2)em=vec3(4.,.1,.05);}
   else if(sub<5.5){
    if(pk){al=vec3(.02);float r=length(vec2(mod(c.x+.3,.6)-.3,y-1.85));em=g*(.3+3.*KICK)*smoothstep(.2,.16,r)*smoothstep(.05,.09,r);}
    else{float x=c.x*GLV.y-1.35-GLV.x;al=x>-.4?vec3(.8,.02,.02):x>-.66?vec3(.9):vec3(.5);rf=x>-.66?.08:.6;}
   }else if(sub<6.5){float z=(c.z+.4)/RKT;al=z>1.||z<-.5?vec3(.9,.05,.05):vec3(.9)*step(.5,fract(z*2.));rf=.2;}
   else{al=c.z>.55*MAG?vec3(.7):vec3(.9,.03,.03);rf=.3;}
  }
  if(m>5.5&&m<6.5)sss=.5;
  // ---- light ----
  bool dyn=m<3.5||m>5.5;
  float ao=b>0||!dyn?1.:.3+.7*clamp(map(p+n*.6)/.6,0.,1.),nl=dot(n,SUN);
  vec3 lit=al*mix(HOR*.35,ZEN+HOR*.25,n.y*.5+.5)*ao*1.6;
  nl=(nl+sss*.5)/(1.+sss*.5);
  if(nl>0.&&SUNC.x+SUNC.z>0.){
   float s=1.,ts=.1;
   if(b==0&&dyn&&SUNC.x>2.){cull(p,SUN);for(int i=0;i<8;i++){float h=map(p+n*.03+SUN*ts);s=min(s,10.*h/ts);ts+=clamp(h,.3,12.);if(s<.01||ts>90.)break;}}
   lit+=(al*nl+pow(max(dot(reflect(rd,n),SUN),0.),40.)*(rf+.05)*2.)*SUNC*clamp(s,0.,1.);
  }
  // the two nearest arch lamps
  if(b==0)for(int i=0;i<2;i++){vec3 l=vec3(clamp(q.x,-9.,9.)-q.x,7.4-q.y,(floor(q.z/AP)+float(i))*AP-q.z);float dd=dot(l,l);lit+=al*LAMP*max(dot(n,l),0.)*130./(sqrt(dd)*(dd+15.));}
  // every car's underglow, headlights, tail lights and flames
  if(b==0)for(int i=0;i<4;i++){
   vec3 c=p-CAR(i).xyz,g=GC(i),f;
   if(dot(c,c)<2500.&&ci!=i){
    c=M[i]*c;f=c+vec3(0,0,4);
    float z=c.z-2.;
    lit+=(al+.01)*(g*14.*exp(-max(b2(c.xz,vec2(.9,2.1)),0.)*1.3)*step(abs(c.y),1.5)*(.5+KICK)
     +(z>0.?vec3(1.,.9,.75)*7.*smoothstep(z*.4+1.2,z*.15,abs(c.x))/(1.+z*z*.012)*step(c.y,2.):vec3(1.,.05,.02)*3.*exp((z+4.)*.25-abs(c.x)*.6)*step(z,-4.))
     +(i==0?vec3(.4,.7,2.):vec3(2.,.6,.15))*CX(i).x*5./(1.+dot(f,f)*.15));
   }
  }
  // mirror-ball spots sweep over everything
  if(BALL.w>0.&&(m<7.5||m>8.5)){
   vec3 v=p-BALL.xyz;float dd=length(v);v/=dd;
   if(dot(n,v)<0.){v.xz*=rot(TM*1.5);vec2 g=vec2(atan(v.z,v.x)*5.,acos(clamp(v.y,-1.,1.))*7.)*1.5;lit+=(al+.03)*hue(h1(floor(g)))*smoothstep(.32,.18,length(fract(g)-.5))*700./(dd*dd+40.);}
  }
  lit+=al*FLASH*vec3(.7,.8,1.)*(n.y*.5+.5)*4.+em+al*max(dot(n,-rd),0.)*(ci<0?0.:.12);
  float fa=1.-exp(-t*FOGD-max(ro0.y-25.-p.y,0.)*.006);
  col+=att*mix(lit,fogc(rd),fa);
  att*=1.-fa;
  if(m>5.5&&m<6.5){
   // ice: frosty shell, then keep going to the car frozen inside
   vec3 c=M[0]*(p-CAR(0).xyz);
   col+=att*(vec3(.6,.85,1.)*(.06+.6*fre(n,rd,3.)+.5*pow(max(dot(reflect(rd,n),SUN),0.),30.))+CRK*vec3(3.,.9,.15)*smoothstep(.07,0.,abs(vn(c.xy*3.+c.z*2.)-.5)));
   att*=vec3(.55,.8,.95);noIce=true;left=0;ro=p;rd=normalize(rd-n*.12);
   continue;
  }
  att*=(rf+(1.-rf)*fre(n,rd,5.))*gl*tint*mix(vec3(1),al*1.6,mtl);
  if(left<1||rf<.01||att.x+att.y+att.z<.12)break;
  left--;
  ro=p+n*.03;rd=reflect(rd,n);
 }
 O=vec4(col+glows(ro0,rd0,t0),t0);
}
