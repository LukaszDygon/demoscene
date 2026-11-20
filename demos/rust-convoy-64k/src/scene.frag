#version 300 es
precision highp float;
uniform vec2 R;
uniform float T,ZC,DU,HL,SKI,EQ,EI,NI,CI,OA,ZO,LT,HI,FG;
uniform vec3 CP,SD,HA,HB,SK,EXP,FA,FB,H1,H2;
uniform mat3 M;
uniform vec4 VA[5],VB[5],DS[10];
uniform float DAm[10],EF[8];
uniform vec3 EX[8];
out vec4 O;
const float FF=.8;
const vec3 HZ=vec3(.95,.6,.36);
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.)),f.x),f.y);}
vec2 vor(vec2 p){
 vec2 i=floor(p),f=fract(p),d=vec2(8.);
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
  vec2 g=vec2(float(x),float(y)),o=vec2(h21(i+g),h21(i+g+vec2(3.1,7.7)));
  float q=length(g+o-f);
  if(q<d.x){d.y=d.x;d.x=q;}else if(q<d.y)d.y=q;
 }
 return d;
}
mat2 R2(float a){return mat2(cos(a),sin(a),-sin(a),cos(a));}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cy(vec2 a,float r,float x,float h){vec2 d=vec2(length(a)-r,abs(x)-h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float cp(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
vec2 U2(vec2 a,vec2 b){return a.x<b.x?a:b;}
float gh(vec2 q){
 float r=smoothstep(14.,30.,abs(q.x));
 float d=r*(3.*sin(q.x*.13+q.y*.03)*sin(q.y*.07-q.x*.05)+4.+2.*sin(q.y*.21)+3.*(1.-abs(sin(q.x*.05+q.y*.02)))*r);
 return mix(-30.,d,smoothstep(7.,12.,abs(q.y-ZC)));
}
vec3 rl(vec3 q,float a){q.y-=1.;q.xy=R2(a)*q.xy;q.y+=1.;return q;}
vec2 tk(vec3 q,float ja){
 vec3 t=q-vec3(0.,0.,2.);
 t.xz=mat2(cos(ja),sin(ja),-sin(ja),cos(ja))*t.xz;
 vec2 r=vec2(bx(q-vec3(0.,1.1,3.2),vec3(1.1,.6,1.1)),2.);
 r=U2(r,vec2(cy(vec2(q.y-.6,q.z-3.2),.6,abs(q.x)-1.3,.3),4.));
 r=U2(r,vec2(cp(t,vec3(0.,1.5,-5.5),vec3(0.,1.5,0.),1.2),3.));
 r=U2(r,vec2(bx(t-vec3(0.,.7,-3.),vec3(1.,.3,3.)),2.));
 r=U2(r,vec2(cy(vec2(t.y-.6,t.z+3.2),.6,abs(t.x)-1.3,.3),4.));
 r=U2(r,vec2(bx(q-vec3(0.,2.5,3.6),vec3(.5,.25,.3)),4.));
 return r;
}
vec2 pu(vec3 q){
 vec2 r=vec2(bx(q-vec3(0.,1.35,0.),vec3(1.4,.55,2.6)),2.);
 r=U2(r,vec2(bx(q-vec3(0.,2.2,1.4),vec3(1.2,.45,1.2)),2.));
 vec3 s=q-vec3(0.,1.3,0.);s.z=mod(s.z+1.3,2.6)-1.3;
 r=U2(r,vec2(max(bx(s,vec3(1.9,.07,.07)),abs(q.z)-2.6),5.));
 r=U2(r,vec2(cy(vec2(q.y-.55,q.z+1.6),.55,abs(q.x)-1.5,.35),4.));
 r=U2(r,vec2(cy(vec2(q.y-.55,q.z-1.6),.55,abs(q.x)-1.5,.35),4.));
 r=U2(r,vec2(max(length(q.xz-vec2(1.2,-2.3))-.12,abs(q.y-2.6)-1.2),5.));
 return r;
}
vec2 fl(vec3 q){
 vec2 r=vec2(bx(q-vec3(0.,.9,0.),vec3(1.2,.45,2.2)),2.);
 vec3 s=q-vec3(0.,1.6,0.);s.x=mod(s.x+.4,.8)-.4;
 r=U2(r,vec2(max(bx(s,vec3(.04,.9,2.2)),abs(q.x)-1.25),5.));
 r=U2(r,vec2(bx(q-vec3(0.,2.5,0.),vec3(1.25,.06,2.25)),5.));
 r=U2(r,vec2(cy(vec2(q.y-1.4,q.x),.16,q.z-3.,.5),5.));
 r=U2(r,vec2(cy(vec2(q.y-.45,q.z+1.5),.45,abs(q.x)-1.2,.3),4.));
 r=U2(r,vec2(cy(vec2(q.y-.45,q.z-1.5),.45,abs(q.x)-1.2,.3),4.));
 return r;
}
vec2 bg(vec3 q){
 vec2 r=vec2(bx(q-vec3(0.,.9,0.),vec3(1.3,.35,1.8)),2.);
 r=U2(r,vec2(bx(q-vec3(0.,1.6,-.2),vec3(.08,.7,.08)),5.));
 r=U2(r,vec2(bx(q-vec3(0.,2.3,-.2),vec3(1.2,.06,.8)),5.));
 r=U2(r,vec2(cy(vec2(q.y-.45,q.z+1.2),.45,abs(q.x)-1.3,.25),4.));
 r=U2(r,vec2(cy(vec2(q.y-.45,q.z-1.2),.45,abs(q.x)-1.3,.25),4.));
 return r;
}
vec2 veh(vec3 q,float k,float ja){return k<.5?tk(q,ja):k<1.5?pu(q):k<2.5?fl(q):bg(q);}
vec2 vv(vec2 r,vec3 q,float k,float ja){
 float rad=k<.5?7.:4.5;
 vec3 c=k<.5?vec3(0.,1.5,-1.5):vec3(0.,1.2,0.);
 float b=length(q-c)-rad;
 if(b>1.){r.x=min(r.x,b);return r;}
 return U2(r,veh(q,k,ja));
}
vec2 man(vec3 p,vec3 b){
 float d=min(cp(p,b,b+vec3(0.,1.5,0.),.22),min(cp(p,b+vec3(0.,1.5,0.),b+vec3(0.,2.1,0.),.2),cp(p,b+vec3(0.,1.2,0.),b+vec3(.6,1.6+.3*sin(T*9.),0.),.09)));
 return vec2(d,4.);
}
vec2 dp(vec3 p){
 vec3 q=p-vec3(0.,0.,-92.);
 vec2 r=vec2(bx(q-vec3(0.,4.,0.),vec3(26.,4.,1.)),2.);
 vec3 c=q;c.x=mod(c.x+1.5,3.)-1.5;
 r=U2(r,vec2(max(bx(c-vec3(0.,8.6,0.),vec3(.8,.6,1.)),abs(q.x)-26.),2.));
 r=U2(r,vec2(bx(p-vec3(-8.,6.,-84.),vec3(.5,6.,.5)),5.));
 r=U2(r,vec2(bx(p-vec3(8.,6.,-84.),vec3(.5,6.,.5)),5.));
 r=U2(r,vec2(bx(p-vec3(0.,12.,-84.),vec3(8.5,.5,.5)),5.));
 r=U2(r,vec2(bx(p-vec3(6.,11.,-84.),vec3(.4,.4,3.)),5.));
 r=U2(r,vec2(max(length(p.xz-vec2(-14.,-98.))-.6,abs(p.y-7.)-7.),5.));
 r=U2(r,vec2(max(length(p.xz-vec2(-18.,-98.))-.6,abs(p.y-7.)-7.),5.));
 r=U2(r,vec2(bx(p-vec3(-22.,7.,-92.),vec3(.12,7.,.12)),5.));
 r=U2(r,vec2(bx(p-vec3(-20.5,13.,-92.),vec3(1.5,.9,.05)),3.));
 r=U2(r,vec2(cy(vec2(p.y-4.,p.z+75.),3.,p.x+12.,4.),5.));
 return r;
}
vec2 ct(vec3 p){
 vec2 r=vec2(1e3,0.);
 float id=floor((p.z+11.)/22.),k=h21(vec2(id,sign(p.x)));
 if(k>.35){
  vec3 h=vec3(abs(p.x)-9.5,p.y,mod(p.z+11.,22.)-11.);
  h.xy=R2((k-.5)*.5)*h.xy;
  r=U2(r,vec2(min(bx(h-vec3(0.,.9,0.),vec3(1.6,.8,2.4)),bx(h-vec3(0.,2.1,-.3),vec3(1.2,.6,1.2))),2.));
 }
 vec3 b=p;b.z=mod(p.z+15.,30.)-15.;b.x=abs(p.x)-14.;
 r=U2(r,vec2(min(bx(b-vec3(0.,4.,0.),vec3(.12,4.,.12)),bx(b-vec3(0.,7.,0.),vec3(2.4,1.5,.08))),3.));
 vec3 u=p-vec3(0.,9.,ZO),d=u;d.xy=R2(-OA)*u.xy;
 r=U2(r,vec2(bx(d-vec3(-4.5,0.,0.),vec3(4.5,.4,1.5)),2.));
 r=U2(r,vec2(bx(p-vec3(-8.,4.5,ZO),vec3(.6,4.6,.6)),2.));
 r=U2(r,vec2(bx(p-vec3(8.,4.5,ZO),vec3(.6,4.6,.6)),2.));
 return r;
}
vec2 map(vec3 p){
 vec2 r=vec2(.7*(p.y-gh(p.xz)),0.);
 for(int i=0;i<5;i++)r=vv(r,rl(p-VA[i].xyz,VA[i].w),VB[i].x,VB[i].y);
 r=U2(r,man(p,FA));r=U2(r,man(p,FB));
 if(HL>.5)r=U2(r,vec2(cp(p,HA,HB,.05),6.));
 if(p.z<-20.)r=U2(r,dp(p));
 if(CI>.5)r=U2(r,ct(p));
 return r;
}
float mt(vec3 ro,vec3 rd,float tm,out float id){
 float t=.05;id=0.;
 for(int i=0;i<160;i++){vec2 h=map(ro+rd*t);if(h.x<.001*t){id=h.y;return t;}t+=h.x;if(t>tm)break;}
 return 1e4;
}
vec3 nrm(vec3 p){vec2 e=vec2(.003,0.);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
float shd(vec3 p){float r=1.,t=.08;for(int i=0;i<22;i++){float h=map(p+SD*t).x;r=min(r,8.*h/t);t+=clamp(h,.15,2.5);if(t>40.)break;}return clamp(r,0.,1.);}
float dn(vec3 p){
 float s=0.;
 for(int k=0;k<10;k++){vec4 c=DS[k];vec3 q=p-c.xyz;q.y*=1.6;s+=DAm[k]*exp(-dot(q,q)/(c.w*c.w));}
 vec3 e=p-EXP;s+=EI*exp(-dot(e,e)/(EQ*EQ*2.))*.6;
 return DU*(.45*s*(.6+.4*vn(p.xz*.08+vec2(T*.05,p.y*.1)))+.02*exp(-max(p.y,0.)*.6));
}
vec3 gg(vec3 p){
 vec3 g=vec3(0.);
 for(int k=0;k<8;k++){vec3 q=p-EX[k];g+=vec3(1.,.42,.1)*EF[k]*exp(-dot(q,q)*2.)*(.6+.4*sin(T*40.+float(k)*2.));}
 vec3 e=p-EXP;g+=EI*vec3(1.,.5,.15)*exp(-dot(e,e)/(EQ*EQ)*1.5)*1.6;
 vec3 q=p-SK;g+=SKI*vec3(1.,.6,.25)*exp(-dot(q,q)*.5)*(.5+.5*fract(sin(dot(p,vec3(12.9,78.2,37.1))+T*60.)*43758.5));
 vec3 h1=p-H1,h2=p-H2;
 g+=HI*vec3(1.,.95,.8)*.6*(exp(-dot(h1.xy,h1.xy)*5.)*step(0.,h1.z)*exp(-h1.z*.05)+exp(-dot(h2.xy,h2.xy)*5.)*step(0.,h2.z)*exp(-h2.z*.05));
 g+=NI*vec3(1.,.5,.15)*step(.994,h21(floor(p.xz*1.7+vec2(p.y*2.+T*2.,0.))))*exp(-dot(e,e)*.01)*4.;
 return g;
}
vec3 vol(vec3 ro,vec3 rd,float tm,out float tr){
 vec3 acc=vec3(0.);tr=1.;float tp=0.;
 vec3 lc=mix(vec3(.5,.3,.2),vec3(1.,.7,.4),.5+.5*dot(rd,SD));
 for(int i=1;i<=28;i++){
  float t=tm*pow(float(i)/28.,2.);
  float dt=t-tp;tp=t;
  vec3 p=ro+rd*(t-.5*dt);
  float d=dn(p)*dt;
  acc+=tr*(1.-exp(-d))*lc;tr*=exp(-d);
  acc+=tr*gg(p)*dt;
 }
 return acc;
}
vec3 sky(vec3 rd){
 float s=max(dot(rd,SD),0.);
 vec3 hz=HZ*(1.-.8*NI);
 vec3 c=mix(hz*1.1,mix(vec3(.14,.2,.3),vec3(.01,.015,.04),NI),smoothstep(0.,.45,rd.y));
 c+=(vec3(1.,.6,.25)*pow(s,5.)*.6+vec3(1.,.9,.7)*pow(s,300.)*4.)*(1.-NI);
 float st=step(.9965,h21(floor(rd.xz*400.)+vec2(floor(rd.y*400.)*.37)))*NI*max(rd.y,0.)*1.5;
 return c+st;
}
vec3 shade(vec3 p,vec3 n,float id,vec3 rd){
 vec3 a;
 if(id<.5){
  if(p.y<-.3&&abs(p.z-ZC)>7.5){float b=floor(p.y*1.4);a=mix(vec3(.55,.28,.15),vec3(.85,.58,.38),h21(vec2(b,3.)))*(.85+.15*sin(p.x*.5+b));}
  else if(abs(p.x)>14.){a=vec3(.78,.46,.27)*(.85+.15*sin(p.z*.3+sin(p.x*.4)));}
  else{vec2 v=vor(p.xz*.55);float e=v.y-v.x;a=vec3(.93,.9,.84)*(.9+.1*h21(floor(p.xz*.55)))*(1.-.5*(1.-smoothstep(0.,.08,e)));}
 }
 else if(id<2.5)a=vec3(.5,.22,.1)*(.7+.3*sin(p.y*30.+p.z*4.));
 else if(id<3.5)a=abs(p.y-VA[0].y-1.5)<.2?vec3(.6,.08,.04):vec3(.85,.84,.78);
 else if(id<4.5)a=vec3(.06);
 else a=vec3(.32,.31,.3);
 float d=max(dot(n,SD),0.)*shd(p+n*.02)*(1.-.85*NI);
 vec3 sun=vec3(1.,.6,.32)*2.4,amb=mix(vec3(.4,.38,.42)*.45,vec3(.05,.07,.12),NI)*(.6+.4*n.y);
 vec3 c=a*(sun*d+amb);
 c+=sun*pow(max(dot(n,normalize(SD-rd)),0.),40.)*.15*step(4.5,id);
 return c;
}
void main(){
 vec2 fc=gl_FragCoord.xy;
 vec2 uv=(fc-.5*R)/R.y;
 float hw=smoothstep(.15,-.35,uv.y);
 vec3 rd=normalize(uv.x*M[0]+uv.y*M[1]+FF*M[2]);
 rd=normalize(rd+M[0]*hw*.0035*sin(uv.y*160.+T*9.+sin(uv.x*25.)*3.));
 float id;
 float t=mt(CP,rd,1300.,id);
 vec3 col;
 if(t<1300.){vec3 p=CP+rd*t;col=shade(p,nrm(p),id,rd);col=mix(col,HZ*(1.-.8*NI),1.-exp(-t*FG));}
 else col=sky(rd);
 float tr;
 vec3 vo=vol(CP,rd,min(t,1300.),tr);
 col=col*tr+vo+LT*vec3(.5,.6,.8);
 float fr=dot(SD,M[2]);
 vec2 s=FF*vec2(dot(SD,M[0]),dot(SD,M[1]))/max(fr,.01);
 vec3 lf=vec3(0.);
 for(int i=0;i<7;i++){
  float f=float(i);
  vec2 g=uv-s*(f*.2-.6);
  float q=length(g);
  lf+=exp(-q*q*(600.+200.*f))*vec3(1.,.5+.05*f,.3+.08*f)*(.5-.04*f);
  lf+=vec3(.8,.9,1.)*exp(-pow((q-.05*(f+1.))/.01,2.))*.15;
 }
 lf+=vec3(1.,.8,.5)*.25*(exp(-abs(uv.x-s.x)*60.)+exp(-abs(uv.y-s.y)*60.))*exp(-length(uv-s)*3.);
 col+=lf*smoothstep(0.,.3,fr)*1.5*(1.-NI);
 float l=dot(col,vec3(.3,.59,.11));
 col=mix(col*vec3(.7,1.02,1.1)+vec3(0.,.03,.05),col*vec3(1.12,.96,.8),smoothstep(.1,.8,l));
 col=1.-exp(-col*1.25);
 col*=1.-.35*dot(uv,uv);
 col+=(fract(sin(dot(fc+T*61.,vec2(12.9898,78.233)))*43758.5453)-.5)*.05;
 O=vec4(clamp(col,0.,1.),1.);
}
