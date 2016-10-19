"use strict";
var XLSX = require('xlsx-style');
var fs = require('fs-extra');
var extraString = require('string');
var XLSXPopulate = require('xlsx-populate');
var JSON2XLSX = require('icg-json-to-xlsx');
var console = require('./logger');
var Mapping = require('./Mapping');
var config = require('../config');
function generateReportFileName(teamId, groupId, period, year) {
    var str = "W{{groupId}}{{teamId}}{{period}}.xlsx";
    var groupStr = extraString(groupId).padLeft(2, '0').s;
    var periodStr = config.periodsStr[period - 1];
    var values = {
        groupId: groupStr,
        teamId: teamId,
        period: periodStr
    };
    return extraString(str).template(values).s;
}
function makeReport(wbPath, data, cb) {
    //var re = /\{{(?:(.+?):)?(.+?)(?:\.(.+?))?}}/;
    var sheetTitle = "W";
    var workbook = XLSX.readFile(wbPath);
    var worksheet = workbook.Sheets[sheetTitle];
    XLSXPopulate.fromFile(wbPath, function (err, iWorkbook) {
        if (err) {
            return console.debug(err);
        }
        var iSheet = iWorkbook.getSheet(sheetTitle);
        var binaryOutput;
        for (var cellAddress in Mapping) {
            var iCell = iSheet.getCell(cellAddress);
            var key = Mapping[cellAddress];
            var newValue = data[key];
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
function excelExport(reportData, res, lang) {
    var reportTmplPath = config.getReportModelPath(lang);
    var groupId = reportData.groupId || 1;
    var teamId = reportData.d_CID || 1;
    var period = reportData.period || 1;
    var year = reportData.year || 2014;
    var fileName = generateReportFileName(teamId, groupId, period, year);
    makeReport(reportTmplPath, reportData, function (binary) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
        res.end(binary, 'binary');
    });
}
exports.excelExport = excelExport;
function excelImport(wbPath) {
    var workbook = XLSX.readFile(wbPath), Wsheet, reportData;
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
    for (var cellAddress in Mapping) {
        var cell = Wsheet[cellAddress];
        if (!cell) {
            console.debug(Mapping[cellAddress] + ' @ ' + cellAddress + ' not found !');
            continue;
        }
        reportData[Mapping[cellAddress]] = cell.v;
    }
    return reportData;
}
exports.excelImport = excelImport;
/*
var Datastore = require('nedb');
var simulationDb = global.simulationDb || new Datastore({ filename: './sim.nosql', autoload: true });

var Excel = require('./utils/Excel')

simulationDb.find({}, function (err, companies) {
        Excel.dbToExcel(companies);
});

 */
function dbToExcel(res) {
    var file = './a.xlsx';
    fs.ensureFileSync(file);
    var workbook = XLSX.readFile(file), aSheet = workbook.Sheets["a"];
    var Datastore = require('nedb');
    var simulationDb = new Datastore({ filename: config.simulationDbPath + './sim.nosql', autoload: true });
    simulationDb.find({}, function (err, data) {
        JSON2XLSX.writeFile("./a.xlsx", data);
        /*XLSXPopulate.fromFile(file, function (err, iWorkbook) {
            if (err) {
                return console.debug(err);
            }

            var sheet = iWorkbook.getSheet(0);

            var colNb,
                rowNb,
                cell,

                property;

            var count = data.length;

            // first creating headers
            for (var cellAddress in Mapping) {

                if (!Mapping.hasOwnProperty(cellAddress)) {
                    continue;
                }

                property = Mapping[cellAddress];

                colNb = parseInt(cellAddress.match(/[0-9]+/g)[0]); // extract from A17 row 17
                rowNb = 1;

                cell = sheet.getCell(rowNb, colNb);

                cell.setValue(property);

                console.debug("Column ", colNb);

                var i = 0,
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

            var binary = iWorkbook.output();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=analyse.xlsx");
            res.end(binary, 'binary');

        }); */
    });
}
exports.dbToExcel = dbToExcel;
//# sourceMappingURL=Excel.js.map