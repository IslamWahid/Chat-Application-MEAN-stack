import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import { Router }  from '@angular/router';
import * as io from 'socket.io-client';

const url = "http://localhost:3000";


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  messages:Array<any>=[];
  online_users:Array<any>=[];
  offline_users:Array<any>=[];
  socket;
  message:string="";
  readyTosend:boolean=false;
  reciever:any = null;

  constructor(public authService:AuthService, private router: Router) {
    if(authService.id == "") router.navigate(['/login']);
    else{

      this.socket=io.connect(url);

      this.socket.emit("join",{name:this.authService.name,id:this.authService.id})

      this.socket.on('message',msg=>{
        if((this.reciever!=null && this.reciever.id == msg.from) || msg.from == this.authService.id) this.messages.push(msg);
        else {
          let reciever =  this.online_users.find(elm=>elm.id==msg.from)
          this.setReciever(reciever)
        }
      });

      this.socket.on('online_users',users=> this.online_users = users.filter(elm=>elm.id!=this.authService.id));

      this.socket.on('offline_users',users=>this.offline_users = users)

      this.socket.on('loadMessages',messages=>this.messages=messages)
    }
  }

  ngOnInit() {
  }

  sendMsg(){
    if(this.message!="") {
      if(this.reciever.status){
        this.socket.emit("message",{message:this.message,to:this.reciever.id});
        this.message="";
      }else{
        this.socket.emit("offline_message",{message:this.message,to:this.reciever.id});
        this.message="";
      }
    }
  }

  setReciever(reciever){
    this.messages=[];
    this.readyTosend=true;
    this.reciever=reciever;
    this.socket.emit("getMessages",reciever.id);
  }

}
