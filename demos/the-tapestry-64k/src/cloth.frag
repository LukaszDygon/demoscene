#version 300 es
// THE TAPESTRY: turns the stitch-resolution design (drawn with Canvas 2D, one pixel = one stitch)
// into wool: tent stitches with twist, sheen and fuzz on a plain-weave linen ground, fire stitches that
// unravel and re-knit, the burnt hole with frayed glowing edges, the hem and the woven fringe.
precision highp float;
uniform vec2 R;        // framebuffer size (px)
uniform float S;       // px per stitch
uniform float X;       // cloth x at the left screen edge (stitches)
uniform float X0;      // cloth x of design-canvas column 0
uniform vec2 DS;       // design canvas size
uniform float T;       // seconds
uniform vec4 U;        // cloth left end, cloth right end, hole glow, fade
uniform vec3 P[12];    // dye palette (10 dyes + 2 fire keys)
uniform sampler2D D,M; // design (nearest), mask (linear: r hole, g firelight)
out vec4 o;
float h1(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+1.),f.x),f.y);}
float fb(vec2 p){return ns(p)*.5+ns(p*2.13)*.25+ns(p*4.37)*.125+ns(p*8.9)*.0625;}
vec4 dz(vec2 c){return texture(D,(vec2(c.x-X0,c.y)+.5)/DS);}
vec3 linen(vec2 p){
 vec2 w=p*2.,i=floor(w),f=fract(w);
 float a=mod(i.x+i.y,2.)<1.?f.y:f.x;
 float th=1.-pow(abs(a-.5)*2.,2.);
 float sl=ns(vec2(p.x*.35,i.y*1.7))*.5+ns(vec2(i.x*1.3,p.y*.35))*.5;
 vec3 c=vec3(.83,.76,.61)*(.74+.3*th)*(.9+.16*sl);
 return c*(1.-.16*fb(p*.025))*(1.-.06*ns(p*.2));
}
// wool thread of colour tc crossing a cell as a '/' tent stitch, f = position in cell
vec3 stitch(vec3 tc,vec2 f,float hh,vec2 p){
 float al=(f.x+1.-f.y)*.5,ac=f.x+f.y-1.;
 float m=smoothstep(.74,.52,abs(ac))*smoothstep(-.04,.1,al)*smoothstep(1.04,.9,al);
 float sh=sqrt(max(0.,1.-ac*ac/.55));
 float tw=.8+.2*sin((al*3.+ac*1.3)*12.566+hh*6.);
 vec3 th=tc*(.5+.62*sh)*tw*(.9+.2*hh)+.1*pow(sh,8.)*vec3(1,.95,.85);
 vec3 c=mix(tc*.36,th,m);
 return c*(.9+.2*h1(floor(p*9.)));
}
void main(){
 vec2 q=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y)/S,p=vec2(q.x+X,q.y),uv=gl_FragCoord.xy/R;
 vec3 bg=vec3(.04,.028,.02)*(.7+.5*ns(q*.04+T*.05));
 // cloth outline: soft shadow on the dark wall
 float dx=max(U.x-p.x,p.x-U.y),dy=max(4.-p.y,p.y-148.),de=max(dx,dy);
 vec3 col=bg*(.5+.5*smoothstep(0.,6.,de));
 vec4 mk=texture(M,vec2(p.x-X0,p.y)/DS);
 if(de<=0.){
  vec2 c=floor(p),f=fract(p);
  vec4 d=dz(c);
  vec3 L=linen(p);
  float hh=h1(c);
  bool hem=p.y<6.5||p.y>145.5||p.x<U.x+2.5||p.x>U.y-2.5;
  if(hem){L*=.8;float e=p.y<6.5?abs(p.y-5.2):p.y>145.5?abs(p.y-146.8):p.x<U.x+2.5?abs(p.x-U.x-1.2):abs(p.x-U.y+1.2);
   float ru=p.y<6.5||p.y>145.5?p.x:p.y;if(e<.32&&fract(ru*.5)<.6)L=P[6]*(.8+.3*hh);}
  if(d.a>.3&&!hem){
   int k=0;float bd=9.;
   for(int i=0;i<12;i++){float e=distance(d.rgb,P[i]);if(e<bd){bd=e;k=i;}}
   vec3 tc=P[k];
   if(k>9){ // fire: stitches jitter, change dye and unravel in waves that climb, then re-knit
    vec2 ff=clamp(f+.2*vec2(sin(T*13.+hh*40.),cos(T*11.+hh*31.)),0.,1.);
    tc=mix(P[0],P[4],.5+.5*sin(T*6.+hh*25.+c.y*.7));if(k==11)tc=mix(tc,P[4]*1.1,.65);
    col=stitch(tc*1.3,ff,hh,p);
    float un=fract(hh*3.7+c.y*.13+c.x*.031-T*1.7);
    if(un<.3){float lf=abs(f.x-.5-.3*sin(f.y*5.+T*9.+hh*9.));col=mix(L*1.05,P[4]*1.25,smoothstep(.13,.05,lf));}
    col+=vec3(.25,.08,0)*(.6+.4*sin(T*21.+hh*9.));
   }else col=stitch(tc,f,hh,p);
  }else{
   // linen ground with the shadow of raised wool on its upper-left side
   float sl=step(.3,dz(c-vec2(1,0)).a)*(1.-smoothstep(0.,.55,f.x)),su=step(.3,dz(c-vec2(0,1)).a)*(1.-smoothstep(0.,.55,f.y));
   col=L*(1.-.3*max(sl,su));
   // stray fibres, and wool fuzz spilling over from the stitch on the left
   col*=.94+.1*h1(floor(p*11.));
   vec4 nl=dz(c-vec2(1,0));
   if(nl.a>.3){float h2=h1(c+.5),fz=smoothstep(.07,0.,abs(f.y-.2-.6*h2-(f.x-.15)*(h2-.5)*1.4))*step(f.x,.15+.3*h2);col=mix(col,nl.rgb*.85,fz*.8);}
  }
  // hanging folds and candle light
  float fold=sin(p.x*.047+sin(p.x*.013)*2.1)*.5+.5;
  col*=(.84+.24*fold)*(.95+.05*sin(T*5.3+sin(T*2.1)));
  col+=vec3(1.,.42,.12)*mk.g*.6*(.85+.15*sin(T*17.+p.x*.13));
  // burnt hole: scorched ring, charred threads poking in, glowing frayed rim, darkness behind
  if(mk.r>.004){
  float hv=mk.r*1.3-fb(p*.45)*.55;
  col=mix(col,col*vec3(.3,.18,.1),smoothstep(.06,.47,hv)*.92);
  if(hv>.48){
   float lw=hv-.48,fr=0.;
   if(abs(fract(p.y)-.5)<.11&&lw<.13*h1(vec2(floor(p.y),3.)))fr=1.;
   if(abs(fract(p.x)-.5)<.11&&lw<.11*h1(vec2(floor(p.x),7.)))fr=1.;
   vec3 hb=bg*.35+vec3(1.,.45,.12)*step(.993,h1(floor(q*1.3+vec2(0,T*1.5))))*U.z*.8;
   col=mix(hb,vec3(.95,.38,.08)*U.z+vec3(.07,.03,.01),fr);
  }
  col+=vec3(1.,.36,.07)*exp(-pow((hv-.48)/.045,2.))*U.z*1.7*(.7+.3*ns(p*2.+T*3.));
  }
 }else{
  // the rod the cloth hangs from, with a loop of linen every 24 stitches
  if(p.x>U.x-8.&&p.x<U.y+8.&&p.y>.6&&p.y<3.8){float e=(p.y-2.2)/1.6;col=vec3(.32,.2,.11)*(.45+.7*sqrt(max(0.,1.-e*e)))*(.85+.2*ns(vec2(p.x*.4,p.y*3.)));
   if(abs(mod(p.x-U.x,24.)-12.)<2.5)col=linen(p)*.75*(.7+.3*sqrt(max(0.,1.-e*e)));}
  // woven fringe at the right end: bundles of warp knotted, then loose twisted strands
  float fx=p.x-U.y;
  if(fx>0.&&fx<30.&&p.y>6.&&p.y<146.){
   float bi=floor((p.y-6.)/7.),by=6.+bi*7.+3.5,rb=h1(vec2(bi,1.)),len=17.+9.*rb;
   float sw=sin(T*1.3+bi*.7)*.9*clamp(fx/len,0.,1.);
   if(fx<6.&&abs(p.y-by)<(fx<3.?3.2:2.2-abs(fx-4.5)*.3)){col=P[9]*(.55+.4*sqrt(max(0.,1.-abs(p.y-by)/3.2)))*(.85+.2*sin(fx*6.+p.y*3.));}
   else for(int j=0;j<4;j++){
    float sp=mix(.5,1.6+.6*h1(vec2(bi,float(j)+5.)),smoothstep(5.,len,fx));
    float yj=by+(float(j)-1.5)*sp+sw+sin(fx*.5+float(j))*.25;
    float lj=len*(.8+.2*h1(vec2(bi,float(j))));
    float e=abs(p.y-yj);
    if(e<.42&&fx<lj){vec3 tc=mod(bi,3.)<1.&&j==1?P[0]:P[9];col=tc*(.45+.55*sqrt(1.-e/.42))*(.85+.15*sin(fx*5.+e*9.))*(1.-.3*smoothstep(lj-4.,lj,fx));}
   }
  }
 }
 col*=1.-.42*pow(length((uv-.5)*vec2(1.,1.25)),2.2);
 col+=(h1(gl_FragCoord.xy+fract(T)*91.)-.5)*.025;
 o=vec4(col*U.w,1);
}
