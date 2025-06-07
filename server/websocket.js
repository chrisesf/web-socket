const WebSocket = require("ws");
const db = require("./database");

const clients = new Map();

const initializeWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log("Client connected");

        ws.on("message", async (message) => {
            try {
            const data = JSON.parse(message);

            switch (data.type) {
                case "register_client": {
                const user = data.user;
                clients.set(user.id, { ws, name: user.username, icon: user.icon });
                console.log(`Client registered: ${user.username} (${user.id})`);
                broadcastUserList(wss);
                const groups = await db.getGroupsForUser(user.id);
                ws.send(JSON.stringify({ type: "user_groups_list", groups }));
                break;
                }

                case "private_message": {
                const { to, from, msg } = data;
                const senderInfo = clients.get(from);
                const recipient = clients.get(to);

                if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
                    recipient.ws.send(JSON.stringify({
                    type: "private_message", from, fromName: senderInfo.name, message: msg
                    }));
                }
                await db.savePrivateMessage(from, to, msg);
                break;
                }

                case "get_private_history": {
                const privateHistory = await db.getPrivateHistory(data.userId1, data.userId2);
                ws.send(JSON.stringify({ type: "private_history", history: privateHistory }));
                break;
                }

                case 'create_group': {
                const newGroup = await db.createGroup(data.groupName, data.userId);
                ws.send(JSON.stringify({ type: 'new_group_created', group: newGroup }));
                break;
                }

                case 'group_message': {
                const { groupId, from: groupFrom, msg: groupMsg } = data;
                const groupSender = clients.get(groupFrom);

                await db.saveGroupMessage(groupId, groupFrom, groupMsg);
                const members = await db.getGroupMembers(groupId);

                members.forEach(memberId => {
                    if (memberId !== groupFrom) {
                    const memberClient = clients.get(memberId);
                    if (memberClient && memberClient.ws.readyState === WebSocket.OPEN) {
                        memberClient.ws.send(JSON.stringify({
                        type: 'group_message', groupId, from: groupFrom, fromName: groupSender.name, message: groupMsg
                        }));
                    }
                    }
                });
                break;
                }

                case 'get_group_history': { 
                const groupHistory = await db.getGroupHistory(data.groupId);
                ws.send(JSON.stringify({ type: "group_history", history: groupHistory, groupId: data.groupId }));
                break;
                }

                case 'add_user_to_group': {
                const { userId, groupId, groupName } = data;
                await db.addUserToGroup(userId, groupId);

                const clientToAdd = clients.get(userId);
                if (clientToAdd && clientToAdd.ws.readyState === WebSocket.OPEN) {
                    console.log(`Notifying user ${userId} that they were added to group '${groupName}'`);
                    clientToAdd.ws.send(JSON.stringify({
                    type: 'added_to_group',
                    group: {
                        id: groupId,
                        name: groupName
                    }
                    }));
                }
                break;
                }
            }
            } catch (err) {
            console.error("Failed to process message:", err);
            }
        });

        ws.on("close", () => {
            for (const [id, client] of clients.entries()) {
                if (client.ws === ws) {
                    console.log(`Cliente ${client.name} (ID: ${id}) desconectou.`);

                    clients.delete(id);

                    broadcastUserList(wss);
                    break;
                }
            }
        });
      
    });
};

function broadcastUserList(wss) {
    const userList = Array.from(clients.values()).map(client => ({
        id: [...clients.entries()].find(([id, c]) => c === client)[0],
        name: client.name,
        icon: client.icon
    }));

    const message = JSON.stringify({ type: "user_list", users: userList });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

module.exports = { initializeWebSocket };