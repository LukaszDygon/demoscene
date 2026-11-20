#version 300 es
precision highp float;
uniform vec2 uRes;uniform vec3 uEye,uTgt;uniform float uFocus,uS,uFall,uFire,uBeat;
uniform vec4 uSh[18],uShA[18],uShV[18],uBn[10],uBnA[10],uCa[12],uBd[6];
out vec4 oc;
const vec3 KL=vec3(.119,.9917,.0496);          // key light: the skylight's direction (normalised)
const vec3 MG=vec3(4.1,.6,-3.45),MR=vec3(-.95,1.85,-1.55);   // muzzles: guard, robber
float h1(float n){return fract(sin(n)*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float n=dot(i,vec3(1.,57.,113.));
 return mix(mix(mix(h1(n),h1(n+1.),f.x),mix(h1(n+57.),h1(n+58.),f.x),f.y),
  mix(mix(h1(n+113.),h1(n+114.),f.x),mix(h1(n+170.),h1(n+171.),f.x),f.y),f.z);}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float sg(vec2 p,vec2 b){return length(p-b*clamp(dot(p,b)/dot(b,b),0.,1.));}
vec3 rod(vec3 p,vec3 k,float a){return p*cos(a)+cross(k,p)*sin(a)+k*dot(k,p)*(1.-cos(a));}
vec2 U(vec2 a,vec2 b){return a.x<b.x?a:b;}
// materials: 0 marble floor, 1 white marble, 2 charcoal, 3 glass, 4 brass, 5 alarm lamp, 6 banknote, 7 clock face, 8 blood
vec2 M(vec3 p){
 vec2 r=vec2(p.y,0.);
 r=U(r,vec2(max(min(10.-abs(p.x),min(8.-p.z,p.z+10.)),p.y-9.),1.));          // walls, open above the ceiling
 r=U(r,vec2(max(abs(p.y-9.2)-.2,-max(abs(p.x-.6)-2.5,abs(p.z)-2.5)),1.));    // ceiling with the skylight hole
 vec3 q=p;q.z-=6.*floor(p.z/6.+.5);
 r=U(r,vec2(max(length(vec2(abs(p.x)-7.,q.z))-.6,abs(p.y-4.5)-4.5),1.));    // columns
 r=U(r,vec2(box(p-vec3(4.,.5,2.),vec3(1.5,.5,.4)),2.));                      // teller counter
 r=U(r,vec2(box(p-vec3(0.,2.2,-9.9),vec3(2.2,2.2,.05)),2.));                 // vault recess
 vec3 h=p-vec3(-2.2,2.2,-9.6);                                                // vault door, ajar 0.45 rad
 vec3 dq=vec3(h.x*.9004+h.z*.435,h.y,-h.x*.435+h.z*.9004)-vec3(2.2,0.,0.);
 r=U(r,vec2(box(dq,vec3(2.2,2.2,.1)),4.));
 r=U(r,vec2(length(p-vec3(0.,8.4,-9.2))-.28,5.));                            // alarm lamp
 vec3 k=p-vec3(-9.9,5.4,-2.);                                                 // wall clock, second hand frozen at 12
 r=U(r,vec2(max(length(k.yz)-1.2,abs(k.x)-.1),7.));
 float hd=min(sg(k.zy,vec2(.78,.45)),min(sg(k.zy,vec2(-.52,.3)),sg(k.zy,vec2(0.,1.05))));
 r=U(r,vec2(max(hd-.035,abs(k.x)-.14),2.));
 float gb=length(p-vec3(1.6,1.5,-2.))-3.3;                                    // guard, mid-dive (falls at the snap)
 if(gb<r.x){
  vec3 gp=p-vec3(0.,min(uFall,.8),0.);
  float g=length(gp-vec3(3.,.95,-2.9))-.2;
  g=min(g,cap(gp,vec3(2.5,1.1,-2.6),vec3(1.6,1.5,-2.1),.28));
  g=min(g,cap(gp,vec3(1.6,1.5,-2.1),vec3(.5,2.1,-1.3),.2));
  g=min(g,cap(gp,vec3(.5,2.1,-1.3),vec3(-.3,2.5,-.8),.17));
  g=min(g,cap(gp,vec3(2.6,1.2,-2.7),vec3(3.6,.7,-3.2),.1));
  g=min(g,cap(gp,vec3(2.4,1.1,-2.5),vec3(3.3,.4,-3.),.1));
  g=min(g,cap(gp,vec3(3.6,.7,-3.2),vec3(4.,.6,-3.4),.07));
  r=U(r,vec2(g,2.));
 }
 float rb=length(p-vec3(-2.6,1.6,-1.2))-2.6;                                  // robber, mid-stride
 if(rb<r.x){
  float g=length(p-vec3(-2.5,2.75,-1.))-.2;
  g=min(g,cap(p,vec3(-2.5,2.4,-1.),vec3(-2.5,1.4,-1.),.3));
  g=min(g,cap(p,vec3(-2.4,1.2,-1.),vec3(-2.,.55,-.4),.17));
  g=min(g,cap(p,vec3(-2.,.55,-.4),vec3(-1.7,.12,.2),.14));
  g=min(g,cap(p,vec3(-2.6,1.2,-1.),vec3(-3.2,.6,-1.5),.17));
  g=min(g,cap(p,vec3(-3.2,.6,-1.5),vec3(-3.8,.12,-2.1),.14));
  g=min(g,cap(p,vec3(-2.5,2.1,-1.),vec3(-1.5,1.9,-1.3),.1));
  g=min(g,cap(p,vec3(-1.5,1.9,-1.3),vec3(-.95,1.85,-1.55),.06));
  r=U(r,vec2(g,2.));
 }
 for(int i=0;i<6;i++){vec4 b=uBd[i];r=U(r,vec2(length(p-b.xyz+vec3(0.,min(uFall,1.),0.))-b.w,8.));}
 float sb=length(p-vec3(.6,6.3,0.))-5.;                                        // skylight glass shards
 if(sb<r.x||uFall>0.){
  for(int i=0;i<18;i++){vec4 s=uSh[i],a=uShA[i];
   vec3 c=s.xyz+uShV[i].xyz*uS;c.y=max(c.y-uFall,.05);
   vec3 q=rod(p-c,a.xyz,s.w*6.283+uS*a.w);
   r=U(r,vec2(box(q,vec3(.08,.004,.1)),3.));}
 }
 float nb=length(p-vec3(0.,3.8,-1.))-6.6;                                      // banknotes, fluttering
 if(nb<r.x||uFall>0.){
  for(int i=0;i<10;i++){vec4 b=uBn[i],a=uBnA[i];
   vec3 c=vec3(b.x,max(b.y-uFall,.05),b.z);
   vec3 q=rod(p-c,a.xyz,b.w*6.283+uS*a.w);
   r=U(r,vec2(box(q,vec3(.17,.004,.09)),6.));}
 }
 if(p.y<2.){                                                                   // brass casings on the marble
  for(int i=0;i<12;i++){vec4 b=uCa[i];
   vec3 q=p-b.xyz;float c=cos(b.w*6.283),s=sin(b.w*6.283);q.xz=mat2(c,-s,s,c)*q.xz;
   r=U(r,vec2(box(q,vec3(.12,.035,.035)),4.));}
 }
 return r;
}
vec3 fl(vec3 p,vec3 F,float k){vec3 v=p-F;float d2=dot(v,v);
 return k*(vec3(1.,.97,.92)*(.012/(.01+d2)+.03/(.25+d2))+vec3(1.,.02,.01)*.02/(.0008+d2)+vec3(.45)*exp(-d2*2.5)*n3(p*3.)*.3);}
vec3 vol(vec3 p){
 vec3 c=vec3(0.);
 if(p.y<9.){float s=(9.-p.y)/KL.y;vec2 hp=vec2(p.x+s*KL.x,p.z+s*KL.z)-vec2(.6,0.);
  float e=max(abs(hp.x)-2.5,abs(hp.y)-2.5);
  float sh=(1.-smoothstep(-.6,.6,e))*(.3+.7*n3(p*vec3(1.,.5,1.)*1.5));
  c+=vec3(1.,.98,.95)*sh*.022+vec3(1.)*sh*smoothstep(.72,.8,n3(p*8.))*.5;}   // shafts with dust motes
 c+=fl(p,MG,uFire)+fl(p,MR,uFire);
 return c;
}
vec3 nrm(vec3 p){const vec2 e=vec2(.001,-.001);
 return normalize(e.xyy*M(p+e.xyy).x+e.yyx*M(p+e.yyx).x+e.yxy*M(p+e.yxy).x+e.xxx*M(p+e.xxx).x);}
float shd(vec3 p){float res=1.,t=.06;
 for(int i=0;i<36;i++){float d=M(p+KL*t).x;res=min(res,10.*d/t);t+=clamp(d,.03,.6);if(t>16.)break;}
 return clamp(res,0.,1.);}
float ao(vec3 p,vec3 n){float o=0.,s=1.;
 for(int i=1;i<5;i++){float h=.09*float(i);o+=(h-M(p+n*h).x)*s;s*=.75;}
 return clamp(1.-1.6*o,0.,1.);}
vec3 shade(vec3 p,vec3 n,float m,vec3 rd){
 if(m>4.5&&m<5.5)return vec3(1.,.03,.02)*(2.2+.6*uBeat);     // alarm lamp: emissive
 vec3 al=vec3(.85);float sp=0.;
 if(m<.5){float tl=mod(floor(p.x*.5)+floor(p.z*.5),2.);
  al=vec3(.8+.07*tl)*mix(.5,1.,smoothstep(0.,.12,abs(sin(3.*(p.x+p.z)+5.*n3(p*.6)))));sp=.2;}
 else if(m<1.5){al=vec3(.9)*mix(.6,1.,smoothstep(0.,.15,abs(sin(2.*p.y+3.*p.x+4.*n3(p*.5)))));}
 else if(m<2.5){al=vec3(.05);sp=.3;}
 else if(m<3.5){al=vec3(1.);sp=1.;}
 else if(m<4.5){al=vec3(.55);sp=.9;}
 else if(m<6.5){al=vec3(.92);sp=.1;}
 else if(m<7.5){al=vec3(.95);}
 else{al=vec3(.5,.01,.01);sp=.6;}
 float dif=max(dot(n,KL),0.)*shd(p+n*.01);
 vec3 col=al*(vec3(.07,.07,.075)*ao(p,n)+vec3(1.,.97,.93)*dif*1.1);
 vec3 v=MG-p;float d2=dot(v,v);
 col+=al*uFire*vec3(1.,.95,.9)*max(dot(n,normalize(v)),0.)*1.2/(1.+d2);
 v=MR-p;d2=dot(v,v);
 col+=al*uFire*vec3(1.,.95,.9)*max(dot(n,normalize(v)),0.)*1.2/(1.+d2);
 v=vec3(0.,8.4,-9.2)-p;d2=dot(v,v);
 col+=al*vec3(1.,.04,.02)*max(dot(n,normalize(v)),0.)*(3.2+1.*uBeat)/(1.+.05*d2);
 col+=vec3(1.)*sp*pow(max(dot(n,normalize(KL-rd)),0.),40.)*dif*.8;
 return col;
}
void main(){
 vec2 uv=(2.*gl_FragCoord.xy-uRes)/uRes.y;
 vec3 ww=normalize(uTgt-uEye),uu=normalize(cross(ww,vec3(0.,1.,0.))),vv=cross(uu,ww);
 vec3 ro=uEye,rd=normalize(uv.x*uu+uv.y*vv+1.6*ww);
 vec3 acc=vec3(0.);float t=0.,ht=-1.,mt=0.;
 for(int i=0;i<120;i++){
  vec3 p=ro+rd*t;vec2 h=M(p);float d=h.x,st=min(d,.6);
  acc+=vol(p)*max(st,.01);
  if(d<.0008*t){ht=t;mt=h.y;break;}
  t+=st;
  if(t>40.)break;
 }
 vec3 col;float dep=1.;
 if(ht>0.){vec3 p=ro+rd*ht;col=shade(p,nrm(p),mt,rd);dep=min(ht/40.,1.);}
 else col=vec3(1.6,1.6,1.55);
 oc=vec4(col+acc,dep);
}
