# Publicar o GameHub no Render com analytics

O domínio atual `gamehubjogos.onrender.com` está configurado como site estático. Sites estáticos não executam as rotas `/api/analytics` e `/api/top-games`, portanto não conseguem encaminhar eventos para o GameHub Analytics sem expor a chave de ingestão no navegador.

Este diretório adiciona um servidor Node.js pequeno que entrega os arquivos estáticos do GameHub, preserva respostas HTTP Range para os arquivos grandes dos jogos e expõe as duas rotas seguras de analytics.

## Criar o serviço web

No Render, use **New → Web Service** e selecione `Igu2012/GameHub` na branch `main`.

| Campo | Valor |
|---|---|
| Runtime | `Node` |
| Root Directory | deixe vazio |
| Build Command | deixe vazio |
| Start Command | `node render-server/server.js` |
| Health Check Path | `/health` |
| Plano | Free ou o plano já usado pelo GameHub |

Nas variáveis de ambiente do novo serviço, informe os mesmos valores já usados na Vercel:

| Variável | Valor |
|---|---|
| `ANALYTICS_API_URL` | `https://gamehubjogos-database.onrender.com` |
| `ANALYTICS_INGEST_KEY` | o valor de `INGEST_KEY` do serviço `gamehubjogos-database` |

## Manter o mesmo domínio do Render

Crie primeiro o novo serviço usando um nome temporário, teste a URL recebida e confirme as rotas `/health`, `/api/top-games` e a página inicial. Depois, se quiser que ele use exatamente `gamehubjogos.onrender.com`, renomeie ou remova o site estático atual e atribua o nome `gamehubjogos` ao novo serviço.

> A Vercel já está com a integração funcional. Essa configuração é necessária somente para que a cópia hospedada no Render tenha os mesmos destaques e a mesma coleta de dados.
