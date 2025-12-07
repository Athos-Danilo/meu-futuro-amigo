// Carregar o Footer em todos as páginas.
async function carregarFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    try {const response = await fetch('/components/footer.html');
        const html await response.text();
        footer.innerHTML = html;

        inicializarLogicafooter();
    } catch (error) {
        console.error('Erro ao carregar o footer', error);
    }
}