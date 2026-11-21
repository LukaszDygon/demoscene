#version 300 es
precision highp float;
// 9-tap gaussian along D[0].xy; with D[1].x > 0 it is also the bloom bright pass over scene + particles
uniform sampler2D T0,T1;
uniform vec4 D[2];
out vec4 O;
void main(){
 vec2 u=gl_FragCoord.xy*D[0].zw;
 vec3 c=vec3(0);
 for(float i=-4.;i<5.;i++){
  vec2 v=u+D[0].xy*i;
  vec3 s=texture(T0,v).rgb;
  if(D[1].x>0.){vec4 b=texture(T1,v);s=min(max(s*(1.-b.a)+b.rgb-D[1].x,0.),12.);}
  c+=s*exp(-i*i*.18);
 }
 O=vec4(c/4.15,1);
}
