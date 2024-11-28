import { PrismaClient } from "@prisma/client";
import fs from "fs";

/**
 * @TODO : $use 방식이 deprecated되고 새 방식으로 변경됨 ->  Client Extensions
 * Prisma Client Extensions는 Prisma Client의 기본 동작을 확장하거나 커스터마이징할 수 있는 새로운 방식. 
 * 이를 통해 $use 미들웨어를 대체하며, 특정 모델이나 메서드에 대해 추가 로직을 정의할 수 있다.
 * 
 * Prisma Client Extensions는 확장된 객체 간 독립성을 보장한다. 
 * 즉, 기본 Prisma 객체를 기반으로 확장된 객체 A와, 이를 다시 확장한 B는 명확히 구분되며, 서로 다른 동작을 수행할 수 있다.
 * 
 * $transaction을 쓰면 하당 객체 자체가 아니므로 이 extends 내는 호출이 안 된다.
 */

const prisma = new PrismaClient().$extends({
    name: 'fileLifecycleExtension',
    query: {
        file: { // 모델명(File의 소문자)
            async delete({ model, operation, args, query }) {
                // 삭제될 파일 정보 조회
                const fileToDelete = await prisma.file.findUnique({
                    where: args.where,
                });

                // 실제 파일 삭제
                if (fileToDelete && fileToDelete.path) {
                    try {
                        if (fs.existsSync(fileToDelete.path)) {
                            fs.unlinkSync(fileToDelete.path);
                            console.log(`[File Deleted] Path: ${fileToDelete.path}`);
                        }
                    } catch (err) {
                        console.error(`[Error Deleting File] Path: ${fileToDelete.path}`, err);
                    }
                }

                // 원래 delete 동작 실행
                return query(args);
            },

            async deleteMany({ model, operation, args, query }) {
                // 삭제될 파일 목록 조회
                const filesToDelete = await prisma.file.findMany({
                    where: args.where,
                });

                // 각 파일 삭제
                filesToDelete.forEach((file) => {
                    if (file.path && fs.existsSync(file.path)) {
                        try {
                            fs.unlinkSync(file.path);
                            console.log(`[File Deleted] Path: ${file.path}`);
                        } catch (err) {
                            console.error(`[Error Deleting File] Path: ${file.path}`, err);
                        }
                    }
                });

                // 원래 deleteMany 동작 실행
                return query(args);
            },
        },
    },
});

export default prisma;