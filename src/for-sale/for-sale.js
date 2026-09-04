/**
 * FOR-SALE - Vitrine de Imóveis para Vender
 * Carrega e exibe os imóveis cadastrados via localStorage / Painel Administrativo.
 */

const DEFAULT_IMOVEIS = [
  {
    id: 'imovel_1',
    titulo: 'Mansão Contemporânea no Alphaville',
    preco: 'R$ 2.450.000,00',
    bairro: 'Alphaville, Aracaju - SE',
    quartos: 4,
    banheiros: 5,
    vagas: 4,
    area: 480,
    fotoCapa: 'public/img/hero-house.png',
    status: 'Ativo',
    descricao: 'Mansão de altíssimo padrão com arquitetura moderna, pé direito duplo, espaço gourmet integrado com piscina de borda infinita e acabamento em mármore importado.'
  },
  {
    id: 'imovel_2',
    titulo: 'Cobertura Duplex no Bairro Jardins',
    preco: 'R$ 1.890.000,00',
    bairro: 'Jardins, Aracaju - SE',
    quartos: 3,
    banheiros: 4,
    vagas: 3,
    area: 320,
    fotoCapa: 'public/img/video-xavier-poster.webp',
    status: 'Ativo',
    descricao: 'Cobertura exclusiva com vista panorâmica da cidade, terraço privativo com jacuzzi, automação residencial completa e localização privilegiada no Bairro Jardins.'
  },
  {
    id: 'imovel_3',
    titulo: 'Casa de Alto Padrão em Condomínio Fechado',
    preco: 'R$ 1.350.000,00',
    bairro: 'Treze de Julho, Aracaju - SE',
    quartos: 4,
    banheiros: 4,
    vagas: 3,
    area: 290,
    fotoCapa: 'public/img/hero-house.png',
    status: 'Ativo',
    descricao: 'Residência ampla em condomínio fechado com segurança 24h, suíte master com closet e hidromassagem, área verde privativa e energia solar instalada.'
  }
];

export function getImoveis() {
  const salvos = localStorage.getItem('imoveis_xavier');
  if (!salvos) {
    localStorage.setItem('imoveis_xavier', JSON.stringify(DEFAULT_IMOVEIS));
    return DEFAULT_IMOVEIS;
  }
  try {
    return JSON.parse(salvos);
  } catch (e) {
    return DEFAULT_IMOVEIS;
  }
}

export function initForSale() {
  const root = document.querySelector('[data-module="for-sale"]');
  if (!root) return null;

  const grid = root.querySelector('[data-for-sale="grid"]');
  if (!grid) return null;

  const render = () => {
    const imoveis = getImoveis().filter((item) => item.status === 'Ativo');

    if (imoveis.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: rgba(255,255,255,0.5);">
          <p style="font-size: 1.6rem;">Nenhum imóvel disponível na vitrine no momento.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = imoveis
      .map((item) => {
        const textMessage = encodeURIComponent(`Olá Xavier, gostaria de agendar uma visita e saber mais sobre o imóvel: ${item.titulo} (${item.preco})`);
        const whatsappUrl = `https://wa.me/5579999909229?text=${textMessage}`;

        return `
          <article class="for-sale__card" data-id="${item.id}">
            <div class="for-sale__card-media">
              <span class="for-sale__badge">Exclusivo</span>
              <img src="${item.fotoCapa || 'public/img/hero-house.png'}" alt="${item.titulo}" class="for-sale__card-img" loading="lazy">
            </div>
            <div class="for-sale__card-content">
              <div class="for-sale__price">${item.preco}</div>
              <h3 class="for-sale__card-title">${item.titulo}</h3>
              <div class="for-sale__location">📍 ${item.bairro}</div>
              
              <div class="for-sale__specs">
                <div class="for-sale__spec-item">🛏️ <strong>${item.quartos}</strong> Qts</div>
                <div class="for-sale__spec-item">🚿 <strong>${item.banheiros}</strong> Banheiros</div>
                <div class="for-sale__spec-item">🚗 <strong>${item.vagas}</strong> Vagas</div>
                <div class="for-sale__spec-item">📐 <strong>${item.area}</strong> m²</div>
              </div>

              <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button-round button-round--primary for-sale__cta">
                <span class="button-round__content">
                  <span class="button-round__text">
                    <span>Tenho Interesse</span>
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
    if (e.key === 'imoveis_xavier') {
      render();
    }
  });

  return {
    destroy: () => {},
    refresh: render,
  };
}
