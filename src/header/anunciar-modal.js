/**
 * MODAL ANUNCIE SUA CASA
 * Gerencia a abertura, fechamento e envio do formulário de anúncio de imóveis.
 *
 * O travamento da página vem de travar-scroll.js, e não de mexer no overflow
 * do body: com o scroll suave ligado, quem rola a página é o Lenis, e o
 * overflow do body não o segura - o fundo continuava rolando por trás do
 * modal. O serviço para o motor e trava por classe, nessa ordem.
 */

import { lockScroll, unlockScroll } from '../services/travar-scroll.js';
import { adicionarProposta } from '../services/propostas.js';

/* O CSS decide como a mensagem aparece; aqui so dizemos que ela apareceu. */
const CLASSE_SUCESSO_VISIVEL = 'anunciar-modal__success--visivel';

export function initAnunciarModal() {
  const overlay = document.getElementById('anunciar-modal-overlay');
  const modal = document.getElementById('anunciar-modal');
  const closeBtn = document.getElementById('anunciar-modal-close');
  const form = document.getElementById('anunciar-modal-form');
  const fileInput = document.getElementById('anunciar-fotos');
  const thumbnailsContainer = document.getElementById('anunciar-thumbnails');
  const successMessage = document.getElementById('anunciar-success');
  const dropzone = document.getElementById('anunciar-dropzone');
  const valorInput = document.getElementById('anunciar-valor');

  if (!overlay || !modal) return null;

  let selectedFiles = [];

  const openModal = (e) => {
    if (e) e.preventDefault();
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
  };

  const closeModal = () => {
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
  };

  // Botões de gatilho no header, menu mobile e rodapé
  const triggers = document.querySelectorAll('a[href="#anunciar"], [data-action="anunciar"]');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Máscara simples de Moeda para o Valor
  if (valorInput) {
    valorInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (!value) {
        e.target.value = '';
        return;
      }
      value = (parseInt(value, 10) / 100).toFixed(2) + '';
      value = value.replace('.', ',');
      value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      e.target.value = 'R$ ' + value;
    });
  }

  // Renderiza miniaturas das fotos selecionadas
  const renderThumbnails = () => {
    if (!thumbnailsContainer) return;
    thumbnailsContainer.innerHTML = '';

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const thumb = document.createElement('div');
        thumb.className = 'anunciar-modal__thumb';
        thumb.innerHTML = `
          <img class="anunciar-modal__thumb-img" src="${e.target.result}" alt="Foto ${index + 1}">
          <button type="button" class="anunciar-modal__thumb-remove" data-index="${index}">&times;</button>
        `;
        thumbnailsContainer.appendChild(thumb);

        thumb.querySelector('.anunciar-modal__thumb-remove').addEventListener('click', (evt) => {
          evt.stopPropagation();
          selectedFiles.splice(index, 1);
          renderThumbnails();
        });
      };
      reader.readAsDataURL(file);
    });
  };

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      selectedFiles = [...selectedFiles, ...files];
      renderThumbnails();
    });
  }

  // Drag and drop no Dropzone
  if (dropzone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = Array.from(dt.files);
      selectedFiles = [...selectedFiles, ...files];
      renderThumbnails();
    });
  }

  // Envio do formulário
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const nome = document.getElementById('anunciar-nome')?.value || '';
      const telefone = document.getElementById('anunciar-telefone')?.value || '';
      const endereco = document.getElementById('anunciar-endereco')?.value || '';
      const valor = document.getElementById('anunciar-valor')?.value || '';

      // Converte fotos para Base64 para salvar no localStorage
      const fotosBase64 = await Promise.all(
        selectedFiles.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (evt) => resolve(evt.target.result);
              reader.readAsDataURL(file);
            })
        )
      );

      const novaProposta = {
        id: 'prop_' + Date.now(),
        nome,
        telefone,
        endereco,
        valor,
        fotos: fotosBase64,
        data: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'Pendente',
      };

      /* Quem sabe onde a proposta mora e o servico; aqui so a entregamos. */
      adicionarProposta(novaProposta);

      if (successMessage) {
        successMessage.classList.add(CLASSE_SUCESSO_VISIVEL);
      }

      form.reset();
      selectedFiles = [];
      if (thumbnailsContainer) thumbnailsContainer.innerHTML = '';
      if (submitBtn) submitBtn.disabled = false;

      setTimeout(() => {
        if (successMessage) successMessage.classList.remove(CLASSE_SUCESSO_VISIVEL);
        closeModal();
      }, 3500);
    });
  }

  return {
    open: openModal,
    close: closeModal,
  };
}
