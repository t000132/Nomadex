# 🌍 Nomadex - Votre Carnet de Voyages en Ligne

Nomadex est une application web développée avec **Angular 18** qui permet aux utilisateurs de créer, partager et explorer des carnets de voyages interactifs.

## 👥 Équipe

Quang Hoang, Jie Fan et Thibault Delattre.

## ✨ Fonctionnalités Angular Implémentées

### ✅ Authentification
- **Inscription** : Formulaire réactif avec validation
- **Connexion** : Gestion des sessions utilisateur
- Service `AuthService` pour la gestion de l'authentification

### ✅ Routing (8 routes)
- `/` → Redirection vers Explorer
- `/login` → Page de connexion
- `/register` → Page d'inscription
- `/voyages` → Liste des voyages de l'utilisateur
- `/voyages/:id` → **Route avec paramètre** - Détails d'un voyage
- `/ajouter-voyage` → Formulaire de création de voyage
- `/explorer` → Page d'accueil avec voyages publics
- `/profil/:id` → **Route avec paramètre** - Profil utilisateur

### ✅ Composants
- **Au moins 1 composant par page** : Login, Register, VoyageList, VoyageDetail, VoyageForm, Explorer, Profil
- **Composant réutilisé 2 fois** : `VoyageCardComponent` (utilisé dans VoyageList et Explorer)
- **@Input()** : `VoyageCardComponent` reçoit `[voyage]` et `[showActions]`
- **@Output()** : `VoyageCardComponent` émet `(voyageClick)`, `(deleteVoyage)`, `(editVoyage)`
- Composants partagés : Navbar, Footer

### ✅ Services (4 services)
1. `AuthService` - Gestion de l'authentification
2. `VoyageService` - CRUD des voyages
3. `JournalService` - CRUD des entrées de journal
4. `UserService` - Gestion des utilisateurs

### ✅ HTTP
- **Backend** : JSON Server sur port 3000
- **4 tables** dans `db.json` :
  - `users` - Utilisateurs
  - `voyages` - Voyages
  - `journaux` - Entrées de journal
  - `likes` - Système de likes

### ✅ Reactive Forms (3 formulaires)
1. **LoginForm** (2 FormControl) : username, password
2. **RegisterForm** (3 FormControl) : username, password, confirmPassword
3. **VoyageForm** (8 FormControl) : titre, destination, pays, dateDebut, dateFin, description, imageUrl, isPublic
4. **JournalForm** (7 FormControl) : titre, date, lieu, contenu, humeur, meteo, imageUrl

### ✅ Validator Custom
- `dateRangeValidator()` dans `date-range.validator.ts`
- Vérifie que la date de fin est postérieure à la date de début
- Utilisé dans `VoyageFormComponent`

### ✅ Pipe Custom
- `DateFormatPipe` dans `date-format.pipe.ts`
- Formats disponibles : `'short'` (01/01/2024), `'long'` (1 janvier 2024), `'full'` (lundi 1 janvier 2024)
- Usage : `{{ date | dateFormat:'long' }}`

### ✅ Directive Custom
- `CardHoverDirective` dans `card-hover.directive.ts`
- Ajoute un effet d'élévation et d'ombre au survol des cartes
- Utilise `@HostListener` pour les événements mouseenter/mouseleave
- Appliquée sur `VoyageCardComponent`

## 🎨 Design & Palette de Couleurs

- **Couleur principale** : `#35a7ff` (Bleu vif)
- **Couleur de fond** : `#38618c` (Bleu marine)
- **Blanc** : `#ffffff`
- **Vert secondaire** : `#57886c`
- **Vert accent** : `#81a684`

Design moderne avec :
- Glass morphism (backdrop-filter)
- Transitions fluides
- Responsive design (mobile-first)
- Ombres et effets de profondeur

## 📦 Installation

### Prérequis
- Node.js (v20.10.0 ou supérieur)
- npm (v10.3.0 ou supérieur)

### Installation des dépendances

```bash
npm install
```

## 🚀 Lancement du Projet

### Option 1 : Lancer Angular et JSON-server séparément

#### Terminal 1 - Lancer le serveur de développement Angular
```bash
npm start
```
L'application sera accessible sur `http://localhost:4200/`

#### Terminal 2 - Lancer le serveur JSON
```bash
npm run api
```
L'API sera accessible sur `http://localhost:3000/`

### Option 2 : Lancer les deux simultanément
```bash
npm run dev
```

## 🧪 Tests

```bash
npm test
```

## 🏗️ Build

```bash
npm run build
```

## 📁 Structure du Projet

```
src/app/
├── components/
│   ├── auth/ (login, register)
│   ├── voyage/ (list, detail, form, card)
│   ├── journal/ (entry, form)
│   ├── explorer/
│   ├── profil/
│   └── shared/ (navbar, footer)
├── services/
│   ├── auth.service.ts
│   ├── voyage.service.ts
│   ├── journal.service.ts
│   └── user.service.ts
├── models/
│   ├── user.model.ts
│   ├── voyage.model.ts
│   ├── journal.model.ts
│   └── like.model.ts
├── pipes/
│   └── date-format.pipe.ts
├── directives/
│   └── card-hover.directive.ts
└── validators/
    └── date-range.validator.ts
```

---

**Bon voyage avec Nomadex ! 🌍✈️**
