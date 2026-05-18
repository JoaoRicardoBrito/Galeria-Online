# Galeria Online — Carlos Ventura

Site de galeria online para o artista visual Carlos Ventura. Apresenta obras de arte em uma experiência visual minimalista, permitindo navegar pelo portfólio, filtrar obras e contatar o artista via WhatsApp para aquisição.

## Stack

- HTML + CSS + JavaScript Vanilla puro
- Sem frameworks, transpiladores ou bundlers
- Hospedagem: Netlify (deploy direto do GitHub)

## Estrutura

```
├── assets/          # Imagens de obras e do artista
├── components/      # Fragmentos HTML compartilhados (header, footer)
├── css/             # Estilos por camada (reset, variables, base, layout, components, pages)
├── data/            # obras.json com o catálogo completo
├── js/              # Módulos ES (app.js, gallery.js, carousel.js, obra.js, filters.js, …)
└── *.html           # Páginas: index, obras, obra, colecoes, sobre
```

## Páginas

| Página | Descrição |
|--------|-----------|
| `index.html` | Home com carrossel hero, obra em destaque e coleções |
| `obras.html` | Galeria completa com filtros e ordenação |
| `obra.html` | Detalhe de uma obra com conversão de moeda e link WhatsApp |
| `colecoes.html` | Listagem das coleções temáticas |
| `sobre.html` | Biografia e trajetória do artista |

## Rodar localmente

Sirva os arquivos com qualquer servidor HTTP local — **não abrir via `file://`** (módulos ES exigem HTTP).

```bash
# Opção 1 — Python
python -m http.server 8000

# Opção 2 — Node
npx serve .

# Opção 3 — VS Code Live Server
# Abrir index.html → botão "Go Live" na barra inferior
```

Acesse `http://localhost:8000`.

## Dados

As obras estão em `data/obras.json`. Para adicionar uma obra, basta inserir um novo objeto no array seguindo o mesmo schema (id, nome, imagem, imagemAlt, tecnica, tamanho, largura, altura, orientacao, colecao, ano, preco, status, descricao).

## Conversão de moeda

Usa a API pública [Frankfurter](https://www.frankfurter.dev/) (dados do BCE, sem chave). Se a API estiver indisponível, o preço em reais continua sendo exibido normalmente.
