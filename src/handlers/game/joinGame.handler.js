import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import {
  addGameSession,
  getAvailableGameSession,
  getGameSession,
} from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';

const joinGameHandler = ({ socket, userId }) => {
  try {
    const user = getUserById(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    let gameSession = getAvailableGameSession();
    if (!gameSession) {
      // 사용 가능한 게임 세션이 없으면 새로운 세션 생성
      const newGameId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      gameSession = addGameSession(newGameId);
    }

    // 이미 참가중인 경우 처리
    const existUser = gameSession.getUser(user.id);
    if (!existUser) {
      gameSession.addUser(user);
    }

    const joinGameResponse = createResponse(
      HANDLER_IDS.JOIN_GAME,
      RESPONSE_SUCCESS_CODE,
      { gameId: gameSession.id, message: '게임에 참가되었습니다.' },
      user.id,
    );

    socket.write(joinGameResponse);
  } catch (e) {
    handleError(socket, e);
  }
};

export default joinGameHandler;
