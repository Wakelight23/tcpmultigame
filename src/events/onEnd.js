import { removeGameSession } from '../session/game.session.js';
import { gameSessions, userSessions } from '../session/sessions.js';
import { removeUser } from '../session/user.session.js';

export const onEnd = (socket) => () => {
  console.log(`클라이언트 연결이 종료되었습니다.`);

  console.log(userSessions);
  console.log(gameSessions);

  removeUser(socket);
  removeGameSession(socket);
};
