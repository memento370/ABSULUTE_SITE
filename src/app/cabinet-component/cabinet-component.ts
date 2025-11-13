import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { concatMap, Observable, Subscription, switchMap } from 'rxjs';

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
    currentLanguage: string = ''; 
    private langChangeSubscription: Subscription | undefined;
    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private router: Router,
        private translate: TranslateService
    ) {
        this.currentLanguage = this.translate.currentLang || 'uk';
    }
    ngOnInit(){
      this.langChangeSubscription = this.translate.onLangChange.subscribe((event) => {
          this.currentLanguage = event.lang;
        });
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
    ngOnDestroy(): void {
          if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
          }
        }
    onSubmit() {
      const account = {
        login: this.login,
        password: this.password
      };
      const headers = { 'Accept-Language': this.currentLanguage };
      this.http.post<LoginResponse>('https://l2-absolute.com/api/site/accounts/login', account,{ headers })
        .subscribe({
          next: (res: LoginResponse) => {
            this.toastr.success(res.message, this.translate.instant('register_sys_succes'));
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.role);
            localStorage.setItem('login', res.login);
            localStorage.setItem('loginTime', Date.now().toString());
            this.loginAut = localStorage.getItem('login');
            this.autentification = true;
            setTimeout(() => {
              this.onGetCharacters();
            }, 1000);
          },
          error: (err) => {
             this.toastr.error(err.error, this.translate.instant('register_sys_error'));
          }
        });
    }

    onGetCharacters(): void {
      const token = localStorage.getItem('token');
      this.http.post<CharacterDTO[]>(
        'https://l2-absolute.com/api/server/accounts/characters',
        this.loginAut,
        {
        headers: { 
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Accept-Language': this.currentLanguage
          }
        }
      ).subscribe({
        next: (res: CharacterDTO[]) => {
          this.characters = res;
          this.toastr.success(this.translate.instant('cabinet_sys_get_character_succes'), this.translate.instant('register_sys_succes'));
        },
        error: (err) => {
          this.toastr.error(err.error, this.translate.instant('register_sys_error'));
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
