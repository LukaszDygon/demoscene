const S=SONG,E=S.E,T=S.T,cv=document.getElementById('c'),gl=cv.getContext('webgl2',{antialias:true});
const cl=x=>Math.min(1,Math.max(0,x)),sl=p=>p*p*(3-2*p),ph=(a,b,t)=>cl((t-T(a))/(T(b)-T(a)));
const hs=(i,j)=>{const x=Math.sin(i*127.1+j*311.7)*43758.5453;return x-Math.floor(x)};
const mm=(a,b)=>{const o=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o};
const TR=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
const RZ=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]};
const RY=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]};
const RX=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]};
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
const look=(e,c)=>{const f=nrm(sub(c,e)),s=nrm(cr(f,[0,1,0])),u=cr(s,f);
 return[s[0],u[0],-f[0],0,s[1],u[1],-f[1],0,s[2],u[2],-f[2],0,-dot(s,e),-dot(u,e),dot(f,e),1]};
const persp=(fy,a,n,f)=>{const t=1/Math.tan(fy/2);return[t/a,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]};
const VSF=`#version 300 es
void main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0.,1.);}`;
const BGF=`#version 300 es
precision highp float;uniform vec2 R;uniform float F;out vec4 o;
void main(){vec2 u=gl_FragCoord.xy/R;vec3 a=vec3(.6,.82,.97),b=vec3(1.,.93,.84);
vec3 s=mix(b,a,smoothstep(.15,1.,u.y));float d=length((u-vec2(.5,.45))*vec2(1.,.6));
s=mix(s,vec3(1.,.98,.93),.45*exp(-d*d*3.))+F*vec3(.25,.2,.15)*exp(-d*d*2.);o=vec4(s,1.);}`;
const OVS=`#version 300 es
in vec3 p,n;uniform mat4 V,M;out vec3 wn,wp;
void main(){vec4 w=M*vec4(p,1.);wp=w.xyz;wn=mat3(M)*n;gl_Position=V*w;}`;
const OFS=`#version 300 es
precision highp float;in vec3 wn,wp;uniform vec3 C,CP;uniform float S,Em,K;out vec4 o;
void main(){vec3 n=normalize(wn),L=normalize(vec3(.45,.9,.6)),Vd=normalize(CP-wp),h=normalize(L+Vd),t=C;
if(K>.5&&K<1.5)t*=.9+.1*sin(wp.x*38.+sin(wp.y*11.)*3.+wp.z*4.);
if(K>1.5)t*=.95+.05*sin(wp.x*60.)*sin(wp.y*60.);
float d=max(dot(n,L),0.),hm=.5+.5*n.y;
float ao=mix(.68,1.,smoothstep(0.,1.4,wp.y))*mix(.72,1.,smoothstep(-2.1,-1.4,wp.z));
vec3 amb=mix(vec3(.8,.72,.8),vec3(1.,.97,.92),hm);
vec3 c=t*(amb*.7*ao+d*.5)+S*pow(max(dot(n,h),0.),48.)+t*Em;
float f=smoothstep(40.,80.,length(wp-CP));
o=vec4(mix(c,vec3(.92,.94,.99),f*.35),1.);}`;
const PVS=`#version 300 es
in vec4 a;in vec4 c;uniform mat4 V;uniform float uS;out vec4 vc;
void main(){vec4 q=V*vec4(a.xyz,1.);gl_Position=q;gl_PointSize=a.w*uS/max(q.w,.1);vc=c;}`;
const PFS=`#version 300 es
precision mediump float;in vec4 vc;out vec4 o;
void main(){vec2 q=gl_PointCoord*2.-1.;float g=clamp(1.-dot(q,q),0.,1.);g*=g;o=vec4(vc.rgb*vc.a*g,1.);}`;
const PROG=(v,f)=>{const p=gl.createProgram();for(const[t,s]of[[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const h=gl.createShader(t);gl.shaderSource(h,s);gl.compileShader(h);if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(h));gl.attachShader(p,h)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));return p};
const UL=(p,n)=>{p.u=p.u||{};return p.u[n]||(p.u[n]=gl.getUniformLocation(p,n))};
const BGP=PROG(VSF,BGF),OP=PROG(OVS,OFS),PP=PROG(PVS,PFS);
// meshes: one vertex pool, cached by key, scale baked into vertices so normals stay exact
const VD=[],MC={};
const mesh=(k,f)=>MC[k]||(MC[k]=(()=>{const s=VD.length/6;f();return[s,VD.length/6-s]})());
const Q=(a,b,c,d,n)=>{for(const p of[a,b,c,a,c,d])VD.push(p[0],p[1],p[2],n[0],n[1],n[2])};
function BOX(w,h,d){const x=w/2,y=h/2,z=d/2;
 Q([x,-y,-z],[x,y,-z],[x,y,z],[x,-y,z],[1,0,0]);Q([-x,-y,z],[-x,y,z],[-x,y,-z],[-x,-y,-z],[-1,0,0]);
 Q([-x,y,-z],[-x,y,z],[x,y,z],[x,y,-z],[0,1,0]);Q([-x,-y,z],[-x,-y,-z],[x,-y,-z],[x,-y,z],[0,-1,0]);
 Q([-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z],[0,0,1]);Q([x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z],[0,0,-1])}
function SPH(r,sg,st){const P=(i,j)=>{const th=Math.PI*i/st,f=2*Math.PI*j/sg;return[Math.sin(th)*Math.cos(f),Math.cos(th),Math.sin(th)*Math.sin(f)]};
 for(let i=0;i<st;i++)for(let j=0;j<sg;j++)for(const[a,b]of[[i,j],[i+1,j],[i+1,j+1],[i,j],[i+1,j+1],[i,j+1]]){const p=P(a,b);VD.push(p[0]*r,p[1]*r,p[2]*r,p[0],p[1],p[2])}}
function CYL(r0,r1,h,sg){const hh=h/2,V=(p,n)=>VD.push(p[0],p[1],p[2],n[0],n[1],n[2]);
 for(let j=0;j<sg;j++){const a0=2*Math.PI*j/sg,a1=2*Math.PI*(j+1)/sg,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
  const A=[c0*r0,-hh,s0*r0],Bq=[c1*r0,-hh,s1*r0],C=[c1*r1,hh,s1*r1],D=[c0*r1,hh,s0*r1],nn=[(c0+c1)/2,0,(s0+s1)/2];
  for(const p of[A,Bq,C,A,C,D])V(p,nn);
  for(const[p,n]of[[[0,hh,0],[0,1,0]],[D,[0,1,0]],[C,[0,1,0]],[[0,-hh,0],[0,-1,0]],[Bq,[0,-1,0]],[A,[0,-1,0]]])V(p,n)}}
const bxm=(w,h,d)=>mesh('b'+[w,h,d],()=>BOX(w,h,d));
const sph=r=>mesh('s'+r,()=>SPH(r,10,6));
const cyl=(r0,r1,h)=>mesh('c'+[r0,r1,h],()=>CYL(r0,r1,h,12));
// scene objects. Pop-up panels: the house folds about hinges at |x| = 3.6 and 6.9 (pn 0, 1, 2)
const OB=[],HZ=[3.6,6.9];
const panel=cx=>Math.abs(cx)<HZ[0]?0:Math.abs(cx)<HZ[1]?1:2;
const MK=c=>c===WOOD?1:(c===SAL||c===MINT||c===PIN||c===LAV||c===PEACH)?2:0;
const O=(m,ms,c,cx,sp,em)=>OB.push({m,ms,c,pn:panel(cx),g:cx<0?-1:1,sp:sp||0,em:em||0,k:MK(c)});
const W=(m,ms,c,sp,em)=>OB.push({m,ms,c,pn:-1,g:1,sp:sp||0,em:em||0,k:MK(c)});
// boxes are split at hinge lines so every piece lies in one panel
const bx=(x0,x1,y0,y1,z0,z1,c,sp)=>{const cut=[x0,x1];for(const h of[-6.9,-3.6,0,3.6,6.9])if(h>x0&&h<x1)cut.push(h);cut.sort((a,b)=>a-b);
 for(let i=0;i<cut.length-1;i++){const a=cut[i],b=cut[i+1],cx=(a+b)/2;O(TR(cx,(y0+y1)/2,(z0+z1)/2),bxm(b-a,y1-y0,z1-z0),c,cx,sp)}};
const sbx=(x0,x1,y0,y1,z0,z1,c)=>{bx(x0,x1,y0,y1,z0,z1,c);bx(-x1,-x0,y0,y1,z0,z1,c)};
// fold matrices for one frame: [side][level] for side -1 (left) and +1 (right)
function foldMats(phi){const r={};for(const g of[-1,1]){const s=g<0?1:-1,h1=g*HZ[0],h2=g*HZ[1];
 const R0=RY(s*phi[0]),R1=mm(TR(h1,0,0),mm(RY(s*phi[1]),TR(-h1,0,0))),R2=mm(TR(h2,0,0),mm(RY(s*phi[2]),TR(-h2,0,0)));
 r[g]=[R0,mm(R0,R1),mm(R0,mm(R1,R2))]}return r}
