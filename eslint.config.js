// eslint.config.js
module.exports = [
    {
        ignorePatterns: [
            "node_modules/",
            "build/", // 빌드 폴더
            "public/", // 정적 파일 폴더
            "tests/", // 테스트 폴더
            "frontend/" // 프론트엔드 프로젝트
        ],
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module"
        },
        plugins: {
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
            import: require("eslint-plugin-import")
        },
        rules: {
            indent: ["error", 4],
            "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
            "import/order": ["error"],
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "no-undef": "off",
            "no-multiple-empty-lines": [
                "error",
                {
                    max: 2,
                    maxBOF: 0,
                    maxEOF: 0
                }
            ]
        }
    }
];
