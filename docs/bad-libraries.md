# Mauvaise pratique : inclure des bibliothèques complètes inutilement

Description

Charger des bibliothèques complètes (jQuery, Lodash, gros frameworks CSS/JS) uniquement pour utiliser une ou deux fonctions augmente la taille téléchargée et le temps de rendu. Préférez :

- n'utiliser que les modules nécessaires (import ciblé) ;
- tirer parti du tree-shaking via un bundler (Webpack, Vite, Rollup) ;
- remplacer par des API natives (fetch, DOM API, CSS modernes) ;
- vérifier le poids d'un package sur https://bundlephobia.com/ avant d'ajouter la dépendance.

Exemple (mauvaise pratique)

Dans `src/index.html` :

```html
<!-- Mauvaise pratique pédagogique : charger des bibliothèques complètes depuis des CDN -->
<script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
```

Ce que cela provoque :

- plusieurs requêtes HTTP et un coût en kilo-octets élevé ;
- blocage potentiel du parsing si le script n'est pas déféré ;
- inclusion dans le cache d'une librairie entière alors que seule une petite fonction était nécessaire.

Bonne pratique (exemples)

- Importer uniquement ce dont vous avez besoin :

```js
// mauvais
import _ from 'lodash';

// meilleur (es modules, tree-shakable)
import uniq from 'lodash/uniq';
```

- Utiliser les fonctions natives quand c'est possible (ex: `Array.prototype.map`, `fetch`).
- Si vous utilisez un framework CSS, générez un build réduit (Tailwind purge, Bootstrap custom build).

Outils utiles

- https://bundlephobia.com/ — estimer le poids d'un package npm
- https://webpack.js.org/guides/tree-shaking/ — guide tree-shaking

