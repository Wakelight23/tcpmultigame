// 헤더 byte Length 설정
export const TOTAL_LENGTH = 4;
export const PACKET_TYPE_LENGTH = 1;

export const PACKET_TYPE = {
  PING: 0, // 연결 속도
  NORMAL: 1, // 일반적으로 데이터 처리가 필요할 때
  GAME_START: 2, // 게임 시작
  LOCATION: 3, // 위치 정보
  EXIT: 11, // 클라이언트 접속 종료
};
