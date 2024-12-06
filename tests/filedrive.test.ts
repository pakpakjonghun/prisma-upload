/**
 * ----------------------------------------------------------------------------
 * tests/modules/module.test.ts
 *
 * [Test]
 * 모듈(built-in)에 대한 injector 등의 작동이 올바른지 검사합니다.
 * ----------------------------------------------------------------------------
 */
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

import { uploadFile } from "../src/api/handler";

// Logger: Info
function log(message: string) {
    console.log(`\x1b[37m ℹ️ [Drive Test] ${message}\x1b[0m`);
}
// Logger: Success
function logSuccess(message: string) {
    console.log(`\x1b[32m✔️ [Drive Test][SUCCESS] ${message}\x1b[0m`);
}
// Logger: Error
function logError(message: string) {
    console.log(`\x1b[31m❌ [Drive Test][ERROR] ${message}\x1b[0m`);
}

describe("(DRIVE case.0) 드라이브 파일 테스트 ", () => {
    let testTempDir: string = "";

    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(async () => {
        // 임시 모듈 실행 스크립트 경로 설정
        testTempDir = path.resolve(__dirname, `test-case-0-${Date.now()}`);
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        await fs.promises.mkdir(testTempDir);
    });

    afterEach(() => {
        // 임시 모듈 실행 스크립트 삭제
        if (fs.existsSync(testTempDir)) {
            fs.rmSync(testTempDir, { recursive: true, force: true }); // 디렉토리와 하위 파일 삭제
        }
    });

    it("(MODULE case.0-1) 파일을 업로드하지 않는 경우 테스트", async () => {
        req.file = undefined;

        await uploadFile(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("No file uploaded");
    });

    it("should upload a file and store metadata in the database", async () => {
        req.file = {
            originalname: "img.jpg",
            mimetype: "image/jpeg",
            path: "/fake/path/testfile.txt",
            size: 61440
        } as Express.Multer.File;

        await uploadFile(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "123",
                filename: "testfile.txt"
            })
        );
    });
});
