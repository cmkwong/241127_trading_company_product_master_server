import * as sysModel from '../models/sysModel.js';
import * as emailModel from '../models/emailModel.js';
import catchAsync from '../utils/catchAsync.js';

import Path from 'path';
import Excel from 'exceljs';

// moving files from-to
export const moveFiles = catchAsync(async (req, res, next) => {
  let { movingFileNext } = req.body;
  // filesCopy is Object
  // console.log(req.body.filesCopy);
  if (Object.keys(req.body.filesCopy).length === 0) {
    next();
  }
  let { fileFromPaths, folderTos, fileRenames } = req.body.filesCopy;
  // copy the files into folderTo
  for (const i in fileFromPaths) {
    if (!fileFromPaths[i]) continue;
    // await to finish then running next files
    await sysModel.moveFile(fileFromPaths[i], folderTos[i], fileRenames[i]);
  }
  res.prints = {
    msg: 'Moving File Success.',
  };
  next();

  // if (movingFileNext) {
  //   next();
  // } else {
  //   res.status(200).json({
  //     msg: 'Moving File Success.',
  //   });
  // }
});

// write excel files
export const writeExcel = catchAsync(async (req, res, next) => {
  let { datas, path, filename, ext, options } = req.body; // datas: { sheet_name: data }
  // console.log('Hi', datas, path, filename, ext);
  if (!ext) {
    ext = 'xlsx';
  }
  let data_lengths = [];
  let workbook = new Excel.Workbook();
  for (let [sheetName, data] of Object.entries(datas)) {
    // let data = datas[sheetName];
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
    // xlsx format
    if (ext === 'xlsx') {
      await workbook.xlsx.writeFile(
        Path.join(path, `${filename}.${ext}`),
        options
      );
      // csv / txt format
    } else if (ext === 'csv' || ext === 'txt') {
      await workbook.csv.writeFile(
        Path.join(path, `${filename}.${ext}`),
        options
      );
    }
    data_lengths.push(data.length);
  }
  res.prints = {
    result: data_lengths.join(' '),
  };
  next();
});

export const sendEmail = catchAsync(async (req, res, next) => {
  let { subject, text, filenames } = req.body;
  emailModel.send(subject, text, filenames);

  res.prints = {
    msg: `sent email: ${subject}`,
  };
  next();

  // res.status(200).json({
  //   msg: `sent email: ${subject}`,
  // });
});
