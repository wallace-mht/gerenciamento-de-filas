// Uso: node scripts/definir-url.mjs https://usuario.github.io/navalha/
import { readFileSync, writeFileSync } from 'node:fs';
let url = process.argv[2];
if (!url || !/^https:\/\//.test(url)) { console.error('Informe a URL final começando com https://'); process.exit(1); }
if (!url.endsWith('/')) url += '/';
const PLACEHOLDER = 'https://SEU-USUARIO.github.io/navalha/';
for (const f of ['index.html', 'sitemap.xml', 'robots.txt']) {
  const t = readFileSync(f, 'utf8');
  writeFileSync(f, t.split(PLACEHOLDER).join(url));
  console.log(f, t.includes(PLACEHOLDER) ? 'atualizado' : 'sem placeholder');
}
