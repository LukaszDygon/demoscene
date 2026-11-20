// Prints a sprite as text (material letter, digit = shade 0..3, # outline) to inspect silhouettes without a browser.
//   node test/ascii.js hero i0
const SPR=require('../src/sprites.js');const [k,p]=process.argv.slice(2);const big=k=='boss',W=big?120:80,H=big?100:66;
const px=SPR.pixels(k,p,1,W,H,big?60:40);
// rebuild ramps to name colours
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const ramp=h=>{const c=hex(h);return[mix(c.map(v=>v*.42),[46,18,70],.35),mix(c.map(v=>v*.7),[70,40,110],.18),c,mix(c,[255,250,225],.38)].map(v=>(255<<24|(v[2]&255)<<16|(v[1]&255)<<8|(v[0]&255))>>>0)};
const nm={};const M=SPR.KINDS[k].m;const LET='abcdefghijklmnopqrstuvwxyz';let li=0;const leg=[];
for(const key in M){const L=LET[li++];leg.push(L+'='+key);ramp(M[key]).forEach((v,i)=>nm[v]=i==3?L.toUpperCase():i==2?L:i==1?L:'_'.replace('_',L))}
for(const key in M){const L=LET[leg.findIndex(x=>x.endsWith('='+key))];const r=ramp(M[key]);nm[r[0]]='0';nm[r[1]]=L;nm[r[2]]=L;nm[r[3]]=L.toUpperCase()}
let y0=H,y1=0,x0=W,x1=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(px[y*W+x]){y0=Math.min(y0,y);y1=Math.max(y1,y);x0=Math.min(x0,x);x1=Math.max(x1,x)}
for(let y=y0;y<=y1;y++){let l='';for(let x=x0;x<=x1;x++){const v=px[y*W+x]>>>0;l+=!v?' ':v==((255<<24|(32<<16)|(14<<8)|26)>>>0)?'#':nm[v]||'*'}console.log(l)}
console.log('size',x1-x0+1,'x',y1-y0+1,leg.join(' '));
