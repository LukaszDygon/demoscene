#version 300 es
precision highp float;
uniform sampler2D uA;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uRed;
in vec2 vt;
flat in float vc;
out vec4 o;
void main(){
  if(texture(uA,vt).a<.5)discard;
  o=vec4(vc<.5?uInk:(vc<1.5?uRed:uPaper),1.);
}
