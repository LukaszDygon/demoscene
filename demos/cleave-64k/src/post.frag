#version 300 es
// CLEAVE post: mip-based depth of field, bloom, chromatic fringe, SEM scan noise and scan-reveal,
// eyepiece field stop, vignette, flash, fade and dither
precision highp float;
uniform sampler2D A,H;
uniform vec2 R;
uniform float T;
uniform vec4 P0;  // eyepiece radius, fade, flash, scan reveal position (<0 off)
uniform vec4 P1;  // SEM noise, chromatic fringe, bloom, warmth
uniform float P2; // objective change: radial zoom blur
uniform sampler2D D; // the raw reaction-diffusion field
uniform float P3;    // inset visibility
uniform vec3 P4;     // tile split: columns, rows, amount
out vec4 o;
#define SAT(x) clamp(x,0.,1.)
float hs2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 tap(vec2 uv,float cc){
 float l=cc*5.;vec3 s=textureLod(A,uv,0.).rgb;
 if(l>.25){vec2 px=exp2(l)/R*.6;s=mix(s,(textureLod(A,uv+vec2(px.x,px.y*.5),l).rgb+textureLod(A,uv-vec2(px.x,px.y*.5),l).rgb+textureLod(A,uv+vec2(-px.x*.5,px.y),l).rgb+textureLod(A,uv-vec2(-px.x*.5,px.y),l).rgb)*.25,smoothstep(.25,1.,l));}
 return s;
}
void main(){
 vec2 uv=gl_FragCoord.xy/R,c=(gl_FragCoord.xy-.5*R)/R.y;
 float gut=1.;if(P4.z>0.){vec2 tu=uv*P4.xy;uv=mix(uv,fract(tu)*.9+.05,P4.z);vec2 tf=abs(fract(tu)-.5);gut=1.-P4.z*step(.48,max(tf.x,tf.y));}
 // SEM: occasional scan lines land a little off (beam jitter)
 float jl=hs2(vec2(floor(gl_FragCoord.y*.25),floor(T*12.)));uv.x+=P1.x*step(.985,jl)*(jl-.99)*.4;
 float cc=textureLod(A,uv,1.).a;
 vec2 dv=c*P1.y*.004*(1.+dot(c,c));
 vec3 col=vec3(tap(uv+dv,cc).r,tap(uv,cc).g,tap(uv-dv,cc).b);
 // changing objectives: a radial zoom smear through the old and new image
 if(P2>0.){vec3 z=vec3(0);for(int i=0;i<8;i++)z+=textureLod(A,.5+(uv-.5)*(1.-P2*.06*float(i)),1.5).rgb;col=mix(col,z/8.,SAT(P2*3.));}
 vec3 bl=textureLod(A,uv,3.).rgb*.25+textureLod(A,uv,4.5).rgb*.35+textureLod(A,uv,6.).rgb*.4;
 col+=max(bl-.55,0.)*P1.z;
 // star flare from the brightest highlights (the wet cornea): four streaks
 if(P1.z>.8){vec3 fs=vec3(0);for(int i=1;i<7;i++){float k=float(i)*.012;fs+=max(textureLod(A,uv+vec2(k,0),2.).rgb+textureLod(A,uv-vec2(k,0),2.).rgb+textureLod(A,uv+vec2(0,k*R.x/R.y),2.).rgb+textureLod(A,uv-vec2(0,k*R.x/R.y),2.).rgb-3.2,0.)/float(i);}col+=fs*.12;}
 // SEM: line-correlated scan noise + shot grain
 float ln=hs2(vec2(floor(gl_FragCoord.y*.5),floor(T*24.)));
 col+=((ln-.5)*.05+(hs2(gl_FragCoord.xy+fract(T*7.)*91.)-.5)*.09)*P1.x;
 // SEM charging: bright edges smear along the scan direction
 col+=P1.x*.35*max(vec3(0),textureLod(A,uv-vec2(6./R.x,0),2.).rgb+textureLod(A,uv-vec2(14./R.x,0),3.).rgb-1.1);
 // scan reveal: the new image is written over the held frame line by line
 if(P0.w>=0.){float y=1.-uv.y;col=mix(col,texture(H,uv).rgb,step(P0.w,y));col+=vec3(.6)*exp(-abs(y-P0.w)*260.);}
 // eyepiece field stop with a faint coloured rim
 float r=length(c),ep=smoothstep(P0.x,P0.x-.012,r);
 col=col*ep+vec3(.3,.42,.5)*.25*exp(-abs(r-P0.x)*70.)*step(P0.x,1.2);
 // eyepiece graticule: crosshair and a micrometer scale
 if(P0.x<1.2){float gw=1.5/R.y,ga=smoothstep(gw,0.,abs(c.y))*step(abs(c.x),P0.x*.8)+smoothstep(gw,0.,abs(c.x))*step(abs(c.y),P0.x*.06)
  +smoothstep(gw,0.,abs(fract(c.x/(P0.x*.04)+.5)-.5)*P0.x*.04)*step(abs(c.y),P0.x*(fract(c.x/(P0.x*.2)+.5)<.1?.035:.018))*step(abs(c.x),P0.x*.8);col=mix(col,vec3(.08,.1,.09),ga*.6*ep);}
 col*=1.-.4*dot(c,c);
 // lab monitor inset: the whole simulation tile, V chemical in false colour
 if(P3>0.){vec2 iq=(gl_FragCoord.xy-vec2(R.x-R.y*.27,R.y*.1))/(R.y*.22);
  if(iq.x>-.02&&iq.y>-.02&&iq.x<1.02&&iq.y<1.02){vec2 rv=texture(D,iq).xy;vec3 ic=mix(vec3(.04,.05,.07),vec3(1.,.7,.25),smoothstep(.1,.35,rv.y))+vec3(.15,.3,.4)*(1.-rv.x)*.6;
   col=mix(col,max(iq.x,iq.y)>1.||min(iq.x,iq.y)<0.?vec3(.8):ic,P3);}}
 col*=vec3(1.+.04*P1.w,1.,1.-.05*P1.w);
 col=mix(col,vec3(1,.985,.96),P0.z)*P0.y;
 col=col/(1.+max(col-.9,0.)*.8);
 // camera-port sensor noise on the light microscopes
 col+=(hs2(gl_FragCoord.xy*.5+floor(T*30.))-.5)*.03*(P1.y>.9?1.:0.);
 o=vec4(col*gut+(hs2(gl_FragCoord.xy+T)-.5)/255.,1);
}
