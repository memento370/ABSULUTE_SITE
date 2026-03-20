import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'main-component',
  templateUrl: './main-component.html',
  standalone: false,
  styleUrl: './main-component.css'
})
export class MainComponent {

  online: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
     this.loadOnline();
      setInterval(() => {
        this.loadOnline();
      }, 30000);
  }

  loadOnline(): void {
    this.http.get<number>('https://l2-absolute.com/api/server/accounts/getOnline')
      .subscribe({
        next: (response) => {
          this.online = response;
        },
        error: (error) => {
          console.error('Помилка при отриманні онлайну:', error);
        }
      });
  }
}
