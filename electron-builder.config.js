

const isWin32 = process.platform === "win32";
const isDorwin = process.platform === "darwin";

exports.default = function () {

    // 基础忽略规则
    const commonIgnore = [
        "!**/*.map",
        "!**/*.md",
        "!**/*.txt",
        "!**/__tests__/**",
        "!node_modules/*/{test,__tests__,examples,docs}/**"
    ];

    // 针对平台的差异化忽略
    let platformIgnore = [];
    if (isWin32) {
        // Windows 打包时，去掉 mac 和 linux
        platformIgnore = [
            "!node_modules/ffprobe-static/bin/darwin/**",
            "!node_modules/ffprobe-static/bin/linux/**",
        ];
    } else if (isDorwin) {
        // Mac 打包时，去掉 win 和 linux
        platformIgnore = [
            "!node_modules/ffprobe-static/bin/win32/**",
            "!node_modules/ffprobe-static/bin/linux/**"
        ];
    }

    return {
        appId: "com.fastscreen.app",
        artifactName: "fastscreen-${os}-${arch}-${version}.${ext}",
        productName: "fastscreen",
        afterPack: "./removeLocales.js",
        // afterSign:"",//应用签名 mac必须要
        directories: {
            "output": "dist",
            "buildResources": "build"
        },
        extraResources: [
            {
                "from": "resources/",
                "to": "resources",
                "filter": [
                    "**/*"
                ]
            }
        ],
        files: [
            "out/**/*",
            ...commonIgnore,
            ...platformIgnore

        ],
        nsis: {
            language: "2052",//安装向导界面（按钮、提示语）都会显示成 简体中文
            oneClick: false, // 设置为 false 以提供安装类型选择界面，允许用户选择是否创建桌面图标，允许用户选择安装路径
            perMachine: true, // 设置为 true 将使安装程序默认为所有用户安装应用，这需要管理员权限
            allowToChangeInstallationDirectory: true, // 如果设置为 true，安装程序将允许用户更改安装目录
            allowElevation: true, // 一般情况下，此字段不会被直接使用，权限提升主要依赖于 perMachine 的设定。当perMachine为true，安装程序会请求管理员权限
            deleteAppDataOnUninstall: true, // 如果设置为 true，卸载程序将删除AppData中的所有程序数据
            createDesktopShortcut: true, // 如果设置为 true，安装程序将在桌面上创建程序快捷方式
            createStartMenuShortcut: true, // 如果设置为 true，安装程序将在开始菜单中创建程序快捷方式
            shortcutName: "fastscreen", // 设置在桌面和开始菜单中创建的快捷方式的名称
        },
        win: {
            "icon": "resources/icon512.ico",
            "target": [
                {
                    "target": "nsis",
                    "arch": [
                        "ia32"
                    ]
                }
            ]
        },
        mac: isWin32 ? {} : {
            "icon": "resources/icon512.icns",
            category: "public.app-category.productivity",//工具类
            target: [
                {
                    target: "dmg", // 生成 dmg 安装包
                    arch: ["x64", "arm64"] // 同时支持 Intel 和 Apple Silicon
                },
                {
                    target: "zip", // 再生成一个 zip 包
                    arch: ["x64", "arm64"]
                }
            ]
        }
    }
}