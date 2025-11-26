# HCM_007 – Doc produit HCM (Hybrid Collective Memory)

## 1. Définition courte

La **Hybrid Collective Memory (HCM)** est la mémoire collective d’une équipe mixte humains + agents Arka :
- elle unifie les référentiels, la connaissance métier et l’état courant des missions ;
- elle est stockée en JSON structuré, gouverné, versionnable ;
- elle est exploitée par Arka-OS comme base de vérité pour la continuité des missions IA/humains.

> L’OS fournit la méthode (RAO, orchestration).  
> Le HCM fournit la connaissance (ce que l’entreprise sait + ce que l’équipe a déjà fait).

---

## 2. Problèmes adressés chez les clients

1. **Perte de contexte permanente**  
   - multiples outils (Notion, mails, tickets, docs) ;
   - aucun point unique pour savoir “où en est la mission”.

2. **Agents IA amnésiques**  
   - les modèles ne “se souviennent” pas des missions d’un jour sur l’autre ;
   - chaque prompt repart de zéro.

3. **RAG bricolés, difficiles à maintenir**  
   - corpus non gouverné ;
   - drift sémantique ;
   - peu de traçabilité.

La HCM répond à ces problèmes en offrant :
- une structure stable, prévisible et auditable ;
- une mémoire d’état qui reflète en continu le travail réel ;
- un socle pour un RAG hybride gouverné (RAO-RAG).

---

## 3. Bénéfices pour une organisation

1. **Continuité de mission IA ↔ humain**  
   Un agent Arka “sait” ce qui a été fait hier, ce qui est en cours, ce qu’il reste à faire.
   Un humain peut reprendre une mission en s’appuyant sur le même contexte.

2. **Capitalisation du savoir opérationnel**  
   Les décisions, preuves, actions et journaux sont conservés de façon structurée et réutilisable.

3. **Alignement IA avec la réalité métier**  
   La HCM contient les référentiels et la connaissance métier (produits, systèmes, contraintes)
   qui permettent aux agents de raisonner dans le bon contexte.

4. **Conformité & gouvernance**  
   Les données HCM restent dans le périmètre du client (volumes Docker), auditables, versionnables.

---

## 4. Positionnement par rapport à d’autres solutions

- **vs Notion / Confluence / SharePoint** :  
  HCM n’est pas un outil de prise de notes, mais une mémoire structurée,
  pensée pour être exploitée par un OS et des agents IA.

- **vs RAG “classique”** :  
  HCM intègre le documentaire **et** l’état des missions.  
  Le RAG est gouverné (RAO-RAG), avec classification, scopes et règles explicites.

- **vs bases de données analytiques** :  
  HCM est orientée “narratif + décisionnel + workflow”, pas KPI/chiffres.

---

## 5. Cas d’usage types

- Equipes produit : suivi de discovery, décisions de roadmap, historiques de workshops.
- Cabinets de conseil : capitalisation par mission, par client, par secteur.
- Directions de transformation : traçabilité des chantiers, preuves pour les sponsors.
- Equipes support / ops : contexte cross-canal, décisions récurrentes, patterns d’amélioration.

---

## 6. Comment la HCM est livrée avec Arka-OS

- Comme un **répertoire monté en volume** dans le container Arka-OS (`/hcm`).  
- Initialisé par une commande type `hcm init` ou par un script d’installation.  
- Alimenté ensuite par :
  - les agents Arka (journal, evidence, actions),
  - les humains (ajout/ajustement de référentiels, domaine).

La HCM est donc à la fois :
- un **produit** (structure, conventions, outillage),
- un **asset client** (contenu, décisions, contexte).

