#version 300 es
precision highp float;
uniform sampler2D uS;
uniform sampler2D uP;
uniform vec2 uRes;
uniform float uPer;
uniform float uT;
uniform float uFl;
out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec3 c=mix(texture(uS,uv).rgb,texture(uP,uv).rgb,uPer);
  c=abs(c-uFl)+(hs(gl_FragCoord.xy)-.5)*.05;
  o=vec4(c,1.);
}
