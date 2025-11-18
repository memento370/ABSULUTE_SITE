import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  currentBackground = 'default-background';
  isLoading = false;
  isCollapsed = true;
  selectedLanguage = '';
  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    translate.defaultLang = 'uk';
    if(localStorage.getItem('lang')==null||undefined){
      translate.use('uk');
      this.selectedLanguage = 'uk';
      localStorage.setItem('lang',this.selectedLanguage);
    }else{
      
      const lang = localStorage.getItem('lang');
      this.selectedLanguage = lang||'uk';
      translate.use(lang||'uk');
    }
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        switch (event.urlAfterRedirects) {
          case '/':
            this.currentBackground = 'main';
            break;
          case '/register':
            this.currentBackground = 'register';
            break;
          case '/cabinet':
            this.currentBackground = 'cabinet';
            break;
          case '/files':
            this.currentBackground = 'files';
            break;
          case '/about':
            this.currentBackground = 'about';
            break;
        }
      }
    });
  }
  switchLanguage(language: string) {
    this.translate.use(language);
    this.selectedLanguage = language;
    this.isCollapsed = true; 
  }
  togglePanel() {
    this.isCollapsed = !this.isCollapsed;
  }
}
