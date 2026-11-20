// Bloom from the mip chain, lateral chromatic aberration, filmic tone curve, vignette, the confocal
// raster-scan reveal, grain and dither.
uniform sampler2D D;
uniform vec2 R;
uniform float T,EX,FL,FD,CA,BL,SC,GR;
uniform vec3 LR;
out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
// 3x3 tent per mip level: smooth, round glow instead of square mip blocks
vec3 tap(vec2 u,float l){vec2 p=exp2(l)/R;vec3 s=vec3(0);for(int i=0;i<9;i++){vec2 o=vec2(i%3-1,i/3-1);s+=textureLod(D,u+p*o,l).rgb*(2.-abs(o.x))*(2.-abs(o.y));}return s/16.;}
void main(){
 vec2 u=gl_FragCoord.xy/R,d=u-.5;
 float r2=dot(d,d);
 vec2 of=d*CA*(.3+r2*2.);
 vec3 c=vec3(texture(D,u-of).r,texture(D,u).g,texture(D,u+of).b),b=vec3(0);
 for(int l=1;l<8;l++)b+=tap(u,float(l))*(1.4/(1.+float(l)*.35));
 c+=b*BL/5.;
 // light shafts: radial march toward the chromophore through the gaps of the barrel
 if(LR.z>0.){vec3 g=vec3(0);vec2 st=(LR.xy-u)/32.;float w=1.;for(int i=0;i<32;i++){g+=max(textureLod(D,u+st*float(i),1.).rgb-.25,0.)*w;w*=.95;}c+=g*vec3(.3,1,.45)*LR.z*.05;}
 c*=EX;
 c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);
 c*=1.-r2*.85;
 c=mix(c,vec3(1),FL)*FD;
 if(SC<1.){float y=1.-u.y;c*=step(y,SC);c+=vec3(.4,1,.55)*exp(-abs(y-SC)*R.y*.05)*.5*FD;}
 c=pow(clamp(c,0.,1.),vec3(.4545));
 c+=(hs(u*R+fract(T)*91.)-.5)*GR+(hs(u*R.yx-T)-.5)/255.;
 o=vec4(c,1);
}
