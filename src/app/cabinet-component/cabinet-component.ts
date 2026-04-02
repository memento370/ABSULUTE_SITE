import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { CharacterDTO } from '../dto/CharacterDTO';
import { LoginResponseDTO } from '../dto/LoginResponseDTO';
import { EmailChangeConfirmDTO } from '../dto/EmailChangeConfirmDTO';
import { LoginRequestDTO } from '../dto/LoginRequestDTO';

type CabinetTab = 'info' | 'characters' | 'security';

@Component({
  selector: 'cabinet-component',
  templateUrl: './cabinet-component.html',
  standalone: false,
  styleUrl: './cabinet-component.css'
})
export class CabinetComponent {
  private readonly SITE_API = 'https://l2-absolute.com/api/site/accounts';
  private readonly SERVER_API = 'https://l2-absolute.com/api/server/accounts';
  // private readonly SITE_API = 'http://localhost:8080/api/site/accounts';
  // private readonly SERVER_API = 'http://localhost:8080/api/server/accounts';

  private readonly isBrowser: boolean;
  private langSub?: Subscription;

  activeTab: CabinetTab = 'info';

  autentification = false;
  loginAut: string | null = null;
  roleAut: string | null = null;
  l2email: string | null = null;
  currentLanguage = 'uk';

  loginRequestDTO: LoginRequestDTO = { login: '', password: '' };
  loginLoading = false;

  characters: CharacterDTO[] = [];
  selectedCharacter: CharacterDTO | null = null;
  charactersLoading = false;

  emailChangeConfirmDTO: EmailChangeConfirmDTO = { newEmail: '', code: '' };
  emailCodeSent = false;
  emailChangeLoading = false;

  passwordChangeConfirmDTO = { newPassword: '', code: '' };
  passwordCodeSent = false;
  passwordChangeLoading = false;

  loginRemindLoading = false;

  forgotPasswordOpen = false;
  forgotCodeSent = false;
  forgotLoading = false;
  forgotPasswordEmail = '';
  forgotPasswordConfirmDTO = { code: '', newPassword: '' };

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentLanguage = this.translate.currentLang || 'uk';
  }

  ngOnInit(): void {
    this.langSub = this.translate.onLangChange.subscribe(e => {
      this.currentLanguage = e.lang;
    });

    this.restoreSession();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  setTab(tab: CabinetTab): void {
    this.activeTab = tab;
  }

  private lsGet(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private lsSet(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  private lsRemove(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  private restoreSession(): void {
    if (!this.isBrowser) {
      this.clearSession(false);
      return;
    }

    const loginTime = this.lsGet('loginTime');
    const token = this.lsGet('token');

    if (!loginTime || !token) {
      this.clearSession(false);
      return;
    }

    const elapsed = Date.now() - Number(loginTime);
    const isExpired = elapsed > 3600 * 1000;

    if (isExpired) {
      this.clearSession();
      return;
    }

    this.autentification = true;
    this.loginAut = this.lsGet('login');
    this.roleAut = this.lsGet('role');
    this.l2email = this.lsGet('l2email');
    this.activeTab = 'info';
    this.onGetCharacters();
  }

  private clearSession(resetStorage: boolean = true): void {
    if (resetStorage) {
      this.lsRemove('token');
      this.lsRemove('role');
      this.lsRemove('login');
      this.lsRemove('loginTime');
      this.lsRemove('l2email');
    }

    this.autentification = false;
    this.loginAut = null;
    this.roleAut = null;
    this.l2email = null;

    this.characters = [];
    this.selectedCharacter = null;

    this.resetEmailChangeForm();
    this.resetPasswordChangeForm();
    this.resetForgotPasswordForm();

    this.activeTab = 'info';
  }

  logout(): void {
    this.clearSession();
  }

  onSubmit(): void {
    if (this.loginLoading) return;

    const body = {
      login: this.loginRequestDTO.login,
      password: this.loginRequestDTO.password
    };

    this.loginLoading = true;

    this.http.post<LoginResponseDTO>(`${this.SITE_API}/login`, body, {
      headers: { 'Accept-Language': this.currentLanguage }
    }).subscribe({
      next: (res) => {
        this.toastr.success(
          res.message,
          this.translate.instant('register_sys_succes')
        );

        this.lsSet('token', res.token);
        this.lsSet('role', res.role);
        this.lsSet('login', res.login);
        this.lsSet('loginTime', Date.now().toString());
        this.lsSet('l2email', res.l2email);

        this.autentification = true;
        this.loginAut = res.login;
        this.roleAut = res.role;
        this.l2email = res.l2email;
        this.activeTab = 'characters';

        setTimeout(() => this.onGetCharacters(), 1050);

        this.loginLoading = false;
      },
      error: (err) => {
        this.toastr.error(
          err?.error,
          this.translate.instant('register_sys_error')
        );
        this.loginLoading = false;
      }
    });
  }

  onGetCharacters(): void {
    if (this.charactersLoading) return;
    if (!this.loginAut) return;

    const token = this.lsGet('token');
    if (!token) return;

    this.charactersLoading = true;

    this.http.post<CharacterDTO[]>(
      `${this.SERVER_API}/characters`,
      this.loginAut,
      {
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${token}`,
          'Accept-Language': this.currentLanguage
        }
      }
    ).subscribe({
      next: (res) => {
        this.characters = res || [];
        this.selectedCharacter = this.characters.length > 0 ? this.characters[0] : null;

        this.toastr.success(
          this.translate.instant('cabinet_sys_get_character_succes'),
          this.translate.instant('register_sys_succes')
        );

        this.charactersLoading = false;
      },
      error: (err) => {
        this.toastr.error(
          err?.error,
          this.translate.instant('register_sys_error')
        );
        this.charactersLoading = false;
      }
    });
  }

  selectCharacter(ch: CharacterDTO): void {
    this.selectedCharacter = ch;
  }

  getRaceLabel(ch: CharacterDTO): string {
    switch (this.currentLanguage) {
      case 'en':
        return ch.raceEn;
      case 'uk':
        return ch.raceUk;
      case 'ru':
        return ch.raceRu;
      default:
        return ch.raceUk;
    }
  }

  getClassLabel(ch: CharacterDTO): string {
    switch (this.currentLanguage) {
      case 'en':
        return ch.classEn;
      case 'uk':
        return ch.classUk;
      case 'ru':
        return ch.classRu;
      default:
        return ch.classUk;
    }
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = this.lsGet('token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Accept-Language': this.currentLanguage || 'uk'
    };
  }

  private resetEmailChangeForm(): void {
    this.emailChangeConfirmDTO = { newEmail: '', code: '' };
    this.emailCodeSent = false;
    this.emailChangeLoading = false;
  }

  requestEmailChangeCode(): void {
    if (this.emailChangeLoading) return;

    this.emailChangeLoading = true;

    this.http.post(
      `${this.SITE_API}/email-change/request`,
      null,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    ).subscribe({
      next: (msg: string) => {
        this.emailCodeSent = true;
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.emailChangeLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.emailChangeLoading = false;
      }
    });
  }

  confirmEmailChange(): void {
    if (this.emailChangeLoading) return;

    const body = {
      newEmail: this.emailChangeConfirmDTO.newEmail.trim(),
      code: this.emailChangeConfirmDTO.code.trim()
    };

    this.emailChangeLoading = true;

    this.http.post(
      `${this.SITE_API}/email-change/confirm`,
      body,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        responseType: 'text'
      }
    ).subscribe({
      next: (msg: string) => {
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.l2email = body.newEmail;
        this.lsSet('l2email', body.newEmail);
        this.resetEmailChangeForm();
        this.emailChangeLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.emailChangeLoading = false;
      }
    });
  }

  cancelEmailChange(): void {
    this.resetEmailChangeForm();
  }

  getSessionExpiresText(): string {
    const loginTimeStr = this.lsGet('loginTime');
    if (!loginTimeStr) return '—';

    const loginTime = Number(loginTimeStr);
    if (!Number.isFinite(loginTime)) return '—';

    const expiresAt = loginTime + 3600 * 1000;
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) return '—';

    const minutesLeft = Math.floor(msLeft / 60000);
    return minutesLeft > 0
      ? `${minutesLeft} ${this.translate.instant('cabinet.minutes')}`
      : this.translate.instant('cabinet.less_one_minute');
  }

  private resetPasswordChangeForm(): void {
    this.passwordChangeConfirmDTO = { newPassword: '', code: '' };
    this.passwordCodeSent = false;
    this.passwordChangeLoading = false;
  }

  requestPasswordChangeCode(): void {
    if (this.passwordChangeLoading) return;

    this.passwordChangeLoading = true;

    this.http.post(
      `${this.SITE_API}/password-change/request`,
      null,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    ).subscribe({
      next: (msg: string) => {
        this.passwordCodeSent = true;
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.passwordChangeLoading = false;
        this.logout();
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.passwordChangeLoading = false;
      }
    });
  }

  confirmPasswordChange(): void {
    if (this.passwordChangeLoading) return;

    this.passwordChangeLoading = true;

    const body = {
      newPassword: this.passwordChangeConfirmDTO.newPassword.trim(),
      code: this.passwordChangeConfirmDTO.code.trim()
    };

    this.http.post(
      `${this.SITE_API}/password-change/confirm`,
      body,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        responseType: 'text'
      }
    ).subscribe({
      next: (msg: string) => {
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.resetPasswordChangeForm();
        this.passwordChangeLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.passwordChangeLoading = false;
      }
    });
  }

  cancelPasswordChange(): void {
    this.resetPasswordChangeForm();
  }

  remindLoginToEmail(): void {
    if (this.loginRemindLoading) return;

    this.loginRemindLoading = true;

    this.http.post(
      `${this.SITE_API}/login/remind`,
      null,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    ).subscribe({
      next: (msg: string) => {
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.loginRemindLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.loginRemindLoading = false;
      }
    });
  }

  openForgotPassword(): void {
    this.forgotPasswordOpen = true;
    this.resetForgotPasswordForm();
  }

  closeForgotPassword(): void {
    if (this.forgotLoading) return;

    this.forgotPasswordOpen = false;
    this.resetForgotPasswordForm();
  }

  private resetForgotPasswordForm(): void {
    this.forgotPasswordEmail = '';
    this.forgotPasswordConfirmDTO = { code: '', newPassword: '' };
    this.forgotCodeSent = false;
    this.forgotLoading = false;
  }

  requestPasswordResetCode(): void {
    if (this.forgotLoading) return;

    const email = this.forgotPasswordEmail.trim();
    if (!email) {
      this.toastr.error(
        this.translate.instant('cabinet.forgotPassword.emailRequired'),
        this.translate.instant('register_sys_error')
      );
      return;
    }

    this.forgotLoading = true;

    this.http.post(
      `${this.SITE_API}/password-reset/request`,
      { email },
      {
        headers: {
          'Accept-Language': this.currentLanguage,
          'Content-Type': 'application/json'
        },
        responseType: 'text'
      }
    ).subscribe({
      next: (msg: string) => {
        this.forgotCodeSent = true;
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.forgotLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.forgotLoading = false;
      }
    });
  }

  confirmPasswordReset(): void {
    if (this.forgotLoading) return;

    const email = this.forgotPasswordEmail.trim();
    const code = this.forgotPasswordConfirmDTO.code.trim();
    const newPassword = this.forgotPasswordConfirmDTO.newPassword.trim();

    if (!email || !code || !newPassword) {
      this.toastr.error(
        this.translate.instant('cabinet.forgotPassword.fieldsRequired'),
        this.translate.instant('register_sys_error')
      );
      return;
    }

    this.forgotLoading = true;

    const body = { email, code, newPassword };

    this.http.post(
      `${this.SITE_API}/password-reset/confirm`,
      body,
      {
        headers: {
          'Accept-Language': this.currentLanguage,
          'Content-Type': 'application/json'
        },
        responseType: 'text'
      }
    ).subscribe({
      next: (msg: string) => {
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.forgotPasswordOpen = false;
        this.resetForgotPasswordForm();
        this.forgotLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.forgotLoading = false;
      }
    });
  }
}