import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import { Router }  from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  email :string;
  password :string;

  constructor(public authService:AuthService, private router: Router) { }

  ngOnInit() {
  }

  login(){
    let auth = {
      email:this.email,
      password: this.password
    }
    this.authService.signIn(auth).subscribe((res)=>{
      if (typeof(res.status)=="undefined") alert("Try Login again")
      else{
        this.authService.id = res.id;
        this.authService.name=res.name;
        this.router.navigate(['/chat'])
      }
    });
  }

}
