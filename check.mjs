import {chromium} from 'playwright';

const runs = Number(process.argv[2] ?? 10);
const browser = await chromium.launch();
let stuck = 0;
for (let i = 0; i < runs; i++) {
  const page = await browser.newPage();
  await page.goto('http://localhost:3200/?step=' + (process.argv[3] ?? 2));
  await page.waitForFunction(() => document.title !== 'loading', null, {timeout: 10000});
  const title = await page.title();
  if (title !== 'PASS') stuck++;
  console.log(i, title, await page.innerHTML('#root'));
  await page.close();
}
console.log(`${stuck}/${runs} stuck`);
await browser.close();
