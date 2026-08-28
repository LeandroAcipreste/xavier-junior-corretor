/**
 * Scroll suave da pagina, como singleton.
 *
 * O travamento da pagina mora em travar-scroll.js, sem dependencia nenhuma;
 * aqui so registramos o motor nele. Quem precisa apenas travar deve importar
 * de la, e nao daqui, para nao arrastar GSAP e Lenis junto.
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { registrarMotor } from './travar-scroll.js';

export { lockScroll, unlockScroll } from './travar-scroll.js';

let instance = null;

/* Quanto a pagina anda a cada golpe da roda do mouse, em fracao do passo do
   sistema. A descida e lenta de proposito: as dobras sao longas e amarradas
   ao scroll, e o visitante precisa de tempo para ver cada efeito acontecer.

   Este e o unico botao para isso. Menor = mais devagar. So a roda; o toque no
   celular segue no passo do sistema, que e o que o dedo espera. */
const RODA = 0.4;

/** Dirigido pelo ticker do GSAP, para nao competir com o rAF dele. */
export const createSmoothScroll = () => {
  if (instance) return instance;

  instance = new Lenis({ autoRaf: false, wheelMultiplier: RODA });

  instance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => instance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  registrarMotor(instance);

  return instance;
};
