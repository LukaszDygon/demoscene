#version 300 es
precision highp float;
// CRT post pass: the 320x180 game canvas is the texture; curvature, nearest-neighbour pixels, bloom, scanlines, shadow mask, vignette
uniform sampler2D T;
uniform vec2 R;
uniform float TM;
out vec4 o;
void main(){
vec2 p=gl_FragCoord.xy/R*2.-1.;
p*=1.+dot(p,p)*.08;
if(abs(p.x)>1.||abs(p.y)>1.){o=vec4(0.,0.,0.,1.);return;}
vec2 uv=p*.5+.5;
vec2 S=vec2(320.,180.);
ivec2 ip=ivec2(floor(vec2(uv.x,1.-uv.y)*S));
vec3 c=texelFetch(T,ip,0).rgb,b=vec3(0.);
for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){b+=max(texelFetch(T,clamp(ip+ivec2(i,j),ivec2(0),ivec2(319,179)),0).rgb-.5,0.);}
c+=b*.04;
float row=fract((1.-uv.y)*S.y);
c*=.72+.28*sin(row*3.14159);
c*=.92+.08*vec3(sin(gl_FragCoord.x*2.1),sin(gl_FragCoord.x*2.1+2.1),sin(gl_FragCoord.x*2.1+4.2));
c*=1.-.15*dot(p,p);
c*=1.+.02*sin(TM*45.);
float e=max(abs(p.x),abs(p.y));c*=1.-.55*smoothstep(.9,1.,e);o=vec4(pow(c,vec3(.92)),1.);
}
