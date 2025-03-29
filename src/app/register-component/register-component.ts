import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { concatMap, mergeMap, switchMap, timer } from 'rxjs';

@Component({
  selector: 'register-component',
  templateUrl: './register-component.html',
  standalone: false,
  styleUrl: './register-component.css'
})
export class RegisterComponent {

    l2email: string = '';
    login: string = '';
    password: string = '';
    confirmPassword: string = '';
    verificationCode: string = '';
    isCodeSent: boolean = false;
    registerSuccess : boolean = false;
    constructor(
        private http: HttpClient,
        private toastr: ToastrService
    ) {}

    onSubmit() {

        const account = {
          l2email: this.l2email,
          login: this.login,
          password: this.password,
        };
        this.http.post('http://l2-absolute.com/api/site/accounts/register', account, { responseType: 'text' })
        .pipe(
          concatMap((response1: string) => {
            // Робимо паузу 1 секунду
            return timer(1000).pipe(
              // Після паузи виконуємо другий запит
              mergeMap(() => this.http.post('http://l2-absolute.com/api/server/accounts/register', account, { responseType: 'text' }))
            );
          })
        )
          .subscribe({
            next: (response: string) => {
              this.toastr.success(response, "Успех");
              this.registerSuccess = true;
            },
            error: (err: any) => {
              this.toastr.error(err.error, "Ошибка");
              this.registerSuccess = false;
            }
          });
      }

        sendVerificationCode() {
          if(this.confirmPassword==null||undefined||''){
            this.toastr.error("Подтвердите пароль", "Ошибка");
            return;
          }
          if (this.password !== this.confirmPassword) {
            this.toastr.error("Пароли не совпадают", "Ошибка");
            return;
          }

            const account = {
                l2email: this.l2email,
                login: this.login,
                password: this.password
            };
            this.http.post('http://l2-absolute.com/api/site/accounts/check-register', account, { responseType: 'text' })
                .pipe(
                    switchMap(() =>
                        this.http.post('http://l2-absolute.com/api/site/accounts/send-verification',{email: this.l2email},{ responseType: 'text' })
                    )
                )
                .subscribe({
                    next: () => {
                        this.toastr.success('Код подтверждения регистрации отправлен на ваш e-mail. Проверьте ваш почтовый ящик и введите его в поле ниже для подтверждения регистрации');
                        this.isCodeSent = true;
                    },
                    error: (err) => {
                        this.toastr.error(err.error || 'Произошла ошибка', 'Ошибка');
                        this.registerSuccess = false;
                    }
                });
        }
        verifyCode() {
            this.http
            .post('http://l2-absolute.com/api/site/accounts/verify-code', {
                email: this.l2email,
                code: this.verificationCode,
            },{ responseType: 'text' })
            .subscribe({
                next: () => {
                    this.toastr.success('Код регистрации подтвержден');
                this.onSubmit();
                },
                error: (err) => {
                    this.toastr.error(err.error);
                    this.isCodeSent = false;
                    this.registerSuccess = false;
                },
            });
        }
}
