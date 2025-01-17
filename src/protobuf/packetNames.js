export const packetNames = {
  common: {
    // common.proto
    CommonPacket: 'commonPacket.CommonPacket',
    Ping: 'commonPacket.Ping',
  },
  initial: {
    // initial.proto
    InitialPayload: 'initial.InitialPayload',
  },
  game: {
    // game.proto
    CreateGameRequest: 'game.CreateGameRequest',
    GetGameListRequest: 'game.GetGameListRequest',
    JoinGameRequest: 'game.JoinGameRequest',
    WaitingGameRequest: 'game.WaitingGameRequest',
    LocationUpdatePayload: 'game.LocationUpdatePayload',
  },
  response: {
    // response.proto
    InitialResponse: 'response.InitialResponse',
    Response: 'response.Response',
    CreateGameResponse: 'response.CreateGameResponse',
    GetGameListResponse: 'response.GetGameListResponse',
    JoinGameResponse: 'response.JoinGameResponse',
    WaitingGameResponse: 'response.WaitingGameResponse',
  },
  gameNotification: {
    // game.Notification.proto
    Start: 'gameNotification.Start',
    Waiting: 'gameNotification.Waiting',
    LocationUpdate: 'gameNotification.LocationUpdate',
    ExitPayload: 'gameNotification.ExitPayload',
  },
};
