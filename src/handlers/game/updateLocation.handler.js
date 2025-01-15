import { getGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import User from '../../classes/models/user.class.js';

const updateLocationHandler = ({ socket, userId, payload }) => {
  console.log('updateLocationHandler에는 들어왔나?');
  try {
    const { gameId, x, y } = payload;
    const gameSession = getGameSession(gameId);

    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임세션을 찾을 수 없습니다.');
    }

    console.log('updateLocationHandler의 gameSession : ', gameSession);
    console.log('User ID:', userId);
    console.log('Game Session Users:', gameSession.users);
    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    user.updatePosition(x, y);
    const packet = gameSession.getAllLocation();

    socket.write(packet);
  } catch (e) {
    handleError(socket, e);
  }
};

export default updateLocationHandler;
