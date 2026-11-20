#version 300 es
precision highp float;
// film/tape pass: gate weave, line wobble, chroma bleed, halation, faded grade, leaks, dust, burn-out, burned-in text, grain
uniform sampler2D A,X;uniform vec2 R;uniform float T,Fd,Lk,Tr,Bn;out vec4 o;
#define ss smoothstep
float h(float n){return fract(sin(n*91.7)*43758.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+1.),f.x),f.y);}
void main(){
 vec2 uv=gl_FragCoord.xy/R;float fr=mod(floor(T*24.),97.);
 vec2 w=uv+(vec2(h(fr),h(fr+.37))-.5)*.0016+vec2(0,sin(T*1.1)*.0008);
 w.x+=sin(uv.y*6.+T*.8)*.0011+sin(uv.y*140.+T*21.)*.00025;
 float tb=Tr*ss(.06,0.,abs(uv.y-fract(T*.17+.3)));
 w.x+=tb*(h2(vec2(fr,floor(uv.y*110.)))-.5)*.035;
 vec3 Y=vec3(.299,.587,.114),c=texture(A,w).rgb,cb=vec3(0);
 for(float i=-3.;i<=3.;i++)cb+=texture(A,w+vec2(i*.002,0)).rgb;cb/=7.;
 c=dot(c,Y)+cb-dot(cb,Y);
 vec3 hl=textureLod(A,w,3.).rgb*.45+textureLod(A,w,5.).rgb*.55;
 c+=max(hl-.5,0.)*vec3(1.,.5,.25)*.9+hl*vec3(.05,.03,.02);
 c+=tb*.2;
 // grade: soft shoulder, faded stock, lifted teal blacks, warm highlights
 c=1.-exp(-c*1.2);
 float y=dot(c,Y);c=mix(vec3(y),c,.8);
 c=c*vec3(1.04,.98,.86)+vec3(-.01,.035,.05)*(1.-y)*(1.-y);
 c=mix(vec3(.055,.06,.06),vec3(.99,.95,.86),c);
 // light leaks
 vec2 lq=uv-vec2(1.05+.1*sin(T*.21),.3+.4*sin(T*.13));
 c+=Lk*ss(.95,0.,length(lq*vec2(.8,1.2)))*(.6+.4*vn(uv*2.+T*.3))*vec3(1.,.38,.12);
 c+=Lk*.35*ss(.5,0.,uv.x)*vec3(.9,.3,.1)*vn(vec2(T*.5,uv.y*3.));
 // vignette, flicker
 c*=(1.-.45*pow(length((uv-.5)*vec2(1.,.8))*1.25,2.4))*(.965+.035*h(fr*1.3));
 // dust
 c*=1.-.6*step(.99985,h2(floor(uv*R/3.)+fr*17.13));
  // burn-out: holes grow, edges glow, then dark
 if(Bn>0.){float b=Bn*1.35-(vn(uv*vec2(5.,3.)+3.)*.7+vn(uv*23.)*.3);
  c=mix(c,vec3(1.,.75,.4)*1.6,ss(-.12,0.,b));c=mix(c,vec3(.035,.025,.02),ss(0.,.12,b));}
 c*=Fd;
 vec4 tx=texture(X,w);c=mix(c,tx.rgb,tx.a);
 c+=(h2(floor(uv*R*.5)*.37+fr*3.1)-.5)*.075*(1.-y*.4);
 o=vec4(c,1);}
