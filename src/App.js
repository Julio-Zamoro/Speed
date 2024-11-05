import React, { useState, useRef, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import ApiDetails from './ApiDetails';
import axios from 'axios';

// Importar a logo principal e as logos das APIs
import Logo from './Logos/Logo.png';
import LogoBB from './Logos/LogoBB 1.png';
import LogoItau from './Logos/LogoItau 2.png';
import LogoSicoob from './Logos/LogoSicoob 1.png';
import LogoSicredi from './Logos/LogoSicredi 1.png';
import LogoCaixa from './Logos/LogoCaixa 1.png';
import LogoSantander from './Logos/LogoSantander 1.png';
import LogoBanrisul from './Logos/LogoBanrisul 1.png';
import LogoInter from './Logos/LogoInter 1.png';

// Lista de URLs das APIs
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

// Lista de nomes para cada API
const apiNames = [
    'Banco do Brasil',
    'Itaú',
    'Itaú Francesa',
    'Sicoob',
    'Sicredi - v2',
    'Sicredi - v3',
    'Caixa',
    'Santander',
    'Banrisul',
    'Inter'
];

// Lista de Logos
const apiLogos = [
    LogoBB,
    LogoItau,
    LogoItau,
    LogoSicoob,
    LogoSicredi,
    LogoSicredi,
    LogoCaixa,
    LogoSantander,
    LogoBanrisul,
    LogoInter
];

function App() {
    const [selectedApi, setSelectedApi] = useState(null);
    const [errors, setErrors] = useState([]);
    const detailsRef = useRef(null);
    const logsRef = useRef(null);

    useEffect(() => {
        const fetchErrors = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/errors');
                setErrors(response.data); // Armazenar os dados de erros recebidos no estado
            } catch (error) {
                console.error('Error fetching errors:', error);
            }
        };

        fetchErrors();
        const intervalId = setInterval(fetchErrors, 60000); // Atualizar a cada 1 minuto
        return () => clearInterval(intervalId);
    }, []);

    const handleMonitorClick = (url, name) => {
        setSelectedApi({ url, name });
        setTimeout(() => {
            detailsRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleLogsClick = () => {
        logsRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    // Função para formatar a data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    return (
        <Container sx={{ padding: '20px', minHeight: '100vh', backgroundColor: '#090B1E' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img 
                    src={Logo} 
                    alt="Logo" 
                    style={{ width: '271px', height: '62px', marginRight: '10px' }}
                />
                <Typography variant="h4" sx={{ color: '#f7faf8' }}>
                    Monitor de APIs
                </Typography>
            </div>

            <Grid container spacing={3} justifyContent="center">
                {apiUrls.map((url, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Paper
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px',
                                height: '250px',
                                backgroundColor: '#242436',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.7)',
                                },
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', alignSelf: 'flex-start' }}>
                                <img 
                                    src={apiLogos[index]} 
                                    alt={`${apiNames[index]} logo`} 
                                    style={{ width: '30px', height: '30px', verticalAlign: 'middle' }} 
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: '#f7faf8',
                                        marginLeft: '10px',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {apiNames[index]}
                                </Typography>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleMonitorClick(url, apiNames[index])}
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
                                <Button
                                    variant="contained"
                                    onClick={handleLogsClick}
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
                    <Typography variant="h6" sx={{ color: '#ffff', textAlign: 'center', marginBottom: '20px' }}>
                        Detalhes da API: {selectedApi.name}
                    </Typography>
                    <ApiDetails apiUrl={selectedApi.url} apiName={selectedApi.name} />
                </div>
            )}

            <div ref={logsRef} style={{ marginTop: '40px' }}>
                <Typography variant="h6" sx={{ color: '#f44336', marginBottom: '20px' }}>
                    Erros de Conexão
                </Typography>
                <TableContainer
                    component={Paper}
                    sx={{
                        backgroundColor: '#1d1d1d',
                        color: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>Código do Banco</TableCell>
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>Tipo de Registro</TableCell>
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>Data</TableCell>
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1rem' }}>Mensagem de Erro</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {errors.map((error) => (
                                <TableRow key={error.id}>
                                    <TableCell sx={{ fontSize: '1rem', color: '#ffffff' }}>{error.codigo_banco}</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', color: '#ffffff' }}>{error.tipo_registro}</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', color: error.status_code === 200 ? 'green' : 'red' }}>
                                        {error.status_code === 200 ? 'Sucesso' : 'Erro'}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '1rem', color: '#ffffff' }}>{formatDate(error.data_requisicao)}</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', color: '#ffffff' }}>{error.mensagem_erro}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </Container>
    );
}

export default App;
