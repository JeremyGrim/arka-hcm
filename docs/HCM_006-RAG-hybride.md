# pré-couche RAG hybride-dire 

Objectif : la manière dont le HCM devient la mémoire collective consultable de façon intelligente*, sans jamais tomber dans un RAG probabiliste pur.

C’est la brique qui unifie :

* la connaissance stable (`/hcm/stable/`)
* la connaissance métier (`/hcm/domain/`)
* la mémoire d’état (`/hcm/state/`)
* et la couche d’analyse déterministe (`/hcm/hindex/`)
  pour former une **mémoire collective consultable** par les agents.

C’est le dernier étage : celui qui donne au système la capacité d’“interroger sa mémoire” comme une équipe humaine.

---

# 1. Objectif de la pré-couche RAG hybride

### **Faire en sorte que les agents accèdent au HCM comme à un “Google interne”**,

mais :

* déterministe,
* gouverné,
* structuré,
* filtré,
* sans hallucination,
* sans vectorisation brute,
* avec option d’un moteur vectoriel *si* le client le souhaite.

C’est **un RAG mais encadré par l’OS**, donc un :

# **RAG gouverné déterministe (RAO-RAG)**

RAO pour : *Raisonnement – Arbitrage – Organisation*
(La logique de l’OS.)

---

# 2. Architecture de la pré-couche RAG hybride

Elle repose sur le dossier :

```text
/hcm/hindex/
  classification.json
  scopes.json
  meta_rules.json
  routing.json
  sources/
```

Chacune a un rôle précis.

---

## **2.1. classification.json

(Classification déterministe des requêtes)**

Ce fichier sert à catégoriser **chaque requête** avant toute recherche.

Exemple :

```json
{
  "classifications": [
    {
      "class": "mission_history",
      "keywords": ["hier", "ce que nous avons fait", "progression", "journal"],
      "targets": ["state/missions"],
      "priority": 1
    },
    {
      "class": "domain_knowledge",
      "keywords": ["produit", "kpi", "politique", "procédure"],
      "targets": ["domain"],
      "priority": 2
    },
    {
      "class": "core_reference",
      "keywords": ["définition", "glossaire", "roles"],
      "targets": ["stable/glossary", "stable/referentials"],
      "priority": 3
    }
  ]
}
```

**Rôle :**
Comprendre ce que cherche l’agent et choisir les bonnes sources.

---

## **2.2. scopes.json

(Définir les zones accessibles selon la classe)**

Exemple :

```json
{
  "scopes": {
    "mission_history": {
      "include": ["state/missions/*/meta.json", "state/missions/*/journal.jsonl"],
      "exclude": ["stable/**"]
    },
    "domain_knowledge": {
      "include": ["domain/**"],
      "exclude": ["state/**"]
    },
    "core_reference": {
      "include": ["stable/glossary/**", "stable/referentials/**"],
      "exclude": []
    }
  }
}
```

**Rôle :**
Empêcher un agent de lire tout le HCM.
On délimite *où il a le droit d’aller*, comme dans une équipe humaine.

---

## **2.3. meta_rules.json

(Filtrage, sécurité, traçabilité)**

Exemple :

```json
{
  "rules": {
    "sensitivity_levels": {
      "public": [],
      "internal": ["human_user"],
      "restricted": ["executive", "security_officer"]
    },
    "default_visibility": "internal"
  }
}
```

**Rôle :**
Empêcher l’accès à des documents sensibles si l’utilisateur/agent n’a pas le rôle.

Equivalent des droits d’accès d’une entreprise.

---

## **2.4. routing.json

(Quel moteur approche selon la requête)**

Exemple :

```json
{
  "routing": {
    "mission_history": "deterministic",
    "core_reference": "deterministic",
    "domain_knowledge": "hybrid_vector",
    "fallback": "vector"
  }
}
```

Ça veut dire :

* Pour l’historique : **aucun vectoriel**, tout est strict.
* Pour la doc métier : OK vectoriel optionnel.
* Pour les référentiels : déterministe uniquement.

---

## **2.5. sources/**

(Référentiel des fichiers indexables)

Exemple :

```json
{
  "sources": [
    {
      "path": "domain/business/products.json",
      "type": "json",
      "tags": ["product", "catalog"]
    },
    {
      "path": "stable/procedures/generic/change_management.json",
      "type": "json",
      "tags": ["process"]
    }
  ]
}
```

**Rôle :**
Liste blanche des fichiers qui peuvent être “interrogés”.

---

# 3. Pipeline complet : comment une requête devient une réponse

### Étape 1 — L’agent émet une requête de connaissance

Exemple :

> “Qu’avons-nous conclu hier lors de l’atelier Support ?”

### Étape 2 — L’OS applique `classification.json`

→ classe : `mission_history`

### Étape 3 — L’OS applique `scopes.json`

→ ne lit que les fichiers de l’état de mission
→ ignore le reste

### Étape 4 — L’OS applique `meta_rules.json`

→ filtre selon rôle / sensibilité

### Étape 5 — Routing (`routing.json`)

* `mission_history` → mode déterministe
* donc : **pas de vectoriel**

### Étape 6 — Extraction déterministe

* lecture ciblée dans `/hcm/state/missions/<id>/`
* récupération de :

  * snapshot de la veille
  * journal du jour
  * decisions
  * evidences liées

### Étape 7 — L’OS assemble un **context pack**

Exemple :

```json
{
  "context_pack": {
    "source": "HCM",
    "class": "mission_history",
    "mission_id": "acme-2025-q1-transform",
    "entries": [
      {...}, 
      {...}
    ],
    "metadata": {
      "extraction_mode": "deterministic",
      "timestamp": "2025-11-27T08:12:00Z"
    }
  }
}
```

### Étape 8 — L’agent répond

Le LLM n’a pas cherché dans les fichiers, il a reçu un **context pack propre**.

---

# 4. Où intervient le vectoriel dans l’hybride ?

Seulement dans un scénario :
**quand la connaissance métier n’est pas uniformisée**
→ `domain/`.

Exemple :

* guides produit
* fiches systèmes
* analyses métier
* documents longs

Dans ce cas :

* l’OS pré-filtre (déterministe)
* puis appelle un **moteur vectoriel en local** (si client le veut)
* et remonte seulement les passages validés

Donc :
**jamais de RAG brut**,
toujours une requête **préparée**, **filtrée**, **contrôlée**.

---

# 5. Pourquoi cette couche est essentielle

Elle garantit que :

### 1) Le RAG devient **fiable**

Pas de dérives, pas de mauvaise source, pas de bruit.

### 2) Le RAG devient **gouverné**

Les règles métiers priment sur la recherche vectorielle.

### 3) Le RAG devient **cohérent dans le temps**

Pas de dépendance au flou du prompt utilisateur.

### 4) Le HCM devient **une mémoire collective complète**

* mémoire stable
* mémoire métier
* mémoire d’état
* accès déterministe
* vectoriel seulement dans un cadre précis

### 5) Les agents Arka peuvent **coopérer**

Parce qu’ils consultent tous exactement la même mémoire, de la même façon.

---

# 6. Résultat final

Vous venez de définir la **mémoire collective hybride de 2025** :

* déterministe
* gouvernée
* augmentée
* distribuable
* déployable en container
* compatible avec humains + ia
* évolutive
* et surtout : **fiable**.

C’est le dernier étage du HCM v1.

---
