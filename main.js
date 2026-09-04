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
import { initAbout } from './src/about/about.js';
import { initPrincipios } from './src/principios/principios.js';
import { initMarca } from './src/marca/marca.js';
import { initForSale } from './src/for-sale/for-sale.js';
import { initAnunciarModal } from './src/header/anunciar-modal.js';

/* Modulos de secao, na ordem em que aparecem na pagina. */
const MODULES = [initHeader, initHero, initAbout, initPrincipios, initMarca, initForSale, initAnunciarModal];

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
  /* Força a página a carregar sempre no Hero, ignorando o cache de rolagem do navegador */
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  gsap.registerPlugin(ScrollTrigger);

  /* No celular, a barra de endereco aparecendo e sumindo muda a altura da
     tela. Sem isto o ScrollTrigger recalcula todas as marcas no meio da
     rolagem, e o recalculo aparece como salto. */
  ScrollTrigger.config({ ignoreMobileResize: true });

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
