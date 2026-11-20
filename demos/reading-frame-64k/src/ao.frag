// Screen-space ambient occlusion on the log-depth (crevices between atoms), plus a faint out-of-focus
// fluorescence haze where there is no geometry.
uniform sampler2D S;
uniform vec2 R;
uniform float AO,T;
uniform vec3 BG;
out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f*=f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+1.),f.x),f.y);}
void main(){
 vec2 u=gl_FragCoord.xy/R;
 vec4 s=texture(S,u);
 float lz=s.a;
 if(lz>19.){
  vec2 q=(u-.5)*vec2(R.x/R.y,1)*2.2;
  float n=vn(q+T*.013)*.6+vn(q*2.3-T*.02)*.3+vn(q*5.1+T*.03)*.1;
  o=vec4(s.rgb+BG*n*n*(1.2-length(u-.5)),lz);
  return;
 }
 float z=exp2(lz),oc=0.,rp=clamp(AO*R.y/z*.7,1.5,40.),a0=hs(gl_FragCoord.xy)*6.283;
 for(int i=0;i<12;i++){
  float fi=float(i),a=a0+fi*2.39996;
  float sz=exp2(texture(S,u+vec2(cos(a),sin(a))*rp*sqrt((fi+.5)/12.)/R).a),dz=z-sz;
  oc+=clamp(dz/AO,0.,1.)*(1.-smoothstep(AO*2.,AO*6.,dz));
 }
 o=vec4(s.rgb*(1.-.75*oc/12.),lz);
}
