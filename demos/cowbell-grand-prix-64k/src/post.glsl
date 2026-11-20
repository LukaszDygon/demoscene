// Final image: black-hole lensing, shock rings, radial speed blur with dispersion, bloom, rain, grade.
uniform sampler2D T0,T1,T2,T3;
uniform vec4 D[2];
out vec4 O;
vec3 prj(vec3 w){vec3 v=w-U[1].xyz;float z=dot(v,CF);return vec3(vec2(dot(v,CR),dot(v,CU))*U[1].w/z,z);}
vec3 tx(vec2 p){vec2 u=vec2(p.x*D[0].y/D[0].x,p.y)*.5+.5;vec4 a=texture(T0,u),b=texture(T1,u);return a.rgb*(1.-b.a)+b.rgb;}
void main(){
 cam();
 vec2 p=(2.*gl_FragCoord.xy-D[0].xy)/D[0].y,uv=gl_FragCoord.xy/D[0].xy;
 float dep=texture(T0,uv).a,hg=0.,j=h1(gl_FragCoord.xy+TM);
 vec3 h=prj(HOLE.xyz),ring=vec3(0),c=vec3(0),s=prj(SHK.xyz);
 if(HOLE.w>0.&&h.z>0.&&dep>h.z-HOLE.w){
  // light bends round the hole: an Einstein ring, a black disc, a hot accretion glow
  float hr=HOLE.w*U[1].w/h.z;
  vec2 d=p-h.xy;
  float l=length(d)+1e-4,a=atan(d.y,d.x)+TM*2.+hr/l*4.,k=l-hr,w=1.5*hr/l;
  // space swirls as well as bends on the way in
  p=h.xy+vec2(d.x*cos(w)-d.y*sin(w),d.x*sin(w)+d.y*cos(w))*(1.-3.*hr*hr/(l*l));
  hg=smoothstep(hr*1.06,hr*.96,l);
  ring=vec3(1.7,.7,.3)*(.5+fbm(vec2(cos(a),sin(a))*2.+l/hr))*hr*hr/(k*k+hr*hr*.03)*.1*(1.-hg)+vec3(.6,.3,1.)*hr/(abs(k)*40.+hr*.3)*.3;
 }
 if(SHK.w>0.&&s.z>0.){
  vec2 d=p-s.xy;
  float l=length(d)+1e-4;
  p+=d/l*.07*smoothstep(.15,0.,abs(l-SHK.w*U[1].w/s.z))*max(1.-SHK.w/50.,0.);
 }
 if(ZONE>1.5&&ZONE<2.5)p.x+=(h1(vec2(floor(p.y*40.),floor(TM*12.)))-.5)*.06*step(.9,h1(vec2(floor(p.y*7.),floor(TM*6.))));
 if(RAIN>0.){
  // raindrops on the lens
  vec2 g=p*5.+vec2(0,TM*.12),k=floor(g),o=fract(g)-.5-(vec2(h1(k+3.),h1(k+7.))-.5)*.6;
  if(h1(k)>.55&&length(o)<.06+.12*h1(k+1.))p+=o*.3*RAIN;
 }
 for(float i=0.;i<7.;i++)c+=tx(p*(1.-(FX.x+.012)*(i+j)/7.))*vec3(6.-i,3.,i)/21.;
 // the scene is raymarched below screen resolution: an unsharp mask puts some bite back
 vec2 e=1.2/vec2(textureSize(T0,0));
 c=max(c+(texture(T0,uv).rgb*4.-texture(T0,uv+e).rgb-texture(T0,uv-e).rgb-texture(T0,uv+e*vec2(1,-1)).rgb-texture(T0,uv-e*vec2(1,-1)).rgb)*.35*step(FX.x,.1),0.);
 c+=texture(T2,uv).rgb*.4+texture(T3,uv).rgb*vec3(.4,.55,1.)*.3;
 // shafts of light streaming from the dawn sun
 if(SUNC.x>2.){vec3 sp=prj(U[1].xyz+SUN*1e3);if(sp.z>0.)for(float i=1.;i<9.;i++)c+=texture(T2,mix(uv,vec2(sp.x*D[0].y/D[0].x,sp.y)*.5+.5,i/9.)).rgb*.05*(1.-i/9.);}
 if(FX.x>.1)c+=(FX.x-.1)*2.5*step(.8,h1(vec2(floor(atan(p.y,p.x)*40.),floor(TM*20.))))*smoothstep(.4,1.6,length(p))*vec3(.8,.9,1.);
 if(SUNC.x>2.){
  vec3 sp=prj(U[1].xyz+SUN*1e3);
  vec2 su=vec2(sp.x*D[0].y/D[0].x,sp.y)*.5+.5;
  if(sp.z>0.&&abs(sp.x)<2.2&&abs(sp.y)<1.&&texture(T0,su).a>5e3)
   for(float i=1.;i<4.;i++){float r=length(p+sp.xy*(i*.55-.3));c+=hue(i*.3)*smoothstep(.03,0.,abs(r-.1*i))*.04+vec3(1.,.7,.4)*smoothstep(.06*i,0.,r)*.05;}
 }
 c=c*(1.-hg)+ring;
 if(RAIN>0.){vec2 g=vec2(p.x*45.+p.y*7.,p.y*2.5+TM*8.+h1(vec2(floor(p.x*45.+p.y*7.),1.))*9.);c+=RAIN*.12*step(.8,h1(floor(g)))*smoothstep(.5,.1,abs(fract(g.x)-.5))*fract(g.y)*fract(g.y);}
 // frost creeps in from the corners while the hero is frozen
 if(U[15].x>0.)c+=vec3(.5,.75,1.)*U[15].x*smoothstep(1.,1.6,length(p*vec2(.45,1.))+fbm(p*5.)*.6)*.5;
 c=c*FX.y*(1.+.07*KICK)*(1.-.22*dot(p,p))+FX.w;
 c=clamp(c*(2.51*c+.03)/(c*(2.43*c+.59)+.14),0.,1.);
 O=vec4((pow(c,vec3(.4545))+(j-.5)*.035)*FX.z,1);
}
