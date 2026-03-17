// ----------------- Configurações Iniciais -----------------> 

// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

// Importando as Ferramentas. 
const express = require('express');   
const path = require('path');         
const cors = require('cors');        
const bcrypt = require('bcryptjs');   
const db = require('./db');           
const multer = require('multer');     
const nodemailer = require('nodemailer'); 
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Inicializando a Aplicação.
const app = express(); 
const PORT = 3000;    

// Configura o Express para servir arquivos estáticos da raiz do projeto.
app.use(express.static(path.join(__dirname, '..')));


// ----------------- Configurações dos Serviços -----------------> 

// > Configuração do Serviço de E-mail.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// > Configuração do Serviço de Upload de Imagens da Claudnary. 
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Ensina o Multer a mandar os arquivos direto para a nuvem.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'meu_futuro_amigo/animais', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  },
});

// Inicializa o uploader com as regras acima.
const upload = multer({ storage: storage });

// > Middlewares Globais - Os Porteiros do Servidor.

// Middleware - JSON: Permite que o Servidor entenda dados enviado em formato JSON.
app.use(express.json());

// Middleware - CORS: Libera o Navegador para aceitar dados vindo do Servidor.
app.use(cors());

// Middleware - Imagens: Torna a pasta "uploads" pública e acessível por URL.
app.use('/uploads', express.static('uploads'));


// ----------------- Login do Usuário -----------------> 
app.post('/login', async (req, res) => {
    // Recebe e extrai os dados do formulário enviado pelo Frontend.
    const { email, senha } = req.body;

    // Monitoramento dos Logins.
    console.log('<--- Tentativa de Login --->');
    console.log('E-mail Recebido:', email);

    try {
        // Busca o Usuário no Banco de Dados pelo E-mail.
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        // Processo de Validação:
        // Se o resultado for zero, nenhum Usuário foi Encontrado.
        if (result.rows.length === 0) {
            console.log(`Tentativa de login com E-mail não Cadastrado: ${email}`);
            return res.status(404).json({ mensagem: 'Usuário não Encontrado!'});
        }
        // Primeiro e Único Usuário encontrado com o mesmo E-Mail.
        const user = result.rows[0]; 

        // Compara a senha digitada com a "Hash" criptografada armazenada no Banco de Dados.
        const senhaCorreta = await bcrypt.compare(senha, user.senha);

        if (senhaCorreta) {
            // Tratamento da Foto do Perfil (Compatibilidade Windows/Linux).
            let caminhoFoto = user.foto_perfil;
            if (caminhoFoto) {
                // Substitui todas as barras invertidas (\) por barras normais (/).
                caminhoFoto = caminhoFoto.replace(/\\/g, '/'); 
                
                // Garante que começa com (/) necessário para o navegador achar a pasta.
                if (!caminhoFoto.startsWith('/')) {
                    caminhoFoto = '/' + caminhoFoto;
                }
            }

            // Sucesso! O Frontend salva os dados do Usuário no localStorage.
            console.log(`Login bem-sucedido: ${email}`);
            res.status(200).json({ 
                mensagem: 'Login Realizado com Sucesso!',
                user: {
                    // Dados retornados para o Frontend usar:
                    id: user.id,                          
                    nome_completo: user.nome_completo,    
                    nome_exibicao: user.nome_exibicao,    
                    email: user.email,                    
                    foto_perfil: caminhoFoto,             
                    numero: user.numero,                  
                    cep: user.cep,                        
                    cidade: user.cidade,                  
                    estado: user.estado,
                    cpf: user.cpf                   
                }
            });
        } else {
            // Senha Errada.
            console.log(`Tentativa de login com senha errada para: ${email}`);
            res.status(401).json({ mensagem: 'Senha Incorreta.'});
        }
    } catch (error) {
        // Se der algum erro na comunicação.
        console.error('Erro ao tentar fazer Login:', error);
        res.status(500).json({ mensagem: 'Erro interno do Servidor'});
    }
});


// ----------------- Cadastro de Usuário - Etapa 1: Informações Básicas -----------------> 
app.post('/cadastro', async (req, res) => {
    // Recebe e extrai os dados enviados do Frontend.
    const { nome_completo, email, senha } = req.body;

    // Verifica se algum campo veio vazio.
    if (!nome_completo || !email || !senha) {
        console.log('Tentativa de Cadastro com Campos Vazios');
        return res.status(400).json({ mensagem: 'Nome, Email e Senha são Obrigatórios!'});
    }

    // Extrai o Primeiro Nome do Nome Nompleto do Usuário.
    const nome_exibicao = nome_completo.split(' ')[0];

    try {
        console.log('<--- Iniciando Criptografia da Senha --->');
        // O "SALT" é um texto aleatório que será misturado à senha.
        // O número "10" significa que o algoritmo vai embaralhar a senha 1024 vezes (2^10).
        // O O salt gerado sempre tem 22 caracteres (padrão do bcrypt).
        const salt = await bcrypt.genSalt(10);
        console.log('Salt gerado com sucesso');
        const senhaHash = await bcrypt.hash(senha, salt);

        // Insere um Novo Usuário com os dados coletados na tabele "usuarios", retorna o "ID", "EMAIL" e "NOME_EXIBICAO".
        const result = await db.query(
            'INSERT INTO usuarios (nome_completo, nome_exibicao, email, senha) VALUES ($1, $2, $3, $4) RETURNING id, email, nome_exibicao',
            [nome_completo, nome_exibicao, email, senhaHash]
        );

        // Sucesso! A 1ª Parte da Criação da Conta deu Certo.
        console.log(`Novo usuário criado: ${email}`);
        // Frontend recebe a resposta JSON (ID, EMAIL e NOME_EXIBICAO).
        res.status(201).json({ 
            mensagem: 'Usuário criado com sucesso!', 
            user: result.rows[0]  
        });

    } catch (error) {
        // E-Mail já Cadastrado.
        if (error.code === '23505') {
            console.log(`Tentativa de cadastro com e-mail duplicado: ${email}`);
            // Status 400 = Dados Inválidos/Duplicados.
            return res.status(400).json({ mensagem: 'Este E-mail já está Cadastrado!'});
        }
        
        // Se algo deu errado no servidor.
        console.error('Erro ao Cadastrar Usuário:', error);
        // Status 500 = Erro Interno do Servidor.
        res.status(500).json({ mensagem: 'Erro Interno do Servidor.'});
    }
});


// ----------------- Cadastro de Usuário - Etapa 2: Informações Complementares -----------------> 

// Intercepta a foto enviada pelo formulário e executa a configuração do Multer.
app.post('/completar-perfil', upload.single('foto_perfil'), async (req, res) => {
    // Recebe e extrai os dados enviados do Frontend.
    const { email, numero, cep, cidade, estado } = req.body;

    // Verifica se algum campo Obrigatório veio vazio.
    if (!email || !numero || !cep || !cidade || !estado) {
        console.log('Tentativa de completar perfil com campos vazios');
        return res.status(400).json({ mensagem: 'Todos os Campos são Obrigatórios!'});
    }

    try {
        let result;
        // Cenário A: Usuário enviou uma foto de Perfil.
        // O Multer cria 'req.file' apenas se o usuário enviou um arquivo.
        if (req.file) {
            console.log('Foto detectada:', req.file.filename);
        
            // Substituição de todas as barras invertidas (\) por normais (/).
            let caminhoParaSalvar = req.file.path.replace(/\\/g, '/');

            // Garantia que o caminho comece com (/).
            if (!caminhoParaSalvar.startsWith('/')) {
                caminhoParaSalvar = '/' + caminhoParaSalvar;
            }

            // Atualiza tudo no Banco de Dados e Retorna todos os Campos do Usuário.
            result = await db.query(
                'UPDATE usuarios SET numero = $1, cep = $2, cidade = $3, estado = $4, foto_perfil = $5 WHERE email = $6 RETURNING *',
                [numero, cep, cidade, estado, caminhoParaSalvar, email] 
            );
        } 

        // Cenário B: Usuário não enviou uma foto de Perfil.
        // O avatar permanece com o padrão do Frontend.
        else {
            console.log('Nenhuma foto enviada, atualizando apenas dados textuais');
            
            // Atualiza os Dados Preenchidos no Banco de Dados e Retorna todos os Campos do Usuário.
            result = await db.query(
                'UPDATE usuarios SET numero = $1, cep = $2, cidade = $3, estado = $4 WHERE email = $5 RETURNING *',
                [numero, cep, cidade, estado, email]
            );
        }

        // Se o resultado da query for igual a zero, significa que não achou nenhum usuário com esse email.
        if (result.rows.length === 0) {
            console.log(`Tentativa de atualizar usuário inexistente: ${email}`);
            return res.status(404).json({ mensagem: 'Usuário não encontrado.'});
        }

        // Todos os Campos do Usuário.
        let usuarioAtualizado = result.rows[0];
        
        // // Reforça a correção da barra na foto antes de enviar.
        if (usuarioAtualizado.foto_perfil) {
            usuarioAtualizado.foto_perfil = usuarioAtualizado.foto_perfil.replace(/\\/g, '/');
            
            if (!usuarioAtualizado.foto_perfil.startsWith('/')) {
                usuarioAtualizado.foto_perfil = '/' + usuarioAtualizado.foto_perfil;
            }
        }

        // Sucesso! Foi concluído o Cadastro do Usuário.
            console.log(`Perfil completado com sucesso para: ${email}`);
            res.status(200).json({ 
            mensagem: 'Perfil atualizado com Sucesso!', 
            user: usuarioAtualizado  
        });

    } catch (error) {

        // Se algo der errado.
        console.error('Erro ao Completar Perfil:', error);
        res.status(500).json({ mensagem: 'Erro Interno do Servidor.'});
    }
});


// ----------------- Teste do E-Mail -----------------> 

// Rota utilitária para verificar se o serviço de e-mail (Nodemailer) está operante.
// Acessível via GET em: localhost:3000/teste-email
app.get('/teste-email', async (req, res) => {
    try {
        console.log('<--- Iniciando Teste de E-mail --->');
        // Envia um e-mail de Teste para a Própria Conta do Sistema.
        await transporter.sendMail({
            from: '"Meu Futuro Amigo" <' + process.env.EMAIL_USER + '>', 
            to: process.env.EMAIL_USER, 
            subject: 'Teste do Sistema de E-mail',
            text: 'Se você recebeu isso, o Nodemailer está funcionando!'
        });

        // Feedback exibido no Navegador.
        console.log('E-mail de teste enviado com sucesso!');
        res.send('E-mail de teste enviado com sucesso! Verifique sua caixa de entrada.');

    } catch (error) {
        // Log de erro detalhado no terminal para depuração.
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).send('Erro ao enviar e-mail: ' + error.message);
    }
});


// ----------------- Recuperação da Senha - Etapa 1: Solicitação do Código -----------------> 
app.post('/esqueci-senha', async (req, res) => {
    // Recebe e extrai o E-mail enviado do Frontend.
    const { email } = req.body;

    console.log('<--- Solicitação de Recuperação de Senha --->');
    console.log('E-mail recebido:', email);

    // Verifica se o campo do e-mail fornecido está vazio.
    if (!email) {
        console.log('Tentativa de recuperação sem e-mail');
        return res.status(400).json({ mensagem: 'O E-mail é obrigatório.' });
    }

    try {
        // Verifica se o usuário existe no Banco de Dados.
        const userResult = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        // SEGURANÇA: Mesmo que o usuário não exista, retornamos uma mensagem genérica.
        // Isso impede que invasores descubram quais e-mails estão cadastrados no sistema.
        if (userResult.rows.length === 0) {
            console.log(`Tentativa de recuperação para e-mail não cadastrado: ${email}`);
            return res.status(200).json({ 
                mensagem: 'Se este e-mail estiver cadastrado, um código de redefinição foi enviado.' 
            });
        }

        // Gera um número aleatório entre 100000 e 999999 (6 dígitos).
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Na tabela "reset_tokens" ela armazena: email, token, criado_em (timestamp).
        // Apaga tokens antigos do Usuário.
        await db.query('DELETE FROM reset_tokens WHERE email = $1', [email]);
        console.log(`Tokens antigos apagados para: ${email}`);
        
        // Salva o Novo Token.
        await db.query('INSERT INTO reset_tokens (email, token) VALUES ($1, $2)', [email, token]);
        console.log(`Novo token salvo no banco para: ${email}`);

        // Envio do E-Mail.
        const mailOptions = {
            from: `"Meu Futuro Amigo" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Seu Código de Redefinição de Senha',
            
            // Versão text para clientes de e-mail antigos que não suportam HTML.
            text: `Seu código é: ${token}`,
            
            // Versão Html.
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <!-- Cabeçalho -->
                    <h2 style="color: #6B8E23; text-align: center;">Redefinição de Senha</h2>
                    
                    <!-- Saudação -->
                    <p>Olá!</p>
                    
                    <!-- Explicação -->
                    <p>Recebemos um pedido para resetar sua senha. Use o código abaixo:</p>
                    
                    <!-- TOKEN EM DESTAQUE -->
                    <!-- O token fica grande, com espaçamento entre números, fácil de copiar -->
                    <h3 style="background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; letter-spacing: 5px; font-size: 28px; color: #333;">
                        ${token}
                    </h3>
                    
                    <!-- Aviso de expiração -->
                    <p style="text-align: center;">Este código expira em 1 hora.</p>
                    
                    <!-- Divisor visual -->
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    
                    <!-- Rodapé -->
                    <p style="font-size: 0.8em; color: #777; text-align: center;">Equipe Meu Futuro Amigo</p>
                </div>
            `
        };

        // Espera o envio completar ou falhar.
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de recuperação enviado com sucesso para: ${email}`);

        // Sucesso! Sempre da certo, para evitar falhas de segurança.
        res.status(200).json({ 
            mensagem: 'Se este e-mail estiver cadastrado, um código de redefinição foi enviado.' 
        });

    } catch (error) {
        // Se der algum erro no envio.
        console.error('Erro na rota /esqueci-senha:', error);
        res.status(500).json({ mensagem: 'Erro interno do Servidor.' });
    }
});


// ----------------- Recuperação da Senha - Etapa 2: Verificação do Token -----------------> 
app.post('/verificar-token', async (req, res) => {
    // Recebe e extrai os dados enviados do Frontend.
    const { email, token } = req.body;

    console.log('<--- Verificação de Token de Recuperação --->');
    console.log('E-mail recebido:', email);
    console.log('Token recebido:', token);

    // Verifica se os dados fornecidos estão vazios.
    if (!email || !token) {
        console.log('Tentativa de verificação com dados incompletos');
        return res.status(400).json({ mensagem: 'E-mail e código são obrigatórios.' });
    }

    try {
        // Verificação no Banco de Dados:
        // Se o e-mail é igual ao que solicitou o código;
        // Se o código token digitado é o mesmo que está no banco;
        // Se o código foi criado a menos de 1 Hora. 
        const result = await db.query(
            "SELECT * FROM reset_tokens WHERE email = $1 AND token = $2 AND criado_em > now() - INTERVAL '1 hour'",
            [email, token]
        );

        console.log('Resultado da busca:', result.rows.length > 0 ? 'Token encontrado' : 'Token não encontrado');

        // Se rows.length > 0 = achou 1 token válido, mas se for === 0 o código está errado ou expirado ou e-mail está errado.
        if (result.rows.length > 0) {
            console.log(`Token verificado com sucesso para: ${email}`);
            
            // Sucesso! Token validado, agora o Front permite o Usuário digitar a nova senha.
            res.status(200).json({ 
                mensagem: 'Código Verificado com Sucesso!' 
            });
        } else {
            // Algo deu errado.
            console.log(`Falha na verificação - Email: ${email}, Token: ${token}`);
            
            res.status(400).json({ 
                mensagem: 'Código inválido ou expirado. Tente novamente.' 
            });
        }

    } catch (error) {
        // Falha no Sistema.
        console.error('Erro ao verificar token:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
});


// ----------------- Recuperação da Senha - Etapa 3: Troca da Senha -----------------> 
app.post('/redefinir-senha', async (req, res) => {
    // Recebe e extrai os dados enviados do Frontend.
    const { email, token, novaSenha } = req.body;

    console.log('<--- Redefinição de Senha --->');
    console.log('E-mail recebido:', email);
    console.log('Token recebido:', token);

    // Verifica se os dados fornecidos estão vazios.
    if (!email || !token || !novaSenha) {
        console.log('Tentativa de redefinição com dados Incompletos');
        return res.status(400).json({ 
            mensagem: 'E-mail, código e nova senha são obrigatórios.' 
        });
    }

    try {
        // Revalidação do Token, para checar se o código não expirou.
        const tokenResult = await db.query(
            "SELECT * FROM reset_tokens WHERE email = $1 AND token = $2 AND criado_em > now() - INTERVAL '1 hour'",
            [email, token]
        );

        console.log('Revalidação de token:', tokenResult.rows.length > 0 ? 'VÁLIDO' : 'INVÁLIDO/EXPIRADO');

        // Se o token expirou.
        if (tokenResult.rows.length === 0) {
            console.log(`Revalidação falhou para: ${email} - Token Expirado ou Inválido`);
            return res.status(400).json({ 
                mensagem: 'Código Inválido ou Expirado. Solicite um Novo.' 
            });
        }

        console.log('Iniciando criptografia da nova senha...');
        // Processo de Criptografia da Nova Senha.
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);
        console.log('Senha Criptografada com Sucesso');

        console.log(`Atualizando senha no banco para: ${email}`);
        // Substitui a Hash antiga pela Hash nova.
        await db.query(
            'UPDATE usuarios SET senha = $1 WHERE email = $2',
            [senhaHash, email]
        );
        console.log('Senha atualizada com sucesso no banco');

        // Apagar o Token Usado.
        await db.query('DELETE FROM reset_tokens WHERE email = $1', [email]);
        
        console.log(`Token Apagado com Sucesso. Usuário ${email} não consegue reutilizar o código!`);

        console.log(`Senha redefinida com sucesso para: ${email}`);
        
        // Sucesso! Deu tudo Certo.
        res.status(200).json({ 
            mensagem: 'Senha redefinida com sucesso!' 
        });

    } catch (error) {
        // Falhas no Sistema.
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ 
            mensagem: 'Erro interno do servidor.' 
        });
    }
});


// ----------------- Excluir Conta -----------------> 
app.delete('/deletar-conta', async (req, res) => {
    // Recebe e extrai o e-mail enviado pelo Frontend.
    const { email } = req.body;

    // Verifica se E-mail foi fornecido.
    if (!email) {
        return res.status(400).json({ mensagem: 'E-mail é obrigatório para exclusão.' });
    }

    try {
        // Procura o Usuário pelo E-mail.
        const userResult = await db.query('SELECT foto_perfil FROM usuarios WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        // Pega o valor da foto, pode ser o caminho do arquivo ou null se o usuário não tem foto de Perfil.
        const fotoPerfil = userResult.rows[0].foto_perfil;

        // Apaga todos os Tokens de recuperação de senha associados ao E-mail.
        await db.query('DELETE FROM reset_tokens WHERE email = $1', [email]);

        // Apaga as Informações do Usuário na Tabela "usuarios".
        await db.query('DELETE FROM usuarios WHERE email = $1', [email]);

        if (fotoPerfil) {
            // Remove a primeira barra se existir do caminho do arquivo.
            const caminhoArquivo = fotoPerfil.startsWith('/') ? fotoPerfil.substring(1) : fotoPerfil;

            // Usa o fs.unlink para apagar o arquivo.
            fs.unlink(caminhoArquivo, (erro) => {
                if (erro) {
                    // Se der erro, avisa no console, mas não para o processo de exclusão.
                    console.error('Erro ao Tentar Apagar Foto Física:', erro);
                } else {
                    console.log('Arquivo de Foto Deletado com Sucesso:', caminhoArquivo);
                }
            });
        }

        // Sucesso! Conta Excluida.
        res.status(200).json({ mensagem: 'Conta e Dados Excluídos com Sucesso. Sentiremos sua falta!' });

    } catch (error) {
        // Se algo der errado durante a exclusão registra o erro no console para o Debugging. 
        console.error('Erro ao deletar conta:', error);
        
        // Mensagem Genérica para o Usuário.
        res.status(500).json({ mensagem: 'Erro interno ao tentar excluir a conta.' });
    }
});


// -----------------------------------------------------------------------------------------------------------------------//


// --------------------- Buscar Animais: Informações Básicas --------------------->
app.get('/animais', async (req, res) => {
    // Extrai o parâmetro de "status" da URL (/animais?status=disponivel ou /animais?status=adotado).
    const { status } = req.query;

    try {
        // Seleciona todos os dados da tabela "animais".
        // Subconsulta que conta quantas solicitações cada animal recebeu e chama esse numero de "total_interessados". 
        let query = `
            SELECT a.*, 
            (SELECT COUNT(*) FROM solicitacoes_adocao s WHERE s.animal_id = a.id) as total_interessados
            FROM animais a
        `;
        
        // Array que armazenará os parâmetros seguros da query.
        let params = [];

        // Filtro de Status: Disponível ou Adotado.
        if (status) {
            // Se o parâmetro "status" foi fornecido, adiciona à query.
            query += ' WHERE status = $1';
            
            // Adiciona o valor do status ao array de parâmetros.
            params.push(status);
        }

        // Ordenação: Mostra do Mais Novo para o Mais Antigo.
        query += ' ORDER BY id DESC';

        // Execução da Query no Banco de Dados.
        const result = await db.query(query, params);
        console.log(`Busca de animais realizada. Total encontrado: ${result.rows.length}`);
        
        // Sucesso! Array com todos os Animais, cada elemento é um Objeto. Retorna a lista para o Frontend.
        res.status(200).json(result.rows);

    } catch (error) {
        // Se algo der errado durante a execução registra o erro no console para o Debugging. 
        console.error('Erro ao buscar animais:', error);

        // Mensagem Genérica para o Usuário.
        res.status(500).json({ mensagem: 'Erro interno ao buscar animais.' });
    }
});


// --------------------- Buscar Animais: Todas as Informações  --------------------->

// Rota usada para Retornar Todos os Detalhes de um Animal Específico.
app.get('/animais/:id', async (req, res) => {
    // Extrai o ID do Animal pela URL.
    const { id } = req.params;
    console.log(`<--- Busca de Detalhes do Animal ${id} --->`);

    try {
        // Busca todos os dados do Animal.
        const query = `
            SELECT a.*, 
            (SELECT COUNT(*)::int FROM solicitacoes_adocao WHERE animal_id = a.id) as total_interessados
            FROM animais a
            WHERE a.id = $1
        `;
        
        // Executa a query no banco de dados.
        const animalResult = await db.query(query, [id]);
        
        // Se não achar o Animal, retorna um aviso ao Usuário.
        if (animalResult.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Animal não encontrado' });
        }
        
        // Extrai o resultado da query (objeto com todos os campos do animal).
        const animal = animalResult.rows[0];

        // Pega todas as fotos adicionais do animal na tabela "fotos_animais".
        const fotosResult = await db.query('SELECT caminho_arquivo FROM fotos_animais WHERE animal_id = $1', [id]);

        // Array com a ordem das fotos.
        // Inicializa o array com a foto da capa.
        let listaFotos = [animal.foto];

        fotosResult.rows.forEach(f => {
            // Adiciona a foto somente se ela for diferente da foto de capa.
            if (f.caminho_arquivo !== animal.foto) {
                listaFotos.push(f.caminho_arquivo);
            }
        });

        // Adiciona o array de fotos ao objeto do animal.
        animal.fotos = listaFotos;

        // Sucesso! Deu Certo.
        res.json(animal);

    } catch (error) {
        console.error('Erro ao buscar detalhes do animal:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
});


// -----------------------------------------------------------------------------------------------------------------------//


// --------------------- Processo de Adoção --------------------->
app.post('/solicitacoes', async (req, res) => {
    // Recebe e extrai todos os dados do formulário enviado pelo Frontend.
    const dados = req.body;
    console.log(`<--- Nova Solicitação de Adoção --->`);  
    console.log(`Solicitante: ${dados.nome} | Animal ID: ${dados.animal_id}`);

    try {
        // Se veio um ID de usuário e um CPF no formulário.
        if (dados.usuario_id && dados.cpf) {
            console.log(`Verificando atualização de CPF para usuário ${dados.usuario_id}...`);
            
            // Atualiza o CPF do Usuário apenas se o campo estiver vazio.
            await db.query(
                "UPDATE usuarios SET cpf = $1 WHERE id = $2 AND (cpf IS NULL OR cpf = '')",
                [dados.cpf, dados.usuario_id]
            );
        }

        // Todos os campos do formulário.
        const query = `
            INSERT INTO solicitacoes_adocao (
                animal_id, nome_solicitante, cpf_solicitante, nascimento_solicitante,
                whatsapp_solicitante, email_solicitante, ocupacao, endereco_completo,
                cidade, cep, tipo_imovel, posse_imovel, permissao_proprietario,
                seguranca_detalhes, possui_telas, possui_piscina, local_dormida,
                qtd_moradores, criancas, tempo_sozinho, outros_animais,
                ciente_custos, declaracao_verdade
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
            ) RETURNING id;
        `;

        const values = [
            // Identificações básicas:
            dados.animal_id,                                    
            dados.nome,                                        
            dados.cpf,                                         
            dados.nascimento,                                   
            
            // Contato:
            dados.whatsapp,                                     
            dados.email,                                        
            dados.ocupacao,                                     
            dados.endereco,                                     
            
            // Localização:
            dados.cidade,                                       
            dados.cep,                                          
            
            // Tipo de imóvel:
            dados['tipo-imovel'],                              
            dados['posse-imovel'],                             
            dados['permissao-proprietario'] || 'Não se aplica', 
            
            // Segurança da casa:
            dados['seguranca-casa'],                           
            dados.telas || 'não',                              
            dados.piscina,                                      
            dados.dormida,                                      
            
            // Ambiente familiar:
            dados.moradores,                                    
            dados.criancas || 'Não possui',                    
            dados['tempo-sozinho'],                            
            dados['outros-animais'],                           
            
            // Comprometimento:
            dados['check-custos'] === 'on',                    
            dados['check-verdade'] === 'on'                    
        ];

        // Inserção no Banco de Dados.
        await db.query(query, values);
        console.log('Solicitação salva na base de dados');

        // Atualiza manualmente a coluna estática 'interessados' na tabela animais.
        await db.query('UPDATE animais SET interessados = interessados + 1 WHERE id = $1', [dados.animal_id]);

        // Sucesso! Candidatura enviada.
        console.log('Solicitação de adoção processada e confirmada!');
        res.status(201).json({ message: 'Solicitação enviada com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar solicitação:', error);
        res.status(500).json({ error: 'Erro ao processar sua solicitação.' });
    }
});


// --------------------- Histórico de Solicitações de Adoção --------------------->
app.get('/minhas-solicitacoes', async (req, res) => {

    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ mensagem: 'E-mail é obrigatório.' });
    }

    console.log(`<--- Buscando histórico de adoções para: ${email} --->`);

    try {
        // Seleciona ID, Status, Data e junta com Nome e Foto do Animal.
        const query = `
            SELECT 
                s.id, 
                s.animal_id,
                s.status, 
                s.data_solicitacao,
                a.nome as nome_animal,
                a.foto as foto_animal
            FROM solicitacoes_adocao s
            JOIN animais a ON s.animal_id = a.id
            WHERE s.email_solicitante = $1
            ORDER BY s.id DESC
        `;

        const result = await db.query(query, [email]);
        
        console.log(`Encontradas ${result.rows.length} solicitações.`);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Erro ao buscar minhas solicitações:', error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar histórico.' });
    }
});


// --------------------- Divulgar um Animal --------------------->
// --------------------- Divulgar um Animal (Cloudinary) --------------------->
app.post('/solicitacoes/novo-animal', 
    upload.fields([
        { name: 'foto_capa', maxCount: 1 }, 
        { name: 'fotos_galeria', maxCount: 4 }
    ]), 
    async (req, res) => {
    
    try {
        const { nome, especie, raca, idade, porte, sexo, local, historia, usuario_id } = req.body;
        
        if (!req.files || !req.files['foto_capa']) {
            return res.status(400).json({ erro: 'A foto de capa é obrigatória!' });
        }

        // MÁGICA: O Cloudinary já subiu a foto e nos deu o Link Seguro (URL)!
        const urlCapaBD = req.files['foto_capa'][0].path; 

        const vacinado = req.body.vacinado === 'on';
        const castrado = req.body.castrado === 'on';
        const vermifugado = req.body.vermifugado === 'on';

        // INSERÇÃO NO BANCO DE DADOS (Tabela Animais)
        const queryAnimal = `
            INSERT INTO animais 
            (nome, especie, raca, sexo, idade, porte, local, origem, foto, vacinado, castrado, vermifugado, status, historia, usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id;
        `;

        const valuesAnimal = [
            nome, especie, raca, sexo, idade, porte, local, 
            'Protetor', 
            urlCapaBD,  // Salvando o LINK DA NUVEM no banco!
            vacinado, castrado, vermifugado, 
            'disponivel', 
            historia,
            usuario_id
        ];

        const result = await db.query(queryAnimal, valuesAnimal);
        const novoAnimalId = result.rows[0].id;

        // INSERÇÃO DAS FOTOS DA GALERIA
        const queryFoto = `INSERT INTO fotos_animais (animal_id, caminho_arquivo, tipo) VALUES ($1, $2, $3)`;
        
        // Salva a capa também na galeria
        await db.query(queryFoto, [novoAnimalId, urlCapaBD, 'foto']);

        if (req.files['fotos_galeria']) {
            for (const file of req.files['fotos_galeria']) {
                const urlGaleriaBD = file.path; // Pega o link da nuvem de cada foto extra
                await db.query(queryFoto, [novoAnimalId, urlGaleriaBD, 'foto']);
            }
        }

        console.log(`Animal cadastrado com sucesso direto na nuvem: ${nome}`);
        res.status(201).json({ mensagem: 'Animal cadastrado com sucesso!', id: novoAnimalId });

    } catch (erro) {
        console.error('Erro ao cadastrar animal:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor ao salvar os dados.' });
    }
});


// --------------------- Busca todas as Raças no Banco --------------------->
/*
Rota utilizada para preencher todas as raças já cadastradas no banco, tornando o uso mais dinâmico. 
Assim, quando o usuário for divulgar um animal, não precisará digitar o nome da raça, a menos que 
não exista nenhum exemplar registrado no banco de dados.
*/
app.get('/api/racas', async (req, res) => {
    // Pega a espécie que o Front-end enviou na URL (ex: ?especie=Cachorro).
    const { especie } = req.query;

    if (!especie) {
        return res.status(400).json({ erro: 'Espécie não informada.' });
    }

    try {
        // Pega só raças únicas daquela espécie, em ordem alfabética.
        const query = `
            SELECT DISTINCT raca 
            FROM animais 
            WHERE especie = $1 
            AND raca IS NOT NULL 
            AND raca != ''
            ORDER BY raca;
        `;
        
        const result = await db.query(query, [especie]);
        
        // O resultado vem como um array de objetos: [{raca: 'Poodle'}, {raca: 'Siamês'}].
        // Vamos transformar num array simples de textos: ['Poodle', 'Siamês'].
        const racas = result.rows.map(linha => linha.raca);

        res.json(racas); // Devolve para o Front-end.
    } catch (erro) {
        console.error('Erro ao buscar raças exclusivas:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});


// -----------------------------------------------------------------------------------------------------------------------//


// Liga o Servidor.
app.listen(PORT, () => {
    console.log('---------------------------------------------------------');
    console.log(`--- SERVIDOR ONLINE <======> RODANDO NA PORTA ${PORT}---`)
    console.log('---------------------------------------------------------');
    console.log('Rotas Ativas:');
    console.log(' > Autenticação e Entrada: [POST] /login -|- [POST] /cadastro');
    console.log(' > Gerenciamento de Perfil: [POST] /completar-perfil -|- [DELETE] /deletar-conta');
    console.log(' > Recuperação de Senha: [POST] /esqueci-senha -|- [POST] /verificar-token -|- [POST] /redefinir-senha');
    console.log(' > Animais: [GET] /animais -|- [GET] /animais/:id -|- [GET] /api/racas');
    console.log(' > Divulgação: [POST] /solicitacoes/novo-animal');
    console.log(' > Adoção: [POST] /solicitacoes -|- [GET] /minhas-solicitacoes');
    console.log(' > Utilitários: [GET] /teste-email');
    console.log('---------------------------------------------------------');
});