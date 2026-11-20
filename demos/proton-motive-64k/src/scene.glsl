// PROTON MOTIVE scene shader. Compiled once per scene with "#define S n" prepended, so each program only carries
// its own map. Writes HDR colour and the hit distance (alpha) for depth of field and particle occlusion.
// Scenes: 0 cytosol + glucose, 1 mitochondrion exterior / coda, 2 membrane dive, 3 cristae cathedral / flood,
// 4 electron transport chain, 5 proton gradient (crista lumen), 6 ATP synthase.
precision highp float;precision highp sampler3D;
uniform vec3 uR,uC,uD;uniform float uT,uB,uA;uniform vec4 uF,uE,uX,uY,uL[4],uP[6];uniform sampler3D uN;
out vec4 o;
#define PI 3.1415927
vec3 ro,rd;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
// noise volume: r,g = smooth gradient noise (1 unit cells, two seeds), b = half-unit noise, a = cellular F1
vec4 nz(vec3 p){return texture(uN,p*.0625);}
float fbm(vec3 p){return nz(p).r*.55+nz(p*2.03+.37).g*.3+nz(p*4.1+.71).b*.15;}
float h1(float n){return fract(sin(n*12.9898+4.1)*43758.5453);}
vec3 h3(vec3 p){p=fract(p*vec3(.1031,.103,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}
float sat(float x){return clamp(x,0.,1.);}
vec2 U(vec2 a,vec2 b){return a.x<b.x?a:b;}
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return-smin(-a,-b,k);}
float sBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float sCap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*sat(dot(pa,ba)/dot(ba,ba)))-r;}
float sCyl(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float sEll(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/max(k1,1e-5);}
float sTor(vec3 p,vec2 t){return length(vec2(length(p.xz)-t.x,p.y))-t.y;}
// polar repetition around y: returns the local point, writes the cell index
vec3 pmod(vec3 p,float n,out float id){float a=atan(p.z,p.x),s=2.*PI/n;id=floor(a/s+.5);a-=id*s;return vec3(cos(a),0,sin(a))*length(p.xz)+vec3(0,p.y,0);}
// a spark: hot white-blue core with a sodium skirt
vec3 SPK=vec3(.55,.75,1.3),AMB=vec3(1.,.48,.14);
vec2 map(vec3 p);
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl);
float den(vec3 p);
vec3 emi(vec3 p,vec3 n,float m);
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp);
vec3 sky(vec3 d);
vec3 amb(vec3 p,vec3 n);
float vis(vec3 p,vec3 l,float dl);
vec3 vem(vec3 p,float t);
// microtubules: 13 protofilaments, tubulin dimers every .26
float mtub(vec3 p,vec3 a,vec3 d,vec3 u,vec3 v){p-=a;float h=dot(p,d);vec3 q=p-d*h;float r=length(q);if(r>1.4)return r-.62;
 // cos(13 theta) by complex powers instead of atan
 vec2 z=vec2(dot(q,u),dot(q,v))/max(r,1e-4),z2=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y),z4=vec2(z2.x*z2.x-z2.y*z2.y,2.*z2.x*z2.y),z8=vec2(z4.x*z4.x-z4.y*z4.y,2.*z4.x*z4.y),z12=vec2(z8.x*z4.x-z8.y*z4.y,z8.x*z4.y+z8.y*z4.x);
 return r-.55-.04*(z12.x*z.x-z12.y*z.y)*(.6+.4*cos(h*24.));}
// ---------------------------------------------------------------- scene 0: cytosol, glucose -> 2 pyruvate
#if S==0
#define STEPS 96
#define FAR 60.
#define VS 16
#define VFAR 40.
// X: fade in, phosphate 1, phosphate 2, seconds since the ring split (<0 before). Y: molecule centre, tumble
vec3 AP[6],SP[6],HP[6],P1,P2,CA,CB;mat3 MR;
void init(){float c=cos(uY.w),s=sin(uY.w),c2=cos(uY.w*.6+.4),s2=sin(uY.w*.6+.4);MR=mat3(c2,-s2,0,s2,c2,0,0,0,1)*mat3(c,0,-s,0,1,0,s,0,c);float sp=max(uX.w,0.),f=1.7*(1.-exp(-sp*1.3))+.22*sp;
 for(int k=0;k<6;k++){float a=float(k)*PI/3.,s=k%2==0?1.:-1.;vec3 c=vec3(cos(a),0,sin(a));
  AP[k]=c*1.3+vec3(0,.24*s,0);vec3 dr=normalize(c+vec3(0,.65*s,0));SP[k]=AP[k]+dr*(k==5?1.15:.95);HP[k]=SP[k]+normalize(dr+vec3(0,-.5*s,.3))*.55;}
 P1=mix(HP[5]+vec3(2.5,3,1.5),HP[5]+normalize(HP[5])*.35,uX.y);P2=mix(SP[1]+vec3(-2,-2.5,2.5),SP[1]+normalize(SP[1])*.75,uX.z);
 if(uX.w>0.){vec3 ax=normalize(vec3(-.7,.3,.65));for(int k=0;k<6;k++){float s=k<3?1.:-1.;vec3 cc=k<3?vec3(.65,0,.65):vec3(-.65,0,-.65);
   mat2 m=rot(s*f*.9);vec3 q;
   q=AP[k]-cc;q.xy*=m;AP[k]=q+cc+ax*s*f*1.6;q=SP[k]-cc;q.xy*=m;SP[k]=q+cc+ax*s*f*1.6;q=HP[k]-cc;q.xy*=m;HP[k]=q+cc+ax*s*f*1.6;}
  vec3 q=P1-vec3(-.65,0,-.65);q.xy*=rot(-f*.9);P1=q+vec3(-.65,0,-.65)-ax*f*1.6;q=P2-vec3(.65,0,.65);q.xy*=rot(f*.9);P2=q+vec3(.65,0,.65)+ax*f*1.6;}
 CA=(AP[0]+AP[1]+AP[2])/3.;CB=(AP[3]+AP[4]+AP[5])/3.;}
vec3 mloc(vec3 p){return MR*(p-uY.xyz);}
// phosphate: amber-hot P with four oxygens
vec2 phos(vec3 p,vec3 c,float on){vec3 q=p-c;if(length(q)>1.)return vec2(length(q)-.7,3);
 float d=length(q)-.3;for(int i=0;i<4;i++){vec3 t=normalize(vec3(i<2?1:-1,i%2==0?1:-1,i==0||i==3?1:-1));d=min(d,min(length(q-t*.42)-.17,sCap(q,vec3(0),t*.42,.06)));}
 return vec2(d,on>0.?3.:1.);}
vec2 mol(vec3 p){vec2 r=vec2(1e9,0);bool br=uX.w>0.;int k0=0,k1=6;
 // bounds first: the whole ring before the split, then each three-carbon half
 if(!br){float d=length(p);if(d>3.)return vec2(d-2.7,2);}
 else{float a=length(p-CA),b=length(p-CB);if(min(a,b)>2.9)return vec2(min(a,b)-2.6,2);k0=a<b?0:3;k1=k0+3;}
 for(int k=k0;k<k1;k++){vec3 a=AP[k],b=AP[(k+1)%6];float da=length(p-a);if(da>1.75){r=U(r,vec2(da-1.6,2));continue;}
  r=U(r,vec2(da-(k==0?.36:.43),k==0?1.:2.));
  if(!(br&&(k==2||k==5)))r=U(r,vec2(sCap(p,a,b,.085),1.));
  if(k>0)r=U(r,vec2(min(sCap(p,a,SP[k],.075),length(p-SP[k])-(k==5?.4:.31)),k==5?2.:1.));}
 return r;}
vec2 env(vec3 p){
 float d=mtub(p,vec3(-9,-5,-14),vec3(.958,.239,.144),vec3(-.15,0,.99),vec3(.24,-.97,.04));d=min(d,mtub(p,vec3(8,7,-20),vec3(.284,-.189,.94),vec3(.957,0,-.289),vec3(.055,.982,.181)));
 // ribosomes: two subunits, one per hashed cell, kept out of the molecule's way
 vec3 c=floor(p/8.),q=p-c*8.-4.,h=h3(c);float rb=1e9;
 if(h.x>.4&&length(c*8.+4.-uY.xyz)>5.5&&length(c*8.+4.-uC)>4.5){q-=(h-.5)*4.;q.xz*=rot(h.y*6.);rb=smin(length(q)-.45-.05*nz(q*5.).r,length(q-vec3(.32,.3,0))-.3,.12);}
 vec3 bq=abs(p-c*8.-4.);rb=min(rb,4.-max(bq.x,max(bq.y,bq.z))+1.2);
 return U(vec2(d,4),vec2(rb,5));}
vec2 map(vec3 p){vec2 r=env(p);vec3 q=mloc(p);r=U(r,mol(q));if(uX.y>0.)r=U(r,phos(q,P1,uX.y));if(uX.z>0.)r=U(r,phos(q,P2,uX.z));return r;}
vec3 KD=normalize(vec3(-.45,.25,-1.));
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl){l=KD;c=AMB*1.3*uX.x;dl=12.;}
float vis(vec3 p,vec3 l,float dl){return 1.;}
float den(vec3 p){return .005+.02*sat(fbm(p*.22+vec3(0,0,uT*.03))+.15);}
vec3 vem(vec3 p,float t){return vec3(0);}
vec3 sky(vec3 d){float g=max(dot(d,KD),0.);return AMB*(pow(g,24.)*.25+pow(g,400.)*4.)*uX.x+vec3(.003,.005,.01);}
vec3 amb(vec3 p,vec3 n){return vec3(.02,.035,.06)*(n.y*.5+.6)+vec3(.12,.18,.3)*uX.x*sat(dot(n,normalize(vec3(.4,1,.6))));}
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp){
 if(m<1.5){al=vec3(.75,.78,.82);sp=vec3(1,.6,0);}
 else if(m<2.5){al=vec3(.86,.8,.68)*(.85+.15*nz(mloc(p)*6.).r);sp=vec3(.06,.25,.15);}
 else if(m<3.5){al=vec3(.9,.55,.25);sp=vec3(.5,.3,0);}
 else if(m<4.5){al=vec3(.5,.45,.42);sp=vec3(.04,.4,.3);}
 else{al=vec3(.55,.5,.45);sp=vec3(.04,.5,.2);}}
vec3 emi(vec3 p,vec3 n,float m){float k=uE.x*.6+.6;return m>2.5&&m<3.5?AMB*vec3(1.6,1.2,1)*k*2.:vec3(0);}
#endif
// ---------------------------------------------------------------- scene 1: the mitochondrion from outside, and the coda
#if S==1
#define STEPS 90
#define FAR 160.
#define VS 16
#define VFAR 120.
// X: coda (0/1), inner glow, cell glow, porins. Y.x: field rotation
void init(){}
// a mitochondrion: bent capsule, transverse cristae shining through the outer membrane
float mito(vec3 p,float L,float R,out float st){p.y+=.016*p.x*p.x*(12./L);vec3 q=vec3(max(abs(p.x)-L,0.),p.y,p.z*1.15);
 float d=length(q)-R;st=0.;if(d>2.5)return d*.8-.4;st=sin(p.x*1.7+2.*fbm(p*.3));
 return d+.22*fbm(p*.35)+.05*nz(p*1.3).r-.06*sat(.35-nz(p*2.2).a)*uX.w;}
float ST;
vec2 map(vec3 p){
 if(uX.x>.5){p.xz*=rot(uY.x);vec3 c=floor(p/36.),q=p-c*36.-18.,h=h3(c);q-=(h-.5)*10.;q.xz*=rot(h.x*6.3);q.xy*=rot(h.y*2.-1.);
  float st,d=mito(q,7.+3.*h.z,2.6,st);ST=st;vec3 bq=abs(p-c*36.-18.);return vec2(min(d,18.-max(bq.x,max(bq.y,bq.z))+1.),0);}
 float st,d=mito(p,12.,4.5,st);ST=st;
 float s2,d2=mito((p-vec3(-30,-12,-40)).zyx,9.,3.4,s2);if(d2<d)ST=s2*.6;d=min(d,d2);
 // the microtubule track the organelle rides along
 float mt=mtub(p,vec3(0,-6.6,-1),vec3(.995,0,.0995),vec3(0,1,0),vec3(-.0995,0,.995));
 vec3 q=p-vec3(30,10,-55);q.xy*=rot(.5);float s3,d3=mito(q,10.,3.8,s3);if(d3<d)ST=s3*.5;d=min(d,d3);
 return U(vec2(d,0),vec2(mt,1));}
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl){l=normalize(vec3(.3,1,.4));c=vec3(.25,.35,.5)*.9;dl=30.;}
float vis(vec3 p,vec3 l,float dl){return 1.;}
float den(vec3 p){return .012+.03*sat(fbm(p*.07+uT*.01));}
// fog glows near the organelles: amber in-scatter from their inner light (the distance field is the glow falloff)
vec3 vem(vec3 p,float t){float d=map(p).x;return AMB*exp(-max(d,0.)*(uX.x>.5?.35:.28))*(uX.y*.32+uX.z*.8)*(1.+uE.x*.25);}
vec3 sky(vec3 d){return vec3(.006,.01,.018)+AMB*.03*uX.z;}
vec3 amb(vec3 p,vec3 n){return vec3(.03,.045,.07)*(n.y*.5+.5);}
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp){al=m>.5?vec3(.7,.68,.62):vec3(.62,.5,.46);sp=m>.5?vec3(.05,.3,.1):vec3(.04,.18,.6);}
vec3 emi(vec3 p,vec3 n,float m){if(m>.5)return vec3(0);float g=smoothstep(-.3,.9,ST),f=pow(sat(-dot(n,rd)),.6);
 return AMB*vec3(1,.85,.7)*(uX.y*mix(.18,1.3,g*g)*(.3+.7*f)+uX.z*2.*g)*(.85+.3*uE.x)*mix(.4,1.,sat(length(p-ro)/18.));}
#endif
// ---------------------------------------------------------------- scene 2: through the double membrane
#if S==2
#define STEPS 96
#define FAR 40.
#define VS 20
#define VFAR 30.
// X: matrix light, proton glow. Membranes: outer heads y=0/-1.1, inner heads y=-3.4/-4.5; porin and import channel at x=z=0
void init(){}
// one leaflet of lipid heads on a hexagonal lattice, wobbling
float heads(vec3 p,float y){vec2 a=p.xz/vec2(.56,.97),i1=floor(a+.5),i2=floor(a)+.5;vec2 d1=(a-i1)*vec2(.56,.97),d2=(a-i2)*vec2(.56,.97);vec2 dd=dot(d1,d1)<dot(d2,d2)?d1:d2;
 vec2 id=dot(d1,d1)<dot(d2,d2)?i1:i2;return length(vec3(dd.x,p.y-y-.05*sin(uT*2.+id.x*1.7+id.y*2.3),dd.y))-.25;}
float bil(vec3 p,float y0,float y1){float c=abs(p.y-(y0+y1)*.5)-(y0-y1)*.5+.12;return smin(c,min(heads(p,y0),heads(p,y1)),.1);}
vec2 map(vec3 p){float r=length(p.xz);
 float m1=max(bil(p,0.,-1.1),1.45-r);
 float id;vec3 q=pmod(p,16.,id);q.y+=.55;q.xz*=1.;float st=sCap(q,vec3(1.3,-.65,-.3),vec3(1.3,.65,.3),.13);
 float m2=max(bil(p,-3.4,-4.5),1.15-r);
 vec3 q2=pmod(p,8.,id);float ch=sCap(q2,vec3(1.08,-3.2,0),vec3(1.08,-4.7,.15),.2);
 vec2 res=U(vec2(min(m1,m2),0),vec2(st,1));return U(res,vec2(ch,2));}
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl){l=vec3(0,-1,0);c=AMB*3.*uX.x;dl=12.;}
// light comes from the matrix below; the stacked holes decide what it reaches
float vis(vec3 p,vec3 l,float dl){float r=length(p.xz);return p.y<-4.6?1.:p.y<-1.?smoothstep(1.1,.8,r):smoothstep(1.,.7,r)*.9;}
float den(vec3 p){return .04+.05*fbm(p*.5+vec3(0,uT*.1,0));}
vec3 vem(vec3 p,float t){return p.y<-1.2&&p.y>-3.3?AMB*.04*uX.y:vec3(0);}
vec3 sky(vec3 d){return AMB*1.5*uX.x*sat(-d.y);}
vec3 amb(vec3 p,vec3 n){return vec3(.02,.035,.06)*(n.y*.5+.5)+AMB*.25*uX.x*exp(-max(length(p.xz)-1.,0.)*1.8)*sat(.5-n.y);}
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp){if(m<.5){al=vec3(.7,.55,.5);sp=vec3(.05,.15,.7);}else if(m<1.5){al=vec3(.8,.75,.66);sp=vec3(.05,.3,.2);}else{al=vec3(.8,.82,.86);sp=vec3(1,.25,0);}}
vec3 emi(vec3 p,vec3 n,float m){return vec3(0);}
#endif
// ---------------------------------------------------------------- scene 3: cristae cathedral (and the flood)
#if S==3
#define STEPS 100
#define FAR 70.
#define VS 18
#define VFAR 50.
// X: alive (0 dormant .. 1 flood), lamp intensity, ATP glow. Plates every 4 along z, holes alternate sides
#define PZ 4.
#define RT 7.
void init(){}
float wav(vec2 xy,float k){return .45*nz(vec3(xy*.18,k*1.7)).r;}
float gid(vec3 p){float k=floor(p.z/PZ+.5);return floor((p.z-wav(p.xy,k))/PZ);}
vec3 lamp(float g){return vec3(sin(g*2.1)*.8,3.3+.6*sin(g*1.7),(g+.5)*PZ);}
// each crista is a shelf grown from the wall on one side, ending in a wavy, swollen rim; shelves alternate sides
float rim(float y,float k){return .7+.55*sin(y*.42+k*2.3)+.25*nz(vec3(y*.35,k*1.3,0)).g;}
vec2 map(vec3 p){
 float wall=(RT+.7*fbm(p*.2)-length(p.xy*vec2(1,.8)))*.8;
 float k=floor(p.z/PZ+.5),s=mod(k,2.)*2.-1.,lz=p.z-k*PZ-wav(p.xy,k),e=rim(p.y,k)-s*p.x;
 float th=.2+.26*exp(-e*e*5.)+.03*nz(p*1.6).r-.035*sat(.3-nz(p*2.).a);
 float pl=length(vec2(min(e,0.),lz))-th;
 // ATP synthase dimer rows along the rim: heads lean into the matrix, spinning once alive
 float yi=floor(p.y/.62+.5);vec3 kp=vec3(e+.72,p.y-yi*.62,abs(lz)-.22);
 float sk=sCap(kp,vec3(.5,0,-.04),vec3(.05,0,0),.06);vec3 hp=kp;hp.yz*=rot(uX.x*uT*12.+yi);
 float hd=min(min(length(hp*vec3(1,1,1.25))-.17,length(hp-vec3(0,.13,.08))-.07),sk);
 vec2 res=U(vec2(min(wall,pl),0),vec2(hd,1));
 // tubular cristae hanging from the roof and rising from the floor, two per gap
 float g=floor(p.z/PZ);vec3 h=h3(vec3(g,7,3)),L=lamp(g);vec2 tc=vec2((h.x-.5)*8.,(g+.5)*PZ+(h.y-.5)*1.4);
 // the lamp hangs from the roof on a tubule, like a chandelier
 float tb=length(vec2(length(p.xz-L.xz),max(L.y+.3-p.y,0.)))-.2-.05*sin(p.y*5.+g);
 vec2 tc2=vec2((h.z-.5)*8.,(g+.5)*PZ-(h.y-.5)*1.4);tb=min(tb,length(vec2(length(p.xz-tc2),max(p.y+2.9,0.)))-.34);
 res=U(res,vec2(tb,0));
 // the lamp: a respiring supercomplex, glowing
 float ld=length(p-L)-.4;res=U(res,vec2(ld,2));
 return res;}
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl){vec3 d=lamp(gid(p))-p;dl=length(d);l=d/dl;
 c=mix(AMB,vec3(1,.82,.6),uX.x*.7)*uX.y*20./(1.+dl*dl*.35);}
float occ(vec3 p){float k=floor(p.z/PZ+.5),s=mod(k,2.)*2.-1.,e=rim(p.y,k)-s*p.x,pl=length(vec2(min(e,0.),p.z-k*PZ-.2))-.4;
 vec3 L=lamp(floor(p.z/PZ));return min(pl,length(vec2(length(p.xz-L.xz),max(L.y+.3-p.y,0.)))-.2);}
float vis(vec3 p,vec3 l,float dl){float r=1.,t=.35;for(int i=0;i<4;i++){if(t>dl)break;r=min(r,sat(5.*occ(p+l*t)/t));t*=2.;}return r;}
float den(vec3 p){return .024+.045*sat(fbm(p*.3+vec3(0,uT*.05,0))+.1);}
vec3 vem(vec3 p,float t){return vec3(0);}
vec3 sky(vec3 d){return AMB*.02;}
vec3 amb(vec3 p,vec3 n){return vec3(.01,.014,.022)*(.6+.4*n.y)+AMB*.012*(1.+uX.x*2.);}
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp){if(m<.5){al=vec3(.66,.5,.44)*(.8+.3*nz(p*.8).g);sp=vec3(.045,.2,.75);}else if(m<1.5){al=vec3(.85,.86,.9);sp=vec3(1,.25,0);}else{al=vec3(1);sp=vec3(0,1,0);}}
vec3 emi(vec3 p,vec3 n,float m){if(m>1.5)return mix(AMB,vec3(1,.9,.75),uX.x)*uX.y*6.;
 if(m>.5)return AMB*vec3(1,.9,.8)*uX.z*(1.5+uE.x*2.);
 // work: pulses of activity crawling over the membrane once ATP floods
 return AMB*uX.x*.6*pow(sat(nz(p*.5+vec3(0,0,-uT*.8)).r*2.+.2),3.)*(.6+.6*uE.x);}
#endif
// ---------------------------------------------------------------- scene 4: the electron transport chain
#if S==4
#define STEPS 96
#define FAR 50.
#define VS 16
#define VFAR 30.
// L0: electron spark, L1: previous station (arc), L2/L3: proton flashes. X: pressure, cluster glow index, arc age, chain glow. Y: cyt c position
void init(){}
float hel(vec3 p){return .035*sin(p.x*10.)*sin(p.z*10.+p.y*2.);}
vec2 map(vec3 p){
 float mem=abs(p.y)-.6-.06*nz(p*2.2).r;
 vec2 r=vec2(mem,0);
 // complex I: membrane arm with the lateral helix, and the peripheral arm reaching down into the matrix
 float b1=sBox(p-vec3(-2.1,-2.6,0),vec3(4.6,3.8,1.6),.5);
 if(b1>.6)r=U(r,vec2(b1-.3,1));else{
 float c1=sBox(p-vec3(-3.4,0,0),vec3(3.1,.8,.72),.4)+hel(p);
 c1=smin(c1,sCap(p,vec3(.5,-.4,0),vec3(1.1,-4.6,0),.95)+.12*nz(p*1.2).g,.5);
 c1=smin(c1,length(p-vec3(1.2,-4.9,.1))-1.05,.4);
 float lh=sCap(p,vec3(-6.2,-.95,.55),vec3(-.2,-.95,.55),.15);
 // seven iron-sulphur clusters on the arm's face: tiny cubanes
 float fs=1e9;for(int i=0;i<7;i++){float u=float(i)/6.;vec3 c=mix(vec3(1.15,-4.8,1.05),vec3(.45,-.75,.88),u);vec3 q=p-c;q.xy*=rot(float(i));q.yz*=rot(.7);fs=min(fs,sBox(q,vec3(.11),.03));}
 r=U(r,vec2(min(c1,lh),1));r=U(r,vec2(fs,3));}
 // complex III dimer: matrix-side cores and lumen-side Rieske heads
 float b3=length(p-vec3(6.5,-1,0))-3.4;if(b3>.6)r=U(r,vec2(b3-.3,1));else{
 float c3=smin(sCap(p,vec3(5.6,-2.4,0),vec3(5.6,.9,0),.95),sCap(p,vec3(7.4,-2.4,0),vec3(7.4,.9,0),.95),.4);
 c3=smin(c3,min(length(p-vec3(5.4,-2.6,.2))-1.2,length(p-vec3(7.6,-2.6,-.2))-1.2),.3)+hel(p);
 float rk=min(length(p-vec3(5.9,1.6,.5))-.45,length(p-vec3(7.1,1.6,-.45))-.45);r=U(r,vec2(c3,1));r=U(r,vec2(rk,2));}
 // complex II (succinate dehydrogenase): the chain's second entrance, anchored on the matrix side, pumps nothing
 float b2=length(p-vec3(3.3,-1.6,0))-1.7;if(b2>.5)r=U(r,vec2(b2-.2,1));else r=U(r,vec2(smin(sBox(p-vec3(3.3,-.8,0),vec3(.5,.55,.5),.2),length(p-vec3(3.4,-2.,.1))-.72,.25)+hel(p),2));
 // cytochrome c shuttling on the lumen side, heme edge glowing
 r=U(r,vec2(length(p-uY.xyz)-.48,2));
 // complex IV and its CuA domain
 float b4=length(p-vec3(12.1,0,0))-2.6;if(b4>.6)r=U(r,vec2(b4-.3,1));else{
 float c4=sBox(p-vec3(12,-.3,0),vec3(1.1,1.25,.95),.45)+hel(p);c4=smin(c4,length(p-vec3(12.3,1.25,.3))-.62,.3);r=U(r,vec2(c4,1));}
 return r;}
float occ(vec3 p){return min(min(abs(p.y)-.6,min(sBox(p-vec3(-3.4,0,0),vec3(3.1,.8,.72),.4),sCap(p,vec3(.5,-.4,0),vec3(1.1,-4.6,0),1.))),min(length(p-vec3(6.5,-1,0))-2.,sBox(p-vec3(12,-.3,0),vec3(1.1,1.25,.95),.45)));}
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl){l=normalize(vec3(-.3,1,-.5));c=AMB*(.2+.6*uX.x);dl=10.;}
float vis(vec3 p,vec3 l,float dl){float r=1.,t=.3;for(int i=0;i<4;i++){r=min(r,sat(5.*occ(p+l*t)/t));t*=2.1;}return r;}
float den(vec3 p){return (p.y>.6?.02+.06*uX.x:.02)*(.6+.8*fbm(p*.4+vec3(0,uT*.06,0)));}
// the arc: a jagged filament between the last station and the spark
vec3 vem(vec3 p,float t){vec3 a=uL[1].xyz,b=uL[0].xyz,pa=p-a,ba=b-a;float h=sat(dot(pa,ba)/max(dot(ba,ba),1e-4));vec3 q=pa-ba*h;
 q+=(nz(vec3(h*6.,uT*20.,0)).rgb)*.25*sin(h*PI);float d=length(q);return SPK*.25*exp(-d*d*60.)*exp(-uX.z*9.)*step(.001,uL[0].w);}
vec3 sky(vec3 d){return mix(vec3(.006,.012,.02),AMB*(.03+.12*uX.x),sat(d.y*2.+.5));}
vec3 amb(vec3 p,vec3 n){return mix(vec3(.01,.02,.035),AMB*(.02+.1*uX.x),sat(n.y*.5+.5));}
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp){if(m<.5){al=vec3(.62,.5,.45);sp=vec3(.045,.2,.6);}else if(m<1.5){al=vec3(.78,.8,.84);sp=vec3(1,.22,0);}else if(m<2.5){al=vec3(.88,.82,.7);sp=vec3(.06,.3,.15);}else{al=vec3(.5,.45,.4);sp=vec3(1,.2,0);}}
vec3 emi(vec3 p,vec3 n,float m){vec3 e=vec3(0);
 // the spark shines through the membrane and the protein skins
 float d=length(p-uL[0].xyz);e+=SPK*uL[0].w*.6*exp(-d*(m<.5?2.5:3.5));
 if(m>2.5){float u=sat((p.y+4.8)/4.05)*6.,g=exp(-abs(u-uX.y)*2.);e+=SPK*(g*3.+.08);}
 if(m>1.5&&m<2.5&&length(p-uY.xyz)<.6)e+=AMB*vec3(1,.6,.4)*(.6+uY.w*3.);
 if(m<.5&&p.y>0.)e+=AMB*.12*uX.x*(.5+.5*nz(p*.7+uT*.1).g);
 return e;}
#endif
// ---------------------------------------------------------------- scene 5: the crista lumen, filling with protons
#if S==5
#define STEPS 96
#define FAR 60.
#define VS 18
#define VFAR 40.
// X: pressure, shimmer, portal reveal, kick. Corridor along -z, meandering in x; floor -1.7, ceiling 1.7
void init(){}
float cx(float z){return 3.*sin(z*.07)+1.5*sin(z*.023+1.);}
vec2 map(vec3 p){vec3 q=p;q.x-=cx(p.z);
 float bul=.3*nz(vec3(q.xz*.12,0)).r+uX.x*.08*sin(uT*7.+q.z);
 float fl=q.y+1.7+bul-.07*nz(p*2.4).r,ce=1.7+bul-q.y-.07*nz(p*2.4+5.).r;
 // pillars: tubular junctions floor to ceiling, flared, off the flight line
 float g=floor(p.z/9.),hx=h1(g)*2.-1.;vec2 pc=vec2(sign(hx)*(2.4+abs(hx)),(g+.5)*9.);float pr=length(vec2(q.x,p.z)-pc)-.55-.35*smoothstep(.6,1.7,abs(q.y));
 // respiratory complexes in the ceiling, venting protons
 vec3 v=q;v.z=mod(p.z,7.)-3.5;v.x-=-1.8+3.6*step(.5,h1(floor(p.z/7.)+3.));float cpx=sBox(v-vec3(0,1.6,0),vec3(.8,.5,.6),.3)+.03*sin(v.x*12.)*sin(v.z*12.);
 // the F0 c-ring at the end of the corridor (z=-56): twelve hairpins in the floor, the a-subunit beside
 vec3 cr=p-vec3(cx(-56.),-1.7,-56.);float ring=length(cr)-3.;if(ring<.5){float id;vec3 rq=pmod(cr,12.,id);ring=min(sCap(rq,vec3(1.,-.6,0),vec3(1.,.35,0),.17),sCap(rq,vec3(.66,-.6,0),vec3(.66,.25,0),.15));
 ring=min(ring,sBox(cr-vec3(1.75,0,0),vec3(.4,.35,.7),.25));}
 vec2 r=vec2(min(min(fl,ce),pr),0);r=U(r,vec2(cpx,1));return U(r,vec2(ring,2));}
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl){vec3 d=vec3(cx(p.z-6.),1.2,p.z-6.)-p;dl=length(d);l=d/dl;c=AMB*(.6+1.2*uX.x)*1.5/(1.+dl*dl*.12);}
float occ(vec3 p){vec3 q=p;q.x-=cx(p.z);float g=floor(p.z/9.),hx=h1(g)*2.-1.;vec2 pc=vec2(sign(hx)*(2.4+abs(hx)),(g+.5)*9.);
 vec3 v=q;v.z=mod(p.z,7.)-3.5;v.x-=-1.8+3.6*step(.5,h1(floor(p.z/7.)+3.));return min(min(q.y+1.7,1.7-q.y),min(length(vec2(q.x,p.z)-pc)-.6,sBox(v-vec3(0,1.6,0),vec3(.8,.5,.6),.3)));}
float vis(vec3 p,vec3 l,float dl){float r=1.,t=.3;for(int i=0;i<4;i++){if(t>dl)break;r=min(r,sat(5.*occ(p+l*t)/t));t*=2.;}return r;}
float den(vec3 p){return (.02+.06*uX.x)*(.6+nz(p*.5+vec3(uT*.1,0,uT*.2)).r);}
vec3 vem(vec3 p,float t){vec3 cr=p-vec3(cx(-56.),-1.4,-56.);return AMB*uX.z*1.5*exp(-dot(cr,cr)*.25)+AMB*uX.x*.06;}
vec3 sky(vec3 d){return AMB*.02;}
vec3 amb(vec3 p,vec3 n){return AMB*(.01+.05*uX.x)+vec3(.006,.008,.012);}
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp){if(m<.5){al=vec3(.64,.5,.45);sp=vec3(.045,.18,.7);}else if(m<1.5){al=vec3(.75,.77,.8);sp=vec3(1,.25,0);}else{al=vec3(.85,.86,.9);sp=vec3(1,.2,0);}}
vec3 emi(vec3 p,vec3 n,float m){
 // the membrane glows from the protons pressing on it
 if(m<.5)return AMB*uX.x*.25*pow(sat(.6+nz(p*.9+vec3(0,0,uT*.3)).r),2.)*(1.+.5*uX.w);
 if(m<1.5)return AMB*2.*step(abs(p.y-1.05),.12)*(1.+uX.w);
 return AMB*uX.z*1.5*sat(1.-abs(p.y+1.4))*(.7+.3*sin(uT*9.));}
#endif
// ---------------------------------------------------------------- scene 6: ATP synthase
#if S==6
#define STEPS 100
#define FAR 60.
#define VS 16
#define VFAR 40.
// uA: rotor angle. X: backlight, membrane proton glow, dimer partner, catalytic flash age. Y: last site, heat, -, -.
// uP[i]: released ATP molecules (xyz, age; age 0 = unused)
// per pixel, only the ATPs this ray passes near are evaluated
bool AM[6];
void init(){for(int i=0;i<6;i++){vec3 d=uP[i].xyz-ro;float s=max(dot(d,rd),0.);AM[i]=uP[i].w>0.&&length(d-rd*s)<1.2;}}
float mem(vec3 p){vec2 q=p.xz-vec2(.35,0);p.y-=uX.y*.25*exp(-dot(p.xz,p.xz)*.03)*(.8+.2*sin(uT*9.))*step(uB,80.);return max(abs(p.y)>.75?abs(p.y)-.47:abs(p.y)-.42-.05*nz(p*2.).r,1.42-length(q*vec2(.82,1.)));}
// F0 c-ring (12 hairpins), the gamma/epsilon foot and the gamma coiled coil, all turning with uA
vec2 rotor(vec3 p){vec3 q=p;q.xz*=rot(uA);float id;vec3 c=pmod(q,12.,id);
 float h=min(sCap(c,vec3(.98,-.62,0),vec3(1.,.55,.06),.16),sCap(c,vec3(.64,-.6,0),vec3(.66,.55,.04),.14));
 h=min(h,sCap(c,vec3(.66,.6,.04),vec3(1.,.6,.06),.11));
 float ft=smin(sCyl(q-vec3(0,.78,0),.55,.12)-.05,length(q-vec3(.25,1.05,.1))-.33,.15);
 vec3 g=q;g.xz*=rot(g.y*2.2);float cc=min(length(g.xz-vec2(.11,0))-.12,length(g.xz+vec2(.11,0))-.12);cc=max(cc,abs(q.y-2.6)-1.75);
 cc=smin(cc,sEll(q-vec3(.22,3.1,0),vec3(.32,.45,.25)),.15);
 vec2 r=U(vec2(h,1),vec2(min(ft,cc),2));
 return r;}
// one alpha or beta lobe of the hexamer; beta lobes breathe open as the gamma cam passes
float lobe(vec3 p,float a,bool b,float op){p.xz*=rot(a);p-=vec3(1.32,0,0);p.xy*=rot(-.12-op*.2);
 float d=(length(p/vec3(.62,1.05,.6))-1.)*.6;d=smin(d,length(p-vec3(-.1,.95,0))-.38,.2);d=smin(d,length((p-vec3(.15,-.85,0))/vec3(1,.9,1))*.9-.42,.2);
 d+=.012*sin(p.y*28.)*(b?1.:.4);return d;}
float SITE;
vec2 head(vec3 p){vec3 q=p-vec3(0,3.55,0);float a=atan(q.z,q.x),k=floor(a/(PI/3.)+.5),k2=k+sign(a/(PI/3.)-k);
 vec2 r=vec2(1e9,0);
 for(int i=0;i<2;i++){float kk=i==0?k:k2;bool b=mod(kk,2.)>.5;float an=kk*PI/3.;
  float op=b?.5+.5*cos(uA-an):0.;float d=lobe(q,-an,b,op);r=U(r,vec2(d,b?1.:3.));}
 float cap=smin(sEll(p-vec3(.2,5.05,0),vec3(.75,.32,.7)),length(p-vec3(.85,5.,.05))-.3,.2);
 return U(r,vec2(cap,3));}
vec2 stator(vec3 p){
 // a-subunit in the membrane, peripheral stalk up the side, OSCP cap on the crown
 float a=sBox(p-vec3(1.65,0,0),vec3(.42,.4,.62),.25);
 vec3 w=vec3(.05*sin(p.y*7.),0,.05*cos(p.y*7.));float b=1e9;for(int i=0;i<2;i++){w=-w;vec3 q=p+w;b=min(b,min(sCap(q,vec3(1.75,.3,.1),vec3(2.2,1.9,.2),.09),min(sCap(q,vec3(2.2,1.9,.2),vec3(2.15,3.8,.15),.085),sCap(q,vec3(2.15,3.8,.15),vec3(1.05,5.05,.05),.085))));}
 // bolts where the stalk meets the a-subunit and the cap
 b=min(b,min(length(p-vec3(1.78,.4,.1))-.17,length(p-vec3(1.15,4.98,.05))-.16));
 return vec2(min(a,b),3);}
vec2 atp(vec3 p,vec4 a){vec3 q=p-a.xyz;float bd=length(q)-.75;if(bd>.2)return vec2(bd,4);
 q.xy*=rot(a.w*3.);q.yz*=rot(a.w*2.1);
 float d=min(min(length(q-vec3(.38,0,0))-.12,length(q-vec3(.6,.05,0))-.12),length(q-vec3(.16,-.04,0))-.12);
 vec2 r=vec2(d,4);float rib=length(q-vec3(-.08,.06,0))-.15;float ad=sBox(q-vec3(-.38,.0,0),vec3(.18,.1,.04),.04);
 return U(r,vec2(min(rib,ad),3));}
vec2 synth(vec3 p){float b=length(p-vec3(.4,2.4,0))-3.6;if(b>.3)return vec2(b,1);
 // per-part bounds: rotor (ring + shaft), head (squashed sphere), stator (stalk capsules)
 float br=min(sCyl(p-vec3(0,.35,0),1.4,1.05),sCap(p,vec3(0,1.,0),vec3(0,4.4,0),.65)),bh=length((p-vec3(0,3.75,0))*vec3(1,.8,1))-2.4,
 bs=min(sCap(p,vec3(1.7,.1,.1),vec3(2.2,1.9,.2),.75),sCap(p,vec3(2.2,1.9,.2),vec3(1.05,5.05,.05),.45));
 vec2 r=br>.2?vec2(br,1):rotor(p);r=U(r,bh>.2?vec2(bh,1):head(p));return U(r,bs>.2?vec2(bs,3):stator(p));}
vec2 map(vec3 p){vec2 r=U(vec2(mem(p),0),synth(p));
 if(uX.z>0.){vec3 q=p-vec3(-2.9,0,-2.6);q.xy*=rot(.75);q.xz*=rot(2.4);q.y+=.45;r=U(r,synth(q));}
 for(int i=0;i<6;i++)if(AM[i])r=U(r,atp(p,uP[i]));
 return r;}
void keyl(vec3 p,out vec3 l,out vec3 c,out float dl){vec3 d=vec3(-5,8,-7)-p;dl=length(d);l=d/dl;c=AMB*(.25+.55*uX.x);}
float occ(vec3 p){return min(min(mem(p),length(p-vec3(0,3.7,0))-1.9),min(sCap(p,vec3(0,.3,0),vec3(0,3,0),.5),sCap(p,vec3(2.2,1.9,.2),vec3(2.15,3.8,.15),.15)));}
float vis(vec3 p,vec3 l,float dl){float r=1.,t=.3;for(int i=0;i<4;i++){r=min(r,sat(5.*occ(p+l*t)/t));t*=2.1;}return r;}
float den(vec3 p){return p.y<-.4?.05+.06*uX.y:(.012+.02*uY.y)*(.7+nz(p*.5+vec3(0,uT*.1,0)).r);}
vec3 vem(vec3 p,float t){return p.y<-.45?AMB*uX.y*.25*(.6+.6*nz(p*.8+vec3(uT*.3,0,0)).g):vec3(0);}
vec3 sky(vec3 d){return mix(vec3(.005,.008,.015),AMB*(.02+.04*uX.x),sat(d.y+.3))+AMB*pow(max(dot(d,normalize(vec3(-5,8,-7))),0.),20.)*uX.x*.5;}
vec3 amb(vec3 p,vec3 n){return vec3(.01,.015,.025)*(n.y*.5+.5)+AMB*uX.y*.08*sat(-n.y)+AMB*.008;}
void mat(vec3 p,vec3 n,float m,out vec3 al,out vec3 sp){if(m<.5){al=vec3(.6,.48,.43);sp=vec3(.045,.2,.6);}else if(m<1.5){al=vec3(.82,.84,.88);sp=vec3(1,.18,0);}else if(m<2.5){al=vec3(.75,.72,.68);sp=vec3(1,.3,0);}else if(m<3.5){al=vec3(.88,.82,.7);sp=vec3(.06,.3,.15);}else{al=vec3(1,.6,.3);sp=vec3(.5,.2,0);}}
vec3 emi(vec3 p,vec3 n,float m){vec3 e=vec3(0);
 if(m<.5&&p.y<0.)e+=AMB*uX.y*.6;
 // proton sites on the c-ring: loaded (glowing) everywhere except the slot at the a-subunit
 if(m>.5&&m<1.5&&p.y<.7&&length(p.xz)<1.25){vec3 q=p;q.xz*=rot(uA);float id;vec3 c=pmod(q,12.,id);float wa=atan(p.z,p.x);
  float ld=smoothstep(.25,.7,abs(atan(sin(wa),cos(wa))));e+=AMB*vec3(1,.7,.5)*ld*4.*exp(-dot(c-vec3(1.12,0,0),c-vec3(1.12,0,0))*30.)*(.5+uX.y);}
 // the catalytic site that just fired
 if(m>.5&&m<1.5&&p.y>2.5){float an=uY.x*2.*PI/3.+PI/3.;vec3 s=vec3(cos(an),3.2,-sin(an))*.95;e+=vec3(1,.85,.6)*exp(-uX.w*5.)*8.*exp(-dot(p-s,p-s)*3.);}
 if(m>1.5&&m<2.5){vec3 q=p;q.xz*=rot(uA);e+=AMB*vec3(1.3,.9,.6)*smoothstep(.9,.98,normalize(q.xz+1e-5).x)*(1.5+3.*exp(-uX.w*6.))*step(.5,q.y);}
 // non-catalytic sites on the alpha lobes hold ADP that glows faintly
 if(m>2.5&&m<3.5&&p.y>2.5&&p.y<4.5){float a=atan(p.z,p.x)/(PI/3.);e+=AMB*.6*exp(-abs(fract(a)-.5)*14.)*exp(-(length(p.xz)-1.05)*(length(p.xz)-1.05)*20.-(p.y-3.2)*(p.y-3.2)*6.);}
 if(m>3.5)e+=AMB*vec3(1.4,1,.7)*3.;
 return e;}
#endif
// ---------------------------------------------------------------- common: marching, lighting, medium
float shd(vec3 p,vec3 l,float tm){float r=1.,t=.03;for(int i=0;i<16;i++){float h=map(p+l*t).x;r=min(r,8.*h/t);t+=clamp(h,.04,.7);if(r<.02||t>tm)break;}return sat(r);}
float ao(vec3 p,vec3 n){float a=0.,s=1.;for(int i=1;i<5;i++){float h=.06*float(i*i);a+=(h-map(p+n*h).x)*s;s*=.6;}return sat(1.-a*.9);}
vec3 nor(vec3 p,float t){vec2 e=vec2(1,-1)*(.0006+.0006*t);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x+1e-7);}
float hg(float c,float g){return(1.-g*g)/(12.57*pow(1.+g*g-2.*g*c,1.5));}
vec3 shade(vec3 p,vec3 n,float m,float t){
 vec3 al,sp,l,lc;float dl;mat(p,n,m,al,sp);keyl(p,l,lc,dl);
 // wet lipid micro-relief: perturb the normal of membrane materials by the gradient of a fine noise (shading only)
 if(sp.z>.3&&sp.x<.5){float e=.04,c0=nz(p*7.).b;vec3 g=vec3(nz(p*7.+vec3(e*7.,0,0)).b,nz(p*7.+vec3(0,e*7.,0)).b,nz(p*7.+vec3(0,0,e*7.)).b)-c0;n=normalize(n-(g-n*dot(g,n))*1.6);}
 vec3 v=-rd;float nl=dot(n,l),sh=shd(p+n*.01,l,dl),a=ao(p,n),nv=max(dot(n,v),0.);
 vec3 h=normalize(l+v+1e-4);float pw=2./(sp.y*sp.y+.002),spec=pow(max(dot(n,h),0.),pw)*(pw+8.)/25.;
 vec3 F0=mix(vec3(sp.x),al,sp.x>.5?1.:0.),F=F0+(1.-F0)*pow(sat(1.-nv),5.);
 float wr=sp.z>0.?sat((nl+sp.z*.6)/(1.+sp.z*.6)):max(nl,0.);
 vec3 dif=al*(sp.x>.5?.05:1.)*(wr*sh*lc+amb(p,n)*a);
 // translucency: light passing through thin membrane (thickness probe along the inverted normal)
 float th=sat(1.+map(p-n*.25).x/.25);dif+=al*sp.z*lc*sh*th*pow(sat(dot(v,-l)),2.)*.8+al*sp.z*AMB*.05*th;
 vec3 c=dif+F*spec*lc*sh*max(nl,0.);
 // environment reflection: chrome mirrors the dark cathedral, wet lipid sheens at grazing angles
 vec3 rf=reflect(rd,n);c+=F*sky(rf)*a*(sp.x>.5?1.6:.6)+F*AMB*.08*a*sat(rf.y+.5);
 for(int i=0;i<4;i++)if(uL[i].w>0.){vec3 d=uL[i].xyz-p;float r2=max(dot(d,d),1e-6);d*=inversesqrt(r2);float k=uL[i].w/(1.+r2*3.);
  vec3 hh=normalize(d+v+1e-4);c+=SPK*k*(al*(sp.x>.5?.1:1.)*max(dot(n,d),0.)+F*pow(max(dot(n,hh),0.),pw)*(pw+8.)/25.);}
 return c+emi(p,n,m);}
void main(){
 vec2 q=(2.*gl_FragCoord.xy-uR.xy)/uR.y;ro=uC;vec3 f=normalize(uD-uC),r=normalize(cross(f,vec3(0,1,0))),u=cross(r,f);
 vec3 r2=r*cos(uF.x)+u*sin(uF.x);u=cross(r2,f);rd=normalize(f+uF.y*(q.x*r2+q.y*u));
 init();
 float t=.02,m=-1.;for(int i=0;i<STEPS;i++){vec2 h=map(ro+rd*t);if(h.x<.0004*t+.0008){m=h.y;break;}t+=h.x*.85;if(t>FAR)break;}
 vec3 col;if(m>=0.){vec3 p=ro+rd*t;col=shade(p,nor(p,t),m,t);}else{col=sky(rd);t=FAR;}
 // participating medium: jittered march, key light shadowed by a 4-tap probe, HG forward scattering
 float jt=fract(52.9829*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))+uR.z*.618),tm=min(t,VFAR),dt=tm/float(VS),tr=1.;vec3 sc=vec3(0);
 for(int i=0;i<VS;i++){float s=(float(i)+jt)*dt;vec3 p=ro+rd*s,l,lc;float dl;keyl(p,l,lc,dl);float de=den(p);
  vec3 L=lc*vis(p,l,dl)*(hg(dot(rd,l),.6)+.02)+vem(p,s);sc+=tr*de*dt*L;tr*=exp(-de*dt);}
 col=col*tr+sc;
 // spark halos (analytic, depth tested)
 for(int i=0;i<4;i++)if(uL[i].w>0.){vec3 d=uL[i].xyz-ro;float s=dot(d,rd);if(s>0.&&s<t){float e=length(d-rd*s);col+=SPK*uL[i].w*(.004/(e*e+.0004)+.15*exp(-e*3.));}}
 o=vec4(clamp(col,0.,64.),t);}
