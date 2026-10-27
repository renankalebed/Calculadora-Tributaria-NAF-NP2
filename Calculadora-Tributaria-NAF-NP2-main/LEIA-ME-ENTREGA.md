# Entrega do Membro 4 — QA, Acessibilidade e Relatório

Os componentes e páginas React são `.jsx`. Os estilos permanecem em CSS, conforme orientação confirmada. Os arquivos `.mjs` em `documentos/qa/` são ferramentas de teste executadas com Node, sem fazer parte da interface.

## Abrir no VS Code e executar

1. Extraia o ZIP e abra a pasta do projeto no VS Code.
2. No terminal: `cd frontend`, depois `npm ci` e `npm run dev`.
3. Para o ambiente completo com API e PostgreSQL, configure os `.env` conforme os exemplos e siga o README da raiz. Não use o token fictício de QA para autenticar no servidor.

## O que consultar

- `documentos/RELATORIO_TECNICO.md`: relatório editável em texto.
- `documentos/Relatorio-Tecnico-NAF.docx`: versão editável no Word.
- `documentos/Relatorio-Tecnico-NAF.pdf`: versão para leitura, com anexo de resultados.
- `documentos/RESULTADOS_QA.md`: números e links das evidências.
- `documentos/PLANO_DE_TESTES.md`: critérios, cenários e homologações pendentes.
- `documentos/evidencias/`: relatórios originais Lighthouse, capturas e resultados JSON.
- `documentos/qa/README.md`: como repetir os testes.

O relatório precisa dos nomes/matrículas, identificação acadêmica e confirmação das contribuições dos Membros 1–3. Os testes de interface com respostas simuladas não comprovam banco, autenticação ou cálculo tributário. A validação com leitor de tela real também permanece pendente.

## Levar as alterações ao Git

O ZIP não contém a pasta `.git`. Em seu clone autenticado do repositório, crie uma branch (por exemplo `qa-acessibilidade`), copie os arquivos alterados e `documentos/`, revise as diferenças e execute os testes antes de fazer commit/push. A lista de arquivos preexistentes alterados está em `documentos/evidencias/escopo-alteracoes.json`.

Os algoritmos tributários, o Fator R, as rotas globais e a função de geração de PDF da aplicação foram preservados. Nada foi enviado ao GitHub a partir deste ambiente.
