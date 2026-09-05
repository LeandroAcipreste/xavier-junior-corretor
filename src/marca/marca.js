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

    // A janela (windowBox) em si também pode receber transição se quiser
    ScrollTrigger.create({
      trigger: windowBox,
      start: 'top 85%',
      toggleClass: { targets: windowBox, className: 'visivel' },
      once: true
    });

    // 2. O Pin e as Fotos: Conforme o usuário rola, as fotos vão aparecendo em cascata
    // Usamos o progresso do ScrollTrigger para acionar as fotos
    if (slides.length > 0) {
      ScrollTrigger.create({
        trigger: root, // Pinamos a seção inteira
        start: 'top top',
        end: '+=1500', // Altura do scroll para revelar todas as fotos
        pin: true,
        pinSpacing: true, // Mantemos o espaçamento para não quebrar a página (evita o problema da faixa por colapso)
        onUpdate: (self) => {
          const progresso = self.progress;
          // Divide a revelação pelo número de fotos
          const fatia = 1 / slides.length;
          
          slides.forEach((slide, index) => {
            // Se o progresso ultrapassou a fatia deste slide, revela
            if (progresso >= (index * fatia)) {
              slide.classList.add('visivel');
            } else {
              // Mantém a foto inicial sempre visível
              if (index !== 0) slide.classList.remove('visivel');
            }
          });
        },
        invalidateOnRefresh: true,
      });
    }
  }, root);

  return {
    destroy: () => contexto.revert(),
  };
}
