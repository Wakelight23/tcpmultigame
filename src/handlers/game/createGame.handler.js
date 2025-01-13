import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../../utils/error/errorHandler.js';
import { addGameSession } from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/customError.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const createGameHandler = ({ socket, userId, payload }) => {
  try {
    const gameId = uuidv4();
    const gameSeesion = addGameSession(gameId);

    const user = getUserById(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }
    gameSeesion.addUser(user);

    const createGameResponse = createResponse(
      HANDLER_IDS.CREATE_GAME,
      RESPONSE_SUCCESS_CODE,
      { gameId, messge: '게임이 생성되었습니다.' },
      userId,
    );

    socket.write(createGameResponse);
  } catch (e) {
    handleError(socket, e);
  }
};
export default createGameHandler;
