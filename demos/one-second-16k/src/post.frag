#version 300 es
precision highp float;
// Shallow depth of field (depth in alpha, focus = centre pixel), white flash and black cut.
uniform sampler2D S;uniform vec2 uR;uniform float uW,uB;
out vec4 o;
void main(){
 vec2 uv=gl_FragCoord.xy/uR;
 float f0=texture(S,vec2(.5)).a,d=texture(S,uv).a;
 float r=min(abs(d-f0)*300.,10.);
 vec3 c=vec3(0.);
 for(int i=0;i<20;i++){float fi=float(i)+.5,a=fi*2.39996,rr=r*sqrt(fi/20.);c+=texture(S,uv+vec2(cos(a),sin(a))*rr/uR).rgb;}
 c/=20.;
 c=mix(c,vec3(1.),uW);
 c*=1.-uB;
 c*=1.-.35*dot(uv-.5,uv-.5);
 o=vec4(c,1.);
}
