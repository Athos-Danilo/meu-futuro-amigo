// --- 1. SLIDER DOS BANNERS (Mantido igual ao seu) ---
let indiceAtual = 0; 
const slides = document.querySelectorAll('.slide-item');
const totalSlides = slides.length;

function passarSlide() {
    // Verifica se existem slides para evitar erros
    if(totalSlides === 0) return;
    
    slides[indiceAtual].classList.remove('ativa');
    indiceAtual = (indiceAtual + 1) % totalSlides;
    slides[indiceAtual].classList.add('ativa');
}

setInterval(passarSlide, 5000);


// --- 2. FUNÇÃO QUE BUSCA DO BANCO E CRIA OS CARDS ---
async function carregarAdotados() {
    const container = document.getElementById('lista-adotados');
    
    if (!container) return;

    // Limpa o container antes de começar
    container.innerHTML = '';

    try {
        // A. BUSCAR DADOS NO SERVIDOR (A grande mudança!)
        // Estamos pedindo apenas os com status 'adotado'
        const response = await fetch('http://localhost:3000/animais?status=adotado');
        const dadosBanco = await response.json();

        // B. LIMITADOR DE TELA (Sua lógica original)
        const larguraTela = window.innerWidth;
        let limite;

        if (larguraTela < 900) {
            limite = 5; // Celular
        } else {
            limite = dadosBanco.length; // Desktop (Mostra todos que vierem do banco)
            // Se quiser travar no Desktop também, mude para: limite = 8;
        }

        // C. RECORTAR A LISTA
        // Pegamos os dados do banco e cortamos conforme o limite
        const listaFinal = dadosBanco.slice(0, limite);

        // Se não tiver ninguém, avisa
        if (listaFinal.length === 0) {
            container.innerHTML = '<p>Nenhum animal adotado recentemente.</p>';
            return;
        }

        // D. GERAR O HTML (Usando a sua estrutura exata)
        listaFinal.forEach(animal => {
            
            // Tratamento da imagem: se não tiver 'http', adicionamos o localhost
            let urlFoto = animal.foto;
            if (!urlFoto.startsWith('http')) {
                urlFoto = `http://localhost:3000/${animal.foto}`;
            }

            // Tratamento do texto (para ficar igual ao seu array antigo)
            const textoTipo = `${animal.especie} / ${animal.sexo}`;
            const textoFrase = animal.depoimento ? `"${animal.depoimento}"` : '"Final Feliz!"';
            // Formata a data para o padrão brasileiro (DD/MM/AAAA)
            let textoData = 'Data não inf.';
            if (animal.data_adocao) {
                const dataObj = new Date(animal.data_adocao);
                // O 'UTC' ajuda a não voltar um dia por causa do fuso horário
                textoData = dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            }

            const cardHTML = `
                <div class="Cartão-Adotado">
                    <img src="${urlFoto}" alt="${animal.nome}">
                    <div class="Nome-animal">${animal.nome}</div>
                    <div class="Detalhes-animal">
                        <div class="linha"></div>
                        <p>
                            ${textoTipo}<br>
                            ${animal.local}<br>
                            Adotado em ${textoData}<br>
                            <strong>${textoFrase}</strong>
                        </p>
                    </div>
                </div>
            `;

            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error('Erro ao carregar adotados:', error);
        container.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

// --- 3. OUVINTES DE EVENTOS ---
document.addEventListener('DOMContentLoaded', carregarAdotados);
window.addEventListener('resize', carregarAdotados);