#version 300 es
precision highp float;
// THE TAPESTRY: a flat embroidered chronicle. Each 7px cell is one cross-stitch; colours come from the
// scene at the cell centre. Panels are 4 world units wide (i = floor(x/4)); panel i is "in action"
// around T = 9.6*i. Globals gF (fire: stitches unravel and re-knit), gU (unpick: threads drop out),
// gN (no stitch: hole darkness).
uniform vec2 R;
uniform float T,CX,FD;
out vec4 O;
vec3 c;
float gF,gU,gN;
const vec3 LIN=vec3(.9,.85,.73),MAD=vec3(.55,.13,.11),WOA=vec3(.16,.28,.46),WLD=vec3(.87,.71,.23),WAL=vec3(.29,.19,.11),WL2=vec3(.46,.32,.2),DRK=vec3(.05,.04,.03);
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int k=0;k<4;k++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
float sg(vec2 p,vec2 a,vec2 b,float r){vec2 e=b-a,d=p-a;float h=clamp(dot(d,e)/dot(e,e),0.,1.);return length(d-e*h)-r;}
float ci(vec2 p,vec2 q,float r){return length(p-q)-r;}
float bo(vec2 p,vec2 q,vec2 b){vec2 d=abs(p-q)-b;return max(d.x,d.y);}
float tr(vec2 p,vec2 a,vec2 b,vec2 e){float s0=(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x),s1=(e.x-b.x)*(p.y-b.y)-(e.y-b.y)*(p.x-b.x),s2=(a.x-e.x)*(p.y-e.y)-(a.y-e.y)*(p.x-e.x);return((s0>0.&&s1>0.&&s2>0.)||(s0<0.&&s1<0.&&s2<0.))?-1.:1.;}
vec2 rt(vec2 p,float a){float s=sin(a),k=cos(a);return vec2(k*p.x-s*p.y,s*p.x+k*p.y);}
vec2 bp(vec2 t0,float s){s=clamp(s,0.,.8);return t0+vec2(2.2*s,.9*s-1.1*s*s);}
void P(float d,vec3 k){if(d<0.)c=k;}
// a figure in profile, feet at q=0, facing fl (+1 right, -1 left)
void fig(vec2 q,float s,float ph,float fl,vec3 tc,vec3 hc){
 q.x*=fl;q/=s;float w=sin(ph)*.07;
 P(sg(q,vec2(0.),vec2(w,.13),.02),WAL);
 P(sg(q,vec2(0.),vec2(-w,.13),.02),WAL);
 P(sg(q,vec2(0.,.12),vec2(0.,.25),.045),tc);
 P(sg(q,vec2(.03,.2),vec2(.22,.42-.1*sin(ph*.5)),.008),WL2);
 P(bo(q,vec2(-.05,.18),vec2(.025,.06)),WLD);
 P(ci(q,vec2(0.,.29),.036),hc);
 P(ci(q,vec2(.02,.27),.018),LIN);
}
void main(){
 vec2 px=gl_FragCoord.xy,cl=floor(px/7.),cp=(cl+.5)*7.;
 vec2 p=(cp-.5*R)/(.5*R.y),w=vec2(p.x+CX,p.y);
 float wv=.5+.5*sin(px.x*2.1)*sin(px.y*2.1),FR=smoothstep(88.,94.,T);
 gF=0.;gU=0.;gN=0.;c=DRK;
 bool cloth=w.x>=0.&&w.x<=40.&&w.y<.66&&w.y>-.62;
 if(cloth){
  int i=int(clamp(floor(w.x/4.),0.,9.));
  float tu=T-9.6*float(i);
  vec2 q=vec2(w.x-4.*float(i)-2.,w.y);
  c=LIN;
  // ground, margin lines and the stitched beast border
  P(bo(q,vec2(0.,-.44),vec2(3.,.08)),WL2);
  P(bo(q,vec2(0.,.56),vec2(3.,.006)),WAL);
  P(bo(q,vec2(0.,-.52),vec2(3.,.006)),WAL);
  vec2 bq=vec2(mod(q.x+2.,.5)-.25,q.y-(q.y>0.?.61:-.57));
  vec3 bc=mod(floor((q.x+2.)/.5),2.)<1.?MAD:WOA;
  P(sg(bq,vec2(-.07,0.),vec2(.07,0.),.03),bc);
  P(ci(bq,vec2(.1,.01),.024),bc);
  P(sg(bq,vec2(-.04,-.02),vec2(-.04,-.07),.007),WAL);
  P(sg(bq,vec2(.04,-.02),vec2(.04,-.07),.007),WAL);
  if(abs(abs(q.x)-2.)<.012)c=WAL;

  if(i==0){ // camp and castle: HIC EXERCITUS CASTRUM OBSIDET
   P(bo(q,vec2(1.2,-.08),vec2(.7,.18)),WL2);
   if(q.x>.5&&q.x<1.9)P(bo(vec2(mod(q.x-.5,.2)-.1,q.y),vec2(0.,.16),vec2(.05,.05)),WL2);
   P(bo(q,vec2(1.2,-.22),vec2(.12,.1)),WAL);
   P(sg(q,vec2(1.9,.12),vec2(1.9,.6),.006),WAL);
   P(tr(q,vec2(1.91,.6),vec2(1.91,.47),vec2(2.12,.53)),MAD);
   P(tr(q,vec2(-1.7,-.36),vec2(-1.2,-.36),vec2(-1.45,.05)),WOA);
   P(tr(q,vec2(-1.1,-.36),vec2(-.6,-.36),vec2(-.85,.02)),MAD);
   for(int k=0;k<3;k++){float fk=float(k);
    fig(q-vec2(mix(-1.9,-.25,smoothstep(-4.8,3.,tu))+.45*fk,-.36),1.2,tu*7.+fk*2.,1.,WOA,WAL);
    fig(q-vec2(.6+.45*fk,.1),1.2,tu*3.+fk,-1.,MAD,WLD);
   }
  }
  else if(i==1){ // trebuchet: MACHINA LAPIDES IACIT
   P(bo(q,vec2(1.55,-.08),vec2(.4,.18)),WL2);
   if(q.x>1.15&&q.x<1.95)P(bo(vec2(mod(q.x-1.15,.2)-.1,q.y),vec2(0.,.16),vec2(.05,.05)),WL2);
   float tx=-1.1,ph=fract((tu+4.8)/2.4),th=mix(2.6,-.5,smoothstep(0.,.85,ph));
   vec2 pv=vec2(tx,.22),t0=pv+.6*vec2(.8776,-.4794);
   P(sg(q,vec2(tx-.28,-.36),pv,.018),WAL);
   P(sg(q,vec2(tx+.28,-.36),pv,.018),WAL);
   P(sg(q,pv,pv+.6*vec2(cos(th),sin(th)),.012),WAL);
   P(ci(q,pv+vec2(-.22,-.1),.04),WAL);
   for(int k=0;k<5;k++){
    float bt=tu+2.76-2.4*float(k);   // time since this launch's release
    if(bt>0.){
     for(int j=0;j<4;j++){float fj=float(j);P(sg(q,bp(t0,bt-.12*fj),bp(t0,bt-.12*(fj+1.)),.008),WL2);}
     P(ci(q,bp(t0,bt),.035),WAL);
    }
   }
  }
  else if(i==2){ // burning rampart: MURUS ARDET
   float bu=smoothstep(-2.,1.,tu);
   vec3 wc=mix(WL2,WAL,smoothstep(0.,3.,tu));
   P(bo(q,vec2(.5,-.08),vec2(1.1,.18)),wc);
   if(q.x>-.6&&q.x<1.7)P(bo(vec2(mod(q.x+.6,.2)-.1,q.y),vec2(0.,.16),vec2(.05,.05)),wc);
   float hv=fb(vec2(q.x*5.,q.y*3.-T*3.))+.7*(.45-q.y),thr=.8+.6*(1.-bu);
   if(q.x>-.7&&q.x<1.8&&q.y>-.3&&q.y<.6&&hv>thr){c=hv>thr+.15?WLD:MAD;gF=1.;}
   for(int k=0;k<2;k++){float fk=float(k);
    fig(q-vec2(-1.5+.5*fk,-.36),1.1,tu*6.+fk,1.,WOA,WAL);
    fig(q-vec2(.3+.6*fk,.1),1.1,tu*5.+fk*2.,-1.,MAD,WLD);
   }
  }
  else if(i==3){ // falling tower: TURRIS CADIT
   float pr=smoothstep(0.,2.4,tu);
   P(bo(q,vec2(1.45,-.08),vec2(.45,.18)),WL2);
   vec2 rel=q-vec2(0.,-.36);
   for(int j=0;j<6;j++){
    float fj=float(j),an=pr*pr*(1.+.12*fj);
    float d=bo(rt(rel,an),vec2(0.,.14*fj+.07),vec2(.26-.02*fj,.07));
    if(d<0.){c=(j==5)?WOA:((mod(fj,2.)<1.)?WL2:MAD);gU=pr*.85;}
   }
   if(pr>.3)P(bo(q,vec2(.5+.2*sin(tu),-.3),vec2(.12,.04)),WAL);
   for(int k=0;k<3;k++){float fk=float(k);fig(q-vec2(-1.5+.35*fk,-.36),1.1,tu*6.+fk*2.,1.,WOA,WAL);}
  }
  else if(i==4){ // clash of knights: MILITES IN PUGNA
   float s1=smoothstep(-4.8,0.,tu),fall=smoothstep(2.4,3.6,tu);
   for(int k=0;k<3;k++){float fk=float(k);
    float xa=mix(-1.9,-.35,s1)+.3*fk*(1.-s1)+.04*sin(tu*9.+fk),xb=mix(1.9,.35,s1)-.3*fk*(1.-s1)+.04*sin(tu*9.+fk*2.);
    float an=(k==1)?fall*1.5:0.;
    fig(rt(q-vec2(xa,-.36),an),1.2,tu*8.+fk,1.,WOA,WAL);
    fig(rt(q-vec2(xb,-.36),-an),1.2,tu*8.+fk*3.,-1.,MAD,WLD);
   }
  }
  else if(i==5){ // dragon: DRACO ADVENIT, the breath burns a hole through the cloth
   float ar=smoothstep(-4.8,-1.,tu),ri=smoothstep(2.6,4.6,tu);
   vec2 D=mix(vec2(-2.4,.95),vec2(-.95,.36),ar)+vec2(.9,.6)*ri;
   float wg=sin(tu*6.)*.5+.5;
   P(tr(q,D+vec2(.02,.06),D+vec2(-.22,.2+.18*wg),D+vec2(-.16,-.02)),WOA);
   for(int j=0;j<6;j++){float fj=float(j);P(ci(q,D+vec2(-.09*fj,.02*sin(fj*.9+tu*5.)),.1-.012*fj),MAD);}
   P(sg(q,D+vec2(.02,.02),D+vec2(.14,.05),.05),MAD);
   P(sg(q,D+vec2(.14,.05),D+vec2(.3,.02),.04),MAD);
   P(ci(q,D+vec2(.14,.07),.012),LIN);
   vec2 M=D+vec2(.3,0.),H=vec2(.8,.02),e=H-M;
   float fo=smoothstep(.4,.9,tu)*(1.-smoothstep(2.3,2.8,tu));
   float hh=clamp(dot(q-M,e)/dot(e,e),0.,1.);
   float wd=(.02+.12*hh)*(.85+.3*vn(vec2(hh*7.-tu*9.,1.)))*fo;
   float df=length(q-M-e*hh)-wd;
   if(df<0.){c=df<-wd*.5?WLD:MAD;gF=1.;}
   float hr=.3*smoothstep(.6,2.2,tu);
   vec2 hq=q-H;float an=atan(hq.y,hq.x);
   float rr=hr*(1.+.16*sin(5.*an+1.3)+.1*sin(11.*an+.7)+.1*vn(vec2(an*3.,0.)));
   float hd=length(hq)-rr;
   if(hr>.01&&hd<.09){
    if(hd<0.){c=DRK*(.8+.6*vn(q*9.));gN=1.;}
    else if(hd<.05+.08*h1(vec2(floor(an*22.),2.))){c=hd<.02?WLD:MAD;gF=1.;}
   }
  }
  else if(i==6){ // burning town: IGNIS PERFORAT TELAM (the town burns as the cloth keeps unrolling)
   for(int k=0;k<5;k++){float fk=float(k),hx=-1.8+.9*fk;
    float burn=smoothstep(-3.+.5*fk,0.,tu);
    P(bo(q,vec2(hx,-.2),vec2(.3,.16)),WL2);
    P(tr(q,vec2(hx-.36,-.04),vec2(hx+.36,-.04),vec2(hx,.28)),WAL);
    float hv=fb(vec2(q.x*6.+fk*3.,q.y*4.-T*3.))+.7*(.3-q.y);
    if(burn>0.&&abs(q.x-hx)<.36&&q.y>-.36&&q.y<.3&&hv>.85-burn*.2){c=hv>1.?WLD:MAD;gF=1.;}
   }
  }
  else if(i==7){ // captives led away: CAPTIVI DUCUNTUR
   for(int k=0;k<5;k++){float fk=float(k),x=-2.1+.8*fk+.3*tu;
    fig(q-vec2(x,-.36),1.,tu*4.+fk,1.,WL2,WAL);
    if(k<4)P(sg(q,vec2(x,-.2),vec2(x+.8,-.2),.004),WAL);
   }
   fig(q-vec2(1.4,-.36),1.4,0.,-1.,WOA,WLD);
   P(sg(q,vec2(1.8,-.36),vec2(1.8,.5),.008),WAL);
   P(tr(q,vec2(1.81,.5),vec2(1.81,.32),vec2(2.05,.41)),MAD);
  }
  else if(i==8){ // ruins and embers: CIVITAS CECIDIT
   for(int k=0;k<6;k++){float fk=float(k);
    P(bo(q,vec2(-1.9+.7*fk,-.2+.08*sin(fk*2.1)),vec2(.22,.12+.06*h1(vec2(fk,2.)))),WL2);
   }
   P(bo(q,vec2(1.5,0.),vec2(.08,.36)),WL2);
   vec2 eq=vec2(mod(q.x+2.,.23)-.115,mod(q.y+.6*T,.3)-.15);
   if(length(eq)<.012&&q.y>-.36){c=WLD;gF=1.;}
  }
  else { // finale: FINIS OPERIS
   P(sg(q,vec2(-.7,-.36),vec2(-.7,.5),.008),WAL);
   P(tr(q,vec2(-.7,.5),vec2(-.7,.3),vec2(-.4,.4)),MAD);
   fig(q-vec2(0.,-.36),2.,0.,1.,WOA,WLD);
   P(tr(q,vec2(-.06,.28),vec2(.06,.28),vec2(0.,.36)),WLD);
   for(int k=0;k<3;k++){float fk=float(k);fig(q-vec2(-1.4+.5*fk,-.36),1.,0.,1.,WL2,WAL);}
  }
 } else {
  // outside the cloth: dark wall, then the woven fringe at the end
  if(FR>0.&&w.x>=0.&&w.x<=40.){
   if(w.y<-.62&&w.y>-.66)c=WAL;
   float n=floor(w.x*14.),sw=.012*sin(T*1.7+n*1.3)*(-.66-w.y)*4.;
   if(w.y<=-.66&&w.y>-.66-.3*FR&&abs(w.x-(n+.5)/14.-sw)<.0045)c=mod(n,3.)<1.?LIN:(mod(n,3.)<2.?MAD:WLD);
  }
 }
 vec3 col=c;
 if(cloth&&gN<.5&&distance(c,LIN)>.02){
  // cross-stitch: one X (or a stray diagonal when fire unravels it) per cell
  float kp=1.,dv=2.;
  if(gF>.5){float k=floor(T*8.);float r1=h1(cl+vec2(k,3.)),r2=h1(cl+vec2(k,7.));kp=step(.3,r1);dv=r2<.35?0.:(r2<.7?1.:2.);}
  if(gU>0.&&h1(cl*1.7+vec2(5.,1.))<gU)kp=0.;
  vec2 f=fract(px/7.);
  float a1=step(abs(f.x-f.y)*.7071,.2),b1=step(abs(f.x+f.y-1.)*.7071,.2);
  float on=dv<.5?a1:(dv<1.5?b1:max(a1,b1));
  vec3 th=c*(.8+.3*f.y)*(.92+.16*h1(px));
  col=(kp*on>.5)?th:LIN*(.75+.1*wv)+c*.08;
 } else if(cloth){
  col=c*(.95+.05*wv);
 }
 col*=(1.-.2*dot(p*.5,p*.5))*FD;
 O=vec4(col,1.);
}
