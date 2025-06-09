const express = require("express");
const router = express.Router();
const db = require("./database");

router.post("/register", async (req, res) => {
    const { username, password, icon } = req.body;
    if (!username || !password || !icon) {
        return res.status(400).json({ error: "Preencha todos os campos." });
    }

    try {
        await db.registerUser(username, password, icon);
        res.status(201).json({ message: "Usuário registrado com sucesso!" });
    } catch (err) {
        console.error("Erro de registro:", err);
        res.status(500).json({ error: "Usuário já utilizado." });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Preencha todos os campos." });
    }

    try {
        const user = await db.loginUser(username, password);
        if (!user) {
            return res.status(401).json({ error: "Dados Inválidos" });
        }
        res.status(200).json({ id: user.id, username: user.username, icon: user.icon });
    } catch (err) {
        console.error("Erro de login:", err);
        res.status(500).json({ error: "Erro na autenticação do usuário" });
    }
});

module.exports = router;