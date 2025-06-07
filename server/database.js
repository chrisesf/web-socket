const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("chat.db");

const initDb = () => {
    db.serialize(() => {
        // Tabela de Usuários
        db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        icon TEXT NOT NULL
      )
    `);
        // Tabela de Mensagens Privadas
        db.run(`
      CREATE TABLE IF NOT EXISTS private_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `);
        // Tabela de Grupos
        db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        creator_id INTEGER,
        FOREIGN KEY (creator_id) REFERENCES users(id)
      )
    `);
        // Tabela de Membros de Grupos
        db.run(`
      CREATE TABLE IF NOT EXISTS group_members (
        group_id INTEGER,
        user_id INTEGER,
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        // Tabela de Mensagens de Grupos
        db.run(`
      CREATE TABLE IF NOT EXISTS group_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id INTEGER,
          sender_id INTEGER,
          message TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    });
    console.log("Database initialized with all tables.");
};

const registerUser = (username, password, icon) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (username, password, icon) VALUES (?, ?, ?)`;
        db.run(sql, [username, password, icon], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID });
        });
    });
};

const loginUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
        db.get(sql, [username, password], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const savePrivateMessage = (senderId, receiverId, message) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO private_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`;
        db.run(sql, [senderId, receiverId, message], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID });
        });
    });
};

const getPrivateHistory = (userId1, userId2) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT m.id, m.message, m.timestamp, u.username as fromName FROM private_messages m
            JOIN users u ON u.id = m.sender_id
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        `;
        db.all(sql, [userId1, userId2, userId2, userId1], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const createGroup = (name, creatorId) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO groups (name, creator_id) VALUES (?, ?)`;
        db.run(sql, [name, creatorId], function (err) {
            if (err) return reject(err);
            const groupId = this.lastID;
            const sqlMember = `INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`;
            db.run(sqlMember, [groupId, creatorId], (err) => {
                if (err) return reject(err);
                resolve({ id: groupId, name });
            });
        });
    });
};

const getGroupsForUser = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT g.id, g.name FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
    `;
        db.all(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const saveGroupMessage = (groupId, senderId, message) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO group_messages (group_id, sender_id, message) VALUES (?, ?, ?)`;
        db.run(sql, [groupId, senderId, message], function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID });
        });
    });
};

const getGroupHistory = (groupId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT m.id, m.message, m.timestamp, u.username as fromName FROM group_messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.group_id = ?
            ORDER BY timestamp ASC
        `;
        db.all(sql, [groupId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const getGroupMembers = (groupId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT user_id FROM group_members WHERE group_id = ?`;
        db.all(sql, [groupId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows.map(row => row.user_id));
        });
    });
};

const addUserToGroup = (userId, groupId) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO group_members (user_id, group_id) VALUES (?, ?)`;
        db.run(sql, [userId, groupId], function (err) {
            if (err && err.code === 'SQLITE_CONSTRAINT') {
                console.log(`User ${userId} is already in group ${groupId}.`);
                return resolve({ alreadyExists: true });
            }
            if (err) return reject(err);
            console.log(`User ${userId} added to group ${groupId}.`);
            resolve({ success: true });
        });
    });
};

module.exports = {
    initDb,
    registerUser,
    loginUser,
    savePrivateMessage,
    getPrivateHistory,
    createGroup,
    getGroupsForUser,
    saveGroupMessage,
    getGroupHistory,
    getGroupMembers,
    getGroupMembers,
    addUserToGroup
};