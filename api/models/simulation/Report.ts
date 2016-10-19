let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Q = require('q');


let reportSchema = new Schema({
    seminarId: String,
    reportName: String,
    reportData: {}
});


let Report = mongoose.model("Report", reportSchema);

export function findOne (seminarId, reportName){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();

    Report.findOne({
        seminarId: seminarId,
        reportName: reportName
    }, function(err, result){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

export function remove (seminarId){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();
    Report.remove({seminarId: seminarId}, function(err){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve();
        }
    })
    return deferred.promise;
};

export function insert (report){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();

    Report.create(report, function(err){
        if(err){
            return deferred.reject(err);
        }
        return deferred.resolve(undefined);
    });

    return deferred.promise;
};

export function update (seminarId, report){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }
    
    let deferred = Q.defer();

    Report.update({
        seminarId: seminarId
    }, 
    report)
    .exec(function(err, numAffected){
        if(err){
            deferred.reject(err);
        }else if(numAffected!==1){
            deferred.reject(new Error("Can't update a report which doesn't exist."));
        }else{
            deferred.resolve(numAffected);
        }
    });

    return deferred.promise;
};