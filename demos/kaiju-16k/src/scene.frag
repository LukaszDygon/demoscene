#version 300 es
precision highp float;
// T.x = song time (gates reveals), T.y = free-running anim time
uniform vec2 R,T;uniform vec3 P,L,Z;uniform float K,W;uniform sampler2D X;
out vec4 o;
#define S smoothstep
#define F float
#define V vec3
F M,gid;
F h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
F bx(V p,V b){V q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
F ln(F x,F w){return S(w,0.,abs(fract(x+.5)-.5));}
V pal(F x){return x>.85?V(1,.55,.1):mix(V(1,.08,.55),V(.05,.75,1),S(.3,.6,x));}
// building half-size for cell c (with a plaza cleared around the logo)
V bs(vec2 c){F a=h(c),b=h(c+7.3),d=length(c*12.+6.-vec2(0,Z.z));
 c=c*12.+6.;return V(3.+.8*b,(2.+14.*a*a*a+3.*b)*S(18.,50.,d)*(abs(c.x)<9.&&c.y>Z.x-6.&&c.y<Z.y+6.?0.:1.)+.3,3.+.8*fract(a*9.));}
F bore(V p){return length(max(abs(p.xy-vec2(0,3.2))-vec2(3,2.6),0.))-1.;}
F map(V p){vec2 c=floor(p.xz/12.),q=mod(p.xz,12.)-6.,e=6.-abs(q);V b=bs(c);
 F d=1e3,t;M=1.;
 if(b.y>.35){d=bx(V(q.x,p.y-b.y,q.y),b);if(h(c+3.)>.45)d=min(d,bx(V(q.x,p.y-2.*b.y-b.y*.4,q.y),b*V(.6,.4,.6)));}
 d=min(d,max(min(e.x,e.y)+2.,p.y-56.));
 if(p.y<d){d=p.y;M=0.;}
 t=max(bx(p-V(0,7,(Z.x+Z.y)*.5),V(15,7,(Z.y-Z.x)*.5)),-bore(p));
 if(t<d){d=t;M=2.;}
 t=min(bx(p-V(0,15,Z.z),V(1.2,15,1.2)),length(p-V(0,32,Z.z))-2.5);
 if(t<d){d=t;M=3.;}
 return d;}
V nr(V p){vec2 e=vec2(.003,0);return normalize(V(map(p+e.xyy),map(p+e.yxy),map(p+e.yyx))-map(p));}
F mr(V ro,V rd,F n){F t=.05;for(F i=0.;i<n;i++){F d=map(ro+rd*t);if(d<.002*t||t>420.)break;t+=d;}return t;}
// billboard: s=coord along face (right-handed for viewer), y; returns rgb
V bb(F s,F y,F len,F top,vec2 c,F k){F a=h(c+k),vt=step(.6,h(c+k+.5)),hh=vt>0.?4.4:1.6,ww=vt>0.?1.1:hh*4.,
 sc=(a-.5)*max(len*2.-ww-.4,0.),yc=2.+fract(a*7.)*max(top-hh-3.,0.)+hh*.5;
 vec2 u=vec2((s-sc)/ww+.5,(yc+hh*.5-y)/hh);
 if(h(c+k+.2)<.25||u.x<0.||u.x>1.||u.y<0.||u.y>1.)return V(0);
 F id=floor(fract(a*13.)*8.),tx=texture(X,vt>0.?vec2((floor(id*.5)+u.x)*.125,.5+u.y*.5):vec2((mod(id,2.)+u.x)*.5,(floor(id*.5)+u.y)*.125)).r,
 fl=step(.12,fract(T.y*.4+a*3.))*(.8+.4*K*step(.5,a));
 vec2 bd=min(u,1.-u)*vec2(ww,hh);
 return pal(fract(a*5.))*(tx*3.+.12+S(.1,0.,min(bd.x,bd.y))*2.)*fl;}
V sky(V rd){F y=rd.y;V c=mix(V(.35,.05,.3),V(.005,0,.02),S(-.05,.3,y));
 vec2 sd=vec2(rd.x,y-.06)/.2;F r=length(sd);
 c+=step(r,1.)*mix(V(1,.75,.1),V(1,.1,.5),S(.6,-.9,sd.y))*step(.35,fract(sd.y*7.-T.y*.3)+S(.0,.8,sd.y))*2.;
 c+=V(1,.2,.6)*exp(-r*1.5)*.25;
 vec2 g=floor(rd.xz/rd.y*60.);c+=step(.997,h(g))*S(.1,.4,y)*V(.8,.9,1);
 return c;}
V sh(V ro,V rd,F t){gid=9.;V p=ro+rd*t;if(t>419.)return sky(rd);
 F m=map(p),id=M;gid=id;F w=.03+t*.0015;V n=nr(p),col=V(0);
 vec2 c=floor(p.xz/12.),q=mod(p.xz,12.)-6.;
 if(id==0.){
  // wet asphalt: faint synthwave grid, dashed centre line, traffic light-trails in the lanes
  F sx=p.x-12.*floor(p.x/12.+.5),lane=sign(sx),st=S(4.6,4.,max(abs(q.x),abs(q.y)));
  col=V(.01,.005,.025)+V(.5,.1,1)*(ln(p.x/3.,w*.1)+ln(p.z/3.,w*.1))*.25*st*exp(-t*.01)
   +V(.6,.1,1)*S(.08+w,0.,abs(sx))*step(.5,fract(p.z*.2))*.8
   +S(.25+w,0.,abs(abs(sx)-1.5))*step(.82,fract(p.z*.03+T.y*(lane>0.?.9:-1.3)+h(vec2(floor(p.x/12.+.5)))))*(lane>0.?V(1,.04,.08):V(1,.85,.6))*2.5;
 }else if(id==1.){
  V b=bs(c),lp=V(q.x,p.y-b.y,q.y),bb2=b;
  if(abs(lp.y)>b.y+.01){lp.y-=b.y*1.4;bb2=b*V(.6,.4,.6);}
  V e=bb2-abs(lp);F mid=e.x+e.y+e.z-min(e.x,min(e.y,e.z))-max(e.x,max(e.y,e.z));
  V hue=pal(h(c+1.7));
  F u=abs(n.x)>.5?p.z:p.x;
  vec2 wi=floor(vec2(u/1.5,p.y/1.3));
  F lit=step(.72,h(wi+c*17.))*(1.-step(.5,abs(n.y)));
  vec2 wf=abs(fract(vec2(u/1.5,p.y/1.3))-.5);
  col=V(.012,.01,.03)+hue*S(w*2.,0.,mid)*3.+hue*.25*(ln(p.y/1.3,.04)+ln(u/1.5,.03))*exp(-t*.01)
   +lit*step(wf.x,.25)*step(wf.y,.22)*mix(V(1,.6,.3),V(.4,.8,1),h(wi))*.5;
  if(abs(n.y)<.5){vec2 rt=vec2(n.z,-n.x);F s=dot(lp.xz,rt);
   col+=bb(s,p.y,abs(dot(bb2.xz,rt)),2.*b.y,c,n.x+n.z*2.);}
 }else if(id==2.){
  F inb=S(.2,0.,abs(bore(p)));
  F ri=floor(p.z/5.),ring=ln(p.z/5.,.03),ch=exp(-4.*fract(ri*.1-T.y*1.6));
  V hue=mod(ri,2.)>0.?V(1,.1,.6):V(.1,.7,1);
  vec2 g=vec2(fract(-p.z/9.6*sign(n.x)),(4.2-p.y)/2.4);F id=mod(floor(p.z/19.2),8.);
  col=V(.01,.005,.02)+inb*(hue*ring*(2.+5.*ch+3.*K)+hue*ln(p.z,.03)*.3+V(.1,.7,1)*S(.05,0.,abs(p.y-1.))*2.+V(1,.1,.6)*S(.05,0.,abs(p.y-5.6))*2.
   +(abs(n.x)>.9&&g.y>0.&&g.y<1.&&fract(p.z/19.2)<.5?pal(fract(id*.37))*(texture(X,vec2((mod(id,2.)+g.x)*.5,(floor(id*.5)+g.y)*.125)).r*2.+.15):V(0)));
  col+=(1.-inb)*(V(.6,.1,1)*ln(p.y/1.4,.03)*.4+V(1,.1,.6)*S(w,0.,abs(abs(p.x)-14.6))*1.5);
  // giant sign over the tunnel mouth
  g=vec2((11.6-p.x)/23.2,(13.4-p.y)/5.8);
  if(n.z<-.5&&g.x>0.&&g.x<1.&&g.y>0.&&g.y<1.)col+=V(1,.6,.1)*(texture(X,vec2(g.x*.5,(2.+g.y)*.125)).r*3.+.1);
 }else{
  col=V(.1,.8,1)*(ln(p.y/2.,.06)*2.+S(28.,33.,p.y)*4.)*S(44.,48.,T.x)+V(.02);
 }
 return mix(col,V(.05,.01,.08)+V(.3,.05,.2)*S(.15,-.1,rd.y),1.-exp(-t*.0085));}
void main(){vec2 uv=(2.*gl_FragCoord.xy-R)/R.y;
 V f=normalize(L-P),r=normalize(cross(f,V(sin(W),cos(W),0))),u=cross(r,f),rd=normalize(uv.x*r+uv.y*u+1.6*f);
 F t=mr(P,rd,110.);V col=sh(P,rd,t);
 // wet street: one reflected bounce
 if(gid==0.){V p=P+rd*t,r=reflect(rd,normalize(V(sin(p.x*2.+p.z*.7),150,sin(p.z*3.1))));F rt=mr(p+V(0,.01,0),r,48.);
  col+=sh(p,r,rt)*(.2+.4*pow(1.-abs(rd.y),5.));}
 // holographic logo: three stacked planes, gated so it never shows before its moment
 F on=S(46.,50.,T.x)*step(h(vec2(floor(T.y*24.))),S(45.5,49.,T.x)*1.3);
 V U=V(0,.87,-.5),N=V(0,-.5,-.87);
 if(on>0.)for(F i=0.;i<3.;i++){V cc=V(0,75,Z.z)-N*i*4.;F tl=dot(cc-P,N)/dot(rd,N);V hp=P+rd*tl-cc;
  vec2 lu=vec2(.5-hp.x/90.,.5-dot(hp,U)/90.);
  if(tl>0.&&tl<t&&lu.x>0.&&lu.x<1.&&lu.y>0.&&lu.y<1.&&lu.y<(T.x-46.)*.4){
   F band=floor(lu.y*40.),gl=step(.93,h(vec2(band,floor(T.y*10.))))*(h(vec2(band,T.y))-.5)*.08;
   vec2 tu=vec2(.5+(lu.x+gl)*.5,.5+lu.y*.5);F ca=.004+.01*K;
   V tx=V(texture(X,tu+vec2(ca,0)).r,texture(X,tu).r,texture(X,tu-vec2(ca,0)).r);
   V hue=mix(V(.1,.9,1),V(1,.2,.8),S(.1,.6,lu.y+.1*sin(T.y+lu.x*6.)));
   col+=(tx*hue*(.75+.25*sin(hp.y*7.-T.y*12.))*(1.+.6*K)*2.
     +hue*textureLod(X,tu,5.).r*1.5
     +hue*S(.04,0.,abs(fract(lu.y-T.y*.25)-.5)-.45)*.3*tx.g)*on/(1.+i*i*3.);}}
 o=vec4(col,1);}
