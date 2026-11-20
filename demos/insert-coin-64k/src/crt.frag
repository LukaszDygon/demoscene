#version 300 es
precision highp float;
// CRT: integer-scaled native pixels, gentle barrel curvature, beam-shaped scanlines, aperture grille, bloom from the mip chain
uniform sampler2D S;uniform vec4 V;uniform float T;out vec4 o;
void main(){vec2 f=(gl_FragCoord.xy-V.xy)/V.z/vec2(320,180);
 vec2 c=f*2.-1.;c*=1.+vec2(.028,.045)*dot(c,c);vec2 u=c*.5+.5;
 vec2 e=smoothstep(0.,.012,u)*smoothstep(0.,.012,1.-u);
 if(u.x<0.||u.y<0.||u.x>1.||u.y>1.){o=vec4(0,0,0,1);return;}
 vec2 p=u*vec2(320,180);vec3 col=texelFetch(S,ivec2(min(p,vec2(319,179))),0).rgb;
 float l=dot(col,vec3(.3,.55,.15)),d=abs(fract(p.y)-.5)*2.,w=mix(.38,.66,l);
 col*=mix(1.,exp(-d*d/(w*w)*1.2)*1.25,V.z>2.5?.62:.3);
 vec3 b=textureLod(S,u,2.).rgb*.55+textureLod(S,u,3.5).rgb*.5+textureLod(S,u,5.).rgb*.35;
 col+=b*b*.9+b*.12;
 float m=mod(gl_FragCoord.x,3.);col*=V.z>2.5?mix(vec3(1.08,.92,.92),m<1.?vec3(1.12,.9,.9):m<2.?vec3(.9,1.12,.9):vec3(.9,.9,1.12),.5):vec3(1);
 col*=e.x*e.y*(1.-.22*dot(c*c,vec2(.5,.7)))*(.985+.015*sin(T*120.+p.y*.5));
 o=vec4(pow(col,vec3(.95)),1);}
