import React, { useEffect, useState } from 'react';
import { Container, Typography, CssBaseline, CircularProgress, MenuItem, Select } from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import './index.css';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#090B1E',
            paper: '#1d1d1d',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a9a9a9',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            color: '#ffffff',
        },
        body2: {
            color: '#a9a9a9',
        },
    },
});

function ApiDetails({ apiUrl, apiName }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState('last24h');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:3001/api/logs/rota/${encodeURIComponent(apiUrl)}`);
                console.log('Dados recebidos:', response.data); // Log para verificar os dados recebidos
                setLogs(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [apiUrl]);

    const filterLogs = (logs) => {
        const now = new Date();
        switch (timeFilter) {
            case 'last12h':
                return logs.filter(log => new Date(log.data_requisicao) > new Date(now - 12 * 60 * 60 * 1000));
            case 'last24h':
                return logs.filter(log => new Date(log.data_requisicao) > new Date(now - 24 * 60 * 60 * 1000));
            case 'last7d':
                return logs.filter(log => new Date(log.data_requisicao) > new Date(now - 7 * 24 * 60 * 60 * 1000));
            case 'last30d':
                return logs.filter(log => new Date(log.data_requisicao) > new Date(now - 30 * 24 * 60 * 60 * 1000));
            default:
                return logs;
        }
    };

    const filteredLogs = filterLogs(logs);

    const data = {
        labels: filteredLogs.slice().reverse().map((log) => {
            const date = new Date(log.data_requisicao);
            return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }),
        datasets: [
            {
                label: 'Tempo de Resposta (ms)',
                data: filteredLogs.slice().reverse().map((log, index) => {
                    if (!log.tempo_requisicao) {
                        console.error(`Tempo de requisição ausente no log de índice ${index}:`, log);
                        return null; // Retorna `null` se o tempo de requisição estiver ausente
                    }
                    const tempoMs = typeof log.tempo_requisicao === 'object'
                        ? (log.tempo_requisicao.minutes * 60 + log.tempo_requisicao.seconds) * 1000
                        : (log.tempo_requisicao > 1000 ? log.tempo_requisicao : log.tempo_requisicao * 1000); // Converte para ms se estiver em segundos
                    console.log(`Log ${index} - Tempo de Requisição Original: ${log.tempo_requisicao}, Convertido: ${tempoMs} ms`); // Log para verificar valores
                    return isNaN(tempoMs) || tempoMs <= 0 ? null : tempoMs;
                }),
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)', // Cor da linha
                tension: 0.1,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)', // Cor dos pontos
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    // Log final para verificar todos os dados de tempos de requisição processados
    console.log('Dados do gráfico:', data.datasets[0].data);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container sx={{ padding: '20px', backgroundColor: '#1d1d1d', minHeight: '50vh' }}>
                <Typography variant="h4" gutterBottom>
                    Logs da API: {apiName}
                </Typography>
                <Select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Filtro de Tempo' }}
                    style={{ marginBottom: '20px', color: '#ffffff' }}
                >
                    <MenuItem value="last12h">Últimas 12 horas</MenuItem>
                    <MenuItem value="last24h">Últimas 24 horas</MenuItem>
                    <MenuItem value="last7d">Últimos 7 dias</MenuItem>
                    <MenuItem value="last30d">Últimos 30 dias</MenuItem>
                </Select>
                {loading ? (
                    <CircularProgress color="inherit" />
                ) : error ? (
                    <Typography variant="body1" color="error">{`Erro ao buscar dados: ${error}`}</Typography>
                ) : filteredLogs.length === 0 ? (
                    <Typography variant="body1" color="secondary">Nenhum dado disponível para o período selecionado. Verifique se a URL da API está correta e se existem dados para o endpoint.</Typography>
                ) : (
                    <Line
                        data={data}
                        options={{
                            responsive: true,  // Garante que o gráfico seja responsivo
                            scales: {
                                x: {
                                    ticks: {
                                        color: '#a9a9a9',
                                    },
                                    grid: {
                                        color: '#333333',
                                    },
                                },
                                y: {
                                    beginAtZero: true, // Garante que o eixo Y comece do zero
                                    ticks: {
                                        stepSize: 1, // Define o intervalo entre as marcações
                                        color: '#a9a9a9',
                                    },
                                    grid: {
                                        color: '#333333',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Tempo de Resposta (ms)',
                                        color: '#ffffff',
                                    },
                                },
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#ffffff',
                                    },
                                },
                                tooltip: {
                                    enabled: true,
                                    mode: 'index',
                                    intersect: false,
                                    callbacks: {
                                        title: (tooltipItems) => {
                                            const date = new Date(tooltipItems[0].label);
                                            return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
                                        },
                                        label: (tooltipItem) => {
                                            return tooltipItem.raw !== null ? `Tempo: ${tooltipItem.raw} ms` : 'Erro';
                                        },
                                    },
                                    backgroundColor: '#333333',
                                    titleColor: '#ffffff',
                                    bodyColor: '#ffffff',
                                },
                            },
                        }}
                    />
                )}
            </Container>
        </ThemeProvider>
    );
}

export default ApiDetails;
