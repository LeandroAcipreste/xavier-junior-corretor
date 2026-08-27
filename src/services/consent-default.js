/**
 * CONSENT MODE v2 - estado inicial.
 *
 * Script CLASSICO e SINCRONO de proposito, e o primeiro do <head>. O Google
 * exige que o estado padrao de consentimento seja declarado **antes** de
 * qualquer tag carregar; um modulo (defer) rodaria tarde demais e as tags
 * subiriam sem sinal nenhum.
 *
 * Tudo que nao e essencial comeca em "denied". Se o visitante ja decidiu numa
 * visita anterior, a decisao gravada e aplicada aqui mesmo, antes das tags.
 *
 * Hoje o site ainda nao tem Google Analytics nem Meta Pixel instalados. Este
 * arquivo existe para que, no dia em que tiverem, ja subam governados.
 */
(function () {
  'use strict';

  var CHAVE = 'xavier:consentimento';

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;

  /* wait_for_update da meio segundo para a escolha chegar antes de a tag
     decidir o que fazer, no caso de quem ja tem decisao gravada. */
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  var guardado = null;

  try {
    guardado = JSON.parse(window.localStorage.getItem(CHAVE));
  } catch (e) {
    guardado = null;
  }

  if (!guardado || !guardado.categorias) return;

  var analise = guardado.categorias.analise ? 'granted' : 'denied';
  var marketing = guardado.categorias.marketing ? 'granted' : 'denied';

  gtag('consent', 'update', {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analise,
  });

  /* O Meta le o consentimento por fbq; se o pixel ainda nao subiu, a fila
     dele guarda a chamada. */
  window.fbq = window.fbq || function () {
    (window.fbq.queue = window.fbq.queue || []).push(arguments);
  };
  window.fbq('consent', guardado.categorias.marketing ? 'grant' : 'revoke');
})();
