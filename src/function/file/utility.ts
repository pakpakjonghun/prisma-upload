/**
 * /function/utility.ts
 * [Readme] --------------------------------------------------------------------------------------
 *
 * 파일 기본 기능을 저장한 Utility 입니다.
 *
 * -----------------------------------------------------------------------------------------------
 */

import archiver from "archiver";
import appRootPath from "app-root-path";
import fs from "fs";
import moment from "moment";
import path from "path";

// @TO-DO : 이후에 경로를 사용자로부터 전달 받아야 한다.
const BASE_FOLDER_ROOT_PATH = "FILE_ROOT"
const BASE_BACKUP_ROOT_PATH = "FILE_BACKUP_ROOT"
const BASE_ZIP_FOLDER = "FILEZIP_ROOT"

/**
 * @function getRootPath
 * @description * 업로드 될 폴더의 rootPath를 가져온다.
 */
export const getRootPath = (): string => {
    return path.resolve(appRootPath.path, BASE_FOLDER_ROOT_PATH);
};

/**
 * @function getBackupRootPath
 * @description * 트랜잭션 용으로 백업 될 폴더의 rootPath를 가져온다.
 */
export const getBackupRootPath = (): string => {
    return path.resolve(appRootPath.path, BASE_BACKUP_ROOT_PATH);
};

/**
 * @function compressZIP
 * @param paths 압축할 폴더의 경로들을 불러온다.
 * @returns Promise<any>
 * @description 지정한 경로의 폴더를 압축한다.
 */
export const compressZIP = (paths: string | string[]): Promise<string> => {
    return new Promise<any>((resolve: any, reject: any) => {
        try {
            const returnPath: string = path.resolve(BASE_ZIP_FOLDER, moment(new Date().getTime()).format("YYYY-MM-DD,HH:mm:ss:SSS") + ".zip");
            const stream = fs.createWriteStream(BASE_ZIP_FOLDER);
            stream.on("close", () => {
                resolve(returnPath);
            });
            stream.on("error", (e: any) => {
                reject(e);
            });

            const archive = archiver("zip", { zlib: { level: 3 } });
            if (Array.isArray(paths)) {
                for (const p of paths) {
                    const filename: string = path.basename(p);
                    archive.append(fs.createReadStream(p), { name: filename });
                }
            } else {
                archive.append(fs.createReadStream(paths));
            }
            archive.on("error", (e: Error) => {
                reject(e);
            });
            archive.finalize();
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * @function backupFile
 * @description * 파일 삭제 전에 백업
 */
export async function backupFile(filePath: string): Promise<string> {
    const backupPath = path.join(getBackupRootPath(), path.basename(filePath));
    await fs.promises.mkdir(getBackupRootPath(), { recursive: true });
    await fs.promises.copyFile(filePath, backupPath);
    return backupPath;
}

/**
 * @function restoreFile
 * @description * 백업된 파일 복원
 */
export async function restoreFile(backupPath: string, originalPath: string): Promise<void> {
    await fs.promises.copyFile(backupPath, originalPath);
    console.log(`[File Restored] From: ${backupPath} To: ${originalPath}`);
}
