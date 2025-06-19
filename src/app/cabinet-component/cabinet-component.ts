import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { concatMap, Observable, switchMap } from 'rxjs';

export interface LoginResponse {
  token: string;
  role: string;
  login:string;
  message: string;
}
export interface CharacterDTO {
  objId: number;
  accountName: string;
  charName: string;
  baseClassId: number;
  raceEn: string;
  raceRu: string;
  classEn: string;
  classRu: string;
  lvl: number;
}

@Component({
  selector: 'cabinet-component',
  templateUrl: './cabinet-component.html',
  standalone: false,
  styleUrl: './cabinet-component.css'
})


export class CabinetComponent {

    l2email: string = '';
    login: string = '';
    password: string = '';
    confirmPassword: string = '';
    verificationCode: string = '';
    isCodeSent: boolean = false;
    registerSuccess : boolean = false;
    autentification: boolean = false;
    loginAut!: string | null;
    characters: CharacterDTO[] = [];
    selectedCharacter: CharacterDTO | null = null;
    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private router: Router
    ) {}
    ngOnInit(){
      const loginTime = localStorage.getItem('loginTime');
      const token = localStorage.getItem('token');
      if (loginTime && token) {
        const elapsedTime = Date.now() - Number(loginTime);
        if (elapsedTime > 3600 * 1000) { 
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('login');
          localStorage.removeItem('loginTime');
          this.autentification = false;
        }else{
          this.autentification = true;
          this.loginAut = localStorage.getItem('login');
          this.onGetCharacters();
        }
      }
    }

    onSubmit() {
      const account = {
        login: this.login,
        password: this.password
      };
    
      this.http.post<LoginResponse>('https://l2-absolute.com/api/site/accounts/login', account)
        .subscribe({
          next: (res: LoginResponse) => {
            this.toastr.success(res.message, "Успех");
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.role);
            localStorage.setItem('login', res.login);
            localStorage.setItem('loginTime', Date.now().toString());
            this.loginAut = localStorage.getItem('login');
            // document.cookie = `token=${res.token}; max-age=3600; path=/; Secure; SameSite=Strict`;
            this.autentification = true;
            setTimeout(() => {
              this.onGetCharacters();
            }, 1000);
          },
          error: (err) => {
            this.toastr.error(err.error, "Ошибка");
          }
        });
    }

    onGetCharacters(): void {
      const token = localStorage.getItem('token');
      this.http.post<CharacterDTO[]>(
        'https://l2-absolute.com/api/server/accounts/characters',
        this.loginAut,
        {     headers: { 
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${token}`
        } }
      ).subscribe({
        next: (res: CharacterDTO[]) => {
          this.characters = res;
          this.toastr.success('Персонажи успешно получены', 'Успех');
        },
        error: (err) => {
          this.toastr.error(err.error, 'Ошибка');
          console.error(err);
        }
      });
    }
    logout(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('login');
      this.autentification = false;
      this.router.navigate(['/login']);
    }


}
