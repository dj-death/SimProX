var console = require('../kernel/utils/logger');


exports.post = function (url,data,fn){
  console.log('url:' + url);
    data=data||{};
    var content=require('querystring').stringify(data);
    var parse_u=require('url').parse(url,true);
    var isHttp=parse_u.protocol=='http:';
    var options={
       host:parse_u.hostname,
       port:parse_u.port||(isHttp?80:443),
       path:parse_u.path,
       method:'POST',
       headers:{
              'Content-Type':'application/json; charset=UTF-8',
              'Content-Length':content.length
        }
    };

    console.log('http post request' + require('util').inspect(options, {depth : null}));
    var req = require(isHttp?'http':'https').request(options,function(res){
      var _data='';
      res.on('data', function(chunk){
         _data += chunk;
      });
      res.on('end', function(){
            fn!=undefined && fn(_data);
       });
    });
    req.write(content);
    req.end();
}

