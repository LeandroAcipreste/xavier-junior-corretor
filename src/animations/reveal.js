/**
 * Animacoes de entrada reutilizaveis. Cada funcao devolve uma timeline pausada
 * pelo chamador, para que a secao decida quando e em que posicao toca-la.
 */

import gsap from 'gsap';
import { splitWords } from '../utils/split-words.js';

const WORD_DEFAULTS = {
  duration: 2,
  delay: 0,
  ease: 'power4.out',
};

const FADE_UP_DEFAULTS = {
  fromY: 70,
  toY: 0,
  duration: 2,
  opacityDuration: 0.1,
  stagger: 0.1,
  ease: 'expo.out',
};

/** Palavras sobem por tras da propria mascara, escalonadas. */
export const revealWords = (element, options = {}) => {
  const config = { ...WORD_DEFAULTS, ...options };
  const words = splitWords(element);
  const timeline = gsap.timeline();

  if (!words.length) return timeline;

  const stagger = words.length > 5 ? { amount: 0.4 } : (config.stagger ?? 0.1);

  timeline.fromTo(
    words,
    { yPercent: 115 },
    {
      yPercent: 0,
      duration: config.duration,
      delay: config.delay,
      stagger,
      ease: config.ease,
    },
    0,
  );
  timeline.set(words, { willChange: 'auto' });

  return timeline;
};

/** Bloco surge de baixo, com a opacidade entrando bem antes do deslocamento. */
export const fadeUp = (targets, options = {}) => {
  const config = { ...FADE_UP_DEFAULTS, ...options };
  const timeline = gsap.timeline();

  timeline.fromTo(
    targets,
    { opacity: 0 },
    { opacity: 1, duration: config.opacityDuration, stagger: config.stagger },
    0,
  );
  timeline.fromTo(
    targets,
    { y: config.fromY },
    { y: config.toY, duration: config.duration, stagger: config.stagger, ease: config.ease },
    0,
  );

  return timeline;
};
