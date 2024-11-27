
import { RequestHandler } from "express";
import fs from "fs";
import multer, { StorageEngine } from "multer";
import path from "path";

/**
 * @function createMulterStorage
 * @description * Multer Storage 설정
 * @param basePath 업로드될 파일의 기본 경로
 * @returns Multer의 StorageEngine
 */
export const createMulterStorage = (basePath: string): StorageEngine => {
    return {
        _handleFile: (req, file, callback) => {
            try {
                const fullPath = path.resolve(basePath);
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }

                const filePath = path.join(fullPath, `${Date.now()}-${file.originalname}`);
                const outStream = fs.createWriteStream(filePath);

                outStream.on("error", callback);
                outStream.on("finish", () => {
                    callback(null, {
                        path: filePath,
                        size: outStream.bytesWritten,
                    });
                });

                file.stream.pipe(outStream);
            } catch (err) {
                callback(err);
            }
        },
        _removeFile: (req, file, callback) => {
            fs.unlink(file.path, callback);
        },
    };
};

/**
 * @function getDynamicMulterHandler
 * @description * 동적으로 Multer 핸들러 생성
 * @param basePath 업로드될 파일 경로
 * @returns Express RequestHandler
 */
export const getDynamicMulterHandler = (basePath: string): RequestHandler => {
    return multer({
        storage: createMulterStorage(basePath),
        fileFilter: (req, file, callback) => {
            // TODO : 파일 검증 로직 추가 가능
            callback(null, true);
        },
    }).single("file"); // "file"은 필드명
};