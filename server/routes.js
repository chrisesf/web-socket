const express = require("express");
const router = express.Router();
const db = require("./database");

router.post("/register", async (req, res) => {
    const { username, password, icon } = req.body;
    if (!username || !password || !icon) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        await db.registerUser(username, password, icon);
        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: "Username might already be taken." });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const user = await db.loginUser(username, password);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        res.status(200).json({ id: user.id, username: user.username, icon: user.icon });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Error authenticating user." });
    }
});

module.exports = router;