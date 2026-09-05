/**
 * FOR-SALE - vitrine de imoveis a venda.
 *
 * So desenha. Os imoveis vem do servico, que e quem sabe onde eles moram; o
 * painel do corretor grava no mesmo lugar, pelo mesmo servico.
 */

import { lerImoveisAtivos, CHAVE_IMOVEIS } from '../services/imoveis.js';
import { escaparHtml } from '../utils/escapar-html.js';

const CAPA_PADRAO = 'public/img/hero-house.png';
const WHATSAPP = '5579999909229';

export function initForSale() {
  const root = document.querySelector('[data-module="for-sale"]');
  if (!root) return null;

  const grid = root.querySelector('[data-for-sale="grid"]');
  if (!grid) return null;

  const render = () => {
    const imoveis = lerImoveisAtivos();

    if (imoveis.length === 0) {
      grid.innerHTML = `
        <div class="for-sale__vazio">
          <p class="for-sale__vazio-texto">Nenhum imóvel disponível na vitrine no momento.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = imoveis
      .map((item) => {
        const recado = encodeURIComponent(
          `Olá Xavier, gostaria de agendar uma visita e saber mais sobre o imóvel: ${escaparHtml(item.titulo)} (${escaparHtml(item.preco)})`,
        );
        const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${recado}`;

        return `
          <article class="for-sale__card" data-id="${escaparHtml(item.id)}">
            <div class="for-sale__card-media">
              <span class="for-sale__badge">Exclusivo</span>
              <img src="${escaparHtml(item.fotoCapa || CAPA_PADRAO)}" alt="${escaparHtml(item.titulo)}" class="for-sale__card-img" loading="lazy">
            </div>
            <div class="for-sale__card-content">
              <div class="for-sale__price">${escaparHtml(item.preco)}</div>
              <h3 class="for-sale__card-title">${escaparHtml(item.titulo)}</h3>
              <div class="for-sale__location">📍 ${escaparHtml(item.bairro)}</div>
              
              <div class="for-sale__specs">
                <div class="for-sale__spec-item">🛏️ <strong class="for-sale__spec-valor">${escaparHtml(item.quartos)}</strong> Qts</div>
                <div class="for-sale__spec-item">🚿 <strong class="for-sale__spec-valor">${escaparHtml(item.banheiros)}</strong> Banheiros</div>
                <div class="for-sale__spec-item">🚗 <strong class="for-sale__spec-valor">${escaparHtml(item.vagas)}</strong> Vagas</div>
                <div class="for-sale__spec-item">📐 <strong class="for-sale__spec-valor">${escaparHtml(item.area)}</strong> m²</div>
              </div>

              <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button-round button-round--primary for-sale__cta">
                <span class="button-round__content">
                  <span class="button-round__text">
                    <span class="button-round__label">Tenho Interesse</span>
                  </span>
                </span>
              </a>
            </div>
          </article>
        `;
      })
      .join('');
  };

  render();

  // Atualiza automaticamente caso o admin altere imóveis em outra aba
  window.addEventListener('storage', (e) => {
    if (e.key === CHAVE_IMOVEIS) {
      render();
    }
  });

  return {
    destroy: () => {},
    refresh: render,
  };
}
