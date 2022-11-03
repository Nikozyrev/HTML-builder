const path = require('path');
const fs = require('fs');
const { readdir } = require('fs/promises');

const stylesFolder = path.join(__dirname, 'styles');

async function getFilesFromFolder(path) {
  try {
    const dirElements = await readdir(path, {encoding: 'utf8', withFileTypes: true});
    const files = [];
    for (const elem of dirElements) {
      if (elem.isFile()) {
        files.push(elem.name);
      }
    }
    return files;
  } catch (error) {
    console.error(error);
  }
}

function getCSSFiles(files) {
  const result = [];
  for (const file of files) {
    const extname = path.extname(file);
    if (extname === '.css') {
      result.push(file);
    }
  }
  return result;
}

async function mergeStyles(stylesFolder) {
  const files = await getFilesFromFolder(stylesFolder);
  const styleFiles = getCSSFiles(files);

  const distPath = path.join(__dirname, 'project-dist', 'bundle.css');
  const output = fs.createWriteStream(distPath);

  for (const file of styleFiles) {
    const filePath = path.join(stylesFolder, file);

    const stream = fs.createReadStream(filePath, 'utf-8');

    let fileData = '';

    stream.on('data', (data) => (fileData += data));
    stream.on('end', () => output.write(fileData));
    stream.on('error', (err) => console.log(err.message));
  }
}

mergeStyles(stylesFolder);