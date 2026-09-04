import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

/**
 * MARCA / MEU ESPAÇO - Terceira/Quarta dobra
 */
export function initMarca() {
  const root = document.querySelector('.espaco-marca');
  const header = document.querySelector('.espaco-marca__header');
  const videoCol = document.querySelector('.espaco-marca__video-col');
  const windowBox = document.querySelector('.espaco-marca__fotos-window');
  const track = document.querySelector('.espaco-marca__foto-track');
  
  if (!root || !windowBox || !track) return null;

  const contexto = gsap.context(() => {
    // 1. Animação de Entrada: Vídeo entra pela esquerda, Fotos entram pela direita
    if (header) {
      gsap.from(header, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    if (videoCol) {
      gsap.from(videoCol, {
        opacity: 0,
        x: -80,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    if (windowBox) {
      gsap.from(windowBox, {
        opacity: 0,
        x: 80,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: root,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // 2. Animação Pinned de Rolagem (Passando as fotos ao chegar no rodapé "PARA")
    ScrollTrigger.create({
      trigger: windowBox,
      start: 'bottom bottom',
      end: '+=1600',
      pin: root,
      scrub: 0.8,
      animation: gsap.to(track, {
        xPercent: -75, // transição exata das 4 fotos
        ease: 'none',
      }),
      invalidateOnRefresh: true,
    });
  }, root);

  return {
    destroy: () => contexto.revert(),
  };
}
