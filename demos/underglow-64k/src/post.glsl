// Final image: depth of field with oval bokeh, a little radial blur with dispersion, an unsharp mask, bloom with a wide blue streak, grade, grain.
uniform sampler2D T0,T1,T2,T3;
uniform vec4 D[2];
out vec4 O;
vec3 tx(vec2 p){vec2 u=vec2(p.x*D[0].y/D[0].x,p.y)*.5+.5;vec4 a=texture(T0,u),b=texture(T1,u);return a.rgb*(1.-b.a)+b.rgb;}
void main(){
 vec2 p=(2.*gl_FragCoord.xy-D[0].xy)/D[0].y,uv=gl_FragCoord.xy/D[0].xy;
 float j=h1(gl_FragCoord.xy+TM);
 vec3 c=vec3(0);
 // circle of confusion from the scene depth: wide open when the subject is close, stopped down for the wide shots
 float dep=texture(T0,uv).a,coc=clamp(abs(1.-FOCUS/dep),0.,1.)*clamp(4./FOCUS,.08,1.)*.013;
 for(float i=0.;i<8.;i++)c+=tx(p*(1.-(FX.x+.008)*(i+j)/8.)+vec2(1.7*cos(i*2.4+j),sin(i*2.4+j))*sqrt(i+.5)*.35*coc)*vec3(7.-i,3.5,i)/28.;
 // the scene is raymarched below screen resolution: an unsharp mask puts some bite back
 vec2 e=1.2/vec2(textureSize(T0,0));
 c=max(c+(texture(T0,uv).rgb*4.-texture(T0,uv+e).rgb-texture(T0,uv-e).rgb-texture(T0,uv+e*vec2(1,-1)).rgb-texture(T0,uv-e*vec2(1,-1)).rgb)*.3*step(FX.x,.05)*step(coc,.002),0.);
 // headlights that look into the lens throw a blue streak across the frame and a ghost through its centre
 cam();
 for(int i=0;i<4;i++){
  vec3 v=CAR(i).xyz+vec3(0,.6,0)-U[1].xyz;
  float z=dot(v,CF),f=U[24][i];
  vec2 q=vec2(dot(v,CR),dot(v,CU))*U[1].w/z;
  if(f>0.&&z>1.&&texture(T0,vec2(q.x*D[0].y/D[0].x,q.y)*.5+.5).a>z-3.)
   c+=vec3(.35,.55,1)*f*(exp(-abs(p.y-q.y)*60.)/(1.+abs(p.x-q.x)*2.5)*.35+smoothstep(.12,0.,length(p+q*.5))*.04);
 }
 // bloom, and the long horizontal streak an anamorphic lens draws through every lamp
 c+=texture(T2,uv).rgb*.45+texture(T3,uv).rgb*vec3(.45,.6,1.)*.4;
 c=c*FX.y*(1.+.05*KICK)*(1.-.24*dot(p,p))+FX.w*vec3(.5,.55,.6);
 c=clamp(c*(2.51*c+.03)/(c*(2.43*c+.59)+.14),0.,1.);
 // night grade: shadows lean to teal, the top end stays warm
 c=pow(c,vec3(.4545));
 c=mix(c*vec3(.9,1.,1.12)+vec3(0,.004,.012),c,smoothstep(0.,.7,dot(c,vec3(.33))));
 O=vec4((c+(j-.5)*.04)*FX.z,1);
}
