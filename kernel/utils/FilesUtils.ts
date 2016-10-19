
export function LoadConfigIni (DataDirectory: string, seminar : string) {
    var ini: any; //Tinifile;
    
    /*ini = TIniFile.Create(ExtractFilePath(ParamStr(0)) + 'CgiConfig.ini');
  
    
    DataDirectory = ini.ReadString('Options','DataDirectory','C:\E-project\ecgi\');
    DataDirectory = DataDirectory + seminar + '\');*/
}


export function ReadResults(PeriodNumber : number, SeminarCode : string, DataDirectory : string, OnePeriodResults : any /*TAllResults*/ ) : number {
    var ResultsFile : any; //file of TAllResults;
    var FileName    :  string;
    var TempResult  : number;
    
    var ResultsFileName = "ff";

    FileName = DataDirectory +  ResultsFileName + SeminarCode;
    
    /*if (FileExists(FileName) = false then
    begin
        Result := -1;
        exit;
    end;*/

    return 0;
     
}
