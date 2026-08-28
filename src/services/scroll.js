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

/** Dirigido pelo ticker do GSAP, para nao competir com o rAF dele. */
export const createSmoothScroll = () => {
  if (instance) return instance;

  /* Roda no passo do sistema. A calma dos efeitos nao vem de frear a roda, e
     sim da distancia de rolagem que cada dobra ocupa - ver as alturas em
     hero.css e about.css. Frear a roda deixaria a PAGINA lenta; alongar a
     dobra deixa o EFEITO calmo, que e coisa diferente. */
  instance = new Lenis({ autoRaf: false });

  instance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => instance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  registrarMotor(instance);

  return instance;
};
