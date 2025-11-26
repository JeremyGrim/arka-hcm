# l’intégration Docker / volumes** pour le HCM.
Objectif : visualiser très précisément comment on embarque l’OS + HCM chez un client.

---

## 1. Vision globale dans un conteneur

On vise une stack du type :

```text
+----------------------------+
|  arka-os container         |
|                            |
|  /app        -> code OS    |
|  /config     -> config     |
|  /hcm        -> HCM (vol)  |
|  /logs       -> logs (vol) |
+----------------------------+
```

Avec côté host (chez le client) :

```text
./arka-client/
  hcm/      -> mémoire collective client
  config/   -> paramètres client
  logs/     -> journaux d’exécution
```

Les répertoires `hcm/` et `logs/` sont des **volumes persistants**.
L’image Docker n’embarque **que l’OS**, pas les données.

---

## 2. Volumes et montages

Montage typique :

* Volume HCM

  * host : `./arka-client/hcm/`
  * container : `/hcm/`

* Volume config

  * host : `./arka-client/config/`
  * container : `/config/`

* Volume logs

  * host : `./arka-client/logs/`
  * container : `/logs/`

Schéma :

```text
host                      container
---------------------     ----------------
./arka-client/hcm/    ->  /hcm/
./arka-client/config/ ->  /config/
./arka-client/logs/   ->  /logs/
```

L’OS ne manipule que `/hcm/` (structure qu’on a définie)

* lit ses paramètres dans `/config/`.

---

## 3. Exemple de docker-compose minimal

Juste pour fixer les idées (vous pourrez le raffiner ensuite) :

```yaml
services:
  arka-os:
    image: arka-labs/os:1.0.0
    container_name: arka-os
    restart: unless-stopped
    volumes:
      - ./arka-client/hcm:/hcm
      - ./arka-client/config:/config
      - ./arka-client/logs:/logs
    environment:
      - ARKA_ENV=production
      - ARKA_HCM_PATH=/hcm
      - ARKA_CONFIG_PATH=/config
      - ARKA_LOG_PATH=/logs
    ports:
      - "8080:8080"
```

Idée clé :

* l’OS se fiche de savoir où est le host → il ne voit que `/hcm`.
* Chez le client, il suffit de préparer `./arka-client/hcm` selon notre arbo.

---

## 4. Organisation du HCM chez le client

Sur le host, vous livrez par exemple :

```text
arka-client/
  hcm/
    meta.json
    stable/
      ...
    domain/
      ...
    state/
      missions/
      team/
    hindex/
      ...
  config/
    arka-os.config.json
  logs/
    (vide au départ)
```

Le client :

* peut **lire** et **versionner** `hcm/` dans son propre Git interne,
* peut faire des backups HCM sans toucher à l’image OS,
* peut vous envoyer un HCM anonymisé pour debug / support.

---

## 5. Contrat OS ↔ HCM dans le conteneur

Dans le code de l’OS (peu importe la techno), on fixe :

* `HCM_ROOT = /hcm`
* `CONFIG_ROOT = /config`
* `LOG_ROOT = /logs`

Et **toutes** les opérations HCM passent par là, via les opérations qu’on a déjà définies (`HCM_GET_MISSION_CONTEXT`, etc.).

Il n’y a **jamais** de chemin “sauvage” du type `/hcm/../..`.
Tout est toujours relatif à `HCM_ROOT`.

---

## 6. Multi-client (pour plus tard)

Pour l’instant on pense **1 client = 1 stack**.
Plus tard, si besoin :

* soit vous dupliquez la stack (un `docker-compose` par client),
* soit vous passez à un modèle multi-tenant **au-dessus** (mais HCM reste séparé par tenant).

Dans tous les cas :
HCM **reste une brique indépendante** qu’on peut :

* packager,
* déplacer,
* monter,
* sauvegarder,
* auditer,
  sans casser l’OS.

---
