const axios = require('axios');
const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
const { format } = require('date-fns');
const db = new sqlite3.Database('./honesto.sqlite3');


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

async function checkApiStatus(apiUrl) {
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    try {
        const response = await axios.get(apiUrl);
        console.log(`API ${apiUrl} está funcionando. Status: ${response.status}`);
        db.run('INSERT INTO log (rota, status, created_at) VALUES (?, ?, ?)', [apiUrl, response.status, created_at]);
    } catch (error) {
        console.error(`Falha ao conectar na API ${apiUrl}:`, error.message);
        db.run('INSERT INTO log (rota, status, created_at) VALUES (?, ?, ?)', [apiUrl, 999, created_at]);
    }
}

async function checkAllApis() {
    for (const url of apiUrls) {
        await checkApiStatus(url);
    }
}

cron.schedule('*/30 * * * * *', () => {
    console.log('Verificando o status das APIs...');
    checkAllApis();
});

console.log('Monitorando 10 APIs. A cada 30 segundos, será realizada uma verificação.'); 
