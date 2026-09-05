/**
 * Escapa texto que vai entrar em innerHTML.
 *
 * Duas telas montam linha por template e jogam em innerHTML: a vitrine e o
 * painel. O painel e o caso grave - nome, endereco e telefone sao digitados
 * por qualquer visitante no formulario publico, e sem escapar um `<script>`
 * digitado la roda na sessao do corretor. E o caminho classico de XSS
 * armazenado, e nao custa nada fechar.
 *
 * Fica aqui, e nao dentro de um dos dois, porque os dois precisam do mesmo.
 */

const MAPA = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * @param {unknown} valor
 * @returns {string} pronto para entrar em innerHTML ou em valor de atributo
 */
export const escaparHtml = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (caractere) => MAPA[caractere]);
