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
import { fadeUp } from '../animations/reveal.js';
import { splitLetters } from '../animations/split-letters.js';
import { createTitle3D } from './title-3d.js';

const MODULE_SELECTOR = '[data-module="hero"]';
const INTRO_DELAY = 200;

/* Ordem de apresentacao da abertura, em segundos dentro da timeline:
   1. a cobertura e as nuvens montam o cenario;
   2. a frase acende letra por letra;
   3. o botao entra por ultimo, e a barra de navegacao logo atras dele
      (o atraso dela vive em header.js, medido contra estes valores).
   Cada etapa comeca depois de a anterior estar legivel, e nao junto. */
const CENA = { cenario: 0, frase: 1.1, botao: 2.75 };

/* A frase tem ~26 letras: com este passo ela leva cerca de 1,2s para acender
   inteira, e o botao entra logo depois. */
const LETRA = { duracao: 0.4, passo: 0.045 };

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
  titleCanvas: '[data-hero="title-canvas"]',
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
const buildIntroTimeline = (root, parts, titulo3d) => {
  const houseImage = parts.house?.querySelector('img');
  const heading = parts.title?.querySelector('h1') || parts.title;
  const timeline = gsap.timeline({ paused: true });

  timeline.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0);

  /* 1. Cenario: a cobertura e as nuvens primeiro, sozinhas. */
  timeline.from(parts.back, { scale: 1.1, duration: 5, ease: 'expo.out' }, CENA.cenario);
  timeline.from(parts.cloudLeft, { yPercent: 50, duration: 3, ease: 'expo.out' }, CENA.cenario);
  timeline.from(parts.cloudRight, { yPercent: 100, duration: 4, ease: 'expo.out' }, CENA.cenario + 0.1);

  if (houseImage) {
    timeline.from(houseImage, { opacity: 0, duration: 0.8 }, CENA.cenario);
    timeline.from(houseImage, { yPercent: 6, duration: 3, ease: 'expo.out' }, CENA.cenario);
  }

  /* 2. A frase acende letra por letra, com o cenario ja montado.
     splitLetters mantem cada letra num <span> inline: a quebra de linha e o
     kerning continuam os do texto original, e o leitor de tela segue lendo a
     frase em vez de soletrar. */
  if (titulo3d) {
    /* Com WebGL cada letra gira no proprio eixo ate parar de frente. */
    timeline.add(titulo3d.criarTimeline(), CENA.frase);
  } else if (heading) {
    /* Sem WebGL a frase acende por opacidade. Mesma ordem, mesmo lugar. */
    const letras = splitLetters(heading).flat();

    if (letras.length) {
      timeline.from(
        letras,
        { opacity: 0, duration: LETRA.duracao, stagger: LETRA.passo, ease: 'none' },
        CENA.frase,
      );
    }
  }

  /* 3. O botao por ultimo. O texto de apoio e opcional: a hero funciona so
     com titulo e botao. */
  const copy = [parts.text, parts.actions].filter(Boolean);
  if (copy.length) timeline.add(fadeUp(copy), CENA.botao);

  return timeline;
};

/**
 * @param {HTMLElement} [root]
 * @returns {{ destroy: () => void } | null}
 */
export const initHero = (root = document.querySelector(MODULE_SELECTOR)) => {
  if (!root) return null;

  const parts = queryParts(root);

  /* Fora do contexto do GSAP: ele tem recursos proprios (renderer, texturas,
     listener de resize) que o revert() nao conhece e nao limparia. */
  const titulo3d = createTitle3D(parts.title?.querySelector('h1'), parts.titleCanvas);

  const context = gsap.context(() => {
    ScrollTrigger.create({
      trigger: root,
      animation: buildScrollTimeline(parts),
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
    });

    const intro = buildIntroTimeline(root, parts, titulo3d);
    const timer = window.setTimeout(
      () => window.requestAnimationFrame(() => intro.play()),
      INTRO_DELAY,
    );

    return () => window.clearTimeout(timer);
  }, root);

  return {
    destroy: () => {
      titulo3d?.destroy();
      context.revert();
    },
  };
};
