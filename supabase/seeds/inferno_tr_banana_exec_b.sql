-- SEED: primeiro playbook real da ferramenta.
-- Mapa INFERNO / lado TR / estratégia "DOMÍNIO BANANA + POSSÍVEL EXEC B".
--
-- Este arquivo é apenas revisável — NÃO é aplicado automaticamente.
-- Não mexe em cronômetro, Realtime, Broadcast, nem em nenhuma tabela fora
-- de maps/strategies/setups/skills.
--
-- IDEMPOTÊNCIA:
-- Cada bloco resolve o pai por nome (não por id fixo) e usa
-- `on conflict ... do nothing` na constraint unique correspondente:
--   maps                 -> unique (name)
--   strategies            -> unique (map_id, side, name)
--   setups                -> unique (strategy_id, name)
--   skills                -> unique (name)
-- Rodar este arquivo mais de uma vez não duplica nenhuma linha.
--
-- setup_assignments NÃO é criado aqui de propósito (etapa seguinte).
-- Por isso as instruções macro de cada momento do round ficam em
-- setups.description por enquanto: setup_instructions.setup_assignment_id
-- é NOT NULL (FK para setup_assignments), então só pode ser preenchida
-- depois que os players forem atribuídos aos setups.

-- 1. MAPA -----------------------------------------------------------------

insert into maps (name, active)
values ('INFERNO', true)
on conflict (name) do nothing;

-- 2. ESTRATÉGIA -------------------------------------------------------------
-- Inclui, ao final da descrição, a contagem de utilitária planejada e o
-- saldo projetado após a sequência completa (não há tabela própria para
-- isso ainda, conforme pedido).

insert into strategies (map_id, side, name, description, created_by, active)
select
  m.id,
  'TR',
  'DOMÍNIO BANANA + POSSÍVEL EXEC B',
  $strat$Estratégia de controle inicial da Banana, pressão simultânea em Tapete, preparação de possível execução no bomb B e fechamento disciplinado do round.

Utilitária planejada: 5 Molotovs, 5 HEs, 5 Flashes, 5 Smokes.
Saldo projetado após a sequência completa: 1 Molotov, 3 HEs, 1 Flash, 2 Smokes.$strat$,
  'IGL + COACH',
  true
from maps m
where m.name = 'INFERNO'
on conflict (map_id, side, name) do nothing;

-- 3. SETUPS -------------------------------------------------------------
-- Um setup por momento do round. `priority` guarda a ordem (1, 2, 3).

insert into setups (strategy_id, name, description, priority, active)
select
  s.id,
  'MOMENTO 1 — DOMÍNIO E COLETA DE INFORMAÇÃO',
  $m1$Referência temporal: 1:55 até 0:59

Objetivo:
- Dominar Banana.
- Estabelecer presença em Tapete.
- Coletar informação.
- Evitar plays isoladas.

Instruções macro:
- Molotov tabelada em cima do Jarro.
- HE no Cimento.
- Flash por cima da Mureta.
- Smoke inicial da base para Meio.
- Time paralelo domina Tapete.

REGRA: extremamente proibido jogador sozinho andando pelo mapa.$m1$,
  1,
  true
from strategies s
join maps m on m.id = s.map_id
where m.name = 'INFERNO'
  and s.side = 'TR'
  and s.name = 'DOMÍNIO BANANA + POSSÍVEL EXEC B'
on conflict (strategy_id, name) do nothing;

insert into setups (strategy_id, name, description, priority, active)
select
  s.id,
  'MOMENTO 2 — PRESSÃO, LEITURA E DECISÃO',
  $m2$Referência temporal: 0:59 até 0:30

Objetivo:
- Preparar possível EXEC B.
- Provocar decisão defensiva.
- Avaliar rotação.
- Manter disciplina de mapa.

Instruções macro:
- Retorno para Banana.
- Molotov para Carro.
- Flash da entrada da Caverna por cima da Mureta.
- Preparar Molotov Tripla.
- Preparar Molotov BTT.
- Preparar Flash Caixão/saída Tripla.
- Preparar Flash caminho CT.
- Possibilidade de Smoke Nipe/Meio para fake A.
- HE acompanhando fake.$m2$,
  2,
  true
from strategies s
join maps m on m.id = s.map_id
where m.name = 'INFERNO'
  and s.side = 'TR'
  and s.name = 'DOMÍNIO BANANA + POSSÍVEL EXEC B'
on conflict (strategy_id, name) do nothing;

insert into setups (strategy_id, name, description, priority, active)
select
  s.id,
  'MOMENTO 3 — EXECUÇÃO E FECHAMENTO',
  $m3$Referência temporal: 0:30 até os segundos finais / até o plant

Objetivo:
- Executar decisão final.
- Entrar em B quando chamado.
- Converter pós-plant.
- Preservar utilitária desnecessária.

Sequência macro:
- Molotov Tripla.
- Molotov BTT.
- Flash Caixão/Tripla.
- Flash caminho CT.
- Smoke CT.
- Entries avançam com suporte.
- Após plant: parar de procurar kills desnecessárias.
- Criar crossfire.
- Lurker/corte de rotação conforme setup.
- Preservar utilitárias para pós-plant.$m3$,
  3,
  true
from strategies s
join maps m on m.id = s.map_id
where m.name = 'INFERNO'
  and s.side = 'TR'
  and s.name = 'DOMÍNIO BANANA + POSSÍVEL EXEC B'
on conflict (strategy_id, name) do nothing;

-- 4. SKILLS -----------------------------------------------------------
-- Perfis táticos reutilizáveis, independentes de mapa/estratégia.

insert into skills (name, category, description, characteristics)
values (
  'ENTRY_FRAGGER',
  'ROLE',
  'Abre espaço e entra primeiro no site/ponto de execução.',
  '{"aggression": "HIGH", "trade_priority": "HIGH", "survival_priority": "MEDIUM", "execute_priority": "HIGH"}'::jsonb
)
on conflict (name) do nothing;

insert into skills (name, category, description, characteristics)
values (
  'RIFLER',
  'ROLE',
  'Suporte de rifle flexível, adapta-se ao que o round pedir.',
  '{"aggression": "MEDIUM", "trade_priority": "HIGH", "adaptability": "HIGH"}'::jsonb
)
on conflict (name) do nothing;

insert into skills (name, category, description, characteristics)
values (
  'SUPORTE_EXEC',
  'ROLE',
  'Fornece e sincroniza utilitária para viabilizar a execução.',
  '{"utility_priority": "VERY_HIGH", "survival_priority": "HIGH", "execute_timing": "STRICT"}'::jsonb
)
on conflict (name) do nothing;

insert into skills (name, category, description, characteristics)
values (
  'LURKER',
  'ROLE',
  'Joga isolado, cortando rotação ou lendo informação fora do grupo principal.',
  '{"rotation_cut_priority": "VERY_HIGH", "patience": "HIGH", "aggression": "CONDITIONAL"}'::jsonb
)
on conflict (name) do nothing;

insert into skills (name, category, description, characteristics)
values (
  'AWPER',
  'ROLE',
  'Busca picks com a AWP e reposiciona conforme a leitura do round.',
  '{"pick_priority": "HIGH", "reposition_priority": "HIGH", "survival_priority": "HIGH"}'::jsonb
)
on conflict (name) do nothing;

insert into skills (name, category, description, characteristics)
values (
  'ANCHOR',
  'ROLE',
  'Segura um site sozinho até ser chamado a rotacionar ou ser reforçado.',
  '{"survival_priority": "VERY_HIGH", "hold_priority": "VERY_HIGH", "rotation_behavior": "HOLD_UNTIL_CALLED"}'::jsonb
)
on conflict (name) do nothing;
