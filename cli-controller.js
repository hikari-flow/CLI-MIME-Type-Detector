"use strict";

// Dependencies
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Template for inputs
exports.template = {
    inputPath: {
        id: 'inputPath',
        name: 'Input Path',
        type: 'path',
        question: 'Input Path: ',
        flags: {
            '-r': 'Recursive = Include all sub-directories within input path.'
        },
        normalize: ({ userInput }) => userInput == '' ? '' : path.normalize(userInput),
        validate: {
            test: ({ userInput }) => fs.existsSync(userInput) && fs.lstatSync(userInput).isDirectory(), // If is a directory and exists
            error: '\n**ERROR** Input Path doesn\'t exist or doesn\'t point to a directory.\n'
        },
        getFiles: ({ inputPath, flags, fileList }) => {
            const files = fs.readdirSync(inputPath);
            let subDirs = [];

            fileList = fileList || [];

            files.forEach(function (file) {
                const filePath = path.join(inputPath, file);

                if (fs.statSync(filePath).isFile()) {
                    fileList.push(filePath);
                } else if (flags.includes('-r')) {
                    subDirs.push(filePath);
                }
            });

            if (subDirs.length) {
                subDirs.forEach((inputPath) => exports.template.inputPath.getFiles({ inputPath, flags, fileList }));
            }

            return fileList;
        }
    },

    outputPath: {
        id: 'outputPath',
        name: 'Output Path',
        type: 'path',
        question: 'Output Path: ',
        flags: false,
        normalize: ({ userInput }) => userInput == '' ? '' : path.normalize(userInput),
        validate: {
            test: ({ userInput }) => fs.existsSync(userInput), // If path exists
            error: '\n**ERROR** Output Path doesn\'t exist.\n'
        }
    }
};

exports.validate = {
    args: function ({ userInput, inputId, inputValues }) {
        if (inputValues[inputId].value[0] == '-') {
            console.error(colors.red('\n**ERROR** First argument cannot be a flag.\n'));
            return false;
        }

        if (userInput.length) {
            console.error(colors.red('\n**ERROR** Too many arguments\n'));
            return false;
        }

        return true;
    },

    value: function ({ inputId, inputValues }) {
        if (inputValues[inputId].value.length == 0) {
            console.error(colors.red('\n**ERROR** Input cannot be empty.\n'));
            return false;
        }

        if (inputValues[inputId].value[0] == '-') {
            console.error(colors.red('\n**ERROR** First argument cannot be a flag.\n'));
            return false;
        }

        // Validate value
        if (!exports.template[inputId].validate.test({ userInput: inputValues[inputId].value })) {
            console.error(colors.red(exports.template[inputId].validate.error));
            return false;
        }

        return true;
    },

    flags: function ({ inputId, inputValues }) {
        for (const flag of inputValues[inputId].flags) {
            if (!exports.template[inputId].flags || flag in exports.template[inputId].flags == false) {
                console.error(colors.red(`\n**ERROR** ${flag} flag not accepted.\n`));
                return false;
            }

            if (inputValues[inputId].flags.indexOf(flag) != inputValues[inputId].flags.lastIndexOf(flag)) {
                console.error(colors.red('\n**ERROR** Duplicate flags.\n'));
                return false;
            }
        }

        return true;
    }
}

exports.get = async function ({ inputId }) {
    const regex = new RegExp('"[^"]+"|[\\S]+', 'g');

    // Ask user for input
    let userInput = await new Promise(resolve => {
        rl.question(exports.template[inputId].question, resolve);
    });

    let argsArray = [];

    // Convert userInput into an array of arguments
    userInput.match(regex).forEach(element => {
        if (!element) return;
        return argsArray.push(element.replace(/"/g, ''));
    });

    return new Promise(resolve => resolve(argsArray.filter(Boolean)));
}

exports.parseOneArg = function ({ userInput, inputId }) {
    let inputObj = {};
    inputObj[inputId] = {};

    inputObj[inputId].value = exports.template[inputId].normalize({ userInput: userInput[0] });
    inputObj[inputId].flags = [];

    userInput.shift();

    // Grab flags
    let isFlag = true;
    while (isFlag === true) {
        if (userInput.length && userInput[0][0] == '-') {
            inputObj[inputId].flags.push(userInput[0]);
            userInput.shift();
        } else {
            isFlag = false;
        }
    }

    return inputObj;
}
