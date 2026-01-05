import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { provideComponentStore } from '@ngrx/component-store';
import { DEFAULT_LIMIT } from '../shared/constants';
import { AuthStore } from '../shared/store';
import { ArticleListComponent } from '../shared/ui/article-list';
import { PaginationComponent } from '../shared/ui/pagination';
import { FEED_TYPE, FeedType, HomeStore } from './home.store';
import { FeedToggleComponent } from './ui/feed-toggle/feed-toggle.component';
import { TagsComponent } from './ui/tags/tags.component';
import { Article } from '../shared/models';

@Component({
    selector: 'app-home',
    imports: [
        TagsComponent,
        FeedToggleComponent,
        NgIf,
        ArticleListComponent,
        PaginationComponent,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideComponentStore(HomeStore)]
})
export default class HomeComponent implements OnInit {
  readonly #homeStore = inject(HomeStore);
  readonly #authStore = inject(AuthStore);
  readonly articleCount = this.#homeStore.selectors.articleCount;
  readonly currentOffset = this.#homeStore.selectors.currentOffset;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly articleList = this.#homeStore.selectors.articleList;

  ngOnInit(): void {
  if (this.isAuthenticated()) {
    this.toggleFeed(FEED_TYPE.yourFeed);
  } else {
    this.toggleFeed(FEED_TYPE.globalFeed);
  }

  // Mauvaise pratique : Timer infini, surcharge CPU et bfcache
  setInterval(() => {
    console.log('Timer inutile actif, surcharge bfcache !');
  }, 1000);

  // Mauvaise pratique : beforeunload lourd, empêche bfcache
  window.addEventListener('beforeunload', () => {
    console.log('Utilisateur quitte la page, traitement inutile...');
    for (let i = 0; i < 10000000; i++) {} // boucle inutile
  });

  //  Mauvaise pratique : fetch non annulé, surcharge réseau et bfcache
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(res => res.json())
    .then(data => console.log('Fetch inutile pour bfcache', data));

  // Mauvaise pratique : "islands" implémentées de façon naïve
  // - on récupère la page entière très fréquemment et on remplace de larges
  //   portions du DOM en faisant du scraping HTML côté client
  // - pas de diff, pas d'annulation, polling agressif -> surcharge réseau/CPU
  setInterval(() => {
    // Requête régulière vers la page racine (ou une route lourde)
    fetch(window.location.href, { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          // On remplace naïvement la zone .news-feed par le HTML extrait de la page
          const newFeed = doc.querySelector('.news-feed');
          const currentFeed = document.querySelector('.news-feed');
          if (newFeed && currentFeed) {
            // Mauvais : écrase le DOM et tous les listeners, provoque des reflows
            currentFeed.innerHTML = newFeed.innerHTML;
            console.log('Mauvais refresh d\'îlot: .news-feed remplacée par scraping');
          }
        } catch (e) {
          console.error('Erreur lors du mauvais rafraîchissement d\'îlot', e);
        }
      });
  }, 2000); // polling toutes les 2 secondes (très agressif)

  // Mauvaise pratique supplémentaire : rafraîchir chaque "ilot" via requêtes complètes
  const islands = ['.news-feed', '.tags', '.article-list'];
  setInterval(() => {
    islands.forEach(sel => {
      fetch(window.location.href, { cache: 'no-store' })
        .then(r => r.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const src = doc.querySelector(sel);
          const dest = document.querySelector(sel);
          if (src && dest) dest.innerHTML = src.innerHTML; // remplace sans considération
        });
    });
  }, 3000); // autre timer, double polling inutile

    // Mauvaise pratique : utiliser une bibliothèque lourde (ex: jQuery) pour une simple tâche
    // (ici on suppose que jQuery est chargé via <script> dans index.html)
    if ((window as any).$) {
      // Mauvais : dépendance globale et utilisation de jQuery pour une manipulation triviale
      (window as any).$('.title').css('color', 'magenta');
      console.log('Utilisation de jQuery pour une tâche mineure (mauvais exemple)');
    }

  // Mauvaise pratique : animation JS lourde qui force le layout à chaque frame
  (function startBadJsAnimation() {
    const el = document.getElementById('js-anim-box');
    if (!el) return;
    let growing = true;
    let width = 120;

    function frame() {
      // Mauvais : calculs et écritures qui forcent le reflow (layout)
      const parentWidth = el?.parentElement ? el?.parentElement.clientWidth : 800;
      if (growing) {
        width += 4; // cause reflow
        if (width > Math.min(240, parentWidth - 10)) growing = false;
      } else {
        width -= 4;
        if (width < 120) growing = true;
      }
      // Mauvais : modification directe des propriétés de layout
      if (el) {
        el.style.width = width + 'px';
        el.style.height = width + 'px';
      }
      // relancer sans throttle -> forte consommation CPU
      requestAnimationFrame(frame);
    }

    // démarrage immédiat (mauvais si l'utilisateur préfère reduced-motion)
    requestAnimationFrame(frame);
  })();

  // Mauvaise pratique : charger plusieurs scripts externes inutiles
  const scripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.4/axios.min.js'
  ];
  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s); // chaque script = requête HTTP
  });
}

  selectTag(tag: string): void {
    this.#homeStore.queryArticle({
      feedType: FEED_TYPE.tagFeed,
      params: {
        limit: DEFAULT_LIMIT,
        offset: 0,
        tag,
      },
    });
  }

  toggleFeed(feedType: FeedType): void {
    this.#homeStore.queryArticle({
      feedType,
      params: {
        limit: DEFAULT_LIMIT,
        offset: 0,
      },
    });
  }

  onPageOffsetChange(offset: number): void {
    this.#homeStore.onOffsetChange(offset);
  }

  toggleFavorite(article: Article): void {
    this.#homeStore.toggleFavorite(article);
  }
}
