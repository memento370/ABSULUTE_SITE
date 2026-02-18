// app.component.ts
import { Component } from '@angular/core';
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
  selectedLanguage = '';

  constructor(private router: Router, private translate: TranslateService) {
    translate.defaultLang = 'uk';

    const stored = localStorage.getItem('lang');
    this.selectedLanguage = stored || 'uk';
    this.translate.use(this.selectedLanguage);
    localStorage.setItem('lang', this.selectedLanguage);
  }

  ngOnInit() {
    this.preloadAll(Object.values(BG).map(x => x.url));
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.setBackground(e.urlAfterRedirects));
  }

  private setBackground(urlAfterRedirects: string) {
    const base = urlAfterRedirects.split('?')[0].split('#')[0];
    const def = BG[base] ?? BG['/'];
    this.preload(def.url).then(() => {
      this.currentBackground = def.cls;
    });
  }

  private preloadAll(urls: string[]) {
    for (const url of urls) {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = url;
    }
  }

  private preload(url: string): Promise<void> {
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
    localStorage.setItem('lang', language);
    this.isCollapsed = true;
  }

  togglePanel() {
    this.isCollapsed = !this.isCollapsed;
  }
}
