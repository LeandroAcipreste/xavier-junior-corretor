/**
 * Marca no <html> que ha JavaScript.
 *
 * Script CLASSICO e SINCRONO. O CSS usa a classe `js` para esconder o estado
 * inicial de quem vai ser animado: ver `.js .header` e `.js .hero`.
 *
 * Carregado no FIM DO BODY, por escolha de projeto. Efeito colateral: a marca
 * chega depois da primeira pintura, entao o header e a hero aparecem por um
 * instante antes de serem escondidos. Devolver esta tag para o topo do <head>
 * elimina esse pisco.
 *
 * Sem JavaScript a classe nunca entra, e nada fica escondido.
 */
document.documentElement.classList.add('js');
