/**
 * TITULO 3D - as letras da abertura giram no proprio eixo ate montarem a frase.
 *
 * O <h1> continua no DOM e continua mandando: e dele que saem a tipografia, a
 * quebra de linha e a posicao de cada letra, e e ele que o leitor de tela e o
 * buscador leem. O canvas so desenha por cima. O texto some por OPACIDADE, e
 * nao por `display` ou `visibility`, justamente para nao sumir tambem da
 * arvore de acessibilidade.
 *
 * Cada letra vira uma textura num plano proprio e gira no eixo Y. A camera e
 * ortografica e trabalha em pixels de CSS: uma unidade de mundo e um pixel de
 * tela, entao nao existe conversao de coordenadas em lugar nenhum - a posicao
 * do plano e a posicao que o span ja ocupa na pagina.
 *
 * Sem WebGL a fabrica devolve null, e a hero cai sozinha na revelacao por
 * opacidade que continua existindo em hero.js.
 */

import * as THREE from 'three';
import gsap from 'gsap';

import { splitLetters } from '../animations/split-letters.js';

/* Acima de 2 o ganho visual nao paga o custo de preencher a textura. */
const DPR_MAX = 2;

/* Meia volta: a letra entra de costas e para de frente. De costas ela nao e
   desenhada - o material descarta a face traseira -, entao a frase comeca
   invisivel e cada letra so aparece ao cruzar o meio do proprio giro. */
const GIRO = Math.PI;

/* duracao e o giro de UMA letra; passo e o intervalo entre uma e a proxima.
   Com 25 letras: a ultima parte em 24*passo + duracao = ~2,76s. */
const TEMPO = { duracao: 1.8, passo: 0.04 };

const CLASSE_OCULTA = 'hero__heading--3d';

/** Sem contexto nao ha o que desenhar; o chamador cai no plano B. */
const temWebGL = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch (erro) {
    return false;
  }
};

/**
 * Folga ao redor do glifo, em fracao do corpo da fonte.
 *
 * A caixa do span mede o AVANCO da letra, que nao e o desenho dela. O titulo
 * usa `letter-spacing: -0.02em`, entao o avanco e menor que o glifo e letras
 * largas - S, C, o - saiam cortadas nas bordas. Acentos e a cedilha do "ç"
 * tambem passam da caixa, por cima e por baixo.
 *
 * A folga entra na textura E no plano, no mesmo tamanho: como os dois crescem
 * em torno do mesmo centro, a letra continua caindo exatamente onde o HTML a
 * colocaria.
 */
const FOLGA = 0.3;

/**
 * Desenha uma letra numa textura com folga em volta. A fonte, o peso e a cor
 * saem do proprio span: assim a letra pintada e a mesma que o navegador
 * pintaria, sem lista de fontes duplicada aqui.
 *
 * @returns {{ textura: THREE.CanvasTexture, largura: number, altura: number }}
 */
const texturaDaLetra = (span, dpr) => {
  const estilo = window.getComputedStyle(span);
  const caixa = span.getBoundingClientRect();

  const folga = parseFloat(estilo.fontSize) * FOLGA;
  const largura = caixa.width + folga * 2;
  const altura = caixa.height + folga * 2;

  const pincel = document.createElement('canvas');
  pincel.width = Math.max(1, Math.ceil(largura * dpr));
  pincel.height = Math.max(1, Math.ceil(altura * dpr));

  const ctx = pincel.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.font = `${estilo.fontStyle} ${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`;
  /* data-cor guarda a cor que a letra herdava antes da quebra: e o que faz um
     trecho em destaque acender na cor certa, e nao na cor do paragrafo. */
  ctx.fillStyle = span.dataset.cor || estilo.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(span.textContent, largura / 2, altura / 2);

  const textura = new THREE.CanvasTexture(pincel);
  textura.colorSpace = THREE.SRGBColorSpace;

  return { textura, largura, altura };
};

/**
 * @param {HTMLElement} heading  o <h1> da hero
 * @param {HTMLCanvasElement} canvas
 * @returns {{ criarTimeline: () => gsap.core.Timeline, destroy: () => void } | null}
 */
export const createTitle3D = (heading, canvas) => {
  if (!heading || !canvas || !temWebGL()) return null;

  const letras = splitLetters(heading).flat();
  if (!letras.length) return null;

  /* O angulo de cada letra vive aqui, e nao no plano: refazer a cena troca os
     planos, e a timeline continuaria girando objetos que ja sairam da cena.
     Comeca em GIRO para que qualquer desenho anterior a animacao mostre a
     face traseira, que nao e desenhada. */
  const angulos = letras.map(() => ({ y: GIRO }));

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const cena = new THREE.Scene();

  let camera = null;
  let planos = [];

  const descartar = () => {
    planos.forEach(({ mesh }) => {
      cena.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.map?.dispose();
      mesh.material.dispose();
    });
    planos = [];
  };

  /* Le a pagina e reconstroi a cena a partir dela. Roda na montagem e a cada
     redimensionamento, porque o corpo de fonte da hero muda com a largura e
     com a altura da tela, e as letras mudam de lugar junto. */
  const montar = () => {
    const area = canvas.getBoundingClientRect();
    if (!area.width || !area.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    renderer.setPixelRatio(dpr);
    renderer.setSize(area.width, area.height, false);

    /* Ortografica em pixels: X cresce para a direita, Y para cima. */
    camera = new THREE.OrthographicCamera(0, area.width, area.height, 0, -1000, 1000);

    descartar();

    letras.forEach((span, indice) => {
      const caixa = span.getBoundingClientRect();
      if (!caixa.width || !caixa.height) return;

      const { textura, largura, altura } = texturaDaLetra(span, dpr);

      /* Sem DoubleSide de proposito: de costas a letra nao e desenhada, e e
         isso que a mantem escondida ate a hora dela.

         depthWrite desligado porque a folga fez os planos se sobreporem: com
         ele ligado, a parte transparente de uma letra gravaria profundidade e
         recortaria a letra vizinha. */
      const material = new THREE.MeshBasicMaterial({
        map: textura,
        transparent: true,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), material);

      /* Centro da caixa do span: a folga cresceu em volta desse mesmo ponto,
         entao a letra cai onde o HTML a colocaria.
         O Y do DOM cresce para baixo e o do mundo para cima: dai a subtracao. */
      mesh.position.set(
        caixa.left - area.left + caixa.width / 2,
        area.height - (caixa.top - area.top) - caixa.height / 2,
        0,
      );

      mesh.rotation.y = angulos[indice].y;

      cena.add(mesh);
      planos.push({ mesh, angulo: angulos[indice] });
    });
  };

  const desenhar = () => {
    if (!camera) return;

    /* Copia o angulo para o plano no momento do desenho: e o que permite
       refazer a cena no meio da animacao sem perder o ponto do giro. */
    planos.forEach(({ mesh, angulo }) => {
      mesh.rotation.y = angulo.y;
    });

    renderer.render(cena, camera);
  };

  montar();

  /* Fonte carregada depois muda a metrica das letras; refaz a cena uma vez. */
  if (document.fonts && document.fonts.status !== 'loaded') {
    document.fonts.ready.then(() => {
      montar();
      desenhar();
    });
  }

  let refazer = null;
  const aoRedimensionar = () => {
    refazer?.kill();
    refazer = gsap.delayedCall(0.2, () => {
      montar();
      desenhar();
    });
  };

  window.addEventListener('resize', aoRedimensionar, { passive: true });

  /* O texto so some depois de haver o que colocar no lugar dele. */
  heading.classList.add(CLASSE_OCULTA);

  /* Fabrica, e nao timeline pronta: timeline solta ja comeca a andar, e esta
     precisa esperar a posicao que a abertura da hero reservar para ela. E o
     mesmo contrato de revealWords e fadeUp.

     Desenha so enquanto a animacao anda: parada, a cena nao muda, e um laco
     eterno de render seria consumo puro. */
  const criarTimeline = () => {
    const timeline = gsap.timeline({
      onStart: () => gsap.ticker.add(desenhar),
      onComplete: () => {
        desenhar();
        gsap.ticker.remove(desenhar);
      },
    });

    timeline.fromTo(
      angulos,
      { y: GIRO },
      { y: 0, duration: TEMPO.duracao, stagger: TEMPO.passo, ease: 'power3.out' },
      0,
    );

    return timeline;
  };

  return {
    criarTimeline,

    destroy: () => {
      refazer?.kill();
      window.removeEventListener('resize', aoRedimensionar);
      gsap.ticker.remove(desenhar);
      heading.classList.remove(CLASSE_OCULTA);
      descartar();
      renderer.dispose();
    },
  };
};
