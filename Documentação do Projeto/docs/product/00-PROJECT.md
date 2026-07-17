# PROJECT

**Status:** Aprovado

**Versão:** 1.1

**Última atualização:** 27/06/2026

---

# Objetivo

Desenvolver um sistema de gestão de cobranças em campo que permita controlar clientes, contratos, parcelas, pagamentos, gastos e caixa de forma simples, rápida e confiável.

O sistema deve centralizar toda a operação diária do cobrador, reduzindo controles paralelos e fornecendo informações consistentes para acompanhamento financeiro e tomada de decisão.

---

# Visão do Produto

O produto foi concebido para atender operações de crediário com cobranças recorrentes, nas quais o operador realiza visitas presenciais aos clientes para registrar pagamentos, acompanhar contratos e controlar o fluxo financeiro da operação.

O sistema prioriza velocidade, simplicidade e rastreabilidade, permitindo que todas as movimentações financeiras possam ser consultadas e auditadas a qualquer momento.

---

# Público-Alvo

O sistema destina-se a operadores responsáveis pela gestão de clientes e cobranças em campo.

Inicialmente, o projeto será utilizado por um único operador, porém sua arquitetura deverá permitir evolução futura para múltiplos usuários sem necessidade de reestruturação significativa.

---

# Escopo

O sistema contempla os seguintes módulos:

* Cliente
* Contrato
* Parcela
* Pagamento
* Caixa
* Gasto
* Dashboard
* Mapa

Cada módulo deverá atuar de forma integrada, preservando a separação de responsabilidades definida pela arquitetura do projeto.

---

# Funcionalidades Principais

O sistema deverá permitir:

* Cadastro e manutenção de clientes;
* Cadastro e gerenciamento de contratos;
* Cálculo automático de juros;
* Geração automática de parcelas;
* Registro de pagamentos integrais e parciais;
* Controle automático do saldo devedor;
* Controle operacional do Caixa Base;
* Registro e categorização de gastos;
* Consolidação automática de indicadores financeiros;
* Visualização de clientes em mapa;
* Consulta completa do histórico financeiro da operação.

---

# Princípios do Produto

O desenvolvimento do sistema deverá respeitar os seguintes princípios:

* Simplicidade operacional;
* Mínima interação do usuário;
* Consistência das informações;
* Rastreabilidade completa das movimentações;
* Evolução incremental;
* Facilidade de manutenção.

---

# Fora do Escopo

Não fazem parte do objetivo deste projeto:

* ERP;
* Sistema contábil;
* Emissão de notas fiscais;
* Controle de estoque;
* Gestão financeira empresarial;
* CRM completo;
* Gestão bancária.

---

# Premissas

* O sistema deverá operar inicialmente em ambiente local.
* Toda regra de negócio será implementada no backend.
* O frontend será responsável apenas pela apresentação e interação com o usuário.
* Toda movimentação financeira deverá possuir rastreabilidade.
* A documentação oficial será a fonte única de verdade para decisões de negócio e arquitetura.

---

# Critérios de Sucesso

O projeto será considerado bem-sucedido quando permitir que toda a rotina operacional de cobrança seja executada exclusivamente através do sistema, sem dependência de controles externos.

Além disso, o sistema deverá garantir que qualquer indicador financeiro apresentado possa ser rastreado até sua origem.

---

# Referências

* NORTH-STAR.md
* DOMAIN.md
* BUSINESS-RULES.md
* ARCHITECTURE.md
* CONVENTIONS.md
* UX.md
* ADR-001
* ADR-002
