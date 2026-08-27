/**
 * HERO - abertura.
 *
 * Duas timelines independentes:
 *  - entrada, tocada uma vez no load;
 *  - scrub, amarrada ao scroll pelo ScrollTrigger, que levanta as nuvens e a
 *    fumaca ate a proxima dobra, branca, cobrir a tela.
 *
 * A casa nao se move no scroll: e o cenario parado por tras da troca de dobra.
 *
 * O modulo so orquestra estado e tempo. Posicao, tamanho e estado inicial de
 * cada camada vivem em hero.css.
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { revealWords, fadeUp } from '../animations/reveal.js';

const MODULE_SELECTOR = '[data-module="hero"]';
const INTRO_DELAY = 200;

const PARTS = {
  back: '[data-hero="back"]',
  house: '[data-hero="house"]',
  cloudLeft: '[data-hero="cloud-left"]',
  cloudRight: '[data-hero="cloud-right"]',
  smoke: '[data-hero="smoke"]',
  content: '[data-hero="content"]',
  title: '[data-hero="title"]',
  text: '[data-hero="text"]',
  actions: '[data-hero="actions"]',
};

/** Cacheia as camadas uma unica vez. */
const queryParts = (root) =>
  Object.entries(PARTS).reduce((parts, [name, selector]) => {
    parts[name] = root.querySelector(selector);
    return parts;
  }, {});

/** Timeline normalizada em 1 unidade de duracao, consumida pelo scrub. */
const buildScrollTimeline = (parts) => {
  const timeline = gsap.timeline();

  /* As nuvens sobem e saem por cima, cada uma no seu ritmo. */
  timeline.to(parts.cloudLeft, { yPercent: -150, xPercent: -10, duration: 1 }, 0);
  timeline.to(parts.cloudRight, { yPercent: -180, xPercent: 10, duration: 1 }, 0);

  /* A fumaca sobe do rodape e prepara a entrada do branco. */
  timeline.fromTo(parts.smoke, { yPercent: 70 }, { yPercent: 0, duration: 1 }, 0);

  /* O texto sai antes, para nao atravessar a dobra. */
  timeline.to(parts.content, { yPercent: -12, duration: 1 }, 0);
  timeline.to(parts.content, { opacity: 0, duration: 0.35 }, 0);

  return timeline;
};

/** Entrada tocada uma vez, independente do scroll. */
const buildIntroTimeline = (root, parts) => {
  const houseImage = parts.house?.querySelector('img');
  const timeline = gsap.timeline({ paused: true });

  /* O texto de apoio e opcional: a hero funciona so com titulo e botao. */
  const copy = [parts.text, parts.actions].filter(Boolean);

  timeline.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0);
  timeline.add(revealWords(parts.title, { duration: 2, stagger: 0.1 }), 0);
  if (copy.length) timeline.add(fadeUp(copy), 0.4);
  timeline.from(parts.back, { scale: 1.1, duration: 5, ease: 'expo.out' }, 0);
  timeline.from(parts.cloudLeft, { yPercent: 50, duration: 3, ease: 'expo.out' }, 0);
  timeline.from(parts.cloudRight, { yPercent: 100, duration: 4, ease: 'expo.out' }, 0.1);

  if (houseImage) {
    timeline.from(houseImage, { opacity: 0, duration: 0.6 }, 0.2);
    timeline.from(houseImage, { yPercent: 6, duration: 3, ease: 'expo.out' }, 0.2);
  }

  return timeline;
};

/**
 * @param {HTMLElement} [root]
 * @returns {{ destroy: () => void } | null}
 */
export const initHero = (root = document.querySelector(MODULE_SELECTOR)) => {
  if (!root) return null;

  const parts = queryParts(root);
  const context = gsap.context(() => {
    ScrollTrigger.create({
      trigger: root,
      animation: buildScrollTimeline(parts),
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
    });

    const intro = buildIntroTimeline(root, parts);
    const timer = window.setTimeout(
      () => window.requestAnimationFrame(() => intro.play()),
      INTRO_DELAY,
    );

    return () => window.clearTimeout(timer);
  }, root);

  return {
    destroy: () => context.revert(),
  };
};
