// Banco de Dados Provisório.

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
    { 
        id: "zezinho", 
        nome: "Zezinho", 
        especie: "Cachorro", 
        sexo: "Macho", 
        porte: "Médio", 
        raca: "Beagle", 
        idade: "3 Meses", 
        local: "Garanhuns - PE", 
        fotos: ["../img/zezinho.jpg", "https://placehold.co/600x400/orange/white?text=Brincando", "https://placehold.co/600x400/green/white?text=Dormindo"],
        origem: "Ong", 
        historia: "Encontrado perto do parque, Zezinho mostrou desde o início sua alegria contagiante. Ele adora correr, brincar de bola e conquistar todos com seu olhar doce. Já recuperado, está saudável e cheio de energia. É um companheiro perfeito para quem busca diversão e carinho. Zezinho sonha com uma família que o acolha de verdade. Será que você é o lar que ele tanto espera? ",
        dataAdicao: "2024-05-20", 
        interessados: 3, 
        saude: { vacinado: true, castrado: false, vermifugado: true },
        video: "../img/video-zezinho.mp4"
    },
    // Outros animais (Adicionei IDs simples baseados no nome)
    { id: "luna", nome: "Luna", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Bobtail", idade: "2 Anos", local: "Garanhuns - PE", foto: "../img/luna.jpg", origem: "Protetor", historia: "Luna é muito carinhosa...", dataAdicao: "2024-01-10", interessados: 0, saude: { vacinado: true, castrado: true, vermifugado: true } },
    { id: "simba", nome: "Simba", especie: "Cachorro", sexo: "Macho", porte: "Médio", raca: "SRD (Vira-lata)", idade: "6 Meses", local: "Lajedo - PE", foto: "../img/Simba.jpg", dataAdicao: "2024-05-22", interessados: 6, saude: { vacinado: false, castrado: false, vermifugado: true } },
    { id: "bob", nome: "Bob", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Bobtail", idade: "3 Anos", local: "Garanhuns - PE", foto: "../img/Bob.jpg", dataAdicao: "2023-12-05", interessados: 1 },
    { id: "jujuba", nome: "Jujuba", especie: "Cachorro", sexo: "Fêmea", porte: "Médio", raca: "SRD (Vira-lata)", idade: "3 Anos", local: "Canhotinho - PE", foto: "../img/Jujuba.jpg", dataAdicao: "2024-03-15", interessados: 0 },
    { id: "romario", nome: "Romário", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "Pinscher", idade: "6 Anos", local: "Jupi - PE", foto: "../img/romário.jpg", dataAdicao: "2023-11-20", interessados: 2 },
    { id: "bela", nome: "Bela", especie: "Cachorro", sexo: "Fêmea", porte: "Grande", raca: "Husky Siberiano", idade: "4 Anos", local: "Garanhuns - PE", foto: "../img/Bela.jpg", dataAdicao: "2024-04-01", interessados: 8, saude: { vacinado: true, castrado: true, vermifugado: true } },
    { id: "thor", nome: "Thor", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "1 Ano", local: "Lajedo - PE", foto: "../img/Thor.jpg", dataAdicao: "2024-02-15", interessados: 4 },
    { id: "gaia", nome: "Gaia", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "2 Meses", local: "Jupi - PE", foto: "../img/Gaia.jpg", dataAdicao: "2024-05-25", interessados: 1 },
    { id: "rocky", nome: "Rocky", especie: "Cachorro", sexo: "Macho", porte: "Médio", raca: "SRD (Vira-lata)", idade: "5 Anos", local: "Lajedo - PE", foto: "../img/Rocky.jpg", dataAdicao: "2024-01-01", interessados: 0 },
    { id: "silvana", nome: "Silvana", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Siamês", idade: "3 Anos", local: "Garanhuns - PE", foto: "../img/Silvana.jpg", dataAdicao: "2024-03-30", interessados: 5 },
    { id: "chico", nome: "Chico", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "3 Anos", local: "Jupi - PE", foto: "../img/Chico.jpg", dataAdicao: "2024-04-10", interessados: 2 }
];

const animaisAdotados = [
  {
    id: 1,
    foto: "../img/Fubá.jpg",
    nome: "Fubá",
    titulo: "Ele completou nossa família!",
    mensagem: "Nós (Mariana e João) sempre sentimos que faltava algo em nosso apartamento. Tínhamos essa rotina de trabalho e casa, mas tudo parecia silencioso demais. Vimos a foto do Fubá no 'Meu Futuro Amigo' e foi instantâneo. O processo de adoção foi super tranquilo e, no dia que ele chegou, a casa mudou. Hoje, nossas manhãs começam com ele pulando na cama e nossos fins de tarde são no parque. Ele é pequeno, mas tem uma personalidade gigante. É exatamente o que o depoimento diz: ele completou nossa família.",
    especie: "Cachorro",
    sexo: "Macho",
    raca: "Yorkshire",
    idade: "6 Meses",
    cidade: "Garanhuns-PE",
    dataAdoção: "15/10/2025"
  },
  {
    id: 2,
    foto: "../img/Rafaela.jpg",
    nome: "Rafaela",
    titulo: "Virou minha Companheira!",
    mensagem: "Eu (Laura) moro sozinha e comecei a trabalhar de casa em tempo integral. Passava o dia todo em silêncio, e me sentia muito só. Decidi adotar um gato e encontrei a Rafaela. Que surpresa boa! Rafaela é uma gatinha muito esperta e carinhosa. Ela me acompanha em todos os momentos, e até parece entender quando estou triste. Hoje, não me sinto mais sozinha, e tenho uma rotina muito melhor com minha companheira.",
    especie: "Gato",
    sexo: "Fêmea",
    raca: "Tabby",
    idade: "2 Meses",
    cidade: "Jupi-PE",
    dataAdoção: "07/10/2025"
  },
  {
    id: 3,
    foto: "../img/Sandrinha.jpg",
    nome: "Sandrinha",
    titulo: "Nossa princesa desastrada",
    mensagem: "A Sandrinha foi resgatada pelo abrigo, e dava para ver no olhar dela que ela era muito tímida e um pouco assustada. Nos apaixonamos por ela justamente por isso. Queríamos dar a ela um lar acolhedor e muito amor. Sandrinha passou por um processo de adaptação, mas aos poucos foi se soltando. Hoje, ela é super brincalhona e até um pouco desastrada. É muito engraçada e nos faz rir todos os dias. Ver essa transformação de um animal tímido para um tão confiante é realmente emocionante.",
    especie: "Cachorro",
    sexo: "Fêmea",
    raca: "Vira-lata",
    idade: "2 Anos",
    cidade: "Lajedo-PE",
    dataAdoção: "29/09/2025"
  },
  {
    id: 4,
    foto: "../img/Geovanni.jpg",
    nome: "Geovanni",
    titulo: "Me ensinou a ter Paciência",
    mensagem: "Eu (Pedro) queria um cachorro “pronto”. Que já soubesse brincar, fosse extrovertido, mas não sabia muito. A chegada do Geovanni me ensinou muito. Ele era muito medroso e não confiava em ninguém. Foi um desafio. Tive que aprender a respeitar o tempo dele, e isso me fez crescer muito como pessoa. Hoje, ele é um cachorro alegre, que corre e brinca com outros cães. Geovanni me ensinou a ser uma pessoa melhor, e sou muito grato por isso. Às vezes, o que a gente precisa não é um pet pronto, e sim um que nos ajude a nos reconhecer no próprio tempo.",
    especie: "Cachorro",
    sexo: "Macho",
    raca: "Vira-lata",
    idade: "1 Ano",
    cidade: "Canhotinho-PE",
    dataAdoção: "21/09/2025"
  },
  {
    id: 5,
    foto: "../img/Fofinho.jpg",
    nome: "Fofinho",
    titulo: "Fofinho é um grude!",
    mensagem: "O nome Fofinho não é à toa, kkkkkkkkkkk. Ele é o gato mais grudento que eu já vi. A história dele me ensinou grande demais, de me permitir amar de verdade. Eu sou solteira e minha rotina é primária de silêncio, de não companhia, desde que o Fofinho chegou, ele me acompanha em todos os momentos. Ele é super carinhoso e muito peludo. Amo demais esse gato. Fofinho me ensinou que às vezes o que a gente precisa disso: um amor simples, direto e muito peludo.",
    especie: "Gato",
    sexo: "Macho",
    raca: "Vira-lata",
    idade: "1 Mês",
    cidade: "Garanhuns-PE",
    dataAdoção: "15/09/2025"
  },
  {
    id: 6,
    foto: "",
    nome: "Luna",
    titulo: "A guardiã da casa",
    mensagem: "Eu (Carlos) sempre quis um cachorro que fosse companheiro e protetor. Quando conheci a Luna, senti que ela seria perfeita. Ela chegou tímida, mas logo mostrou sua energia e carinho. Hoje, além de brincar com as crianças, ela late sempre que alguém se aproxima do portão. É nossa guardiã e amiga fiel.",
    especie: "Cachorro",
    sexo: "Fêmea",
    raca: "Pastor Alemão",
    idade: "3 Anos",
    cidade: "Caruaru-PE",
    dataAdoção: "02/11/2025"
  },
  {
    id: 7,
    foto: "",
    nome: "Mel",
    titulo: "Doce como o nome",
    mensagem: "Eu (Fernanda) estava passando por um momento difícil e decidi adotar um gato para me ajudar. A Mel apareceu como um presente. Ela é carinhosa, gosta de dormir no meu colo e sempre me faz sorrir. Hoje, sinto que ela trouxe leveza para minha vida.",
    especie: "Gato",
    sexo: "Fêmea",
    raca: "Siamês",
    idade: "5 Meses",
    cidade: "Recife-PE",
    dataAdoção: "10/11/2025"
  },
  {
    id: 8,
    foto: "",
    nome: "Thor",
    titulo: "Energia sem fim!",
    mensagem: "Eu (André) queria um cachorro para correr comigo nas manhãs. Thor foi a escolha perfeita. Ele tem energia de sobra e me acompanha em todas as corridas. Além disso, é muito brincalhão e adora água. Nunca pensei que um cachorro pudesse me motivar tanto a manter uma rotina saudável.",
    especie: "Cachorro",
    sexo: "Macho",
    raca: "Labrador",
    idade: "1 Ano",
    cidade: "Petrolina-PE",
    dataAdoção: "18/11/2025"
  },
  {
    id: 9,
    foto: "",
    nome: "Estrela",
    titulo: "Ilumina nossos dias",
    mensagem: "Nós (Paulo e Ana) sempre tivemos vontade de adotar um gato. Quando vimos a Estrela, sentimos que ela era especial. Ela é calma, gosta de observar pela janela e tem um olhar que transmite paz. Nossa casa ficou mais iluminada com sua presença.",
    especie: "Gato",
    sexo: "Fêmea",
    raca: "Persa",
    idade: "2 Anos",
    cidade: "Olinda-PE",
    dataAdoção: "25/11/2025"
  },
  {
    id: 10,
    foto: "",
    nome: "Zeus",
    titulo: "O gigante carinhoso",
    mensagem: "Eu (Roberto) sempre gostei de cães grandes. Zeus é enorme, mas tem um coração doce. Ele adora brincar com crianças e é muito obediente. Desde que chegou, virou parte essencial da nossa família.",
    especie: "Cachorro",
    sexo: "Macho",
    raca: "Rottweiler",
    idade: "4 Anos",
    cidade: "Serra Talhada-PE",
    dataAdoção: "30/11/2025"
  },
  {
    id: 11,
    foto: "",
    nome: "Mimi",
    titulo: "A rainha da casa",
    mensagem: "Eu (Juliana) adotei a Mimi porque queria companhia nos meus estudos. Ela sempre se deita ao lado dos livros e parece me observar atentamente. Mimi trouxe alegria e virou a verdadeira rainha da casa.",
    especie: "Gato",
    sexo: "Fêmea",
    raca: "Angorá",
    idade: "7 Meses",
    cidade: "Vitória de Santo Antão-PE",
    dataAdoção: "05/12/2025"
  },
  {
    id: 12,
    foto: "",
    nome: "Bidu",
    titulo: "O parceiro das caminhadas",
    mensagem: "Eu (Marcelo) precisava de motivação para sair de casa e caminhar. Bidu foi a solução. Ele adora passear e me obriga a manter uma rotina saudável. Além disso, é muito carinhoso e já conquistou todos da vizinhança.",
    especie: "Cachorro",
    sexo: "Macho",
    raca: "Beagle",
    idade: "2 Anos",
    cidade: "Gravatá-PE",
    dataAdoção: "09/12/2025"
  },
  {
    id: 13,
    foto: "",
    nome: "Amora",
    titulo: "Pequena e esperta",
    mensagem: "Eu (Sofia) queria um gato pequeno e brincalhão. Amora é exatamente isso. Ela corre pela casa, brinca com tudo e sempre me faz rir. É incrível como um ser tão pequeno pode trazer tanta alegria.",
    especie: "Gato",
    sexo: "Fêmea",
    raca: "Vira-lata",
    idade: "3 Meses",
    cidade: "Arcoverde-PE",
    dataAdoção: "12/12/2025"
  },
  {
    id: 14,
    foto: "",
    nome: "Tobias",
    titulo: "O amigo fiel",
    mensagem: "Eu (Ricardo) sempre quis um cachorro para me acompanhar nas viagens. Tobias se adaptou muito bem e já foi comigo para várias cidades. Ele é tranquilo, gosta de andar de carro e nunca me deixa sozinho.",
    especie: "Cachorro",
    sexo: "Macho",
    raca: "Golden Retriever",
    idade: "3 Anos",
    cidade: "Paulista-PE",
    dataAdoção: "15/12/2025"
  },
  {
    id: 15,
    foto: "",
    nome: "Clarinha",
    titulo: "A alegria da família",
    mensagem: "Nós (Camila e José) adotamos a Clarinha para alegrar nossos filhos. Ela é uma gatinha dócil, que adora brincar com as crianças e dormir no sofá. Clarinha trouxe ainda mais união para nossa família.",
    especie: "Gato",
    sexo: "Fêmea",
    raca: "Vira-lata",
    idade: "4 Meses",
    cidade: "Pesqueira-PE",
    dataAdoção: "20/12/2025"
  }
];