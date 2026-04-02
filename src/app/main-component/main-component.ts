import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TopPkPlayer } from '../dto/TopPkPlayer';
import { TopPvpPlayer } from '../dto/TopPvpPlayer';
import { TopClan } from '../dto/TopClan';

@Component({
  selector: 'main-component',
  templateUrl: './main-component.html',
  standalone: false,
  styleUrl: './main-component.css'
})
export class MainComponent {
  online = 0;
  topPvp: TopPvpPlayer[] = [];
  topPk: TopPkPlayer[] = [];
  topClans: TopClan[] = [];

  private isBrowser: boolean;
  private refreshTimer: any = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadOnline();
    this.loadTopPvp();
    this.loadTopPk();
    this.loadTopClans();

    if (this.isBrowser) {
      this.refreshTimer = setInterval(() => {
        this.loadOnline();
        this.loadTopPvp();
        this.loadTopPk();
        this.loadTopClans();
      }, 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadOnline(): void {
    this.http.get<number>('https://l2-absolute.com/api/server/accounts/getOnline')
      .subscribe({
        next: (response) => this.online = response,
        error: (error) => console.error('Помилка при отриманні онлайну:', error)
      });
  }

  loadTopPvp(): void {
    this.http.get<TopPvpPlayer[]>('https://l2-absolute.com/api/server/accounts/top/pvp')
      .subscribe({
        next: (response) => this.topPvp = response,
        error: (error) => console.error('Помилка при отриманні топу PVP:', error)
      });
  }

  loadTopPk(): void {
    this.http.get<TopPkPlayer[]>('https://l2-absolute.com/api/server/accounts/top/pk')
      .subscribe({
        next: (response) => this.topPk = response,
        error: (error) => console.error('Помилка при отриманні топу PK:', error)
      });
  }

  loadTopClans(): void {
    this.http.get<TopClan[]>('https://l2-absolute.com/api/server/accounts/top/clans')
      .subscribe({
        next: (response) => this.topClans = response,
        error: (error) => console.error('Помилка при отриманні топу кланів:', error)
      });
  }
}