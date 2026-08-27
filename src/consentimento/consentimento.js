/**
 * CONSENTIMENTO - interface.
 *
 * Duas peças: o aviso que sobe do rodape e o painel de preferencias. A
 * politica vive em pagina propria (/politica-de-privacidade.html), e nao em
 * modal: a Meta exige uma URL publica que o rastreador dela consiga ler, e
 * duas copias de um texto juridico divergem com o tempo.
 *
 * O estado e os avisos as plataformas ficam no servico; aqui so ha DOM e
 * eventos.
 *
 * Duas regras que nao sao estetica, sao exigencia:
 *  - recusar tem que ser tao facil quanto aceitar, no mesmo nivel visual;
 *  - depois de decidir, o visitante precisa conseguir voltar atras.
 */

import {
  CATEGORIAS,
  aceitarTudo,
  gravarDecisao,
  lerDecisao,
  recusarTudo,
} from '../services/consentimento.js';
import { lockScroll, unlockScroll } from '../services/travar-scroll.js';

const MODULE_SELECTOR = '[data-module="consentimento"]';

const CLASSE = { aberto: 'is-aberto' };

const partes = (root) => ({
  aviso: root.querySelector('[data-consent="aviso"]'),
  painel: root.querySelector('[data-consent="painel"]'),
  /* Fica no rodape, fora da raiz deste modulo: procura no documento. */
  reabrir: document.querySelector('[data-consent="reabrir"]'),
  caixas: Array.from(root.querySelectorAll('[data-categoria]')),
});

/**
 * @param {HTMLElement} [root]
 * @returns {{ destroy: () => void } | null}
 */
export const initConsentimento = (root = document.querySelector(MODULE_SELECTOR)) => {
  if (!root) return null;

  const el = partes(root);
  let travado = false;

  const mostrar = (alvo, modal) => {
    alvo.classList.add(CLASSE.aberto);
    alvo.removeAttribute('hidden');
    if (modal && !travado) {
      lockScroll();
      travado = true;
    }
  };

  const esconder = (alvo, modal) => {
    alvo.classList.remove(CLASSE.aberto);
    alvo.setAttribute('hidden', '');
    if (modal && travado) {
      unlockScroll();
      travado = false;
    }
  };

  const refletir = (categorias) => {
    el.caixas.forEach((caixa) => {
      caixa.checked = Boolean(categorias?.[caixa.dataset.categoria]);
    });
  };

  /* Depois de decidir, o aviso sai e sobra o gancho para mudar de ideia. */
  const encerrar = () => {
    esconder(el.aviso, false);
    esconder(el.painel, true);
    el.reabrir?.removeAttribute('hidden');
  };

  const lerCaixas = () =>
    CATEGORIAS.reduce((acc, nome) => {
      const caixa = el.caixas.find((c) => c.dataset.categoria === nome);
      acc[nome] = Boolean(caixa?.checked);
      return acc;
    }, {});

  const acoes = {
    aceitar: () => {
      refletir(aceitarTudo().categorias);
      encerrar();
    },
    recusar: () => {
      refletir(recusarTudo().categorias);
      encerrar();
    },
    salvar: () => {
      gravarDecisao(lerCaixas());
      encerrar();
    },
    preferencias: () => mostrar(el.painel, true),
    'fechar-painel': () => esconder(el.painel, true),
    reabrir: () => {
      refletir(lerDecisao()?.categorias);
      mostrar(el.painel, true);
    },
  };

  /* Delegacao no documento, e nao na raiz: o gatilho de reabrir mora no
     rodape. data-acao so e usado por este modulo, entao nao ha colisao. */
  const onClick = (evento) => {
    const gatilho = evento.target.closest('[data-acao]');
    if (!gatilho) return;

    const acao = acoes[gatilho.dataset.acao];
    if (!acao) return;

    evento.preventDefault();
    acao();
  };

  const onKeydown = (evento) => {
    if (evento.key !== 'Escape') return;
    /* Esc fecha o painel, mas nunca o aviso: sair sem decidir nao vale
       como decisao. */
    if (el.painel.classList.contains(CLASSE.aberto)) esconder(el.painel, true);
  };

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown);

  const decisao = lerDecisao();

  if (decisao) {
    refletir(decisao.categorias);
    el.reabrir?.removeAttribute('hidden');
  } else {
    mostrar(el.aviso, false);
  }

  return {
    destroy: () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeydown);
      if (travado) unlockScroll();
    },
  };
};
