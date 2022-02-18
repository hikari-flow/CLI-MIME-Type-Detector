"use strict";

/**
 * 
 * https://www.garykessler.net/library/file_sigs.html
 * 
**/

// Dependencies
const fs = require('fs');

// Global variables


exports.detect = function ({ filePath }) {
    let mns = []; // Magic Numbers as an ASCII string
    let exts = [];
    let data = fs.readFileSync(filePath);
    let type = 'Unknown';

    loadFiletypes();

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

function loadFiletypes() {
    const data = fs.readFileSync('file.types', 'utf8');

    let lines = data.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const split = lines[i].split(':');

        if (split[0] != '') {
            exts.push(split[0]);
            mns.push(split[1]);
        }
    }
}
