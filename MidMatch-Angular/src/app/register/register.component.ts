import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../validate.service';
import { AuthGuard } from '../auth.guard';
import { UserserviceService } from '../userservice.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  email: String;
  emailconf: String;
  password: String;
  passwordconf: String;


  constructor(
    private validateService: ValidateService,
    private authService: UserserviceService,
    private router: Router,
    private flashMessage: FlashMessagesService) { }

  ngOnInit(): void {
  }
  onRegisterSubmit(){
    const user = {
      email: this.email,
      password: this.password,
      code: null,
      class: null

    }
    var email = this.email
    var password = this.password
    var emailconf = this.emailconf
    var passwordconf = this.passwordconf
    this.email = ""
    this.password = ""
    this.emailconf = ""
    this.passwordconf = ""

    if(!this.validateService.validateRegister(user)){
      this.flashMessage.show("Please fill in all fields", {cssClass: "alert-danger", timeout: 3000})
      return false
    }

    if(!this.validateService.validateEmail(user.email)){
      this.flashMessage.show("Please use a valid email", {cssClass: 'alert-danger', timeout: 3000})
      return false
    }else{
      user.code = email.match(/^m((21|22|23|24)[0-9]{4})@usna\.edu$/)[1]
      user.class = Number(email.match(/^m((21|22|23|24)[0-9]{4})@usna\.edu$/)[2])
    }

    if(email !== emailconf){
      this.flashMessage.show("Email confirmation does not match", {cssClass: 'alert-danger', timeout:3000})
      return false      
    }

    if(password !== passwordconf){
      this.flashMessage.show("Password confirmation does not match", {cssClass: 'alert-danger', timeout: 3000})
      return false
    }
    this.authService.registerUser(user).subscribe(data => {
      if(data.success){
        this.flashMessage.show("User registered! Check your email to verify", {cssClass: 'alert-success', timeout: 3000})
      }
      else{
        this.flashMessage.show("Something went wrong: " + data.msg, {cssClass: 'alert-danger', timeout: 3000})
      }
    },
    (err) => {
      this.flashMessage.show("Sending emails is currently unavailable due to high request volume!", {cssClass: 'alert-danger', timeout:3000})
    })

  }

}
