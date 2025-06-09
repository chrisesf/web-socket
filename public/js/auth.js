// Aguarda o carregamento completo do DOM antes de executar o script.
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const icons = document.querySelectorAll(".icon");
    let selectedIcon = null;

    //Seleciona o icone
    icons.forEach(icon => {
        icon.addEventListener("click", () => {
            icons.forEach(i => i.classList.remove("selected"));
            icon.classList.add("selected");
            selectedIcon = icon.getAttribute("data-icon");
        });
    });

    //Coleta os dados de registro, valida e envia para a API.
    registerButton.addEventListener("click", async () => {
        const username = document.getElementById("registerUsername").value.trim();
        const password = document.getElementById("registerPassword").value.trim();

        if (!username || !password || !selectedIcon) {
            return alert("Todos os campos e a seleção de um ícone são obrigatórios.");
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, icon: selectedIcon }),
            });

            const data = await response.json();
            alert(response.ok ? "Registro bem-sucedido!" : `Erro: ${data.error}`);
        } catch (error) {
            alert("Ocorreu um erro durante o registro.");
        }
    });

    //Coleta os dados de login, valida e envia para a API.
    loginButton.addEventListener("click", async () => {
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!username || !password) {
            return alert("Nome de usuário e senha são obrigatórios.");
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("user", JSON.stringify(data));
                window.location.href = "chats.html";
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert("Ocorreu um erro durante o login.");
        }
    });
});