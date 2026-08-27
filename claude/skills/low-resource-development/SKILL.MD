# LOW RESOURCE DEVELOPMENT

## Regra principal

Minimize o consumo de CPU e memória durante o desenvolvimento.

Antes de executar qualquer comando, avalie se ele é necessário.

## Execução

* Execute processos pesados sequencialmente.
* Nunca execute mais de um processo pesado simultaneamente.
* Não deixe processos em execução após o término da tarefa.

## Não executar automaticamente

* `npm run dev`
* servidores
* processos `watch`
* navegador
* build completo
* suíte completa de testes
* automação visual

Execute apenas quando solicitado ou indispensável.

## Validação

Use a ordem:

1. Revisão estática do código
2. Verificação específica necessária
3. Teste específico
4. Build completo apenas se necessário

Nunca use uma validação pesada quando uma validação simples for suficiente.

## Tarefas complexas

Para animações, interfaces complexas ou funcionalidades grandes:

1. Analise
2. Implemente
3. Revise
4. Valide

Execute uma etapa por vez.

## Projeto

* Leia apenas arquivos relevantes.
* Não pesquise repetidamente os mesmos arquivos.
* Nunca faça varreduras desnecessárias em `node_modules`, `dist` ou arquivos gerados.

## Finalização

Encerre qualquer processo iniciado para validação quando ele não for mais necessário.

Priorize sempre:

**mínimo de processos + execução sequencial + validação direcionada**
