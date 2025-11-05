// 1. Importando o express.
// 2. Criando a aplicação.
// 3. Definindo uma porta.
// 4. Criando uma rota de teste | Quando alguém acessar http://localhost:3000/.
// 5. Ligando o servidor.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');


const app = express();
const PORT = 3000;
//Adicionando 'cors' para liberar o acesso entre diferentes domínios.
// Comando para o servidor usar JSON.
app.use(express.json());
app.use(cors());


// Rota de Teste.
app.get('/', (req, res) => {
    res.send('O servidor BACK_END está funcionando!');
});

// Rota de Login (POST).
app.post('/login', async (req, res) => {
    const {email, senha} = req.body;
    
    console.log('--- Nova Tentativa de Login ---');
    console.log('E-mail Recebido:', email);
    console.log('Senha Recebida:', senha);

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado!'});
        }

        const user = result.rows[0];

        const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (senhaCorreta) {
        res.status(200).json({ mensagem: 'Login realizado com sucesso!'});
    } else {
        res.status(401).json({ mensagem: 'Senha incorreta.'});
    }
    } catch (error) {
        console.error('Erro ao tentar fazer login:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor'});
    }
});


// 7. ROTA DE CADASTRO (TEMPORÁRIA - SÓ PARA CRIAR UM USUÁRIO)
app.post('/cadastro', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
        // GERAR O "HASH" DA SENHA
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // SALVAR NO BANCO DE DADOS
        const result = await db.query(
            'INSERT INTO usuarios (email, senha) VALUES ($1, $2) RETURNING id, email',
            [email, senhaHash]
        );

        res.status(201).json({ mensagem: 'Usuário criado com sucesso!', user: result.rows[0] });

    } catch (error) {
        // 23505 é o código de erro do Postgres para "violação de chave única" (email duplicado)
        if (error.code === '23505') {
            return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado.' });
        }
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});




app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
    console.log('AGORA PRONTO para receber POSTs em http://localhost:3000/login');
});