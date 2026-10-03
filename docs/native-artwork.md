# Arte temporaria apenas no app nativo

Decisao de 03/10/2026: retirar escudos avulsos do app para a revisao Apple, sem mudar o site. Este filtro nao comprova direitos e nao garante aprovacao.

## Como funciona

`npm run build` continua gerando o site com sua arte original. `npm run mobile:sync` gera o dist, executa `scripts/native-artwork.mjs --sync` e sincroniza esse dist com iOS. Codemagic ja chama mobile:sync. Nao empacotar com `npm run build && npx cap sync ios` diretamente, pois isso pula o filtro.

O filtro substitui seis arquivos copiados em `dist/lovable-uploads/` por um monograma LD desenhado aqui (sem imagem de terceiros):

- 6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png e .webp: marca na home e navegacao.
- flu-logo-sm.webp: marca nas paginas especiais.
- 0aa3609f-0584-4bf4-8303-e03f50f7e131.png: escudo no login/tutorial/erros e fallback de imagem.
- 20457a11-5436-48c6-906d-82b9451bc16d.png: escudo, cadastrado como fallback Rivelino.
- efaf362c-8726-4049-98bc-ebb26dcdd4e1.png: camisa com escudo, cadastrada como fallback Marcelo.

Mantem nome, dimensoes e formato para nao quebrar os componentes. Substitui tambem os PNGs listados nos Contents.json de AppIcon.appiconset e Splash.imageset. Originais em public/ e ios/ continuam versionados sem mudanca. A copia local dos originais do catalogo iOS fica em node_modules/.cache/native-artwork-originals, fora do bundle e ignorada pelo git. As alteracoes no catalogo iOS sao geradas no build, nao devem ser commitadas.

## Limites

Nao muda banco, seeds, fotos remotas de jogadores/camisas, HTML remoto de noticias, nem regras do quiz. As fotos remotas inspecionadas contem escudos, patrocinadores e fabricantes. Logo, o app ainda pode mostrar escudos dentro de fotografias; este filtro remove apenas os assets avulsos identificados. Nenhum asset separado de escudo de adversario foi encontrado no codigo/seeds.

Antes de submeter: testar o build real no iPhone (home, login, quiz, especiais, icone e splash), conferir screenshots reais e decidir os direitos das fotografias. O publish do site nao atualiza o app instalado.

## Restauracao

Somente apos autorizacao do dono e documentacao de direitos, retirar `node scripts/native-artwork.mjs --sync` de mobile:sync e voltar a `npm run build && cap sync ios`. Em uma checkout nova, os originais do catalogo ja estao presentes. Na mesma checkout usada para o build temporario, executar `node scripts/native-artwork.mjs --restore` antes de reconstruir. Restaurar requer um novo build nativo, nao um publish web. Nao restaurar automaticamente ao receber aprovacao Apple.

## Validacao

`npx vitest run scripts/native-artwork.test.mjs` testa dimensoes/formato, preservacao da web, execucao repetida, backup original e restauracao. Rodar tambem a suite, typecheck e build antes do merge. Nao executar Codemagic sem autorizacao para consumo de minutos.
