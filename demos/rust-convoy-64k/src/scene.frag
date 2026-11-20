#version 300 es
precision highp float;
// One raymarched pass: salt flat, dunes, a canyon gap, four vehicles, dust, fire and the post chain.
uniform vec2 R;
uniform float T,ZC,DU,HL,SKI,EQ,EI,TA;
uniform vec3 CP,TP,P0,P1,P2,SD,HA,HB,SK,EXP;
uniform mat3 M;             // camera basis: columns right, up, forward
uniform vec4 DS[4],DA;      // dust sources: xyz centre, w radius; DA = amplitude
uniform vec3 EX[4];         // exhaust flame points
out vec4 O;
const float FF=.8;          // focal length in screen-height units
const vec3 HZ=vec3(.95,.6,.36);

float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cy(vec2 a,float r,float x,float h){vec2 d=vec2(length(a)-r,abs(x)-h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float cp(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
vec2 U2(vec2 a,vec2 b){return a.x<b.x?a:b;}

// ground: flat salt on the road, dunes beyond 14 units, a canyon 14 units deep across the road at z=ZC
float gh(vec2 q){
 float d=smoothstep(14.,30.,abs(q.x))*(3.*sin(q.x*.13+q.y*.03)*sin(q.y*.07-q.x*.05)+4.+2.*sin(q.y*.21));
 return mix(-30.,d,smoothstep(7.,12.,abs(q.y-ZC)));
}
// tanker, local to its base; the trailer swings about a pivot at z=2 (jackknife, angle TA)
vec2 tk(vec3 q){
 vec3 t=q-vec3(0.,0.,2.);
 t.xz=mat2(cos(TA),sin(TA),-sin(TA),cos(TA))*t.xz;
 vec2 r=vec2(bx(q-vec3(0.,1.1,3.2),vec3(1.1,.6,1.1)),2.);
 r=U2(r,vec2(cy(vec2(q.y-.6,q.z-3.2),.6,abs(q.x)-1.3,.3),4.));
 r=U2(r,vec2(cp(t,vec3(0.,1.5,-5.5),vec3(0.,1.5,0.),1.2),3.));
 r=U2(r,vec2(bx(t-vec3(0.,.7,-3.),vec3(1.,.3,3.)),2.));
 r=U2(r,vec2(cy(vec2(t.y-.6,t.z+3.2),.6,abs(t.x)-1.3,.3),4.));
 return r;
}
// war-rig, local to its base: body, cab, spikes, wheels, exhaust stack
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
// bounding sphere first, full vehicle only when close
vec2 vv(vec2 r,vec3 q,vec3 c,float rad,float k){
 float b=length(q-c)-rad;
 if(b>1.){r.x=min(r.x,b);return r;}
 return U2(r,k>.5?tk(q):pu(q));
}
// ids: 0 ground, 2 rust, 3 white tank, 4 tyre, 5 steel, 6 harpoon line
vec2 map(vec3 p){
 vec2 r=vec2(.7*(p.y-gh(p.xz)),0.);
 r=vv(r,p-TP,vec3(0.,1.5,-1.5),7.,1.);
 r=vv(r,p-P0,vec3(0.,1.5,0.),4.5,0.);
 r=vv(r,p-P1,vec3(0.,1.5,0.),4.5,0.);
 r=vv(r,p-P2,vec3(0.,1.5,0.),4.5,0.);
 if(HL>.5)r=U2(r,vec2(cp(p,HA,HB,.05),6.));
 return r;
}
float mt(vec3 ro,vec3 rd,float tm,out float id){
 float t=.05;id=0.;
 for(int i=0;i<160;i++){vec2 h=map(ro+rd*t);if(h.x<.001*t){id=h.y;return t;}t+=h.x;if(t>tm)break;}
 return 1e4;
}
vec3 nrm(vec3 p){vec2 e=vec2(.003,0.);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
float shd(vec3 p){float r=1.,t=.08;for(int i=0;i<22;i++){float h=map(p+SD*t).x;r=min(r,8.*h/t);t+=clamp(h,.15,2.5);if(t>40.)break;}return clamp(r,0.,1.);}
// dust density: soft blobs at the vehicles, plus the smoke of the blast
float dn(vec3 p){
 float s=0.;
 for(int k=0;k<4;k++){vec4 c=DS[k];vec3 q=p-c.xyz;q.y*=1.6;s+=DA[k]*exp(-dot(q,q)/(c.w*c.w));}
 vec3 e=p-EXP;s+=EI*exp(-dot(e,e)/(EQ*EQ*2.))*.6;
 return DU*(.45*s+.02*exp(-max(p.y,0.)*.6));
}
// emitters: exhaust flames, blast fireball, weld sparks
vec3 gg(vec3 p){
 vec3 g=vec3(0.);
 for(int k=0;k<4;k++){vec3 q=p-EX[k];g+=vec3(1.,.42,.1)*exp(-dot(q,q)*2.)*(.6+.4*sin(T*40.+float(k)*2.));}
 vec3 e=p-EXP;g+=EI*vec3(1.,.5,.15)*exp(-dot(e,e)/(EQ*EQ)*1.5)*1.6;
 vec3 q=p-SK;g+=SKI*vec3(1.,.6,.25)*exp(-dot(q,q)*.5)*(.5+.5*fract(sin(dot(p,vec3(12.9,78.2,37.1))+T*60.)*43758.5));
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
 vec3 c=mix(HZ*1.1,vec3(.14,.2,.3),smoothstep(0.,.45,rd.y));
 return c+vec3(1.,.6,.25)*pow(s,5.)*.6+vec3(1.,.9,.7)*pow(s,300.)*4.;
}
vec3 shade(vec3 p,vec3 n,float id,vec3 rd){
 vec3 a;
 if(id<.5){
  vec3 c=abs(p.x)>14.?vec3(.8,.46,.27)*(.85+.15*sin(p.z*.3)):vec3(.93,.88,.8);
  float cr=abs(sin(p.x*.8+sin(p.z*.45)*2.5)*sin(p.z*.6+sin(p.x*.5)*2.));
  a=c*(.8+.2*smoothstep(0.,.25,cr));
 }
 else if(id<2.5)a=vec3(.5,.22,.1)*(.7+.3*sin(p.y*30.+p.z*4.));
 else if(id<3.5)a=abs(p.y-TP.y-1.5)<.2?vec3(.6,.08,.04):vec3(.85,.84,.78);
 else if(id<4.5)a=vec3(.05);
 else a=vec3(.3,.3,.32);
 float d=max(dot(n,SD),0.)*shd(p+n*.02);
 vec3 sun=vec3(1.,.6,.32)*2.4,amb=vec3(.4,.38,.42)*.45*(.6+.4*n.y);
 vec3 c=a*(sun*d+amb);
 c+=sun*pow(max(dot(n,normalize(SD-rd)),0.),40.)*.15*step(1.5,id);
 return c;
}
void main(){
 vec2 fc=gl_FragCoord.xy;
 vec2 uv=(fc-.5*R)/R.y;
 // heat haze: the ray wobbles near the ground
 float hw=smoothstep(.15,-.35,uv.y);
 vec3 rd=normalize(uv.x*M[0]+uv.y*M[1]+FF*M[2]);
 rd=normalize(rd+M[0]*hw*.0035*sin(uv.y*160.+T*9.+sin(uv.x*25.)*3.));
 float id;
 float t=mt(CP,rd,1300.,id);
 vec3 col;
 if(t<1300.){vec3 p=CP+rd*t;col=shade(p,nrm(p),id,rd);col=mix(col,HZ,1.-exp(-t*.0025));}
 else col=sky(rd);
 float tr;
 vec3 vo=vol(CP,rd,min(t,1300.),tr);
 col=col*tr+vo;
 // lens ghosts along the line from the frame centre through the low sun
 float fr=dot(SD,M[2]);
 vec2 s=FF*vec2(dot(SD,M[0]),dot(SD,M[1]))/max(fr,.01);
 float fl=0.;
 for(int i=0;i<4;i++){float a=float(i)*.45-.5;vec2 d=uv-s*a;fl+=exp(-dot(d,d)*(700.+300.*float(i)))*(.4-.08*float(i));}
 col+=fl*vec3(1.,.72,.45)*smoothstep(0.,.3,fr)*1.5;
 // orange/teal grade, filmic curve, vignette, grain
 float l=dot(col,vec3(.3,.59,.11));
 col=mix(col*vec3(.7,1.02,1.1)+vec3(0.,.03,.05),col*vec3(1.12,.96,.8),smoothstep(.1,.8,l));
 col=1.-exp(-col*1.25);
 col*=1.-.35*dot(uv,uv);
 col+=(fract(sin(dot(fc+T*61.,vec2(12.9898,78.233)))*43758.5453)-.5)*.05;
 O=vec4(clamp(col,0.,1.),1.);
}
