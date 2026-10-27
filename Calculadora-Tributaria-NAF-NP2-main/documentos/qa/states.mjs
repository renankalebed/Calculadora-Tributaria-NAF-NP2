import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const out=new URL('../evidencias/', import.meta.url).pathname;
fs.mkdirSync(out, {recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:320,height:900},reducedMotion:'reduce'});
const checks=[];
const axeResults=[];
async function axeCheck(state){
 await page.addScriptTag({path:fileURLToPath(import.meta.resolve('axe-core/axe.min.js'))});
 const result=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 axeResults.push({state,violations:result.violations,incomplete:result.incomplete});
 fs.writeFileSync(out+'/axe-estados.json',JSON.stringify(axeResults,null,2));
 console.log('AXE',state,result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
 assert.equal(result.violations.length,0,state+' axe');
}
for(const path of ['login','cadastro','RecuperarSenha']){
 await page.goto('http://127.0.0.1:4173/'+path);await page.waitForTimeout(300);
 await page.getByRole('button',{name:path==='login'?'Entrar':path==='cadastro'?'Cadastrar':'Enviar Instruções',exact:true}).click();
 const inputs=await page.locator('input').evaluateAll(es=>es.map(e=>({invalid:e.getAttribute('aria-invalid'),error:document.getElementById(e.getAttribute('aria-describedby'))?.getAttribute('role')})));
 assert(inputs.every(i=>i.invalid==='true'&&i.error==='alert'));checks.push({test:path+' validação acessível',passed:true});
 await axeCheck(path+" inválido");
 await page.screenshot({path:out+`/validacao-${path}-320.png`,fullPage:true});
}
await page.evaluate(()=>localStorage.setItem('token','qa-fixture-token'));
const fixture={id:1,createdAt:'2026-10-19T12:00:00Z',tipoProfissao:'psicologo',faturamento:5000,custos:500,impostoPF:100,impostoPJ:200,melhorOpcao:'Pessoa Física (PF)',economiaMensal:100};
await page.route('http://localhost:3000/**',route=>route.fulfill({json:route.request().method()==='GET'?[fixture]:{calculo:fixture}}));
for(const path of ['calculo-pf','calculo-pj','comparativo']){
 await page.goto('http://127.0.0.1:4173/'+path);await page.waitForTimeout(300);
 const help=page.getByRole('button',{name:'Ajuda sobre renda mensal'});
 await help.focus(); assert.equal(await help.getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');assert.equal(await help.getAttribute('aria-expanded'),'false');
 await help.click();assert.equal(await help.getAttribute('aria-expanded'),'true');
 assert(await page.locator('#ajuda-renda').isVisible());
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.keyboard.press('Escape');
 await page.getByLabel(/Renda Mensal|Faturamento Mensal/).fill('5000');
 if(path!=='calculo-pj') await page.getByLabel(/Despesas Dedutíveis|Custos Dedutíveis/).fill('500');
 await page.getByRole('button',{name:path==='comparativo'?'Analisar Vantagem Tributária':'Calcular',exact:true}).click();
 await page.getByRole('button',{name:path==='comparativo'?'Deseja enviar os resultados para o seu e-mail?':'Sim'+(path==='calculo-pf'?', enviar':''),exact:true}).click();
 assert.equal(await page.locator('input[type=email]').evaluate(e=>e.labels.length),1);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await axeCheck(path+" resultado e email, API simulada");
 await page.screenshot({path:out+`/resultado-fixture-${path}-320.png`,fullPage:true});checks.push({test:path+' dicas por foco, Escape e toque; resultado e email a 320px (API simulada)',passed:true});
}
await page.goto('http://127.0.0.1:4173/historico');await page.waitForTimeout(300);
assert(await page.getByRole('table').isVisible());
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
const region=page.getByRole('region');await region.focus();const before=await region.evaluate(e=>e.scrollLeft);await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);assert(await region.evaluate(e=>e.scrollLeft)>before);
await axeCheck('Histórico preenchido, API simulada');
await page.screenshot({path:out+'/historico-fixture-320.png',fullPage:true});checks.push({test:'Histórico com fixture e rolagem local por teclado',passed:true});
await page.goto('http://127.0.0.1:4173/');await page.waitForTimeout(300);
await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Pular para o conteúdo');await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'conteudo-principal');
const faq=page.locator('button[aria-controls^="faq-answer"]').first();await faq.focus();await page.keyboard.press('Enter');assert.equal(await faq.getAttribute('aria-expanded'),'true');await page.keyboard.press('Enter');assert.equal(await faq.getAttribute('aria-expanded'),'false');checks.push({test:'Link de salto e FAQ por teclado',passed:true});
await page.goto('http://127.0.0.1:4173/Home');await page.waitForTimeout(300);
const seen=new Set();for(let i=0;i<40;i++){await page.keyboard.press('Tab');const entry=await page.evaluate(()=>{const e=document.activeElement;return {label:e===document.body?'':e.textContent.trim(),outline:getComputedStyle(e).outlineStyle}});if(entry.label){seen.add(entry.label);assert.equal(entry.outline,'solid');}}assert(seen.has('Calculadora Tributária'));await page.keyboard.press('Shift+Tab');checks.push({test:'Tab e Shift+Tab; foco visível e marca navegável por teclado',passed:true});
fs.writeFileSync(out+'/estados-interativos.json',JSON.stringify({note:'API simulada; valores arbitrários para testar apresentação, sem validar tributação nem persistência.',checks},null,2));
console.log(JSON.stringify(checks));await browser.close();
