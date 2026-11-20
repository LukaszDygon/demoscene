#!/usr/bin/env node
// Record a looping preview clip (and a PNG poster) of each demo's start screen for the screening page.
// Needs Node >= 22, Chrome and ffmpeg with libvpx and libx264; no npm deps.
//   node tools/thumbs.mjs [name-filter]
// Reads the DEMOS list from index.html and, for each demo, writes demos/<folder>/thumb.webm (VP8), thumb.mp4 (H.264) and thumb.png.
// Chrome's virtual time steps the page clock exactly one frame per capture, so the motion is smooth however
// slowly headless Chrome renders. The clip is cross-faded into a seamless loop, and the poster is its first frame.
import {spawn,spawnSync} from 'node:child_process';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const filter=process.argv[2]||'';
const src=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/const DEMOS=(\[[\s\S]*?\]\]);/)[1];
const demos=(0,eval)(src).map(d=>d[1]).filter(u=>u.includes(filter));
const CH=[process.env.CHROME,'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&fs.existsSync(p));
const W=640,H=360,FPS=30,LOOP=4,FADE=1,WARM=+process.env.WARM||3000;   // loop length and cross-fade in seconds
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'thumbs-'));const port=9300+Math.floor(Math.random()*600);
const chrome=spawn(CH,['--headless=new',`--user-data-dir=${tmp}/prof`,`--remote-debugging-port=${port}`,`--window-size=${W},${H}`,'--hide-scrollbars','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
  let list=[];for(let i=0;i<60&&!list.length;i++){try{list=(await(await fetch(`http://127.0.0.1:${port}/json`)).json()).filter(p=>p.type==='page')}catch{}if(!list.length)await sleep(250)}
  const ws=new WebSocket(list[0].webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={},waiters=[];
  ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id&&pend[d.id])pend[d.id](d);if(d.method==='Emulation.virtualTimeBudgetExpired')waiters.splice(0).forEach(f=>f())};
  const call=(m,p={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}))});
  const advance=ms=>new Promise(r=>{waiters.push(r);call('Emulation.setVirtualTimePolicy',{policy:'advance',budget:ms})});
  await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:false});
  // Under virtual time Chrome runs requestAnimationFrame only every few steps; drive it from the virtual clock
  // instead so the demo renders a fresh frame for every capture.
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),${1000/FPS})`});
  for(const u of demos){
    const dir=path.join(root,u.split('/dist/')[0]),frames=fs.mkdtempSync(path.join(tmp,'f-'));
    await call('Emulation.setVirtualTimePolicy',{policy:'pause'});
    await call('Page.navigate',{url:pathToFileURL(path.join(root,u)).href});
    await advance(WARM);                                   // let the start screen settle (fade-ins, shader warm-up)
    const n=(LOOP+FADE)*FPS;
    for(let i=0;i<n;i++){
      await advance(1000/FPS);
      const data=(await call('Page.captureScreenshot',{format:'jpeg',quality:92})).result.data;
      fs.writeFileSync(path.join(frames,String(i).padStart(4,'0')+'.jpg'),Buffer.from(data,'base64'));
    }
    // seamless loop: play seconds FADE..LOOP+FADE, cross-fading the last FADE seconds into seconds 0..FADE
    const vf=`[0:v]split[a][b];[a]trim=start=${FADE},setpts=PTS-STARTPTS,fps=${FPS}[main];[b]trim=end=${FADE},setpts=PTS-STARTPTS,fps=${FPS}[head];`+
             `[main][head]xfade=transition=fade:duration=${FADE}:offset=${LOOP-FADE},format=yuv420p[v]`;
    // VP8 WebM (decoded in software, which avoids flaky hardware VP9 decoders) plus an H.264 MP4 for browsers without WebM
    const out=path.join(dir,'thumb.webm'),mp4=path.join(dir,'thumb.mp4');
    const enc=args=>{const r=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',String(FPS),'-i',path.join(frames,'%04d.jpg'),'-filter_complex',vf,'-map','[v]',...args]);
      if(r.status)throw new Error('ffmpeg failed: '+r.stderr)};
    enc(['-c:v','libvpx','-crf','10','-b:v','600k','-auto-alt-ref','0','-an',out]);
    enc(['-c:v','libx264','-crf','26','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart','-an',mp4]);
    spawnSync('ffmpeg',['-y','-loglevel','error','-i',out,'-frames:v','1','-update','1',path.join(dir,'thumb.png')]);
    // how much the picture moves across the loop (mean absolute pixel change between frames 1 s apart), so static ones stand out
    const st=spawnSync('ffmpeg',['-i',out,'-vf','select=not(mod(n\\,30)),scale=64:36,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG','-f','null','-'],{encoding:'utf8'});
    const mv=[...st.stderr.matchAll(/YAVG=([\d.]+)/g)].map(m=>+m[1]);const motion=mv.length?(mv.reduce((a,b)=>a+b,0)/mv.length).toFixed(1):'?';
    console.log(`${path.relative(root,out)}  ${(fs.statSync(out).size/1024).toFixed(0)} KB  motion ${motion}`);
    fs.rmSync(frames,{recursive:true,force:true});
  }
  ws.close();
}finally{chrome.kill();await sleep(300);fs.rmSync(tmp,{recursive:true,force:true})}
