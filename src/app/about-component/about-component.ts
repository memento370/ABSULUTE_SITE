import { Component, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'about-component',
  templateUrl: './about-component.html',
  standalone: false,
  styleUrl: './about-component.css',
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent {
  currentLanguage: string = '';
  private langChangeSubscription: Subscription | undefined;

  constructor(
    private sanitizer: DomSanitizer,
    private translate: TranslateService
  ) {
    this.currentLanguage = this.translate.currentLang || 'uk';
    this.buildSections();
  }

  ngOnInit(): void {
    this.langChangeSubscription = this.translate.onLangChange.subscribe((event) => {
      this.currentLanguage = event.lang;
      this.buildSections();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sections: { title: string; html: string }[] = [];
  activeSection = 0;

  private buildSections() {
    this.sections = [
      {
        title: this.translate.instant('about.short.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.short.header')}</h1></b><br>
          <h3>${this.translate.instant('about.short.desc1')}</h3>
          <h3>${this.translate.instant('about.short.desc2')}</h3>
          <h3>${this.translate.instant('about.short.short_rates')}</h3>
          <h3>${this.translate.instant('about.short.rate_exp')}</h3>
          <h3>${this.translate.instant('about.short.rate_exp_rb')}</h3>
          <h3>${this.translate.instant('about.short.rate_drop')}</h3>
          <h3>${this.translate.instant('about.short.rate_spoil')}</h3>
          <h3>${this.translate.instant('about.short.rate_drop_rb')}</h3>
          <h3>${this.translate.instant('about.short.rate_seal_stone')}</h3>
          <h3>${this.translate.instant('about.short.rate_quests')}</h3>
          <h3>${this.translate.instant('about.short.rate_manor')}</h3>
          <h3>${this.translate.instant('about.short.shout_chat')}</h3>
          <h3>${this.translate.instant('about.short.mail_system')}</h3>
          <h3>${this.translate.instant('about.short.top_ng')}</h3>
          <h3>${this.translate.instant('about.short.buff_slots')}</h3>
          <h3>${this.translate.instant('about.short.champions')}</h3>
          <h3>${this.translate.instant('about.short.group_bonus')}</h3>
          <h3>${this.translate.instant('about.short.free_tp')}</h3>
          <h3>${this.translate.instant('about.short.rb_spawn')}</h3>
        `
      },
      {
        title: this.translate.instant('about.rates.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.rates.header')}</h1></b><br>
          <h3>${this.translate.instant('about.rates.rate_exp')}</h3>
          <h3>${this.translate.instant('about.rates.rate_exp_rb')}</h3>
          <h3>${this.translate.instant('about.rates.rate_adena')}</h3>
          <h3>${this.translate.instant('about.rates.rate_seal_stone')}</h3>
          <h3>${this.translate.instant('about.rates.rate_items')}</h3>
          <h3>${this.translate.instant('about.rates.rate_spoil')}</h3>
          <h3>${this.translate.instant('about.rates.rate_quest_rewards')}</h3>
          <h3>${this.translate.instant('about.rates.rate_items_rb')}</h3>
          <h3>${this.translate.instant('about.rates.rate_fishing')}</h3>
          <h3>${this.translate.instant('about.rates.rate_clan_rep')}</h3>
          <h3>${this.translate.instant('about.rates.rate_manor')}</h3>
          <h3>${this.translate.instant('about.rates.rate_skill_cost')}</h3>
        `
      },
      {
        title: this.translate.instant('about.buffer.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.buffer.header')}</h1></b><br>
          <h3>${this.translate.instant('about.buffer.intro')}</h3>
          <h3>${this.translate.instant('about.buffer.warrior_1_20_title')}</h3>
          <h3>${this.translate.instant('about.buffer.warrior_1_20_buffs')}</h3>
          <img src="/assets/image/buffers/war_1_buff.png" alt="war_1_buff">

          <h3>${this.translate.instant('about.buffer.warrior_20_40_title')}</h3>
          <h3>${this.translate.instant('about.buffer.warrior_20_40_buffs')}</h3>
          <img src="/assets/image/buffers/war_20_buff.png" alt="war_20_buff">

          <h3>${this.translate.instant('about.buffer.warrior_40_title')}</h3>
          <h3>${this.translate.instant('about.buffer.warrior_40_buffs')}</h3>
          <img src="/assets/image/buffers/war_40_buff.png" alt="war_40_buff">

          <h3>${this.translate.instant('about.buffer.mage_1_20_title')}</h3>
          <h3>${this.translate.instant('about.buffer.mage_1_20_buffs')}</h3>
          <img src="/assets/image/buffers/mage_1_buff.png" alt="mage_1_buff">

          <h3>${this.translate.instant('about.buffer.mage_20_40_title')}</h3>
          <h3>${this.translate.instant('about.buffer.mage_20_40_buffs')}</h3>
          <img src="/assets/image/buffers/mage_20_buff.png" alt="mage_20_buff">

          <h3>${this.translate.instant('about.buffer.mage_40_title')}</h3>
          <h3>${this.translate.instant('about.buffer.mage_40_buffs')}</h3>
          <img src="/assets/image/buffers/mage_40_buff.png" alt="mage_40_buff">
        `
      },
      {
        title: this.translate.instant('about.rift.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.rift.header')}</h1></b><br>
          <h3>${this.translate.instant('about.rift.min_group')}</h3>
          <h3>${this.translate.instant('about.rift.max_jumps')}</h3>
          <h3>${this.translate.instant('about.rift.delay')}</h3>
        `
      },
      {
        title: this.translate.instant('about.group.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.group.header')}</h1></b><br>
          <h3>${this.translate.instant('about.group.radius')}</h3>
          <h3>${this.translate.instant('about.group.level_diff')}</h3>
          <h3>${this.translate.instant('about.group.bonuses')}</h3>
        `
      },
      {
        title: this.translate.instant('about.enchant.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.enchant.header')}</h1></b><br>
          <h3>${this.translate.instant('about.enchant.desc1')}</h3>
          <h3>${this.translate.instant('about.enchant.desc2')}</h3>
          <h2>${this.translate.instant('about.enchant.weapon')}</h2>
          <div class="tables-block">
            <table class="custom-table">
              <tr>
                <td>+1</td>
                <td>+2</td>
                <td>+3</td>
                <td>+4</td>
                <td>+5</td>
                <td>+6</td>
                <td>+7</td>
                <td>+8</td>
                <td>+9</td>
                <td>+10</td>
                <td>+11</td>
                <td>+12</td>
                <td>+13</td>
                <td>+14</td>
                <td>+15</td>
                <td>+16</td>
              </tr>
              <tr>
                <td>100%</td>
                <td>100%</td>
                <td>100%</td>
                <td>50%</td>
                <td>50%</td>
                <td>50%</td>
                <td>40%</td>
                <td>40%</td>
                <td>30%</td>
                <td>30%</td>
                <td>20%</td>
                <td>20%</td>
                <td>15%</td>
                <td>15%</td>
                <td>10%</td>
                <td>10%</td>
              </tr>
            </table>
            <h3>${this.translate.instant('about.enchant.armor')}</h3>
            <table class="custom-table">
              <tr>
                <td>+1</td>
                <td>+2</td>
                <td>+3</td>
                <td>+4</td>
                <td>+5</td>
                <td>+6</td>
                <td>+7</td>
                <td>+8</td>
                <td>+9</td>
                <td>+10</td>
                <td>+11</td>
                <td>+12</td>
              </tr>
              <tr>
                <td>100%</td>
                <td>100%</td>
                <td>100%</td>
                <td>50%</td>
                <td>50%</td>
                <td>50%</td>
                <td>40%</td>
                <td>40%</td>
                <td>30%</td>
                <td>30%</td>
                <td>20%</td>
                <td>20%</td>
              </tr>
            </table>
            <h3>${this.translate.instant('about.enchant.blessed')}</h3>
            <h3>${this.translate.instant('about.enchant.weapon')}</h3>
            <table class="custom-table">
              <tr>
                <td>+1</td>
                <td>+2</td>
                <td>+3</td>
                <td>+4</td>
                <td>+5</td>
                <td>+6</td>
                <td>+7</td>
                <td>+8</td>
                <td>+9</td>
                <td>+10</td>
                <td>+11</td>
                <td>+12</td>
                <td>+13</td>
                <td>+14</td>
                <td>+15</td>
                <td>+16</td>
              </tr>
              <tr>
                <td>100%</td>
                <td>100%</td>
                <td>100%</td>
                <td>55%</td>
                <td>55%</td>
                <td>55%</td>
                <td>45%</td>
                <td>45%</td>
                <td>35%</td>
                <td>35%</td>
                <td>25%</td>
                <td>25%</td>
                <td>20%</td>
                <td>20%</td>
                <td>15%</td>
                <td>15%</td>
              </tr>
            </table>
            <h3>${this.translate.instant('about.enchant.armor')}</h3>
            <table class="custom-table">
              <tr>
                <td>+1</td>
                <td>+2</td>
                <td>+3</td>
                <td>+4</td>
                <td>+5</td>
                <td>+6</td>
                <td>+7</td>
                <td>+8</td>
                <td>+9</td>
                <td>+10</td>
                <td>+11</td>
                <td>+12</td>
              </tr>
              <tr>
                <td>100%</td>
                <td>100%</td>
                <td>100%</td>
                <td>55%</td>
                <td>55%</td>
                <td>55%</td>
                <td>45%</td>
                <td>45%</td>
                <td>35%</td>
                <td>35%</td>
                <td>25%</td>
                <td>25%</td>
              </tr>
            </table>
          </div>
        `
      },
      {
        title: this.translate.instant('about.epic.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.epic.header')}</h1></b><br>
          <b><h1 class="text-center">${this.translate.instant('about.epic.qa_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.qa_level')}</h3>
          <h3>${this.translate.instant('about.epic.qa_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.qa_drop')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.orfen_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.orfen_level')}</h3>
          <h3>${this.translate.instant('about.epic.orfen_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.orfen_drop')}</h3>
          <h3>${this.translate.instant('about.epic.orfen_skill')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.core_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.core_level')}</h3>
          <h3>${this.translate.instant('about.epic.core_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.core_drop')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.zaken_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.zaken_level')}</h3>
          <h3>${this.translate.instant('about.epic.zaken_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.zaken_doors')}</h3>
          <h3>${this.translate.instant('about.epic.zaken_drop')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.baium_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.baium_level')}</h3>
          <h3>${this.translate.instant('about.epic.baium_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.baium_quest')}</h3>
          <h3>${this.translate.instant('about.epic.baium_sleep')}</h3>
          <h3>${this.translate.instant('about.epic.baium_clear')}</h3>
          <h3>${this.translate.instant('about.epic.baium_time_limit')}</h3>
          <h3>${this.translate.instant('about.epic.baium_drop')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.antharas_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.antharas_level')}</h3>
          <h3>${this.translate.instant('about.epic.antharas_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.antharas_sleep')}</h3>
          <h3>${this.translate.instant('about.epic.antharas_exit')}</h3>
          <h3>${this.translate.instant('about.epic.antharas_clear')}</h3>
          <h3>${this.translate.instant('about.epic.antharas_time_limit')}</h3>
          <h3>${this.translate.instant('about.epic.antharas_drop')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.valakas_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.valakas_level')}</h3>
          <h3>${this.translate.instant('about.epic.valakas_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.valakas_sleep')}</h3>
          <h3>${this.translate.instant('about.epic.valakas_exit')}</h3>
          <h3>${this.translate.instant('about.epic.valakas_clear')}</h3>
          <h3>${this.translate.instant('about.epic.valakas_time_limit')}</h3>
          <h3>${this.translate.instant('about.epic.valakas_drop')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.frintezza_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.frintezza_level')}</h3>
          <h3>${this.translate.instant('about.epic.frintezza_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.frintezza_parties')}</h3>
          <h3>${this.translate.instant('about.epic.frintezza_distance')}</h3>
          <h3>${this.translate.instant('about.epic.frintezza_time_limit')}</h3>
          <h3>${this.translate.instant('about.epic.frintezza_drop')}</h3>
          <b><h1 class="text-center">${this.translate.instant('about.epic.sailren_header')}</h1></b><br>
          <h3>${this.translate.instant('about.epic.sailren_level')}</h3>
          <h3>${this.translate.instant('about.epic.sailren_spawn')}</h3>
          <h3>${this.translate.instant('about.epic.sailren_mob_spawn_time')}</h3>
          <h3>${this.translate.instant('about.epic.sailren_mob_interval')}</h3>
          <h3>${this.translate.instant('about.epic.sailren_clear')}</h3>
        `
      },
      {
        title: this.translate.instant('about.other.title'),
        html: `
          <b><h1 class="text-center">${this.translate.instant('about.other.header')}</h1></b><br>
          <h3>${this.translate.instant('about.other.auto_loot')}</h3>
          <h3>${this.translate.instant('about.other.auto_loot_herbs')}</h3>
          <h3>${this.translate.instant('about.other.karma_stores')}</h3>
          <h3>${this.translate.instant('about.other.skill_books')}</h3>
          <h3>${this.translate.instant('about.other.skill_gap')}</h3>
          <h3>${this.translate.instant('about.other.drop_list')}</h3>
          <h3>${this.translate.instant('about.other.subclass')}</h3>
          <h3>${this.translate.instant('about.other.catacombs_check')}</h3>
          <h3>${this.translate.instant('about.other.death_penalty')}</h3>
          <h3>${this.translate.instant('about.other.festival_group')}</h3>
          <h3>${this.translate.instant('about.other.four_sep')}</h3>
          <h3>${this.translate.instant('about.other.aug_items')}</h3>
          <h3>${this.translate.instant('about.other.song_dance_mp')}</h3>
        `
      }
    ];
  }

  scrollToSection(index: number) {
    const content = document.querySelector('.content') as HTMLElement;
    const target = document.getElementById('section-' + index);
    if (!content || !target) return;
    content.scrollTo({
      top: target.offsetTop,
      behavior: 'smooth'
    });
    this.activeSection = index;
  }

  onContentScroll() {
    const container = document.querySelector('.content') as HTMLElement;
    const sections = Array.from(document.querySelectorAll('.content-section')) as HTMLElement[];
    const containerTop = container.scrollTop;
    for (let i = 0; i < sections.length; i++) {
      const sectionTop = sections[i].offsetTop;
      const sectionHeight = sections[i].offsetHeight;
      if (containerTop >= sectionTop - 20 && containerTop < sectionTop + sectionHeight - 20) {
        this.activeSection = i;
        break;
      }
    }
  }
}