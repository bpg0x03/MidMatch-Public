import { Component, OnInit } from '@angular/core';
import { UserserviceService } from '../userservice.service';
import { ValidateService } from '../validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit {
  email: String;
  token: String;
  password: String;
  passwordconf: String;
  constructor(private route: ActivatedRoute, private router: Router, private authService: UserserviceService,private validateService: ValidateService, private flashMessage: FlashMessagesService) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('email')
      this.token = params.get('token')
    })
  }

  onResetSubmit(){
    var email = this.email
    var password = this.password
    var passwordconf = this.password
    this.email = ""
    this.password = ""
    this.passwordconf = ""
    if(password == undefined){
      this.flashMessage.show("Please enter a password", {cssClass: 'alert-danger', timeout: 3000})
    } else if (email == undefined || this.token == undefined){
      this.flashMessage.show("Invalid reset link!", {cssClass: 'alert-danger', timeout: 3000})
    } else if (password !== passwordconf){
      this.flashMessage.show("Passwords do not match!", {cssClass: 'alert-danger', timeout: 3000})
    }
    else{
      this.authService.reset(email, this.token, password).subscribe(data => {
        if(data.success){
          this.flashMessage.show("Password reset successfully", {cssClass: 'alert-success', timeout: 3000})
          this.router.navigate(['login'])
        } else {
          this.flashMessage.show("Something went wrong: " + data.msg, {cssClass: 'alert-danger', timeout: 3000})
        }
      },
      (err) => {
        this.flashMessage.show("Requests can only be performed every 4 seconds", {cssClass: 'alert-danger', timeout:3000})
      })
    }
  }

}
