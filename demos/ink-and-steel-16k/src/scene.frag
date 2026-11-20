#version 300 es
precision highp float;
uniform vec2 R;uniform float B,K,T;out vec4 O;
// splash clashes (bar, x, y) and bamboo cuts (bar, x, y)
const vec3 CU[3]=vec3[3](vec3(7.,-.22,.2),vec3(9.,.3,.25),vec3(11.,-.05,.3));
const vec3 SP[5]=vec3[5](vec3(5.,-.15,.15),vec3(6.5,.2,-.1),vec3(8.,-.3,.1),vec3(10.,.1,.2),vec3(11.5,-.2,-.12));
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+7.1;a*=.5;}return v;}
float sm(float a,float b,float x){x=clamp((x-a)/(b-a),0.,1.);return x*x*(3.-2.*x);}
float ov(float a,float b){return a+(1.-a)*b;}
vec2 rt(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
float sg(vec2 p,vec2 a,vec2 b,float r){vec2 e=b-a,q=p-a;float t=clamp(dot(q,e)/dot(e,e),0.,1.);return length(q-e*t)-r;}
// brush ink: 1 inside (d<0), rough edge, and a faint halo that bleeds into the paper
float ik(float d,vec2 p,float r){float e=d+r*(n(p*40.)-.5);return max(1.-smoothstep(-.003,.003,e),.22*(1.-smoothstep(0.,.05,e))*n(p*9.));}
// robed swordsman, feet at origin, facing +x; hat adds a straw hat
float fig(vec2 q,float hat,float sw){
 vec2 r=q+vec2(.02*q.y*sin(q.y*9.+T*3.),0.);
 float d=max(abs(r.x)-.035-.065*pow(clamp(q.y/.42,0.,1.),1.5),max(-q.y,q.y-.42));
 d=min(d,length(q-vec2(0,.47))-.045);
 d=min(d,sg(q,vec2(0,.36),vec2(.1,.3),.028));
 d=min(d,sg(q,vec2(.1,.3),vec2(.1,.3)+.34*vec2(cos(sw),sin(sw)),.007));
 if(hat>0.)d=min(d,min(length(vec2(r.x/.17,(r.y-.515)/.022))-1.,max(abs(r.x)-.09*(.57-r.y)/.05,max(r.y-.57,.515-r.y))));
 return d;}
// place a figure: s mirrors facing, l leans forward, f falls backward (0..1)
float fg(vec2 p,vec2 o,float s,float hat,float sw,float l,float f){vec2 q=p-o;q.x*=s;q=rt(q,l-f*1.5708);return ik(fig(q,hat,sw),p,.02);}
// ink-wash mountain ridge with a darker wet edge
float mt(vec2 p,float y,float a,float s,float al){float r=y+a*(fb(vec2(p.x*1.3+s,s))-.5);return al*min(1.,ik(p.y-r,p,.02)+.3*exp(-abs(p.y-r)*70.));}
// bamboo stalks: cells along x, jittered, with knuckle bumps; ground at -.26
float bm(vec2 p,float sp,float w,float sd,float dm){float D=0.,c0=floor(p.x/sp);
 for(int j=-1;j<2;j++){float c=c0+float(j),cx=(c+.2+.6*h(vec2(c,sd)))*sp,ww=w*(.6+.8*h(vec2(c,sd+1.)));
  float d=abs(p.x-cx)-ww*(1.+.5*step(.93,fract(p.y*2.5+h(vec2(c,sd+2.)))));
  d=max(d,-.26-p.y);D=ov(D,ik(d,p,.03)*dm);}
 return D;}
// one clash: an ink blot that spreads across the frame, with flung droplets
float spl(vec2 p,vec3 s){float dt=B-s.x;if(dt<0.||dt>2.5)return 0.;
 vec2 q=p-s.yz;float a=atan(q.y,q.x),r=length(q);
 float R=.6*(1.-exp(-dt*7.))*(.7+.5*n(vec2(a*1.3+s.x,s.x*3.)));
 float m=1.-smoothstep(R-.02,R+.02,r+.05*(n(p*18.)-.5));
 for(int i=0;i<6;i++){float an=h(vec2(float(i),s.x))*6.283;m=max(m,1.-smoothstep(.008,.014,length(p-(s.yz+vec2(cos(an),sin(an))*R*1.5))));}
 return m*(1.-.7*sm(.6,2.5,dt));}
// bamboo flecks thrown off a cut
float fl(vec2 p,vec3 s){float dt=B-s.x;if(dt<0.||dt>1.6)return 0.;float m=0.;
 for(int i=0;i<8;i++){float fi=float(i);vec2 v=vec2(h(vec2(fi,s.x))-.5,h(vec2(fi,s.y))*.8);
  vec2 q=s.yz+v*dt*vec2(1.5,1.)-vec2(0.,.5*dt*dt);float rr=.009*(1.-dt/1.6);
  m=max(m,1.-smoothstep(rr*.5,rr,length(p-q)));}
 return m;}
// cut mask: the stalk top above a cut is gone after its bar
float cm(vec2 p){float m=0.;for(int i=0;i<3;i++){vec3 s=CU[i];if(B>s.x)m=max(m,step(abs(p.x-s.y),.025)*step(s.z,p.y));}return m;}
// falling rain streaks
float rn(vec2 p){float x=(p.x+p.y*.2)*240.,i=floor(x),s=h(vec2(i,4.));float y=fract(s-T*(.5+s*.4))*1.6-.8;
 return step(abs(fract(x)-.5),.12)*step(0.,p.y-y)*step(p.y-y,.12)*step(.6,s)*.3;}
// the whole frame's ink density (D) and vermilion (V)
vec2 S(vec2 p){
 float D=.12*sm(-.1,.5,p.y)*fb(p*vec2(1.5,3.)+3.),V=0.;
 float cx=step(4.9,B)*step(B,14.5)*(h(vec2(floor(B),7.))-.5)*.5;
 vec2 w=p+vec2(cx,0.);
 bool A=B>4.9&&B<8.&&mod(floor(B),2.)>.5;
 float g=-.26,fy=B<5.?-.238:A?-.2:g;
 float ax=mix(mix(-.3,-.22+.08*sin(B*2.),step(5.,B)),-.08,sm(13.5,14.5,B));
 float bx=mix(mix(.3,.22-.08*sin(B*2.+.8),step(5.,B)),.08,sm(13.5,14.5,B));
 float hp=.22*sin(1.5708*clamp((B-14.5)/.5,0.,1.));
 float ln=B<5.?0.:B<14.5?.15:mix(-.2,0.,sm(16.5,17.5,B));
 float sw=B<5.?.15:B<14.5?.5+.4*sin(B*5.):mix(1.3,.1,sm(16.5,17.5,B));
 // far ridges rise out of the paper in the first bars
 D=ov(D,mt(w,.05-.5*(1.-sm(0.,2.5,B)),.14,4.,.22));
 if(B<5.){
   D=ov(D,mt(w,-.08,.08,8.,.45));
   D=ov(D,ik(w.y-(-.24+.12*pow(abs(w.x)*1.2,4.)),w,.03)*.55);
 } else if(A){
   float i=floor(w.x*1.6+.5),lx=w.x-i/1.6,yy=-.22+.25*h(vec2(i,11.))+.12*pow(abs(lx)*3.3,2.);
   D=ov(D,ik(max(w.y-yy,abs(lx)-.3),w,.02)*.4);
 } else {
   D=ov(D,bm(w,.11,.01,10.,.3));
   D=ov(D,bm(w,.19,.018,20.,.5));
   D=ov(D,bm(w,.34,.03,30.,.72)*(1.-cm(w)));
   D=ov(D,ik(w.y-g,w,.03)*.45);
 }
 if(B>=5.){ // four explicit stalks; the last ones topple to the right after the strike
   for(int i=0;i<4;i++){float fi=float(i);vec2 bp=vec2(-.55+fi*.37,g);
     float th=1.5708*.92*sm(16.25+fi*.12,17.25+fi*.12,B);vec2 lq=rt(w-bp,th);
     D=ov(D,ik(max(abs(lq.x)-.02,max(-lq.y,lq.y-1.4)),w,.03)*.8);}
 }
 D*=1.-.4*smoothstep(.5,.8,fb(vec2(p.x*1.6+B*.12,p.y*3.)));  // drifting mist
 for(int i=0;i<5;i++)D=ov(D,.6*spl(p,SP[i]));
 float fL=sm(16.,16.8,B),hL=hp*(1.-fL),hR=hp*(1.-sm(16.2,17.2,B));
 D=ov(D,fg(w,vec2(ax,fy+hL),1.,0.,sw,ln,fL));
 D=ov(D,fg(w,vec2(bx,fy+hR),-1.,1.,sw,ln,0.));
 D=ov(D,rn(p));
 if(B>15.6){float sx=mix(-1.,1.,sm(15.6,15.9,B));  // the single horizontal slash
   D=ov(D,ik(abs(p.y-.18-.01*sin(p.x*5.))-(.004+.012*(1.-abs(p.x)*.9)),p,.005)*step(p.x,sx)*(1.-.4*sm(16.5,18.,B)));}
 float dy=mix(.18,-.24,sm(16.2,17.,B));  // the vermilion drop
 V=max(V,step(16.2,B)*step(B,17.)*(1.-smoothstep(-.002,.002,length(p-vec2(-.1,dy))-.011)));
 float rr=.005+.13*sm(17.,18.,B);
 V=max(V,step(17.,B)*.9*(1.-smoothstep(rr-.01,rr+.01,length(p-vec2(-.1,-.24))+.03*(n(p*30.)-.5))));
 for(int i=0;i<3;i++)D=ov(D,fl(w,CU[i]));
 return vec2(clamp(D,0.,1.),V);}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*R)/R.y;
 vec2 s=vec2(0.);
 float wp=step(4.9,B)*step(B,14.5)*(1.-sm(0.,.18,fract(B)));  // whip-pan smear at each cut
 if(B>=0.){
   s=S(p);
   if(wp>0.)s=mix(s,(S(p+vec2(.1*wp,0))+S(p-vec2(.1*wp,0)))*.5,wp);
 }
 float D=s.x,V=s.y;
 if(K>=0.&&K<1.4){ // the click becomes a brush stroke
   float st=mix(-1.2,1.2,sm(0.,.6,K));
   D=ov(D,ik(abs(p.y-.02*sin(p.x*3.))-.05*(1.-abs(p.x)*.5),p,.04)*step(p.x,st)*(1.-sm(.9,1.4,K)));}
 vec3 pap=vec3(.955,.925,.84)*(.93+.07*fb(p*2.5))*(.975+.025*h(gl_FragCoord.xy));
 vec3 c=pap*(1.-.93*clamp(D,0.,1.));
 c=mix(c,vec3(.86,.2,.13),V);
 c=mix(c,pap,sm(19.,20.,B));
 O=vec4(c,1.);}
