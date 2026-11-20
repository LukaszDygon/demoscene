#version 300 es
precision highp float;
uniform sampler2D S;uniform vec2 R;uniform float DR;
out vec4 O;
void main(){
 vec2 uv=gl_FragCoord.xy/R;
 float b=.0015+.02*pow(abs(uv.y-.5)*2.,2.);
 vec3 c=vec3(0);
 for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++)c+=texture(S,uv+vec2(float(i),float(j))*b*.5).rgb;
 c/=25.;
 c=mix(vec3(dot(c,vec3(.3,.59,.11))),c,1.3);
 c*=vec3(1.04,1.,.9);
 c=c*(1.+.9*DR*(.35+.65*smoothstep(.1,1.,uv.x)))+vec3(.35,.28,.16)*DR*smoothstep(.25,1.,uv.x);
 c*=.45+.55*pow(16.*uv.x*(1.-uv.x)*uv.y*(1.-uv.y),.25);
 O=vec4(c,1.);
}
