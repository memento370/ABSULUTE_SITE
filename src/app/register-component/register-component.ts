import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { concatMap, mergeMap, Subscription, switchMap, timer } from 'rxjs';

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
      currentLanguage: string = ''; 
      private langChangeSubscription: Subscription | undefined;
      constructor(
          private http: HttpClient,
          private toastr: ToastrService,
          private translate: TranslateService
      ) {
        this.currentLanguage = this.translate.currentLang || 'uk';
      }

      ngOnInit(): void {
          this.langChangeSubscription = this.translate.onLangChange.subscribe((event) => {
            this.currentLanguage = event.lang;
          });
        }

      ngOnDestroy(): void {
        if (this.langChangeSubscription) {
          this.langChangeSubscription.unsubscribe();
        }
      }
      sendVerificationCode() {
        if (!this.confirmPassword) {
          this.toastr.error(this.translate.instant('register_sys_sendcode_approve_pass_error'),this.translate.instant('register_sys_error'));
          return;
        }

        if (this.password !== this.confirmPassword) {
          this.toastr.error(this.translate.instant('register_sys_sendcode_approve_pass_do_not_match_error'),this.translate.instant('register_sys_error'));
          return;
        }

        const account = {
          l2email: this.l2email,
          login: this.login,
          password: this.password,
        };
        const headers = { 'Accept-Language': this.currentLanguage };
        this.http
          .post('https://l2-absolute.com/api/site/accounts/check-register', account,
            { responseType: 'text', headers })
          .subscribe({
            next: () => {
              this.http
                .post(
                  'https://l2-absolute.com/api/site/accounts/send-verification',
                  { email: this.l2email },
                  { responseType: 'text' , headers}
                )
                .subscribe({
                  next: (res: string) => {
                    this.toastr.success(res, this.translate.instant('register_sys_succes'));
                    this.isCodeSent = true;
                  },
                  error: (err) => {
                    this.toastr.error(err.error, this.translate.instant('register_sys_error'));
                    this.registerSuccess = false;
                  },
                });
            },
            error: (err) => {
              this.toastr.error(err.error, this.translate.instant('register_sys_error'));
            },
          });
      }

        verifyCode() {
          const account = {
            l2email: this.l2email,
            login: this.login,
            password: this.password,
            code: this.verificationCode
          };
          const headers = { 'Accept-Language': this.currentLanguage };
            this.http.post('https://l2-absolute.com/api/site/accounts/verify-code', account, { responseType: 'text' , headers })
            .subscribe({
              next: (res: string) => {
                this.toastr.success(res, this.translate.instant('register_sys_succes'));
                this.registerSuccess = true;
              },
              error: (err) => {
                this.toastr.error(err.error);
                this.isCodeSent = false;
                this.registerSuccess = false;
              },
            });
        }
}
