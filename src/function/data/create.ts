import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @function createDocumentWithFile
 * @description Document 생성과 File 매핑 로직
 * @param documentData - 문서 데이터 (title, content)
 * @param fileId - 매핑할 파일 ID
 * @returns 생성된 Document 객체
 */
export const createDocumentWithFile = async (
    documentData: { title: string; content: string },
    fileId: string
) => {
    return prisma.$transaction(async (tx) => {
        // 매핑하려는 파일 확인
        const file = await tx.file.findUnique({
            where: { id: fileId },
        });

        // 파일이 없거나 매핑된 경우라면 없앤다.
        // TODO : 이 케이스는 field의 attribute의 canBeNull일 경우 검사를 해제하는 방안을 고려할 것.
        if (!file) {
            throw new Error(`File with ID ${fileId} not found`);
        }
        if (file.isMapped) {
            throw new Error(`File with ID ${fileId} is already mapped`);
        }

        // Document 생성
        const document = await tx.document.create({
            data: {
                ...documentData,
                fileId, // 매핑할 파일 ID
            },
        });

        // File 업데이트 (isMapped: true)
        await tx.file.update({
            where: { id: fileId },
            data: {
                isMapped: true,
                mappedTo: document.id, // mappedTo에 문서 ID 설정
            },
        });

        return document;
    });
};
