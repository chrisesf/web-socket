const http = require("http");
const express = require("express");
const path = require("path");
const { initDb } = require("./database");
const apiRoutes = require("./routes");
const { initializeWebSocket } = require("./websocket");

// Usa a porta fornecida pelo ambiente de hospedagem (como o Replit)
// ou a porta 3000 se estiver rodando localmente.
const PORT = process.env.PORT || 3000;

// Inicializa o Banco de Dados
initDb();

// Configuração do App Express
const app = express();
app.use(express.json());
// Serve os arquivos estáticos (HTML, CSS, JS do cliente) da pasta 'public'
app.use(express.static(path.join(__dirname, "..", "public")));
// Usa as rotas da API (para /login e /register)
app.use("/api", apiRoutes);

// Cria o servidor HTTP a partir da aplicação Express
const server = http.createServer(app);

// Inicializa o servidor WebSocket, "anexando-o" ao servidor HTTP
initializeWebSocket(server);

// Inicia o servidor para "ouvir" as conexões na porta correta
server.listen(PORT, () => {
    // Mensagem de confirmação que aparecerá no console do Replit
    console.log(`Servidor rodando na porta ${PORT}`);
});