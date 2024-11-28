import fileChainingPrisma from "../../prisma/prismaClient";  // 파일 체이닝 (데이터 삭제 시 해당하는 파일 삭제 처리가 자동으로 이뤄지는)

/**
 * @function deleteFilesWithTransaction
 * @description * 파일 삭제와 데이터베이스 삭제를 트랜잭션 단위로 처리
 */
export const deleteFilesWithTransaction = async (fileIds: string[], isSoleProcess: boolean = true): Promise<string[]> => {
    const deletedFilePaths: string[] = [];
    try {
        await fileChainingPrisma.$transaction(async (prisma) => {
            // 삭제 대상 파일 조회
            const filesToDelete = await prisma.file.findMany({
                where: {
                    id: { in: fileIds },
                    ...(isSoleProcess ? { documents: { none: {} } } : {}), // 조건 명시적 구성
                },
            });

            if (!filesToDelete.length) {
                throw new Error("No files found to delete");
            }

            // 매핑된 파일 검증
            if (isSoleProcess) {
                const mappedFiles = filesToDelete.filter((file) => file.isMapped);
                if (mappedFiles.length > 0) {
                    const mappedFileIds = mappedFiles.map((file) => file.id).join(", ");
                    throw new Error(
                        `Cannot delete files because the following are mapped to documents: ${mappedFileIds}`
                    );
                }
            }
            deletedFilePaths.push(...filesToDelete.map(f => f.path));

            // 데이터베이스 메타데이터 삭제
            await prisma.file.deleteMany({
                where: { id: { in: fileIds } },
            });
        }, {
            timeout: 10000, // 트랜잭션 타임아웃 10초로 증가 (속도 이슈...)
        });
        console.log("[File] Transaction completed successfully");
        return deletedFilePaths;
    } catch (err: any) {
        console.error("Transaction failed:", err.message);
        throw new Error("Transaction failed");
    }
};
