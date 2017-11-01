import { Component, OnInit, OnDestroy } from '@angular/core';
import { GraphicsServices }       from './graphics.service';


@Component({
  selector: 'graphics-component',
  templateUrl: 'graphics.component.html',
  styles: [`
    .chat {
      margin-top: 100px;
      margin-left: auto;
      margin-right: auto;
      width: 10%;
      font-family: 'Georgia';
      font-size: 200%;
    }
  `],
  providers: [GraphicsServices]
})
export class GraphicsComponent implements OnInit, OnDestroy {
  messages = [];
  public values = [1,2,3,4,5];
  connection;
  message;
  public servers:any;
  public available=false;
  ip="";
  new_server = {"ip":"","port":""};
  openpanel = false;
  port="";
  server_panel=false;
  public list: any;
  server_item="";
  id_item_selected=0;
  overflowY = 'scroll';
  stats_server = {"session":-1,"request":-1};
  public id;
  wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }
  constructor(private graphService: GraphicsServices) { 

   
    
  }

  getStyle() {
    if(this.available){
      return "0 0 10px -3px #555"
    }else{
      return "";
    }
    
  }

  delete(){
    console.log("cancello:"+this.id_item_selected);
    this.graphService.sendDeleteItem(this.id_item_selected);
    this.list.hosts.splice(this.id_item_selected,1);
    this.servers.splice(this.id_item_selected,1);
    this.openpanel=false;
    
  }

  add(){
    console.log(this.new_server.ip +":"+this.new_server.port);
    let item = {'ip':this.new_server.ip, 'port':this.new_server.port};
    this.servers.push(item);
    this.list.hosts.push(item);
    console.log(this.list);
    this.graphService.sendNewListServers(this.list);
   

  }
  func(id){
    console.log(id);
    
    this.graphService.getStats().subscribe(data=>{
      console.log(JSON.parse(data['text']));
      var json = JSON.parse(data['text'])[id];
      console.log("id:"+id+" json:");
      console.log(json);
      this.stats_server = JSON.parse(data['text'])[id];
    })

 
    this.id_item_selected = id;
    this.server_item = this.servers[id];
    this.openpanel = true;
    this.server_panel=true;
//    this.graphService.id = id;
    
  }
  sendMessage() {
    this.graphService.sendMessage(this.message);
    this.message = '';
  }

  ngOnInit() {
    console.log("ci sono ");
    this.connection = this.graphService.getMessages().subscribe(message => {
      this.messages.push(message);
      
      
    })
    this.connection = this.graphService.getServers().subscribe(lists=>{
        this.servers = JSON.parse(lists['text']);
        this.list=JSON.parse(lists['text']);
        console.log(this.servers.hosts);
        this.servers = this.servers.hosts;
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

