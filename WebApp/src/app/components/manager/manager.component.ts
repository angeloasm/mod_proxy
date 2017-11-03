import { Component, OnInit, OnDestroy } from '@angular/core';
import { ManagerServices }       from './manager.service';


@Component({
  selector: 'manager-component',
  templateUrl: 'manager.component.html',
  providers: [ManagerServices]
})

export class ManagerComponent implements OnInit, OnDestroy {

  public servers:any; // servers
  public available=false; //available c'è
  public list: any; // list
  public id;
  connection; // connect
  ip="";
  new_server = {"ip":"","port":"","name":""}; //new_sever
  openpanel = false; // open panel
  port="";
  server_panel=false;
  server_item="";
  id_item_selected=0; // id
  overflowY = 'scroll';
  noConnection = true;
  stats_server = {"session":-1,"request":-1};
  debug = false;//Debug

  constructor(private managerService: ManagerServices) { }

  getStyle() {
    if(this.available){
      return "0 0 10px -3px #555"
    }else{
      return "";
    } 
  }
  
  delete(){
    if(this.debug)
      console.log("cancello:"+this.id_item_selected);
    this.managerService.sendDeleteItem(this.id_item_selected);
    this.list.hosts.splice(this.id_item_selected,1);
    this.servers.splice(this.id_item_selected,1);
    this.openpanel=false;
  }

  add(){

    var found = -1;
    if(this.new_server.ip.split('.').length != 4)
      return;
    this.servers.forEach(element => {
      console.log(element.name);
      if(element.name == this.new_server.name){
        found=0;
      }
    });
    
    if(found==-1){
      let item = {'ip':this.new_server.ip, 'port':this.new_server.port,'name':this.new_server.name};
      this.servers.push(item);
      this.list.hosts.push(item);
      console.log(this.list);
      this.managerService.sendNewListServers(this.list);
    }
  }

  func(id){
    
    this.managerService.getStats().subscribe(data=>{
      if(this.debug)
        console.log(JSON.parse(data['text']));
      var json = JSON.parse(data['text'])[id];
      if(this.debug)
        console.log("id:"+id+" json:");
      if(this.debug)
        console.log(json);
      this.stats_server = JSON.parse(data['text'])[id];
    })

    this.id_item_selected = id;
    this.server_item = this.servers[id];
    this.openpanel = true;
    this.server_panel=true;

  }

  

  closePanel(){
    this.openpanel = false;
  }

  ngOnInit() {
    console.log("ci sono ");
    this.connection = this.managerService.getServers().subscribe(lists=>{
        this.servers = JSON.parse(lists['text']);
        if(this.debug)
          console.log(this.noConnection);
        this.list=JSON.parse(lists['text']);
        if(this.debug)
          console.log(this.servers.hosts);
        this.servers = this.servers.hosts;
        this.noConnection=false;
    });
    
    this.managerService.getStatus().subscribe((data)=>{
      this.noConnection = true;
      if(this.debug)
        console.log(data);
      if(this.debug)
        console.log(this.noConnection);
      delete this.servers;
    })

    this.managerService.getConnected().subscribe((data)=>{
      if(this.noConnection==true)
        this.ngOnInit();
        this.noConnection = false;
        if(this.debug){
          console.log(data);
          console.log(this.noConnection);
        }
      
    });
  }
  ngAfterViewInit() {
    // Component views are initialized
    console.log("eccomi");
    console.log(this.servers);
    
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}

