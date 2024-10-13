import React, { useEffect, useState } from 'react';
import { Container, Typography, CssBaseline } from '@mui/material';
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

function ApiDetails({ apiUrl, apiName }) {  // Adicionado apiName como prop
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/logs/rota/${encodeURIComponent(apiUrl)}`);
                setLogs(response.data);
            } catch (error) {
                console.error(`Error fetching logs for ${apiUrl}:`, error.message);
            }
        };

        fetchLogs();
    }, [apiUrl]);

    const data = {
        labels: logs.map((log) => new Date(log.created_at).toLocaleString()),
        datasets: [
            {
                label: 'Status da API',
                data: logs.map((log) => log.status),
                fill: false,
                borderColor: logs.map((log, index) => {
                    const currentStatus = log.status;
                    const previousStatus = logs[index - 1] ? logs[index - 1].status : 200;
                    const nextStatus = logs[index + 1] ? logs[index + 1].status : 200;

                    if (currentStatus !== 200) {
                        return 'red';
                    } else if (previousStatus !== 200 || nextStatus !== 200) {
                        return 'red';
                    } else {
                        return 'green';
                    }
                }),
                tension: 0.1,
                pointBackgroundColor: logs.map((log) => (log.status === 200 ? 'green' : 'red')),
                pointBorderColor: '#121212',
            },
        ],
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container sx={{ padding: '20px', backgroundColor: '#1d1d1d', minHeight: '50vh' }}>
                <Typography variant="h4" gutterBottom>
                    Logs da API: {apiName}  {/* Exibe o nome da API (banco) */}
                </Typography>
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
                            },
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#ffffff',
                                },
                            },
                        },
                    }}
                />
            </Container>
        </ThemeProvider>
    );
}

export default ApiDetails;
