#version 300 es
precision highp float;
// SILENT FLEET: one raymarched frame. Ships are SDF hulls, debris is a tumbling cell field,
// the gas giant is an analytic sphere, blasts are analytic glows (no sound in vacuum).
uniform vec2 R;
uniform float T;
uniform vec3 CP;
uniform mat3 CM;
uniform vec4 EX[6];
uniform float PL;
uniform float SH;
out vec4 O;
#define PC vec3(520.,-380.,1900.)
#define PR 1000.
#define LD normalize(vec3(-.55,.5,.7))

float h1(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 float a=mix(mix(h1(i),h1(i+vec3(1.,0.,0.)),f.x),mix(h1(i+vec3(0.,1.,0.)),h1(i+vec3(1.,1.,0.)),f.x),f.y);
 float b=mix(mix(h1(i+vec3(0.,0.,1.)),h1(i+vec3(1.,0.,1.)),f.x),mix(h1(i+vec3(0.,1.,1.)),h1(i+vec3(1.,1.,1.)),f.x),f.y);
 return mix(a,b,f.z);}
float fb(vec3 p){return .5*vn(p)+.25*vn(p*2.03)+.125*vn(p*4.01)+.0625*vn(p*8.07);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}

// capital-ship hull: long, tapering, nose at +x
float hull(vec3 p){
 float ax=abs(p.x);
 float h=mix(9.,2.4,smoothstep(20.,88.,ax));
 float w=13.-6.*smoothstep(0.,90.,p.x);
 float d=max(max(abs(p.y)-h,abs(p.z)-w),ax-90.);
 d=min(d,bx(p-vec3(-80.,0.,0.),vec3(12.,16.,15.)));
 d=min(d,bx(p-vec3(-18.,13.,0.),vec3(20.,5.,6.)));
 d=min(d,bx(p-vec3(8.,-11.,0.),vec3(30.,3.,11.)));
 d=min(d,bx(p-vec3(96.,0.,0.),vec3(8.,1.2,1.2)));
 return d;}

// a ship, optionally split at time ts: the two halves drift apart slowly
float ship(vec3 p,vec3 c,float a,float ts){
 float s=max(T-ts,0.);
 vec3 o=vec3(0.,.4,.9)*(min(pow(s,1.5)*.6,50.)+.2*s);
 vec3 d=p-c;float rb=125.+length(o);
 if(length(d)>rb)return length(d)-rb;
 vec3 q=ry(-(a+.02*sin(T*.2+a)))*d;
 if(T<ts)return hull(q);
 return min(max(hull(q-o),-q.x),max(hull(q+o),q.x));}

// tumbling debris: one candidate per 60-unit cell, kept inside its cell
float debris(vec3 p){
 const float C=60.;
 vec3 id=floor(p/C+.5),q=p-id*C;
 float bd=max(30.-max(abs(q.x),max(abs(q.y),abs(q.z))),1.);
 float hh=h1(id+vec3(3.1,7.7,1.3));
 if(length(id.xz)>7.||abs(id.y)>1.||hh>.3)return bd;
 vec3 c=(vec3(h1(id+vec3(1.,5.,9.)),h1(id+vec3(4.,2.,6.)),h1(id+vec3(8.,3.,2.)))-.5)*30.;
 float sz=1.2+3.5*h1(id+vec3(6.,6.,6.));
 float an=T*(.25+.5*hh)+hh*6.;
 vec3 r=ry(an)*rz(an*.6)*(q-c);
 return min(bx(r,vec3(sz,sz*.4,sz*.7)),bd);}

float map(vec3 p,out float m){
 float a=ship(p,vec3(40.,0.,420.),.3,34.),
  b=ship(p,vec3(-150.,-40.,560.),1.,1e4),
  c=ship(p,vec3(120.,70.,620.),2.4,57.);
 m=1.;float d=min(a,min(b,c));
 float g=debris(p);
 if(g<d){d=g;m=2.;}
 return d;}

vec3 nrm(vec3 p){
 vec2 e=vec2(.02,0.);float m;
 return normalize(vec3(map(p+e.xyy,m)-map(p-e.xyy,m),map(p+e.yxy,m)-map(p-e.yxy,m),map(p+e.yyx,m)-map(p-e.yyx,m)));}

bool hitP(vec3 ro,vec3 rd,out float t){
 vec3 oc=ro-PC;float b=dot(oc,rd),c=dot(oc,oc)-PR*PR,h=b*b-c;
 if(h<0.)return false;
 t=-b-sqrt(h);return t>0.;}

vec3 planetCol(vec3 p,vec3 rd){
 vec3 n=normalize(p-PC);
 float w=fb(n*2.5+vec3(0.,T*.004,0.));
 float band=.5+.5*sin(n.y*16.+4.*w);
 vec3 c=mix(vec3(.9,.42,.1),vec3(.36,.12,.5),smoothstep(.25,.75,band));
 c*=.55+.7*fb(n*9.);
 float dif=max(dot(n,LD),0.);
 float rim=pow(1.-max(dot(n,-rd),0.),3.);
 return c*(.03+1.25*dif)+vec3(1.,.5,.2)*rim*.6*(.3+dif);}

vec3 sky(vec3 rd,float pd){
 vec3 g=floor(rd*230.);float s=h1(g);
 float st=max(s-.9962,0.)*300.*(.7+.3*sin(T*2.+s*80.));
 vec3 c=vec3(st)*vec3(.85,.9,1.);
 c+=vec3(.06,.02,.1)*fb(rd*2.+vec3(.5))*1.2;
 c+=vec3(1.,.5,.2)*.4*exp(-max(pd-PR,0.)/40.);
 return c;}

// explosions seen as light: fireball, white flash, and a shock ring at the closest approach
vec3 blasts(vec3 ro,vec3 rd){
 vec3 c=vec3(0.);
 for(int i=0;i<6;i++){
  vec4 e=EX[i];float age=T-e.w;
  if(age<0.||age>16.)continue;
  vec3 v=e.xyz-ro;float s=max(dot(v,rd),0.);float dd=length(v-rd*s);
  float Rr=4.+age*22.;
  float core=exp(-age*1.3)*(age<.6?1.6:.9);
  c+=vec3(1.,.62,.28)*core*exp(-dd*dd/(Rr*Rr*.25))*1.3;
  c+=vec3(1.,.8,.5)*exp(-age*4.)*exp(-dd*dd/(Rr*Rr*.02))*3.;
  c+=vec3(.55,.75,1.)*exp(-abs(dd-Rr)*.45)*exp(-age*.22)*.22;
 }
 return c;}

// explosion light falling on the hulls
vec3 flashL(vec3 p,vec3 n){
 vec3 c=vec3(0.);
 for(int i=0;i<6;i++){
  vec4 e=EX[i];float age=T-e.w;
  if(age<0.||age>3.)continue;
  vec3 v=e.xyz-p;float l=length(v);
  c+=vec3(1.,.6,.3)*exp(-age*1.5)*max(dot(n,v/l),0.)*900./(l*l+400.);
 }
 return c;}

vec3 shade(vec3 p,vec3 n,vec3 rd,float m){
 vec3 base=m<1.5?vec3(.16,.17,.2):vec3(.3,.25,.21);
 vec3 tp=normalize(PC-p);
 float sun=max(dot(n,LD),0.),pl=max(dot(n,tp),0.);
 float rim=pow(1.-max(dot(n,-rd),0.),4.);
 vec3 c=base*(.04+.8*sun*vec3(1.,.95,.88)+.9*pl*vec3(1.,.5,.22))+vec3(1.,.5,.2)*rim*.3*pl;
 if(m<1.5)c+=vec3(1.,.78,.42)*step(.93,fract(p.x*.31+p.y*.17))*step(.5,abs(n.z))*.7;
 c+=flashL(p,n);
 return c;}

void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
 uv+=SH*.02*vec2(sin(T*67.)+sin(T*31.),cos(T*53.));
 vec3 rd=normalize(CM*vec3(uv*1.6,1.));
 float m=0.,h=-1.,t=0.;
 for(int i=0;i<120;i++){
  float d=map(CP+rd*t,m);
  if(d<.02){h=t;break;}
  t+=d*.85;
  if(t>2000.)break;
 }
 vec3 oc=PC-CP;float ps=max(dot(oc,rd),0.),pd=length(oc-rd*ps);
 float tp=0.;
 bool hp=hitP(CP,rd,tp);
 vec3 col;
 if(h>0.&&(!hp||h<tp)){
  vec3 p=CP+rd*h;float mm;map(p,mm);
  col=shade(p,nrm(p),rd,mm);
 }else if(hp){
  vec3 p=CP+rd*tp;vec3 pc=planetCol(p,rd);
  float f=fb(vec3(uv.x*2.5,uv.y*.8-T*1.4,T*.12));
  vec3 fire=vec3(1.,.4,.1)*(.3+1.7*f)+vec3(1.,.9,.6)*pow(f,3.)*.9;
  col=mix(pc,fire,PL*.9);
 }else{
  col=sky(rd,pd);
 }
 col+=blasts(CP,rd);
 // the star: a bright source with starburst streaks, lit up by the lens dirt
 vec3 sv=vec3(dot(LD,CM[0]),dot(LD,CM[1]),dot(LD,CM[2]));
 float vis=smoothstep(0.,.2,sv.z);
 vec2 sp=sv.xy/max(sv.z,.01)/1.6,dv=uv-sp;
 float r=length(dv),a=atan(dv.y,dv.x);
 float dirt=smoothstep(.3,.85,fb(vec3(uv*2.2,.5)));
 float halo=.004/(r*r+.004);
 float rays=pow(abs(cos(a*2.)),30.)/(1.+r*18.)+.6*pow(abs(cos(a*3.+.6)),40.)/(1.+r*22.);
 col+=vec3(1.,.86,.62)*vis*(halo*.35+rays*.25)*(.3+1.6*dirt);
 col*=1.-.25*dot(uv,uv);
 col=1.-exp(-col*1.2);
 O=vec4(pow(col,vec3(.4545)),1.);
}
