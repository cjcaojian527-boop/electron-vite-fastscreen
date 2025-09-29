
//removeLocales.js
const fs = require("fs");
const path = require('path');


exports.default = async function (context) {

  const platform = process.platform; // 'win32', 'darwin', 'linux'


  // /移除部分用不到的语言、优化electron包的大小
  const localeDir = context.appOutDir + "/locales/";
  fs.readdir(localeDir, function (err, files) {
    //files is array of filenames (basename form)
    if (!(files && files.length)) return;
    for (let i = 0, len = files.length; i < len; i++) {
      // zh 和 en 开头的都不删
      if (!(files[i].startsWith("en") || files[i].startsWith("zh"))) {
        fs.unlinkSync(localeDir + files[i]);
      }
    }
  });


  const arch = context.arch === 0 ? 'ia32' : 'x64';
  
  const ffprobePath = path.join(
    context.appOutDir,
    'resources',
    'app.asar.unpacked',
    'node_modules',
    'ffprobe-static',
    'bin',
    platform
  );

  if (arch === 'ia32' && fs.existsSync(path.join(ffprobePath, 'x64'))) {
    fs.rmSync(path.join(ffprobePath, 'x64'), { recursive: true, force: true });
  } else if (arch === 'x64' && fs.existsSync(path.join(ffprobePath, 'ia32'))) {
    fs.rmSync(path.join(ffprobePath, 'ia32'), { recursive: true, force: true });
  }


};