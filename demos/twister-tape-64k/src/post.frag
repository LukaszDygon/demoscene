#version 300 es
precision highp float;
uniform sampler2D S;uniform vec2 R;uniform float T,E,AF,GL,RN,MU,HS,BLU;
out vec4 o;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+1.),f.x),f.y);}
void main(){
 vec2 uv=gl_FragCoord.xy/R,g=vec2(uv.x*R.x/R.y,uv.y)*vec2(7.,4.5),id=floor(g),f=fract(g)-.5;
 float hh=h2(id),ts=floor(T*24.);
 // lens droplets: a grid of cells, some holding a drop that refracts what is behind it
 vec2 off=(vec2(h2(id+3.1),h2(id+7.7))-.5)*.4;
 float dr=RN*step(.6,hh)*(1.-smoothstep(.17,.22,length(f-off)));
 // tape: tracking-error bands, a wobble, and head-switching noise in the bottom bar
 float band=h2(vec2(floor(uv.y*60.),ts));
 float jit=(band>.94-.06*GL?band-.5:0.)*(.05+.12*GL)+sin(uv.y*240.+T*31.)*.0015*(.3+GL);
 float hsw=step(uv.y,.05*HS)*((h2(vec2(floor(uv.y*R.y*.5),ts))-.5)*.15+.02*sin(T*90.));
 vec2 s=uv+vec2(jit+hsw,0.)-dr*(f-off)*.05;
 // chroma bleed: luma stays sharp, colour is smeared sideways; RGB misregistration
 float ch=.002+.006*GL;
 vec3 c=vec3(texture(S,s+vec2(ch,0.)).r,texture(S,s).g,texture(S,s-vec2(ch,0.)).b);
 vec3 cb=(texture(S,s+vec2(.01,0.)).rgb+texture(S,s-vec2(.01,0.)).rgb)*.5;
 float Y=dot(c,vec3(.3,.59,.11));
 c=vec3(Y)+(cb-dot(cb,vec3(.3,.59,.11)))*1.8;
 // autofocus hunting, auto-exposure hunting
 vec3 bl=(texture(S,s+vec2(.003,0.)).rgb+texture(S,s-vec2(.003,0.)).rgb+texture(S,s+vec2(0.,.005)).rgb+texture(S,s-vec2(0.,.005)).rgb)*.25;
 c=mix(c,bl,AF)*E;
 // cheap tape colour: desaturated, lifted blacks, dim mud on the lens, scanlines, grain
 c=mix(vec3(dot(c,vec3(.3,.59,.11))),c,.75)*.9+.05;
 float mud=MU*smoothstep(.45,.95,length(uv-.5)*1.1+.5*n2(uv*vec2(5.,3.)));
 c=mix(c,vec3(.2,.16,.1)*(.3+Y),mud*.6);
 c+=dr*.1;
 c*=.94+.06*sin(gl_FragCoord.y*2.094);
 float hm=step(uv.y,.05*HS);
 c=mix(c,vec3(h2(vec2(floor(gl_FragCoord.x*.4),ts))),hm*.75);
 c+=(h2(gl_FragCoord.xy+T*61.)-.5)*.1;
 c*=1.-.5*dot(uv-.5,uv-.5);
 // blue screen between tapes: start screen and end card
 c=mix(c,vec3(.13,.22,.62)*(1.-.2*length(uv-.5)),BLU);
 o=vec4(clamp(c,0.,1.),1.);
}
