# cycle de mise à jour


Objectif : **la façon dont la mémoire HCM se met à jour dans le temps**
(la “vie quotidienne” de la mémoire, ce qui permet à l’agent le matin de “savoir ce qu’il a fait hier”).


---

## 1. Principe : deux temps forts par jour

Pour une mission donnée, on peut penser la MAJ HCM autour de deux moments clés :

1. **En continu**

   * Append dans `journal.jsonl`
   * Ajout d’evidence
   * Mise à jour de `next_actions.json`
   * Éventuelles mises à jour de `status.json` (phase, santé, progression)

2. **En clôture de journée / phase**

   * Synthèse d’état du jour
   * Snapshot de mission
   * Mise à jour cohérente des compteurs et résumés
   * Préparation du “contexte de redémarrage” pour demain

La brique critique pour “ce que l’agent sait le matin”, c’est cette **clôture**.

---

## 2. Nouvelles opérations HCM pour la MAJ

On ajoute 3 opérations logiques au contrat HCM :

1. `HCM_DAY_ROLLUP`
2. `HCM_ROTATE_JOURNAL` (optionnel v1)
3. `HCM_PREPARE_DAY_CONTEXT`

Ces opérations ne sont pas déclenchées par le LLM directement, mais par l’OS (cron, trigger, ou explicitement).

---

### 2.1. `HCM_DAY_ROLLUP`

But : produire une **synthèse journalisée** de la journée pour une mission.

Entrée (OS → HCM) :

```json
{
  "op": "HCM_DAY_ROLLUP",
  "mission_id": "acme-2025-q1-transform",
  "date": "2025-11-26"
}
```

Effets internes possibles :

* Lecture des entrées de journal du jour (`journal.jsonl` filtré sur la date).
* Extraction :

  * événements clés,
  * décisions du jour,
  * actions créées / clôturées,
  * evidences ajoutées.
* Écriture dans un bloc structuré, par exemple dans `state/missions/<id>/snapshots/2025-11-26.day.json` :

```json
{
  "snapshot_id": "day-2025-11-26",
  "mission_id": "acme-2025-q1-transform",
  "date": "2025-11-26",
  "summary": "Journée principalement consacrée à la phase de design, consolidation des besoins Support et Produit.",
  "key_events": [
    "Validation des irritants Support (ev-0004)",
    "Création des actions act-0003 et act-0004"
  ],
  "decisions_made": [
    "dec-0004"
  ],
  "actions_created": [
    "act-0003",
    "act-0004"
  ],
  "actions_closed": [
    "act-0001"
  ],
  "updated_status": {
    "phase": "design",
    "status": "in_progress",
    "progress": 0.52,
    "health": "ok"
  }
}
```

C’est cette synthèse qui servira de **point d’ancrage** pour les agents le lendemain.

---

### 2.2. `HCM_ROTATE_JOURNAL` (optionnel pour v1)

But : éviter que `journal.jsonl` ne devienne un monstre ingérable.

Entrée :

```json
{
  "op": "HCM_ROTATE_JOURNAL",
  "mission_id": "acme-2025-q1-transform",
  "date": "2025-11-26"
}
```

Effets possibles :

* Copier les entrées de la journée vers un fichier d’archive, par exemple :

  * `journal.2025-11-26.jsonl` dans `journal/archives/`
* Ne garder dans `journal.jsonl` que :

  * les entrées du jour en cours,
  * ou les N derniers jours.

Ce n’est pas strictement obligatoire v1, mais c’est cohérent avec une vision long terme.

---

### 2.3. `HCM_PREPARE_DAY_CONTEXT`

But : préparer un **contexte de redémarrage** pour les agents à l’instant N+1.

Entrée :

```json
{
  "op": "HCM_PREPARE_DAY_CONTEXT",
  "mission_id": "acme-2025-q1-transform",
  "date": "2025-11-27"
}
```

Sortie (OS → agent au “réveil”) :

```json
{
  "mission_id": "acme-2025-q1-transform",
  "day_context": {
    "yesterday_snapshot": {
      "snapshot_id": "day-2025-11-26",
      "summary": "Journée principalement consacrée à la phase de design, consolidation des besoins Support et Produit.",
      "key_events": [
        "Validation des irritants Support (ev-0004)",
        "Création des actions act-0003 et act-0004"
      ],
      "updated_status": {
        "phase": "design",
        "status": "in_progress",
        "progress": 0.52,
        "health": "ok"
      }
    },
    "open_actions": [
      {
        "action_id": "act-0003",
        "title": "Cartographier les systèmes impactés côté Produit",
        "status": "todo",
        "priority": "high"
      }
    ],
    "today_date": "2025-11-27",
    "today_objectives_hint": [
      "Poursuivre la cartographie des systèmes",
      "Préparer le prochain atelier avec l'équipe Produit"
    ]
  }
}
```

Ce `day_context` est **exactement l’équivalent** du “je sais ce que j’ai fait hier, je sais ce qu’il faut faire aujourd’hui” d’un humain.

L’agent Arka, côté LLM, reçoit ce bloc dès sa “mise en route” pour une mission donnée.

---

## 3. Cycle quotidien OS ↔ HCM ↔ Agents

On peut résumer le **cycle normal** ainsi :

1. **Pendant la journée**

   * Les agents bossent, appellent :

     * `HCM_APPEND_JOURNAL`
     * `HCM_ADD_EVIDENCE`
     * `HCM_UPDATE_NEXT_ACTIONS`
   * L’état se construit en continu.

2. **Clôture fin de journée (ou fin de phase)**

   * L’OS appelle `HCM_DAY_ROLLUP` pour chaque mission active.
   * Optionnel : `HCM_SNAPSHOT_MISSION` + `HCM_ROTATE_JOURNAL`.

3. **Début de journée suivante**

   * Pour chaque mission où un agent doit intervenir :

     * L’OS appelle `HCM_PREPARE_DAY_CONTEXT`.
     * L’agent reçoit `mission_context` + `day_context`.
   * L’agent recommence sur une base propre :

     * sait ce qui a été fait hier,
     * sait ce qu’il reste à faire,
     * sait dans quel état est la mission.

---

## 4. Ce que ça garantit pour vous

Avec ce mécanisme de MAJ, vous obtenez :

* Une **continuité temporelle** : l’agent ne repart jamais de zéro.
* Une **mémoire structurée** : pas d’historique “boueux” dans des threads.
* Un **point d’ancrage quotidien** : snapshot par jour, lisible par un humain.
* Une **symétrie humain / IA** :

  * “Ce que j’ai fait hier, ce qui est en cours, ce que je dois faire aujourd’hui.”

Et tout cela reste :

* HCM centré,
* 100 % JSON,
* manipulé par l’OS,
* complètement auditable.

---
