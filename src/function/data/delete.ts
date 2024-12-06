import fs from "fs";
import fileChainingPrisma from "../../prisma/prismaClient"; // 확장된 Prisma
import { PrismaClient } from "@prisma/client";

type PrismaModelName = "document" | "file" | "anotherModel"; // 스키마의 모든 모델 이름 나열

function isPrismaModel<T extends PrismaModelName>(tx: PrismaClient, model: string): model is T {
    return model in tx;
}

/**
 * @function deleteDocumentsAndFiles
 * @description Document 삭제 및 연결된 File 삭제
 */
export const deleteDocumentsAndFiles = async (documentIds: string[]): Promise<void> => {
    const filePathList: string[] = [];

    try {
        // 트랜잭션: Document 삭제 및 관련 File ID 수집
        await fileChainingPrisma.$transaction(
            async (tx: any) => {
                const model: string = "document";

                // Prisma의 동적 모델 호출
                if (!(model in tx)) {
                    throw new Error(`Model ${model} does not exist in Prisma Client`);
                }

                // Document 및 연결된 File 조회
                const documents = await tx.findMany({
                    where: { id: { in: documentIds } },
                    include: { file: true } // 연결된 파일 포함
                });

                if (!documents.length) {
                    throw new Error("No documents found to delete");
                }

                filePathList.push(
                    ...documents.map((doc: any) => {
                        if (doc.file) {
                            return doc.file.path;
                        }
                        return "";
                    })
                );

                await tx.document.deleteMany({ where: { id: { in: documentIds } } });
                await tx.file.deleteMany({ where: { id: { in: filePathList } } });

                // // 연결된 파일 ID 수집
                // const fileIds = documents
                //     .filter((doc) => doc.fileId) // 연결된 파일만
                //     .map((doc) => doc.fileId!);
                // Document 삭제
                // await tx.document.deleteMany({
                //     where: { id: { in: documentIds } },
                // });

                // // File 삭제 처리 (이미 정의된 deleteFilesWithTransaction 호출)
                // if (fileIds.length > 0) {
                //     console.log("fileIds: ", fileIds);

                //     // 관계 해제 (Document의 fileId를 null로 설정)
                //     await tx.document.updateMany({
                //         where: { id: { in: documentIds } },
                //         data: { fileId: null },
                //     });

                //     // 파일 패스 가져오기.
                //     filePathList.push(...await deleteFilesWithTransaction(fileIds, false));
                // }
                console.log("[Data] Transaction completed successfully");
            },
            {
                timeout: 10000 // 트랜잭션 타임아웃 10초로 증가 (속도 이슈...)
            }
        );
        console.log("실 파일 삭제 시작: ", filePathList);

        // 파일 삭제
        await Promise.all(
            filePathList.map(async (p) => {
                await fs.promises.unlink(p);
            })
        );
        console.log("Documents and associated files deleted successfully");
    } catch (err: any) {
        console.error("Transaction failed:", err.message);
        throw new Error("Transaction failed");
    }
};
