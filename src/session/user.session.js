import User from '../classes/models/user.class.js';
import { getGameSeesion, removeGameSession } from './game.session.js';
import { userSessions } from './sessions.js';

export const addUser = (socket, uuid) => {
  console.log(`Adding user with ID: ${uuid}`);
  const user = new User(uuid, socket);
  userSessions.push(user);
  console.log(
    'Current user sessions:',
    userSessions.map((u) => u.id),
  );
  return user;
};

export const removeUser = (socket) => {
  const index = userSessions.findIndex((user) => user.socket === socket);
  let removedUser = null;

  if (index !== -1) {
    removedUser = userSessions.splice(index, 1)[0];
    console.log(`Removed user from userSessions: ${removedUser.id}`);
  } else {
    console.warn('User not found in userSessions.');
  }

  // 관련된 gameSession에서 유저 제거
  if (removedUser && removedUser.gameId) {
    const gameSession = getGameSeesion(removedUser.gameId);
    if (gameSession) {
      gameSession.removeUser(removedUser.id);
      console.log(`Removed user ${removedUser.id} from game session ${gameSession.id}`);

      // 게임 세션이 비어 있으면 삭제
      if (gameSession.users.length === 0) {
        console.log(`Game session ${gameSession.id} is empty. Deleting session.`);
        removeGameSession(gameSession.id);
      }
    }
  }
};

export const getNextSequence = (id) => {
  const user = getUserById(id);
  if (user) {
    return user.getNextSequence();
  }
  // 후에 에러처리 필요함
  return null;
};

export const getUserById = (id) => {
  const user = userSessions.find((user) => user.id === id);
  if (!user) {
    console.error(`유저를 찾을 수 없습니다: User ID = ${id}`);
  }
  return user;
};

export const getUserBySocket = (socket) => {
  const user = userSessions.find((user) => user.socket === socket);
  console.log(`user : ${user}`);
  if (!user) {
    console.error('유저를 찾을 수 없습니다: 소켓 정보 기반');
  }
  return user;
};
