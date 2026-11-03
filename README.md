# Solare Cafés Especiais · Landing page

Proposta de layout desenvolvida pela Concept Agência. Página estática (HTML, CSS e JS), sem build.

**No ar:** https://guleite.github.io/solare-cafes/

## Estrutura

- `index.html`: página principal
- `privacidade.html`: política de privacidade (LGPD)
- `assets/css/style.css`: estilos e animações
- `assets/js/main.js`: interações e o popup que qualifica o contato e abre o WhatsApp
- `assets/img/`: logo, embalagens e imagens tratadas a partir do material da marca

## Antes de publicar de verdade

No topo de `assets/js/main.js`:

- `SOLARE_WHATSAPP`: número com DDI e DDD, só dígitos (hoje é um número de exemplo)
- `SOLARE_LEAD_ENDPOINT`: endereço para receber os contatos (opcional; vazio = não envia)
- `SOLARE_INSTAGRAM`: link do perfil

Em `privacidade.html`, trocar `[e-mail de contato]`.

Enquanto for proposta, a página fica fora do Google (`noindex` e `robots.txt`). Quando aprovar, remova os dois.

## Publicação

GitHub Pages a partir da branch `main`, pasta raiz. Cada push na `main` atualiza o site em cerca de um minuto.
