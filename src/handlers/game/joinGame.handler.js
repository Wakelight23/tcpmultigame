import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getGameSeesion } from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';

const joinGameHandler = ({ socket, userId, payload }) => {
  try {
    const { gameId } = payload;
    const gameSession = getGameSeesion(gameId);

    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임세션을 찾을 수 없습니다.');
    }

    const user = getUserById(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    // 만약에 참가중인 유저가 한번 더 참가 요청을 보낼 수 있으므로
    // 이미 참가중인데 요청을 보냈을 때 처리
    const existUser = gameSession.getUser(user.id);
    if (!existUser) {
      gameSession.addUser(user);
    }

    const joinGameHandler = createResponse(
      HANDLER_IDS.JOIN_GAME,
      RESPONSE_SUCCESS_CODE,
      { gameId, message: '게임에 참가되었습니다.' },
      user.id,
    );

    socket.write(joinGameHandler);
  } catch (e) {
    handleError(socket, e);
  }
};

export default joinGameHandler;
