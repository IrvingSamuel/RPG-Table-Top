#!/bin/bash

# Script para executar migração do banco de dados
# Adiciona suporte para múltiplas mesas no RPG

echo "🔧 Iniciando migração do banco de dados..."

# Configurações do banco (ajuste conforme necessário)
DB_HOST="localhost"
DB_USER="bigbridge-rpg"  # Ajuste conforme seu usuário
DB_NAME="u742768766_bdrtv"  # Nome do seu banco
DB_PASS=""  # Será solicitado interativamente

echo "📊 Conectando ao banco: $DB_NAME"
echo "⚠️  Você precisará inserir a senha do MySQL"

# Executar migração
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < database_migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Migração concluída com sucesso!"
    echo "📋 Alterações realizadas:"
    echo "   - Criada tabela game_tables"
    echo "   - Adicionada coluna table_id em chat_messages"
    echo "   - Adicionada coluna table_id em dice_rolls"
    echo "   - Criada Mesa de Teste 1 (ID: 1)"
    echo ""
    echo "🎲 A partir de agora, todas as mensagens e rolagens serão associadas à Mesa de Teste 1"
else
    echo "❌ Erro ao executar migração"
    exit 1
fi
