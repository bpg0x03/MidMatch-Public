import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {

  constructor() { }
  validateRegister(user) {
    if(user.email == undefined || user.password == undefined) {
        return false;
    } else {
      return true;
    }
  }

  validateEmail(email) {
    const re = /^m((21|22|23|24)[0-9]{4})@usna\.edu$/;
    return re.test(email);
  }
}
