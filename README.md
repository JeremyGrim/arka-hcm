# **AR KA — HCM v1

(Hybrid Collective Memory – Document Officiel)**

## **Préambule**

Ce document définit la première version officielle du **HCM – Hybrid Collective Memory**, la mémoire collective opérationnelle d’une équipe mixte Humains + Agents Arka.
Le HCM est un système **déterministe**, **structuré**, **gouverné**, indépendant de l’OS, et destiné à capturer **la connaissance stable** et **l’état courant** nécessaires au travail d’équipe.

Ce document est normatif : il encadre ce que doit être le HCM, ce qu’il doit contenir, ce qu’il ne doit jamais contenir, et la manière dont les agents et les humains interagissent avec lui.

---

# **1. Rôle du HCM**

Le HCM remplit trois fonctions essentielles :

### **1.1. Mémoire stable**

Conserver la connaissance durable et partageable par tous les agents et humains :

* Référentiels métiers
* Procédures
* Politiques
* Concepts internes
* Glossaires
* Patterns validés
* Exemples canoniques

### **1.2. Mémoire d’état (mémoire vive d’équipe)**

Capturer “ce que l’équipe sait *à l’instant N*”, notamment :

* Missions en cours
* Derniers journaux normalisés
* Décisions validées
* Statuts de travail
* Dépendances
* Transitions attendues

### **1.3. Support de continuité humain ↔ IA**

Permettre à un agent Arka :

* de reprendre une mission là où elle a été laissée,
* d’assumer le travail effectué par d’autres agents,
* d’être autonome dans sa partie de la mission,
* d’éviter la redondance, la perte de contexte ou la dérive.

---

# **2. Position du HCM dans l’architecture Arka**

Le HCM est **strictement distinct** de l’OS.

| Couche      | Rôle                       | Contenu                                         | Évolution                                             |
| ----------- | -------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| **Arka OS** | Méthode, structure, règles | Constitution, RAO, transitions, statuts, normes | Stable, versionné par Arka Labs                       |
| **HCM**     | Connaissance + État        | Documents, référentiels, journaux, contexte     | Évolutif, dépend du client, de l’équipe, des missions |

L’OS n’intègre aucune connaissance spécifique.
Le HCM n’intègre aucune règle structurelle.
Les deux couches sont **complémentaires** mais **indépendantes**.

---

# **3. Structure officielle du HCM**

Le HCM est organisé en quatre blocs déterministes en JSON.

## **3.1. Bloc A — Connaissance stable (`/hcm/stable/`)**

Ce qui définit la “culture documentaire” d’une équipe ou d’une organisation.

Sous-blocs recommandés :

* `glossary.json`
* `referentials/`
* `procedures/`
* `patterns/`
* `examples/`

Ces éléments :

* évoluent lentement,
* sont validés,
* servent de base à la compréhension.

## **3.2. Bloc B — Connaissance métier contextualisée (`/hcm/domain/`)**

Contenus liés à l’entreprise ou au client :

* terminologie spécifique
* jeux de données légers
* règles internes
* contraintes propres au secteur
* cas d’usage typiques

Ce bloc permet d’aligner l’équipe IA sur la réalité du terrain.

## **3.3. Bloc C — Mémoire d’état courant (`/hcm/state/`)**

La mémoire vive de l’équipe :

* `missions/`

  * `mission_id/`

    * `status.json`
    * `journal.json`
    * `evidence/`
    * `decisions.json`
    * `next_actions.json`

* `team/`

  * `agents.json` (rôles, responsabilité, état)
  * `humans.json` (points de contact)

Ce bloc est le cœur de la continuité :
il doit toujours refléter **l’instant présent**.

## **3.4. Bloc D — Index hybride (optionnel) (`/hcm/hindex/`)**

Pont entre RAG déterministe et RAG vectoriel optionnel.

* `classification.json` (typages de requêtes)
* `meta_rules.json` (filtrage, sécurité, visibilité)
* `scopes.json` (limites documentaires)
* `pre_processing.json` (transformations déterministes)

Ce bloc sert à **préparer les requêtes** avant d’utiliser un moteur vectoriel, si un client le souhaite.

---

# **4. Ce que le HCM ne doit jamais contenir**

Pour garantir la stabilité et l’indépendance de l’OS, le HCM ne doit **pas** contenir :

* des règles d’OS,
* des transitions de mission,
* des mécanismes RAO,
* des instructions d’orchestration,
* du code métier exécutif,
* des logs internes à Arka OS,
* des données privées non gouvernées,
* de l’état non normalisé (pas de texte libre incertain).

Le HCM est la **connaissance**, pas la **méthode**.

---

# **5. Interaction Agents / HCM**

## **5.1. Lecture déterministe**

Un agent lit :

* l’état de la mission,
* le journal structuré,
* les décisions,
* les evidence packs,
* les référentiels stables.

Il ne lit pas :

* des historiques non structurés,
* des fichiers bruts,
* des logs d’OS,
* des notes humaines libres.

## **5.2. Mise à jour déterministe**

Un agent ne peut mettre à jour que :

* les journaux,
* les statuts,
* les décisions,
* les next actions.

Tout update passe par des formats stricts en JSON.

## **5.3. Continuité**

Chaque agent Arka peut :

* reprendre où un autre s’est arrêté,
* accéder à la même compréhension de la mission,
* agir en cohérence,
* livrer une production alignée.

---

# **6. Résultat attendu**

Le HCM v1 permet d’obtenir :

* **une mémoire d’entreprise vivante**,
* **une continuité de mission entre humains et agents**,
* **des agents réellement autonomes**,
* **une culture de travail partagée**,
* **une base documentaire gouvernée**,
* **un historique exploitable**,
* **une synchronisation parfaite OS ↔ HCM**.

---

# **7. Statut de ce document**

Version : **HCM v1 — officielle**
Statut : **normative**
Modifications futures :

* v2 intégrera les règles de synchronisation multi-agents,
* v3 intégrera la couche sécurisée “tenant-level”,
* v4 intégrera les capacités RAG hybrides étendues.

**TODO : la conception technique** du HCM (v1), règles :

* déterministe
* full JSON
* indépendant de l’OS
* versionnable
* compatible Docker / déploiement client
* structuré pour agents + humains
* mémoire stable + mémoire d’état
* pré-intégrable à un RAG hybride

Dites-moi simplement **l’angle de départ** pour la conception technique :

1. **Structure de dossiers + fichiers JSON exacts**
   - (l’arborescence réelle du HCM en production)
   - `/HCM_001-arborescence.md`

2. **Schémas JSON (structure interne)**

   * status.json
   * journal.json
   * decision.json
   * glossary.json
   * referentials.json
   * etc.

    - `/HCM_002-Schémas-JSON.md`

3. **Les règles d’accès (lecture/écriture)**

   * ce qu’un agent peut lire
   * ce qu’il peut écrire
   * ce qui est interdit

   - `/HCM_003-regles-d-acces.md`

4. **Pipeline de mise à jour du HCM**

   * comment l’état évolue
   * qui met quoi à jour
   * mécanismes de validation
   * gestion de version

   - `/HCM_004-Mise-a-jour-HCM.md`

5. **Intégration au container (Docker / volumes)**

   * structure montable chez le client
   * dossiers persistants
   * sécurité
   * logique d’installation

   - `/HCM_005-Docker.md`

6. **Pré-couche RAG hybride**

   * moteur déterministe
   * index documentaire
   * règles de filtrage/meta
   * passerelle vectorielle optionnelle

   - `/HCM_006-RAG-hybride.md`
