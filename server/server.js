const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123456',
    port: 5432,
});

// Endpoint para salvar um novo log
app.post('/logs', async (req, res) => {
    const { tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, url } = req.body;

    // Verificação se a URL está presente
    if (!url) {
        console.error('URL ausente no corpo da requisição');
        return res.status(400).json({ error: 'O campo URL é obrigatório.' });
    }

    // Decodifica a URL antes de salvá-la
    const decodedUrl = decodeURIComponent(url);
    console.log(`Salvando log para URL: ${decodedUrl}`); // Log para depuração

    const query = 'INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    try {
        const { rows } = await pool.query(query, [tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, decodedUrl]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para obter todos os erros
app.get('/api/errors', async (req, res) => {
    const query = 'SELECT * FROM api_logs WHERE status_code != 200 ORDER BY data_requisicao DESC';
    try {
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para obter todos os logs
app.get('/logs', async (req, res) => {
    const { limit } = req.query;
    const query = 'SELECT * FROM api_logs ORDER BY data_requisicao DESC LIMIT $1';
    try {
        const { rows } = await pool.query(query, [limit]);
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para buscar logs por URL da API
app.get('/api/logs/rota/:apiUrl', async (req, res) => {
    const apiUrl = decodeURIComponent(req.params.apiUrl); // Decodifica a URL recebida
    console.log(`Fetching logs for: ${apiUrl}`); // Log para depuração
    const query = 'SELECT * FROM api_logs WHERE url = $1 ORDER BY data_requisicao DESC';
    try {
        const { rows } = await pool.query(query, [apiUrl]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado para esta URL da API.' });
        }
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
});
