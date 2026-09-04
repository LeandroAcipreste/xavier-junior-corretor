import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

/**
 * Animações avançadas atreladas ao scroll.
 * Assim como no design-webHub de referência, delegamos ao próprio GSAP
 * a função de esconder e mostrar os elementos suavemente.
 */
export function initPrincipios() {
  const section = document.querySelector('[data-module="principios"]');
  if (!section) return null;

  // Seguindo as boas práticas da referência, caso falte algum elemento, não deve quebrar
  const title = section.querySelector('[data-principios="title"]');
  const line = section.querySelector('[data-principios="line"]');
  const items = section.querySelectorAll('[data-principios="item"]');

  // Efeito Cortina Branca com Logo (Curtain Reveal Overlay)
  const curtain = document.querySelector('[data-principios="curtain"]');
  if (curtain) {
    gsap.to(curtain, {
      yPercent: -100,
      duration: 1.2,
      ease: 'power4.inOut',
      scrollTrigger: {
        trigger: '.principios-wrapper',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
      onComplete: () => {
        curtain.style.pointerEvents = 'none';
      },
    });
  }

  // Animação da Transição de Alto Padrão (Sobre -> Princípios)
  const transicao = document.querySelector('[data-transicao="sobre-principios"]');
  if (transicao) {
    const linha = transicao.querySelector('.transicao-sobre-principios__linha');
    const emblemaWrapper = transicao.querySelector('.transicao-sobre-principios__emblema-wrapper');
    const emblemaImg = transicao.querySelector('.transicao-sobre-principios__emblema');

    if (linha && emblemaWrapper) {
      // 1. Expansão horizontal da linha receptora
      gsap.fromTo(
        linha,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: transicao,
            start: 'top bottom',
            end: 'bottom 50%',
            scrub: 0.8,
          },
        }
      );

      // 2. Giro contínuo da logo circular cravando em 360° exatos (100% alinhada e reta)
      const alvoGiro = emblemaImg || emblemaWrapper;
      gsap.fromTo(
        alvoGiro,
        { rotate: 0, scale: 0.6, opacity: 0.4 },
        {
          rotate: 360, // Múltiplo de 360° para garantir zero inclinação no final
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: transicao,
            start: 'top bottom',
            end: 'bottom 55%', // Ponto exato onde a cortina/seção assenta
            scrub: 0.8,
          },
        }
      );
    }
  }

  if (title) {
    gsap.from(title, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: "play none none reverse",
      },
    });
  }

  if (line) {
    gsap.from(line, {
      scaleX: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: line,
        start: 'top 85%',
        toggleActions: "play none none reverse",
      },
    });
  }

  // 3. Fixação do Título "Meus Objetivos" acompanhando a rolagem da tela (Sticky Pinning)
  const headerCol = section.querySelector('.principios__col-header');
  const contentCol = section.querySelector('.principios__col-content');

  if (headerCol && contentCol) {
    // No Desktop, usa GSAP Pinning. No Mobile, usa o CSS position: sticky nativo que é 100% fluido
    if (window.innerWidth >= 1024) {
      ScrollTrigger.create({
        trigger: headerCol,
        start: 'top 140px',
        endTrigger: contentCol,
        end: 'bottom bottom',
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    }
  }

  // 4. Animação de entrada desacelerada e cadenciada dos blocos
  if (items.length > 0) {
    const isMobile = window.innerWidth < 768;
    
    if (!isMobile) {
      items.forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          y: 60,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        });

        // Revelação com atraso visível entre cada um dos tópicos dos Pilares
        const pilaresItems = item.querySelectorAll('.principios__pilares li');
        if (pilaresItems.length > 0) {
          gsap.from(pilaresItems, {
            opacity: 0,
            x: 30,
            duration: 1.2,
            stagger: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item.querySelector('.principios__pilares'),
              start: 'top 68%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      });
    }
  }
}
