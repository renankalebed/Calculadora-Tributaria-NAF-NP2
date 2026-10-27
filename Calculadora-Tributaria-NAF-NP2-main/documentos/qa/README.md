# Reproduzir a verificação de QA

Ambiente utilizado: Node 24.19.0, Chromium 154.0.8037.57, Lighthouse 13.5.0 e Playwright 1.64.1 (axe-core 4.14.0 nos estados adicionais), Linux. Instale um Chromium local e informe seu caminho em `CHROME_PATH` caso não esteja em `/usr/bin/chromium`.

1. Em `frontend/`, execute `npm ci`, `npm run build` e `npm run lint`.
2. Inicie `npm run preview -- --host 127.0.0.1` e mantenha-o aberto na porta 4173.
3. Nesta pasta, execute `npm ci`.
4. Execute `npm test` para os estados interativos e `npm run audit` para matriz de telas e Lighthouse. Execute um processo de auditoria de cada vez: ele usa a porta de depuração 9222 e o perfil temporário `/tmp/naf-lighthouse-profile`.

Os scripts gravam resultados e capturas em `../evidencias/`, sobrescrevendo os arquivos da execução anterior. O Lighthouse usa a configuração mobile padrão e somente a categoria de acessibilidade. Seu armazenamento é preservado para abrir páginas que verificam a presença de token; o token `qa-fixture-token` é fictício e não autentica no servidor.

`states.mjs` também executa axe-core nos formulários inválidos e nos resultados/histórico preenchidos, com os grupos WCAG 2 A/AA e WCAG 2.1 AA. Os resultados incluem verificações inconclusivas para revisão manual.

`states.mjs` intercepta chamadas a `http://localhost:3000/**` e fornece valores arbitrários para testar somente a apresentação de resultados e histórico. Esses valores **não** são resultados de cálculos tributários. O script não envia emails nem verifica a API, JWT, banco ou PDF. A auditoria principal não intercepta a API; o histórico aparece em estado de falha de conexão sem backend.

Para o teste manual com integração real, execute o ambiente completo conforme README da raiz, faça login com uma conta de teste e repita os cenários de `../PLANO_DE_TESTES.md`. A pontuação automática não substitui a validação com leitor de tela, zoom e dispositivos reais.
