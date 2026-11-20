#version 300 es
// marine snow + bioluminescent plankton, wrapped in a box around the camera
in vec4 a;uniform mat3 M;uniform vec3 C,LP;uniform vec2 R;uniform float T,Lt,H,Fd;out vec3 vc;
void main(){float S=36.;
 vec3 p=a.xyz*S+vec3(sin(T*.13+a.w*20.)*.6,-T*.12,cos(T*.11+a.w*17.)*.6);
 p=mod(p-C+S*.5,S)-S*.5;vec3 w=p+C,q=p*M;float z=q.z;
 gl_Position=z<.25?vec4(2,2,2,1):vec4(q.x*1.7*R.y/R.x,q.y*1.7,(z/110.*2.-1.)*z,z);
 float ed=smoothstep(S*.5,S*.32,length(p))*smoothstep(.25,1.5,z),amb=exp(min(w.y,0.)*.06);
 vec3 c=vec3(.45,.6,.65)*(amb*.45+.012);float ld=length(w-LP);c+=vec3(.5,1.,.92)*Lt*4./(1.+ld*ld*.3);
 float pk=0.;
 if(a.w>.75){float f=pow(max(sin(T*(.4+a.w)+a.x*40.),0.),10.)+H*H*step(.5,fract(a.y*37.));c+=(a.w>.93?vec3(1.,.2,.8):vec3(.2,.9,1.))*f*(1.-amb)*1.1;pk=1.;}
 vc=c*ed*Fd;gl_PointSize=clamp(R.y*.03/z,1.,6.)*(1.+pk*.6);}
