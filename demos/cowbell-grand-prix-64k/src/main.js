// COWBELL GRAND PRIX: picture. The audio clock drives everything; one time value b (in bars) goes in,
// and car poses, props, camera, palette, particles and HUD come out.
const D=document,C=D.getElementById("c"),H=D.getElementById("h"),g=C.getContext("webgl2",{antialias:false,alpha:false}),X=H.getContext("2d"),
{sin,cos,min,max,abs,floor,PI,exp,atan2,hypot,random,round}=Math,
BAR=SONG.BAR,AP=100/3,
cl=(x,a=0,b=1)=>min(b,max(a,x)),mix=(a,b,t)=>a+(b-a)*t,
sm=(a,b,x)=>{x=cl((x-a)/(b-a));return x*x*(3-2*x)},
rs=()=>random()*2-1,
// keyed track [bar,value,bar,value...] with smoothstep between keys
K=(a,b)=>{let i=0;while(i<a.length-4&&b>=a[i+2])i+=2;return mix(a[i+1],a[i+3],sm(a[i],a[i+2],b))},
// overshooting pop-in for props
pop=(b,a)=>b<a?0:1+exp(-(b-a)*9)*sin((b-a)*22)*.6-exp(-(b-a)*14),
VS="#version 300 es\nvoid main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}";
if(!g||!g.getExtension("EXT_color_buffer_float"))D.body.innerHTML="<p style=color:#fff>This intro needs WebGL2 with float render targets.";

// ---------- the race, in bars ----------
// pack speed (m/s) -> distance table
const VK=[8,0,9.2,80,24,80,24.4,112,27.5,112,28.5,80,39.6,80,40,30,48,30,48.01,70,55.8,75,56.3,125,61,125,62.5,80,103.6,80,104,16,105,16,105.4,50,106.5,30,108,0],
ST=[0];
for(let i=0;i<8500;i++)ST.push(ST[i]+K(VK,i/64)*BAR/64);
const S=b=>{b=cl(b,0,132)*64;const i=b|0;return mix(ST[i],ST[i+1],b-i)},
ZF=S(104)+2,TU0=S(33)+20,TU1=S(40)+150,RPA=S(80)+80,RPB=S(88)-10,
// item box rows: z, slot mask, golden
BX=[[S(20),15,0],[S(52),2,1],[S(67)-14,15,0],[S(84),15,0]],
// road centre line (mirrors scene.glsl)
TX=z=>cl(z/300-.5)*cl((ZF-z)/350-1)*(55*sin(z*.004+1)+26*sin(z*.011)),
TY=z=>4*sin(z*.007)+.15*(max(z-RPA,0)-max(z-RPB,0)),
// cars: 0 hero (pearl), 1 villain (matte black), 2 gold lowrider, 3 pink monster kei. Offsets ahead of the pack, lateral position.
OF=[[8,-21,12,-34,24,-30,27.5,-3,32,0,38.5,-2,39.8,5,48,0,66,0,67.5,-16,70,-5,72,0,73,0,79,-18,84,-9,88,0,96,2,105.5,2],
[8,0,12,14,24,20,32,24,40,26,56,230,62,55,64,40,72,16,79,50,88,16,96,7,97,12,98,18,99,25,100,30],
[8,-7,12,0,24,4,36,12,40,12,56,190,62,30,64,1,70,1,72,-45,80,-28,84,-15,85.5,-30,100,-30,104,-24,108,-10],
[8,-14,12,-12,28,-12,32,-70,40,-90,56,150,61,14,62,-14,72,-40,80,-36,88,-16,96,-40,100,-45,104,-40,108,-22]],
LA=[[0,2.5,24,2.5,25.5,5,28,5,30,-4,32,0,36,-1,38.5,0,48,0,50,3,52,-2,54,2,56,0,62,0,64,3,66,3,66.4,7.4,67.5,7,69,3,72,0,74,-5,76,5,78,-3,80,0,82,-3,84,2,86,-1,88,0,90,-4,92,5,94,-3,96,0,99.5,2,100.2,6.6,102,6,104,3],
[0,-2.5,12,-2.5,16,0,20,3,24,-3,28,0,32,-2,36,-3,40,0,56,0,64,-4,72,-1,80,2,88,0,90.3,-4,92.3,5,94.3,-3,96,0,98,-3,100,-2],
[0,2.5,14,2.5,18,-1,22,4,26,-2,28,0,32,3,40,2,56,-3,64,-1.5,70,-1.5,71,-5,99.5,-4,100.5,6.5,103,6.5,104,0,108,-6],
[0,-2.5,24,-2.5,25.5,-1,28,-2,29,3,30,-3,31,2,32,-4,56,0,62,0,64,5,96,4,100,5,100.8,6.5,103,6.5,104,-3,108,6]],
SP=[[38.6,0,40,2,40.01,0,66,0,67.2,1,67.21,0,73.2,0,79.2,1,79.21,0],0,[70,0,71.6,2,71.61,0],0],
GLV=[64.5,0,64.7,.9,65.6,.8,65.9,.25,66,1.9,66.15,1.5,66.8,1.6,67.3,0],
DKO=[96,2,97,6,98,11,99,17,100,30],DKS=[96,.3,97,1.5,98,3,99,5,100,7],
// duck and villain after the landing: slide to the finish line by bar 112
SD=b=>b<112?mix(S(100)+30,ZF,(b-100)/12):ZF+52*(1-exp((112-b)*.8)),
GC=[[.1,.9,1],[1,.07,.04],[.7,.2,1],[.5,1,.1]],
// palettes: zenith, horizon, sun colour, sun direction, fog, wet, night, exposure, lamp colour, share of empty city lots
PA=[[.03,.04,.12,.75,.3,.14,1.2,.5,.2,.35,.07,.93,.0012,.7,.35,.6,.9,.95,1.1,.45],
[.004,.006,.02,.09,.035,.12,.25,.3,.45,-.25,.22,.94,.0012,.8,1,.75,1,.85,.6,.4],
[.01,.008,.006,.04,.03,.02,0,0,0,0,1,0,.004,.6,1,.7,1.3,.7,.25,.4],
[.008,.008,.012,.05,.03,.045,0,0,0,0,1,0,.011,1,1,.8,1,.45,.15,.15],
[.015,.02,.03,.06,.07,.09,0,0,0,0,1,0,.004,1,.6,.8,.8,.9,1,.45],
[.45,.47,.52,.55,.56,.6,0,0,0,0,1,0,.05,1,0,.6,.8,.9,1,.8],
[.1,.2,.5,1.3,.65,.3,2.4,1.5,.8,.2,.15,.97,.0007,.5,0,.55,0,0,0,.8],
[.1,.02,.2,.3,.1,.5,.8,.9,1.2,0,.2,.98,0,0,0,.8,0,0,0,.5]],
PK=[0,0,8,0,30,1,33.2,1,33.5,2,40,2,40,7,48,7,48,3,56,3,56,1,80,1,81,4,86.5,4,87.6,5,88,5,88.4,6,200,6],
// camera shots: bar, anchor, target, fixed?, focal, then (ahead, lateral, height) at the start and at the end of the shot,
// then the look-at height. Lateral is relative to the anchor unless it is beyond 10 m (a helicopter outside the barrier).
// A fixed shot stays where the anchor was when the shot began; a "focal" above 5 is then a tracking zoom (distance / focal).
// anchors/targets: 0-3 cars, 4 duck, 5 mirror ball, 6 start lights, 7 black hole, 8 piano, 9 pack centre
SH=[[-1,0,0,0,1.5,-5.5,3,.8,-5.5,-3,1.1],[0,3,3,0,1.4,-1,-4.5,.7,3,-4.5,.9],[2,1,2,0,1.5,9,-1.5,.6,9,5.5,.9],[4,6,6,0,1.2,-10,0,1.2,-7,0,1.5],
[6,0,0,0,1.6,-2.8,2.6,.35,-2.4,2.3,.4],[7,2,2,0,1.5,-24,-2.5,14,-20,-2.5,11],[8,1,1,1,9,45,-7.6,.6],[9,0,0,1,9,60,7.6,.6],
[10,0,0,0,1.5,-5.5,1,1.3,-5,-1,1.2],[11,0,0,0,1.5,6,-1.5,1,5.5,1,1.1],[12,1,1,0,1.5,6,1.5,.9,6,-1.5,1],[14,2,2,0,3,-14,13.5,12,6,13.5,10,0],[15,3,3,0,1.4,-5.5,1,1.3,-5,-1,1.2],[16,1,1,1,9,70,-8.6,.8],
[17,2,2,0,1.3,1,5.5,.8,0,5,.7],[18,0,0,0,1.5,-5.5,-1,1.3,-5,0,1.2],[20,0,0,0,1.5,6,1.5,.9,5.5,-1,1],[22,0,0,0,1.5,-4.5,-3,.7,-4,-2.5,.8],
[24,0,0,0,1.05,-3.8,.5,1.1,-5,0,1.3],[26,3,0,1,9,45,-8.6,1],[27,0,0,0,1.4,6,-1.5,1,5.5,1,1.1],[28,3,3,0,1.4,5,3.5,.9,5,-3.5,1.1,2.2],
[30,3,3,0,1.2,0,-6,1.2,2,-5,1.5,2],[32,0,0,0,1.5,-9,0,4,-7,0,2.5,1],[34,1,1,0,1.5,6,1.5,.9,6,-1.5,1],[36,0,7,0,1.4,-5,-3,1.6,-4,3,1.4],
[38,0,7,0,1.2,-6,0,1.3,-7.5,0,1.2],[40,0,0,0,1.3,0,0,0],[48,0,0,1,8,22,-5,1],[49,0,0,0,1.5,-5.5,1.5,1.3,-5,-1.5,1.2],
[52,0,0,0,1.5,6,-1.5,.9,5.5,1,1],[54,0,0,0,1.3,.5,5.5,1,-.5,5,1.2,1.5],[56,0,0,0,1.1,-5,-1,1.4,-6,1,1.6,1.6],[57,0,0,0,1.4,5.5,-2,1,5,-2.5,1.1],[58,0,0,1,9,75,12,3],
[59,0,0,0,1.2,1,-6.5,1,-1,-6,1.2,2],[60,3,3,0,1.4,6,2,1.2,5,1.5,1.2],[61,0,0,0,1.2,1,-6.5,1,-1,-6,1.2,2],[62,2,2,0,3,-22,-13.5,12,-6,-13.5,10,0],[64,2,2,0,1.3,6.5,2.2,1,6,2.5,1.1,1],[66,0,0,0,1.3,-5.5,-2.5,1.5,-5,-3,1.3],
[67,0,0,0,1.5,6,-2,.9,5.5,-2.5,1],[69,2,2,0,1.1,-14,-2.5,1,-12,-2.5,.9,6],[70,2,2,0,1.3,1,-5.5,1.2,3,-5,1,1.5],[71,0,0,0,1.5,-5.5,1,1.3],
[72,1,1,0,1.4,6,2,1,6,-2,1.1],[74,0,0,0,1.3,1,7,1,-1,7,1.2],[76,0,0,0,1.5,7,0,1.6,6,0,1.3],[78,0,0,0,1.5,-4.5,2.5,1.2,-3.5,2,1],
[80,0,0,0,1.3,-6,0,1.6,-5.5,1.5,1.4],[82,0,0,0,2.8,6,13.5,10,0,13.5,12,0],[84,2,2,0,1.4,6.5,2.5,1,6,3.5,1.1,1.8],[86,0,0,0,1.4,-5.5,0,1.3,-5,0,1.2],
[88,0,0,0,2,-30,-13.5,14,-12,-13.5,10,0],[89,0,0,0,1.4,-5.5,0,1.1,-5,0,1,1.4],[90,1,1,0,1.5,6.5,1,1.9,6,-1,2.1,.7],[91,1,1,0,1.5,-5,-2.5,1.2,-4.5,-2,1,1.3],[92,0,0,0,1.4,-5.5,0,1,-5,0,.9,1.3],[93,0,0,0,1.6,.5,-5.5,.7,-.5,-5,.8],[94,0,0,0,1.5,3,6,.9,4,6,1],
[96,0,4,0,1.3,-5,0,1.6,-6,0,2],[97,4,4,0,2,-10,13.5,10,6,13.5,11],[98.5,1,1,0,1.2,6.5,0,.9,14,0,1.3,2.5],[100,4,4,1,1.3,24,12,3.5],[101,0,0,0,1.4,6,1.5,.9,5.5,-1,1],
[102,0,0,0,1.4,-5.5,0,1.4,-5,0,1.2],[104,0,0,1,1.4,7,-8.3,.6],[106,9,0,0,1.3,-10,0,6,-8,0,4.5],[109,9,4,1,1.5,25,-12,4],
[112,4,4,1,1.3,18,-12,3.5],[116,9,0,0,1.5,-30,0,10,-60,0,45],[120,9,0,0,1.4,-60,0,45,-90,10,70],[999]],
// item roulette faces; the last four are where each spin lands
EMO=["🧊","🌀","🥊","🪩","🚀","🧲","🎹","🦆"],
USE=[24,55,69,96];

// ---------- cars ----------
const mm=(a,b)=>{const r=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[j+3]+a[i*3+2]*b[j+6];return r},
ry=a=>[cos(a),0,sin(a),0,1,0,-sin(a),0,cos(a)],
rx=a=>[1,0,0,0,cos(a),-sin(a),0,sin(a),cos(a)],
rz=a=>[cos(a),-sin(a),0,sin(a),cos(a),0,0,0,1];
let KE=0,BE=0;   // kick and cowbell envelopes
// where car i is at bar b: [x,y,z,lateral]
function P(i,b){
 let s=S(b)+K(OF[i],b),l=K(LA[i],b),h=0,bt=b*4,k;
 if(i==0){
  if(b>39.3&&b<40)h=1.5*sm(39.3,40,b);
  if(b>=40&&b<48)return[sin(b*2)*.5,cos(b*1.7)*.4,0,0];
  if(b>=48&&b<48.3)h=14*(1-(b-48)/.3)**2;
  if(b>66&&b<66.6)h=.7*sin(PI*(b-66)/.6);
  if(b>105.5){k=sm(105.5,106.5,b);const a=(b-105.5)*5;s=mix(s,S(b)+6+5*sin(a),k);l=mix(l,5*cos(a),k)}
 }
 if(i==1&&b>=100)s=SD(b),l=-2;
 if(i==2)h=(b<8?.3:b<70?.1:0)*KE;
 if(i==3){
  if(b>=28)h=(b<32?.5:.15)*abs(sin(PI*bt));
  if(b>61&&b<62)h+=4.5*sin(PI*(b-61));
 }
 if(i&&b>=40&&b<56)return[0,-999,0,0];
 return[TX(s)+l,TY(s)+h,s,l]}
// full pose: position, rotation matrix (world from local), scale, drift
function pose(i,b){
 const p=P(i,b),q=P(i,b+.012),r=P(i,b+.024),bt=b*4;
 let dx=q[0]-p[0],dz=q[2]-p[2],hd=atan2(TX(p[2]+1)-TX(p[2]),1),h2=hd,dr,sp=SP[i]?K(SP[i],b):0,sc=[1,1,1],pit=-atan2(TY(p[2]+1)-TY(p[2]),1),rol=0,k;
 if(hypot(dx,dz)>.02){hd=atan2(dx,dz);h2=atan2(r[0]-q[0],r[2]-q[2])}
 dr=h2-hd;dr-=round(dr/6.283)*6.283;dr=cl(dr/.012*1.4,-.75,.75);
 if(i==0){
  if(b>39.3&&b<40){k=sm(39.3,40,b);sc=[1-.45*k,1-.45*k,1+1.4*k]}
  if(b>=40&&b<48){k=1-sm(46,47.8,b);return{p,m:mm(mm(ry(b*2.1*k),rx(b*1.3*k)),rz(b*.7*k)),sc,dr:0,hd:0}}
  if(b>105.5)dr+=.5*sm(105.5,106.5,b);
 }
 if(i==1&&b>=100)sc=[1.25,.12,1.2],dr=0;
 if(i==2&&b>=70)sc=[1.1,mix(.45,.7,sm(70.05,70.6,b)),1];
 if(i==3){
  if(b>=28&&b<32)sp=(floor(bt)+sm(0,.6,bt%1))/4;
  if(b>61&&b<62)sp=b-61,pit=(b-61)*6.283;
 }
 return{p,m:mm(mm(ry(hd+dr+sp*6.283),rx(pit)),rz(-dr*.15)),sc,dr,hd}}
let CP=[],cb=-9;   // poses of the current frame
// local point of car i -> world
const wl=(i,x,y,z)=>{const c=CP[i],m=c.m;x*=c.sc[0];y*=c.sc[1];z*=c.sc[2];return[c.p[0]+m[0]*x+m[1]*y+m[2]*z,c.p[1]+m[3]*x+m[4]*y+m[5]*z,c.p[2]+m[6]*x+m[7]*y+m[8]*z]},
// props that the camera can anchor to or look at
duck=b=>{
 if(b>=100){const s=SD(b);return[TX(s)-2,TY(s)+.25,s,7,1+.25*exp((100-b)*3)*cos((b-100)*20)+(b>112?.2*exp((112-b)*4)*cos((b-112)*25):0)]}
 const u=b%1,s=S(b)+K(DKO,b),i=floor(b)-96,e=min(u,1-u);
 return[TX(s)+mix(K(LA[0],96),-2,cl((b-96)/4)),TY(s)+4*(5+i*2)*u*(1-u)+(i?0:1.6*(1-u)),s,K(DKS,b),mix(.6,1.15,sm(0,.2,e))]},
hole=b=>{const s=S(b)+mix(26,5,sm(36,37.5,b));return b<48?[TX(s)+mix(K(LA[1],36),0,sm(36,37.5,b)),TY(s)+1.6+4*sin(PI*cl((b-36)/1.5)),s,b<36||b>=40?0:mix(.3,2.3,sm(36,40,b))*(1+.12*KE)]
 :[TX(S(48)),TY(S(48))+15,S(48),2.6*(1-sm(48,49.6,b))]},
piano=b=>{const c=P(2,b),u=cl(b-69);return[c[0],c[1]+(b<70?2.7+40*(1-u*u):1.9),c[2],b<69?0:1.5,b<70?(1-u)*5+.25:.25]},
ball=b=>{const p=P(3,b),q=P(2,b),k=sm(28,28.6,b);return[mix(q[0],p[0],k),mix(q[1]+2,p[1]+5,k)+3*sin(PI*k),mix(q[2],p[2],k),b<28||b>=40&&b<56?0:1.3]},
TG=(i,b)=>i<4?P(i,b):i==4?duck(b):i==5?ball(b):i==6?[0,9,12,0]:i==7?hole(b):i==8?piano(b):[TX(S(b)+6),TY(S(b)+6),S(b)+6,0];

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
u=new Float32Array(160),um=new Float32Array(36),
fbo=()=>({f:g.createFramebuffer(),t:g.createTexture()}),
FB=[0,1,2,3,4,5].map(fbo),
ib=g.createBuffer(),idat=new Float32Array(32e3);
g.bindBuffer(g.ARRAY_BUFFER,ib);
g.bufferData(g.ARRAY_BUFFER,idat.byteLength,g.DYNAMIC_DRAW);
for(let i=0;i<2;i++)g.enableVertexAttribArray(i),g.vertexAttribPointer(i,4,g.FLOAT,false,32,i*16),g.vertexAttribDivisor(i,1);
let W=0,Hh=0,sw=0,sh=0,qual=1;
// (re)allocate the render targets: scene, particles, then the bloom chain
function size(){
 // 2.2:1 letterbox; the scene is raymarched at ~310k pixels and upscaled by the post pass
 const iw=innerWidth,ih=innerHeight,cw=min(iw,ih*2.2),ch=cw/2.2,d=min(devicePixelRatio,1.5),e=min(d,1080/ch);
 [C,H].map(c=>c.style.cssText=`left:${(iw-cw)/2}px;top:${(ih-ch)/2}px;width:${cw}px;height:${ch}px`);
 H.width=cw*d;H.height=ch*d;
 W=C.width=cw*e|0;Hh=C.height=ch*e|0;
 sh=min(Hh,320*qual**.5)|0;sw=sh*2.2|0;
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
let PT=[],boxm=[],lastb=-9,flash=0,wp=[];
// n particles at (x,y,z)+-sp with velocity v+-vs: life, size, growth, colour, alpha (see part.glsl), gravity, drag
function emit(n,[x,y,z],sp,[vx,vy,vz],vs,life,size,grow,[r,gr,bl],a,grav,drag){
 for(;n-->0;)PT.length<3900&&PT.push([x+rs()*sp,y+rs()*sp,z+rs()*sp,vx+rs()*vs,vy+rs()*vs,vz+rs()*vs,0,life*(.6+.8*random()),size*(.7+.6*random()),grow,r,gr,bl,a,grav,drag])}
const up=(v,k)=>[v[0],v[1]+k,v[2]];
function sim(b,dt,pal){
 const once=x=>lastb<x&&b>=x,vel=K(VK,b),fw=[0,0,vel],
 smoke=[pal[3]*.5+pal[0]+pal[6]*.2+.1,pal[4]*.5+pal[1]+pal[7]*.2+.1,pal[5]*.5+pal[2]+pal[8]*.2+.1];
 if(b<lastb||b>lastb+1)PT=[],boxm=BX.map(x=>x[1]),wp=[];
 for(let i=0;i<4;i++){
  const c=CP[i],gc=GC[i],sc=smoke.map((x,k)=>x*.7+gc[k]*.25);
  if(c.p[1]<-99)continue;
  // tyre smoke: wheelspin off the line, drifts, donuts, spins
  let a=abs(c.dr)>.25?abs(c.dr)*2:0;
  if(b>7&&b<(i?9.5:11.5))a=1.2;
  if(i==0&&b>105.5)a=2;
  if(i==1&&b>=100)a=0;
  for(let k=-1;k<2;k+=2){
   const w=wl(i,k*.9,.15,-1.4),o=wp[i*4+k]||w;
   wp[i*4+k]=w;
   if(a>0)for(let n=0;n<2;n++)emit(1,w.map((x,j)=>mix(o[j],x,n/2)),.2,[rs(),1.5,rs()],.7,1.1*min(a,1.3),.45,2.8,sc,.3*min(a,1),-.3,1.5);
   if(pal[13]>.9&&vel>40)emit(1,w,.2,[rs()*2,3,vel*.7],2,.35,.07,0,[.4,.5,.7],0,10,1);
  }
  // tail lights leave trails in the dark
  if(pal[14]>.3&&vel>30&&!(i==1&&b>=100))for(let k=-1;k<2;k+=2){const w=wl(i,k*.7,.66+(i>2)*.5,-2.3),o=wp[i*4+k+9]||w;wp[i*4+k+9]=w;for(let n=0;n<3;n++)emit(1,w.map((x,j)=>mix(o[j],x,n/3)),0,[0,0,0],0,.2,.17,0,[2.5,.12,.05],0,0,0)}
  if(i==2&&b>84&&b<96)emit(1,wl(2,rs(),1.2,rs()*2),.3,up(fw,2),1,1.2,.5,3,[.02,.02,.02],.45,-.6,1.2);
  // backfire on the kick
  if(i==1&&b>8&&b<100&&KE>.8)emit(1,wl(1,rs()>0?1.05:-1.05,.3,-.8),.1,up(fw,1),3,.25,.3,1,[3,.8,.1],0,0,2),emit(1,wl(1,0,.5,-2.4),.3,up(fw,2),1,.9,.5,3,[.01,.01,.01],.6,-.5,1.5);
 }
 // rings: bass out of the pink car's speaker stack, pulses off the magnet
 if(KE>.9&&b>8&&CP[3].p[1]>-99)emit(1,wl(3,0,2.4,-.1),0,fw,0,.45,.4,5,[.5,1,.1],1.5,0,0);
 if(b>56&&b<62&&KE>.9)emit(1,wl(0,0,2.2,.8),0,fw,0,.4,.5,9,[1,.3,1],1.8,0,0);
 // nitro: sparks behind the rocket
 if(b>24&&b<27.6)emit(3,wl(0,0,1.6,-2.5),.2,[0,0,vel-30],8,.5,.12,0,[1,2,6],0,6,1);
 if(once(24)||once(55.5))emit(40,wl(0,0,1.5,0),.5,up(fw,3),6,.6,.4,2,[1,1,1],.4,0,2);
 // item boxes burst when a car takes them
 BX.map(([z,m,gold],r)=>{for(let i=0;i<4;i++){const c=CP[i].p,j=cl(round((c[3]+6)/4),0,3);
  if(c[2]>z&&c[2]<z+12&&boxm[r]>>j&1){boxm[r]&=~(1<<j);emit(60,[TX(z)+j*4-6,TY(z)+1.3,z],.6,up(fw,3),9,.7,.14,0,gold?[5,3,.4]:[4*random(),4*random(),4*random()],0,9,1)}}});
 // steam rises off the undercity street
 if(b>=48&&b<56)emit(1,[TX(fw[2]=S(b)+90*random())+rs()*9,TY(fw[2]),fw[2]],.5,[0,2.5,0],.6,2.2,1.2,2.5,smoke,.25,-.5,.4),fw[2]=vel;
 // rags of cloud blow past on the climb through the storm
 if(b>82&&b<88&&random()<.35)emit(1,[TX(fw[2]=S(b)+60+150*random())+rs()*14,TY(fw[2])+3+rs()*4,fw[2]],2,[0,0,0],2,1.5,5,3,smoke,.22,0,0),fw[2]=vel;
 // black hole feeds on smoke
 const hl=hole(b);
 if(hl[3]>0&&b<40)emit(2,up(hl,0),4,up(fw,0),1,.5,.1,0,[2,.8,3],0,0,0);
 // splash landing in the undercity
 if(once(48.28))emit(120,P(0,48.3),1.5,up(fw,5),8,.9,.16,0,[.6,.8,1.2],0,14,.5),flash=.9;
 // magnet sparks
 if(b>56&&b<62)emit(2,wl(0,0,2.1,.5),.3,up(fw,2),5,.3,.1,0,[5,1,4],0,6,1);
 // glove lands: sparks along the barrier
 if(b>66.3&&b<67.4)emit(4,wl(0,1,.5,rs()*2),.1,[-4,3,vel-20],6,.5,.07,0,[6,3,.8],0,12,.5);
 if(once(66))emit(30,wl(0,-1,.8,0),.4,up(fw,3),7,.5,.3,0,[5,4,3],0,6,2);
 // piano lands: keys and splinters
 if(once(70)){const c=piano(70);emit(90,c,1.2,up(fw,7),9,1.6,.16,0,[2,2,2],3,12,.4);emit(60,c,1.2,up(fw,6),9,1.6,.13,0,[.02,.02,.02],3,12,.4);emit(30,c,1.5,up(fw,2),5,1.2,1.2,4,smoke,.5,0,1.5);flash=.5}
 // freeze ray snow, then the ice blows apart
 if(b>72.5&&b<79.5)emit(1,wl(0,rs()*1.5,1+rs(),rs()*2.5),.3,up(fw,0),1.5,.9,.06,0,[2,3,4],0,2,1);
 if(once(80))emit(200,wl(0,0,.9,0),1.6,up(fw,4),12,1.3,.2,0,[.5,.85,1.1],2.7,10,.4),flash=.7;
 // duck: feathers on each bounce
 for(let k=97;k<101;k++)if(once(k)){const d=duck(k);emit(k>99?160:50,up(d,d[3]*.4),d[3]*.7,up(fw,5),4+d[3],1.6,.1+d[3]*.03,0,[1,.75,.05],3,5,1);emit(30,d,d[3],up(fw,1),6,1.4,1.5,5,smoke,.4,0,1.2);emit(2,up(d,1),0,fw,0,.6,d[3],30,[1,.8,.2],1.7,0,0);if(k>99)flash=.6}
 // finish: confetti cannons at the gantry, fireworks over the cloud sea
 if(once(104))flash=.5;
 if(b>103.9&&b<110)for(let k=-1;k<2;k+=2)emit(7,[k*9,TY(ZF)+1,ZF+4],.3,[-k*6,13,6],5,3,.16,0,[random()*1.5,random()*1.5,random()*1.5],3,7,1.2);
 if(b>104&&b<127&&PT.length<3700&&once(floor(b*2)/2)){const c=[rs()*90,TY(ZF)+40+random()*50,S(b)+140+rs()*80],h=[3+3*random(),3*random()+1,3*random()+.5];
  for(let n=0;n<110;n++){const a=rs()*PI,e=rs()*PI,v=22+rs()*3;PT.push([...c,v*cos(a)*cos(e),v*sin(e),v*sin(a)*cos(e),0,1.6+random()*.6,.9,0,...h,0,6,1.1])}}
 // integrate
 let n=0;
 PT=PT.filter(p=>{
  const k=1-p[15]*dt,q=p[6]/p[7];
  p[3]*=k;p[4]=p[4]*k-p[14]*dt;p[5]*=k;
  if(hl[3]>0&&b<40&&p[13]<1)for(let j=0;j<3;j++)p[3+j]+=(hl[j]-p[j])*dt*30;
  for(let j=0;j<3;j++)p[j]+=p[3+j]*dt;
  if(p[14]>0&&p[1]<TY(p[2])+.05&&abs(p[0]-TX(p[2]))<9)p[1]=TY(p[2])+.05,p[4]*=-.4;
  p[6]+=dt;p[8]+=p[9]*dt;
  const a=p[13],f=a>2?1:a>1?1-q:a?min(1,q*6)*(1-q):1-q*q;
  n<4e3&&idat.set([p[0],p[1],p[2],p[8],p[10]*(a?1:f),p[11]*(a?1:f),p[12]*(a?1:f),a>2?a:a>1?1+(a-1)*f:a*f],n++*8);
  return p[6]<p[7]});
 lastb=b;flash*=exp(-dt*5);
 return n}

// ---------- one frame of state: fills the uniform table, returns the particle count ----------
let shot=0,rank=4,rankT=0,lsh=-1,flip=1,cut=0,rkUp=0;
function state(b,t,dt){
 const bb=max(b,0),bar=floor(bb),bt=bb*4,Q=BAR/16,st=floor(bb*16+.02),
 // envelopes from the song's own patterns
 ev=(key,dec)=>{for(let n=0;n<32;n++){const i=st-n;if(i<0)break;if(SONG.plan(i>>4)[key][i&15]>".")return exp(-(bb*16-i)*Q*dec)}return 0};
 KE=b<0?0:ev("k",7);BE=b<0?0:ev("r",9);
 CP=[0,1,2,3].map(i=>pose(i,bb));
 // palette
 let i=0;while(bb>=PK[i+2])i+=2;
 const k=sm(PK[i],PK[i+2],bb),pal=PA[PK[i+1]].map((x,j)=>mix(x,PA[PK[i+3]][j],k)),
 zone=bb>=40&&bb<48?2:bb>=48&&bb<56?3:0,
 sl=hypot(pal[9],pal[10],pal[11]);
 // camera
 while(b>=SH[shot+1][0])shot++;
 while(shot&&b<SH[shot][0])shot--;
 const s=SH[shot],sb=max(s[0],0),un=cl((b-s[0])/(SH[shot+1][0]-s[0])),
 an=TG(s[1],s[3]?sb:bb),tg=TG(s[2],bb),
 sc=s[3]?(round((an[2]+s[5])/AP-.5)+.5)*AP:an[2]+mix(s[5],s[8]??s[5],un),
 dl=mix(s[6],s[9]??s[6],un),la=an[0]-TX(an[2]),
 nit=sm(24,24.3,bb)-sm(27.3,28,bb)+sm(56,56.4,bb)-sm(61,62,bb);
 // which side of the anchor the camera rides on is decided once per shot
 if(shot!=lsh)lsh=shot,cut=t,flip=abs(la+dl)>8.4?-1:1;
 let ro=[TX(sc)+(s[3]||abs(dl)>10?dl:cl(la+dl*flip,-8.4,8.4)),TY(sc)+mix(s[7],s[10]??s[7],un),sc],
 ta=[tg[0],tg[1]+(s[11]??(s[2]<4?s[5]<0?2:1.2:s[2]==4?tg[3]:0)),tg[2]],foc=s[4]*(1-.22*nit),roll=0;
 if(s[3]&&s[4]>5)foc=cl(hypot(ta[0]-ro[0],ta[2]-ro[2])/s[4],1,5);
 if(zone==2){const a=(bb-40)*.9+1,r=mix(7,4.5,sm(40,47.5,bb));ro=[tg[0]+r*sin(a),tg[1]+2+sin(bb),tg[2]-r*cos(a)];roll=sin(bb*.8)*.3}
 if(s[1]==s[2]&&s[1]<4&&!s[3]&&zone!=2&&abs(s[5])>3){const ld=s[5]<0?5:-3;ta[0]+=TX(ta[2]+ld)-TX(ta[2]);ta[2]+=ld}
 const fls=[80,82.5,84,85.25,86.5].reduce((a,x)=>max(a,bb>=x?exp((x-bb)*9)*(.6+.4*sin(t*50)):0),0),
 shk=(KE*.03+nit*.05+fls*.12)*(s[3]?.3:1),hh=s[3]||zone==2?0:.06;
 ro[0]+=shk*sin(t*71)+hh*(sin(t*1.3)+sin(t*2.9));ro[1]+=shk*sin(t*83)+hh*(sin(t*1.7)+sin(t*3.7))*.6;
 foc*=1-.025*KE;
 // ---- uniform table ----
 u.fill(0);
 u.set([sw,sh,t,bb,...ro,foc,...ta,roll+CP[0].dr*(s[1]==0&&!s[3]&&zone!=2?.08:0),
  zone,pal[13],zone==3?.7:bb>=80&&bb<87.6?1:0,pal[14],
  pal[9]/sl,pal[10]/sl,pal[11]/sl,fls,
  pal[0],pal[1],pal[2],pal[12],pal[3],pal[4],pal[5],bb>=87.6?TY(RPB)-35:-1e4,pal[6],pal[7],pal[8],KE]);
 // item box row ahead
 BX.map(([z],r)=>{if(z>S(bb)-60&&z<S(bb)+700&&(r!=1||zone==3))u.set([z,boxm[r]??15,BX[r][2],0],32)});
 u.set(ball(bb),36);
 u.set([K(GLV,bb),1],40);
 const pn=piano(bb),dk=duck(bb),hl=hole(bb);
 u.set([pn[0],pn[1],pn[2],pn[3],pn[4],.1],44);
 if(bb>=96)u.set([dk[0],dk[1],dk[2],dk[3],dk[4],sin(bb*3)*.15],52);
 // a premonition drifts past inside the black hole
 if(bb>43&&bb<47)u.set([9*sin(bb*.7),(bb-45)*3,10*cos(bb*.7),1.2,1,bb*2],52);
 u.set([sm(72.6,73,bb)*(bb<80),sm(78,80,bb)],60);
 // beam: 1 magnet (target pink), 2 freeze ray
 if(bb>=56&&bb<62)u.set([...up(CP[3].p,1),1],64);
 if(bb>72.5&&bb<73.1)u[67]=2;
 if(bb>=84&&bb<84.3)u.set([pn[0]+30,pn[1]+260,pn[2]+60,3],64);
 u.set([bb<27.6?pop(bb,24):1-sm(27.6,28,bb),bb<62?pop(bb,55):1-sm(62,62.4,bb),pal[19],0,TU0,TU1,RPA,RPB,ZF,bb<4?0:bb<8?min(bar-3,3):bb<10?4:0,BE],68);
 u[68]=max(u[68],0);u[69]=max(u[69],0);
 for(let i=0;i<4;i++){
  const c=CP[i],m=c.m;
  u.set([c.p[0],c.p[1],c.p[2],min(...c.sc)],80+i*4);
  // flame, (spare), wheel angle, bounding radius
  u.set([i==0?(bb>24&&bb<27.6?1:bb>78.5&&bb<80?.8:bb>=8?.25*KE:0):i==1&&bb<100?KE*.8:0,0,c.p[2]*2.7+(bb>7&&bb<11.5?(bb-7)*30:0),c.p[1]<-99?0:i==2?3.6+u[40]:3.6*max(...c.sc)],96+i*4);
  for(let a=0;a<3;a++)for(let k=0;k<3;k++)um[i*9+a*3+k]=m[a*3+k]/c.sc[k];
 }
 u.set([pal[16]*(.7+.6*KE),pal[17]*(.7+.6*KE),pal[18]*(.7+.6*KE),sm(46,48,bb)],112);
 u.set(hl,116);
 u[128]=S(bb)+140+(bb-96)*10;u[130]=sm(84,84.15,bb);u[129]=bb<12?-1e4:S(bb)+450-900*(bb/4%1);
 // shock ring from the latest impact
 [[24,0],[48.28,0],[66,0],[70,2],[80,0],[97,4],[98,4],[99,4],[100,4],[112,4]].map(([x,o])=>{if(bb>=x&&bb<x+.6)u.set([...TG(o,x)].slice(0,3).concat((bb-x)*BAR*50+.01),120)});
 // post: blur, exposure, fade, flash
 u.set([.015+K(VK,bb)*.0005+nit*.2+.3*exp(min(0,cut-t)*14)*(bb>0),pal[15],b<0?.75:min(sm(0,.3,bb)*.25+.75,(128.4-bb)/2)*(bb<40?1-sm(39.7,40,bb):sm(40,40.6,bb)),flash+(bb>=8?exp((8-bb)*6)*.3:0)+(bb<48?sm(47.5,48,bb):exp((48-bb)*5))],124);
 // rank
 const r=1+CP.filter((c,i)=>i&&c.p[2]>CP[0].p[2]&&c.p[1]>-99).length+(zone?3:0);
 if(r!=rank)rkUp=r<rank,rank=min(r,4),rankT=t;
 return sim(bb,dt,pal)}

// ---------- HUD ----------
const FN='Impact,"Arial Black","DejaVu Sans",sans-serif',EF='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function txt(s,x,y,px,col,al="left",f=FN,it="italic 900 "){
 X.font=it+px+"px "+f;X.textAlign=al;X.lineJoin="round";
 X.lineWidth=px*.16;X.strokeStyle="#000d";X.strokeText(s,x,y);
 X.fillStyle=col;X.fillText(s,x,y)}
// the cowbell: handle, flared body, clapper, swinging about its handle
function bell(x,y,s,a){
 X.save();X.translate(x,y);X.rotate(a);X.lineWidth=s*.09;X.lineJoin="round";X.strokeStyle="#000";X.fillStyle="#ffd23a";
 X.beginPath();X.arc(0,s*.05,s*.16,3.14,0);X.stroke();
 X.beginPath();X.moveTo(-s*.22,s*.05);X.lineTo(s*.22,s*.05);X.lineTo(s*.36,s*.8);X.lineTo(-s*.36,s*.8);X.closePath();X.fill();X.stroke();
 X.fillStyle="#000";X.beginPath();X.arc(s*.1*Math.sin(a*6),s*.86,s*.07,0,7);X.fill();
 X.restore()}
function hud(b,t){
 const w=H.width,h=H.height,un=h/100,bb=max(b,0);
 X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,w,h);
 if(bb>=40&&bb<48)X.translate(rs()*un*.6,rs()*un*.6);
 if(b<0){
  bell(w/2-un*52,h*.14,un*20,sin(t*2)*.3);bell(w/2+un*52,h*.14,un*20,-sin(t*2)*.3);
  txt("COWBELL",w/2,h*.36,un*17,"#fff","center");
  txt("GRAND PRIX",w/2,h*.36+un*13,un*11.5,"#ffd23a","center");
  txt("a 64k intro  ·  drift phonk  ·  four cars, one duck",w/2,h*.36+un*20,un*3,"#fffb","center",FN,"600 ");
  txt("[ click ]  to start your engines     ·     f  fullscreen",w/2,h*.86,un*3.2,"#fffc","center",FN,"600 ");
  return}
 if(bb<120){
  // position
  const pk=1+.5*exp(min(0,rankT-t)*6),z=bb>=40&&bb<48;
  txt(z?"?":rank,un*5,un*17,un*15*pk,rank<2&&!z?"#ffd23a":"#fff");
  txt(z?"":["ST","ND","RD","TH"][rank-1],un*(z?5:5+7.2*pk),un*17,un*5.5,"#fff");
  if(t-rankT<1.6&&bb>9&&!z)txt(rkUp?"▲":"▼",un*6,un*25,un*6,rkUp?"#5f6":"#f44","left","sans-serif","");
  txt(z?"??? km/h":(K(VK,bb)*3.6+(bb>8?sin(t*9)*3:0)|0)+" km/h",w-un*5,h-un*6,un*4.5,"#fff","right");
  // gap strip: the four cars along the road, hero in the middle
  if(!z){X.fillStyle="#0007";X.fillRect(w*.3,h-un*5,w*.4,un*.8);
   CP.map((c,i)=>{const dx=cl((c.p[2]-CP[0].p[2])/150,-1,1);if(c.p[1]>-99){X.fillStyle="#"+["7ef","f33","fc3","f6c"][i];X.beginPath();X.arc(w*(.5+dx*.2),h-un*4.6,un*(i?1.1:1.5),0,7);X.fill()}})}
  // item box: spins from the first tick to the landing, holds until used
  SONG.RO.map(([a,e],i)=>{
   if(bb>=a&&bb<USE[i]){
    const land=bb>=e,sz=un*11*(land?1+.4*exp((e-bb)*8):1),x=w/2,y=un*10;
    X.fillStyle="#0009";X.strokeStyle=land?"#ffd23a":"#fff";X.lineWidth=un*.6;
    X.beginPath();X.roundRect(x-sz/2,y-sz/2,sz,sz,un*1.6);X.fill();X.stroke();
    txt(land?EMO[4+i]:EMO[floor(bb*(i>2&&bb>85.5?bb>86.25?8:16:32))%8],x,y+sz*.24,sz*.66,"#fff","center",EF,"")}
   const k=(bb-USE[i])*4;
   if(k>0&&k<1){X.strokeStyle="#fff";X.globalAlpha=1-k;X.lineWidth=un*2*(1-k);X.strokeRect(w/2-un*(5+k*9),un*(5-k*9),un*(10+k*18),un*(10+k*18));X.globalAlpha=1}});
  // the grid: a name plate for whoever the camera is on
  [[0,2,"BUBBLEGUM",3],[2,4,"EL DORADO  ·  VANTA",2],[6,7,"PEARL",0]].map(([a,e,s,i])=>{if(bb>=a&&bb<e){X.globalAlpha=sm(a,a+.3,bb)*(1-sm(e-.3,e,bb));txt(s,un*6,h-un*12,un*7,"#"+["7ef","f33","fc3","f6c"][i]);X.globalAlpha=1}});
  if(bb>=4&&bb<7)txt(7-floor(bb),w/2,h*.6,un*36*(1.25-bb%1*.25),"#f53","center");
  const ck=max(0,min(bb,104)-8)*BAR;
  txt("LAP 3/3",w-un*5,un*8,un*3.6,"#fffc","right");
  txt((ck/60|0)+":"+(ck%60).toFixed(2).padStart(5,0),w-un*5,un*13.5,un*4.5,bb<104?"#fff":"#ffd23a","right");
  // comic-book lettering on the big hits
  [[66,"POW!","#ff3b3b"],[70,"CRASH!","#fff"],[72.6,"FREEZE!","#7df"],[84,"ZAP!","#ff6"],[100,"SQUEAK!","#ffd23a"]].map(([x,s,c],i)=>{
   if(bb>=x&&bb<x+.6){X.save();X.translate(w*(.3+i%2*.4),h*.34);X.rotate(i%2*.3-.15);txt(s,0,0,un*17*(1+.5*exp((x-bb)*14)),c,"center");X.restore()}});
  if(bb>=8&&bb<9.5)txt("GO!",w/2,h*.5,un*30*(1+.3*exp((8-bb)*9)),"#5f6","center");
  if(bb>=88&&bb<91&&bt(bb))txt("FINAL LAP",w/2,h*.3,un*10,"#ffd23a","center");
  if(bb>=104&&bb<108)txt("FINISH!",w/2,h*.5,un*22*(1+.3*exp((104-bb)*9)),"#ffd23a","center");
 }else{
  const a=sm(120,121,bb);
  X.globalAlpha=a;
  txt("COWBELL GRAND PRIX",w/2,h*.2,un*9,"#ffd23a","center");bell(w/2,h*.62,un*14,sin(t*3)*.4*exp((124-bb)*.5));
  ["1ST  PEARL  2:40.00","2ND  EL DORADO  🎹  +1.42","3RD  BUBBLEGUM  🪩  +2.07","4TH  VANTA  🦆  +13.33"].map((s,i)=>bb>121+i*.5&&txt(s,w/2,h*.36+i*un*8,un*5.5,i?"#fff":"#ffd23a","center",FN+","+EF));
  if(bb>124)txt("a 64k intro  ·  drift phonk at 144 bpm  ·  no ducks were harmed",w/2,h*.9,un*2.6,"#fffb","center",FN,"600 ");
  X.globalAlpha=1}}
const bt=b=>b*4%1<.6;

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
 bl(FB[0],FB[2],1,0,1.6);bl(FB[2],FB[3],0,1,0);bl(FB[3],FB[4],1.5,0,0);bl(FB[4],FB[3],0,1.5,0);bl(FB[3],FB[5],3,0,0);
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
 actx.resume();song=SONG.live(actx);cut=rankT=-9}
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
  return{pc:pc.join("/"),mean:+(s/W/Hh).toFixed(3),black:+(blk/W/Hh).toFixed(3),white:+(wht/W/Hh).toFixed(3),rgb:rgb.map(x=>+(x/W/Hh/255).toFixed(2)),parts:PT.length,rank,out}},
 pose,P,S,TG,hole,duck,SH,ZF,TX,TY,
 // start playback at bar b; report the frame pacing since the last call
 play(b){song&&song.stop();actx.resume();song=SONG.live(actx,b*BAR);window.__dt=[]},
 pace(){const d=window.__dt.slice().sort((a,b)=>a-b),n=d.length;window.__dt=[];return{n,med:+(d[n>>1]*1e3).toFixed(1),p90:+(d[n*.9|0]*1e3).toFixed(1),qual:+qual.toFixed(2),res:sw+"x"+sh,bar:+((actx.currentTime-song.base)/BAR).toFixed(1)}},
 // draw the whole timeline in coarse steps; any exception or GL error surfaces here
 scan(){let n=0,bad=[];for(let b=-1;b<131;b+=.137){draw(b,max(b,0)*BAR,.03);hud(b,b*BAR);const e=g.getError();if(e)bad.push(b.toFixed(2)+':'+e);if(u.some(x=>x!=x))bad.push(b.toFixed(2)+':NaN uniform');n++}return n+' frames, problems: '+(bad.join(' ')||'none')},
 // bars where the camera comes inside (or within a margin of) a car, the duck or the piano
 clear(){const bad=[];for(let b=-1;b<128;b+=.02){state(b,b*BAR,.02*BAR);const ro=[u[4],u[5],u[6]];
  for(let i=0;i<4;i++){const c=CP[i],m=c.m,d=[0,1,2].map(k=>ro[k]-c.p[k]),l=[0,1,2].map(k=>(m[k]*d[0]+m[3+k]*d[1]+m[6+k]*d[2])/c.sc[k]);
   if(abs(l[0])<1.5&&l[1]>-.3&&l[1]<2.2&&abs(l[2])<3)bad.push(b.toFixed(2)+":car"+i)}
  const dk=duck(b),pn=piano(b);
  if(b>=96&&hypot(ro[0]-dk[0],ro[1]-dk[1]-dk[3],ro[2]-dk[2])<dk[3]*1.5)bad.push(b.toFixed(2)+":duck");
  if(pn[3]&&hypot(ro[0]-pn[0],ro[1]-pn[1],ro[2]-pn[2])<3.5)bad.push(b.toFixed(2)+":piano");
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=CP[i].p,c=CP[j].p;if(a[1]>-99&&c[1]>-99&&abs(a[2]-c[2])<4.7&&abs(a[3]-c[3])<2&&abs(a[1]-c[1])<1.5&&!(b>=40&&b<48))bad.push(b.toFixed(2)+":hit"+i+j)}
  const la=ro[0]-TX(ro[2]),h=ro[1]-TY(ro[2]);
  if(b>=40&&b<48)continue;
  if(!(b>=48&&b<56)&&abs((ro[2]+AP*8)%(AP*16)-AP*8)<2&&(abs(la)>15.6||h>28))bad.push(b.toFixed(2)+":gate");
  if(h<.25||(abs(la)>8.7&&abs(la)<11.2&&h<9)||(abs(la)<11.2&&h>7.2&&h<8.8&&abs((ro[2]+AP/2)%AP-AP/2)<1.5))bad.push(b.toFixed(2)+":road"+la.toFixed(1)+","+h.toFixed(1))}
  return bad.join(" ")},
 // linear scene colour and depth at normalised screen points
 pix(b,pts){this.go(b,2,2);g.bindFramebuffer(g.FRAMEBUFFER,FB[0].f);return pts.map(([x,y])=>{const px=new Float32Array(4);g.readPixels(x*sw|0,y*sh|0,1,1,g.RGBA,g.FLOAT,px);return x+","+y+": "+[...px].map(v=>+v.toFixed(3)).join(" ")}).join("\n")},
 u,
 // linear means of the scene, particle and bloom buffers, plus the scene's median and 99th percentile luminance
 lin(b){this.go(b,2,2);return[0,1,3,5].map(k=>{const o=FB[k],px=new Float32Array(o.w*o.h*4);g.bindFramebuffer(g.FRAMEBUFFER,o.f);g.readPixels(0,0,o.w,o.h,g.RGBA,g.FLOAT,px);
  const a=[0,0,0],l=[];for(let i=0;i<o.w*o.h;i++){for(let j=0;j<3;j++)a[j]+=px[i*4+j]/o.w/o.h;l.push(px[i*4]*.3+px[i*4+1]*.59+px[i*4+2]*.11)}
  l.sort((x,y)=>x-y);return a.map(x=>+x.toFixed(3)).join(",")+(k?"":" med "+l[l.length>>1].toFixed(3)+" p99 "+l[l.length*.99|0].toFixed(2)+" max "+l[l.length-1].toFixed(1))}).join(" | ")},
 time(b,n=20){draw(b,b*BAR,.02);g.finish();const t0=performance.now();for(let i=0;i<n;i++){draw(b,b*BAR,0);g.readPixels(0,0,1,1,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array(4))}return(performance.now()-t0)/n}};
/*END*/
