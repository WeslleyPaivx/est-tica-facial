# Conferência — EP01 (Etapa 5)

Folha de contato: `aprovacao/folha-de-contato-{1,2,3}.jpg` — um quadro do meio de cada um dos 24 planos, mais momentos de transição.
`npx hyperframes check`: ok, 0 erros, 0 avisos.

## Problemas encontrados e corrigidos

| Momento | Problema | Correção |
|---|---|---|
| 39,5–39,6 s | Câmera "por cima do ombro" atravessava o Nexo (tela laranja cheia) | Câmera passa a ficar pelo ombro esquerdo do Lucas (`OTS_SCREEN`) |
| 37,7 s | Mão do Lucas gigante no canto | Resolvido pela mesma troca de lado |
| 18,9 s, 24,9 s | Na órbita, o agente azul cobria o verde; o vermelho colado na câmera | Órbita em arco por dentro do semicírculo dos agentes (raio 1,45 m, altura 1,2 m) |
| 16,05 s | Cinco feixes somados estouravam a imagem | Opacidade dos feixes reduzida pela metade |
| 29,2 s | Legenda sobre a boca do Nexo | Enquadramento sobe |
| 14,3 s | Cabeça do Lucas cobria a boca do Nexo | Câmera mais à esquerda |
| 31,6 s, 37,7 s, 39,5 s | Robô verde cortado no canto da tela | Verde reposicionado na mesa; plano dele reenquadrado |
| 40,3 s | Nexo começava a sair antes do corte | Nexo parado até o corte |

## Verificado sem problemas

- Rostos: nenhum rosto cortado; olhos e boca do falante visíveis em todos os planos de fala.
- Expressões: desespero, susto, curiosidade, euforia, espanto, raiva, cansaço, facepalm, esperança e orgulho leem bem em close.
- Iluminação: noite azul, luminária e brilho laranja, rim light nos personagens, névoa leve, sombras suaves.
- Legendas: dentro da faixa segura (1120–1340 px), longe da barra lateral; acentuação correta; palavras-chave em amarelo/laranja.
- CTA: no alto (250–650 px), legível do aparecimento até o fim.
- Continuidade: posições dos agentes trocam só nos cortes; cadeira gira em quadro.
- Determinismo: renderizar o mesmo trecho duas vezes dá os mesmos quadros (Etapa 1, PSNR ≈ 52 dB).

## Limites conhecidos

- Sem áudio (decisão do proprietário): a boca segue a voz guia; trocar pela voz do ElevenLabs re-sincroniza boca, coreografia e legendas.
- CTA "COMENTE: AGENTES" fica cerca de 1,5 s em tela.
- Revisão por quadros estáticos; o movimento entre eles não foi visto quadro a quadro.
