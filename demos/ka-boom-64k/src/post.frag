#version 300 es
precision highp float;
uniform sampler2D uS,uP;
uniform vec2 uRes;
uniform float uPer,uT,uFl,uMis,uHT;
out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453);}
void main(){
vec2 uv=gl_FragCoord.xy/uRes;
vec3 s=texture(uS,uv).rgb;
s.r=texture(uS,uv+vec2(uMis,0.)).r;
vec3 c=mix(s,texture(uP,uv).rgb,uPer);
float l=dot(c,vec3(.3,.59,.11));
vec2 g=fract(gl_FragCoord.xy/6.)-.5;
c=mix(c,vec3(step(1.-l,length(g)*1.414)),uHT);
c=abs(c-uFl)+(hs(gl_FragCoord.xy)-.5)*.05;
o=vec4(c,1.);
}
