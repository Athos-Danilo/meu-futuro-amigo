/* divulgar.js
  Lógica de Front-end para a página de cadastro de animais.
  Autor: Equipe Meu Futuro Amigo
*/

document.addEventListener('DOMContentLoaded', () => {
    inicializarPreviews();
    inicializarLogicaRacas();
    configurarEnvioFormulario();
});

/* ==========================================================================
   1. SISTEMA DE PREVIEW DE IMAGENS (Capa e Galeria)
   ========================================================================== */
function inicializarPreviews() {
    // --- Preview da Capa ---
    const inputCapa = document.getElementById('input-capa');
    const imgPreview = document.getElementById('img-preview');
    const placeholder = document.querySelector('.upload-placeholder');
    const containerCapa = document.getElementById('preview-capa');

    // Ao clicar na div cinza, aciona o input escondido
    containerCapa.addEventListener('click', () => {
        inputCapa.click();
    });

    inputCapa.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imgPreview.src = event.target.result;
                imgPreview.classList.remove('hidden'); // Mostra a imagem
                placeholder.style.display = 'none';    // Esconde o texto "+"
            }
            reader.readAsDataURL(file);
        }
    });

    // --- Preview da Galeria (Múltiplas Fotos) ---
    const inputGaleria = document.getElementById('input-galeria');
    const containerGaleria = document.getElementById('preview-galeria');

    inputGaleria.addEventListener('change', (e) => {
        containerGaleria.innerHTML = ''; // Limpa as anteriores
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                // Cria o elemento visual da miniatura
                const imgDiv = document.createElement('img');
                imgDiv.src = event.target.result;
                imgDiv.classList.add('thumb-miniatura');
                containerGaleria.appendChild(imgDiv);
            }
            reader.readAsDataURL(file);
        });
    });
}

/* ==========================================================================
   2. LÓGICA DE RAÇAS DINÂMICAS (Do Banco + Opção "Outra")
   ========================================================================== */
function inicializarLogicaRacas() {
    const radioEspecie = document.querySelectorAll('input[name="especie"]');
    const selectRaca = document.getElementById('raca');
    
    // Raças "Hardcoded" para fallback (caso a API falhe ou demore)
    const racasCachorro = ['SRD (Vira-lata)', 'Pastor Alemão', 'Pinscher', 'Labrador', 'Poodle', 'Golden Retriever', 'Bulldog', 'Shih Tzu'];
    const racasGato = ['SRD (Vira-lata)', 'Siamês', 'Persa', 'Angorá', 'Maine Coon', 'Ragdoll'];

    // 1. Escuta a mudança nos botões de Espécie (Cachorro/Gato)
    radioEspecie.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const especieSelecionada = e.target.value;
            atualizarOpcoesRaca(especieSelecionada);
        });
    });

    // Função que popula o Select buscando do Banco de Dados
    async function atualizarOpcoesRaca(especie) {
        // Mostra pro usuário que está carregando...
        selectRaca.innerHTML = '<option value="" disabled selected>Carregando raças do banco...</option>';

        try {
            // Agora sim! Fazemos a requisição para o nosso próprio Back-end
            const response = await fetch(`/api/racas?especie=${especie}`);
            
            if (!response.ok) {
                throw new Error('Falha ao conectar com a API');
            }
            
            const listaRacas = await response.json();

            // Limpa o select para colocar as raças que vieram do banco
            selectRaca.innerHTML = '<option value="" disabled selected>Selecione a raça...</option>';

            // Regra de negócio: Se o banco estiver vazio (novo projeto), garante pelo menos o Vira-lata
            if (listaRacas.length === 0) {
                listaRacas.push('SRD (Vira-lata)');
            }

            // Popula as options do HTML
            listaRacas.forEach(raca => {
                const option = document.createElement('option');
                option.value = raca;
                option.textContent = raca;
                selectRaca.appendChild(option);
            });

            // E sempre adiciona a opção "Outra" por último
            const optionOutra = document.createElement('option');
            optionOutra.value = 'Outra';
            optionOutra.textContent = 'Outra (Digitar manualmente)';
            selectRaca.appendChild(optionOutra);

        } catch (error) {
            console.error("Erro ao buscar raças:", error);
            // Fallback seguro de emergência caso a internet caia
            selectRaca.innerHTML = '<option value="" disabled selected>Erro ao carregar</option>';
            const optionViraLata = document.createElement('option');
            optionViraLata.value = 'SRD (Vira-lata)';
            optionViraLata.textContent = 'SRD (Vira-lata)';
            selectRaca.appendChild(optionViraLata);
            
            const optionOutra = document.createElement('option');
            optionOutra.value = 'Outra';
            optionOutra.textContent = 'Outra (Digitar manualmente)';
            selectRaca.appendChild(optionOutra);
        }
    }

    // 3. Lógica do campo "Outra" (Abre input de texto)
    selectRaca.addEventListener('change', (e) => {
        const valor = e.target.value;
        verificarCampoOutra(valor);
    });

    function verificarCampoOutra(valor) {
        // Verifica se já existe o input "outra_raca" criado
        let inputExtra = document.getElementById('input-outra-raca');
        const parentDiv = selectRaca.parentElement; // A div .input-group

        if (valor === 'Outra') {
            if (!inputExtra) {
                // Cria o input dinamicamente
                inputExtra = document.createElement('input');
                inputExtra.type = 'text';
                inputExtra.id = 'input-outra-raca';
                inputExtra.name = 'raca_manual'; // Nome diferente para o backend pegar
                inputExtra.placeholder = 'Digite a raça aqui...';
                inputExtra.required = true;
                inputExtra.style.marginTop = '10px';
                inputExtra.style.borderColor = 'var(--cor-laranja)';
                
                // Animação de entrada
                inputExtra.style.opacity = '0';
                inputExtra.style.transition = 'opacity 0.5s';
                
                parentDiv.appendChild(inputExtra);

                // Força reflow para animação
                setTimeout(() => inputExtra.style.opacity = '1', 10);
            }
        } else {
            // Se mudou para uma raça normal, remove o input extra
            if (inputExtra) {
                inputExtra.remove();
            }
        }
    }
}

/* ==========================================================================
   3. ENVIO DO FORMULÁRIO (Fetch API)
   ========================================================================== */
function configurarEnvioFormulario() {
    const form = document.getElementById('form-divulgar');
    const btnSubmit = document.querySelector('.btn-cadastrar');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento padrão da página

        // Feedback Visual (Loading)
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Enviando...';
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.7';

        // Captura os dados (incluindo arquivos)
        const formData = new FormData(form);

        // Ajuste Fino: Se o usuário digitou uma raça manual, substitui o valor 'Outra'
        const racaManual = document.getElementById('input-outra-raca');
        if (racaManual && racaManual.value) {
            formData.set('raca', racaManual.value); // Sobrescreve 'Outra' pelo texto digitado
            formData.delete('raca_manual'); // Limpa o campo auxiliar
        }

        try {
            // Envia para o Backend (Rota que vamos criar em breve)
            const response = await fetch('/solicitacoes/novo-animal', {
                method: 'POST',
                body: formData // FormData envia arquivos automaticamente
            });

            const resultado = await response.json();

            if (response.ok) {
                alert('Sucesso! O animal foi cadastrado e será analisado.');
                window.location.href = 'minha-conta.html'; // Redireciona
            } else {
                throw new Error(resultado.erro || 'Erro desconhecido');
            }

        } catch (error) {
            console.error(error);
            alert('Ops! Algo deu errado: ' + error.message);
            
            // Restaura o botão
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = '1';
        }
    });
}