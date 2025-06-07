import socket from './socket.js';
import { ui } from './ui.js';

const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.href = "index.html";
}

// Mantém o controle da conversa ativa (pode ser um usuário ou um grupo)
let currentChatTarget = null;

ui.updateUserInfo(user);

function startChat(target) {
    currentChatTarget = target;
    ui.activateChatWindow(target);

    const historyEventType = target.type === 'private' ? 'get_private_history' : 'get_group_history';
    socket.send(JSON.stringify({
        type: historyEventType,
        userId1: user.id, 
        userId2: target.id, 
        groupId: target.id 
    }));

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "register_client", user }));
    }
}

function handleAddUserToGroup(userToAdd) {
    if (!currentChatTarget || currentChatTarget.type !== 'group') return;

    console.log(`Adicionando usuário ${userToAdd.name} ao grupo ${currentChatTarget.name}`);

    socket.send(JSON.stringify({
        type: 'add_user_to_group',
        userId: userToAdd.id,
        groupId: currentChatTarget.id,
        groupName: currentChatTarget.name 
    }));
    alert(`${userToAdd.name} foi adicionado ao grupo.`);
}



socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'user_list':
            ui.updateUserList(data.users, user, currentChatTarget, (chatUser) => {
                startChat({ id: chatUser.id, name: chatUser.name, type: 'private' });
            }, handleAddUserToGroup);
            break;

        case 'user_groups_list':
            ui.updateGroupList(data.groups, (group) => {
                startChat({ id: group.id, name: group.name, type: 'group' });
            });
            break;

        case 'new_group_created':
            ui.addGroupToList(data.group, (group) => {
                startChat({ id: group.id, name: group.name, type: 'group' });
            });
            break;

        case 'added_to_group':
            ui.addGroupToList(data.group, (group) => {
                startChat({ id: group.id, name: group.name, type: 'group' });
            });
            alert(`Você foi adicionado ao grupo: ${data.group.name}`);
            break;

        case 'private_message':
            if (currentChatTarget && currentChatTarget.type === 'private' && data.from === currentChatTarget.id) {
                ui.displayMessage(data);
            }
            break;

        case 'group_message':
            if (currentChatTarget && currentChatTarget.type === 'group' && data.groupId === currentChatTarget.id) {
                ui.displayMessage(data);
            }
            break;

        case 'private_history':
        case 'group_history':
            ui.chatMessages.innerHTML = '';
            data.history.forEach(msg => ui.displayMessage(msg));
            break;
    }
});

document.getElementById("sendChat").addEventListener("click", () => {
    const msg = ui.chatInput.value.trim();
    if (msg && currentChatTarget) {
        const messageType = currentChatTarget.type === 'private' ? 'private_message' : 'group_message';
        socket.send(JSON.stringify({
            type: messageType,
            from: user.id,
            to: currentChatTarget.id, 
            groupId: currentChatTarget.id, 
            msg: msg
        }));
        ui.displayMessage({ fromName: "Você", message: msg });
        ui.chatInput.value = "";
    }
});

const groupNameInput = document.getElementById("groupNameInput");

document.getElementById("showGroupModalButton").addEventListener("click", () => ui.toggleModal(true));
ui.closeModalButton.addEventListener("click", () => ui.toggleModal(false));
window.addEventListener("click", (event) => {
    if (event.target == ui.modalGrupo) {
        ui.toggleModal(false);
    }
});

document.getElementById("createGroupButton").addEventListener("click", () => {
    const groupName = groupNameInput.value.trim();
    if (groupName) {
        socket.send(JSON.stringify({
            type: 'create_group',
            groupName: groupName,
            userId: user.id
        }));
        groupNameInput.value = "";
        ui.toggleModal(false);
    }
});