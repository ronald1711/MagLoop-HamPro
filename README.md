# MagLoop HamPro V1.0 by PC3Y

> **Professionele magnetische loop antenne calculator voor HAM radio**  
> Gebaseerd op Balanis «Antenna Theory» 4e editie + ICNIRP 1998 veiligheidsrichtlijnen

![React](https://img.shields.io/badge/React-18-61dafb?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite) ![License](https://img.shields.io/badge/License-GPL--3.0-green)

---

## Inhoudsopgave

- [Overzicht](#overzicht)
- [Functies](#functies)
- [Tabs & Modules](#tabs--modules)
- [Gebruikte formules](#gebruikte-formules)
- [Geleiders & Materialen](#geleiders--materialen)
- [Installatie & Gebruik](#installatie--gebruik)
- [Technische stack](#technische-stack)
- [Referenties](#referenties)

---

## Overzicht

MagLoop HamPro is een volledig in de browser draaiende calculator voor het ontwerpen en analyseren van **Small Transmitting Loop (STL)** antennes, ook wel magnetische loops of magloops genoemd. De tool berekent alle relevante elektrische, mechanische en veiligheidsparameters en toont deze in een interactief dashboard met grafieken.

De app is primair bedoeld voor HAM-radioamateurs die een magloop willen bouwen, optimaliseren of vergelijken. Alle berekeningen zijn gebaseerd op gepubliceerde elektromagnetische theorie (Balanis, Silver) en worden real-time bijgewerkt bij elke parameterwijziging.

---

## Functies

### Kernberekeningen
| Parameter | Formule | Beschrijving |
|---|---|---|
| Inductantie L | `µ₀r(ln(8r/a)−2)` (N=1) | Zelfinductie van de lusleider |
| Stralingsweerstand R_rad | `31171·(AN/λ²)²` (kleine lus) | Virtuele weerstand voor uitgestraald vermogen |
| Verliesweerstand R_loop | `Rs·L_cond/circ·proxF` | Ohmse verliezen in de geleider |
| Q-factor | `X_L / R_tot` | Kwaliteitsfactor, bepaalt bandbreedte |
| Bandbreedte | `f / Q` | -3 dB bandbreedte in kHz |
| Efficiëntie η | `R_rad / R_tot × 100%` | Percentage uitgestraald vermogen |
| Condensatorspanning | `√(P/R_tot) × X_L` | RMS spanning over afstemcondensator |
| Benodigde C_tune | `C_ideaal − C_self` | Netto benodigde capaciteit |
| Huiddiepte δ | `√(ρ/πfµ₀)` | Effectieve stroom-penetratiediepte |

### Speciale correcties
- **C_self**: structurele zelf-capaciteit via `ε₀ × (omtrek/π)` — geverifieerd tegen VK3CPU SRF-metingen
- **C_cable N=1**: coax-kabelcapaciteit wordt *niet* afgetrokken bij N=1 outer-only (binnengeleider floating, geen shuntpad)
- **Proximity-effect**: `proxF = 1 + 0.117 × (1/spacingRatio)^1.5` voor meerwinding
- **Huidweerstand strips**: stroomcrowding op stripkanten → effectieve omtrek = `π × breedte/2`

### Grondeffect (Image Theory)
- Array factor: `AF = 2·|Γ|·|sin(k·h)|`
- Effectieve directiviteit: `D_eff = D₀ × AF`
- Grondverliezen: `Re_gnd = Γ·0.3·exp(−h/0.05λ)` voor h < 0.1λ
- Reflectiecoëfficiënten: perfect (1.0), goed (0.82), slecht (0.50), vrij (0.0)

### EMF Veiligheid
- Magnetisch moment: `m = I_a × A × N`
- Nabij-veld veiligheidsafstand: `R = ∛(m / 4π × H_lim)` met H_lim = 0.073 A/m (ICNIRP 1998 algemene bevolking, 3–30 MHz)
- Ver-veld formule: `R = m·k² / (4π·H_lim)` (gebruikt wanneer groter dan nabij-veld)

---

## Tabs & Modules

### 📊 Details
Overzicht van geometrie, inductantie, verliezen en lusstroom. Bevat:
- Geometrie: oppervlak, omtrek, geleiderlengte, C/λ ratio
- Band sweep: C_tune_req op lage/midden/hoge bandrand
- Efficiëntiebar over alle 9 HF-banden (160m–10m)
- Aanbevolen minimale geleiderdiameter op basis van 20×δ

### 📚 Theorie
9 uitklapbare secties met formules, uitleg en live waarden:
1. **Q-Factor & Bandbreedte** — Q, BW, resonantieversterking
2. **Efficiëntie η** — R_rad vs. R_loop, verbetermogelijkheden
3. **Condensatorspanning** — V_cap, piekspanning, veiligheidsmarge
4. **Huideffect** — δ, R_s, effectieve omtrek, materiaalvergelijking
5. **Afstemcapaciteit** — C_ideaal, C_self, C_req, f_min voor coax
6. **Grondeffect** — Image theory, AF, NVIS vs. DX
7. **Regimegeldigheid** — Klein/intermediair/groot model geldigheid
8. **Voedingsmethoden** — Faraday, capacitief, gamma match vergelijking
9. **Q/BW Referentietabel** — Q 300–2000 × 7 banden in kHz

### 📈 Freq Sweep
Multi-parameter sweep van 1.8–28.5 MHz (80 punten) met huidige instellingen:
- Efficiëntie η (%)
- Q-factor
- V_cap (kV RMS)
- C_tune_req (pF)

Toont kritieke frequenties: max η, max Q, min V_cap.

### 🔍 Optimizer
Diameter-sweep van 0.2–3.0 m (60 punten) met 4 grafieken + optimale punten:
- Max efficiëntie-diameter
- Max Q-diameter
- Min V_cap-diameter
- Max bandbreedte-diameter

### 📋 Geleiders
Vergelijkingstabel van alle 22+ geleiders bij huidige instellingen:
- Efficiëntie η, Q-factor, V_cap, R_loop, C_tune_req
- Gesorteerd op efficiëntie, huidige geleider gemarkeerd
- Onmogelijke resonantie (C_req ≤ 0) rood gemarkeerd

### ⚡ Condensator
Afstemcondensator assistent:
- C_req en spanningsvereisten (V_rms, V_piek, V_ontwerp)
- 6 condensatortypes met aanbeveling op basis van C_req en V_cap
- Praktische tips voor afstemming en isolatie

### 🏗️ Bouwlijst
30-item constructie checklist verdeeld in 5 secties:
- **Mechanisch**: lus-vorm, bevestiging, buigradius, waterdichtheid
- **Geleider & Verbindingen**: solderen/lassen, aluminium pasta, Faraday-lus, ferrite choker
- **Condensator**: V-rating, C-bereik, as-isolatie, motorbekabeling
- **Meting**: SWR, VNA, bandbreedte verificatie
- **Veiligheid**: EMF-afstand, V_cap aanraking, indoor vermogen

Progressiebalk + teller open veiligheidsitems. Live waarden per item.

### 🌐 Patroon
- Azimuth/elevatie canvas patroon: F(θ) = sin²(θ)
- **Elevatie-grafiek boven grond**: G(θ) vs. elevatie 0–90° met Image Theory
- NVIS vs. DX interpretatie op basis van optimale elevatie-hoek
- Gain, HPBW, A_em, effectieve vectorlengte

### 🌍 Grondeffect
- Grondwinst vs. hoogte h/λ grafiek (0 tot 1λ)
- Huidig punt gemarkeerd op de grafiek
- Image theory uitleg en AF-formule

### 📡 Koppeling
Interactieve koppelingsselectie:
- **Faraday** (aanbevolen): optimale diameter berekend, galvanische scheiding
- **Capacitief**: koppelcondensator, 2-knops afstemming
- **Gamma match**: tappositie berekend
- Vergelijkingstabel: galv. scheiding, multi-band, knoppen, QRO

### 📻 Linkbudget
Friis-vergelijking voor communicatiereikwijdte:
- EIRP, vrije-ruimte paddemping, ontvangen vermogen
- Reikwijdte als functie van afstand

### 🔊 Ruis & S/N
Antenneruis en signaal-ruisverhouding berekening.

### 📐 Circuit
Equivalent circuit diagram (SVG) met:
- R_rad, R_loop, X_L (spoel), C_tune
- Z_in resonantie formule
- Stat-kaarten: Z_in, X_A, R_L, R_rad, C_tune, Q

### 🧮 Berekenstappen
Stap-voor-stap weergave van alle tussenresultaten met formules en waarden.

---

## Gebruikte formules

### Inductantie

**Enkelvoudige cirkel (N=1), Wheeler 1928:**
```
L = µ₀ · r · (ln(8r/a) − 2)
```
Waarbij `r` = lusradius, `a` = geleiderradius.

**Meerwinding cirkel (N>1), Nagaoka-benadering:**
```
L = kN · µ₀ · π · r² · N² / (r + cl/2)
kN = 1 / (1 + 0.9r / (r + cl/2))
```
Waarbij `cl` = wikkellengte = (N−1) × spoed.

**Vierkante lus:**
```
L = N² · (2µ₀ · side/π) · (ln(side/a) − 0.774) × 0.95
```

### Stralingsweerstand

**Kleine lus (C/λ < 0.5):**
```
R_rad = 31171 · (A·N / λ²)²  [Ω]
```

**Grote lus (C/λ ≥ 0.5):**
```
R_rad = 60π² · C/λ  [Ω]
```

### Huideffect & Oppervlakweerstand
```
δ = √(ρ / π·f·µ₀)                    [huiddiepte in m]
Rs = ρ / δ = √(ρ·π·f·µ₀)             [Ω/□]
R_loop = Rs · L_cond / circ_eff · proxF
```

### Afstemcapaciteit
```
C_ideaal = 1 / (ω²·L)
C_self   = ε₀ · (perimeter/π)         [pF]
C_req    = C_ideaal − C_self
```

### EMF Veiligheidsafstand
```
m = I_a · A · N                        [A·m²]
r_NF = ∛(m / 4π·H_lim)                [nabij-veld dominant]
r_FF = m·k² / (4π·H_lim)              [ver-veld dominant]
H_lim = 0.073 A/m  (ICNIRP, 3-30 MHz)
```

### Image Theory (grondeffect)
```
AF(θ) = 2·Γ·|sin(k·h·sin(θ))|
D_eff = D₀ × max(AF, 0.01)
G_eff = η · D_eff
```

---

## Geleiders & Materialen

### Beschikbare geleiders (22+)

| Categorie | Voorbeelden | ρ (Ω·m) |
|---|---|---|
| Cu ronde buis | 15mm, 22mm | 1.724×10⁻⁸ |
| Al ronde buis | 15mm, 22mm | 2.650×10⁻⁸ |
| Al strip | 30×2, 30×4, 50×2, 50×4 mm | 2.650×10⁻⁸ |
| Al tape | 48/50/75/100 mm, 25/50 µm | 2.650×10⁻⁸ |
| Cu tape | 50 mm, 35 µm | 1.724×10⁻⁸ |
| Coax buitengeleider | RG213, LMR-400, Cellflex 7/8" | ~1.7–2.7×10⁻⁸ |
| IVC flex kanaalduct | 100mm, 125mm (INDICATIEF) | 2.650×10⁻⁸ |
| **Aangepast** | Cu/Al/Staal + handmatige diameter | variabel |

### Aangepaste geleider
Vrij in te voeren: materiaal (Cu/Al/Staal) en diameter (mm). Staal: ρ ≈ 1×10⁻⁷ Ω·m (5–6× hogere weerstand dan Cu).

### Stroomcrowding (platte strips)
Stroom op platte strips concentreert zich op de zijkanten: effectieve omtrek = `π × breedte/2` (niet `2×(b+t)`). Geïmplementeerd per Silver «Microwave Engineering Handbook».

---

## Installatie & Gebruik

### Vereisten
- Node.js ≥ 18
- npm ≥ 9

### Lokaal draaien
```bash
git clone https://github.com/ronald1711/MagLoop-HamPro.git
cd MagLoop-HamPro
npm install
npm run dev
```

### Bouwen voor productie
```bash
npm run build
# Resultaat in ./dist/
```

### Instellingen worden automatisch opgeslagen
Alle parameters worden opgeslagen in `localStorage` (sleutel: `magloop_inputs_v1`) en hersteld bij herstart. Reset door de browser-storage te wissen.

---

## Technische stack

| Component | Technologie |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| State management | `useReducer` + `useMemo` |
| Persistentie | `localStorage` |
| Grafieken | Chart.js 4 via react-chartjs-2 |
| Stralingspatroon | Canvas 2D API |
| Styling | CSS custom properties (thema: dark/light/high-contrast) |

---

## Validatie & Referentiecheck

De berekeningen zijn gevalideerd tegen de **VK3CPU Magloop Calculator V10.6**:

| Parameter | VK3CPU | MagLoop HamPro | Verschil |
|---|---|---|---|
| C_self (0.95m lus, 37.7 MHz SRF) | 8.03 pF | 8.41 pF | ~5% ✓ |
| R_rad (0.95m Cellflex, 28.5 MHz) | 5.19 mΩ | ~5 mΩ | ✓ |
| Huiddiepte Cu @ 28.5 MHz | 12.1 µm | 12.0 µm | ✓ |
| C_tune (0.95m Cellflex, 28.5 MHz) | ~13 pF | 13.5 pF | ✓ |

**Bekende afwijkingen:**
- VK3CPU gebruikt cirkelvormig oppervlak voor alle vormen; MagLoop HamPro berekent vierkant oppervlak apart.
- Multi-turn formule: Nagaoka-benadering vs. exacte Wheeler — verschil < 5% voor praktische geometrieën.

---

## Waarschuwingssysteem

De app toont kleurgecodeerde waarschuwingen bij:

| Conditie | Niveau |
|---|---|
| η < 1% | 🔴 Gevaar |
| V_cap > 10 kV | 🔴 Gevaar |
| C_tune ≤ 0 pF | 🔴 Gevaar — resonantie onmogelijk |
| C_tune < 5 pF | 🔴 Gevaar — onpraktisch |
| V_cap > 5 kV | 🟠 Waarschuwing |
| BW < 5 kHz | 🟠 Waarschuwing |
| BW < 2 kHz | 🟠 Detuning risico |
| TX > 10W (EMF) | 🟠 Veiligheidsafstand tonen |
| TX ≥ 100W | 🔴 Hoge EMF blootstelling |
| Hoogte < 0.5m | 🟠 Grondverlies > 100 mΩ |
| Perimeter > 0.3λ | 🔴 Model onzuiver |
| Nabij-veld objecten | 🔵 Info |
| Coax C_cable aanwezig | 🔵 Info (N=1: niet afgetrokken) |

---

## Referenties

- **Balanis, C.A.** — *Antenna Theory: Analysis and Design*, 4e editie. Wiley, 2016.
  - Par. 5.2.6 — Small circular loop radiation pattern
  - Par. 5.2.7A — Equivalent circuit (R_rad, R_L, X_A)
  - Par. 4.7 — Image theory above perfect electric conductor
  - Eq. 5-31 — Directivity D₀ = 1.5 = 1.76 dBi
  - Eq. 2-46 — Gain G = η × D₀
- **Silver, S.** — *Microwave Antenna Theory and Design*. MIT Radiation Lab Series, 1949.
  - Par. 2.8 — Surface resistance and skin depth
- **Wheeler, H.A.** — *Simple Inductance Formulas for Radio Coils*, Proc. IRE 16:10, 1928.
- **Nagaoka, H.** — *The Inductance Coefficients of Solenoids*, J. Coll. Sci. Tokyo 27:6, 1909.
- **ICNIRP** — *Guidelines for Limiting Exposure to Time-Varying Electric, Magnetic and Electromagnetic Fields (up to 300 GHz)*, Health Physics 74:4, 1998.
- **VK3CPU** — Magloop Calculator V10.6, https://vk3cpu.net

---

## Auteur

**PC3Y** — HAM radio operator  
Broncode: [github.com/ronald1711/MagLoop-HamPro](https://github.com/ronald1711/MagLoop-HamPro)  
Licentie: GNU General Public License v3.0
