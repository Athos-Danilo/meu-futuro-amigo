// Ela carrega todas as senhas do arquivo '.env' para a memória (process.env).
require('dotenv').config();

// Importando as ferramentas.
const express = require('express');  // O framework do servidor.
const cors = require('cors');  // O porteiro que libera o acesso do front-end.
const bcrypt = require('bcryptjs');  // Criptografador de senhas.
const db = require('./db');  // O conector do banco de dados.
const multer = require('multer'); // Cara responsavel por fazer o upload da imagem do perfil.
const nodemailer = require('nodemailer'); // Responsável por enviar os e-mails.


// Envio do Email.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Onde ele vai guardar e com qual nome ele salvará as imagens.
const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, 'uploads/');
    },
    filename: (req, file, cd) => {
        cd(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage});


// Criando nossa aplicação Express e onde ele irá rodar.
const app = express();
const PORT = 3000;

// Comando para o servidor transformar um texto JSON em um objeto JavaScript (o 'req.body').
app.use(express.json());
app.use(cors());

// Permitir acesso as imagens pela URL.
app.use('/uploads', express.static('uploads'));


// Rota de Teste para verificar se o servidor está funcionando.
app.get('/', (req, res) => {
    res.send('O servidor BACK_END está funcionando!');
});


// Rota de Login.
app.post('/login', async (req, res) => {
    const {email, senha} = req.body;
    
    console.log('--- Nova Tentativa de Login ---');
    console.log('E-mail Recebido:', email);

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não Encontrado!'});
        }

        const user = result.rows[0];

        const senhaCorreta = await bcrypt.compare(senha, user.senha);

        if (senhaCorreta) {
            res.status(200).json({ mensagem: 'Login Realizado com Sucesso!',
                user: {
                    id: user.id,
                    nome_exibicao: user.nome_exibicao,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({ mensagem: 'Senha Incorreta.'});
        }
    } catch (error) {
        console.error('Erro ao tentar fazer Login:', error);
        res.status(500).json({ mensagem: 'Erro interno do Servidor'});
    }
});


// Rota da 1ª Parte do Cadastro.
app.post('/cadastro', async (req, res) => {
    const { nome_completo, email, senha } = req.body

    if (!nome_completo || !email || !senha) {
        return res.status(400).json({ mensagem: 'Nome, Email e Senha são Obrigatórios!'});
    }

    // Criando o nome de exibição, que será o primeiro nome do Usuário.
    const nome_exibicao = nome_completo.split(' ')[0];

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const result = await db.query(
            'INSERT INTO usuarios (nome_completo, nome_exibicao, email, senha) VALUES ($1, $2, $3, $4) RETURNING id, email, nome_exibicao',
            [nome_completo, nome_exibicao, email, senhaHash]
        );

        res.status(201).json({ mensagem: 'Usuário criado com sucesso!', user: result.rows[0] });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ mensagem: 'Este E-mail já está Cadastrado!'});
        }
        console.error('Erro ao Cadastrar Usuário', error);
        res.status(500).json({ mensagem: 'Erro Interno do Servidor.'});
    }
});


// Rota da 2ª Parte do Cadastro.
app.post('/completar-perfil', upload.single('foto_perfil'), async (req, res) => {
    // Precisa do email para saber quem atualizar. 
    const { email, numero, cep, cidade, estado } = req.body;

    const foto_perfil = req.file ? req.file.path : null;

    if (!email || !numero || !cep || !cidade || !estado) {
        return res.status(400).json({ mensagem: 'Todos os Campos são Obrigatórios!'});
    }

    try {
        const result = await db.query(
            'UPDATE usuarios SET numero = $1, cep = $2, cidade = $3, estado = $4, foto_perfil = $5 WHERE email = $6 RETURNING id, nome_exibicao, foto_perfil',
            [numero, cep, cidade, estado, foto_perfil, email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ mensagem: 'Usuário não Encontrado para Atualizar.'});
        }

        res.status(200).json({ mensagem: 'Perfil Completo com Sucesso!', user: result.rows[0] });

    } catch (error) {
        console.error('Erro ao Completar Perfil', error);
        res.status(500).json({ mensagem: 'Erro Interno do Servidor.'});
    }
});


// ROTA DE TESTE DE E-MAIL (TEMPORÁRIA)
app.get('/teste-email', async (req, res) => {
    try {
        await transporter.sendMail({
            from: '"Meu Futuro Amigo" <' + process.env.EMAIL_USER + '>',
            to: process.env.EMAIL_USER, // Manda para você mesmo!
            subject: 'Teste do Sistema de E-mail',
            text: 'Se você recebeu isso, o Nodemailer está funcionando! 🚀'
        });
        res.send('E-mail de teste enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).send('Erro ao enviar e-mail: ' + error.message);
    }
});


// Liga o Servidor.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
    console.log('Agora está pronto para receber POSTs em /login, /cadastro e /completar-perfil');
});