// Переменные состояния текущей сессии
let currentUserId = 'u1';
let activeTab = 'search';
let activeChatUserId = 'u2';
let searchQuery = '';

// Запуск при полной загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  renderUserSelectOptions();
  renderAll();
});

// Перерисовка всего UI
function renderAll() {
  renderSearch();
  renderChat();
  renderProfile();
  renderDbView();
  lucide.createIcons();
}

// 1. ПЕРЕКЛЮЧАТЕЛЬ ПОЛЬЗОВАТЕЛЯ
function renderUserSelectOptions() {
  const select = document.getElementById('user-select');
  select.innerHTML = db.users.map(user => `
    <option value="${user.id}" ${user.id === currentUserId ? 'selected' : ''}>
      ${user.nickname} (@${user.username})
    </option>
  `).join('');
}

function switchUser(newUserId) {
  currentUserId = newUserId;
  if (activeChatUserId === currentUserId) {
    const otherUser = db.users.find(u => u.id !== currentUserId);
    activeChatUserId = otherUser ? otherUser.id : '';
  }
  renderAll();
}

// 2. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
function setActiveTab(tabName) {
  activeTab = tabName;
  const tabs = ['search', 'chat', 'profile', 'db_view'];

  tabs.forEach(tab => {
    const btn = document.getElementById(`tab-btn-${tab}`);
    const container = document.getElementById(`tab-${tab}`);

    if (tab === tabName) {
      container.classList.remove('hidden');
      btn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow';
    } else {
      container.classList.add('hidden');
      btn.className = 'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all text-slate-600 hover:bg-slate-100';
    }
  });

  renderAll();
}

// 3. ПОДПИСКИ
function isFollowing(targetUserId) {
  return db.follows.some(f => f.followerId === currentUserId && f.followedId === targetUserId);
}

function toggleFollow(targetUserId) {
  const existingIndex = db.follows.findIndex(f => f.followerId === currentUserId && f.followedId === targetUserId);
  if (existingIndex !== -1) {
    db.follows.splice(existingIndex, 1);
  } else {
    db.follows.push({ followerId: currentUserId, followedId: targetUserId });
  }
  renderAll();
}

// 4. ПОИСК ПОЛЬЗОВАТЕЛЕЙ
function handleSearch(query) {
  searchQuery = query;
  renderSearch();
  lucide.createIcons();
}

function renderSearch() {
  const container = document.getElementById('search-results-list');
  const filteredUsers = db.users.filter(u => 
    u.id !== currentUserId && (
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (filteredUsers.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-400">Пользователи не найдены</div>`;
    return;
  }

  container.innerHTML = filteredUsers.map(user => {
    const following = isFollowing(user.id);
    return `
      <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all">
        <div class="flex items-center gap-3">
          <img src="${user.avatar}" alt="${user.nickname}" class="w-11 h-11 rounded-full object-cover border border-slate-200" />
          <div>
            <h4 class="font-bold text-sm text-slate-800">${user.nickname}</h4>
            <p class="text-xs text-slate-500">@${user.username}</p>
            <p class="text-[11px] text-slate-400 mt-0.5">${user.bio}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="openChatWith('${user.id}')"
            class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1"
          >
            <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Написать</span>
          </button>

          <button 
            onclick="toggleFollow('${user.id}')"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              following 
                ? 'bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-700' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }"
          >
            ${following 
              ? `<i data-lucide="user-check" class="w-3.5 h-3.5 text-emerald-600"></i><span>Вы подписаны</span>` 
              : `<i data-lucide="user-plus" class="w-3.5 h-3.5"></i><span>Подписаться</span>`
            }
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openChatWith(userId) {
  activeChatUserId = userId;
  setActiveTab('chat');
}

// 5. РЕНДЕР ЧАТА
function renderChat() {
  const contactsList = document.getElementById('chat-contacts-list');
  const otherUsers = db.users.filter(u => u.id !== currentUserId);

  contactsList.innerHTML = otherUsers.map(user => {
    const active = user.id === activeChatUserId;
    const following = isFollowing(user.id);
    return `
      <button
        onclick="selectChatUser('${user.id}')"
        class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
          active 
            ? 'bg-white shadow-sm border border-slate-200 font-semibold' 
            : 'hover:bg-slate-100 text-slate-600'
        }"
      >
        <img src="${user.avatar}" alt="${user.nickname}" class="w-9 h-9 rounded-full object-cover" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-xs truncate font-bold text-slate-800">${user.nickname}</h4>
            ${following ? '<span class="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Друг</span>' : ''}
          </div>
          <p class="text-[11px] text-slate-400 truncate">@${user.username}</p>
        </div>
      </button>
    `;
  }).join('');

  const activeUser = db.users.find(u => u.id === activeChatUserId);
  const headerContainer = document.getElementById('chat-header');

  if (activeUser) {
    headerContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${activeUser.avatar}" alt="${activeUser.nickname}" class="w-8 h-8 rounded-full object-cover" />
        <div>
          <h4 class="font-bold text-xs text-slate-800">${activeUser.nickname}</h4>
          <span class="text-[10px] text-slate-400">@${activeUser.username}</span>
        </div>
      </div>
    `;
  } else {
    headerContainer.innerHTML = `<span class="text-xs text-slate-400">Выберите собеседника</span>`;
  }

  const messagesContainer = document.getElementById('chat-messages-container');
  const currentChatMessages = db.messages.filter(
    m => (m.senderId === currentUserId && m.receiverId === activeChatUserId) ||
         (m.senderId === activeChatUserId && m.receiverId === currentUserId)
  );

  if (currentChatMessages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-10">
        <i data-lucide="message-square" class="w-8 h-8 mb-2 opacity-30"></i>
        Сообщений пока нет. Напишите первым!
      </div>
    `;
  } else {
    messagesContainer.innerHTML = currentChatMessages.map(msg => {
      const isMe = msg.senderId === currentUserId;
      return `
        <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-sm ${
            isMe 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
          }">
            <p class="leading-relaxed">${msg.text}</p>
            <div class="text-[9px] text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}">
              ${msg.timestamp}
            </div>
          </div>
        </div>
      `;
    }).join('');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

function selectChatUser(userId) {
  activeChatUserId = userId;
  renderChat();
  lucide.createIcons();
}

function sendMessage(event) {
  event.preventDefault();
  const input = document.getElementById('chat-message-input');
  const text = input.value.trim();

  if (!text || !activeChatUserId) return;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  db.messages.push({
    id: `m_${Date.now()}`,
    senderId: currentUserId,
    receiverId: activeChatUserId,
    text: text,
    timestamp: timeString
  });

  input.value = '';
  renderAll();
}

// 6. РЕНДЕР ПРОФИЛЯ
function renderProfile() {
  const currentUser = db.users.find(u => u.id === currentUserId) || db.users[0];

  document.getElementById('profile-user-info').innerHTML = `
    <img src="${currentUser.avatar}" alt="${currentUser.nickname}" class="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500" />
    <div>
      <h2 class="text-lg font-bold text-slate-900">${currentUser.nickname}</h2>
      <p class="text-xs text-slate-500">@${currentUser.username}</p>
      <p class="text-xs text-slate-600 mt-1">${currentUser.bio}</p>
    </div>
  `;

  document.getElementById('profile-username').innerText = `@${currentUser.username}`;
  document.getElementById('profile-nickname').innerText = currentUser.nickname;
  document.getElementById('profile-password').innerText = currentUser.password;

  const followsContainer = document.getElementById('profile-follows-list');
  const myFollows = db.follows.filter(f => f.followerId === currentUserId);

  if (myFollows.length === 0) {
    followsContainer.innerHTML = `<p class="text-xs text-slate-400">Вы пока ни на кого не подписаны.</p>`;
  } else {
    followsContainer.innerHTML = myFollows.map(f => {
      const u = db.users.find(user => user.id === f.followedId);
      if (!u) return '';
      return `
        <div class="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-medium">
          <img src="${u.avatar}" alt="${u.nickname}" class="w-5 h-5 rounded-full object-cover" />
          <span>${u.nickname}</span>
        </div>
      `;
    }).join('');
  }
}

// 7. ПРОСМОТР БАЗЫ ДАННЫХ
function renderDbView() {
  document.getElementById('db-json-preview').innerText = JSON.stringify(db, null, 2);
}
