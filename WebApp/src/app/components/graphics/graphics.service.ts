import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

export class GraphicsServices {

  private url = 'http://localhost:1337';
  private socket;
  public listServers;
  id;
  
  sendMessage(message) {
    this.socket.emit('add-message', message);
    console.log("MESSAGE SENT");
  }
  sendDeleteItem(index){
    this.socket.emit('delete-item',index);
    console.log('Delete SENT');
  }
  sendNewListServers(list){
    this.socket.emit('new_server_list', JSON.stringify(list));
    console.log("List SENT");
  }

  sendIdStats(ids){
    console.log(ids);
    this.socket.emit('stats',ids);
  }

  getStats(){
    this.socket = io(this.url);
    console.log("chiamato");
    this.socket.emit('stats',0);
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('res_stat', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }

  getServers(){
    this.socket = io(this.url);
    console.log("chiamato");
    console.log(this.socket);
    this.socket.emit('benvenuto',(data)=>{
        console.log(data);
    });
    console.log(this.socket.io);
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('list', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }
  getMessages() {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('message', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }
}
