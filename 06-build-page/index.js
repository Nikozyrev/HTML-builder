const path = require('path');
const fs = require('fs');
const { mkdir, copyFile, readdir, rm, readFile, writeFile } = require('fs/promises');

// Make dir
async function createDir(destPath) { 
  try {
    const destDir = await mkdir(destPath, { recursive: true });
    // console.log(`Folder has been created. Path: ${destPath}`);
  } catch (error) {
    console.error(error.message);
  }
}

// Copy assets
async function getElemsFromFolder(path) {
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
  const destDir = await createDir(destPath);

  const files = await getElemsFromFolder(copyPath);

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

// Merge styles
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

  const distPath = path.join(__dirname, 'project-dist', 'style.css');
  const output = fs.createWriteStream(distPath);

  for (const file of styleFiles) {
    const filePath = path.join(stylesFolder, file);

    const stream = fs.createReadStream(filePath, 'utf-8');

    let fileData = '';

    stream.on('data', (data) => (fileData += data));
    stream.on('end', () => output.write(fileData + "\r\n"));
    stream.on('error', (err) => console.log(err.message));
  }
}

// Create html
async function readTemplate(filePath) {
  try {
    const fileContent = await readFile(filePath, { encoding: 'utf8' });
    return fileContent;
  } catch (error) {
    console.error(error);
  }
}

async function replaceTemplateTags(htmlString) {
  const tags = htmlString.match(/{{.*}}/ig);
  const componentsFiles = tags.map(el => el.substr(2, el.length -4).concat('.html'));
  
  const result = [];
  for (const file of componentsFiles) {
    const filePath = path.join(__dirname, 'components', file);
    const fileContent = await readTemplate(filePath);
    result.push({tag: `{{${file.replace('.html', '')}}}`, fileContent})
  }

  let resultStr = htmlString;
  for (const tag of tags) {
    resultStr = resultStr.replace(tag, result.find(el => el.tag === tag).fileContent)
  }
  
  return resultStr;
}

// Combine functions for script
const projectPath = path.join(__dirname, 'project-dist');

async function buildPage(projectDistPath) {
  // Create dist folder
  await createDir(projectDistPath);

  // Copy assets
  const assetsPath = path.join(__dirname, 'assets');
  const assetsDistPath = path.join(projectDistPath, 'assets');
  copyDir(assetsPath, assetsDistPath);

  // Merge styles
  const stylesFolder = path.join(__dirname, 'styles');
  mergeStyles(stylesFolder);

  // Create html
  const templatePath = path.join(__dirname, 'template.html');
  
  const templateContent = await readTemplate(templatePath);
  const replacedContent = await replaceTemplateTags(templateContent);
  
  const htmlPath = path.join(projectDistPath, 'index.html');
  try {
    writeFile(htmlPath, replacedContent)
  } catch (error) {
    console.error(error);
  }
}

buildPage(projectPath);