#version 300 es
precision highp float;
// phosphor persistence at native resolution: bright pixels decay over a few frames instead of vanishing
uniform sampler2D C,P;out vec4 o;
void main(){ivec2 p=ivec2(gl_FragCoord.xy);p.y=179-p.y;vec3 c=texelFetch(C,p,0).rgb,q=texelFetch(P,ivec2(gl_FragCoord.xy),0).rgb;
 o=vec4(max(c,q*vec3(.42,.36,.46)),1);}
