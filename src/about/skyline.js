/**
 * SKYLINE - fundo animado em WebGL.
 *
 * Uma cidade procedural desenhada inteira no fragment shader: tres camadas de
 * predios com paralaxe, janelas que acendem, uma grade de mapa por cima e um
 * brilho dourado que atravessa a cena devagar.
 *
 * Nao usa biblioteca. E um unico triangulo cobrindo a tela e um shader; puxar
 * three.js para desenhar um quad seria peso sem retorno.
 *
 * Uso:
 *   const ceu = createSkyline(canvas);
 *   ceu.start(); ceu.stop(); ceu.destroy();
 */

const MAX_DPR = 1.5;

const VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;

const vec3 CEU_TOPO  = vec3(0.031, 0.078, 0.145);
const vec3 CEU_BASE  = vec3(0.145, 0.318, 0.451);
const vec3 OURO      = vec3(0.847, 0.659, 0.220);
const vec3 JANELA    = vec3(1.000, 0.870, 0.600);

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(p.xyx * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

/**
 * Uma faixa de predios. Devolve (silhueta, luz das janelas).
 * densidade alta = predios estreitos = camada mais distante.
 */
vec2 faixa(vec2 uv, float densidade, float semente, float base, float amplitude, float deslize) {
  float x = uv.x * densidade + semente * 13.0 + deslize;
  float indice = floor(x);
  float f = fract(x);

  float altura = base + amplitude * hash11(indice * 1.37 + semente);
  float vao = 0.04 + 0.05 * hash11(indice * 2.11 + semente);
  float dentro = step(vao, f) * step(f, 1.0 - vao);
  float silhueta = dentro * step(uv.y, altura);

  /* Janelas: uma grade dentro do proprio predio, sorteadas e pulsando. */
  vec2 celula = vec2((f - vao) / (1.0 - 2.0 * vao) * 4.0, uv.y * 46.0);
  vec2 ci = floor(celula);
  vec2 cf = fract(celula);
  float acesa = step(0.60, hash21(ci + vec2(indice, semente * 31.0)));
  float pulso = 0.72 + 0.28 * sin(uTime * 0.7 + hash21(ci + semente) * 30.0);
  float caixilho = step(0.24, cf.x) * step(cf.x, 0.76) * step(0.30, cf.y) * step(cf.y, 0.70);

  return vec2(silhueta, silhueta * acesa * caixilho * pulso);
}

void main() {
  vec2 frag = gl_FragCoord.xy / uRes;
  float proporcao = uRes.x / uRes.y;
  vec2 uv = vec2(frag.x * proporcao, frag.y);

  /* Ceu: mais claro perto do horizonte, como fim de tarde na cidade. */
  vec3 cor = mix(CEU_BASE, CEU_TOPO, smoothstep(-0.15, 1.0, frag.y));

  /* Brilho baixo no horizonte. */
  cor += CEU_BASE * 0.35 * smoothstep(0.55, 0.0, frag.y);

  /* Grade de mapa, bem tenue, deslizando de lado. */
  vec2 g = vec2(uv.x, frag.y) * vec2(16.0, 10.0) + vec2(uTime * 0.012, 0.0);
  float linha = max(smoothstep(0.975, 1.0, fract(g.x)), smoothstep(0.985, 1.0, fract(g.y)));
  cor += vec3(0.30, 0.55, 0.75) * linha * 0.10;

  /* Tres camadas, da mais distante para a mais proxima. */
  vec2 longe = faixa(uv, 9.0, 1.0, 0.10, 0.17, uTime * 0.006 + uPointer.x * 0.05);
  vec2 meio  = faixa(uv, 5.5, 2.0, 0.11, 0.25, uTime * 0.013 + uPointer.x * 0.11);
  vec2 perto = faixa(uv, 3.0, 3.0, 0.12, 0.34, uTime * 0.024 + uPointer.x * 0.20);

  cor = mix(cor, vec3(0.157, 0.310, 0.435), longe.x * 0.85);
  cor += JANELA * longe.y * 0.10;

  cor = mix(cor, vec3(0.086, 0.196, 0.310), meio.x * 0.92);
  cor += JANELA * meio.y * 0.16;

  cor = mix(cor, vec3(0.035, 0.098, 0.180), perto.x * 0.96);
  cor += JANELA * perto.y * 0.22;

  /* Bruma subindo do chao, que separa as camadas. */
  cor = mix(cor, CEU_BASE * 0.55, smoothstep(0.32, 0.0, frag.y) * 0.55);

  /* Reflexo dourado da marca atravessando a cena. */
  float faixaOuro = fract((uv.x * 0.30 + frag.y * 0.55) - uTime * 0.018);
  cor += OURO * smoothstep(0.42, 0.5, faixaOuro) * smoothstep(0.58, 0.5, faixaOuro) * 0.11;

  /* Vinheta, para o texto por cima respirar. */
  vec2 v = frag - 0.5;
  cor *= 1.0 - dot(v, v) * 0.55;

  gl_FragColor = vec4(cor, 1.0);
}
`;

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader nao compilou: ${log}`);
  }

  return shader;
};

const buildProgram = (gl) => {
  const program = gl.createProgram();
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`programa nao linkou: ${log}`);
  }

  return program;
};

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {{ start: () => void, stop: () => void, destroy: () => void } | null}
 *          null quando o navegador nao da WebGL; nesse caso o CSS assume.
 */
export const createSkyline = (canvas) => {
  const gl =
    canvas.getContext('webgl', { antialias: false, alpha: false, depth: false }) ||
    canvas.getContext('experimental-webgl', { antialias: false, alpha: false, depth: false });

  if (!gl) return null;

  let program;
  try {
    program = buildProgram(gl);
  } catch {
    return null;
  }

  /* Um triangulo unico maior que a tela cobre tudo sem custo de um quad. */
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'aPos');
  const uRes = gl.getUniformLocation(program, 'uRes');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uPointer = gl.getUniformLocation(program, 'uPointer');

  gl.useProgram(program);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const pointer = { alvoX: 0, alvoY: 0, x: 0, y: 0 };
  let frame = 0;
  let inicio = 0;
  let rodando = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const largura = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const altura = Math.max(1, Math.round(canvas.clientHeight * dpr));

    if (canvas.width === largura && canvas.height === altura) return;

    canvas.width = largura;
    canvas.height = altura;
    gl.viewport(0, 0, largura, altura);
  };

  const draw = (tempo) => {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, tempo);
    gl.uniform2f(uPointer, pointer.x, pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (agora) => {
    if (!rodando) return;
    if (!inicio) inicio = agora;

    /* Suaviza a perseguicao do ponteiro, para nao ficar grudado no cursor. */
    pointer.x += (pointer.alvoX - pointer.x) * 0.05;
    pointer.y += (pointer.alvoY - pointer.y) * 0.05;

    draw((agora - inicio) / 1000);
    frame = window.requestAnimationFrame(loop);
  };

  const onPointerMove = (evento) => {
    const caixa = canvas.getBoundingClientRect();
    pointer.alvoX = ((evento.clientX - caixa.left) / caixa.width) * 2 - 1;
    pointer.alvoY = ((evento.clientY - caixa.top) / caixa.height) * 2 - 1;
  };

  const onResize = () => {
    if (!rodando) draw(0);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  /* Primeiro quadro imediato: a secao nunca aparece vazia. */
  draw(0);

  return {
    start: () => {
      if (rodando) return;
      rodando = true;
      inicio = 0;
      frame = window.requestAnimationFrame(loop);
    },
    stop: () => {
      rodando = false;
      window.cancelAnimationFrame(frame);
    },
    destroy: () => {
      rodando = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
};
