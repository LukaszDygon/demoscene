#version 300 es
precision highp float;
// One vec4 table carries every scalar the shaders need. main.js fills it; the names below are its layout.
uniform vec4 U[28];
#define TM U[0].z
#define BT U[0].w
#define ZONE U[3].x
#define WET U[3].y
#define KICK U[3].z
#define BASS U[3].w
#define MOON U[4].xyz
#define BELL U[4].w
#define FOGC U[5].xyz
#define FOGD U[5].w
#define ZEN U[6].xyz
#define MOONR U[6].w
#define HOR U[7].xyz
#define SNR U[7].w
#define DOOR U[8].x
#define TUBE U[8].y
#define HYPE U[8].z
#define RUB U[8].w
#define CAR(i) U[9+i]
#define CX(i) U[13+i]
#define CG(i) U[17+i]
#define FX U[21]
#define MOONC U[22].xyz
#define DBGM U[22].w
#define TRZ U[23].x
#define FOCUS U[23].y
#define METEOR U[23].z
#define LOT vec2(360,600)
#define ZP 822.
#define ZE 460.
vec3 CR,CU,CF;
void cam(){
 CF=normalize(U[2].xyz-U[1].xyz);
 vec3 r=normalize(cross(vec3(0,1,0),CF)),u=cross(CF,r);
 float c=cos(U[2].w),s=sin(U[2].w);
 CR=r*c+u*s;CU=u*c-r*s;
}
float h1(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f*=f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+7.1;a*=.5;}return s;}
vec3 hue(float h){return .5+.5*cos(6.2832*(h+vec3(0,.33,.67)));}
