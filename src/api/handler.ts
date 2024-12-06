import { Request, Response } from "express";
import fs from "fs";

import { getRootPath } from "../function/file/utility";
import { getDynamicMulterHandler } from "../function/file/createMulter";

import fileChainingPrisma from "../prisma/prismaClient"; // 파일 체이닝 (데이터 삭제 시 해당하는 파일 삭제 처리가 자동으로 이뤄지는)
import { deleteFilesWithTransaction } from "../function/file/delete";
import { searchFiles } from "src/function/file/find";
import { createDocumentWithFile } from "src/function/data/create";
import { searchData } from "src/function/data/find";
import { updateDocumentFile } from "src/function/data/update";
import { deleteDocumentsAndFiles } from "src/function/data/delete";

/**
 * @function getData
 * @description * 데이터 검색 API 핸들러
 */
export const getData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, startDate, endDate, sortBy, order, page, limit } = req.query;

        // 검색 로직 호출
        const data = await searchData({
            title: title as string,
            startDate: startDate as string,
            endDate: endDate as string,
            sortBy: sortBy as "createdAt" | "title",
            order: order as "asc" | "desc",
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 10
        });
        res.status(200).json(data);
    } catch (err: any) {
        console.error("Error fetching files:", err.message);
        res.status(500).json({ error: "Failed to fetch files", details: err.message });
    }
};

/**
 * @function createData
 * @description * 데이터 추가 API 핸들러
 */
export const createData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content, fileId } = req.body;
        const data = await createDocumentWithFile({ title, content }, fileId);
        res.status(201).json(data);
    } catch (err: any) {
        console.error("Error fetching files:", err.message);
        res.status(500).json({ error: "Failed to fetch files", details: err.message });
    }
};

/**
 * @function updateData
 * @description * 데이터 수정 API 핸들러
 */
export const updateData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId, title, content, fileId } = req.body;
        const data = await updateDocumentFile(documentId, title, content, fileId);
        res.status(201).json(data);
    } catch (err: any) {
        console.error("Error fetching files:", err.message);
        res.status(500).json({ error: "Failed to fetch files", details: err.message });
    }
};

/**
 * @function updateData
 * @description * 데이터 수정 API 핸들러
 */
export const deleteData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId } = req.body;
        const documentIdList: string[] = [];
        if (!Array.isArray(documentId)) {
            documentIdList.push(documentId);
        } else {
            documentIdList.push(...documentId);
        }
        const data = await deleteDocumentsAndFiles(documentIdList);
        res.status(201).json(data);
    } catch (err: any) {
        console.error("Error fetching files:", err.message);
        res.status(500).json({ error: "Failed to fetch files", details: err.message });
    }
};

/**
 * @function getFiles
 * @description * 파일 검색 API 핸들러
 */
export const getFiles = async (req: Request, res: Response): Promise<void> => {
    try {
        const { isMapped, startDate, endDate, sortBy, order, page, limit } = req.query;

        // 검색 로직 호출
        const files = await searchFiles({
            isMapped: isMapped ? isMapped === "true" : undefined,
            startDate: startDate as string,
            endDate: endDate as string,
            sortBy: sortBy as "createdAt" | "size",
            order: order as "asc" | "desc",
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 10
        });

        res.status(200).json(files);
    } catch (err: any) {
        console.error("Error fetching files:", err.message);
        res.status(500).json({ error: "Failed to fetch files", details: err.message });
    }
};

/**
 * @function uploadFile
 * @description * 파일 업로드 처리
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    const basePath: string = getRootPath(); // 기본 업로드 경로
    const multerHandler = getDynamicMulterHandler(basePath);

    multerHandler(req, res, async (err: any) => {
        if (err) {
            res.status(500).json({ error: "File upload failed", details: err.message });
            return;
        }

        const file = req.file;
        if (!file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        try {
            // MIME 타입 검증
            const mimetype = file.mimetype;

            // 파일 메타데이터 저장
            const savedFile = await fileChainingPrisma.file.create({
                data: {
                    filename: file.originalname,
                    size: file.size,
                    mimetype: mimetype,
                    path: file.path,
                    isMapped: false
                }
            });
            res.status(201).json({ success: true, file: savedFile });
        } catch (e: any) {
            // 파일 메타데이터 저장 실패 시 파일 삭제
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            res.status(500).json({ error: "Failed to save file metadata", details: JSON.stringify(e) });
        }
    });
};

/**
 * @function deleteFilesWithTransaction
 * @description * 파일 삭제와 데이터베이스 삭제를 트랜잭션 단위로 처리
 */
export const deleteFiles = async (req: Request, res: Response): Promise<void> => {
    const { fileIds } = req.body; // 배열 형태의 파일 ID

    try {
        await deleteFilesWithTransaction(fileIds);
        console.log("Transaction completed successfully");
        res.status(200).json({ message: "Files deleted successfully" });
    } catch (err: any) {
        // 클라이언트로 반환할 에러 메시지 설정
        const errorMessage = err.message || "Unknown error occurred during transaction";

        console.error("Transaction failed:", err.meerrorMessage);
        res.status(500).json({
            error: "Transaction failed",
            details: errorMessage
        });
    }
};
