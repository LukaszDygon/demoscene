#version 300 es
precision highp float;
uniform vec2 R;uniform float T,LA;uniform vec4 EV[8];
out vec4 O;
float hs(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cp(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
float cy(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float am(vec3 p){
 float d=cp(p,vec3(0,.02,0),vec3(0,.12,0),.035);
 d=min(d,length(p-vec3(0,.19,0))-.04);
 d=min(d,cp(p,vec3(-.03,0,0),vec3(-.03,.03,0),.03));
 d=min(d,cp(p,vec3(.03,0,0),vec3(.03,.03,0),.03));
 return min(d,cp(p,vec3(-.04,.11,.02),vec3(.06,.12,.07),.012));
}
float tb(vec3 p){
 float d=length(p-vec3(0,.12,0))-.12;
 d=min(d,length(p-vec3(0,.27,0))-.09);
 d=min(d,length(p-vec3(-.065,.35,0))-.035);
 d=min(d,length(p-vec3(.065,.35,0))-.035);
 d=min(d,length(p-vec3(0,.245,.08))-.035);
 d=min(d,cp(p,vec3(-.12,.12,.02),vec3(-.14,.04,.05),.04));
 return min(d,cp(p,vec3(.12,.12,.02),vec3(.14,.04,.05),.04));
}
float rb(vec3 p){
 float d=length(p-vec3(0,.11,0))-.11;
 d=min(d,length(p-vec3(0,.25,0))-.075);
 d=min(d,cp(p,vec3(-.03,.3,0),vec3(-.035,.5,-.01),.022));
 return min(d,cp(p,vec3(.03,.3,0),vec3(.035,.5,-.01),.022));
}
float tk(vec3 p){
 float d=bx(p-vec3(0,.05,0),vec3(.09,.035,.07));
 d=min(d,bx(p-vec3(-.01,.11,0),vec3(.05,.03,.05)));
 d=min(d,cp(p,vec3(-.04,.11,0),vec3(-.16,.1,0),.013));
 d=min(d,bx(p-vec3(0,.02,.075),vec3(.1,.02,.02)));
 return min(d,bx(p-vec3(0,.02,-.075),vec3(.1,.02,.02)));
}
float lg(vec3 p){
 vec3 q=p-vec3(-.9,0,-.45);
 float w=min(bx(q-vec3(0,.05,0),vec3(.22,.05,.04)),bx(q-vec3(0,.15,0),vec3(.22,.05,.04)));
 w=min(w,bx(q-vec3(-.23,.1,0),vec3(.04,.1,.15)));
 if(w<.03){vec3 s=q-vec3(0,.21,0);s.xz=mod(s.xz+.05,.1)-.05;w=min(w,cy(s,.022,.012));}
 return w;
}
float tw(vec3 p,float a){
 vec3 q=p-vec3(.75,0,-.85);
 float c=cos(a),s=sin(a);
 q.xy=vec2(c*q.x+s*q.y,-s*q.x+c*q.y);
 float d=1e3;
 for(int k=0;k<3;k++)d=min(d,bx(q-vec3(0,.08+.16*float(k),0),vec3(.08)));
 return d;
}
vec2 U(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec2 mp(vec3 p){
 vec2 r=vec2(p.y,0);
 vec3 q=(p-vec3(mix(1.6,-.9,clamp((T-24.)/6.,0.,1.)),0,-.7))/vec3(.3,.12,.22);
 r=U(r,vec2((length(q)-1.)*.12+.01*sin(q.x*9.+q.z*7.),7));
 r=U(r,vec2(lg(p),1));
 r=U(r,vec2(tw(p,1.5708*smoothstep(34.,35.6,T)),8));
 r=U(r,vec2(bx(p-vec3(0,.2,0),vec3(.12,.2,.045)),5));
 r=U(r,vec2(tk(p-vec3(.85,0,.35)),6));
 r=U(r,vec2(am(p-vec3(.2,0,.2)),2));
 float bb=bx(p-vec3(-.9,.12,-.1),vec3(.55,.15,.15));
 if(bb<.1){for(int i=0;i<4;i++)r=U(r,vec2(am(p-vec3(-1.3+.3*float(i),0,-.1)),2));}
 else r=U(r,vec2(bb,2));
 float tg=bx(p-vec3(.1,.2,-1.2),vec3(1.,.3,.4));
 if(tg<.1){
  for(int i=0;i<4;i++){float f=float(i);r=U(r,vec2(tb(p-vec3(-.8+.45*f,.02*abs(sin(T*5.+f)),-1.3-.05*f+.04*sin(T*2.+f*1.7))),3));}
  r=U(r,vec2(rb(p-vec3(.95,0,-1.1)),4));
 }
 else r=U(r,vec2(tg,3));
 return r;
}
vec3 sh(vec3 p,vec3 rd,float m,float t){
 vec3 e=vec3(.0012,0,0);
 vec3 n=normalize(vec3(mp(p+e.xyy).x-mp(p-e.xyy).x,mp(p+e.yxy).x-mp(p-e.yxy).x,mp(p+e.yyx).x-mp(p-e.yyx).x));
 vec3 L=normalize(vec3(-.5,.9,.6));
 float nl=dot(n,L),dif=max(nl,0.),wr=clamp((nl+.5)/1.5,0.,1.);
 vec3 a;
 if(m<.5)a=vec3(.5,.36,.27)*(.7+.6*hs(floor(p*vec3(220,1,220))));
 else if(m<1.5)a=mix(vec3(.85,.12,.07),vec3(.95,.74,.1),step(.5,hs(floor(p*vec3(12,1,12)))));
 else if(m<2.5)a=vec3(.2,.55,.15);
 else if(m<3.5)a=vec3(.6,.36,.18);
 else if(m<4.5)a=vec3(.92,.84,.78);
 else if(m<5.5)a=mix(vec3(.9,.55,.2),vec3(.1,.3,.7),step(.7,fract(p.y*5.)));
 else if(m<6.5)a=vec3(.3,.36,.2);
 else if(m<7.5)a=mix(vec3(.85,.2,.25),vec3(.15,.35,.85),step(0.,sin(p.y*90.+p.x*40.)));
 else a=mix(vec3(.9,.15,.1),vec3(.95,.8,.1),step(.5,hs(floor(p*6.))));
 bool plush=m>2.5&&m<4.5,plast=m>.5&&m<2.5;
 vec3 K=mix(vec3(.22,.28,.5),vec3(1.,.8,.55),LA);
 float df=plush?wr:dif;
 vec3 c=a*(K*df*.9+vec3(.2,.15,.12)*(.3+.7*LA));
 if(plush)c+=a*vec3(1.,.45,.3)*.6*LA*pow(max(1.+dot(rd,n),0.),2.);
 if(plast)c+=K*pow(max(dot(n,normalize(L-rd)),0.),40.)*.6*LA;
 float f=exp(-.035*t*t);
 return c*f+vec3(.03,.03,.05)*(1.-f);
}
vec3 fx(vec2 uv,vec3 ro,vec3 ta){
 vec3 c=vec3(0),w=normalize(ta-ro),u=normalize(cross(w,vec3(0,1,0))),v=cross(u,w);
 for(int i=0;i<8;i++){
  float a=T-EV[i].w;
  if(a<0.||a>1.6)continue;
  vec3 d=EV[i].xyz-ro;
  vec2 s=vec2(dot(d,u),dot(d,v))*1.5/dot(d,w);
  for(int k=0;k<20;k++){
   float f=float(k+i*20);
   float an=6.283*hs(vec3(f,1.,2.)),sp=.1+.25*hs(vec3(f,3.,4.));
   vec2 q=s+vec2(cos(an),sin(an))*sp*a*.6+vec2(0,-.25*a*a);
   float z=.008+.008*hs(vec3(f,5.,6.)),kind=mod(f,3.);
   if(kind>1.5)z*=1.8;
   vec3 cc=kind<.5?.5+.5*cos(6.283*(hs(vec3(f,7.,8.))+vec3(0,.33,.67))):kind<1.5?vec3(1,.9,.95):vec3(1,.85,.4);
   c+=cc*smoothstep(z,z*.5,length(uv-q))*(1.-a/1.6);
  }
 }
 return c;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;
 vec3 ro=vec3(-.1+.25*sin(T*.04),.28+.03*sin(T*.3),1.9-.012*T),ta=vec3(-.1,.13,-.5);
 vec3 w=normalize(ta-ro),u=normalize(cross(w,vec3(0,1,0))),v=cross(u,w),rd=normalize(uv.x*u+uv.y*v+1.5*w);
 float t=0.,m=-1.;
 for(int i=0;i<96;i++){vec2 r=mp(ro+rd*t);if(r.x<.0008*t){m=r.y;break;}t+=r.x*.8;if(t>9.)break;}
 vec3 c=vec3(.03,.03,.05)*(.3+.7*LA);
 if(m>=0.)c=sh(ro+rd*t,rd,m,t);
 O=vec4(c+fx(uv,ro,ta),1.);
}
