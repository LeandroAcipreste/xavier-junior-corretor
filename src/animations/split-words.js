/**
 * Quebra o texto de um elemento em palavras, cada uma dentro de um par
 * mascara/conteudo, para que a animacao possa deslizar a palavra por tras da
 * borda sem vazar. Substitui o SplitText do GSAP, que e licenciado.
 *
 * A operacao e idempotente: chamar duas vezes devolve os mesmos elementos.
 */

const SPLIT_FLAG = 'words';
const WHITESPACE = /(\s+)/;

const isMeaningful = (textNode) => textNode.nodeValue.trim().length > 0;

const collectTextNodes = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let current = walker.nextNode();

  while (current) {
    if (isMeaningful(current)) nodes.push(current);
    current = walker.nextNode();
  }

  return nodes;
};

const buildWord = (word) => {
  const mask = document.createElement('span');
  const inner = document.createElement('span');

  mask.className = 'split-word';
  inner.className = 'split-word__inner';
  inner.textContent = word;
  mask.appendChild(inner);

  return { mask, inner };
};

/**
 * @param {HTMLElement} root
 * @returns {HTMLElement[]} os elementos internos, alvos da animacao
 */
export const splitWords = (root) => {
  if (!root) return [];

  if (root.dataset.split === SPLIT_FLAG) {
    return Array.from(root.querySelectorAll('.split-word__inner'));
  }

  const inners = [];

  collectTextNodes(root).forEach((textNode) => {
    const fragment = document.createDocumentFragment();

    textNode.nodeValue.split(WHITESPACE).forEach((chunk) => {
      if (!chunk) return;

      if (!chunk.trim()) {
        fragment.appendChild(document.createTextNode(chunk));
        return;
      }

      const { mask, inner } = buildWord(chunk);
      fragment.appendChild(mask);
      inners.push(inner);
    });

    textNode.parentNode.replaceChild(fragment, textNode);
  });

  root.dataset.split = SPLIT_FLAG;

  return inners;
};
