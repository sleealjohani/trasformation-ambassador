import { chromium } from '@playwright/test';
const B='https://transformation-bridge.vercel.app';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--headless','--no-sandbox']});
const errs=[];
for(const [vp,w,h] of [['mobile',390,844],['desktop',1440,900]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,locale:'ar-SA',isMobile:vp==='mobile',hasTouch:vp==='mobile'});
  const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(`${vp}: ${String(e).slice(0,140)}`));
  p.on('console',m=>{if(m.type()==='error')errs.push(`${vp}: ${m.text().slice(0,140)}`)});
  await p.goto(B,{waitUntil:'networkidle',timeout:60000});
  await p.evaluate(()=>{try{sessionStorage.setItem('bridge:intro-seen','1')}catch(e){}});
  await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1500);
  await p.screenshot({path:`${process.argv[2]}/prod-${vp}.png`,fullPage:false});
  await ctx.close();
}
await b.close();
console.log(errs.length?'أخطاء:\n'+errs.join('\n'):'لا أخطاء على الإنتاج ✓');
