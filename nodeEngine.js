/**
 * Author: Angelo Carraggi ( axc1011 )
 */
'use strict';
/* Request library */
var http = require('http');
global.fs = require('fs');


let app = require('express')();
let https = require('http').Server(app);
let io = require('socket.io')(https);

/* variable for readWrite settings */
var fileReader = require('./readWriteSettings')
/* define the port where proxy is available */
var port = 80;
/* requested variable */
global.n_req = 0;
/* Turn check server */
global.iServer=0;
/* list of ports available in the proxy */
global.ports = [];
/* list of ip Server available in the proxy */
global.ipServer =[];
/* Json of settings file */
var settingsJson;
/* This variable rapresent the path of plug in load balance function */
var loadBalanceFile;

global.statisticServer =[];


var sessionsLists =[];

/* start a proxy server listen */
var server = http.createServer(onRequest).listen(port);
/**
 * Load Settings params
 */
loadSettings();

var loadBalancer = require('./'+loadBalanceFile)


/* debug variable for the debugging console 
    false: doesn't print any line
    true: print any line of the session lists.
*/
var debug = false;



/**
 * Start the server for the web socket communication.
 */
https.listen(1337, () => {
    if(debug)
        console.log('started on port 8080');
});
/************************************
 * 
 * Function declared
 * 
 ************************************/




/**
 * Function for save the settings of the proxy web switch
 * 
 */
function saveSettings(){
    fileReader.writeSettingsFile(JSON.stringify(settingsJson));
}

/**
 * Function for load the settings in the proxy web switch
 */
function loadSettings(){
    settingsJson = JSON.parse(fileReader.readfile());
    settingsJson.hosts.forEach(function(element){
        var item_stat = {"session":0,"request":0};
        statisticServer.push(item_stat);
        ports.push(element.port);
        ipServer.push(element.ip);
    });
    loadBalanceFile = settingsJson.loadBalancer;
}


/**
 * Function for parse cookie inside the header request
 * Notice: check only PHPSESSID, in future add new version of ID 
 * @param {string} request 
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


/**
 * This function take the session id from the header request and search it inside the list of session contained in web switch
 *
 * @param {string} session 
 */
function verifyExistCookie(session){
    var f=0;
    sessionsLists.forEach(function(element) {
        //console.log("element:"+element['session']);
        if(element['session']==session){
            iServer=element['index'];
            
            f=1;
            return;
        }
    }, this);
    return f;
}

/**
 * This function return the number of index belong to these session params.
 * @param {string} session 
 */
function chooseServerId(session){
    var server=0;
    sessionsLists.forEach(function(element) {
        if(element['session']==session){
            server=element['index'];
            return;
        }
    }, this);

    return server;

}


/**
 * 
 * @param {*} client_req 
 * @param {*} client_res 
 */
function onRequest(client_req, client_res) {
    
    /* variable for cookie session identifier */
    var cookieList = parseCookies(client_req);
    /* item for adding a server when there is a new session established */
    var item = {"session":'',"index":''};
    
   
    /* variable that indicate the found element server into a list of all session */
    var found=0;
    /* log server */
    if(debug)
        console.log('serve: ' + client_req.url);
    if(debug)
        console.log('n_req ='+n_req+' ports server:'+ ports[iServer]);
    
   // console.log("res:"+client_res.getHeaderNames());
   console.log('request server port:'+ports[iServer]);
   
    /* if exists php session */
    if(cookieList['PHPSESSID']!=undefined){
        /* update item with session and id setted */
        item['session']= cookieList['PHPSESSID'];
        item['index']=iServer;
        
        /* verify if exists in the list this session */
        found=verifyExistCookie(cookieList['PHPSESSID']);

        /* if not exists inside my list */
        if(found==0){
            /* adding item inside the session lists array */
            if(debug)
                console.log("aggiungo item");
            //console.log(item);
            sessionsLists.push(item);
        }else{
            /* if we have founded the session choose the related server */ 
            iServer=chooseServerId(cookieList['PHPSESSID']);
        }
        
        
        
    }else{
        /* if you don't have any cookie defined inside the request of client, take loadBalancer Algorithm */
        if(debug)
            console.log("cookie doesn't defined");
        loadBalancer.loadBalancer();
    }
    //console.log('header request:'+JSON.stringify(client_req.headers['cookie']));
    
    /* declare options for redirect the request to another server in the list */
    var options = {
        hostname: ipServer[iServer],
        port: ports[iServer],
        path: client_req.url
    };
    console.log(statisticServer[iServer]);
    statisticServer[iServer].request++;
    console.log("statisticServer["+iServer+"].request="+statisticServer[iServer].request);
    /* adding number of request */
    n_req++; 

    
    /* redirect the client request to the server with options variable */
    var connector = http.request(options, function(serverResponse) {
        // serverResponse must be in pause mode because the server send two response
        serverResponse.pause();
        if(serverResponse.headers['set-cookie']!=undefined){
        var headerserv = serverResponse.headers['set-cookie'].toString();
        console.log(headerserv);
        headerserv = headerserv.split(';');
        headerserv.forEach(function(element){
            var s = element.split('=');
            if(s[0]=="PHPSESSID"){
                item['session']= s[1];
                item['index']=iServer;
                sessionsLists.push(item);
                console.log(sessionsLists);
                statisticServer[iServer].session++;                
            }
        })
    }
        // write header of response, for passing at the very client the set-cookie request 
        client_res.writeHeader(serverResponse.statusCode, serverResponse.headers); 
        // pipe the response content 
        serverResponse.pipe(client_res,{
            end: true
        });
        // resume the normally flow of request
        serverResponse.resume();
    });
    
    /**
     * Pipe the request from client to server. ( obviously contains the session field ).
     */
    client_req.pipe(connector, {
        end: true
    });
    
}


/**
 * Set up of the communication protocol between client and server, using websocket.
 */
io.on('connection', (socket) => {
    if(debug)
        console.log('USER CONNECTED');
    /**
     * Manage when the client close the connection. 
     */
    socket.on('disconnect', function(){
        if(debug)
            console.log('USER DISCONNECTED');
    });
  
    /**
     * Manage when the client request the list of server associated to this web switch.
     */
    socket.on('new_server_list', (list) => {
        if(debug)
            console.log(JSON.parse(list));
        
        settingsJson = JSON.parse(list);
        var item_stat = {"session":0,"request":0};
        statisticServer.push(item_stat);
        ports.push(settingsJson.hosts[ports.length].port);
        ipServer.push(settingsJson.hosts[ipServer.length].ip);
        console.log(settingsJson);
        saveSettings();

    });

    /**
     * Manage the deleted item request
     */
    socket.on('delete-item', function(index){
        ports.splice(index,1);
        console.log(ports);
        ipServer.splice(index,1);
        statisticServer.splice(index,1);
        settingsJson.hosts.splice(index,1);
        console.log(settingsJson);
        saveSettings();
    });

    /**
    * This is message, is useful
    */
    socket.on('benvenuto', (data) => {
        if(debug)
            console.log("arrivato benvenuto");
        io.emit('list', {type:'new-message', text: JSON.stringify(settingsJson)});
    });
    /**
     * 
     */
    socket.on('stats', (index) => {
        console.log(JSON.stringify(statisticServer));
        
        if(debug)
            console.log("get stats for "+index);
        io.emit('res_stat', {type:'new-message', text: JSON.stringify(statisticServer)});
    });

  });

/**
 *  Start server with the port setted
 */
server.listen(port, function() {
    if(debug)    
        console.log('Listening on ' + port);
});