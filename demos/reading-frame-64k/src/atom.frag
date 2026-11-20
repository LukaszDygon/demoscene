// Ray-cast sphere with exact depth. Fluorescent shading: lambert core + strong fresnel rim + emissive.
// Alpha carries log2(view depth) for the AO and depth-of-field passes.
uniform mat4 P;
uniform float MD,FZ,SEC,DC;
in vec3 vp,vc;
in vec4 col;
in float vr,vi;
in vec2 vq;
out vec4 o;
void main(){
 if(MD>.5){
  // point-spread function: gaussian core and a faint first airy ring
  float p=length(vq);
  if(p>1.)discard;
  float I=(exp(-p*p*9.)+.05*exp(-pow((p-.62)*9.,2.)))*vi;
  o=vec4(col.rgb*col.a*I,0);
  return;
 }
 vec3 rd=normalize(vp);
 float b=dot(rd,vc),h=b*b-dot(vc,vc)+vr*vr;
 if(h<0.)discard;
 vec3 p=rd*(b-sqrt(h)),n=(p-vc)/vr;
 vec4 cp=P*vec4(p,1);
 gl_FragDepth=cp.z/cp.w*.5+.5;
 vec3 L=normalize(vec3(-.5,.75,.55));
 float z=-p.z,df=max(dot(n,L),0.),fr=1.-max(-dot(n,rd),0.),sp=pow(max(dot(reflect(rd,n),L),0.),30.);
 vec3 k=col.rgb;
 // confocal depth colour-coding (hue by depth around the focal plane)
 if(DC>0.)k=mix(k,(.5+.5*cos(6.283*(clamp((z-FZ)/FZ*.6+.5,0.,1.)*.72+vec3(.55,.75,.95))))*(.35+.75*max(k.r,max(k.g,k.b))),DC);
 vec3 c=k*(.08+.6*df+.95*fr*fr)+sp*(.25+.3*k)+k*col.a*2.2;
 // optical sectioning: light from outside the focal plane is rejected by the pinhole
 if(SEC>0.)c*=mix(1.,exp(-pow((z-FZ)/(FZ*SEC),2.)),.85);
 o=vec4(c,log2(z));
}
