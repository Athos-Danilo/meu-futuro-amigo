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

// > Configuração do Serviço de Upload de Imagens [Destino e Nome] (Foto do Perfil do Usuário). 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/foto_perfil/');
    },
    // Salva o nome do arquivo com o milissegundo atual + o nome do arquivo original.
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
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


// ----------------- Rota de Login -----------------> 
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
                    estado: user.estado                   
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
        // O "SALT" é um texto aleatório que será misturado à senha.
        // O número "10" significa que o algoritmo vai embaralhar a senha 1024 vezes (2^10).
        // O O salt gerado sempre tem 22 caracteres (padrão do bcrypt).
        const salt = await bcrypt.genSalt(10);
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
        // Envia um e-mail de Teste para a Própria Conta do Sistema.
        await transporter.sendMail({
            from: '"Meu Futuro Amigo" <' + process.env.EMAIL_USER + '>', 
            to: process.env.EMAIL_USER, 
            subject: 'Teste do Sistema de E-mail',
            text: 'Se você recebeu isso, o Nodemailer está funcionando!'
        });

        // Feedback exibido no Navegador.
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
// ==================================================================
// 9. RECUPERAÇÃO DE SENHA - ETAPA 3: TROCA DA SENHA (FINAL)
// ==================================================================
// FLUXO DA ROTA:
//   1. Recebe e-mail + código + nova senha do formulário
//   2. Valida se TODOS os 3 dados foram fornecidos
//   3. REVALIDAÇÃO DE SEGURANÇA: verifica se o código ainda é válido
//   4. Gera nova hash bcrypt para a senha
//   5. Atualiza a senha no banco de dados
//   6. APAGA o código usado (impede reutilização)
//   7. Retorna sucesso ao frontend
//
// IMPORTANTE: Esta é a ÚLTIMA etapa. Após isso, o usuário consegue fazer login com a nova senha!

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

// Rota para Excluir Conta
app.delete('/deletar-conta', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ mensagem: 'E-mail é obrigatório para exclusão.' });
    }

    try {
        // 1. Opcional: Apagar tokens de reset de senha associados (limpeza)
        await db.query('DELETE FROM reset_tokens WHERE email = $1', [email]);

        // 2. Apagar o usuário
        const result = await db.query('DELETE FROM usuarios WHERE email = $1 RETURNING *', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        // 3. Sucesso
        res.status(200).json({ mensagem: 'Conta excluída com sucesso. Sentiremos sua falta!' });

    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(500).json({ mensagem: 'Erro interno ao tentar excluir a conta.' });
    }
});


// --------------------- Buscar Animais --------------------->
// Rota para buscar Animais (Aceita filtros: ?status=adotado ou ?status=disponivel)
app.get('/animais', async (req, res) => {
    const { status } = req.query; // Lê o que vem depois do '?' na URL

    try {
        let query = 'SELECT * FROM animais';
        let params = [];

        // Se o Front-end pediu um status específico (ex: adotado), filtramos
        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        // Ordena pela DATA DE ADOÇÃO (do mais recente para o mais antigo)
        query += ' ORDER BY data_adocao DESC';

        const result = await db.query(query, params);
        
        // Devolve a lista (array) de animais
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Erro ao buscar animais:', error);
        res.status(500).json({ mensagem: 'Erro interno ao buscar animais.' });
    }
});

// --------------------- Detalhes Animais --------------------->
// Rota para pegar detalhes de UM animal (incluindo galeria + total de interessados)
app.get('/animais/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Busca os dados principais do animal + A CONTAGEM de interessados
        const query = `
            SELECT a.*, 
            (SELECT COUNT(*)::int FROM solicitacoes_adocao WHERE animal_id = a.id) as total_interessados
            FROM animais a
            WHERE a.id = $1
        `;
        
        const animalResult = await db.query(query, [id]);
        
        if (animalResult.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Animal não encontrado' });
        }
        
        const animal = animalResult.rows[0];

        // 2. Busca as fotos extras na tabela de galeria
        const fotosResult = await db.query('SELECT caminho_arquivo FROM fotos_animais WHERE animal_id = $1', [id]);
        
        // 3. Monta a lista final de fotos: [Foto de Capa, ...Fotos da Galeria]
        let listaFotos = [animal.foto];
        
        fotosResult.rows.forEach(f => {
            if (f.caminho_arquivo !== animal.foto) {
                listaFotos.push(f.caminho_arquivo);
            }
        });

        // Anexa a lista de fotos ao objeto do animal
        animal.fotos = listaFotos;

        res.json(animal);

    } catch (error) {
        console.error('Erro ao buscar detalhes do animal:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
});

// Rota para salvar a solicitação de adoção (AGORA COM ATUALIZAÇÃO DO CONTADOR)
app.post('/solicitacoes', async (req, res) => {
    const dados = req.body;

    try {
        // 1. Salva o pedido na tabela de solicitações
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
            dados.animal_id,
            dados.nome,
            dados.cpf,
            dados.nascimento,
            dados.whatsapp,
            dados.email,
            dados.ocupacao,
            dados.endereco,
            dados.cidade,
            dados.cep,
            dados['tipo-imovel'],
            dados['posse-imovel'],
            dados['permissao-proprietario'] || 'Não se aplica',
            dados['seguranca-casa'],
            dados.telas || 'não',
            dados.piscina,
            dados.dormida,
            dados.moradores,
            dados.criancas || 'Não possui',
            dados['tempo-sozinho'],
            dados['outros-animais'],
            dados['check-custos'] === 'on',
            dados['check-verdade'] === 'on'
        ];

        await db.query(query, values);
        
        // Vai na tabela animais e soma +1 na coluna interessados
        await db.query('UPDATE animais SET interessados = interessados + 1 WHERE id = $1', [dados.animal_id]);

        res.status(201).json({ message: 'Solicitação enviada com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar solicitação:', error);
        res.status(500).json({ error: 'Erro ao processar sua solicitação.' });
    }
});

// Rota ADMIN: Busca todas as solicitações de adoção
app.get('/admin/solicitacoes', async (req, res) => {
    try {
        // O comando SQL abaixo busca os dados do pedido E o nome/foto do animal
        const query = `
            SELECT 
                s.id, 
                s.nome_solicitante, 
                s.status, 
                s.data_solicitacao,
                a.nome as nome_animal,
                a.foto as foto_animal
            FROM solicitacoes_adocao s
            JOIN animais a ON s.animal_id = a.id
            ORDER BY s.id DESC
        `;
        
        const resultado = await db.query(query);
        res.json(resultado.rows);

    } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Rota para buscar UMA solicitação específica com todos os detalhes
app.get('/admin/solicitacoes/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const query = `
            SELECT 
                s.*, 
                a.nome as nome_animal,
                a.foto as foto_animal
            FROM solicitacoes_adocao s
            JOIN animais a ON s.animal_id = a.id
            WHERE s.id = $1
        `;
        const resultado = await db.query(query, [id]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitação não encontrada' });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar detalhes' });
    }
});

// Liga o Servidor.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}.`);
    console.log('Agora está pronto para receber POSTs em /login, /cadastro, /completar-perfil e /esqueci-senha');
});