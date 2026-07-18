# COMPONENT ARCHITECTURE

**Status:** Aprovado

**Versão:** 1.0

**Última atualização:** 01/07/2026

---

# Objetivo

Definir a arquitetura oficial dos componentes da interface.

Este documento estabelece como novos componentes deverão ser construídos, organizados e evoluídos.

---

# Princípios

Todo componente deverá possuir:

- responsabilidade única;
- baixo acoplamento;
- alta reutilização;
- fácil manutenção;
- comportamento previsível.

---

# Independência

Componentes nunca deverão:

- acessar APIs;
- executar regras de negócio;
- conhecer entidades do domínio;
- acessar banco de dados.

Componentes apenas recebem dados.

---

# Estrutura

Todo componente deverá possuir, quando aplicável:

Header

↓

Body

↓

Footer

Essa organização facilita consistência visual.

---

# Estados

Sempre que possível, componentes deverão suportar:

- Default
- Loading
- Disabled
- Error
- Empty

---

# Composição

Sempre preferir composição em vez de componentes gigantes.

Exemplo:

Card

↓

Card.Header

↓

Card.Body

↓

Card.Footer

---

# Responsabilidade

Um componente deverá resolver apenas um problema.

Exemplos corretos:

Button

Modal

Status Badge

Search Bar

Exemplos incorretos:

MegaCard

SuperPanel

WidgetCompleto

---

# Props

Toda configuração deverá ocorrer por propriedades.

Evitar dependências externas.

---

# Eventos

Eventos deverão seguir nomenclatura consistente.

Exemplos:

- onClick
- onChange
- onClose
- onConfirm
- onSubmit

---

# Estilização

Toda estilização deverá utilizar exclusivamente os Design Tokens definidos em:

DESIGN-SYSTEM.md

Não utilizar valores arbitrários.

---

# Responsividade

Todo componente deverá funcionar em:

- Mobile
- Tablet
- Desktop

Mobile possui prioridade.

---

# Performance

Componentes deverão evitar:

- renderizações desnecessárias;
- estados duplicados;
- cálculos pesados.

---

# Acessibilidade

Sempre considerar:

- contraste;
- foco;
- navegação por teclado;
- leitores de tela;
- áreas de toque confortáveis.

---

# Organização

A estrutura recomendada será:

Component/

Component.tsx

Component.types.ts

Component.test.tsx

index.ts

Arquivos adicionais poderão existir quando necessário.

---

# Evolução

Novos componentes deverão:

1. ser documentados;
2. seguir esta arquitetura;
3. respeitar o Design System;
4. utilizar componentes existentes sempre que possível.

---

# Componentes de Domínio

Componentes de domínio representam entidades do sistema (Cliente, Contrato, etc.).

Regras:

- compõem componentes de UI do Design System (ex: `ClienteCard` compõe `Card.Root`)
- nunca substituem responsabilidades estruturais do Card
- responsáveis apenas pela apresentação do conteúdo da entidade
- navegação, estado e loading são gerenciados externamente (pela página ou hook)

Exemplo:
```text
Página
↓
ClienteCard (domínio)
↓
Card.Root, Card.Header, Card.Body (Design System)
```

---

# Restrições

Não será permitido:

- lógica de negócio;
- acesso direto a serviços;
- acesso direto à API;
- duplicação de componentes.

---

# Referências

- DESIGN-SYSTEM.md
- UI-COMPONENTS.md
- FRONTEND.md
- UX.md