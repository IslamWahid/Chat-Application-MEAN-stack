import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

  url: string = "http://localhost:3000/auth";
  id: string="";
  name: string="";
  constructor(public http: Http) { }

  signUp(auth){
    return this.http.post(this.url+"/signup", JSON.stringify(auth))
    .map(res => res.json())
  }


  signIn(auth) {
    return this.http.post(this.url + '/signin', JSON.stringify(auth))
      .map(res => res.json());
  }


}
