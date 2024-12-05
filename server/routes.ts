import { Router } from "express"
import {Pool} from "pg"

export const routes = Router()
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '021412',
    port: 5432,
});

routes.post('/logs', async (req, res) => {
    const { tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, url } = req.body;

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

routes.get('/api/errors', async (req, res) => {
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
routes.get('/logs', async (req, res) => {
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
routes.get('/api/logs/rota/:apiUrl', async (req, res) => {
    const apiUrl = decodeURIComponent(req.params.apiUrl); // Decodifica a URL recebida
    console.log(`Fetching logs for: ${apiUrl}`); // Log para depuração

    const queryLogs = 'SELECT * FROM api_logs WHERE url = $1 ORDER BY data_requisicao DESC';
    const queryStats = `
        SELECT
            COUNT(*) AS total_requests,
            SUM(CASE WHEN status_code = 404 THEN 1 ELSE 0 END) AS total_404
        FROM
            api_logs
        WHERE
            url = $1
    `;

    try {
        const logsPromise = pool.query(queryLogs, [apiUrl]);
        const statsPromise = pool.query(queryStats, [apiUrl]);

        // Executa ambas as consultas em paralelo
        const [logsResult, statsResult] = await Promise.all([logsPromise, statsPromise]);

        const logs = logsResult.rows;

        // Verifica se há logs para a URL
        if (logs.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado para esta URL da API.' });
        }

        const stats = statsResult.rows[0];
        const totalRequests = parseInt(stats.total_requests, 10);
        const total404 = parseInt(stats.total_404, 10);
        const successPercentage = totalRequests > 0
            ? ((totalRequests - total404) / totalRequests) * 100
            : 0;

        // Retorna os logs junto com as estatísticas
        res.json({
            logs,
            stats: {
                totalRequests,
                total404,
                successPercentage: successPercentage.toFixed(2) // Porcentagem formatada com 2 casas decimais
            }
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

routes.get('/api/errors/count', async (req, res) => {
    const query = `
        WITH total_requests AS (
            SELECT codigo_banco, COUNT(*) AS total_count
            FROM api_logs
            GROUP BY codigo_banco
        ),
        error_counts AS (
            SELECT codigo_banco, COUNT(*) AS error_count
            FROM api_logs
            WHERE status_code = 200
            GROUP BY codigo_banco
        )
        SELECT tr.codigo_banco, 
               COALESCE(ec.error_count, 0) AS error_count, 
               ROUND((COALESCE(ec.error_count, 0) * 100.0 / tr.total_count), 2) AS error_percentage
        FROM total_requests tr
        LEFT JOIN error_counts ec ON tr.codigo_banco = ec.codigo_banco
        ORDER BY error_count DESC;
    `;

    try {
        // Executa a consulta
        const { rows } = await pool.query(query);

        // Retorna os resultados
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});
