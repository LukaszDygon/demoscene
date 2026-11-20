#version 300 es
precision highp float;
uniform vec2 R;
uniform float T;
uniform vec3 C,G,K;
// A: reveal light, spine glow, jaw open, head raise
// B: breath, seconds since shockwave, logo, fade
// D: yaw, walk, flash, flicker
uniform vec4 A,B,D;
uniform sampler2D X;
out vec4 Q;
int M,N;
float gS;
vec3 MW,MD,L0=vec3(.11,.45,-.89);
float H(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cp(vec3 p,vec3 a,vec3 b,float r,float s){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-mix(r,s,h);}
float sm(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
// cleared lots: plaza, park strip, boulevard, tunnel block (same test in main.js)
bool clr(vec2 c){return length(c-vec2(0,-230))<44.||c.x>29.&&c.x<51.&&c.y>-100.&&c.y<-20.||abs(c.y+70.)<6.&&c.x>-6.&&c.x<51.||c.y>-180.&&c.y<-100.;}
vec3 tsz(vec2 c){return vec3(2.6+1.2*H(c),3.+8.*pow(H(c+7.1),1.5),2.6+1.2*H(c+3.3));}
float twr(vec3 p,vec2 c){vec2 o=c*10.+5.;if(clr(o))return 9.;vec3 s=tsz(c),l=vec3(p.x-o.x,p.y-s.y,p.z-o.y);float d=bx(l,s);if(H(c+5.)>.5)d=min(d,bx(l-vec3(0,s.y*1.3,0),s*vec3(.6,.3,.6)));return d;}
// dorsal plates along segment a->b (in kaiju units)
float spn(vec3 p,vec3 a,vec3 b,float h0){vec3 x=normalize(b-a),pa=p-a;float L=length(b-a),h=dot(pa,x),v=dot(pa,vec3(0,x.z,-x.y)),k=floor(h/.045),u=h-k*.045-.0225,ph=h0*sin(3.14*clamp(h/L,0.,1.))*(.7+.6*H(vec2(k,a.y)))+.01,f=clamp(v/ph,0.,1.);
return max(max(max(abs(u)-.021*(1.-f),max(-v,v-ph))*.7,abs(p.x)-.004-.012*(1.-f)),max(-h,h-L));}
// the kaiju: built facing +z, 1 unit = 34 world units
float kj(vec3 p){
vec3 q=p-K;q.xz*=r2(D.x);q/=34.;
float w=sin(T*1.5708),lf=max(0.,w*sign(q.x))*D.y,d,e;
vec3 l=vec3(abs(q.x),q.yz),kn=vec3(.17,.24,.06)+lf*vec3(0,.06,.05),ft=vec3(.16,.04,-.02)+lf*vec3(0,.08,.07);
d=sm(cp(l,vec3(.1,.44,-.04),kn,.1,.08),cp(l,kn,ft,.075,.06),.03);
d=sm(d,cp(l,ft,ft+vec3(0,-.01,.12),.05,.035),.03);
q.y-=.012*D.y*abs(w);
float br=.005*sin(T*2.);
d=sm(d,cp(q,vec3(0,.44,-.06),vec3(0,.7,.06),.17+br,.13+br),.06);
l=vec3(abs(q.x),q.yz);
vec3 e1=vec3(.19,.55,.17);
d=sm(d,sm(cp(l,vec3(.11,.64,.1),e1,.045,.033),cp(l,e1,vec3(.15,.5+.03*sin(T*1.7),.27),.033,.02),.02),.03);
vec3 t=q;t.x-=sin(T*1.1+q.z*3.)*max(0.,-q.z-.15)*.25;
d=sm(d,cp(t,vec3(0,.4,-.16),vec3(0,.24,-.45),.14,.09),.05);
d=sm(d,cp(t,vec3(0,.24,-.45),vec3(0,.08,-.75),.09,.05),.03);
d=sm(d,cp(t,vec3(0,.08,-.75),vec3(0,.03,-1.),.05,.012),.02);
vec3 h=q-vec3(0,.72,.08);h.yz*=r2(A.w*.6);
d=sm(d,cp(h,vec3(0),vec3(0,.13,.07),.1,.075),.04);
d=sm(d,cp(h,vec3(0,.15,.05),vec3(0,.16,.17),.07,.055),.03);
d=sm(d,cp(h,vec3(0,.15,.12),vec3(0,.13,.27),.05,.03),.02);
vec3 j=h-vec3(0,.11,.1);j.yz*=r2(-A.z*.6);
d=sm(d,cp(j,vec3(0),vec3(0,-.005,.16),.04,.024),.015);
vec3 hx=vec3(abs(h.x),h.yz);
d=min(d,cp(hx,vec3(.04,.2,.1),vec3(.07,.25,-.01),.016,.003));
N=3;
e=length(hx-vec3(.048,.175,.16))-.014;if(e<d){d=e;N=5;}
e=min(spn(t,vec3(0,.12,-.74),vec3(0,.42,-.24),.06),spn(q,vec3(0,.34,-.26),vec3(0,.8,.04),.1));
gS=min(gS,e*34.);
if(e<d){d=e;N=4;}
return d*34.;}
float map(vec3 p){
float d=p.y,e=max(bx(p-vec3(0,7,-138),vec3(30,7,38)),-bx(p-vec3(0,2.5,-138),vec3(3,2.5,40)));M=0;
if(e<d){d=e;M=2;}
if(p.y<29.){vec2 c=floor(p.xz/10.-.5);e=6.;for(int i=0;i<4;i++)e=min(e,twr(p,c+vec2(i&1,i>>1)));if(e<d){d=e;M=1;}}else d=min(d,p.y-28.6);
e=length(p-K-vec3(0,15,0))-38.;
if(e<d){e=kj(p);if(e<d){d=e;M=N;}}
return d;}
float mr(vec3 o,vec3 r,int n){float t=.1,d;for(int i=0;i<n;i++){d=map(o+r*t);if(d<.002*t)return t;t+=d*.8;if(t>360.)return 999.;}return t;}
vec3 nm(vec3 p){vec2 e=vec2(.005,-.005);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
vec3 sky(vec3 r){float y=max(r.y,0.),m=dot(r,L0);
return mix(vec3(.28,.06,.22),vec3(.005,.005,.03),pow(y,.35))+vec3(.9,.85,1)*(smoothstep(.9985,.999,m)*2.+pow(max(m,0.),400.)*.5+pow(max(m,0.),20.)*.08)+step(.997,H(floor(vec2(atan(r.x,r.z),r.y)*300.)))*y;}
// glow of a ray passing a light shaft from a along d (length L, width w), occluded at scene depth tm
float lg(vec3 o,vec3 r,float tm,vec3 a,vec3 d,float L,float w){vec3 q=o-a;float b=dot(r,d),e=dot(d,q),s=clamp((e-b*dot(r,q))/max(1.-b*b,1e-4),0.,L);
return exp(-length(o+r*clamp(dot(a+d*s-o,r),0.,tm)-a-d*s)/(w*(1.+s*.03)));}
vec3 sh(vec3 o,vec3 r,float t){
if(t>900.)return sky(r);
int m=M;vec3 p=o+r*t,n=nm(p),c,kl=K+vec3(0,22,0)-p;
float kd=length(kl),sk=exp(-abs(length(p.xz-K.xz)-B.y*40.)*.3)*exp(-B.y*.5);
if(m==0){vec2 g=abs(fract(p.xz/10.+.5)-.5)*10.,q=abs(fract(p.xz*.25)-.5);
c=vec3(.01,.01,.02)+vec3(1,.15,.6)*exp(-abs(min(g.x,g.y)-1.3)*12.)*.5+vec3(1,.7,.3)*step(abs(p.x),.08)*step(.5,fract(p.z*.25))*.4+vec3(.3,.8,1)*sk*2.;
if(length(p.xz-vec2(0,-230))<44.)c+=vec3(.1,.5,1)*exp(-min(q.x,q.y)*40.)*.25;}
if(m==1){vec2 cc=floor((p.xz-n.xz*.1)/10.),o2=cc*10.+5.;
vec3 s=tsz(cc),l=vec3(p.x-o2.x,p.y-s.y,p.z-o2.y),a=abs(abs(l)-s);
float ed=a.x+a.y+a.z-min(a.x,min(a.y,a.z))-max(a.x,max(a.y,a.z)),hh=H(cc),u=dot(l.xz,vec2(-n.z,n.x)),sd=step(abs(n.y),.5),b0=3.+8.*H(cc+2.);
vec3 nc=hh<.33?vec3(0,.9,1):hh<.66?vec3(1,.1,.6):vec3(.6,.25,1);
vec2 w=vec2(u*1.3,p.y*.9),wi=floor(w),wf=fract(w),bu=vec2(u/1.2+.5,(b0+9.-p.y)/9.);
float wn=step(.3,wf.x)*step(wf.x,.7)*step(.35,wf.y)*step(wf.y,.75)*step(.55,H(wi+cc*7.))*sd;
if(B.y<4.)wn*=step(.4,H(wi+floor(T*9.)));
c=vec3(.015,.015,.035)+wn*mix(vec3(1,.6,.3),vec3(.4,.7,1),H(wi+cc))*.4+nc*(exp(-ed*6.)*1.5+exp(-abs(fract(p.y/6.)-.5)*60.)*.4*sd);
if(H(cc+n.xz+9.)>.35&&sd>0.&&bu.x>0.&&bu.x<1.&&bu.y>0.&&bu.y<1.&&b0+9.<2.*s.y)
c=(H(cc+n.xz+1.)>.5?vec3(1,.2,.5):vec3(.2,1,.8))*(.12+texture(X,vec2((floor(H(cc+n.xz)*8.)+bu.x+(B.y<3.?sin(p.y*20.+T*40.)*.15:0.))/16.,bu.y)).r*2.2);
c+=vec3(.2,.7,1)*A.y*max(0.,dot(n,kl/kd))*300./(kd*kd+300.)*.5+vec3(.4,.8,1)*sk*(wn+.2)*2.;}
if(m==2){if(abs(p.x)<3.1&&p.y<5.1&&p.z>-176.&&p.z<-100.)
c=vec3(.02,.02,.03)+vec3(1,.8,.5)*step(fract(p.z*.25),.12)*step(4.9,p.y)*1.5*(1.-D.w*step(.5,H(vec2(floor(T*20.)))))+vec3(0,.8,1)*exp(-abs(p.y-1.)*20.)+vec3(1,.1,.6)*exp(-abs(p.y-4.)*20.);
else{vec2 bu=vec2((p.x+14.)/28.,(12.-p.y)/5.);
c=vec3(.015,.015,.035)+vec3(1,.1,.6)*exp(-abs(fract(p.y/3.)-.5)*40.)*.3;
if(n.z>.5&&bu.x>0.&&bu.x<1.&&bu.y>0.&&bu.y<1.)c=vec3(1,.25,.1)*(.1+texture(X,vec2(.5+bu.x*.5,(192.+bu.y*64.)/512.)).r*2.5);}}
if(m>2){vec3 k=p-K;
c=vec3(.1,.13,.11)*(.75+.25*sin(k.x*2.+sin(k.y*2.3)*2.)*sin(k.z*2.+k.y*1.7))*(vec3(.6,.7,1)*max(0.,dot(n,normalize(vec3(.3,.5,0)-r)))*.12*A.x+vec3(.9,.2,.6)*max(0.,-n.y)*.25*A.x+.01+vec3(.3,.8,1)*B.x*.15)
+pow(1.-max(0.,dot(n,-r)),8.)*vec3(.2,.7,1)*(.4+1.8*A.x)+vec3(1,.5,.2)*A.z*2.*exp(-length(p-MW)*.4);
if(m==4)c=vec3(.3,.9,1)*A.y*(1.3+.7*sin(p.y*.6-T*8.)*(.3+B.x));
if(m==5)c=vec3(1,.3,.05)*5.;}
return c;}
void main(){
vec2 u=(2.*gl_FragCoord.xy-R)/R.y;
vec3 o=C,w=normalize(G-C),x=normalize(cross(w,vec3(0,1,0))),r=normalize(u.x*x+u.y*cross(x,w)+1.5*w),c,a;
MW=vec3(0,.12,.27);MW.yz*=r2(-A.w*.6);MW+=vec3(0,.72,.08);MW*=34.;MW.xz*=r2(-D.x);MW+=K;
MD=vec3(0,0,1);MD.yz*=r2(-A.w*.6);MD.xz*=r2(-D.x);
gS=1e3;
float t=mr(o,r,120),g=gS,tm=min(t,400.),l;
int m=M;
// kaiju pixels get less haze and glow so the silhouette separates
float kf=m>2?.12:1.;
c=sh(o,r,t);
vec3 p=o+r*t;
if(m==0&&t<900.){vec3 q=reflect(r,vec3(0,1,0));q.xz+=(vec2(H(floor(p.xz*6.)),H(floor(p.zx*6.)))-.5)*.03;c+=sh(p,q,mr(p,q,50))*.35;}
if(t<900.)c=mix(c,vec3(.22,.06,.2),(1.-exp(-t*.006))*kf);
c+=vec3(.2,.7,1)*kf*A.y*exp(-g*1.2)*.7*exp(-length(K-o)*.004);
for(int i=0;i<2;i++){a=vec3(i>0?36.:-34.,0,i>0?-250.:-215.);c+=vec3(.5,.6,.8)*.3*kf*max(A.x-.25,0.)*lg(o,r,tm,a,normalize(K+vec3(sin(T*.7+float(i)*2.)*6.,24,0)-a),150.,.9);}
c+=B.x*(vec3(.6,.95,1)*lg(o,r,tm,MW,MD,90.,.6)*2.5+vec3(.1,.5,1)*lg(o,r,tm,MW,MD,90.,4.)*.6);
if(B.z>0.){l=(-232.-o.z)/r.z;p=o+r*l;vec2 v=(p.xy-vec2(-24,46))/vec2(28,10.5);
if(l>0.&&l<tm){v.x+=(H(vec2(floor(v.y*12.),floor(T*20.)))-.5)*.25*B.x*step(.6,H(vec2(floor(T*14.))));
if(abs(v.x)<1.&&abs(v.y)<1.){vec2 s=vec2(.75+v.x*.25,(.5-v.y*.5)*.375);float k=.003+.01*B.x;
c+=(vec3(texture(X,s+vec2(k,0)).r,texture(X,s).r,texture(X,s-vec2(k,0)).r)*mix(vec3(1,.2,.8),vec3(.2,.9,1),v.y*.5+.5)*(.75+.25*sin(p.y*5.-T*6.))*2.5+vec3(.05,.15,.3))*B.z;}
c+=vec3(.2,.4,1)*.15*B.z*exp(-length(max(abs(v)-1.,0.))*2.);}}
c=c*B.w+vec3(.4,.8,1)*D.z;
c=1.-exp(-c*1.5);
c*=1.-.1*dot(u,u);
Q=vec4(pow(c,vec3(.55))+H(gl_FragCoord.xy+T)*.02,1);}
