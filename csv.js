"use strict";

// Dependencies
const colors = require('colors/safe');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Local dependencies
const cli = require('./cli-controller.js');
const magicNum = require('./magic-number.js');

exports.generateCsv = async function ({ inputPath, flags, outputPath }) {
    const acceptedFiletypes = new Set(['jpeg', 'pdf']);

    // If user pointed to a directory instead of a file for outputPath, create an output.csv file
    if (fs.statSync(outputPath).isDirectory()) {
        outputPath = path.join(outputPath, 'output.csv');
    }

    // Get list of files and put them into an array
    let fileList = [];
    cli.template.inputPath.getFiles({ inputPath, flags, fileList });

    // Write accepted file types into a CSV file
    let csvData = `File Path, Detected Filetype, MD5 Hash\n`;

    for (const filePath of fileList) {
        let filetype = magicNum.detect({ filePath });

        if (acceptedFiletypes.has(filetype)) {
            let md5 = '';

            try {
                md5 = await getHash({ filePath, algo: 'md5' });
            } catch (err) {
                console.error(colors.red(err));
                process.exit(1);
            }

            csvData += `"${filePath}", ${filetype}, ${md5}\n`;
        }
    }

    try {
        fs.writeFileSync(outputPath, csvData, 'utf8');
    } catch (err) {
        console.error(colors.red(`\n**ERROR** Could not write to file: ${outputPath}\n`));
        process.exit(1);
    }
}

function getHash({ filePath, algo }) {
    return new Promise((resolve, reject) => {
        const hashRs = fs.createReadStream(filePath);
        let hash = crypto.createHash(algo);

        hashRs.on('data', function (chunk) {
            hash.update(chunk);
        });

        hashRs.on('error', function (err) {
            reject(err);
        });

        hashRs.on('end', function () {
            resolve(hash.digest('hex'));
        });
    });
}
