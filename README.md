# Ads Alibr — implantação completa

Este projeto usa GitHub + Netlify + Firebase + Mercado Pago.

## O que já está implementado

- Cadastro e login de anunciante e afiliado.
- Painéis separados e saldos privados.
- Categorias de campanhas, incluindo Eletrônicos.
- Imagem por upload ou URL.
- Campanhas pendentes, aprovação, pausa e rejeição pelo admin.
- Links exclusivos dos afiliados.
- Clique validado no servidor e cobrado uma vez por visitante/campanha/afiliado/dia.
- Débito do anunciante, crédito do afiliado e comissão da plataforma na mesma transação.
- Pausa automática sem saldo.
- Compra de crédito pelo Checkout Pro do Mercado Pago.
- Crédito somente após webhook assinado e pagamento aprovado.
- Métricas gerais, usuários, campanhas, pagamentos e cliques no painel admin.
- Bloqueio de usuário e ajuste financeiro auditado pelo admin.

Admin: `jeanaguiar636@gmail.com`

## ETAPA 1 — Firebase Authentication

1. Abra o projeto `adsalibr` no Firebase.
2. Vá em **Authentication → Método de login**.
3. Confirme que **E-mail/senha** está ativado.
4. Em **Configurações → Domínios autorizados**, mantenha `adsalibr.netlify.app`.
5. Cadastre o administrador no próprio site usando `jeanaguiar636@gmail.com`.

## ETAPA 2 — Regras do Firestore

1. Abra **Firestore Database → Regras**.
2. Copie todo o conteúdo de `firebase/firestore.rules`.
3. Apague as regras antigas, cole as novas e clique em **Publicar**.

Essas regras deixam cada usuário ver apenas seus próprios valores. Funções financeiras usam o Firebase Admin no servidor e não dependem de permissões do navegador.

## ETAPA 3 — Firebase Storage

1. Abra **Storage** no Firebase e clique em **Começar**.
2. Use a localização sugerida do projeto.
3. Abra a aba **Regras** do Storage.
4. Cole o conteúdo de `firebase/storage.rules` e publique.

O upload aceita somente imagens de até 5 MB. As imagens das campanhas são públicas; os outros arquivos ficam bloqueados.

## ETAPA 4 — Credencial protegida do Firebase

1. Clique na engrenagem do Firebase → **Configurações do projeto**.
2. Abra **Contas de serviço**.
3. Clique em **Gerar nova chave privada** e confirme.
4. Um arquivo JSON será baixado. Não envie esse arquivo pelo WhatsApp, GitHub ou conversa.
5. Dentro dele, você usará somente `project_id`, `client_email` e `private_key` nas variáveis protegidas do Netlify.

## ETAPA 5 — GitHub

1. Crie um repositório novo chamado `adsalibr`.
2. Deixe como privado enquanto configura as chaves.
3. Descompacte este ZIP.
4. Envie todos os arquivos e pastas, preservando a estrutura. O `package.json` e o `netlify.toml` precisam ficar na raiz.
5. Nunca envie `.env` ou o JSON da conta de serviço.

Estrutura principal:

```text
public/
  index.html
  app.js
  styles.css
netlify/functions/
  create-payment.mjs
  mercadopago-webhook.mjs
  click.mjs
  admin-action.mjs
  admin-metrics.mjs
firebase/
package.json
netlify.toml
```

## ETAPA 6 — Conectar o GitHub ao Netlify

1. No Netlify, abra o site `adsalibr`.
2. Entre em **Site configuration → Build & deploy → Continuous deployment**.
3. Escolha **Link repository** e selecione o repositório `adsalibr`.
4. Branch de produção: `main`.
5. Diretório de publicação: `public`.
6. Diretório das funções: `netlify/functions`.
7. Não é necessário informar comando de build.
8. Salve e aguarde a publicação.

## ETAPA 7 — Variáveis protegidas no Netlify

No site `adsalibr`, abra **Site configuration → Environment variables** e adicione:

| Nome | Valor |
|---|---|
| `FIREBASE_PROJECT_ID` | valor `project_id` do JSON |
| `FIREBASE_CLIENT_EMAIL` | valor `client_email` do JSON |
| `FIREBASE_PRIVATE_KEY` | valor completo de `private_key` |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de produção |
| `MERCADOPAGO_WEBHOOK_SECRET` | assinatura secreta do webhook |
| `SITE_URL` | `https://adsalibr.netlify.app` |
| `ADMIN_EMAIL` | `jeanaguiar636@gmail.com` |
| `CLICK_HASH_SECRET` | uma frase grande, secreta e aleatória |

Marque as chaves privadas como **Sensitive/Secret** quando a opção aparecer. Depois faça um novo deploy.

## ETAPA 8 — Mercado Pago

1. Abra **Mercado Pago Developers → Suas integrações**.
2. Crie ou selecione a aplicação do Ads Alibr.
3. Use as credenciais de **produção** somente quando os testes estiverem concluídos.
4. Copie o Access Token para `MERCADOPAGO_ACCESS_TOKEN` no Netlify. Não coloque no GitHub.
5. Em **Webhooks**, configure esta URL:

```text
https://adsalibr.netlify.app/.netlify/functions/mercadopago-webhook
```

6. Selecione eventos de **Pagamentos**.
7. Copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`.

## ETAPA 9 — Primeiro teste

1. Cadastre o administrador com o e-mail correto.
2. Cadastre uma conta de anunciante diferente.
3. No anunciante, clique em **Adicionar créditos** e faça um pagamento de teste.
4. Confirme no painel admin que o pagamento apareceu.
5. Crie uma campanha na conta do anunciante.
6. No admin, aprove a campanha.
7. Cadastre um afiliado, escolha a categoria e copie o link.
8. Abra o link uma vez em outro navegador.
9. Confira o débito do anunciante, ganho do afiliado, comissão e métricas no admin.

## Regras financeiras iniciais

- Compra mínima: R$ 50,00.
- CPC mínimo: R$ 0,30.
- No CPC de R$ 0,30: afiliado R$ 0,22; plataforma R$ 0,08.
- Um clique cobrado por visitante, campanha e afiliado a cada dia.
- Campanha pausada automaticamente quando não há saldo.

Antes de abrir ao público, faça os testes com credenciais de teste do Mercado Pago. Depois troque somente as variáveis do Netlify pelas credenciais de produção.
