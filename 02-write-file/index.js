const path = require('path');
const fs = require('fs');
const { stdin, stdout } = process;

const textFilePath = path.join(__dirname, 'text.txt');
const output = fs.createWriteStream(textFilePath);

stdout.write('Enter text:\n');

stdin.on('data', data => {
  const inputString = data.toString();
  if (inputString === ('exit\r\n') || inputString === ('exit\n') ) {
    process.exit(0);
  }
  output.write(inputString);
});

process.on('exit', (code) => {
  if (code === 0) {
    stdout.write(`Process finished. Your file ${textFilePath}`);
  } else {
    stdout.write('Some err');
  }
});

process.on('SIGINT', () => {
    process.exit(0);
});