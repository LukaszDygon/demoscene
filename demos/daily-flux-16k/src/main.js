// Visuals: a newspaper page drawn with Canvas2D; a WebGL pass adds halftone, grain, flash and camera shake.
(()=>{
const W=1280,H=720,P=new URLSearchParams(location.search),MUTE=P.has('mute'),T0=+P.get('t')||0;
const S=SONG.S,N=S.length-1,BR=SONG.BAR,TOT=SONG.BARS*BR;
const HL=['SKYSCRAPER SWAYS, PANIC ON 42ND','ALIENS LAND IN OHIO, ASK FOR MAYOR','MOON DUST FOUND IN YOUR MILK','CITY GOES DARK. SIRENS. SCREAMING.','DISCO RIOT ROCKS DOWNTOWN','TIGER ESCAPES ZOO, BITES CRITIC','STOCKS PLUNGE. CLOWNS CHEER.','UFO HOVERS OVER BINGO HALL','HOT. HOTTER. HOTTEST. THE SUN RETURNS','ROBOT STRIKE SHUTS DOWN FACTORY','BIGFOOT TESTIFIES TO THE SENATE','LOCAL MAN WINS LOTTERY TWICE','TELEVISION: THE END IS NEAR?','DISCO BALL FALLS, ONE INJURED','VOLCANO IN THE SUBWAY. TRAINS DELAYED.','MYSTERY SIGNAL FROM SATURN, REPEATS','POLICE CHASE A RUNAWAY WAVE','RECORD SNOW IN MIAMI','EXTRA! NEW DANCE SWEEPS THE NATION','THE NIGHT THE LIGHTS CAME BACK'];
const TXT=HL.join('   ///   ')+'   ///   ';
const BODY=('CITY COUNCIL SAYS THE MATTER IS UNDER REVIEW. WITNESSES DESCRIBE A BRIGHT LIGHT, A SMELL OF BURNT TOAST AND A TUESDAY THAT WOULD NOT END. POLICE ASK ANYONE WITH A POLAROID TO CALL THE DESK. THE WEATHER REMAINS UNSETTLED. CONSUMERS ARE ADVISED TO KEEP DANCING. ').repeat(6);
const IMP='Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif',SER='Georgia,"Times New Roman",serif',INK='#111',PAPER='#d9d9d4';
const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
const rnd=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
function wrap(s,w){const L=[];let l='';for(const q of s.split(' ')){const t=l?l+' '+q:q;if(l&&x.measureText(t).width>w){L.push(l);l=q}else l=t}L.push(l);return L}

// eight procedural "photos", all drawn in black and white and halftoned by the shader
function art(X,Y,w,h,k,a){
 x.save();x.beginPath();x.rect(X,Y,w,h);x.clip();
 const cx=X+w/2,cy=Y+h/2,R=j=>rnd(j,k);
 x.fillStyle=['#e6e6e6','#2a2a2a','#1a1a1a','#aaa','#f2f2f2','#666','#0d0d0d','#bbb'][k];x.fillRect(X,Y,w,h);
 x.fillStyle=INK;x.strokeStyle=INK;
 if(k==0)for(let j=0;j<12;j++){const bh=h*(.3+.6*R(j)),bx=X+j*w/12;x.fillStyle=INK;x.fillRect(bx+3,Y+h-bh,w/12-6,bh);x.fillStyle='#e6e6e6';for(let q=0;q<bh/16;q++)if(R(j*31+q)>.45)x.fillRect(bx+8,Y+h-bh+10+q*16,6,7)}
 else if(k==1){const dy=Math.sin(a*3)*6;x.beginPath();x.moveTo(cx-w*.08,cy+dy);x.lineTo(cx+w*.08,cy+dy);x.lineTo(cx+w*.32,Y+h);x.lineTo(cx-w*.32,Y+h);x.fillStyle='rgba(255,255,255,.35)';x.fill();
  x.fillStyle='#eee';x.beginPath();x.ellipse(cx,cy-h*.2+dy,w*.3,h*.07,0,0,7);x.fill();
  x.fillStyle='#888';x.beginPath();x.ellipse(cx,cy-h*.25+dy,w*.12,h*.1,0,Math.PI,2*Math.PI);x.fill()}
 else if(k==2){x.beginPath();x.arc(cx,cy,h*.32,0,7);x.fillStyle='#ddd';x.fill();for(let j=0;j<6;j++){x.fillStyle='#999';x.beginPath();x.arc(cx+(R(j)-.5)*h*.4,cy+(R(j+9)-.5)*h*.4,h*(.03+.05*R(j+3)),0,7);x.fill()}}
 else if(k==3){x.save();x.beginPath();x.arc(cx,cy,h*.36,0,7);x.clip();x.fillStyle='#ccc';x.fillRect(X,Y,w,h);x.fillStyle=INK;for(let j=0;j<9;j++)x.fillRect(cx-h*.36+j*h*.08,Y,h*.03,h);x.restore()}
 else if(k==4){x.lineWidth=7;x.beginPath();for(let j=0;j<12;j++){const px=X+w*j/11,py=Y+h*(.15+.7*j/11+.12*(R(j)-.5));j?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}
 else if(k==5){x.fillRect(cx-w*.18,cy-h*.2,w*.36,h*.4);x.fillStyle='#eee';x.fillRect(cx-w*.11,cy-h*.1,w*.07,h*.1);x.fillRect(cx+w*.04,cy-h*.1,w*.07,h*.1);x.fillStyle=INK;x.fillRect(cx,Y+h*.05,2,h*.15);x.beginPath();x.arc(cx+1,Y+h*.05,8,0,7);x.fill()}
 else if(k==6){const by=cy-h*.1,br=h*.24;x.beginPath();x.arc(cx,by,br,0,7);x.fillStyle='#eee';x.fill();x.fillStyle=INK;
  for(let gx=-4;gx<=4;gx++)for(let gy=-4;gy<=4;gy++)if(((gx+gy+(a*4|0))%3+3)%3==0)x.fillRect(cx+gx*br/5-2,by+gy*br/5-2,4,4);
  x.strokeStyle='#fff';x.lineWidth=4;for(let j=0;j<8;j++){const q=j*Math.PI/4+a*1.5;x.beginPath();x.moveTo(cx+Math.cos(q)*br*1.2,by+Math.sin(q)*br*1.2);x.lineTo(cx+Math.cos(q)*h*.7,by+Math.sin(q)*h*.7);x.stroke()}}
 else for(let j=0;j<7;j++){x.strokeStyle=j%2?'#eee':INK;x.lineWidth=h*.06;x.beginPath();x.arc(cx,cy+h*.1,h*(.1+j*.05),Math.PI,2*Math.PI);x.stroke()}
 x.restore();
}

function paint(tm){
 x.fillStyle=PAPER;x.fillRect(0,0,W,H);x.fillStyle=INK;
 x.textAlign='center';x.font='84px '+IMP;x.fillText('THE DAILY FLUX',W/2,96);
 x.fillRect(40,104,W-80,5);x.fillRect(40,114,W-80,2);
 x.textAlign='left';x.font='18px '+SER;x.fillText('VOL. LXXIII   NO. 4',40,26);
 x.textAlign='right';x.fillText('ONE DIME',W-40,26);
 if(tm<0){x.textAlign='center';x.font='120px '+IMP;if((performance.now()/400|0)%2)x.fillText('CLICK TO PRINT',W/2,430);x.font='italic 30px '+SER;x.fillText('the presses are warming up',W/2,480)}
 else if(tm>=S[N]*BR){x.textAlign='center';x.font='150px '+IMP;x.fillText('END OF EDITION',W/2,400);x.font='italic 36px '+SER;x.fillText('please keep dancing',W/2,460)}
 else{
  let i=0;while(i<N-1&&S[i+1]*BR<=tm)i++;
  const age=tm-S[i]*BR;
  // headline: slams in and settles; font shrinks until it fits in two lines
  let sz=112,L;x.textAlign='center';
  for(;;){x.font=sz+'px '+IMP;L=wrap(HL[i],1180);if(L.length<3)break;sz-=6}
  x.save();x.translate(W/2,128);const s=1+.5*Math.max(0,1-age/.3)**2;x.scale(s,s);
  L.forEach((l,j)=>x.fillText(l,0,j*sz*.95+sz*.85));
  x.restore();
  // deck, photo, body copy typed out
  x.textAlign='left';x.font='italic 22px '+SER;x.fillText('As told to our staff, page '+(i+1),40,382);
  art(40,396,560,264,i%8,age);x.lineWidth=3;x.strokeRect(40,396,560,264);
  x.fillRect(620,396,2,264);
  x.font='19px '+SER;let n=age*80|0;
  wrap(BODY.slice(i*47,i*47+900),560).slice(0,11).forEach((l,j)=>{if(n>0)x.fillText(l.slice(0,n),640,414+j*23);n-=l.length+1});
  // rubber stamp slams down a fifth of a second after the headline
  if(age>.2){const q=Math.min(1,(age-.2)*8),z=1+1.5*(1-q);x.save();x.translate(470,500);x.rotate(-.18);x.scale(z,z);
   x.fillStyle='#fff';x.fillRect(-140,-42,280,84);x.lineWidth=6;x.strokeRect(-140,-42,280,84);
   x.fillStyle=INK;x.textAlign='center';x.font='58px '+IMP;x.fillText(i%3?'BREAKING':'EXTRA!',0,20);x.restore()}
 }
 // press band rolling down the page, then the ticker
 x.fillStyle='rgba(0,0,0,.05)';x.fillRect(0,(Math.max(0,tm)*90)%H,W,36);
 x.fillStyle=INK;x.fillRect(0,676,W,44);x.fillStyle=PAPER;x.textAlign='left';x.font='30px '+IMP;
 const tw=x.measureText(TXT).width,ox=-((Math.max(0,tm)*150)%tw);x.fillText(TXT,ox,709);x.fillText(TXT,ox+tw,709);
}

// post pass: fullscreen triangle, rotated slight camera tilt and shake, halftone photo, grain, flash, fade
const VS='#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0,1);}';
const FS=`#version 300 es
precision highp float;
uniform sampler2D T;uniform vec2 R;uniform float tm,fl,sh,fd,pv;out vec4 o;
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float lu(vec2 u){return dot(texture(T,u).rgb,vec3(.333));}
void main(){
vec2 uv=gl_FragCoord.xy/R;
uv+=sh*(vec2(hs(vec2(tm*71.,1.)),hs(vec2(tm*71.,2.)))-.5)*.03;
float a=.012*sin(tm*.9)+sh*.03;
uv=mat2(cos(a),sin(a),-sin(a),cos(a))*(uv-.5)*(1.-.05*fl)+.5;
vec3 c;
if(pv>.5&&uv.x>.03125&&uv.x<.46875&&uv.y>.0833&&uv.y<.45){
 float CS=7.;mat2 M=mat2(.7071,-.7071,.7071,.7071);
 vec2 g=M*(uv*R)/CS,k=floor(g)+.5;
 float d=length(g-k)*CS,r=(1.-lu(transpose(M)*(k*CS)/R))*CS*.7;
 c=vec3(1.-.95*smoothstep(r+.7,r-.7,d));
}else c=texture(T,uv).rgb;
c*=.9+.1*hs(gl_FragCoord.xy+vec2(tm));
c*=1.-.4*dot(uv-.5,uv-.5);
c=mix(c,vec3(1.),fl);
o=vec4(c*(1.-fd),1.);
}`;
const G=document.getElementById('g');G.width=W;G.height=H;const gl=G.getContext('webgl2');
const shd=(ty,s)=>{const o=gl.createShader(ty);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pg=gl.createProgram();gl.attachShader(pg,shd(gl.VERTEX_SHADER,VS));gl.attachShader(pg,shd(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pg);gl.useProgram(pg);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(([k,v])=>gl.texParameteri(gl.TEXTURE_2D,k,v));
const U=n=>gl.getUniformLocation(pg,n);
gl.uniform2f(U('R'),W,H);

// song time is the audio clock once started; before the click the start card runs on its own clock
let song=null,actx=null;
const tmOf=()=>song?Math.max(0,actx.currentTime-song.base):MUTE?T0:-1;
const go=()=>{if(song||MUTE)return;actx=new AudioContext();actx.resume();song=SONG.live(actx,0)};
addEventListener('pointerdown',go);addEventListener('keydown',go);
function frame(){
 const tm=tmOf();paint(tm);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
 let age=9;if(tm>=0){let i=0;while(i<N-1&&S[i+1]*BR<=tm)i++;age=tm-S[i]*BR}
 gl.uniform1f(U('tm'),tm<0?performance.now()/1000:tm);
 gl.uniform1f(U('fl'),Math.max(0,1-age/.22)*.5);
 gl.uniform1f(U('sh'),Math.max(0,1-age/.5));
 gl.uniform1f(U('pv'),tm>=0&&tm<S[N]*BR?1:0);
 gl.uniform1f(U('fd'),Math.min(1,Math.max(0,(tm-TOT+1.2)/1.2)));
 gl.drawArrays(gl.TRIANGLES,0,3);
 requestAnimationFrame(frame);
}
frame();
})();
