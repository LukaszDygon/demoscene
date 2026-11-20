#version 300 es
precision highp float;
uniform sampler2D S;uniform vec2 R;uniform float T,E,AF,GL,RN,MU,HS,BLU,HL,SA;
out vec4 o;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+1.),f.x),f.y);}
void main(){
 vec2 uv=gl_FragCoord.xy/R,ar=vec2(R.x/R.y,1.),g=uv*ar*vec2(7.,4.5),id=floor(g),f=fract(g)-.5;
 float hh=h2(id),ts=floor(T*24.);
 vec2 off=(vec2(h2(id+3.1),h2(id+7.7))-.5)*.4;
 float dr=RN*step(.6,hh)*(1.-smoothstep(.17,.22,length(f-off)));
 float sx=floor(uv.x*ar.x*22.),sf=fract(uv.x*ar.x*22.)-.5;
 float yq=fract(h2(vec2(sx,9.))-T*(.3+.5*h2(vec2(sx,10.))));
 float rs=RN*step(.6,h2(vec2(sx,8.)))*(1.-smoothstep(0.,.1,abs(uv.y-yq)))*(1.-smoothstep(0.,.1,abs(sf)));
 float band=h2(vec2(floor(uv.y*60.),ts));
 float jit=(band>.94-.06*GL?band-.5:0.)*(.05+.12*GL)+sin(uv.y*240.+T*31.)*.0015*(.3+GL);
 float hsw=step(uv.y,.05*HS)*((h2(vec2(floor(uv.y*R.y*.5),ts))-.5)*.15+.02*sin(T*90.));
  float rl=.02*step(.995,h2(vec2(ts,7.)))*sin(T*3.),cr=step(abs(uv.y-(.3+.1*sin(T*.2))),.002)*.04*GL+step(abs(uv.y-.62),.0015)*.02*RN;
 vec2 s=uv+vec2(jit+hsw+cr,rl)-(f-off)*dr*.05+vec2(sf*rs*.02,0.);
 float ch=.002+.006*GL;
 vec3 c=vec3(texture(S,s+vec2(ch,0.)).r,texture(S,s).g,texture(S,s-vec2(ch,0.)).b);
 vec3 cb=(texture(S,s+vec2(.01,0.)).rgb+texture(S,s-vec2(.01,0.)).rgb)*.5;
 float Y=dot(c,vec3(.3,.59,.11));
 c=vec3(Y)+(cb-dot(cb,vec3(.3,.59,.11)))*1.8;
 c=mix(c,texture(S,s+vec2(.008+.004*GL,0.)).rgb,.12+.1*GL);
 vec3 bl=(texture(S,s+vec2(.003,0.)).rgb+texture(S,s-vec2(.003,0.)).rgb+texture(S,s+vec2(0.,.005)).rgb+texture(S,s-vec2(0.,.005)).rgb)*.25;
 c=mix(c,bl,AF)*E;
 c=mix(vec3(dot(c,vec3(.3,.59,.11))),c,SA)*.9+.05;
 float mud=MU*smoothstep(.45,.95,length(uv-.5)*1.1+.5*n2(uv*vec2(5.,3.)));
 c=mix(c,vec3(.2,.16,.1)*(.3+Y),mud*.6);
 float hc=floor(uv.x*ar.x*16.),hf=fract(uv.x*ar.x*16.)-.5;
 float hy=fract(h2(vec2(hc,4.))-T*(.6+.7*h2(vec2(hc,5.))));
 float hail=HL*step(.7,h2(vec2(hc,6.)))*(1.-smoothstep(.006,.011,length(vec2(hf/(16.*ar.x),uv.y-hy))));
 c+=hail*vec3(.9,.92,.95)+dr*.1+rs*.15;
 float dro=step(.997,h2(vec2(floor(uv.y*R.y*.25),ts*1.7)))*step(.5,h2(vec2(ts,2.)));
 c+=dro*.5;
 c*=.94+.06*sin(gl_FragCoord.y*2.094);
 float hm=step(uv.y,.05*HS);
 c=mix(c,vec3(h2(vec2(floor(gl_FragCoord.x*.4),ts))),hm*.75);
 c+=(h2(gl_FragCoord.xy+T*61.)-.5)*.1;
 c*=1.-.5*dot(uv-.5,uv-.5);
 c=mix(c,vec3(.13,.22,.62)*(1.-.2*length(uv-.5)),BLU);
 o=vec4(clamp(c,0.,1.),1.);
}
