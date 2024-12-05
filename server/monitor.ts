const express = require('express');
const cors = require('cors');
const { Pool } = require("pg");
const axios = require('axios');
const cron = require('node-cron');
const { format } = require('date-fns');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Configuração do banco de dados
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    port: process.env.DB_PORT || 5432,
});

// Lista de URLs das APIs e mapeamento para códigos de banco
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

// Função para verificar status da API e registrar logs
async function checkApiStatus(apiUrl) {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth() + 1; // Meses começam em 0
    const dia = now.getDate();
    const hora = now.getHours();
    const minuto = now.getMinutes();
    const tipo_registro = 'monitoramento';
    const codigo_banco = apiCodes[apiUrl] || 'N/A';
    const tempoInicio = Date.now();

    console.log(`[Monitor] Verificando: ${apiUrl} | Banco: ${codigo_banco}`);

    try {
        const response = await axios.get(apiUrl);
        const tempoRequisicao = Date.now() - tempoInicio;

        console.log(`[Monitor] API OK: ${apiUrl} | Status: ${response.status}`);

        await pool.query(
            `INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, ano, mes, dia, hora, minuto, tempo_requisicao, resposta, url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                tipo_registro,
                codigo_banco,
                response.status,
                ano,
                mes,
                dia,
                hora,
                minuto,
                tempoRequisicao,
                JSON.stringify(response.data),
                apiUrl
            ]
        );
    } catch (error) {
        const tempoRequisicao = Date.now() - tempoInicio;
        const statusCode = error.response ? error.response.status : 500;
        const errorMessage = error.response ? error.response.statusText : 'Erro de conexão';

        console.error(`[Monitor] Erro: ${apiUrl} | Status: ${statusCode} | Erro: ${errorMessage}`);

        await pool.query(
            `INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, ano, mes, dia, hora, minuto, tempo_requisicao, resposta, mensagem_erro, url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                tipo_registro,
                codigo_banco,
                statusCode,
                ano,
                mes,
                dia,
                hora,
                minuto,
                tempoRequisicao,
                JSON.stringify({ error: errorMessage }),
                errorMessage,
                apiUrl
            ]
        );
    }
}

// Função para verificar todas as APIs
async function checkAllApis() {
    for (const url of apiUrls) {
        await checkApiStatus(url);
    }
}

// Agendamento da tarefa para rodar a cada 30 segundos
cron.schedule('*/30 * * * * *', () => {
    console.log('[Monitor] Iniciando verificação automática das APIs...');
    checkAllApis();
});
