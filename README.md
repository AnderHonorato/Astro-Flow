# Astro Flow

Mapa natal, trânsitos e horóscopo calculados sobre a carta de cada pessoa —
não sobre o signo solar. Este repositório reúne os dois projetos originais em
um único monorepo: a landing editorial **Trinta Graus** e a plataforma
**Astros** com landing responsiva, aplicativo web, backend e motor próprio.

Implementação do handoff de design em
[`templates/astrology-app-landing-page/`](templates/astrology-app-landing-page/),
exportado do Claude Design. Os `.dc.html` são **protótipos**, não código de
produção: a referência visual é deles, a arquitetura é daqui.

---

## Arquitetura

```
astros/
├─ packages/
│  ├─ contracts/     tipos + schemas zod compartilhados (a fonte da verdade)
│  └─ astro-core/    o motor: efemérides, casas, aspectos, trânsitos, leituras
├─ apps/
│  ├─ api/           Fastify 5 + Prisma — REST, auth, persistência
│  ├─ web/           Next.js 15 (App Router) — landing + app
│  └─ trinta-graus/  landing editorial independente — Vite
└─ templates/        o handoff de design (somente leitura)
```

**Por que essa divisão.** O motor não conhece HTTP nem banco: recebe dados de
nascimento e devolve uma carta, o que o torna testável de verdade e reusável
por um app nativo depois. `contracts` é o único lugar onde a forma de um dado
é decidida — API e web importam de lá, então um campo renomeado quebra o
*build*, não a produção.

### O contrato

- [`packages/contracts/src/astrology.ts`](packages/contracts/src/astrology.ts) —
  o domínio: `Chart`, `BodyPosition`, `Aspect`, `Horoscope`, `Synastry`.
- [`packages/contracts/src/api.ts`](packages/contracts/src/api.ts) — os
  DTOs de cada rota, o envelope de erro e o mapa `API_ROUTES`.
- [`packages/contracts/src/catalog.ts`](packages/contracts/src/catalog.ts) —
  signos, planetas, aspectos, planos e os glifos SVG desenhados no handoff.
- [`packages/astro-core/API.md`](packages/astro-core/API.md) — a superfície
  do motor, congelada.

Chaves de domínio ficam em inglês (estáveis, seguras em URL e banco); todo
rótulo em pt-BR vive em `catalog.ts` e nunca no banco.

---

## Rodando localmente

Requer Node ≥ 20.11.

```bash
npm install
```

```bash
npm run build --workspace @astros/contracts && npm run build --workspace @astros/astro-core
```

```bash
cd apps/api && cp .env.example .env && npx prisma migrate dev && npm run db:seed
```

```bash
npm run dev
```

- API em `http://localhost:3333`
- Web em `http://localhost:3000`

Para iniciar também a landing Trinta Graus, em `http://localhost:5173`:

```bash
npm run dev:all
```

Ou, para iniciar somente essa landing:

```bash
npm run dev:landing
```

Usuário de demonstração semeado: `marina@exemplo.com` / `constelacao`.

### Banco

O padrão é **SQLite** (`file:./dev.db`) — roda sem infraestrutura nenhuma.
O schema é escrito para ser portável: sem enums nativos, sem colunas `Json`
consultáveis. Para migrar para Postgres:

1. `docker compose up -d postgres` (sobe na porta 5433)
2. troque `provider` para `"postgresql"` em `apps/api/prisma/schema.prisma`
3. aponte `DATABASE_URL` para a URL comentada em `apps/api/.env.example`
4. `npx prisma migrate dev --name init`

---

## Decisões que valem explicação

**Efemérides em JS puro.** O motor usa `astronomy-engine` em vez de um
*binding* para a Swiss Ephemeris. Precisão de segundo de arco para os corpos
que o produto mostra, sem compilação nativa — o projeto instala e roda em
Windows, Linux e CI sem toolchain de C.

**Fuso resolvido pela cidade, não pelo aparelho.** A hora de nascimento é
convertida com a zona IANA do local (via `luxon`), o que faz o horário de
verão histórico brasileiro cair certo. Um mapa de 1994 em São Paulo não pode
depender do relógio de quem abre o app em 2026.

**Hora desconhecida é um estado de primeira classe.** Sem hora, o motor usa
meio-dia solar, marca `timeIsEstimated`, e devolve `houses: []` com
`ascendant`/`midheaven` nulos — a UI apaga o que ficou incerto em vez de
mostrar uma casa inventada.

**Leituras determinísticas.** `generateHoroscope` é função pura de
(carta, período, data): a mesma pessoa relendo o mesmo dia vê o mesmo texto.
Nada de `Math.random()`.

**Tokens.** Access token JWT curto + refresh opaco, guardado com *hash* no
banco e rotacionado a cada uso. Reuso de um refresh já rotacionado revoga a
família inteira.

---

## Estado atual

O checkout de assinatura é **simulado** — não há provedor de pagamento
integrado. Ele ativa o plano e devolve uma URL local; o ponto exato onde um
PSP entraria está marcado com `TODO` em `apps/api/src/routes/billing`.

---

## Comandos

| comando | o que faz |
| --- | --- |
| `npm run dev` | API + web juntos |
| `npm run dev:all` | API + web + landing Trinta Graus |
| `npm run dev:landing` | landing Trinta Graus |
| `npm run build` | build de todos os pacotes, na ordem certa |
| `npm test` | testes de todos os workspaces |
| `npm run typecheck` | TypeScript em todos os workspaces |
| `npm run db:migrate` | migração do Prisma |
| `npm run db:seed` | catálogo de cidades + usuário demo |
<!-- GERENCIADOR-SERVIDORES:INICIO -->
## Execução local

Aplicação de mapa natal, trânsitos e horóscopo em tempo real.

Porta base reservada: `3030`; os serviços internos usam as portas seguintes. As portas são administradas centralmente para permitir vários projetos abertos ao mesmo tempo.

```powershell
# Iniciar
powershell -ExecutionPolicy Bypass -File "C:\Projetos\GERENCIADOR-SERVIDORES\servidores.ps1" iniciar "astros-2"

# Consultar o estado
powershell -ExecutionPolicy Bypass -File "C:\Projetos\GERENCIADOR-SERVIDORES\servidores.ps1" status

# Encerrar
powershell -ExecutionPolicy Bypass -File "C:\Projetos\GERENCIADOR-SERVIDORES\servidores.ps1" parar "astros-2"
```

Os registros de execução ficam em `C:\Projetos\GERENCIADOR-SERVIDORES\logs`. O gerenciador não copia arquivos `.env`; como os logs reproduzem a saída do próprio aplicativo, revise-os antes de compartilhar.
<!-- GERENCIADOR-SERVIDORES:FIM -->
