#version 300 es
precision highp float;
// S: 0 wireframe 4D polytope (nested, recursive zoom), 1 corridor lattice, 2 cube bigger inside, 3 menger descent, 4 hyperbolic plane,
// 5 lattice of 3D slices through one rotating 4D sponge, 6 endless zoom into a twisted Sierpinski vertex, 7 apollonian inversion foam,
// 8 {4,3,5} hyperbolic honeycomb
uniform vec2 R;uniform float T,K,Sn;uniform int S,NL,LV;uniform vec4 P,Q,X;uniform vec3 C;uniform vec4 L[96];uniform vec4 LZ[24];
out vec4 o;
#define PI 3.14159265
const vec3 Y=vec3(.8,1.,.05),M=vec3(1.,.05,.85),D=vec3(1.,.3,.03);
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}
float box2(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float box3(vec3 p,vec3 b){vec3 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,max(d.y,d.z)),0.);}
// thin lines on surfaces: grid in world coordinates, suppressed along the normal axis
float grid(vec3 p,vec3 n,float k,float w){vec3 g=abs(fract(p*k)-.5)*2.;g=1.-g+abs(n)*4.;return smoothstep(w,0.,min(g.x,min(g.y,g.z)));}

// ---------- 0: polytope ----------
vec3 poly(vec2 u){
 float px=2./R.y;vec3 c=vec3(0);
 // background: a square tunnel spiralling inward forever
 vec2 v=rot(log(length(u)+1e-3)*.6+T*.07)*u;float r=max(abs(v.x),abs(v.y)),g=log(r)*2.2-P.w,fw=fwidth(g);
 c+=vec3(.16)*smoothstep(1.5*fw,0.,abs(fract(g+.5)-.5))*smoothstep(0.,.3,r)*P.y;
 float f=P.x;
 for(int k=0;k<3;k++){if(k>=LV)break;
  float a=float(k)-f,sc=pow(2.6,a)*P.y,fd=smoothstep(-1.,-.45,a)*smoothstep(float(LV)-.2,float(LV)-1.,a);
  if(fd<.01||sc<1e-3)continue;
  vec2 q=rot(a*P.z)*u/sc;
  for(int i=0;i<96;i++){if(i>=NL)break;
   vec4 s=L[i];float d=seg(q,s.xy,s.zw)*sc/px,w=LZ[i>>2][i&3];
   c+=fd*w*(smoothstep(1.8,.3,d)+.22*exp(-d*.3))*mix(vec3(1),k==1?M:Y,smoothstep(.7,.9,w)*Q.x);}}
 return c;}

// ---------- 1: corridor lattice ----------
// the corridor has an occupant: an octahedron 14 units ahead, moving exactly as fast as you
float av;
float corr(vec3 p,out vec3 q){
 q=p;q.xy=mod(q.xy+2.,4.)-2.;q.xy=rot(floor(p.z/8.)*PI*.5+p.z*X.x)*q.xy;
 float zz=mod(p.z,8.)-4.,tube=box2(q.xy,vec2(1.)),door=box2(vec2(q.y,zz),vec2(.5,.8)),shaft=box2(vec2(q.x,mod(p.z+4.,16.)-8.),vec2(.45,.6));
 float s=-min(tube,min(door,shaft));
 vec3 a=vec3(q.xy,p.z-C.z-14.);a.xz=rot(T*2.)*a.xz;a.xy=rot(T*1.3)*a.xy;av=(dot(abs(a),vec3(1))-.42)*.577;
 return min(min(s,av),max(abs(mod(p.z,2.)-1.)-.06,-box2(q.xy,vec2(.88))));}
vec3 corridor(vec3 ro,vec3 rd){
 float t=0.,gl=0.;vec3 q;
 for(int i=0;i<110;i++){vec3 p=ro+rd*t;float d=corr(p,q);gl+=exp(-length(q.xy-vec2(0,.93))*30.)*.03;if(d<.001*t||t>60.)break;t+=d*.7;}
 vec3 p=ro+rd*t;vec2 e=vec2(.002,0);
 vec3 n=normalize(vec3(corr(p+e.xyy,q)-corr(p-e.xyy,q),corr(p+e.yxy,q)-corr(p-e.yxy,q),corr(p+e.yyx,q)-corr(p-e.yyx,q)));
 corr(p,q);
 float fog=exp(-t*.09),hl=1./(1.+t*t*.04);
 vec3 c=vec3(.04+.1*max(dot(n,-rd),0.))*hl;
 c+=vec3(1.2)*grid(p,n,2.,.05+t*.006)*fog*(.7+.6*Sn);
 c+=M*smoothstep(.06,.0,length(q.xy-vec2(0,.95)))*(1.2+2.*K)*fog;
 if(av<.01)c=mix(Y,vec3(1),step(.9,max(abs(n.x),abs(n.y))))*(.4+.6*max(dot(n,-rd),0.)+K)*fog;
 float z8=abs(mod(p.z,8.)-4.);c+=Y*smoothstep(.85,.8,z8)*smoothstep(.75,.8,z8)*fog*1.5;
 return c*step(t,59.)+M*gl*(.6+K);}

// ---------- 2: the cube that is bigger inside ----------
vec2 ibox(vec3 ro,vec3 rd,vec3 b){vec3 m=1./rd,n=m*ro,k=abs(m)*b,t1=-n-k,t2=-n+k;return vec2(max(max(t1.x,t1.y),t1.z),min(min(t2.x,t2.y),t2.z));}
float hall(vec3 q){vec2 c=mod(q.xz,40.)-20.;
 return min(min(-box3(q-vec3(0,60,0),vec3(400,100,400)),box2(c,vec2(3.))),box3(q-vec3(0,-30,150),vec3(10.)));}
// the small cube standing in the hall is the same portal again: up to three halls deep
const vec3 CN=vec3(0,-30,150);
float cframe(vec3 a){return smoothstep(.95,.985,min(min(max(a.x,a.y),max(a.y,a.z)),max(a.z,a.x)));}
vec3 inside(vec3 q,vec3 rd){vec3 c=vec3(0);float m=1.;
 for(int k=0;k<3;k++){float t=0.;
  for(int i=0;i<120;i++){float d=hall(q+rd*t);if(d<.002*t||t>1500.)break;t+=d;}
  vec3 p=q+rd*t;float fog=exp(-t*.0022);
  if(box3(p-CN,vec3(10))<.1&&k<2){c+=(vec3(1)+Y*K)*cframe(abs(p-CN)/10.)*fog*m;q=(p-CN)*4.;m*=.85*fog;continue;}
  vec2 e=vec2(.05,0);
  vec3 n=normalize(vec3(hall(p+e.xyy)-hall(p-e.xyy),hall(p+e.yxy)-hall(p-e.yxy),hall(p+e.yyx)-hall(p-e.yyx)));
  c+=m*(vec3(.03+.08*max(n.y,0.))+vec3(.9)*grid(p,n,.1,.04+t*.00012)*fog+Y*.4*exp(-abs(p.y+40.)*.3)*fog*(.5+K));break;}
 return c;}
vec3 cube(vec3 ro,vec3 rd){
 if(max(abs(ro.x),max(abs(ro.y),abs(ro.z)))<1.)return inside(ro*40.,rd);
 vec2 h=ibox(ro,rd,vec3(1));vec3 c=vec3(0);
 if(rd.y<0.){float tf=(-1.-ro.y)/rd.y;vec3 p=ro+rd*tf;c=vec3(.7)*grid(p,vec3(0,1,0),1.,.03+tf*.004)*exp(-tf*.06);}
 c+=vec3(.08)*h2(floor(rd.xy*300.))*step(.97,h2(floor(rd.xy*300.)+3.));
 if(h.x<h.y&&h.x>0.){vec3 p=ro+rd*h.x,a=abs(p);
  c=inside(p*40.,rd)+(vec3(1)+Y*K)*cframe(a)*1.4;}
 return c;}

// ---------- 3: menger descent (KIFS sponge lattice, each level rotated about the flight axis) ----------
float mg(vec3 p,out float lv){
 float z=exp2(P.z*1.585),d=-1.,s=1.;p/=z;lv=0.;
 for(int i=0;i<4;i++){p.xy=rot(P.w)*p.xy;vec3 a=mod(p*s,2.)-1.;s*=3.;vec3 r=abs(1.-3.*abs(a));
  float c=(min(max(r.x,r.y),min(max(r.y,r.z),max(r.z,r.x)))-1.)/s;if(c>d){d=c;lv=float(i);}}
 return d*z;}
vec3 menger(vec3 ro,vec3 rd){
 float t=0.,lv,st=0.;
 for(int i=0;i<120;i++){float d=mg(ro+rd*t,lv);if(d<.0007*t||t>24.)break;t+=d;st++;}
 vec3 p=ro+rd*t;vec2 e=vec2(.0006*t+.0002,0);
 vec3 n=normalize(vec3(mg(p+e.xyy,lv)-mg(p-e.xyy,lv),mg(p+e.yxy,lv)-mg(p-e.yxy,lv),mg(p+e.yyx,lv)-mg(p-e.yyx,lv)));
 mg(p,lv);
 float fog=exp(-t*.28),li=max(dot(n,normalize(vec3(.3,.5,-.6))),0.)*.7+max(dot(n,-rd),0.)*.5;
 vec3 c=vec3(step(.55,li)*.85+li*.15)*(1.-st/150.);
 c=mix(c,D*(1.3+2.*K),step(abs(lv-Q.w),.1)*.85);
 vec3 cl=floor(p*48.);c+=D*step(.94,h2(cl.xy+cl.z*7.+floor(T*8.)))*step(.5,1.-abs(dot(n,rd)))*.9;
 c+=vec3(1)*smoothstep(.3,.9,length(fwidth(n)))*.8;
 return c*fog*step(t,23.);}

// ---------- 4: hyperbolic plane {p,q}, falling through it by Moebius translation ----------
vec2 cm(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
vec2 cdv(vec2 a,vec2 b){return vec2(a.x*b.x+a.y*b.y,a.y*b.x-a.x*b.y)/dot(b,b);}
vec3 hyp(vec2 u){
 vec2 z=u*1.02;float inv=0.,l;
 if(P.w>.5){z=vec2(u.x,u.y+.45);if(z.y<0.){z.y=-z.y;inv=1.;}z=cdv(z-vec2(0,.6),z+vec2(0,.6));}
 l=dot(z,z);if(l>1.){z/=l;inv=1.;}
 vec2 a=Q.xy;z=cdv(z+a,vec2(1,0)+cm(vec2(a.x,-a.y),z));z=rot(P.z)*z;
 float A=PI/P.x,B=PI/P.y,cx=1./sqrt(1.-sin(A)*sin(A)/(cos(B)*cos(B))),r=cx*sin(A)/cos(B),par=0.,cnt=0.;
 vec2 nb=vec2(-sin(A),cos(A));
 for(int i=0;i<60;i++){bool ch=false;
  if(z.y<0.){z.y=-z.y;par++;ch=true;}
  float dd=dot(z,nb);if(dd>0.){z-=2.*dd*nb;par++;ch=true;}
  vec2 w=z-vec2(cx,0);float ll=dot(w,w);if(ll<r*r){z=vec2(cx,0)+w*r*r/ll;par++;cnt++;ch=true;}
  if(!ch)break;}
 float ed=abs(length(z-vec2(cx,0))-r),fw=fwidth(ed)+1e-4,sym=min(abs(z.y),abs(dot(z,nb)));
 float pc=mod(par,2.),tile=mod(floor(par*.5)+cnt,2.);
 vec3 c=vec3(pc*.88);
 c=mix(c,inv>.5?M:Y,smoothstep(2.*fw,0.,ed-fw*.5));
 c=mix(c,D,step(.5,tile)*step(.5,pc)*Sn*step(mod(cnt,3.),.5));
 c=mix(c,vec3(1.-pc),smoothstep(1.2*fwidth(sym),0.,sym)*.35);
 float rr=P.w>.5?abs(u.y+.45):abs(length(u*1.02)-1.);c=mix(c,vec3(0),smoothstep(.02,0.,rr));
 return c;}


// shared: march an SDF and shade it hard (posterized key light, derivative edges, accent where m(p) flags it)
#define MARCH(F,N,TM,EPS) float t=0.,st=0.;for(int i=0;i<N;i++){float d=F(ro+rd*t);if(d<EPS*t||t>TM)break;t+=d;st++;}vec3 p=ro+rd*t;vec2 e=vec2(.0005*t+.0001,0);vec3 n=normalize(vec3(F(p+e.xyy)-F(p-e.xyy),F(p+e.yxy)-F(p-e.yxy),F(p+e.yyx)-F(p-e.yyx)));
vec3 hard(vec3 n,vec3 rd,float st,float N){float li=max(dot(n,normalize(vec3(.4,.7,-.5))),0.)*.75+max(dot(n,-rd),0.)*.4;
 return vec3(step(.5,li)*.8+li*.2)*(1.-st/N)+vec3(1)*smoothstep(.3,.9,length(fwidth(n)))*.9;}

// ---------- 5: each lattice cell is a different 3D slice through the same rotating 4D sponge ----------
float id5;
float s4(vec3 p){vec3 c=floor(p/4.+.5);p-=c*4.;id5=dot(c,vec3(1,3,7));
 vec4 q=vec4(p,fract(dot(c,vec3(.31,.17,.23))+P.z)*2.4-1.2);
 q.xw=rot(X.x)*q.xw;q.yz=rot(X.y)*q.yz;q.zw=rot(X.z)*q.zw;q.xy=rot(X.w)*q.xy;
 vec4 a=abs(q)-.8,b=abs(q);float bx=min(max(max(a.x,a.y),max(a.z,a.w)),0.)+length(max(a,0.));
 float cr=min(min(min(max(b.x,b.y),max(b.x,b.z)),min(max(b.x,b.w),max(b.y,b.z))),min(max(b.y,b.w),max(b.z,b.w)))-.3;
 return max(bx,-cr)*.7;}
vec3 slice4(vec3 ro,vec3 rd){MARCH(s4,100,50.,.001)
 s4(p);vec3 c=hard(n,rd,st,130.);
 c=mix(c,Y*(1.2+K),step(.5,Sn)*step(fract(id5*.2+Q.w*.2),.19)*.9);
 return c*exp(-t*.07)*step(t,49.);}

// ---------- 6: falling into a vertex of a twisted Sierpinski tetrahedron (self-similar, so the zoom never ends) ----------
mat3 rax(vec3 k,float a){float c=cos(a),s=sin(a);return mat3(c)+s*mat3(0,k.z,-k.y,-k.z,0,k.x,k.y,-k.x,0)+(1.-c)*outerProduct(k,k);}
mat3 R6;float lv6;
float sp(vec3 p){float s=1.;lv6=0.;vec3 V=vec3(1);
 for(int i=0;i<11;i++){if(p.x+p.y<0.){p.xy=-p.yx;lv6=float(i);}if(p.x+p.z<0.){p.xz=-p.zx;lv6=float(i);}if(p.y+p.z<0.){p.zy=-p.yz;lv6=float(i);}
  p=V+2.*(R6*(p-V));s*=2.;}
 return (max(max(-p.x-p.y-p.z,p.x+p.y-p.z),max(-p.x+p.y+p.z,p.x-p.y+p.z))-1.)/(1.732*s);}
vec3 vertex(vec2 u){
 vec3 k=vec3(.57735);R6=rax(k,P.w);
 float dz=.9*exp2(-P.z);vec3 ro=vec3(1)+k*dz,f=-k,r=normalize(cross(vec3(0,1,0),f)),up=cross(f,r);
 u=rot(P.x+P.w*P.z)*u;vec3 rd=normalize(u.x*r+u.y*up+P.y*f);
 MARCH(sp,110,8.,.0004)
 sp(p);vec3 c=hard(n,rd,st,140.);
 c=mix(c,D*(1.3+2.*K),step(abs(mod(lv6,4.)-Q.w),.1)*.8);
 return c*step(t,7.9)+vec3(.05)*smoothstep(.02,0.,abs(fract(atan(u.y,u.x)*3./PI+T*.2)-.5)*.1)*step(7.9,t);}

// ---------- 7: apollonian foam (sphere inversions folded into a lattice) ----------
float tr7;
float apo(vec3 p){float sc=1.;tr7=9.;for(int i=0;i<8;i++){p=-1.+2.*fract(.5*p+.5);float r2=dot(p,p);tr7=min(tr7,r2);float k=P.w/r2;p*=k;sc*=k;}return .25*abs(p.y)/sc;}
vec3 foam(vec3 ro,vec3 rd){MARCH(apo,120,6.,.0006)
 apo(p);vec3 c=hard(n,rd,st,150.);
 c=mix(c,(Q.w>.5?M:Y)*(1.1+1.5*K),smoothstep(.12,.08,abs(tr7-.5-.3*sin(T*2.)))*.9);
 return c*exp(-t*.5);}

// ---------- 8: the {4,3,5} honeycomb in the Poincare ball: right-angled-looking cubes, five around every edge ----------
// the camera sits at the ball's centre; the world is moved by a Moebius translation along x, wrapping after one cell
float lv8;
float hb(vec3 x){
 vec3 a=vec3(P.z,0,0);float ax=dot(a,x),aa=dot(a,a),xx=dot(x,x),dn=1.+2.*ax+aa*xx,s=(1.-aa)/dn;
 vec3 p=((1.+2.*ax+xx)*a+(1.-aa)*x)/dn;p.yz=rot(P.w)*p.yz;
 const float r=1.799,d=2.058;lv8=0.;
 for(int i=0;i<24;i++){p=abs(p);if(p.x<p.y)p.xy=p.yx;if(p.y<p.z)p.yz=p.zy;if(p.x<p.y)p.xy=p.yx;
  vec3 w=p-vec3(d,0,0);float l=dot(w,w);if(l>=r*r)break;float k=r*r/l;p=vec3(d,0,0)+w*k;s*=k;lv8++;}
 vec3 w=p-vec3(d,0,0);
 return (length(vec2(length(w)-r,(p.x-p.y)*.7071))-.022*(1.-dot(p,p)))/s*.6;}
vec3 honey(vec2 u){vec3 ro=vec3(0),rd=normalize(vec3(P.y,rot(P.x)*u)),c=vec3(0);
 float t=0.,g=0.;
 for(int i=0;i<110;i++){float d=hb(rd*t);g+=.01/(1.+d*d*4e4)*(1.-t);if(d<.0005*t+1e-5||t>.995)break;t+=d;}
 vec3 gc=mod(lv8,2.)>.5?M:Y;
 if(t<.995){vec3 p=rd*t;vec2 e=vec2(.0003*t+1e-5,0);
  vec3 n=normalize(vec3(hb(p+e.xyy)-hb(p-e.xyy),hb(p+e.yxy)-hb(p-e.yxy),hb(p+e.yyx)-hb(p-e.yyx)));
  hb(p);c=hard(n,rd,0.,1.);if(mod(lv8,5.)==Q.w)c=gc*(1.4+2.*K);c*=sqrt(1.-t)*1.4;}
 return c+gc*g*(.4+Sn);}

vec3 cam(vec2 u,out vec3 ro){ro=C;vec3 f=normalize(Q.xyz-C),r=normalize(cross(vec3(0,1,0),f)),up=cross(f,r);
 u=rot(P.x)*u;return normalize(u.x*r+u.y*up+P.y*f);}
void main(){
 vec2 u=(2.*gl_FragCoord.xy-R)/R.y;vec3 c,ro,rd;
 if(S==0)c=poly(u);
 else if(S==4)c=hyp(u);
 else if(S==6)c=vertex(u);
 else if(S==8)c=honey(u);
 else{ro=C;rd=normalize(vec3(rot(P.x)*u,P.y)+vec3(Q.xy,0));if(S==1)c=corridor(ro,rd);else if(S==2)c=cube(ro,cam(u,ro));else if(S==3)c=menger(ro,rd);else if(S==5)c=slice4(ro,cam(u,ro));else c=foam(ro,cam(u,ro));}
 o=vec4(c,1);}
