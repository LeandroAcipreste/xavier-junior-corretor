/**
 * main.js - fachada da pagina.
 *
 * Responsavel apenas pelo que e global: registrar plugins, ligar o scroll
 * suave ao ScrollTrigger, expor medidas que o CSS nao consegue calcular e
 * iniciar os modulos de cada secao.
 *
 * Cada secao nova entra em src/<secao>/<secao>.js exportando um init, e e
 * registrada em MODULES aqui embaixo. Nenhuma logica de secao vive neste arquivo.
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { createSmoothScroll } from './src/services/scroll.js';
import { initHeader } from './src/header/header.js';
import { initHero } from './src/hero/hero.js';
import { initSobre } from './src/sobre/sobre.js';

/* Modulos de secao, na ordem em que aparecem na pagina. */
const MODULES = [initHeader, initHero, initSobre];

const root = document.documentElement;

/**
 * A largura da barra de rolagem so existe em tempo de execucao, e varias
 * medidas de layout dependem dela. E dado alimentando o CSS, nao estilo.
 */
const publishScrollbarWidth = () => {
  const width = window.innerWidth - root.clientWidth;
  root.style.setProperty('--scrollbar-width', `${width}px`);
};

const startModules = () => MODULES.map((init) => init()).filter(Boolean);

const start = () => {
  gsap.registerPlugin(ScrollTrigger);

  publishScrollbarWidth();
  window.addEventListener('resize', publishScrollbarWidth, { passive: true });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    createSmoothScroll();
  }

  startModules();

  // As imagens do hero definem a altura util das camadas; so depois disso as
  // marcas de scroll batem com o layout final.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
};

start();
