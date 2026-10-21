import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
export const publicPages=['index.html','2/index.html','2/experiments/index.html','next/index.html','classics/index.html','playtest/index.html','qidoball/index.html','privacy/index.html'];
export function headers(){
 const hashes=new Set();
 for(const file of publicPages){const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const [,attributes,source]of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(/\bsrc\s*=/.test(attributes)||!source.trim())continue;
   hashes.add("'sha256-"+createHash('sha256').update(source).digest('base64')+"'");
  }
  if(/\son(?:click|load|error|input|change|submit)\s*=/i.test(html))throw Error('Inline event handler needs extraction: '+file);
 }
 const csp="default-src 'self'; script-src 'self' "+[...hashes].sort().join(' ')+"; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'";
 return '/*\n  Cache-Control: public, max-age=0, must-revalidate\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: '+csp+'\n\n/*.mjs\n  Content-Type: text/javascript; charset=utf-8\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url))fs.writeFileSync(path.join(root,'_headers'),headers());
