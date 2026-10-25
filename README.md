# 🎬 Reelwright

**Agent Video Studio** — un fichier JSON entre, une vidéo sort.

**Une vidéo tech complète à partir d'un fichier JSON** — captures web réelles, voix
française avec timings mot-à-mot mesurés, motion design programmatique (Remotion),
mixage normé, vérification automatique du fichier final.

Deux formats :

| `--format` | Taille | Cadence | Composition | Usage |
|---|---|---|---|---|
| `short` (défaut) | 1080×1920 | 60 fps | `Short` | YouTube Shorts, TikTok, Reels |
| `long` | 1920×1080 | 30 fps | `VideoEssay` | vidéo longue 16:9 |

Exemple produit avec cette pipeline : **REA, 63 s** — [youtube.com/shorts/hHA4MUDi-vo](https://youtube.com/shorts/hHA4MUDi-vo)
(données du fichier : 1080×1920 @60, −14,0 LUFS, −1,5 dBTP, dérive de sous-titres médiane 0,085 s).

```bash
git clone https://github.com/Najmabdi7/reelwright.git
cd reelwright
./setup.sh
source .venv/bin/activate
python3 generate_video_agent.py --content content/rea_short.json --format short
```

Sortie : `output/rea-short.mp4` + un rapport de vérification en fin de log.

---

## Sommaire

- [Ce que fait la pipeline](#ce-que-fait-la-pipeline)
- [Installation](#installation)
- [Écrire un contenu](#écrire-un-contenu)
- [Direction éditoriale](#direction-éditoriale)
- [Scènes disponibles](#scènes-disponibles)
- [Audio : mixage et master](#audio--mixage-et-master)
- [Sous-titres : des timings mesurés](#sous-titres--des-timings-mesurés)
- [Vérification automatique](#vérification-automatique)
- [Ligne de commande](#ligne-de-commande)
- [Publication YouTube](#publication-youtube)
- [Performances](#performances)
- [Dépannage — les pièges rencontrés](#dépannage--les-pièges-rencontrés)
- [Structure du dépôt](#structure-du-dépôt)
- [Ce qui n'est pas fait](#ce-qui-nest-pas-fait)

---

## Ce que fait la pipeline

```
content/<sujet>.json
        │
        ├─ 1. captures      Playwright (pages web) + téléchargement d'assets
        │                   cache par nom, échec explicite si un visuel manque
        ├─ 2. voix          ElevenLabs `with-timestamps` (ou edge-tts WordBoundary)
        │                   un fichier + des timings RÉELS par segment
        ├─ 3. sous-titres   lignes de 2-4 mots, jamais à cheval sur une ponctuation
        ├─ 4. mixage        ffmpeg : ducking sidechain, SFX sur les coupes, −14 LUFS
        ├─ 5. données       video_data.json (scènes dérivées des segments prononcés)
        ├─ 6. rendu         Remotion → MP4 H.264 / AAC
        └─ 7. vérification  ffprobe + loudnorm + Whisper (transcription + dérive)
```

Quatre principes qui expliquent l'architecture :

1. **Aucun contenu dans le code.** Script, scènes, textes, captures : tout vient de
   `content/*.json`. Un nouveau sujet = un nouveau fichier JSON, zéro modification
   de Python ou de TypeScript.
2. **Les timings ne sont pas estimés, ils sont mesurés.** Les sous-titres utilisent
   les horodatages renvoyés par la synthèse vocale (au caractère chez ElevenLabs,
   au mot chez edge-tts). Aucune répartition « au prorata des lettres ».
3. **La structure suit la voix.** Une scène démarre au premier mot prononcé de son
   segment ; les SFX sont placés sur les `startFrame` réels des scènes.
4. **Le fichier final est vérifié, pas supposé.** La pipeline mesure la durée, la
   résolution, la loudness, la crête, relit la bande-son avec Whisper et mesure la
   dérive des sous-titres. Si un seuil n'est pas tenu, elle sort en erreur.

---

## Installation

### Prérequis

- **Node.js** 22+ et npm (Remotion 4)
- **Python** 3.10+
- **ffmpeg** et **ffprobe** dans le `PATH`
- Chromium Playwright (installé par `setup.sh`)

### Installation automatique

```bash
./setup.sh
```

Le script vérifie `ffmpeg`/`node`/`npm`/`python3`, crée `.venv`, installe les
dépendances Python, le Chromium de Playwright, les paquets npm du studio et crée
les dossiers de travail (`output/`, `agent-video-studio/.work/`).

### Clé de voix

`ELEVENLABS_API_KEY` est lue dans cet ordre : variable d'environnement → `.env` à la
racine → `~/.hermes/.env`.

Sans clé, la pipeline bascule automatiquement sur **edge-tts** (gratuit). Les
timings restent réels : edge-tts émet des événements `WordBoundary`, qui sont
exploités au lieu d'être jetés.

---

## Écrire un contenu

Un sujet = un fichier `content/<slug>.json`.

```jsonc
{
  "slug": "rea",
  "title": "REA : l'IA qui lit les logiciels",
  "captures": [
    { "name": "repo",   "url": "https://github.com/morluto/rea", "wait_ms": 3500 },
    { "name": "hoppeur", "kind": "asset", "url": "https://…/capture.png" }
  ],
  "segments": [
    {
      "id": "hook",
      "speech":  "Ton agent peut maintenant ouvrir un logiciel qu'il n'a jamais vu.",
      "display": "Ton agent peut maintenant ouvrir un logiciel qu'il n'a jamais vu."
    }
  ],
  "scenes": [
    {
      "id": "hook",
      "type": "hook",
      "segments": [0],
      "badge": "RÉVÉLATION",
      "title": "COMPRENDRE\nN’IMPORTE QUEL\nLOGICIEL",
      "sub": "sans le code source",
      "chips": ["binaire natif", "Electron", "APK"]
    }
  ]
}
```

### Champs racine

| Champ | Rôle |
|---|---|
| `slug` | nom des fichiers produits (`output/<slug>-short.mp4`, assets `assets/<slug>-*`) |
| `title` | titre du projet (log, `video_data.json`) |
| `captures[]` | visuels à récupérer (voir ci-dessous) |
| `segments[]` | une phrase par entrée — c'est l'unité de temps de la vidéo |
| `scenes[]` | les plans, **chacun référençant les segments qu'il couvre** |

### `captures[]`

```jsonc
{ "name": "repo", "url": "https://github.com/…" }              // capture d'écran Playwright
{ "name": "img",  "kind": "asset", "url": "https://…/x.png" }  // simple téléchargement
{ "name": "Notion", "kind": "logo", "slug": "notion" }          // icône via simple-icons
{ "name": "JADX",   "kind": "logo", "logo_url": "https://…/jadx-logo.png" }  // fichier exact
```

- La capture se fait en viewport 1280×1500, `deviceScaleFactor 1.25`, locale `fr-FR`,
  user-agent de bureau. Les bandeaux de cookies sont masqués en CSS avant la prise de vue.
- Le fichier est nommé `assets/<slug>-<name>.png` → **pas de collision entre sujets**.
- Une capture déjà présente est réutilisée (cache). Pour la rafraîchir, supprimer le fichier.
- Si la capture échoue, la pipeline **s'arrête** au lieu de rendre une vidéo avec une
  image manquante (comportement de la v1).

### `segments[]`

| Champ | Rôle |
|---|---|
| `id` | identifiant court (log, débogage) |
| `speech` | ce que dit la voix |
| `display` | ce qui s'écrit à l'écran |

`speech` et `display` sont **identiques dans 95 % des cas** : c'est ce qui garantit un
alignement exact mot-à-mot. Ils ne diffèrent que pour forcer une prononciation
(« M.I.T. » prononcé « èm i té a ») ; dans ce cas seulement, les timings du segment
retombent sur une répartition proportionnelle. **Préférer reformuler la phrase** plutôt
que d'utiliser ce mode.

> Le débit de la voix Sébastien est de ~2,7 mots/s : compter **~165 mots pour 60 s**,
> ~430 mots pour 2 min 30. Mesurer avant d'écrire 300 mots.

### `scenes[]`

| Champ | Rôle |
|---|---|
| `id` | identifiant unique |
| `type` | type de scène (voir tableau ci-dessous) |
| `segments` | **liste d'index de segments couverts** → c'est ce qui fixe la durée du plan |
| `image` | nom d'une capture à afficher (facultatif) |
| … | le reste dépend du type (titre, puces, compteurs…) |

La durée d'une scène n'est jamais écrite à la main : elle va du premier mot de son
premier segment au premier mot du segment de la scène suivante. Ajouter une phrase
dans un segment allonge la scène automatiquement.

---

## Direction éditoriale

La pipeline est neutre : elle rend ce qu'on lui donne. Ce qui fait la vidéo, c'est le JSON.

**Le script vend l'essai, il ne raconte pas une histoire.** Le spectateur doit terminer en
sachant quoi faire lui-même, avec quel outil, en combien de temps. Une phrase se juge à sa
capacité de se traduire en action.

| À faire | À éviter |
|---|---|
| hook = une capacité concrète (« ton agent ouvre un logiciel qu'il n'a jamais vu ») | une promesse vague, un chiffre de popularité en ouverture |
| le geste exact : commande, bouton, URL | « un développeur a décidé de… » |
| une preuve par affirmation : capture, chiffre daté, avant/après | l'histoire du projet, sa date de création, son nombre d'étoiles |
| finir sur ce qu'il faut faire maintenant | finir sur une question rhétorique seule |

**Densité :** 60-75 s = **8 à 10 scènes**, **2-3 informations par scène**, et **au moins une
capture réelle** dans chaque scène qui parle d'un produit. Une scène = une idée + une preuve +
un chiffre vérifié. Mieux vaut huit plans courts et denses que cinq plans qui respirent pour rien.

**Visuels : plus de preuves, moins de typographie seule.** Une scène qui parle d'un produit montre
le produit. Concrètement :

- **une capture réelle par affirmation** (`shots`) : trois phrases, trois captures, chacune avec sa
  légende — pas une carte de texte qui résume les trois ;
- **les icônes officielles des outils cités** (`logos`) : `slug` pour les marques couvertes par
  simple-icons, `logo_url` pour pointer le fichier exact d'un projet, monogramme assumé sinon ;
- **aucune icône devinée** : le scraping d'icônes dans une page ramène régulièrement autre chose
  (le fluidicon de GitHub sur un site hébergé par GitHub Pages, une icône X/Twitter sur une page
  marketing). On choisit le fichier, on ne le devine pas.

Ce qui ne se négocie pas : aucun chiffre non vérifié à l'écran, des timings mesurés, un master
à −14 LUFS, et le fichier relu avant publication.

---

## Scènes disponibles

### Format `short` (9:16) — `src/short/ShortEssay.tsx`

| Type | Contenu attendu | Rendu |
|---|---|---|
| `hook` | `badge`, `title` (sauts de ligne avec `\n`), `sub`, `chips[]` | gros titre qui monte ligne par ligne, puces en bas |
| `stats` | `badge`, `title`, `subtitle`, `counters[]` (`value`, `label`, `accent`), `facts[]`, `image` | capture GitHub + compteurs animés + pastilles |
| `how` | `badge`, `title`, `sub`, `tools[]`, `targets[]` | schéma vertical agent → MCP → outils → cibles |
| `proof` | `badge`, `image`, `counters[]` | capture d'outil + deux compteurs animés |
| `flow` | `badge`, `title`, `steps[]` | chaîne d'étapes numérotées, l'étape active s'allume l'une après l'autre |
| `outro` | `badge`, `question`, `cta` | question + bouton d'appel à l'action qui pulse |
| `shots` | `badge`, `title`, `shots[]` (`image`, `caption`) | capture réelle plein cadre, **une par temps fort de la voix off**, légende + puces de progression |
| `logos` | `badge`, `title`, `sub`, `brands[]` (`logo`, `name`, `note`) | tuiles d'icônes officielles des outils cités ; monogramme si l'outil n'a pas d'icône propre |

Un compteur s'anime de 0 à sa valeur sur 46 frames, avec un easing cubique. Il affiche
`3205` en `3 205` (format `fr-FR`).

### Format `long` (16:9) — `src/scenes/`

`hook`, `browser`, `native_hopper`, `multiplatform`, `terminal`, `casestudy`,
`ethics`, `outro`.

Les deux jeux de scènes lisent le **même** `video_data.json`. Rendre un contenu
`short` avec la composition `VideoEssay` déclenche une erreur explicite (cadence
incompatible) plutôt qu'une vidéo silencieusement fausse.

---

## Audio : mixage et master

Tout le son est produit **avant** le rendu, en un seul fichier ffmpeg
(`public/assets/<slug>-mix.wav`). Remotion ne fait que le jouer à volume 1.

```
voix (concaténée)  ──► compresseur ──► gain mesuré + limiteur ──► −14 LUFS
musique (bouclée)  ──► volume 0.20 ──► sidechaincompress (clé = voix)
whoosh / pop       ──► adelay aux startFrame des scènes
                                    └──► amix ──► alimiter ──► master
```

Pourquoi cette chaîne, et pas un simple `loudnorm` :

- Une voix de synthèse a un **facteur de crête d'environ 20 dB** (mesuré : −22,7 LUFS
  pour −2,5 dBTP). `loudnorm` en mode linéaire plafonne son gain pour respecter la
  crête : il s'arrête à −15/−16 LUFS, jamais à la cible. La pipeline compresse donc
  d'abord (`acompressor` seuil −22 dB, ratio 5), puis applique un gain **mesuré en
  boucle** (mesure → gain → re-mesure), borné par la crête, avec `alimiter`.
- Le ducking est réel : `sidechaincompress` avec la voix comme clé. Un `volume=0.16`
  statique dans React ne ducke rien.
- Les SFX ne sont pas des numéros de frame en dur : ils sont calculés à partir des
  positions réelles des scènes.

Résultat contrôlé sur le fichier final : **−14,0 LUFS / −1,5 dBTP**.

---

## Sous-titres : des timings mesurés

| Étape | Ce qui est fait |
|---|---|
| 1 | chaque segment est synthétisé **séparément** (un fichier par segment) |
| 2 | les horodatages renvoyés par la TTS sont convertis en `{word, start, end}` |
| 3 | chaque segment est décalé de son curseur réel, puis concaténé avec des silences |
| 4 | les mots sont regroupés en lignes de 2 à 4 mots, coupées sur la ponctuation |
| 5 | un mot orphelin rejoint la ligne précédente (jamais de ligne d'un seul mot) |

Découper la synthèse par segment a deux effets : les bornes de scènes deviennent
exactes, et une phrase ratée se régénère seule au lieu de payer tout le texte.

**Contrôle de dérive.** Whisper relit la bande finale et la pipeline apparie les mots
(texte normalisé + fenêtre de ±1,5 s) pour mesurer l'écart réel. Whisper a sa propre
imprécision (~0,2-0,4 s sur de la parole synthétique dense) : le verdict porte donc
sur la **médiane (≤ 0,15 s)** et le **p90 (≤ 0,45 s)**, pas sur le maximum.

---

## Vérification automatique

Exemple de rapport réel (REA, 63 s) :

```json
{
  "file": "/…/rea-short.mp4",
  "size_mb": 16.97,
  "duration": 63.44,
  "resolution": "1080x1920",
  "fps": "60/1",
  "integrated_lufs": -14.0,
  "true_peak": -1.5,
  "transcript": "Ton agent peut maintenant ouvrir un logiciel qu'il n'a jamais vu…",
  "sync_pairs": "123/155",
  "sync_median_s": 0.085,
  "sync_p90_s": 0.43,
  "sync_max_s": 1.303,
  "sync_ok": true
}
```

- `transcript` : ce que Whisper a réellement entendu — le moyen le plus rapide de
  repérer une phrase mal prononcée.
- Six images de contrôle sont extraites dans `output/<nom>-frames/`.
- La pipeline sort en **code 1** si la loudness s'écarte de ±1 LUFS, si la crête
  dépasse −0,8 dBTP, ou si la synchro sort des seuils.

---

## Ligne de commande

```
--content PATH         contenu à rendre (défaut : content/rea_short.json)
--format short|long    format de sortie (défaut : short)
--output PATH          fichier de sortie (défaut : output/<slug>-<format>.mp4)
--tts elevenlabs|edge  moteur de voix (défaut : elevenlabs → repli auto sur edge)
--concurrency N        workers de rendu Remotion (défaut : 3)
--skip-render          réutilise le MP4 existant et ne remplace que l'audio (remux, ~5 s)
```

Exemples :

```bash
# nouveau sujet, short vertical
python3 generate_video_agent.py --content content/mon_sujet.json --format short

# voix de secours gratuite, sans clé
python3 generate_video_agent.py --content content/mon_sujet.json --tts edge

# corriger l'audio sans re-rendre 10 minutes de vidéo
python3 generate_video_agent.py --content content/mon_sujet.json --skip-render
```

Le cache de narration (`.work/narration.json`, clé = texte + moteur) évite de
re-payer la synthèse quand un rendu échoue après l'étape voix.

---

## Publication YouTube

Le dépôt ne publie pas (séparation volontaire : on regarde le fichier avant d'envoyer).
Pour la chaîne Radar IA, l'envoi passe par le projet Google du propriétaire :

```bash
cd ~/youtube_setup
python3 yt_publish.py fichier.mp4 "Titre" "Description" public
```

1 600 unités par envoi, 10 000 par jour et par projet → **6 vidéos/jour**.

Après l'envoi, vérifier indépendamment (le code de retour n'est pas une preuve) :

```bash
curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json"
```

plus `videos.list?part=status,snippet` (visibilité, chaîne, durée) et la page
`/@<chaîne>/shorts` pour confirmer que la vidéo est bien classée en Short.

Une vidéo verticale de moins de 3 minutes est traitée comme un Short, même à 63 s
(la limite historique des 60 s n'existe plus).

---

## Performances

Mesuré sur 4 cœurs, 11 Go de RAM, sans GPU :

| Étape | Durée |
|---|---|
| captures (à froid) | 20-40 s |
| voix ElevenLabs (8 segments) | 30-50 s |
| mixage + master | 20-30 s |
| **rendu Remotion** (63 s en 1080×1920 @60) | **~9-10 min** (concurrency 3) |
| vérification (Whisper small) | 1-2 min |

Repères : le rendu tourne à ~4-6 frames/s. Deux réglages changent tout :

- **Pas de `filter: blur()` sur de grands éléments.** Un halo de 900 px flouté à 60 px
  coûtait 3× le temps de rendu pour un résultat identique à un `radial-gradient` bien réglé.
- **`--concurrency` ≈ nombre de cœurs − 1.** Au-delà, les navigateurs se disputent le CPU.

---

## Dépannage — les pièges rencontrés

Ces sept défauts ont été trouvés en faisant tourner la v1, pas en la relisant. Ils sont
documentés ici parce qu'ils sont silencieux : la vidéo sort, elle est juste fausse.

### 1. Le silence de tête n'était pas concaténé

`cursor = LEAD` puis décalage des mots, mais la concaténation commençait directement
par le premier segment → **toute la vidéo avait 0,25 s d'avance** (médiane de dérive
mesurée : 0,32 s). Les nombres étaient cohérents entre eux, seul l'audio ne l'était pas.
**Correctif :** concaténer un silence de `LEAD` en tête (`lead.wav`), pas seulement le
compter dans les timings.

### 2. `loudnorm` seul n'atteint jamais −14 LUFS sur une voix TTS

Mode linéaire = gain plafonné par la crête → −15,5 LUFS. Et passer `offset=` en
deuxième passe fait *baisser* le niveau au lieu de le corriger.
**Correctif :** compresseur, puis boucle mesure → gain → limiteur (voir la section Audio).

### 3. Le mastering réécrivait son propre fichier d'entrée

Boucle de correction écrivant `src` dans `src` → `Output … same as Input #0 - exiting`.
**Correctif :** un fichier intermédiaire par itération, puis conversion finale.

### 4. Les SFX étaient des numéros de frame en dur

`[162, 551, 877, 1241, …]` dans le composant React : juste pour un audio, faux pour
tous les autres.
**Correctif :** ils sont dérivés de `scenes[i].startFrame`, calculé par Python.

### 5. Les bornes de scènes venaient d'index de phrases

`f1 = sentence_timings[0]`, `f2 = sentence_timings[2]`, … → `IndexError` dès qu'un
script contient moins de 13 phrases, et des plans qui ne correspondent plus au texte.
**Correctif :** une scène couvre **ses** segments ; les bornes se déduisent des durées
réelles.

### 6. `npx remotion render` depuis la racine du dépôt

`npm error could not determine executable to run` — le binaire n'est pas à la racine.
**Correctif :** lancer le rendu avec `cwd=agent-video-studio/`, et résoudre le chemin de
sortie par rapport à ce dossier.

### 7. Polices : deux pièges

- `url("/fonts/Inter.ttf")` (chemin absolu) casse le bundle webpack
  (`Module not found`). Les polices doivent vivre dans `src/fonts/` et être référencées
  en relatif (`url("./fonts/Inter.ttf")`).
- Sans blocage du rendu, la première frame part avec une police de repli. Il faut
  `delayRender()` + `document.fonts.load(...)` → `continueRender()`, sinon la vidéo
  n'est pas reproductible d'une machine à l'autre.

### Et aussi

- **`transition:` CSS ne fait rien dans Remotion** (rendu frame par frame) : tout passe
  par `interpolate` / `spring`.
- **Un titre plus long que `1080 − 2×72 px` déborde** sans erreur. Mesurer la largeur du
  texte avant de choisir la taille de police.
- **Les accents et apostrophes** : utiliser `’` (U+2019) dans les titres, pas `'`.

---

## Structure du dépôt

```
reelwright/
├── generate_video_agent.py        # orchestrateur : 7 étapes, 659 lignes
├── setup.sh                       # installation en une commande
├── requirements.txt               # playwright, edge-tts, faster-whisper, numpy
├── content/
│   └── rea_short.json             # le sujet d'exemple (REA)
├── agent-video-studio/            # studio Remotion
│   ├── public/
│   │   ├── assets/                # captures + mix audio (générés)
│   │   └── sfx/                   # whoosh, pop, click, musique
│   └── src/
│       ├── Root.tsx               # compositions `Short` et `VideoEssay`
│       ├── short/ShortEssay.tsx   # 6 scènes verticales 9:16
│       ├── scenes/                # 8 scènes 16:9 (format long)
│       ├── components/            # Background, MacWindow, SubtitleTrack
│       ├── fonts/                 # Montserrat, Inter, JetBrains Mono
│       ├── types.ts               # schéma de video_data.json
│       ├── useFonts.ts            # delayRender jusqu'au chargement des polices
│       └── video_data.json        # GÉNÉRÉ — ne pas éditer à la main
├── legacy/                        # v1 conservée pour référence
└── output/                        # MP4 et images de contrôle (ignorés par git)
```

Le studio reste utilisable seul pour ajuster un plan :

```bash
cd agent-video-studio
npm run dev      # Remotion Studio sur http://localhost:3000
```

---

## Ce qui n'est pas fait

- **Pas de couche recherche.** Le script et les chiffres sont écrits dans le JSON. La
  pipeline ne va pas chercher les faits, ne les recoupe pas et ne les date pas : c'est
  un travail humain (ou d'agent) en amont. Conséquence : un chiffre périmé dans le JSON
  le reste.
- **Pas de publication.** Volontaire, pour garder une relecture humaine entre le rendu et
  l'envoi.
- **Pas de tests automatisés** au-delà de `tsc` + `eslint` et du rapport de vérification.
- **Format long non réécrit en 9:16** : les scènes `long` gardent leur mise en page 16:9.
- **Pas de sous-titres incrustés en piste `.srt`** : ils sont dessinés dans l'image.

---

## Licence

MIT — voir [LICENSE](LICENSE). © [Najmabdi7](https://github.com/Najmabdi7)
