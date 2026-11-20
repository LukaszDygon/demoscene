# ＶＡＰＯＲ ＭＡＬＬ　夢のショッピングモール

A 64k browser intro: an FPV drone flight through a low-poly vaporwave mall that ends inside the pocket of a smiling giant with very gelled hair.

**Run:** open `dist/vapor-mall.html` in Chrome, Safari or Firefox (WebGL2) and click. It pre-renders the soundtrack first (~5–10 s).

**Build:** `python3 build.py` packs `src/` into `dist/vapor-mall.html` and fails if the file goes over 65 536 bytes or the soundtrack over 16 384 bytes.

**Debug:** `dist/vapor-mall.html?mute&t=110` starts silently at 110 s.

| file | what |
|---|---|
| `src/demo.js` | mesh builder, mall/props/character geometry, camera splines, shaders (scene, sky, VHS post), captions |
| `src/music.js` | soundtrack: slowed city-pop at 85 BPM, synthesized with WebAudio in an `OfflineAudioContext` |
| `src/shell.html` | page and click-to-enter screen |

## Timeline (85 BPM, bar = 2.82 s)

| bars | time | scene |
|---|---|---|
| 0–3 | 0:00 | plaza at sunset, title ＶＡＰＯＲ ＭＡＬＬ, the mall chime ピンポンパンポーン |
| 4–19 | 0:11 | through the doors, slalom between palms, under the bridge, orbit the fountain, up to the mezzanine, barrel roll; floating carts, cards, cans, busts and CRTs |
| 20–21 | 0:56 | the end doors are shut, so **◀◀ REWIND** (VHS tracking noise, tape squeal) |
| 22–27 | 1:02 | a second take along the other side of the mall: もう一度 / déjà vu |
| 28–35 | 1:19 | dream: the world warps, the floor turns to water, dolphins jump, money rains; the doors slide open |
| 36–45 | 1:41 | ポケットさん: through the torii, over the gelled hair, a hover in front of his grin, then he opens his breast pocket and the camera dives in |
| 46–52 | 2:08 | ポケットの中の宇宙: inside the pocket is a tiny copy of the mall, with him in it; credits, END |

## Tricks

- Every mesh is built at startup from boxes, cones, lathes and jittered spheres into one vertex buffer. Flat shading comes from `dFdx/dFdy`, emission and shine are packed into the UVs.
- The mirror floor redraws the scene flipped in Y under a translucent checkerboard. The sky shader mirrors itself below the horizon, so the striped sun reflects too.
- Japanese text comes from the OS fonts (Hiragino / Yu / Noto). Fonts aren't embedded; the signs are drawn once into a 1024² atlas and the captions are redrawn into a texture every frame.
- The post pass does FPV lens barrel distortion, RGB channel split, VHS line jitter and tracking band, a 3-subpixel RGB aperture mask, mip-chain bloom and scanlines.
- The camera follows Catmull-Rom splines through path parameter `s`, mapped from time. The rewind runs `s` backwards while the camera still faces forward. Banking comes from path curvature, plus prop-vibration jitter.
- Music: tape wobble is a single modulated delay line on the master. Each bar's nodes are scheduled just in time with `OfflineAudioContext.suspend()` and disconnected once they ring out. Pruning the graph this way made the precalc 4× faster.
