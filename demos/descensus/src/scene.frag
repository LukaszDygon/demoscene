#version 300 es
precision highp float;
// T scene time, W wall time (waves), H heartbeat envelope, Lt lantern, Fd fade, S scene gates (shafts, jellies, whale, cathedral)
uniform vec2 R;uniform float T,W,H,Lt,Fd;uniform vec3 C,LP,AP,WP;uniform mat3 M;uniform vec4 S;
out vec4 o;
#define FL -85.
#define FAR 110.
const vec3 CY=vec3(.1,.85,1.),MG=vec3(1.,.16,.78),LC=vec3(.5,1.,.92);
float h3(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
  mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float n2(vec2 p){return n3(vec3(p,.5));}
float fbm(vec3 p){return .5*n3(p)+.25*n3(p*2.03)+.125*n3(p*4.1);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float ell(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/k1;}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
// gothic (equilateral) pointed opening, springing at v.y=0, half width w; negative inside
float arch(vec2 v,float w){return v.y<0.?abs(v.x)-w:max(length(v-vec2(-w,0))-2.*w,length(v-vec2(w,0))-2.*w);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float wl(float y){return exp(min(y,0.)*.06);}            // downwelling light at depth
vec3 water(vec3 rd,float y){float a=wl(y);
 vec3 c=vec3(.02,.13,.16)*a+vec3(.07,.05,.13)*a*a*a*a+vec3(.0003,.0013,.0018);
 return c*(.3+2.2*pow(clamp(rd.y*.5+.5,0.,1.),4.));}
// ---------- jellyfish field ----------
float gT,gB;vec3 gC;
float jelly(vec3 p){
 if(p.y<-42.||p.y>-4.)return max(-42.-p.y,p.y+4.)+1.;
 vec3 c=vec3(16),q=p;q.x+=8.;q.y-=2.;
 vec3 id=round(q/c);id.y=clamp(id.y,-2.,-1.);q-=id*c;
 float hs=h3(id),h2=h3(id+7.1);
 if(fract(hs*13.)<.45){gT=1e5;gB=1e5;vec3 e=8.-abs(q);return max(min(e.x,min(e.y,e.z))-3.,.4);}
 q-=vec3(hs-.5,h2-.5,fract(hs*7.)-.5)*vec3(5,3,5);q.y-=2.;
 q.y-=sin(T*.3+hs*6.)*.8;
 q.xy*=rot(.25*sin(T*.2+hs*5.));q.zy*=rot(.2*sin(T*.17+h2*5.));
 float sz=.6+h2*.75;q/=sz;
 float bnd=length(q-vec3(0,-2,0))-4.2;if(bnd>1.){gT=bnd*sz;gB=1e5;return bnd*sz*.8;}
 float pu=pow(.5+.5*sin(T*3.665+hs*6.28),2.);
 float r=1.+.13*pu,hh=.85-.2*pu;
 float e=ell(q,vec3(r,hh,r));
 float bell=max(abs(e)-.045,-q.y-.08);
 vec3 qa=q;qa.x-=.15*sin(q.y*3.+T*1.3+hs*9.);qa.z-=.12*cos(q.y*2.7+T*1.1);
 float arms=cap(qa,vec3(0,-.1,0),vec3(0,-1.7,0),.1+.06*sin(q.y*9.));
 float a=atan(q.z,q.x),sc=.7854;a=mod(a+sc*.5,sc)-sc*.5;float l=length(q.xz);
 vec2 tq=vec2(l*cos(a)-.88*r,l*sin(a));
 tq.x-=.3*sin(q.y*1.2+T*1.1+hs*4.)*min(-q.y,5.)*.3;
 float yy=max(q.y+.05,0.)+max(-4.6-q.y,0.);
 gT=length(vec3(tq,yy))*sz;gB=(e)*sz;
 gC=hs<.62?CY:MG;
 return min(bell,arms)*sz*.8;}
// ---------- humpback whale ----------
vec3 wloc(vec3 p){vec3 q=p-WP;q=vec3(-q.z,q.y,q.x);float u=clamp((q.z+13.)/26.,0.,1.),tb=1.-u;
 q.y-=1.1*sin(T*1.05-q.z*.13)*tb*tb;return q;}
float whale(vec3 p){
 vec3 q=p-WP;float bd=length(q);if(bd>20.)return bd-18.;
 q=wloc(p);
 float zc=clamp(q.z,-13.,13.),u=(zc+13.)/26.;
 float r=6.6*pow(u,.8)*pow(1.-u,.5)+.22;
 float d=length(vec3(q.x,q.y*1.15+.25*u*smoothstep(.0,1.,q.y),q.z-zc))-r;
 d*=.85;
 vec3 f=q-vec3(0,0,-13.4);f.x=abs(f.x);f.z+=f.x*.45;
 float fl=ell(f-vec3(2.3,0,-.3),vec3(2.7,.16,1.));
 d=smin(d,fl,.5);
 vec3 pf=q-vec3(0,-1.1,5.5);pf.x=abs(pf.x);pf.xy*=rot(.55+.12*sin(T*.4));pf.xz*=rot(.8);
 float fin=ell(pf-vec3(4.6,0,0),vec3(4.9,.2,.85));
 d=smin(d,fin,.4);
 d=smin(d,ell(q-vec3(0,1.9,-5.5),vec3(.15,.5,.9)),.4);
 return d;}
// ---------- siphonophore: a long chain of light drifting through the dark ----------
vec2 siph(vec3 p){vec3 q=p-vec3(-1.,-64.,76.);q.xz*=rot(.5);q.xy*=rot(-.25);
 float x=clamp(q.x,-14.,14.);
 vec2 c=vec2(1.3*sin(x*.33+T*.5),1.1*cos(x*.26+T*.4));
 float d=length(vec3(q.x-x,q.y-c.x,q.z-c.y));
 return vec2(d,.35+.65*pow(.5+.5*sin(q.x*5.),6.)+2.5*exp(-pow(q.x-mod(T*7.,48.)+24.,2.)*.08));}
// ---------- sunken cathedral ----------
float mC;bool LITE=false;
float cath(vec3 p){
 vec3 q=p;q.y-=FL;
 float bb=box(q-vec3(0,12,128),vec3(13,13,30));if(bb>2.)return bb;
 float d=q.y>1.?q.y-.3:q.y+.08*sin(q.x*1.9+sin(q.z*.4)*2.)*sin(q.z*.3+q.x*.2)+.1*sin(q.z*.21+q.x*.13),st=1e5;mC=9.;
 float ax=abs(abs(q.x)-5.),bz=q.z-107.5-7.*clamp(round((q.z-107.5)/7.),0.,5.);
 if(ax>1.6)st=ax-1.1;else{
  vec3 c=q;c.x=abs(c.x)-5.;float k=clamp(round((c.z-104.)/7.),0.,6.);c.z-=104.+7.*k;
  float pr=min(length(c.xz)-.55,min(length(vec2(abs(c.x)-.6,c.z)),length(vec2(c.x,abs(c.z)-.6)))-.2);
  pr=max(pr,q.y-7.);
  pr=min(pr,box(c-vec3(0,.35,0),vec3(.95,.35,.95))-.03);
  pr=min(pr,box(c-vec3(0,6.9,0),vec3(1.,.22,1.))-.05);
  float wa=max(ax-.35,max(6.7-q.y,q.y-12.4));wa=max(wa,abs(q.z-125.)-22.);
  st=min(pr,max(wa,-arch(vec2(bz,q.y-6.9),2.85)));}
 if(q.y<10.8)st=min(st,11.-q.y);else{
  float va=arch(vec2(q.x,q.y-12.),5.35);
  float vs=max(abs(va+.3)-.3,12.-q.y);vs=max(vs,abs(q.z-128.)-25.5);
  float rz=q.z-104.-7.*clamp(round((q.z-104.)/7.),0.,7.);
  float rib=max(max(abs(va+.55)-.55,abs(rz)-.28),11.6-q.y);rib=max(rib,abs(q.z-125.)-22.);
  vs=max(vs,-(length(q-vec3(1.5,19.,113.))-3.6));vs=max(vs,-(length(q-vec3(-2.,18.,131.))-2.6));
  st=min(st,min(vs,rib));}
 float x=abs(q.x);
 if(x<8.5&&q.y<10.)st=min(st,min(10.1-x,10.5-q.y));else{
  float ow=max(abs(x-10.5)-.4,q.y-12.6);ow=max(ow,abs(q.z-126.5)-26.5);
  ow=max(ow,-max(arch(vec2(bz,q.y-6.),1.1),1.6-q.y));
  float ar=max(abs(q.y-12.6+(x-5.)*.3)-.25,max(5.-x,x-10.9));ar=max(ar,abs(q.z-126.5)-26.5);
  st=min(st,min(ow,ar));}
 if(q.z<151.6)st=min(st,152.8-q.z);else{
  vec2 rw=vec2(q.x,q.y-14.5);float rl=length(rw);
  float ew=max(abs(q.z-153.5)-.6,max(x-11.,q.y-24.));
  float bx=q.x-3.*clamp(round(q.x/3.),-1.,1.);
  ew=max(ew,-max(arch(vec2(bx,q.y-8.),.75),3.5-q.y));
  ew=max(ew,-(rl-3.6));
  if(rl<3.9&&!LITE){float an=atan(rw.y,rw.x),sp=.5236,sa=mod(an+sp*.5,sp)-sp*.5;
   vec2 pp=vec2(rl*cos(sa),rl*sin(sa));
   float tr=min(max(abs(pp.y)-.11,1.2-rl),min(abs(rl-1.2)-.14,abs(rl-3.6)-.22));
   tr=min(tr,abs(length(pp-vec2(2.4,0))-.62)-.08);
   tr=max(max(tr,rl-3.75),abs(q.z-153.5)-.3);
   ew=min(ew,tr);}
  st=min(st,ew);
  float bp=max(abs(q.z-157.)-.2,max(x-9.,q.y-21.));
  if(bp<d&&bp<st){d=bp;mC=8.;}}
 if(q.y<2.6){
  float al=box(q-vec3(0,.2,143),vec3(3.2,.2,2.2))-.02;al=min(al,box(q-vec3(0,.6,143),vec3(2.4,.2,1.6))-.02);
  al=min(al,box(q-vec3(0,1.35,143),vec3(1.4,.55,.6))-.03);al=min(al,box(q-vec3(0,1.97,143),vec3(1.65,.07,.8))-.01);
  al=min(al,cap(q,vec3(-2.6,.45,117.),vec3(-1.1,.45,120.5),.45));al=min(al,cap(q,vec3(3.,.42,129.),vec3(2.7,.42,132.4),.42));
  al=min(al,box(q-vec3(-7.5,.5,124.),vec3(.9,.5,.8)));
  st=min(st,al);}else st=min(st,q.y-2.1);
 if(st<d){d=st;mC=3.;}
 return d;}
// ---------- anglerfish ----------
float mA;bool LURE=true;
float angler(vec3 p){
 float lu=LURE?length(p-LP)-.28:1e5;
 vec3 a=(p-AP)/1.35;float bd=length(a)-7.;
 if(bd>1.){mA=6.;return min(bd*1.35,lu);}
 vec3 rt=vec3(.35,1.6,-4.6);
 float rod=min(cap(a,vec3(0,1.7,-1.),vec3(.8,2.9,-3.),.08),cap(a,vec3(.8,2.9,-3.),rt,.06));
 if(LURE)rod=min(rod,cap(p,AP+rt*1.35,LP,.03)/1.35);
 float b=ell(a,vec3(2.3,2.,2.7));
 b=smin(b,ell(a-vec3(0,.2,2.6),vec3(1.,1.1,1.8)),.6);
 b=smin(b,ell(a-vec3(0,-1.05,-1.2),vec3(2.05,.85,1.95)),.3);
 b=smax(b,-ell(a-vec3(0,-.55,-2.2),vec3(1.75,.68,1.4)),.12);
 b=smin(b,ell(a-vec3(0,.3,4.6),vec3(.12,1.5,1.2)),.2);
 vec3 fa=a-vec3(0,-.5,.4);fa.x=abs(fa.x);fa-=vec3(2.,0,0);fa.xz*=rot(.5);
 b=smin(b,ell(fa,vec3(.9,.75,.1)),.15);
 float d=b*1.35;mA=4.;
 float tb=length(a-vec3(0,-.6,-2.8));if(!LITE&&tb>2.6)d=min(d,(tb-2.)*1.35);
 if(!LITE&&tb<=2.6){
 vec3 t=a;float tx=clamp(round(t.x/.36),-4.,4.);t.x-=tx*.36;float X=tx*.36;
 float zf=-2.2-1.4*sqrt(max(0.,1.-X*X/3.06));float th=h3(vec3(tx,2,3));
 vec3 tl=t-vec3(0,-1.05,zf+.22);float L1=.25+.55*th*th;
 float te=max(length(tl.xz)-.085*(1.-tl.y/L1),max(-tl.y,tl.y-L1))*.7;
 vec3 tu=a;float ux=clamp(round(tu.x/.36-.5),-5.,4.)+.5;tu.x-=ux*.36;float X2=ux*.36;tu-=vec3(0,-.02,-2.2-1.4*sqrt(max(0.,1.-X2*X2/3.06))+.32);th=h3(vec3(ux,5,1));float L2=.2+.45*th;
 te=min(te,max(length(tu.xz)-.075*(1.+tu.y/L2),max(tu.y,-tu.y-L2))*.7);
 te*=1.35;if(te<d){d=te;mA=5.;}}
 vec3 ey=a-vec3(1.35,.55,-1.65);ey.x=abs(a.x)-1.35;
 float eye=(length(ey)-.22)*1.35;rod*=1.35;
 if(eye<d){d=eye;mA=7.;}
 if(rod<d){d=rod;mA=4.;}
 if(lu<d){d=lu;mA=6.;}
 return d;}
float mid;
float map(vec3 p){
 float d=FAR;mid=0.;gT=1e5;gB=1e5;
 if(S.y>0.){float j=jelly(p);if(j<d){d=j;mid=1.;}}
 if(S.z>0.){float w=whale(p);if(w<d){d=w;mid=2.;}}
 if(S.w>0.){float c=cath(p);if(c<d){d=c;mid=mC;}
  float a=angler(p);if(a<d){d=a;mid=mA;}}
 return d;}
vec3 nor(vec3 p,float e){vec2 k=vec2(1,-1);
 return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e));}
float shadow(vec3 p,vec3 l,float md){float r=1.,t=.05;LURE=false;LITE=true;
 for(int i=0;i<18;i++){float h=map(p+l*t);r=min(r,10.*h/t);t+=clamp(h,.12,1.5);if(r<.01||t>md)break;}
 LURE=true;LITE=false;return clamp(r,0.,1.);}
float ao(vec3 p,vec3 n){float a=0.;LITE=true;for(int i=1;i<4;i++){float h=.3*float(i);a+=max(h-map(p+n*h),0.)/h;}LITE=false;return clamp(1.-a*.45,0.,1.);}
float wave(vec2 p){return .3*n2(p*.28+W*.18)+.14*n2(p*.75-W*.27)+.05*n2(p*2.1+W*.4);}
void main(){
 vec2 fc=gl_FragCoord.xy,uv=(fc*2.-R)/R.y;
 vec3 ro=C,rd=normalize(M*vec3(uv,1.7));
 float dz=h3(vec3(fc,fract(T)*91.));
 // ---- march ----
 float t=.05+dz*.2,d,fm=S.w>0.?FAR:72.;vec3 glo=vec3(0);bool hit=false;
 for(int i=0;i<110;i++){vec3 p=ro+rd*t;d=map(p);
  float st=d;
  if(gT<2.){st=min(st,max(gT*.6,.08));
   glo+=S.y*gC*(1.1*exp(-gT*11.)+.015*exp(-gT*1.5))*st*(.7+.6*H)*exp(-t*.04);}
  if(gB<3.)glo+=S.y*gC*.05*exp(-max(gB,0.)*2.5)*st*exp(-t*.04);
  if(T>45.&&T<62.){vec2 sf=siph(p);st=min(st,max(sf.x*.6,.05));
   glo+=mix(CY,MG,smoothstep(1.,2.5,sf.y))*sf.y*exp(-sf.x*10.)*st*exp(-t*.03)*smoothstep(46.,50.,T)*(1.-smoothstep(57.,61.,T))*1.6;}
  if(d<.002*t){hit=true;break;}
  t+=st;if(t>fm)break;}
 
 if(!hit)t=FAR;
 vec3 p=ro+rd*t,bg=water(rd,ro.y),col=bg;
 if(hit){float m=mid;vec3 n=nor(p,.002*t+.001);
  float a=wl(p.y);vec3 amb=water(n,p.y)*1.6;
  float oc=ao(p,n);
  vec3 alb=vec3(.15,.19,.19),em=vec3(0);
  if(m==1.){float fr=pow(1.-abs(dot(n,rd)),2.);jelly(p);
   em=gC*(.15+1.8*fr)*(.8+.6*H)+vec3(.6,.9,1.)*fr*fr*.4;alb=vec3(0);}
  else if(m==2.){vec3 q=wloc(p);float bel=smoothstep(.3,-.6,q.y/2.5);
   alb=mix(vec3(.1,.13,.15),vec3(.45,.5,.5),bel)*3.;
   alb*=.85+.3*n3(p*1.5);
   if(q.y<0.&&q.z>2.)alb*=.8+.2*sin(q.x*14.);
   em=vec3(.25,.6,.65)*pow(1.-abs(dot(n,rd)),3.)*.06;
   vec3 cl=q*2.;vec3 ci=floor(cl);float hh=h3(ci+9.);if(hh>.93)em+=(hh>.975?MG:CY)*smoothstep(.25,0.,length(fract(cl)-.5))*(.4+.6*sin(T*1.3+hh*50.))*.9;}
  else if(m==3.||m==9.){alb=(m==9.?vec3(.17,.18,.16):vec3(.12,.16,.16))*(.55+.9*fbm(p*.9));
   alb=mix(alb,vec3(.05,.12,.09),smoothstep(.5,.9,n.y)*.5*(m==3.?1.:0.));
   vec3 cl=p*1.6;vec3 ci=floor(cl);float hh=h3(ci+3.);
   if(hh>.965){float g=smoothstep(.22,0.,length(fract(cl)-.5-(h3(ci)-.5)*.4));
    em=(hh>.985?MG:CY)*g*(.5+.5*sin(T*(.6+hh)+hh*40.))*1.2*smoothstep(46.,56.,T);}}
  else if(m==4.){alb=vec3(.2,.14,.16)*(.4+1.2*n3(p*2.2));
   float sp=smoothstep(.8,.9,n3(p*2.6));em=MG*sp*.5*(.6+.4*H)+vec3(.2,.6,.6)*pow(1.-abs(dot(n,rd)),3.)*.12*Lt;}
  else if(m==5.)alb=vec3(.75,.8,.75);
  else if(m==6.){em=LC*(3.+H*2.)*Lt+vec3(1)*Lt*1.5;alb=vec3(0);}
  else if(m==7.){alb=vec3(.02);em=vec3(.4,.6,.6)*pow(max(dot(reflect(rd,n),normalize(LP-p)),0.),30.)*Lt;}
  else if(m==8.){vec2 rw=vec2(p.x,p.y-FL-14.5);float an=atan(rw.y,rw.x),sg=floor(an/.5236+.5),rr=length(rw);
   float hb=h3(vec3(sg,floor(rr*1.3),1));em=mix(CY,MG,step(.5,hb))*(.12+.1*sin(T*.7+hb*9.))*smoothstep(44.,58.,T);alb=vec3(0);}
  col=alb*amb*oc+em;
  if(Lt>0.&&m>2.){vec3 lv=LP-p;float ld=length(lv);lv/=ld;
   float att=Lt*(7.+2.*H)/(1.+ld*ld*.22),df=max(dot(n,lv),0.);
   float sh=ld<12.?shadow(p+n*.02,lv,ld-.35):(df>0.?.6:0.);
   col+=alb*LC*att*df*sh*(.4+.6*oc);
   col+=alb*LC*att*.03*oc;
   if(m==5.)col+=LC*att*.05;}
  col=mix(bg,col,exp(-t*.027));}
 // ---- sea surface seen from below ----
 if(rd.y>0.&&ro.y<0.){float ts=-ro.y/rd.y;if(ts<t){vec3 sp=ro+rd*ts;vec2 e=vec2(.15,0);
  float h0=wave(sp.xz);vec3 n=normalize(vec3(h0-wave(sp.xz+e),.5,h0-wave(sp.xz+e.yx)));
  vec3 rr=refract(rd,-n,1.33),sc=water(reflect(rd,-n),-3.)*(.5+6.*length(n.xz));
  if(dot(rr,rr)>.01){float y=max(rr.y,0.);
   vec3 sk=mix(vec3(.6,.36,.55),vec3(.03,.07,.19),pow(y,.45));
   sk=mix(sk,sk*vec3(.45,.4,.55),smoothstep(.45,.8,n2(rr.xz/(y+.15)*1.3+vec2(W*.01,0)))*.85);
   sk+=step(.9975,h3(floor(rr*260.)))*y*.7;
   sc=mix(sk*1.5,sc,pow(1.-y,6.)*.7);}
  col=mix(bg,sc,exp(-ts*.085));t=ts;}}
 // ---- dusk light shafts ----
 if(S.x>0.){float tm=min(t,75.),acc=0.;
  for(int i=0;i<20;i++){float s=(float(i)+dz)/20.;float ds=2.*s*tm/20.;s=s*s*tm;
   vec3 q=ro+rd*s;if(q.y>0.)break;
   vec2 z=q.xz-vec2(.32,.18)*q.y;
   float c=n2(z*.2+vec2(W*.04,W*.025))*.7+n2(z*.55-W*.03)*.3;
   acc+=pow(smoothstep(.5,.95,c),2.)*wl(q.y)*exp(-s*.025)*ds;}
  col+=vec3(.3,.42,.55)*acc*.07*S.x;}
 col+=glo;
 // ---- lantern glow in the water (analytic in-scatter of a point light) ----
 if(Lt>0.){vec3 w=LP-ro;float b=dot(w,rd),h=length(w-b*rd)+.03;
  float I=(atan((t-b)/h)-atan(-b/h))/h;
  col+=LC*Lt*(I*.035+.0015/(h*h)*step(b,t))*(.8+.4*H);}
 // ---- grade ----
 col=1.-exp(-col*1.4);
 col=pow(col,vec3(.4545));col=mix(col,col*col*(3.-2.*col),.45);
 col*=1.-.32*dot(uv*.6,uv*.6);
 col*=Fd;
 col+=(dz-.5)/160.;
 o=vec4(col,1);
 gl_FragDepth=clamp(t*dot(rd,M[2])/FAR,0.,1.);}
