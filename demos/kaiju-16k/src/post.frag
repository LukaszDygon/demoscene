#version 300 es
precision highp float;
uniform sampler2D F;uniform vec2 R;uniform vec2 Q;out vec4 o;
void main(){vec2 u=gl_FragCoord.xy/R,d=u-.5;
 vec3 c=vec3(texture(F,u+d*.008).r,texture(F,u).g,texture(F,u-d*.008).b),b=vec3(0);
 // bloom from the mip chain
 for(float i=1.;i<8.;i++)b+=textureLod(F,u,i).rgb*(.3+i*.12);
 c+=b*.14;
 c=1.-exp(-c*1.25);
 c=pow(c,vec3(.95,1,.9))*(1.-dot(d,d)*1.1)*(.94+.06*sin(gl_FragCoord.y*2.1));
 c+=(fract(sin(dot(u,vec2(12.9,78.2))+Q.y)*43758.5)-.5)*.035;
 o=vec4(c*Q.x,1);}
