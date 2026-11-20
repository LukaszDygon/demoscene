#version 300 es
precision highp float;
uniform sampler2D uA;
uniform vec3 uInk,uPaper,uRed;
in vec2 vt;
in float vc,vs;
out vec4 o;
void main(){
if(texture(uA,vt).a<.5)discard;
o=vec4(vc<.5?uInk:vc<1.5?uRed:vc<2.5?uPaper:mix(uInk,uPaper,.2+.6*vs),1.);
}
