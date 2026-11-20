#version 300 es
precision highp float;
uniform vec2 R;
uniform float T,PL,SH,FZ,HD;
uniform vec3 CP;
uniform mat3 CM;
uniform vec4 EX[10],SHP[6],SPL[6];
out vec4 O;
#define PC vec3(520.,-380.,1900.)
#define PR 1000.
#define LD normalize(vec3(-.55,.5,.7))
#define RN normalize(vec3(.3,1.,.2))
#define MC vec3(-100.,40.,1000.)
#define MD vec3(-500.,-60.,1500.)

float h1(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float h3(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float vn(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 float a=mix(mix(h1(i),h1(i+vec3(1.,0.,0.)),f.x),mix(h1(i+vec3(0.,1.,0.)),h1(i+vec3(1.,1.,0.)),f.x),f.y);
 float b=mix(mix(h1(i+vec3(0.,0.,1.)),h1(i+vec3(1.,0.,1.)),f.x),mix(h1(i+vec3(0.,1.,1.)),h1(i+vec3(1.,1.,1.)),f.x),f.y);
 return mix(a,b,f.z);}
float fb(vec3 p){return .5*vn(p)+.25*vn(p*2.03)+.125*vn(p*4.01)+.0625*vn(p*8.07);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cy(vec3 p,float r,float hl){vec2 d=abs(vec2(length(p.yz),p.x))-vec2(r,hl);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float sg(vec2 p,vec2 a,vec2 b,float r){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}

float hullA(vec3 p){
 float ax=abs(p.x);
 float h=mix(9.,2.4,smoothstep(20.,88.,ax));
 float w=13.-6.*smoothstep(0.,90.,p.x);
 float d=max(max(abs(p.y)-h,abs(p.z)-w),ax-90.);
 d=min(d,max(bx(vec3(mod(p.x+6.,12.)-6.,p.y-h-1.,p.z),vec3(2.,1.,w*.5)),ax-70.));
 d=min(d,max(bx(vec3(mod(p.x+6.,12.)-6.,p.y+h+1.,p.z),vec3(1.5,1.,w*.4)),ax-70.));
 d=min(d,bx(p-vec3(-80.,0.,0.),vec3(12.,16.,15.)));
 d=min(d,bx(p-vec3(-18.,13.,0.),vec3(20.,5.,6.)));
 d=min(d,bx(p-vec3(8.,-11.,0.),vec3(30.,3.,11.)));
 d=min(d,bx(p-vec3(96.,0.,0.),vec3(8.,1.2,1.2)));
 d=min(d,cy(p-vec3(-89.,5.,7.),5.,4.));
 d=min(d,cy(p-vec3(-89.,-5.,7.),5.,4.));
 d=min(d,cy(p-vec3(-89.,5.,-7.),5.,4.));
 d=min(d,cy(p-vec3(-89.,-5.,-7.),5.,4.));
 d=min(d,length(p-vec3(30.,10.,0.))-3.);
 d=min(d,length(p-vec3(-40.,9.,0.))-2.5);
 return d;}

float hullB(vec3 p){
 float ax=abs(p.x);
 float h=1.5+5.*(1.-smoothstep(10.,70.,ax));
 float w=mix(9.,2.,smoothstep(0.,75.,p.x));
 float d=max(max(abs(p.y)-h,abs(p.z)-w),ax-70.);
 d=min(d,bx(p-vec3(0.,h+2.,0.),vec3(14.,2.,3.)));
 d=min(d,cy(p-vec3(-72.,0.,0.),5.,6.));
 d=min(d,cy(p-vec3(30.,h+3.,0.),4.,1.));
 d=min(d,bx(p-vec3(-30.,0.,0.),vec3(14.,h+6.,.6)));
 d=min(d,bx(p-vec3(72.,0.,0.),vec3(6.,.8,.8)));
 d=min(d,max(bx(vec3(mod(p.x+5.,10.)-5.,p.y-h-.6,p.z),vec3(1.,.6,w*.6)),ax-60.));
 return d;}

float hullC(vec3 p){
 float ax=abs(p.x),rr=length(p.yz);
 float d=max(rr-7.,ax-100.);
 d=min(d,max(rr-9.,abs(mod(p.x+5.,10.)-5.)-1.2));
 d=min(d,length(p-vec3(-50.,0.,0.))-14.);
 d=min(d,length(p-vec3(30.,0.,0.))-12.);
 d=min(d,cy(p-vec3(-102.,0.,0.),9.,4.));
 d=min(d,bx(p-vec3(20.,-11.,0.),vec3(40.,4.,3.)));
 d=min(d,bx(p-vec3(-20.,10.,0.),vec3(25.,3.,8.)));
 return d;}

float hullSel(vec3 p,float ty){return ty<.5?hullA(p):ty<1.5?hullB(p):hullC(p);}

float ship(vec3 p,vec3 c,float a,float ts,float k,float ty){
 float s=max(T-ts,0.);
 vec3 o=vec3(0.,.4,.9)*(min(pow(s,1.5)*.6,50.)+.2*s);
 vec3 d=(p-c)/k;float rb=125.+length(o);
 if(length(d)>rb)return (length(d)-rb)*k;
 vec3 q=ry(-(a+.02*sin(T*.2+a)))*d;
 float r;
 if(T<ts)r=hullSel(q,ty);
 else r=min(max(hullSel(q-o,ty),-q.x),max(hullSel(q+o,ty),q.x));
 return r*k;}

float debris(vec3 p,out float ty){
 const float C=60.;
 vec3 id=floor(p/C+.5),q=p-id*C;
 float bd=max(30.-max(abs(q.x),max(abs(q.y),abs(q.z))),1.);
 ty=0.;
 if(length(id.xz)>7.||length(id.xz)<1.5||abs(id.y)>1.||h3(id)>.3)return bd;
 vec3 c=(vec3(h3(id+vec3(1.,5.,9.)),h3(id+vec3(4.,2.,6.)),h3(id+vec3(8.,3.,2.)))-.5)*30.;
 float sz=1.2+3.5*h3(id+vec3(6.,6.,6.));
 ty=floor(h3(id+vec3(2.,7.,1.))*5.);
 float hh=h3(id);
 float an=T*(.25+.5*hh)+hh*6.;
 vec3 r=ry(an)*rz(an*.6)*(q-c);
 float dd;
 if(ty<.5)dd=bx(r,vec3(sz,sz*.4,sz*.7));
 else if(ty<1.5)dd=bx(r,vec3(3.4*sz,.25*sz,.25*sz));
 else if(ty<2.5)dd=min(length(r)-.9*sz,bx(r-vec3(0.,.8*sz,0.),vec3(.3*sz,.2*sz,.3*sz)));
 else if(ty<3.5)dd=cy(r,.5*sz,2.*sz);
 else dd=bx(r,vec3(1.2*sz,.06*sz,.9*sz));
 return min(dd,bd);}

float map(vec3 p,out float m){
 float d=1e4,s,ty;m=1.;
 for(int i=0;i<6;i++){s=ship(p,SHP[i].xyz,SHP[i].w,SPL[i].x,SPL[i].y,SPL[i].z);if(s<d){d=s;m=1.;}}
 float g=debris(p,ty);
 if(g<d){d=g;m=2.+ty;}
 return d;}

vec3 nrm(vec3 p){
 vec2 e=vec2(.02,0.);float m;
 return normalize(vec3(map(p+e.xyy,m)-map(p-e.xyy,m),map(p+e.yxy,m)-map(p-e.yxy,m),map(p+e.yyx,m)-map(p-e.yyx,m)));}

bool hitS(vec3 ro,vec3 rd,vec3 c,float r,out float t){
 vec3 oc=ro-c;float b=dot(oc,rd),h=b*b-dot(oc,oc)+r*r;
 if(h<0.)return false;
 t=-b-sqrt(h);return t>0.;}

float ringR(vec3 ro,vec3 rd,out float rr){
 float dn=dot(rd,RN);rr=0.;
 if(abs(dn)<1e-4)return -1.;
 float t=-dot(ro-PC,RN)/dn;
 if(t<0.)return -1.;
 rr=length(ro+rd*t-PC);
 return t;}
float ringA(float rr){
 float r=rr/PR;
 float a=smoothstep(1.35,1.45,r)*(1.-smoothstep(2.25,2.35,r));
 a*=1.-.8*smoothstep(1.6,1.62,r)*(1.-smoothstep(1.66,1.68,r));
 return a*(.3+.5*fb(vec3(rr*.02,0.,.5))+.2*vn(vec3(rr*.4,0.,2.)));}

vec3 planetCol(vec3 p,vec3 ro){
 vec3 n=normalize(p-PC);
 float w=fb(n*2.5+vec3(0.,T*.004,0.));
 float band=.5+.5*sin(n.y*16.+4.*w);
 vec3 c=mix(vec3(.9,.42,.1),vec3(.36,.12,.5),smoothstep(.25,.75,band));
 c*=.55+.7*fb(n*9.);
 c*=.8+.4*vn(n*60.+vec3(T*.05));
 float st=smoothstep(.16,.05,distance(n,normalize(vec3(.6,-.2,.75))));
 float st2=smoothstep(.1,.03,distance(n,normalize(vec3(-.5,.25,.8))));
 c=mix(c,vec3(.95,.8,.55)*(.6+.4*fb(n*30.)),st*.7);
 c=mix(c,vec3(.6,.2,.3)*(.5+.5*fb(n*24.)),st2*.6);
 float aur=pow(1.-abs(n.y),12.)*(.3+.7*fb(n*6.+vec3(T*.1)));
 float dif=max(dot(n,LD),0.);
 float rim=pow(1.-max(dot(n,-normalize(p-ro)),0.),3.);
 return c*(.03+1.25*dif)+vec3(1.,.5,.2)*rim*.6*(.3+dif)+vec3(.3,.6,1.)*aur*.2*dif;}

vec3 moonCol(vec3 p,vec3 c){
 vec3 n=normalize(p-c);
 float cr=smoothstep(.55,.7,fb(n*18.));
 return vec3(.5,.48,.46)*(.3+.9*fb(n*12.))*(1.-.5*cr)*(.03+max(dot(n,LD),0.));}

vec3 sky(vec3 rd,float pd){
 vec3 g=floor(rd*230.),g2=floor(rd*90.);
 float s=h1(g),s2=h1(g2+vec3(7.));
 float st=max(s-.9962,0.)*300.*(.7+.3*sin(T*2.+s*80.))+max(s2-.9988,0.)*900.;
 vec3 c=vec3(st)*vec3(.85,.9,1.);
 c+=vec3(.06,.02,.1)*fb(rd*2.+vec3(.5))*1.2;
 c+=vec3(1.,.5,.2)*.4*exp(-max(pd-PR,0.)/40.);
 return c;}

vec3 blasts(vec3 ro,vec3 rd){
 vec3 c=vec3(0.);
 for(int i=0;i<10;i++){
  vec4 e=EX[i];float age=T-e.w;
  if(age<0.||age>16.)continue;
  vec3 v=e.xyz-ro;float s=max(dot(v,rd),0.);float dd=length(v-rd*s);
  float Rr=4.+age*22.;
  float core=exp(-age*1.3)*(age<.6?1.6:.9);
  c+=vec3(1.,.62,.28)*core*exp(-dd*dd/(Rr*Rr*.25))*1.3;
  c+=vec3(1.,.8,.5)*exp(-age*4.)*exp(-dd*dd/(Rr*Rr*.02))*3.;
  c+=vec3(.55,.75,1.)*exp(-abs(dd-Rr)*.45)*exp(-age*.22)*.22;
  for(int j=0;j<6;j++){
   float fj=float(j);
   vec3 dv=normalize(vec3(h1(vec3(float(i),fj,1.))-.5,h1(vec3(float(i),fj,2.))-.5,h1(vec3(float(i),fj,3.))-.5));
   vec3 fp=e.xyz+dv*age*(20.+8.*fj);
   vec3 fv=fp-ro;float fs=max(dot(fv,rd),0.);float fd=length(fv-rd*fs);
   c+=vec3(1.,.7,.3)*exp(-fd*fd*.02)*exp(-age*.8)*.5;
  }
 }
 return c;}

vec3 vent(vec3 ro,vec3 rd){
 vec3 c=vec3(0.);float a=(T-60.)/14.;
 if(a<0.||a>1.)return c;
 vec3 b=SHP[1].xyz+ry(SHP[1].w)*vec3(-70.,-8.,0.),dir=ry(SHP[1].w)*normalize(vec3(-1.,.35,.1));
 float f=1.-a;
 for(int k=0;k<8;k++){
  float fk=float(k);
  vec3 P=b+dir*fk*9.+vec3(sin(T*9.+fk),cos(T*7.+fk),sin(T*5.-fk))*(.8+.4*fk);
  vec3 v=P-ro;float s=max(dot(v,rd),0.);float dd=length(v-rd*s);
  float r=2.+fk*2.2;
  c+=vec3(1.,.5,.15)*exp(-dd*dd/(r*r))*f*(1.-fk/9.)*(.7+.3*sin(T*20.+fk))*.8;
 }
 for(int k=0;k<6;k++){
  float fk=float(k);
  vec3 P=b+dir*(fk*14.+mod(T*8.,14.))+vec3(0.,6.+fk*3.,0.);
  vec3 v=P-ro;float s=max(dot(v,rd),0.);float dd=length(v-rd*s);
  float r=5.+fk*3.;
  c+=vec3(.25,.22,.2)*exp(-dd*dd/(r*r))*f*.12;
 }
 return c;}

vec3 plume(vec3 ro,vec3 rd){
 vec3 c=vec3(0.);
 for(int i=0;i<6;i++){
  float fi=float(i);
  vec3 tl=SHP[i].xyz+ry(SHP[i].w)*vec3(-96.,0.,0.)*SPL[i].y;
  vec3 v=tl-ro;float s=max(dot(v,rd),0.);float dd=length(v-rd*s);
  c+=vec3(.4,.6,1.)*exp(-dd*dd/(9.*SPL[i].y*SPL[i].y))*(.5+.5*sin(T*13.+fi))*.35;
 }
 return c;}

vec3 flashL(vec3 p,vec3 n){
 vec3 c=vec3(0.);
 for(int i=0;i<10;i++){
  vec4 e=EX[i];float age=T-e.w;
  if(age<0.||age>3.)continue;
  vec3 v=e.xyz-p;float l=length(v);
  c+=vec3(1.,.6,.3)*exp(-age*1.5)*max(dot(n,v/l),0.)*900./(l*l+400.);
 }
 return c;}

vec3 shade(vec3 p,vec3 n,vec3 rd,float m){
 vec3 base=m<1.5?vec3(.16,.17,.2):m<2.5?vec3(.3,.25,.21):m<3.5?vec3(.26,.24,.2):m<4.5?vec3(.2,.22,.25):m<5.5?vec3(.34,.3,.26):vec3(.22,.24,.2);
 vec3 tp=normalize(PC-p);
 float sun=max(dot(n,LD),0.),pl=max(dot(n,tp),0.);
 float rim=pow(1.-max(dot(n,-rd),0.),4.);
 vec3 c=base*(.04+.8*sun*vec3(1.,.95,.88)+.9*pl*vec3(1.,.5,.22))+vec3(1.,.5,.2)*rim*.3*pl;
 if(m<1.5)c+=vec3(1.,.78,.42)*step(.93,fract(p.x*.31+p.y*.17))*step(.5,abs(n.z))*.7+vec3(.2,.9,1.)*step(.985,fract(p.z*.37+p.x*.05))*.6;
 else if(m>3.5&&m<4.5)c+=vec3(1.,.55,.2)*step(.7,fract(p.x*.2))*.5*(.5+.5*sin(T*3.+p.y));
 else if(m>4.5&&m<5.5)c+=vec3(.5,.9,1.)*step(.9,fract(p.x*.5))*.1;
 c+=flashL(p,n);
 return c;}

float hand(vec2 p){
 float d=sg(p,vec2(.33,-.46),vec2(.36,-.3),.075);
 d=min(d,sg(p,vec2(.27,-.32),vec2(.26,-.08),.03));
 d=min(d,sg(p,vec2(.32,-.32),vec2(.33,-.05),.032));
 d=min(d,sg(p,vec2(.37,-.32),vec2(.39,-.07),.031));
 d=min(d,sg(p,vec2(.41,-.33),vec2(.44,-.13),.027));
 d=min(d,sg(p,vec2(.24,-.42),vec2(.14,-.3),.03));
 return d;}

float drops(vec2 uv,float amt){
 vec2 g=uv*vec2(26.,22.),id=floor(g),f=fract(g)-.5;
 float r=h1(vec3(id,1.));
 float d=length(f-(vec2(h1(vec3(id,2.)),h1(vec3(id,3.)))-.5)*.4);
 return smoothstep(.22*r*amt+.02,.18*r*amt,d)*step(.6,r)*amt;}

void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
 uv+=SH*.02*vec2(sin(T*67.)+sin(T*31.),cos(T*53.));
 vec3 rd=normalize(CM*vec3(uv*1.6,1.));
 float m=0.,h=-1.,t=0.;
 for(int i=0;i<128;i++){
  float d=map(CP+rd*t,m);
  if(d<.02){h=t;break;}
  t+=d*.85;
  if(t>2000.)break;
 }
 vec3 oc=PC-CP;float ps=max(dot(oc,rd),0.),pd=length(oc-rd*ps);
 float tp=0.,t1=0.,t2=0.,rr=0.;
 bool hp=hitS(CP,rd,PC,PR,tp),hm=hitS(CP,rd,MC,60.,t1),hn=hitS(CP,rd,MD,40.,t2);
 float best=1e9;int kind=0;
 if(h>0.){best=h;kind=1;}
 if(hp&&tp<best){best=tp;kind=2;}
 if(hm&&t1<best){best=t1;kind=3;}
 if(hn&&t2<best){best=t2;kind=4;}
 vec3 col;
 if(kind==1){vec3 p=CP+rd*h;float mm;map(p,mm);col=shade(p,nrm(p),rd,mm);}
 else if(kind==2){
  vec3 p=CP+rd*tp;vec3 pc=planetCol(p,CP);
  float f=fb(vec3(uv.x*2.5,uv.y*.8-T*1.4,T*.12));
  float streak=pow(fb(vec3(uv.x*30.,uv.y*2.,T*4.)),3.);
  vec3 fire=vec3(1.,.4,.1)*(.3+1.7*f)+vec3(1.,.9,.6)*(pow(f,3.)*.9+streak*.6);
  col=mix(pc,fire,PL*.9);
 }
 else if(kind==3)col=moonCol(CP+rd*t1,MC);
 else if(kind==4)col=moonCol(CP+rd*t2,MD);
 else col=sky(rd,pd);
 float rt=ringR(CP,rd,rr);
 if(rt>0.&&(kind==0||rt<best))col=mix(col,vec3(.95,.8,.55),ringA(rr));
 col+=blasts(CP,rd)+vent(CP,rd)+plume(CP,rd);
 vec3 sv=vec3(dot(LD,CM[0]),dot(LD,CM[1]),dot(LD,CM[2]));
 float vis=smoothstep(0.,.2,sv.z);
 vec2 sp=sv.xy/max(sv.z,.01)/1.6,dv=uv-sp;
 float r=length(dv),a=atan(dv.y,dv.x);
 float dirt=smoothstep(.3,.85,fb(vec3(uv*2.2,.5)));
 float halo=.004/(r*r+.004);
 float rays=pow(abs(cos(a*2.)),30.)/(1.+r*18.)+.6*pow(abs(cos(a*3.+.6)),40.)/(1.+r*22.);
 col+=vec3(1.,.86,.62)*vis*(halo*.35+rays*.25)*(.3+1.6*dirt);
 for(int i=0;i<3;i++){
  float fi=float(i+1);
  vec2 gp=mix(sp,-sp,.3*fi+.2);
  col+=vec3(.3,.5,.9)*smoothstep(.06*fi,.04*fi,length(uv-gp))*vis*.05;
 }
 for(int i=0;i<12;i++){
  float fi=float(i);
  vec2 q=vec2(h1(vec3(fi,1.,0.)),h1(vec3(fi,2.,0.)))+vec2(sin(T*.1+fi),cos(T*.13+fi*2.))*.1;
  q=fract(q-.5)-.5;
  vec2 dm=uv-q*vec2(R.x/R.y,1.);
  col+=vec3(.8,.85,.9)*exp(-dot(dm,dm)*900.)*.12;
 }
 col*=1.-.25*dot(uv,uv);
 col=1.-exp(-col*1.2);
 col=pow(col,vec3(.4545));
 float fr=fb(vec3(uv*7.,.3))*.7+vn(vec3(uv*22.,1.))*.3;
 float edge=smoothstep(.15,.75,length(uv*vec2(.8,1.)));
 float thr=.85-FZ*(.3+.6*edge);
 float frost=smoothstep(thr,thr+.05,fr);
 col=mix(col,vec3(.72,.86,1.)*(.4+.5*fr),frost*.5);
 float dp=drops(uv,FZ*edge);
 col=mix(col,vec3(.6,.7,.8)*(.5+.5*fr),dp*.35)+dp*.08;
 col+=vec3(.9,.95,1.)*pow(max(0.,1.-length(uv-vec2(-.35,.4))*1.6),6.)*.05;
 float hd=hand(uv);
 float hm2=smoothstep(.006,-.006,hd)*HD;
 col=mix(col,col*.2+vec3(.02,.03,.05),hm2*.85);
 col+=vec3(.25,.35,.4)*HD*exp(-max(hd,0.)*14.)*.06;
 col+=(h1(vec3(gl_FragCoord.xy,T))-.5)*.025;
 O=vec4(col,1.);
}
