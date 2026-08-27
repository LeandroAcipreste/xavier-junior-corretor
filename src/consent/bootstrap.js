/**
 * Entrada propria do consentimento, separada do main.js.
 *
 * O aviso de cookies precisa aparecer logo, e nao pode depender de GSAP nem
 * de Lenis, que vem de CDN. Medido: dentro do main.js ele demorava de 9 a 15
 * segundos para aparecer, porque esperava a fila inteira de download. Aqui o
 * grafo e so de arquivos locais.
 *
 * De quebra, se a CDN estiver fora do ar, o aviso continua funcionando.
 */

import { initConsent } from './consent.js';

initConsent();
