import test from 'ava';

var path = require("path");
var fs   = require("fs");
var prp_path = path.join(path.dirname(__filename), "..");
var prp = require(path.join(prp_path, "src/prpfmt.js"));


function reportDifferences(bufA, bufB) {
    var len = bufA.length;
    if (len !== bufB.length) {
        return false;
    }
    for (var i = 0; i < len; i++) {
        if (bufA[i] != bufB[i]) {
            console.log("char %d [%s] != [%s]", i, bufA[i], bufB[i]);
            return false;
        }
    }
    return true;
}


const testFolder = path.join(prp_path,'tests/fmt/inputs/');

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
    test(file, t => {
      var src = fs.readFileSync(path.join(prp_path, "tests/fmt/inputs", file)).toString();
      var dst = fs.readFileSync(path.join(prp_path, "tests/fmt/outputs", file)).toString();
      var dst2 = prp.prpfmt(prp_path, file, src);

      t.true(dst.length == dst2.length);
      t.true(reportDifferences(dst,dst2));
    });
  });
})


test('test2', t => {
  var src = fs.readFileSync(path.join(prp_path, "tests/fmt/inputs/test2.prp")).toString();
  var dst = fs.readFileSync(path.join(prp_path, "tests/fmt/outputs/test2.prp")).toString();
  var dst2 = prp.prpfmt(prp_path, "test2.prp", src);

  t.true(dst.length == dst2.length);
  t.true(reportDifferences(dst,dst2));
});

