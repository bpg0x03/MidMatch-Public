import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { NavbarComponent } from './navbar/navbar.component';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { UserserviceService } from './userservice.service';
import { ValidateService } from './validate.service';
import { AuthGuard } from './auth.guard';
import { HttpModule } from '@angular/http';
import { AboutComponent } from './about/about.component';
import { FormsModule } from '@angular/forms';
import { ResetComponent } from './reset/reset.component';
import { ResetRequestComponent } from './reset-request/reset-request.component';
import { CountdownModule } from 'ngx-countdown-2';
import { LegalComponent } from './legal/legal.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent,
    NavbarComponent,
    AboutComponent,
    ResetComponent,
    ResetRequestComponent,
    LegalComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FlashMessagesModule.forRoot()
  ],
  providers: [UserserviceService, ValidateService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
