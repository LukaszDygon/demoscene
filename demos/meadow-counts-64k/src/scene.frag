#version 300 es
precision highp float;
// S scene: 0 leader, 1 meadow/fold world (cylinder of radius P.x), 2 seed head zoom, 3 basalt cells, 4 poles
uniform vec2 R;uniform float T,S,L,K;uniform vec3 C,D,H0,H1,H2;uniform mat3 M;uniform vec4 P,Q;uniform sampler2D F;
out vec4 o;
#define ss smoothstep
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+1.),f.x),f.y);}
float fbm(vec2 p,int o){float s=0.,a=.5;for(int i=0;i<o;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}
float fbm(vec2 p){return fbm(p,5);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
// pointy hexagon, inradius .5
float hx(vec2 p){p=abs(p);return max(dot(p,vec2(.5,.866)),p.x);}
vec4 hcell(vec2 p){vec2 s=vec2(1,1.732),h=s*.5,a=mod(p,s)-h,b=mod(p-h,s)-h,g=dot(a,a)<dot(b,b)?a:b;return vec4(p-g,g);}
// nearest seed of a 256-seed Vogel head (golden angle): x dist, y edge (2nd-1st), z index
vec4 vogel(vec2 p){float r=length(p),lo=max(1.,floor((r-1.3)*(r-1.3))),hi=min(256.,ceil((r+1.3)*(r+1.3))),b1=1e9,b2=1e9,bn=0.;
 for(int i=0;i<140;i++){float n=lo+float(i);if(n>hi)break;float a=n*2.39996;vec2 d=p-sqrt(n)*vec2(cos(a),sin(a));float dd=dot(d,d);
  if(dd<b1){b2=b1;b1=dd;bn=n;}else if(dd<b2)b2=dd;}
 return vec4(sqrt(b1),sqrt(b2)-sqrt(b1),bn,r);}
// ---------------- sky ----------------
vec3 sky(vec3 rd){
 float y=rd.y,s=max(dot(rd,D),0.),az=atan(rd.x,rd.z);
 vec3 c=mix(H0,H1,ss(-.02,.55,y));
 c=mix(c,H0*.55+H1*.25,ss(.0,-.25,y));
 // long faded cloud streaks
 if(y>0.){vec2 cp=rd.xz/(y+.06)*.7+vec2(T*.004,0.);
  float cl=ss(.45,.8,fbm(cp*vec2(.35,1.6)));
  c=mix(c,mix(H0*1.05,H1+.05,.4)+H2*pow(s,3.)*.6,cl*.55*ss(0.,.12,y));}
 c+=H2*(pow(s,5.)*.35+pow(s,48.)*.6);
 // the sun: round, except in the basalt scene where it is a hexagon
 vec3 sx=normalize(cross(D,vec3(0,1,0))),sy=cross(sx,D);vec2 sp=vec2(dot(rd,sx),dot(rd,sy));
 float r=S==3.?hx(rot(T*.05)*sp)*2.:length(sp);
 c+=H2*1.8*ss(.045,.04,r)*step(0.,dot(rd,D))*ss(-.03,0.,y);
 // a pale moon that grows while we back away from it (poles)
 if(S>3.5){vec3 md=normalize(vec3(.62,.13,1.)),mx=normalize(cross(md,vec3(0,1,0))),my=cross(mx,md);vec2 mp=vec2(dot(rd,mx),dot(rd,my))/P.z;float mr=length(mp);
  if(mr<1.&&dot(rd,md)>0.){vec3 mn=vec3(mp,sqrt(1.-mr*mr));float cr=fbm(mp*3.+7.);
   c=mix(c,vec3(1.,.9,.72)*(.55+.45*mn.z)*(.75+.35*ss(.35,.6,cr))*(.8-.3*mn.x),ss(1.,.97,mr)*.85);}
  c+=vec3(1.,.8,.6)*.12*exp(-max(mr-1.,0.)*4.)*step(0.,dot(rd,md));}
 // a far treeline, hazed out (flat meadow only)
 if(S>.5&&S<1.5){float tl=.006+.016*pow(vn(vec2(az*38.,0.)),2.)+.006*vn(vec2(az*140.,1.));
  c=mix(c,mix(H1*.55+H0*.35,H2,pow(s,6.)*.5),ss(.002,0.,y-tl)*.55*ss(500.,3000.,P.x));}
 return c;}
// ---------------- the meadow, wrapped on the inside of a cylinder of radius Rc ----------------
float Rc,km;
float hgt(vec2 q){float a=abs(q.x);
 float h=(fbm(vec2(a,q.y)*.022,4)*7.4-1.6)*ss(1.,28.,min(a,3.14159*Rc-a));
 return h+.22*vn(vec2(a,q.y)*.45)+.06*vn(vec2(a,q.y)*3.1);}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
// a small figure, feet at the origin
float kid(vec3 p,float ph,float s){p/=s;float w=sin(ph)*.14;
 float d=min(length(p-vec3(0,1.12,0))-.16,cap(p,vec3(0,.38,0),vec3(0,.8,0),.17));
 d=min(d,min(cap(p,vec3(.08,.05,w),vec3(.07,.42,0),.065),cap(p,vec3(-.08,.05,-w),vec3(-.07,.42,0),.065)));
 return min(d,cap(p,vec3(.18*sign(p.x),.75,0),vec3(.42*sign(p.x),.6,0),.05))*s;}
float mapM(vec3 p,out vec2 q){vec2 xy=p.xy-vec2(0,Rc);float r=length(xy);q=vec2(atan(xy.x,-xy.y)*Rc,p.z);float d=(Rc-hgt(q)-r)*.8;km=0.;
 // two children walking on the far side of the folded field, upside down
 if(Q.y>0.){vec3 k=vec3(-p.x,2.*Rc-p.y,p.z-Q.y);float kd=min(kid(k-vec3(.84,0,0),Q.z,2.),kid(k+vec3(.8,0,0),Q.z+2.,1.7));if(kd<d){d=kd;km=1.;}}
 return d;}
vec2 box(vec3 ro,vec3 rd,vec3 c,vec3 h,out vec3 n){vec3 m=1./rd,k=abs(m)*h,o=-m*(ro-c),t1=o-k,t2=o+k;
 float tn=max(max(t1.x,t1.y),t1.z),tf=min(min(t2.x,t2.y),t2.z);n=-sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);return vec2(tn,tn>tf||tf<0.?-1.:tf);}
// the television in the field; its screen shows the previous frame, so it contains itself
vec3 tv(vec3 ro,vec3 rd,vec3 p,vec3 n){vec3 l=p-vec3(0,.6,Q.x),c;
 vec2 s=(l.xy-vec2(-.225,0))/vec2(1.25,.86)+.5;
 if(n.z<-.5&&abs(s.x-.5)<.5&&abs(s.y-.5)<.5){vec2 v=s-.5;float cr=length(max(abs(v)-.44,0.));
  vec2 w=v*(1.-.12*dot(v,v))+.5;
  c=textureLod(F,w,1.2).rgb*vec3(.86,1.,.92)*.93*(.82+.18*sin(w.y*900.))*ss(.06,.0,cr)*(1.-.6*dot(v,v));
  c+=sky(reflect(rd,normalize(vec3(v*.4,-1))))*.07+.012;
 }else{float gr=.5+.5*sin(l.x*60.+fbm(l.xy*vec2(3.,20.))*6.);
  vec3 al=mix(vec3(.24,.12,.06),vec3(.38,.21,.1),gr);
  if(n.z<-.5){vec2 kp=l.xy-vec2(.66,.27);float kn=min(length(kp),length(kp-vec2(0,-.3)));
   al=mix(al,vec3(.6,.55,.45),ss(.1,.08,kn));if(abs(l.x-.66)<.2&&l.y<-.25&&l.y>-.5)al*=.6+.4*step(.5,fract(l.y*30.));
   if(abs(s.x-.5)<.54&&abs(s.y-.5)<.55)al=vec3(.04);}
  c=al*(H2*max(dot(n,D),0.)*1.3+H1*.5+H0*.1);c+=H2*pow(1.-abs(dot(n,rd)),3.)*.2;}
 return c;}
vec3 meadow(vec3 ro,vec3 rd){
 Rc=P.x;float t=.05,d;vec2 q;bool hit=false;
 for(int i=0;i<130;i++){d=mapM(ro+rd*t,q);if(d<.0015*t){hit=true;break;}t+=d;if(t>420.)break;}
 vec3 fc=mix(H0,H2,pow(max(dot(rd,D),0.),4.)*.6),bn;
 vec2 bt=Q.x>0.?box(ro,rd,vec3(0,.6,Q.x),vec3(.95,.6,.55),bn):vec2(-1);
 if(bt.y>0.&&(!hit||bt.x<t))return mix(tv(ro,rd,ro+rd*bt.x,bn),fc,1.-exp(-bt.x*.0065));
 if(!hit)return sky(rd);
 vec3 p=ro+rd*t;vec2 e=vec2(.004*t+.02,0),qq;mapM(p,q);float kk=km;
 vec3 n=normalize(vec3(mapM(p+e.xyy,qq)-mapM(p-e.xyy,qq),mapM(p+e.yxy,qq)-mapM(p-e.yxy,qq),mapM(p+e.yyx,qq)-mapM(p-e.yyx,qq)));
 if(kk>.5)return mix(vec3(.09,.07,.065)*(H1+H2*.4)+H2*.25*pow(1.-abs(dot(n,rd)),2.),fc,1.-exp(-t*.0065));
 vec3 up=normalize(vec3(-p.x,Rc-p.y,0.));
 float g=fbm(q*.13),g2=vn(q*2.7),g3=vn(q*vec2(9.,1.5));
 vec3 al=mix(vec3(.58,.44,.17),vec3(.3,.35,.17),ss(.35,.7,g));
 al=mix(al,vec3(.72,.57,.27),g2*.35)*(.8+.3*g3);
 // seen from above, the fields are the seeds of one enormous flower
 if(P.y>0.){vec2 fp=(q-vec2(0,700.))/11.;vec4 v=vogel(fp);float k=h1(vec2(v.z,3.)),fr=v.w;
  vec3 cr=k<.3?vec3(.74,.56,.2):k<.55?vec3(.3,.38,.2):k<.8?vec3(.62,.34,.15):vec3(.55,.5,.3);
  cr*=.85+.3*vn(q*rot(k*6.)*vec2(.08,2.));cr=mix(cr,vec3(.25,.15,.07),ss(9.,2.,fr)*.6);
  if(fr>16.3){float a=atan(fp.y,fp.x),w=abs(fract(a/6.2832*34.)-.5)*2.,rr=(fr-16.3)/4.;
   cr=mix(vec3(.25,.3,.18),vec3(.9,.65,.2),ss(.05,0.,w-(1.-rr*rr)*.9)*step(rr,1.));}
  al=mix(al,cr,P.y*.85);al*=1.-P.y*.55*ss(.18,.04,v.y)*step(fr,16.3);}
 if(Q.x>0.)al*=.45+.55*ss(.8,2.2,length((p.xz-vec2(0,Q.x))/vec2(1.3,1.)));
 // dandelion dots in the grass
 vec2 dq=q*.9;float dd=length(fract(dq)-.5);al+=vec3(.5,.45,.3)*ss(.12,.05,dd)*step(.86,h1(floor(dq)))*ss(40.,5.,t);
 float dif=max(dot(n,D)*.6+.4,0.),amb=.5+.5*dot(n,up);
 vec3 c=al*(H2*dif*1.15+H1*.5*amb);
 c+=H2*al*pow(max(dot(rd,D),0.),3.)*(.4+.6*g2)*.9;
 return mix(c,fc,1.-exp(-t*.0065));}
// ---------------- seed head zoom (2D, self-similar) ----------------
vec3 seeds(vec2 uv){
 float lv=L/10.5,u=fract(lv);
 vec2 p=rot(.62*(u-2.))*uv*26.*pow(40.,u-1.)/40.;
 vec3 L2=normalize(vec3(-.5,.6,.65));
 vec3 c=vec3(0);float dep=0.;
 for(int l=0;l<4;l++){
  float r=length(p);
  if(r<.5){p=rot(.62)*p*40.;r=length(p);dep++;
   if(r>16.){ // petal ring of a head
    float a=atan(p.y,p.x),rr=(r-16.)/4.6;
    float f=fract(a/6.2832*34.),f2=fract(a/6.2832*34.+.5),w=abs(f-.5)*2.,w2=abs(f2-.5)*2.;
    float pm=ss(.05,0.,w-(1.-rr*rr)*.92),pm2=ss(.05,0.,w2-(1.-rr*rr*.8)*.85)*ss(1.05,.9,rr);
    vec3 back=vec3(.1,.18,.17)*(1.-rr*.5);
    vec3 pt=vec3(.95,.66,.2)*(.75+.25*cos(w*3.))*(.8+.2*vn(vec2(a*40.,r*3.)));
    c=mix(back,pt*.8,pm2);c=mix(c,pt,pm*step(rr,1.));c*=.6+.4*ss(1.,.0,rr);
    break;}
   continue;}
  vec4 v=vogel(p);float bn=v.z,e=v.y;vec2 bl=p-sqrt(bn)*vec2(cos(bn*2.39996),sin(bn*2.39996));float sr=sqrt(bn)/16.;
  float dome=ss(0.,.45,e);vec3 n=normalize(vec3(bl*1.8*(1.-dome*.3),.6+dome));
  float spi=.5+.5*sin(atan(bl.y,bl.x)*3.+length(bl)*16.);
  vec3 al=mix(vec3(.4,.22,.09),vec3(.85,.6,.2),ss(.15,.95,sr))*(.8+.4*h1(vec2(bn,dep)));
  al*=.85+.25*spi;
  c=al*(max(dot(n,L2),0.)*1.4+.35)+pow(max(dot(reflect(-L2,n),vec3(0,0,1)),0.),12.)*.25*vec3(1,.8,.5);
  c*=ss(0.,.12,e)*.7+.3;
  if(r>16.5)c=mix(vec3(.08,.14,.13),vec3(.2,.26,.18),vn(p*.3)); // outside the outermost head (never on screen)
  break;}
 return c*(1.25-.3*dot(uv,uv))+H2*.06;}
// ---------------- basalt columns ----------------
float HC(vec2 id){float h=fbm(id*.11+3.,3)*4.4-1.2+h1(id)*.5;return clamp(floor(h*3.)/3.,-1.,3.2);}
const float SC=1.7,WL=.35;
// P.x: 0 = a plain of honeycomb, 1 = the stones have risen out of it
float CH(vec2 id){return max(mix(.45,HC(id),P.x),WL);}
vec4 cells(vec3 ro,vec3 rd,int N,out vec4 hc){
 float t=0.,lr=length(rd.xz)+1e-4,hh;vec3 p;
 for(int i=0;i<200;i++){if(i>=N)break;p=ro+rd*t;hc=hcell(p.xz/SC);hh=CH(hc.xy);
  if(p.y<hh)return vec4(p,t);
  float de=(.5-hx(hc.zw))*SC/lr,dv=rd.y<0.?(p.y-hh)/-rd.y:1e9;
  t+=min(de,dv)+.004;if(t>260.)break;}
 return vec4(p,-1.);}
vec3 basalt(vec3 ro,vec3 rd){
 vec4 hc;vec4 h=cells(ro,rd,150,hc);
 if(h.w<0.)return sky(rd);
 vec3 p=h.xyz;float m=P.x,raw=HC(hc.xy),hh=CH(hc.xy);bool top=hh-p.y<.012;
 vec2 g=hc.zw,e=vec2(.002,0);
 vec2 gn=normalize(vec2(hx(g+e)-hx(g-e),hx(g+e.yx)-hx(g-e.yx)));
 vec3 n=top?vec3(0,1,0):vec3(gn.x,0,gn.y);
 vec3 c;
 float sh=1.;{vec4 h2;vec4 s=cells(p+n*.02+vec3(0,.01,0),D,32,h2);if(s.w>0.)sh=.25;}
 float dif=max(dot(n,D),0.)*sh;
 if(top&&(raw<WL&&m>.5||hx(hc.zw)<.42*(1.-m))){ // pools of warm honey-light between the stones
  vec3 rf=reflect(rd,n);float fr=pow(1.-max(-rd.y,0.),4.);
  c=vec3(1.,.5,.13)*(.55+.25*vn(p.xz*3.+T*.3))+sky(rf)*(.25+.6*fr);
 }else{
  float lich=ss(.5,.78,fbm(p.xz*.6+hc.xy));
  vec3 al=top?mix(vec3(.3,.26,.21),vec3(.62,.47,.18),lich):vec3(.16,.14,.13)*(.8+.4*vn(vec2(p.y*6.,atan(g.y,g.x)*3.)));
  if(top)al*=1.+.5*ss(.44,.5,hx(g));
  al=mix(top?vec3(.95,.74,.33):vec3(.6,.42,.17),al,m);
  float ao=top?1.:clamp(1.+(p.y-hh)*.35,.2,1.);
  c=al*(H2*dif*1.5+H1*.45*ao+H0*.12);}
 float t=h.w;
 vec3 fc=mix(H0,H2,pow(max(dot(rd,D),0.),5.)*.5);
 c=mix(c,fc,1.-exp(-t*.011));
 c=mix(c,fc*1.05,ss(1.2,-.4,p.y)*.35*ss(5.,30.,t)); // low mist
 return c;}
// ---------------- the poles that grow with distance ----------------
const float KP=55.,DP=28.,XP=-4.5;
float scl(float z){return 1.+max(z,0.)/KP;}
float poles(vec3 p){float n=floor(p.z/DP+.5),d=p.y;
 for(float k=-1.;k<=1.;k++){float c=(n+k)*DP,s=scl(c);vec3 q=p-vec3(XP,0,c);
  float pd=max(length(q.xz)-.15*s*(1.-.3*q.y/(9.*s)),q.y-9.*s);
  vec3 b=q-vec3(0,8.3*s,0);pd=min(pd,max(abs(b.x)-1.6*s,max(abs(b.y)-.09*s,abs(b.z)-.08*s)));
  d=min(d,pd);}
 return d;}
vec2 seg(vec3 ro,vec3 rd,vec3 a,vec3 b){vec3 ba=b-a,w=ro-a;float d=dot(rd,ba),e=dot(ba,ba),f=dot(rd,w),g=dot(ba,w);
 float s=clamp((g-d*f)/max(e-d*d,1e-5),0.,1.),t=d*s-f;return vec2(length(w+rd*t-ba*s),t);}
vec3 field(vec3 ro,vec3 rd){
 float t=.1;bool hit=false;
 for(int i=0;i<140;i++){float d=poles(ro+rd*t);if(d<.001*t){hit=true;break;}t+=d*.9;if(t>700.)break;}
 vec3 c=sky(rd);
 // distant hills silhouette
 float az=atan(rd.x,rd.z),hl=.025+.02*fbm(vec2(az*6.,1.))-.01;
 if(rd.y<hl&&rd.y>0.)c=mix(c,mix(H1*.5,H0*.7,.5),.8*ss(hl,hl-.004,rd.y));
 if(hit){vec3 p=ro+rd*t;
  if(p.y<.01){ // the field
   float road=ss(2.4,1.6,abs(p.x-.3+sin(p.z*.02)*.6));
   vec3 al=mix(vec3(.3,.22,.12),vec3(.42,.3,.15),fbm(p.xz*vec2(.6,.08)))*(.7+.3*vn(p.xz*4.));
   al=mix(al,vec3(.5,.4,.3),road*.7);
   c=al*(H1*.55+H0*.35*pow(max(dot(rd,D)+.3,0.),2.));
  }else{float s=scl(floor(p.z/DP+.5)*DP);c=H1*.08+H0*.05*ss(5.*s,9.*s,p.y);} // pole silhouettes
  vec3 fc=mix(H0*.9,H2,pow(max(dot(rd,D),0.),4.)*.6);
  c=mix(c,fc,1.-exp(-t*.0075));}
 // wires (two-segment sag) and lamps, analytic and anti-aliased
 float px=1.6/R.y;float w=0.,lm=0.;
 float n0=floor((ro.z-30.)/DP);
 for(int i=0;i<18;i++){float c0=(n0+float(i))*DP,s0=scl(c0),s1=scl(c0+DP);
  for(float sd=-1.;sd<=1.;sd+=2.){
   vec3 A=vec3(XP+sd*1.4*s0,8.4*s0,c0),B=vec3(XP+sd*1.4*s1,8.4*s1,c0+DP),Mi=(A+B)*.5-vec3(0,1.3*(s0+s1)*.5,0);
   vec2 a=seg(ro,rd,A,Mi),b=seg(ro,rd,Mi,B);a=a.x<b.x?a:b;
   if(a.y>0.&&(!hit||a.y<t))w=max(w,ss(px*1.5,0.,a.x/a.y-.02*s0/a.y)*exp(-a.y*.004));}
  vec3 lp=vec3(XP,9.25*s0,c0);vec3 v=lp-ro;float lt=dot(v,rd);
  if(lt>0.&&(!hit||lt<t+1.)){float ld=length(v-rd*lt)/lt;lm+=exp(-ld*ld/(px*px*9.))*.9+.0016/(ld*ld/(px*px)+1.)*30.;}}
 c=mix(c,H1*.07,w*.85);
 c+=vec3(1.,.55,.2)*lm*ss(44.,46.,T/2.7272727)*1.3;
 return c;}
// ---------------- film leader ----------------
vec3 leader(vec2 uv){float r=length(uv);
 vec3 c=vec3(.55,.48,.37)*(.75+.25*ss(1.3,0.,r));
 if(atan(uv.x,uv.y)/6.2832+.5<P.x)c*=.72;
 float l=ss(.01,0.,abs(r-.62))+ss(.01,0.,abs(r-.74))+ss(.006,0.,abs(uv.x))+ss(.006,0.,abs(uv.y));
 return mix(c,vec3(.08,.07,.06),min(l,1.)*.85)*P.y;}
vec3 grass(vec3 c,vec2 uv){
 for(int l=0;l<3;l++){float fl=float(l),sc=3.+fl*2.5,x=uv.x*sc+fl*7.3,id=floor(x),f=fract(x)-.5;
  float tip=-1.+(.12+.32*h1(vec2(id,fl)))/(1.+fl*.6),u=clamp((uv.y+1.)/(tip+1.),0.,1.);
  float lean=(h1(vec2(id,fl+9.))-.5)*.8+sin(T*1.1+id*2.)*.12*u,cx=lean*u*u+(h1(vec2(id,fl+4.))-.5)*.4;
  float w=.07*(1.-u)+.006,bl=.03/(1.+fl),m=ss(w+bl,w-bl,abs(f-cx))*step(uv.y,tip)*P.w;
  c=mix(c,H1*.12+H2*(.2+.6*u)*pow(max(D.z,0.),2.)*(.5+.5*ss(w,w*.3,abs(f-cx))),m*(.9-fl*.15));}
 return c;}
void main(){
 vec2 uv=(gl_FragCoord.xy*2.-R)/R.y;
 vec3 rd=normalize(M*vec3(uv,1.6)),c;
 if(S<.5)c=leader(uv);
 else if(S<1.5){c=meadow(C,rd);if(P.w>0.)c=grass(c,uv);}
 else if(S<2.5)c=seeds(uv);
 else if(S<3.5)c=basalt(C,rd);
 else c=field(C,rd);
 o=vec4(c*(1.+K*.05),1);}
