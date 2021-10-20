import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import LogoImage from '../../assets/logo.svg';
import { api } from '../../services/api';
import io from 'socket.io-client';

type User = {
  avatar_url: string;
  github_id: number;
  id: string;
  login: string;
  name: string;
};

type Message = {
  createdAt: string;
  id: string;
  text: string;
  user: User;
  user_id: string;
};

const messagesQueue: Message[] = [];

const socket = io('http://localhost:3333');

socket.on('new_message', (newMessage: Message) => {
  console.log(newMessage);
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(prevState =>
          [messagesQueue[0], prevState[0], prevState[1]].filter(Boolean)
        );

        messagesQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get<Message[]>('/messages/last3').then(response => {
      setMessages(response.data);
    });
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={LogoImage} alt='DoWhile 2021' />

      <ul className={styles.messageList}>
        {messages.map(message => (
          <li key={message.id || message.createdAt} className={styles.message}>
            <p className={styles.messageContent}>{message.text}</p>
            <div className={styles.messageUser}>
              <div className={styles.userImage}>
                <img src={message.user.avatar_url} alt={message.user.name} />
              </div>
              <span>{message.user.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
