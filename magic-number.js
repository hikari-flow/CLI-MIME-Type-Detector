"use strict";

/**
 * 
 * https://www.garykessler.net/library/file_sigs.html
 * 
**/

// Dependencies
const fs = require('fs');

// Global variables
let mns = []; // Magic Numbers as an ASCII string
let exts = [];

exports.detect = function ({ filePath }) {
    loadFiletypes();

    const filetype = detectType({ data: fs.readFileSync(filePath) });

    return filetype;
}

function loadFiletypes() {
    const data = fs.readFileSync('file.types', 'utf8');

    let lines = data.split('\n');

    for (let i = 0; i < lines.length; i++) {
        let split = lines[i].split(':');

        if (split[0] != '') {
            exts.push(split[0]);
            mns.push(split[1]);
        }
    }
}

function detectType({ data }) {
    let type = 'Unknown';

    for (let i = 0; i < mns.length; i++) {
        let file_mn = '';

        // Convert file's decimal magic numbers to an ASCII string
        for (let x = 0; x < mns[i].length; x++) {
            file_mn += String.fromCharCode(data[x]);
        }

        if (file_mn == mns[i]) {
            type = exts[i];
            break;
        }
    }

    return type;
}
