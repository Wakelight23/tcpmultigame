import User from '../classes/models/user.class.js';
import { findUserByDeviceId } from '../db/user/user.db.js';
import { getGameSession, removeGameSession } from './game.session.js';
import { userSessions } from './sessions.js';

export const addUser = (socket, uuid) => {
  const user = new User(uuid, socket);
  userSessions.push(user);
  return user;
};

export const removeUser = (socket) => {
  const index = userSessions.findIndex((user) => user.socket === socket);
  if (index !== -1) {
    return userSessions.splice(index, 1)[0];
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

export const getUserById = async (deviceId) => {
  try {
    // 1. deviceId로 DB에서 실제 userId 조회
    const dbUser = await findUserByDeviceId(deviceId);
    if (!dbUser) {
      console.error(`DB에서 유저를 찾을 수 없습니다: Device ID = ${deviceId}`);
      return null;
    }

    // 2. 실제 userId로 세션에서 유저 찾기
    const user = userSessions.find((user) => user.id === dbUser.id);
    if (!user) {
      console.error(`세션에서 유저를 찾을 수 없습니다: User ID = ${dbUser.id}`);
      return null;
    }

    return user;
  } catch (error) {
    console.error(`유저 조회 중 오류 발생: ${error.message}`);
    return null;
  }
};

export const getUserBySocket = (socket) => {
  const user = userSessions.find((user) => user.socket === socket);
  console.log(`user : ${user.socket}`);
  if (!user) {
    console.error('유저를 찾을 수 없습니다: 소켓 정보 기반');
  }
  return user;
};
