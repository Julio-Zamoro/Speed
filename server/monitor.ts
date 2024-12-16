const express = require("express");
const cors = require("cors");
import { Pool } from "pg";
require("dotenv").config();

import axios from "axios";
import { headers } from "./common/consts";
import { response } from "express";
import { data } from "./common/dummyData";
import { EntityManager } from "typeorm";
import { AppDataSource } from "./data-source";
import { Sequence } from "./entity/sequence.entity";
import { Cedente } from "./entity/cedente.entity";

const cron = require("node-cron");

const { format } = require("date-fns");
const app = express();

app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: process.env.HOST,
  database: "postgres",
  password: "123",
  port: 5432,
});

const sequenceRepository = AppDataSource.getRepository(Sequence);
const cedenteRepository = AppDataSource.getRepository(Cedente);

// Lista de URLs das APIs a serem monitoradas
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

// Mapear cada URL para um código de banco específico
const apiCodes = {
  "https://jsonplaceholder.typicode.com/posts": "Banco do Brasil",
  "https://jsonplaceholder.typicode.com/comments": "Itaú",
  "https://jsonplaceholder.typicode.com/albums": "Itaú Francesa",
  "https://jsonplaceholder.typicode.com/photos": "Sicoob",
  "https://jsonplaceholder.typicode.com/todos": "Sicredi - v2",
  "https://jsonplaceholder.typicode.com/users": "Sicredi - v3",
  "https://api.publicapis.org/entries": "Caixa",
  "https://api.coingecko.com/api/v3/ping": "Santander",
  "https://api.github.com/users/github": "Banrisul",
  "https://dog.ceo/api/breeds/image/random": "Inter",
};

// Função para verificar o status da API e registrar no banco de dados
async function checkApiStatus(apiUrl) {
  const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const tipo_registro = "monitoramento";
  const codigo_banco = apiCodes[apiUrl] || "N/A";
  const tempoInicio = Date.now();

  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;
  const dia = now.getDate();
  const hora = now.getHours();
  const minuto = now.getMinutes();

  console.log(`URL: ${apiUrl} | Código do Banco: ${codigo_banco}`);
  try {
    const response = await axios.get(apiUrl);
    const tempoRequisicao = Date.now() - tempoInicio;

    await pool.query(
      `INSERT INTO api_logs (
        tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, 
        resposta, url, ano, mes, dia, hora, minuto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        tipo_registro,
        codigo_banco,
        response.status,
        created_at,
        tempoRequisicao,
        JSON.stringify(response.data),
        apiUrl,
        ano,
        mes,
        dia,
        hora,
        minuto,
      ]
    );
  } catch (error) {
    const tempoRequisicao = Date.now() - tempoInicio;
    const statusCode = error.response ? error.response.status : 500; // Usa o status da resposta se disponível, ou 500 em caso de falha de rede

    // Mensagem de erro clara
    let errorMessage = "Ocorreu um erro ao tentar acessar a API.";
    if (error.response) {
      switch (statusCode) {
        case 500:
          errorMessage =
            "A URL solicitada não foi encontrada. Por favor, verifique se está correta.";
          break;
        case 504:
          errorMessage =
            "Houve um erro interno no servidor. Tente novamente mais tarde.";
          break;
        default:
          errorMessage = `Erro ao conectar à API: ${error.response.status} - ${error.response.statusText}`;
      }
    } else {
      errorMessage = "Erro de conexão com a rede. Verifique sua internet.";
    }

    console.error(`Falha ao conectar na API ${apiUrl}:`, errorMessage);

    await pool.query(
      `INSERT INTO api_logs (
        tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, 
        resposta, url, ano, mes, dia, hora, minuto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        tipo_registro,
        codigo_banco,
        response.status,
        created_at,
        tempoRequisicao,
        JSON.stringify( {error: errorMessage} ),
        apiUrl,
        ano,
        mes,
        dia,
        hora,
        minuto,
      ]
    );


  }
}

async function checkAllApis() {
  const allCedentes = await cedenteRepository.find();

  for (const ele of allCedentes) {
    const finded = await sequenceRepository.findOneBy({ id: 1 });
    const tempoInicio = Date.now();
    data.TituloNossoNumero = finded.sequence.toString();
    if(ele.id > 6) {
        data.TituloNossoNumero = "";
    } else {
        data.TituloNossoNumero = finded.sequence.toString();
    }
    data.CedenteContaCodigoBanco = ele.codigo_banco;
    data.CedenteContaNumero = ele.conta_numero;
    data.CedenteContaNumeroDV = ele.conta_numero_dv;
    data.CedenteConvenioNumero = ele.convenio_numero;

    let vendido;
      try {
          let resposta = await axios.post(
              `http://www.homologacao.plugboleto.com.br/api/v1/boletos`,
              data,
              { headers }
          );
          vendido = resposta;

          const tempoRequisicao = Date.now() - tempoInicio;

          const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
          const now = new Date();
          const ano = now.getFullYear();
          const mes = now.getMonth() + 1;
          const dia = now.getDate();
          const hora = now.getHours();
          const minuto = now.getMinutes();

          await pool.query(
              `INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao,
        resposta, url, ano, mes, dia, hora, minuto)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                  "POST",
                  ele.id_codigo_banco,
                  resposta.status,
                  created_at,
                  tempoRequisicao,
                  JSON.stringify(resposta.data),
                  `http://www.homologacao.plugboleto.com.br/api/v1/boletos`,
                  ano,
                  mes,
                  dia,
                  hora,
                  minuto,
              ]
          );

          await sequenceRepository.save({
              id: finded.id,
              name: finded.name,
              sequence: finded.sequence + 1,
          });
      } catch (error) {
          const tempoRequisicao = Date.now() - tempoInicio;
          let statusCode = 500;
          let errorMessage = "Ocorreu um erro ao tentar acessar a API.";

          if (error.response) {
              console.log('por que ensinarei ', error.response);
              statusCode = error.response.status;

              switch (statusCode) {
                  case 500:
                      errorMessage = "Requisição inválida. Verifique os dados enviados.";
                      break;
                  case 504:
                      errorMessage = "Acesso não autorizado. Verifique suas credenciais.";
                      break;
                  default:
                      console.log('conferencia nominal> ', error.response);
                      errorMessage = `Erro ao conectar à API: ${statusCode} - ${error.response.statusText}`;
              }
          } else if (error.code) {
              switch (error.code) {
                  case "ECONNRESET":
                      errorMessage = "Conexão foi reiniciada. Tente novamente mais tarde.";
                      break;
                  case "EHOSTUNREACH":
                      errorMessage = "Host inacessível. Verifique sua conexão.";
                      break;
                  default:
                      errorMessage = `Erro desconhecido: ${error.code}`;
              }
          } else {
              errorMessage = "Erro de conexão com a rede. Verifique sua internet.";
          }

          console.error(errorMessage);
          const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
          const now = new Date();
          const ano = now.getFullYear();
          const mes = now.getMonth() + 1;
          const dia = now.getDate();
          const hora = now.getHours();
          const minuto = now.getMinutes();

          await pool.query(
              `INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, url, ano, mes, dia, hora, minuto
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [
                  "POST",
                  ele.id_codigo_banco,
                  statusCode,
                  created_at,
                  tempoRequisicao,
                  JSON.stringify({ error: errorMessage }),
                  `http://www.homologacao.plugboleto.com.br/api/v1/boletos`,
                  ano,
                  mes,
                  dia,
                  hora,
                  minuto,
              ]
          );
      }

      if (vendido) {
      console.log('quem entrou foi: ', ele.id_codigo_banco)
      try {


        const consume = await axios.get(
          `http://www.homologacao.plugboleto.com.br/api/v1/boletos?idIntegracao=${vendido.data._dados.idintegracao}`,
          {
            headers,
          }
        );

        const mentir = Date.now() - tempoInicio;
          const created_at = format(new Date(), "yyyy-MM-dd HH:mm:ss");
          const now = new Date();
          const ano = now.getFullYear();
          const mes = now.getMonth() + 1;
          const dia = now.getDate();
          const hora = now.getHours();
          const minuto = now.getMinutes();
        await pool.query(
          `INSERT INTO api_logs (tipo_registro, codigo_banco, status_code, data_requisicao, tempo_requisicao, resposta, url, ano, mes, dia, hora, minuto
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            "GET",
            ele.id_codigo_banco,
            consume.status,
            created_at,
            mentir,
            JSON.stringify(consume.data),
            `http://www.homologacao.plugboleto.com.br/api/v1/boletos?idIntegracao=${vendido.data._dados.idintegracao}`,
              ano,
              mes,
              dia,
              hora,
              minuto,
          ]
        );

      } catch (e) {
        console.log('deu ruim mas no get? ', e)
      }
    }


  }

}

AppDataSource.initialize()
  .then(async () => {
    cron.schedule("*/5 * * * * *", () => {
      console.log("Verificando o status das APIs...");
      checkAllApis();
    });
  })
  .catch((error) => console.log(error));
