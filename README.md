# Navalha.co

Site estático de barbearia: vitrine de cortes, espera por barbeiro, agenda por relógio, regras de sinal simuladas, painel do dono e tela de TV. Só HTML, CSS e JS. Sem servidor.

## Publicar no GitHub Pages
1. Crie um repositório **público** e envie estes arquivos (branch `main`).
2. Em **Settings, Pages**, escolha **Source: GitHub Actions**. O workflow `.github/workflows/pages.yml` roda os testes e publica.
3. Descubra a URL final e rode `node scripts/definir-url.mjs https://USUARIO.github.io/REPO/` para ajustar SEO, sitemap e robots. Faça commit.
4. Domínio próprio (opcional): crie um arquivo `CNAME` com o domínio, configure o DNS conforme a documentação atual do GitHub e marque *Enforce HTTPS*.

Não testei o workflow no GitHub. Se a versão de alguma action mudou, ajuste o `pages.yml`.

## Personalizar para uma barbearia
Edite só `config.js` (nome, endereço, WhatsApp, barbeiros, expediente, folgas, cortes, preços e percentuais). Troque também o texto de `index.html` (marca no cabeçalho) e preencha os campos `[PREENCHER]` em `privacidade.html` e `termos.html`. Os rascunhos jurídicos precisam de revisão de advogado.

## Como funciona (e limites)
- Tudo fica no `localStorage` do navegador. **A agenda não sincroniza entre aparelhos.**
- Fluxo sugerido: o cliente escolhe o horário no relógio e envia o pedido por WhatsApp (botão após reservar). O barbeiro confirma e lança o horário no painel do tablet, na visão **Barbeiro/dono**.
- `fila.html` serve para TV ou tablet, mas só enxerga os dados do mesmo navegador do painel.
- A chave Cliente/Barbeiro **não tem senha**. Login, e-mail de senha, Pix real e WhatsApp automático exigem um backend, que este repositório não tem.
- Use **Exportar agenda** de vez em quando: limpar o navegador apaga tudo.
- O **Modo de teste** cria dados marcados e hora simulada. Os cenários usam os 3 primeiros barbeiros.

## Termos do GitHub Pages
Pelo que sei, o Pages não é para negócios comerciais nem SaaS. Confirme os termos atuais antes de vender. Alternativa estática grátis: Cloudflare Pages, ligado ao mesmo repositório.

## Testes
`npm test` (Node 20 ou mais novo) carrega `config.js` e `assets/app.js` num ambiente simulado e confere antecedência, folga, sobreposição, janela de 50 min, tolerância de 10 min, retenção do sinal, estados da fila e nota de saúde. Não substitui testar no navegador.

## Fontes
Carregadas do Google Fonts (envia o IP do visitante ao Google). Para autohospedar, baixe Outfit e troque o `<link>`.
