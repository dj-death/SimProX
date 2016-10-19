"use strict";
var XLSX = require('xlsx-style');
var fs = require('fs-extra');
var path = require('path');
var extraString = require("string");
var XLSXPopulate = require('xlsx-populate');
var JSON2XLSX = require('icg-json-to-xlsx');
var Mapping = require('./Mapping');
var console = require('../../kernel/utils/logger');
var config = require('../../config');
function makeReport(wbPath, data, cb) {
    //let re = /\{{(?:(.+?):)?(.+?)(?:\.(.+?))?}}/;
    var sheetTitle = "W";
    var workbook = XLSX.readFile(wbPath);
    var worksheet = workbook.Sheets[sheetTitle];
    XLSXPopulate.fromFile(wbPath, function (err, iWorkbook) {
        if (err) {
            cb.apply(null, [err, null]);
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
                //newValue = JSON.stringify(newValue); TODO: see if wrong but Je pense pas qu'il est nécessaire
                continue;
            }
            if (typeof newValue === "function ") {
                continue;
            }
            iCell.setValue(newValue);
        }
        binaryOutput = iWorkbook.output();
        cb.apply(null, [null, binaryOutput]);
    });
}
function excelExport(reportData, opts, cb) {
    var lang = opts.lang || config.engine.defaultLang;
    var reportTmplPath = config.engine.getReportModelPath(lang);
    var options = {
        seminar: reportData.seminar || 1,
        playerID: reportData.playerID || 1,
        period: reportData.period || 1,
        year: reportData.period_year || 2014,
    };
    makeReport(reportTmplPath, reportData, function (err, binary) {
        cb && cb.apply(null, [err, binary]);
    });
}
exports.excelExport = excelExport;
;
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
            console.log(Mapping[cellAddress] + ' @ ' + cellAddress + ' not found !');
            continue;
        }
        var value = cell.v;
        if (!isNaN(value)) {
            value = Number(value);
        }
        reportData[Mapping[cellAddress]] = value;
    }
    return reportData;
}
exports.excelImport = excelImport;
;
function dbToExcel(res) {
    var file = './a.xlsx';
    fs.ensureFileSync(file);
    var workbook = XLSX.readFile(file), aSheet = workbook.Sheets["a"];
    var Datastore = require('nedb');
    var simulationDb = new Datastore({ filename: config.engine.simulationDbPath + './sim.nosql', autoload: true });
    simulationDb.find({}, function (err, data) {
        JSON2XLSX.writeFile("./a.xlsx", data);
        /*XLSXPopulate.fromFile(file, function  (err, iWorkbook) {
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
exports.dbToExcel = dbToExcel;
;
function exportExcel(req, res, next) {
    var xlsx = require('node-xlsx');
    var fs = require('fs');
    var name = 'app/upload/' + req.body.name;
    var obj = {
        worksheets: [{
                name: req.body.name,
                data: req.body.data
            }]
    };
    var file = xlsx.build(obj);
    try {
        fs.writeFileSync(name, file, 'binary');
    }
    catch (err) {
        res.send(400);
    }
    res.send(200);
}
exports.exportExcel = exportExcel;
;
// export function  testGet=function (req,res,next){
// 	let conf ={};
//   // uncomment it for style example  
//   // conf.stylesXmlFile = "styles.xml";
//     conf.cols = [{
//         caption:'string',
//         captionStyleIndex: 1,        
//         type:'string',
//         beforeCellWrite:function (row, cellData){
//              return cellData.toUpperCase();
//         }
//         , width:28.7109375
//     },{
//         caption:'date',
//         type:'date',
//         beforeCellWrite:function (){
//             let originDate = new Date(Date.UTC(1899,11,30));
//             return function (row, cellData, eOpt){
//               // uncomment it for style example 
//               // if (eOpt.rowNum%2){
//                 // eOpt.styleIndex = 1;
//               // }  
//               // else{
//                 // eOpt.styleIndex = 2;
//               // }
//               return (cellData - originDate) / (24 * 60 * 60 * 1000);
//             } 
//         }()
//         , width:20.85
//     },{
//         caption:'bool',
//         type:'bool'
//     },{
//         caption:'number',
//         type:'number',
//         width:10.42578125 
//     }];
//     conf.rows = [
//     	['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
//       	["e", new Date(2012, 4, 1), false, 2.7182],
//       	["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.2]   
//     ];
//     let result = nodeExcel.execute(conf);
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats');
//     res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
//     //res.end(result);
//     res.end(result, 'binary');
// } 
//# sourceMappingURL=ExcelUtils.js.map