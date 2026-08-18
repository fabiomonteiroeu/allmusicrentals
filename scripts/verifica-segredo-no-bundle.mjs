// Varredura de vazamento de segredo: nenhum valor de servidor pode parar em .next/static.
// Roda após `npm run build`. Procura sentinelas injetadas no build e os nomes literais
// dos segredos de servidor, para o caso de algum deles escapar para o bundle do cliente.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SENTINELA_TOKEN = 'sentinela-strapi-token-9f3a2b';
const SENTINELA_SECRET = 'sentinela-revalidate-7c1d4e';

const TERMOS = [SENTINELA_TOKEN, SENTINELA_SECRET, 'STRAPI_API_TOKEN', 'REVALIDATE_SECRET'];

const alvo = process.argv[2] ?? '.next/static';
const ROOT = process.cwd();
const dirAlvo = join(ROOT, alvo);

if (!existsSync(dirAlvo)) {
  console.error(`✗ Diretório "${alvo}" não encontrado. Rode \`npm run build\` antes.`);
  process.exit(2);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const arquivos = walk(dirAlvo);

const contagens = new Map(TERMOS.map((termo) => [termo, { total: 0, primeiroArquivo: null }]));

for (const arquivo of arquivos) {
  let conteudo;
  try {
    conteudo = readFileSync(arquivo, 'utf8');
  } catch {
    continue;
  }
  for (const termo of TERMOS) {
    const ocorrencias = conteudo.split(termo).length - 1;
    if (ocorrencias > 0) {
      const registro = contagens.get(termo);
      registro.total += ocorrencias;
      if (!registro.primeiroArquivo) {
        registro.primeiroArquivo = relative(ROOT, arquivo);
      }
    }
  }
}

let somaTotal = 0;
console.log(`Varredura de segredos em "${alvo}" (${arquivos.length} arquivos):`);
for (const termo of TERMOS) {
  const registro = contagens.get(termo);
  somaTotal += registro.total;
  const status = registro.total > 0 ? '✗' : '✓';
  const local = registro.primeiroArquivo ? `  primeiro em: ${registro.primeiroArquivo}` : '';
  console.log(`${status}  ${termo}: ${registro.total} ocorrência(s)${local}`);
}

if (somaTotal > 0) {
  console.error('\n✗ Segredo de servidor encontrado no bundle.');
  process.exit(1);
}

console.log('\n✓ Nenhum segredo de servidor encontrado no bundle.');
