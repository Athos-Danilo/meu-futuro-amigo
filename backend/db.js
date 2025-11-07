// Carrega as variáveis do cofre .env para a memória do Node.
require('dotenv').config();

//Importa o tradutor pg 
const { Pool, Query } = require('pg');

// Cria as conexões do PostgreSQL usando as variáveis de ambiente carregadas do .env.
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
}); 

// Exporta um objeto contendo a função 'query', que atua como um atalho para 'pool.query'.
module.exports = {
    query: (text, params) => pool.query(text, params),
};
