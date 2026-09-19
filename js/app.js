```javascript
/* =========================================
   GLOBAL STATE
========================================= */

let currentUser = null;
let selectedChatUser = null;


/* =========================================
   DOM ELEMENTS
========================================= */

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const userSearchInput = document.getElementById("user-search-input");
const userSearchButton = document.getElementById("user-search-button");

const messagesButton = document.getElementById("messages-button");
const profileButton = document.getElementById("profile-button");
const logoutButton = document.getElementById("logout-button");

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-message-button");

const conversationsContainer =
    document.getElementById("conversations");

const chatMessages =
    document.getElementById("chat-messages");

const chatHeader =
    document.getElementById("chat-header");

const loginModal =
    document.getElementById("login-modal");

const registerModal =
    document.getElementById("register-modal");

const editProfileModal =
    document.getElementById("edit-profile-modal");

const notification =
    document.getElementById("notification");

const notificationMessage =
    document.getElementById("notification-message");


/* =========================================
   API HELPER
========================================= */

/*
    All communication with the server
    will go through this function.

    Example:

    api("/api/users")

    api("/api/messages/u2", {
        method: "POST",
        body: {
            text: "Hello!"
        }
    })
*/

async function api(url, options = {}) {

    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };


    if (options.body !== undefined) {

        config.body = JSON.stringify(options.body);

    }


    const response = await fetch(url, config);


    let data = null;

    try {

        data = await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        const message =
            data?.message ||
            "Something went wrong.";

        throw new Error(message);

    }


    return data;
}


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove("active");

    });


    navItems.forEach(item => {

        item.classList.remove("active");

    });


    const page =
        document.getElementById(`${pageName}-page`);

    if (page) {

        page.classList.add("active");

    }


    const activeNav =
        document.querySelector(
            `.nav-item[data-page="${pageName}"]`
        );

    if (activeNav) {

        activeNav.classList.add("active");

    }


    if (pageName === "home") {

        loadHome();

    }


    if (pageName === "messages") {

        loadConversations();

    }


    if (pageName === "profile") {

        loadCurrentProfile();

    }

}


/* =========================================
   NAVIGATION EVENTS
========================================= */

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const page =
            item.dataset.page;

        showPage(page);

    });

});


/* =========================================
   HEADER BUTTONS
========================================= */

messagesButton.addEventListener("click", () => {

    showPage("messages");

});


profileButton.addEventListener("click", () => {

    showPage("profile");

});


logoutButton.addEventListener("click", logout);


/* =========================================
   LOGO
========================================= */

document
    .getElementById("logo")
    .addEventListener("click", event => {

        event.preventDefault();

        showPage("home");

    });


/* =========================================
   NOTIFICATION
========================================= */

let notificationTimer = null;


function showNotification(message) {

    notificationMessage.textContent = message;

    notification.classList.remove("hidden");


    clearTimeout(notificationTimer);


    notificationTimer = setTimeout(() => {

        notification.classList.add("hidden");

    }, 3000);

}


/* =========================================
   HOME
========================================= */

async function loadHome() {

    const feed =
        document.getElementById("home-feed");


    feed.innerHTML = `
        <div class="empty-state">
            <p>Loading...</p>
        </div>
    `;


    try {

        const data =
            await api("/api/posts/feed");


        if (!data.posts || data.posts.length === 0) {

            feed.innerHTML = `
                <div class="empty-state">
                    <h2>Your feed is empty</h2>
                    <p>
                        Follow some users to see their posts.
                    </p>
                </div>
            `;

            return;

        }


        feed.innerHTML = "";


        data.posts.forEach(post => {

            feed.appendChild(
                createPostElement(post)
            );

        });

    } catch (error) {

        feed.innerHTML = `
            <div class="empty-state">
                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
        `;

    }

}


/* =========================================
   CREATE POST ELEMENT
========================================= */

function createPostElement(post) {

    const article =
        document.createElement("article");


    article.className = "post-card";


    article.innerHTML = `
        <div class="post-header">

            <div class="user-card-avatar">
                ${getInitial(post.username)}
            </div>

            <div class="user-card-info">

                <h3>
                    ${escapeHTML(post.username)}
                </h3>

                <p>
                    ${formatDate(post.createdAt)}
                </p>

            </div>

        </div>

        <div class="post-content">

            <p>
                ${escapeHTML(post.text)}
            </p>

        </div>
    `;


    return article;

}


/* =========================================
   SEARCH
========================================= */

async function searchUsers(query) {

    query = query.trim();


    if (!query) {

        document.getElementById(
            "search-results"
        ).innerHTML = `
            <div class="empty-state">
                <p>
                    Enter a username.
                </p>
            </div>
        `;

        return;

    }


    const results =
        document.getElementById(
            "search-results"
        );


    results.innerHTML = `
        <div class="empty-state">
            <p>Searching...</p>
        </div>
    `;


    try {

        const data =
            await api(
                `/api/users/search?q=${encodeURIComponent(query)}`
            );


        results.innerHTML = "";


        if (!data.users || data.users.length === 0) {

            results.innerHTML = `
                <div class="empty-state">
                    <p>
                        No users found.
                    </p>
                </div>
            `;

            return;

        }


        data.users.forEach(user => {

            results.appendChild(
                createUserCard(user)
            );

        });

    } catch (error) {

        results.innerHTML = `
            <div class="empty-state">
                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
        `;

    }

}


/* =========================================
   SEARCH EVENTS
========================================= */

userSearchButton.addEventListener(
    "click",
    () => {

        searchUsers(
            userSearchInput.value
        );

    }
);


userSearchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchUsers(
                userSearchInput.value
            );

        }

    }
);


searchButton.addEventListener(
    "click",
    () => {

        const query =
            searchInput.value.trim();


        if (!query) {

            showPage("search");

            return;

        }


        userSearchInput.value = query;

        showPage("search");

        searchUsers(query);

    }
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchButton.click();

        }

    }
);


/* =========================================
   USER CARD
========================================= */

function createUserCard(user) {

    const card =
        document.createElement("div");


    card.className = "user-card";


    card.innerHTML = `
        <div class="user-card-avatar">
            ${getInitial(user.username)}
        </div>

        <div class="user-card-info">

            <h3>
                ${escapeHTML(user.username)}
            </h3>

            <p>
                ${user.followersCount ?? 0} followers
            </p>

        </div>

        <button
            type="button"
            class="view-user-button"
        >
            View
        </button>
    `;


    card
        .querySelector(".view-user-button")
        .addEventListener("click", () => {

            openUserProfile(user.id);

        });


    return card;

}


/* =========================================
   USER PROFILE
========================================= */

async function openUserProfile(userId) {

    showPage("user-profile");


    const username =
        document.getElementById(
            "user-profile-username"
        );

    username.textContent = "Loading...";


    try {

        const data =
            await api(
                `/api/users/${userId}`
            );


        const user = data.user;


        document.getElementById(
            "user-profile-avatar-letter"
        ).textContent =
            getInitial(user.username);


        document.getElementById(
            "user-profile-username"
        ).textContent =
            user.username;


        document.getElementById(
            "user-profile-email"
        ).textContent =
            user.email || "";


        document.getElementById(
            "user-followers-count"
        ).textContent =
            user.followersCount ?? 0;


        document.getElementById(
            "user-following-count"
        ).textContent =
            user.followingCount ?? 0;


        document.getElementById(
            "user-posts-count"
        ).textContent =
            user.postsCount ?? 0;


        const followButton =
            document.getElementById(
                "follow-button"
            );


        followButton.textContent =
            user.isFollowing
                ? "Unfollow"
                : "Follow";


        followButton.onclick =
            () => toggleFollow(
                user.id,
                user.isFollowing
            );


        document
            .getElementById("open-chat-button")
            .onclick =
            () => openChat(user);


    } catch (error) {

        showNotification(
            error.message
        );

        showPage("search");

    }

}


/* =========================================
   FOLLOW / UNFOLLOW
========================================= */

async function toggleFollow(
    userId,
    currentlyFollowing
) {

    try {

        if (currentlyFollowing) {

            await api(
                `/api/follows/${userId}`,
                {
                    method: "DELETE"
                }
            );

            showNotification(
                "Unfollowed."
            );

        } else {

            await api(
                `/api/follows/${userId}`,
                {
                    method: "POST"
                }
            );

            showNotification(
                "Following."
            );

        }


        await openUserProfile(userId);

    } catch (error) {

        showNotification(
            error.message
        );

    }

}


/* =========================================
   CURRENT PROFILE
========================================= */

async function loadCurrentProfile() {

    try {

        const data =
            await api("/api/auth/me");


        currentUser =
            data.user;


        renderProfile(
            currentUser
        );


    } catch (error) {

        showNotification(
            error.message
        );

    }

}


/* =========================================
   RENDER PROFILE
========================================= */

function renderProfile(user) {

    if (!user) {

        return;

    }


    document.getElementById(
        "profile-avatar-letter"
    ).textContent =
        getInitial(user.username);


    document.getElementById(
        "profile-username"
    ).textContent =
        user.username;


    document.getElementById(
        "profile-email"
    ).textContent =
        user.email;


    document.getElementById(
        "followers-count"
    ).textContent =
        user.followersCount ?? 0;


    document.getElementById(
        "following-count"
    ).textContent =
        user.followingCount ?? 0;


    document.getElementById(
        "posts-count"
    ).textContent =
        user.postsCount ?? 0;

}


/* =========================================
   MESSAGES
========================================= */

async function loadConversations() {

    conversationsContainer.innerHTML = `
        <div class="empty-state">
            <p>Loading...</p>
        </div>
    `;


    try {

        const data =
            await api(
                "/api/messages/conversations"
            );


        conversationsContainer.innerHTML = "";


        if (
            !data.conversations ||
            data.conversations.length === 0
        ) {

            conversationsContainer.innerHTML = `
                <div class="empty-state">
                    <p>
                        No conversations yet.
                    </p>
                </div>
            `;

            return;

        }


        data.conversations.forEach(
            conversation => {

                conversationsContainer.appendChild(
                    createConversationElement(
                        conversation
                    )
                );

            }
        );

    } catch (error) {

        conversationsContainer.innerHTML = `
            <div class="empty-state">
                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
        `;

    }

}


/* =========================================
   CONVERSATION ELEMENT
========================================= */

function createConversationElement(
    conversation
) {

    const button =
        document.createElement("button");


    button.type = "button";

    button.className = "conversation";


    button.innerHTML = `
        <div class="conversation-avatar">
            ${getInitial(
                conversation.user.username
            )}
        </div>

        <div class="conversation-info">

            <h4>
                ${escapeHTML(
                    conversation.user.username
                )}
            </h4>

            <p>
                ${escapeHTML(
                    conversation.lastMessage || ""
                )}
            </p>

        </div>
    `;


    button.addEventListener(
        "click",
        () => {

            openChat(
                conversation.user
            );

        }
    );


    return button;

}


/* =========================================
   OPEN CHAT
========================================= */

async function openChat(user) {

    selectedChatUser = user;


    showPage("messages");


    chatHeader.textContent =
        user.username;


    messageInput.disabled = false;

    sendMessageButton.disabled = false;


    await loadChatMessages(
        user.id
    );

}


/* =========================================
   LOAD CHAT MESSAGES
========================================= */

async function loadChatMessages(
    userId
) {

    chatMessages.innerHTML = `
        <div class="empty-state">
            <p>Loading...</p>
        </div>
    `;


    try {

        const data =
            await api(
                `/api/messages/${userId}`
            );


        chatMessages.innerHTML = "";


        if (
            !data.messages ||
            data.messages.length === 0
        ) {

            chatMessages.innerHTML = `
                <div class="empty-state">
                    <p>
                        No messages yet.
                    </p>
                </div>
            `;

            return;

        }


        data.messages.forEach(message => {

            renderMessage(message);

        });


        scrollChatToBottom();

    } catch (error) {

        chatMessages.innerHTML = `
            <div class="empty-state">
                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
        `;

    }

}


/* =========================================
   RENDER MESSAGE
========================================= */

function renderMessage(message) {

    const element =
        document.createElement("div");


    const sentByCurrentUser =
        currentUser &&
        message.senderId === currentUser.id;


    element.className =
        sentByCurrentUser
            ? "message sent"
            : "message received";


    element.innerHTML = `
        ${escapeHTML(message.text)}

        <span class="message-time">
            ${formatDate(message.createdAt)}
        </span>
    `;


    chatMessages.appendChild(
        element
    );

}


/* =========================================
   SEND MESSAGE
========================================= */

messageForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!selectedChatUser) {

            return;

        }


        const text =
            messageInput.value.trim();


        if (!text) {

            return;

        }


        sendMessageButton.disabled = true;


        try {

            const data =
                await api(
                    `/api/messages/${selectedChatUser.id}`,
                    {
                        method: "POST",

                        body: {
                            text
                        }
                    }
                );


            messageInput.value = "";


            if (data.message) {

                /*
                    Remove empty state
                    if this is the first message.
                */

                const emptyState =
                    chatMessages.querySelector(
                        ".empty-state"
                    );


                if (emptyState) {

                    emptyState.remove();

                }


                renderMessage(
                    data.message
                );

                scrollChatToBottom();

            }

        } catch (error) {

            showNotification(
                error.message
            );

        } finally {

            sendMessageButton.disabled = false;

            messageInput.focus();

        }

    }
);


/* =========================================
   SCROLL CHAT
========================================= */

function scrollChatToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================================
   LOGOUT
========================================= */

async function logout() {

    try {

        await api(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );


        currentUser = null;

        showNotification(
            "Logged out."
        );


        setTimeout(() => {

            location.reload();

        }, 500);


    } catch (error) {

        showNotification(
            error.message
        );

    }

}


/* =========================================
   AUTH CHECK
========================================= */

async function checkAuthentication() {

    try {

        const data =
            await api(
                "/api/auth/me"
            );


        currentUser =
            data.user;


        if (currentUser) {

            renderProfile(
                currentUser
            );

            showPage("home");

        }

    } catch {

        /*
            The backend isn't ready yet
            or the user isn't authenticated.

            We don't crash the application.
        */

        showPage("home");

    }

}


/* =========================================
   LOGIN
========================================= */

document
    .getElementById("login-form")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "login-email"
                ).value.trim();


            const password =
                document.getElementById(
                    "login-password"
                ).value;


            try {

                const data =
                    await api(
                        "/api/auth/login",
                        {
                            method: "POST",

                            body: {
                                email,
                                password
                            }
                        }
                    );


                currentUser =
                    data.user;


                closeModal(
                    loginModal
                );


                showNotification(
                    "Welcome back!"
                );


                renderProfile(
                    currentUser
                );


                showPage("home");


            } catch (error) {

                document.getElementById(
                    "login-message"
                ).textContent =
                    error.message;

            }

        }
    );


/* =========================================
   REGISTER
========================================= */

document
    .getElementById("register-form")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const username =
                document.getElementById(
                    "register-username"
                ).value.trim();


            const email =
                document.getElementById(
                    "register-email"
                ).value.trim();


            const password =
                document.getElementById(
                    "register-password"
                ).value;


            try {

                const data =
                    await api(
                        "/api/auth/register",
                        {
                            method: "POST",

                            body: {
                                username,
                                email,
                                password
                            }
                        }
                    );


                currentUser =
                    data.user;


                closeModal(
                    registerModal
                );


                showNotification(
                    "Account created!"
                );


                renderProfile(
                    currentUser
                );


                showPage("home");


            } catch (error) {

                document.getElementById(
                    "register-message"
                ).textContent =
                    error.message;

            }

        }
    );


/* =========================================
   MODALS
========================================= */

function openModal(modal) {

    modal.classList.remove("hidden");

}


function closeModal(modal) {

    modal.classList.add("hidden");

}


/* =========================================
   CLOSE BUTTONS
========================================= */

document
    .getElementById("login-close")
    .addEventListener(
        "click",
        () => closeModal(loginModal)
    );


document
    .getElementById("register-close")
    .addEventListener(
        "click",
        () => closeModal(registerModal)
    );


document
    .getElementById("edit-profile-close")
    .addEventListener(
        "click",
        () => closeModal(editProfileModal)
    );


/* =========================================
   CLOSE MODAL BY CLICKING OUTSIDE
========================================= */

[
    loginModal,
    registerModal,
    editProfileModal
].forEach(modal => {

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                closeModal(modal);

            }

        }
    );

});


/* =========================================
   EDIT PROFILE
========================================= */

document
    .getElementById("edit-profile-button")
    .addEventListener(
        "click",
        () => {

            if (!currentUser) {

                return;

            }


            document.getElementById(
                "edit-username"
            ).value =
                currentUser.username;


            document.getElementById(
                "edit-bio"
            ).value =
                currentUser.bio || "";


            openModal(
                editProfileModal
            );

        }
    );


document
    .getElementById("edit-profile-form")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const username =
                document.getElementById(
                    "edit-username"
                ).value.trim();


            const bio =
                document.getElementById(
                    "edit-bio"
                ).value.trim();


            try {

                const data =
                    await api(
                        "/api/users/me",
                        {
                            method: "PATCH",

                            body: {
                                username,
                                bio
                            }
                        }
                    );


                currentUser =
                    data.user;


                renderProfile(
                    currentUser
                );


                closeModal(
                    editProfileModal
                );


                showNotification(
                    "Profile updated."
                );


            } catch (error) {

                document.getElementById(
                    "edit-profile-message"
                ).textContent =
                    error.message;

            }

        }
    );


/* =========================================
   BACK FROM USER PROFILE
========================================= */

document
    .getElementById(
        "back-from-user-profile"
    )
    .addEventListener(
        "click",
        () => {

            showPage("search");

        }
    );


/* =========================================
   UTILITY FUNCTIONS
========================================= */

function getInitial(username) {

    if (!username) {

        return "?";

    }


    return username
        .charAt(0)
        .toUpperCase();

}


function formatDate(date) {

    if (!date) {

        return "";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "";

    }


    return parsedDate.toLocaleString();

}


function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================
   START APPLICATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAuthentication();

    }
);
```
