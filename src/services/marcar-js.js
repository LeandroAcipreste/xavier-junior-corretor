/**
 * Marca no <html> que ha JavaScript, antes do primeiro pixel.
 *
 * Script CLASSICO e SINCRONO de proposito. O CSS usa a classe `js` para
 * esconder o estado inicial de quem vai ser animado (header e hero). Se essa
 * marca so chegasse com o main.js, que espera GSAP e Lenis virem de CDN, os
 * dois apareceriam, sumiriam e voltariam animando: um pisco feio.
 *
 * Sem JavaScript a classe nunca entra, e nada fica escondido.
 */
document.documentElement.classList.add('js');
