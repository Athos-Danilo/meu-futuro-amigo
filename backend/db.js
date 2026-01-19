// Carrega as variáveis do cofre .env para a memória do Node.
require('dotenv').config();

// Importa o tradutor pg 
const { Pool } = require('pg');

// Configuração Inteligente:
// Verifica se estamos na Nuvem (Render) ou no PC Local.
// Se tiver 'DATABASE_URL', usa a configuração da Nuvem com SSL.
// Se não, usa as variáveis individuais do seu .env local.
const dbConfig = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Exigido pelo Neon/Render para segurança
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      };

// Cria as conexões do PostgreSQL usando a configuração definida acima.
const pool = new Pool(dbConfig); 

// Exporta um objeto contendo a função 'query', que atua como um atalho para 'pool.query'.
module.exports = {
    query: (text, params) => pool.query(text, params),
};