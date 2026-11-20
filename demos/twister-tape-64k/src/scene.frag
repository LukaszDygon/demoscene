#version 300 es
precision highp float;
uniform vec2 R;uniform float T,FN,LT,SU,RD,Z,NI,WS,RV,WT,DO,MD,PT[13];uniform vec3 C;uniform mat3 M;
out vec4 o;
const vec3 FC=vec3(0.,0.,400.),RP=vec3(18.,0.,236.),LD=vec3(.5,.7,.5),DN=vec3(-200.,0.,360.),SF=vec3(-150.,0.,330.);
const vec3 HM[13]=vec3[13](vec3(-60.,0.,385.),vec3(48.,0.,418.),vec3(92.,0.,362.),vec3(-112.,0.,428.),vec3(-14.,0.,342.),vec3(-150.,6.,380.),vec3(-40.,0.,352.),vec3(30.,0.,336.),vec3(92.,16.,362.),vec3(-200.,0.,335.),vec3(-180.,0.,327.),vec3(-80.,0.,400.),vec3(-230.,0.,370.));
const int KD[13]=int[13](0,1,3,2,4,5,6,6,7,8,8,9,10);
const float MT[13]=float[13](2.,3.,5.,4.,6.,13.,12.,12.,5.,16.,16.,2.,4.);
const vec3 HO[7]=vec3[7](vec3(-150.,0.,380.),vec3(150.,0.,395.),vec3(-200.,0.,330.),vec3(210.,0.,420.),vec3(-260.,0.,400.),vec3(250.,0.,360.),vec3(-120.,0.,300.));
const vec3 AL[27]=vec3[27](vec3(.36,.4,.24),vec3(.36,.4,.24),vec3(.5,.14,.1),vec3(.62,.64,.6),vec3(.6,.6,.55),vec3(.92,.9,.85),vec3(.3,.35,.5),vec3(.6,.52,.4),vec3(.12,.12,.12),vec3(1.,.25,.55),vec3(.25,.25,.25),vec3(.8,.8,.82),vec3(.3,.5,.6),vec3(.35,.2,.15),vec3(.2,.3,.15),vec3(.7,.6,.25),vec3(.25,.2,.15),vec3(.15,.15,.25),vec3(.42,.4,.38),vec3(.8,.2,.2),vec3(.9,.8,.2),vec3(.8,.5,.2),vec3(1.,.8,.1),vec3(.3,.7,.25),vec3(.08,.07,.06),vec3(.05,.05,.05),vec3(.85,.8,.7));
float h3(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1.,0.,0.)),f.x),mix(h3(i+vec3(0.,1.,0.)),h3(i+vec3(1.,1.,0.)),f.x),f.y),
  mix(mix(h3(i+vec3(0.,0.,1.)),h3(i+vec3(1.,0.,1.)),f.x),mix(h3(i+vec3(0.,1.,1.)),h3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float bx(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float cy(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float tr(vec3 p,float R_,float r){return length(vec2(length(p.xy)-R_,p.z))-r;}
float ds3(vec3 p,vec3 a,vec3 b){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}
float ob(int k,vec3 q){
 if(k==0)return bx(q-vec3(0.,4.5,0.),vec3(7.,4.5,10.));
 if(k==1)return min(cy(q-vec3(0.,11.,0.),1.2,11.),length(q-vec3(0.,25.,0.))-6.);
 if(k==2)return cy(q-vec3(0.,13.,0.),5.,13.);
 if(k==3)return min(bx(q-vec3(0.,5.,0.),vec3(6.,5.,9.)),bx(q-vec3(0.,15.,0.),vec3(2.,6.,2.)));
 if(k==4)return min(bx(q-vec3(0.,1.5,0.),vec3(1.4,1.2,3.)),bx(q-vec3(0.,2.9,-1.),vec3(1.2,.9,1.2)));
 if(k==5)return bx(q-vec3(0.,.6,0.),vec3(8.,.6,6.));
 if(k==6)return min(bx(q-vec3(0.,.7,0.),vec3(1.9,.7,.9)),bx(q-vec3(0.,1.5,-.2),vec3(1.,.5,.8)));
 if(k==7)return bx(q-vec3(0.,8.,0.),vec3(1.,8.,1.));
 if(k==8)return min(min(bx(q-vec3(0.,1.3,0.),vec3(1.6,.8,.7)),bx(q-vec3(1.8,1.6,0.),vec3(.4,.4,.35))),min(min(bx(q-vec3(.9,.3,.4),vec3(.12,.3,.12)),bx(q-vec3(.9,.3,-.4),vec3(.12,.3,.12))),min(bx(q-vec3(-.9,.3,.4),vec3(.12,.3,.12)),bx(q-vec3(-.9,.3,-.4),vec3(.12,.3,.12)))));
 if(k==10){vec3 b=q-vec3(0.,20.,0.);b.yz=mat2(cos(T*2.),-sin(T*2.),sin(T*2.),cos(T*2.))*b.yz;
  return min(min(cy(q-vec3(0.,9.,0.),.5,9.),length(b)-1.2),min(bx(b,vec3(.1,8.,.1)),bx(b,vec3(.1,.1,8.))));}
 return min(min(bx(q-vec3(0.,1.2,0.),vec3(1.5,.7,.9)),bx(q-vec3(-.4,2.3,0.),vec3(.7,.7,.8))),min(bx(q-vec3(1.3,.9,1.),vec3(.9,.9,.2)),bx(q-vec3(-1.2,.9,-1.),vec3(.9,.9,.2))));
}
float dbr(vec3 p){
 float d=1e3;
 if(length(p-FC)>260.)return d;
 for(int i=0;i<24;i++){
  float fi=float(i),ph=fi*2.39+T*(.6+.25*h3(vec3(fi,0.,0.))),rr=mix(20.,70.,h3(vec3(fi,1.,0.))),yy=20.+260.*fract(h3(vec3(fi,2.,0.))+T*.05),s=.5+1.5*h3(vec3(fi,3.,0.));
  vec3 q=p-(FC+vec3(rr*cos(ph),yy,rr*sin(ph)));
  q.xz=mat2(cos(T+fi),-sin(T+fi),sin(T+fi),cos(T+fi))*q.xz;
  d=min(d,bx(q,vec3(s,s*.4,s*.8)));
 }
 return d;
}
vec2 mp(vec3 p){
 vec2 r=vec2(p.y,1.);
 for(int i=0;i<7;i++){float d=bx(p-HO[i]-vec3(0.,3.,0.),vec3(5.,3.,4.));if(d<r.x)r=vec2(d,7.);}
 float d=bx(p-DN-vec3(0.,3.,0.),vec3(6.,3.,4.));if(d<r.x)r=vec2(d,11.);
 d=bx(p-DN-vec3(0.,7.6,-2.),vec3(3.,.7,.2));if(d<r.x)r=vec2(d,9.);
 d=cy(p-DN-vec3(0.,4.,-3.),.12,4.);if(d<r.x)r=vec2(d,10.);
 d=bx(p-RP-vec3(0.,.3,0.),vec3(.6,.3,.4));if(d<r.x)r=vec2(d,8.);
 vec3 f=p-SF;
 if(abs(f.x)<120.){vec3 g=f;g.x=mod(g.x+2.,4.)-2.;d=min(bx(g-vec3(0.,.6,0.),vec3(.05,.6,.05)),bx(f-vec3(0.,1.1,0.),vec3(120.,.04,.04)));if(d<r.x)r=vec2(d,10.);}
 vec3 w=p-vec3(0.,0.,470.);w.x=mod(w.x+6.,12.)-6.;
 if(abs(p.x)<420.){d=min(cy(w-vec3(0.,4.,0.),.4,4.),length(w-vec3(0.,9.,0.))-3.);if(d<r.x)r=vec2(d,14.);}
 vec3 sq=p-vec3(0.,0.,530.);sq.x=mod(sq.x+70.,140.)-70.;
 if(abs(p.x)<520.){d=bx(sq-vec3(0.,4.,0.),vec3(16.,4.,9.));if(d<r.x)r=vec2(d,11.);}
 vec3 lq=p-vec3(0.,0.,440.);lq.x=mod(lq.x+15.,30.)-15.;
 if(abs(p.x)<300.){d=min(cy(lq-vec3(0.,4.,0.),.15,4.),bx(lq-vec3(0.,8.2,0.),vec3(.6,.2,.3)));if(d<r.x)r=vec2(d,10.);}
 d=bx(p-vec3(-300.,20.,300.),vec3(8.,20.,8.));if(d<r.x)r=vec2(d,4.);
 d=min(cy(p-vec3(250.,11.,300.),1.2,11.),length(p-vec3(250.,25.,300.))-6.);if(d<r.x)r=vec2(d,3.);
 vec3 hq=p+vec3(110.,0.,-360.);hq.xz=mod(hq.xz+2.5,5.)-2.5;
 if(abs(p.x+110.)<30.&&abs(p.z-360.)<30.){d=bx(hq-vec3(0.,.8,0.),vec3(1.2,.8,.8));if(d<r.x)r=vec2(d,15.);}
 vec3 pq=p-RP;pq.xz=mod(pq.xz+3.,6.)-3.;
 if(length(p.xz-RP.xz)<40.){d=bx(pq-vec3(0.,.05,0.),vec3(1.5,.05,.2));if(d<r.x)r=vec2(d,13.);}
 d=dbr(p);if(d<r.x)r=vec2(d,13.);
 if(NI>.05){for(int i=0;i<3;i++){vec3 sa=RP+vec3(cos(T*.07+float(i)*2.1)*9.,0.,sin(T*.07+float(i)*2.1)*7.);d=ds3(p,sa+vec3(0.,.3,0.),sa+vec3(0.,1.6,0.))-.3;if(d<r.x)r=vec2(d,17.);}}
 if(MD>1.5&&MD<2.5){
  float dw=ds3(p,vec3(-9.,6.,270.),vec3(-9.,6.,300.))-.05;
  vec3 e=vec3(-9.,max(.2,6.-6.*min(1.,(T-WS)*1.5)),300.+4.*max(0.,T-WS));
  float dz=T>WS?ds3(p,vec3(-9.,6.,270.),e)-.05:dw;
  d=min(dz,min(bx(p-vec3(-9.,4.,270.),vec3(.15,4.,.15)),bx(p-vec3(-9.,4.,300.),vec3(.15,4.,.15))));if(d<r.x)r=vec2(d,25.);
 }
 for(int i=0;i<13;i++){
  float pr=clamp((T-PT[i])/9.,0.,1.);if(pr>=1.)continue;
  vec3 h=HM[i]-FC;float rad=mix(length(h.xz),22.,pr*pr),a=atan(h.z,h.x)+7.*pr*pr,s=max(1.-smoothstep(.75,1.,pr),.02),sp=pr*6.;
  vec3 q=(p-FC-vec3(rad*cos(a),h.y+pow(pr,1.6)*240.,rad*sin(a)))/s;
  q.xz=mat2(cos(sp),-sin(sp),sin(sp),cos(sp))*q.xz;
  float dd=ob(KD[i],q)*s;
  if(dd<r.x)r=vec2(dd,MT[i]);
 }
 return r;
}
vec2 mpF(vec3 p){
 vec2 r=vec2(p.y,23.);
 vec3 fw=p-vec3(0.,22.,60.);
 float d=min(tr(fw,14.,.6),bx(fw,vec3(.8,.8,4.)));
 d=min(d,min(bx(p-vec3(-6.,11.,60.),vec3(.5,11.,1.)),bx(p-vec3(6.,11.,60.),vec3(.5,11.,1.))));
 if(d<r.x)r=vec2(d,19.);
 for(int i=0;i<8;i++){float a=float(i)*.785+T*.2;d=bx(fw-vec3(14.*cos(a),14.*sin(a),0.),vec3(1.,1.2,1.));if(d<r.x)r=vec2(d,20.);}
 vec3 tb=p-vec3(-8.,.8,40.);
 d=bx(tb,vec3(3.,.8,1.2));if(d<r.x)r=vec2(d,26.);
 for(int i=0;i<3;i++){d=cy(p-vec3(-9.+float(i)*1.,1.7,40.),.45,.1);if(d<r.x)r=vec2(d,21.);}
 if(abs(p.x)<21.&&abs(p.z-30.)<1.){float xi=floor((p.x+20.)/2.)*2.-19.;vec3 fb=vec3(mod(p.x+20.,2.)-1.,p.y-8.5+.012*xi*xi,p.z-30.);d=bx(fb,vec3(.45,.5,.02));if(d<r.x)r=vec2(d,22.);}
 d=min(bx(p-vec3(-20.,4.5,30.),vec3(.1,4.5,.1)),bx(p-vec3(20.,4.5,30.),vec3(.1,4.5,.1)));if(d<r.x)r=vec2(d,10.);
 return r;
}
vec2 mpC(vec3 p){
 float ce=2.5-p.y;if(DO>1.5&&max(abs(p.x),abs(p.z))<1.5)ce=1e3;
 float dn=min(min(3.-abs(p.x),3.-abs(p.z)),min(p.y,ce));
 vec2 r=vec2(dn,18.);
 float d=bx(p-vec3(2.4,1.,1.5),vec3(.3,1.,.8));if(d<r.x)r=vec2(d,4.);
 d=bx(p-vec3(-2.2,.5,-2.),vec3(.5,.5,.5));if(d<r.x)r=vec2(d,17.);
 if(DO<1.5){d=bx(p-vec3(0.,2.5+DO,0.),vec3(1.5,.05,1.5));if(d<r.x)r=vec2(d,13.);}
 return r;
}
vec2 mpx(vec3 p){if(MD<.5)return mpF(p);if(MD>2.5)return mpC(p);return mp(p);}
vec3 nrm(vec3 p){vec2 e=vec2(.05,0.);
 return normalize(vec3(mpx(p+e.xyy).x-mpx(p-e.xyy).x,mpx(p+e.yxy).x-mpx(p-e.yxy).x,mpx(p+e.yyx).x-mpx(p-e.yyx).x));
}
vec2 vol(vec3 p){
 float y=p.y;if(y<0.||y>430.)return vec2(0.);
 vec3 q=p-FC;float r=length(q.xz),R0=mix(12.,75.,smoothstep(0.,430.,y));
 if(r>R0*1.6)return vec2(0.);
 float a=atan(q.z,q.x),R_=R0*(.85+.3*n3(vec3(a*2.,y*.02,T*.4)));
 float d=1.-smoothstep(R_*.6,R_,r);d*=smoothstep(0.,4.,y)*(1.-smoothstep(360.,430.,y));
 d*=.55+.9*n3(vec3(r*.05,y*.03,a*3.+T*.8));
 vec3 cl=floor(vec3(a*6.+y*.05+T*3.,y*.35,r*.3));
 d+=step(.972,h3(cl))*(1.-smoothstep(R_*.4,R_,r))*1.5;
 for(int k=0;k<2;k++){vec2 o=vec2(cos(T*.9+float(k)*3.14),sin(T*.9+float(k)*3.14))*R_*.45;
  d+=(1.-smoothstep(0.,R_*.28,length(q.xz-o)))*smoothstep(0.,6.,y)*(1.-smoothstep(200.,320.,y))*(.6+.6*n3(p*.15+T*.5));}
 float tn=n3(vec3(a*4.-T*2.+y*.08,y*.2,r*.1));
 d+=smoothstep(.7,.9,tn)*smoothstep(0.,4.,y)*(1.-smoothstep(R_*.5,R_,r))*.6;
 d+=(1.-smoothstep(0.,40.,abs(y-395.)))*(1.-smoothstep(60.,110.,r))*smoothstep(40.,70.,r)*.5*n3(vec3(a*3.+T*.5,y*.1,r*.02));
 d+=(1.-smoothstep(0.,14.,y))*.6*(1.-smoothstep(R_*.3,R_*1.2,r));
 d+=(1.-smoothstep(0.,60.,y))*(1.-smoothstep(R0*.6,R0*1.5,r))*.35*n3(vec3(r*.1,y*.1,T*.3));
 float sh=smoothstep(R_*.9,R_,r)*(1.-smoothstep(R_*1.05,R_*1.3,r))*smoothstep(8.,40.,y)*(1.-smoothstep(330.,390.,y))*.7;
 return vec2(d,sh);
}
vec3 sky(vec3 d){
 float a=atan(d.x,d.z);
 vec3 c=mix(vec3(.5,.55,.46),vec3(.15,.22,.18),smoothstep(0.,.4,d.y));
 vec2 cp=d.xz/max(d.y,.04);
 float cl=n3(vec3(cp*.8+vec2(T*.02,0.),T*.05))*.6+n3(vec3(cp*2.1,T*.1))*.4;
 float cd=smoothstep(.48,.72,cl)*smoothstep(0.,.12,d.y);
 c=mix(c,mix(vec3(.2,.25,.2),vec3(.5,.52,.44),cl),cd*.85);
 float wc=clamp((1.-smoothstep(0.,.35,d.y))*smoothstep(-.4,.6,d.z)*(.7+.4*n3(vec3(a*8.+T*.1,d.y*12.,T*.2))),0.,1.);
 c=mix(c,vec3(.09,.12,.1),wc*.9);
 float BA=(h3(vec3(floor(T*3.),1.,2.))-.5)*2.6;
 float bolt=LT*(1.-smoothstep(0.,.02,abs(a-BA)))*step(0.,d.y);
 c+=LT*vec3(.7,.8,.6)*(cd*.6+wc*.8+.15)+vec3(.9,.95,1.)*bolt*2.;
 float sb=pow(.5+.5*sin(a*9.+n3(vec3(a*3.,0.,T*.05))*5.),6.)*smoothstep(0.,.5,d.y)*SU;
 c+=vec3(1.,.92,.65)*(sb*.25+SU*pow(max(dot(d,normalize(vec3(.5,.7,.5))),0.),20.)*.8);
 return c;
}
float ds2(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}
void main(){
 vec2 q=(gl_FragCoord.xy-.5*R)/R.y/Z;
 vec3 ro=C,rd=normalize(M*vec3(q,1.1));
 float t=0.,hit=0.;vec2 h=vec2(0.);
 for(int i=0;i<150;i++){
  h=mpx(ro+rd*t);
  if(h.x<.0004*t+.0005){hit=1.;break;}
  t+=h.x*.9;
  if(t>1500.)break;
  if(MD>2.5&&(ro+rd*t).y>2.5)break;
 }
 vec3 p=ro+rd*t;
 vec4 fa=vec4(0.);
 if(RV>.01){float tr_=min(t,80.);
  for(int i=0;i<16;i++){vec3 sp=ro+rd*(float(i)*tr_/16.);float dn=step(.8,n3(vec3(sp.x*.5+sp.z*.2,sp.y*.06+T*5.,sp.z*.5)))*RV*.05;fa.rgb+=(1.-fa.a)*dn*vec3(.7,.75,.8);fa.a+=(1.-fa.a)*dn;}}
 if(FN>.001&&MD>.5&&MD<2.5){
  float tm=hit>.5?t:700.,dt=tm/44.,j=h3(vec3(gl_FragCoord.xy,T));
  for(int i=0;i<44;i++){
   vec3 sp=ro+rd*((float(i)+j)*dt);
   vec2 v=vol(sp);float dn=v.x*FN,dsh=v.y*FN;
   if(dn+dsh>.01){
    float al=1.-exp(-(dn*.25+dsh*.12)*dt);
    vec3 fc=mix(vec3(.5,.4,.26),vec3(.42,.43,.36),smoothstep(0.,30.,sp.y))*(.7+LT*1.4);
    fc=mix(fc,vec3(.85,.87,.82)*(.6+LT),dsh/(dn+dsh+.001));
    fa.rgb+=(1.-fa.a)*al*fc;fa.a+=(1.-fa.a)*al;
   }
  }
 }
 vec3 col;
 if(hit>.5){
  vec3 n=nrm(p);int m=int(h.y+.5);
  float dif=.45+.55*max(dot(n,normalize(LD)),0.);
  if(MD>2.5)dif=.03+exp(-t*.35)*smoothstep(.8,.98,dot(rd,M[2]))*2.;
  col=AL[m]*dif*(1.+LT*1.5+SU*.4);
  if(MD>1.5&&MD<2.5&&m==1&&abs(p.x)<3.5){col=vec3(.1,.1,.11)*(.8+.4*dif)+vec3(.8)*step(.5,fract(p.z*.12-T*6.))*step(abs(p.x),.12);}
  if(m==1&&WT>.01){col=mix(col,sky(reflect(rd,n))*.5,WT*pow(1.-max(dot(-rd,n),0.),3.)*.8);}
  col+=vec3(1.,.55,.2)*RD*step(7.5,h.y)*step(h.y,8.5)*(.8+.4*sin(T*6.));
  col+=vec3(1.,.25,.55)*step(8.5,h.y)*step(h.y,9.5)*(.8+.4*step(.2,h3(vec3(floor(T*9.),1.,2.))));
  if(NI>.01){
   col*=1.-.75*NI;
   vec3 L1=RP+vec3(-12.,1.5,8.),L2=RP+vec3(10.,1.5,-10.);
   float fl=step(0.,sin(T*7.));
   col+=NI*(vec3(1.,.1,.05)*fl+vec3(.1,.3,1.)*(1.-fl))*(4./(1.+dot(p-L1,p-L1)*.02)+4./(1.+dot(p-L2,p-L2)*.02));
   for(int i=0;i<3;i++){vec3 sa=RP+vec3(cos(T*.07+float(i)*2.1)*9.,1.2,sin(T*.07+float(i)*2.1)*7.);vec3 dl=p-sa;col+=NI*vec3(1.,.75,.4)*2.5/(1.+dot(dl,dl)*.1);}
  }
  col=mix(col,vec3(.42,.46,.4)*(1.-.8*NI)+LT*.3,1.-exp(-t*.0014));
 }else{
  col=sky(rd);
  if(MD<.5)col=mix(vec3(.2,.5,.95),vec3(.6,.8,1.),clamp(rd.y*2.+.4,0.,1.));
  if(NI>.01)col=mix(col,vec3(.02,.03,.06)+LT*vec3(.6,.7,.5)*.5,NI);
 }
 if(MD>1.5&&MD<2.5&&q.y<-.28){
  col=AL[24]*(.6+.4*n3(vec3(q*8.,0.)));
  vec2 dq=q-vec2(.22,-.36);
  if(abs(dq.x)<.09&&abs(dq.y)<.035){col=vec3(1.,.6,.15)*(.5+.5*(1.-smoothstep(0.,.006,abs(dq.x-.07*sin(T*.3)))));}
 }
 if(MD>1.5&&MD<2.5){float pa=sin(T*2.6)*.9;vec2 tip=vec2(-.12,-.22)+.55*vec2(sin(pa),cos(pa));
  if(ds2(q,vec2(-.12,-.22),tip)<.008)col=AL[24]*.4;}
 o=vec4(fa.rgb+(1.-fa.a)*col,1.);
}
