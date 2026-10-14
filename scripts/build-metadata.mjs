import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {pages,syncLanguageURL,languageCodes} from '../language-url.mjs';
for(const route of Object.keys(pages)){
 const file=new URL('..'+route+'index.html',import.meta.url),dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://qidolab.com'+route});
 syncLanguageURL(dom.window.document,'en');fs.writeFileSync(file,'<!doctype html>\n'+dom.window.document.documentElement.outerHTML+'\n');dom.window.close();
}
const urls=Object.keys(pages).flatMap(route=>languageCodes.map(lang=>'  <url><loc>https://qidolab.com'+route+'?lang='+lang+'</loc></url>')).join('\n');
fs.writeFileSync(new URL('../sitemap.xml',import.meta.url),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls+'\n</urlset>\n');
