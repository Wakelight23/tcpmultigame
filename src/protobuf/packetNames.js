export const packetNames = {
  common: {
    CommonPacket: 'commonPacket.CommonPacket', // common.proto의 CommonPacket 메시지
    Ping: 'commonPacket.Ping',
  },
  initial: {
    InitialPayload: 'initial.InitialPayload', // initialPayload.proto의 InitialPayload 메시지
  },
  game: {
    CreateGamePayload: 'game.CreateGamePayload',
    JoinGamePayload: 'game.JoinGamePayload',
    LocationUpdatePayload: 'game.LocationUpdatePayload', // game.proto의 LocationUpdatePayload 메시지
  },
  response: {
    InitialResponse: 'response.InitialResponse',
    Response: 'response.Response', // response.proto의 Response 메시지
  },
  gameNotification: {
    // game.Notification.proto
    LocationUpdate: 'gameNotification.LocationUpdate',
    ExitPayload: 'gameNotification.ExitPayload',
  },
};
