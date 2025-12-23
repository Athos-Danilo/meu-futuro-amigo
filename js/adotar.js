/* =======================================================
   LÓGICA DA PÁGINA QUERO ADOTAR (COM PAGINAÇÃO RESPONSIVA)
   Arquivo: js/adotar.js
   ======================================================= */

/* --- VARIÁVEIS GLOBAIS DE PAGINAÇÃO --- */
let paginaAtual = 1;
let itensPorPagina = 10; // Começa com 10 (mobile), mas a função abaixo vai corrigir
let listaAtualDeAnimais = []; // Guarda a lista atual (seja ela completa ou filtrada)


/* --- 1. FUNÇÕES DE INTERFACE (Botões, Modais e Redimensionamento) --- */

// Função que define quantos cards mostrar baseada na largura da tela
function calcularItensPorPagina() {
    const largura = window.innerWidth;
    
    if (largura < 900) {
        itensPorPagina = 10; // Celular
    } else if (largura >= 900 && largura < 1400) {
        itensPorPagina = 18; // Tablet (3 colunas x 6 linhas)
    } else {
        itensPorPagina = 24; // Desktop (4 colunas x 6 linhas)
    }
}

// Escuta quando a pessoa redimensiona a janela para ajustar na hora
window.addEventListener('resize', () => {
    calcularItensPorPagina();
    // Se a página atual ficar vazia após redimensionar (ex: estava na pág 5 e agora só tem 3), volta
    const totalPaginas = Math.ceil(listaAtualDeAnimais.length / itensPorPagina);
    if (paginaAtual > totalPaginas && totalPaginas > 0) {
        paginaAtual = 1;
    }
    renderizarPagina();
});

// Função para abrir/fechar o menu de filtros no mobile
function toggleFiltros() {
    const container = document.getElementById('filtros-container');
    container.classList.toggle('aberto');
    document.body.style.overflow = container.classList.contains('aberto') ? 'hidden' : 'auto';
}

// Função genérica para preencher os <select> com os dados dos arrays
function preencherSelect(selectId, lista) {
    const select = document.getElementById(selectId);
    if (!select) return; 
    
    lista.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

/* --- LÓGICA DO MODAL COM COMPARTILHAMENTO --- */
const modalAnimal = document.getElementById('modal-animal');

function abrirModal(nomeAnimal) {
    const animal = animais.find(a => a.nome === nomeAnimal);
    if (!animal) return;

    // --- Preenche os dados visuais (HTML) ---
    document.getElementById('modal-img').src = animal.foto;
    document.getElementById('modal-nome').innerText = animal.nome;
    document.getElementById('modal-resumo').innerText = animal.especie; // Só Espécie
    
    // Ajuste de Raça
    const labelEspecie = document.querySelector('#modal-especie').parentElement.querySelector('strong');
    if(labelEspecie) labelEspecie.innerText = "Raça:";
    document.getElementById('modal-especie').innerText = animal.raca;

    document.getElementById('modal-sexo').innerText = animal.sexo;
    document.getElementById('modal-porte').innerText = animal.porte;
    document.getElementById('modal-idade').innerText = animal.idade;
    document.getElementById('modal-local').innerText = animal.local;
    document.getElementById('modal-origem').innerText = animal.origem || "Não informado";
    document.getElementById('modal-historia').innerText = animal.historia || `A história de ${animal.nome} está sendo escrita...`;

    // --- Configura o Botão do WhatsApp (Adotar) ---
    const btnAdotar = document.querySelector('.Botao-Adotar-Modal');
    if (btnAdotar) {
        const msgZap = `Olá! Vi o ${animal.nome} no site e fiquei interessado na adoção.`;
        btnAdotar.href = `https://wa.me/5587999999999?text=${encodeURIComponent(msgZap)}`;
    }

    // --- CONFIGURA O NOVO BOTÃO DE COMPARTILHAR ---
    const btnCompartilhar = document.getElementById('btn-compartilhar');
    if (btnCompartilhar) {
        // Removemos qualquer evento de clique anterior para não duplicar
        btnCompartilhar.onclick = null; 
        
        btnCompartilhar.onclick = async () => {
            // Dados para compartilhar
            const shareData = {
                title: `Adote o ${animal.nome}! 🐾`,
                text: `Gente, olha que amor! 💖 Encontrei o ${animal.nome} (${animal.especie} - ${animal.raca}) no site "Meu Futuro Amigo". Ele está em ${animal.local}. Vamos ajudar ele a achar um lar?`,
                url: window.location.href // Manda o link da página atual
            };

            // Verifica se o navegador suporta o compartilhamento nativo (Celular)
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log('Compartilhamento cancelado ou erro:', err);
                }
            } else {
                // FALLBACK: Se for PC e não tiver suporte, copia para a área de transferência
                const textoCompleto = `${shareData.text} \nVeja mais em: ${shareData.url}`;
                
                navigator.clipboard.writeText(textoCompleto).then(() => {
                    alert('Link e texto copiados! 📋\nAgora é só colar no seu WhatsApp, Instagram ou onde quiser!');
                }).catch(() => {
                    alert('Não foi possível compartilhar automaticamente.');
                });
            }
        };
    }

    // Abre o Modal e trava o fundo
    modalAnimal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


/* --- 2. BANCO DE DADOS (Arrays de Informação Completos) --- */

const cidadesPE = [
  "Abreu e Lima", "Afogados da Ingazeira", "Afrânio", "Agrestina", "Água Preta",
  "Águas Belas", "Alagoinha", "Aliança", "Altinho", "Amaraji", "Angelim", 
  "Araçoiaba", "Araripina", "Arcoverde", "Barra de Guabiraba", "Barreiros", 
  "Belém de Maria", "Belém do São Francisco", "Belo Jardim", "Betânia", "Bezerros", 
  "Bodocó", "Bom Conselho", "Bom Jardim", "Bonito", "Brejão", "Brejinho", 
  "Brejo da Madre de Deus", "Buenos Aires", "Buíque", "Cabo de Santo Agostinho", 
  "Cabrobó", "Cachoeirinha", "Caetés", "Calçado", "Calumbi", "Camaragibe", 
  "Camocim de São Félix", "Camutanga", "Canhotinho", "Capoeiras", "Carnaíba", 
  "Carnaubeira da Penha", "Carpina", "Caruaru", "Casinhas", "Catende", "Cedro", 
  "Chã de Alegria", "Chã Grande", "Condado", "Correntes", "Cortês", "Cumaru", 
  "Cupira", "Custódia", "Dormentes", "Escada", "Exu", "Feira Nova", 
  "Fernando de Noronha", "Ferreiros", "Flores", "Floresta", "Frei Miguelinho", 
  "Gameleira", "Garanhuns", "Glória do Goitá", "Goiana", "Granito", "Gravatá", 
  "Iati", "Ibimirim", "Ibirajuba", "Igarassu", "Iguaracy", "Inajá", "Ingazeira", 
  "Ipojuca", "Ipubi", "Itacuruba", "Itaíba", "Ilha de Itamaracá", "Itambé", 
  "Itapetim", "Itapissuma", "Itaquitinga", "Jaboatão dos Guararapes", "Jaqueira", 
  "Jataúba", "Jatobá", "João Alfredo", "Joaquim Nabuco", "Jucati", "Jupi", "Jurema", 
  "Lagoa do Carro", "Lagoa do Itaenga", "Lagoa do Ouro", "Lagoa dos Gatos", 
  "Lagoa Grande", "Lajedo", "Limoeiro", "Macaparana", "Machados", "Manari", 
  "Maraial", "Mirandiba", "Moreilândia", "Moreno", "Nazaré da Mata", "Olinda", 
  "Orobó", "Orocó", "Ouricuri", "Palmares", "Palmeirina", "Panelas", "Paranatama", 
  "Parnamirim", "Passira", "Paudalho", "Paulista", "Pedra", "Pesqueira", 
  "Petrolândia", "Petrolina", "Poção", "Pombos", "Primavera", "Quipapá", "Quixaba", 
  "Recife", "Riacho das Almas", "Ribeirão", "Rio Formoso", "Sairé", "Salgadinho", 
  "Salgueiro", "Saloá", "Sanharó", "Santa Cruz", "Santa Cruz da Baixa Verde", 
  "Santa Cruz do Capibaribe", "Santa Filomena", "Santa Maria da Boa Vista", 
  "Santa Maria do Cambucá", "Santa Terezinha", "São Benedito do Sul", 
  "São Bento do Una", "São CaitAno", "São João", "São Joaquim do Monte", 
  "São José da Coroa Grande", "São José do Belmonte", "São José do Egito", 
  "São Lourenço da Mata", "São Vicente Ferrer", "Serra Talhada", "Serrita", 
  "Sertânia", "Sirinhaém", "Solidão", "Surubim", "Tabira", "Tacaimbó", "Terezinha", 
  "Terra Nova", "Timbaúba", "Toritama", "Tracunhaém", "Trindade", "Triunfo", 
  "Tupanatinga", "Tuparetama", "Venturosa", "Verdejante", "Vertente do Lério", 
  "Vertentes", "Vicência", "Vitória de Santo Antão", "Xexéu"
];

const racasCachorros = [
  "Labrador Retriever", "Golden Retriever", "Pastor Alemão", "Bulldog",
  "Poodle", "Beagle", "Rottweiler", "Shih Tzu", "Yorkshire Terrier",
  "Boxer", "Dachshund (Teckel)", "Chihuahua", "Border Collie", "SRD (Vira-lata)",
  "Husky Siberiano", "Doberman", "Maltês", "Akita", "Cocker Spaniel",
  "Pinscher", "Pit Bull"
];

const racasGatos = [
  "Persa", "Siamês", "Maine Coon", "Angorá", "Sphynx (Sem pelo)",
  "Ragdoll", "British Shorthair", "Bengal", "Himalaio", "SRD (Vira-lata)",
  "Norueguês da Floresta", "Abissínio", "Exótico", "Scottish Fold",
  "Bombay", "Oriental", "Savannah", "Tonquinês", "Manx"
];

const idades = [
  "Recém-Nascido", "1 Mês", "2 Meses", "3 Meses", "4 Meses", "5 Meses", "6 Meses", "7 Meses", "8 Meses", "9 Meses", "10 Meses",
  "11 Meses", "1 Ano", "2 Anos", "3 Anos", "4 Anos", "5 Anos", "6 Anos", "7 Anos", "8 Anos", "9 Anos", "10 Anos", "11 Anos",
  "12 Anos", "13 Anos", "14 Anos", "15 Anos +"
];

const animais = [
    { nome: "Zezinho", especie: "Cachorro", sexo: "Macho", porte: "Médio", raca: "Beagle", idade: "3 Meses", local: "Garanhuns - PE", foto: "../img/zezinho.jpg", origem: "Ong", historia: "Encontrado perto do parque, Zezinho adora correr e brincar de bola." },
    { nome: "Luna", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Bobtail", idade: "2 Anos", local: "Garanhuns - PE", foto: "../img/luna.jpg", origem: "Protetor", historia: "Luna é muito carinhosa e adora dormir no sofá a tarde toda." },
    { nome: "Simba", especie: "Cachorro", sexo: "Macho", porte: "Médio", raca: "SRD (Vira-lata)", idade: "6 Meses", local: "Lajedo - PE", foto: "../img/Simba.jpg" },
    { nome: "Bob", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Bobtail", idade: "3 Anos", local: "Garanhuns - PE", foto: "../img/Bob.jpg" },
    { nome: "Jujuba", especie: "Cachorro", sexo: "Fêmea", porte: "Médio", raca: "SRD (Vira-lata)", idade: "3 Anos", local: "Canhotinho - PE", foto: "../img/Jujuba.jpg" },
    { nome: "Romário", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "Pinscher", idade: "6 Anos", local: "Jupi - PE", foto: "../img/romário.jpg" },
    { nome: "Bela", especie: "Cachorro", sexo: "Fêmea", porte: "Grande", raca: "Husky Siberiano", idade: "4 Anos", local: "Garanhuns - PE", foto: "../img/Bela.jpg" },
    { nome: "Thor", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "1 Ano", local: "Lajedo - PE", foto: "../img/Thor.jpg" },
    { nome: "Gaia", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "2 Meses", local: "Jupi - PE", foto: "../img/Gaia.jpg" },
    { nome: "Rocky", especie: "Cachorro", sexo: "Macho", porte: "Médio", raca: "SRD (Vira-lata)", idade: "5 Anos", local: "Lajedo - PE", foto: "../img/Rocky.jpg" },
    { nome: "Silvana", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Siamês", idade: "3 Anos", local: "Garanhuns - PE", foto: "../img/Silvana.jpg" },
    { nome: "Chico", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "3 Anos", local: "Jupi - PE", foto: "../img/Chico.jpg" }
];


/* --- 3. RENDERIZAÇÃO COM PAGINAÇÃO INTELIGENTE (Atualizado) --- */

// Função chamada quando a página carrega ou quando filtramos
function atualizarListaAnimais(lista) {
    listaAtualDeAnimais = lista; // Atualiza a lista global
    paginaAtual = 1; // Sempre volta para a primeira página ao filtrar
    calcularItensPorPagina(); // Recalcula o limite baseado na tela
    renderizarPagina(); // Desenha a tela
}

// Função que desenha APENAS os animais da página atual
function renderizarPagina() {
    const grid = document.getElementById('grid-animais');
    const msgSemResultados = document.getElementById('mensagem-sem-resultados');
    const paginacaoContainer = document.getElementById('paginacao-container');

    grid.innerHTML = '';

    // Verifica se a lista está vazia
    if (listaAtualDeAnimais.length === 0) {
        msgSemResultados.style.display = 'block';
        if(paginacaoContainer) paginacaoContainer.style.display = 'none'; // Esconde os botões
        return;
    } else {
        msgSemResultados.style.display = 'none';
        if(paginacaoContainer) paginacaoContainer.style.display = 'flex'; // Mostra os botões
    }

    // CÁLCULO DA FATIA (SLICE)
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const animaisDaPagina = listaAtualDeAnimais.slice(inicio, fim);

    // Cria os cards (só para os animais desta página)
    animaisDaPagina.forEach(animal => {
        const cardHTML = `
            <div class="cartao-animal" onclick="abrirModal('${animal.nome}')">
                <img src="${animal.foto}" alt="${animal.nome}" onerror="this.src='https://placehold.co/300x250?text=Foto+Indisponível'">
                <div class="info-card">
                    <h3>${animal.nome}</h3>
                    <p>${animal.especie} | ${animal.sexo}</p>
                    <p>${animal.local}</p>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    atualizarControlesPaginacao();
}

// Atualiza o texto "Página 1 de X" e habilita/desabilita botões
function atualizarControlesPaginacao() {
    const btnAnt = document.getElementById('btn-ant');
    const btnProx = document.getElementById('btn-prox');
    const indicador = document.getElementById('indicador-paginacao');
    
    // Se não tiver os elementos no HTML ainda, evita erro
    if (!btnAnt || !btnProx || !indicador) return;

    const totalPaginas = Math.ceil(listaAtualDeAnimais.length / itensPorPagina);
    indicador.innerText = `Página ${paginaAtual} de ${totalPaginas}`;

    btnAnt.disabled = (paginaAtual === 1);
    btnProx.disabled = (paginaAtual === totalPaginas || totalPaginas === 0);
}

// Função chamada pelos botões de Anterior/Próximo
function mudarPagina(direcao) {
    paginaAtual += direcao;
    renderizarPagina();
    
    // Sobe a tela suavemente
    const topoGaleria = document.querySelector('.Galeria-Animais');
    if (topoGaleria) topoGaleria.scrollIntoView({ behavior: 'smooth' });
}


/* --- 4. FILTRAGEM (O Cérebro) --- */

function aplicarFiltros() {
    // 1. Pega os valores
    const cidadeValor = document.getElementById('cidade').value.toLowerCase();
    const especieValor = document.getElementById('filtro-especie').value;
    const porteValor = document.getElementById('filtro-porte').value;
    const sexoValor = document.getElementById('filtro-sexo').value;
    const idadeValor = document.getElementById('filtro-idade').value;
    const origemValor = document.getElementById('filtro-origem').value;

    let racaValor = "";
    if (especieValor === "Cachorro") racaValor = document.getElementById('filtro-raca-cachorro').value;
    else if (especieValor === "Gato") racaValor = document.getElementById('filtro-raca-gato').value;

    // 2. Filtra
    const filtrados = animais.filter(animal => {
        const matchCidade = animal.local.toLowerCase().includes(cidadeValor);
        const matchEspecie = (especieValor === "" || especieValor === "Selecione...") ? true : animal.especie === especieValor;
        const matchPorte = (porteValor === "" || porteValor === "Todos") ? true : animal.porte === porteValor;
        const matchSexo = (sexoValor === "" || sexoValor === "Todos") ? true : animal.sexo === sexoValor;
        const matchIdade = (idadeValor === "" || idadeValor === "Todas") ? true : animal.idade === idadeValor;
        const matchOrigem = (origemValor === "" || origemValor === "Todas") ? true : (animal.origem === origemValor);
        const matchRaca = (racaValor === "" || racaValor === "Todas") ? true : animal.raca.includes(racaValor);

        return matchCidade && matchEspecie && matchPorte && matchSexo && matchIdade && matchOrigem && matchRaca;
    });

    // 3. ATUALIZADO: Chama a função que gerencia a lista
    atualizarListaAnimais(filtrados);
    
    if (window.innerWidth < 1400) toggleFiltros();
}

function limparFiltros() {
    document.getElementById('cidade').value = '';
    document.getElementById('filtro-especie').value = '';
    document.getElementById('filtro-porte').value = '';
    document.getElementById('filtro-sexo').value = '';
    document.getElementById('filtro-idade').value = '';
    document.getElementById('filtro-origem').value = '';
    
    // ATUALIZADO: Reseta para a lista completa
    atualizarListaAnimais(animais);
}


/* --- 5. INICIALIZAÇÃO (Roda quando a página carrega) --- */

document.addEventListener('DOMContentLoaded', () => {
    
    // A) Preencher Cidades
    const datalist = document.getElementById("cidades");
    cidadesPE.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade;
        datalist.appendChild(option);
    });

    // B) Preencher os outros Selects
    preencherSelect("filtro-raca-cachorro", racasCachorros);
    preencherSelect("filtro-raca-gato", racasGatos);
    preencherSelect("filtro-idade", idades);

    // C) Lógica para mostrar/esconder select de raça
    const selectEspecie = document.getElementById('filtro-especie');
    const divRacaCachorro = document.getElementById('container-raca-cachorro');
    const divRacaGato = document.getElementById('container-raca-gato');

    selectEspecie.addEventListener('change', (evento) => {
        const valor = evento.target.value;
        divRacaCachorro.style.display = 'none';
        divRacaGato.style.display = 'none';

        if (valor === 'Cachorro') divRacaCachorro.style.display = 'flex';
        if (valor === 'Gato') divRacaGato.style.display = 'flex';
    });

    // D) Calcular limite inicial e carregar
    calcularItensPorPagina();
    atualizarListaAnimais(animais);
});