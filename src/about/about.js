/**
 * ABOUT - segunda dobra.
 *
 * Duas responsabilidades:
 *  - amarrar o fundo em WebGL ao ciclo de vida da secao, para o shader so
 *    rodar enquanto ela esta na tela;
 *  - entrar e sair no scroll. Sao duas timelines em scrub, encaixadas uma na
 *    outra: a entrada corre enquanto o topo da secao sobe do rodape ate o
 *    topo da tela, a saida corre enquanto a base faz o mesmo caminho. Como
 *    ficam coladas, o conteudo nunca fica parado no meio do movimento.
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { createSkyline } from './skyline.js';
import { splitLetters } from './split-letters.js';

const MODULE_SELECTOR = '[data-module="about"]';
const CANVAS_SELECTOR = '[data-about="fundo"]';

/* Amarrado ao scroll: sem easing proprio, senao briga com o do scrub. */
const LINEAR = 'none';

/**
 * Inercia do scrub. Numero maior = o movimento demora mais para alcancar a
 * rolagem, o que da peso e maciez. Em animacao amarrada ao scroll, o que
 * controla a *velocidade* nao e duracao nenhuma: e a distancia de rolagem
 * que o efeito ocupa. Duracao aqui e so proporcao entre as partes.
 */
const SCRUB = { pesado: 0.8, leitura: 0.9, deriva: 1, filme: 1.2 };

/* Quanto de rolagem o acendimento das letras ocupa, em telas cheias. E longo
   de proposito: e o tempo de leitura de quem esta descendo a pagina. */
const ACENDIMENTO_VH = 210;

/* Percurso horizontal da marca, em percentual da largura dela mesma, para a
   deriva acompanhar o tamanho do bloco em qualquer tela. */
const DERIVA = {
  desktop: { de: -8, ate: 40 },
  /* No mobile o bloco e centrado: uma deriva grande quebraria a centralizacao. */
  mobile: { de: -8, ate: 8 },
};

const coletar = (root) => {
  const bloco = root.querySelector('.sobre__marca');

  const marca = [
    root.querySelector('.sobre__simbolo'),
    root.querySelector('.sobre__nome'),
    root.querySelector('.sobre__fio'),
    root.querySelector('.sobre__tipo'),
    root.querySelector('.sobre__creci'),
  ].filter(Boolean);

  const texto = [
    root.querySelector('.sobre__saudacao'),
    ...root.querySelectorAll('.sobre__paragrafo'),
  ].filter(Boolean);

  /* O container, e nao o video: quem entra e sai da tela e o bloco todo. */
  const foto = root.querySelector('.sobre__foto');
  const filme = root.querySelector('[data-about="filme"]');

  return { bloco, marca, texto, foto, filme };
};

/**
 * A reproducao do video anda com a rolagem: rolar para baixo avanca, rolar
 * para cima rebobina. Nao ha play() em momento nenhum, o que tambem contorna
 * as regras de autoplay dos navegadores.
 *
 * So da para amarrar depois que a duracao existe, e por isso o tween nasce em
 * `contexto.add`: assim ele continua pertencendo ao contexto do GSAP e morre
 * junto na limpeza, mesmo tendo sido criado mais tarde.
 */
const amarrarFilmeAoScroll = (filme, root, contexto) => {
  const ligar = () => {
    contexto.add(() => {
      gsap.fromTo(
        filme,
        { currentTime: 0 },
        {
          currentTime: filme.duration,
          ease: LINEAR,
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: SCRUB.filme,
          },
        },
      );
    });
  };

  /* Um play() mudo seguido de pause() forca a decodificacao do primeiro
     quadro. Sem isso o video pode ficar em branco no celular: ele nunca toca,
     a reproducao e so `currentTime`, e navegador de celular costuma nao
     pintar nada antes de decodificar. `muted` e `playsinline` no markup sao
     o que permitem essa chamada sem gesto do visitante; se ainda assim o
     navegador recusar, o poster continua cobrindo o lugar. */
  const acordar = () => {
    const tocando = filme.play();
    if (tocando && typeof tocando.then === 'function') {
      tocando.then(() => filme.pause()).catch(() => {});
    } else {
      filme.pause();
    }
  };

  const comecar = () => {
    acordar();
    ligar();
  };

  /* readyState 1 e so HAVE_METADATA: da a duracao, nao um quadro. */
  if (filme.readyState >= 1) comecar();
  else filme.addEventListener('loadedmetadata', comecar, { once: true });
};

/**
 * A marca atravessa o eixo X durante toda a passagem da secao, enquanto o
 * texto entra. Quem anda e o bloco inteiro, nao cada linha: a entrada ja
 * mexe no Y de cada uma, e separar os eixos por elemento evita que as duas
 * timelines disputem o mesmo transform.
 */
const construirDeriva = (bloco, alcance) =>
  gsap.fromTo(
    bloco,
    { xPercent: alcance.de },
    { xPercent: alcance.ate, ease: LINEAR },
  );

const construirEntrada = ({ marca, foto }) => {
  const timeline = gsap.timeline();

  if (foto) {
    timeline.fromTo(
      foto,
      { yPercent: 12, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1, ease: LINEAR },
      0,
    );
  }
  timeline.fromTo(
    marca,
    { y: 48, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.08, ease: LINEAR },
    0.05,
  );

  return timeline;
};

/**
 * As letras comecam na cor do fundo e vao acendendo, uma linha de cada vez e
 * dentro dela uma letra de cada vez. Cada letra acende na cor que ja herdava,
 * guardada em data-cor, para os trechos dourados nao virarem branco.
 *
 * E uma tween por linha, com stagger interno, e nao uma por letra: sao
 * centenas de letras, e centenas de tweens seria desperdicio.
 */
const construirAcendimento = (texto, corDoFundo) => {
  const timeline = gsap.timeline();
  const paraCor = (i, alvo) => alvo.dataset.cor;

  const INTERVALO_LINHA = 0.5;
  const INTERVALO_LETRA = 0.016;

  let posicao = 0;
  let total = 0;

  texto.forEach((bloco) => {
    splitLetters(bloco).forEach((linha) => {
      total += linha.length;
      timeline.fromTo(
        linha,
        { color: corDoFundo },
        { color: paraCor, duration: 0.28, stagger: { each: INTERVALO_LETRA }, ease: LINEAR },
        posicao,
      );
      posicao += INTERVALO_LINHA;
    });
  });

  return { timeline, total };
};

const construirSaida = ({ marca, texto, foto }) => {
  const timeline = gsap.timeline();

  /* Sai na ordem inversa da entrada: o texto primeiro, a marca depois. */
  timeline.to(texto, { y: -42, autoAlpha: 0, duration: 0.55, stagger: 0.06, ease: LINEAR }, 0);
  timeline.to(marca, { y: -54, autoAlpha: 0, duration: 0.55, stagger: 0.06, ease: LINEAR }, 0.2);
  if (foto) {
    timeline.to(foto, { yPercent: -9, autoAlpha: 0, duration: 0.9, ease: LINEAR }, 0.1);
  }

  return timeline;
};

/**
 * @param {HTMLElement} [root]
 * @returns {{ destroy: () => void } | null}
 */
export const initAbout = (root = document.querySelector(MODULE_SELECTOR)) => {
  if (!root) return null;

  const partes = coletar(root);

  const contexto = gsap.context(() => {
    ScrollTrigger.create({
      trigger: root,
      animation: construirEntrada(partes),
      start: 'top bottom',
      end: 'top top',
      scrub: SCRUB.pesado,
    });

    /* O acendimento das letras substitui a entrada do texto: e ele que faz o
       texto aparecer. Termina quando a secao encosta no topo, junto com o
       comeco do repouso. */
    const corDoFundo = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--color-night')
      .trim();

    const acendimento = construirAcendimento(partes.texto, corDoFundo);

    ScrollTrigger.create({
      trigger: root,
      animation: acendimento.timeline,
      start: 'top 65%',
      end: `+=${ACENDIMENTO_VH}%`,
      scrub: SCRUB.leitura,
    });

    ScrollTrigger.create({
      trigger: root,
      animation: construirSaida(partes),
      start: 'bottom bottom',
      end: 'bottom top',
      scrub: SCRUB.pesado,
    });

    /* A deriva cobre a passagem inteira, do momento em que a secao aponta no
       rodape ate ela sumir por cima: e um movimento so, contínuo. */
    if (partes.bloco) {
      const mm = gsap.matchMedia();

      mm.add(
        { desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' },
        (contextoMedia) => {
          const alcance = contextoMedia.conditions.desktop ? DERIVA.desktop : DERIVA.mobile;

          ScrollTrigger.create({
            trigger: root,
            animation: construirDeriva(partes.bloco, alcance),
            start: 'top bottom',
            end: 'bottom top',
            scrub: SCRUB.deriva,
          });
        },
      );
    }
  }, root);

  if (partes.filme) amarrarFilmeAoScroll(partes.filme, root, contexto);

  const canvas = root.querySelector(CANVAS_SELECTOR);
  const skyline = canvas ? createSkyline(canvas) : null;

  /* Sem WebGL o degrade do CSS ja cobre a secao; so a animacao continua. */
  if (!skyline) {
    root.classList.add('sobre--sem-webgl');
    return { destroy: () => contexto.revert() };
  }

  const observer = new IntersectionObserver(
    ([entrada]) => (entrada.isIntersecting ? skyline.start() : skyline.stop()),
    { rootMargin: '20% 0px' },
  );
  observer.observe(root);

  /* Aba em segundo plano nao precisa de quadro nenhum. */
  const onVisibility = () => {
    if (document.hidden) skyline.stop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    destroy: () => {
      contexto.revert();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      skyline.destroy();
    },
  };
};
