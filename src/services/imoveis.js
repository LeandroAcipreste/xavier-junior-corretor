/**
 * IMOVEIS - estado da vitrine.
 *
 * Camada de dados, sem DOM nenhum. A chave do armazenamento e o formato do
 * registro moravam em tres lugares - a vitrine, o painel e o modal -, e cada
 * um lia e gravava do seu jeito. Uma mudanca de formato exigia acertar os
 * tres, e quem esquecesse um deixava o painel gravando o que a vitrine nao
 * sabia ler. Agora existe um dono so.
 *
 * Quem desenha imovel na tela importa daqui; quem quiser trocar localStorage
 * por uma API depois mexe so neste arquivo.
 */

export const CHAVE_IMOVEIS = 'imoveis_xavier';

/* Vitrine de demonstracao, para o site nao nascer vazio. Vira dado real assim
   que o corretor cadastra o primeiro imovel pelo painel. */
const PADRAO = [
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
    descricao:
      'Mansão de altíssimo padrão com arquitetura moderna, pé direito duplo, espaço gourmet integrado com piscina de borda infinita e acabamento em mármore importado.',
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
    descricao:
      'Cobertura exclusiva com vista panorâmica da cidade, terraço privativo com jacuzzi, automação residencial completa e localização privilegiada no Bairro Jardins.',
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
    descricao:
      'Residência ampla em condomínio fechado com segurança 24h, suíte master com closet e hidromassagem, área verde privativa e energia solar instalada.',
  },
];

/* Armazenamento pode simplesmente nao existir: aba anonima, cookies
   bloqueados, cota estourada. Nesses casos a vitrine mostra o padrao em vez
   de quebrar a pagina inteira. */
const lerCru = () => {
  try {
    return window.localStorage.getItem(CHAVE_IMOVEIS);
  } catch (erro) {
    return null;
  }
};

const gravarCru = (texto) => {
  try {
    window.localStorage.setItem(CHAVE_IMOVEIS, texto);
    return true;
  } catch (erro) {
    return false;
  }
};

/** @returns {Array<object>} os imoveis gravados, ou a vitrine de demonstracao. */
export const lerImoveis = () => {
  const salvos = lerCru();

  if (!salvos) {
    gravarCru(JSON.stringify(PADRAO));
    return [...PADRAO];
  }

  try {
    const lista = JSON.parse(salvos);
    return Array.isArray(lista) ? lista : [...PADRAO];
  } catch (erro) {
    return [...PADRAO];
  }
};

export const gravarImoveis = (lista) => gravarCru(JSON.stringify(lista));

/** So os que o corretor deixou visiveis. E o que a vitrine publica. */
export const lerImoveisAtivos = () => lerImoveis().filter((item) => item.status === 'Ativo');

/** Grava por cima quando o id ja existe; senao entra no topo da lista. */
export const salvarImovel = (imovel) => {
  const lista = lerImoveis();
  const existe = lista.some((item) => item.id === imovel.id);
  const nova = existe ? lista.map((item) => (item.id === imovel.id ? imovel : item)) : [imovel, ...lista];

  gravarImoveis(nova);

  return nova;
};

export const removerImovel = (id) => {
  const nova = lerImoveis().filter((item) => item.id !== id);
  gravarImoveis(nova);

  return nova;
};
