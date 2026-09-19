// Объект локальной базы данных
window.db = {
  // 1. Таблица пользователей
  users: [
    { 
      id: 'u1', 
      username: 'alex_r', 
      nickname: 'Алекс Райдер', 
      password: 'password123', 
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 
      bio: 'Студент программист' 
    },
    { 
      id: 'u2', 
      username: 'maria_dev', 
      nickname: 'Мария Петрова', 
      password: 'secretpassword', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 
      bio: 'Дизайнер интерфейсов' 
    },
    { 
      id: 'u3', 
      username: 'dmitry_code', 
      nickname: 'Дмитрий Иванов', 
      password: 'mypassword', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 
      bio: 'Исследователь ИИ' 
    },
    { 
      id: 'u4', 
      username: 'elena_art', 
      nickname: 'Елена Сидорова', 
      password: 'qwerty12345', 
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 
      bio: 'Студентка архитектуры' 
    }
  ],

  // 2. Таблица связи подписок
  follows: [
    { followerId: 'u1', followedId: 'u2' }
  ],

  // 3. Таблица личных сообщений
  messages: [
    { id: 'm1', senderId: 'u2', receiverId: 'u1', text: 'Привет, Алекс! Подготовил конспект?', timestamp: '10:15' },
    { id: 'm2', senderId: 'u1', receiverId: 'u2', text: 'Да, привет! Сейчас отправлю в чат.', timestamp: '10:18' }
  ]
};
