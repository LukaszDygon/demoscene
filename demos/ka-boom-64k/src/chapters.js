let CAMO=null,TORN=[],TOW=[],BALL=null,PUNC='!?.,;',SENT='HOLD THE LINE',NUM=['10','9','8','7','6','5','4','3','2','1','0'],EPI=[],TSPELL=['TORNADO','SPIN','VORTEX'];
const CITY=[['TYPE',-7,-6],['CITY',-3.5,-10],['GRID',0,-5],['STREET',3.5,-12],['BUILD',7,-7],['TALL',-6,-15],['STACK',1.5,-16],['CRUSH',6,-18]];
function chap(B){if(B<400)return city(B);if(B<432)return count(B);if(B<480)return punct(B);if(B<528)return torn(B);return epi(B)}
function city(B){const j=B-336;grid=0;
 if(j===0){burst(0,0,8,1);cutAll();TOW=[];
  CITY.forEach(([w,x,z])=>{for(let c=0;c<w.length;c++)TOW.push(lt(w[c],x,-2.8+c*1.1,z,1,0,{e:1,kp:1,f:[0,-9,0],k:50}))});
  BALL=lt('O',0,3,-6,2.2,1,{kp:1,tn:2,ms:8,f:[0,0,0]})}
 if(j===8){sh=.8;fReq=1}
}
function count(B){const j=B-400,n=j/3|0;grid=.9;
 if(j===0)burst(0,0,8,1);
 if(j%3===0&&n<NUM.length){burst(-6,0,14,0);cutAll();tx(NUM[n],0,0,3.9,0,{sz:4.4,f:[9,0,0],k:70,rt:rot()});sh=1.5;fReq=1}}
function punct(B){const j=B-432;grid=.6;ht=.25;
 if(j===0){burst(0,0,8,1);cutAll();tx(SENT,0,0,C*.8,0,{sz:.85,kp:1,gp:4,f:[0,0,0]});
  [3,7,10].forEach(x=>lt('#',(x-6)*C*.8,1.2,0,.6,1,{kp:1,gp:3,f:[0,0,0]}))}
 if(j%2===0&&j<40)for(let q=0;q<2;q++){const L=(j+q)&1,p=lt(PUNC[(j+q*3)%5],L?-10:10,(Math.random()*2-1)*2.5,0,.9,0,{f:[0,0,0]});
  if(p){p.pr=1;p.life=3;p.v=[L?16:-16,(Math.random()*2-1)*2.5,0]}}
 if(j===40){burst(0,0,12,1);sh=2;fReq=1}
}
function torn(B){const j=B-480;grid=0;ht=.2;
 if(j===0){burst(0,0,8,1);cutAll();TORN=[];for(let i=0;i<500;i++){const o=lt('A',0,0,0,.42,i%11?0:1,{tn:1,ti:i});if(o)TORN.push(o)}}
}
function epi(B){const j=B-528;grid=0;ht=0;
 if(j===0){cutAll();burst(0,0,8,1);
  for(let L=0;L<7;L++){const o=lt('SILENCE'[L],(L-3)*C,0,0,1.15,0,{f:[0,0,0]});if(o)shatter(o,(L-3)*C,0,10,1000+L)}
  for(const o of pool)if(o.m===2&&o.tg>=1000)o.life=9}
 if(j===12)for(const o of pool)if(o.m===2&&o.tg>=1000){const L=o.tg-1000;o.m=1;o.kp=1;o.k=60;o.g=0;o.ms=1;o.life=0;o.ts=o.s;o.tp=[(L-3)*C+o.off[0],o.off[1],0];o.tr=[0,0,0];fReq=1}}
function tornF(T){const SP=TSPELL[(lastB-480>>3)%3];
 for(const o of TORN){if(!o.m)continue;const i=o.ti,a=i*2.399+T*(1.4+(i%5)*.25),y=-4+((i*.0371)%1)*8,r=1.2+(y+4)*.22,x=r*Math.cos(a),z=r*Math.sin(a);
  o.p[0]=x;o.p[1]=y;o.p[2]=z;o.r[1]=a;o.s=.42+(z>0?.2:0);
  if(z>0)o.uv=uvOf(SP[Math.floor((y+4)/8*SP.length)%SP.length])}}
function chapFrame(T,tt){CAMO=null;
 if(lastB>=336&&lastB<400){const u=(T-84*BAR)/(16*BAR),bx=11*Math.sin(T*.9),by=3+1.5*Math.cos(T*.63);
  CAMO={e:[4*Math.sin(u*2.4),2.2+.8*Math.sin(u*3),14-u*2],t:[0,2,-9]};
  if(BALL){BALL.p=[bx,by,-6];BALL.s=2.2}
  for(const o of pool)if(o.m===1&&o.kp&&o.e&&BALL&&o!==BALL&&Math.abs(o.p[0]-bx)<1.3&&Math.abs(o.p[1]-by)<1.4){shatter(o,bx,by,9);sh=1.2;fReq=1}}
 if(lastB>=432&&lastB<480)for(const p of pool){if(p.m!==1||!p.pr)continue;
  for(const s of pool){if(s.m!==1||!s.kp)continue;
   if(Math.abs(p.p[0]-s.p[0])<.5&&Math.abs(p.p[1]-s.p[1])<.55){if(s.gp===3){p.v[0]*=-1;p.v[1]*=-1;p.p[0]+=p.v[0]*.1;break}shatter(s,p.p[0],p.p[1],6);p.m=0;sh=.6;break}}}
 if(lastB>=480&&lastB<528){tornF(T);CAMO={e:[9*Math.sin(T*.2),1.5,9*Math.cos(T*.2)],t:[0,0,0]}}
}
