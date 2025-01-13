// DB를 사용하려면 이렇게 사용하면 된다
// testDB 형태

// const testDbConnection = async (pool, dbName) => {
//   try {
//     const [rows] = await pool.query('SELECT 1 + 1 AS solution');
//     console.log(`${dbName} 테스트 쿼리 결과 : ${rows[0].solution}`);
//   } catch (e) {
//     console.error(`${dbName} 테스트 쿼리 실행 중 오류 발생 : ${e}`);
//   }
// };

// const testAllConnection = async (pools) => {
//   await testDbConnection(pools.GAME_DB, 'GAME_DB');
//   await testDbConnection(pools.USER_DB, 'USER_DB');
// };

// export { testDbConnection, testAllConnection };
