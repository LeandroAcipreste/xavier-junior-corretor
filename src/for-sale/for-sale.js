/**
 * FOR-SALE - terceira dobra: casas a venda.
 *
 * Esqueleto. A secao ainda nao existe no HTML: hoje o lugar dela e o
 * <section class="espaco"> do index.html.
 *
 * Para ligar quando a marcacao existir:
 *  1. dar a secao o atributo data-module="for-sale";
 *  2. no index.html, incluir <link rel="stylesheet" href="src/for-sale/for-sale.css" />;
 *  3. no main.js, importar initForSale e acrescentar em MODULES, depois de initAbout.
 *
 * O contrato e o mesmo dos outros modulos: devolve null quando a secao nao
 * esta na pagina, e um objeto com destroy() quando esta. Por isso ja pode
 * entrar em MODULES antes da marcacao existir, sem quebrar nada.
 */

const MODULE_SELECTOR = '[data-module="for-sale"]';

/**
 * @param {HTMLElement | null} root
 * @returns {{ destroy: () => void } | null}
 */
export const initForSale = (root = document.querySelector(MODULE_SELECTOR)) => {
  if (!root) return null;

  return {
    destroy: () => {},
  };
};
