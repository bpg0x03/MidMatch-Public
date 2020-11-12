import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { UserserviceService } from '../userservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    public authService: UserserviceService,
    private router: Router,
    private flashMessge: FlashMessagesService) { }

  ngOnInit(): void {
  }

  onLogoutClick(){
    this.authService.logout()
    this.flashMessge.show(
      'Logged out',
      {cssClass: 'alert-success', timeout: 3000}
    )
    this.router.navigate(['/login'])
    return false
  }

}
