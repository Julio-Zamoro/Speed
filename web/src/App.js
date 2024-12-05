import React, { useState, useRef, useEffect } from "react";
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
  TableRow,
} from "@mui/material";
import ApiDetails from "./ApiDetails";
import IconButton from '@mui/material/IconButton';
import axios from "axios";

// Importar a logo principal e as logos das APIs
import Logo from "./Imagens/Logo.png";
import LogoBB from "./Imagens/LogoBB 1.png";
import LogoItau from "./Imagens/LogoItau 2.png";
import LogoSicoob from "./Imagens/LogoSicoob 1.png";
import LogoSicredi from "./Imagens/LogoSicredi 1.png";
import LogoCaixa from "./Imagens/LogoCaixa 1.png";
import LogoSantander from "./Imagens/LogoSantander 1.png";
import LogoBanrisul from "./Imagens/LogoBanrisul 1.png";
import LogoInter from "./Imagens/LogoInter 1.png";
import Seta from "./Imagens/Seta.png";

// Lista de URLs das APIs
const apiUrls = [
  "https://jsonplaceholder.typicode.com/posts", 
  "https://jsonplaceholder.typicode.com/comments",
  "https://jsonplaceholder.typicode.com/albums",
  "https://jsonplaceholder.typicode.com/photos",
  "https://jsonplaceholder.typicode.com/todos",
  "https://jsonplaceholder.typicode.com/users",
  "https://api.publicapis.org/entries",
  "https://api.coingecko.com/api/v3/ping",
  "https://api.github.com/users/github",
  "https://dog.ceo/api/breeds/image/random",
];

// Lista de nomes para cada API
const apiNames = [
  "Banco do Brasil",
  "Itaú",
  "Itaú - Francesa",
  "Sicoob",
  "Sicredi - v2",
  "Sicredi - v3",
  "Caixa",
  "Santander",
  "Banrisul",
  "Inter",
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
  LogoInter,
];

function App() {
  const [selectedApi, setSelectedApi] = useState(null);
  const [errors, setErrors] = useState([]);
  const [apiStatus, setApiStatus] = useState({});
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const detailsRef = useRef(null);
  const logsRef = useRef(null);

  useEffect(() => {
    // Verificar a posição da rolagem da página
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Função para rolar até o topo da página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // Recuperando os erros da API
  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/errors");
        setErrors(response.data);
      } catch (error) {
        console.error("Error fetching errors:", error);
      }
    };

    fetchErrors();
  }, []);

  // Verificando o status das APIs
  useEffect(() => {
    const checkApiStatus = async () => {
      const statusUpdates = {};
      const communicationLogs = {};
      const response = await axios.get("http://localhost:3001/api/errors/count");
      const resposta = response.data;
      console.log(response.data)

      for (let i = 0; i < apiUrls.length; i++) {
        const startTime = Date.now();
        try {
          const response = await axios.get(apiUrls[i]);
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // Atualizando status, última comunicação e tempo de resposta
          statusUpdates[apiNames[i]] = {
            status: "connected",
            lastCommunication: new Date().toISOString(),
            responseTime: responseTime,
            success: true,
          };

          // Simulando cálculo da porcentagem de comunicação correta
          if (!communicationLogs[apiNames[i]]) communicationLogs[apiNames[i]] = [];
          communicationLogs[apiNames[i]].push(true);

        } catch (error) {
          const endTime = Date.now();

          // Atualizando status, última comunicação e tempo de resposta com erro
          statusUpdates[apiNames[i]] = {
            status: "disconnected",
            lastCommunication: new Date().toISOString(),
            responseTime: endTime - startTime,
            success: false,
          };

          if (!communicationLogs[apiNames[i]]) communicationLogs[apiNames[i]] = [];
          communicationLogs[apiNames[i]].push(false);
        }
      }

      console.log(communicationLogs)
      Object.keys(communicationLogs).forEach((api) => {
        const totalRequests = communicationLogs[api].length;
        const successfulRequests = communicationLogs[api].filter((success) => success).length;
        const successPercentage = (successfulRequests / totalRequests) * 100;

        if (statusUpdates[api]) {
          statusUpdates[api].successPercentage = successPercentage;
        }
      });

      resposta.forEach(element => {
        if (statusUpdates[element.codigo_banco]) {
              statusUpdates[element.codigo_banco].successPercentage = element.error_percentage; 
            }
      });
      setApiStatus(statusUpdates);
    };
    checkApiStatus();
  }, []);


  const handleMonitorClick = (url, name) => {
    setSelectedApi({ url, name });
    setTimeout(() => {
      detailsRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleLogsClick = () => {
    logsRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <Container
      sx={{ padding: "20px", minHeight: "100vh", backgroundColor: "#090B1E" }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            width: "45%",
            maxWidth: "200px",
            height: "auto",
            marginRight: "10px",
          }}
        />
        <Typography
          variant="h4"
          sx={{
            color: "#f7faf8",
            fontSize: "2rem", // Tamanho fixo para maior controle
            "@media (max-width: 600px)": {
              fontSize: "1.5rem", // Reduz o tamanho da fonte em telas pequenas
            },
            "@media (max-width: 400px)": {
              fontSize: "1.2rem", // Reduz ainda mais o tamanho em telas muito pequenas
            },
          }}
        >
          Monitor de APIs
        </Typography>
      </div>

      <Grid container spacing={2} justifyContent="center">
        {apiUrls.map((url, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Paper
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "15px",
                height: "auto",
                width: "auto",
                backgroundColor: "#242436",
                borderRadius: "25px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
                "&:hover": {
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.7)",
                },
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                  alignSelf: "flex-start",
                }}
              >
                <img
                  src={apiLogos[index]}
                  alt={`${apiNames[index]} logo`}
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "middle",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#f7faf8",
                    marginLeft: "10px",
                  }}
                >
                  {apiNames[index]}
                </Typography>
              </div>

              <Typography variant="body2" sx={{ color: "#f7faf8", fontSize: "0.7em", paddingTop: "20px"}}>
                <strong>Atualizado:</strong>{" "}
                {apiStatus[apiNames[index]]?.lastCommunication
                  ? new Date(apiStatus[apiNames[index]].lastCommunication).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })
                  : "N/A"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#f7faf8", fontSize: "0.7em" }}>
              <strong>Duração: </strong>{apiStatus[apiNames[index]]?.responseTime || "N/A"} ms
              </Typography>
              <Typography variant="body2" sx={{ color: "#f7faf8", fontSize: "0.7em"}}>
              <strong>Status: </strong>{apiStatus[apiNames[index]]?.status || "Desconhecido"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#f7faf8", fontSize: "0.7em", paddingBottom:"20px"}}>
              <strong>Disponibilidade: </strong>{apiStatus[apiNames[index]]?.successPercentage || "0"}%
              </Typography>

              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleMonitorClick(url, apiNames[index])}
                  sx={{
                    backgroundColor: "#757575",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    padding: "6px 30px",
                    fontSize: "0.8rem",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                      backgroundColor: "#616161",
                    },
                  }}
                >
                  Gráfico
                </Button>
                <Button
                  variant="contained"
                  onClick={handleLogsClick}
                  sx={{
                    backgroundColor: "#757575",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    padding: "6px 30px",
                    fontSize: "0.8rem",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                      backgroundColor: "#616161",
                    },
                  }}
                >
                  Tabela de erros
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor:
                      apiStatus[apiNames[index]]?.status === "connected"
                        ? "#4caf50"
                        : "#f44336",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    padding: "6px 30px",
                    fontSize: "0.8rem",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                      backgroundColor:
                        apiStatus[apiNames[index]]?.status === "connected"
                          ? "#4caf50"
                          : "#f44336",
                    },
                  }}
                >
                  {apiStatus[apiNames[index]]?.status === "connected"
                    ? "Disponível"
                    : "Indisponível"}
                </Button>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {showScrollToTop && (
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#616161",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#424242",
            },
          }}
        >
       <img src={Seta} alt="Scroll to top" width="25" height="25" />
        </IconButton>
      )}

      {selectedApi && (
        <div ref={detailsRef} style={{ marginTop: "60px" }}>
          <Typography
            variant="h6"
            sx={{ color: "#ffff", textAlign: "center", marginBottom: "20px" }}
          >
          </Typography>
          <ApiDetails apiUrl={selectedApi.url} apiName={selectedApi.name} />
        </div>
      )}

      <div ref={logsRef} style={{ marginTop: "40px" }}>
        <Typography
          variant="h5"
          sx={{ color: "#f44336", marginBottom: "20px" }}
        >
          Detalhamento de erros
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#1d1d1d",
            color: "#f7faf8",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: "#f7faf8",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Código do Banco
                </TableCell>
                <TableCell
                  sx={{
                    color: "#f7faf8",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    color: "#f7faf8",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Data da Requisição
                </TableCell>
                <TableCell
                  sx={{
                    color: "#f7faf8",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Mensagem de Erro
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errors.slice(-10).map((error, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: "#f7faf8" }}>
                    {error.codigo_banco}
                  </TableCell>
                  <TableCell sx={{ color: "#FF0000" }}>
                    {error.status_code}
                  </TableCell>
                  <TableCell sx={{ color: "#f7faf8" }}>
                    {formatDate(error.data_requisicao)}
                  </TableCell>
                  <TableCell sx={{ color: "#f7faf8" }}>
                    {error.mensagem_erro}
                  </TableCell>
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
