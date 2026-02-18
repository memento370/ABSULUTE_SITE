import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { concatMap, Observable, Subscription, switchMap } from 'rxjs';
import { CharacterDTO } from '../dto/CharacterDTO';
import { LoginResponseDTO } from '../dto/LoginResponseDTO';
import { EmailChangeConfirmDTO } from '../dto/EmailChangeConfirmDTO';
import { LoginRequestDTO } from '../dto/LoginRequestDTO';



@Component({
  selector: 'cabinet-component',
  templateUrl: './cabinet-component.html',
  standalone: false,
  styleUrl: './cabinet-component.css'
})


export class CabinetComponent {

    l2email: string = '';
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

    isEmailChangeOpen: boolean = false;

    emailChangeConfirmDTO : EmailChangeConfirmDTO = {
      newEmail : '',
      code : ''
    }
    loginRequestDTO : LoginRequestDTO = {
      login : '',
      password : ''
    }
    emailCodeSent: boolean = false;
    emailChangeLoading: boolean = false;

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
        login: this.loginRequestDTO.login,
        password: this.loginRequestDTO.password
      }; 
      const headers = { 'Accept-Language': this.currentLanguage };
      this.http.post<LoginResponseDTO>('https://l2-absolute.com/api/site/accounts/login', account,{ headers })
        .subscribe({
          next: (res: LoginResponseDTO) => {
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
    }

    private getAuthHeaders() {
      const token = localStorage.getItem('token') || '';
      return {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': this.currentLanguage || 'uk'
      };
    }

    toggleEmailChange() {
      this.isEmailChangeOpen = !this.isEmailChangeOpen;
      if (!this.isEmailChangeOpen) {
        this.resetEmailChangeForm();
      }
    }

    private resetEmailChangeForm() {
      this.emailChangeConfirmDTO.newEmail = '';
      this.emailChangeConfirmDTO.code = '';
      this.emailCodeSent = false;
      this.emailChangeLoading = false;
    }

    requestEmailChangeCode() {
      if (this.emailChangeLoading) return;
      this.emailChangeLoading = true;
      this.http.post(
        'https://l2-absolute.com/api/site/accounts/email-change/request',
        null,
        { headers: this.getAuthHeaders(), responseType: 'text' }
      ).subscribe({
        next: (msg: string) => {
          this.emailCodeSent = true;
          this.toastr.success(msg || 'Код надіслано на старий e-mail.', 'Успіх');
          this.emailChangeLoading = false;
        },
        error: (err) => {
          this.toastr.error(err?.error || 'Не вдалося надіслати код.', 'Помилка');
          this.emailChangeLoading = false;
        }
      });
    }

    confirmEmailChange() {
      if (this.emailChangeLoading) return;
      if (!this.emailChangeConfirmDTO.newEmail.trim()) {
        this.toastr.error('Введіть новий e-mail.', 'Помилка');
        return;
      }
      if (!this.emailChangeConfirmDTO.code.trim()) {
        this.toastr.error('Введіть код підтвердження.', 'Помилка');
        return;
      }
      this.emailChangeLoading = true;
      const body = {
        newEmail: this.emailChangeConfirmDTO.newEmail.trim(),
        code: this.emailChangeConfirmDTO.code.trim()
      };
      this.http.post(
        'https://l2-absolute.com/api/site/accounts/email-change/confirm',
        body,
        { headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' }, responseType: 'text' }
      ).subscribe({
        next: (msg: string) => {
          this.toastr.success(msg || 'E-mail успішно змінено.', 'Успіх');
          this.resetEmailChangeForm();
          this.isEmailChangeOpen = false;
          this.emailChangeLoading = false;
        },
        error: (err) => {
          this.toastr.error(err?.error || 'Не вдалося змінити e-mail.', 'Помилка');
          this.emailChangeLoading = false;
        }
      });
    }
}
