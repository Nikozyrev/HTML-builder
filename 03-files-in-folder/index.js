const path = require('path');
const fs = require('fs');
const { readdir, open } = require('fs/promises');
// const { dirname } = require('path');

const secretFolderPath = path.join(__dirname, 'secret-folder');

async function getFilesFromFolder(path) {
  try {
    const dirElements = await readdir(path, {encoding: 'utf8', withFileTypes: true});
    const files = [];
    for (const elem of dirElements) {
      if (elem.isFile()) {
        files.push(elem);
      }
    }
    return files;
  } catch (error) {
    console.error(error);
  }
}

async function printFilesInfo() {
  const files = await getFilesFromFolder(secretFolderPath);
  for (const file of files) {
    const name = file.name;
    const filePath = path.join(__dirname, 'secret-folder', name);
    const extName = path.extname(filePath);
    const baseName = path.win32.basename(filePath, extName);

    let fileOpen;
    let fileStat;
    try {
      fileOpen = await open(filePath, 'r');
      const stat = await fileOpen.stat();
      
      fileStat = stat;
    } finally {
      await fileOpen.close();
    }
    const fileSize = Math.fround(fileStat.size / 1024);
    console.log(`${baseName} - ${extName.slice(1)} - ${fileSize} kB`);
  }
}

printFilesInfo();