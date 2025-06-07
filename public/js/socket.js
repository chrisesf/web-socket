// public/js/socket.js

// ESTA É A LÓGICA COMPLETA E CORRETA
// Ela verifica se a página está em 'https' e escolhe 'wss' automaticamente.
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${protocol}://${window.location.host}`);

// Esta função é executada assim que a conexão é estabelecida com sucesso.
socket.onopen = () => {
    console.log("Conexão WebSocket segura (WSS) estabelecida com sucesso.");

    // Envia os dados do usuário logado para o servidor se registrar.
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        socket.send(JSON.stringify({ type: "register_client", user }));
    }
};

// Executada se a conexão for fechada.
socket.onclose = () => {
    console.log("Conexão WebSocket fechada.");
    alert("Conexão perdida. Por favor, atualize a página.");
};

// Executada se ocorrer algum erro na conexão.
socket.onerror = (error) => {
    console.error("Erro no WebSocket:", error);
};

// Exporta a variável 'socket' para que outros arquivos (como o chat.js) possam usá-la.
export default socket;
