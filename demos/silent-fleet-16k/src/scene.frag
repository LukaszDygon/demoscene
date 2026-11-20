#version 300 es
precision highp float;
uniform vec2 R;
uniform float T,ROLL,PL,EX;
uniform vec3 CP,CT;
uniform vec4 K[10];
out vec4 O;
const vec3 PC=vec3(260.,-380.,700.);
const float PR=330.;

float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn(vec3 p){
  vec3 i=floor(p),f=smoothstep(0.,1.,fract(p));
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
vec2 rt(vec2 v,float a){return cos(a)*v+sin(a)*vec2(-v.y,v.x);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}

// capital hull, long along x: spine, bridge, engine block, wing plate, nose spike
float hull(vec3 p){
  float d=bx(p,vec3(10.,.4,.9));
  d=min(d,bx(p-vec3(2.,.9,0.),vec3(2.5,.5,.8)));
  d=min(d,bx(p-vec3(-10.5,0.,0.),vec3(1.5,1.1,1.6)));
  d=min(d,bx(p-vec3(-3.,-.3,0.),vec3(5.,.05,4.5)));
  return min(d,bx(p-vec3(12.5,0.,0.),vec3(2.,.25,.3)));
}
// one ship, cut at x=-2 into two halves that separate from t0 (s=0 is the whole ship)
float ship(vec3 p,vec3 c,float yaw,float t0){
  vec3 q=p-c;q.xz=rt(q.xz,yaw);
  if(length(q)>26.)return length(q)-26.;
  float s=smoothstep(0.,4.,T-t0);
  vec3 a=q-s*vec3(-4.,1.,.5);a.xy=rt(a.xy,-s*.5);
  vec3 b=q-s*vec3(3.,-.6,-.4);b.xy=rt(b.xy,s*.4);
  return min(max(hull(a),a.x+2.),max(hull(b),-b.x-2.));
}
vec2 mn(vec2 a,vec2 b){return a.x<b.x?a:b;}
// whole scene: ships (id 0) and tumbling hull debris (id 1)
vec2 M(vec3 p){
  vec2 r=vec2(ship(p,vec3(-14.,4.,70.),.2,1e3),0.);
  r=mn(r,vec2(ship(p,vec3(30.,-6.,110.),.5,27.),0.));
  r=mn(r,vec2(ship(p,vec3(-40.,10.,150.),-.3,44.),0.));
  for(int i=0;i<10;i++){
    vec4 k=K[i];vec3 q=p-k.xyz;float a=T*(.05+.1*fract(k.x*.37));
    q.xz=rt(q.xz,a);q.yz=rt(q.yz,a*.6);
    r=mn(r,vec2(bx(q,k.w*vec3(1.,.6,1.3)),1.));
  }
  return r;
}
// silent flash plus two expanding shells; dm = distance from the centre to the ray's closest approach
vec3 bm(vec3 ro,vec3 rd,vec3 c,float t0,float s){
  float dt=T-t0;if(dt<0.||dt>9.)return vec3(0.);
  vec3 q=c-ro;float dm=length(q-rd*max(dot(q,rd),0.));
  float fl=exp(-dm*dm/(s*s*.5))*exp(-dt*2.)*3.;
  float r1=dt*s*.45,r2=dt*s*.25;
  float sh=exp(-pow((dm-r1)*1.5,2.))*exp(-dt*.5)*.7+exp(-pow((dm-r2)*2.,2.))*exp(-dt*.6)*.5;
  return vec3(1.,.96,.88)*fl+vec3(.7,.35,1.)*sh;
}
vec3 eg(vec3 ro,vec3 rd,vec3 e){vec3 q=e-ro;float dm=length(q-rd*max(dot(q,rd),0.));return vec3(.3,.6,1.)*.5/(1.+dm*dm*.03);}
vec3 bg(vec3 rd){
  float h=h3(floor(rd*280.));
  float st=step(.993,h)*(h-.993)*120.;
  return vec3(st)*vec3(.9,.95,1.)+vec3(.28,.1,.42)*pow(vn(rd*4.),3.)*.5+vec3(.35,.15,.05)*pow(vn(rd*7.+3.),4.)*.3;
}
// gas giant: amber and violet bands, a few dark storms, lit from behind so the limb glows
vec3 planet(vec3 p){
  vec3 n=normalize(p-PC);
  float bd=.5+.5*sin(n.y*30.+3.*vn(n*2.5+vec3(T*.02,0.,0.)));
  vec3 c=mix(vec3(.22,.07,.34),vec3(.95,.5,.14),bd*bd);
  c=mix(c,vec3(.05,.02,.03),smoothstep(.62,.8,vn(n*5.+7.)));
  return c*(.2+.9*max(dot(n,normalize(vec3(.35,.25,.9))),0.));
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
  vec3 w=normalize(CT-CP),u=normalize(cross(vec3(0.,1.,0.),w)),v=cross(w,u);
  vec3 uu=cos(ROLL)*u+sin(ROLL)*v,vv=cos(ROLL)*v-sin(ROLL)*u;
  vec3 ro=CP,rd=normalize(uv.x*uu+uv.y*vv+1.5*w);

  float t=0.;vec2 h=vec2(1e3,0.);bool hit=false;
  for(int i=0;i<128;i++){
    h=M(ro+rd*t);
    if(h.x<.002*t+.002){hit=true;break;}
    t+=h.x*.8;if(t>1500.)break;
  }
  vec3 oc=ro-PC;float b=dot(oc,rd),D=b*b-dot(oc,oc)+PR*PR;
  float tp=(D>0.&&-b-sqrt(max(D,0.))>0.)?-b-sqrt(max(D,0.)):1e4;

  vec3 col;
  if(hit&&t<tp){
    vec3 p=ro+rd*t;vec2 e=vec2(.01,0.);
    vec3 n=normalize(vec3(M(p+e.xyy).x-M(p-e.xyy).x,M(p+e.yxy).x-M(p-e.yxy).x,M(p+e.yyx).x-M(p-e.yyx).x));
    vec3 al=h.y>.5?vec3(.2,.18,.17):vec3(.36,.38,.44);
    col=al*(.05+.9*max(dot(n,normalize(PC-p)),0.)*vec3(1.,.55,.25)+.12*vec3(.2,.3,.6))
       +vec3(.5,.25,.9)*.5*pow(1.-max(dot(n,-rd),0.),3.);
    col*=exp(-t*.0015);
  } else col=tp<1e4?planet(ro+rd*tp):bg(rd);

  float sb=smoothstep(0.,4.,T-27.),sc=smoothstep(0.,4.,T-44.);
  float dm=length(oc-rd*b);
  float ag=step(0.,-b)*exp(-max(dm-PR,0.)*.03);
  vec3 fx=bm(ro,rd,vec3(30.,-6.,110.),27.,12.)+bm(ro,rd,vec3(-40.,10.,150.),44.,10.)
    +eg(ro,rd,vec3(-24.5,4.,70.))+eg(ro,rd,vec3(19.5,-6.,110.)+sb*vec3(-4.,1.,.5))+eg(ro,rd,vec3(-50.5,10.,150.)+sc*vec3(-4.,1.,.5))
    +vec3(1.,.5,.18)*ag*.45+PL*ag*vec3(1.,.6,.3)*(.5+vn(rd*30.+vec3(0.,0.,T*3.)))*2.;

  // lens dirt catches the light from the glows
  float dirt=.35+3.*pow(vn(vec3(uv*5.,1.)),4.);
  col=col*EX+fx*dirt*EX;
  col=1.-exp(-col*1.3);
  col*=1.-.4*dot(uv,uv);
  col+=(h3(vec3(gl_FragCoord.xy,T))-.5)*.03;
  O=vec4(col,1.);
}
