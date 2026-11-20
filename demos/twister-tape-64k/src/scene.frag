#version 300 es
precision highp float;
uniform vec2 R;uniform float T,FN,LT,SU,RD,PT[5];uniform vec3 C;uniform mat3 M;
out vec4 o;
// FC: funnel axis on the ground. HM: home spots of the five flung objects (barn, tower, silo, church, pickup).
const vec3 FC=vec3(0.,0.,400.),RP=vec3(18.,0.,236.),LD=vec3(.5,.7,.5);
const vec3 HM[5]=vec3[5](vec3(-60.,0.,385.),vec3(48.,0.,418.),vec3(-112.,0.,428.),vec3(92.,0.,362.),vec3(-14.,0.,342.));
const vec3 HO[4]=vec3[4](vec3(-150.,0.,380.),vec3(150.,0.,395.),vec3(-200.,0.,330.),vec3(210.,0.,420.));
const vec3 AL[9]=vec3[9](vec3(.36,.4,.24),vec3(.36,.4,.24),vec3(.5,.14,.1),vec3(.62,.64,.6),vec3(.6,.6,.55),vec3(.92,.9,.85),vec3(.3,.35,.5),vec3(.6,.52,.4),vec3(.12,.12,.12));
float h3(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1.,0.,0.)),f.x),mix(h3(i+vec3(0.,1.,0.)),h3(i+vec3(1.,1.,0.)),f.x),f.y),
  mix(mix(h3(i+vec3(0.,0.,1.)),h3(i+vec3(1.,0.,1.)),f.x),mix(h3(i+vec3(0.,1.,1.)),h3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cy(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float ob(int i,vec3 q){
 if(i==0)return bx(q-vec3(0.,4.5,0.),vec3(7.,4.5,10.));
 if(i==1)return min(cy(q-vec3(0.,11.,0.),1.2,11.),length(q-vec3(0.,25.,0.))-6.);
 if(i==2)return cy(q-vec3(0.,13.,0.),5.,13.);
 if(i==3)return min(bx(q-vec3(0.,5.,0.),vec3(6.,5.,9.)),bx(q-vec3(0.,15.,0.),vec3(2.,6.,2.)));
 return min(bx(q-vec3(0.,1.5,0.),vec3(1.4,1.2,3.)),bx(q-vec3(0.,2.9,-1.),vec3(1.2,.9,1.2)));}
// returns (distance, material): 1 ground, 2-6 flung objects, 7 houses, 8 radio
vec2 mp(vec3 p){
 vec2 r=vec2(p.y,1.);
 for(int i=0;i<4;i++){float d=bx(p-HO[i]-vec3(0.,3.,0.),vec3(5.,3.,4.));if(d<r.x)r=vec2(d,7.);}
 float d=bx(p-RP-vec3(0.,.3,0.),vec3(.6,.3,.4));if(d<r.x)r=vec2(d,8.);
 for(int i=0;i<5;i++){
  float pr=clamp((T-PT[i])/9.,0.,1.);if(pr>=1.)continue;
  vec3 h=HM[i]-FC;float rad=mix(length(h.xz),22.,pr*pr),a=atan(h.z,h.x)+7.*pr*pr,s=max(1.-smoothstep(.75,1.,pr),.02),sp=pr*6.;
  vec3 q=(p-FC-vec3(rad*cos(a),pow(pr,1.6)*240.,rad*sin(a)))/s;
  q.xz=mat2(cos(sp),-sin(sp),sin(sp),cos(sp))*q.xz;
  float dd=ob(i,q)*s;
  if(dd<r.x)r=vec2(dd,float(i)+2.);
 }
 return r;}
// funnel density: swirling smoke body, dust at the base, orbiting debris specks
float vol(vec3 p){
 float y=p.y;if(y<0.||y>430.)return 0.;
 vec3 q=p-FC;float r=length(q.xz),R0=mix(12.,75.,smoothstep(0.,430.,y));
 if(r>R0*1.5)return 0.;
 float a=atan(q.z,q.x),R_=R0*(.85+.3*n3(vec3(a*2.,y*.02,T*.4)));
 float d=smoothstep(R_,R_*.6,r)*smoothstep(0.,4.,y)*(1.-smoothstep(360.,430.,y));
 d*=.55+.9*n3(vec3(r*.05,y*.03,a*3.+T*.8));
 vec3 cl=floor(vec3(a*6.+y*.05+T*3.,y*.35,r*.3));
 d+=step(.972,h3(cl))*smoothstep(R_,R_*.4,r)*1.5;
 d+=smoothstep(14.,0.,y)*.6*smoothstep(R_*1.2,R_*.3,r);
 return d;}
vec3 sky(vec3 d){
 float a=atan(d.x,d.z);
 vec3 c=mix(vec3(.5,.55,.46),vec3(.15,.22,.18),smoothstep(0.,.4,d.y));
 vec2 cp=d.xz/max(d.y,.04);
 float cl=n3(vec3(cp*.8,T*.05))*.6+n3(vec3(cp*2.1,T*.1))*.4;
 float cd=smoothstep(.48,.72,cl)*smoothstep(0.,.12,d.y);
 c=mix(c,mix(vec3(.2,.25,.2),vec3(.5,.52,.44),cl),cd*.85);
 float wc=clamp(smoothstep(.35,0.,d.y)*smoothstep(-.4,.6,d.z)*(.7+.4*n3(vec3(a*8.,d.y*12.,T*.2))),0.,1.);
 c=mix(c,vec3(.09,.12,.1),wc*.9);
 c+=LT*vec3(.7,.8,.6)*(cd*.6+wc*.8+.15);
 float sb=pow(.5+.5*sin(a*9.+n3(vec3(a*3.,0.,T*.05))*5.),6.)*smoothstep(0.,.5,d.y)*SU;
 c+=vec3(1.,.92,.65)*(sb*.25+SU*pow(max(dot(d,normalize(vec3(.5,.7,.5))),0.),20.)*.8);
 return c;}
vec3 nrm(vec3 p){vec2 e=vec2(.05,0.);
 return normalize(vec3(mp(p+e.xyy).x-mp(p-e.xyy).x,mp(p+e.yxy).x-mp(p-e.yxy).x,mp(p+e.yyx).x-mp(p-e.yyx).x));}
void main(){
 vec2 q=(gl_FragCoord.xy-.5*R)/R.y;
 vec3 ro=C,rd=normalize(M*vec3(q,1.1));
 float t=0.,hit=0.;vec2 h;
 for(int i=0;i<150;i++){
  h=mp(ro+rd*t);
  if(h.x<.0004*t+.0005){hit=1.;break;}
  t+=h.x*.9;if(t>1500.)break;}
 vec3 p=ro+rd*t;
 vec4 fa=vec4(0.);
 if(FN>.001){
  float tm=hit>.5?t:700.,dt=tm/40.,j=h3(vec3(gl_FragCoord.xy,T));
  for(int i=0;i<40;i++){
   vec3 sp=ro+rd*((float(i)+j)*dt);
   float dn=vol(sp)*FN;
   if(dn>.01){
    float al=1.-exp(-dn*dt*.25);
    vec3 fc=mix(vec3(.5,.4,.26),vec3(.42,.43,.36),smoothstep(0.,30.,sp.y))*(.7+LT*1.4);
    fa.rgb+=(1.-fa.a)*al*fc;fa.a+=(1.-fa.a)*al;}}}
 vec3 col;
 if(hit>.5){
  vec3 n=nrm(p);
  int m=int(h.y+.5);
  float dif=.45+.55*max(dot(n,normalize(LD)),0.);
  col=AL[m]*dif*(1.+LT*1.5+SU*.4);
  col+=vec3(1.,.55,.2)*RD*step(7.5,h.y)*step(h.y,8.5)*(.8+.4*sin(T*6.));
  col=mix(col,vec3(.42,.46,.4)+LT*.3,1.-exp(-t*.0014));
 }else col=sky(rd);
 o=vec4(fa.rgb+(1.-fa.a)*col,1.);
}
