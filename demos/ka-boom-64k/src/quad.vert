#version 300 es
layout(location=0)in vec2 q;
layout(location=1)in vec4 P;
layout(location=2)in vec4 R;
layout(location=3)in vec4 U;
layout(location=4)in vec4 K;
uniform mat4 uProj;
uniform mat4 uView;
out vec2 vt;
out float vc,vs;
void main(){
float cx=cos(R.x),sx=sin(R.x),cy=cos(R.y),sy=sin(R.y),cz=cos(R.z),sz=sin(R.z);
mat3 M=mat3(cz,sz,0.,-sz,cz,0.,0.,0.,1.)*mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy)*mat3(1.,0.,0.,0.,cx,sx,0.,-sx,cx);
vec3 l=vec3(q*P.w,0.)+vec3(.05,-.05,-.14)*R.w*P.w;
gl_Position=uProj*uView*vec4(P.xyz+M*l,1.);
vt=U.xy+vec2(q.x+.5,.5-q.y)*U.zw;
vc=K.x;vs=K.y;
}
