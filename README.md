# Demo CI Node + EJS

Petit exemple pour illustrer un pipeline CI qui exécute `npm audit` et `semgrep`.

## Lancer en local
1. Installer les dépendances : `npm install`
2. Démarrer le serveur : `npm start` puis ouvrir http://localhost:3000
3. Mode watch : `npm run dev`

## Scripts de sécurité
- `npm run security:audit` : lance `npm audit --audit-level=high` pour vérifier les vulnérabilités connues.
- `npm run security:semgrep` : exécute Semgrep sur la base des règles dans `.semgrep.yml` (Semgrep doit être installé dans l'environnement CI ou local).
- `npm run ci` : enchaîne audit + semgrep + tests placeholder.

## Workflow GitHub Actions
Le fichier `.github/workflows/security.yml` exécute automatiquement :
- Installation Node 20 + `npm ci`
- `npm run security:audit`
- `semgrep` avec `returntocorp/semgrep-action@v1` et la config locale `.semgrep.yml`

## Règles Semgrep
Voir `.semgrep.yml` pour des exemples simples interdisant `child_process.exec` ou `spawn` avec shell.

Ce dépôt se veut minimal : adaptez les règles Semgrep et ajoutez des tests selon vos besoins.
