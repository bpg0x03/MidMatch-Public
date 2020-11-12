import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { AboutComponent } from './about/about.component';
import { AuthGuard } from './auth.guard';
import { ResetComponent } from './reset/reset.component';
import { ResetRequestComponent } from './reset-request/reset-request.component';
import { LegalComponent } from './legal/legal.component';

const routes: Routes = [
  {path:'', component: HomeComponent},
  {path:'register', component: RegisterComponent},
  {path: 'about', component: AboutComponent},
  {path:'login', component: LoginComponent},
  {path:'reset', component: ResetComponent},
  {path:'resetRequest', component: ResetRequestComponent},
  {path: 'legal', component: LegalComponent},
  {path: 'user', component: UserComponent, canActivate:[AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
