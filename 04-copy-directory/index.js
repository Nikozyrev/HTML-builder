const { mkdir, copyFile, readdir, rm } = require('fs/promises');
const path = require('path');

async function createDirCopy(destPath) { 
  try {
    const destDir = await mkdir(destPath, { recursive: true });
    console.log(`Folder has been created. Path: ${destPath}`);
  } catch (error) {
    console.error(error.message);
  }
}

async function getFilesFromFolder(path) {
  try {
    const dirElements = await readdir(path, {encoding: 'utf8', withFileTypes: true});
    return dirElements;
  } catch (error) {
    console.error(error);
  }
}

async function copyDir(copyPath, destPath) {
  // Remove folder if it exists
  try {
    await rm(destPath, {recursive: true, force: true} );
  } catch (error) {
    console.error(error.message);
  }

  // Create folder
  const destDir = await createDirCopy(destPath);

  const files = await getFilesFromFolder(copyPath);

  for (const file of files) {
    const filePath = path.join(copyPath, file.name);
    const fileDestPath = path.join(destPath, file.name);

    if (file.isDirectory()) {
      copyDir(filePath, fileDestPath);
    }

    if (file.isFile()) {
      try {
        copyFile(filePath, fileDestPath);
      } catch (error) {
        console.error(error.message);
      }
    }
  }
}

copyDir(path.join(__dirname, 'files') , path.join(__dirname, 'files-copy'));