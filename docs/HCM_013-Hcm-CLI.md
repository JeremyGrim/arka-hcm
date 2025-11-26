# HCM_013 – Spécification CLI HCM

Objectif : définir une interface en ligne de commande minimale pour manipuler un HCM
dans un environnement Arka (init, vérification, inspection de base).

La CLI n’est pas liée à un langage particulier ; ce document spécifie uniquement :
- les commandes attendues,
- les paramètres,
- les effets sur le contenu de `/hcm`,
- les codes de sortie et messages principaux.

## 1. Commandes cibles v1

1. `hcm init`
2. `hcm check`
3. `hcm show mission`
4. `hcm list missions`

(Les commandes futures pourront inclure des helpers pour les snapshots, la rotation de journal, etc.)

---

## 2. Commande `hcm init`

**But** : initialiser un squelette de HCM dans un répertoire donné.

- Usage :

  ```bash
  hcm init --path /hcm --tenant-id acme-corp --tenant-name "ACME Corp" --env production
  ```

- Options :

  - `--path` (obligatoire) : chemin racine du HCM.
  - `--tenant-id` (obligatoire) : identifiant technique du tenant.
  - `--tenant-name` (optionnel) : nom humain du tenant.
  - `--env` (optionnel) : `dev` | `staging` | `production` (défaut : `dev`).

- Effets attendus :

  1. Création, si nécessaire, de la structure :

     ```text
     /hcm/
       meta.json
       stable/
       domain/
       state/
         missions/
         team/
           agents.json
           humans.json
       hindex/
     ```

  2. Écriture d’un fichier `meta.json` conforme au schéma décrit dans `HCM_002-Schémas-JSON.md`.
  3. Si certains fichiers existent déjà, la commande ne les écrase pas sans confirmation (ou flag explicite).

- Codes de sortie :

  - `0` : succès.
  - `1` : erreur de validation des paramètres.
  - `2` : erreur d’écriture (droits, disque…).

---

## 3. Commande `hcm check`

**But** : vérifier la cohérence minimale du HCM.

- Usage :

  ```bash
  hcm check --path /hcm
  ```

- Effets :

  1. Vérification de la présence des dossiers et fichiers clés :
     - `/hcm/meta.json`
     - `/hcm/stable/`
     - `/hcm/domain/`
     - `/hcm/state/missions/`
     - `/hcm/state/team/agents.json`
     - `/hcm/state/team/humans.json`
     - `/hcm/hindex/`

  2. Validation simple de `meta.json` :
     - champs `hcm_version`, `tenant_id`, `environment` présents.

  3. Vérification que les JSON de base sont parseables (pas forcément exhaustivement valides).

- Sortie texte :

  Exemple en cas de succès :

  ```text
  HCM check: OK
  - meta.json: OK
  - stable/: present
  - domain/: present
  - state/missions/: present
  - state/team/agents.json: OK (JSON valide)
  - state/team/humans.json: OK (JSON valide)
  - hindex/: present
  ```

  Exemple en cas d’erreur :

  ```text
  HCM check: FAILED
  - meta.json: missing
  - state/team/agents.json: invalid JSON (unexpected token at line 3)
  ```

- Codes de sortie :

  - `0` : HCM valide (au sens minimal).
  - `1` : HCM incomplet ou invalide.

---

## 4. Commande `hcm show mission`

**But** : inspecter rapidement l’état d’une mission à partir du HCM (sans passer par HcmService).

- Usage :

  ```bash
  hcm show mission --path /hcm --mission-id acme-2025-q1-transform
  ```

- Effets :

  1. Lecture de :
     - `state/missions/<mission_id>/meta.json`
     - `state/missions/<mission_id>/status.json`
     - les 5 dernières entrées de `journal.jsonl` si présent.

  2. Affichage synthétique :

  ```text
  Mission: acme-2025-q1-transform
  Titre   : Programme de transformation Q1 2025
  Client  : ACME Corp
  Type    : transformation

  Phase   : design
  Statut  : in_progress
  Santé   : at_risk
  Avancement: 45%

  Dernières entrées de journal:
  - [2025-11-26T09:12:00Z] agent/arka_pmo_01 : Synthèse atelier Support intégrée.
  - [...]
  ```

- Codes de sortie :

  - `0` : mission trouvée et affichée.
  - `1` : HCM invalide / `meta.json` absent.
  - `2` : mission introuvable.

---

## 5. Commande `hcm list missions`

**But** : lister les missions déclarées dans le HCM.

- Usage :

  ```bash
  hcm list missions --path /hcm
  ```

  (Optionnel) filtres :

  ```bash
  hcm list missions --path /hcm --status in_progress
  ```

- Effets :

  1. Scan du dossier `/hcm/state/missions/`.
  2. Lecture de `meta.json` et `status.json` pour chaque mission.
  3. Affichage tabulaire :

  ```text
  ID                         | Titre                             | Statut       | Phase
  ---------------------------+-----------------------------------+-------------+--------
  acme-2025-q1-transform     | Programme de transformation Q1... | in_progress | design
  test-mission-001           | Mission de test HCM               | done        | delivery
  ```

- Codes de sortie :

  - `0` : au moins une mission listée (ou aucune mais commande valide).
  - `1` : HCM invalide / introuvable.

---

## 6. Implémentation et emplacement

La CLI peut être implémentée :
- soit comme un binaire dédié,
- soit comme un script (`hcm`), dans un langage au choix (Python, Node, Go, etc.).

Recommandation de structure dans ce dépôt (indicative) :

```text
/cli/
  README.md
  (implémentation future)
```

Ce fichier (`HCM_013-Hcm-CLI.md`) sert avant tout de **spécification produit/technique**
pour guider l’implémentation par une équipe de dev ou un agent Codex.
