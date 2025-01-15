import { handleError } from '../../utils/error/errorHandler.js';
import { getGameSession } from '../../session/game.session.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getProtoMessages } from '../../init/loadProtos.js';

const getGameListHandler = ({ socket, userId, payload }) => {
  try {
    const gameSessions = getGameSession(payload.gameId);
    const protoMessages = getProtoMessages();
    const GetGameListResponse = protoMessages.response.GetGameListResponse;

    const gameList = gameSessions.map((session) => ({
      gameId: session.id,
      playerCount: session.users.length,
      gameState: session.state,
    }));

    const responseData = GetGameListResponse.create({
      games: gameList,
    });

    const response = createResponse(
      HANDLER_IDS.GET_GAMELIST,
      RESPONSE_SUCCESS_CODE,
      GetGameListResponse.encode(responseData).finish(),
      userId,
    );

    socket.write(response);
  } catch (e) {
    handleError(socket, e);
  }
};

export default getGameListHandler;
