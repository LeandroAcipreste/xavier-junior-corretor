/**
 * ADMIN - painel do corretor.
 *
 * Estava embutido num <script type="module"> dentro do admin.html, com as
 * acoes penduradas em `onclick` e em funcoes jogadas no `window`. Saiu de la
 * por tres motivos: comportamento nao mora na marcacao, funcao global e
 * superficie que qualquer script da pagina alcanca, e `onclick` num HTML
 * gerado por template obriga a costurar aspas dentro de aspas.
 *
 * No lugar entrou delegacao de evento: um ouvinte por tabela, lendo `data-` do
 * botao clicado. Vale para linha que ainda nem existe, e some junto com a
 * tabela quando ela e redesenhada.
 *
 * Estado vem dos servicos; aqui so ha DOM e orquestracao.
 */

import { lerImoveis, salvarImovel, removerImovel } from '../services/imoveis.js';
import { lerPropostas, removerProposta } from '../services/propostas.js';
import { escaparHtml } from '../utils/escapar-html.js';

const CAPA_PADRAO = 'public/img/hero-house.png';

export const initAdmin = () => {
  const abas = document.querySelector('[data-admin="tabs"]');
  const corpoImoveis = document.querySelector('[data-admin="imoveis-body"]');
  const corpoPropostas = document.querySelector('[data-admin="propostas-body"]');
  const contadorPropostas = document.querySelector('[data-admin="count-propostas"]');
  const formulario = document.querySelector('[data-admin="form-imovel"]');
  const tituloFormulario = document.querySelector('[data-admin="form-title"]');
  const botaoCancelar = document.querySelector('[data-admin="cancel-edit"]');
  const entradaFotos = document.querySelector('[data-admin="fotos"]');
  const previaFotos = document.querySelector('[data-admin="foto-preview"]');

  if (!formulario || !corpoImoveis) return null;

  const campo = (nome) => formulario.querySelector(`[data-campo="${nome}"]`);

  let imoveis = lerImoveis();
  let fotos = [];
  let indiceCapa = 0;

  /* ---------------------------------------------------------------- Abas */
  if (abas) {
    abas.addEventListener('click', (evento) => {
      const aba = evento.target.closest('[data-tab]');
      if (!aba) return;

      abas.querySelectorAll('[data-tab]').forEach((outra) => outra.classList.remove('is-active'));
      document
        .querySelectorAll('.admin-panel-section')
        .forEach((secao) => secao.classList.remove('is-active'));

      aba.classList.add('is-active');
      document.getElementById(`tab-${aba.dataset.tab}`)?.classList.add('is-active');
    });
  }

  /* ------------------------------------------------------------- Imoveis */
  const desenharImoveis = () => {
    if (!imoveis.length) {
      corpoImoveis.innerHTML =
        '<tr class="admin-table__linha"><td class="admin-table__vazio" colspan="5">Nenhum imóvel cadastrado.</td></tr>';
      return;
    }

    corpoImoveis.innerHTML = imoveis
      .map((item) => {
        const situacao = escaparHtml(item.status).toLowerCase();

        return `
          <tr class="admin-table__linha">
            <td class="admin-table__celula">
              <img src="${escaparHtml(item.fotoCapa || CAPA_PADRAO)}" class="admin-thumb-preview" alt="Capa do imóvel" />
            </td>
            <td class="admin-table__celula">
              <strong class="admin-table__titulo">${escaparHtml(item.titulo)}</strong>
              <small class="admin-table__sub">${escaparHtml(item.bairro)}</small>
            </td>
            <td class="admin-table__celula"><strong class="admin-table__preco">${escaparHtml(item.preco)}</strong></td>
            <td class="admin-table__celula">
              <span class="admin-status-tag admin-status-tag--${situacao}">${escaparHtml(item.status)}</span>
            </td>
            <td class="admin-table__celula">
              <div class="admin-row-actions">
                <button type="button" class="admin-btn admin-btn--sm admin-btn--neutro" data-acao="editar" data-id="${escaparHtml(item.id)}" aria-label="Editar imóvel">✏️</button>
                <button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-acao="excluir" data-id="${escaparHtml(item.id)}" aria-label="Excluir imóvel">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  };

  /* ----------------------------------------------------------- Propostas */
  const desenharPropostas = () => {
    const propostas = lerPropostas();

    if (contadorPropostas) contadorPropostas.textContent = String(propostas.length);
    if (!corpoPropostas) return;

    if (!propostas.length) {
      corpoPropostas.innerHTML =
        '<tr class="admin-table__linha"><td class="admin-table__vazio" colspan="7">Nenhuma proposta recebida ainda.</td></tr>';
      return;
    }

    corpoPropostas.innerHTML = propostas
      .map((proposta) => {
        const numero = String(proposta.telefone ?? '').replace(/\D/g, '');
        const recado = encodeURIComponent(
          `Olá ${proposta.nome}, recebi sua proposta de anúncio do imóvel no valor de ${proposta.valor}`,
        );
        const miniaturas = (proposta.fotos || [])
          .slice(0, 3)
          .map((foto) => `<img src="${escaparHtml(foto)}" class="admin-proposta-foto" alt="Foto enviada pelo cliente" />`)
          .join('');

        return `
          <tr class="admin-table__linha">
            <td class="admin-table__celula"><small class="admin-table__sub">${escaparHtml(proposta.data)}</small></td>
            <td class="admin-table__celula"><strong class="admin-table__titulo">${escaparHtml(proposta.nome)}</strong></td>
            <td class="admin-table__celula">
              <a href="https://wa.me/55${escaparHtml(numero)}?text=${recado}" target="_blank" rel="noopener noreferrer" class="admin-btn admin-btn--sm admin-btn--primary admin-btn--whatsapp">
                💬 ${escaparHtml(proposta.telefone)}
              </a>
            </td>
            <td class="admin-table__celula">${escaparHtml(proposta.endereco)}</td>
            <td class="admin-table__celula"><strong class="admin-table__preco">${escaparHtml(proposta.valor || 'A combinar')}</strong></td>
            <td class="admin-table__celula">
              <div class="admin-proposta-fotos">${miniaturas}</div>
            </td>
            <td class="admin-table__celula">
              <button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-acao="excluir-proposta" data-id="${escaparHtml(proposta.id)}">Excluir</button>
            </td>
          </tr>
        `;
      })
      .join('');
  };

  /* --------------------------------------------------------------- Fotos */
  const desenharPrevia = () => {
    if (!previaFotos) return;

    previaFotos.innerHTML = fotos
      .map(
        (fonte, indice) => `
          <button type="button" class="admin-photo-item ${indice === indiceCapa ? 'is-cover' : ''}" data-foto-indice="${indice}" aria-label="Usar como foto de capa">
            <img src="${escaparHtml(fonte)}" class="admin-photo-item__img" alt="" />
            ${indice === indiceCapa ? '<span class="admin-photo-cover-tag">Capa</span>' : ''}
          </button>
        `,
      )
      .join('');
  };

  if (entradaFotos) {
    entradaFotos.addEventListener('change', (evento) => {
      const arquivos = Array.from(evento.target.files || []);
      fotos = [];
      indiceCapa = 0;

      arquivos.forEach((arquivo) => {
        const leitor = new FileReader();
        leitor.onload = (leitura) => {
          fotos.push(leitura.target.result);
          desenharPrevia();
        };
        leitor.readAsDataURL(arquivo);
      });
    });
  }

  if (previaFotos) {
    previaFotos.addEventListener('click', (evento) => {
      const alvo = evento.target.closest('[data-foto-indice]');
      if (!alvo) return;

      indiceCapa = Number(alvo.dataset.fotoIndice);
      desenharPrevia();
    });
  }

  /* ---------------------------------------------------------- Formulario */
  const limparFormulario = () => {
    formulario.reset();
    campo('id').value = '';
    if (tituloFormulario) tituloFormulario.textContent = 'Cadastrar Novo Imóvel';
    if (botaoCancelar) botaoCancelar.hidden = true;
    fotos = [];
    indiceCapa = 0;
    if (previaFotos) previaFotos.innerHTML = '';
  };

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const idEdicao = campo('id').value;

    imoveis = salvarImovel({
      id: idEdicao || `imovel_${Date.now()}`,
      titulo: campo('titulo').value,
      preco: campo('preco').value,
      status: campo('status').value,
      bairro: campo('bairro').value,
      quartos: Number(campo('quartos').value),
      banheiros: Number(campo('banheiros').value),
      vagas: Number(campo('vagas').value),
      area: Number(campo('area').value),
      descricao: campo('descricao').value,
      fotoCapa: fotos[indiceCapa] || CAPA_PADRAO,
      galeria: fotos,
    });

    limparFormulario();
    desenharImoveis();
  });

  if (botaoCancelar) botaoCancelar.addEventListener('click', limparFormulario);

  const editar = (id) => {
    const item = imoveis.find((registro) => registro.id === id);
    if (!item) return;

    campo('id').value = item.id;
    campo('titulo').value = item.titulo;
    campo('preco').value = item.preco;
    campo('status').value = item.status;
    campo('bairro').value = item.bairro;
    campo('quartos').value = item.quartos;
    campo('banheiros').value = item.banheiros;
    campo('vagas').value = item.vagas;
    campo('area').value = item.area;
    campo('descricao').value = item.descricao || '';

    if (tituloFormulario) tituloFormulario.textContent = 'Editar Imóvel';
    if (botaoCancelar) botaoCancelar.hidden = false;

    if (item.galeria?.length) {
      fotos = item.galeria;
      indiceCapa = 0;
      desenharPrevia();
    }

    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* --------------------------------------------- Delegacao das acoes */
  corpoImoveis.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;

    const { acao, id } = botao.dataset;

    if (acao === 'editar') {
      editar(id);
      return;
    }

    if (acao === 'excluir' && window.confirm('Remover este imóvel da vitrine?')) {
      imoveis = removerImovel(id);
      desenharImoveis();
    }
  });

  if (corpoPropostas) {
    corpoPropostas.addEventListener('click', (evento) => {
      const botao = evento.target.closest('[data-acao="excluir-proposta"]');
      if (!botao) return;

      if (window.confirm('Excluir esta proposta de anúncio?')) {
        removerProposta(botao.dataset.id);
        desenharPropostas();
      }
    });
  }

  desenharImoveis();
  desenharPropostas();

  return { destroy: () => {} };
};

/* Entrada da pagina: o painel e uma pagina so, sem outros modulos para
   orquestrar, entao nao ha o que ganhar com um arquivo de bootstrap. */
initAdmin();
