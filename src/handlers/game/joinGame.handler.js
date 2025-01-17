import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getProtoMessages } from '../../init/loadProtos.js';
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

const joinGameHandler = async ({ socket, userId }) => {
  try {
    console.log('joinGameHandler 들어옴');
    const user = await getUserById(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    let gameSession = getAvailableGameSession();
    if (!gameSession) {
      // 사용 가능한 게임 세션이 없으면 새로운 세션 생성
      const newGameId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      gameSession = addGameSession(newGameId);
    }

    // gameId 설정
    user.setGameId(gameSession.id);

    // 이미 참가중인 경우 처리
    const existUser = gameSession.getUser(user.id);
    if (!existUser) {
      gameSession.addUser(user);
    }

    const gameInfo = gameSession.getSessionInfo();

    // 프로토콜 버퍼 응답 생성
    const protoMessages = getProtoMessages();
    const JoinGameResponse = protoMessages.response.JoinGameResponse;

    const joinGameResponseData = JoinGameResponse.create({
      gameId: gameInfo.gameId,
      playerCount: gameInfo.playerCount,
      gameState: gameInfo.gameState,
      message: '게임에 성공적으로 참가했습니다',
    });

    const joinGameResponse = createResponse(
      HANDLER_IDS.JOIN_GAME,
      RESPONSE_SUCCESS_CODE,
      JoinGameResponse.encode(joinGameResponseData).finish(),
      userId,
    );

    socket.write(joinGameResponse);
    console.log('joinGameReponse을 마치고 gameSession 상태 : \n', gameSession);
  } catch (e) {
    handleError(socket, e);
  }
};

export default joinGameHandler;
