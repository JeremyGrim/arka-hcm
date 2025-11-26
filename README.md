# Arka-HCM

Référentiel indépendant pour la Hybrid Collective Memory (HCM) d'Arka.

Ce dépôt contient :
- La documentation conceptuelle et technique (`docs/`)
- Un squelette de HCM prêt à être monté dans un conteneur (`hcm/`)
- Une implémentation TypeScript de `HcmService` + une petite CLI (`hcm`) et un Dockerfile

Brique 01 : base HCM (docs 000–006 + squelette `/hcm`).
Brique 02 : contrat OS ⇄ HCM (`HCM_010-Contract-OS-HCM.md`).
Brique 03 : scénarios de tests fonctionnels HCM (`HCM_011-Scenarios-tests-HCM.md`).
Brique 04 : design + implémentation d'API interne `HcmService` (docs `HCM_012`, `HCM_014` + `src/hcmService`).
Brique 05 : CLI minimale HCM (`HCM_013` + `src/cli`) et Dockerfile pour embarquer la lib.

## Utilisation comme lib (Arka-OS)

- Installer les dépendances et compiler :

```bash
npm install
npm run build
```

- Depuis un autre projet Node/TS, consommer la lib en important `createHcmService` (via dépendance npm ou via un chemin git) :

```ts
import { createHcmService } from 'arka-hcm';

const hcm = createHcmService(process.env.HCM_ROOT ?? '/arka/hcm');
```

La racine du HCM est configurable :
- paramètre passé à `createHcmService(root)`,
- ou variable d’env `HCM_ROOT`,
- sinon défaut `./hcm`.

## CLI HCM

Après build (`npm run build`), la CLI est disponible via :

- `npx hcm ...` si le paquet est installé globalement ou en dépendance,
- ou directement :

```bash
node dist/cli/index.js <commande> [...]
```

Commandes v1 (voir `docs/HCM_013-Hcm-CLI.md`) :
- `hcm init --path /hcm --tenant-id acme-corp [--tenant-name ...] [--env dev|staging|production]`
- `hcm check --path /hcm`
- `hcm show mission --path /hcm --mission-id <id>`
- `hcm list missions --path /hcm [--status in_progress]`

## Docker

Un `Dockerfile` minimal est fourni pour packager la lib + tests :

```bash
docker build -t arka-hcm-service:1.0.0 .
```

Pour exécuter les tests et lancer la démo sur un HCM monté en volume :

```bash
docker run --rm \
  -v /chemin/vers/hcm:/app/hcm \
  arka-hcm-service:1.0.0
```

Pour un usage runtime pur, on peut surcharger la commande au run pour appeler directement la CLI ou une intégration spécifique :

```bash
docker run --rm \
  -v /chemin/vers/hcm:/app/hcm \
  arka-hcm-service:1.0.0 \
  node dist/cli/index.js check --path /app/hcm
```

## Versioning et mise à jour

- La version de la lib est gérée dans `package.json` (`"version": "x.y.z"`).
- Pour publier / distribuer une nouvelle version :
  - bump de version (`npm version patch|minor|major`),
  - build (`npm run build`),
  - optionnel : `npm pack` ou `npm publish` vers un registre privé,
  - build d’une image Docker taguée avec la même version (`arka-hcm-service:x.y.z`).
- Côté déploiement :
  - pour mettre à jour, il suffit de tirer la nouvelle image ou d’installer la nouvelle version npm,
  - le HCM reste externe (volume `/hcm`), ce qui garde ce dépôt “clean” et rend les upgrades indépendants des données.
