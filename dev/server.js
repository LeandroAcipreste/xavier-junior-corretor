/**
 * Servidor estatico de desenvolvimento.
 *
 * A pagina usa ES Modules e importmap, entao nao abre por file:// - precisa de
 * HTTP. Uso: node dev/server.js [porta]   (padrao 8177)
 *
 * Atende requisicao por faixa (Range). Isso nao e luxo: sem ela o navegador
 * nao consegue buscar dentro de um video, e o `currentTime` simplesmente nao
 * sai do lugar. O video da segunda dobra e amarrado ao scroll, ou seja, e so
 * busca. Servidor de producao ja faz isso; este precisava aprender.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

/* O servidor vive em dev/, mas serve a raiz do projeto. */
const ROOT = path.join(__dirname, '..');
const PORT = Number(process.argv[2] || 8188);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const resolver = (url) => {
  const pathname = decodeURIComponent(url.split('?')[0]);
  if (pathname === '/admin' || pathname === '/painel-xavier') {
    return path.join(ROOT, '/admin.html');
  }
  let arquivo = path.join(ROOT, pathname === '/' ? '/index.html' : pathname);
  if (!fs.existsSync(arquivo) && fs.existsSync(arquivo + '.html')) {
    arquivo = arquivo + '.html';
  }
  return arquivo.startsWith(ROOT) ? arquivo : null;
};

const tipoDe = (arquivo) => MIME[path.extname(arquivo).toLowerCase()] || 'application/octet-stream';

/** "bytes=1000-" ou "bytes=1000-2000". Devolve null quando nao da para atender. */
const lerFaixa = (cabecalho, tamanho) => {
  const encontrado = /^bytes=(\d*)-(\d*)$/.exec(cabecalho || '');
  if (!encontrado) return null;

  const [, cru1, cru2] = encontrado;
  if (cru1 === '' && cru2 === '') return null;

  /* "bytes=-500" pede os ultimos 500 bytes. */
  const inicio = cru1 === '' ? tamanho - Number(cru2) : Number(cru1);
  const fim = cru1 === '' || cru2 === '' ? tamanho - 1 : Number(cru2);

  if (Number.isNaN(inicio) || Number.isNaN(fim)) return null;
  if (inicio < 0 || inicio > fim || fim >= tamanho) return null;

  return { inicio, fim };
};

http
  .createServer((requisicao, resposta) => {
    const arquivo = resolver(requisicao.url);

    if (!arquivo) {
      resposta.writeHead(403).end('403');
      return;
    }

    fs.stat(arquivo, (erro, dados) => {
      if (erro || !dados.isFile()) {
        resposta.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404');
        return;
      }

      const base = {
        'content-type': tipoDe(arquivo),
        'cache-control': 'no-cache',
        'accept-ranges': 'bytes',
      };

      const faixa = lerFaixa(requisicao.headers.range, dados.size);

      if (!faixa) {
        resposta.writeHead(200, { ...base, 'content-length': dados.size });
        fs.createReadStream(arquivo).pipe(resposta);
        return;
      }

      resposta.writeHead(206, {
        ...base,
        'content-range': `bytes ${faixa.inicio}-${faixa.fim}/${dados.size}`,
        'content-length': faixa.fim - faixa.inicio + 1,
      });
      fs.createReadStream(arquivo, { start: faixa.inicio, end: faixa.fim }).pipe(resposta);
    });
  })
  .listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
  });
