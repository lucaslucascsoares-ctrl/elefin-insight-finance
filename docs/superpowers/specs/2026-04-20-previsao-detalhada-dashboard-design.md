# Previsão detalhada do mês v2.0

## Objetivo
Transformar a área de `Previsão do mês` em um único botão/área de abertura para uma visão analítica detalhada do período atual, recalculando a partir do dia em que o usuário abrir a tela até o fim do mês.

## Escopo
- O gatilho será o card de `Previsão do mês` já existente no dashboard.
- Ao clicar, abre um modal ou drawer com uma dashboard analítica separada.
- A tela detalhada será independente do carrossel principal.
- A visão resumida atual do dashboard permanece intacta.
- Tudo o que foi listado nesta versão fica concentrado nesse mesmo botão de abertura.

## Comportamento
- O intervalo analisado começa no dia atual em que o usuário abre a visão.
- Se o usuário abrir em dias diferentes do mês, a previsão é recalculada sempre a partir dessa nova data.
- A leitura combina:
  - projeções cadastradas
  - transações reais já feitas no mês
  - recorrências futuras
- O painel detalhado deve mostrar primeiro os gráficos mais visuais e depois os resumos numéricos e alertas.
- Casos de borda precisam ser tratados:
  - final de mês
  - fevereiro com recorrências do dia 30/31
  - fuso horário sempre em data local
  - cache com invalidação automática à meia-noite

## Estrutura visual
1. Cabeçalho do período
   - Mostra a data de início da leitura e o fim do mês.
   - Explica que a previsão é recalculada conforme o dia atual.
2. Gráfico de pizza
   - Primeira visualização ao abrir.
   - Mostra a composição geral da previsão.
   - Cada fatia recebe nome das 3 categorias do Elefin + `sem categoria`.
   - Interação de clique nas fatias.
3. Resumo numérico
   - Total de entradas previstas.
   - Total de saídas previstas.
   - Saldo projetado até o fim do mês.
4. Gráfico de linha
   - Aparece ao rolar para baixo.
   - Mostra a evolução diária do saldo/projeção até o fim do mês.
   - Eixo Y definido com saldo acumulado a partir do atual.
   - Distinção visual entre passado sólido e futuro tracejado.
   - Ponto do dia atual e linha de referência no zero.
5. Leitura automática
   - Mensagem curta com alerta, estabilidade ou oportunidade.
   - Critérios objetivos e thresholds definidos.
   - Estados baseados em 0% e 10% da receita.

## Dados
- A tela vai reutilizar os dados já disponíveis no projeto:
  - transações reais
  - regras recorrentes
  - projeções de contas
  - saldo inicial do mês
- O recálculo precisa considerar a data atual como ponto de partida da análise.

## Estados
- Carregando
- Sem dados suficientes
- Com dados válidos
- Erro de leitura
- Final do mês, com comportamento específico.

## Responsividade e acessibilidade
- Drawer no mobile.
- Trap focus.
- Fechar com `ESC`.
- `aria-label` nos gráficos e controles interativos.

## Critérios de aceite
- O clique no card `Previsão do mês` abre a dashboard detalhada.
- A dashboard mostra primeiro a pizza e depois a linha ao rolar.
- A previsão muda conforme o dia em que a tela é aberta.
- O dashboard principal não perde o comportamento atual.
- A pizza tem fatias nomeadas e clicáveis.
- A linha diferencia passado e futuro visualmente.
- O dia atual aparece marcado.
- O zero aparece como referência.
- O comportamento de fim de mês funciona sem quebrar.
- Fevereiro não gera recorrência inválida no dia 30/31.
- A leitura automática respeita os thresholds definidos.
- O modal/drawer funciona em desktop e mobile.
- O foco fica preso ao abrir.
- `ESC` fecha a visão.
- Os elementos gráficos possuem labels acessíveis.
- O cache da previsão expira corretamente à meia-noite.
- A visão usa apenas data local.
- O botão continua sendo o único ponto de acesso a essa visão.
