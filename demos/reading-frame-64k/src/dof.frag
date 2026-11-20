// Thin-lens depth of field, single-pass scatter-as-gather on a golden-angle spiral.
// Background samples cannot bleed over a sharper foreground (their circle is clamped).
uniform sampler2D S,Hs;
uniform vec2 R;
uniform float F,AP,MX,MB;
out vec4 o;
float cc(float lz){float z=exp2(lz);return min(AP*abs(z-F)/z,MX);}
void main(){
 vec2 u=gl_FragCoord.xy/R;
 vec4 c0=texture(S,u);
 float cs=cc(c0.a),tt=1.,a=fract(52.9829*fract(dot(gl_FragCoord.xy,vec2(.06711,.00583))))*6.283;
 vec3 ac=c0.rgb;
 for(int i=1;i<52;i++){
  float r=sqrt(float(i)/51.)*MX;
  a+=2.39996;
  vec4 s=texture(S,u+vec2(cos(a),sin(a))*r/R);
  float sc=cc(s.a);
  if(s.a>c0.a)sc=min(sc,cs*2.);
  ac+=mix(ac/tt,s.rgb,smoothstep(r-1.,r+1.,sc));
  tt+=1.;
 }
 // temporal accumulation = motion trails when things move faster than the shutter
 o=vec4(mix(ac/tt,texture(Hs,u).rgb,MB),1);
}
