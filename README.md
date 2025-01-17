# TMG - TCP Multi Game

## TCP 통신을 활용한 멀티게임 만들기

### 주요 기능

- Client에서 deviceId, ip, port로 접속
- Server에서 Client가 보낸 payload를 바탕으로 사용자 접속 관리
- 게임 세션의 상태를 Client에 전송하여 현재 생성된 게임 세션과 상호작용
- Client간의 위치 동기화

### 서버 ↔ 클라이언트 구조

![스크린샷 2025-01-17 111025](https://github.com/user-attachments/assets/0279918a-fe76-4360-b5c6-2e467c53c5df)


### 파일 디렉토리

<details>
<summary>열기</summary>

```
📦src
 ┣ 📂classes
 ┃ ┣ 📂manager
 ┃ ┃ ┣ 📜base.manager.js
 ┃ ┃ ┗ 📜interval.manager.js
 ┃ ┗ 📂models
 ┃ ┃ ┣ 📜game.class.js
 ┃ ┃ ┗ 📜user.class.js
 ┣ 📂config
 ┃ ┗ 📜config.js
 ┣ 📂constants
 ┃ ┣ 📜env.js
 ┃ ┣ 📜handlerIds.js
 ┃ ┗ 📜header.js
 ┣ 📂db
 ┃ ┣ 📂migration
 ┃ ┃ ┗ 📜createSchemas.js
 ┃ ┣ 📂sql
 ┃ ┃ ┗ 📜user_db.sql
 ┃ ┣ 📂user
 ┃ ┃ ┣ 📜user.db.js
 ┃ ┃ ┗ 📜user.queries.js
 ┃ ┗ 📜database.js
 ┣ 📂events
 ┃ ┣ 📜onConnection.js
 ┃ ┣ 📜onData.js
 ┃ ┣ 📜onEnd.js
 ┃ ┗ 📜onError.js
 ┣ 📂handlers
 ┃ ┣ 📂game
 ┃ ┃ ┣ 📜createGame.handler.js
 ┃ ┃ ┣ 📜gameExit.handler.js
 ┃ ┃ ┣ 📜getGameList.handler.js
 ┃ ┃ ┣ 📜joinGame.handler.js
 ┃ ┃ ┣ 📜updateLocation.handler.js
 ┃ ┃ ┗ 📜waitingGame.handler.js
 ┃ ┣ 📂user
 ┃ ┃ ┗ 📜initial.handler.js
 ┃ ┗ 📜index.js
 ┣ 📂init
 ┃ ┣ 📜assets.js
 ┃ ┣ 📜index.js
 ┃ ┗ 📜loadProtos.js
 ┣ 📂protobuf
 ┃ ┣ 📂notification
 ┃ ┃ ┗ 📜game.notification.proto
 ┃ ┣ 📂request
 ┃ ┃ ┣ 📜common.proto
 ┃ ┃ ┣ 📜game.proto
 ┃ ┃ ┗ 📜initial.proto
 ┃ ┣ 📂response
 ┃ ┃ ┗ 📜response.proto
 ┃ ┗ 📜packetNames.js
 ┣ 📂session
 ┃ ┣ 📜game.session.js
 ┃ ┣ 📜sessions.js
 ┃ ┗ 📜user.session.js
 ┣ 📂utils
 ┃ ┣ 📂db
 ┃ ┃ ┗ 📜testConnection.js
 ┃ ┣ 📂error
 ┃ ┃ ┣ 📜customError.js
 ┃ ┃ ┣ 📜errorCodes.js
 ┃ ┃ ┗ 📜errorHandler.js
 ┃ ┣ 📂notification
 ┃ ┃ ┗ 📜game.notification.js
 ┃ ┣ 📂parser
 ┃ ┃ ┗ 📜packetParser.js
 ┃ ┣ 📂response
 ┃ ┃ ┗ 📜createResponse.js
 ┃ ┣ 📜dateFormatter.js
 ┃ ┗ 📜transformCase.js
 ┗ 📜server.js
```

</details>

### 패킷 명세서 (proto 구조)

#### 기본 구조

| 필드 명     | 타입     | 설명                 | 크기   |
| ----------- | -------- | -------------------- | ------ |
| totalLength | int      | 메세지의 전체 길이   | 4 Byte |
| packetType  | int      | 패킷의 타입          | 1 Byte |
| protobuf    | protobuf | 프로토콜 버퍼 구조체 | 가변   |

protobuf에 대한 내용 ▼

<details>
<summary>notification</summary>

- GameStartNotification (게임 시작)

| 필드 이름 | 타입   | 번호 | 설명                             |
| --------- | ------ | ---- | -------------------------------- |
| gameId    | string | 1    | 게임 ID                          |
| timestamp | int64  | 2    | 게임 시작 시간 (Unix 타임스탬프) |

- LocationUpdate (위치 업데이트)

| 필드 이름 | 타입                  | 번호 | 설명             |
| --------- | --------------------- | ---- | ---------------- |
| users     | repeated UserLocation | 1    | 사용자 위치 목록 |

└ UserLocation (내부 메시지)

| 필드 이름 | 타입   | 번호 | 설명        |
| --------- | ------ | ---- | ----------- |
| id        | string | 1    | 사용자 ID   |
| playerId  | int32  | 2    | 플레이어 ID |
| x         | float  | 3    | X 좌표      |
| y         | float  | 4    | Y 좌표      |

- Waiting (MAX_PLAYER 도달까지 Waiting)

| 필드 이름   | 타입   | 번호 | 설명        |
| ----------- | ------ | ---- | ----------- |
| gameId      | string | 1    | 게임 ID     |
| playerCount | int32  | 2    | 플레이어 수 |
| gameState   | string | 3    | 게임 상태   |

- ExitPayload (게임 종료 시)

| 필드 이름 | 타입   | 번호 | 설명      |
| --------- | ------ | ---- | --------- |
| userId    | string | 1    | 사용자 ID |

</details>

<details>
<summary>request</summary>

- CommonPacket

| 필드 이름 | 타입   | 번호 | 설명                       |
| --------- | ------ | ---- | -------------------------- |
| handlerId | uint32 | 1    | 핸들러 ID                  |
| userId    | string | 2    | 사용자 ID                  |
| version   | string | 3    | 클라이언트 버전            |
| payload   | bytes  | 4    | 페이로드 (직렬화된 데이터) |

- Ping

| 필드 이름 | 타입  | 번호 | 설명       |
| --------- | ----- | ---- | ---------- |
| timestamp | int64 | 1    | 타임스탬프 |

- CreateGameRequest

| 필드 이름 | 타입  | 번호 | 설명       |
| --------- | ----- | ---- | ---------- |
| timestamp | int64 | 1    | 타임스탬프 |

- GetGameListRequest

| 필드 이름 | 타입  | 번호 | 설명       |
| --------- | ----- | ---- | ---------- |
| timestamp | int64 | 1    | 타임스탬프 |

- JoinGameRequest

| 필드 이름 | 타입   | 번호 | 설명      |
| --------- | ------ | ---- | --------- |
| gameId    | string | 1    | 게임 ID   |
| timestamp | int64  | 2    | 요청 시간 |

- WaitingGameRequest

| 필드 이름 | 타입   | 번호 | 설명         |
| --------- | ------ | ---- | ------------ |
| gameId    | string | 1    | 게임 세션 ID |
| timestamp | int64  | 2    | 요청 시간    |

- LocationUpdatePayload

| 필드 이름 | 타입   | 번호 | 설명         |
| --------- | ------ | ---- | ------------ |
| gameId    | string | 1    | 게임 세션 ID |
| x         | float  | 2    | X 좌표       |
| y         | float  | 3    | Y 좌표       |

- InitialPayload

| 필드 이름 | 타입   | 번호 | 설명               |
| --------- | ------ | ---- | ------------------ |
| deviceId  | string | 1    | 디바이스 ID        |
| playerId  | uint32 | 2    | 플레이어 ID        |
| latency   | float  | 3    | 네트워크 지연 시간 |

</details>

<details>
<summary>response</summary>

- Response

| 필드 이름    | 타입   | 번호 | 설명                     |
| ------------ | ------ | ---- | ------------------------ |
| handlerId    | uint32 | 1    | 핸들러 ID                |
| responseCode | uint32 | 2    | 응답 코드                |
| timestamp    | int64  | 3    | 타임스탬프               |
| data         | bytes  | 4    | 데이터 (직렬화된 데이터) |

- InitialResponse

| 필드 이름 | 타입   | 번호 | 설명      |
| --------- | ------ | ---- | --------- |
| userId    | string | 1    | 사용자 ID |

- CreateGameResponse

| 필드 이름 | 타입   | 번호 | 설명           |
| --------- | ------ | ---- | -------------- |
| gameId    | string | 1    | 생성된 게임 ID |
| message   | string | 2    | 응답 메시지    |

- GetGameListResponse
  GetGameListResponse

| 필드 이름 | 타입              | 번호 | 설명           |
| --------- | ----------------- | ---- | -------------- |
| games     | repeated GameInfo | 1    | 게임 정보 목록 |

└ GameInfo (내부 메시지)

| 필드 이름   | 타입   | 번호 | 설명        |
| ----------- | ------ | ---- | ----------- |
| gameId      | string | 1    | 게임 ID     |
| playerCount | int32  | 2    | 플레이어 수 |
| gameState   | string | 3    | 게임 상태   |

- JoinGameResponse

| 필드 이름   | 타입   | 번호 | 설명             |
| ----------- | ------ | ---- | ---------------- |
| gameId      | string | 1    | 참가한 게임 ID   |
| playerCount | int32  | 2    | 현재 플레이어 수 |
| gameState   | string | 3    | 게임 상태        |
| message     | string | 4    | 응답 메시지      |

- WaitingGameResponse

| 필드 이름   | 타입   | 번호 | 설명              |
| ----------- | ------ | ---- | ----------------- |
| gameId      | string | 1    | 대기 중인 게임 ID |
| playerCount | int32  | 2    | 현재 플레이어 수  |
| gameState   | string | 3    | 게임 상태         |

</details>

### 기술 스택

<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"><img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"><img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"><img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white"><img src="https://img.shields.io/badge/yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white"><img src="https://img.shields.io/badge/.env-0D47A1?style=for-the-badge&logo=.env&logoColor=white">
