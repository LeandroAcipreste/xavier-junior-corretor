/**
 * PROPOSTAS - estado dos anuncios enviados pelo visitante.
 *
 * Camada de dados, sem DOM nenhum. O modal grava aqui e o painel le daqui; a
 * chave e o formato tem um dono so, pelo mesmo motivo de imoveis.js.
 */

export const CHAVE_PROPOSTAS = 'propostas_anuncios';

const lerCru = () => {
  try {
    return window.localStorage.getItem(CHAVE_PROPOSTAS);
  } catch (erro) {
    return null;
  }
};

const gravarCru = (texto) => {
  try {
    window.localStorage.setItem(CHAVE_PROPOSTAS, texto);
    return true;
  } catch (erro) {
    return false;
  }
};

/** @returns {Array<object>} da mais recente para a mais antiga. */
export const lerPropostas = () => {
  const salvas = lerCru();
  if (!salvas) return [];

  try {
    const lista = JSON.parse(salvas);
    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    return [];
  }
};

export const gravarPropostas = (lista) => gravarCru(JSON.stringify(lista));

/** Entra no topo: o corretor quer ver a mais recente primeiro. */
export const adicionarProposta = (proposta) => {
  const nova = [proposta, ...lerPropostas()];
  gravarPropostas(nova);

  return nova;
};

export const removerProposta = (id) => {
  const nova = lerPropostas().filter((item) => item.id !== id);
  gravarPropostas(nova);

  return nova;
};
