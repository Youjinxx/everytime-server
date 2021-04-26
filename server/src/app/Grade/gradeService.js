const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const gradeProvider = require("./gradeProvider");
const gradeDao = require("./gradeDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리
// 성적 입력
exports.inputGrade = async function( semester, subjectName, credit, subjectGrade, isMajor ){
    try{

        const insertGradeParams = [ semester, subjectName, credit, subjectGrade, isMajor ];

        const connection = await pool.getConnection(async (conn) => conn);

        const inputGradeResult = await gradeDao.inputGrade(connection, insertGradeParams);

        await connection.beginTransaction()     // 트랜잭션 적용 시작
        const calculateGradeResult = await gradeDao.calculateGrade(connection, userId);
        console.log(`전체 성적 계산 : ${calculateGradeResult[0]}`)


        const calculateMajorGradeResult = await gradeDao.calculateMajorGrade(connection, userId);
        console.log(`전공 성적 계산 : ${calculateMajorGradeResult[0]}`)

        const viewGradeResult = await gradeDao.semesterGrade(connection, semester, userId);

        console.log(`추가된 포스트 : ${inputGradeResult[0].insertId}`)
        await connection.commit()           //  트랜잭션 종료

        connection.release();
        return response({ "isSuccess": true, "code": 1000, "message": "성적 입력 성공" });
    }
    catch (err){
        logger.error(`App - inputGrade Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 8. category 게시판 생성
// exports.createCategory = async function(title, description){
//     try{
//         const insertCategoryParams = [ title, description ];
//
//         const connection = await pool.getConnection(async (conn) => conn);
//
//         const categoryResult = await boardDao.insertCategory(connection, insertCategoryParams);
//         console.log(`추가된 카테고리 : ${categoryResult[0].insertId}`)
//         connection.release();
//         return response({ "isSuccess": true, "code": 1000, "message": "카테고리가 추가되었습니다." }, insertCategoryParams);
//     }
//     catch (err){
//         logger.error(`App - createCategory Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
//
// };


// 9. category 게시판 삭제
// exports.editBoardStatus = async function(boardId){
//     try{
//
//         const connection = await pool.getConnection(async (conn) => conn);
//
//         const editBoardResult = await boardDao.deleteBoard(connection, boardId);
//         console.log(`삭제된 카테고리 : ${editBoardResult[0].insertId}`)
//         connection.release();
//
//         return response({ "isSuccess": true, "code": 1000, "message": "카테고리가 삭제되었습니다." }, {"Delete": boardId });
//     }
//     catch (err){
//         logger.error(`App - editBoard Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
//
// };

// 11. 게시글 작성
// exports.createPost = async function( userId, boardIdx, title, postImage, content, anonymous ){
//     try{
//         const insertPostInfoParams = [ userId, boardIdx, title, postImage, content, anonymous ];
//
//         const connection = await pool.getConnection(async (conn) => conn);
//
//         const postResult = await boardDao.createPost(connection, insertPostInfoParams);
//         console.log(`추가된 포스트 : ${postResult[0].insertId}`)
//         connection.release();
//         return response({ "isSuccess": true, "code": 1000, "message": "게시글 작성에 성공하셨습니다." });
//     }
//     catch (err){
//         logger.error(`App - createPost Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// };

// 13. 게시글 삭제
// exports.editPostStatus = async function(postIdx){
//     try{
//
//         const connection = await pool.getConnection(async (conn) => conn);
//
//         await connection.beginTransaction()     // 트랜잭션 적용 시작
//         const deleteDoubleResult = await boardDao.deleteDouble(connection, postIdx);
//         const deleteCommentResult = await boardDao.deleteCommentPost(connection, postIdx);
//         const deletePostResult = await boardDao.deletePost(connection, postIdx);
//         console.log(`삭제된 게시글 : ${deletePostResult[0].insertId}`)
//         await connection.commit()
//         connection.release();
//
//         return response({ "isSuccess": true, "code": 1000, "message": "게시글 삭제되었습니다." }, {"Delete": postIdx });
//     }
//     catch (err){
//         const connection = await pool.getConnection(async (conn) => conn);
//         await connection.rollback()
//         connection.release();
//
//         logger.error(`App - deletePost Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// };

// exports.createUser = async function (userId, password, name, email, nickname, studentId, myMajor, college) {
//     try {
//         // 이메일 중복 확인
//         const emailRows = await userProvider.emailCheck(email);
//         if (emailRows.length > 0)
//             return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);
//
//         // id 중복 확인
//         const userIdRows = await userProvider.userIdCheck(userId);
//         if (userIdRows.length > 0)
//             return errResponse(baseResponse.SIGNUP_REDUNDANT_USERID);
//
//         // 학교 확인
//         const collegeRows = await userProvider.collegeCheck(college);
//         if (collegeRows.length === 0)
//             return errResponse(baseResponse.SIGNUP_COLLEGE_EMPTY);
//
//         // 비밀번호 암호화
//         const hashedPassword = await crypto
//             .createHash("sha512")
//             .update(password)
//             .digest("hex");
//
//         const insertUserInfoParams = [userId, hashedPassword, name, email, nickname, studentId, myMajor, college];
//
//         const connection = await pool.getConnection(async (conn) => conn);
//
//         const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
//         console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
//         connection.release();
//         return response(baseResponse.SIGN_UP_SUCCESS);
//
//
//     } catch (err) {
//         logger.error(`App - createUser Service error\n: ${err.message}`);
//         return errResponse(baseResponse.DB_ERROR);
//     }
// };

