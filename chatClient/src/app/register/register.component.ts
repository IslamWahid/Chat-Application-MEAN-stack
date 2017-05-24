import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import { Router }  from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  name :string;
  email :string;
  password :string;

  constructor(public authService:AuthService, private router: Router) {  }

  ngOnInit() {
  }

  register(){
    let auth = {
      name:this.name,
      email:this.email,
      password: this.password
    }
    this.authService.signUp(auth).subscribe((res)=>{
      if (typeof(res.status)=="undefined") alert("invalid E-mail address")
      else{
        this.router.navigate(['/login'])
      }
    })
  }

}
