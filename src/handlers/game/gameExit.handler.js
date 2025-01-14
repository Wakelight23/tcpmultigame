import { getGameSeesion, removeGameSession } from '../../session/game.session.js';
import { removeUser } from '../../session/user.session.js';

const gameExitHandler = ({ socket, userId }) => {
  console.log(`Processing exit for user: ${userId}`);

  // userSession에 있는 user 삭제
  const removedUser = removeUser(socket);
  if (removedUser) {
    console.log(`Removed user: ${removedUser.id}`);

    // gameSession에 user가 남아있는지 화인
    const gameSession = getGameSeesion(removedUser.gameId);
    if (gameSession) {
      gameSession.removeUser(removedUser.id);
      console.log(`Removed user ${removedUser.id} from game session ${gameSession.id}`);

      // 비어있는 gameSession은 삭제
      if (gameSession.users.length === 0) {
        console.log(`Game session ${gameSession.id} is empty. Deleting session.`);
        removeGameSession(gameSession.id);
      }
    }
  } else {
    console.warn('User not found in sessions.');
  }
};

export default gameExitHandler;
