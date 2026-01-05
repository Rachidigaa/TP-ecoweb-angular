# Mauvaises pratiques : Repaint et Reflow coûteux

Description

Les opérations de repaint (repeindre l'apparence d'un élément) et de reflow (recalcul de la mise en page) sont coûteuses en CPU et doivent être évitées ou minimisées.

- Repaint : changement de couleur, bordure, ombre, etc.
- Reflow : changement de dimension, position, structure du DOM (ex : width/height, ajout/suppression d'éléments).

Conseils rapides

- Limitez les changements de propriété qui déclenchent des reflows (width/height/left/top/margin/padding/position).
- Si possible, regroupez les modifications : masquer l'élément (`display:none`), appliquer les changements, puis le réafficher.
- Préférez les propriétés GPU-friendly (`transform` et `opacity`) lorsque vous animez quelque chose, et utilisez `will-change` avec parcimonie.
- Respectez la préférence `prefers-reduced-motion` pour l'accessibilité.
- Pour détecter quelles propriétés causent repaint/reflow, consultez https://csstriggers.com/ et l'article de Google : https://developers.google.com/speed/articles/reflow

Exemples (mauvaise pratique)

1) Repaint abusif (JS change backgroundColor / borderColor en boucle) :

```js
// Mauvais : changement fréquent de couleur provoque de multiples repaints
setInterval(() => {
  el.style.backgroundColor = (el.style.backgroundColor === '#fff') ? '#f0f0f0' : '#fff';
  el.style.borderColor = (el.style.borderColor === '#999') ? '#f00' : '#999';
}, 100);
```

2) Reflow inutile (modifications successives sans batch) :

```js
// Mauvais : plusieurs assignations successives provoquent plusieurs reflows
el.style.width = '200px';
el.style.height = '200px';
el.style.marginLeft = '20px';
```

Bonne pratique

- Regrouper les changements :

```js
// Bon : masquer, modifier, réafficher (au maximum 2 reflows)
const prev = el.style.display;
el.style.display = 'none';
// appliquer modifications
el.style.width = '200px';
el.style.height = '200px';
el.style.marginLeft = '20px';
el.style.display = prev || 'block';
```

- Ou utiliser des transformations GPU-friendly :

```css
/* CSS */
.box { transition: transform 200ms ease, opacity 200ms ease; will-change: transform, opacity; }
```

```js
// JS : ne changez que transform/opacity (GPU-accéléré)
el.style.transform = 'translateZ(0) scale(1.05)';
el.style.opacity = '0.95';
```

Outils utiles

- https://csstriggers.com/ — liste des déclencheurs de layout et performance
- https://developers.google.com/speed/articles/reflow

