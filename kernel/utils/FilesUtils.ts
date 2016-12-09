
export function LoadConfigIni (DataDirectory: string, seminar : string) {
    let ini: any; //Tinifile;
    
    /*ini = TIniFile.Create(ExtractFilePath(ParamStr(0)) + 'CgiConfig.ini');
  
    
    DataDirectory = ini.ReadString('Options','DataDirectory','C:\E-project\ecgi\');
    DataDirectory = DataDirectory + seminar + '\');*/
}


export function ReadResults(PeriodNumber : number, SeminarCode : string, DataDirectory : string, OnePeriodResults : any /*TAllResults*/ ) : number {
    let ResultsFile : any; //file of TAllResults;
    let FileName    :  string;
    let TempResult  : number;
    
    let ResultsFileName = "ff";

    FileName = DataDirectory +  ResultsFileName + SeminarCode;
    
    /*if (FileExists(FileName) = false then
    begin
        Result := -1;
        exit;
    end;*/

    return 0;
     
}
