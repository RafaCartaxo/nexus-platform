# CONVENTIONS

**Status:** Aprovado  
**Versão:** 1.1  
**Última atualização:** 27/06/2026  

---

# Objetivo

Definir padrões de código e nomenclatura para garantir consistência, legibilidade e previsibilidade em todo o projeto.

Este documento não define arquitetura ou regras de negócio. Essas responsabilidades estão nos documentos de `engineering/` e `product/`.

---

# Convenções de Código

- Responsabilidade única (SRP)
- Evitar duplicação de lógica de negócio
- Preferir composição ao invés de herança
- Baixo acoplamento entre módulos
- Alta coesão dentro de cada módulo
- Código orientado ao domínio (Domain-Driven)
- Funções e métodos com única responsabilidade clara
- Lógica reutilizável extraída para função pura ou serviço específico
- Código previsível e fácil de mapear dentro da arquitetura

---

# Convenções de Camadas

Fluxo padrão obrigatório de execução:

```text
Controller → UseCase → Repository → Database
```

Regras:

- Controllers não contêm regras de negócio, apenas orquestração
- UseCases são responsáveis por toda regra de negócio da aplicação
- Repositories apenas persistem e consultam dados
- DTOs nunca contêm lógica de negócio
- Entidades não acessam infraestrutura externa (API, banco, storage)

---

# Convenções de Estrutura de Módulos

Cada módulo deve ser isolado e independente dentro do domínio.

Exemplo:

Cada módulo possui estrutura separada para backend e frontend:

```text
src/
  modules/
    cliente/
      presentation/
        controllers/
        dtos/
        routes/
      application/
      domain/
        entities/
        errors/
        services/
      infrastructure/
        repositories/
```

```text
src/
  modules/
    cliente/
      pages/
      components/
      hooks/
      services/
      types/
```

Regras:

- Cada módulo representa um contexto de domínio
- UseCases pertencem exclusivamente ao módulo
- Components não acessam UseCases diretamente (devem passar por hooks ou services)
- Não compartilhar lógica entre módulos sem abstração clara
- Dependências entre módulos devem ser explícitas e controladas

---

# Convenções de Nomenclatura

## Use Cases

```text
CreateClienteUseCase
RegisterPaymentUseCase
FinishContractUseCase
```

## Controllers

```text
CreateClienteController
```

## Repositories

- Interface: `IClienteRepository`
- Implementação: `ClienteRepository`

## DTOs

```text
CreateClienteInput
CreateClienteOutput
```

## Domain Errors

```text
ContratoJaFinalizadoError
ClienteNotFoundError
```

---

# Convenções de Domínio

- Entidades representam estado e comportamento do negócio
- Métodos de entidades devem representar ações do domínio (verbos)
- Nenhuma entidade deve acessar banco de dados, API ou camada externa
- Validações de regra de negócio podem existir em entidades ou UseCases, dependendo da complexidade
- Entidades devem ser independentes de frameworks
