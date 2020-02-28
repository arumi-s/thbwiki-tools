const fs = require('fs');
const path = require('path');
const angular = require('./angular.json');

const options = angular.projects[angular.defaultProject].architect.build.options;
const { index, assets } = options;
const deployUrl = 'src/';
const outputPath = 'dist/thbwiki-tools/src';
const outputDir = path.join(__dirname, outputPath);

assets.push(index);
assets.forEach(dir => {
	let filename = path.relative(deployUrl, dir);
	while (path.dirname(filename) !== '.') {
		filename = path.dirname(filename);
	}
	const source = path.join(outputDir, filename);
	const target = path.join(outputDir, '..', filename);
	if (fs.existsSync(source)) {
		console.log(`\x1b[37mMoving: \x1b[33m"${source}"\x1b[37m to \x1b[32m"${target}"`);
		if (fs.existsSync(target)) fs.unlinkSync(target);
		fs.renameSync(source, target);
	} else {
		console.log(`\x1b[37mNot Found: \x1b[33m"${source}"`);
	}
});

console.log(`\x1b[37mFinished`);
