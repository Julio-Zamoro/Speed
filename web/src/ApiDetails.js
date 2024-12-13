import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CssBaseline,
  CircularProgress,
  MenuItem,
  Select,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import axios from "axios";
import "./index.css";

// ChartJS configuration
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#090B1E",
      paper: "#1d1d1d",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a9a9a9",
    },
  },
  typography: {
    fontFamily: '"montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      color: "#ffffff",
    },
    body2: {
      color: "#a9a9a9",
    },
  },
});

function ApiDetails({ apiUrl, apiName }) {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("last24h");
  const [selectedDatabase, setSelectedDatabase] = useState("Database1");
  const [chartType, setChartType] = useState("line");
  const [request, setRequest] = useState("POST");

  const toggleChartType = () => {
    setChartType((prevType) => (prevType === "line" ? "bar" : "line"));
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:3001/api/logs/rota/${apiName}`,
          {
            params: { database: selectedDatabase },
          }
        );
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
    return logs.filter(
      (log) => new Date(log.data_requisicao) > new Date(now - filterTime) && log.tipo_registro === request
    );
  };

  const filteredLogs = filterLogs(logs).sort(
    (a, b) => new Date(a.data_requisicao) - new Date(b.data_requisicao)
  );

  const data = {
    labels: filteredLogs.map((log, index) => {
      // Sempre mostrar o rótulo para o primeiro e o último log
      if (index === 0 || index === filteredLogs.length - 1) {
        const date = new Date(log.data_requisicao);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      }
      return ""; // Deixa os rótulos intermediários em branco
    }),
    datasets: [
      {
        label: "Tempo de Resposta (ms)",
        data: filteredLogs.map((log) => {
          if (!log.tempo_requisicao) return null;
          const tempoMs =
            typeof log.tempo_requisicao === "object"
              ? (log.tempo_requisicao.minutes * 60 +
                log.tempo_requisicao.seconds) *
              1000
              : log.tempo_requisicao * 1000;
          return isNaN(tempoMs) || tempoMs <= 0 ? null : tempoMs;
        }),
        borderColor:
          chartType === "line"
            ? filteredLogs.map((log) =>
              log.status_code >= 400 && log.status_code < 600
                ? "rgba(255, 99, 132, 1)"
                : "rgba(75, 192, 192, 1)"
            )
            : undefined,
        backgroundColor: filteredLogs.map((log) =>
          log.status_code >= 400 && log.status_code < 600
            ? "rgba(255, 99, 132, 1)"
            : "rgba(75, 192, 192, 1)"
        ),
        tension: 0.1,
        borderWidth: chartType === "bar" ? 1 : undefined,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        ticks: { color: "#a9a9a9" },
        grid: { color: "#333333" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#a9a9a9" },
        grid: { color: "#333333" },
        title: {
          display: true,
          text: "Tempo de Resposta (ms)",
          color: "#ffffff",
        },
      },
    },
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const log = filteredLogs[tooltipItem.dataIndex]; // Acessando o log correspondente ao ponto do gráfico
            const date = new Date(log.data_requisicao);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            return [
              `Data: ${formattedDate}`,
              `Tempo: ${tooltipItem.raw} ms`,
              `Status: ${log.status_code}`,
            ];
          },
        },
      },
    },
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container
        sx={{
          padding: "20px",
          backgroundColor: "#242436",
          minHeight: "50vh",
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
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontSize: "1.5em" }}>
            Monitoramento da API: {apiName}
          </Typography>
          {stats && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Total de Requisições:{" "}
              {stats.totalRequests}
            </Typography>
          )}
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            maxHeight: "30px",
            marginLeft: "10px",
            alignItems: "center",
            justifyContent: "space-between",

          }}
        >
          <div style={{
            display: "flex",
            marginBottom: "10px",
            width: "100%",
            maxHeight: "30px",
            gap: "10px",
          }}>
            <ToggleButtonGroup
              value={request}
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setRequest(newValue);
                }
              }}
              exclusive
            >
              <ToggleButton value="POST" sx={{ textTransform: "none", fontSize: "0.8em" }}>Registro</ToggleButton>
              <ToggleButton value="GET" sx={{ textTransform: "none", fontSize: "0.8em" }}>Consulta</ToggleButton>
            
            </ToggleButtonGroup>

            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Filtro de Tempo" }}
              style={{ color: "#ffffff" }}
              sx={{
                textTransform: "none",
                fontSize: "0.8em"
              }}
            >
              <MenuItem value="last12h">Últimas 12 horas</MenuItem>
              <MenuItem value="last24h">Últimas 24 horas</MenuItem>
              <MenuItem value="last7d">Últimos 7 dias</MenuItem>
              <MenuItem value="last30d">Últimos 30 dias</MenuItem>
            </Select>


            <Button
              value={chartType}
              onClick={toggleChartType}
              variant="outlined"
              style={{ color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.3)" }}
              sx={{
                textTransform: "none",
                fontSize: "0.8em"
              }}
            >
              {chartType === "line" ? "Gráfico de Linha" : "Gráfico de Barra"}

            </Button>
          </div>
        </div>
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
        ) : chartType === "line" ? (
          <Line data={data} options={chartOptions} />
        ) : (
          <Bar data={data} options={chartOptions} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default ApiDetails;
