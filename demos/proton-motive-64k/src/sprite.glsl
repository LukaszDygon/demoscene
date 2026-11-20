// Particles as point sprites: protons, ATP glints, motes, sparks. Positions are pure functions of the particle index
// and the song clock, per scene. Each sprite grows with its circle of confusion (bokeh) at constant energy and is
// occluded against the raymarched hit distance stored in the scene buffer's alpha.
//VERT
precision highp float;
uniform vec3 uR,uC,uD;uniform vec4 uF,uE,uX,uY;uniform float uT,uB,uA;uniform int uS;
out vec3 vc;out float vz;
float h1(float n){return fract(sin(n*12.9898+4.1)*43758.5453);}
float sat(float x){return clamp(x,0.,1.);}
float cx(float z){return 3.*sin(z*.07)+1.5*sin(z*.023+1.);}
vec3 AMB=vec3(1.,.48,.14),SPK=vec3(.55,.75,1.3);
void main(){float i=float(gl_VertexID);vec3 h=vec3(h1(i),h1(i+.31),h1(i+.73)),h2=vec3(h1(i+.17),h1(i+.53),h1(i+.91)),p=vec3(0),c=vec3(0);float s=.03;
 // drifting motes around the camera (wrapped in a box that travels with it)
 vec3 mo=uC+mod(h*vec3(36,22,36)+vec3(.3,.1,-.2)*uT-uC+vec3(18,11,18),vec3(36,22,36))-vec3(18,11,18);
 if(uS==0){p=mo;c=mix(AMB,vec3(.4,.6,1),h2.x)*.05*h2.y;s=.02+.03*h2.z;
  // spark burst where the ring splits
  if(i<400.&&uX.w>0.){float a=uX.w;vec3 d=normalize(h-.5);p=uY.xyz+d*(1.-exp(-a*(2.+3.*h2.x)))*(1.5+3.*h2.y)+vec3(0,-.2,0)*a*a;c=SPK*2.5*exp(-a*(1.2+h2.z*2.))*(.3+h2.x);s=.012;}}
 else if(uS==1){p=uC+(mo-uC)*3.;c=mix(AMB,vec3(.5,.6,1),h2.x)*.06*h2.y*(1.+uX.x*3.);s=.06+.1*h2.z;}
 else if(uS==2){if(i<1500.){p=vec3((h.x-.5)*18.,-1.25-h.y*2.05,(h.z-.5)*18.);p+=sin(uT*vec3(1.1,.7,.9)+h2*6.)*.12;c=AMB*.9*h2.x*uX.y;s=.035;}else{p=mo;c=vec3(.4,.6,1)*.04*h2.y;s=.02;}}
 else if(uS==3){
  if(i<2500.&&uX.x>0.){// ATP leaving the rims of the plates into the matrix
   float k=floor(uC.z/4.+.5)+floor(h.x*9.)-6.,sg=mod(k,2.)*2.-1.,ph=fract(h.z+uT*(.25+.2*h2.x));
   vec3 b=vec3(sg*.9,(h.y-.5)*9.,k*4.);p=b+normalize(h2-.5+vec3(sg*.9,0,0))*ph*3.5;c=mix(AMB,vec3(1,.9,.7),h2.y)*1.8*sin(ph*3.1416)*uX.x*(1.+uE.z);s=.025;}
  else{p=mo;c=AMB*.12*h2.y*(.5+uX.y);s=.02+.02*h2.z;}}
 else if(uS==4){// protons pumped into the lumen; how many show is the gradient
  p=vec3(-8.+h.x*24.,.85+h.y*h.y*4.5,(h.z-.5)*9.)+sin(uT*vec3(.9,1.3,.7)+h2*6.28)*.25;c=AMB*1.4*step(h2.x,.1+uX.x*1.2)*(.5+.5*h2.y);s=.03;
  // the protons this electron pumps: 4 through complex I, 4 through III, 2 through IV, launched as it passes
  if(i<30.){float k=mod(i,10.),a=fract(uB)*16.-(k<4.?6.5:k<8.?10.:15.);a+=a<0.?16.:0.;
   p=vec3(k<4.?-4.8+k*1.1:k<8.?5.8+(k-4.)*.45:11.6+(k-8.)*.7,mix(-.4,1.7,sat(a/2.5))+a*.05,(floor(i/10.)-1.)*.45+(h.z-.5)*.3);c=AMB*3.*sat(1.-a/9.)*sat(a*4.);s=.04;}
  if(i>3000.){p=mo;c=vec3(.4,.6,1.)*.04*h2.y;s=.02;}}
 else if(uS==5){float z=uC.z-mod(h.z*70.-uT*(.5+uX.x)+uC.z,70.)+8.;p=vec3(cx(z)+(h.x-.5)*7.,(h.y-.5)*3.2,z);
  p+=sin(uT*(3.+uX.x*14.)*vec3(1,1.3,.8)+h2*6.28)*(.04+.12*uX.x);
  // the vortex over the c-ring
  vec3 ce=vec3(cx(-56.),-1.2,-56.);if(i<1500.&&uX.z>0.){float an=h.x*6.28+uT*(1.+2.*h2.x),r=.6+h.y*3.;p=mix(p,ce+vec3(cos(an)*r,h2.z*1.5,sin(an)*r),uX.z);}
  c=AMB*1.3*step(h2.x,.08+uX.x*.9)*(.4+.6*h2.y);s=.028;}
 else{// synthase: the proton sea under the membrane, the stream riding the c-ring, ATP glints in the matrix
  if(i<2000.){p=vec3((h.x-.5)*16.,-.6-h.y*3.,(h.z-.5)*16.)+sin(uT*vec3(1.2,.9,1.1)+h2*6.28)*.2;c=AMB*1.2*(.3+.7*h2.y)*uX.y;s=.03;}
  else if(i<2240.){// protons funnelled up the a-subunit half channel, and (once turning) out into the matrix
   float k=i-2000.,ph=fract(h.x+uT*(uB>80.?.45:.06));
   if(k<120.){p=mix(vec3(1.7+.9*(h.y-.5),-3.2,.9*(h.z-.5)),vec3(1.3,-.1,0),ph*ph);c=AMB*2.*sin(ph*3.14)*(.4+uX.y);}
   else{p=vec3(1.15+.5*(h.y-.5),.5+ph*3.,-.3+.5*(h.z-.5)+ph*(h2.x-.5)*2.);c=AMB*1.6*sin(ph*3.14)*step(80.,uB);}s=.035;}
  else{p=(h-.5)*vec3(18,7,18)+vec3(0,4.6,0)+sin(uT*.3+h2*6.)*.4;c=mix(AMB,vec3(1,.85,.6),h2.x)*.25*h2.y*(.2+uE.z*2.)*step(80.,uB);s=.02+.02*h2.z;}}
 vec3 f=normalize(uD-uC),r=normalize(cross(f,vec3(0,1,0))),u=cross(r,f),r2=r*cos(uF.x)+u*sin(uF.x);u=cross(r2,f);
 vec3 d=p-uC;float z=dot(d,f);vz=length(d);
 gl_Position=z>.08?vec4(dot(d,r2)/(z*uF.y)*uR.y/uR.x,dot(d,u)/(z*uF.y),0,1):vec4(9,9,9,1);
 float px=s/(z*uF.y)*uR.y*.5,cc=min(uF.w*abs(vz-uF.z)/max(vz,.01)*uR.x/1280.,24.),rr=max(px+cc,.7);
 gl_PointSize=rr*2.+2.;vc=c*px*px/(rr*rr)*2.*smoothstep(.08,.5,z);}
//FRAG
precision highp float;
uniform sampler2D uS0;in vec3 vc;in float vz;out vec4 o;
void main(){vec2 q=gl_PointCoord*2.-1.;float r=dot(q,q);if(r>1.)discard;float d=texelFetch(uS0,ivec2(gl_FragCoord.xy),0).a;
 o=vec4(vc*(1.-r)*(1.-r)*smoothstep(-.2,.15,d-vz),0);}
