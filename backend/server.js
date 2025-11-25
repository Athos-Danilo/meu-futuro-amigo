// Ela carrega todas as senhas do arquivo '.env' para a memória (process.env).
require('dotenv').config();

// Importando as ferramentas.
const express = require('express');  // O framework do servidor.
const path = require('path');
const cors = require('cors');  // O porteiro que libera o acesso do front-end.
const bcrypt = require('bcryptjs');  // Criptografador de senhas.
const db = require('./db');  // O conector do banco de dados.
const multer = require('multer'); // Cara responsavel por fazer o upload da imagem do perfil.
const nodemailer = require('nodemailer'); // Responsável por enviar os e-mails.

// Criando nossa aplicação Express e onde ele irá rodar.
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '..')));

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


// Comando para o servidor transformar um texto JSON em um objeto JavaScript (o 'req.body').
app.use(express.json());
app.use(cors());

// Permitir acesso as imagens pela URL.
app.use('/uploads', express.static('uploads'));


// Rota de Teste para verificar se o servidor está funcionando.
/*app.get('/', (req, res) => {
    res.send('O servidor BACK_END está funcionando!');
}); */


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

        // Pega a foto do Perfil do usuário e coloca no componente das opções.
        if (senhaCorreta) {
            let caminhoFoto = user.foto_perfil;
            if (caminhoFoto) {
                caminhoFoto = caminhoFoto.replace(/\\/g, '/');

                if (!caminhoFoto.startsWith('/')) {
                    caminhoFoto = '/' + caminhoFoto;
                }
            }

            res.status(200).json({ mensagem: 'Login Realizado com Sucesso!',
                user: {
                    id: user.id,
                    nome_exibicao: user.nome_exibicao,
                    email: user.email,
                    foto_perfil: caminhoFoto
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

    let caminhoParaSalvar = null;

    if (req.file) {
        // Pega o caminho, corrige as barras e garante que começa com '/'
        caminhoParaSalvar = req.file.path.replace(/\\/g, '/');
        if (!caminhoParaSalvar.startsWith('/')) {
            caminhoParaSalvar = '/' + caminhoParaSalvar;
        }
    }

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


// Esqueci minha senha.
app.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ mensagem : 'O E-mail é obrigatório.'})
    }

    try {
        // Verificar se o emil está no banco de dados.
        const userResult = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            console.log(`Tentativa de mudança de senha para o E-mail não cadastrado: ${email}`);
            return res.status(200).json({ mensagem: 'Se este E-mail estiver cadastrado, um código de redefinição foi enviado.'});
        }

        // Gerar código aleatório de 6 digitos.
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Gerando token ${token} para ${email}`);

        // Salva o Token no banco de dados, mas antes apaga o antigo se houver.
        await db.query('DELETE FROM reset_tokens WHERE email = $1', [email]);
        await db.query('INSERT INTO reset_tokens (email, token) VALUES ($1, $2)', [email, token]);

        // Enviando o Token para o E-mail.
        const mailOptions = {
            from: `"Meu Futuro Amigo" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Seu Código de Redefinição de Senha',
            text: `Olá! Você solicitou a redefinição da sua senha. Seu Código é: ${token}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #6B8E23;">Redefinição de Senha - Meu Futuro Amigo</h2>
                    <p>Olá!</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Use o código de 6 dígitos abaixo para criar uma nova senha:</p>
                    <h3 style="background: #f0f0f0; padding: 10px 15px; border-radius: 8px; text-align: center; letter-spacing: 3px; font-size: 24px;">
                        ${token}
                    </h3>
                    <p>Este código expira em 1 hora.</p>
                    <p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
                    <hr>
                    <p style="font-size: 0.9em; color: #777;">Equipe Meu Futuro Amigo</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ mensagem: ' Se este E-mail estiver cadastrado um código de redefinição foi enviado.'});

    } catch (error) {
        console.error('Erro na rota /esqueci-senha', error);
        res.status(500).json({ mensagem: 'Erro interno do Servidor.'})
    }

});

// Verificação do Token.
app.post('/verificar-token', async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({ mensagem: 'E-mail e código são obrigatórios.' });
    }

    try {
        const result = await db.query(
            "SELECT * FROM reset_tokens WHERE email = $1 AND token = $2 AND criado_em > now() - INTERVAL '1 hour'",
            [email, token]
        );


        if (result.rows.length > 0) {
            res.status(200).json({ mensagem: 'Código verificado com sucesso!' });
        } else {
            res.status(400).json({ mensagem: 'Código inválido ou expirado. Tente novamente.' });
        }

    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

// Redefinir Senha.
app.post('/redefinir-senha', async (req, res) => {
    const { email, token, novaSenha } = req.body;

    if (!email || !token || !novaSenha) {
        return res.status(400).json({ mensagem: 'E-mail, código e nova senha são obrigatórios.' });
    }

    try {

        const tokenResult = await db.query(
            "SELECT * FROM reset_tokens WHERE email = $1 AND token = $2 AND criado_em > now() - INTERVAL '1 hour'",
            [email, token]
        );


        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ mensagem: 'Código inválido ou expirado. Solicite um novo.' });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        await db.query(
            'UPDATE usuarios SET senha = $1 WHERE email = $2',
            [senhaHash, email]
        );

        await db.query('DELETE FROM reset_tokens WHERE email = $1', [email]);

        // 6. SUCESSO!
        res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});

// Liga o Servidor.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
    console.log('Agora está pronto para receber POSTs em /login, /cadastro, /completar-perfil e /esqueci-senha');
});