import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

type BgDef = { cls: string; url: string };

const BG: Record<string, BgDef> = {
  '/':         { cls: 'main',     url: 'assets/image/background.jpg' },
  '/register': { cls: 'register', url: 'assets/image/background-register.jpg' },
  '/cabinet':  { cls: 'cabinet',  url: 'assets/image/background-cabinet.jpg' },
  '/files':    { cls: 'files',    url: 'assets/image/background-files.jpg' },
  '/about':    { cls: 'about',    url: 'assets/image/background-about.jpg' },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  currentBackground = 'main';
  isCollapsed = true;
  selectedLanguage = 'uk';
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.translate.defaultLang = 'uk';

    if (this.isBrowser) {
      const stored = localStorage.getItem('lang');
      this.selectedLanguage = stored || 'uk';
      localStorage.setItem('lang', this.selectedLanguage);
    }

    this.translate.use(this.selectedLanguage);
  }

  ngOnInit() {
    this.setBackground(this.router.url);

    if (this.isBrowser) {
      this.preloadAll(Object.values(BG).map(x => x.url));
    }

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.setBackground(e.urlAfterRedirects));
  }

  private setBackground(urlAfterRedirects: string) {
    const base = urlAfterRedirects.split('?')[0].split('#')[0];
    const def = BG[base] ?? BG['/'];

    if (!this.isBrowser) {
      this.currentBackground = def.cls;
      return;
    }

    this.preload(def.url).then(() => {
      this.currentBackground = def.cls;
    });
  }

  private preloadAll(urls: string[]) {
    if (!this.isBrowser) return;

    for (const url of urls) {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = url;
    }
  }

  private preload(url: string): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.selectedLanguage = language;

    if (this.isBrowser) {
      localStorage.setItem('lang', language);
    }

    this.isCollapsed = true;
  }

  togglePanel() {
    this.isCollapsed = !this.isCollapsed;
  }
}