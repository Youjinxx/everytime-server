const jwtMiddleware = require("../../../config/jwtMiddleware");
const gradeProvider = require("../../app/Grade/gradeProvider");
const gradeService = require("../../app/Grade/gradeService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


/**
 * API No. 33
 * API Name : 전체 학점 조회 API
 * [GET] /app/grade
 */

exports.getTotalGrade = async function (req, res) {

    const totalGrade = await gradeProvider.retrieveTotalGrade();
    console.log(totalGrade);

    return res.send(response({ "isSuccess": true, "code": 1000, "message": "학점 조회 성공" }, totalGrade));
};

/**
 * API No. 34
 * API Name : 학점(A, B, C, D) 비율 API
 * [GET] /app/grade/percentage
 */

exports.getPercentageGrade = async function (req, res) {

    const percentageGrade = await gradeProvider.retrievePercentage();
    console.log(percentageGrade);

    return res.send(response({ "isSuccess": true, "code": 1000, "message": "학점 비율 조회 성공" }, percentageGrade));
};

/**
 * API No. 35
 * API Name : 학기별 학점 조회 API
 * [GET] /app/grade/:semester
 */

exports.getSemesterGrade = async function (req, res) {
    const semester = req.params.semester;
    // 공백 체크
    var re = /s$/;
    if(re.test(semester))
        return res.send(response(baseResponse.INPUT_NOT_SPACE));

    // 숫자 형식 체크
    var regExp = /^[0-9]+$/;
    if(!regExp.test(semester))
        return res.send(response(baseResponse.INPUT_NUMBER));

    if(semester == 0)
         return res.send(response(baseResponse.INPUT_SEMESTER_INDEX));

    const semesterGrade = await gradeProvider.retrieveSemesterGrade(semester);
    console.log(semesterGrade);

    return res.send(response({ "isSuccess": true, "code": 1000, "message": "학기별 학점 조회 성공" }, semesterGrade));
};
/**
 * API No. 36
 * API Name : 학기별 성적 입력 API
 * [POST] /app/grade/:semester
 */
exports.postSemesterGrade = async function (req, res) {

    /**
     * Body: semester, subjectName, credit, subjectGrade, isMajor
     */
    const { semester, subjectName, credit, subjectGrade, isMajor } = req.body;
    console.log( semester, subjectName, credit, subjectGrade, isMajor );

    // 빈 값 체크
    if (!semester  || !credit || !subjectGrade )
        return res.send(response(baseResponse.INPUT_EMPTY));
    if(!subjectName)
        return res.send(response(baseResponse.INPUT_SUBJECT_EMPTY));

    // 공백 체크
    var re = /s$/;
    if(re.test(semester) || re.test(subjectName) || re.test(credit) || re.test(subjectGrade) || re.test(isMajor))
        return res.send(response(baseResponse.INPUT_NOT_SPACE));

    // 숫자 형식 체크
    var regExp = /^[0-9]+$/;
    if(!regExp.test(semester) || !regExp.test(credit))
        return res.send(response(baseResponse.INPUT_NUMBER));

    // 입력 형식
    let gradeArr = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'NP', 'P'];
    console.log(gradeArr.includes(subjectGrade));

    if(!gradeArr.includes(subjectGrade))
        return res.send(response(baseResponse.INPUT_WRONG));


    // 길이 체크
    if (subjectName.length < 2 || subjectName.length > 100)
        if(subjectName.length < 2) {
            return res.send(response(baseResponse.INPUT_TITLE_LENGTH));
        } else {
            return res.send(response(baseResponse.INPUT_TITLE_LENGTH2));
        }

    if(isMajor != 1 && isMajor != 0)
        return res.send(response(baseResponse.INPUT_TRUE_FALSE));

    const inputGradeResponse = await gradeService.inputGrade( semester, subjectName, credit, subjectGrade, isMajor );

    return res.send(inputGradeResponse);
};

/**
 * API No. 37
 * API Name : 게시판 즐겨찾기 조회 API
 * [GET] /app/boards
 //  */
// exports.getCategoyList = async function (req, res) {
//
//     /**
//      * Query String: search
//      */
//     const search = req.query.search;
//
//     if (!search) {
//         // 즐겨찾기 게시판 조회
//         const boardListResult = await boardProvider.retrieveBoardList();
//         if(boardListResult.length < 1)
//             return res.send(errResponse(baseResponse.SELECT_BOARD_EMPTY ));
//
//         return res.send(response({ "isSuccess": true, "code": 1000, "message": "즐겨찾기 게시판이 조회되었습니다." }, boardListResult));
//     } else {
//         // 일부 게시판 조회
//         const boardListBySearch = await boardProvider.retrieveBoardList(search);
//         console.log(boardListBySearch);
//         if(boardListBySearch.length < 1)
//             return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));
//
//         return res.send(response({ "isSuccess": true, "code": 1000, "message": "검색한 게시판이 조회되었습니다." }, boardListBySearch));
//     }
// };

/**
 * API No. 10
 * API Name : 게시판 삭제 API
 * [Patch] /app/boards/:boardId
 //  */

// exports.patchBoard = async function (req, res) {
//
//     const boardId = req.params.boardId;
//
//     // 빈값 체크
//     if(!boardId)
//         return res.send(response(baseResponse.INPUT_EMPTY));
//
//     // 활성 게시판 (status == 1) 이 아니면 ,
//     const isBoard = await boardProvider.boardExistCheck(boardId);
//     if(isBoard.length < 1)
//         return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));
//
//     else {
//         const editBoardStatus = await boardService.editBoardStatus(boardId);
//         return res.send(editBoardStatus);
//     }
// };

