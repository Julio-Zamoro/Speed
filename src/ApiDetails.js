import React, { useEffect, useState } from 'react';
import { Container, Typography, CssBaseline, CircularProgress } from '@mui/material';
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

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:3001/api/logs/rota/${encodeURIComponent(apiUrl)}`);
                console.log('Dados da API:', response.data);
                setLogs(response.data);
            } catch (error) {
                console.error(`Error fetching logs for ${apiUrl}:`, error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [apiUrl]);

    // Ajuste os dados do gráfico para mostrar o tempo de resposta
    const data = {
        labels: logs.slice().reverse().map((log) => {
            const date = new Date(log.data_requisicao);
            return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }),
        datasets: [
            {
                label: 'Tempo de Resposta (ms)',
                data: logs.slice().reverse().map((log) => {
                    const responseTime = log.tempo_requisicao ? parseFloat(log.tempo_requisicao) * 1000 : 0;
                    return responseTime;
                }),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
                pointBackgroundColor: logs.slice().reverse().map((log) => (parseFloat(log.tempo_requisicao) * 1000 > 1000 ? 'red' : 'green')),
                pointBorderColor: '#fff',
                pointRadius: 5,  // Aumentando o tamanho dos pontos
                pointHoverRadius: 7, // Aumentando o tamanho ao passar o mouse
            },
        ],
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container sx={{ padding: '20px', backgroundColor: '#1d1d1d', minHeight: '50vh' }}>
                <Typography variant="h4" gutterBottom>
                    Logs da API: {apiName}
                </Typography>
                {loading ? (
                    <CircularProgress color="inherit" />
                ) : error ? (
                    <Typography variant="body1" color="error">{`Erro ao buscar dados: ${error}`}</Typography>
                ) : logs.length === 0 ? (
                    <Typography variant="body1" color="secondary">Nenhum dado disponível. Verifique se a URL da API está correta e se existem dados para o endpoint.</Typography>
                ) : (
                    <Line
                        data={data}
                        options={{
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
                                    ticks: {
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
                                            return `Tempo: ${tooltipItem.raw} ms`;
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
