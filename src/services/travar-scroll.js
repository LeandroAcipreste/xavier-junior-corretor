/**
 * TRAVAR SCROLL - sem dependencia nenhuma, de proposito.
 *
 * Existe separado do scroll suave porque quem precisa travar a pagina (um
 * modal, o aviso de cookies) nao pode ficar preso a fila de download do GSAP
 * e do Lenis, que vem de CDN. Importar o servico de scroll arrastaria os dois
 * junto e atrasaria o modal em segundos.
 *
 * O motor de scroll suave se registra aqui quando existir. Se nao existir, ou
 * se ainda nao tiver carregado, a classe no <html> ja segura a pagina sozinha.
 */

const LOCK_CLASS = 'is-scroll-locked';

let motor = null;

/** Chamado pelo scroll suave assim que ele sobe. */
export const registrarMotor = (instancia) => {
  motor = instancia;
};

export const lockScroll = () => {
  motor?.stop();
  document.documentElement.classList.add(LOCK_CLASS);
};

export const unlockScroll = () => {
  motor?.start();
  document.documentElement.classList.remove(LOCK_CLASS);
};
