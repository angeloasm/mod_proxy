/* This module exports the web socket for update the list of server in real time */



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
