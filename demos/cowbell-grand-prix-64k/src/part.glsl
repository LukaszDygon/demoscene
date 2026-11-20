// Particles: instanced billboards. A = position + size, B = colour + alpha
// (alpha 0: additive spark, 0..1: smoke, 1..2: glowing ring, 2..3: hard tumbling square such as confetti or a piano key).
layout(location=0) in vec4 A;
layout(location=1) in vec4 B;
out vec4 V;
out vec3 W;
void main(){
 cam();
 vec2 c=vec2(gl_VertexID&1,gl_VertexID>>1)*2.-1.;
 vec3 v=A.xyz-U[1].xyz;
 float a=B.a>1.95?float(gl_InstanceID)*7.+TM*6.:0.;
 vec2 o=c*mat2(cos(a),sin(a),-sin(a),cos(a))*A.w;
 if(B.a>1.95)o.y*=sin(TM*9.+float(gl_InstanceID));
 gl_Position=vec4((vec2(dot(v,CR),dot(v,CU))+o)*U[1].w*vec2(U[0].y/U[0].x,1),0,dot(v,CF));
 V=B;W=vec3(c,length(v));
}
//FRAG
#version 300 es
precision highp float;
uniform sampler2D T0;
in vec4 V;
in vec3 W;
out vec4 O;
void main(){
 float r=length(W.xy),a=V.a>1.95?V.a-2.:V.a>1.?0.:V.a;
 O=vec4(V.rgb*(a>0.?a:V.a>1.?V.a-1.:1.),a)*(V.a>1.95?1.:V.a>1.?smoothstep(.12,0.,abs(r-.85)):smoothstep(1.,.15,r))*clamp((texelFetch(T0,ivec2(gl_FragCoord.xy),0).a-W.z)*.7,0.,1.);
}
