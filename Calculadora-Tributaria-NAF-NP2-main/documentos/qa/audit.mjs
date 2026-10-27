import {chromium} from 'playwright';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=new URL('../evidencias/', import.meta.url).pathname;
fs.mkdirSync(out, {recursive:true});
const browser=await chromium.launchPersistentContext('/tmp/naf-lighthouse-profile', {executablePath:process.env.CHROME_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--remote-debugging-port=9222']});
const context=browser;
const page=await context.newPage();
await page.goto('http://127.0.0.1:4173');
await page.evaluate(()=>{localStorage.setItem('token','qa-fixture-token');localStorage.setItem('user',JSON.stringify({name:'QA'}));});
const paths=['/','/login','/cadastro','/RecuperarSenha','/Home','/calculo-pf','/calculo-pj','/comparativo','/historico'];
let checks=[];
for(const width of [320,375,768,1440]) for(const path of paths){
 await page.setViewportSize({width,height:900}); await page.goto('http://127.0.0.1:4173'+path);await page.waitForTimeout(2200);
 const info=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,unlabelled:[...document.querySelectorAll('input,select,textarea')].filter(e=>!e.labels?.length).map(e=>e.outerHTML),main:!!document.querySelector('main'),offenders:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && !e.closest('.overflow-x-auto')).map(e=>e.tagName+'.'+e.className).slice(0,5)}));
 checks.push({path,width,...info});
 if(width===320 || width===1440)await page.screenshot({path:out+`/tela-${path.replaceAll('/','')||'landing'}-${width}.png`,fullPage:true});
}
fs.writeFileSync(out+'/responsividade.json',JSON.stringify(checks,null,2));
console.log('RESP',JSON.stringify(checks.filter(c=>c.overflow||c.unlabelled.length)));
const results=[];
const connection=await puppeteer.connect({browserURL:'http://127.0.0.1:9222'});
const auditPage=(await connection.pages())[0];
for(const path of paths){
 let result;
 for(let attempt=0;attempt<2;attempt++){
  await auditPage.goto('about:blank'); await auditPage.bringToFront();
  result=await lighthouse('http://127.0.0.1:4173'+path,{port:9222,onlyCategories:['accessibility'],output:['json','html'],logLevel:'error',disableStorageReset:true},undefined,auditPage);
  if(!result.lhr.runtimeError)break;
  console.log('RETRY',path,result.lhr.runtimeError.code);
 }
 assert(!result.lhr.runtimeError,JSON.stringify(result.lhr.runtimeError));
 assert.equal(new URL(result.lhr.finalDisplayedUrl).pathname,path);
 const name=path.replaceAll('/','')||'landing';
 fs.writeFileSync(out+`/lighthouse-${name}.json`,result.report[0]);fs.writeFileSync(out+`/lighthouse-${name}.html`,result.report[1]);
 const failed=Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,details:a.details}));
 results.push({path,score:result.lhr.categories.accessibility.score*100,failed});
 console.log('LH',path,results.at(-1).score,JSON.stringify(failed));
}
fs.writeFileSync(out+'/lighthouse-resumo.json',JSON.stringify(results,null,2));
await connection.disconnect();
await browser.close();
