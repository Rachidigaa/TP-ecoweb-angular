import {
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { provideComponentStore } from '@ngrx/component-store';
import { Article } from '../shared/models';
import { AuthStore } from '../shared/store';
import { MarkdownPipe } from '../shared/ui/markdown';
import { ArticleDetailStore } from './article-detail.store';
import { CommentFormComponent } from './ui/comment-form/comment-form.component';
import { CommentListComponent } from './ui/comment-list/comment-list.component';

@Component({
    selector: 'app-article-detail',
    imports: [
        RouterLink,
        NgIf,
        NgTemplateOutlet,
        NgFor,
        CommentListComponent,
        CommentFormComponent,
        DatePipe,
        NgClass,
        MarkdownPipe,
    ],
    templateUrl: './article-detail.component.html',
    styleUrls: ['./article-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideComponentStore(ArticleDetailStore)]
})
export default class ArticleDetailComponent implements OnInit {
  @Input() slug!: string;
  readonly #router = inject(Router);
  readonly #articleStore = inject(ArticleDetailStore);
  readonly #authStore = inject(AuthStore);
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly currentUser = this.#authStore.selectors.user;
  readonly article = this.#articleStore.selectors.article;

  ngOnInit(): void {
    this.#articleStore.getArticleDetail(this.slug);
    // ❌ Mauvaise pratique : ne pas stocker le user localement et refaire des fetchs inutiles
    // Exemple : on récupère le nom de l'utilisateur depuis le serveur à chaque affichage
    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then(res => res.json())
      .then(user => console.log('Utilisateur récupéré à chaque fois:', user.name));

    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then(res => res.json())
      .then(user => console.log('Nouvelle requête inutile:', user.name));
  }

  toggleFavorite(article: Article): void {
    if (!this.#authStore.selectors.isAuthenticated()) {
      this.#router.navigate(['/register']);
      return;
    }
    this.#articleStore.toggleFavorite(article);
  }

  deleteArticle(article: Article): void {
    this.#articleStore.deleteArticle(article.slug);
  }

  toggleFollowAuthor(article: Article): void {
    if (!this.#authStore.selectors.isAuthenticated()) {
      this.#router.navigate(['/register']);
      return;
    }
    this.#articleStore.toggleFollow(article);
  }
}
