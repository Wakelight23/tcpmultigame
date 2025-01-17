import Game from '../classes/models/game.class.js';
import { gameSessions } from './sessions.js';

export const addGameSession = (id) => {
  const session = new Game(id);
  gameSessions.push(session);
  return session;
};

export const removeGameSession = (id) => {
  const index = gameSessions.findIndex((game) => game.id === id);

  // 게임이 종료되면 해당 게임 세션을 삭제
  // 1 이상이면 아직 게임이 진행중이다
  if (index !== -1) {
    return gameSessions.splice(index, 1)[0];
  }
};

export const getGameSession = (id) => {
  return gameSessions.find((game) => game.id === id);
};

export const getAllGameSession = () => {
  return gameSessions;
};

// 대기 중인 게임 세션 가져오기
export const getAvailableGameSession = () => {
  return gameSessions.find((session) => session.state === 'waiting');
};

