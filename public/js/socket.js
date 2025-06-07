const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
const socket = new WebSocket(`${protocol}://${window.location.host}`);

socket.onopen = () => {
    console.log("Conexão WebSocket estabelecida com sucesso.");

    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        socket.send(JSON.stringify({ type: "register_client", user }));
    }
};

socket.onclose = () => {
    console.log("Conexão WebSocket fechada.");
    alert("Conexão perdida. Por favor, atualize a página.");
};

socket.onerror = (error) => {
    console.error("Erro no WebSocket:", error);
};

export default socket;