// Selecionando com as NOVAS classes (com Letra Maiúscula e acentos)
const hamburger = document.querySelector(".Hamburger");
const navMenu = document.querySelector(".Navegação-Menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// Fecha o menu ao clicar em um link
document.querySelectorAll(".Navegação-Menu a").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));