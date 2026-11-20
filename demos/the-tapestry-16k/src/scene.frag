#version 300 es
precision highp float;
uniform vec2 R;uniform float T;out vec4 O;
const vec3 MD=vec3(.55,.12,.11),WD=vec3(.13,.25,.47),WE=vec3(.88,.73,.22),WA=vec3(.28,.19,.11),LN=vec3(.9,.85,.72);
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
float fb(vec2 p){return .5*vn(p)+.25*vn(p*2.1)+.125*vn(p*4.3);}
float bx(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float ci(vec2 p,float r){return length(p)-r;}
float sg(vec2 p,vec2 a,vec2 b){vec2 e=p-a,d=b-a;return length(e-d*clamp(dot(e,d)/dot(d,d),0.,1.));}
float tn(vec2 q,vec2 c){vec2 r=q-c;return max(abs(r.x)-.3*(1.-r.y/.4),max(-r.y,r.y-.4));}
float crn(vec2 q,vec2 c,vec2 b){vec2 r=q-c;float m=bx(vec2(mod(r.x+.1,.2)-.1,r.y-b.y-.05),vec2(.05));return min(bx(r,b),max(m,abs(r.x)-b.x));}
// stitched fill: satin direction a, density k (world-fixed, so the cloth scrolls past)
float sw(vec2 p,float a,float k){vec2 q=mat2(cos(a),sin(a),-sin(a),cos(a))*p*k;return .78+.22*fract(q.x+h(vec2(floor(q.y),5.))*4.)+.1*h(floor(q*vec2(7.,4.)));}
// paint a region with a walnut outline
vec3 pt(vec3 c,float d,vec3 k,float a,vec2 p){c=mix(c,k*sw(p,a,60.),1.-smoothstep(-.004,.004,d));return mix(c,WA*.35,1.-smoothstep(.004,.011,abs(d)));}
// profile figure: torso and legs, feet at q=0, legs swing with ph
float fg(vec2 q,float s,float ph){float b=bx(q-vec2(0.,.42*s),vec2(.09,.2)*s),l=sg(q,vec2(-.03,.2*s),vec2(-.03+.08*s*sin(ph),0.))-.035*s,r=sg(q,vec2(.03,.2*s),vec2(.03-.08*s*sin(ph),0.))-.035*s;return min(b,min(l,r));}
vec3 man(vec3 c,vec2 q,float s,float ph,vec3 k,vec2 p){c=pt(c,fg(q,s,ph),k,.4,p);return pt(c,ci(q-vec2(0.,.73*s),.1*s),LN,1.5,p);}
// fire: stitches that unravel and re-knit each tick
vec4 fire(vec2 w,float x0,float x1,float yb){float m=step(x0,w.x)*step(w.x,x1)*step(yb,w.y);float f=fb(vec2(w.x*7.,w.y*3.5-T*4.))+.45-(w.y-yb)*.7;vec2 g=floor(w*vec2(40.,26.));float k=step(h(g+floor(T*9.)),f)*m;return vec4(mix(MD,WE,clamp(f*1.3-.3,0.,1.)),k);}
// the cloth ends: frayed woven fringe on both edges, dark board beyond
vec3 edge(vec2 w){float d=w.x<0.?-w.x:w.x-23.,rh=h(vec2(floor(w.y*24.),7.));float s=step(d,.25+.4*rh)*step(abs(fract(w.y*24.)-.5),.3);return mix(WA*.3,mix(LN,WE,step(.6,rh))*(.8+.2*fb(vec2(d*40.,w.y*60.))),s);}
// trebuchet boulders: a dotted thread trail along each arc
vec3 bl(vec3 c,vec2 w){float a=step(10.,T)*step(T,62.);for(int i=0;i<2;i++){float s=fract((T-10.)/3.+float(i)*.5);for(int j=0;j<9;j++){float u=s-float(j)*.035;vec2 P=vec2(mix(5.6,9.8,u),mix(-.3,-.6,u)+3.*u*(1.-u));float r=j==0?.05:.012*(1.-float(j)/9.);c=mix(c,j==0?WA*.4:WE,(1.-smoothstep(r-.005,r+.005,length(w-P)))*a*step(0.,u));}}return c;}
// the hole the dragon burns: flame, then darkness with a frayed glowing rim
vec3 ho(vec3 c,vec2 w){vec2 H=vec2(14.5,0.);float rr=.36*smoothstep(44.,50.,T),dh=length(w-H)-rr+.035*fb(w*14.),fl=smoothstep(43.,44.,T)*(1.-smoothstep(49.,51.,T)),ff=sg(w,vec2(14.9,.12),H)-.04-.05*fb(w*vec2(18.,10.)+vec2(0.,-T*6.));
 c=mix(c,mix(WE,MD,clamp(ff*8.+.5,0.,1.)),fl*(1.-smoothstep(-.01,.01,ff)));
 if(rr<.001)return c;
 c=mix(c,vec3(.02,.01,.04)+step(.996,h(floor(w*70.)))*WE*.6,1.-smoothstep(-.006,.006,dh));
 c=mix(c,mix(MD,WE,fb(w*40.)),1.-smoothstep(0.,.04,abs(dh)));
 return c+WE*.25*(1.-smoothstep(0.,.1,abs(dh)));}
// the dragon, woad body and madder wings, present from 39 s to 57 s
vec3 dr(vec3 c,vec2 w){float on=smoothstep(39.,41.,T)*(1.-smoothstep(55.,57.,T));if(on<.01)return c;
 vec2 D=w-vec2(15.5,.1+.06*sin(T*1.3));float fp=sin(T*7.)*.22;
 float wg=sg(D,vec2(.05,.1),vec2(.3,.55+fp))-.07,bd=min(sg(D,vec2(-.2,0.),vec2(.7,.05))-.13,sg(D,vec2(-.3,.05),vec2(-.5,.14))-.09),
 hd=(length(vec2(D.x+.6,(D.y-.14)*1.7))-.12)/1.7,tl=sg(D,vec2(.7,.05),vec2(1.2,.25))-.05;
 c=pt(c,wg,MD,1.,w);c=pt(c,min(bd,tl),WD,.2,w);c=pt(c,hd,WD,.6,w);
 return pt(c,ci(D-vec2(-.62,.17),.025),WE,0.,w);}
// one 4-unit panel of the chronicle, local x in [-2,2]
vec3 scn(vec2 w){float k=floor(w.x/4.),x=w.x-4.*k-2.;vec2 q=vec2(x,w.y);
 vec3 c=LN*(.93+.07*sin(w.x*R.y*.25)*sin(w.y*R.y*.25))*(.97+.06*fb(w*35.));
 c=mix(c,WA*.6,1.-smoothstep(.02,.04,abs(abs(x)-1.97)));
 c=pt(c,w.y+.8,WA,0.,w);
 float bc=floor((w.x+.25)/.5);vec2 bq=vec2(mod(w.x+.25,.5)-.25,w.y+.9);
 c=pt(c,min(ci(bq,.1),ci(bq-vec2(.12,.03),.05)),mix(MD,WE,h(vec2(bc,2.))),0.,w);
 if(k<.5){
  c=pt(c,crn(q,vec2(-.9,-.3),vec2(.8,.5)),WD,.3,w);
  c=pt(c,ci(q-vec2(.9,.1),.35),MD,1.2,w);
  c=pt(c,ci(q-vec2(.9,.1),.18),WE,.6,w);
 }else if(k<1.5){
  c=pt(c,tn(q,vec2(-1.3,-.8)),MD,.8,w);
  c=pt(c,tn(q,vec2(-.8,-.8)),WD,.5,w);
  vec2 pv=vec2(-.4,-.1);float a=.9*sin(T*3.);vec2 e=pv+.6*vec2(sin(a),cos(a));
  c=pt(c,min(sg(q,vec2(-.55,-.8),pv),sg(q,vec2(-.25,-.8),pv))-.03,WA,.2,w);
  c=pt(c,sg(q,pv,e)-.035,WA,1.,w);
  c=pt(c,ci(q-(pv-vec2(0.,.25)),.08),WA,0.,w);
  c=man(c,q-vec2(.6,-.8),.6,T*5.,WD,w);
  c=man(c,q-vec2(1.2,-.8),.6,T*5.+1.,MD,w);
  c=pt(c,crn(q,vec2(1.5,-.2),vec2(.7,.6)),MD,.2,w);
 }else if(k<2.5){
  float cf=smoothstep(26.,32.,T),a=cf*cf*1.3;
  vec2 t=mat2(cos(a),sin(a),-sin(a),cos(a))*(q-vec2(0.,-.8))+vec2(0.,-.8);
  float r=h(floor(t*vec2(14.,9.))+vec2(3.,7.));
  float tw=mix(crn(t,vec2(0.,.05),vec2(.25,.85)),.05,step(r,cf*.8));
  c=pt(c,crn(q,vec2(1.2,-.35),vec2(.85,.6)),MD,.2,w);
  c=pt(c,tw,WD,.3,w);
  vec4 f=fire(w,10.6,11.9,.3);c=mix(c,f.rgb,f.a);
 }else if(k<3.5){
  c=pt(c,sg(q,vec2(-1.6,-.8),vec2(-1.6,.6))-.02,WA,0.,w);
  c=pt(c,bx(vec2(q.x+1.45,q.y-.5+.03*sin(q.x*9.-T*6.)),vec2(.15,.1)),MD,.3,w);
  for(int i=0;i<4;i++)c=man(c,q-vec2(-1.+float(i)*.5,-.8),.55,T*6.+float(i)*1.6,i<2?WD:MD,w);
 }else if(k<4.5){
  c=pt(c,crn(q,vec2(0.,-.2),vec2(2.,.6)),MD,.9,w);
  for(int i=0;i<3;i++)c=man(c,q-vec2(-1.2+float(i)*.7,-.8),.6,T*9.+float(i),WD,w);
  vec4 f=fire(w,16.,20.,.45);c=mix(c,f.rgb,f.a);
 }else{
  c=man(c,q-vec2(-.6,-.8),1.1,0.,MD,w);
  c=pt(c,sg(q,vec2(.7,-.8),vec2(.7,1.))-.02,WA,0.,w);
  vec2 bq=q-vec2(1.05,.5);bq.y+=.05*sin(bq.x*7.-T*3.);
  c=pt(c,bx(bq,vec2(.35,.22)),WE,.5,w);
 }
 c=bl(c,w);c=ho(c,w);c=dr(c,w);return c;}
void main(){vec2 p=(gl_FragCoord.xy-.5*R)/R.y*2.;float wx=p.x+.3*T+1.;vec2 w=vec2(wx,p.y);
 vec3 c=wx<0.||wx>23.?edge(w):scn(w);
 c*=1.-.1*dot(p,p);
 c*=.97+.06*h(gl_FragCoord.xy+T);
 O=vec4(c,1.);}
