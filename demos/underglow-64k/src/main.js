// UNDERGLOW: picture. The audio clock drives everything; one time value b (in bars) goes in,
// and car poses, lights, camera, particles and captions come out.
const D=document,C=D.getElementById("c"),H=D.getElementById("h"),g=C.getContext("webgl2",{antialias:false,alpha:false}),X=H.getContext("2d"),
{sin,cos,min,max,abs,floor,PI,exp,atan2,hypot,random,round,sqrt}=Math,
BAR=SONG.BAR,
cl=(x,a=0,b=1)=>min(b,max(a,x)),mix=(a,b,t)=>a+(b-a)*t,
sm=(a,b,x)=>{x=cl((x-a)/(b-a));return x*x*(3-2*x)},
rs=()=>random()*2-1,
// keyed track [bar,value,bar,value...]: K eases between keys, LN joins them with straight lines, SL rounds LN's corners
K=(a,b)=>{let i=0;while(i<a.length-4&&b>=a[i+2])i+=2;return mix(a[i+1],a[i+3],sm(a[i],a[i+2],b))},
LN=(a,b)=>{let i=0;while(i<a.length-4&&b>=a[i+2])i+=2;return mix(a[i+1],a[i+3],cl((b-a[i])/(a[i+2]-a[i])))},
SL=(a,b)=>(LN(a,b-.3)+LN(a,b)+LN(a,b+.3))/3,
// turn from angle a towards angle b
ang=(a,b,t)=>a+(b-a-round((b-a)/6.2832)*6.2832)*t,
bez=(a,b,c,d,u)=>[0,1].map(k=>{const v=1-u;return v*v*v*a[k]+3*v*v*u*b[k]+3*v*u*u*c[k]+u*u*u*d[k]}),
VS="#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}";
if(!g||!g.getExtension("EXT_color_buffer_float"))D.body.innerHTML="<p style=color:#fff>This intro needs WebGL2 with float render targets.";

// ---------- the night, in bars ----------
// 0-4 garage · 4-28 downtown, the others fall in at three corners · 28-44 the lot · 44-52 tunnel · 52-76 hill road · 76-88 overlook
// Downtown is a grid of 80 m blocks. The route: [straight metres, turn (1 right, -1 left), radius]; SG holds it as segments
// [start distance, length, x, z, heading, turn, radius].
const SG=[];
{let x=0,z=20,h=0,s=0;
 [[286,1,14],[132,-1,14],[132,1,14],[132,-1,14],[98,1,8]].map(([L,t,r])=>{
  SG.push([s,L,x,z,h,0,0]);x+=sin(h)*L;z+=cos(h)*L;s+=L;
  const a=r*PI/2;SG.push([s,a,x,z,h,t,r]);
  x+=t*r*(cos(h)-cos(h+t*PI/2));z+=t*r*(sin(h+t*PI/2)-sin(h));h+=t*PI/2;s+=a})}
// point a metres into a segment: [x,z,heading]
const sgp=([,,x,z,h,t,r],a)=>t?[x+t*r*(cos(h)-cos(h+t*a/r)),z+t*r*(sin(h+t*a/r)-sin(h)),h+t*a/r]:[x+sin(h)*a,z+cos(h)*a,h],
route=s=>{let i=0;while(i<9&&s>=SG[i+1][0])i++;return sgp(SG[i],s-SG[i][0])},
// a car that has not joined yet is d metres short of the join point q on its own approach:
// round the mirror image of the convoy's corner (t=+-1) or straight on (t=0)
apr=([,,x,z,h],t,d)=>{const a=t?7*PI:0,hs=h-t*PI/2,xs=x-t*14*(cos(hs)-cos(h)),zs=z-t*14*(sin(h)-sin(hs));
 return d>a?[xs-sin(hs)*(d-a),zs-cos(hs)*(d-a),hs]:sgp([0,0,xs,zs,hs,t,14],a-d)},
// where each car joins: the straight after corner 1, 2, 3, and how it comes
JN=[0,[SG[2],-1],[SG[4],0],[SG[6],-1]],
SE=SG[9][0]+SG[9][1],
// distance of the lead car along the route: corners fall on bars 12, 16, 20, 24 and are taken at 12 m/s
SK=[4,0,5,12,11.5,282,12.5,312,15.5,436,16.5,466,19.5,590,20.5,620,23.5,744,24.5,774,27.6,868,28.2,882,33,992],
S=b=>SL(SK,b),
// two abreast on the straights, single file through the corners
WK=[4,1,11,1,11.5,0,12.5,0,13.3,1,15,1,15.5,0,16.5,0,17.3,1,19,1,19.5,0,20.5,0,21.3,1,23,1,23.5,0,24.6,0,25.4,1,27,1,27.5,0],
// the bar each car turns into the lot
EB=[0,1,2,3].map(i=>{let b=27;while(S(b)-9*i<SE)b+=.002;return b}),
LX=360,LZ=600,
// places round the pit: x, z, facing (cyan and amber stand along the circle, pink faces the middle)
SPOT=[[0,-4],[6.25,-10.8],[6.25,10.8],[-10.2,-7.2]].map(([x,z],i)=>[x,z,i>2?atan2(-x,-z):PI/6*(i+1)+PI/3*!i]),
// the lead car's doughnut, bars 32-40: angle round the pit and radius
OA=b=>{const x=cl(b-32,0,8);return PI*1.5*(x<.5?x*x:x<7.5?x-.25:7.25+(x-7.5)-(x-7.5)**2)-PI/2},
OR=b=>4+1.5*sm(36,36.6,b),
// tunnel: lateral position and distance behind the leader; four abreast in the middle of it
L2=[[44,1.7,60,1.7],[44,-1.7,60,-1.7],[44,1.7,47,1.7,48.5,5,50,5,51.3,1.7],[44,-1.7,47,-1.7,48.5,-5,50,-5,51.3,-1.7]],
O2=[[44,0,60,0],[44,-9,47,-9,48.5,-1,50,-1,51.3,-9],[44,-18,47,-18,48.5,-2,50,-2,51.3,-18],[44,-27,47,-27,48.5,-3,50,-3,51.3,-27]],
// hill road (mirrors scene.glsl): height, centre line, slope of the centre line
HK=.04488,ZP=822,
smin=(a,b,k)=>{const h=cl(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1-h)},
RY=z=>40+.09*smin(z,ZP-40,40),
RX=z=>28*sm(ZP-30,ZP-170,z)*sin(z*HK),
RD=z=>28*sm(ZP-30,ZP-170,z)*HK*cos(z*HK),
// the convoy's z on the hill: a bend apex on every even bar; spacing closes up for the tandem run; lateral lines
ZH=b=>SL([50,-105,75,770,80,920],b),
GP=[52,1,63,1,64,.72,68,.72,69.5,1],
L3=[[52,1.2,60,-1,68,1,74,0],[52,-1.2,60,1.2,68,-1,74,0],[52,1,58,-1.2,66,1.2,74,0],[52,-1,58,1,66,-1,74,0]],
zh=(i,b)=>ZH(b)-8.5*i*K(GP,b),
// the bar each car leaves the road for the overlook
PB=[0,1,2,3].map(i=>{let b=74;while(zh(i,b)<800)b+=.002;return b}),
// underglow colours: violet, cyan, amber, pink
GC=[[.55,.2,1],[.1,.8,1],[1,.5,.06],[1,.12,.5]],
// per zone: fog rgb + density, zenith, horizon, moonlight, wet, exposure, moon direction, moon radius
PA=[[.16,.1,.19,.004,.004,.004,.008,.012,.009,.016,0,0,0,0,1.05,0,.3,1,.05],
[.07,.035,.06,.0035,.012,.014,.035,.11,.055,.08,.15,.18,.26,.9,.95,.06,.36,1,.055],
[.06,.03,.012,.006,.01,.012,.03,.03,.04,.08,.4,.48,.65,.5,.9,0,.1,1,.075],
[.012,.02,.045,.0016,.008,.014,.04,.035,.05,.1,.7,.85,1.2,0,1.1,-.83,.21,.52,.07]],
// camera shots: bar, mode, anchor, target, focal, position at the start and at the end of the shot, look-at height, [target points].
// mode 0 rides with the anchor car (ahead, right, up); 1 is a fixed point in the world; 2 the same relative to the lot;
// 3 relative to the hill road (across, above, z). Anchor/target 0-3 are cars, 4 the pack, 5 the listed points, 6 far ahead of the anchor.
SH=[[-1,1,0,5,1.6,3.4,1.1,3.6,2.4,1.3,4.4,0,0,.7,0,0,.7,0],[0,1,0,5,1.5,-2.3,.5,3.5,-2,.55,3.2,0,0,.6,1,0,.6,1],
[1,1,0,5,1.3,4.2,.35,-.8,4,.4,.8,0,0,.4,0,0,.4,0],[2,1,0,5,1.2,-1.3,1.3,-5.8,-.7,1.5,-5.3,0,0,1,4,0,1,4],[3,1,0,5,1.4,1.9,.4,5.5,1.2,.5,5.9,0,0,.7,0,0,.7,0],
[4,0,0,0,1.5,8,-2.5,.5,6.5,-1.5,.6,.7],[6,0,0,0,1.6,1,6.4,2,-1,6.4,1.9,.5],[8,0,0,6,1.3,-7,1.5,1.1,-6,.5,1.3,5],[10,0,0,6,1.4,-5,-1.2,1.3,-5.5,-1,1.4,3],
[12,1,0,4,1.5,46,.6,323.6,46,.6,323.6,.7],[14,0,1,0,1.5,-6,-2,1.2,-5.5,-1,1.1,.8],[16,1,0,4,1.5,153.4,.5,374,153.4,.5,374,.7],[18,0,0,1,1.5,9,-3,1.6,8,-2,1.2,.7],
[20,1,0,4,1.5,212,.6,484,212,.6,484,.7],[22,0,4,4,1.4,-5,0,30,5,0,22,0],[24,1,0,4,1.3,321.1,.4,479.8,321.1,.4,479.8,.6],[26,0,3,0,1.5,-6.5,0,1.5,-6,.5,1.3,.8],
[28,2,0,4,1.4,-21,7,-21,-15,5,-17,.5],[30,2,0,5,1.5,-22,.9,-20.5,9,.9,-20.5,0,-19,.6,-26,12,.6,-26],[32,2,0,0,1.4,9,.5,-3,8,.6,2,.6],
[34,2,0,5,1.6,0,18,-7,0,22,-7,0,0,0,0,0,0,0],[36,2,0,0,1.4,-11.9,.8,5.8,-11.9,.8,5.8,.6],[38,2,0,0,1.5,0,1.1,0,0,1.1,0,.5],
[40,2,0,2,1.4,10.65,.5,9.4,10.3,.6,9.1,.9],[41,2,0,0,1.5,1.2,.6,5.4,.9,.7,5.7,.5],[42,2,0,5,1.3,-14,6,-12,-12,7,-13,0,0,1,0,0,1,0],[43,2,0,0,1.5,-27,.6,-5,-27,.6,-5,.6],
[44,0,0,4,1.5,10,0,.5,8,1,.6,.7],[46,0,1,1,1.4,1,-4,1.2,-1,-4,1.1,.7],[48,0,4,0,1.3,-8,0,3.2,-6,0,2,1],[50,0,0,6,1.5,-5.5,0,1.1,-5,0,1,2.5],
[52,0,0,6,1.4,-9,-2,2.4,-7,-1,1.6,3],[54,0,0,0,1.5,3,4.4,5,0,4.4,4,.6],[56,3,0,4,1.5,-7.6,1,178,-7.6,1,178,.7],[58,0,1,0,1.5,-5.5,1,1,-5,.5,1.1,.8],
[60,3,0,4,1.5,3,7,318,3,5,318,.5],[62,0,0,4,1.5,9,0,.6,8,.5,.7,.7],[64,0,4,4,1.4,2,4.6,3,-3,4.6,4.5,.5],[66,3,0,4,1.4,-4.6,.5,500,-4.6,.5,500,.6],
[68,0,0,0,1.8,0,4.4,1.1,1,4.4,1.2,.7],[70,0,0,6,1.4,-10,0,4,-8,-1,3,2],[72,0,4,4,1.4,-14,-3,5,-22,-6,13,.5],
[76,3,0,4,1.4,-15.5,.6,808,-15.5,.6,808,.7],[78,3,0,5,1.5,-1,2.4,808,-2.5,2.6,811,0,-60,-4,847,-60,-4,850],
[80,3,0,5,1.05,-16.3,.5,812.8,-16.3,.55,813.4,0,-16.2,.8,833,-16.2,.8,833],[84,3,0,5,1.3,-2.5,2.6,811,-2,8.5,806,0,-85,-8,863,-85,-12.5,858],[999]];

// ---------- cars ----------
const mm=(a,b)=>{const r=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[j+3]+a[i*3+2]*b[j+6];return r},
ry=a=>[cos(a),0,sin(a),0,1,0,-sin(a),0,cos(a)],
rx=a=>[1,0,0,0,cos(a),-sin(a),0,sin(a),cos(a)],
rz=a=>[cos(a),-sin(a),0,sin(a),cos(a),0,0,0,1];
// car i in the lot at bar b, relative to the lot: arrive and park, doughnut, tandem, and the leader rolling out
function lotp(i,b){
 const sp=SPOT[i];
 let u=cl((b-EB[i])/2.2),h=sp[2],a,r,p;
 u=1-(1-u)**2;
 p=bez([-32,0],[-24,0],[sp[0]-sin(h)*7,sp[1]-cos(h)*7],sp,u);
 if(i==0&&b>=32)a=OA(b),r=OR(b),p=[r*cos(a),r*sin(a)],h=atan2(-sin(a),cos(a));
 if(i==1&&b>=36.157)u=min(b,40)-36.157,a=PI*1.5*((u<.6?u*u/1.2:u-.3)-max(0,u-3.343)**2)-PI/3,r=mix(12.48,8.4,sm(36.157,37.4,b)),
  p=[r*cos(a),r*sin(a)],h=atan2(-sin(a),cos(a));
 if(!i&&b>43)u=cl((b-43)/1.7),p=bez(p,[p[0]+sin(h)*6,p[1]+cos(h)*6],[-22,0],[-36,0],u*u);
 return[LX+p[0],0,LZ+p[1],h]}
// which place a bar belongs to: 0 garage, 1 downtown and the lot, 2 tunnel, 3 hill
const ZN=b=>b<4?0:b<44?1:b<52?2:3;
// where car i is at bar b: [x,y,z,facing when it stands still]. Each place has its own coordinates; zn pins the place,
// so that a car's motion can be read across a cut as if the cut were not there.
function P(i,b,zn=ZN(b)){
 if(!zn)return[0,i?-999:0,0,0];
 if(zn<2){
  if(b>=EB[i])return lotp(i,b);
  const s=S(b)-9*i,J=JN[i],o=J&&s<J[0][0],q=o?apr(J[0],J[1],J[0][0]-s):route(s),l=K(WK,b-.3*i)*(o?1.6:i&1?-1.6:1.5);
  return[q[0]+cos(q[2])*l,0,q[1]-sin(q[2])*l]}
 if(zn<3)return[K(L2[i],b),0,50*(b-44)+K(O2[i],b)];
 if(b>=PB[i]){
  let u=cl((b-PB[i])/2);
  const z=ZP+(1.5-i)*3.8,p=bez([0,800],[0,810],[-5,z],[-12.5,z],1-(1-u)**2);
  return[p[0],RY(p[1]),p[1],-PI/2]}
 const z=zh(i,b),l=K(L3[i],b),d=RD(z),c=1/sqrt(1+d*d);
 return[RX(z)+l*c,RY(z-l*d*c),z-l*d*c]}
// full pose: position, heading, drift angle, pitch, speed in m/s
function pose(i,b){
 const zn=ZN(b),p=P(i,b),q=P(i,b+.01,zn);
 let dx=q[0]-p[0],dz=q[2]-p[2],sp=hypot(dx,dz)/.01/BAR,hd=p[3]||0,dr=0,k,a,c,e,w;
 if(sp>.3)hd=p[3]==null?atan2(dx,dz):ang(hd,atan2(dx,dz),sm(.3,2,sp));
 // drift angle: the yaw rate along the path, clamped, then averaged over a window from half a bar behind to a fifth
 // of a bar ahead. The tail swings out as the car turns in and takes a second to come back after the exit.
 // A step in which the car stands still counts as no yaw (9).
 for(k=-11,e=9;k<6;k++,a=c,e=w){
  c=P(i,b+k*.05,zn);w=9;
  if(a&&hypot(dx=c[0]-a[0],dz=c[2]-a[2])>.15)w=atan2(dx,dz);
  if(e<9&&w<9)e=w-e,e-=round(e/6.2832)*6.2832,dr+=cl(e*6.5,-.75,.75)*(1+cos((k+2)*.419))/15}
 return{p,hd,dr,sp,pit:sp>1?-atan2(q[1]-p[1],sp*.01*BAR):0}}
let CP=[],KE=0,BE=0,BS=0,SN=0,WA=[0,0,0,0],TL=[0,0,0,0],FL=[0,0,0,0];
// local point of car i -> world
const wl=(i,x,y,z)=>{const c=CP[i],m=c.m;return[c.p[0]+m[0]*x+m[1]*y+m[2]*z,c.p[1]+m[3]*x+m[4]*y+m[5]*z,c.p[2]+m[6]*x+m[7]*y+m[8]*z]},
// the middle of the cars that are near the leader
pack=()=>{const a=[0,0,0];let n=0;CP.map(c=>{if(hypot(c.p[0]-CP[0].p[0],c.p[2]-CP[0].p[2])<45&&c.p[1]>-99)n++,c.p.map((x,k)=>k<3&&(a[k]+=x))});return a.map(x=>x/n)};

// ---------- GL ----------
function prog(v,f){
 const p=g.createProgram();
 [v,f].map((s,i)=>{const h=g.createShader(i?g.FRAGMENT_SHADER:g.VERTEX_SHADER);g.shaderSource(h,s);g.compileShader(h);
  /*DBG*/if(!g.getShaderParameter(h,g.COMPILE_STATUS)){const e=g.getShaderInfoLog(h);console.error(e,s.split("\n").slice(0,3).join("|"));throw Error(e)}/*END*/
  g.attachShader(p,h)});
 g.linkProgram(p);
 /*DBG*/if(!g.getProgramParameter(p,g.LINK_STATUS))throw Error(g.getProgramInfoLog(p));/*END*/
 return p}
const pS=prog(VS,"$SCENE$"),pP=prog(VS,"$POST$"),pB=prog(VS,"$BLUR$"),pQ=prog("$PARTV$","$PARTF$"),
u=new Float32Array(112),um=new Float32Array(36),
fbo=()=>({f:g.createFramebuffer(),t:g.createTexture()}),
FB=[0,1,2,3,4,5].map(fbo),
ib=g.createBuffer(),idat=new Float32Array(32e3);
g.bindBuffer(g.ARRAY_BUFFER,ib);
g.bufferData(g.ARRAY_BUFFER,idat.byteLength,g.DYNAMIC_DRAW);
for(let i=0;i<2;i++)g.enableVertexAttribArray(i),g.vertexAttribPointer(i,4,g.FLOAT,false,32,i*16),g.vertexAttribDivisor(i,1);
let W=0,Hh=0,sw=0,sh=0,qual=1;
// (re)allocate the render targets: scene, particles, then the bloom chain
function size(){
 // 2.2:1 letterbox; the scene is raymarched at ~200k pixels and upscaled by the post pass
 const iw=innerWidth,ih=innerHeight,cw=min(iw,ih*2.2),ch=cw/2.2,d=min(devicePixelRatio,1.5),e=min(d,1080/ch);
 [C,H].map(c=>c.style.cssText=`left:${(iw-cw)/2}px;top:${(ih-ch)/2}px;width:${cw}px;height:${ch}px`);
 H.width=cw*d;H.height=ch*d;
 W=C.width=cw*e|0;Hh=C.height=ch*e|0;
 sh=min(Hh,304*qual**.5)|0;sw=sh*2.2|0;
 FB.map((o,i)=>{o.w=sw>>[0,0,1,2,2,3][i];o.h=sh>>[0,0,1,2,2,3][i];
  g.bindTexture(g.TEXTURE_2D,o.t);g.texImage2D(g.TEXTURE_2D,0,g.RGBA16F,o.w,o.h,0,g.RGBA,g.HALF_FLOAT,null);
  [g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER].map(k=>g.texParameteri(g.TEXTURE_2D,k,g.LINEAR));
  [g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T].map(k=>g.texParameteri(g.TEXTURE_2D,k,g.CLAMP_TO_EDGE));
  g.bindFramebuffer(g.FRAMEBUFFER,o.f);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,o.t,0)})}
onresize=size;size();
// draw a pass: program, target (0 = screen), input textures, D uniform
function pass(p,o,tex,d,n){
 g.useProgram(p);
 g.bindFramebuffer(g.FRAMEBUFFER,o?o.f:null);
 g.viewport(0,0,o?o.w:W,o?o.h:Hh);
 tex.map((t,i)=>{g.activeTexture(g.TEXTURE0+i);g.bindTexture(g.TEXTURE_2D,t.t);g.uniform1i(g.getUniformLocation(p,"T"+i),i)});
 g.uniform4fv(g.getUniformLocation(p,"U"),u);
 g.uniformMatrix3fv(g.getUniformLocation(p,"M"),false,um);
 d&&g.uniform4fv(g.getUniformLocation(p,"D"),d);
 n?g.drawArraysInstanced(g.TRIANGLE_STRIP,0,4,n):g.drawArrays(g.TRIANGLES,0,3)}

// ---------- particles ----------
let PT=[],lastb=-9,lz=-1,wp=[];
// n particles at (x,y,z)+-sp with velocity v+-vs: life, size, growth, colour, alpha (see part.glsl), gravity, drag
function emit(n,[x,y,z],sp,[vx,vy,vz],vs,life,size,grow,[r,gr,bl],a,grav,drag){
 for(;n-->0;)PT.length<3900&&PT.push([x+rs()*sp,y+rs()*sp,z+rs()*sp,vx+rs()*vs,vy+rs()*vs,vz+rs()*vs,0,life*(.6+.8*random()),size*(.7+.6*random()),grow,r,gr,bl,a,grav,drag])}
function sim(b,dt,zone){
 if(b<lastb||b>lastb+1||zone!=lz)PT=[],wp=[],lz=zone;   // a cut clears the air
 const h=CP[0].p;
 for(let i=0;i<4;i++){
  const c=CP[i],gc=GC[i],a=abs(c.dr)>.25&&c.sp>2?abs(c.dr)*2:0,bk=wl(i,0,0,-1).map((x,k)=>(x-c.p[k])*5);
  if(c.p[1]<-99)continue;
  for(let k=-1;k<2;k+=2){
   // tyre smoke, lit from below by the car's own glow
   let w=wl(i,k*.84,.12,-1.4),o=wp[i*4+k]||w;
   wp[i*4+k]=w;
   if(a>0)for(let n=0;n<2;n++)emit(1,w.map((x,j)=>mix(o[j],x,n/2)),.2,[rs()*.6,1.2,rs()*.6],.5,1.4*min(a,1.3),.4,2.4,gc.map(x=>.1+x*.3),.28*min(a,1),-.25,1.2);
   // tail lights draw lines in the dark
   w=wl(i,k*.6,.64,i==2?-2.65:-2.2);o=wp[i*4+k+9]||w;wp[i*4+k+9]=w;
   if(c.sp>5&&TL[i]>.2)for(let n=0;n<3;n++)emit(1,w.map((x,j)=>mix(o[j],x,n/3)),0,[0,0,0],0,zone>2?.8:.22,.13,0,[2.2,.1,.04],0,0,0);
  }
  // on the hill each car leaves a fading ribbon of its own colour along the road
  if(zone>2&&c.sp>5){const w=wl(i,0,.08,-1),o=wp[i*4+30]||w;wp[i*4+30]=w;for(let n=0;n<3;n++)emit(1,w.map((x,j)=>mix(o[j],x,n/3)),0,[0,0,0],0,1.3,.45,0,gc.map(x=>x*.35),0,0,0)}
  // spray off the wet street
  if(zone==1&&c.sp>8&&random()<.6)emit(1,wl(i,rs()*.8,.1,-2.2),.2,[bk[0]*.3,.8,bk[2]*.3],.6,.5,.25,1.5,[.14,.14,.17],.12,.5,1);
  // sparks out of the pipe with every pop
  if(FL[i]>.8)emit(3,wl(i,.45,.3,-2.5),.1,[bk[0],1,bk[2]],2.5,.5,.05,0,[6,3,.8],0,8,.5);
 }
 if(!zone&&b>.2){
  if(random()<.4)emit(1,wl(0,.45,.3,-2.3),.05,[0,.3,-.8],.2,1.6,.12,.35,[.1,.09,.1],.25,-.2,.6);
  if(b>2)emit(1,[rs()*1.6,.3+random()*1.2,2.5+random()*4],0,[.05,.02,0],.05,1.5,.012,0,[.9,.8,.6],0,0,0)}
 // the lowrider scrapes on every kick
 if(KE>.93&&CP[2].sp>6&&zone<3&&CP[2].p[1]>-99)emit(6,wl(2,rs()*.6,.05,-2.3),.1,[rs()*2,1.5,rs()*2],2,.4,.05,0,[6,3,.8],0,9,.5);
 // steam from a manhole somewhere near
 if(zone==1&&random()<.3){const x=round((h[0]+rs()*50+2)/40)*40-2,z=round((h[2]+rs()*50-3)/40)*40+3;
  if((abs((x+40)%80-40)<6||abs((z+40)%80-40)<6)&&hypot(x-LX,z-LZ)>46)emit(1,[x,.2,z],.3,[.3,1.6,0],.4,2.5,.6,1.1,[.12,.1,.13],.2,-.3,.3)}
 if(zone>2){
  // cherry petals on the wind; at the top they fall from the old tree, and fireflies come out
  if(random()<.5)emit(1,b<76?[h[0]+rs()*18,h[1]+1+random()*6,h[2]+10+rs()*30]:[-11+rs()*4,119+rs()*2,ZP+20+rs()*4],0,[-1.5,-.5,0],.8,5,.045,0,[.55,.3,.38],2.6,.25,.3);
  [84,85,86,86.5].map((x,i)=>{if(lastb<x&&b>=x){const c=[-560+i*70,150+i*12,1150+i*45];for(let n=0;n<130;n++){const a=rs()*PI,e=rs()*PI/2,v=30+rs()*3;
   PT.push([...c,v*cos(a)*cos(e),v*sin(e),v*sin(a)*cos(e),0,2+random(),5,0,...GC[i].map(x=>x*4+.4),0,5,1.2])}}});
  if(b>76&&random()<.3)emit(1,[-13+rs()*8,110.6+random()*1.6,ZP+rs()*22],0,[0,0,0],.3,2.5,.035,0,[1.5,2.5,.5],0,0,0);
 }
 // integrate
 let n=0;
 PT=PT.filter(p=>{
  const k=1-p[15]*dt,q=p[6]/p[7],a=p[13],f=a>2?1:a>1?1-q:a?min(1,q*6)*(1-q):1-q*q;
  p[3]*=k;p[4]=p[4]*k-p[14]*dt;p[5]*=k;
  for(let j=0;j<3;j++)p[j]+=p[3+j]*dt;
  if(p[14]>1&&zone<3&&p[1]<.04)p[1]=.04,p[4]*=-.4;
  p[6]+=dt;p[8]+=p[9]*dt;
  n<4e3&&idat.set([p[0],p[1],p[2],p[8],p[10]*(a?1:f),p[11]*(a?1:f),p[12]*(a?1:f),a>2?a:a>1?1+(a-1)*f:a*f],n++*8);
  return p[6]<p[7]});
 lastb=b;
 return n}

// ---------- one frame of state: fills the uniform table, returns the particle count ----------
let shot=0,lsh=-1,cut=0,DM=0;
function state(b,t,dt){
 const bb=max(b,0),zone=ZN(bb),tn=bb*BAR,pa=PA[zone],
 // envelopes from the song's own patterns: time since the last hit of a track, shaped by f
 ev=(key,f,B=bb)=>{for(let n=0;n<34;n++){const i=floor(B*16)+1-n,ts=(i>>4)*BAR+SONG.st(i&15);if(i<0)break;if(ts<=B*BAR&&SONG.plan(i>>4)[key][i&15]>".")return f(B*BAR-ts)}return 0},
 dec=k=>x=>exp(-x*k),
 // one-off envelopes: time since the latest of the listed steps in this bar
 pe=(st,k)=>st.reduce((a,i)=>{const x=tn-floor(bb)*BAR-SONG.st(i);return x<0?a:max(a,exp(-x*k))},0);
 KE=b<0?0:ev("k",dec(7));BE=b<0?0:ev("r",dec(8));BS=b<0?0:ev("bs",dec(3.5));SN=b<0?0:ev("sn",dec(8));
 // the lowrider's front end jumps on every 808 note of the hop-off, and nods to the bass the rest of the time
 const hop=bb>=40&&bb<44?ev("bs",x=>exp(-x*3)*abs(sin(x*11)))*(floor(bb)&1?.35:1):0,odd=floor(bb)&1;
 CP=[0,1,2,3].map(i=>{
  const c=pose(i,bb),pit=c.pit-(i==2?.3*hop+.02*BS:.012*BS);
  c.p[1]+=(i==2?1.6*sin(.3*hop)+.04*BS:.02*BS)*(c.p[1]>-99);
  c.m=mm(mm(ry(c.hd+c.dr),rx(pit)),rz(-c.dr*.12+(i==2&&bb>28.5&&bb<31.5?.07*sin(bb*4*PI)*sm(28.5,29,bb)*(1-sm(31,31.5,bb)):0)));
  WA[i]+=c.sp*dt/.34*(i==0&&bb>=32&&bb<40?3:1);
  return c});
 // lamps. The lead car wakes up in the garage: underglow on bar 1, headlights on bar 2. At the overlook the
 // headlights go out one car per bar from bar 80 and the underglows one per beat in bar 87.
 const fk=x=>x>0?1-.6*exp(-x*30)*(sin(x*190)>0):0,
 HL=[0,1,2,3].map(i=>(i?1:fk((bb-2)*BAR))*(bb<80+i)*(i>2&&bb>=40&&bb<44?bb*8%1<.5:1)),
 UG=[0,1,2,3].map(i=>(i?1:fk((bb-1)*BAR))*(bb<87+i/4)*(.7+.6*BS));
 TL=HL.map((x,i)=>{const a=P(i,bb-.08,zone),c=P(i,bb-.04,zone);return bb<1&&!i?.5*(b>=0):(.5+.5*(hypot(a[0]-c[0],a[2]-c[2])/.04/BAR>CP[i].sp+.25&&CP[i].sp<40))*(bb<80+i)});
 // flames: the lead car answers the hop-off in bars 41 and 43; two cars pop in the tunnel on the odd bars
 FL=[0,1,2,3].map(i=>!i&&bb>=40&&bb<44&&odd?pe([4,7,10,12,13],12):zone==2&&odd&&i==(bb>48?3:1)?pe([10,13],12):0);
 // camera
 while(b>=SH[shot+1][0])shot++;
 while(shot&&b<SH[shot][0])shot--;
 if(shot!=lsh)lsh=shot,cut=t;
 const s=SH[shot],un=cl((b-s[0])/(SH[shot+1][0]-s[0])),A=[0,1,2].map(k=>mix(s[5+k],s[8+k],un)),
 pk=pack(),an=s[2]>3?pk:CP[s[2]].p,ah=pose(s[2]&3,max(bb-.1,s[0])).hd,
 // a point given in the shot's own frame
 fr=v=>s[1]>2?[RX(v[2])+v[0],RY(v[2])+v[1],v[2]]:s[1]>1?[LX+v[0],v[1],LZ+v[2]]:v;
 let ro=s[1]?fr(A):[an[0]+sin(ah)*A[0]+cos(ah)*A[1],an[1]+A[2],an[2]+cos(ah)*A[0]-sin(ah)*A[1]],
 ta=s[3]<4?CP[s[3]].p.slice(0,3):s[3]<5?pk:s[3]<6?fr([0,1,2].map(k=>mix(s[12+k],s[15+k],un))):[an[0]+sin(ah)*60,an[1],an[2]+cos(ah)*60],
 foc=s[4]*(1-.02*KE),roll=s[0]==34?(bb-34)*.35:0;
 if(zone>2&&!s[1])ro[1]=RY(ro[2])+A[2],s[3]>5&&(ta[1]=RY(ta[2]));
 ta[1]+=s[11];
 // a hand-held sway, and a nudge on every kick
 ro[0]+=.03*(sin(t*1.3)+sin(t*2.9))+.012*KE*sin(t*71);ro[1]+=.02*(sin(t*1.7)+sin(t*3.7))+.012*KE*sin(t*83);
 // ---- uniform table ----
 u.fill(0);
 u.set([sw,sh,t,bb,...ro,foc,...ta,roll+(s[1]?0:CP[s[2]&3].dr*.06),
  zone,pa[13],KE,BS,pa[15],pa[16],pa[17],BE,
  pa[0],pa[1],pa[2],pa[3],pa[4],pa[5],pa[6],pa[18]*(1+.3*sm(84,88,bb)),pa[7],pa[8],pa[9],SN,
  // garage door, a dying ceiling tube, how wild the crowd is, rubber on the lot
  sm(3.05,3.95,bb),bb<1?.12*(sin(t*13)+sin(t*31)>1.2):0,sm(31.5,32.5,bb),sm(32.3,35.5,bb)]);
 const ml=hypot(pa[15],pa[16],pa[17]);
 for(let k=16;k<19;k++)u[k]/=ml;
 for(let i=0;i<4;i++){
  const c=CP[i];
  u.set([c.p[0],c.p[1],c.p[2],1],36+i*4);
  u.set([FL[i],HL[i],WA[i],c.p[1]<-99?0:3.3],52+i*4);
  u.set([...GC[i].map(x=>x*UG[i]),TL[i]],68+i*4);
  um.set(c.m,i*9);
 }
 // post: blur (a kick at each cut), exposure, fade, flash (phones at the lot fire on the snare)
 u.set([.2*exp(min(0,cut-t)*14)*(bb>0),pa[14],b<0?.8:min(1,(88.7-bb)/1.2),zone==1&&bb>=32?.12*SN:0,pa[10],pa[11],pa[12],DM],84);
 // the train crosses over the convoy just before bar 14, and again every eight bars
 u[92]=320+((bb+2.2)%8-4)*50;
 // focus on the subject (on the anchor when the camera looks far ahead), and the shooting star
 u[93]=s[3]>5?hypot(an[0]-ro[0],an[2]-ro[2]):hypot(ta[0]-ro[0],ta[1]-ro[1],ta[2]-ro[2]);
 u[94]=cl((bb-85.2)/.35)%1;
 // how squarely each car's headlights look into the lens
 CP.map((c,i)=>{const v=ro.map((x,k)=>x-c.p[k]),l=hypot(...v);u[96+i]=HL[i]*max(0,(v[0]*c.m[2]+v[1]*c.m[5]+v[2]*c.m[8])/l)**3*min(1,12/l)});
 return sim(bb,dt,zone)}

// ---------- captions ----------
const FN='"Courier New",Menlo,Consolas,"DejaVu Sans Mono",monospace',TF='Impact,"Arial Narrow","DejaVu Sans Condensed",sans-serif';
// camcorder lettering
function osd(s,x,y,px,al="left"){
 X.font="700 "+px+"px "+FN;X.textAlign=al;
 X.shadowColor="#000";X.shadowBlur=px*.35;X.fillStyle="#fff";X.fillText(s,x,y);X.fillText(s,x,y);X.shadowBlur=0}
// a word bent out of neon tube
function neon(s,x,y,px,col){
 X.font="italic 900 "+px+"px "+TF;X.textAlign="center";X.lineJoin="round";
 X.shadowColor=col;X.shadowBlur=px*.4;X.strokeStyle=col;X.lineWidth=px*.07;X.strokeText(s,x,y);X.strokeText(s,x,y);
 X.shadowBlur=0;X.strokeStyle="#fff";X.lineWidth=px*.018;X.strokeText(s,x,y)}
function hud(b,t){
 const w=H.width,h=H.height,un=h/100,bb=max(b,0),ck=(bb<44?7450:9660)+bb*BAR|0,p2=x=>(""+x).padStart(2,0);
 X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,w,h);
 if(b<0){
  // a tube that has seen better nights
  X.globalAlpha=sin(t*13)+sin(t*31)>1.5?.55:1;
  neon("UNDERGLOW",w/2,h*.44,un*21,"#a4f");
  X.globalAlpha=1;
  osd("a 64k night drive  ·  memphis phonk at "+SONG.BPM+" bpm",w/2,h*.56,un*3,"center");
  osd("[ click ]  turn the key          f  fullscreen",w/2,h*.88,un*3,"center");
  return}
 if(bb<84){
  X.globalAlpha=.75;
  // recording: the lamp blinks on the beat
  if(bb*4%1<.5){X.fillStyle="#f22";X.beginPath();X.arc(un*5.2,un*6.6,un*1.1,0,7);X.fill()}
  osd("REC",un*7.5,un*7.8,un*3.4);
  osd("SP  0:"+p2(bb*BAR/60|0)+":"+p2(bb*BAR%60|0),w-un*13,un*7.8,un*3.4,"right");
  // the battery runs down with the night
  X.strokeStyle="#fff";X.lineWidth=un*.4;X.strokeRect(w-un*11,un*5,un*6,un*3);X.fillStyle=bb>78?"#f22":"#fff";
  for(let k=0;k<3-bb/30;k++)X.fillRect(w-un*(10.4-k*1.8),un*5.6,un*1.3,un*1.8);
  if(bb>80&&bb*2%1<.5)osd("BATTERY LOW",w/2,h-un*5,un*3.4,"center");
  osd("AUG 14  0"+(ck/3600|0)+":"+p2(ck/60%60|0)+":"+p2(ck%60)+" AM",w-un*5,h-un*5,un*3.4,"right");
  // where we are and who has joined, typed out for three bars
  [[4,"DOWNTOWN"],[12.7,"CONVOY OF 2"],[16.7,"CONVOY OF 3"],[20.7,"CONVOY OF 4"],[28,"THE LOT"],[44,"RIVER TUNNEL"],[52,"HILL ROAD"],[76,"THE OVERLOOK"]].map(([a,s])=>{
   if(bb>=a&&bb<a+3)X.globalAlpha=.9*sm(a,a+.2,bb)*(1-sm(a+2.6,a+3,bb)),osd(s.slice(0,(bb-a)*24),un*5,h-un*5,un*4.4)});
  X.globalAlpha=1;
 }else{
  X.globalAlpha=sm(84,85.5,bb)*cl((88.5-bb)/1.2)*(bb>87.75&&sin(t*40)>0?.4:1);
  neon("UNDERGLOW",w/2,h*.3,un*15,"#a4f");
  if(bb>85.5)osd("a 64k intro  ·  no cars were raced",w/2,h*.4,un*2.8,"center");
  X.globalAlpha=1}}

// ---------- run ----------
let actx,song,pt=0,acc=0,fc=0,la=0,nh=0,gov=1;
function draw(b,t,dt){
 const n=state(b,t,dt);
 pass(pS,FB[0],[]);
 g.bindFramebuffer(g.FRAMEBUFFER,FB[1].f);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);
 if(n){g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA);g.bindBuffer(g.ARRAY_BUFFER,ib);g.bufferSubData(g.ARRAY_BUFFER,0,idat.subarray(0,n*8));
  pass(pQ,FB[1],[FB[0]],0,n);g.disable(g.BLEND)}
 // bloom: bright pass to 1/2, blur to 1/4, a wide horizontal streak at 1/8
 const bl=(a,o,x,y,th)=>pass(pB,o,[a,FB[1]],[x/a.w,y/a.h,1/o.w,1/o.h,th,0,0,0]);
 bl(FB[0],FB[2],1,0,1.5);bl(FB[2],FB[3],0,1,0);bl(FB[3],FB[4],1.5,0,0);bl(FB[4],FB[3],0,1.5,0);bl(FB[3],FB[5],3,0,0);
 pass(pP,0,[FB[0],FB[1],FB[3],FB[5]],[W,Hh,0,0,0,0,0,0]);
 hud(b,t)}
function frame(now){
 requestAnimationFrame(frame);
 now/=1e3;
 const dt=min(now-pt,.1);pt=now;/*DBG*/(window.__dt=window.__dt||[]).push(dt);/*END*/
 let t=-1,b=-1+now*.03%1;
 if(song){t=actx.currentTime-song.base;b=t/BAR;
  // Governor: every 45 frames, if they averaged under ~48 fps, render fewer pixels.
  // If two cuts in a row bought nothing (a 30 Hz display, a throttled tab), undo them and stop adapting.
  acc+=dt;
  if(++fc>44){
   const a=acc/fc;
   if(gov&&a>.021&&t>1){
    if(la&&a>la*.93&&++nh>1)qual/=.64,gov=0,size();
    else if(qual>.4)la=a,qual*=.8,size()}
   else la=nh=0;
   fc=acc=0}}
 draw(b,song?t:now%100,dt)}
function start(){
 if(song)return;
 actx.resume();song=SONG.live(actx);cut=-9}
try{actx=new AudioContext();setTimeout(()=>SONG.bufs(actx.sampleRate),300)}catch(e){}
onclick=start;
onkeydown=e=>{e.key=="f"?D.documentElement.requestFullscreen():start()};
requestAnimationFrame(frame);
/*DBG*/
window.__dbg={
 // render bar b after simulating the 1.5 bars before it; returns luminance statistics and an ASCII thumbnail
 go(b,cols=64,rows=24){
  for(let x=max(b-1.5,-1);x<b;x+=.03)state(x,x*BAR,.03*BAR);
  draw(b,b*BAR,.02);
  const px=new Uint8Array(W*Hh*4);g.bindFramebuffer(g.FRAMEBUFFER,null);g.readPixels(0,0,W,Hh,g.RGBA,g.UNSIGNED_BYTE,px);
  let s=0,blk=0,wht=0,out="",o2="",rgb=[0,0,0];const hs=new Uint32Array(256);
  for(let i=0;i<W*Hh;i++){const l=(px[i*4]*.3+px[i*4+1]*.59+px[i*4+2]*.11)/255;hs[l*255|0]++;s+=l;blk+=l<.03;wht+=l>.97;for(let k=0;k<3;k++)rgb[k]+=px[i*4+k]}
  for(let r=rows-1;r>=0;r--){for(let c=0;c<cols;c++){let l=0,n=0;
   let R=0,G=0,B=0;
   for(let y=r*Hh/rows|0;y<(r+1)*Hh/rows;y+=3)for(let x=c*W/cols|0;x<(c+1)*W/cols;x+=3){const i=(y*W+x)*4;R+=px[i];G+=px[i+1];B+=px[i+2];n++}
   R/=n;G/=n;B/=n;l=R*.3+G*.59+B*.11;
   out+=" .:-=+*#%@"[min(9,l/25.6|0)];
   const mx=max(R,G,B),mn=min(R,G,B),hu=mx-mn<mx*.25?"w":R==mx?(G-mn>(mx-mn)*.6?"y":B-mn>(mx-mn)*.6?"m":"r"):G==mx?(B-mn>(mx-mn)*.6?"c":R-mn>(mx-mn)*.6?"y":"g"):(R-mn>(mx-mn)*.6?"m":G-mn>(mx-mn)*.6?"c":"b");
   o2+=mx<30?" ":mx>150?hu.toUpperCase():hu}out+="   "+o2+"\n";o2=""}
  let acc=0,pc=[];for(let i=0;i<256;i++){acc+=hs[i];for(const q of[.1,.5,.9])if(acc>=q*W*Hh&&acc-hs[i]<q*W*Hh)pc.push((i/255).toFixed(2))}
  return{pc:pc.join("/"),mean:+(s/W/Hh).toFixed(3),black:+(blk/W/Hh).toFixed(3),white:+(wht/W/Hh).toFixed(3),rgb:rgb.map(x=>+(x/W/Hh/255).toFixed(2)),parts:PT.length,out}},
 // material map of bar b: what is on screen, as letters
 mat(b,cols=88,rows=24){
  for(let x=max(b-.3,-1);x<b;x+=.03)state(x,x*BAR,.03*BAR);
  DM=1;state(b,b*BAR,.02);DM=0;pass(pS,FB[0],[]);
  const px=new Float32Array(sw*sh*4);g.bindFramebuffer(g.FRAMEBUFFER,FB[0].f);g.readPixels(0,0,sw,sh,g.RGBA,g.FLOAT,px);
  let out="",nr=0;
  for(let i=0;i<sw*sh;i++)nr+=px[i*4+1]<.7;
  for(let r=rows-1;r>=0;r--){for(let c=0;c<cols;c++){const m=px[(((r+.5)*sh/rows|0)*sw+((c+.5)*sw/cols|0))*4]+.5|0;
   out+=m>=60?"p":m>=20?(m-20)/10|0:" .=#$!WT^YCi?Dooo~B@"[m]||"?"}out+="\n"}
  return"bar "+b+" shot "+SH[shot][0]+" near "+(nr/sw/sh).toFixed(3)+"\n"+out},
 pose,P,S,SH,EB,PB,SG,
 // start playback at bar b; report the frame pacing since the last call
 play(b){song&&song.stop();actx.resume();song=SONG.live(actx,b*BAR);window.__dt=[]},
 pace(){const d=window.__dt.slice().sort((a,b)=>a-b),n=d.length;window.__dt=[];return{n,med:+(d[n>>1]*1e3).toFixed(1),p90:+(d[n*.9|0]*1e3).toFixed(1),qual:+qual.toFixed(2),res:sw+"x"+sh,bar:+((actx.currentTime-song.base)/BAR).toFixed(1)}},
 // draw the whole timeline in coarse steps; any exception or GL error surfaces here
 scan(){let n=0,bad=[];for(let b=-1;b<89.5;b+=.137){draw(b,max(b,0)*BAR,.03);const e=g.getError();if(e)bad.push(b.toFixed(2)+':'+e);if(u.some(x=>x!=x))bad.push(b.toFixed(2)+':NaN uniform');n++}return n+' frames, problems: '+(bad.join(' ')||'none')},
 // bars where the camera is inside or right up against something (share of pixels closer than 0.7 m), or two cars overlap
 clear(st=.05){const bad=[];let last="";for(let b=-1;b<88;b+=st){DM=1;state(b,b*BAR,st*BAR);DM=0;pass(pS,FB[0],[]);
  const px=new Float32Array(sw*sh*4);g.bindFramebuffer(g.FRAMEBUFFER,FB[0].f);g.readPixels(0,0,sw,sh,g.RGBA,g.FLOAT,px);
  let nr=0;for(let i=0;i<sw*sh;i+=7)nr+=px[i*4+1]<.7;
  nr=nr*7/sw/sh;if(nr>.03)bad.push(b.toFixed(2)+":near"+nr.toFixed(2));
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=CP[i].p,c=CP[j].p;if(a[1]>-99&&c[1]>-99&&hypot(a[0]-c[0],a[2]-c[2])<2.6)bad.push(b.toFixed(2)+":hit"+i+j)}}
  return bad.join(" ")||"clear"},
 u,
 // linear means of the scene, particle and bloom buffers, plus the scene's median and 99th percentile luminance
 lin(b){this.go(b,2,2);return[0,1,3,5].map(k=>{const o=FB[k],px=new Float32Array(o.w*o.h*4);g.bindFramebuffer(g.FRAMEBUFFER,o.f);g.readPixels(0,0,o.w,o.h,g.RGBA,g.FLOAT,px);
  const a=[0,0,0],l=[];for(let i=0;i<o.w*o.h;i++){for(let j=0;j<3;j++)a[j]+=px[i*4+j]/o.w/o.h;l.push(px[i*4]*.3+px[i*4+1]*.59+px[i*4+2]*.11)}
  l.sort((x,y)=>x-y);return a.map(x=>+x.toFixed(3)).join(",")+(k?"":" med "+l[l.length>>1].toFixed(3)+" p99 "+l[l.length*.99|0].toFixed(2)+" max "+l[l.length-1].toFixed(1))}).join(" | ")},
 // the scene pass alone
 ts(b,n=20){draw(b,b*BAR,.02);g.finish();const t0=performance.now();for(let i=0;i<n;i++){pass(pS,FB[0],[]);g.readPixels(0,0,1,1,g.RGBA,g.FLOAT,new Float32Array(4))}return(performance.now()-t0)/n},
 time(b,n=20){draw(b,b*BAR,.02);g.finish();const t0=performance.now();for(let i=0;i<n;i++){draw(b,b*BAR,0);g.readPixels(0,0,1,1,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array(4))}return(performance.now()-t0)/n}};
/*END*/
