import { handleError } from '../../utils/error/errorHandler.js';
import { getAllGameSession, getGameSession } from '../../session/game.session.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { getProtoMessages } from '../../init/loadProtos.js';

const getGameListHandler = ({ socket, userId, payload }) => {
  try {
    console.log('getGameListHandler 들어옴');
    const gameSessions = getAllGameSession();
    const protoMessages = getProtoMessages();
    const GetGameListResponse = protoMessages.response.GetGameListResponse;

    const gameList = Array.isArray(gameSessions)
      ? gameSessions.map((session) => session.getSessionInfo())
      : [];

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
