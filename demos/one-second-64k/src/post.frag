#version 300 es
precision highp float;
uniform sampler2D uT;uniform vec2 uRes;uniform float uFN,uWhite,uOn;
out vec4 oc;
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes,px=1./uRes;
 vec4 c=texture(uT,uv);
 float R=clamp(abs(c.a-uFN)*14.,0.,1.)*uRes.y*.011;
 vec3 acc=c.rgb,bl=vec3(0.);float ws=1.;
 for(int i=0;i<24;i++){float fi=float(i),a=fi*2.39996,r=sqrt((fi+.5)/24.)*R;
  acc+=texture(uT,uv+vec2(cos(a),sin(a))*r*px).rgb;ws+=1.;}
 for(int i=0;i<16;i++){float fi=float(i),a=fi*2.39996+.7,r=sqrt((fi+.5)/16.)*uRes.y*.05;
  bl+=max(texture(uT,uv+vec2(cos(a),sin(a))*r*px).rgb-.9,0.);}
 vec3 col=acc/ws+bl*.012+vec3(uWhite);
 col*=.8;
 col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
 col=pow(col,vec3(1./2.2));
 vec2 q=uv-.5;col*=1.-.55*dot(q,q);
 col+=(hs(gl_FragCoord.xy)-.5)*.035;
 oc=vec4(clamp(col,0.,1.)*uOn,1.);
}
