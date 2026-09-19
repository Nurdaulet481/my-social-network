// 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let currentUserId = 'u1';
let activeTab = 'search';
let activeChatUserId = 'u2';
let searchQuery = '';

// 2. СТАРТ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', () => {
  // Гарантируем, что БД определена
  if (!window.db) {
    console.error('Ошибка: Файл js/db.js не загрузился!');
    return;
  }
  
  initUserSelect();
  renderApp();
});

// 3. ВСПОМОГАТЕЛЬНЫЕ И ОСНОВНЫЕ ФУНКЦИИ
function initUserSelect() {
  const select = document.getElementById('user-select');
  if (!select) return;
  
  select.innerHTML = window.db.users.map(u => 
    `<option value="${u.id}" ${u.id === currentUserId ? 'selected' : ''}>${u.nickname} (@${u.username})</option>`
  ).join('');
}

function switchUser(userId) {
  currentUserId = userId;
  if (activeChatUserId === currentUserId) {
    const otherUser = window.db.users.find(u => u.id !== currentUserId);
    activeChatUserId = otherUser ? otherUser.id : '';
  }
  renderApp();
}

function setActiveTab(tabName) {
  activeTab = tabName;
  ['search', 'chat', 'profile', 'db_view'].forEach(tab => {
    const section = document.getElementById(`tab-${tab}`);
    const btn = document.getElementById(`tab-btn-${tab}`);
    
    if (section) {
      if (tab === tabName) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    }
    
    if (btn) {
      if (tab === tabName) {
        btn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow';
      } else {
        btn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-slate-100';
      }
    }
  });
  
  renderApp();
}

function handleSearch(query) {
  searchQuery = query;
  renderSearch();
}

function toggleFollow(targetUserId) {
  const index = window.db.follows.findIndex(f => f.followerId === currentUserId && f.followedId === targetUserId);
  if (index !== -1) {
    window.db.follows.splice(index, 1);
  } else {
    window.db.follows.push({ followerId: currentUserId, followedId: targetUserId });
  }
  renderApp();
}

function sendMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chat-message-input');
  if (!input) return;
  
  const text = input.value.trim();
  if (!text || !activeChatUserId) return;

  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  window.db.messages.push({
    id: 'm_' + Date.now(),
    senderId: currentUserId,
    receiverId: activeChatUserId,
    text: text,
    timestamp: timeStr
  });

  input.value = '';
  renderChat();
  renderDbView();
}

function openChatWith(userId) {
  activeChatUserId = userId;
  setActiveTab('chat');
}

// 4. ФУНКЦИИ ОТРИСОВКИ ИНТЕРФЕЙСА
function renderApp() {
  renderSearch();
  renderChat();
  renderProfile();
  renderDbView();
}

function renderSearch() {
  const container = document.getElementById('search-results-list');
  if (!container) return;

  const filtered = window.db.users.filter(u => 
    u.id !== currentUserId && 
    (u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-400">Пользователи не найдены</div>`;
    return;
  }

  container.innerHTML = filtered.map(u => {
    const isFollowing = window.db.follows.some(f => f.followerId === currentUserId && f.followedId === u.id);
    return `
      <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all">
        <div class="flex items-center gap-3">
          <img src="${u.avatar}" class="w-11 h-11 rounded-full object-cover border border-slate-200" />
          <div>
            <h4 class="font-bold text-sm text-slate-800">${u.nickname}</h4>
            <p class="text-xs text-slate-500">@${u.username}</p>
            <p class="text-[11px] text-slate-400 mt-0.5">${u.bio}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openChatWith('${u.id}')" class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700">
            Написать
          </button>
          <button onclick="toggleFollow('${u.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isFollowing ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'}">
            ${isFollowing ? 'Вы подписаны' : 'Подписаться'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderChat() {
  const contactsContainer = document.getElementById('chat-contacts-list');
  const headerContainer = document.getElementById('chat-header');
  const messagesContainer = document.getElementById('chat-messages-container');

  if (contactsContainer) {
    const otherUsers = window.db.users.filter(u => u.id !== currentUserId);
    contactsContainer.innerHTML = otherUsers.map(u => {
      const isActive = u.id === activeChatUserId;
      const isFollowing = window.db.follows.some(f => f.followerId === currentUserId && f.followedId === u.id);
      return `
        <button onclick="openChatWith('${u.id}')" class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${isActive ? 'bg-white shadow-sm border border-slate-200 font-semibold' : 'hover:bg-slate-100 text-slate-600'}">
          <img src="${u.avatar}" class="w-9 h-9 rounded-full object-cover" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="text-xs truncate font-bold text-slate-800">${u.nickname}</h4>
              ${isFollowing ? `<span class="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Друг</span>` : ''}
            </div>
            <p class="text-[11px] text-slate-400 truncate">@${u.username}</p>
          </div>
        </button>
      `;
    }).join('');
  }

  const activeUser = window.db.users.find(u => u.id === activeChatUserId);
  if (headerContainer) {
    if (activeUser) {
      headerContainer.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${activeUser.avatar}" class="w-8 h-8 rounded-full object-cover" />
          <div>
            <h4 class="font-bold text-xs text-slate-800">${activeUser.nickname}</h4>
            <span class="text-[10px] text-slate-400">@${activeUser.username}</span>
          </div>
        </div>
      `;
    } else {
      headerContainer.innerHTML = `<span class="text-xs text-slate-400">Выберите собеседника</span>`;
    }
  }

  if (messagesContainer) {
    if (!activeChatUserId) {
      messagesContainer.innerHTML = `<div class="h-full flex items-center justify-center text-slate-400 text-xs">Выберите чат слева</div>`;
      return;
    }

    const chatMsgs = window.db.messages.filter(m => 
      (m.senderId === currentUserId && m.receiverId === activeChatUserId) ||
      (m.senderId === activeChatUserId && m.receiverId === currentUserId)
    );

    if (chatMsgs.length === 0) {
      messagesContainer.innerHTML = `<div class="h-full flex items-center justify-center text-slate-400 text-xs py-10">Сообщений пока нет. Напишите первым!</div>`;
    } else {
      messagesContainer.innerHTML = chatMsgs.map(m => {
        const isMe = m.senderId === currentUserId;
        return `
          <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}">
              <p class="leading-relaxed">${m.text}</p>
              <div class="text-[9px] text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}">${m.timestamp}</div>
            </div>
          </div>
        `;
      }).join('');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

function renderProfile() {
  const currentUser = window.db.users.find(u => u.id === currentUserId);
  if (!currentUser) return;

  const userInfo = document.getElementById('profile-user-info');
  const usernameEl = document.getElementById('profile-username');
  const nicknameEl = document.getElementById('profile-nickname');
  const passwordEl = document.getElementById('profile-password');
  const followsList = document.getElementById('profile-follows-list');

  if (userInfo) {
    userInfo.innerHTML = `
      <img src="${currentUser.avatar}" class="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500" />
      <div>
        <h2 class="text-lg font-bold text-slate-900">${currentUser.nickname}</h2>
        <p class="text-xs text-slate-500">@${currentUser.username}</p>
        <p class="text-xs text-slate-600 mt-1">${currentUser.bio}</p>
      </div>
    `;
  }

  if (usernameEl) usernameEl.textContent = currentUser.username;
  if (nicknameEl) nicknameEl.textContent = currentUser.nickname;
  if (passwordEl) passwordEl.textContent = currentUser.password;

  if (followsList) {
    const myFollows = window.db.follows.filter(f => f.followerId === currentUserId);
    if (myFollows.length === 0) {
      followsList.innerHTML = `<p class="text-xs text-slate-400">Вы пока ни на кого не подписаны.</p>`;
    } else {
      followsList.innerHTML = myFollows.map(f => {
        const target = window.db.users.find(u => u.id === f.followedId);
        if (!target) return '';
        return `
          <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-medium">
            <img src="${target.avatar}" class="w-5 h-5 rounded-full object-cover" />
            <span>${target.nickname}</span>
          </div>
        `;
      }).join('');
    }
  }
}

function renderDbView() {
  const preview = document.getElementById('db-json-preview');
  if (preview) {
    preview.textContent = JSON.stringify(window.db, null, 2);
  }
}
