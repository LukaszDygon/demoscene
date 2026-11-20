#version 300 es
precision highp float;
uniform vec2 uRes,uHalf,uCam;
uniform float uT,uGrid,uTear,uBend,uRule,uDots,uDotX,uWipe,uG2;
uniform vec3 uInk,uPaper,uRed;
out vec4 o;
void main(){
float C=1.25;
vec2 p=(gl_FragCoord.xy/uRes*2.-1.)*uHalf+uCam;
float rw=floor(p.y/C);
float h=fract(sin(rw*12.9898+floor(uT*3.))*43758.5453);
p.x+=uBend*sin(p.y*.7+uT*1.7)*.4*(1.+h)+step(1.-uTear*.5,h)*(h-.5)*uTear*3.;
vec2 g=abs(fract(p/C+.5)-.5)*C;
float l=max(step(g.x,.018),step(g.y,.018))*uGrid;
vec3 c=mix(uPaper,uInk,l);
if(abs(p.y-uRule)<.04)c=uRed;
float r=uDots*.45*clamp((uDotX+4.-p.x)/4.,0.,1.)*step(uDotX,p.x);
if(r>0.&&length(fract(p*3.)-.5)<r)c=uRed;
vec2 g2=abs(fract(p/5.+.5)-.5)*5.;c=mix(c,uRed,max(step(g2.x,.02),step(g2.y,.02))*uG2);
if(p.y<uWipe)c=uRed;
o=vec4(c,1.);
}
