#!/usr/bin/env node
// Headless-Chrome checks over the DevTools protocol (Node >= 22, Chrome; no npm deps).
//
//   node check.mjs e2e <dist/x.html>
//     Loads the intro, clicks the centre, waits for the first sound source to start on a real AudioContext,
//     lets it play 8 s. Prints click→sound seconds and any uncaught exceptions / console errors.
//     Works on any intro (no conventions needed). Aim for click→sound under ~2 s. Exits 1 on errors / no sound.
//
//   node check.mjs audio <src/music.js> [barsPerChunk=4]
//     Needs SONG.render() → Promise<AudioBuffer>. Prints offline render time, duration, peak, NaN count and
//     RMS dB per chunk of bars. Healthy: no NaN, peak 0.5–0.95, levels that follow the arrangement.
//
//   node check.mjs clearance <dist/x.html>
//     Needs window.__probe = {dur, cam: t => [x,y,z], boxes: [[x0,y0,z0,x1,y1,z1], …]} defined at page load.
//     Samples the camera every 0.05 s; prints min distance, seconds inside geometry and the closest moments.
import {spawn} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';

const [mode,file,arg]=process.argv.slice(2);
if(!['audio','e2e','clearance'].includes(mode)||!file){console.error('usage: check.mjs e2e <x.html> | audio <music.js> [bars] | clearance <x.html>');process.exit(2)}
const CH=[process.env.CHROME,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>p&&fs.existsSync(p));
if(!CH){console.error('Chrome not found; set CHROME=');process.exit(2)}
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'intro-check-'));
let url=pathToFileURL(path.resolve(file)).href;
if(mode==='audio'){const n=+arg||4;
  fs.writeFileSync(path.join(tmp,'a.html'),`<!doctype html><meta charset=utf-8><body><script src="${url}"></script><script>
(async()=>{const t0=performance.now();try{const b=await SONG.render();const ms=performance.now()-t0;
const L=b.getChannelData(0),R=b.numberOfChannels>1?b.getChannelData(1):L;let pk=0,nan=0;const rms=[];const step=Math.floor(SONG.BAR*${n}*b.sampleRate);
for(let s=0;s<L.length;s+=step){let e=0,c=0;for(let i=s;i<Math.min(s+step,L.length);i++){const l=L[i],r=R[i];if(l!==l||r!==r){nan++;continue}e+=l*l+r*r;c+=2;pk=Math.max(pk,Math.abs(l),Math.abs(r))}rms.push(+(10*Math.log10(e/c+1e-12)).toFixed(1))}
window.__R={renderMs:ms|0,songSeconds:+b.duration.toFixed(1),peak:+pk.toFixed(3),nanSamples:nan,rmsDbPer${n}Bars:rms}}catch(e){window.__R={error:String(e&&e.stack||e)}}})();
</script>`);
  url=pathToFileURL(path.join(tmp,'a.html')).href;}
// records the first sound source started on a realtime AudioContext (buffer sources override start(), so patch all)
const HOOK=`(()=>{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;window.__ctx=[];
 const W=function(...a){const c=new A(...a);window.__ctx.push(c);return c};W.prototype=A.prototype;window.AudioContext=W;window.webkitAudioContext=W;
 for(const P of[AudioScheduledSourceNode.prototype,AudioBufferSourceNode.prototype,OscillatorNode.prototype,ConstantSourceNode.prototype]){
  if(!Object.prototype.hasOwnProperty.call(P,'start'))continue;const S=P.start;
  P.start=function(...a){if(!window.__play&&window.__ctx.includes(this.context))window.__play=performance.now();return S.apply(this,a)}}})();`;
const port=9300+Math.floor(Math.random()*600);
const chrome=spawn(CH,['--headless=new',`--user-data-dir=${tmp}/prof`,`--remote-debugging-port=${port}`,'--window-size=1280,720','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let code=0;
try{
  let list=[];for(let i=0;i<60&&!list.length;i++){try{list=(await (await fetch(`http://127.0.0.1:${port}/json`)).json()).filter(p=>p.type==='page')}catch{}if(!list.length)await sleep(250)}
  const ws=new WebSocket(list[0].webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={},errs=[];
  ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id&&pend[d.id])pend[d.id](d);
    if(d.method==='Runtime.exceptionThrown'){const x=d.params.exceptionDetails;errs.push(x.exception?.description||x.text)}
    if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errs.push(d.params.args.map(a=>a.value??a.description).join(' '))};
  const call=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}))});
  const ev=async x=>(await call('Runtime.evaluate',{expression:x,returnByValue:true})).result?.result?.value;
  await call('Runtime.enable');await call('Page.enable');
  if(mode==='e2e')await call('Page.addScriptToEvaluateOnNewDocument',{source:HOOK});
  await call('Page.navigate',{url});
  if(mode==='audio'){
    let r;for(let i=0;i<600&&!(r=await ev('window.__R'));i++)await sleep(500);
    console.log(JSON.stringify(r||{error:'timeout after 300s'},null,1));if(!r||r.error||r.nanSamples)code=1;
  }else if(mode==='clearance'){
    let r;for(let i=0;i<60&&!r;i++){await sleep(500);r=await ev(`(()=>{const P=window.__probe;if(!P)return null;const out=[];
      for(let t=0;t<P.dur;t+=.05){const p=P.cam(t);let d=1e9;for(const o of P.boxes)d=Math.min(d,Math.hypot(Math.max(o[0]-p[0],0,p[0]-o[3]),Math.max(o[1]-p[1],0,p[1]-o[4]),Math.max(o[2]-p[2],0,p[2]-o[5])));out.push([+t.toFixed(2),+d.toFixed(2)])}
      const w=out.filter(([t,d],i)=>!(out[i-1]&&out[i-1][1]<=d)&&!(out[i+1]&&out[i+1][1]<d)).sort((a,b)=>a[1]-b[1]).slice(0,10);
      return{boxes:P.boxes.length,minDist:w[0]?w[0][1]:null,insideSeconds:+(out.filter(x=>!x[1]).length*.05).toFixed(2),closest:w.map(([t,dist])=>({t,dist}))}})()`)}
    console.log(JSON.stringify(r||{error:'window.__probe not defined (see SKILL.md contracts)'},null,1));
    if(!r||r.insideSeconds>0)code=1;if(errs.length){console.log('errors:',errs);code=1}
  }else{
    await sleep(2000);if(errs.length)console.log('errors before click:',errs);
    for(const type of['mousePressed','mouseReleased'])await call('Input.dispatchMouseEvent',{type,x:640,y:360,button:'left',clickCount:1});
    const t0=Date.now();let started=false;
    for(let i=0;i<240;i++){if(await ev('!!window.__play&&(window.__ctx||[]).some(c=>c.state==="running")')){started=true;break}await sleep(250)}
    const s=((Date.now()-t0)/1000).toFixed(1);
    if(started)await sleep(8000);
    console.log(started?`click → first sound: ${s}s`:'NO SOUND within 60s of the click');
    console.log('errors:',errs.length?errs:'none');if(!started||errs.length)code=1;
  }
  ws.close();
}catch(e){console.error('check failed:',e);code=1}
chrome.kill();await sleep(300);fs.rmSync(tmp,{recursive:true,force:true});process.exit(code);
