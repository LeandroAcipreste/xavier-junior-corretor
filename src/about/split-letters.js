/**
 * Quebra o texto de um elemento em letras, agrupadas pelas linhas em que o
 * navegador realmente as quebrou.
 *
 * As letras ficam em `<span>` **inline**, sem `display: inline-block`. Isso
 * importa por dois motivos: a quebra de linha e o kerning continuam os do
 * texto original, e o leitor de tela segue lendo um paragrafo normal em vez
 * de soletrar. Nada aqui e animado por transform, so por cor, entao inline
 * basta.
 *
 * Cada letra guarda em `data-cor` a cor final que herdava antes da quebra,
 * para que trechos em destaque (um `<strong>` dourado, por exemplo) acendam
 * na cor certa e nao na cor do paragrafo.
 */

const SPLIT_FLAG = 'letters';

const coletarNosDeTexto = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nos = [];
  let atual = walker.nextNode();

  while (atual) {
    if (atual.nodeValue.length) nos.push(atual);
    atual = walker.nextNode();
  }

  return nos;
};

const quebrarNo = (no, letras) => {
  const cor = window.getComputedStyle(no.parentElement).color;
  const fragmento = document.createDocumentFragment();

  Array.from(no.nodeValue).forEach((caractere) => {
    /* Espacos ficam como texto solto: envolve-los atrapalharia a quebra. */
    if (!caractere.trim()) {
      fragmento.appendChild(document.createTextNode(caractere));
      return;
    }

    const span = document.createElement('span');
    span.className = 'letra';
    span.dataset.cor = cor;
    span.textContent = caractere;
    fragmento.appendChild(span);
    letras.push(span);
  });

  no.parentNode.replaceChild(fragmento, no);
};

/**
 * Agrupa pela posicao vertical real de cada letra, que e o unico jeito de
 * saber onde o texto quebrou. Uma tolerancia pequena absorve variacao de
 * altura entre letras da mesma linha (acentos, por exemplo).
 */
const agruparPorLinha = (letras) => {
  const linhas = [];
  let topoAtual = null;

  letras.forEach((letra) => {
    const topo = letra.offsetTop;

    if (topoAtual === null || Math.abs(topo - topoAtual) > 4) {
      topoAtual = topo;
      linhas.push([]);
    }

    linhas[linhas.length - 1].push(letra);
  });

  return linhas;
};

/**
 * @param {HTMLElement} root
 * @returns {HTMLElement[][]} letras agrupadas por linha, em ordem de leitura
 */
export const splitLetters = (root) => {
  if (!root) return [];

  if (root.dataset.split === SPLIT_FLAG) {
    return agruparPorLinha(Array.from(root.querySelectorAll('.letra')));
  }

  const letras = [];
  coletarNosDeTexto(root).forEach((no) => quebrarNo(no, letras));
  root.dataset.split = SPLIT_FLAG;

  return agruparPorLinha(letras);
};
