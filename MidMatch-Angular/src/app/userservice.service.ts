import { Injectable } from '@angular/core';
import { Http, Headers, HttpModule } from '@angular/http'
import { tokenNotExpired } from 'angular2-jwt'
import { map, timeout } from "rxjs/operators";
@Injectable({
  providedIn: 'root'
})
export class UserserviceService {
  authToken: any;
  user: any;
  isDev: boolean;
  appserver: any;

  constructor(private http: Http) {
      this.appserver = ''
  }
  
  registerUser(user){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json')
    return this.http.post(this.appserver + 'users/register', user, {headers: headers}).pipe(timeout(3000)).pipe(map(res => res.json()))
  }

  authenticateUser(user){
    let headers = new Headers()
    headers.append('Content-Type', 'application/json')
    return this.http.post(this.appserver + 'users/authenticate', user, {headers: headers}).pipe(timeout(3000)).pipe(map(res=>res.json()))
  }
  
  storeUserData(token, user){
    localStorage.setItem('id_token', token)
    localStorage.setItem('user', JSON.stringify(user))
    this.authToken = token;
    this.user = user;
  }
  getUser(){
    return localStorage.getItem('user')
  }

  like(destCode){
    let headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-type', 'application/json')
    return this.http.post(this.appserver + 'users/like', {receiver: destCode}, {headers: headers}).pipe(timeout(3000)).pipe(map(res=>res.json()))
  }

  resetRequest(email){
    let headers = new Headers()
    headers.append('Content-type', 'application/json')
    return this.http.post(this.appserver + 'users/sendReset', {email: email}, {headers: headers}).pipe(timeout(3000)).pipe(map(res=>res.json()))
  }

  reset(email, token, password){
    let headers = new Headers()
    headers.append('Content-type', 'application/json')
    return this.http.post(this.appserver + 'users/reset', {email: email, string: token, password: password}, {headers: headers}).pipe(timeout(3000)).pipe(map(res=>res.json()))
  }


  loadToken(){
    const token = localStorage.getItem('id_token')
    this.authToken = token
  }

  loggedIn(){
    return tokenNotExpired('id_token')
  }

  logout(){
    this.authToken = null
    this.user = null
    localStorage.clear()
  }
}
