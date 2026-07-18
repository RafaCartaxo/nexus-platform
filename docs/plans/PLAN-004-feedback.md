# Atualização — PLAN-004 Feedback Global

## Objetivo

Refinar a estratégia de implementação do Feedback Global para evitar retrabalho durante a migração da aplicação e estabelecer um padrão único para comunicação com o operador.

Esta atualização complementa o PLAN-004 original.

---

# Estratégia de Implementação

A implementação deverá seguir a seguinte ordem:

## Fase 1

Implementar a infraestrutura.

Escopo:

- FeedbackProvider
- Hook `useFeedback()`
- Componente `FeedbackOverlay`
- Context
- Controle de fila (caso necessário)

Nenhuma tela deverá ser alterada nesta etapa.

---

## Fase 2

Migrar gradualmente os consumidores.

Cada tela deverá ser migrada completamente antes da próxima.

Ordem recomendada:

1. Formulário de Cliente
2. Formulário de Contrato
3. Formulário de Gasto
4. Formulário de Pagamento

Cada migração deverá incluir:

- integração com Feedback Global;
- remoção de estados locais de loading;
- remoção de Toasts locais;
- remoção de lógica duplicada de feedback.

Cada arquivo deverá ser alterado apenas uma vez.

---

## Fase 3

Após todos os consumidores estarem utilizando o Feedback Global:

- remover definitivamente `Button.loading`;
- remover implementações locais de loading;
- remover Toasts antigos.

---

## Fase 4

Realizar pequenos refactors restantes.

Exemplos:

- RotaPage
- ContratoDetail
- OperacoesDashboard
- PagamentoModal

---

# FeedbackOverlay

O sistema utilizará um único componente responsável por exibir feedback operacional.

Nome:

FeedbackOverlay

Ele será controlado exclusivamente pelo FeedbackProvider.

---

# Posicionamento

O FeedbackOverlay deverá ser exibido sempre na região superior da tela.

Não deverão existir implementações diferentes para cada módulo.

O operador deverá aprender apenas um local para acompanhar o estado das operações.

---

# Estados

## Loading

Objetivo:

Informar que uma operação está em andamento.

Características:

- barra fixa superior;
- altura reduzida;
- ícone de carregamento;
- mensagem descritiva;
- não bloquear a interface.

Exemplo:

```
⟳ Salvando contrato...
```

---

## Sucesso

Objetivo:

Confirmar rapidamente que a operação foi concluída.

Características:

- mesmo posicionamento;
- ícone de sucesso;
- desaparecimento automático após curto período.

Exemplo:

```
✓ Contrato salvo
```

---

## Erro

Objetivo:

Comunicar falha durante a operação.

Características:

- mesmo posicionamento;
- destaque visual;
- possibilidade futura de Retry quando aplicável.

Exemplo:

```
⚠ Erro ao salvar contrato
```

---

# Consistência

Todos os estados deverão utilizar exatamente o mesmo componente.

Não será permitido:

- Toast em alguns módulos;
- Banner em outros;
- Modal para feedback simples;
- Barras diferentes por tela.

Todo feedback operacional deverá utilizar exclusivamente o FeedbackOverlay.

---

# API Recomendada

O Feedback Global deverá abstrair completamente o fluxo de loading.

Em vez de:

```ts
setLoading(true)

try {
  ...
  showSuccess(...)
} catch {
  showError(...)
} finally {
  setLoading(false)
}
```

A implementação deverá preferencialmente utilizar uma API semelhante a:

```ts
await feedback.run({
  loading: "Salvando contrato...",
  success: "Contrato salvo.",
  error: "Erro ao salvar contrato.",
  action: async () => {
    await contratoService.create(data);
  },
});
```

A responsabilidade por exibir:

- loading;
- sucesso;
- erro;
- encerramento do ciclo;

deverá pertencer ao FeedbackProvider.

As telas deverão apenas informar:

- mensagens;
- operação a ser executada.

---

# Validações

As validações dos formulários deverão permanecer organizadas por módulo.

Exemplo:

```
cliente/
    schemas/

contrato/
    schemas/

gasto/
    schemas/

pagamento/
    schemas/
```

Não deverão existir validadores centralizados em `shared`, salvo utilidades realmente reutilizáveis.

---

# Preview de Cálculos

O frontend poderá executar cálculos exclusivamente para fins de pré-visualização da interface.

Exemplo:

- Valor Final do Contrato durante a criação.

Esses cálculos:

- não possuem validade oficial;
- não representam regra de negócio;
- deverão ser sempre recalculados e validados pelo backend antes da persistência.

O backend permanece como única fonte oficial das regras financeiras.

---

# Critérios de Conclusão

A implementação será considerada concluída quando:

- nenhum formulário utilizar loading próprio;
- nenhum módulo utilizar Toast próprio;
- todo feedback operacional utilizar o FeedbackOverlay;
- Button não possuir mais propriedade `loading`;
- todas as validações estiverem organizadas por módulo;
- cálculos exibidos no frontend forem exclusivamente informativos;
- nenhuma regra de negócio financeira existir apenas no frontend.