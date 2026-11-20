#version 300 es
precision highp float;
uniform sampler2D X;uniform vec2 R,T;out vec4 o;
// heat-haze band at the horizon, bloom from the mip chain, mirrored ghost flares from the low sun,
// orange/teal grade, vignette, film grain, fade in from black and out at the end
float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 u=gl_FragCoord.xy/R,d=u-.5;float a=T.y,t=T.x;
 u.x+=sin(u.y*90.+a*9.)*.004*exp(-pow((u.y-.42)*7.,2.));
 vec3 c=vec3(texture(X,u+d*.006).r,texture(X,u).g,texture(X,u-d*.006).b),b=vec3(0);
 for(float i=1.;i<8.;i++)b+=textureLod(X,u,i).rgb*(.3+i*.12);
 c+=b*.14;
 for(float k=1.;k<4.;k++)c+=max(textureLod(X,1.-u+d*k*.3,2.+k).rgb-.9,0.)*.5;
 c=1.-exp(-c*1.2);
 float l=dot(c,vec3(.3,.6,.1));
 c=mix(c,c*mix(vec3(.05,.3,.36),vec3(1.,.6,.3),smoothstep(.15,.75,l))*1.8,.35);
 c*=1.-.35*dot(d,d);
 c+=(hh(gl_FragCoord.xy+a*97.)-.5)*.07;
 o=vec4(c*smoothstep(0.,1.5,t)*(1.-smoothstep(77.,80.,t)),1.);
}
