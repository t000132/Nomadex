import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent {
  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logout();
  }

  get isUserConnected() {
    return this.authService.isUserConnected();
  }

  get getUsername() {
    return this.authService.user?.username || '';
  }
}
