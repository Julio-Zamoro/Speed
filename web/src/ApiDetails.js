import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    CssBaseline,
    CircularProgress,
    MenuItem,
    Select,
    Button,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import axios from 'axios';
import './index.css';

// ChartJS configuration
ChartJS.register(LineElement, BarElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

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
    const [stats, setStats] = useState(null); // Novo estado para as estatísticas
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState('last24h');
    const [selectedDatabase, setSelectedDatabase] = useState('Database1');
    const [chartType, setChartType] = useState('line');

    const toggleChartType = () => {
        setChartType((prevType) => (prevType === 'line' ? 'bar' : 'line'));
    };

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:3001/api/logs/rota/${encodeURIComponent(apiUrl)}`, {
                    params: { database: selectedDatabase },
                });
                setLogs(response.data.logs); // Logs da API
                setStats(response.data.stats); // Estatísticas da API
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [apiUrl, selectedDatabase]);

    const filterLogs = (logs) => {
        const now = new Date();
        const timeDurations = {
            last12h: 12 * 60 * 60 * 1000,
            last24h: 24 * 60 * 60 * 1000,
            last7d: 7 * 24 * 60 * 60 * 1000,
            last30d: 30 * 24 * 60 * 60 * 1000,
        };
        const filterTime = timeDurations[timeFilter];
        return logs.filter((log) => new Date(log.data_requisicao) > new Date(now - filterTime));
    };

    const filteredLogs = filterLogs(logs).sort((a, b) => new Date(a.data_requisicao) - new Date(b.data_requisicao));

    const data = {
        labels: filteredLogs.map((log) => {
            const date = new Date(log.data_requisicao);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }),
        datasets: [
            {
                label: 'Tempo de Resposta (ms)',
                data: filteredLogs.map((log) => {
                    if (!log.tempo_requisicao) return null;
                    const tempoMs =
                        typeof log.tempo_requisicao === 'object'
                            ? (log.tempo_requisicao.minutes * 60 + log.tempo_requisicao.seconds) * 1000
                            : log.tempo_requisicao * 1000;
                    return isNaN(tempoMs) || tempoMs <= 0 ? null : tempoMs;
                }),
                borderColor: chartType === 'line'
                    ? filteredLogs.map((log) =>
                          log.status_code >= 400 && log.status_code < 600
                              ? 'rgba(255, 99, 132, 1)'
                              : 'rgba(75, 192, 192, 1)'
                      )
                    : undefined,
                backgroundColor: filteredLogs.map((log) =>
                    log.status_code >= 400 && log.status_code < 600
                        ? 'rgba(255, 99, 132, 1)'
                        : 'rgba(75, 192, 192, 1)'
                ),
                tension: 0.1,
                borderWidth: chartType === 'bar' ? 1 : undefined,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                ticks: { color: '#a9a9a9' },
                grid: { color: '#333333' },
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#a9a9a9' },
                grid: { color: '#333333' },
                title: { display: true, text: 'Tempo de Resposta (ms)', color: '#ffffff' },
            },
        },
        plugins: {
            legend: { labels: { color: '#ffffff' } },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `Tempo: ${tooltipItem.raw} ms` || 'Erro',
                },
            },
        },
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container sx={{ padding: '20px', backgroundColor: '#1d1d1d', minHeight: '50vh' }}>
                <Typography variant="h5" gutterBottom>
                    Monitoramento da API: {apiName}
                </Typography>
                {stats && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Taxa de Sucesso: {stats.successPercentage}% | Total de Requisições: {stats.totalRequests} | Erros 404: {stats.total404}
                    </Typography>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Filtro de Tempo' }}
                        style={{ color: '#ffffff' }}
                    >
                        <MenuItem value="last12h">Últimas 12 horas</MenuItem>
                        <MenuItem value="last24h">Últimas 24 horas</MenuItem>
                        <MenuItem value="last7d">Últimos 7 dias</MenuItem>
                        <MenuItem value="last30d">Últimos 30 dias</MenuItem>
                    </Select>
                </div>
                <Button variant="contained" color="primary" onClick={toggleChartType}>
                    Tipo do gráfico
                </Button>

                {loading ? (
                    <CircularProgress color="inherit" />
                ) : error ? (
                    <Typography variant="body1" color="error">
                        {`Erro ao buscar dados: ${error}`}
                    </Typography>
                ) : filteredLogs.length === 0 ? (
                    <Typography variant="body1" color="secondary">
                        Nenhum dado disponível para o período selecionado.
                    </Typography>
                ) : chartType === 'line' ? (
                    <Line data={data} options={chartOptions} />
                ) : (
                    <Bar data={data} options={chartOptions} />
                )}
            </Container>
        </ThemeProvider>
    );
}

export default ApiDetails;
