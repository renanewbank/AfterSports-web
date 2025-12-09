# AfterSports Web (React + TypeScript + Vite)

Frontend web para o sistema **AfterSports** — gestão de **instrutores, aulas e reservas** — consumindo a API Spring Boot do repositório `aftersports-api`. Interface simples, responsiva e com **autenticação JWT**, **busca/cancelamento de reservas**, **geolocalização** para preencher latitude/longitude e **previsão do tempo** via Open-Meteo.

> **Repositórios**
>
> * Backend: `AfterSports-api` (Spring Boot)
> * Frontend (este): `AfterSports-web` (Vite + React + TS)

---

## 1) Principais funcionalidades

* **Autenticação**

  * Registro e Login (`/auth/login`, `/auth/register`)
  * Guarda de rota e cabeçalho `Authorization: Bearer <token>` nas chamadas à API
  * Perfil atual via `/api/auth/me`

* **Instrutores**

  * Listar, criar, editar e remover instrutores

* **Aulas**

  * Listar, criar, editar e remover aulas
  * Filtro por instrutor
  * **Geolocalização** (API do navegador) para preencher **lat/lon**
  * Detalhes da aula com **previsão do tempo (Open-Meteo)**

* **Reservas**

  * Criar reserva a partir da página de detalhes da aula
  * **Buscar por nome** do aluno
  * **Cancelar** reservas na página de detalhes da aula e na página de reservas

* **UX/Utilitários**

  * Formatação de moeda (BRL) e datas
  * Validações com Zod
  * Tabelas reutilizáveis, loaders e mensagens de erro

---

## 2) Arquitetura do frontend

```
src/
├─ components/          # Navbar, Table, Loader, ErrorMessage, etc.
├─ lib/                 # api.ts (axios), format.ts (datas/moedas)
├─ pages/               # Home, Instrutores, Aulas, Detalhe da Aula, Reservas, Login/Registro
├─ types/               # DTOs compatíveis com a API
├─ auth/                # (se gerado) AuthContext + ProtectedRoute
├─ App.tsx              # Rotas da aplicação
├─ main.tsx             # Bootstrapping do React/Router
└─ index.css / App.css  # Estilos
```

**Tecnologias:** React 18, TypeScript, Vite, Axios, React Router, Day.js, Zod, ESLint.

---

## 3) Como executar

### 3.1 Pré-requisitos

* **Node.js 18+** (ou 20+)
* npm ou pnpm/yarn

### 3.2 Desenvolvimento (com proxy para o backend local)

O projeto já está configurado para **proxy** `/api` → `http://localhost:8080` (ver `vite.config.ts`).
Basta ter o backend rodando em `localhost:8080`.

```bash
# instalar dependências
npm install

# rodar em dev (http://localhost:5173)
npm run dev
```

### 3.3 Build e preview

```bash
npm run build
npm run preview
```

---

## 4) Rotas/telas

* `/` — **Home**, status da API e atalhos
* `/instrutores` — CRUD completo
* `/aulas` — CRUD + filtro por instrutor
* `/aulas/:id` — Detalhes, **clima (Open-Meteo)**, listagem e **cancelamento** de reservas, criação de reserva
* `/reservas` — Busca por **nome** e **cancelamento**
* `/auth/login` e `/auth/register` — Autenticação

---

## 5) Integração com a API

* O Axios (`src/lib/api.ts`) centraliza chamadas.
* Em dev, usa **proxy** `/api` → backend local.
* Em produção, use `VITE_API_BASE` para apontar ao backend publicado.
* Autorização: o AuthContext (seu projeto já possui) injeta `Authorization: Bearer <token>` nos requests após login/registro.

---

## 6) Geolocalização e Clima

* **Geolocalização (navigator.geolocation)**

  * Na página **Aulas → formulário**, o botão “Usar minha localização” chama `navigator.geolocation.getCurrentPosition` e preenche **latitude/longitude** automaticamente.
  * Permissões devem ser concedidas pelo navegador.

* **Clima (Open-Meteo)**

  * Em **Detalhes da Aula**, a API do backend usa lat/lon e data da aula para buscar a previsão do dia (máx/mín/precip).

---

## 7) Scripts úteis

```bash
npm run dev       # inicia o servidor de desenvolvimento
npm run build     # build de produção (dist/)
npm run preview   # serve o build para inspeção local
npm run lint      # (se configurado) análise estática
```

---

## 8) Checklist de Requisitos

* **Arquitetura em camadas**: o front consome a **API REST** do backend MVC. ✔️
* **Frontend separado (React)**: interface completa navegável (sem desconto). ✔️
* **Autenticação (opcional no REST)**: telas de **Login/Registro** + uso de **JWT**. ✔️
* **Integração com API externa**: exibimos **clima** oriundo do backend (Open-Meteo). ✔️
* **CRUD ≥ 2 entidades**: Instrutores e Aulas; ainda exibimos/cadastramos/cancelamos **Reservas**. ✔️
* **Apresentação/UX**: páginas, tabelas, validações e mensagens de erro. ✔️
---

## 9) Fluxo rápido de validação

1. **Subir backend** (`aftersports-api`) em `localhost:8080`.
2. **Rodar front**: `npm run dev` → abrir `http://localhost:5173`.
3. **Login/Registro**: crie usuário ou entre com admin (se semeado no backend).
4. **Instrutores**: crie um instrutor.
5. **Aulas**: crie uma aula, use **“Usar minha localização”** para obter lat/lon.
6. **Clima**: abra a aula em **Detalhes** e verifique a previsão.
7. **Reservas**: crie reserva pela página de detalhes; busque por **nome** em **Reservas** e teste **cancelamento**.

---

## 10) Troubleshooting

* **Falha de CORS em produção**: habilite o domínio do front no CORS do backend.
* **Geolocalização não funciona**: o navegador pode exigir HTTPS (ou `localhost`) e permissão do usuário.
* **Clima não aparece**: confira se a aula tem lat/lon válidos e se o backend consegue chamar a Open-Meteo.
* **Sem autenticação após login**: verifique se o token está sendo salvo e enviado no header `Authorization`.

---

## 11) Licença

Projeto acadêmico/educacional.
Sinta-se à vontade para adaptar.

---

### Autor do Projeto

* César Borba
* Renan Ewbank
