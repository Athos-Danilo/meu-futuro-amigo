document.addEventListener('DOMContentLoaded', async () => {
    // Pega o ID do Animal na URL.
    const params = new URLSearchParams(window.location.search);
    const idAnimal = params.get('id');

    if (!idAnimal) {
        // Se não tiver ID, redireciona o usuário para a página de "adotar".
        window.location.href = 'adotar.html'; 
        return;
    }

    // Busca os dados do animal.
    try {
        const response = await fetch(`/animais/${idAnimal}`);
        if (!response.ok) throw new Error('Erro ao buscar animal');
        
        const animal = await response.json();

        // Ajusta o caminho da foto.
        const fotoUrl = animal.foto.startsWith('http') ? animal.foto : `/${animal.foto}`;

        // Preenche o HTML.
        document.getElementById('foto-animal').src = fotoUrl;
        document.getElementById('nome-animal').innerText = animal.nome;

    } catch (error) {
        console.error("Erro ao carregar detalhes do animal:", error);
        alert('Ocorreu um erro ao carregar os detalhes do animal. Você será redirecionado para a página de adoção.');
        window.location.href = 'adotar.html';
    }

    // Contador Fake.
    // Cria uma chave única no navegador.
    const chaveUnica = `prazo_adocao_fake_${idAnimal}`;

    let dataFinal;
    const salvo = localStorage.getItem(chaveUnica); 

    if (salvo) {
        // Se já existe um prazo salvo para ESSE animal usa ele.
        dataFinal = new Date(salvo);
    } else {
        // Se for a primeira vez, cria um prazo de 72 horas.
        const agora = new Date();
        agora.setHours(agora.getHours() + 72);
        dataFinal = agora;
        localStorage.setItem(chaveUnica, dataFinal); 
    }

    // Elemento onde vai aparecer o tempo.
    const elementoData = document.getElementById('data-limite');

    // Função que atualiza o tempo a cada segundo.
    function atualizarContador() {
        const agora = new Date();
        const diferenca = dataFinal - agora;

        // Se o tempo acabou.
        if (diferenca <= 0) {
            if(elementoData) {
                 elementoData.innerHTML = "Prazo Encerrado!";
                 elementoData.style.color = "red";
            }
            return;
        }

        // Cálculos do tempo.
        const horas = Math.floor((diferenca / (1000 * 60 * 60))); 
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        const h = horas.toString().padStart(2, '0');
        const m = minutos.toString().padStart(2, '0');
        const s = segundos.toString().padStart(2, '0');

        // Atualiza o HTML.
        if(elementoData) {
             elementoData.innerHTML = `${h}h ${m}m ${s}s`;
        }
    }

    atualizarContador();
    setInterval(atualizarContador, 1000);

    // Inicia o estado dos botões.
    gerenciarBotoes();
});

// Lógica dis Passos Interativos.
let passoAtual = 1;

const informacoesPassos = {
    1: {
        titulo: "1. Solicitação Recebida com Sucesso (Enviado)",
        texto: "Você fez a sua parte! Escolheu com carinho um novo amigo e nos enviou suas informações. Sua ficha já está segura em nosso sistema e entrou oficialmente na fila de candidatos deste pet. Agora, nossa equipe fará uma conferência inicial apenas para garantir que seus dados de contato estão corretos e que o formulário foi preenchido integralmente."
    },
    2: {
        titulo: "2. Análise de Perfil e Ambiente",
        texto: "Esta é uma etapa técnica e criteriosa. Nossos protetores vão cruzar as necessidades do animal (nível de energia, porte, temperamento) com a estrutura que você ofereceu. Vamos verificar a segurança da casa (telas, muros, rotas de fuga) e sua rotina diária. O objetivo não é julgar, mas garantir que o animal viverá seguro e feliz, evitando devoluções futuras."
    },
    3: {
        titulo: "3. Entrevista por Vídeo",
        texto: "Queremos conhecer você 'olho no olho'! Se você passou para esta fase, entraremos em contato para agendar uma videochamada rápida. Não é um interrogatório, mas sim um bate-papo para alinharmos expectativas. É o momento perfeito para você tirar dúvidas sobre o comportamento do pet, e nós pediremos um tour virtual rápido pelo local onde ele vai dormir e brincar."
    },
    4: {
        titulo: "4. Adoção Aprovada!",
        texto: "Parabéns! Se você chegou aqui, significa que conquistou um novo melhor amigo! Nesta etapa final, assinamos o Termo de Adoção Responsável e combinamos a logística de entrega do animal. A partir de agora, começa o período de adaptação e nós estaremos por perto (virtualmente) nos primeiros meses para dar todo o suporte necessário."
    }
};

function mudarPasso(numero) {
    passoAtual = numero;
    atualizarTela();
}

function proximoPasso() {
    if (passoAtual < 4) {
        passoAtual++;
        atualizarTela();
    }
}

function passoAnterior() {
    if (passoAtual > 1) {
        passoAtual--;
        atualizarTela();
    }
}

// Atualiza tudo na tela.
function atualizarTela() {
    const info = informacoesPassos[passoAtual];
    const titulo = document.getElementById('titulo-passo');
    const texto = document.getElementById('texto-passo');
    
    // Efeito simples de fade.
    titulo.style.opacity = 0;
    texto.style.opacity = 0;
    
    setTimeout(() => {
        titulo.innerText = info.titulo;
        texto.innerText = info.texto;
        titulo.style.opacity = 1;
        texto.style.opacity = 1;
    }, 200);

    // Atualiza as bolinhas da Timeline.
    document.querySelectorAll('.step').forEach((el, index) => {
        // Limpa o estado de "selecionado" de todos.
        el.classList.remove('ativo');
        
        // Verifica qual é o passo que o usuário clicou para ler.
        if (index + 1 === passoAtual) {
            el.classList.add('ativo');
        }

        //  Passo 1 é o status REAL, então ele ganha 'concluido' para sempre.
        if (index === 0) { // Index 0 = Passo 1
            el.classList.add('concluido');
        }
    });

    gerenciarBotoes();
}

function gerenciarBotoes() {
    const btnVoltar = document.getElementById('btn-voltar');
    const btnProximo = document.getElementById('btn-proximo');

    // Some se for o passo 1.
    if (passoAtual === 1) {
        esconderBotao(btnVoltar);
    } else {
        mostrarBotao(btnVoltar);
    }

    // Some se for o passo 4.
    if (passoAtual === 4) {
        esconderBotao(btnProximo);
    } else {
        mostrarBotao(btnProximo);
    }
}

function esconderBotao(btn) {
    if(!btn) return;
    btn.style.opacity = "0";
    btn.style.cursor = "default";
    btn.style.visibility = "hidden"; 
}

function mostrarBotao(btn) {
    if(!btn) return;
    btn.style.visibility = "visible";
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
}