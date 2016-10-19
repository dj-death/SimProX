let Q = require('q');
let request = require('request');

export function get(reqUrl){
    let deferred = Q.defer();
    request(reqUrl, function(err, response, body){
        if(err){
            return deferred.reject(err);
        }

        if(response.statusCode!==200){
            return deferred.reject(new Error(response.statusCode.toString()));
        }

        let jsonData;
        try{
            jsonData = JSON.parse(body);
        }catch(parseError){
            return deferred.reject(parseError);
        }

        deferred.resolve(jsonData);

    })
    return deferred.promise;
}

export function post (reqUrl, data){
    let deferred = Q.defer();
    let jsonData;

    request.post(reqUrl, {form: data},function(err, response, body){
        if(err){
            return deferred.reject(err);
        }

        try{
            //console.log("............"+body);
            jsonData = JSON.parse(body);
        }catch(parseError){
            return deferred.reject(parseError);
        }

        if(response.statusCode !== 200){
            let errMsg = '';
            if(jsonData.message){ errMsg = jsonData.message; }
            if(data.team){ errMsg += ', Team ' + data.team; }
            return deferred.reject(new Error(response.statusCode.toString() + ' ' + errMsg));
        }

        deferred.resolve(jsonData);

    })
    return deferred.promise;
}