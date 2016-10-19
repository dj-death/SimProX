let XLSX = require('xlsx-style');
let fs = require('fs-extra');
let path = require('path');
let extraString = require("string");
let XLSXPopulate = require('xlsx-populate');
let JSON2XLSX = require('icg-json-to-xlsx');

import Mapping = require('./Mapping');


import console = require('../../kernel/utils/logger');
import config = require('../../config');




function  makeReport(wbPath, data, cb) {
    //let re = /\{{(?:(.+?):)?(.+?)(?:\.(.+?))?}}/;
    let sheetTitle = "W";
    let workbook = XLSX.readFile(wbPath);
    let worksheet = workbook.Sheets[sheetTitle];

    XLSXPopulate.fromFile(wbPath, function  (err, iWorkbook) {
        if (err) {
            cb.apply(null, [err, null]);
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


export function  excelExport (reportData, opts, cb) {
    let lang = opts.lang || config.engine.defaultLang;

    let reportTmplPath = config.engine.getReportModelPath(lang);
    let options = {
        seminar: reportData.seminar || 1,
        playerID: reportData.playerID || 1,
        period: reportData.period || 1,
        year: reportData.period_year || 2014,
    };

    makeReport(reportTmplPath, reportData, function  (err, binary) {
        cb && cb.apply(null, [err, binary]);
    });
};

export function  excelImport (wbPath) {
    let workbook = XLSX.readFile(wbPath), Wsheet, reportData;

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
            console.log(Mapping[cellAddress] + ' @ ' + cellAddress + ' not found !');
            continue;
        }

        let value = cell.v;

        if (!isNaN(value)) {
            value = Number(value);
        }

        reportData[Mapping[cellAddress]] = value;
    }

    return reportData;
};



export function  dbToExcel (res) {
    let file = './a.xlsx';
    fs.ensureFileSync(file);
    let workbook = XLSX.readFile(file), aSheet = workbook.Sheets["a"];
    let Datastore = require('nedb');
    let simulationDb = new Datastore({ filename: config.engine.simulationDbPath + './sim.nosql', autoload: true });


    simulationDb.find({}, function  (err, data) {
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
};


export function  exportExcel (req, res, next) {
    let xlsx = require('node-xlsx');
    let fs = require('fs');
    let name = 'app/upload/' + req.body.name;
    let obj = {
        worksheets: [{
            name: req.body.name,
            data: req.body.data
        }]
    };
    let file = xlsx.build(obj);
    try {
        fs.writeFileSync(name, file, 'binary');
    } catch (err) {
        res.send(400)
    }
    res.send(200);
};

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