# PLAN-003 — Central de Operações

**Status:** Aprovado

**Versão:** 3.0

**Última atualização:** 02/07/2026

---

# Objetivo

Transformar a tela inicial do sistema em uma Central de Operações, permitindo que o operador organize toda a rotina diária de cobranças a partir de um único lugar.

A Central deverá reduzir ao máximo a necessidade de navegação entre módulos, permitindo identificar, atender e concluir cobranças com o menor número possível de interações.

Esta funcionalidade não substitui os módulos de Clientes ou Contratos.

Ela representa o principal fluxo operacional do sistema.

---

# Princípio Operacional

A Central de Operações deverá responder a uma única pergunta:

**"Quem preciso atender agora?"**

Todas as decisões de interface deverão reduzir o tempo necessário para localizar um cliente, iniciar contato, registrar um pagamento e seguir para o próximo atendimento.

Os módulos de Clientes e Contratos continuam sendo responsáveis pelas consultas detalhadas e pelas operações financeiras.

A Central apenas organiza o trabalho diário.

---

# Problema

Hoje o operador precisa navegar por diversas telas para localizar clientes com cobranças previstas.

Fluxo atual:

Clientes

↓

Cliente

↓

Contrato

↓

Parcelas

↓

Identificar cobrança

↓

Entrar em contato

Embora funcional, esse fluxo não atende à rotina operacional diária.

---

# Objetivos da Evolução

Ao abrir o sistema, o operador deverá visualizar imediatamente:

- Quanto espera receber hoje;
- Quanto já recebeu hoje;
- Quantos clientes ainda precisam ser atendidos;
- Quais clientes devem ser contatados;
- Qual é o próximo atendimento recomendado.

---

# Estrutura da Tela

A Central será organizada em quatro áreas.

---

# 1. Resumo do Dia

Os indicadores permanecem no topo da tela.

Indicadores:

- Estimado para Hoje;
- Recebido Hoje;
- Clientes Pendentes;
- Resultado do Dia.

Todos os indicadores deverão permanecer navegáveis.

Ao selecionar qualquer indicador, o operador deverá visualizar as movimentações responsáveis pelo valor apresentado.

Exemplos:

Recebido Hoje

↓

Lista de pagamentos

Estimado

↓

Lista das cobranças previstas

Clientes Pendentes

↓

Lista dos clientes ainda não atendidos

---

# 2. Cobranças do Dia

Lista contendo exclusivamente clientes previstos para cobrança na data atual.

Cada item deverá apresentar:

- Nome do Cliente;
- Valor previsto;
- Quantidade de parcelas pendentes;
- Situação financeira;
- Distância aproximada (quando disponível).

---

# Estados Financeiros

Os contratos poderão apresentar os seguintes estados financeiros:

- Previsto;
- Parcial;
- Pago;
- Atrasado.

Esses estados representam exclusivamente informações financeiras.

---

# Estados Operacionais

A Central poderá representar o andamento operacional do atendimento através dos estados:

- Pendente;
- Em Atendimento;
- Concluído;
- Não Localizado;
- Promessa de Pagamento.

Esses estados possuem finalidade exclusivamente operacional.

Eles não alteram qualquer regra financeira.

---

# Ações Rápidas

Cada cliente deverá disponibilizar diretamente:

- Abrir Contrato;
- WhatsApp;
- Ligação;
- Navegar (quando localização disponível).

Essas ações deverão permanecer visíveis, evitando menus intermediários.

---

# WhatsApp

Ao selecionar WhatsApp, deverá ser aberta uma conversa utilizando o telefone cadastrado do cliente.

Uma mensagem padrão deverá ser preenchida automaticamente.

Exemplo:

Olá, {{Nome}}.

Passando para lembrar que hoje existe uma parcela prevista para pagamento no valor de {{Valor}}.

Qualquer dúvida estou à disposição.

O operador poderá editar a mensagem antes do envio.

---

# Ligação

Ao selecionar Ligação, deverá ser aberto o discador do dispositivo utilizando o telefone cadastrado.

---

# Navegação

Quando existir localização cadastrada, deverá ser possível abrir diretamente o aplicativo de navegação do dispositivo.

Nesta versão, o sistema utilizará aplicativos externos (Google Maps ou equivalente).

Não haverá mapa interno.

---

# Abrir Contrato

Ao selecionar Abrir Contrato, o sistema deverá navegar diretamente para o contrato correspondente.

Não será necessário acessar previamente o cadastro do cliente.

---

# Atualização Automática

Sempre que todas as cobranças previstas daquele cliente forem quitadas, o sistema deverá:

- remover automaticamente o cliente da lista de pendências;
- atualizar os indicadores do dia;
- atualizar a rota de cobrança (quando iniciada).

Não será permitido marcar manualmente um cliente como pago.

O estado operacional deverá refletir automaticamente as movimentações financeiras registradas.

---

# 3. Rota de Cobrança

A Rota de Cobrança será implementada como uma **página SPA separada** (`/rota`), não como área embutida na Central.

Seu objetivo é organizar a sequência diária de visitas, exibindo um cliente por vez.

## Página Central (`/`)

A Central exibe apenas:

- Quantidade de clientes;
- Distância aproximada total;
- Botão **Iniciar Rota** (navega para `/rota`).

---

## Página `/rota`

Ao acessar a rota, o operador visualiza um único cliente em destaque com todas as ações disponíveis:

- **Navegar** (GPS → Google Maps);
- **WhatsApp**;
- **Ligar**;
- **Abrir Contrato**.

Além disso, a página oferece:

- Indicador de progresso: "3 de 10";
- Botões **Anterior** e **Próximo** para navegação manual;
- Botão **Encerrar Rota** (X) para retornar à Central.

---

# Fluxo da Rota

Central (`/`)

↓

Iniciar Rota (navega para `/rota`)

↓

Cliente Atual (card único)

↓

Abrir Contrato → Pagamento → Retorno

↓

Auto-refresh detecta cliente quitado → avança ao próximo

↓

Todos atendidos → "Nenhuma cobrança pendente"

↓

Encerrar Rota → volta à Central

---

# Atualização automática

- Ao retornar de um pagamento, `visibilitychange` re-faz a consulta;
- Se o cliente atual foi quitado, ele desaparece da lista e o índice avança automaticamente;
- Se o índice exceder o tamanho da lista, ajusta para o último item disponível.

---

# Ordenação

Nesta primeira versão, a lista deverá seguir a seguinte prioridade:

1. Cobranças atrasadas;
2. Cobranças previstas para hoje.

Dentro de cada grupo, priorizar:

- menor distância (quando disponível);
- ordem de vencimento;
- ordem de criação.

Algoritmos avançados de otimização não fazem parte desta implementação.

---

# 4. Histórico Operacional

Ao final da tela deverá existir um resumo simples dos atendimentos realizados durante o dia.

Cada registro poderá informar:

- Cliente;
- Horário;
- Resultado.

Exemplos:

- Pagamento registrado;
- Promessa de Pagamento;
- Não localizado.

Essa funcionalidade possui finalidade exclusivamente operacional.

---

# Responsabilidade

A Central de Operações não executa regras financeiras.

Toda movimentação financeira continuará sendo realizada exclusivamente pelos módulos de:

- Contratos;
- Pagamentos;
- Caixa.

A Central apenas organiza e acelera o fluxo operacional.

---

# Critérios de Aceitação

- O operador identifica rapidamente quem precisa ser atendido;
- O operador consegue iniciar contato em um único toque;
- O operador consegue abrir diretamente o contrato correspondente;
- Os indicadores permanecem funcionando normalmente;
- O operador consegue iniciar navegação até o cliente;
- O operador consegue concluir sucessivos atendimentos sem retornar manualmente à lista principal;
- O sistema remove automaticamente clientes concluídos da lista operacional;
- Nenhuma regra financeira existente é alterada.

---

# Roadmap

## V1

- Indicadores do dia;
- Cobranças do dia;
- WhatsApp;
- Ligação;
- Abrir contrato.

---

## V2

Adicionar:

- Navegação por GPS;
- Rota de Cobrança (página `/rota`);
- Distância aproximada;
- Próximo Cliente (navegação manual + auto-avanço);
- Atualização automática da lista.

---

## V3

**Status:** Em andamento

Adicionar:

- Histórico Operacional;
- Promessas de Pagamento;
- Estados operacionais (Visitado, Não Localizado, Promessa de Pagamento);
- GPS contínuo (watchPosition) para ordenação dinâmica;
- Agrupamento por região;
- Filtros rápidos;
- Busca operacional.

---

## V4

Adicionar:

- Rota otimizada automaticamente;
- Priorização inteligente;
- Indicadores operacionais;
- Reorganização dinâmica da rota;
- Estatísticas de produtividade.

---

# Restrições

Esta implementação não deverá alterar:

- regras de pagamento;
- regras de parcelas;
- regras de contratos;
- regras do caixa;
- fluxo financeiro existente.

Todas as regras financeiras permanecem definidas em `BUSINESS-RULES.md`.

---

# Evolução

A Central deverá evoluir continuamente para reduzir o número de interações necessárias durante a operação diária.

Toda nova funcionalidade deverá responder positivamente à seguinte pergunta:

**"Essa alteração reduz o tempo necessário para atender um cliente?"**

Caso contrário, sua implementação deverá ser reavaliada.

---

# Referências

- NORTH-STAR.md
- UX.md
- BUSINESS-RULES.md
- DOMAIN.md
- ARCHITECTURE.md
- DESIGN-SYSTEM.md