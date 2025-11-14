import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User | undefined;

  constructor(private http: HttpClient) { }

  addUser(user: { username: string; password: string; }) {
    return this.http.post<User>('http://localhost:3000/users', user);
  }

  login(user: { username: string; password: string; }) {
    return this.http.get<User[]>('http://localhost:3000/users?username=' + user.username + '&password=' + user.password);
  }

  logout() {
    this.user = undefined;
    localStorage.removeItem('user');
  }

  saveUser() {
    localStorage.setItem('user', '' + this.user?.id);
  }

  getSavedUser() {
    return localStorage.getItem('user');
  }

  isUserConnected() {
    if (this.user) {
      this.saveUser();
      return true;
    } else if (this.getSavedUser()) {
      this.getSavedUserInfo().subscribe((users: User[]) => {
        this.user = users[0];
        return true;
      });
    }
    return false;
  }

  getSavedUserInfo() {
    return this.http.get<User[]>('http://localhost:3000/users?id=' + this.getSavedUser());
  }
}
