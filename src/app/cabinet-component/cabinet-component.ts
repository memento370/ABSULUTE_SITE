import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
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

  activeTab: CabinetTab = 'info';

  autentification = false;
  loginAut: string | null = null;
  roleAut: string | null = null;
  l2email: string | null = null;
  currentLanguage = 'uk';
  private langSub?: Subscription;
  loginRequestDTO: LoginRequestDTO = { login: '', password: '' };
  loginLoading = false;
  characters: CharacterDTO[] = [];
  selectedCharacter: CharacterDTO | null = null;
  charactersLoading = false;

  emailChangeConfirmDTO: EmailChangeConfirmDTO = { newEmail: '', code: '' };
  emailCodeSent = false;
  emailChangeLoading = false;

  // ====== Password change ======
  passwordChangeConfirmDTO = { newPassword: '', code: '' };
  passwordCodeSent = false;
  passwordChangeLoading = false;

  loginRemindLoading = false;

  // ===== Forgot password (reset by email) =====
  forgotPasswordOpen = false;
  forgotCodeSent = false;
  forgotLoading = false;

  forgotPasswordEmail = '';
  forgotPasswordConfirmDTO = { code: '', newPassword: '' };
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.currentLanguage = this.translate.currentLang || 'uk';
  }

  ngOnInit() {
    this.langSub = this.translate.onLangChange.subscribe(e => {
      this.currentLanguage = e.lang;
    });

    this.restoreSession();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  setTab(tab: CabinetTab) {
    this.activeTab = tab;
  }

  private restoreSession() {
    const loginTime = localStorage.getItem('loginTime');
    const token = localStorage.getItem('token');

    if (!loginTime || !token) {
      this.clearSession();
      return;
    }

    const elapsed = Date.now() - Number(loginTime);
    const isExpired = elapsed > 3600 * 1000; // 1 година

    if (isExpired) {
      this.clearSession();
      return;
    }
    this.autentification = true;
    this.loginAut = localStorage.getItem('login');
    this.roleAut = localStorage.getItem('role');
    this.l2email = localStorage.getItem('l2email');
    this.activeTab = 'info';
    this.onGetCharacters();
  }

  private clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('login');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('l2email');

    this.autentification = false;
    this.loginAut = null;
    this.roleAut = null;

    this.characters = [];
    this.selectedCharacter = null;

    this.resetEmailChangeForm();
    this.activeTab = 'info';
  }

  logout(): void {
    this.clearSession();
  }

  onSubmit() {
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
        this.toastr.success(res.message, this.translate.instant('register_sys_succes'));

        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('login', res.login);
        localStorage.setItem('loginTime', Date.now().toString());
        localStorage.setItem('l2email', res.l2email);


        this.autentification = true;
        this.loginAut = res.login;
        this.roleAut = res.role;
        this.l2email = res.l2email;
        this.activeTab = 'characters';

        setTimeout(() => this.onGetCharacters(), 1050);

        this.loginLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.loginLoading = false;
      }
    });
  }

  onGetCharacters(): void {
    if (this.charactersLoading) return;
    if (!this.loginAut) return;

    const token = localStorage.getItem('token');
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
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.charactersLoading = false;
      }
    });
  }

  selectCharacter(ch: CharacterDTO) {
    this.selectedCharacter = ch;
  }

  // Невеликий хелпер для відображення EN/RU (UA поки беремо як RU)
  getRaceLabel(ch: CharacterDTO): string {
    return this.currentLanguage === 'en' ? ch.raceEn : ch.raceRu;
  }
  getClassLabel(ch: CharacterDTO): string {
    return this.currentLanguage === 'en' ? ch.classEn : ch.classRu;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Accept-Language': this.currentLanguage || 'uk'
    };
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

  confirmEmailChange() {
    if (this.emailChangeLoading) return;

    const body = {
      newEmail: this.emailChangeConfirmDTO.newEmail.trim(),
      code: this.emailChangeConfirmDTO.code.trim()
    };

    this.emailChangeLoading = true;

    this.http.post(
      `${this.SITE_API}/email-change/confirm`,
      body,
      { headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' }, responseType: 'text' }
    ).subscribe({
      next: (msg: string) => {
        this.toastr.success(msg, this.translate.instant('register_sys_succes'));
        this.resetEmailChangeForm();
        this.emailChangeLoading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
        this.emailChangeLoading = false;
      }
    });
  }

  cancelEmailChange() {
    this.resetEmailChangeForm();
  }

  getSessionExpiresText(): string {
    const loginTimeStr = localStorage.getItem('loginTime');
    if (!loginTimeStr) return '—';

    const loginTime = Number(loginTimeStr);
    if (!Number.isFinite(loginTime)) return '—';

    const expiresAt = loginTime + (3600 * 1000);
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) return '—';

    const minutesLeft = Math.floor(msLeft / 60000);
    return minutesLeft > 0 ? `${minutesLeft} ${this.translate.instant('cabinet.minutes')}` : this.translate.instant('cabinet.less_one_minute');
  }

  private resetPasswordChangeForm() {
    this.passwordChangeConfirmDTO.newPassword = '';
    this.passwordChangeConfirmDTO.code = '';
    this.passwordCodeSent = false;
    this.passwordChangeLoading = false;
  }

requestPasswordChangeCode() {
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
    },
    error: (err) => {
      this.toastr.error(err?.error, this.translate.instant('register_sys_error'));
      this.passwordChangeLoading = false;
    }
  });
}

confirmPasswordChange() {
  if (this.passwordChangeLoading) return;

  this.passwordChangeLoading = true;

  const body = {
    newPassword: this.passwordChangeConfirmDTO.newPassword.trim(),
    code: this.passwordChangeConfirmDTO.code.trim()
  };

  this.http.post(
    `${this.SITE_API}/password-change/confirm`,
    body,
    { headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' }, responseType: 'text' }
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

cancelPasswordChange() {
  this.resetPasswordChangeForm();
}

remindLoginToEmail() {
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

  openForgotPassword() {
  this.forgotPasswordOpen = true;
  this.resetForgotPasswordForm();
}

closeForgotPassword() {
  if (this.forgotLoading) return;
  this.forgotPasswordOpen = false;
  this.resetForgotPasswordForm();
}

private resetForgotPasswordForm() {
  this.forgotPasswordEmail = '';
  this.forgotPasswordConfirmDTO.code = '';
  this.forgotPasswordConfirmDTO.newPassword = '';
  this.forgotCodeSent = false;
  this.forgotLoading = false;
}

requestPasswordResetCode() {
  if (this.forgotLoading) return;

  const email = this.forgotPasswordEmail.trim();
  if (!email) {
    this.toastr.error(this.translate.instant('cabinet.forgotPassword.emailRequired'), this.translate.instant('register_sys_error'));
    return;
  }

  this.forgotLoading = true;

  this.http.post(
    `${this.SITE_API}/password-reset/request`,
    { email },
    {
      headers: { 'Accept-Language': this.currentLanguage, 'Content-Type': 'application/json' },
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

confirmPasswordReset() {
  if (this.forgotLoading) return;

  const email = this.forgotPasswordEmail.trim();
  const code = this.forgotPasswordConfirmDTO.code.trim();
  const newPassword = this.forgotPasswordConfirmDTO.newPassword.trim();

  if (!email || !code || !newPassword) {
    this.toastr.error(this.translate.instant('cabinet.forgotPassword.fieldsRequired'), this.translate.instant('register_sys_error'));
    return;
  }

  this.forgotLoading = true;

  const body = { email, code, newPassword };

  this.http.post(
    `${this.SITE_API}/password-reset/confirm`,
    body,
    {
      headers: { 'Accept-Language': this.currentLanguage, 'Content-Type': 'application/json' },
      responseType: 'text'
    }
  ).subscribe({
    next: (msg: string) => {
      this.toastr.success(msg, this.translate.instant('register_sys_succes'));
      // повертаємо на логін
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
