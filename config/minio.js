/**
 * Configuração do MinIO (S3-Compatible Storage)
 * 
 * Este módulo configura a conexão com o MinIO para upload/download
 * de arquivos do RPG (mapas, sprites, assets, etc.)
 */

const AWS = require('aws-sdk');

// Configuração do MinIO
const minioConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'admin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'rezumme3',
    endpoint: process.env.AWS_ENDPOINT || 'https://s3.rezum.me',
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    s3ForcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true' || true,
    signatureVersion: 'v4'
};

// Nome do bucket
const BUCKET_NAME = process.env.AWS_BUCKET || 'rezumme';

// URL pública do MinIO
const PUBLIC_URL = process.env.AWS_URL || 'https://s3.rezum.me/rezumme';

// Cria instância do S3 configurada para MinIO
const s3 = new AWS.S3(minioConfig);

console.log('🗄️ MinIO configurado:');
console.log(`   Endpoint: ${minioConfig.endpoint}`);
console.log(`   Bucket: ${BUCKET_NAME}`);
console.log(`   Region: ${minioConfig.region}`);
console.log(`   URL Pública: ${PUBLIC_URL}`);

/**
 * Upload de arquivo para o MinIO
 * @param {Buffer|Stream} fileContent - Conteúdo do arquivo
 * @param {string} key - Caminho/nome do arquivo no bucket (ex: 'maps/hospital.png')
 * @param {string} contentType - MIME type (ex: 'image/png')
 * @returns {Promise<{url: string, key: string}>}
 */
async function uploadFile(fileContent, key, contentType = 'application/octet-stream') {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'public-read' // Torna o arquivo público
    };

    try {
        const result = await s3.upload(params).promise();
        const publicUrl = `${PUBLIC_URL}/${key}`;
        
        console.log(`✅ Upload bem-sucedido: ${key}`);
        console.log(`   URL: ${publicUrl}`);
        
        return {
            url: publicUrl,
            key: key,
            etag: result.ETag,
            location: result.Location
        };
    } catch (error) {
        console.error(`❌ Erro no upload de ${key}:`, error);
        throw error;
    }
}

/**
 * Download de arquivo do MinIO
 * @param {string} key - Caminho/nome do arquivo no bucket
 * @returns {Promise<Buffer>}
 */
async function downloadFile(key) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        const result = await s3.getObject(params).promise();
        console.log(`✅ Download bem-sucedido: ${key}`);
        return result.Body;
    } catch (error) {
        console.error(`❌ Erro no download de ${key}:`, error);
        throw error;
    }
}

/**
 * Deleta arquivo do MinIO
 * @param {string} key - Caminho/nome do arquivo no bucket
 * @returns {Promise<void>}
 */
async function deleteFile(key) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        await s3.deleteObject(params).promise();
        console.log(`✅ Arquivo deletado: ${key}`);
    } catch (error) {
        console.error(`❌ Erro ao deletar ${key}:`, error);
        throw error;
    }
}

/**
 * Lista arquivos no bucket (com prefixo opcional)
 * @param {string} prefix - Prefixo para filtrar (ex: 'maps/')
 * @returns {Promise<Array>}
 */
async function listFiles(prefix = '') {
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: prefix
    };

    try {
        const result = await s3.listObjectsV2(params).promise();
        console.log(`✅ Listagem de arquivos com prefixo "${prefix}": ${result.Contents.length} encontrados`);
        
        return result.Contents.map(item => ({
            key: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
            url: `${PUBLIC_URL}/${item.Key}`
        }));
    } catch (error) {
        console.error(`❌ Erro ao listar arquivos:`, error);
        throw error;
    }
}

/**
 * Verifica se um arquivo existe
 * @param {string} key - Caminho/nome do arquivo
 * @returns {Promise<boolean>}
 */
async function fileExists(key) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    try {
        await s3.headObject(params).promise();
        return true;
    } catch (error) {
        if (error.code === 'NotFound') {
            return false;
        }
        throw error;
    }
}

/**
 * Gera URL assinada temporária (para arquivos privados)
 * @param {string} key - Caminho/nome do arquivo
 * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
 * @returns {Promise<string>}
 */
async function getSignedUrl(key, expiresIn = 3600) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: expiresIn
    };

    try {
        const url = await s3.getSignedUrlPromise('getObject', params);
        console.log(`✅ URL assinada gerada para ${key} (expira em ${expiresIn}s)`);
        return url;
    } catch (error) {
        console.error(`❌ Erro ao gerar URL assinada:`, error);
        throw error;
    }
}

/**
 * Copia arquivo dentro do bucket
 * @param {string} sourceKey - Arquivo de origem
 * @param {string} destKey - Arquivo de destino
 * @returns {Promise<void>}
 */
async function copyFile(sourceKey, destKey) {
    const params = {
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${sourceKey}`,
        Key: destKey
    };

    try {
        await s3.copyObject(params).promise();
        console.log(`✅ Arquivo copiado: ${sourceKey} → ${destKey}`);
    } catch (error) {
        console.error(`❌ Erro ao copiar arquivo:`, error);
        throw error;
    }
}

/**
 * Testa a conexão com o MinIO
 * @returns {Promise<boolean>}
 */
async function testConnection() {
    try {
        console.log('🔍 Testando conexão com MinIO...');
        await s3.listBuckets().promise();
        console.log('✅ Conexão com MinIO bem-sucedida!');
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão com MinIO:', error.message);
        return false;
    }
}

/**
 * Deleta uma pasta completa (todos arquivos com prefixo)
 * @param {string} prefix - Prefixo da pasta (ex: 'rpg/maps/1_hospital/')
 * @returns {Promise<number>} - Número de arquivos deletados
 */
async function deleteFolder(prefix) {
    try {
        console.log(`🗑️ Deletando pasta: ${prefix}`);
        
        // Listar todos os arquivos com o prefixo
        const files = await listFiles(prefix);
        
        if (files.length === 0) {
            console.log(`⚠️ Nenhum arquivo encontrado em: ${prefix}`);
            return 0;
        }
        
        console.log(`📋 Encontrados ${files.length} arquivos para deletar`);
        
        // Deletar todos os arquivos
        const deletePromises = files.map(file => deleteFile(file.key));
        await Promise.all(deletePromises);
        
        console.log(`✅ Pasta deletada: ${prefix} (${files.length} arquivos)`);
        return files.length;
    } catch (error) {
        console.error(`❌ Erro ao deletar pasta ${prefix}:`, error);
        throw error;
    }
}

module.exports = {
    s3,
    BUCKET_NAME,
    PUBLIC_URL,
    uploadFile,
    downloadFile,
    deleteFile,
    deleteFolder,
    listFiles,
    fileExists,
    getSignedUrl,
    copyFile,
    testConnection
};
