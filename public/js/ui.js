export const ui = {
    chatBox: document.getElementById("chatBox"),
    chatWith: document.getElementById("chatWith"),
    chatMessages: document.getElementById("chatMessages"),
    chatInput: document.getElementById("chatInput"),
    listaUsuariosDiv: document.getElementById("listaUsuarios"),
    gruposLista: document.getElementById("gruposLista"),
    modalGrupo: document.getElementById("modalGrupo"),
    closeModalButton: document.querySelector(".close-button"),

    // Inicializa a interface do usuário
    updateUserInfo(user) {
        const userInfoDiv = document.getElementById("usuario-info");
        userInfoDiv.innerHTML = `
            <img src="${user.icon}" alt="user icon" />
            <span>${user.username}</span>
        `;
    },

    // Atualiza a lista de usuários
    updateUserList(users, currentUser, currentChatTarget, onUserClick, onAddUserClick) {
        this.listaUsuariosDiv.innerHTML = "";
        users.forEach(user => {
            if (user.id === currentUser.id) return;

            const userDiv = document.createElement("div");
            userDiv.className = "usuario";
            userDiv.innerHTML = `<img src="${user.icon}" alt="user icon" /> <span>${user.name}</span>`;

            if (currentChatTarget && currentChatTarget.type === 'group') {
                const addButton = document.createElement("button");
                addButton.textContent = "+";
                addButton.className = "small-button add-user-button";
                addButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    onAddUserClick(user);
                });
                userDiv.appendChild(addButton);
            }

            userDiv.addEventListener("click", () => onUserClick(user));
            this.listaUsuariosDiv.appendChild(userDiv);
        });
    },
    // Atualiza a lista de grupos
    updateGroupList(groups, onGroupClick) {
        this.gruposLista.innerHTML = "";
        groups.forEach(group => {
            this.addGroupToList(group, onGroupClick);
        });
    },
    // Adiciona um grupo à lista de grupos
    addGroupToList(group, onGroupClick) {
        const li = document.createElement("li");
        li.textContent = group.name;
        li.dataset.groupId = group.id;
        li.addEventListener("click", () => onGroupClick(group));
        this.gruposLista.appendChild(li);
    },
    //Ativa e configura a janela de chat para um alvo específico (usuário ou grupo)
    activateChatWindow(target) {
        this.chatBox.style.display = "flex";
        this.chatWith.textContent = `Chat com ${target.name}`;
        this.chatInput.dataset.to = target.id;
        this.chatInput.dataset.type = target.type; // 'private' or 'group'
        this.chatMessages.innerHTML = "";
    },
    //Abre o modal
    toggleModal(show) {
        this.modalGrupo.style.display = show ? "block" : "none";
    },

    //Exibe nova mensagem do chat
    displayMessage(message) {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${message.fromName}:</strong> ${message.message}`;
        this.chatMessages.appendChild(p);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },
};