/* =======================================================
   LÓGICA DA PÁGINA QUERO ADOTAR
   Arquivo: js/adotar.js
   ======================================================= */

/* --- 1. FUNÇÕES DE INTERFACE (Botões e Modais) --- */

// Função para abrir/fechar o menu de filtros no mobile
function toggleFiltros() {
    const container = document.getElementById('filtros-container');
    container.classList.toggle('aberto');
    
    // Trava a rolagem do fundo quando o menu está aberto
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

// Função Provisória do Modal (Só para testar o clique)
function abrirModal(nomeAnimal) {
    alert("Você clicou no " + nomeAnimal + "! (Em breve o modal completo abrirá aqui)");
}


/* --- 2. BANCO DE DADOS (Arrays de Informação) --- */

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
  "Husky SiberiAno", "Doberman", "Maltês", "Akita", "Cocker Spaniel",
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
    {
        nome: "Zezinho",
        especie: "Cachorro",
        sexo: "Macho",
        porte: "Médio",
        raca: "Beagle",
        idade: "3 Meses",
        local: "Garanhuns - PE",
        foto: "../img/zezinho.jpg"
    },
    {
        nome: "Luna",
        especie: "Gato",
        sexo: "Fêmea",
        porte: "Pequeno",
        raca: "Bobtail",
        idade: "2 Anos",
        local: "Garanhuns - PE",
        foto: "../img/luna.jpg"
    },
    {
        nome: "Simba",
        especie: "Cachorro",
        sexo: "Macho",
        porte: "Médio",
        raca: "Vira-lata",
        idade: "6 Meses",
        local: "Lajedo - PE",
        foto: "../img/Simba.jpg"
    },
    {
        nome: "Bob",
        especie: "Gato",
        sexo: "Fêmea",
        porte: "Pequeno",
        raca: "Bobtail",
        idade: "3 Anos",
        local: "Garanhuns - PE",
        foto: "../img/Bob.jpg"
    },
    {
        nome: "Jujuba",
        especie: "Cachorro",
        sexo: "Fêmea",
        porte: "Médio",
        raca: "Vira-lata",
        idade: "3 Anos",
        local: "Canhotinho - PE",
        foto: "../img/Jujuba.jpg"
    },
    {
        nome: "Romário",
        especie: "Cachorro",
        sexo: "Macho",
        porte: "Pequeno",
        raca: "Pinscher",
        idade: "6 Anos",
        local: "Jupi - PE",
        foto: "../img/romário.jpg"
    },
    {
        nome: "Bela",
        especie: "Cachorro",
        sexo: "Fêmea",
        porte: "Grande",
        raca: "Husky",
        idade: "4 Anos",
        local: "Garanhuns - PE",
        foto: "../img/Bela.jpg"
    },
    {
        nome: "Thor",
        especie: "Cachorro",
        sexo: "Macho",
        porte: "Pequeno",
        raca: "Vira-lata",
        idade: "1 Ano",
        local: "Lajedo - PE",
        foto: "../img/Thor.jpg"
    },
    {
        nome: "Gaia",
        especie: "Gato",
        sexo: "Fêmea",
        porte: "Pequeno",
        raca: "Vira-lata",
        idade: "2 Meses",
        local: "Jupi - PE",
        foto: "../img/Gaia.jpg"
    },
    {
        nome: "Rocky",
        especie: "Cachorro",
        sexo: "Macho",
        porte: "Médio",
        raca: "Vira-lata",
        idade: "5 Anos",
        local: "Lajedo - PE",
        foto: "../img/Rocky.jpg"
    },
    {
        nome: "Silvana",
        especie: "Gato",
        sexo: "Fêmea",
        porte: "Pequeno",
        raca: "Siamês",
        idade: "3 Anos",
        local: "Garanhuns - PE",
        foto: "../img/Silvana.jpg"
    },
    {
        nome: "Chico",
        especie: "Cachorro",
        sexo: "Macho",
        porte: "Pequeno",
        raca: "Vira-lata",
        idade: "3 Anos",
        local: "Jupi - PE",
        foto: "../img/Chico.jpg"
    }
];


/* --- 3. RENDERIZAÇÃO (A Fábrica de Cards) --- */

function carregarAnimais(listaParaMostrar) {
    const grid = document.getElementById('grid-animais');
    const msgSemResultados = document.getElementById('mensagem-sem-resultados');
    
    // Limpa o grid atual
    grid.innerHTML = '';

    // Verifica se a lista está vazia
    if (listaParaMostrar.length === 0) {
        msgSemResultados.style.display = 'block';
        return;
    } else {
        msgSemResultados.style.display = 'none';
    }

    // Cria os cards
    listaParaMostrar.forEach(animal => {
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
}


/* --- 4. INICIALIZAÇÃO (Roda quando a página carrega) --- */

document.addEventListener('DOMContentLoaded', () => {
    
    // A) Preencher Cidades (Datalist)
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

        if (valor === 'Cachorro') divRacaCachorro.style.display = 'block';
        if (valor === 'Gato') divRacaGato.style.display = 'block';
    });

    // D) Carregar TODOS os animais inicialmente
    carregarAnimais(animais);
});