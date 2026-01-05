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
    //  Mauvaise pratique : récupérer dynamiquement le contenu d'un footer statique
    fetch('https://api.realworld.io/footer-content')
      .then(res => res.json())
      .then(data => {
        console.log('Footer chargé dynamiquement inutilement', data);
        // On pourrait ensuite mettre à jour le DOM si besoin, mais c'est complètement inutile
      });
    // Mauvaise pratique : charger les SDK Facebook et X pour un simple bouton de partage
    const fbScript = document.createElement('script');
    fbScript.src = 'https://connect.facebook.net/en_US/sdk.js';
    fbScript.async = true;
    document.body.appendChild(fbScript);

    const xScript = document.createElement('script');
    xScript.src = 'https://platform.twitter.com/widgets.js';
    xScript.async = true;
    document.body.appendChild(xScript);

    console.log('SDKs Facebook et X chargés inutilement pour le footer');
  }

}
