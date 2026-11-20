#!/usr/bin/env node
// Render a PNG thumbnail of each demo's start screen for the screening page (Node >= 22, Chrome; no npm deps).
//   node tools/thumbs.mjs [name-filter]
// Reads the DEMOS list from index.html, opens each demo headless at 640x360, waits for its start screen,
// and writes demos/<folder>/thumb.png. Prints each frame's mean luminance so blank captures stand out.
import {spawn} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const filter=process.argv[2]||'';
const src=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/const DEMOS=(\[[\s\S]*?\]\]);/)[1];
const demos=(0,eval)(src).map(d=>d[1]).filter(u=>u.includes(filter));
const CH=[process.env.CHROME,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&fs.existsSync(p));
const W=640,H=360,WAIT=+process.env.WAIT||4000;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'thumbs-'));const port=9300+Math.floor(Math.random()*600);
const chrome=spawn(CH,['--headless=new',`--user-data-dir=${tmp}`,`--remote-debugging-port=${port}`,`--window-size=${W},${H}`,'--hide-scrollbars','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
  let list=[];for(let i=0;i<60&&!list.length;i++){try{list=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).filter(p=>p.type==='page')}catch{}if(!list.length)await sleep(250)}
  const ws=new WebSocket(list[0].webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={};ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id&&pend[d.id])pend[d.id](d)};
  const call=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}))});
  await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:false});
  for(const u of demos){
    await call('Page.navigate',{url:pathToFileURL(path.join(root,u)).href});await sleep(WAIT);
    const data=(await call('Page.captureScreenshot',{format:'png'})).result.data;
    const out=path.join(root,u.split('/dist/')[0],'thumb.png');fs.writeFileSync(out,Buffer.from(data,'base64'));
    const lum=(await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=64;c.height=36;const g=c.getContext('2d');g.drawImage(i,0,0,64,36);const p=g.getImageData(0,0,64,36).data;let s=0;for(let k=0;k<p.length;k+=4)s+=.3*p[k]+.59*p[k+1]+.11*p[k+2];r(Math.round(s/(p.length/4)))};i.src='data:image/png;base64,${data}'})`})).result?.result?.value;
    console.log(`${path.relative(root,out)}  ${(fs.statSync(out).size/1024).toFixed(0)} KB  mean luminance ${lum}`);
  }
  ws.close();
}finally{chrome.kill();await sleep(300);fs.rmSync(tmp,{recursive:true,force:true})}
