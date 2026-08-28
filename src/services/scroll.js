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

/* Quanto a pagina anda a cada golpe da roda do mouse, em fracao do padrao do
   navegador. Abaixo de 1 a descida fica mais lenta, que e o que a pagina
   pede: as dobras sao longas e amarradas ao scroll, e no passo padrao elas
   passam rapido demais para serem lidas. Nao mexe no toque, so na roda. */
const RODA = 0.7;

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
