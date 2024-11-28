/**
 * api/index.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * API의 index 정의 목록입니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import express, { NextFunction, Router } from "express";

import { createData, deleteData, deleteFiles, getData, getFiles, updateData, uploadFile } from "src/api/handler";

const router: Router = express.Router();

router.get('/data', getData); // 데이터 가져오기 엔드포인트
router.post('/data/add', createData); // 데이터 추가 엔드포인트
router.put('/data/update', updateData); // 데이터 수정 엔드포인트
router.delete('/data/delete', deleteData); // 데이터 삭제 엔드포인트


router.get('/file', getFiles); // 파일 가져오기 엔드포인트
router.post('/file/upload', uploadFile); // 파일 업로드 엔드포인트
router.delete('/file/delete', deleteFiles); // 파일 삭제 엔드포인트

export = router;
