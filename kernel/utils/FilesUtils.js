"use strict";
function LoadConfigIni(DataDirectory, seminar) {
    var ini; //Tinifile;
    /*ini = TIniFile.Create(ExtractFilePath(ParamStr(0)) + 'CgiConfig.ini');
  
    
    DataDirectory = ini.ReadString('Options','DataDirectory','C:\E-project\ecgi\');
    DataDirectory = DataDirectory + seminar + '\');*/
}
exports.LoadConfigIni = LoadConfigIni;
function ReadResults(PeriodNumber, SeminarCode, DataDirectory, OnePeriodResults /*TAllResults*/) {
    var ResultsFile; //file of TAllResults;
    var FileName;
    var TempResult;
    var ResultsFileName = "ff";
    FileName = DataDirectory + ResultsFileName + SeminarCode;
    /*if (FileExists(FileName) = false then
    begin
        Result := -1;
        exit;
    end;*/
    return 0;
}
exports.ReadResults = ReadResults;
//# sourceMappingURL=FilesUtils.js.map