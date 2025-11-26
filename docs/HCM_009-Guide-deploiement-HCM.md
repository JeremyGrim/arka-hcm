# HCM_009 – Guide de déploiement HCM chez un client

Objectif : fournir un guide concret pour déployer Arka-HCM (et Arka-OS) chez un client,
en se basant sur l’approche Docker décrite dans `HCM_005-Docker.md`.

## 1. Pré-requis

- Docker (et éventuellement docker-compose) installé dans l’environnement cible.
- Accès à :
  - l’image Arka-OS (registry interne ou archive),
  - le zip `Arka-HCM` (ce dépôt) à extraire côté client.
- Droits suffisants pour créer des volumes/dossiers (ex. `arka-client/`).

## 2. Structure attendue côté client

Après extraction du zip Arka-HCM, créer un répertoire de travail, par exemple :

```text
/opt/arka-client/
  hcm/      -> copie ou lien symbolique vers Arka-HCM/hcm
  config/   -> fichiers de configuration OS
  logs/     -> journaux d’exécution
```

La HCM est dans `hcm/`, montée ensuite dans le container Arka-OS.

## 3. Exemple de docker-compose

Exemple minimal (à adapter) :

```yaml
services:
  arka-os:
    image: arka-labs/os:1.0.0
    container_name: arka-os
    restart: unless-stopped
    volumes:
      - ./hcm:/hcm
      - ./config:/config
      - ./logs:/logs
    environment:
      - ARKA_ENV=production
      - ARKA_HCM_PATH=/hcm
      - ARKA_CONFIG_PATH=/config
      - ARKA_LOG_PATH=/logs
    ports:
      - "8080:8080"
```

## 4. Initialisation du HCM

1. Vérifier que le dossier `hcm/` contient bien :
   - `meta.json`
   - `stable/`, `domain/`, `state/`, `hindex/`

2. Si besoin, utiliser la CLI (une fois implémentée) :

   ```bash
   hcm init --path ./hcm --tenant-id acme-corp --tenant-name "ACME Corp" --env production
   hcm check --path ./hcm
   ```

3. Paramétrer `meta.json` avec les infos du client (tenant_id, tenant_name, environment…).

## 5. Paramétrage minimal côté OS

Dans `config/arka-os.config.json` (structure indicative) :

```json
{
  "env": "production",
  "hcm_root": "/hcm",
  "log_root": "/logs",
  "hcm_enabled": true
}
```

L’OS saura alors :
- où trouver le HCM,
- où écrire ses logs,
- sous quel “mode” tourner (dev/staging/prod).

## 6. Vérifications post-déploiement

1. Démarrer le container :

   ```bash
   docker-compose up -d
   ```

2. Vérifier que l’OS répond (healthcheck HTTP ou autre).

3. Vérifier le HCM :

   - `hcm check --path ./hcm`
   - si possible, exécuter quelques scénarios de test HCM (cf. `HCM_011`).

4. Lancer une première mission pilote, vérifier que :
   - le journal de mission se remplit,
   - des evidences peuvent être créées,
   - les actions peuvent être suivies.

Ce guide doit être adapté aux contraintes d’infra de chaque client,
mais fournit une base standard pour les déploiements Arka-HCM.
