import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UserserviceService } from '../userservice.service';

@Component({
  selector: 'app-reset-request',
  templateUrl: './reset-request.component.html',
  styleUrls: ['./reset-request.component.css']
})
export class ResetRequestComponent implements OnInit {
  email: String;
  constructor(private authService: UserserviceService,private validateService: ValidateService, private flashMessage: FlashMessagesService) { }

  ngOnInit(): void {
  }

  onResetRequestSubmit(){
    var email = this.email
    this.email = ""
    if(!this.validateService.validateEmail(email)){
      this.flashMessage.show("Invalid email", {cssClass: 'alert-danger', timeout: 3000})
    }
    else{
      this.authService.resetRequest(email).subscribe(data => {
        if(data.success){
          this.flashMessage.show("Reset email sent!", {cssClass: 'alert-success', timeout:3000})
        }
        else{
          this.flashMessage.show("Something went wrong: " + data.msg, {cssClass: 'alert-danger', timeout:3000})
        }
      },
      (err) => {
        this.flashMessage.show("Requests can only be performed every 4 seconds", {cssClass: 'alert-danger', timeout:3000})
      })
    }
  }

}
