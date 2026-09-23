# The Flame -- 7-domain progression concept (source document)

This is the project owner's own concept for a deeper progression/skill-tree system, preserved
verbatim (original language) as the authoritative source. It is a **concept**, not yet a
concrete spec -- it describes the shape and philosophy in generic RPG terms (enemies, combat,
bosses), which do not literally exist in The Flame. Translating each domain into what it
actually means for a fire-growth game (burning, igniting, cascading, growing, world-clearing --
no combat, no enemies) is real design work that has to happen before any code gets written. See
`.claude/agents/flame-progression-architect.md` for how that translation and the resulting
implementation queue are managed, and `PROGRESSION_QUEUE.md` (once it exists) for the ordered,
Flame-specific breakdown derived from this document.

**Do not implement directly from this file.** Implement from `PROGRESSION_QUEUE.md`, which is
this concept translated into The Flame's actual mechanics, broken into one concrete function at
a time.

---

## Concept: 7-gebaseerd Skill Tree & Progression System

Ik wil een progression- en skill-tree-systeem ontwerpen dat qua basisgevoel geinspireerd is door
games zoals Idle Slayer, maar vervolgens elementen combineert uit andere games met diepere
progression-systemen.

Het doel is nadrukkelijk NIET om Idle Slayer letterlijk te kopieren. Ik wil de sterke kern
behouden, maar daar een eigen systeem bovenop bouwen dat meer diepgang, keuzes, specialisatie en
verschillende soorten progression geeft.

### Kernidee

De basisfilosofie blijft:
Spelen -> resources verzamelen -> progression -> reset/Ascension -> permanente upgrades ->
nieuwe mogelijkheden -> opnieuw spelen -> steeds diepere progression.

Het belangrijke verschil is dat progression niet langer alleen draait om een soort punten of
simpelweg grotere getallen. De speler moet op meerdere manieren vooruitgang kunnen boeken:

- kracht
- economie
- combat
- mastery
- actieve gameplay
- passieve/idle gameplay
- Ascension
- endgame/meta-progression

Deze systemen moeten met elkaar verbonden zijn, maar niet volledig hetzelfde doen.

### Het getal 7 als leidend principe

Het getal 7 moet een fundamenteel onderdeel van het ontwerp worden. Niet alleen als cosmetisch
getal, maar als een soort ontwerpprincipe. De hoofdprogression bestaat uit zeven domeinen.

Belangrijk: er bestaat geen zesde domein of zesde hoofdlaag. De structuur moet dus niet voelen
als 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7, maar eerder alsof 7 het centrale ontwerpprincipe is waar de
volledige progression omheen gebouwd wordt.

De zeven domeinen zijn:

#### 1. Foundation

De fundamentele progression van de speler. Hier vallen de basisverbeteringen onder:

- base damage
- movement
- coin generation
- enemy rewards
- resource generation
- basis abilities
- algemene efficiency

Dit is de laag die bestaande gameplay beter maakt. De speler denkt hier: "Ik word beter in wat
ik al kan."

#### 2. Combat

Een aparte progression voor combat. Niet alleen simpele +10% damage, maar verschillende manieren
om combat te spelen. Bijvoorbeeld:

**Berserker** -- sterker wanneer de speler actief speelt, hogere damage tijdens bepaalde
situaties, tijdelijke power spikes.

**Hunter** -- betere rewards van bepaalde enemies, bonussen voor specifieke enemy types.

**Critical** -- focus op critical hits, mechanics rondom crit chance, crit damage en chains.

**Executioner** -- extra voordelen tegen weakened enemies.

**Swarm** -- voordelen wanneer grote aantallen enemies worden verslagen.

Hierdoor kunnen twee spelers met ongeveer dezelfde totale progression toch een totaal andere
build hebben.

#### 3. Economy

Een aparte progression voor de economie. Hier wil ik bewust meerdere soorten resources
introduceren. Bijvoorbeeld:

**Coins** -- normale/regelmatige currency, equipment, tijdelijke upgrades, basisprogression.

**Souls** -- verdiend door combat, permanente character progression.

**Slayer Points** -- verdiend via Ascension, gebruikt voor belangrijke permanente upgrades.

Het belangrijkste ontwerpprincipe: niet iedere currency mag hetzelfde doen. Elke resource moet
een duidelijke functie hebben.

#### 4. Mastery

Mastery is anders dan normale level progression. De speler krijgt niet alleen punten omdat hij
veel currency heeft verzameld. De speler krijgt Mastery door daadwerkelijk bepaalde onderdelen
van de game te beheersen. Voorbeelden:

**Combat Mastery** -- veel enemies verslaan, bepaalde enemy types beheersen, bosses verslaan,
specifieke combat challenges uitvoeren.

**Mobility Mastery** -- movement, platforming, exploration.

**Economy Mastery** -- grote hoeveelheden coins genereren, efficient resources verzamelen,
bepaalde economische doelen behalen.

Hierdoor ontstaat een belangrijk verschil: Level = hoeveel progression/resources je hebt.
Mastery = wat je daadwerkelijk hebt bereikt of beheerst. Mastery levert vervolgens Mastery
Points op. Deze punten kunnen gebruikt worden binnen de bijbehorende mastery-systemen. Het doel
hiervan is dat de speler niet simpelweg de makkelijkste activiteit eindeloos kan farmen om
uiteindelijk alles vrij te kopen.

#### 5. Ascension

Hier blijft de oorspronkelijke Idle Slayer-achtige filosofie belangrijk. De speler kan op een
bepaald moment zijn tijdelijke progression resetten door te Ascenden. Daarvoor krijgt hij een
permanente progression-resource, bijvoorbeeld Ascension Points / Slayer Points. Deze kunnen
gebruikt worden voor permanente upgrades. Voorbeelden:

- betere Soul generation
- betere offline progression
- permanente abilities
- nieuwe events
- nieuwe gameplay mechanics
- nieuwe progression-systemen
- sterkere bestaande systemen

Maar een belangrijk ontwerpprincipe: Ascension moet niet alleen grotere cijfers geven. Sommige
Ascension upgrades moeten daadwerkelijk nieuwe mogelijkheden of nieuwe systemen ontgrendelen. De
speler moet na een grote Ascension soms denken: "Ik kan nu iets doen wat ik daarvoor letterlijk
niet kon." Dat voelt veel betekenisvoller dan alleen: "+500% damage."

#### 7. Transcendence

(Numbered 7 in the original -- there is deliberately no numbered "6," per the "7 as design
principle, not a step counter" idea above.)

Dit is de hoogste progression-laag. Transcendence moet niet gewoon een duurdere versie van
Ascension zijn. Het moet een fundamenteel ander type progression zijn. De speler bereikt
Transcendence door grote milestones te behalen. Bijvoorbeeld:

- enorme hoeveelheden Souls genereren
- belangrijke Mastery-doelen behalen
- grote Ascension-mijlpalen bereiken
- speciale challenges voltooien
- bepaalde combinaties van progression bereiken

Transcendence geeft vervolgens Transcendence Points. Deze punten worden gebruikt om niet alleen
stats te verbeteren, maar om regels van het spel te veranderen. Voorbeelden:

- random events kunnen chainen
- bepaalde enemies kunnen evolueren
- Ascensions kunnen extra resources produceren
- Masteries kunnen met elkaar samenwerken
- bepaalde events kunnen permanent worden
- verschillende builds kunnen nieuwe interacties krijgen
- bestaande mechanics kunnen op nieuwe manieren gecombineerd worden

Dit is dus geen "+1000% damage" maar eerder: "De manier waarop het spel werkt verandert."

### De verschillende soorten progression-punten

Een belangrijk onderdeel van het systeem is dat verschillende punten verschillende betekenissen
hebben.

**Coins** -- de normale economische resource, gebruikt voor directe progression. Betekenis:
Wealth.

**Souls** -- een resource die voortkomt uit combat en gameplay, gebruikt voor permanente
character progression. Betekenis: Power gained through gameplay.

**Slayer Points / Ascension Points** -- verdiend door Ascension, gebruikt voor permanente
progression en het vrijspelen van grotere mechanics. Betekenis: Long-term progression.

**Mastery Points** -- verdiend door bepaalde activiteiten daadwerkelijk te beheersen, gebruikt
voor specialisatie binnen specifieke mastery-systemen. Betekenis: Skill / expertise.

**Ascension Tokens** -- een zeldzamere progression-resource die gekoppeld kan worden aan grote
achievements of belangrijke milestones, gebruikt voor geavanceerde nodes die niet zomaar gekocht
kunnen worden met normale punten. Betekenis: Achievement / major milestone.

**Transcendence Points** -- de endgame-resource, gebruikt om fundamentele mechanics en regels te
veranderen. Betekenis: Evolution.

**7-Core Points** -- de ultieme progression-resource. Deze wordt niet simpelweg door farming
verdiend. De speler moet grote milestones binnen de volledige progression bereiken. Het idee is
dat de speler uiteindelijk verschillende delen van het spel heeft beheerst en daardoor toegang
krijgt tot de ultieme progression. De 7-Core vertegenwoordigt de volledige beheersing van het
systeem. Deze points zijn bedoeld voor de allerhoogste progression en kunnen bijvoorbeeld
gebruikt worden om:

- volledig nieuwe interacties tussen systemen te creeren
- progression-systemen verder te laten evolueren
- unieke abilities te ontgrendelen
- nieuwe vormen van gameplay te introduceren
- bestaande mechanics op een fundamenteel andere manier te laten functioneren

### Hoe de systemen met elkaar samenwerken

De verschillende progression-lagen moeten niet los van elkaar staan. Een speler kan
bijvoorbeeld: Combat -> Souls -> Ascension -> Mastery -> Transcendence, maar ook: Economy ->
Coins -> resources -> Ascension, of: Mobility -> Mastery -> speciale challenges ->
Transcendence. Daardoor ontstaat een netwerk van progression in plaats van een lineaire skill
tree.

Visueel kan dit ongeveer als volgt worden gezien:

```
                         7-CORE
                            |
                      TRANSCENDENCE
                            |
                         ASCENSION
                       /     |      \
                 COMBAT   ECONOMY   MASTERY
                    \        |        /
                     \       |       /
                       FOUNDATION
```

Dit is slechts een conceptueel model. Het uiteindelijke systeem hoeft niet letterlijk deze vorm
te hebben. Het belangrijkste is dat de systemen logisch met elkaar verbonden zijn.

### De belangrijkste ontwerpfilosofie

De speler moet niet voortdurend alleen de vraag beantwoorden: "Welke upgrade geeft mij het
grootste getal?" Het systeem moet de speler laten nadenken over:

- Wat voor build wil ik maken?
- Welke gameplay wil ik beheersen?
- Wanneer is het verstandig om te Ascenden?
- Welke resources wil ik produceren?
- Welke Masteries passen bij mijn build?
- Welke mechanics kan ik met elkaar combineren?
- Welke grote milestones wil ik bereiken?
- Hoe kom ik uiteindelijk bij de 7-Core?

### Verschil tussen Level, Points en Mastery

Het systeem moet duidelijk onderscheid maken tussen drie concepten.

**Level** -- geeft algemene progression aan. Het is de klassieke "Ik ben sterker geworden."

**Points** -- zijn een bestedingsresource. De speler heeft een bepaald aantal punten en kiest
waar hij ze investeert.

**Mastery** -- bewijst dat de speler daadwerkelijk een bepaald onderdeel van de game heeft
bereikt of beheerst.

Daardoor kunnen deze drie systemen naast elkaar bestaan zonder redundant te worden. Bijvoorbeeld:

```
LEVEL         -> algemene groei
POINTS        -> keuzes maken
MASTERY       -> laten zien wat je beheerst
ASCENSION     -> tijdelijke progression omzetten naar permanente progression
TRANSCENDENCE -> de regels van progression veranderen
7-CORE        -> ultieme beheersing
```

### Waarom deze combinatie interessant is

De inspiratie komt uit verschillende soorten games:

- **Idle Slayer** -> Ascension, Souls, langdurige idle/active progression
- **RPG's** -> levels, builds, specialization
- **Roguelites** -> resetten en permanente meta-progression
- **ARPG's zoals Path of Exile** -> grote branching trees en build-keuzes
- **Games zoals Hades** -> verschillende resources die verschillende soorten permanente
  progression vertegenwoordigen

Het resultaat moet echter geen kopie van een van deze systemen worden. Het moet een eigen
progression-ecosysteem worden waarin Resources -> Levels -> Mastery -> Skill Tree -> Ascension
-> Transcendence -> 7-Core allemaal verschillende functies hebben.

### De gouden regel

De belangrijkste regel voor het uiteindelijke ontwerp: **Progression moet niet alleen de speler
sterker maken. Progression moet de speler nieuwe keuzes geven.**

Een goede upgrade zegt: "Je doet nu meer damage."
Een betere upgrade zegt: "Je kunt nu op een nieuwe manier spelen."
Een uitzonderlijke upgrade zegt: "Je kunt nu systemen combineren die eerder niet met elkaar
konden samenwerken."

Dat laatste is waar de diepere progression uiteindelijk naartoe moet werken.
