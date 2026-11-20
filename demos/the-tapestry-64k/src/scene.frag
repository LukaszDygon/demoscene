#version 300 es
precision highp float;
uniform vec2 R;
uniform float T,CX,ZC,FD;
out vec4 O;
vec3 c;
float gF,gU,gN,gT;
const vec3 LIN=vec3(.9,.85,.73),MAD=vec3(.55,.13,.11),WOA=vec3(.16,.28,.46),WLD=vec3(.87,.71,.23),WAL=vec3(.29,.19,.11),WL2=vec3(.46,.32,.2),DRK=vec3(.05,.04,.03),SKN=vec3(.78,.68,.52);
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int k=0;k<4;k++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
float sg(vec2 p,vec2 a,vec2 b,float r){vec2 e=b-a,d=p-a;float h=clamp(dot(d,e)/dot(e,e),0.,1.);return length(d-e*h)-r;}
float ci(vec2 p,vec2 q,float r){return length(p-q)-r;}
float bo(vec2 p,vec2 q,vec2 b){vec2 d=abs(p-q)-b;return max(d.x,d.y);}
float tr(vec2 p,vec2 a,vec2 b,vec2 e){float s0=(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x),s1=(e.x-b.x)*(p.y-b.y)-(e.y-b.y)*(p.x-b.x),s2=(a.x-e.x)*(p.y-e.y)-(a.y-e.y)*(p.x-e.x);return((s0>0.&&s1>0.&&s2>0.)||(s0<0.&&s1<0.&&s2<0.))?-1.:1.;}
vec2 rt(vec2 p,float a){float s=sin(a),k=cos(a);return vec2(k*p.x-s*p.y,s*p.x+k*p.y);}
vec2 bp(vec2 t0,float s){s=clamp(s,0.,.8);return t0+vec2(2.2*s,.9*s-1.1*s*s);}
void Z(float d,vec3 k,float f,float u,float t){if(d<0.){c=k;gF=f;gU=u;gT=t;gN=0.;}}
void P(float d,vec3 k){Z(d,k,0.,0.,0.);}
void fig(vec2 q,float s,float ph,float fl,vec3 tc,vec3 hc){
q.x*=fl;q/=s;
float w=sin(ph)*.07,a=sin(ph+1.6)*.05;
P(sg(q,vec2(0.),vec2(w,.13),.02),WAL);
P(sg(q,vec2(0.),vec2(-w,.13),.02),WAL);
P(sg(q,vec2(0.,.12),vec2(0.,.25),.045),tc);
P(sg(q,vec2(0.,.12),vec2(0.,.14),.047),WL2);
P(sg(q,vec2(-.02,.23),vec2(-.07-a,.15),.014),tc);
P(sg(q,vec2(.03,.25),vec2(.09+a,.17),.014),tc);
P(sg(q,vec2(.03,.2),vec2(.22,.42-.1*sin(ph*.5)),.008),WL2);
P(bo(q,vec2(-.05,.18),vec2(.025,.06)),WLD);
P(bo(q,vec2(-.05,.18),vec2(.008,.06)),MAD);
P(ci(q,vec2(0.,.29),.036),hc);
P(bo(q,vec2(0.,.27),vec2(.036,.006)),WAL);
P(ci(q,vec2(.02,.27),.018),SKN);
}
void knight(vec2 q,float s,float ph,float fl,vec3 tc){
fig(q,s,ph,fl,tc,WOA);
q.x*=fl;q/=s;
Z(sg(q,vec2(0.,.15),vec2(0.,.22),.035),SKN,0.,0.,1.);
P(tr(q,vec2(-.02,.31),vec2(.02,.31),vec2(-.04,.4)),MAD);
}
void arch(vec2 q,float ph,float fl){
fig(q,1.,ph,fl,WOA,WAL);
q.x*=fl;
P(sg(q,vec2(.2,.4),vec2(.25,.1),.005),WAL);
P(sg(q,vec2(.25,.1),vec2(.2,.4),.002),LIN);
}
void kneel(vec2 q,vec3 tc,vec3 hc){
P(sg(q,vec2(0.),vec2(.05,.12),.035),tc);
P(ci(q,vec2(.08,.16),.03),hc);
P(sg(q,vec2(.02,.04),vec2(.12,.02),.02),WAL);
}
void hs(vec2 q,float ph,float fl,vec3 tc){
q.x*=fl;
float g=sin(ph)*.12,h=abs(sin(ph*.5))*.03;
P(sg(q,vec2(.16,.2+h),vec2(.16+g,0.),.018),WAL);
P(sg(q,vec2(.12,.2+h),vec2(.12-g,0.),.018),WAL);
P(sg(q,vec2(-.16,.2+h),vec2(-.16-g,0.),.018),WAL);
P(sg(q,vec2(-.12,.2+h),vec2(-.12+g,0.),.018),WAL);
P(sg(q,vec2(-.2,.24+h),vec2(.2,.24+h),.09),tc);
P(sg(q,vec2(.2,.28+h),vec2(.34,.46+h),.05),tc);
P(ci(q,vec2(.37,.46+h),.05),tc);
P(bo(q,vec2(.4,.44+h),vec2(.02,.01)),WAL);
P(sg(q,vec2(-.2,.26+h),vec2(-.38,.18+h*.5),.02),WAL);
P(sg(q,vec2(0.,.3+h),vec2(-.02,.55+h),.04),WL2);
P(ci(q,vec2(-.01,.6+h),.035),WLD);
P(sg(q,vec2(-.02,.5+h),vec2(.32,.52+h),.008),WAL);
}
void dragon(vec2 q,vec2 D,float tu){
float wg=sin(tu*6.)*.5+.5;
P(tr(q,D+vec2(.04,.08),D+vec2(-.12,.36+.2*wg),D+vec2(-.24,.02)),WOA);
P(tr(q,D+vec2(.06,.04),D+vec2(-.04,.3+.22*wg),D+vec2(-.2,-.02)),WOA);
for(int j=0;j<7;j++){float fj=float(j);
P(tr(q,D+vec2(-.09*fj-.02,.1-.012*fj),D+vec2(-.09*fj+.03,.1-.012*fj),D+vec2(-.09*fj,.18-.012*fj)),WAL);}
for(int j=0;j<6;j++){float fj=float(j),y=.02*sin(fj*.9+tu*5.);
P(ci(q,D+vec2(-.09*fj,y),.1-.012*fj),MAD);
Z(ci(q,D+vec2(-.09*fj,y),.04),WL2,0.,0.,1.);}
P(sg(q,D+vec2(.02,.02),D+vec2(.14,.05),.05),MAD);
P(sg(q,D+vec2(.14,.05),D+vec2(.3,.02),.04),MAD);
P(tr(q,D+vec2(.26,-.01),D+vec2(.34,-.02),D+vec2(.3,-.06)),WLD);
Z(ci(q,D+vec2(.14,.07),.012),WLD,0.,0.,3.);
P(sg(q,D+vec2(-.5,-.02),D+vec2(-.62,.12),.012),WAL);
P(sg(q,D+vec2(-.04,-.1),D+vec2(-.12,-.2),.02),WAL);
P(sg(q,D+vec2(.1,-.1),D+vec2(.14,-.2),.02),WAL);
}
void cas(vec2 q,float x,float h,vec3 wc){
P(bo(q,vec2(x,h*.5-.36),vec2(.62,h*.5)),wc);
for(int k=0;k<5;k++){float fk=float(k);P(bo(q,vec2(x-.6+.3*fk,h-.31),vec2(.05,.05)),wc);}
P(bo(q,vec2(x-.7,h*.6-.36),vec2(.13,h*.6)),wc);
P(bo(q,vec2(x+.7,h*.6-.36),vec2(.13,h*.6)),wc);
P(tr(q,vec2(x-.85,h*1.2-.36),vec2(x-.55,h*1.2-.36),vec2(x-.7,h*1.2-.14)),MAD);
P(tr(q,vec2(x+.55,h*1.2-.36),vec2(x+.85,h*1.2-.36),vec2(x+.7,h*1.2-.14)),WOA);
P(bo(q,vec2(x,h*.5-.36),vec2(.07,.08)),WAL);
P(bo(q,vec2(x-.7,h*.8-.36),vec2(.02,.05)),WAL);
P(bo(q,vec2(x+.7,h*.8-.36),vec2(.02,.05)),WAL);
}
void ram(vec2 q,float ph){
q.y+=.01*sin(ph);
P(sg(q,vec2(-.6,.05),vec2(.7,.05),.03),WAL);
P(ci(q,vec2(.76,.05),.06),WL2);
P(tr(q,vec2(-.7,.22),vec2(.8,.22),vec2(.05,.4)),MAD);
P(sg(q,vec2(-.6,.05),vec2(-.6,.22),.02),WAL);
P(sg(q,vec2(.6,.05),vec2(.6,.22),.02),WAL);
P(ci(q,vec2(-.4,-.02),.06),WAL);
P(ci(q,vec2(.4,-.02),.06),WAL);
}
void ladder(vec2 q,float hg,float lean){
P(sg(q,vec2(-.08,0.),vec2(-.08+lean,hg),.012),WAL);
P(sg(q,vec2(.08,0.),vec2(.08+lean,hg),.012),WAL);
for(int j=1;j<6;j++){float f=float(j)/6.;P(sg(q,vec2(-.08+lean*f,hg*f),vec2(.08+lean*f,hg*f),.006),WAL);}
}
void hills(vec2 q,vec3 hc){
float rg=-.36+.14*sin(q.x*1.7+.6)+.07*sin(q.x*4.3+1.1);
if(q.y<rg&&q.y>-.36){c=hc;gT=1.;gN=0.;}
}
void crowd(vec2 q,float tu,vec3 cc){
for(int k=0;k<8;k++){float fk=float(k),x=-1.9+.55*fk+.1*sin(tu+fk);
P(ci(q,vec2(x,.02+.02*sin(tu*3.+fk)),.05),cc);
P(bo(q,vec2(x,-.2),vec2(.07,.14)),cc);
}
}
void banner(vec2 q,float x,vec3 cl,float wv){
P(sg(q,vec2(x,-.36),vec2(x,.5),.008),WAL);
P(tr(q,vec2(x,.5),vec2(x,.32),vec2(x+.34,.42+.03*sin(wv))),cl);
}
void house(vec2 q,float hx,float bn){
P(bo(q,vec2(hx,-.2),vec2(.3,.16)),WL2);
P(tr(q,vec2(hx-.36,-.04),vec2(hx+.36,-.04),vec2(hx,.28)),WAL);
P(bo(q,vec2(hx,-.3),vec2(.07,.05)),WAL);
P(bo(q,vec2(hx-.14,-.12),vec2(.05,.05)),WAL);
P(bo(q,vec2(hx+.14,-.12),vec2(.05,.05)),WAL);
float hv=fb(vec2(q.x*6.+hx*3.,q.y*4.-T*3.))+.7*(.3-q.y);
if(bn>0.&&abs(q.x-hx)<.36&&q.y>-.36&&q.y<.3&&hv>.85-bn*.2){c=hv>1.?WLD:MAD;gF=1.;}
}
void bird(vec2 r,float ph){
float wg=sin(ph)*.05;
P(tr(r,vec2(0.),vec2(-.07,.03+wg),vec2(-.02,-.01)),WAL);
P(tr(r,vec2(0.),vec2(.07,.03-wg),vec2(.02,-.01)),WAL);
P(ci(r,vec2(0.),.012),WAL);
}
void sun(vec2 q,vec2 s,float r){
float an=atan(q.y-s.y,q.x-s.x);
Z(length(q-s)-r-.1*max(0.,sin(an*12.)),WLD,0.,0.,3.);
}
void cloud(vec2 q,vec2 s,float sc){
Z(min(min(ci(q,s,.14*sc),ci(q,s+vec2(.12*sc,.03),.1*sc)),ci(q,s-vec2(.12*sc,.02),.09*sc)),WOA,0.,0.,1.);
}
void wagon(vec2 q,float x,float ph){
q-=vec2(x,-.36);
P(bo(q,vec2(0.,.08),vec2(.22,.05)),WAL);
P(ci(q,vec2(-.12,.2),.08),WL2);
P(ci(q,vec2(.12,.2),.08),WL2);
P(ci(q,vec2(-.14,.0),.07),WAL);
P(ci(q,vec2(.14,.0),.07),WAL);
P(sg(q,vec2(.22,.08),vec2(.4,.14+.01*sin(ph)),.01),WAL);
}
void shield(vec2 q,vec2 s,float r,vec3 a,vec3 b){
vec2 l=q-s;
P(bo(l,vec2(0.),vec2(r,r*1.2)),a);
P(bo(l,vec2(0.),vec2(r,r*.18)),b);
P(bo(l,vec2(0.),vec2(r*.18,r*1.2)),b);
}
void gate(vec2 q,float x,float h){
P(bo(q,vec2(x,h*.5-.36),vec2(.3,h*.5)),WAL);
for(int k=0;k<5;k++){float fk=float(k);P(bo(q,vec2(x-.24+.12*fk,h*.5-.36),vec2(.008,h*.5)),WL2);}
}
void siegetower(vec2 q,float x,float ph){
for(int j=0;j<4;j++){float fj=float(j);P(bo(q,vec2(x,-.36+.12*fj+.06),vec2(.12,.06)),mod(fj,2.)<1.?WL2:WAL);}
P(bo(q,vec2(x,.14),vec2(.16,.02)),WAL);
P(bo(q,vec2(x+.16+.1*sin(ph),.16),vec2(.08,.02)),WAL);
}
void mangonel(vec2 q,float ph){
P(tr(q,vec2(-.2,0.),vec2(.2,0.),vec2(0.,.2)),WAL);
P(bo(q,vec2(0.,0.),vec2(.25,.02)),WAL);
float a=.5+.6*sin(ph);
P(sg(q,vec2(0.,.02),vec2(.4*cos(a),.02+.4*sin(a)),.012),WL2);
P(ci(q,vec2(-.2,-.06),.05),WAL);
P(ci(q,vec2(.2,-.06),.05),WAL);
}
void flag(vec2 q,float x,float y,float wv,vec3 cl){
P(sg(q,vec2(x,y),vec2(x,y+.3),.006),WAL);
P(tr(q,vec2(x,y+.3),vec2(x,y+.18),vec2(x+.24,y+.24+.02*sin(wv))),cl);
}
float LIT(vec3 x){float s=0.;
for(int k=0;k<4;k++){float fk=float(k);vec3 cp=vec3(CX+(k<2?-3.1:3.1),-.3+.5*fk*fract(fk*.37),1.+1.5*fk);
float fl=.8+.2*sin(T*13.+fk*2.)*sin(T*7.3+fk*5.);vec3 dd=x-cp;s+=fl/(1.+3.*dot(dd,dd));}
return s;}
vec3 hallc(vec3 hp){
float mo=step(.94,fract(hp.y*5.+.5*floor(hp.x*3.+hp.z*3.)));
vec3 base=vec3(.27,.25,.22)*(.7+.5*h1(floor(vec2(hp.x*3.+hp.z*3.,hp.y*5.))))*(1.-.5*mo);
return base*(.15+1.3*LIT(hp))+WAL*.4*smoothstep(.4,.8,fb(vec2(hp.x*.8+T*.05,hp.z*.8+hp.y*.5)));
}
void main(){
vec2 px=gl_FragCoord.xy,cl=floor(px/7.),cp=(cl+.5)*7.;
vec2 p=(cp-.5*R)/(.5*R.y);
vec3 ro=vec3(CX,0.,ZC),dv=normalize(vec3(p.x*.57735,p.y*.57735,-1.));
float tb=ZC/-dv.z,tw=tb;
if(dv.x>0.)tw=min(tw,3.5/dv.x);
if(dv.x<0.)tw=min(tw,-3.5/dv.x);
if(dv.y<0.)tw=min(tw,-1.2/dv.y);
if(dv.y>0.)tw=min(tw,2./dv.y);
bool wh=tw<tb;
vec2 w=ro.xy+dv.xy*tb;
w+=vec2(.004*sin(w.y*6.+T*2.3),.003*sin(w.x*5.-T*1.7));
vec2 hq=w-vec2(34.8,.02);float hr=length(hq);
w+=hq/max(hr,1e-3)*.08*smoothstep(77.,80.,T)*exp(-hr*4.);
float wv=.5+.5*sin(px.x*2.1)*sin(px.y*2.1),FR=smoothstep(126.,132.,T),hc=h1(cl);
gF=0.;gU=0.;gN=0.;gT=0.;c=DRK;
float fold=.93+.07*sin(w.x*11.+sin(w.y*4.+T*.2)*2.+T*.3);
bool cloth=!wh&&w.x>=0.&&w.x<=56.&&w.y<.66&&w.y>-.62;
if(cloth){
int i=int(clamp(floor(w.x/4.),0.,13.));
float tu=T-9.6*float(i);
vec2 q=vec2(w.x-4.*float(i)-2.,w.y);
c=LIN;
Z(bo(q,vec2(0.,-.44),vec2(3.,.08)),WL2,0.,0.,1.);
P(bo(q,vec2(0.,.56),vec2(3.,.006)),WAL);
P(bo(q,vec2(0.,-.52),vec2(3.,.006)),WAL);
vec2 fq=vec2(mod(q.x+2.,.4)-.2,mod(q.y+.4,.3)-.15);
if(q.y>-.3&&q.y<.5){P(ci(fq,vec2(0.),.018),WOA);P(ci(fq,vec2(.03,0.),.009),MAD);P(ci(fq,vec2(-.03,0.),.009),MAD);}
vec2 bq=vec2(mod(q.x+2.,.5)-.25,q.y-(q.y>0.?.61:-.57));
float kk=floor((q.x+2.)/.5),ty=mod(kk,3.);
vec3 bc=mod(kk,2.)<1.?MAD:WOA;
if(ty<.5){
P(sg(bq,vec2(-.07,0.),vec2(.07,0.),.03),bc);
P(ci(bq,vec2(.1,.01),.024),bc);
P(sg(bq,vec2(-.04,-.02),vec2(-.04,-.07),.007),WAL);
P(sg(bq,vec2(.04,-.02),vec2(.04,-.07),.007),WAL);
}else if(ty<1.5){
P(ci(bq,vec2(0.,0.),.03),bc);
P(tr(bq,vec2(-.01,.01),vec2(-.08,.07),vec2(-.04,-.02)),bc);
P(tr(bq,vec2(.02,0.),vec2(.07,-.01),vec2(.03,.05)),bc);
P(tr(bq,vec2(.03,-.02),vec2(.08,-.03),vec2(.04,-.04)),WLD);
}else{
for(int j=0;j<5;j++){float fj=float(j);P(ci(bq,vec2(-.08+.04*fj,.02*sin(fj*1.6)),.013-.001*fj),bc);}
P(ci(bq,vec2(.1,0.),.012),WAL);
}
if(abs(abs(q.x)-2.)<.012)c=WAL;

if(i==0){
hills(q,WOA);
sun(q,vec2(-1.3,.42),.09);
cloud(q,vec2(.6,.4),1.);
cas(q,1.2,.5,WL2);
wagon(q,-.2,T*3.);
P(tr(q,vec2(-1.7,-.36),vec2(-1.2,-.36),vec2(-1.45,.05)),WOA);
P(tr(q,vec2(-1.1,-.36),vec2(-.6,-.36),vec2(-.85,.02)),MAD);
P(tr(q,vec2(-.5,-.36),vec2(0.,-.36),vec2(-.25,0.)),WOA);
banner(q,1.9,MAD,T*4.);
for(int k=0;k<3;k++){float fk=float(k),fr=fract(T*.3+fk*.3);
Z(ci(q,vec2(-1.3+.12*fk,-.3+.03*sin(T*6.+fk)),.03),WLD,1.,0.,0.);
P(ci(q,vec2(-1.3+.12*fk+.1*sin(fk+T),-.1+.5*fr),.04+.03*fr),WL2);}
for(int k=0;k<4;k++){float fk=float(k);
knight(q-vec2(mix(-1.9,-.25,smoothstep(-4.8,3.,tu))+.42*fk,-.36),1.2,tu*7.+fk*2.,1.,WOA);}
for(int k=0;k<3;k++){float fk=float(k);fig(q-vec2(.6+.45*fk,.1),1.2,tu*3.+fk,-1.,MAD,WLD);}
}
else if(i==1){
hills(q,WL2);
crowd(q,tu,WAL);
for(int k=0;k<4;k++){float fk=float(k);shield(q,vec2(-1.7+.45*fk,.4),.1,WOA,WLD);shield(q,vec2(1.7-.45*fk,.4),.1,MAD,WLD);}
banner(q,-1.4,WOA,T);
banner(q,1.4,MAD,T*1.3);
P(tr(q,vec2(-.55,.42),vec2(.55,.42),vec2(0.,.56)),MAD);
P(bo(q,vec2(0.,-.26),vec2(1.9,.03)),WAL);
for(int k=0;k<6;k++){float fk=float(k),x=-1.7+.68*fk,nd=.012*sin(tu*3.+fk);
P(sg(q,vec2(x,-.3),vec2(x,-.06),.04),mod(fk,2.)<1.?WOA:MAD);
P(ci(q,vec2(x,nd),.03),SKN);
Z(bo(q,vec2(x,.035+nd),vec2(.032,.006)),WLD,0.,0.,3.);
Z(ci(q,vec2(x+.08,-.22),.02),WLD,0.,0.,3.);
}
knight(q-vec2(0.,-.36),1.3,tu*2.,1.,WLD);
}
else if(i==2){
hills(q,WL2);
float tx=-1.1,ph=fract((tu+4.8)/2.4),th=mix(2.6,-.5,smoothstep(0.,.85,ph));
vec2 pv=vec2(tx,.22),t0=pv+.6*vec2(.8776,-.4794);
cas(q,1.55,.4,WL2);
mangonel(q-vec2(-.4,-.36),tu*2.);
P(sg(q,vec2(tx-.28,-.36),pv,.018),WAL);
P(sg(q,vec2(tx+.28,-.36),pv,.018),WAL);
P(sg(q,pv,pv+.6*vec2(cos(th),sin(th)),.012),WAL);
P(ci(q,pv+vec2(-.22,-.1),.04),WAL);
for(int k=0;k<5;k++){float bt=tu+2.76-2.4*float(k);
if(bt>0.){
for(int j=0;j<4;j++){float fj=float(j);P(sg(q,bp(t0,bt-.12*fj),bp(t0,bt-.12*(fj+1.)),.008),WL2);}
P(ci(q,bp(t0,bt),.035),WAL);
}
}
ladder(q-vec2(.8,-.36),.5,.3);
knight(q-vec2(.9,-.36+.3*fract(tu*.2)),.9,tu*5.,-1.,MAD);
for(int k=0;k<2;k++){float fk=float(k);knight(q-vec2(-1.9+.3*fk,-.36),1.,tu*5.+fk,1.,WOA);}
}
else if(i==3){
float bu=smoothstep(-2.,1.,tu);
hills(q,WAL);
vec3 wc=mix(WL2,WAL,smoothstep(0.,3.,tu));
P(bo(q,vec2(.5,-.08),vec2(1.1,.18)),wc);
if(q.x>-.6&&q.x<1.7)P(bo(vec2(mod(q.x+.6,.2)-.1,q.y),vec2(0.,.16),vec2(.05,.05)),wc);
float hv=fb(vec2(q.x*5.,q.y*3.-T*3.))+.7*(.45-q.y),thr=.8+.6*(1.-bu);
if(q.x>-.7&&q.x<1.8&&q.y>-.3&&q.y<.6&&hv>thr){c=hv>thr+.15?WLD:MAD;gF=1.;}
ram(q-vec2(-1.5,-.36),tu*3.);
mangonel(q-vec2(1.6,-.36),tu*2.+1.);
for(int k=0;k<2;k++){float fk=float(k);
knight(q-vec2(-.9+.4*fk,-.36),1.1,tu*6.+fk,1.,WOA);
knight(q-vec2(.3+.6*fk,.1),1.1,tu*5.+fk*2.,-1.,MAD);}
for(int k=0;k<3;k++){float fk=float(k);arch(q-vec2(-1.1+.4*fk,-.36),tu*4.+fk,1.);}
for(int k=0;k<5;k++){float fk=float(k),fr=fract(T*.9+fk*.2);vec2 a=vec2(-1.2+.3*fk,.1),b=vec2(.5,.2+.2*fr);
P(sg(q,mix(a,b,fr),mix(a,b,fr)+vec2(.06,.02),.004),WAL);}
}
else if(i==4){
float pr=smoothstep(0.,2.4,tu);
hills(q,WL2);
siegetower(q,-1.6,tu*3.);
P(bo(q,vec2(1.45,-.08),vec2(.45,.18)),WL2);
vec2 rel=q-vec2(0.,-.36);
for(int j=0;j<6;j++){
float fj=float(j),an=pr*pr*(1.+.12*fj);
float d=bo(rt(rel,an),vec2(0.,.14*fj+.07),vec2(.26-.02*fj,.07));
if(d<0.){c=(j==5)?WOA:((mod(fj,2.)<1.)?WL2:MAD);gU=pr*.85;gT=0.;}
}
if(pr>.3)P(bo(q,vec2(.5+.2*sin(tu),-.3),vec2(.12,.04)),WAL);
if(pr>.1)for(int k=0;k<4;k++){float fk=float(k),fr=fract(T*.25+fk*.25);P(ci(q,vec2(.2+.2*fk,-.2+.5*fr),.05+.05*fr),WAL);}
for(int k=0;k<3;k++){float fk=float(k);knight(q-vec2(-1.5+.35*fk,-.36),1.1,tu*6.+fk*2.,1.,WOA);}
ladder(q-vec2(-.4,-.36),.9,.4);
}
else if(i==5){
float cr=smoothstep(2.,4.5,tu);
cas(q-vec2(0.,-cr*cr*.5),1.2,.4,WL2);
gate(q,-.4,.4);
P(bo(q,vec2(-.6,-.46),vec2(1.6,.05)),WAL);
for(int k=0;k<4;k++){float fk=float(k);P(bo(q,vec2(-1.8+.35*fk,-.36),vec2(.04,.1)),WAL);}
float x=mix(-1.9,.3,smoothstep(-4.8,3.,tu));
fig(q-vec2(x,-.46),.55,tu*6.,1.,WL2,WAL);
fig(q-vec2(x-.4,-.46),.55,tu*6.+2.,1.,WL2,WAL);
if(cr>.1)for(int k=0;k<4;k++){float fk=float(k),fy=fract(T*.2+fk*.25);P(ci(q,vec2(1.0+.12*fk,-.3+.6*fy),.04+.04*fy),WAL);}
}
else if(i==6){
hills(q,WL2);
Z(bo(q,vec2(0.,-.24),vec2(3.,.1)),WOA,0.,0.,1.);
for(int k=0;k<6;k++){float fk=float(k),x=-1.9+.76*fk;P(tr(q,vec2(x,-.16),vec2(x+.3,-.16),vec2(x+.15,-.02+.02*sin(tu*3.+fk))),LIN);}
for(int k=0;k<4;k++){float fk=float(k),x=mod(-1.8+1.1*fk+.9*tu+2.,4.)-2.;hs(q-vec2(x,-.2),tu*11.+fk,1.,mod(fk,2.)<1.?MAD:WL2);}
for(int k=0;k<3;k++){float fk=float(k);knight(q-vec2(-.6+.5*fk,-.36),1.,tu*6.+fk,-1.,WLD);}
for(int k=0;k<4;k++){float fk=float(k);P(ci(q,vec2(-1.2+.7*fk,-.1+.1*fract(T*1.5+fk)),.025),LIN);}
}
else if(i==7){
float s1=smoothstep(-4.8,0.,tu),fall=smoothstep(2.4,3.6,tu);
hills(q,WOA);
for(int k=0;k<4;k++){float fk=float(k);
float xa=mix(-1.9,-.35,s1)+.3*fk*(1.-s1)+.04*sin(tu*9.+fk),xb=mix(1.9,.35,s1)-.3*fk*(1.-s1)+.04*sin(tu*9.+fk*2.);
float an=(k==1)?fall*1.5:0.;
knight(rt(q-vec2(xa,-.36),an),1.2,tu*8.+fk,1.,WOA);
knight(rt(q-vec2(xb,-.36),-an),1.2,tu*8.+fk*3.,-1.,MAD);}
if(fall>.5)P(tr(q,vec2(-.2,-.36),vec2(.1,-.36),vec2(-.05,-.2)),MAD);
}
else if(i==8){
float ar=smoothstep(-4.8,-1.,tu),ri=smoothstep(2.6,4.6,tu);
vec2 D=mix(vec2(-2.4,.95),vec2(-.95,.36),ar)+vec2(.9,.6)*ri;
hills(q,WOA);
for(int k=0;k<5;k++){float fk=float(k);bird(q-vec2(1.2+.25*fk+.5*sin(T*.5+fk),.6-.1*fk),T*8.+fk);}
for(int k=0;k<4;k++){float fk=float(k),fr=fract(T*.2+fk*.25);P(ci(q,vec2(.8+.1*sin(fk*2.+T),.1+.5*fr),.03+.05*fr),WAL);}
dragon(q,D,tu);
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
for(int k=0;k<3;k++){float fk=float(k),x=-1.9+.8*fk+.2*sin(tu*4.+fk);fig(q-vec2(x,-.36),.8,tu*12.+fk,1.,WL2,WAL);}
}
else if(i==9){
hills(q,WAL);
wagon(q,1.4,tu*3.);
for(int k=0;k<5;k++){float fk=float(k);house(q,-1.8+.9*fk,smoothstep(-3.+.5*fk,0.,tu));}
for(int k=0;k<3;k++){float fk=float(k),x=mod(-1.9+1.1*fk+1.4*tu+2.,4.)-2.;fig(q-vec2(x,-.36),.9,tu*12.+fk,1.,WL2,WAL);}
for(int k=0;k<4;k++){float fk=float(k),fr=fract(T*.3+fk*.25);P(ci(q,vec2(-1.8+.9*fk+.1*sin(T+fk),.1+.5*fr),.05+.07*fr),WAL);}
}
else if(i==10){
float st=smoothstep(-4.8,4.8,tu),bob=.02*sin(tu*3.)*(1.+st);
Z(bo(q,vec2(0.,-.36),vec2(3.,.12)),WOA,0.,0.,1.);
cloud(q,vec2(-1.,.45),1.4);
cloud(q,vec2(.9,.5),1.2);
for(int k=0;k<12;k++){float fk=float(k),x=-2.+.36*fk+.1*sin(fk*7.),y=fract(T*.8+fk*.13)*.9-.3;P(sg(q,vec2(x,y),vec2(x-.05,y-.12),.004),WL2);}
for(int k=0;k<6;k++){float fk=float(k),x=-2.2+.8*fk;P(tr(q,vec2(x,-.24+.02*sin(fk*3.+tu*2.)),vec2(x+.2,-.24),vec2(x+.1,-.14)),LIN);}
P(tr(q,vec2(-1.2,-.22+bob),vec2(.2,-.22+bob),vec2(-.5,-.36+bob)),MAD);
P(bo(q,vec2(-.5,-.12+bob),vec2(.7,.02)),WL2);
P(sg(q,vec2(-.5,-.12+bob),vec2(-.5,.36+bob),.01),WAL);
P(tr(q,vec2(-.48,.34+bob),vec2(-.48,-.02+bob),vec2(-.1,.1+bob)),WLD);
for(int k=0;k<5;k++){float fk=float(k),x=-1.+.22*fk;P(sg(q,vec2(x,-.2+bob),vec2(x+.02,-.32+bob),.004),WAL);}
for(int k=0;k<4;k++){float fk=float(k);fig(q-vec2(-.9+.3*fk,-.12+bob),.6,tu*5.+fk,1.,WL2,WAL);}
}
else if(i==11){
hills(q,WOA);
cloud(q,vec2(-.9,.5),.9);
flag(q,-1.9,-.36,T,MAD);
flag(q,1.6,-.36,T*1.2,WOA);
banner(q,-1.9,MAD,T);
banner(q,1.9,WOA,T*.8);
P(tr(q,vec2(-1.2,.5),vec2(1.2,.5),vec2(0.,.56)),WL2);
P(bo(q,vec2(0.,-.1),vec2(1.7,.025)),WAL);
for(int k=0;k<6;k++){float fk=float(k),x=-1.6+.64*fk;
P(sg(q,vec2(x,-.1),vec2(x,.1),.03),mod(fk,2.)<1.?WOA:MAD);
P(ci(q,vec2(x,.14),.028),SKN);
Z(ci(q,vec2(x+.1,-.04+.01*sin(tu*4.+fk)),.012),WLD,0.,0.,3.);
P(ci(q,vec2(x-.1,-.06),.022),MAD);
}
for(int k=0;k<2;k++){float fk=float(k);fig(q-vec2(-.9+1.8*fk,-.36),1.1,tu*5.+fk*3.,fk<.5?1.:-1.,WL2,WAL);}
P(sg(q,vec2(1.1,-.36),vec2(1.1,.1),.02),WAL);
Z(sg(q,vec2(1.1,.12),vec2(1.22,.12+.04*sin(tu*6.)),.012),WLD,0.,0.,3.);
}
else if(i==12){
Z(bo(q,vec2(0.,.2),vec2(3.,.5)),WOA,0.,0.,1.);
for(int k=0;k<14;k++){float fk=float(k),x=-1.9+.28*fk+.07*sin(fk*5.),y=.05+.55*h1(vec2(fk,9.));P(ci(q,vec2(x,y),.012),LIN);}
Z(ci(q,vec2(1.1,.38),.16),LIN,0.,0.,2.);
P(ci(q,vec2(1.18,.42),.15),WOA);
vec2 cm=vec2(-1.6+.3*tu,.5-.1*tu);
Z(sg(q,cm,cm+vec2(-.7,.2),.012),WLD,0.,0.,3.);
Z(ci(q,cm,.03),WLD,0.,0.,2.);
for(int k=0;k<6;k++){float fk=float(k);P(bo(q,vec2(-1.9+.7*fk,-.2+.08*sin(fk*2.1)),vec2(.22,.12+.06*h1(vec2(fk,2.)))),WL2);}
vec2 eq=vec2(mod(q.x+2.,.23)-.115,mod(q.y+.6*T,.3)-.15);
if(length(eq)<.012&&q.y>-.36){c=WLD;gF=1.;}
}
else{
hills(q,WOA);
banner(q,-1.1,MAD,T);
banner(q,1.1,WOA,T*.9);
P(bo(q,vec2(0.,-.1),vec2(.25,.22)),WAL);
P(bo(q,vec2(0.,-.36),vec2(.4,.04)),WAL);
fig(q-vec2(0.,-.36),2.,0.,1.,WOA,WLD);
Z(tr(q,vec2(-.06,.28),vec2(.06,.28),vec2(0.,.36)),WLD,0.,0.,3.);
float prg=smoothstep(116.,126.,T),ag=atan(q.y-.22,q.x)+3.1416;
if(abs(length(q-vec2(0.,.22))-.4)<.02&&ag<6.2832*prg)Z(abs(length(q-vec2(0.,.22))-.4)-.012,WLD,0.,0.,3.);
if(prg>0.&&prg<1.)Z(ci(q,.4*vec2(cos(6.2832*prg-3.1416),sin(6.2832*prg-3.1416))+vec2(0.,.22),.03),MAD,0.,0.,0.);
for(int k=0;k<4;k++){float fk=float(k);kneel(q-vec2(-1.7+.5*fk,-.36),WL2,WAL);}
}
}
else{
c=hallc(ro+dv*min(tw,tb));
if(FR>0.&&w.x>=0.&&w.x<=56.){
if(w.y<-.62&&w.y>-.66)c=WAL;
float n=floor(w.x*14.),sw=.012*sin(T*1.7+n*1.3)*(-.66-w.y)*4.;
if(w.y<=-.66&&w.y>-.66-.3*FR&&abs(w.x-(n+.5)/14.-sw)<.0045)c=mod(n,3.)<1.?LIN:(mod(n,3.)<2.?MAD:WLD);
}
}
vec3 col=c;
if(cloth&&gN<.5&&distance(c,LIN)>.02){
float kp=1.,dv=2.;
if(gF>.5){float k=floor(T*8.);float r1=h1(cl+vec2(k,3.)),r2=h1(cl+vec2(k,7.));kp=step(.3,r1);dv=r2<.35?0.:(r2<.7?1.:2.);}
if(gU>0.&&h1(cl*1.7+vec2(5.,1.))<gU)kp=0.;
vec2 f=fract(px/7.);
float a1=step(abs(f.x-f.y)*.7071,.2),b1=step(abs(f.x+f.y-1.)*.7071,.2);
float on=dv<.5?a1:(dv<1.5?b1:max(a1,b1));
if(gT>.5&&gT<1.5)on=step(abs(f.y-.5),.3);
else if(gT>1.5&&gT<2.5)on=step(length(f-.5),.32);
else if(gT>2.5)on=max(a1,b1);
vec3 th=c*(.8+.3*f.y)*(.92+.16*h1(px));
float rel=smoothstep(1.3,2.,1.732/ZC);
float hgt=max(sqrt(max(0.,1.-pow(abs(f.x-f.y)/.283,2.))),sqrt(max(0.,1.-pow(abs(f.x+f.y-1.)/.283,2.))));
th*=mix(1.,(.45+.55*hgt)*(.85+.15*sin((f.x+f.y)*18.))*1.25,rel);
if(gT>2.5)th+=WLD*pow(max(0.,sin(T*2.5+w.x*17.+hc*6.)),10.)*.8;
col=(kp*on>.5)?th:LIN*(.75+.1*wv)+c*.08;
}else if(cloth){
col=c*(.95+.05*wv);
}
col*=fold*(1.-.2*dot(p*.5,p*.5))*FD*mix(1.,.3+1.4*LIT(vec3(w,0.)),1.-smoothstep(1.9,2.1,ZC));
O=vec4(col,1.);
}
