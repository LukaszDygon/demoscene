// Instanced sphere impostors. One quad per atom, oriented perpendicular to the view ray and sized to the
// sphere's exact silhouette; the fragment shader ray-casts the sphere. MD=1 draws additive point-spread dots.
uniform mat4 V,P;
uniform vec2 R;
uniform float MD;
layout(location=0) in vec2 q;
layout(location=1) in vec4 a;
layout(location=2) in vec4 c;
out vec3 vp,vc;
out vec4 col;
out float vr,vi;
out vec2 vq;
void main(){
 vec3 C=(V*vec4(a.xyz,1)).xyz;
 float r=a.w,d=length(C),s;
 col=c;vr=r;vc=C;vq=q;vi=1.;
 if(r<=0.||d<r*1.02||C.z>-.02){gl_Position=vec4(0,0,-2,1);return;}
 vec3 f=C/d,x=normalize(cross(f,vec3(.0013,1,.0007))),y=cross(x,f);
 if(MD>.5){
  // energy-conserving minimum size so sub-pixel emitters do not shimmer
  float px=r/-C.z*P[1][1]*R.y*.5;
  s=r*max(1.,1.6/px);vi=min(1.,px*px/2.56);
 }else s=r*d/sqrt(d*d-r*r)*1.03;
 vp=C+(q.x*x+q.y*y)*s;
 gl_Position=P*vec4(vp,1);
}
