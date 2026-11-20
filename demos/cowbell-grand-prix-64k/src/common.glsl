#version 300 es
precision highp float;
// One vec4 table carries every scalar the shaders need. main.js fills it; the names below are its layout.
uniform vec4 U[40];
#define TM U[0].z
#define BT U[0].w
#define ZONE U[3].x
#define WET U[3].y
#define RAIN U[3].z
#define NIGHT U[3].w
#define SUN U[4].xyz
#define FLASH U[4].w
#define ZEN U[5].xyz
#define FOGD U[5].w
#define HOR U[6].xyz
#define CLD U[6].w
#define SUNC U[7].xyz
#define KICK U[7].w
#define BOX U[8]
#define BALL U[9]
#define GLV U[10]
#define PIA U[11]
#define PIR U[12]
#define DUK U[13]
#define DK2 U[14]
#define ICE U[15].x
#define CRK U[15].y
#define BEAM U[16]
#define RKT U[17].x
#define MAG U[17].y
#define TU0 U[18].x
#define TU1 U[18].y
#define RPA U[18].z
#define RPB U[18].w
#define ZF U[19].x
#define LITE U[19].y
#define BELL U[19].z
#define CAR(i) U[20+i]
#define CX(i) U[24+i]
#define LAMP U[28].xyz
#define EXIT U[28].w
#define HOLE U[29]
#define SHK U[30]
#define FX U[31]
#define BLZ U[32].x
#define TRZ U[32].y
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
