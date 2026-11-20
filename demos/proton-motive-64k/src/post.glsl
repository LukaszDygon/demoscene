// Post chain, one source compiled with "#define P n": 0 bright pass, 1 gaussian blur, 2 anamorphic streak, 3 final grade.
precision highp float;precision highp sampler3D;
uniform sampler2D uS0,uS1,uS2,uS3,uS4;uniform sampler3D uN;uniform vec3 uR;uniform vec2 uDir;uniform float uT;uniform vec4 uQ,uV,uF;
out vec4 o;
float sat(float x){return clamp(x,0.,1.);}
#if P==0
// 4x4 box (four bilinear taps) of scene + particles, soft-thresholded
void main(){vec2 uv=gl_FragCoord.xy/uR.xy,e=uDir;vec3 c=vec3(0);
 for(int i=0;i<4;i++){vec2 q=uv+e*vec2(i%2==0?-1.:1.,i<2?-1.:1.);c+=texture(uS0,q).rgb+texture(uS1,q).rgb;}
 c*=.25;float l=dot(c,vec3(.3,.6,.1));o=vec4(c*sat((l-uV.x)/(l+.2)),1);}
#endif
#if P==1
void main(){vec2 uv=gl_FragCoord.xy/uR.xy;vec3 c=texture(uS0,uv).rgb*.227;
 for(int i=1;i<5;i++){float w=i==1?.1946:i==2?.1216:i==3?.054:.0162;c+=(texture(uS0,uv+uDir*float(i)).rgb+texture(uS0,uv-uDir*float(i)).rgb)*w;}
 o=vec4(c,1);}
#endif
#if P==2
void main(){vec2 uv=gl_FragCoord.xy/uR.xy;vec3 c=vec3(0);float w=0.;
 for(int i=-12;i<13;i++){float k=exp(-abs(float(i))*.2);c+=texture(uS0,uv+vec2(float(i)*uDir.x,0)).rgb*k;w+=k;}
 o=vec4(c/w,1);}
#endif
#if P==3
// uQ: whip amount, whip angle, heat shimmer, white flash. uV: exposure, fade, grain, chromatic aberration. uF: camera (roll, tan, focus, aperture)
vec3 aces(vec3 x){return clamp(x*(2.51*x+.03)/(x*(2.43*x+.59)+.14),0.,1.);}
float hs(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
void main(){vec2 uv=(gl_FragCoord.xy-vec2(0,uR.z))/uR.xy,px=vec2(1,uR.x/uR.y)/1280.;
 // heat shimmer: refraction wobble from the noise volume, strongest low in frame
 vec3 n=texture(uN,vec3(uv*vec2(2.5,1.6)+vec2(0,-uT*.35),uT*.15)).rgb;uv+=n.xy*uQ.z*.011*(1.2-uv.y*.6);
 vec3 c=vec3(0);
 if(uQ.x>.02){// whip pan: directional smear
  vec2 d=vec2(cos(uQ.y),sin(uQ.y))*uQ.x*.12;float w=0.;for(int i=0;i<14;i++){float k=float(i)/13.-.5;c+=texture(uS0,uv+d*k).rgb+texture(uS1,uv+d*k).rgb;w+=1.;}c/=w;}
 else{// depth of field: golden-angle gather, taps accepted if their own blur reaches this pixel
  float d=texture(uS0,uv).a,cc=min(uF.w*abs(d-uF.z)/max(d,.01),12.);float w=0.;
  for(int i=0;i<16;i++){float a=float(i)*2.39996,r=sqrt(float(i)+.5)*.25*cc;vec4 s=texture(uS0,uv+vec2(cos(a),sin(a))*r*px);
   float sc=min(uF.w*abs(s.a-uF.z)/max(s.a,.01),12.),k=sat(sc-r+1.);c+=s.rgb*k;w+=k;}
  c=c/max(w,1e-3)+texture(uS1,uv).rgb;
  // lateral chromatic aberration
  vec2 ca=(uv-.5)*uV.w*.006;c.r=mix(c.r,texture(uS0,uv+ca).r+texture(uS1,uv+ca).r,.6);c.b=mix(c.b,texture(uS0,uv-ca).b+texture(uS1,uv-ca).b,.6);}
 // bloom (two radii) and the anamorphic streak, tinted blue like a cylindrical lens flare
 c+=texture(uS2,uv).rgb*.55+texture(uS3,uv).rgb*.6+texture(uS4,uv).rgb*vec3(.45,.65,1.3)*.9;
 // lens ghosts: the wide bloom mirrored through the centre, scaled and tinted
 for(int i=0;i<3;i++){float k=float(i)*.45+.6;vec2 g=.5-(uv-.5)*k;c+=texture(uS3,g).rgb*vec3(.4,.6,1.)*(.08-float(i)*.02)*smoothstep(.75,.2,length(g-.5));}
 c*=uV.x;c=aces(c);
 float l=dot(c,vec3(.3,.6,.1));c=mix(c*vec3(.82,.97,1.12),c,smoothstep(.0,.35,l));
 vec2 v=uv-.5;c*=1.-dot(v,v)*.9;
 c=pow(c,vec3(.4545));
 c+=(hs(gl_FragCoord.xy+fract(uT*7.)*517.)-.5)*uV.z*(1.-l*.6);
 c=mix(c,vec3(1,.96,.9),uQ.w)*uV.y;
 o=vec4(c+(hs(gl_FragCoord.xy*1.7+uT)-.5)/255.,1);}
#endif
