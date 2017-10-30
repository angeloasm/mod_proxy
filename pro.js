var http = require('http');

var server = http.createServer(onRequest).listen(80);;
var port = 80;

server.listen(port, function() {
  console.log('Listening on ' + port);
});
var n_req = 0;
var iServer=0;
var ports = [9090,8989,9090];
var x = [];

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

function verifyExistCookie(session){
    var f=0;
    x.forEach(function(element) {
        console.log("element:"+element['session']);
        if(element['session']==session){
            iServer=element['index'];
            
            f=1;
            return;
        }
    }, this);
    return f;
}


function chooseServerId(session){
    var server;
    x.forEach(function(element) {
        console.log("element:"+element['session']);
        if(element['session']==session){
            server=element['index'];
            return;
        }
    }, this);

    return server;

}

function loadBalancerF(iServer,x,n_req){
    if(n_req>5){
        iServer=0;
    }else{
        iServer++;
    }
    return iServer;
}

function onRequest(client_req, client_res) {
    
    console.log('serve: ' + client_req.url);
    console.log('n_req ='+n_req+' ports server:'+ ports[iServer]);
    var cookieList = parseCookies(client_req);
    //console.log("headers:"+ JSON.stringify(client_req.headers));
    
    var item = {"session":'',"index":''} 
    var found=0;

    if(cookieList['PHPSESSID']!=undefined){

        item['session']= cookieList['PHPSESSID'];
        item['index']=iServer;
        
      
        found=verifyExistCookie(cookieList['PHPSESSID']);
        iServer=chooseServerId(cookieList['PHPSESSID']);
        
        if(found==0){
            console.log("aggiungo");
            console.log(item);
            console.log("sostituisco iServer: "+cookieList['PHPSESSID']);
            x.push(item);
            
        }
        
        iServer=loadBalancerF(iServer,x,n_req);
        
    }else{
        console.log("non definito il cookie");
        /* cambio server */
        iServer=loadBalancerF(iServer,x,n_req);
    }
    //console.log('header request:'+JSON.stringify(client_req.headers['cookie']));
    
    console.log(cookieList['PHPSESSID']);
    var options = {
        hostname: 'localhost',
        port: ports[iServer],
        path: client_req.url,
        method: 'GET'
    };
    console.log("ports:"+iServer)
    
    n_req++; 
    var proxy = http.request(options, function (res) {
        res.pipe(client_res, {
        end: true
        });
        
             
    });
     
    client_req.pipe(proxy, {
        end: true
    });
    
}