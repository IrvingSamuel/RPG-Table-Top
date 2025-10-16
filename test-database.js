const mysql = require('mysql');

// Teste de conexão e verificação das tabelas
function testDatabase() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg',
        charset: 'utf8mb4'
    });

    connection.connect((error) => {
        if (error) {
            console.error('❌ Erro ao conectar:', error);
            return;
        }
        console.log('✅ Conectado ao banco de dados');
    });

    // Verifica se as tabelas existem
    connection.query("SHOW TABLES LIKE 'chat_%'", function(err, result) {
        if (err) {
            console.error('❌ Erro ao verificar tabelas:', err);
        } else {
            console.log('📋 Tabelas do chat encontradas:', result.length);
            result.forEach(table => {
                console.log('  -', Object.values(table)[0]);
            });
        }
    });

    // Testa inserção de mensagem
    const testMessage = {
        player_name: 'TestPlayer',
        message_content: 'Mensagem de teste do sistema',
        message_type: 'message'
    };

    connection.query(
        "INSERT INTO chat_messages (player_name, message_content, message_type) VALUES (?, ?, ?)",
        [testMessage.player_name, testMessage.message_content, testMessage.message_type],
        function(err, result) {
            if (err) {
                console.error('❌ Erro ao inserir mensagem teste:', err);
            } else {
                console.log('✅ Mensagem teste inserida com ID:', result.insertId);
                
                // Testa busca de mensagens
                connection.query(
                    "SELECT * FROM chat_messages WHERE id = ?",
                    [result.insertId],
                    function(err, results) {
                        if (err) {
                            console.error('❌ Erro ao buscar mensagem:', err);
                        } else {
                            console.log('✅ Mensagem recuperada:', results[0]);
                        }
                        
                        // Limpa teste
                        connection.query(
                            "DELETE FROM chat_messages WHERE id = ?",
                            [result.insertId],
                            function(err) {
                                if (err) {
                                    console.error('❌ Erro ao limpar teste:', err);
                                } else {
                                    console.log('🧹 Dados de teste removidos');
                                }
                                connection.end();
                            }
                        );
                    }
                );
            }
        }
    );
}

// Testa rolagem
function testDiceRoll() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg'
    });

    connection.connect();

    const testRoll = {
        player_name: 'TestPlayer',
        dice_type: 20,
        dice_result: 15
    };

    connection.query(
        "INSERT INTO dice_rolls (player_name, dice_type, dice_result) VALUES (?, ?, ?)",
        [testRoll.player_name, testRoll.dice_type, testRoll.dice_result],
        function(err, result) {
            if (err) {
                console.error('❌ Erro ao inserir rolagem teste:', err);
            } else {
                console.log('🎲 Rolagem teste inserida com ID:', result.insertId);
                
                // Limpa teste
                connection.query(
                    "DELETE FROM dice_rolls WHERE id = ?",
                    [result.insertId],
                    function(err) {
                        if (!err) {
                            console.log('🧹 Rolagem de teste removida');
                        }
                        connection.end();
                    }
                );
            }
        }
    );
}

console.log('🔧 Testando sistema de banco de dados...\n');
testDatabase();

setTimeout(() => {
    testDiceRoll();
}, 2000);