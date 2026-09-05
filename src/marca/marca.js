import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { splitLetters } from '../animations/split-letters.js';

/**
 * MEU ESPACO - dobra da marca.
 *
 * A entrada e por classe: o ScrollTrigger so diz QUANDO, e a transicao mora
 * no marca.css. O titulo sobe, o video chega pela esquerda e a caixa das
 * fotos pela direita, os dois se encontrando no meio.
 *
 * Depois a janela para no centro da tela e as fotos passam, da primeira a
 * ultima, uma por vez.
 */

/* Quanto de tela cada foto ocupa na rolagem. Em telas, e nao em pixels: em
   pixel fixo o mesmo trecho vira rolagem longa no celular e curta no monitor,
   ou seja, ritmos diferentes em cada aparelho. */
const PASSO_POR_FOTO = 0.6;

/* Acendimento do titulo, letra a letra. */
const LETRA = { duracao: 0.5, passo: 0.035 };

export function initMarca() {
  const root = document.querySelector('.espaco-marca');
  const header = document.querySelector('.espaco-marca__header');
  const videoCol = document.querySelector('.espaco-marca__video-col');
  const windowBox = document.querySelector('.espaco-marca__fotos-window');
  const fotosCol = document.querySelector('.espaco-marca__fotos-col');
  const titulo = document.querySelector('.espaco-marca__title');
  const slides = document.querySelectorAll('.espaco-marca__foto-slide');
  
  if (!root || !windowBox) return null;

  const video = root.querySelector('.espaco-marca__video-inner');
  if (video) {
    video.muted = true;
    video.play().catch(() => {});
  }

  const contexto = gsap.context(() => {
    // 1. Lógica de Entrada via CSS (toggleClass)
    if (header) {
      ScrollTrigger.create({
        trigger: root,
        start: 'top 80%',
        toggleClass: { targets: header, className: 'visivel' },
        once: true // Garante que a classe visivel fique
      });
    }

    if (videoCol) {
      ScrollTrigger.create({
        trigger: videoCol,
        start: 'top 85%',
        toggleClass: { targets: videoCol, className: 'visivel' },
        once: true
      });
    }

    /* A caixa das fotos entra pela direita, no mesmo ponto em que o video
       entra pela esquerda: os dois se encontram no meio. */
    if (fotosCol) {
      ScrollTrigger.create({
        trigger: fotosCol,
        start: 'top 85%',
        toggleClass: { targets: fotosCol, className: 'visivel' },
        once: true,
      });
    }

    ScrollTrigger.create({
      trigger: windowBox,
      start: 'top 85%',
      toggleClass: { targets: windowBox, className: 'visivel' },
      once: true,
    });

    /* O titulo acende letra por letra. splitLetters mantem cada letra num
       <span> inline: a quebra de linha e o kerning continuam os do texto
       original, o leitor de tela segue lendo a frase em vez de soletrar, e o
       "Espaço" em dourado acende na cor dele, guardada em data-cor. */
    if (titulo) {
      const letras = splitLetters(titulo).flat();

      if (letras.length) {
        gsap.from(letras, {
          opacity: 0,
          duration: LETRA.duracao,
          stagger: LETRA.passo,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            once: true,
          },
        });
      }
    }

    /* 2. A janela para no meio da tela e as fotos passam, da primeira a
       ultima.

       O gatilho e a JANELA, e nao a secao: preso pelo topo da secao, o pin
       comecava com a foto ainda abaixo da dobra, e ela parava antes de ter
       aparecido inteira. Com `center center` a janela ja esta toda na tela
       quando a cena congela - que e o que se pede.

       A distancia e medida em telas, e nao nos 1500px fixos de antes: pixel
       fixo e rolagem longa no celular e curta no monitor, ou seja, ritmos
       diferentes em cada aparelho. */
    if (slides.length > 0) {
      let atual = -1;

      /* Uma foto por vez. A versao anterior so acrescentava `visivel` e nunca
         tirava: no fim as quatro ficavam acesas e empilhadas, e o que se via
         era a ultima por cima das outras.

         So mexe no DOM quando o indice muda de verdade. O onUpdate roda a
         cada quadro da rolagem, e escrever classe em todos os slides a cada
         quadro seria trabalho jogado fora. */
      const mostrar = (indice) => {
        if (indice === atual) return;
        atual = indice;
        slides.forEach((slide, i) => slide.classList.toggle('visivel', i === indice));
      };

      ScrollTrigger.create({
        trigger: windowBox,
        start: 'center center',
        end: () => `+=${Math.round(window.innerHeight * PASSO_POR_FOTO * slides.length)}`,
        pin: root,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onRefresh: () => mostrar(0),
        onUpdate: (self) => {
          /* A ultima foto fica ate o fim: sem o teto, progresso 1 cairia num
             indice que nao existe e a janela ficaria vazia no ultimo quadro. */
          const indice = Math.min(slides.length - 1, Math.floor(self.progress * slides.length));
          mostrar(indice);
        },
      });
    }
  }, root);

  return {
    destroy: () => contexto.revert(),
  };
}
