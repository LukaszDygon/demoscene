#version 300 es
precision highp float;
uniform float T;uniform vec2 R;out vec4 O;
const vec3 SUN=vec3(-.5,.4,.77);
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
vec2 mn(vec2 r,float d,float id){return d<r.x?vec2(d,id):r;}
// timeline in seconds; bar n (1-based) starts at (n-1)*2.4 s
vec2 TC(float t){float u=max(t-19.2,0.);return vec2(20.-.6*u,85.-1.2*u);}   // tornado centre x,z
float FA(float t){return smoothstep(19.2,23.,t)*(1.-smoothstep(43.,47.,t));} // funnel strength
float FL(float t){return step(.92,hs(vec2(floor(t*3.),11.)))*exp(-fract(t*3.)*7.)*smoothstep(8.,18.,t)*(1.-smoothstep(47.,52.,t));}
// buildings rest, then get sucked up and orbit the funnel
vec3 OP(vec3 b,float ti,float ph,float t){vec2 c=TC(t);float u=max(t-ti,0.),s=smoothstep(ti,ti+3.,t);
 return mix(b,vec3(c.x+7.*cos(u*1.3+ph),u*u*.6+4.,c.y+7.*sin(u*1.3+ph)),s);}
// scene objects: 1 barn, 2 silo, 3 water tower, 4 church, 5 pickup, 6 radio (aftermath only); ground is analytic
vec2 M(vec3 p,float t){
 vec3 a=OP(vec3(-4.,0.,72.),26.,0.,t),b=OP(vec3(2.,0.,76.),28.,2.,t),c=OP(vec3(7.,0.,68.),31.,4.,t),
  d=OP(vec3(-12.,0.,80.),34.,1.,t),e=OP(vec3(-1.,0.,64.),22.,3.,t);
 vec2 r=vec2(1e3,0.);
 r=mn(r,bx(p-a-vec3(0.,2.5,0.),vec3(3.,2.5,4.5)),1.);
 r=mn(r,max(length((p-b).xz)-1.6,abs(p.y-b.y-4.5)-4.5),2.);
 r=mn(r,min(bx(p-c-vec3(0.,5.,0.),vec3(.6,5.,.6)),max(length((p-c).xz)-2.6,abs(p.y-c.y-11.5)-1.5)),3.);
 r=mn(r,min(bx(p-d-vec3(0.,3.,0.),vec3(4.,3.,6.)),bx(p-d-vec3(0.,8.,0.),vec3(.5,2.,.5))),4.);
 r=mn(r,bx(p-e-vec3(0.,.9,0.),vec3(1.1,.9,2.4)),5.);
 r=mn(r,bx(p-vec3(3.,.25,50.),vec3(.35,.25,.2))+(t>48.?0.:1e3),6.);
 return r;}
// funnel density: swirling arms, dark dust and debris band
float FD(vec3 p,float t){vec2 c=TC(t);vec3 q=p-vec3(c.x,0.,c.y);
 float h=q.y,r=length(q.xz),w2=.8+.12*h,a=atan(q.z,q.x)+h*.2-t*2.5;
 float w=(1.-smoothstep(w2-.5,w2+1.,r))*smoothstep(0.,4.,h)*(1.-smoothstep(30.,44.,h));
 return w*(.55+.45*sin(a*3.+r)*sin(h*.6-t*3.))*FA(t);}
vec3 SC(vec2 q,float t){
 float st=smoothstep(8.,18.,t)*(1.-smoothstep(47.,52.,t)),
  kn=smoothstep(37.5,38.5,t)*(1.-step(42.5,t)),
  roll=1.5*smoothstep(38.4,40.6,t)*(1.-step(43.2,t)),
  sA=smoothstep(44.,56.,t),fl=FL(t),si=mix(.3,1.1,sA)*(1.-.4*st);
 vec2 sh=vec2(sin(t*7.3)+.6*sin(t*13.1),sin(t*5.9)+.6*sin(t*10.7))*(.008+.03*st+.08*kn);
 vec2 tc=TC(t);
 // handheld camera: walks up the road, runs into the chase, then gets knocked over
 float z=t<24.?.6*t:t<38.?14.4+(t-24.)*1.6:36.8+.3*min(t-38.,10.);
 vec3 ro=vec3((.4+2.*st)*sin(t*.45)+sh.x,1.7+sh.y,z);
 float yw=mix(0.,atan(tc.x-ro.x,tc.y-ro.z),smoothstep(9.,20.,t));
 vec3 f=normalize(vec3(sin(yw),-.05,cos(yw))),r=normalize(cross(vec3(0.,1.,0.),f)),u=cross(f,r);
 vec3 r2=r*cos(roll)+u*sin(roll);u=u*cos(roll)-r*sin(roll);r=r2;
 vec3 rd=normalize(f*1.5+q.x*r+q.y*u);
 // sky: green-grey storm, planar cloud deck, dark wall cloud over the storm, sunbeams once it clears
 vec3 hor=vec3(.62,.66,.56);
 vec3 sk=mix(hor,vec3(.3,.4,.38),smoothstep(0.,.45,rd.y));
 float tcl=(45.-ro.y)/max(rd.y,.02);
 float cl=smoothstep(.45,.85,fb((ro+rd*tcl).xz*.03+vec2(t*.03,0.)))*mix(.85,.2,sA)*smoothstep(.02,.2,rd.y);
 sk=mix(sk,vec3(.22,.26,.24),cl);
 sk=mix(sk,vec3(.12,.15,.14),smoothstep(.9,.985,dot(rd,normalize(vec3(tc.x,20.,tc.y))))*(.5+.5*fb(rd.xz*30.))*(1.-sA)*.8);
 float sd=max(dot(rd,SUN),0.);
 sk+=sA*(pow(sd,8.)*vec3(1.,.9,.7)*.6+pow(sd,3.)*max(0.,sin(atan(rd.x,rd.y)*9.+t*.3))*.25)+fl*.35;
 // march the solids (ground is a plane)
 float tg=rd.y<-1e-3?-ro.y/rd.y:1e3,tt=.05;vec2 h=vec2(-1.,0.);
 for(int i=0;i<100;i++){if(tt>min(tg,260.))break;vec2 d=M(ro+rd*tt,t);if(d.x<.005*tt){h=vec2(tt,d.y);break;}tt+=d.x*.85;}
 float mt=-1.,mid=0.;
 if(h.x>0.&&h.x<tg){mt=h.x;mid=h.y;}else if(tg<260.)mt=tg;
 vec3 col=sk;
 if(mt>0.){
  vec3 P=ro+rd*mt,n=vec3(0.,1.,0.),ac;
  if(mid>0.){vec2 e=vec2(.003,0.);n=normalize(vec3(M(P+e.xyy,t).x-M(P-e.xyy,t).x,M(P+e.yxy,t).x-M(P-e.yxy,t).x,M(P+e.yyx,t).x-M(P-e.yyx,t).x));}
  ac=mid<.5?mix(vec3(.2,.26,.12),vec3(.38,.34,.2),vn(P.xz*.35))*mix(1.,.55,st)
   :mid<1.5?vec3(.55,.13,.1):mid<2.5?vec3(.6,.6,.58):mid<3.5?vec3(.7,.7,.72):mid<4.5?vec3(.92,.92,.88):mid<5.5?vec3(.62,.1,.08):vec3(.3,.3,.35);
  float dif=max(dot(n,SUN),0.);
  col=ac*(vec3(.42,.46,.42)*(.5+.5*n.y)*.7+vec3(1.,.95,.8)*dif*si)+ac*fl*vec3(.5,.6,.8);
  col=mix(col,hor,1.-exp(-mt*.012));
 }
 // volumetric funnel, integrated over the part of the ray inside its cylinder
 vec3 fc=vec3(0.);float tr=1.,far=mt>0.?mt:260.;
 if(FA(t)>.001){vec2 c=TC(t),oc=ro.xz-c;float a=dot(rd.xz,rd.xz),b=dot(oc,rd.xz),cc=dot(oc,oc)-100.,dq=b*b-a*cc;
  if(dq>0.&&a>1e-4){float s0=max((-b-sqrt(dq))/a,0.),s1=min((-b+sqrt(dq))/a,far),dt=(s1-s0)/20.;
   if(s1>s0)for(int i=0;i<20;i++){float s=s0+(float(i)+.5)*dt,dd=FD(ro+rd*s,t)*dt*1.8;
    fc+=tr*dd*vec3(.2,.19,.17)*(.5+.5*si+fl);tr*=exp(-dd*3.);}
  }}
 col=col*tr+fc;
 // debris streaks blowing past the lens during the storm
 float rw=hs(vec2(floor(q.y*45.),3.)),sx=fract(q.x*.5+rw*7.-t*(.6+rw*1.4));
 col=mix(col,vec3(.16,.14,.12),step(.955,rw)*(1.-smoothstep(.05,.22,sx))*smoothstep(0.,.03,sx)*st);
 return col;
}
void main(){
 float t=T;vec2 uv=gl_FragCoord.xy/R;
 vec3 blue=vec3(.1,.2,.7);
 if(t<0.){O=vec4(blue*(.9+.1*sin(gl_FragCoord.y*2.1)),1.);return;}
 float gl=step(43.2,t)*step(t,48.),st=smoothstep(8.,18.,t)*(1.-smoothstep(47.,52.,t));
 float hw=max(0.,1.-uv.y/.07);   // head-switching band at the bottom of the frame
 vec2 u=uv;
 // tracking errors: per-row jitter, a violent burst in the glitch section; head-switch jitter at the bottom
 u.x+=(hs(vec2(floor(uv.y*R.y/3.),floor(t*9.)))-.5)*(.002+.02*gl+.004*st)+(vn(vec2(uv.y*220.,t*40.))-.5)*.06*hw;
 vec2 q=(u*2.-1.)*vec2(R.x/R.y,1.);
 vec3 c=SC(q,t);
 if(gl>0.){c.r=SC(q+vec2(.015,0.),t).r;c.b=SC(q-vec2(.015,0.),t).b;}   // chroma split in the glitch
 float lum=dot(c,vec3(.3,.59,.11));
 c=mix(vec3(lum),c,.75);                                      // low chroma
 c+=vec3(.05,-.02,.03)*smoothstep(.6,1.,lum);                  // chroma bleed on highlights
 c*=(1.+.2*sin(t*1.3+3.*sin(t*.4))*(.2+st))*(1.-.3*FL(t));     // auto-exposure hunting, lightning dips
 c=mix(c,vec3(hs(uv*R+t)),hw*.5);                             // head-switch noise
 c+=(hs(gl_FragCoord.xy+fract(t)*91.)-.5)*.08;                 // tape grain
 c*=.93+.07*sin(gl_FragCoord.y*2.1);                           // scanlines
 c*=1.-.35*dot(q*.5,q*.5);                                     // lens vignette
 c+=step(.985,hs(floor(q*vec2(30.,22.))+floor(t*2.)))*st*.25;   // rain speckles on the lens
 c=mix(c,blue,smoothstep(72.,75.,t));                          // the tape ends on blue
 O=vec4(c,1.);
}
