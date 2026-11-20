#version 300 es
// CLEAVE scene shader. Four "microscopes":
//  0 CELL     2D optical-path field of one cell through mitosis, imaged as phase contrast or DIC
//  1 EMBRYO   raymarched soft-body blastomeres (power-diagram cells with furrows), zona, blastula shell, SEM shading
//  2 SECTION  2D H&E histology of the same epithelial profile (gastrulation)
//  3 FORM     raymarched organism, skin patterned by the live Gray-Scott texture, colourised SEM -> living colour
precision highp float;
uniform vec2 R;
uniform float T,B,K;
uniform vec3 S;            // utility pass selector
uniform float Q1;          // polarised-light mode weight
uniform vec4 V0,M0,M1,Q0;  // V0 2D view (cx,cy,zoom,blur); M0 (condense,align,separate,decondense); M1 (elongate,pinch,spindle,envelope); Q0 (dic,round,centrosomes,cell age)
uniform vec4 C[32];        // blastomeres xyz,r
uniform int NC;
uniform float E2;          // SEM detector: 0 secondary electrons, 1 backscatter
uniform vec4 E0,E1;        // E0 (furrow,compaction,shell,cut); E1 (invagination,lineage colour,mesenchyme,zona)
uniform vec2 PR[32];       // epithelial profile (rho,y), material points pole to pole
uniform vec3 CO,CT;        // camera origin / target
uniform vec4 F0,F1;        // F0 (eye open,living colour,pupil,pattern glow); F1 (focus dist,aperture,fov,iris turn)
uniform sampler2D RD,PF,CE;  // reaction-diffusion; profile distance field (sd,m); spherical cell pattern (edge,id)
out vec4 o;
#define PI 3.14159265
#define SAT(x) clamp(x,0.,1.)
// sine-free hashes (cheap on the GPU)
float hs(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
float hs2(vec2 p){vec3 q=fract(p.xyx*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec3 hs3(vec3 p){p=fract(p*vec3(.1031,.103,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}
float ns(vec2 p){vec2 i=floor(p),f=fract(p);f*=f*(3.-2.*f);return mix(mix(hs2(i),hs2(i+vec2(1,0)),f.x),mix(hs2(i+vec2(0,1)),hs2(i+1.),f.x),f.y);}
float ns3(vec3 p){vec3 i=floor(p),f=fract(p);f*=f*(3.-2.*f);float n=dot(i,vec3(1,57,113));
 return mix(mix(mix(hs(n),hs(n+1.),f.x),mix(hs(n+57.),hs(n+58.),f.x),f.y),mix(mix(hs(n+113.),hs(n+114.),f.x),mix(hs(n+170.),hs(n+171.),f.x),f.y),f.z);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*ns(p);p=p*2.03+1.7;a*=.5;}return s;}
float smin(float a,float b,float k){float h=SAT(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*SAT(dot(pa,ba)/dot(ba,ba)));}
// distance to segment 0->b and position along it
vec2 sgh(vec2 p,vec2 b){float h=SAT(dot(p,b)/dot(b,b));return vec2(length(p-b*h),h);}
float sst(float w,float d){return smoothstep(w,-w,d);}

// ================= 0 CELL =================
// optical path field: x sharp, y wide (blurred) for the phase halo, z chromatin share
float BF,BA;   // birefringence (ordered fibres) and their orientation, for the polarised-light mode
vec3 cf(vec2 p){
 BF=0.;
 float bl=V0.w,ss=.0035+bl,ww=.05+bl,a=atan(p.y,p.x),el=M1.x,sp=M0.z;
 // spread interphase cell with lamellipodia -> rounded mitotic cell -> two daughters pinched apart
 float dI=length(p*vec2(.93,1.07))-.5-.05*sin(a*3.+1.)-.035*sin(a*5.-T*.25)-.05*fb(vec2(a*2.,T*.08)),
  r2=.4*mix(1.,.8,el);vec2 e=vec2(.34*el,0);
 float dM=smin(length(p-e)-r2,length(p+e)-r2,mix(.6,.004,M1.y))+.006*sin(a*9.+T*2.)*Q0.y*(1.-M1.y);
 // membrane blebs bulge and retract on the daughters while the furrow closes
 for(int i=0;i<4;i++){float fi=float(i),ba=fi*1.7+.6,bs=sin(M1.y*PI)*(.5+.5*sin(T*1.3+fi*2.));
  dM=smin(dM,length(p-vec2(i<2?-1.:1.,0)*e-vec2(cos(ba),sin(ba))*r2*1.02)-.045*bs,.03);}
 float zy=Q0.w,d=mix(mix(dI,dM,Q0.y),length(p)-.4,step(.001,zy)),th=mix(mix(.16,.42,Q0.y),.42,zy),dm=mix(.35,1.,sqrt(SAT(-d/.35)));
 vec3 f=vec3(th*dm*sst(ss,d),th*dm*sst(ww,d-ww),0);
 // debris drifting on the slide, out of the focal plane
 for(int i=0;i<5;i++){float fi=float(i);vec2 c=vec2(hs(fi*3.1)*2.4-1.2,hs(fi*7.7)*1.4-.7)+.02*vec2(sin(T*.2+fi),cos(T*.17+fi*2.));
  float dd=length(p-c)-.012-.02*hs(fi);f+=vec3(.12*sst(.012+bl,dd),.12*sst(.06,dd-.03),0);}
 // the end: a fresh zygote inside its fertilisation envelope, a polar body in the gap
 if(zy>0.){float r=length(p);f.x+=.07*exp(-abs(r-.47)/.004)+.05*sst(.004,length(p-vec2(.1,.44))-.03);f.y+=.05*exp(-abs(r-.47)/.04);}
 if(d>.06)return f;
 float inC=sst(.03,d+.03);
 vec2 nc=vec2(.04,.02)*(1.-Q0.y);
 float dn=length((p-nc)*vec2(1,1.12))-.19+.008*sin(a*4.+1.),env=M1.w*(1.-step(.001,zy));
 // two pronuclei drifting together, the sperm aster radiating from the male one
 if(zy>0.){vec2 q=p-vec2(.17*(1.-zy),.02);f.x+=.03*pow(abs(sin(atan(q.y,q.x)*19.)),20.)*exp(-length(q)*6.)*inC;}
 for(int i=0;i<2;i++){float dd=length(p-vec2((i==0?-1.:1.)*.17*(1.-zy),.02))-.075;f.x+=step(.001,zy)*(.06*sst(ss,dd)+.05*exp(-abs(dd)/.005));f.y+=step(.001,zy)*.05*sst(ww,dd);}
 // interphase nucleus: diffuse chromatin, nuclear membrane, two nucleoli
 float chr=fb((p-nc)*26.+T*.03);
 f.x+=env*sst(ss,dn)*(.05+.09*chr*(1.-.7*M0.x))+env*.05*exp(-abs(dn)/(.006+bl));
 f.y+=env*.07*sst(ww,dn);
 for(int i=0;i<2;i++){float dl=length(p-nc-vec2(i==0?.06:-.05,i==0?-.04:.05))-(i==0?.038:.026);f.x+=env*(1.-M0.x)*.16*sst(ss,dl);f.y+=env*(1.-M0.x)*.12*sst(ww*.5,dl);}
 // poles: centrosomes migrate round the nucleus, then the spindle elongates in anaphase
 float mg=Q0.z,px=.29+.1*sp;
 vec2 PL=mix(nc+.22*vec2(cos(PI*.5+.35),sin(PI*.5+.35)),vec2(-px,0),mg),PRr=mix(nc+.22*vec2(cos(PI*.5-.35),sin(PI*.5-.35)),vec2(px,0),mg);
 vec2 u=normalize(PL-p+1e-5),v=normalize(PRr-p+1e-5);
 float sg=acos(clamp(dot(u,v),-1.,1.)),rch=M1.z,dpl=min(length(p-PL),length(p-PRr)),
  fib=pow(.5+.5*cos(sg*30.+.8*ns(p*9.+T*.5)),8.)*smoothstep(1.5,2.6,sg)*smoothstep(rch*.36+.01,rch*.36-.04,dpl)*rch;
 float ast=0.;
 for(int i=0;i<2;i++){vec2 q=p-(i==0?PL:PRr);float r=length(q),an=atan(q.y,q.x);
  ast+=pow(abs(sin(an*17.+float(i)*2.+.3*sin(r*30.-T))),24.)*exp(-r*(9.-3.*rch))*(.25+.75*rch)*Q0.y;
  f.x+=.14*sst(ss,r-.011)*Q0.y;f.y+=.1*sst(ww,r-.011)*Q0.y;}
 f.x+=(fib*.06*(1.+.7*K)+ast*.04)*inC;f.y+=fib*.02*inC;
 vec2 np=p-(length(p-PL)<length(p-PRr)?PL:PRr);BA=atan(np.y,np.x);
 // interphase: radial microtubule array from the centrosome, Golgi stacks curled beside it
 if(Q0.y<1.){vec2 q=p-PL;float r=length(q),an=atan(q.y,q.x),iw=(1.-Q0.y)*inC;
  f.x+=iw*(.035*pow(abs(sin(an*21.+.4*sin(r*12.-T*.3))),30.)*exp(-r*2.5)*smoothstep(-.02,.02,dn)
   +.05*pow(abs(sin(r*240.)),3.)*smoothstep(.03,.045,r)*smoothstep(.1,.08,r)*smoothstep(.55,.95,cos(an-1.9)));}
 // chromosomes: 12 X-shaped pairs that condense, congress to the plate and split into V-shaped sisters
 float cw=mix(.002,.0105,M0.x)*(1.-.55*M0.w),ch=1e5,bd=0.,kt=0.;
 if(M0.x>.01)for(int i=0;i<12;i++){
  float fi=float(i),r1=hs(fi*7.13+1.),r3=hs(fi*5.31+3.),al=SAT(M0.y*1.5-r3*.5);
  vec2 pI=nc+.12*sqrt(r1)*vec2(cos(fi*2.4),sin(fi*2.4)),
   pm=vec2(.01*sin(T*1.7+fi*2.)*(1.-sp),(fi-5.5)*.033+.004*sin(T*1.3+fi)),c=mix(pI,pm,al);
  float an=mix(r3*6.28,0.,al),L=mix(.085,.05,M0.x)*(.7+.6*r1),op=mix(.55,.28,sp);
  for(int s=-1;s<2;s+=2){float fs=float(s);
   vec2 cc=c*vec2(1,1.-.5*sp)+vec2(fs*sp*.27,0),q=rot(an)*(p-cc);
   // kinetochore fibre from this sister's pole, attaching chromosome by chromosome
   kt=max(kt,SAT(rch*2.2-r3*1.2)*(1.-M0.w)*sst(.0022+bl,seg(p,fs>0.?PRr:PL,cc)-.0012));
   if(dot(q,q)>(L+.05)*(L+.05))continue;
   if(M0.x<.99)q+=(vec2(ns(q*45.+fi),ns(q*45.+fi+9.))-.5)*.035*(1.-M0.x);
   for(int k=0;k<2;k++){vec2 w=sgh(q,-fs*L*vec2(cos(op),k==0?sin(op):-sin(op)));if(w.x<ch){ch=w.x;bd=w.y*L*260.+fi;}}}}
 f.x+=.05*kt*inC*(1.+.6*K);BF=(fib*(1.+.7*K)+ast*.5+kt*.8)*inC;
 // G-banding along the condensed arms
 float ca=.3*M0.x*(1.-.6*M0.w)*(.78+.22*sin(bd)*M0.x);
 f+=vec3(ca*sst(ss*.6,ch-cw),ca*.4*sst(ww*.4,ch-cw-.01),M0.x*sst(.01,ch-cw));
 // telophase: new nuclei re-form at both poles
 for(int i=0;i<2;i++){float dd=length(p-vec2(i==0?-px:px,0))-.12*M0.w;f.x+=M0.w*(.07+.05*chr)*sst(ss,dd)+.04*M0.w*exp(-abs(dd)/.006);f.y+=M0.w*.06*sst(ww,dd);}
 // contractile ring: a dense band where the furrow ingresses
 f.x+=.09*sin(M1.y*PI)*exp(-p.x*p.x*900.)*sst(ss,d+.01)*smoothstep(.12,.3,abs(p.y));
 // midbody at the end of cytokinesis
 f.x+=.12*smoothstep(.9,1.,M1.y)*sst(ss,length(p*vec2(3,1))-.02);
 f.x+=.025*(1.-Q0.y)*inC*smoothstep(.04,.0,abs(ns(p*55.+T*.05)-.5))*smoothstep(-.01,.04,dn);
 // phase-light vacuoles and vesicles running out along the microtubules
 for(int i=0;i<6;i++){float fi=float(i);vec2 c=vec2(cos(fi*1.9+.5),sin(fi*1.9+.5))*(.27+.06*hs(fi))*mix(1.,.8,Q0.y)+.01*sin(T*.4+fi);
  float dv=length(p-c)-.018-.012*hs(fi*5.);f.x-=.06*sst(ss,dv)*inC*(1.-M0.w);f.y-=.03*sst(ww*.4,dv)*inC;
  float an=fi*1.05+.3,rv=fract(T*.06+hs(fi*9.))*.42;f.x+=.09*(1.-Q0.y)*sst(ss,length(p-PL-rv*vec2(cos(an),sin(an)))-.006)*inC;}
 // cytoplasmic granules jiggling (excluded from nucleus and spindle)
 vec2 g=p*40.,gi=floor(g),gf=fract(g)-.5;float h=hs2(gi);
 gf-=.28*vec2(sin(T*(.6+h)+h*40.),cos(T*(.5+h)+h*23.));
 float gd=length(gf)-.1-.16*h,msk=inC*smoothstep(-.01,.03,dn*env+(1.-env)*(dpl-.1))*smoothstep(.2,.4,h);
 f.x+=.06*msk*sst(.05+bl*40.,gd);f.y+=.025*msk*sst(.3,gd);
 return f;
}
vec3 cellS(vec2 uv){
 vec2 p=(uv-.5*R)/R.y*V0.z+V0.xy;
 vec3 a=cf(p);
 // DIC: shear derivative of the optical path, taken in screen space (one field evaluation per pixel)
 float ph=.62-.5*a.x-3.*(a.x-a.y),g=(dFdx(a.x)+dFdy(a.x))*R.y/V0.z*.7,dc=.5+.5*tanh(g*.032+a.x*.2-.06);
 vec3 pc=vec3(.5,.57,.47)*ph*1.45+vec3(.02,.03,.0),
  dic=mix(vec3(.13,.12,.18),vec3(.98,.93,.83),dc)*(.92+.08*a.z);
 // polarised light: dark field, only the ordered spindle shines, tinted by its angle to the compensator
 vec3 pol=vec3(.02,.025,.035)+.06*a.y+.03*a.z+BF*1.4*mix(vec3(1.,.78,.35),vec3(.35,.6,1.),.5+.5*cos(2.*BA));
 return mix(mix(pc,dic,Q0.x),pol,Q1);
}

// ================= epithelial profile (shared by EMBRYO and SECTION) =================
// distance to the polyline, material coordinate m (0 animal pole .. 1 vegetal pole) and inside/outside
float prof(vec2 q,out float m,out float sd){
 float bd=1e5,ins=-1.;m=0.;
 for(int i=0;i<31;i++){vec2 a=PR[i],b=PR[i+1],ba=b-a,pa=q-a;float h=SAT(dot(pa,ba)/dot(ba,ba));vec2 w=pa-ba*h;float d=dot(w,w);
  if(d<bd){bd=d;m=(float(i)+h)/31.;}
  if((a.y>q.y)!=(b.y>q.y)&&q.x<a.x+(q.y-a.y)*ba.x/ba.y)ins=-ins;}
 sd=sqrt(bd)*-ins;return sqrt(bd);
}
float wallT(float m){float w=SAT((m-.72)/.28);return .11+.05*smoothstep(0.,.25,w)*(1.-smoothstep(.4,.9,w))*E1.x;}

// ================= 1 EMBRYO =================
float vor(vec3 p,out float cid){
 vec3 i=floor(p),f=fract(p);float d1=8.,d2=8.;cid=0.;
 for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec3 g=vec3(x,y,z),r=g+hs3(i+g)*.7+.15-f;float d=dot(r,r);
  if(d<d1){d2=d1;d1=d;cid=hs(dot(i+g,vec3(1,57,113)));}else if(d<d2)d2=d;}
 return sqrt(d2)-sqrt(d1);
}
float cid;   // material id of the last map() hit
bool lo=false;  // low detail (shadow / AO rays)
int CI[16],NCI=0;  // blastomeres near the current ray (candidate list)
vec3 cutN=vec3(0,0,1);
float mapE(vec3 p){
 // substrate: a porous filter membrane
 float dp=p.y+1.16,d=length(p)-1.22;
 if(dp<.03&&!lo){dp-=.006*smoothstep(.02,.0,abs(ns(p.xz*3.)-.5));vec2 gp=p.xz*5.,gi=floor(gp),gf=fract(gp)-.5-(hs3(vec3(gi,1)).xy-.5)*.5;dp+=.012*smoothstep(.13,.1,length(gf))*step(.4,hs2(gi));}
 cid=-2.;if(d>.1)return min(d,dp);
 d=1e5;cid=0.;
 if(E0.z<1.){
  // blastomeres: nearest two by power distance; flatten against the radical plane, furrow siblings progressively
  float b1=1e5,b2=1e5;int i1=0,i2=0;
  for(int k=0;k<16;k++){if(k>=NCI)break;int i=CI[k];vec3 q=p-C[i].xyz;float pw=dot(q,q)-C[i].w*C[i].w;if(pw<b1){b2=b1;i2=i1;b1=pw;i1=i;}else if(pw<b2){b2=pw;i2=i;}}
  vec4 c1=C[i1],c2=C[i2];
  float d1=length(p-c1.xyz)-c1.w,db=(b2-b1)/(2.*max(length(c2.xyz-c1.xyz),1e-3)),
   D=i2==(i1^1)?c1.w*E0.x:c1.w*3.,g=mix(.016,.004,E0.y);
  d=smax(d1,smin(g-db,d1+D,.05),mix(.07,.035,E0.y));
  if(i2==(i1^1)&&E0.x<1.&&!lo)d+=.007*sin(E0.x*PI)*exp(-db*db*250.)*ns3(p*42.);
  if(d<.02&&!lo)d+=(.0025+.003*hs(float(i1)))*ns3(p*60.)-.002;
  cid=1.+float(i1);
  // polar body
  float pb=length(p-vec3(.25,.93,.18))-.1;if(pb<d){d=pb;cid=40.;}
 }
 if(E0.z>0.){
  vec2 pf=texture(PF,vec2(length(p.xz)/1.3,p.y/2.6+.5)).xy;float c=0.,mz=0.;
  float ds=abs(pf.x)-wallT(pf.y);
  if(ds<.05){vec2 ce=texture(CE,vec2(atan(p.z,p.x)/6.2832+T*.012,pf.y)).xy;c=ce.y;
   ds+=.03*(1.-smoothstep(0.,.22,ce.x))+(lo?0.:.003*ns3(p*50.));}
  // primary mesenchyme cells ingressing into the blastocoel
  if(E1.z>0.&&length(p.xz)<.75&&p.y<.2)for(int i=0;i<7;i++){float fi=float(i),hh=hs(fi*3.7),mg=SAT(E1.z*1.6-hh*.6),az=fi*2.4;
   vec3 c=vec3(cos(az),0,sin(az))*(.12+.3*hh)*(1.+mg)+vec3(0,-.62+mg*(.4+.4*hs(fi*9.1)),0);float dm=length(p-c)-.055*mg;if(dm<ds){ds=dm;mz=1.;}}
  // fracture cut-away
  float cp=dot(p,cutN)-mix(1.6,-.05,E0.w)+.025*ns3(p*7.);
  ds=smax(ds,cp,.01);
  if(ds<d||E0.z>=1.){d=mix(d,ds,E0.z>=1.?1.:E0.z);cid=cp>-.012?60.+c:mz>0.?42.:50.+c;}
 }
 // zona pellucida: fibrous shell, fractured open towards the viewer, gone after hatching
 if(E1.w>0.&&abs(length(p)-1.2)<.14&&!lo){
  // spermatozoa that arrived too late, caught on the zona surface
  for(int i=0;i<3;i++){vec3 n=normalize(i==0?vec3(-.8,.5,.35):i==1?vec3(.9,.4,0):vec3(-.1,.95,.25)),u=normalize(cross(n,vec3(.3,.1,1.))),v=cross(n,u),q=p-n*1.19;
   float a=dot(q,u),b=dot(q,v),c=dot(q,n),hd=length(vec3(a/.055,c/.022,b/.034))-1.;hd*=.02;
   float tl=length(vec2(c,b-.03*sin(a*28.+T*(3.+float(i)))*SAT(a/-.5)))-.008+.004*SAT(-a/.5);tl=max(tl,max(a-.02,-a-.55));
   float ds=min(hd,tl);if(ds<d){d=ds;cid=41.;}}}
 if(E1.w>0.&&abs(length(p)-1.13)<.1){float dz=abs(length(p)-1.13)-.028+(lo?0.:.008*ns3(p*24.));
  dz=max(dz,dot(normalize(p+1e-5),normalize(vec3(.3,.25,1.)))-mix(-1.2,.55,E1.w)+.12*ns3(p*3.));
  if(dz<d){d=dz;cid=-1.;}}
 if(dp<d){d=dp;cid=-2.;}
 return d;
}
vec3 nrmE(vec3 p){vec2 e=vec2(.0012,-.0012);return normalize(e.xyy*mapE(p+e.xyy)+e.yyx*mapE(p+e.yyx)+e.yxy*mapE(p+e.yxy)+e.xxx*mapE(p+e.xxx));}
vec3 lineage(float i){
 // false colour by blastomere lineage (top bits of the cell index)
 float L=log2(float(max(NC,2))),a=floor((i-1.)/exp2(L-1.)),b=floor((i-1.)/exp2(max(L-2.,0.)));
 return mix(vec3(1),mix(vec3(1.,.62,.32),vec3(.38,.78,.95),a)*(.85+.3*mod(b,2.)),E1.y);
}
vec3 embS(vec2 uv,out float cc){
 vec3 ww=normalize(CT-CO),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww),rd=normalize(uu*(uv.x-.5*R.x)/R.y+vv*(uv.y-.5*R.y)/R.y+ww*F1.z);
 cutN=normalize(vec3(0,0,1));
 float t=.5,d,id=-3.;
 // per-ray candidate mask: only blastomeres the ray passes near take part in the march
 for(int i=0;i<32;i++){if(i>=NC||NCI>15)break;vec3 oc=C[i].xyz-CO;float b=max(dot(oc,rd),0.),r=C[i].w+.2;if(dot(oc,oc)-b*b<r*r)CI[NCI++]=i;}
 for(int i=0;i<110;i++){vec3 p=CO+rd*t;d=mapE(p);if(d<.0006*t){id=cid;break;}t+=d*.85;if(t>14.)break;}
 vec3 bg=vec3(.1)+.07*(uv.y/R.y);
 cc=0.;
 if(id<-2.5)return bg;
 vec3 p=CO+rd*t,n=nrmE(p),L=normalize(vec3(-.55,.75,.45));lo=true;
 float ao=0.,w=1.,sh=1.;
 if(E0.z<1.){
  // cleavage: analytic soft shadows and occlusion from the blastomere spheres
  ao=1.;for(int i=0;i<32;i++){if(i>=NC)break;vec4 c=C[i];vec3 oc=p-c.xyz,r=-oc;float b=dot(oc,L),h=b*b-dot(oc,oc)+c.w*c.w,l=length(r),tt=-b-sqrt(max(h,0.));
   sh*=tt<0.?1.:smoothstep(0.,1.,20.*(sqrt(max(0.,c.w*c.w-h))-c.w)/tt);ao-=max(dot(n,r),0.)*c.w*c.w/(l*l*l)*.55;}
  ao=SAT(ao);sh=SAT(sh);
 }else{
  for(int i=1;i<6;i++){float h=.03*float(i);ao+=w*(h-mapE(p+n*h));w*=.6;}ao=SAT(1.-ao*7.);
  float st=.02;for(int i=0;i<22;i++){float h=mapE(p+L*st);sh=min(sh,12.*h/st);st+=clamp(h,.03,.25);if(sh<.02||st>3.)break;}sh=SAT(sh);}
 float e=1.-abs(dot(n,rd)),se=(.25+.56*pow(e,1.5)+.34*max(dot(n,L),0.)*sh)*(.35+.65*ao);
 // backscatter detector: flat, top-lit, no edge glow
 se=mix(se,(.3+.45*max(n.y,0.)+.2*max(dot(n,L),0.)*sh)*(.55+.45*ao),E2);
 vec3 col=vec3(se);
 if(id>=1.&&id<40.){col*=lineage(id);
  // selective false colour: the newest furrow glows while it cuts
  int ci=int(id)-1;vec3 ca=C[ci].xyz,cs=C[ci^1].xyz;col+=vec3(1.,.35,.2)*sin(E0.x*PI)*exp(-pow(dot(p-(ca+cs)*.5,normalize(ca-cs+1e-4)),2.)*300.)*.35*E1.y;}
 else if(id==40.)col*=mix(vec3(1),vec3(1.,.5,.85),E1.y);
 else if(id==41.)col*=mix(vec3(1),vec3(.55,1.,.6),E1.y);
 else if(id==42.)col*=mix(vec3(1),vec3(.95,.55,1.),E1.y);
 else if(id>=50.){float k=fract(id);col*=mix(vec3(1),mix(vec3(1.,.66,.4),vec3(1.,.8,.55),k),E1.y*.8);
  // the blastopore lip (the organiser) picked out in false colour once the plate starts to fold
  col=mix(col,col*vec3(1.6,.75,.45),smoothstep(.04,0.,abs(texture(PF,vec2(length(p.xz)/1.3,p.y/2.6+.5)).y-.71))*SAT(E1.x*6.));
  if(id<60.)col+=vec3(.32)*pow(e,2.5)*ns3(p*170.+vec3(0,T*1.5,0))*E0.z;
  if(id>=60.){ // fracture face: granular cytoplasm, nuclei, cell walls
   vec2 pf=texture(PF,vec2(length(p.xz)/1.3,p.y/2.6+.5)).xy;float sd=pf.x;
   float nuc=smoothstep(.05,.035,abs(sd+.01)+.04*hs(k*91.))*step(.25,hs(k*13.));
   col=vec3(.45+.25*ns3(p*90.))*(.6+.4*ao)*mix(vec3(1),vec3(1.,.85,.6),E1.y*.6)*(1.-.35*nuc)+vec3(.4,.15,.35)*nuc*E1.y+vec3(.35,.3,.2)*smoothstep(.55,.8,pf.y)*smoothstep(.6,.75,ns3(p*55.));}}
 else if(id==-1.)col*=vec3(.8,.85,.95);
 else if(id==-2.)col*=.75;
 cc=abs(t-F1.x)*F1.y;
 return mix(col,bg,SAT((t-6.)/8.));
}

// ================= 2 SECTION (H&E) =================
vec3 heS(vec2 uv){
 vec2 p=(uv-.5*R)/R.y*V0.z+V0.xy,q=vec2(abs(p.x),p.y);
 float m,sd,d=prof(q,m,sd),th=wallT(m);
 vec3 bg=vec3(.97,.955,.94)-.05*fb(p*3.)*vec3(.2,.5,.4),col=bg;
 // a second, earlier section on the same slide: a young blastula cut through its equator
 vec2 c2=p-vec2(-1.85,.62);float r2=length(c2),w2=abs(r2-.5)-.06,a2=atan(c2.y,c2.x)*16./PI;
 if(r2<.44)col=mix(bg,vec3(.96,.86,.9),.5+.3*fb(p*12.));
 if(w2<0.){col=mix(vec3(.93,.6,.74),vec3(.84,.45,.64),ns(p*80.));col=mix(col,vec3(.6,.25,.48),smoothstep(.4,.5,abs(fract(a2)-.5))*.7);
  col=mix(col,vec3(.33,.18,.52),sst(.012,length(vec2((fract(a2)-.5)*.1,r2-.5-.01*hs(floor(a2))))-.022));}
 // blastocoel: pale eosinophilic fluid with fibrous matrix
 if(sd<-th)col=mix(bg,vec3(.96,.84,.88),.6+.25*fb(p*14.));
 // mesenchyme cells ingressing from the vegetal plate into the cavity
 if(sd<-th&&E1.z>0.)for(int i=0;i<9;i++){float fi=float(i),hh=hs(fi*3.7),mg=SAT(E1.z*1.6-hh*.6);
  vec2 c=vec2((hh-.5)*.5*(1.+mg),-.62+mg*(.5+.4*hs(fi*9.1)))+.02*vec2(sin(T+fi),cos(T*.8+fi));
  float dc=length(p-c)-.045*mg+.012*sin(atan(p.y-c.y,p.x-c.x)*3.+fi);
  if(dc<0.){col=mix(vec3(.93,.55,.72),vec3(.85,.45,.65),ns(p*60.));if(length(p-c)<.022*mg)col=vec3(.36,.2,.55);}
 }
 if(abs(sd)<th){
  float ci=floor(m*30.)+(p.x<0.?77.:0.),u=fract(m*30.)-.5,v=sd/th,hh=hs(ci);
  // cytoplasm (eosin), apical border, membranes, nuclei (haematoxylin)
  col=mix(vec3(.93,.58,.72),vec3(.82,.42,.62),.5*ns(p*90.)+.3*ns(p*23.));
  col=mix(col,vec3(.72,.32,.55),smoothstep(.62,.8,v)*.5);
  col=mix(col,vec3(.62,.25,.48),smoothstep(.42,.5,abs(u))*.8);
  vec2 nq=vec2((u-(hh-.5)*.25)/.3,(v-.05-.35*(hs(ci*1.7)-.5))/.42);
  float nd=length(nq);
  if(hh<.1){ // mitotic figure: condensed chromosomes on a plate
   float pl=abs(nq.y*.7+nq.x*.3*sin(hh*60.))-.12-.06*ns(p*400.);col=mix(col,vec3(.22,.1,.38),sst(.04,pl)*sst(.1,nd-.9));}
  else{col=mix(col,mix(vec3(.38,.22,.58),vec3(.2,.1,.36),ns(p*300.)*.8),sst(.08,nd-1.));
   col=mix(col,vec3(.18,.08,.3),sst(.1,length(nq-vec2(.2,.1))-.18)*sst(.08,nd-1.));}
  // cilia fringe on the apical surface
  col=mix(col,vec3(.7,.4,.6),smoothstep(.98,1.,v)*pow(abs(sin(m*2400.)),4.));
  col=mix(col,vec3(.55,.2,.45),exp(-(th-abs(sd))*400.)*.6);
 }
 // secondary mesenchyme at the archenteron tip reaching for the roof with filopodia
 if(sd<-th&&E1.x>.45){vec2 tp=PR[31]+vec2(0,.15);for(int i=0;i<3;i++){float fi=float(i);vec2 e=vec2(.06+.14*fi,.75-.08*fi);
  vec2 pa=q-tp,ba=(e-tp)*SAT(E1.x*2.-.9-.15*fi);float hh=SAT(dot(pa,ba)/max(dot(ba,ba),1e-5));col=mix(col,vec3(.8,.45,.66),sst(.0025,length(pa-ba*hh+vec2(.01*sin(hh*20.+T),0))-.002));}}
 if(sd>th&&sd<th+.05)col=mix(col,vec3(.85,.65,.8),pow(abs(sin(m*1500.+sd*60.)),6.)*SAT(1.-(sd-th)/.05)*.5);
 col*=.94+.12*fb(p*1.7+3.);
 if(abs(sd)<th)col=mix(col,bg,smoothstep(.012,.0,abs(ns(p*9.)-.5))*smoothstep(.62,.7,fb(p*4.)));
 vec2 bq=(uv-R*vec2(.85,.78))/R.y;float br=length(bq)-.09;
 col=mix(col,col*.55+vec3(.1,.08,.1),exp(-abs(br)*300.))+vec3(.06)*sst(.003,br)*smoothstep(.0,-.05,bq.y-bq.x);
 return col*(1.-.05*hs2(floor(uv*.5)));
}

// ================= 3 FORM =================
float sdE(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/k1;}
vec3 EC=vec3(.6,.3,.45);float ER=.2;
vec3 EN=normalize(vec3(.8,.28,.55));
float pat(vec3 p,vec3 n){
 // triplanar sample of the reaction-diffusion texture (tileable)
 vec3 w=pow(abs(n),vec3(4));w/=w.x+w.y+w.z;p*=.7;
 return w.x*texture(RD,p.zy+.3).y+w.y*texture(RD,p.xz+.5-vec2(.14,.07)).y+w.z*texture(RD,p.xy+.1).y;
}
float mapF(vec3 p){
 vec3 q=vec3(abs(p.x),p.y,p.z);
 // bounding capsule around the whole animal
 float bz=length(vec3(p.xy,p.z-clamp(p.z,-4.6,.8)))-1.55;cid=0.;if(bz>.3)return bz;
 float h=sdE(p-vec3(0,0,.05),vec3(1.05,.6,1.)),d;
 h=smin(h,sdE(p-vec3(0,-.1,.72),vec3(.9,.4,.55)),.25);
 h=smin(h,sdE(p-vec3(0,-.12,-1.3),vec3(.72,.55,1.5)),.45);
 if(p.z<-.4){
  // tail: flattened, swaying, with a fin that runs forward into a dorsal crest
  float z=-p.z-2.2,sw=.28*sin(-p.z*1.3-T*2.2)*SAT(z/2.5+.4);vec3 tq=p-vec3(sw,-.12,-3.4);
  h=smin(h,sdE(tq,vec3(.2,.42,1.9)),.35);
  h=smin(h,max(sdE(tq-vec3(0,.05,.25),vec3(.035,.78,2.3)),-p.y-.62),.12);
  h=smin(h,sdE(p-vec3(0,.5,-1.5),vec3(.03,.16,1.3)),.12);
  // legs: short paddles with a hint of digits
  for(int i=0;i<2;i++){vec3 a=vec3(.55,-.4,i==0?-.55:-2.15),b=a+vec3(.42,-.32,.12),pa=q-a,ba=b-a;float hh=SAT(dot(pa,ba)/dot(ba,ba));
   h=smin(h,length(pa-ba*hh)-.085+.02*hh-.015*smoothstep(.75,1.,hh)*abs(sin(atan(pa.z,pa.x)*4.)),.08);}}
 h+=.03*smoothstep(.03,0.,abs(p.y+.24-.12*p.x*p.x))*smoothstep(.2,.6,p.z)+.02*smoothstep(.05,.0,length(q-vec3(.22,.05,1.2)));
 cid=0.;
 // eyes: skin bulge with an almond aperture that opens
 vec3 e=q-EC,ex=normalize(cross(vec3(0,1,0),EN)),ey=cross(EN,ex);
 float lx=dot(e,ex),ly=dot(e,ey),lz=dot(e,EN),ap=F0.x*ER*.95*SAT(1.-lx*lx/(ER*ER*.9));
 float de=length(e)-ER;
 if(de<.15){h=smin(h,de-.045,.1);h=smax(h,-max(abs(ly)-ap,-lz),.012);}
 d=h;
 if(de<d){d=de;cid=1.;}
 // external gills: three stalks a side with comb-like fimbriae
 if(q.x>.55&&p.z>-1.5&&p.z<.1)for(int i=0;i<3;i++){float fi=float(i);vec3 a=vec3(.75,.25-fi*.17,-.35-fi*.1),b=a+vec3(.42,.35-fi*.25,-.45);
  vec3 pa=q-a,ba=b-a;float hh=SAT(dot(pa,ba)/dot(ba,ba));vec3 w=pa-ba*hh;
  vec3 ax=normalize(ba),sd=normalize(cross(ax,vec3(0,1,0)));float fl=pow(abs(sin(hh*46.+fi)),6.)*smoothstep(.1,.3,hh),
   dg=length(w)-.045*(1.-.5*hh)-.06*fl*SAT(1.-abs(dot(normalize(w+1e-5),sd))*1.4)+.01*sin(T*2.+fi+hh*6.);
  if(dg<d){d=smin(d,dg,.04);cid=2.;}}
 return d;
}
float mapFd(vec3 p,out float m){
 float d=mapF(p);m=0.;
 if(d<.05&&cid==0.){vec3 n=normalize(p*vec3(1,1.6,1));m=pat(p,n);d-=.026*smoothstep(.12,.32,m);}
 return d;
}
vec3 formS(vec2 uv,out float cc){
 vec3 ww=normalize(CT-CO),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww),rd=normalize(uu*(uv.x-.5*R.x)/R.y+vv*(uv.y-.5*R.y)/R.y+ww*F1.z);
 float t=.0,d,m,id=-1.;
 vec3 bg=mix(vec3(.02,.025,.03),mix(vec3(.02,.09,.11),vec3(.1,.3,.32),uv.y/R.y),F0.y);
 // marine snow drifting in the water
 vec2 su=uv/R.y;
 for(int i=0;i<6;i++){float fi=float(i);vec2 c=vec2(hs(fi*11.)*R.x/R.y+.03*sin(T+fi),fract(hs(fi*13.)+T*.04*(1.+hs(fi))));float r=length(su-c),br=.006+.008*hs(fi*17.);bg+=F0.y*(vec3(.5,.7,.7)*exp(-abs(r-br)*900.)+vec3(.8)*sst(.002,length(su-c-br*.4)-br*.2));}bg+=F0.y*vec3(.1,.16,.15)*pow(ns(vec2(su.x*5.+su.y*1.8,T*.12)),3.)*su.y;
 for(int i=0;i<12;i++){float fi=float(i);vec2 c=vec2(hs(fi)*R.x/R.y,fract(hs(fi*3.)-T*.01*(1.+hs(fi*5.))))*R.y;bg+=F0.y*.06*sst(R.y*.01,length(uv-c)-R.y*.004*(1.+hs(fi*7.)*3.));}
 for(int i=0;i<120;i++){vec3 p=CO+rd*t;d=mapFd(p,m);if(abs(d)<.0004*(t+.2)){id=cid;break;}t+=d*.8;if(t>14.)break;}
 cc=0.;
 if(id<0.)return bg;
 vec3 p=CO+rd*t;
 vec2 e=vec2(.0008*(1.+t),-.0008*(1.+t));float mm;
 vec3 n=normalize(e.xyy*mapFd(p+e.xyy,mm)+e.yyx*mapFd(p+e.yyx,mm)+e.yxy*mapFd(p+e.yxy,mm)+e.xxx*mapFd(p+e.xxx,mm));
 mapFd(p,m);
 vec3 L=normalize(vec3(-.4,.8,.5)),H=normalize(L-rd);
 float ao=0.,w=1.;for(int i=1;i<5;i++){float h=.04*float(i);ao+=w*(h-mapF(p+n*h));w*=.6;}ao=SAT(1.-ao*5.);
 float sh=1.,st=.03;for(int i=0;i<18;i++){float h=mapF(p+L*st);sh=min(sh,10.*h/st);st+=clamp(h,.03,.3);if(sh<.02||st>3.)break;}sh=SAT(sh);
 float fr=pow(1.-abs(dot(n,rd)),3.),df=max(dot(n,L),0.);
 // thickness probe for subsurface scattering
 float th=SAT(mapF(p-n*.12)/-.12);
 float sp=smoothstep(.12,.32,m),glow=F0.w,
  // somites: chevrons laid down head to tail behind a travelling wavefront
  so=step(p.z,-.7)*step(mix(-.6,-3.8,smoothstep(84.,97.,B)),p.z)*smoothstep(.3,.48,abs(fract(p.z*4.2+abs(p.y)*1.1+abs(p.x)*.3)-.5))*SAT(p.y*3.+.6);
 // colourised SEM: grey relief + false-colour pattern
 float se=(.14+.75*pow(1.-abs(dot(n,rd)),1.6)+.4*df*sh)*(.4+.6*ao);
 se+=.35*pow(ns3(p*260.),18.);  // sputter-coat grain
 vec3 sem=vec3(se*(1.-.25*so))*mix(vec3(.75,.85,1.),vec3(1.,.72,.25)*1.3,sp*.85)+vec3(1.,.6,.2)*sp*glow*.25;
 // living colour
 vec3 alb=mix(vec3(.88,.6,.58),vec3(.28,.17,.16),sp)*(1.-.22*so)*mix(1.15,.85,SAT(p.y*1.5+.5)),liv=alb*(df*sh*.9+.15)*(.5+.5*ao)+vec3(.9,.25,.2)*(1.-th)*.35*(.6+.4*df)+vec3(.9,.95,1.)*pow(max(dot(n,H),0.),70.)*.8*sh+fr*vec3(.3,.6,.65)*.6;
 float cs=pow(abs(sin(ns(p.xz*5.+T*.25)*9.+ns(p.zy*3.-T*.2)*5.)),12.);liv+=vec3(.6,.8,.75)*cs*df*sh*.5;
 liv+=vec3(1.,.82,.45)*pow(ns3(p*95.),14.)*6.*(.3+df)*(1.-sp);
 liv*=1.-.5*smoothstep(.012,.004,length(vec2(fract(p.z*9.)-.5,(abs(p.y-.08-.05*p.z)-.0)*9.)/9.))*step(.5,abs(p.x));
 if(id==2.){sem=vec3(se)*vec3(1.,.7,.8);liv=vec3(.75,.12,.2)*(df*sh+.25)*(1.+.6*K)+vec3(1.,.3,.35)*(1.-th)*.6+fr*vec3(.6,.3,.4);}
 if(id==1.){ // eye: iris patterned by the reaction-diffusion texture, pupil, wet cornea
  vec3 me=vec3(sign(p.x),1,1),v=normalize(p-me*EC+rd*.05),ax=normalize(mix(me*EN,normalize(CO-me*EC),F1.w));
  float ca=dot(v,ax),ang=acos(SAT(ca)),ps=atan(dot(v,cross(ax,vec3(0,1,0))),v.y);
  float rp=mix(.18,.62,F0.z),ir=sst(.03,ang-.7),pu=sst(.02,ang-rp);
  float rdp=texture(RD,vec2(ps/6.283,ang*.6)).y;
  vec3 iris=mix(vec3(.85,.62,.2),vec3(.25,.5,.35),smoothstep(.15,.3,rdp))*(.6+.6*ns(vec2(ps*30.,ang*8.)))*(1.-.6*smoothstep(.5,.7,ang));
  vec3 ec=mix(vec3(.06,.05,.05),iris,ir)*(1.-pu)*(.4+.8*df);
  vec3 rf=reflect(rd,n);ec+=vec3(1)*pow(max(dot(rf,normalize(vec3(-.3,.7,.6))),0.),200.)*2.5+fr*vec3(.4,.5,.55)
   +vec3(.7,.85,.9)*exp(-abs(acos(SAT(dot(rf,normalize(CO-p))))-.35)*60.)*.6;
  sem=vec3(se*.4)+ec*.15;liv=ec;
 }
 cc=abs(t-F1.x)*F1.y;
 return mix(mix(sem,liv,F0.y),bg,SAT((t-7.)/5.));
}

void main(){
 vec2 uv=gl_FragCoord.xy;float cc=0.;vec3 c;
 // one program per scene (SC is defined by the loader) keeps register pressure per scene low
#if SC==0
 c=cellS(uv);
#elif SC==1
 c=embS(uv,cc);
#elif SC==2
 c=heS(uv);
#elif SC==3
 c=formS(uv,cc);
#else
 // utility passes: S.x=10 profile distance field (rho 0..1.3, y -1.3..1.3); S.x=11 cell pattern on the unit sphere
 vec2 w=uv/R;if(S.x<10.5){float m,sd;prof(vec2(w.x*1.3,w.y*2.6-1.3),m,sd);o=vec4(sd,m,0,1);}
 else{float th=w.y*PI,az=w.x*6.2832,e=vor(vec3(sin(th)*cos(az),cos(th),sin(th)*sin(az))*5.5,cc);o=vec4(SAT(e),cc,0,1);}return;
#endif
 o=vec4(max(c,0.),SAT(cc));
}
