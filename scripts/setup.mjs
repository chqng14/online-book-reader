import {mkdir,copyFile,cp,access,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');const v=path.join(root,'dist/vendor');await mkdir(v,{recursive:true});
for(const [src,dst]of [['jszip/dist/jszip.min.js','jszip.min.js'],['dompurify/dist/purify.min.js','purify.min.js'],['pdfjs-dist/legacy/build/pdf.mjs','pdf.mjs'],['pdfjs-dist/legacy/build/pdf.worker.mjs','pdf.worker.mjs'],['jszip/LICENSE.markdown','JSZip-LICENSE.txt'],['dompurify/LICENSE','DOMPurify-LICENSE.txt'],['pdfjs-dist/LICENSE','PDFjs-LICENSE.txt']])await copyFile(path.join(root,'node_modules',src),path.join(v,dst));
for(const name of ['cmaps','standard_fonts','wasm'])await cp(path.join(root,'node_modules/pdfjs-dist',name),path.join(v,name),{recursive:true});
await mkdir(path.join(root,'dist/fonts'),{recursive:true});
for(const [name,url]of [['BeVietnamPro-OFL.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/OFL.txt'],['be-vietnam-regular.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/BeVietnamPro-Regular.ttf'],['be-vietnam-semibold.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/BeVietnamPro-SemiBold.ttf']]){const dest=path.join(root,'dist/fonts',name);try{await access(dest);}catch{const r=await fetch(url);if(!r.ok)throw new Error(`Font download failed: ${r.status}`);await writeFile(dest,new Uint8Array(await r.arrayBuffer()));}}
console.log('Static assets ready. Run npm start.');
