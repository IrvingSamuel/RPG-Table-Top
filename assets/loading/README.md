# Imagens de Loading

Este diretório contém as imagens de loading personalizadas para cada mesa de jogo.

## Como adicionar uma nova imagem de loading:

1. Coloque a imagem neste diretório (formatos suportados: JPG, PNG, GIF, WebP)
2. Atualize o banco de dados com o caminho da imagem:

```sql
UPDATE game_tables 
SET load_screen = 'assets/loading/nome-da-imagem.jpg' 
WHERE id = 1;
```

## Especificações recomendadas:

- **Resolução**: 1920x1080 (Full HD) ou superior
- **Proporção**: 16:9
- **Tamanho**: Máximo 2MB (quanto menor, mais rápido carrega)
- **Formato**: JPG para fotos, PNG para imagens com transparência
- **Tema**: Relacionado à campanha/mesa de RPG

## Exemplos de temas:

- Paisagens fantasy (florestas, castelos, montanhas)
- Cenas de batalha épicas
- Mapas antigos
- Artwork de personagens
- Runas místicas
- Cenários da campanha

## Imagens padrão:

- `default-loading.jpg` - Imagem padrão quando nenhuma específica é definida
