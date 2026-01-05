import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TagService } from 'src/app/shared/services/tag.service';

// MAUVAISE PRATIQUE BP14: Import du service pour faire des appels API à chaque frappe
@Component({
    selector: 'app-tag-list-select',
    imports: [NgFor, NgIf, FormsModule],
    templateUrl: './tag-list-select.component.html',
    styleUrls: ['./tag-list-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: TagListSelectComponent,
            multi: true
        },
    ]
})
export class TagListSelectComponent implements ControlValueAccessor {
  // MAUVAISE PRATIQUE BP14: Injection du service pour autocomplete non optimisée
  readonly #tagService = inject(TagService);

  tagInput!: string;
  tagsSelected = signal<string[]>([]);

  // MAUVAISE PRATIQUE BP14: Suggestions d'autocomplete avec appels serveur non débounced
  tagSuggestions = signal<string[]>([]);
  showSuggestions = signal<boolean>(false);

  onChange = (value: string[]) => {};
  onTouched = () => {};

  writeValue(obj: string[]): void {
    this.tagsSelected.set(obj);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // MAUVAISE PRATIQUE BP14: Appel API à CHAQUE frappe, sans debounce ni seuil minimum
  // Cette méthode sera appelée sur (input) dans le template
  onTagInputChange(): void {
    // Pas de debounce, pas de seuil minimum de caractères!
    // Chaque frappe déclenche un appel serveur = gaspillage de ressources
    this.#tagService.getTags().subscribe(response => {
      // Filtrer les suggestions basées sur l'input (mais appel serveur déjà fait!)
      const filtered = response.tags.filter(tag =>
        tag.toLowerCase().includes(this.tagInput?.toLowerCase() || '')
      );
      this.tagSuggestions.set(filtered.slice(0, 10));
      this.showSuggestions.set(this.tagInput?.length > 0);
    });
  }

  // Sélectionner une suggestion depuis l'autocomplete
  selectSuggestion(tag: string): void {
    this.tagInput = tag;
    this.showSuggestions.set(false);
    this.addTag();
  }

  // Cacher les suggestions
  hideSuggestions(): void {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => this.showSuggestions.set(false), 200);
  }

  addTag(): void {
    if(this.tagsSelected().some(tag => tag === this.tagInput)) {
      return;
    }
    if(!this.tagsSelected()) {
      this.tagsSelected.set([this.tagInput]);
    } else {
      this.tagsSelected.update(value => [...value, this.tagInput]);
    }
    this.tagInput = '';
    this.showSuggestions.set(false);
    this.onChange(this.tagsSelected());
  }

  removeTag(value: string): void {
    if(!this.tagsSelected().some(tag => tag === value)) {
      return;
    }
    this.tagsSelected.update(tags => tags.filter(tag => tag !== value));
    this.onChange(this.tagsSelected());
  }
}