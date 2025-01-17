import { handleError } from '../../utils/error/errorHandler.js';
import { getGameSession } from '../../session/game.session.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { config } from '../../config/config.js';

const waitingGameHandler = ({ socket, userId, payload }) => {
  try {
    console.log('waitingGameHandler 들어옴');
    const { gameId } = payload;
    const gameSession = getGameSession(gameId);

    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임세션을 찾을 수 없습니다.');
    }

    // Game 클래스의 state와 MAX_PLAYERS를 활용
    if (gameSession.state === 'waiting' && gameSession.users.length < config.maxPlayer.max_player) {
      const protoMessages = getProtoMessages();
      const WaitingGameResponse = protoMessages.response.WaitingGameResponse;

      // Game 클래스의 getSessionInfo 활용
      const sessionInfo = gameSession.getSessionInfo();
      const responseData = WaitingGameResponse.create({
        gameId: sessionInfo.gameId,
        playerCount: sessionInfo.playerCount,
        gameState: sessionInfo.gameState,
      });

      const response = createResponse(
        HANDLER_IDS.WAITING_GAME,
        RESPONSE_SUCCESS_CODE,
        WaitingGameResponse.encode(responseData).finish(),
        userId,
      );

      socket.write(response);
    } else if (gameSession.users.length === config.maxPlayer.max_player) {
      // Game 클래스의 startGame 메서드 활용
      gameSession.startGame();
    }

    // Game 클래스의 updateGameState 호출
    gameSession.updateGameState();
  } catch (e) {
    handleError(socket, e);
  }
};

export default waitingGameHandler;
