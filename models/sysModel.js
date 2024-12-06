import fs from 'fs';
import { promises as Fs } from 'fs';
import Path from 'path';
import Excel from 'exceljs';

import logger from '../utils/logger.js';

// check if file exist
export const existFile = async (path) => {
  try {
    await Fs.access(path);
    return true;
  } catch {
    return false;
  }
};

// move file
export const moveFile = async (folderFrom, folderTo, fileName) => {
  // create folder if not exist
  if (!fs.existsSync(folderTo)) {
    await fs.promises.mkdir(folderTo, { recursive: true });
  }
  // copy the files
  let distinctPath = Path.join(folderTo, fileName);
  if (!(await existFile(distinctPath))) {
    await fs.promises.copyFile(folderFrom, distinctPath);
    logger.info(`File Copy to ${folderTo}/${fileName} Successfully.`);
    return true;
  } else {
    logger.info(`Not Moved as file of ${folderTo}/${fileName} existed.`);
    return false;
  }
};

// write xlsx file
export const writeExcel = async (
  datas = {}, // { sheet_name: data }
  path,
  filename,
  ext = 'xlsx'
) => {
  let workbook = new Excel.Workbook();
  for (let sheetName in datas) {
    let data = datas[sheetName];
    let worksheet = workbook.addWorksheet(sheetName);
    // create the columns
    let _columns = [];
    for (let key of Object.keys(data[0])) {
      _columns.push({ header: key });
    }
    worksheet.columns = _columns;
    // append the data
    for (let row of data) {
      worksheet.addRow(Object.values(row));
    }
    await workbook.xlsx.writeFile(Path.join(path, `${filename}.${ext}`));
  }
};

// exports.moveFile = moveFile;
// exports.writeExcel = writeExcel;
