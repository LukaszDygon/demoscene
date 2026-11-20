#version 300 es
precision mediump float;in vec3 vc;out vec4 o;
void main(){vec2 d=gl_PointCoord-.5;o=vec4(vc*smoothstep(.25,0.,dot(d,d)),1);}
