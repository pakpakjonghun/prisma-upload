/**
 *  _______   ____  ____  ____ _______ _________   ___    _____________________  ____ ______ ____        ____      ______  _______
 * |  _____| /    \ |  \  /  |/  ___  \|____   /   \  \   /  |_  _|/  ____||  |  |  | /    \ |  |        |  |      /    \ |   __  \
 * |  |____ /  /\  \|   \/   |  /   \  | __/  /     \  \ /  / |  || ( ___  |  |  |  |/  /\  \|  |        |  |     /  /\  \|  |_\  /
 * |   ____|   __   |        |  │   │  ||_  __|      \  |  /  |  | \___   \|  |  |  |   __   |  |        |  |    |   __   |   __  \
 * |  |    |  |  |  |  |\/|  |  \___/  |/  /____      \   /   |  |  ____)  |  \__/  |  |  |  |  |____|   |  |____|  |  |  |  |_/  |
 * |__|    |__|  |__|__|  |__|\_______/|________|      \_/   |____||______/ \______/|__|  |__|_______|   |_______|__|  |__|_______/
 *  ___________________     _________    _________________ _______  ________     ____    _______  _________
 *  |  _____||_  _||  |     |  _____|   /  ____||__    __|/  ___  \ |  ___  \   /    \  /   __  \ |  _____|
 *  |  |____  |  | |  |     |  |____   |  ( ___    |  |  |  /   \  ||  |__)  | /  /\  \ |  /  \__||  |____
 *  |   ____| |  | |  |     |  _____|   \___   \   |  |  |  │   │  ||  __   / |   __   ||  | ____ |  _____|
 *  |  |      |  | |  |____ |  |____     ____)  |  |  |  |  \___/  ||  | \  \ |  |  |  ||  \__\  ||  |____
 *  |__|     |____||_______||_______|   |______/   |__|   \_______/ |__|  \__\|__|  |__|\_______/ |_______|
 *
 *
 *
 *
 *
 * @starter nodemon
 * @url https://code.famoz.co.kr
 *
 * @command start: npm run start
 * @command package : npm run release
 */

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import api from "./api"

/**
 * @class
 * @name WWW
 * @description 프로젝트의 시작점
 */
class WWW {
    private static _: WWW;
    private app: express.Application;

    private constructor() {
        this.app = express();
        this.config();
    }

    /**
     * 싱글턴 객체 가져오기
     */
    public static root = (): WWW => {
        if (WWW._ == undefined) {
            WWW._ = new WWW();
        }
        return WWW._;
    };

    /**
     * 기초 설정
     */
    private config = async () => {
        // #1. 기본 미들웨어 설정
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        // #2. 보안 모듈
        // https://jeong-pro.tistory.com/68
        this.app.use(helmet.xssFilter()); // X-XSS-Protection 보안 헤더
        this.app.use(
            helmet.frameguard({
                // 지정한 사이트에서 프레임을 표시할 수 있음
                action: "deny", // X-Frame-Option
            })
        );
        this.app.use(helmet.noSniff()); // 브라우저 파일 형식 추측 금지
        this.app.use(helmet.hidePoweredBy()); // X-Powered-By 헤더 제거(express hide)

        this.app.use(cors());

        this.app.use(api);

        // this.app.use("/", api);
        this.app.use((req: express.Request, res: express.Response) => {
            res.status(404).send();
        });

        this.app.listen(5000, async () => {
            console.log("filedrive server start");

            // // 파일 생성
            // const newFile = await prisma.file.create({
            //     data: {
            //         filename: "example.txt",
            //         mimetype: "text/plain",
            //         size: 1024,
            //         path: "./uploads/example.txt",
            //     },
            // });
            // console.log("Created file:", newFile);

            // 파일 조회
            // const files = await prisma.file.findMany();
        });
    };
}

/**
 * @start
 * @description 시작점
 */
WWW.root();
