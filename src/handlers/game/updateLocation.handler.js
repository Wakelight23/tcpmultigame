import { getGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import User from '../../classes/models/user.class.js';
import { getUserById } from '../../session/user.session.js';

const updateLocationHandler = async ({ socket, userId, payload }) => {
  // console.log('updateLocationHandler에는 들어옴');
  try {
    const { gameId, x, y } = payload;

    // 유저 먼저 찾기
    const user = await getUserById(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    const gameSession = getGameSession(gameId);
    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임세션을 찾을 수 없습니다.');
    }
    // console.log('user : ', user);
    user.updatePosition(x, y);
    // console.log('user.updatePosition(x, y) : ', user.updatePosition(x, y));
    const packet = gameSession.getAllLocation();

    socket.write(packet);
  } catch (e) {
    handleError(socket, e);
  }
};

export default updateLocationHandler;
