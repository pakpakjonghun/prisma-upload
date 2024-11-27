import fs from "fs";

import fileChainingPrisma from "../prisma/prismaClient";  // 파일 체이닝 (데이터 삭제 시 해당하는 파일 삭제 처리가 자동으로 이뤄지는)
import { backupFile, restoreFile } from "./utility";


/**
 * @function deleteFilesWithTransaction
 * @description * 파일 삭제와 데이터베이스 삭제를 트랜잭션 단위로 처리
 */
export const deleteFilesWithTransaction = async (fileIds: string[]): Promise<void> => {
    const backupPaths: Record<string, string> = {};
    const deletedFilePaths: string[] = [];

    try {
        await fileChainingPrisma.$transaction(async (prisma) => {
            const filesToDelete = await prisma.file.findMany({
                where: { id: { in: fileIds } },
            });

            if (!filesToDelete.length) {
                throw new Error("No files found to delete");
            }

            // 파일 백업(트랜잭션용) 및 삭제
            await Promise.all(
                filesToDelete.map(async (file) => {
                    const backupPath = await backupFile(file.path); // 백업 파일 생성
                    backupPaths[file.path] = backupPath;

                    fs.unlinkSync(file.path); // 파일 삭제
                    deletedFilePaths.push(file.path);
                })
            );

            // 데이터베이스 메타데이터 삭제
            await prisma.file.deleteMany({
                where: { id: { in: fileIds } },
            });
        });

        // 트랜잭션 성공 시 백업본 삭제
        await Promise.all(
            Object.values(backupPaths).map(async (backupPath) => {
                try {
                    fs.unlinkSync(backupPath); // 백업 파일 삭제
                    console.log(`[Backup Deleted] Path: ${backupPath}`);
                } catch (err) {
                    console.error(`[Error Deleting Backup] Path: ${backupPath}`, err);
                }
            })
        );
        console.log("Transaction completed successfully");
    } catch (err: any) {
        console.error("Transaction failed:", err.message);

        // 롤백: 삭제된 파일 복원
        await Promise.all(
            Object.entries(backupPaths).map(async ([originalPath, backupPath]) => {
                try {
                    await restoreFile(backupPath, originalPath);
                    console.log(`[Rollback Successful] Restored: ${originalPath}`);
                } catch (restoreErr) {
                    console.error(`[Rollback Failed] Path: ${originalPath}`, restoreErr);
                }
            })
        );
        throw new Error("Transaction failed");
    }
};
