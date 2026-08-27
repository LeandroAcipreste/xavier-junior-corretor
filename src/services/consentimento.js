/**
 * CONSENTIMENTO - estado e efeitos.
 *
 * Guarda a decisao do visitante e avisa quem precisa saber (Google Consent
 * Mode v2 e Meta). Nao sabe nada de DOM: a interface fica em
 * src/consentimento/.
 *
 * A decisao guardada tem versao. Quando a politica mudar de verdade, subir
 * VERSAO faz o aviso voltar a aparecer, que e o que a LGPD espera de um
 * consentimento que deixou de valer para a nova finalidade.
 */

const CHAVE = 'xavier:consentimento';
const VERSAO = 1;

/** Os essenciais nao entram aqui: nao ha o que consentir sobre eles. */
export const CATEGORIAS = ['analise', 'marketing'];

const vazio = () => ({ analise: false, marketing: false });

const todas = (valor) => ({ analise: valor, marketing: valor });

/**
 * @returns {{ versao: number, data: string, categorias: object } | null}
 *          null quando ainda nao houve decisao, ou quando a guardada venceu.
 */
export const lerDecisao = () => {
  let guardado = null;

  try {
    guardado = JSON.parse(window.localStorage.getItem(CHAVE));
  } catch {
    return null;
  }

  if (!guardado || guardado.versao !== VERSAO || !guardado.categorias) return null;

  return guardado;
};

/** Repassa a escolha para o Google e para o Meta. */
const avisarPlataformas = (categorias) => {
  const analise = categorias.analise ? 'granted' : 'denied';
  const marketing = categorias.marketing ? 'granted' : 'denied';

  window.gtag?.('consent', 'update', {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analise,
  });

  window.fbq?.('consent', categorias.marketing ? 'grant' : 'revoke');
};

/**
 * @param {{ analise: boolean, marketing: boolean }} categorias
 */
export const gravarDecisao = (categorias) => {
  const decisao = {
    versao: VERSAO,
    /* Data em ISO: e o registro de quando o consentimento foi dado, que a
       LGPD espera que o controlador consiga demonstrar. */
    data: new Date().toISOString(),
    categorias: { ...vazio(), ...categorias },
  };

  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(decisao));
  } catch {
    /* Navegacao anonima com armazenamento bloqueado: a escolha vale para
       esta visita e o aviso volta na proxima. Nada a fazer. */
  }

  avisarPlataformas(decisao.categorias);

  return decisao;
};

export const aceitarTudo = () => gravarDecisao(todas(true));
export const recusarTudo = () => gravarDecisao(todas(false));
