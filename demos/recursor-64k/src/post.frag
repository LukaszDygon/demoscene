#version 300 es
precision highp float;
// F=0: feedback pass (tearing, chroma split, inward zoom trails, datamosh block hold) into a ping-pong target
// F=1: final pass to screen (inversion, scanlines, grain, CRT switch-off)
uniform sampler2D A,B;uniform vec2 R;uniform float T,Mo,Te,Iv,Fb,Sd,F,Cr,Ps;uniform vec2 Dq;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+Sd*.37)*43758.5453);}
void main(){vec2 uv=gl_FragCoord.xy/R;
 if(F>.5){vec2 sq=vec2(Cr>.5?max(2.-Cr*2.,.004):1.,max(1.-Cr*2.,.004)),v=.5+(uv-.5)/sq;
  vec3 c=texture(A,v).rgb*step(abs(v.x-.5),.5)*step(abs(v.y-.5),.5)*min(1./sq.y,3.);c=mix(c,1.-c,Iv);
  c*=.84+.16*step(.5,fract(gl_FragCoord.y*.5));c+=(h(uv*R+fract(T)*97.)-.5)*.06;o=vec4(c,1);return;}
 float row=floor(uv.y*42.),tr=h(vec2(row,floor(T*24.))),off=step(1.-Te*.45,tr)*(h(vec2(row,7.))-.5)*Te*.25;
 vec2 su=uv+vec2(off,0);float ca=Te*.005+abs(off)*.06;
 vec3 c=vec3(texture(A,su+vec2(ca,0)).r,texture(A,su).g,texture(A,su-vec2(ca,0)).b);
 c=max(c,texture(B,(uv-.5)*.97+.5).rgb*.93*Fb);
 // pixel-sort drips: bright pixels smear downward in sorted-looking columns
 if(Ps>0.){float cs=h(vec2(floor(uv.x*90.),9.));if(cs<Ps)for(int i=1;i<9;i++){vec3 s=texture(A,su+vec2(0,float(i)*.018*cs)).rgb;if(dot(s,vec3(.33))>.6)c=max(c,s*(1.-float(i)/10.));}}
 vec2 bl=floor(uv*vec2(20.,12.));float m=step(h(bl+floor(T*6.)),Mo);
 c=mix(c,texture(B,uv+(vec2(h(bl+1.3),h(bl+2.7))-.5)*.012).rgb,m);
 // Droste: the previous frame nested inside itself, rotated: the picture falls into the picture
 if(Dq.x>0.){vec2 a=vec2(R.x/R.y,1.),q=mat2(cos(Dq.y),sin(Dq.y),-sin(Dq.y),cos(Dq.y))*((uv-.5)*a)/Dq.x;
  if(abs(q.x)<a.x*.5&&abs(q.y)<.5){c=texture(B,q/a+.5).rgb;if(max(abs(q.x)-a.x*.5,abs(q.y)-.5)>-.012/Dq.x)c=vec3(.8,1.,.05);}}
 o=vec4(c,1);}
