import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {
  email = '';
  senha = '';

  entrar(): void {
  }
}
