import { getGameSession, removeGameSession } from '../session/game.session.js';
import { getUserBySocket, removeUser } from '../session/user.session.js';

export const onEnd = (socket) => () => {
  console.log(`클라이언트 연결이 종료되었습니다.`);

  try {
    // 1. 소켓으로 유저 찾기
    const user = getUserBySocket(socket);
    if (user) {
      // 2. 유저가 속한 게임 세션 찾기
      const gameSession = getGameSession(user.gameId);
      if (gameSession) {
        // 3. 게임 세션에서 유저 제거
        gameSession.removeUser(user.id);

        // 4. 게임 세션이 비어있다면 세션 제거
        if (gameSession.users.length === 0) {
          removeGameSession(gameSession.id);
        }
      }

      // 5. 유저 세션에서 유저 제거
      removeUser(socket);
    }
  } catch (error) {
    console.error('게임 종료 처리 중 오류 발생:', error);
  }
};
