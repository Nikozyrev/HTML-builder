const path = require('path');
const fs = require('fs');

const textFilePath = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(textFilePath, 'utf-8');

let fileData = '';

stream.on('data', (data) => (fileData += data));
stream.on('end', () => console.log(fileData));
stream.on('error', (err) => console.log(err.message));
