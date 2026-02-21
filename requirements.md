# K-Pop Studio Pro: Project Requirements

## Core Architecture
- **Multi-Module Design:** Do not use a single-file script. Separate concerns into:
    - `ui/`: Custom React components for the Tier board.
    - `api/`: YouTube Music metadata scraping and validation logic.
    - `ai/`: Local RTX 4080 / Ollama bridge for analysis.
    - `state/`: File-based persistence (JSON/CSV).

## Feature: Interactive Tier Designer
- **Drag-and-Drop:** Must be a true TierMaker-style interface using a React library (like `dnd-kit` or `react-beautiful-dnd`) inside a Streamlit Custom Component.
- **Roster & Tiers:** The initial state must match the "Initial Roster Configuration" below.
- **Persistence:** Every move must sync to `tier_state.json`.

## Feature: Discovery Hub
- **Metadata Validation:** Strict year filtering. The system must cross-reference `ytmusic.get_album()` to ensure tracks match the user's selected year.
- **Sorting:** Must support Global Sorting by "Views" (integer) and "Rank."
- **UI:** Single-row items containing: [Title] [Views Badge] [Year Badge] [Watch Button] [AI Analysis Button].
- **Modals:** "Watch" must trigger a Video Modal/Dialog overlay.

## Initial Roster Configuration (Strict Order)
| Tier | Groups (Left-to-Right Order) |
| :--- | :--- |
| **PEAK** | aespa, MEOVV, BabyMonster, ILLIT, STAYC, IVE |
| **SSS** | tripleS |
| **S** | Kep1er, izna, NMIXX, LE SSERAFIM, H//PE Princess, BLACKPINK, ITZY, Red Velvet |
| **A** | H1-KEY, FIFTY FIFTY, baby DONT cry, NewJeans, Billlie, Kiiikiii, Hearts2Hearts, QWER, RESCENE, ifeye, KIIRAS, ARTMS |
| **B** | fromis_9, TWICE, BADVILLAIN, I-DLE, KISS OF LIFE, VVS, VIVIZ, AtHeart |
| **C** | PURPLE KISS, MAMAMOO, CLC, EVERGLOW, XG, KATSEYE, TRI.BE, YOUNG POSSE |