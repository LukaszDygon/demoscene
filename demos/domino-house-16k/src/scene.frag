#version 300 es
precision highp float;
uniform vec2 R;uniform float T;uniform vec3 E,G;out vec4 o;
float sm(float a,float b,float x){x=clamp((x-a)/(b-a),0.,1.);return x*x*(3.-2.*x);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
vec2 U(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec3 mp(float t){vec3 a=vec3(0,7.7,.3),b=vec3(-1.7,6.7,.3),c=vec3(.1,.3,.3);
 if(t<4.5||t>9.)return vec3(0,-30,0);
 if(t<5.3)return mix(a,b,(t-4.5)/.8);
 if(t<8.5)return mix(b,c,(t-5.3)/3.2);
 return c;}
vec2 M(vec3 p){
 float f=sm(28.5,50.,T),th=1.6*f,c=cos(th),s=sin(th);
 vec3 q=vec3(p.x*c,p.y*(1.-.5*f),p.z+abs(p.x)*s);
 vec3 h=q;h.y-=3.*clamp(round(q.y/3.),0.,3.);
 vec2 d=vec2(bx(h,vec3(4,.1,1)),2.);
 d=U(d,vec2(bx(h-vec3(0,0,-1),vec3(4,1.5,.08)),1.));
 d=U(d,vec2(bx(h-vec3(-4,0,0),vec3(.08,1.5,1)),1.));
 d=U(d,vec2(bx(h-vec3(4,0,0),vec3(.08,1.5,1)),1.));
 vec2 r=q.xy-vec2(-1.3,3.6);
 d=U(d,vec2(bx(vec3(dot(r,vec2(.958,.2875)),dot(r,vec2(.2875,-.958)),q.z),vec3(.25,3.14,.5)),4.));
 d=U(d,vec2(bx(q-vec3(0,7.6,.9),vec3(.5,.25,.2)),4.));
 d=U(d,vec2(bx(q-vec3(3.9,.55,.3),vec3(.35,.25,.25)),3.));
 float a=sm(17.2,17.7,T)*1.2,lc=cos(a),ls=sin(a);vec2 l=q.xy-vec2(1.6,3.1);
 d=U(d,vec2(bx(vec3(lc*l.x+ls*l.y,-ls*l.x+lc*l.y-.5,q.z-.3),vec3(.05,.5,.05)),3.));
 float rc=.15*exp(-max(T-18.75,0.)*6.)*step(18.75,T);
 d=U(d,vec2(bx(q-vec3(-2.3,3.4,.3),vec3(.35,.25,.25)),8.));
 d=U(d,vec2(bx(q-vec3(-1.85-rc,3.5,.3),vec3(.4,.1,.1)),8.));
 float w=clamp((T-19.)/2.5,0.,1.);
 vec3 bp=mix(vec3(-1.45,3.5,.3),vec3(2.2,5.8,.3),w)+vec3(0,1.5*sin(3.14159*w),0);
 if(T<19.||T>21.5)bp=vec3(0,-30,0);
 d=U(d,vec2(length(q-bp)-.18,8.));
 float f2=sm(25.5,28.5,T),cy=6.5-5.3*f2;
 d=U(d,vec2(T<25.5?bx(q-vec3(0,(9.+cy)/2.,.3),vec3(.03,(9.-cy)/2.,.03)):1e3,4.));
 d=U(d,vec2(length(q-vec3(0,cy,.3))-.55,3.));
 vec3 m=mp(T);
 d=U(d,vec2(length(q-m)-.2,6.));
 float i=clamp(round((q.x-.25)/.17),0.,19.),lx=q.x-.25-.17*i,a2=clamp((T-9.-.2*i)*5.,0.,1.)*1.45,
  cs=cos(a2),sn=sin(a2),yy=q.y-.1;
 d=U(d,vec2(bx(vec3(lx*cs+yy*sn,-lx*sn+yy*cs-.25,q.z-.3),vec3(.03,.25,.12)),5.));
 float tt=clamp((T-15.)/2.25,0.,1.);
 vec3 tp=mix(vec3(3.9,1.3,.3),vec3(1.6,3.7,.3),tt)+vec3(0,2.*sin(3.14159*tt),0);
 if(T<15.||T>17.3)tp=vec3(0,-30,0);
 d=U(d,vec2(bx(q-tp,vec3(.2,.02,.2)),7.));
 return d;}
vec3 C(float i){return i<1.5?vec3(.66,.9,.78):i<2.5?vec3(.98,.6,.55):i<3.5?vec3(.98,.92,.6):i<4.5?vec3(.66,.8,.98):i<5.5?vec3(.99,.97,.9):i<6.5?vec3(1.,.5,.6):i<7.5?vec3(.85,.6,.35):vec3(.9,.3,.35);}
void main(){
 vec2 v=(gl_FragCoord.xy-.5*R)/R.y;
 vec3 ro=E,w=normalize(G-E),u=normalize(cross(w,vec3(0,1,0))),y=cross(u,w),
  rd=normalize(v.x*u+v.y*y+1.7*w),
  bg=mix(vec3(.9,.96,1.),vec3(1.,.93,.95),.5+.5*v.y);
 float t=0.;vec2 h=vec2(0);int k=0;
 for(;k<100;k++){h=M(ro+rd*t);if(h.x<.003*t||t>70.)break;t+=h.x*.8;}
 vec3 p=ro+rd*t,e=vec3(.002,0,0);
 vec3 n=normalize(vec3(M(p+e.xyy).x-M(p-e.xyy).x,M(p+e.yxy).x-M(p-e.yxy).x,M(p+e.yyx).x-M(p-e.yyx).x));
 vec3 c=C(h.y)*(.45+.55*max(dot(n,normalize(vec3(-.5,1,.7))),0.))*(.5+.5*(1.-float(k)/100.));
 if(t>=70.)c=bg;
 else c=mix(c,bg,1.-exp(-t*.025));
 for(int j=0;j<5;j++){float a=T-21.-float(j)*.9;
  if(a>0.&&a<2.2){vec2 d=v-vec2(.35*cos(float(j)*2.4)+.05,.22+.12*sin(float(j)*1.7)),
   q=vec2(length(d),atan(d.y,d.x));float r=a*.3,g=exp(-abs(q.x-r)*60.)+pow(.5+.5*cos(q.y*8.),8.)*exp(-abs(q.x-r)*14.);
   c+=(.5+.5*cos(vec3(0,2,4)+float(j)*1.3))*g*(1.-a/2.2);}}
 c*=1.-smoothstep(56.,61.,T);
 c*=1.-dot(v,v)*.35;
 c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9,78.2)))*43758.5)-.5)*.02;
 o=vec4(c,1);
}
