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

  const video = root.querySelector('.espaco-marca__video-inner');
  if (video) {
    video.muted = true;
    video.play().catch(() => {});
  }

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

    const isMobile = window.innerWidth < 1024;

    if (videoCol) {
      gsap.from(videoCol, {
        opacity: 0,
        x: isMobile ? 0 : -80,
        y: isMobile ? 30 : 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: videoCol,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    if (windowBox) {
      gsap.from(windowBox, {
        opacity: 0,
        x: isMobile ? 0 : 80,
        y: isMobile ? 30 : 0,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: windowBox,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // 2. Animação de Rolagem das Fotos (Pinned no Desktop, Fluido no Mobile)
    if (!isMobile) {
      ScrollTrigger.create({
        trigger: windowBox,
        start: 'bottom bottom',
        end: '+=1600',
        pin: root,
        scrub: 0.8,
        animation: gsap.to(track, {
          xPercent: -75,
          ease: 'none',
        }),
        invalidateOnRefresh: true,
      });
    } else {
      gsap.to(track, {
        xPercent: -75,
        ease: 'none',
        scrollTrigger: {
          trigger: windowBox,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 0.8,
        },
      });
    }
  }, root);

  return {
    destroy: () => contexto.revert(),
  };
}
