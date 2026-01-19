// Aguarda o carregamento do DOM antes de executar o script.
document.addEventListener('DOMContentLoaded', async () => {
    // ------------------------- IDENTIFICAÇÃO DO ANIMAL ------------------------- 
    // Extrai os parâmetros da URL.
    const params = new URLSearchParams(window.location.search);
    const idAnimal = params.get('id');

    // Se não tiver ID, volta pra home (segurança básica)
    if (!idAnimal) {
        alert("Nenhum animal selecionado! Voltando...");
        window.location.href = "adotar.html";
        return;
    }

    let animal;

    try {
        // --- CONEXÃO COM O SERVIDOR (Novo!) ---
        const response = await fetch(`/animais/${idAnimal}`);
        
        if (!response.ok) {
            throw new Error('Animal não encontrado');
        }

        const dadosBanco = await response.json();

        // --- ADAPTADOR DE DADOS (Banco -> Seu Layout) ---
        // Aqui transformamos os dados do banco para ficarem iguais ao que seu código espera
        animal = {
            ...dadosBanco,
            // CORREÇÃO: Agora pegamos direto da coluna 'historia' do banco.
            // Se estiver vazio, o código lá embaixo já coloca o texto padrão.
            historia: dadosBanco.historia, 
            
            // O banco traz dados soltos, mas seu layout espera um objeto 'saude'
            saude: {
                vacinado: dadosBanco.vacinado,
                castrado: dadosBanco.castrado,
                vermifugado: dadosBanco.vermifugado
            },

            // Corrige as URLs das fotos para incluir o servidor
            foto: dadosBanco.foto.startsWith('http') ? dadosBanco.foto : `/${dadosBanco.foto}`,
            fotos: dadosBanco.fotos.map(f => f.startsWith('http') ? f : `/${f}`)
        };

    } catch (error) {
        console.error("Erro:", error);
        alert("Animal não encontrado no banco de dados! Voltando...");
        window.location.href = "adotar.html";
        return;
    }


    // ------------------------- PREENCHIMENTO DAS INFORMAÇÕES ------------------------- 
    // Muda o título da aba do navegador para mostrar o nome do animal.
    document.title = `${animal.nome} | Adotar`;
    
    // Preenche o elemento com ID 'detalhes-nome' com o nome do animal.
    document.getElementById('detalhes-nome').innerText = animal.nome;
    
    // Exibe a história do animal ou um texto padrão se não tiver uma história.
    const textoHistoria = animal.historia || "A história deste amiguinho ainda não foi contada, mas garantimos que ele tem muito amor para dar!";
    document.getElementById('detalhes-historia').innerText = textoHistoria;


    // ------------------------- GERAÇÃO DAS TAGS ------------------------- 
    // Encontra o container onde as tags serão inseridas
    const containerTags = document.getElementById('container-tags');
    
    // Define um array com os dados que queremos mostrar como tags.
    const dadosTags = [
        { rotulo: 'Espécie', valor: animal.especie },
        { rotulo: 'Raça', valor: animal.raca },
        { rotulo: 'Sexo', valor: animal.sexo },
        { rotulo: 'Idade', valor: animal.idade },
        { rotulo: 'Porte', valor: animal.porte },
        { rotulo: 'Local', valor: animal.local },
        { rotulo: 'Origem', valor: animal.origem }
    ];

    // Percorre cada dado e cria uma tag HTML para cada um, só cria uma tag se o valor existir e não for vazio.
    let htmlTags = '';
    dadosTags.forEach(dado => {
        if (dado.valor) {
            htmlTags += `<span class="Tag-Info">${dado.rotulo}: ${dado.valor}</span>`;
        }
    });
    containerTags.innerHTML = htmlTags;


    // ------------------------- GALERIA ------------------------- 
    // Encontra o elemento que exibirá as mídias e o contador.
    const midiaContainer = document.getElementById('midia-container');
    const contador = document.getElementById('contador-midia');
    
    // Cria a playlist combinando fotos com vídeo (se existir).
    // Converte 'animal.fotos' para array se for string, ou usa o array se já for.
    let playlist = Array.isArray(animal.fotos) ? [...animal.fotos] : [animal.foto];
    
    // Se o animal tiver vídeo, insere na posição 1.
    if (animal.video) {
        playlist.splice(1, 0, animal.video); 
    }

    let indiceAtual = 0;

    // Função responsável por renderizar a galeria.
    function atualizarMidia() {
        const itemAtual = playlist[indiceAtual];
        // Verifica se é vídeo procurando por extensão .mp4 ou link do youtube.
        const ehVideo = itemAtual.includes('.mp4') || itemAtual.includes('youtube'); 

        midiaContainer.innerHTML = '';

        if (ehVideo) {
            // Cria um elemento <video> para reprodução.
            const videoElement = document.createElement('video');
            videoElement.src = itemAtual;
            videoElement.controls = true; 
            videoElement.className = "fade-in"; 
            midiaContainer.appendChild(videoElement);
        } else {
            // Cria um elemento <img> para exibição de imagens.
            const imgElement = document.createElement('img');
            imgElement.src = itemAtual;
            imgElement.alt = `Foto de ${animal.nome}`;
            imgElement.className = "fade-in";
            
            // Ao clicar na imagem, abre a galeria completa com Fancybox.
            imgElement.onclick = () => {
                // Define o tipo de cada item (image ou video)
                if(typeof Fancybox !== 'undefined') {
                    Fancybox.show(playlist.map(src => ({ 
                        src: src, 
                        type: src.includes('.mp4') ? "video" : "image" 
                    })));
                }
            };
            
            midiaContainer.appendChild(imgElement);
        }

        // Atualiza o texto do contador para mostrar posição atual.
        contador.innerText = `${indiceAtual + 1} / ${playlist.length}`;
    }

    atualizarMidia();

    // Função global que os botões de seta podem chamar.
    window.mudarMidia = function(direcao) {
        // Incrementa ou decrementa o índice baseado na direção.
        indiceAtual += direcao;
        // Implementa navegação em loop.
        if (indiceAtual >= playlist.length) indiceAtual = 0;
        if (indiceAtual < 0) indiceAtual = playlist.length - 1;

        atualizarMidia();
    };


    // ------------------------- LÓGICA DO BOTÃO E STATUS DA FILA ------------------------- 
    const btnAcao = document.getElementById('botaoAdotar');
    const divStatus = document.getElementById('status-fila');
    const LIMITE_CANDIDATURAS = 10;
    
    // Garante que interessados seja um número (caso venha null do banco)
    const numInteressados = animal.total_interessados || 0;

    // Verifica se já lotou
    if (numInteressados >= LIMITE_CANDIDATURAS) {
        
        // Bloqueia o Botão.
        btnAcao.classList.add('bloqueado');
        btnAcao.innerText = "Em Análise";
        btnAcao.href = "javascript:void(0)"; 
        
        // Ao clicar, explica o motivo.
        btnAcao.onclick = (e) => {
            e.preventDefault();
            alert(`Poxa! O ${animal.nome} já recebeu o limite de ${LIMITE_CANDIDATURAS} candidaturas. Estamos analisando os perfis agora. Tente voltar amanhã!`);
        };

        // Aviso no Status.
        divStatus.innerHTML = `<span>Inscrições Pausadas!</span> Atingimos o limite de candidaturas.`;
        divStatus.style.display = 'inline-flex';

    } else {
        // Ainda tem vaga para aplicar.
        btnAcao.classList.remove('bloqueado');
        btnAcao.innerText = "Quero Adotar";
        btnAcao.onclick = (e) => {
            e.preventDefault();
            // Agora sim: Redireciona para a página de formulário levando o ID!
            window.location.href = `processo-adocao.html?id=${animal.id}`;
        };

        // Status Incentivador | Calculamos quantas vagas restam.
        const vagasRestantes = LIMITE_CANDIDATURAS - numInteressados;
        
        if (numInteressados > 0) {
            divStatus.innerHTML = `<span>${numInteressados} pessoas</span> interessadas. Restam apenas <b>${vagasRestantes} vagas</b> para entrevista!`;
        } else {
            divStatus.innerHTML = `Seja o primeiro a se candidatar!`;
        }
        divStatus.style.display = 'inline-flex';
    }


    // ------------------------- ÁREA DE SAÚDE ------------------------- 
    const containerSaude = document.getElementById('container-saude');
    
    // Usa um texto personalizado de saúde ou um padrão se não existir.
    const textoSaude = animal.saudeTexto || `A saúde do(a) ${animal.nome} está em dia! Cuidamos de tudo com muito carinho.`;

    // Função auxiliar que cria um item da timeline baseado no objeto 'animal.saude'
    function gerarItemTimeline(rotulo, chaveObjeto) {
        // Agora acessamos o objeto 'saude' que criamos lá em cima no adaptador
        const estaOk = animal.saude && animal.saude[chaveObjeto] === true;
        
        const classeStatus = estaOk ? 'ok' : 'pendente';
        // Mostra um checkmark (✓) se estiver ok, nada se pendente
        const icone = estaOk ? '✓' : ''; 

        // Retorna o HTML do item.
        return `
            <div class="Item-Timeline ${classeStatus}">
                <div class="Bolinha-Status">${icone}</div>
                <span class="Label-Status">${rotulo}</span>
            </div>
        `;
    }

    // Constrói o HTML completo da seção de saúde com cabeçalho e timeline
    containerSaude.innerHTML = `
        <div class="Box-Saude">
            <div class="Saude-Cabecalho">
                <h3 class="Saude-Titulo">Minha Saúde</h3>
                <p class="Saude-Texto">${textoSaude}</p>
            </div>
            
            <div class="Saude-Timeline">
                ${gerarItemTimeline('Vacinado', 'vacinado')}
                ${gerarItemTimeline('Castrado', 'castrado')}
                ${gerarItemTimeline('Vermifugado', 'vermifugado')}
            </div>
        </div>
    `;

});