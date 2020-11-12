import { Component, OnInit } from '@angular/core';
import { UserserviceService } from '../userservice.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  destination: String;
  user: Object;
  constructor(private authService: UserserviceService, private flashMessage: FlashMessagesService) { }

  ngOnInit(): void {
    this.user = this.authService.getUser()
  }

  onCrushSubmit(){
    var dest = this.destination
    this.destination = ""
    if(dest == undefined || dest.search(/^((21|22|23|24)[0-9]{4})$/)){ 
      this.flashMessage.show("Invalid input!", {cssClass:'alert-danger', timeout: 3000})
      return
    }
    this.authService.like(dest).subscribe(data => {
      if(data.success){
        this.flashMessage.show("Crush submitted!", {cssClass:'alert-success', timeout:3000})
      } else {
        this.flashMessage.show("Something went wrong: " + data.msg, {cssClass: 'alert-danger', timeout: 3000})
      }
    },
    (err) => {
      this.flashMessage.show("Requests can only be performed every 4 seconds", {cssClass: 'alert-danger', timeout:3000})
    })

  }
}
