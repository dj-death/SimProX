let XLSX = require('xlsx-style');
let fs = require('fs-extra');
let extraString = require('string');
let XLSXPopulate = require('xlsx-populate');
let JSON2XLSX = require('icg-json-to-xlsx');

import path = require('path');


import console = require('./logger');

import Mapping = require('./Mapping');
import config = require('../config');


function generateReportFileName(teamId, groupId, period, year) {
    let groupStr = extraString(groupId).padLeft(2, '0').s;
    let periodStr = config.periodsStr[period - 1];
    let str: string = `W ${groupStr} ${teamId} ${periodStr}.xlsx`;

    return str;
}

function makeReport(wbPath, data, cb) {
    //let re = /\{{(?:(.+?):)?(.+?)(?:\.(.+?))?}}/;
    let sheetTitle = "W";

    let workbook = XLSX.readFile(wbPath);
    let worksheet = workbook.Sheets[sheetTitle];

    XLSXPopulate.fromFile(wbPath, function (err, iWorkbook) {
        if (err) {
            return console.debug(err);
        }

        let iSheet = iWorkbook.getSheet(sheetTitle);
        let binaryOutput;


        for (let cellAddress in Mapping) {
            let iCell = iSheet.getCell(cellAddress);
            let key = Mapping[cellAddress];
            let newValue = data[key];

            if (!newValue) {
                newValue = key === "reportDate" ? (new Date()).toLocaleDateString() : 0;
            }

            if (typeof newValue === "object") {
                newValue = JSON.stringify(newValue);
            }

            iCell.setValue(newValue);
        }

        binaryOutput = iWorkbook.output();

        cb.apply(null, [binaryOutput]);

    });
}


export function excelExport(reportData, res, lang) {
    let reportTmplPath = config.getReportModelPath(lang);

    let groupId = reportData.groupId || 1;
    let teamId = reportData.d_CID || 1;
    let period = reportData.period || 1;
    let year = reportData.year || 2014;

    let fileName = generateReportFileName(teamId, groupId, period, year);

    makeReport(reportTmplPath, reportData, function (binary) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
        res.end(binary, 'binary');
    });

}


export function excelImport(wbPath) {
    let workbook = XLSX.readFile(wbPath),
        Wsheet,
        reportData;

    if (!workbook) {
        console.debug('error : not a valid excel file');
        return null;
    }

    Wsheet = workbook.Sheets["W"];

    if (!Wsheet) {
        console.debug('error : not a valid excel report');
        return null;
    }

    reportData = {};

    for (let cellAddress in Mapping) {
        let cell = Wsheet[cellAddress];

        if (!cell) {
            console.debug(Mapping[cellAddress] + ' @ ' + cellAddress + ' not found !');
            continue;
        }

        reportData[Mapping[cellAddress]] = cell.v;
    }

    return reportData;
}


/*
let Datastore = require('nedb');
let simulationDb = global.simulationDb || new Datastore({ filename: './sim.nosql', autoload: true });

let Excel = require('./utils/Excel')

simulationDb.find({}, function (err, companies) {
        Excel.dbToExcel(companies);
});

 */

export function dbToExcel(res) {
    let file = './a.xlsx'
    fs.ensureFileSync(file);

    let workbook = XLSX.readFile(file),
        aSheet = workbook.Sheets["a"];

    let Datastore = require('nedb');
    let simulationDb = new Datastore({ filename: config.simulationDbPath + './sim.nosql', autoload: true });


    simulationDb.find({}, function (err, data) {

        JSON2XLSX.writeFile("./a.xlsx", data);


        /*XLSXPopulate.fromFile(file, function (err, iWorkbook) {
            if (err) {
                return console.debug(err);
            }

            let sheet = iWorkbook.getSheet(0);

            let colNb,
                rowNb,
                cell,

                property;

            let count = data.length;

            // first creating headers
            for (let cellAddress in Mapping) {

                if (!Mapping.hasOwnProperty(cellAddress)) {
                    continue;
                }

                property = Mapping[cellAddress];

                colNb = parseInt(cellAddress.match(/[0-9]+/g)[0]); // extract from A17 row 17
                rowNb = 1;

                cell = sheet.getCell(rowNb, colNb);

                cell.setValue(property);

                console.debug("Column ", colNb);

                let i = 0,
                    record,
                    value;

                for (; i < count; i++) {
                    record = data[i];
                    rowNb = i + 2;
                    cell = sheet.getCell(rowNb, colNb);

                    console.debug("Col", colNb, " / Row ", rowNb);

                    value = record[property];

                    if (!value) {
                        //value = property === "reportDate" ? (new Date()).toLocaleDateString() : 0;

                        continue;
                    }

                    if (typeof value === "number") {
                        cell.setValue(value);
                    }



                }
            }

            let binary = iWorkbook.output();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=analyse.xlsx");
            res.end(binary, 'binary');

        }); */
    });
}
