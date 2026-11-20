#version 300 es
precision highp float;
uniform vec2 uRes;uniform vec3 uEye,uTgt;uniform float uFocus,uS,uFall,uFire,uBeat;
uniform vec4 uSh[24],uShA[24],uShV[24],uBn[16],uBnA[16],uCa[16],uBd[8],uCr[12],uLf[10];
out vec4 oc;
const vec3 KL=vec3(.119,.9917,.0496),LW=vec3(-.2,.45,-1.),MG=vec3(4.1,.6,-3.45),MR=vec3(-.95,1.85,-1.55),LP=vec3(0.,8.4,-9.2),CH=vec3(-4.5,6.8,-1.),SC1=vec3(9.75,3.2,4.),SC2=vec3(9.75,3.2,-2.),PL=vec3(-8.4,0.,6.);
const vec3 PD[4]=vec3[4](vec3(-4.5,8.4,-3.5),vec3(4.5,8.4,-3.5),vec3(-4.5,8.4,3.5),vec3(4.5,8.4,3.5));
const vec2 ST[5]=vec2[5](vec2(2.7,2.),vec2(3.2,2.),vec2(3.7,2.),vec2(4.6,2.),vec2(5.2,2.));
float h1(float n){return fract(sin(n)*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float n=dot(i,vec3(1.,57.,113.));
 return mix(mix(mix(h1(n),h1(n+1.),f.x),mix(h1(n+57.),h1(n+58.),f.x),f.y),mix(mix(h1(n+113.),h1(n+114.),f.x),mix(h1(n+170.),h1(n+171.),f.x),f.y),f.z);}
float fbm(vec3 p){return .5*n3(p)+.25*n3(p*2.03)+.125*n3(p*4.1)+.0625*n3(p*8.2);}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float sg(vec2 p,vec2 b){return length(p-b*clamp(dot(p,b)/dot(b,b),0.,1.));}
float tor(vec3 p,float R,float r){return length(vec2(length(p.xz)-R,p.y))-r;}
float cyl(vec3 p,float r,float h){return max(length(p.xz)-r,abs(p.y-h)-h);}
vec3 rod(vec3 p,vec3 k,float a){return p*cos(a)+cross(k,p)*sin(a)+k*dot(k,p)*(1.-cos(a));}
vec2 U(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec2 M(vec3 p){
 vec2 r=vec2(p.y,0.);
 r=U(r,vec2(max(min(10.-abs(p.x),min(8.-p.z,p.z+10.)),p.y-9.),1.));
 vec2 cc=mod(p.xz+1.5,3.)-1.5;
 float cof=max(max(abs(cc.x)-1.1,abs(cc.y)-1.1),abs(p.y-9.075)-.075);
 r=U(r,vec2(max(max(abs(p.y-9.2)-.2,-max(abs(p.x-.6)-2.5,abs(p.z)-2.5)),-cof),1.));
 vec3 q=p;q.z-=6.*floor(p.z/6.+.5);
 r=U(r,vec2(max(length(vec2(abs(p.x)-7.,q.z))-.6,abs(p.y-4.5)-4.5),1.));
 r=U(r,vec2(box(vec3(abs(p.x)-5.8,p.y-4.5,p.z+9.8),vec3(.35,4.5,.2)),1.));
 r=U(r,vec2(box(p-vec3(0.,6.8,-9.85),vec3(1.6,.5,.05)),4.));
 r=U(r,vec2(box(p-vec3(4.,.5,2.),vec3(1.5,.5,.4)),2.));
 r=U(r,vec2(box(p-vec3(4.,1.02,2.),vec3(1.55,.04,.45)),1.));
 r=U(r,vec2(box(p-vec3(3.,.85,2.95),vec3(.5,.1,.25)),2.));
 r=U(r,vec2(max(length(p.xz-vec2(5.1,2.2))-.07,abs(p.y-1.2)-.12),1.));
 if(p.y>1.05&&p.y<1.3&&p.x>2.4&&p.x<5.6){for(int i=0;i<5;i++)r=U(r,vec2(box(p-vec3(ST[i],1.13).xzy,vec3(.14,.04,.1)),6.));}
 if(p.y>1.05&&p.y<2.3&&p.x>2.4&&p.x<5.6&&abs(p.z-2.)<.5){
  float mx=mod(p.x-2.5,.75)-.375;
  r=U(r,vec2(box(vec3(mx,p.y-1.65,p.z-2.),vec3(.02,.6,.03)),4.));
  r=U(r,vec2(box(vec3(p.x-4.,p.y-2.2,p.z-2.),vec3(1.55,.03,.03)),4.));
  r=U(r,vec2(box(vec3(p.x-4.,p.y-1.6,p.z-2.),vec3(1.55,.6,.005)),3.));
 }
 if(p.x>8.7&&abs(p.z)<6.&&p.y>.4&&p.y<4.6){
  vec3 c=vec3(p.x-9.75,mod(p.y-.4,.6)-.3,mod(p.z+6.,1.)-.5);
  r=U(r,vec2(box(c,vec3(.25,.24,.42))-.02,4.));
  r=U(r,vec2(box(vec3(p.x-9.98,mod(p.y-.4,.6)-.3,mod(p.z+6.,1.)-.5),vec3(.02,.02,.1)),2.));
 }
 if(p.x<-8.2&&p.z<-1.&&p.z>-8.)r=U(r,vec2(box(vec3(p.x+8.9,p.y-1.1,mod(p.z+4.5,1.6)-.8),vec3(.45,1.1,.7))-.02,2.));
 r=U(r,vec2(max(length(p.xz-PL.xz)-.35,abs(p.y-.35)-.35),1.));
 float pl=length(p-PL-vec3(0.,1.4,0.))-1.2;
 if(pl<r.x){for(int i=0;i<10;i++){vec4 l=uLf[i];r=U(r,vec2(length((p-l.xyz)*vec3(1.,1.6,1.))-l.w,2.));}}
 vec3 rp=p-vec3(0.,0.,5.5);
 r=U(r,vec2(max(length(rp.xz-vec2(-1.,0.))-.05,abs(p.y-.5)-.5),4.));
 r=U(r,vec2(max(length(rp.xz-vec2(-2.8,0.))-.05,abs(p.y-.5)-.5),4.));
 r=U(r,vec2(max(length(rp.xz-vec2(-4.6,0.))-.05,abs(p.y-.5)-.5),4.));
 r=U(r,vec2(min(cap(p,vec3(-1.,1.,5.5),vec3(-1.9,.8,5.5),.02),cap(p,vec3(-1.9,.8,5.5),vec3(-2.8,1.,5.5),.02)),2.));
 r=U(r,vec2(min(cap(p,vec3(-2.8,1.,5.5),vec3(-3.7,.8,5.5),.02),cap(p,vec3(-3.7,.8,5.5),vec3(-4.6,1.,5.5),.02)),2.));
 r=U(r,vec2(box(p-vec3(-6.5,.37,2.2),vec3(1.,.37,.42)),2.));
 r=U(r,vec2(box(p-vec3(-6.5,.76,2.2),vec3(1.1,.03,.5)),1.));
 r=U(r,vec2(box(p-vec3(-5.7,.45,3.4),vec3(.25,.03,.25)),2.));
 r=U(r,vec2(box(p-vec3(-5.7,.9,3.6),vec3(.25,.45,.03)),2.));
 r=U(r,vec2(min(cap(p,vec3(-5.9,0.,3.2),vec3(-5.9,.42,3.2),.02),cap(p,vec3(-5.5,0.,3.6),vec3(-5.5,.42,3.6),.02)),2.));
 vec3 cq=rod(p-vec3(1.2,.2,-4.2),vec3(0.,0.,1.),1.4);
 r=U(r,vec2(min(box(cq,vec3(.25,.03,.25)),box(cq-vec3(0.,.4,.25),vec3(.03,.4,.25))),2.));
 r=U(r,vec2(max(length(p.xz-vec2(0.,-4.))-2.,abs(p.y-.005)-.005),4.));
 for(int i=0;i<4;i++){vec3 d=PD[i];
  if(p.y>7.&&length(p.xz-d.xz)<.8){r=U(r,vec2(cap(p,vec3(d.x,9.,d.z),vec3(d.x,8.6,d.z),.02),2.));r=U(r,vec2(length(p-d)-.25,9.));}}
 vec3 h=p-vec3(-2.2,2.2,-9.6);
 vec3 dq=vec3(h.x*.9004+h.z*.435,h.y,-h.x*.435+h.z*.9004)-vec3(2.2,0.,0.);
 r=U(r,vec2(box(p-vec3(0.,2.2,-9.9),vec3(2.2,2.2,.05)),2.));
 r=U(r,vec2(box(dq,vec3(2.2,2.2,.1)),4.));
 r=U(r,vec2(length(vec2(length(dq.xy)-.9,dq.z-.12))-.06,4.));
 r=U(r,vec2(length(p-LP)-.28,5.));
 r=U(r,vec2(box(p-vec3(5.8,8.5,-9.6),vec3(.3,.2,.2)),2.));
 r=U(r,vec2(length(p-vec3(5.5,8.3,-9.35))-.08,5.));
 r=U(r,vec2(length(p-vec3(-.2,7.9,7.2))-.06,5.));
 vec3 k=p-vec3(-9.9,5.4,-2.);
 r=U(r,vec2(max(length(k.yz)-1.2,abs(k.x)-.1),7.));
 float hd=min(sg(k.zy,vec2(.78,.45)),min(sg(k.zy,vec2(-.52,.3)),sg(k.zy,vec2(0.,1.05))));
 r=U(r,vec2(max(hd-.035,abs(k.x)-.14),2.));
 float cb=length(p-CH)-2.4;
 if(cb<r.x){
  r=U(r,vec2(tor(p-CH,1.2,.05),4.));
  for(int i=0;i<12;i++){vec4 c=uCr[i];r=U(r,vec2(length(p-vec3(c.x,max(c.y-uFall,.3),c.z))-c.w,3.));}
  for(int i=0;i<4;i++){float a=float(i)*1.5708+.785;r=U(r,vec2(cap(p,vec3(CH.x+1.2*cos(a),9.,CH.z+1.2*sin(a)),vec3(CH.x+1.2*cos(a),CH.y+1.,CH.z+1.2*sin(a)),.012),4.));}
 }
 float gb=length(p-vec3(1.6,1.5,-2.))-3.3;
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
 float rb=length(p-vec3(-2.6,1.6,-1.2))-2.6;
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
 r=U(r,vec2(box(p-vec3(-1.8,.03,.5),vec3(.12,.03,.05)),2.));
 r=U(r,vec2(cap(p,vec3(-1.6,.04,.5),vec3(-1.45,.08,.46),.02),2.));
 float tb=length(p-vec3(4.1,.6,1.))-1.1;
 if(tb<r.x){
  float g=cap(p,vec3(4.1,.35,1.),vec3(4.1,.9,.95),.22);
  g=min(g,length(p-vec3(4.15,1.12,.95))-.18);
  g=min(g,cap(p,vec3(4.25,.9,1.25),vec3(4.2,1.22,1.1),.07));
  g=min(g,cap(p,vec3(3.95,.9,1.25),vec3(4.,1.2,1.1),.07));
  g=min(g,cap(p,vec3(4.,.3,1.),vec3(3.6,.1,1.),.13));
  r=U(r,vec2(g,2.));
 }
 float sb=length(p-vec3(-5.2,1.6,-5.5))-2.1;
 if(sb<r.x){
  float g=length(p-vec3(-5.2,2.85,-5.5))-.19;
  g=min(g,cap(p,vec3(-5.2,2.35,-5.5),vec3(-5.2,1.4,-5.5),.3));
  g=min(g,cap(p,vec3(-5.35,1.35,-5.5),vec3(-5.4,.1,-5.4),.15));
  g=min(g,cap(p,vec3(-5.05,1.35,-5.5),vec3(-5.,.1,-5.6),.15));
  g=min(g,cap(p,vec3(-5.1,2.25,-5.5),vec3(-4.6,3.1,-5.2),.09));
  g=min(g,cap(p,vec3(-5.3,2.25,-5.5),vec3(-5.9,1.9,-5.7),.09));
  g=min(g,cap(p,vec3(-4.6,3.1,-5.2),vec3(-4.45,3.25,-5.1),.05));
  r=U(r,vec2(g,2.));
 }
 vec3 mb=(p-vec3(-6.2,.45,-1.2))*vec3(1.,1.5,1.);
 r=U(r,vec2(min(length(mb)-.4,tor(p-vec3(-6.2,.9,-1.2),.2,.03)),6.));
 r=U(r,vec2(max(length((p.xz-vec2(2.9,-2.7))*vec2(1.,1.4))-.5,abs(p.y-.01)-.01),8.));
 for(int i=0;i<8;i++){vec4 b=uBd[i];r=U(r,vec2(length(p-b.xyz+vec3(0.,min(uFall,1.),0.))-b.w,8.));}
 vec3 dr=p-vec3(0.,0.,7.5);
 if(length(dr.xz)<2.2&&p.y<4.4){
  r=U(r,vec2(tor(dr-vec3(0.,2.2,0.),1.6,.05),4.));
  float a=uS*.02;
  for(int i=0;i<4;i++){float ang=a+float(i)*1.5708;vec3 w=rod(dr-vec3(0.,2.2,0.),vec3(0.,1.,0.),ang);
   r=U(r,vec2(box(w-vec3(.8,0.,0.),vec3(.8,1.05,.03)),3.));}
 }
 float shb=length(p-vec3(.6,6.3,0.))-5.;
 if(shb<r.x||uFall>0.){
  for(int i=0;i<24;i++){vec4 s=uSh[i],a=uShA[i];
   vec3 c=s.xyz+uShV[i].xyz*uS;c.y=max(c.y-uFall,.05);
   r=U(r,vec2(box(rod(p-c,a.xyz,s.w*6.283+uS*a.w),vec3(.08,.004,.1)),3.));}
 }
 float nb=length(p-vec3(0.,3.8,-1.))-6.6;
 if(nb<r.x||uFall>0.){
  for(int i=0;i<16;i++){vec4 b=uBn[i],a=uBnA[i];
   vec3 c=vec3(b.x,max(b.y-uFall,.05),b.z);
   r=U(r,vec2(box(rod(p-c,a.xyz,b.w*6.283+uS*a.w),vec3(.17,.004,.09)),6.));}
 }
 if(p.y<2.){
  for(int i=0;i<16;i++){vec4 b=uCa[i];vec3 q=p-b.xyz;float c=cos(b.w*6.283),s=sin(b.w*6.283);q.xz=mat2(c,-s,s,c)*q.xz;
   r=U(r,vec2(box(q,vec3(.12,.035,.035)),4.));}
 }
 return r;
}
vec3 nrm(vec3 p){const vec2 e=vec2(.001,-.001);
 return normalize(e.xyy*M(p+e.xyy).x+e.yyx*M(p+e.yyx).x+e.yxy*M(p+e.yxy).x+e.xxx*M(p+e.xxx).x);}
float mar(vec3 ro,vec3 rd,float tm,out float mt){float t=.01;
 for(int i=0;i<110;i++){vec2 h=M(ro+rd*t);if(h.x<.0008*t){mt=h.y;return t;}t+=min(h.x,.6);if(t>tm)break;}
 return -1.;}
float shd(vec3 p){float res=1.,t=.06;
 for(int i=0;i<36;i++){float d=M(p+KL*t).x;res=min(res,10.*d/t);t+=clamp(d,.03,.6);if(t>16.)break;}
 return clamp(res,0.,1.);}
float ao(vec3 p,vec3 n){float o=0.,s=1.;
 for(int i=1;i<5;i++){float h=.09*float(i);o+=(h-M(p+n*h).x)*s;s*=.75;}
 return clamp(1.-1.6*o,0.,1.);}
vec3 alb(vec3 p,float m,out float sp){sp=0.;
 if(m<.5){float tl=mod(floor(p.x*.5)+floor(p.z*.5),2.);float v=abs(sin(3.*(p.x+p.z)+6.*fbm(p*.7)));
  float crack=1.-smoothstep(0.,.02,abs(fbm(p*2.3)-.5));
  float inl=step(abs(abs(p.x)-8.),.05)+step(abs(length(p.xz-vec2(0.,-4.))-2.),.04);
  sp=.5;
  return mix(vec3(.8+.07*tl)*mix(.45,1.,smoothstep(0.,.12,v))*(1.-.5*crack),vec3(.6,.5,.3),clamp(inl,0.,1.));}
 if(m<1.5){float v=abs(sin(2.*p.y+3.*p.x+5.*fbm(p*.5)));float hole=step(.997,h1(dot(floor(p.xz*.7),vec2(12.,7.))));
  float fz=abs(abs(p.x)-7.)<.6&&p.y<8.?.85+.15*sin(p.y*40.):1.;
  sp=.2;return vec3(.9)*mix(.55,1.,smoothstep(0.,.15,v))*(1.-.7*hole)*fz;}
 if(m<2.5){sp=.3;return vec3(.05);}
 if(m<3.5){sp=1.;return vec3(1.);}
 if(m<4.5){sp=.9;return vec3(.55)*(.9+.1*sin(p.x*60.+p.y*30.));}
 if(m<5.5)return vec3(1.,.03,.02);
 if(m<6.5){sp=.1;return vec3(.92);}
 if(m<7.5)return vec3(.95);
 if(m<8.5){sp=.6;return vec3(.5,.01,.01);}
 return vec3(1.);}
vec3 lit(vec3 p,vec3 n,float m,vec3 rd,float sh,float ao){
 float sp;vec3 al=alb(p,m,sp);
 if(m>4.5&&m<5.5)return al*(2.2+.6*uBeat);
 if(m>8.5)return al*3.;
 float dif=max(dot(n,KL),0.)*sh;
 vec3 c=al*(vec3(.07,.07,.075)*ao+vec3(1.,.97,.93)*dif*1.1+vec3(.9,.92,.95)*max(dot(n,normalize(LW)),0.)*.2);
 vec3 v=MG-p;float d2=dot(v,v);
 c+=al*uFire*vec3(1.,.95,.9)*max(dot(n,normalize(v)),0.)*1.2/(1.+d2);
 v=MR-p;d2=dot(v,v);
 c+=al*uFire*vec3(1.,.95,.9)*max(dot(n,normalize(v)),0.)*1.2/(1.+d2);
 v=LP-p;d2=dot(v,v);
 c+=al*vec3(1.,.04,.02)*max(dot(n,normalize(v)),0.)*(3.2+uBeat)/(1.+.05*d2);
 v=SC1-p;d2=dot(v,v);c+=al*vec3(1.,.95,.88)*max(dot(n,normalize(v)),0.)*.9/(1.+d2);
 v=SC2-p;d2=dot(v,v);c+=al*vec3(1.,.95,.88)*max(dot(n,normalize(v)),0.)*.9/(1.+d2);
 c+=vec3(1.)*sp*pow(max(dot(n,normalize(KL-rd)),0.),40.)*dif*.8;
 return c;}
vec3 shade(vec3 p,vec3 n,float m,vec3 rd){
 if(m<1.5&&m>.5)n=normalize(n+.05*(vec3(n3(p*9.),n3(p*9.+7.),n3(p*9.+13.))-.5));
 vec3 c=lit(p,n,m,rd,shd(p+n*.01),ao(p,n));
 if(m<.5){float mt;vec3 rr=reflect(rd,n);float t=mar(p+n*.01,rr,30.,mt);
  if(t>0.){vec3 q=p+rr*t;c+=lit(q,nrm(q),mt,rr,1.,1.)*.1;}}
 return c;}
vec3 fl(vec3 p,vec3 F,float k){vec3 v=p-F;float d2=dot(v,v);
 return k*(vec3(1.,.97,.92)*(.012/(.01+d2)+.03/(.25+d2))+vec3(1.,.02,.01)*.02/(.0008+d2)+vec3(.45)*exp(-d2*2.5)*n3(p*3.+vec3(0.,-uS*.1,0.))*.3);}
vec3 plume(vec3 p,vec3 F){vec2 d=p.xz-F.xz;float r=.12+.3*max(p.y-F.y,0.);
 float den=exp(-dot(d,d)/(r*r))*smoothstep(F.y-.2,F.y+.5,p.y)*(1.-smoothstep(F.y+1.5,F.y+4.,p.y));
 return vec3(.42)*den*(.5+.5*n3(p*vec3(3.,1.,3.)+vec3(0.,-uS*.3,0.)))*.05;}
vec3 vol(vec3 p){
 vec3 c=vec3(0.);
 if(p.y<9.){float s=(9.-p.y)/KL.y;vec2 hp=vec2(p.x+s*KL.x,p.z+s*KL.z)-vec2(.6,0.);
  float e=max(abs(hp.x)-2.5,abs(hp.y)-2.5);
  float sh=(1.-smoothstep(-.6,.6,e))*(.3+.7*n3(p*vec3(1.,.5,1.)*1.5+vec3(0.,uS*.05,0.)));
  c+=vec3(1.,.98,.95)*sh*.022+vec3(1.)*sh*smoothstep(.72,.8,n3(p*8.+vec3(0.,uS*.2,0.)))*.5;}
 vec3 v=p-LP;c+=vec3(1.,.02,.01)*(.05/(.1+dot(v,v)))*(.7+.3*uBeat);
 v=SC1-p;c+=vec3(1.,.95,.88)*.03/(.2+dot(v,v));
 v=SC2-p;c+=vec3(1.,.95,.88)*.03/(.2+dot(v,v));
 for(int i=0;i<4;i++){v=PD[i]-p;c+=vec3(1.,.93,.85)*.02/(.2+dot(v,v));}
 c+=fl(p,MG,uFire)+fl(p,MR,uFire);
 c+=plume(p,MG)+plume(p,MR);
 c+=vec3(.5)*smoothstep(7.,9.,p.y)*.012*n3(p*1.5);
 c+=vec3(.8)*smoothstep(.88,.9,n3(p*12.+vec3(0.,uS*.1,0.)))*.12*step(p.y,8.);
 return c;}
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
