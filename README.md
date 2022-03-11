# CLI-MIME-Type-Detector
Find the MIME type of files in a directory via Node.js command-line and generate a .csv that lists all files and their filetypes.

This was all written in JavaScript as a Node.js app.

1. "cd" into the folder where the index.js file is located. Type "node index.js" and hit enter.
2. It will ask for:
    - Input Path = Path to directory of files you want to detect the mime type for. You can pass an -r flag if you want to recursively include files in its subdirectories.
    - Output Path = Path where you want the csv file to be generated. If only a path is passed in, the default filename will be "output.csv". If you want a different filename, pass in a path\filename.csv or any other extension. It really doesn't matter.
3. Alternatively you can pass in arguments before running the program like so (if only 1 arg is passed in, Output Path will be requested):
    - InputPath –flag OutputPath\file.csv
    - InputPath –flag OutputPath
    - InputPath OutputPath
    - InputPath
