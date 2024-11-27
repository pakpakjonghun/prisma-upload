/**
 * api/index.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * API의 index 정의 목록입니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import express, { NextFunction, Router } from "express";

import { deleteFiles, getFiles, uploadFile } from "src/api/handler";

const router: Router = express.Router();


router.get('/', getFiles); // 파일 가져오기 엔드포인트
router.post('/upload', uploadFile); // 파일 업로드 엔드포인트
router.delete('/delete', deleteFiles); // 파일 삭제 엔드포인트

export = router;
