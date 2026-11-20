#version 300 es
precision highp float;
// One frozen bank lobby. uP/uT: camera. uM: motion clock (1/100 speed while frozen). uS: seconds since time resumed.
uniform vec2 uR;uniform vec3 uP,uT;uniform float uM,uS;
out vec4 o;
float hs(vec3 p){return fract(sin(dot(p,vec3(12.9,78.2,37.7)))*43758.5);}
mat2 R(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float cp(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
vec2 U(vec2 a,vec2 b){return a.x<b.x?a:b;}
// ids: 0 marble 1 guard 2 charcoal 3 glass 4 note 5 shell 6 vault 7 alarm 8 blood 9 clock face 10 hand 11 mask
vec2 mp(vec3 p){
 vec2 d=vec2(-bx(p-vec3(0,4.5,0),vec3(8,4.5,8)),0.);
 for(int i=0;i<4;i++){vec2 c=vec2(i<2?-5.:5.,i%2==0?-4.:3.);d=U(d,vec2(max(length(p.xz-c)-.45,abs(p.y-4.5)-4.5),0.));}
 // guard, mid-dive
 d=U(d,vec2(cp(p,vec3(.4,.8,-1),vec3(1.4,.5,-1),.25),1.));
 d=U(d,vec2(length(p-vec3(1.6,.45,-1))-.22,1.));
 d=U(d,vec2(cp(p,vec3(1.3,.5,-1),vec3(2.4,.55,-1.2),.1),1.));
 d=U(d,vec2(cp(p,vec3(.4,.8,-1),vec3(-.5,.9,-.7),.12),1.));
 d=U(d,vec2(bx(p-vec3(2.5,.55,-1.2),vec3(.25,.05,.05)),2.));
 // robber, mid-stride, masked
 d=U(d,vec2(cp(p,vec3(-2.5,1,0),vec3(-2.5,1.8,0),.3),2.));
 d=U(d,vec2(length(p-vec3(-2.5,2.1,0))-.2,11.));
 d=U(d,vec2(cp(p,vec3(-2.5,1,0),vec3(-2.2,.05,-.6),.14),2.));
 d=U(d,vec2(cp(p,vec3(-2.5,1,0),vec3(-2.9,.05,.5),.14),2.));
 d=U(d,vec2(cp(p,vec3(-2.5,1.6,0),vec3(-1.5,1.5,-.7),.1),2.));
 // blood droplets hanging near the guard
 for(int i=0;i<4;i++){float f=float(i);d=U(d,vec2(length(p-vec3(.8+f*.5,1.2+.4*sin(f*2.),-1.3+f*.2))-.05,8.));}
 // vault door ajar, red alarm beacon above it
 vec3 v=p-vec3(5,2.2,-6.9);v.xz*=R(.5);
 d=U(d,vec2(bx(v,vec3(1.5,2.2,.12)),6.));
 d=U(d,vec2(length(p-vec3(5.5,5.6,-7.4))-.25,7.));
 // wall clock with a frozen second hand
 vec3 c=p-vec3(-7.85,4.8,-3.);
 d=U(d,vec2(max(length(c.yz)-.7,abs(c.x)-.05),9.));
 vec2 h=c.yz*R(.7);
 d=U(d,vec2(bx(vec3(c.x,h.x-.25,h.y),vec3(.04,.25,.02)),10.));
 // banknotes, fluttering, sparse lattice
 {vec3 C=vec3(2.6,2.2,2.8),n=clamp(floor(p/C+.5),vec3(-3,1,-3),vec3(3,3,3));float h=hs(n);
  if(h>.6){vec3 q=p-C*n;q.xy*=R(h*6.+.3*sin(uM*3.+h*9.));d=U(d,vec2(bx(q,vec3(.3,.005,.18)),4.));}}
 // brass shell casings on the marble
 {vec3 C=vec3(1.9,100.,1.7),n=clamp(floor(p/C+.5),vec3(-4,0,-4),vec3(4,0,4));float h=hs(n);
  if(h>.5){vec3 q=p-C*n;q.xz*=R(h*6.);d=U(d,vec2(max(length(q.yz-vec2(.05,0.))-.05,abs(q.x)-.1),5.));}}
 // glass shards from the skylight, two layers, slow spin; they fall after time resumes
 {vec3 C=vec3(1.5),n=clamp(floor(p/C+.5),vec3(-5,4,-5),vec3(5,5,5));float h=hs(n);
  if(h>.4){vec3 q=p-C*n-(vec3(h,fract(h*7.),fract(h*13.))-.5)*.6;q.y+=min(2.*uS*uS*h,5.);
   q.xy*=R(h*6.+uM*(h+.5));q.xz*=R(h*3.-uM);d=U(d,vec2(bx(q,vec3(.01,.22,.12)),3.));}}
 return d;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;
 vec3 ww=normalize(uT-uP),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
 vec3 rd=normalize(uv.x*uu+uv.y*vv+1.5*ww);
 vec3 F[3]=vec3[3](vec3(2.6,.6,-1.25),vec3(-1.4,1.5,-.8),vec3(.2,3.2,-2.5));   // muzzle flashes
 float fl=1.+4.*max(0.,sin(uS*9.))*step(.01,uS);
 float t=0.,hal=0.,red=0.,sm=0.,sh=0.,dst=0.;vec3 p=uP;vec2 m=vec2(1.,0.);int i=0;
 for(;i<96;i++){
  p=uP+rd*t;m=mp(p);
  float st=clamp(m.x,.03,1.);
  for(int k=0;k<3;k++){vec3 e=p-F[k];float dk=dot(e,e);hal+=st*fl*.012/(dk+.02);red+=st*fl*.002/(dk+.002);sm+=st*.012*exp(-dk*.5);}
  // light shaft from the skylight, with sparse dust motes
  float rr=3.+(9.-p.y)*.3;float sf=(1.-smoothstep(rr-.3,rr+.3,length(p.xz)))*step(0.,p.y)*step(p.y,9.);
  sh+=sf*st*.02;dst+=sf*step(.985,hs(floor(p*8.)))*.5;
  if(m.x<.001+.0006*t||t>40.)break;
  t+=m.x;
 }
 vec3 col=vec3(.03);
 if(t<40.){
  float id=m.y;vec2 e=vec2(.002,-.002);
  vec3 n=normalize(e.xyy*mp(p+e.xyy).x+e.yyx*mp(p+e.yyx).x+e.yxy*mp(p+e.yxy).x+e.xxx*mp(p+e.xxx).x);
  float ao=clamp(1.-float(i)/64.,.2,1.);
  vec3 al=vec3(.5);float sp=0.,em=0.;
  if(id<.5){al=vec3(.5+.4*pow(abs(sin(p.x*1.1+sin(p.y*1.7+p.z*1.3)*2.5)),6.));sp=.25;}
  else if(id<1.5)al=vec3(.92);
  else if(id<2.5)al=vec3(.04);
  else if(id<3.5){al=vec3(.95);sp=1.;}
  else if(id<4.5)al=vec3(.85);
  else if(id<5.5){al=vec3(.6);sp=.6;}
  else if(id<6.5){al=vec3(.2);sp=.4;}
  else if(id<7.5)em=1.;
  else if(id<8.5){al=vec3(.5,0.,0.);sp=.8;}
  else if(id<9.5)al=vec3(.9);
  else if(id<10.5)al=vec3(.05);
  else al=vec3(.9);
  vec3 L=normalize(vec3(.2,1.,.1));
  float dif=max(dot(n,L),0.);
  col=al*(.1+.75*dif*(.6+.4*exp(-length(p.xz)*.15)))*ao+.35*al*(.5+.5*n.y)*ao;
  col+=sp*pow(max(dot(reflect(-L,n),-rd),0.),30.)*ao;
  vec3 lv=vec3(5.5,5.6,-7.4)-p;float da=dot(lv,lv);
  col+=al*vec3(1.,.05,.03)*max(dot(n,normalize(lv)),0.)*2.5/(1.+da*.25);
  for(int k=0;k<3;k++){vec3 lk=F[k]-p;float dk=dot(lk,lk);col+=al*fl*.5*max(dot(n,normalize(lk)),0.)/(1.+dk*1.5);}
  if(em>0.)col=vec3(1.,.04,.02)*1.6;
  col=mix(col,vec3(.03),1.-exp(-.003*t*t));
 }
 col+=vec3(hal+sh)+vec3(1.,.05,.03)*red+sm*.8+dst*.7;
 col=col/(1.+col);
 o=vec4(sqrt(col),min(t/40.,1.));
}
