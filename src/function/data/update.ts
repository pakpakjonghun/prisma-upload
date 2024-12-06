import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateDocumentFile = async (documentId: string, title?: string, content?: string, newFileId?: string) => {
    return prisma.$transaction(async (tx) => {
        // Document 확인
        console.log("documentId: ", documentId);
        const document = await tx.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            throw new Error(`Document with ID ${documentId} not found`);
        }

        // 새 파일 매핑 처리
        if (newFileId) {
            const newFile = await tx.file.findUnique({
                where: { id: newFileId }
            });

            if (!newFile) {
                throw new Error(`File with ID ${newFileId} not found`);
            }

            if (newFile.isMapped) {
                throw new Error(`File with ID ${newFileId} is already mapped`);
            }

            // 기존 파일 상태 업데이트
            if (document.id) {
                await tx.file.update({
                    where: { id: document.id },
                    data: {
                        isMapped: false,
                        mappedTo: null
                    }
                });
            }

            // 새 파일 상태 업데이트
            await tx.file.update({
                where: { id: newFileId },
                data: {
                    isMapped: true,
                    mappedTo: documentId
                }
            });
        }

        // Document 업데이트
        await tx.document.update({
            where: { id: documentId },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(newFileId && { fileId: newFileId })
            }
        });

        // 업데이트된 Document 반환
        const updatedDocument = await tx.document.findUnique({
            where: { id: documentId },
            include: { file: true }
        });

        return updatedDocument;
    });
};
