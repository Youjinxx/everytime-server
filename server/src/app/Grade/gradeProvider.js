const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const gradeDao = require("./gradeDao");

// Provider: Read 비즈니스 로직 처리
// 33. 전체 학점 조회
exports.retrieveTotalGrade= async function () {

    const connection = await pool.getConnection(async (conn) => conn);
    const totalGradeResult = await gradeDao.selectTotalGrade(connection);
    connection.release();

    return totalGradeResult;
};

//34. 학점 비율 조회
exports.retrievePercentage= async function () {

    const connection = await pool.getConnection(async (conn) => conn);
    const selectPercentageResult = await gradeDao.selectPercentage(connection);
    connection.release();

    return selectPercentageResult;
};
// 35. 학기별 성적
exports.retrieveSemesterGrade = async function (semester){

    const connection = await pool.getConnection(async (conn) => conn);
    const semesterGradeResult = await gradeDao.semesterGrade(connection, semester);
    connection.release();

    return semesterGradeResult;
};

// // boardId => 게시판 여부
// exports.boardExistCheck = async function (boardIdx){
//
//     const connection = await pool.getConnection(async (conn) => conn);
//     const isBoardResult = await boardDao.isBoardIdExist(connection, boardIdx);
//     connection.release();
//
//     return isBoardResult;
// }
//
//
// exports.categoryExistCheck = async function (title){
//
//     const connection = await pool.getConnection(async (conn) => conn);
//     const isCategoryResult = await boardDao.isCategory(connection, title);
//     connection.release();
//
//     return isCategoryResult;
// }
//
// // postId => 게시 여부
// exports.postExistCheck = async function(postIdx){
//     const connection = await pool.getConnection(async (conn) => conn);
//     const isPostResult = await boardDao.isPostIdExist(connection, postIdx);
//     connection.release();
//
//     return isPostResult;
// }
