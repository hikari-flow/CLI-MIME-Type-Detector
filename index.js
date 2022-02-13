"use strict";

// Dependencies
const colors = require('colors/safe');

// Local dependencies
const cli = require('./cli-controller.js');
const csv = require('./csv.js');

// Global variables
let userInput = process.argv.slice(2);
let inputValues = {};

main();

async function main() {

    initInputValues();

    // If user passsed arguments
    if (userInput.length) {

        // If first argument is a flag
        if (userInput[0][0] == '-') {
            console.error(colors.red('\n**ERROR** First argument cannot be a flag.\n'));
            process.exit(1);
        }

        // Parse args into inputValues
        for (const inputId of Object.keys(cli.template)) {
            if (!userInput.length) {
                break;
            }

            let inputObj = cli.parseOneArg({ userInput, inputId });
            Object.assign(inputValues, inputObj);
        }

        // If user entered too many args, reset values
        if (userInput.length) {
            console.error(colors.red('\n**ERROR** Too many arguments\n'));
            userInput = [];
            initInputValues();
        }

        // Validation
        for (const inputId of Object.keys(cli.template)) {
            let argValid = false;

            if (!inputValues[inputId].value == '') {
                argValid = validateInput({ inputId });
            }

            // Get user input if isn't valid or empty because user didn't provide enough args
            while (!argValid) {
                if (!argValid) {
                    await getUserInput({ inputId });
                }

                argValid = validateInput({ inputId });
            }
        }
    } else {
        for (const inputId of Object.keys(cli.template)) {
            await getUserInput({ inputId });
        }
    }

    await csv.generateCsv({
        inputPath: inputValues.inputPath.value,
        flags: inputValues.inputPath.flags,
        outputPath: inputValues.outputPath.value
    });

    console.log(colors.green('\nDone.\n'));
    process.exit(0);
}

function initInputValues() {
    for (const inputId of Object.keys(cli.template)) {
        let inputObj = {};
        inputObj[inputId] = {};
        inputObj[inputId].value = '';
        inputObj[inputId].flags = [];
        Object.assign(inputValues, inputObj);
    }
}

async function getUserInput({ inputId }) {
    let argValid = false;

    // Continue to request input until user does it correctly
    while (!argValid) {
        // Request user input
        userInput = await cli.get({ inputId });

        // Parse input and add to inputValues
        Object.assign(inputValues, cli.parseOneArg({ userInput, inputId }));

        argValid = validateInput({ inputId });
    }
}

function validateInput({ inputId }) {
    if (cli.validate.args({ userInput, inputId, inputValues })
        && cli.validate.value({ inputId, inputValues })
        && cli.validate.flags({ inputId, inputValues })) {

        return true;
    }

    return false;
}
