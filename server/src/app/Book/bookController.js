const jwtMiddleware = require("../../../config/jwtMiddleware");
const bookProvider = require("../../app/Book/bookProvider");
const bookService = require("../../app/Book/bookService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");

/**
 * API No. 29
 * API Name : 최근 올라온 책 조회 API
 * [GET] /app/book ? searcj = ''
 //  */
exports.getCategoyList = async function (req, res) {

    /**
     * Query String: search
     */
    const search = req.query.search;

    if (!search) {
        // 최근 올라온 책 순서대로 조회
        const bookListResult = await bookProvider.retrieveBookList();
        if(bookListResult.length < 1)
            return res.send(errResponse(baseResponse.SELECT_BOOK_EMPTY ));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "최근 올라온 책 조회 성공" }, bookListResult));
    } else {
        // 검색된 내용 순서대로 조회
        const bookListBySearch = await bookProvider.retrieveBookList(search);
        console.log(bookListBySearch);
        if(bookListBySearch.length < 1)
            return res.send(errResponse(baseResponse.SEARCH_BOOK_EMPTY));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "검색한 책 조회 성공" }, bookListBySearch));
    }
};



/**
 * API No. 30
 * API Name : 책 판매 작성 API
 * [POST] /app/book
 */

//
// exports.postBookSell = async function (req, res) {
//
//     /**
//      * Body: bookId, userId, boardIdx, title, content, salePrice, underlineTrace,
//      * handwritingTrace, isCover, writingName, pageDiscoloration, pageDamage,
//      * myBookImage, deliveryAvailable, directTransaction, isCompleteSell,
//      * latitude, longitude, meetPlace
//      */
//     const { bookId, userId, boardId, title, content, salePrice, underlineTrace,
//         handwritingTrace, isCover, writingName, pageDiscoloration, pageDamage,
//         myBookImage, deliveryAvailable, directTransaction, isCompleteSell,
//         latitude, longitude, meetPlace } = req.body;
//
//     // 빈 값 체크
//     if (!bookId || !userId || !boardId || !title || !content || !salePrice || !underlineTrace ||
//         !handwritingTrace || !isCover || !writingName || !pageDiscoloration || !pageDamage ||
//         !myBookImage || !deliveryAvailable || !directTransaction || !isCompleteSell,
//         !latitude || !longitude || !meetPlace)
//         return res.send(response(baseResponse.));
//
//
//     // 길이 체크
//     if (title.length < 2 || title.length > 30)
//         return res.send(response(baseResponse.INPUT_LENGTH));
//
//     // 중복 체크
//     const isCategory = await boardProvider.categoryExistCheck(title);
//     console.log(isCategory);
//     if(isCategory.length > 0) {
//         console.log(isCategory);
//         return res.send(errResponse(baseResponse.CREATE_REDUNDANT_BOARD));
//     }
//     // 책 정보 저장 되어 있지 않으면 넣어야 겟지?
//
//     const categoryResponse = await boardService.createCategory( title, description );
//
//     return res.send(categoryResponse);
// };

/**
 * API No.31
 * API Name : 마이페이지 조회 API
 * [GET] /app/book/:userId
 */

exports.getMyList = async function (req, res) {

    const userId = req.params.userId;

    if (!userId) {
        return res.send(errResponse(baseResponse.INPUT_EMPTY));

    } else {

        const myBookPostList = await bookProvider.retrieveMyBookList(userId);

        if(myBookPostList.length < 1) // SELECT_POST_EMPTY
            return res.send(errResponse(baseResponse.SELECT_POST_EMPTY));

        return res.send(response({ "isSuccess": true, "code": 1000, "message": "마이페이지 조회 성공" }, myBookPostList ));
    }
};


/**
 * API No.31
 * API Name : 책 판매글 세부내용 조회 API
 * [GET] /app/book/:bookPostId/detail
 */

exports.getDetailPost = async function (req, res) {

    const postId = req.params.bookPostId;

    // 공백 체크
    var re = /s$/;
    if(re.test(postId))
        return res.send(response(baseResponse.INPUT_NOT_SPACE));

    // 숫자 형식 체크
    var regExp = /^[0-9]+$/;
    if(!regExp.test(postId))
        return res.send(response(baseResponse.INPUT_NUMBER));

    // 입력 형식 (1부터 시작해야 한다)
    if(postId < 1)
        return res.send(response(baseResponse.INPUT_INDEX));

    if (!postId) {
        return res.send(errResponse(baseResponse.INPUT_EMPTY));

    } else {
        // 판매 완료인 경우
        const isSellCompleted = await bookProvider.sellBookList(postId);
        if(isSellCompleted.length > 0){
            const updateResponse = await bookService.updateState(postId);
            return res.send(updateResponse);
        }

        // 게시글이 존재 X
        const bookPostList = await bookProvider.retrieveBookPost(postId);
        if(bookPostList.length < 1)
            return res.send(errResponse(baseResponse.SELECT_POST_EMPTY));
        
        return res.send(response({ "isSuccess": true, "code": 1000, "message": "책 세부내용 조회 성공" }, bookPostList ));
    }
};

/**
 * API No. 10
 * API Name : 게시판 삭제 API
 * [Patch] /app/boards/:boardId
 //  */

exports.patchBoard = async function (req, res) {

    const boardId = req.params.boardId;

    // 빈값 체크
    if(!boardId)
        return res.send(response(baseResponse.INPUT_EMPTY));

    // 활성 게시판 (status == 1) 이 아니면 ,
    const isBoard = await boardProvider.boardExistCheck(boardId);
    if(isBoard.length < 1)
        return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));

    else {
        const editBoardStatus = await boardService.editBoardStatus(boardId);
        return res.send(editBoardStatus);
    }
};




/**
 * API No. 12
 * API Name : 게시글 작성 API
 * [POST] /app/post/
 */

exports.writePost = async function (req, res){
    /**
     * Body: userId, boardId, title, postImage, content, annoymous
     */

    const { userId, boardIdx, title, postImage, content, anonymous } = req.body;

    // 빈 값 체크
    if (!userId)
        return res.send(response(baseResponse.INPUT_EMPTY));

    if (!boardIdx)
        return res.send(response(baseResponse.INPUT_BOARDID_EMPTY));


    // 게시판 인덱스 유효검사
    const isBoard = await boardProvider.boardExistCheck(boardIdx);
    if(isBoard.length < 1)
        return res.send(errResponse(baseResponse.SEARCH_BOARD_EMPTY));

    // title 길이 제한 검사
    if (title.length < 2 || title.length > 5000){
        if(title.length < 2){
            return res.send(response(baseResponse.INPUT_TITLE_LENGTH));
        } else {
            return res.send(response(baseResponse.INPUT_TITLE_LENGTH2));
        }
    }

    const writeResponse = await boardService.createPost(
        userId, boardIdx, title, postImage, content, anonymous
    );

    return res.send(writeResponse);

};

/**
 * API No. 13
 * API Name : 게시글 삭제 API
 * [POST] /app/post/:postIdx
 */
//
exports.patchPost = async function (req, res) {

    const postIdx = req.params.postId;

    // 빈값 체크
    if(!postIdx)
        return res.send(response(baseResponse.INPUT_EMPTY));

    // 활성 게시글 (status == 1) 이 아니면 ,
    const isPost = await boardProvider.postExistCheck(postIdx);
    if(isPost.length < 1)
        return res.send(errResponse(baseResponse.SELECT_POST_EMPTY ));

    else {
        const editPostStatus = await boardService.editPostStatus(postIdx);
        return res.send(editPostStatus);
    }
};
