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
                setLogs(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [apiUrl]);

    const data = {
        labels: logs.slice().reverse().map((log) => {
            const date = new Date(log.data_requisicao);
            return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }),
        datasets: [
            {
                label: 'Tempo de Resposta (ms)',
                data: logs.slice().reverse().map((log) => {
                    const tempoMs = Math.max(parseFloat(log.tempo_requisicao) * 1000, 0); // Converte segundos para ms e evita negativos
                    return tempoMs > 0 ? tempoMs : null;
                }),
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1,
                pointBackgroundColor: 'blue',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7,
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
                                        callback: (value) => (value > 0 ? value : 'Erro'), // Exibe "Erro" para valores <= 0
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
                                    suggestedMin: 0, // Começa o eixo y a partir de 0 para valores positivos
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
