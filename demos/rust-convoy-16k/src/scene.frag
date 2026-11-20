#version 300 es
precision highp float;
uniform vec2 R,T;out vec4 o;
#define S smoothstep
#define F float
#define V vec3
#define SD normalize(V(-.45,.2,1.))
// T.x = song time (80 s clamp), T.y = free-running time. Z runs forward; the sun sits ahead.
F mt;V Q[3],PT;// rig origins and tanker origin, computed once per pixel in main
F hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
F vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
F bx(V p,V b){V q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
// the jump (35-41 s): progress p(x) has a slow middle, so the apex hangs
F pj(F t){F x=clamp((t-35.)/6.,0.,1.);return x+.85*sin(6.2832*x)/6.2832;}
F zt(F t){return 9.*min(t,35.)+54.*pj(t)+9.*max(t-41.,0.);}
F arc(F t){F p=pj(t);return 20.*p*(1.-p);}
// terrain: cracked salt, red dunes beyond |x|>12, a chasm across the road at z=342
F dn(vec2 p){return S(12.,30.,abs(p.x))*(3.+2.5*sin(.045*p.y+.03*p.x)+2.*vn(.05*p));}
F ch(vec2 p){return 1.-S(11.,13.,abs(p.y-342.));}
F ht(vec2 p){F cr=abs(sin(.7*p.x+2.*sin(.5*p.y))*sin(.6*p.y+2.*sin(.4*p.x)));return mix(dn(p)-.12*(1.-S(0.,.1,cr)),-14.,ch(p));}
F gr(V p,F t){return mix(ht(p.xz),0.,S(34.,35.,t)*(1.-S(41.,42.,t)));}
// pursuers come from 110-135 m ahead on the horizon and pull alongside by 24 s; rig 2 trails
V rg(F i,F t){F k=S(10.,24.,t),D=i<.5?120.:i<1.5?135.:110.,Z=i<.5?0.:i<1.5?.5:-11.,X=i<.5?-16.:i<1.5?16.:-12.,Y=i<.5?-3.8:i<1.5?3.8:-1.8;
 V o=V(mix(X,Y,k)+1.2*sin(.5*t),0.,zt(t)+mix(D,Z,k));o.y=gr(o,t)+arc(t);return o;}
V tk(F t){V o=V(1.2*sin(.5*t),0.,zt(t));o.y=gr(o,t)+arc(t);return o;}
F rig(V q){return min(min(bx(q-V(0,1.4,0),V(1.1,.8,2.1)),bx(q-V(-.8,2.6,.4),V(.08,.9,.08))),min(bx(q-V(.8,2.6,-.5),V(.08,.9,.08)),bx(q-V(0,.9,3.),V(.12,.2,1.))));}
// tanker: cab plus a trailer that jackknifes after landing (41-42.5 s)
F tank(V q,F t){F th=1.3*S(40.5,42.,t),c=cos(th),s=sin(th);V r=q-V(0,1.8,1.8);r.xz=mat2(c,-s,s,c)*r.xz;
 return min(bx(q-V(0,1.8,3.2),V(1.5,1.2,1.4)),max(length(r.xy-vec2(0,.4))-1.6,abs(r.z+4.5)-4.5));}
F rp(V p,V A,V B,F g){V ab=B-A;F u=clamp(dot(p-A,ab)/dot(ab,ab),0.,1.);V c=A+ab*u;c.y-=g*4.*u*(1.-u);return length(p-c)-.04;}
F mp(V p,F t){F d=.7*(p.y-ht(p.xz)),e;mt=0.;
 for(int i=0;i<3;i++){e=rig(p-Q[i]);if(e<d){d=e;mt=2.;}}
 if(t<42.5){e=tank(p-PT,t);if(e<d){d=e;mt=4.;}}
 if(t>30.&&t<36.){e=rp(p,Q[0]+V(0,2.4,0),PT+V(0,2.4,-3.),.9*(1.-S(30.,32.,t))+.05);if(e<d){d=e;mt=5.;}}
 return d;}
V nr(V p,F t){V e=V(.003,0,0);return normalize(V(mp(p+e.xyy,t)-mp(p-e.xyy,t),mp(p+e.yxy,t)-mp(p-e.yxy,t),mp(p+e.yyx,t)-mp(p-e.yyx,t)));}
// fireball from the explosion at z=382.5, rising toward the sun
V fx(F t){F u=max(t-42.5,0.);return V(1.2*sin(21.25),3.+4.*u,382.5+3.*u);}
F fr(F t){return 2.+5.*S(42.5,44.,t)+.8*max(t-42.5,0.);}
// dust: wheel clouds from every vehicle, the far pursuer plumes, smoke after the blast, haze at the end card
F dd(V p,F t){F s=0.;
 for(F i=0.;i<4.;i++){V c=i<.5?Q[0]:i<1.5?Q[1]:i<2.5?Q[2]:PT;c.z-=3.;V q=p-c;
  s+=(i<2.5?.8*S(4.,9.,t):1.2*S(3.,8.,t))*exp(-.04*dot(q.xz,q.xz)-.12*max(q.y,0.));}
 V fc=fx(t);s+=S(43.,46.,t)*max(1.-length(p-fc-V(0,2,0))/(1.6*fr(t)),0.)*.5;
 return s*(.5+vn(.2*p.xz+.3*t))+S(46.,52.,t)*.05;}
// emission: exhaust flames, boarding sparks, fireball
V em(V p,F t){V e=V(0);F f=floor(t*16.);
 for(int i=0;i<3;i++){V q=p-Q[i]-V(1.,3.,-1.8);e+=V(1.,.45,.12)*(.03/(dot(q,q)+.05))*(.7+.3*hh(vec2(float(i),floor(t*24.))));}
 F b=S(22.,22.5,t)*(1.-S(29.,30.,t));
 if(b>0.)for(F j=0.;j<5.;j++){V c=PT+V(1.9,.9,0.)+(V(hh(vec2(j,f)),hh(vec2(j+7.,f)),hh(vec2(j+3.,f)))-.5)*V(2.,1.5,5.);V q=p-c;e+=V(1.,.8,.4)*(.004*b/(dot(q,q)+.01));}
 V fc=fx(t);F fi=max(1.-length(p-fc)/fr(t),0.)*S(42.4,42.6,t)*(.6+.8*vn(p.xy*.8+t*2.));
 return e+V(1.,.4,.1)*3.*fi;}
// shots cut on the bar lines: chase, horizon plume, swoop, side track, harpoon, jump, blast, end card
void cm(F t,out V e,out V g){V p=tk(min(t,42.5));
 if(t<10.){e=p+V(0,.7,-9.);g=p+V(0,1.6,12.);}
 else if(t<15.){e=p+V(-2.,.6,-7.);g=V(p.x*.5,5.,p.z+160.);}
 else if(t<22.5){e=p+V(6.*sin(t),.8,-8.);g=p+V(0,1.,8.);}
 else if(t<30.){e=p+V(-9.5,.7,-1.);g=p+V(0,1.2,0.);}
 else if(t<35.){e=p+V(-4.5,1.5,-5.);g=p+V(-1.5,1.5,-1.);}
 else if(t<42.5){e=p+V(3.+2.*sin(t),1.8,-10.);g=p+V(0,2.,4.);}
 else if(t<45.){e=p+V(-6.,1.5,-6.);g=fx(t);}
 else{e=V(-9.+3.*sin(.2*t),3.,360.);g=mix(V(0.,4.,400.),fx(t),.6);}}
V sk(V r){F s=max(dot(r,SD),0.);return mix(V(1.,.5,.22),V(.14,.3,.42),S(-.02,.5,r.y))+V(1.,.6,.25)*pow(s,6.)*.5+V(1.,.9,.7)*pow(s,300.)*4.;}
void main(){vec2 u=(gl_FragCoord.xy*2.-R)/R.y;F t=T.x;
 for(int i=0;i<3;i++)Q[i]=rg(float(i),t);
 PT=tk(t);
 V e,g;cm(t,e,g);
 V f=normalize(g-e),r=normalize(cross(f,V(0,1,0))),y=cross(r,f),d=normalize(f*1.7+r*u.x+y*u.y);
 V acc=V(0),tr=V(1);F tt=0.,dist=1.,hit=0.;
 for(int i=0;i<110;i++){
  V p=e+d*tt;dist=mp(p,t);
  F dt=clamp(dist,.03,3.),q=dd(p,t);
  acc+=tr*V(.9,.55,.32)*q*dt*.8;tr*=exp(-q*dt);
  acc+=tr*em(p,t)*dt;
  if(dist<.002*tt){hit=1.;break;}
  if(tt>400.)break;
  tt+=max(dist,.01);
 }
 V c;
 if(hit>0.){
  V p=e+d*tt;F m=mt;V n=nr(p,t),al=V(.08);
  if(m<.5){al=mix(V(.84,.82,.76),V(.62,.22,.09),S(.3,1.,dn(p.xz)));if(ch(p.xz)>.5)al=V(.2,.13,.09);}
  else if(m<3.)al=V(.45,.17,.07);
  else if(m<4.5)al=V(.8,.76,.68);
  c=al*(V(1.,.6,.3)*max(dot(n,SD),0.)*2.4+V(.25,.45,.55)*(.35+.5*n.y));
  c=mix(c,V(1.,.5,.22),1.-exp(-tt*(.004+.05*S(46.,52.,t))));
 }else c=sk(d);
 c=c*tr+acc;
 o=vec4(c,1.);
}
