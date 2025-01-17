import { getGameSession, removeGameSession } from '../../session/game.session.js';
import { getUserBySocket, removeUser } from '../../session/user.session.js';

const gameExitHandler = ({ socket, userId }) => {
  console.log(`Processing exit for user: ${userId}`);
  try {
    const user = getUserBySocket(socket);
    if (!user) {
      console.warn(`User with socket for ${userId} not found in sessions.`);
      return;
    }

    const gameId = user.gameId;
    if (!gameId) {
      console.warn(`${userId} 가 게임 세션에 존재하지 않습니다.`);
      return;
    }

    const gameSession = getGameSession(gameId);
    if (!gameSession) {
      console.warn(`Game session ${gameId} for user ${userId} not found.`);
      return;
    }

    gameSession.removeUser(userId);
    console.log(`Removed user ${userId} from game session ${gameId}`);

    const removedUser = removeUser(socket);
    if (removedUser) {
      console.log(`Removed user from userSessions: ${removedUser.id}`);
    }

    if (gameSession.users.length === 0) {
      console.log(`Game session ${gameId} is empty. Deleting session.`);
      removeGameSession(gameId);
    }
  } catch (error) {
    console.error(`Error processing exit for user ${userId}:`, error);
  }
};

export default gameExitHandler;
