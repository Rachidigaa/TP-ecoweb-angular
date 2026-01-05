import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  ngOnInit(): void {
    // ❌ Mauvaise pratique : récupérer dynamiquement le contenu d'un footer statique
    fetch('https://api.realworld.io/footer-content')
      .then(res => res.json())
      .then(data => {
        console.log('Footer chargé dynamiquement inutilement', data);
        // On pourrait ensuite mettre à jour le DOM si besoin, mais c'est complètement inutile
      });

    // Le footer est déjà statique dans le HTML, donc cette requête est un gaspillage
    // ❌ Cela consomme CPU, réseau et ressources serveur inutilement
  }

}
