import React, { useState, useRef, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import ApiDetails from './ApiDetails';
import './index.css';
import axios from 'axios';

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

function App() {
    const [selectedApi, setSelectedApi] = useState(null);
    const [errors, setErrors] = useState([]);
    const detailsRef = useRef(null);

    useEffect(() => {
        const fetchErrors = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/errors');
                setErrors(response.data);
            } catch (error) {
                console.error('Error fetching errors:', error.message);
            }
        };

        fetchErrors();
        const intervalId = setInterval(fetchErrors, 60000); // Atualizar a cada 1 minuto
        return () => clearInterval(intervalId);
    }, []);

    const handleMonitorClick = (url) => {
        setSelectedApi(url);
        setTimeout(() => {
            detailsRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <Container sx={{ padding: '20px', minHeight: '100vh', backgroundColor: '#121212' }}>
            <Grid container spacing={3} justifyContent="center">
                {apiUrls.map((url, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
<Paper
    sx={{
        display: 'flex',
        flexDirection: 'column', // Empilha os elementos verticalmente
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        height: '250px', // Aumenta a altura para comportar os botões
        backgroundColor: '#1d1d1d',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.7)',
        },
    }}
>
    <Typography
        variant="h6"
        sx={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#4caf50',
            marginBottom: '10px',
            textAlign: 'center',
        }}
    >
        Bradescoll 
    </Typography>

    {/* Contêiner dos botões */}
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column',  gap: '10px', width: '100%', justifyContent: 'center',}}>
        {/* Botão Monitorar */}
        <Button
            variant="contained"
            color="primary"
            onClick={() => handleMonitorClick(url)}
            sx={{
                backgroundColor: '#757575',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '20px',
                margin: '1px',
                padding: '10px 60px',
                '&:hover': {
                    backgroundColor: '#616161',
                },
            }}
        >
            Gráfico
        </Button>

        {/* Botão Cinza 1 */}
        <Button
            variant="contained"
            sx={{
                backgroundColor: '#757575',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '20px',
                margin: '1px',
                padding: '10px 30px',
                '&:hover': {
                    backgroundColor: '#616161',
                },
            }}
        >
            Tabela de erros
        </Button>

        {/* Botão Cinza 2 */}
        <Button
            variant="contained"
            sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '20px',
                margin: '1px',
                padding: '10px 50px',
                '&:hover': {
                    backgroundColor: '#388e3c',
                },
            }}
        >
            Conectado
        </Button>
    </div>
</Paper>

                    </Grid>
                ))}
            </Grid>
            {selectedApi && (
                <div ref={detailsRef} style={{ marginTop: '60px' }}>
                    <ApiDetails apiUrl={selectedApi} />
                </div>
            )}
            {errors.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <Typography variant="h6" sx={{ color: '#f44336', marginBottom: '20px' }}>
                        Erros de Conexão
                    </Typography>
                    <TableContainer
                        component={Paper}
                        sx={{
                            backgroundColor: '#1d1d1d', // Fundo escuro para a tabela
                            color: '#ffffff', // Texto branco geral
                            borderRadius: '10px',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>API URL</TableCell>
                                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Data/Hora</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {errors.map((error, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ color: '#e0e0e0' }}>{error.rota}</TableCell> {/* Cor das letras das células */}
                                        <TableCell sx={{ color: '#e0e0e0' }}>{error.status}</TableCell> {/* Cor das letras das células */}
                                        <TableCell sx={{ color: '#e0e0e0' }}>{error.created_at}</TableCell> {/* Cor das letras das células */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </Container>
    );
}

export default App;