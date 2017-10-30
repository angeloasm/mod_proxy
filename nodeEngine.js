/* Request library */
var http = require('http');

/* initialize new variable for the engine */
var port = 80;
/* requested variable */
var n_req = 0;
/* Turn check server */
var iServer=0;
/* list of ports available in the server */
var ports = [9090,8989,9090];

var x = [];
/* start a proxy server listen */
var server = http.createServer(onRequest).listen(port);

/*
function for parse cookie inside the header request
Notice: check only PHPSESSID, in future add new version of ID 
*/
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
        //console.log("element:"+element['session']);
        if(element['session']==session){
            iServer=element['index'];
            
            f=1;
            return;
        }
    }, this);
    return f;
}


function chooseServerId(session){
    var server=0;
    x.forEach(function(element) {
        console.log("element:"+element['session']);
        if(element['session']==session){
            server=element['index'];
            return;
        }
    }, this);

    return server;

}

function loadBalancerF(){
    if(iServer>=1){
        iServer=0;
    }else{
        iServer++;
    }
    return iServer;
}

function onRequest(client_req, client_res) {
    
    /* variable for cookie session identifier */
    var cookieList = parseCookies(client_req);
    /* item for adding a server when there is a new session established */
    var item = {"session":'',"index":''} 
    /* variable that indicate the found element server into a list of all session */
    var found=0;
    /* log server */
    //console.log('serve: ' + client_req.url);
    console.log('n_req ='+n_req+' ports server:'+ ports[iServer]);
    
   // console.log("res:"+client_res.getHeaderNames());
    /* if exists php session */
    if(cookieList['PHPSESSID']!=undefined){
        /* update item */
        item['session']= cookieList['PHPSESSID'];
        item['index']=iServer;
        
        /* verify if exists in the list this session */
        found=verifyExistCookie(cookieList['PHPSESSID']);

        //console.log("found var:"+found);
        /* if not exists inside my list */
        if(found==0){
            console.log("aggiungo item");
            //console.log(item);
            //console.log("sostituisco iServer: "+cookieList['PHPSESSID']);
            x.push(item);
            
            
        }else{
            iServer=chooseServerId(cookieList['PHPSESSID']);
        }
        
        
        
    }else{
        console.log("non definito il cookie");
        /* cambio server */
        //iServer=loadBalancerF(iServer,x,n_req);
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
   /* var proxy = http.request(options, function (res) {
        console.log(JSON.stringify(res.headers));
        client_res.headers = res.headers;
        res.pipe(client_res, {
            end: true
        }
        )
        
        
             
    });
    */

    var connector = http.request(options, function(serverResponse) {
        serverResponse.pause();
        client_res.writeHeader(serverResponse.statusCode, serverResponse.headers);
        serverResponse.pipe(client_res,{
            end: true
        });
        serverResponse.resume();
    });
    

    client_req.pipe(connector, {
        end: true
    });
    loadBalancerF();
}

/* Start server with the port setted */
server.listen(port, function() {
    console.log('Listening on ' + port);
});