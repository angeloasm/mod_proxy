/**
 * Author: Angelo Carraggi ( axc1011 )
 */
'use strict';
// Request library 
var http = require('http');
global.fs = require('fs');
var crypto = require('crypto'),
algorithm = 'aes-256-ctr',
password = 'axc1011';

let app = require('express')();
let https = require('http').Server(app);
global.io = require('socket.io')(https);

// variable for readWrite settings 
var fileReader = require('./modules/Settings/readWriteSettings')
// define the port where proxy is available
var port = 80;
// requested variable 
global.n_req = 0;
// Turn check server 
global.iServer=0;
// list of ports available in the proxy 
global.ports = [];
// list of ip Server available in the proxy 
global.ipServer =[];
// Json of settings file 
global.settingsJson;
// This variable rapresent the path of plug in load balance function 
var loadBalanceFile;
// Array that contains the statistic values for each server.
global.statisticServer =[];

// start a proxy server listen 
var server = http.createServer(onRequest).listen(port);
/**
 * Load Settings params
 */
loadSettings();

var loadBalancer = require('./'+loadBalanceFile)
global.found=-1;

/* debug variable for the debugging console 
    false: doesn't print any line
    true: print any line of the session lists.
*/
global.debug = false;

let x = require('./modules/Network/RTCSocket');


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
global.saveSettings = function saveSettings(){
    fileReader.writeSettingsFile(JSON.stringify(settingsJson));
}

/**
 * Function for load the settings in the proxy web switch
 */
function loadSettings(){
    global.settingsJson = JSON.parse(fileReader.readfile());
    global.settingsJson.hosts.forEach(function(element){
        var item_stat = {"session":0,"request":0};
        global.statisticServer.push(item_stat);
        global.ports.push(element.port);
        global.ipServer.push(element.ip);
    });
    loadBalanceFile = global.settingsJson.loadBalancer;
}

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
      dec += decipher.final('utf8');
    return dec;
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
 * Function for parse cookie inside the header request
 * Notice: check only PHPSESSID, in future add new version of ID 
 * @param {string} request 
 */
function parseSetCookies (request) {
    var list = {},
        rc = request.headers['set-cookie'][0];

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}



/**
 * Function of callback, that manage the request and the response to client-> web switch
 * web switch -> server and the inverse path.
 * @param {*} client_req 
 * @param {*} client_res 
 */
function onRequest(client_req, client_res) {

    // Request for generate a unique id session
    
    
    /* variable for cookie session identifier */
    var cookieList = parseCookies(client_req);

    /* item for adding a server when there is a new session established */
    var item = {"session":'',"index":''};
    

    
    /**
     * log server
     */  
    if(debug)
        console.log('serve: ' + client_req.url);
    if(debug)
        console.log('n_req ='+n_req+' ports server:'+ ports[iServer]);
    
    // if exists php session
    if(cookieList['PROXYSESS']!=undefined){
        // variable for split session user 
        var svrProxy = decrypt(cookieList['PROXYSESS']);
        
        global.found = -1; // setting is found to -1 
        settingsJson.hosts.forEach(function(element,index){
            /**
             * For each element control if exists the name in the list of server connected to the web switch
             */
            if(svrProxy==element.name){
                iServer = index; //Update the index server 
                global.found = 0; // Set variable found to true
                return ; // exit from cycle
            }
            
        });
        /**
         * Verify if founded is false ( -1 ) because if found doesn't found you must choice 
         * the server with the function for the load balance
         */
        if(global.found == -1){
            if(debug)
                console.log("reset session");
            loadBalancer.loadBalancer();
        }
    
    }else{
        global.found=-1;
        // if you don't have any cookie defined inside the request of client, take loadBalancer Algorithm 
        if(debug)
            console.log("cookie doesn't defined");
        loadBalancer.loadBalancer();
    }
    
    // declare options for redirect the request to another server in the list
    var options = {
        
        hostname: ipServer[iServer],
        port: ports[iServer],
        path: client_req.url,
        headers: { }
        
    };
    // Adding the method of the request equal to the method of the client sended.
    options.method = client_req.method;  
    /**
     * If in the web switch i have found a server that match with the session stored
     * copy all header fields from the client request.
     * This is useful because i don't know the name of the variable set for the session
     * by the server code.
     */
    if(global.found!=-1){
        options.headers = client_req.headers;  
    }
    
    // Adding request from the server selected, it's important for the analisys
    statisticServer[iServer].request++;
    // adding number of request
    n_req++; 


    // redirect the client request to the server with options variable 
    var connector = http.request(options, function(serverResponse) {
        // serverResponse must be in pause mode because the server send two response
        serverResponse.pause();
        if(debug){
            console.log("SESSION----------------------");
            console.log("found:"+global.found);
        }
        /**
         * The idea is based to a simply think.
         * If the server response with the field 'set-cookie' setted then the server contains
         * information about the client. 
         * So when the field isn't undefined then i can insert my unique session in this format:
         * uniquehex.name_server
         * This cookie will be set in the client browser and when it makes a request to the webswitch
         * send all cookie contained. 
         */
        
        if(serverResponse.headers['set-cookie']!=undefined){
            var parse = parseSetCookies(serverResponse);
           
            var headerserv = serverResponse.headers['set-cookie'].toString();
            headerserv = headerserv.split(';');
            statisticServer[iServer].session++;
            if(parse['Max-Age']==0){
                console.log(parse['Max-Age']);
                headerserv.push('PROXYSESS='+sessionID+";Max-age=0");
            }else{
                headerserv.push('PROXYSESS='+encrypt(settingsJson.hosts[iServer].name)+";Max-age=10800");
            }
            serverResponse.headers['set-cookie'] = headerserv;


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
 *  Start server with the port setted
 */
server.listen(port, function() {
    if(debug)    
        console.log('Listening on ' + port);
});