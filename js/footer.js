// Carregar o Footer em todos as páginas.
async function carregarFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    try {
        const response = await fetch('/components/footer.html');

        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const html = await response.text();

        footer.innerHTML = html;

    } catch (error) {
        console.error('Erro ao carregar o footer', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarFooter);