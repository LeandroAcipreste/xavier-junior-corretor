# Frontend Vanilla Engineering Skill

## Stack

* HTML5
* CSS3
* JavaScript ES6+
* ES Modules
* DOM APIs
* GSAP
* ScrollTrigger
* Lenis
* Three.js quando necessário

Não introduza frameworks ou bibliotecas sem necessidade.

---

## Arquitetura

Use arquitetura modular:

```text
src/
├── pages/
├── components/
├── modules/
├── services/
├── utils/
├── constants/
├── assets/
└── styles/
```

Organize por responsabilidade e domínio. Não crie camadas ou arquivos sem necessidade.

---

## JavaScript

Use:

* ES Modules
* Module Pattern
* Facade Pattern
* Factory Pattern
* Strategy Pattern
* Observer Pattern
* Pub/Sub Pattern quando necessário
* Dependency Injection quando reduzir acoplamento
* Separation of Concerns
* Composition over Inheritance

Princípios obrigatórios:

* SOLID
* DRY
* KISS
* YAGNI
* SRP
* Clean Code

Aplique padrões apenas quando resolverem um problema real.

---

## DOM

Não concentre toda a aplicação em um arquivo.

Separe:

```text
DOM
↓
Controllers / Modules
↓
Services / State
↓
Utilities
```

Evite manipulação duplicada do DOM.

Cacheie elementos reutilizados.

Centralize eventos quando apropriado usando Event Delegation.

---

## Componentes

Para componentes HTML reutilizáveis, use:

* Template Pattern
* Factory Pattern
* Composition Pattern

Um componente deve possuir responsabilidade única.

Não misture estrutura, comportamento e regra de negócio sem necessidade.

---

## CSS

CSS controla a aparência e as animações.

JavaScript controla comportamento, estado e eventos.

Nunca coloque CSS inline.

Nunca use:

```html
style=""
```

Nem:

```javascript
element.style.color = "red";
```

Todo estilo deve estar nos arquivos CSS apropriados.

---

## Animações

Prioridade:

1. CSS para animações e transições visuais.
2. GSAP para timelines, ScrollTrigger e animações complexas.
3. JavaScript apenas controla o estado ou dispara a animação.

Não use JavaScript para reproduzir animações que o CSS resolve adequadamente.

---

## HTML

* HTML semântico.
* Nenhuma tag sem `class`.
* Não use handlers inline (`onclick`, `onchange`, etc.).
* Não coloque `<script>` dentro do HTML de componentes.
* Não misture comportamento com marcação.

---

## Performance

Evite:

* queries repetidas no DOM;
* listeners desnecessários;
* reflows/repaints excessivos;
* animações de propriedades caras;
* cálculos repetidos durante scroll.

Use:

* `transform`
* `opacity`
* `requestAnimationFrame`
* Event Delegation
* Debounce/Throttle quando necessário
* `DocumentFragment` para múltiplas inserções

---

## Qualidade

Antes de finalizar:

* arquitetura preservada;
* módulos com responsabilidade clara;
* padrões aplicados apenas quando necessários;
* sem código duplicado;
* sem CSS inline;
* sem handlers inline;
* sem lógica de negócio no DOM;
* sem imports não utilizados;
* sem `console.log`, `debugger` ou código morto;
* animações separadas do comportamento;
* código compatível com produção.

A solução mais simples e correta tem prioridade sobre abstrações complexas.
