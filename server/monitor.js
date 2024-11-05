const axios = require('axios');
const cron = require('node-cron');
const { Pool } = require('pg');
const { format } = require('date-fns');

// Configuração do PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123456',
    port: 5432,
});

// Lista de URLs das APIs a serem monitoradas
const apiUrls = [
    'https://jsonplaceholder.typicode.com/posts',
    'https://jsonplaceholder.typicode.com/comments',
    'https://jsonplaceholder.typicode.com/albums',
    'https://jsonplaceholder.typicode.com/photos',
    'https://jsonplaceholder.typicode.com/todos',
    'https://jsonplaceholder.typicode.com/users',
    'https://api.publicapis.org/entries',
    'https://api.coingecko.com/api/v3/ping',
    'https://api.github.com/users/github',
    'https://dog.ceo/api/breeds/image/random'
];

// Mapear cada URL para um código de banco específico
const apiCodes = {
    'https://jsonplaceholder.typicode.com/posts': 'Banco do Brasil',
    'https://jsonplaceholder.typicode.com/comments': 'Itaú',
    'https://jsonplaceholder.typicode.com/albums': 'Itaú Francesa',
    'https://jsonplaceholder.typicode.com/photos': 'Sicoob',
    'https://jsonplaceholder.typicode.com/todos': 'Sicredi - v2',
    'https://jsonplaceholder.typicode.com/users': 'Sicredi - v3',
    'https://api.publicapis.org/entries': 'Caixa',
    'https://api.coingecko.com/api/v3/ping': 'Santander',
    'https://api.github.com/users/github': 'Banrisul',
    'https://dog.ceo/api/breeds/image/random': 'Inter'
};

// Função para verificar o status da API e registrar no banco de dados
async function checkApiStatus(apiUrl) {
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const tipo_registro = 'monitoramento';
    const codigo_banco = apiCodes[apiUrl] || 'N/A';
    const tempoInicio = Date.now();

    console.log(`URL: ${apiUrl} | Código do Banco: ${codigo_banco}`);

    try {
        const response = await axios.get(apiUrl);
        const tempoRequisicao = Date.now() - tempoInicio;

        console.log(`API ${apiUrl} está funcionando. Status: ${response.status}`);
        
        // Adicionando a URL na inserção do log
        await pool.query(
            'INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [tipo_registro, codigo_banco, response.status, created_at, tempoRequisicao, JSON.stringify(response.data), apiUrl] // Incluindo apiUrl aqui
        );
    } catch (error) {
        const tempoRequisicao = Date.now() - tempoInicio;
        const statusCode = error.response ? error.response.status : 500; // Usa o status da resposta se disponível, ou 500 em caso de falha de rede
        
        // Mensagem de erro clara
        let errorMessage = 'Ocorreu um erro ao tentar acessar a API.';
        if (error.response) {
            switch (statusCode) {
                case 404:
                    errorMessage = 'A URL solicitada não foi encontrada. Por favor, verifique se está correta.';
                    break;
                case 500:
                    errorMessage = 'Houve um erro interno no servidor. Tente novamente mais tarde.';
                    break;
                case 403:
                    errorMessage = 'Acesso negado à API. Verifique suas credenciais.';
                    break;
                default:
                    errorMessage = `Erro ao conectar à API: ${error.response.status} - ${error.response.statusText}`;
            }
        } else {
            errorMessage = 'Erro de conexão com a rede. Verifique sua internet.';
        }

        console.error(`Falha ao conectar na API ${apiUrl}:`, errorMessage);
        
        // Adicionando a URL na inserção do log de erro
        await pool.query(
            'INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, mensagem_erro, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [tipo_registro, codigo_banco, statusCode, created_at, tempoRequisicao, JSON.stringify({ error: errorMessage }), errorMessage, apiUrl] // Incluindo apiUrl aqui
        );
    }
}

// Função para verificar todas as APIs da lista
async function checkAllApis() {
    for (const url of apiUrls) {
        await checkApiStatus(url);
    }
}

// Agenda a verificação de APIs a cada 30 segundos
cron.schedule('*/30 * * * * *', () => {
    console.log('Verificando o status das APIs...');
    checkAllApis();
});

console.log('Monitorando 10 APIs. A cada 30 segundos, será realizada uma verificação.');
