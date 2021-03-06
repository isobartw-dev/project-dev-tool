var fs = require('fs');
var path = require('path');
var os = require('os');
var Registry = require('winreg');
var regKey = new Registry({
  // new operator is optional
  hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders\\' // key containing autostart programs
});
var files = [path.dirname(__dirname) + '/task/watch-image.js'];

exports = module.exports = {};
exports.setImgDir = function () {
  function writePath (files, outputDir) {
    files.forEach(function (item, index, arr) {
      var read = fs.readFileSync(item).toString();
      var result;

      result = read.replace('[desktop]', outputDir.replace(/\\/g, '\\\\') + '\\\\Output\\\\');

      fs.writeFileSync(item, result, 'utf8');
    });
  }

  fs.stat(os.homedir() + '\\desktop\\output', function (error, stats) {
    if (error) {
      regKey.values(function (err, items) {
        if (err) {
          console.log('ERROR: ' + err);
        } else {
          for (var i = 0; i < items.length; i++) {
            if (items[i].name === 'Desktop') {
              var outputDir = items[i].value;
              writePath(files, outputDir);
            }
          }
        }
      });
    } else {
      var outputDir = os.homedir() + '\\desktop\\output';
      writePath(files, outputDir);
    }
    console.log('Output 資料夾位置設定完成');
  });
};
exports.clearSet = function () {
  files.forEach(function (item, index, arr) {
    var read = fs
      .readFileSync(item)
      .toString()
      .split('\n');
    var line = read.findIndex(function (value, index, obj) {
      return value.indexOf('imageFolder.push') > -1;
    });

    read.splice(line, 1, "imageFolder.push('[desktop]');\r");
    fs.writeFileSync(item, read.join('\n'), 'utf8');
  });

  console.log('清空 Output 資料夾位置');
};
