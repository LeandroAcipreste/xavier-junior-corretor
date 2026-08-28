/**
 * HEADER - barra de navegacao.
 *
 * Duas responsabilidades: reagir ao scroll (esconder ao descer, reaparecer ao
 * subir, ganhar fundo depois da abertura) e abrir/fechar o menu mobile.
 */

import gsap from 'gsap';
import { revealWords, fadeUp } from '../animations/reveal.js';
import { lockScroll, unlockScroll } from '../services/scroll.js';

const MODULE_SELECTOR = '[data-module="header"]';
const DESKTOP_QUERY = '(min-width: 768px)';

/* Abaixo disto o header nunca se esconde: ainda estamos no topo da pagina. */
const TOP_THRESHOLD = 100;
/* Sem secao de abertura declarada, cai para tres telas cheias. */
const FALLBACK_VIEWPORTS = 3;

/* A barra desce por ultimo, terceira etapa da abertura: cenario, frase letra
   por letra, e so entao o botao com a barra logo atras.

   O valor e medido contra a hero: la o botao entra em CENA.botao (3,4s da
   timeline dela, que comeca 200ms depois do load), depois de a frase inteira
   ter girado. Mexer naqueles tempos pede mexer neste. Sao dois modulos independentes de proposito - o header existe
   em paginas sem hero -, entao o acordo entre eles e por constante, nao por
   uma timeline compartilhada. */
const INTRO = { atraso: 3.7, duracao: 1.1 };

const CLASS = {
  hidden: 'header--hidden',
  solid: 'header--solid',
  menuOpen: 'burger-menu--open',
};

const MENU_EASE = 'cubic-bezier(0.76, 0, 0.2, 1)';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------------ */
/* Reacao ao scroll                                                          */
/* ------------------------------------------------------------------------ */

const createScrollWatcher = (header) => {
  /* A secao sob a qual o header fica transparente, apontada por data-overlay. */
  const overlay = header.dataset.overlay
    ? document.querySelector(header.dataset.overlay)
    : null;

  let previous = window.scrollY;
  let solidAt = 0;

  /* O ponto em que o palco fixo da secao de abertura termina de rolar. Dai em
     diante ela nao esta mais atras do header, que precisa do proprio fundo. */
  const measure = () => {
    solidAt = overlay
      ? overlay.offsetTop + overlay.offsetHeight - window.innerHeight
      : window.innerHeight * FALLBACK_VIEWPORTS;
  };

  const update = () => {
    const current = window.scrollY;

    header.classList.toggle(CLASS.solid, current >= solidAt);

    if (current < TOP_THRESHOLD) {
      header.classList.remove(CLASS.hidden);
    } else {
      header.classList.toggle(CLASS.hidden, current > previous);
    }

    previous = current;
  };

  measure();
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure, { passive: true });

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', measure);
  };
};

/* ------------------------------------------------------------------------ */
/* Menu mobile                                                               */
/* ------------------------------------------------------------------------ */

const buildOpenTimeline = (menu, backdrop, items, actions) => {
  const timeline = gsap.timeline({ paused: true });

  timeline.set(menu, { opacity: 1 }, 0);
  timeline.fromTo(backdrop, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: MENU_EASE }, 0);
  items.forEach((item) => timeline.add(revealWords(item), 0.4));
  if (actions) timeline.add(fadeUp([actions]), 0.6);

  return timeline;
};

const buildCloseTimeline = (menu, backdrop) => {
  const timeline = gsap.timeline({ paused: true });

  timeline.to(backdrop, { scaleY: 0, duration: 0.7, ease: MENU_EASE }, 0);
  timeline.to(menu, { opacity: 0, duration: 0.7, ease: MENU_EASE }, 0);

  return timeline;
};

const createMenu = (header) => {
  const burger = header.querySelector('[data-header="burger"]');
  const menu = header.querySelector('[data-header="menu"]');
  const backdrop = header.querySelector('[data-header="menu-backdrop"]');

  if (!burger || !menu || !backdrop) return () => {};

  const items = Array.from(menu.querySelectorAll('.burger-menu__nav-item'));
  const actions = menu.querySelector('.burger-menu__actions');
  const reduced = prefersReducedMotion();

  const open = reduced ? null : buildOpenTimeline(menu, backdrop, items, actions);
  const close = reduced ? null : buildCloseTimeline(menu, backdrop);

  let isOpen = false;

  const setOpen = (next) => {
    if (next === isOpen) return;
    isOpen = next;

    burger.setAttribute('aria-expanded', String(next));
    burger.setAttribute('aria-label', next ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle(CLASS.menuOpen, next);

    if (next) {
      close?.pause();
      open?.play(0);
      lockScroll();
    } else {
      open?.pause();
      close?.play(0);
      unlockScroll();
    }

    if (reduced) gsap.set(menu, { opacity: next ? 1 : 0 });
  };

  const onBurgerClick = () => setOpen(!isOpen);
  /* Delegacao: qualquer link dentro do menu o fecha. */
  const onMenuClick = (event) => {
    if (event.target.closest('a')) setOpen(false);
  };

  const desktop = window.matchMedia(DESKTOP_QUERY);
  const onBreakpoint = (event) => {
    if (event.matches) setOpen(false);
  };

  burger.addEventListener('click', onBurgerClick);
  menu.addEventListener('click', onMenuClick);
  desktop.addEventListener('change', onBreakpoint);

  return () => {
    burger.removeEventListener('click', onBurgerClick);
    menu.removeEventListener('click', onMenuClick);
    desktop.removeEventListener('change', onBreakpoint);
    unlockScroll();
  };
};

/* ------------------------------------------------------------------------ */

/**
 * @param {HTMLElement} [root]
 * @returns {{ destroy: () => void } | null}
 */
/**
 * A barra desce depois do resto da pagina.
 *
 * O clearProps no fim nao e detalhe: `.header--hidden` esconde a barra com
 * `transform: translateY(-100%)`, e um transform inline deixado pelo GSAP
 * ganharia dele, matando o esconder ao rolar. Limpar devolve o controle ao CSS.
 */
const tocarEntrada = (root) => {
  const timeline = gsap.timeline({ delay: INTRO.atraso });

  timeline.fromTo(
    root,
    { yPercent: -100, autoAlpha: 0 },
    { yPercent: 0, autoAlpha: 1, duration: INTRO.duracao, ease: 'expo.out' },
  );
  timeline.set(root, { clearProps: 'transform' });

  return timeline;
};

export const initHeader = (root = document.querySelector(MODULE_SELECTOR)) => {
  if (!root) return null;

  const stopWatching = createScrollWatcher(root);
  const stopMenu = createMenu(root);
  const entrada = tocarEntrada(root);

  return {
    destroy: () => {
      entrada.kill();
      stopWatching();
      stopMenu();
    },
  };
};
