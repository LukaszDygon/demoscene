#version 300 es
// Gray-Scott reaction-diffusion on a 256^2 torus (Sims kernel, Du=1, Dv=.5, dt=1).
// P = (feed, kill, seed?, -). Seeding writes four small V spots; one sits where the camera looks.
precision highp float;
uniform sampler2D A;
uniform vec4 P;
out vec4 o;
void main(){
 ivec2 c=ivec2(gl_FragCoord.xy),n=textureSize(A,0);
 if(P.z>0.){vec2 u=gl_FragCoord.xy/vec2(n);float v=0.;
  vec2 sd[4]=vec2[4](vec2(.5),vec2(.13,.71),vec2(.77,.2),vec2(.3,.27));
  for(int i=0;i<4;i++){vec2 d=abs(u-sd[i]);d=min(d,1.-d);if(length(d*vec2(n))<4.)v=.25+.1*fract(sin(dot(u,vec2(91.7,47.3)))*4375.5);}
  o=vec4(v>0.?.5:1.,v,0,1);return;}
 vec2 v=texelFetch(A,c,0).xy,L=-v;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++)if(i!=0||j!=0)L+=texelFetch(A,(c+ivec2(i,j)+n)%n,0).xy*(i*j==0?.2:.05);
 // feed varies smoothly (and periodically, so the tile still wraps) once the stripes phase begins:
 // spots survive in some bands, stripes win in others, as on a real animal's flank
 float r=v.x*v.y*v.y,F=P.x+P.w*.006*sin(6.2832*float(c.x)/float(n.x));
 o=vec4(clamp(v+vec2(L.x-r+F*(1.-v.x),.5*L.y+r-(F+P.y)*v.y),0.,1.),0,1);
}
