import * as THREE from "three";
import { TrackballControls } from "./vendor/TrackballControls.js";

const ASSET_VERSION = Date.now().toString(36);

const TEMPLATE_FILES = [
  "blackcard.png",
  "bluecard.png",
  "goldcard.png",
  "greencard.png",
  "redcard.png",
  "whitecard.png"
];

const CARD_COLOR_FILTERS = [
  { name: "white", templateFile: "whitecard.png" },
  { name: "black", templateFile: "blackcard.png" },
  { name: "blue", templateFile: "bluecard.png" },
  { name: "gold", templateFile: "goldcard.png" },
  { name: "green", templateFile: "greencard.png" },
  { name: "red", templateFile: "redcard.png" }
];

const TEMPLATE_COLOR_NAMES = new Map(
  CARD_COLOR_FILTERS.map((color) => [color.templateFile, color.name])
);

const DEFAULT_TEMPLATE_OVERRIDES = new Map(Object.entries({
  "assets/art/crop/Alberto Zardo, The Divine Comedy, Lucifer.png": "blackcard.png",
  "assets/art/crop/American School, A Toy Peddler of Japan.png": "greencard.png",
  "assets/art/crop/Anker, Children_s Team 1868.png": "goldcard.png",
  "assets/art/crop/Athanasius Kircher, Deck of Earth, Solar Clock 1636.png": "blackcard.png",
  "assets/art/crop/Bagetti, The Walnut Tree in Benevento 1826.png": "greencard.png",
  "assets/art/crop/Barna Basilides, The Shepherds 1935.png": "whitecard.png",
  "assets/art/crop/Beechey, The Oddie Children 1789.png": "whitecard.png",
  "assets/art/crop/Bellows, Club Night 1907.png": "redcard.png",
  "assets/art/crop/Blythe, Boy Playing Marbles.png": "whitecard.png",
  "assets/art/crop/Breviarium Grimani, The Wine Harvest 1515.png": "greencard.png",
  "assets/art/crop/Bruegel, The Triumph of Death 1562.png": "blackcard.png",
  "assets/art/crop/Carbo, The Bullfight.png": "goldcard.png",
  "assets/art/crop/Clarke, Between Rounds.png": "bluecard.png",
  "assets/art/crop/Crawhall, The Bullfight at Algeciras.png": "goldcard.png",
  "assets/art/crop/Dali, The Knight of Death 1934.png": "blackcard.png",
  "assets/art/crop/David Humbert de Superville, The Ruinous Tower of Babel ~1800.png": "whitecard.png",
  "assets/art/crop/David Lynch, Rock with Seven Eyes 1996.png": "redcard.png",
  "assets/art/crop/Discart, A Game of Draughts.png": "goldcard.png",
  "assets/art/crop/Eitaku, Spinning top and blowing bubbles 1888.png": "whitecard.png",
  "assets/art/crop/El Greco, View and Plan of Toledo 1608.png": "blackcard.png",
  "assets/art/crop/Ernst Klimt, Still life with armor 1885.png": "redcard.png",
  "assets/art/crop/French School, Child jockeys racing fish 1913.png": "greencard.png",
  "assets/art/crop/French School, Futuredays A Nineteenth Century Vision of the Year 2000.png": "whitecard.png",
  "assets/art/crop/German School, The origins of billiard 1745.png": "whitecard.png",
  "assets/art/crop/Gerome, The Retreating Lions 1902.png": "redcard.png",
  "assets/art/crop/Goya, Boys Playing at Soldiers.png": "greencard.png",
  "assets/art/crop/Gustave Dore, Satan Views the Whole of Eden.png": "blackcard.png",
  "assets/art/crop/Harold Forster, Fate  1930.png": "blackcard.png",
  "assets/art/crop/Helen Lundeberg, Dreaming 1942.png": "whitecard.png",
  "assets/art/crop/Henri Emilien Rousseau, The Falcon Chase 1923.png": "goldcard.png",
  "assets/art/crop/Hieronymous Bosch, Ascent of the Blessed 1504.png": "blackcard.png",
  "assets/art/crop/James Gurney.png": "whitecard.png",
  "assets/art/crop/Kiefer, Everyone Stands Under His Own Dome of Heaven 1970.png": "bluecard.png",
  "assets/art/crop/Konstantin Gorbatov, The Invisible City of Kitezh 1913.png": "bluecard.png",
  "assets/art/crop/Landscape, 1928 Picasso.png": "goldcard.png",
  "assets/art/crop/Leonardo da Vinci, Salvator Mundi 1510.png": "bluecard.png",
  "assets/art/crop/Leyster, A card player.png": "redcard.png",
  "assets/art/crop/Luigi Russolo, The Sanctity of Light 1910.png": "bluecard.png",
  "assets/art/crop/Mikalojus Konstantinas Ciurlionis, Sagittarius  1907.png": "greencard.png",
  "assets/art/crop/N.C. Wyeth, The Duel 1922.png": "redcard.png",
  "assets/art/crop/Pernhart, View of the Grossglockner.png": "bluecard.png",
  "assets/art/crop/Pinelli, Bullfight.png": "goldcard.png",
  "assets/art/crop/Rembrandt, Palla Athena 1657.png": "blackcard.png",
  "assets/art/crop/Roerich, Mother of the World.png": "bluecard.png",
  "assets/art/crop/Tatiana Bystrova, Nocturnal Bloom 1970.png": "whitecard.png",
  "assets/art/crop/Thomas Baines, The Eastern Cataracts of the Victoria Falls_.png": "greencard.png",
  "assets/art/crop/Tyrus Wong, Concept for Disney_s Bambi 1942.png": "goldcard.png",
  "assets/art/crop/Unknown, Angel.png": "whitecard.png",
  "assets/art/crop/Unknown, Green Knight 14th century.png": "greencard.png",
  "assets/art/crop/Unknown, Jester.png": "redcard.png",
  "assets/art/crop/Unknown, Mythic Sky.png": "redcard.png",
  "assets/art/crop/Unknown, The Devil_s Cave.png": "blackcard.png",
  "assets/art/crop/Wilhelm Kotarbinski, The Angel of Sadness 1900_.png": "bluecard.png",
  "assets/art/New/crop/Alphonse Mucha, After the Battle of Vitkov Hill.png": "redcard.png",
  "assets/art/New/crop/Alphonse Mucha, Apotheosis of the Slavs Slavs for Humanity 1926.png": "bluecard.png",
  "assets/art/New/crop/Casper Johann Nepomuk Scheuren, Charlemagne, King of Franks and Lombards and Emper.png": "whitecard.png",
  "assets/art/New/crop/Charles Theodore Frere, Caravan crossing the desert.png": "goldcard.png",
  "assets/art/New/crop/Chikanobu Yoshu, Chiyoda Castle Album of Men 1897.png": "whitecard.png",
  "assets/art/New/crop/Claude Louis Chatelet, Illumination of the Belvedere pavilion.png": "greencard.png",
  "assets/art/New/crop/Emanuel Gottlieb Leutze, Washington Crossing the Delaware 1851.png": "bluecard.png",
  "assets/art/New/crop/Francois Flameng, Air Fight, The enemy plane falling in flames.png": "whitecard.png",
  "assets/art/New/crop/Franois Auguste Biard, View of the Icy Ocean Walrus Fishing by the Greenlanders.png": "bluecard.png",
  "assets/art/New/crop/Franois Vervloet, The Guns in the Detail Fortress.png": "goldcard.png",
  "assets/art/New/crop/Franz von Stuck, Franz von Stuck Der Engel des Gerichts Gemaelde 1922.png": "bluecard.png",
  "assets/art/New/crop/French School, The Seven-headed Beast of the Apocalypse.png": "greencard.png",
  "assets/art/New/crop/Giovanni Canavesio, Last Judgment 1492.png": "redcard.png",
  "assets/art/New/crop/Giuseppe Maria Terreni, Porto Ferraio.png": "bluecard.png",
  "assets/art/New/crop/Giuseppe Pellizza da Volpedo, The Rising Sun 1904.png": "blackcard.png",
  "assets/art/New/crop/Goya, Exorcism or witches.png": "blackcard.png",
  "assets/art/New/crop/Guido Reni, Archangel, Saint Michael.png": "goldcard.png",
  "assets/art/New/crop/Gustave Dore, Destruction of Leviathan.png": "bluecard.png",
  "assets/art/New/crop/Gustave Dore, The Divine Comedy Paradiso Canto 31.png": "whitecard.png",
  "assets/art/New/crop/Hubert Robert, Fantaisie Egyptienne 1760.png": "whitecard.png",
  "assets/art/New/crop/Ira Block, Samurai screen depicting the fall of Osaka castle 1615.png": "goldcard.png",
  "assets/art/New/crop/Ivan Konstantinovich Aivazovsky, Constantinople, the Mosque of Tophane.png": "bluecard.png",
  "assets/art/New/crop/Jan Brueghel, The Tower of Babel 1650.png": "goldcard.png",
  "assets/art/New/crop/Jean Bruno Gassies, Landscape of Scotland 1826.png": "greencard.png",
  "assets/art/New/crop/Jean Francois Depelchin, Interior view of the cathedrale Notre Dame de Paris.png": "whitecard.png",
  "assets/art/New/crop/Lorenzo Lotto, Saint Michael Hunting Lucifer 1555.png": "goldcard.png",
  "assets/art/New/crop/Louis Janmot, The poem of the Soul Le passage des ames.png": "bluecard.png",
  "assets/art/New/crop/Paul Klee, Italian City.png": "whitecard.png",
  "assets/art/New/crop/Protohistoric, Magic scenes.png": "whitecard.png",
  "assets/art/New/crop/Samuel Palmer, Christian Descending into the Valley of Humiliation.png": "goldcard.png",
  "assets/art/New/crop/Samuel Read, North of Ireland Dunseverick Castle.png": "greencard.png",
  "assets/art/New/crop/School Mughal, Elephant Combat.png": "whitecard.png",
  "assets/art/New/crop/School Persian, Mythical heros and son of Zal kills the white ele.png": "whitecard.png",
  "assets/art/New/crop/School Persian, Torture of an enemy burying alive at the foot of a tree Per.png": "goldcard.png",
  "assets/art/New/crop/Sebastiano Ricci, Study for An Apotheosis of a Saint 1695.png": "redcard.png",
  "assets/art/New/crop/Theophile Louis Deyrolle, Shepherdess with her Flock 1907.png": "goldcard.png",
  "assets/art/New/crop/Unbekannt Unbekannt, The Adoration of the Beast.png": "greencard.png",
  "assets/art/New/crop/Unbekannt, Fool's Cap World Map 1590.png": "blackcard.png",
  "assets/art/New/crop/Unbekannt, Samurai Warrior riding a horse.png": "redcard.png",
  "assets/art/New/crop/Unbekannt, The Woman upon the Scarlet Beast.png": "bluecard.png",
  "assets/art/New/crop/Unbekannter Kuenstler, Shivas beast Sivatherium giganteum1908.png": "goldcard.png",
  "assets/art/New/crop/William Blake, Dante, running from the three beasts.png": "blackcard.png",
  "assets/art/New/crop/William Blake, The Great Red Dragon and the Beast from the Sea.png": "bluecard.png",
  "assets/art/New/crop/William Blake, The Sun at His Eastern Gate.png": "goldcard.png",
  "assets/art/New/crop/William Blake, The Vision of Christ.png": "blackcard.png",
  "assets/art/New/crop/William Henry Smyth, Perilous position of HMS Terrorpng.png": "bluecard.png"
}));

const CROP_FILES = [
  "Alberto Zardo, The Divine Comedy, Lucifer.png",
  "American School, A Toy Peddler of Japan.png",
  "Anker, Children_s Team 1868.png",
  "Athanasius Kircher, Deck of Earth, Solar Clock 1636.png",
  "Bagetti, The Walnut Tree in Benevento 1826.png",
  "Barna Basilides, The Shepherds 1935.png",
  "Beechey, The Oddie Children 1789.png",
  "Bellows, Club Night 1907.png",
  "Blythe, Boy Playing Marbles.png",
  "Breviarium Grimani, The Wine Harvest 1515.png",
  "Bruegel, The Triumph of Death 1562.png",
  "Carbo, The Bullfight.png",
  "Clarke, Between Rounds.png",
  "Crawhall, The Bullfight at Algeciras.png",
  "Dali, The Knight of Death 1934.png",
  "David Humbert de Superville, The Ruinous Tower of Babel ~1800.png",
  "David Lynch, Rock with Seven Eyes 1996.png",
  "Discart, A Game of Draughts.png",
  "Eitaku, Spinning top and blowing bubbles 1888.png",
  "El Greco, View and Plan of Toledo 1608.png",
  "Ernst Klimt, Still life with armor 1885.png",
  "Fragonard, The Swing 1780.png",
  "Franz Ludwig Catel, Monks in a monastery courtyard 1856.png",
  "French School, Child jockeys racing fish 1913.png",
  "French School, Futuredays A Nineteenth Century Vision of the Year 2000.png",
  "German School, The origins of billiard 1745.png",
  "Gerome, The Retreating Lions 1902.png",
  "Goya, Boys Playing at Soldiers.png",
  "Gustave Dore, Satan Views the Whole of Eden.png",
  "Harold Forster, Fate  1930.png",
  "Helen Lundeberg, Dreaming 1942.png",
  "Henri Emilien Rousseau, The Falcon Chase 1923.png",
  "Hieronymous Bosch, Ascent of the Blessed 1504.png",
  "James Gurney.png",
  "Kiefer, Everyone Stands Under His Own Dome of Heaven 1970.png",
  "Konstantin Gorbatov, The Invisible City of Kitezh 1913.png",
  "Landscape, 1928 Picasso.png",
  "Leonardo da Vinci, Salvator Mundi 1510.png",
  "Leyster, A card player.png",
  "Luigi Russolo, The Sanctity of Light 1910.png",
  "Mikalojus Konstantinas Ciurlionis, Sagittarius  1907.png",
  "N.C. Wyeth, The Duel 1922.png",
  "Pernhart, View of the Grossglockner.png",
  "Pinelli, Bullfight.png",
  "Rembrandt, Palla Athena 1657.png",
  "Roerich, Mother of the World.png",
  "Tatiana Bystrova, Nocturnal Bloom 1970.png",
  "Thomas Baines, The Eastern Cataracts of the Victoria Falls_.png",
  "Tyrus Wong, Concept for Disney_s Bambi 1942.png",
  "Unknown, Angel.png",
  "Unknown, Green Knight 14th century.png",
  "Unknown, Jester.png",
  "Unknown, Mythic Sky.png",
  "Unknown, The Devil_s Cave.png",
  "Wilhelm Kotarbinski, The Angel of Sadness 1900_.png"
];

const FULL_FILES = [
  "Alberto Zardo, The Divine Comedy, Lucifer.jpg",
  "American School, A Toy Peddler of Japan.jpg",
  "Anker, Children_s Team 1868.jpg",
  "Athanasius Kircher, Deck of Earth, Solar Clock 1636.jpg",
  "Bagetti, The Walnut Tree in Benevento 1826.jpg",
  "Barna Basilides, The Shepherds 1935.jpg",
  "Beechey, The Oddie Children 1789.jpg",
  "Bellows, Club Night 1907.jpg",
  "Blythe, Boy Playing Marbles.jpg",
  "Breviarium Grimani, The Wine Harvest 1515.jpg",
  "Bruegel, The Triumph of Death 1562.webp",
  "Carbo, The Bullfight.jpg",
  "Clarke, Between Rounds.jpg",
  "Crawhall, The Bullfight at Algeciras.jpg",
  "Dali, The Knight of Death 1934.jpg",
  "David Humbert de Superville, The Ruinous Tower of Babel ~1800.jpg",
  "David Lynch, Rock with Seven Eyes 1996.jpg",
  "Discart, A Game of Draughts.jpg",
  "Eitaku, Spinning top and blowing bubbles 1888.jpg",
  "El Greco, View and Plan of Toledo 1608.jpg",
  "Ernst Klimt, Still life with armor 1885.jpg",
  "Fragonard, The Swing 1780.jpg",
  "Franz Ludwig Catel, Monks in a monastery courtyard 1856.jpg",
  "French School, Child Jockeys Racing Fish 1913.jpg",
  "French School, Futuredays A Nineteenth Century Vision of the Year 2000.jpg",
  "German School, The origins of billiard 1745.jpg",
  "Gerome, The Retreating Lions 1902.jpg",
  "Goya, Boys Playing at Soldiers.jpg",
  "Gustave Dore, Satan Views the Whole of Eden.jpg",
  "Harold Forster, Fate  1930.jpg",
  "Helen Lundeberg, Dreaming 1942.jpg",
  "Henri Emilien Rousseau, The Falcon Chase 1923.jpg",
  "Hieronymous Bosch, Ascent of the Blessed 1504.jpg",
  "James Gurney, Mountain Temple.jpg",
  "Kiefer, Everyone Stands Under His Own Dome of Heaven 1970.jpg",
  "Konstantin Gorbatov, The Invisible City of Kitezh 1913.jpg",
  "Landscape, 1928 Picasso.jpg",
  "Leonardo da Vinci, Salvator Mundi 1510.jpg",
  "Leyster, A Card Player.jpg",
  "Luigi Russolo, The Sanctity of Light 1910.jpg",
  "Mikalojus Konstantinas Ciurlionis, Sagittarius  1907.jpg",
  "N.C. Wyeth, The Duel 1922.jpg",
  "Pernhart, View of the Grossglockner.jpg",
  "Pinelli, Bullfight.jpg",
  "Rembrandt, Palla Athena 1657.jpg",
  "Roerich, Mother of the World.jpg",
  "Tatiana Bystrova, Nocturnal Bloom 1970.jpg",
  "Thomas Baines, The Eastern Cataracts of the Victoria Falls .jpg",
  "Tyrus Wong, Concept for Disney_s Bambi 1942.jpg",
  "Unknown, Angel.jpg",
  "Unknown, Green Knight 14th century.jpg",
  "Unknown, The Devil_s Cave.png",
  "Unkown, Jester.png",
  "Unkown, Mythic Sky.jpg",
  "Wilhelm Kotarbinski, The Angel of Sadness 1900..jpg"
];

const NEW_CROP_FILES = [
  "Alphonse Mucha, After the Battle of Vitkov Hill.png",
  "Alphonse Mucha, Apotheosis of the Slavs Slavs for Humanity 1926.png",
  "Casper Johann Nepomuk Scheuren, Charlemagne, King of Franks and Lombards and Emper.png",
  "Charles Theodore Frere, Caravan crossing the desert.png",
  "Chikanobu Yoshu, Chiyoda Castle Album of Men 1897.png",
  "Claude Louis Chatelet, Illumination of the Belvedere pavilion.png",
  "Emanuel Gottlieb Leutze, Washington Crossing the Delaware 1851.png",
  "Francois Flameng, Air Fight, The enemy plane falling in flames.png",
  "Franois Auguste Biard, View of the Icy Ocean Walrus Fishing by the Greenlanders.png",
  "Franois Vervloet, The Guns in the Detail Fortress.png",
  "Franz von Stuck, Franz von Stuck Der Engel des Gerichts Gemaelde 1922.png",
  "French School, The Seven-headed Beast of the Apocalypse.png",
  "Giovanni Canavesio, Last Judgment 1492.png",
  "Giuseppe Maria Terreni, Porto Ferraio.png",
  "Giuseppe Pellizza da Volpedo, The Rising Sun 1904.png",
  "Goya, Exorcism or witches.png",
  "Guido Reni, Archangel, Saint Michael.png",
  "Gustave Dore, Destruction of Leviathan.png",
  "Gustave Dore, The Divine Comedy Paradiso Canto 31.png",
  "Hubert Robert, Fantaisie Egyptienne 1760.png",
  "Ira Block, Samurai screen depicting the fall of Osaka castle 1615.png",
  "Ivan Konstantinovich Aivazovsky, Constantinople, the Mosque of Tophane.png",
  "Jan Brueghel, The Tower of Babel 1650.png",
  "Jean Bruno Gassies, Landscape of Scotland 1826.png",
  "Jean Francois Depelchin, Interior view of the cathedrale Notre Dame de Paris.png",
  "Lorenzo Lotto, Saint Michael Hunting Lucifer 1555.png",
  "Louis Janmot, The poem of the Soul Le passage des ames.png",
  "Paul Klee, Italian City.png",
  "Protohistoric, Magic scenes.png",
  "Samuel Palmer, Christian Descending into the Valley of Humiliation.png",
  "Samuel Read, North of Ireland Dunseverick Castle.png",
  "School Mughal, Elephant Combat.png",
  "School Persian, Mythical heros and son of Zal kills the white ele.png",
  "School Persian, Torture of an enemy burying alive at the foot of a tree Per.png",
  "Sebastiano Ricci, Study for An Apotheosis of a Saint 1695.png",
  "Theophile Louis Deyrolle, Shepherdess with her Flock 1907.png",
  "Unbekannt Unbekannt, The Adoration of the Beast.png",
  "Unbekannt, Fool's Cap World Map 1590.png",
  "Unbekannt, Samurai Warrior riding a horse.png",
  "Unbekannt, The Woman upon the Scarlet Beast.png",
  "Unbekannter Kuenstler, Shivas beast Sivatherium giganteum1908.png",
  "William Blake, Dante, running from the three beasts.png",
  "William Blake, The Great Red Dragon and the Beast from the Sea.png",
  "William Blake, The Sun at His Eastern Gate.png",
  "William Blake, The Vision of Christ.png",
  "William Henry Smyth, Perilous position of HMS Terrorpng.png"
];

const NEW_FULL_FILES = [
  "Alphonse Mucha, After the Battle of Vitkov Hill.jpg",
  "Alphonse Mucha, Apotheosis of the Slavs Slavs for Humanity 1926.jpg",
  "Casper Johann Nepomuk Scheuren, Charlemagne, King of Franks and Lombards and Emper.jpg",
  "Charles Theodore Frere, Caravan crossing the desert.png",
  "Chikanobu Yoshu, Chiyoda Castle Album of Men 1897.jpg",
  "Claude Louis Chatelet, Illumination of the Belvedere pavilion.jpg",
  "Emanuel Gottlieb Leutze, Washington Crossing the Delaware 1851.jpg",
  "Francois Flameng, Air Fight, The enemy plane falling in flames.jpg",
  "Franois Auguste Biard, View of the Icy Ocean Walrus Fishing by the Greenlanders.jpg",
  "Franois Vervloet, The Guns in the Detail Fortress.jpg",
  "Franz von Stuck, Franz von Stuck Der Engel des Gerichts Gemaelde 1922.jpg",
  "French School, The Seven-headed Beast of the Apocalypse.jpg",
  "Giovanni Canavesio, Last Judgment 1492.jpg",
  "Giuseppe Maria Terreni, Porto Ferraio.jpg",
  "Giuseppe Pellizza da Volpedo, The Rising Sun 1904.jpg",
  "Goya, Exorcism or witches.jpg",
  "Guido Reni, Archangel, Saint Michael.jpg",
  "Gustave Dore, Destruction of Leviathan.jpg",
  "Gustave Dore, The Divine Comedy Paradiso Canto 31.jpg",
  "Hubert Robert, Fantaisie Egyptienne 1760.jpg",
  "Ira Block, Samurai screen depicting the fall of Osaka castle 1615.jpg",
  "Ivan Konstantinovich Aivazovsky, Constantinople, the Mosque of Tophane.jpg",
  "Jan Brueghel, The Tower of Babel 1650.jpg",
  "Jean Bruno Gassies, Landscape of Scotland 1826.jpg",
  "Jean Francois Depelchin, Interior view of the cathedrale Notre Dame de Paris.jpg",
  "Lorenzo Lotto, Saint Michael Hunting Lucifer 1555.jpg",
  "Louis Janmot, The poem of the Soul Le passage des ames.jpg",
  "Paul Klee, Italian City.jpg",
  "Protohistoric, Magic scenes.jpg",
  "Samuel Palmer, Christian Descending into the Valley of Humiliation.jpg",
  "Samuel Read, North of Ireland Dunseverick Castle.jpg",
  "School Mughal, Elephant Combat.jpg",
  "School Persian, Mythical heros and son of Zal kills the white ele.jpg",
  "School Persian, Torture of an enemy burying alive at the foot of a tree Per.jpg",
  "Sebastiano Ricci, Study for An Apotheosis of a Saint 1695.jpg",
  "Theophile Louis Deyrolle, Shepherdess with her Flock 1907.jpg",
  "Unbekannt Unbekannt, The Adoration of the Beast.jpg",
  "Unbekannt, Fool's Cap World Map 1590.jpg",
  "Unbekannt, Samurai Warrior riding a horse.jpg",
  "Unbekannt, The Woman upon the Scarlet Beast.jpg",
  "Unbekannter Kuenstler, Shivas beast Sivatherium giganteum1908.jpg",
  "William Blake, Dante, running from the three beasts.jpg",
  "William Blake, The Great Red Dragon and the Beast from the Sea.jpg",
  "William Blake, The Sun at His Eastern Gate.jpg",
  "William Blake, The Vision of Christ.jpg",
  "William Henry Smyth, Perilous position of HMS Terrorpng.jpg"
];

const ART_GROUPS = [
  {
    cropDirectory: "assets/art/crop",
    fullDirectory: "assets/art/full",
    cropFiles: CROP_FILES,
    fullFiles: FULL_FILES
  },
  {
    cropDirectory: "assets/art/New/crop",
    fullDirectory: "assets/art/New/full",
    cropFiles: NEW_CROP_FILES,
    fullFiles: NEW_FULL_FILES
  }
];

const ART_WINDOW = { x: 36, y: 68, width: 328, height: 242 };
const FACE_WIDTH = 800;
const FACE_HEIGHT = 1120;
const CARD_WIDTH = 2.5;
const CARD_HEIGHT = 3.5;
const CARD_DEPTH = 0.036;
const CARD_RADIUS = 0.112;
const INDIVIDUAL_CARD_WORLD_Y = 0.42;
const BINDER_FACE_WIDTH = 420;
const BINDER_FACE_HEIGHT = 588;
const BINDER_COLUMNS = 3;
const BINDER_ROWS = 3;
const BINDER_SIDE_SLOTS = BINDER_COLUMNS * BINDER_ROWS;
const BINDER_PAGE_SLOTS = BINDER_SIDE_SLOTS * 2;
const BINDER_CARD_WIDTH = 1.38;
const BINDER_CARD_HEIGHT = BINDER_CARD_WIDTH * 1.4;
const BINDER_CARD_RADIUS = BINDER_CARD_WIDTH * (CARD_RADIUS / CARD_WIDTH);
const BINDER_POCKET_PAD = 0.12;
const BINDER_GRID_GAP = 0.055;
const BINDER_PAGE_INNER_MARGIN = 0.11;
const BINDER_PAGE_OUTER_MARGIN = 0.165;
const BINDER_PAGE_VERTICAL_MARGIN = 0.22;
const BINDER_CELL_WIDTH = BINDER_CARD_WIDTH + BINDER_POCKET_PAD * 2;
const BINDER_CELL_HEIGHT = BINDER_CARD_HEIGHT + BINDER_POCKET_PAD * 2;
const BINDER_PAGE_WIDTH = BINDER_PAGE_INNER_MARGIN
  + BINDER_PAGE_OUTER_MARGIN
  + BINDER_COLUMNS * BINDER_CELL_WIDTH
  + (BINDER_COLUMNS - 1) * BINDER_GRID_GAP;
const BINDER_PAGE_HEIGHT = BINDER_PAGE_VERTICAL_MARGIN * 2
  + BINDER_ROWS * BINDER_CELL_HEIGHT
  + (BINDER_ROWS - 1) * BINDER_GRID_GAP;
const BINDER_CARD_LIFT = 0.035;
const BINDER_PAGE_STACK_GAP = 0.026;
const BINDER_VISIBLE_STACK_GAP = 0.104;
const BINDER_LEFT_STACK_Z = 0.026;
const BINDER_RIGHT_STACK_Z = -0.026;
const BINDER_GAP_REVEAL_STACK_GAP = 0.028;
const BINDER_PAGE_COLUMN_BEND = 0.042;
const BINDER_ACTIVE_PAGE_LIFT = 0.22;
const BINDER_STACK_TRANSITION_START = 0.75;
const BINDER_VISIBLE_STACK_DEPTH = 1;
const BINDER_HIDDEN_STACK_DEPTH = 5;
const BINDER_DEEP_PAGE_FADE_POWER = 1.35;
const BINDER_COVER_OVERHANG = 0.14;
const BINDER_COVER_VERTICAL_OVERHANG = 0.22;
const BINDER_COVER_RADIUS = 0.11;
const BINDER_PLASTIC_REST_OPACITY = 0.066;
const BINDER_PLASTIC_ACTIVE_OPACITY = 0.13;
const BINDER_FROST_REST_OPACITY = 0.018;
const BINDER_FROST_ACTIVE_OPACITY = 0.038;
const BINDER_GLOSS_REST_OPACITY = 0.014;
const BINDER_GLOSS_ACTIVE_OPACITY = 0.034;
const BINDER_SEAM_REST_OPACITY = 0.28;
const BINDER_SEAM_ACTIVE_OPACITY = 0.44;
const BINDER_CARD_VIEW_TRANSITION_MS = 820;
const BINDER_TEXTURE_CONCURRENCY = 10;
const INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD = 1560;
const BINDER_TO_INDIVIDUAL_WHEEL_THRESHOLD = 680;
const VIEW_SWITCH_WHEEL_IDLE_MS = 900;
const BINDER_FOCUS_ZOOM_OUT_LOCK_MS = 1000;
const BINDER_FOCUS_TRANSITION_LOCK_MS = BINDER_CARD_VIEW_TRANSITION_MS + BINDER_FOCUS_ZOOM_OUT_LOCK_MS;
const INDIVIDUAL_MAX_ZOOM_EPSILON = 0.035;
const BINDER_DOUBLE_TAP_MS = 420;
const BINDER_DOUBLE_TAP_DISTANCE = 28;
const BACK_TRIM = { x: 0.026, y: 0.018 };
const SHUFFLE_HISTORY_LIMIT = 10;
const FULL_ART_LAYOUTS = new Map([
  [
    "hieronymousboschascentoftheblessed1504",
    {
      yOffset: "0",
      width: "auto",
      height: "var(--card-height)",
      maxWidth: "none",
      maxHeight: "var(--card-height)"
    }
  ]
]);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0, 8.58);
const DEFAULT_CAMERA_DIRECTION = DEFAULT_CAMERA_POSITION.clone()
  .sub(DEFAULT_TARGET)
  .normalize();
const DEFAULT_CAMERA_UP = new THREE.Vector3(0, 1, 0);
const SNAP_DURATION = 720;

const table = document.querySelector("#table");
const scenePanel = document.querySelector("#scenePanel");
const canvas = document.querySelector("#cardCanvas");
const previousButton = document.querySelector("#previousButton");
const nextButton = document.querySelector("#nextButton");
const shuffleButton = document.querySelector("#shuffleButton");
const detailsButton = document.querySelector("#detailsButton");
const favoriteButton = document.querySelector("#favoriteButton");
const galleryToggleButton = document.querySelector("#galleryToggleButton");
const uploadButton = document.querySelector("#uploadButton");
const favoriteFilterButton = document.querySelector("#favoriteFilterButton");
const themeToggle = document.querySelector("#themeToggle");
const cardFileName = document.querySelector("#cardFileName");
const cardCounter = document.querySelector("#cardCounter");
const fullArtLink = document.querySelector("#fullArtLink");
const fullArtImage = document.querySelector("#fullArtImage");
const artMagnifier = document.querySelector("#artMagnifier");
const hoverMagnifierQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const galleryPanel = document.querySelector("#galleryPanel");
const galleryGrid = document.querySelector("#galleryGrid");
const galleryEmpty = document.querySelector("#galleryEmpty");
const binderToggle = document.querySelector("#binderToggle");
const binderPanel = document.querySelector("#binderPanel");
const binderCanvas = document.querySelector("#binderCanvas");
const binderLoading = document.querySelector("#binderLoading");
const binderPageControls = document.querySelector("#binderPageControls");
const binderPageStatus = document.querySelector("#binderPageStatus");
const binderZoomOutButton = document.querySelector("#binderZoomOutButton");
const binderPreviousPageButton = document.querySelector("#binderPreviousPageButton");
const binderNextPageButton = document.querySelector("#binderNextPageButton");
const binderOpenCardButton = document.querySelector("#binderOpenCardButton");
const binderFavoriteButton = document.querySelector("#binderFavoriteButton");
const binderShuffleButton = document.querySelector("#binderShuffleButton");
const binderColorFilters = document.querySelector("#binderColorFilters");
const binderColorFilterButtons = [...document.querySelectorAll(".binder-color-filter")];
const uploadModal = document.querySelector("#uploadModal");
const closeUploadButton = document.querySelector("#closeUploadButton");
const dropZone = document.querySelector("#dropZone");
const dropZoneText = document.querySelector("#dropZoneText");
const uploadInput = document.querySelector("#uploadInput");
const cropCanvas = document.querySelector("#cropCanvas");
const cropZoomInput = document.querySelector("#cropZoom");
const customTitleInput = document.querySelector("#customTitle");
const customAuthorInput = document.querySelector("#customAuthor");
const customDateInput = document.querySelector("#customDate");
const createCardButton = document.querySelector("#createCardButton");

let artItems = buildArtItems();
let authorOrder = buildAuthorOrder(artItems);
const imageCache = new Map();
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let renderer;
let scene;
let camera;
let controls;
let cardGroup;
let frontMaterial;
let backMaterial;
let frontGloss;
let backGloss;
let currentArtIndex = -1;
let currentTemplateFile = "";
let loadToken = 0;
let cameraSnap = null;
let paperNoiseCanvas = null;
let paperRoughnessTexture = null;
let binderCoverTexture = null;
let binderSleeveFrostTexture = null;
let uploadState = createUploadState();
let cropDrag = null;
let smoothZoomVelocity = 0;
let individualWheelOutDistance = 0;
let individualWheelOutLastAt = 0;
let binderFocusWheelInDistance = 0;
let binderFocusWheelInLastAt = 0;
let defaultCameraRadius = DEFAULT_CAMERA_POSITION.distanceTo(DEFAULT_TARGET);
let resizeFrame = 0;
let lastRendererWidth = 0;
let lastRendererHeight = 0;
const shuffleHistory = [];
const binderShuffleHistory = [];
const FAVORITES_STORAGE_KEY = "artmtg:favorites:v1";
const TEMPLATE_OVERRIDES_STORAGE_KEY = "artmtg:template-overrides:v1";
const favoriteKeys = loadFavoriteKeys();
const templateOverrides = loadTemplateOverrides();
const binderSelectedColorFilters = new Set();
let isGalleryOpen = false;
let galleryFavoritesOnly = false;
let isBinderMode = true;
let binderRenderer;
let binderScene;
let binderCamera;
let binderRoot;
let binderCardGeometry = null;
let binderColumnSheetGeometry = null;
let binderColumnGlossGeometry = null;
let binderVerticalSeamGeometry = null;
let binderHorizontalSeamGeometry = null;
let binderPages = [];
let binderCardMeshes = [];
let binderVisibleIndexes = [];
let binderAnimationFrame = 0;
let binderRenderFrame = 0;
let binderResizeFrame = 0;
let binderLastWidth = 0;
let binderLastHeight = 0;
let binderBuildToken = 0;
let binderIndexesKey = "";
let binderStateSignature = "";
let binderPageCount = 1;
let binderTurn = 0;
let binderTargetTurn = 0;
let binderBendDirection = 1;
let binderDrag = null;
let binderLastOpenTap = null;
let binderWheelFocusLockUntil = 0;
let binderFocusZoomOutLockUntil = 0;
let binderFocusPosition = -1;
let binderCameraReady = false;
let binderCardViewTransitionActive = false;
const binderDefaultCameraPosition = new THREE.Vector3(0, 0.24, 10);
const binderDefaultCameraLookAt = new THREE.Vector3(0, 0.24, 0);
const binderCurrentCameraLookAt = binderDefaultCameraLookAt.clone();
const binderDesiredCameraPosition = new THREE.Vector3();
const binderDesiredCameraLookAt = new THREE.Vector3();
const binderFocusWorldPosition = new THREE.Vector3();
const binderCardTextureCache = new Map();
let binderBackTexturePromise = null;
let binderPlaceholderTexture = null;

init();

async function init() {
  initScene();
  initControls();
  await applyRandomCard();
  animate();
}

function initScene() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.copy(getDefaultCameraPosition());
  camera.up.copy(DEFAULT_CAMERA_UP);
  camera.lookAt(DEFAULT_TARGET);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x2b2114, 1.62);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff2cf, 2.45);
  key.position.set(2.8, 3.5, 4.2);
  scene.add(key);

  const coolRim = new THREE.DirectionalLight(0x9dc2ca, 1.05);
  coolRim.position.set(-3.2, 1.6, -2.6);
  scene.add(coolRim);

  cardGroup = new THREE.Group();
  cardGroup.position.y = INDIVIDUAL_CARD_WORLD_Y;
  scene.add(cardGroup);

  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0b0906,
    roughness: 0.48,
    metalness: 0.08,
    clearcoat: 0.28,
    clearcoatRoughness: 0.42,
    reflectivity: 0.24
  });
  const core = new THREE.Mesh(
    createRoundedCoreGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH, CARD_RADIUS),
    sideMaterial
  );
  cardGroup.add(core);

  const paperRoughnessMap = createPaperRoughnessTexture();
  frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    alphaTest: 0.02,
    roughness: 0.58,
    roughnessMap: paperRoughnessMap,
    metalness: 0.02,
    clearcoat: 0.34,
    clearcoatRoughness: 0.42,
    reflectivity: 0.28,
    specularIntensity: 0.22,
    specularColor: new THREE.Color(0xb8ad92),
    side: THREE.FrontSide
  });

  backMaterial = frontMaterial.clone();

  const faceGeometry = createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  const frontFace = new THREE.Mesh(faceGeometry, frontMaterial);
  frontFace.position.z = CARD_DEPTH / 2 + 0.002;
  cardGroup.add(frontFace);

  const backFace = new THREE.Mesh(faceGeometry.clone(), backMaterial);
  backFace.rotation.y = Math.PI;
  backFace.position.z = -CARD_DEPTH / 2 - 0.002;
  cardGroup.add(backFace);

  frontGloss = createGlossPlane(1);
  frontGloss.position.z = CARD_DEPTH / 2 + 0.004;
  cardGroup.add(frontGloss);

  backGloss = createGlossPlane(-1);
  backGloss.rotation.y = Math.PI;
  backGloss.position.z = -CARD_DEPTH / 2 - 0.004;
  cardGroup.add(backGloss);

  new ResizeObserver(queueResizeRenderer).observe(scenePanel);
  window.addEventListener("resize", queueResizeRenderer);
  resizeRenderer();
}

function initControls() {
  initFixedViewportInsets();

  controls = new TrackballControls(camera, renderer.domElement);
  controls.noPan = true;
  controls.noZoom = true;
  controls.rotateSpeed = 3.2;
  controls.zoomSpeed = 0.24;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.08;
  controls.minDistance = 6.3;
  controls.maxDistance = 11.0;
  controls.target.copy(DEFAULT_TARGET);
  controls.target0.copy(DEFAULT_TARGET);
  controls.position0.copy(getDefaultCameraPosition());
  controls.up0.copy(DEFAULT_CAMERA_UP);
  controls.addEventListener("start", cancelCameraSnap);
  controls.addEventListener("end", startCameraSnap);
  renderer.domElement.addEventListener("pointerdown", cancelCameraSnap);
  renderer.domElement.addEventListener("pointerup", startCameraSnap);
  renderer.domElement.addEventListener("pointercancel", startCameraSnap);
  renderer.domElement.addEventListener("wheel", handleSmoothWheelZoom, {
    capture: true,
    passive: false
  });
  renderer.domElement.addEventListener("contextmenu", cycleTemplateColor);
  window.addEventListener("pointerup", startCameraSnap);
  updateResponsiveCameraFrame(true);

  previousButton.addEventListener("click", () => {
    applyRelativeCard(-1);
  });

  nextButton.addEventListener("click", () => {
    applyRelativeCard(1);
  });

  shuffleButton.addEventListener("click", () => {
    applyRandomCard({ rememberCurrent: true });
  });
  shuffleButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    applyPreviousShuffleCard();
  });

  detailsButton.addEventListener("click", () => {
    const isOpen = table.classList.toggle("details-open");
    detailsButton.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) hideArtMagnifier();
    requestAnimationFrame(() => {
      updateResponsiveCameraFrame();
      renderSceneOnce();
    });
  });

  favoriteButton.addEventListener("click", toggleCurrentFavorite);
  galleryToggleButton.addEventListener("click", toggleGalleryMode);
  favoriteFilterButton.addEventListener("click", toggleFavoriteGalleryFilter);
  binderToggle.addEventListener("change", toggleBinderMode);
  binderZoomOutButton.addEventListener("click", clearBinderFocus);
  binderPreviousPageButton.addEventListener("click", () => turnBinderPage(-1));
  binderNextPageButton.addEventListener("click", () => turnBinderPage(1));
  binderOpenCardButton.addEventListener("click", openFocusedBinderCard);
  binderFavoriteButton.addEventListener("click", toggleFocusedBinderFavorite);
  binderShuffleButton.addEventListener("click", shuffleBinderSpread);
  binderShuffleButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    applyPreviousBinderSpread();
  });
  galleryGrid.addEventListener("click", selectGalleryCard);
  initBinderControls();
  initBinderColorFilters();

  fullArtImage.addEventListener("mouseenter", showArtMagnifier);
  fullArtImage.addEventListener("mousemove", updateArtMagnifier);
  fullArtImage.addEventListener("mouseleave", hideArtMagnifier);
  if (hoverMagnifierQuery.addEventListener) {
    hoverMagnifierQuery.addEventListener("change", hideArtMagnifier);
  } else {
    hoverMagnifierQuery.addListener(hideArtMagnifier);
  }

  initThemeToggle();
  initUploadControls();
}

function initFixedViewportInsets() {
  updateFixedViewportInsets();
  window.addEventListener("resize", updateFixedViewportInsets);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateFixedViewportInsets);
    window.visualViewport.addEventListener("scroll", updateFixedViewportInsets);
  }
}

function updateFixedViewportInsets() {
  const root = document.documentElement;
  const cornerInset = parseFloat(
    getComputedStyle(root).getPropertyValue("--corner-inset")
  ) || 0;
  const viewport = window.visualViewport;

  if (!viewport) {
    root.style.removeProperty("--visual-right-inset");
    root.style.removeProperty("--visual-bottom-inset");
    return;
  }

  const rightInset = Math.max(
    cornerInset,
    window.innerWidth - viewport.width - viewport.offsetLeft + cornerInset
  );
  const bottomInset = Math.max(
    cornerInset,
    window.innerHeight - viewport.height - viewport.offsetTop + cornerInset
  );

  root.style.setProperty("--visual-right-inset", `${rightInset}px`);
  root.style.setProperty("--visual-bottom-inset", `${bottomInset}px`);
}

function initThemeToggle() {
  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("light-theme", themeToggle.checked);
  });
}

function toggleGalleryMode() {
  resetViewSwitchWheelDistances();
  if (isGalleryOpen) {
    closeGalleryMode();
  } else {
    openGalleryMode();
  }
}

function openGalleryMode() {
  resetViewSwitchWheelDistances();
  isGalleryOpen = true;
  clearBinderFocus({ silent: true });
  snapBinderToWholePage();
  document.body.classList.add("gallery-open");
  table.classList.remove("details-open");
  detailsButton.setAttribute("aria-expanded", "false");
  galleryToggleButton.classList.add("is-active");
  galleryToggleButton.setAttribute("aria-pressed", "true");
  galleryPanel.hidden = false;
  hideArtMagnifier();
  updateBinderModeControls();
  renderGallery();
}

function closeGalleryMode() {
  resetViewSwitchWheelDistances();
  isGalleryOpen = false;
  clearBinderFocus({ silent: true });
  snapBinderToWholePage();
  stopBinderRenderLoop();
  document.body.classList.remove("gallery-open");
  document.body.classList.remove("binder-mode");
  galleryToggleButton.classList.remove("is-active");
  galleryToggleButton.setAttribute("aria-pressed", "false");
  galleryPanel.hidden = true;
  galleryFavoritesOnly = false;
  updateBinderModeControls();
  updateFavoriteFilterButton();
  requestAnimationFrame(() => {
    updateResponsiveCameraFrame();
    renderSceneOnce();
  });
}

function toggleCurrentFavorite() {
  if (currentArtIndex === -1) return;

  const key = favoriteKeyForIndex(currentArtIndex);
  if (favoriteKeys.has(key)) {
    favoriteKeys.delete(key);
  } else {
    favoriteKeys.add(key);
  }

  saveFavoriteKeys();
  updateFavoriteControls();
  renderGallery();
}

function toggleFocusedBinderFavorite() {
  const artIndex = getFocusedBinderArtIndex();
  if (!Number.isInteger(artIndex)) return;

  const key = favoriteKeyForIndex(artIndex);
  if (favoriteKeys.has(key)) {
    favoriteKeys.delete(key);
  } else {
    favoriteKeys.add(key);
  }

  saveFavoriteKeys();
  updateFavoriteControls();
  updateBinderFavoriteButton();
  renderGallery();
}

function toggleFavoriteGalleryFilter() {
  galleryFavoritesOnly = !galleryFavoritesOnly;
  updateFavoriteFilterButton();
  renderGallery();
}

function toggleBinderMode() {
  if (!binderToggle.checked) {
    clearBinderFocus({ silent: true });
    snapBinderToWholePage();
  }
  isBinderMode = binderToggle.checked;
  updateBinderModeControls();
  renderGallery();
}

function updateBinderModeControls() {
  binderToggle.checked = isBinderMode;
  document.body.classList.toggle("binder-mode", isGalleryOpen && isBinderMode);
  if (binderColorFilters) {
    binderColorFilters.hidden = !(isGalleryOpen && isBinderMode);
  }
}

function initBinderColorFilters() {
  updateBinderColorFilterButtons();
  for (const button of binderColorFilterButtons) {
    button.addEventListener("click", () => toggleBinderColorFilter(button.dataset.cardColor));
  }
}

function toggleBinderColorFilter(colorName) {
  if (!CARD_COLOR_FILTERS.some((color) => color.name === colorName)) return;

  if (binderSelectedColorFilters.has(colorName)) {
    binderSelectedColorFilters.delete(colorName);
  } else {
    binderSelectedColorFilters.add(colorName);
  }

  clearBinderFocus({ silent: true });
  binderTargetTurn = 0;
  binderTurn = 0;
  updateBinderColorFilterButtons();
  renderGallery();
}

function updateBinderColorFilterButtons() {
  for (const button of binderColorFilterButtons) {
    const isSelected = binderSelectedColorFilters.has(button.dataset.cardColor);
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  }
}

function updateFavoriteControls() {
  const isFavorite = currentArtIndex !== -1
    && favoriteKeys.has(favoriteKeyForIndex(currentArtIndex));

  favoriteButton.classList.toggle("is-active", isFavorite);
  favoriteButton.setAttribute("aria-pressed", String(isFavorite));
}

function updateBinderFavoriteButton() {
  if (!binderFavoriteButton) return;

  const artIndex = getFocusedBinderArtIndex();
  const isFavorite = Number.isInteger(artIndex)
    && favoriteKeys.has(favoriteKeyForIndex(artIndex));

  binderFavoriteButton.classList.toggle("is-active", isFavorite);
  binderFavoriteButton.setAttribute("aria-pressed", String(isFavorite));
  binderFavoriteButton.setAttribute(
    "title",
    isFavorite ? "Remove focused card from favorites" : "Add focused card to favorites"
  );
  binderFavoriteButton.setAttribute(
    "aria-label",
    isFavorite ? "Remove focused card from favorites" : "Add focused card to favorites"
  );
}

function updateFavoriteFilterButton() {
  favoriteFilterButton.classList.toggle("is-active", galleryFavoritesOnly);
  favoriteFilterButton.setAttribute("aria-pressed", String(galleryFavoritesOnly));
  favoriteFilterButton.setAttribute(
    "title",
    galleryFavoritesOnly ? "Show all cards" : "Show favorites"
  );
  favoriteFilterButton.setAttribute(
    "aria-label",
    galleryFavoritesOnly ? "Show all cards" : "Show favorites"
  );
}

function renderGallery() {
  if (!galleryPanel || galleryPanel.hidden) return;

  const indexes = getGalleryIndexes();
  updateGalleryEmptyMessage();

  if (isBinderMode) {
    galleryGrid.replaceChildren();
    galleryGrid.hidden = true;
    binderPanel.hidden = indexes.length === 0;
    binderPageControls.hidden = indexes.length === 0;
    galleryEmpty.hidden = indexes.length > 0;
    if (indexes.length > 0) {
      updateBinderItems(indexes);
      startBinderRenderLoop();
    } else {
      stopBinderRenderLoop();
    }
    return;
  }

  clearBinderFocus({ silent: true });
  snapBinderToWholePage();
  stopBinderRenderLoop();
  binderPanel.hidden = true;
  binderPageControls.hidden = true;
  galleryGrid.replaceChildren(...indexes.map(createGalleryItem));
  galleryGrid.hidden = indexes.length === 0;
  galleryEmpty.hidden = indexes.length > 0;
}

function getGalleryIndexes() {
  const indexes = authorOrder.filter((index) => (
    !galleryFavoritesOnly || favoriteKeys.has(favoriteKeyForIndex(index))
  ));
  if (!isBinderMode || binderSelectedColorFilters.size === 0) return indexes;

  return getBinderColorFilteredIndexes(indexes);
}

function getBinderColorFilteredIndexes(indexes) {
  return CARD_COLOR_FILTERS
    .filter((color) => binderSelectedColorFilters.has(color.name))
    .flatMap((color) => indexes.filter((index) => (
      getCardColorNameForArt(index) === color.name
    )));
}

function updateGalleryEmptyMessage() {
  if (!galleryEmpty) return;
  if (galleryFavoritesOnly) {
    galleryEmpty.textContent = "No favorites yet";
  } else if (isBinderMode && binderSelectedColorFilters.size > 0) {
    galleryEmpty.textContent = "No cards in selected colors";
  } else {
    galleryEmpty.textContent = "No cards yet";
  }
}

function createGalleryItem(artIndex) {
  const item = artItems[artIndex];
  const button = document.createElement("button");
  button.className = "gallery-item";
  button.type = "button";
  button.dataset.artIndex = String(artIndex);
  button.setAttribute("aria-label", `Open ${item.title}`);
  button.classList.toggle("is-favorite", favoriteKeys.has(favoriteKeyForIndex(artIndex)));

  const image = document.createElement("img");
  image.src = item.cropUrl;
  image.alt = item.title;
  image.loading = "lazy";
  image.decoding = "async";

  const label = document.createElement("span");
  label.className = "gallery-item__name";
  label.textContent = formatDisplayFileName(item.fullFile);

  button.append(image, label);
  return button;
}

async function selectGalleryCard(event) {
  const itemButton = event.target.closest(".gallery-item");
  if (!itemButton) return;

  const artIndex = Number(itemButton.dataset.artIndex);
  if (!Number.isInteger(artIndex)) return;

  closeGalleryMode();
  await applyCardByIndex(artIndex, currentTemplateFile || randomEntry(TEMPLATE_FILES));
}

function favoriteKeyForIndex(index) {
  const item = artItems[index];
  return item?.favoriteKey || `${item?.cropFile || ""}:${item?.fullFile || ""}`;
}

function loadFavoriteKeys() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter((key) => typeof key === "string") : []);
  } catch {
    return new Set();
  }
}

function saveFavoriteKeys() {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteKeys]));
  } catch {
    // Ignore private browsing or storage quota failures; the session state still works.
  }
}

function loadTemplateOverrides() {
  try {
    const saved = JSON.parse(localStorage.getItem(TEMPLATE_OVERRIDES_STORAGE_KEY) || "{}");
    const entries = Array.isArray(saved)
      ? saved
      : Object.entries(saved && typeof saved === "object" ? saved : {});
    return new Map(entries.filter((entry) => (
      Array.isArray(entry)
      && typeof entry[0] === "string"
      && TEMPLATE_FILES.includes(entry[1])
    )));
  } catch {
    return new Map();
  }
}

function saveTemplateOverrides() {
  try {
    localStorage.setItem(
      TEMPLATE_OVERRIDES_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(templateOverrides))
    );
  } catch {
    // Keep the in-memory preference even if localStorage is unavailable.
  }
}

function getTemplateOverrideForIndex(index) {
  const templateFile = templateOverrides.get(favoriteKeyForIndex(index));
  return TEMPLATE_FILES.includes(templateFile) ? templateFile : null;
}

function getDefaultTemplateForIndex(index) {
  const templateFile = DEFAULT_TEMPLATE_OVERRIDES.get(favoriteKeyForIndex(index));
  return TEMPLATE_FILES.includes(templateFile) ? templateFile : null;
}

function setTemplateOverrideForIndex(index, templateFile) {
  if (!Number.isInteger(index) || !TEMPLATE_FILES.includes(templateFile)) return;
  templateOverrides.set(favoriteKeyForIndex(index), templateFile);
  saveTemplateOverrides();
}

function getTemplateForArt(index, fallbackTemplate = null) {
  return getTemplateOverrideForIndex(index)
    || getDefaultTemplateForIndex(index)
    || (TEMPLATE_FILES.includes(fallbackTemplate) ? fallbackTemplate : getHashedTemplateForIndex(index));
}

function getNextTemplateForArt(index, currentTemplate = null) {
  const templateFile = currentTemplate || getTemplateForArt(index, TEMPLATE_FILES[0]);
  const currentTemplateIndex = TEMPLATE_FILES.indexOf(templateFile);
  return TEMPLATE_FILES[modulo(currentTemplateIndex + 1, TEMPLATE_FILES.length)];
}

function refreshBinderTemplates() {
  if (!isGalleryOpen || !isBinderMode) return;
  renderGallery();
}

function initBinderControls() {
  new ResizeObserver(queueResizeBinderRenderer).observe(binderPanel);
  binderCanvas.addEventListener("pointerdown", startBinderDrag);
  binderCanvas.addEventListener("pointermove", updateBinderDrag);
  binderCanvas.addEventListener("pointerup", endBinderDrag);
  binderCanvas.addEventListener("pointercancel", cancelBinderDrag);
  binderCanvas.addEventListener("wheel", handleBinderWheel, { passive: false });
  binderCanvas.addEventListener("dblclick", openFocusedBinderCardFromPointer);
  binderCanvas.addEventListener("contextmenu", cycleBinderTemplateColor);
}

function startBinderRenderLoop() {
  if (!isGalleryOpen || !isBinderMode || binderPanel.hidden) {
    return;
  }

  if (binderRenderFrame) {
    cancelAnimationFrame(binderRenderFrame);
    binderRenderFrame = 0;
  }

  if (binderAnimationFrame) {
    cancelAnimationFrame(binderAnimationFrame);
    binderAnimationFrame = 0;
  }

  const renderFrame = () => {
    if (!isGalleryOpen || !isBinderMode || binderPanel.hidden) {
      binderAnimationFrame = 0;
      return;
    }
    const keepAnimating = updateBinderAnimation();
    binderAnimationFrame = keepAnimating ? requestAnimationFrame(renderFrame) : 0;
  };

  binderAnimationFrame = requestAnimationFrame(renderFrame);
}

function stopBinderRenderLoop() {
  if (!binderAnimationFrame) return;
  cancelAnimationFrame(binderAnimationFrame);
  binderAnimationFrame = 0;
}

function ensureBinderScene() {
  if (binderRenderer) return;

  binderRenderer = new THREE.WebGLRenderer({
    canvas: binderCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  binderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  binderRenderer.outputColorSpace = THREE.SRGBColorSpace;
  binderRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  binderRenderer.toneMappingExposure = 0.96;

  binderScene = new THREE.Scene();
  binderCamera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  binderCamera.up.set(0, 1, 0);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x15110d, 1.38);
  binderScene.add(ambient);

  const key = new THREE.DirectionalLight(0xffefd1, 2.15);
  key.position.set(2.6, 4.3, 7.4);
  binderScene.add(key);

  const rim = new THREE.DirectionalLight(0x9ebfc6, 1.1);
  rim.position.set(-4.6, 2.1, 3.8);
  binderScene.add(rim);

  binderRoot = new THREE.Group();
  binderRoot.rotation.x = 0;
  binderRoot.position.y = 0.84;
  binderScene.add(binderRoot);

  resizeBinderRenderer();
}

async function updateBinderItems(indexes) {
  ensureBinderScene();
  resizeBinderRenderer();

  const focusedArtIndex = getFocusedBinderArtIndex();
  binderVisibleIndexes = indexes.slice();
  if (Number.isInteger(focusedArtIndex)) {
    const nextFocusPosition = binderVisibleIndexes.indexOf(focusedArtIndex);
    if (nextFocusPosition === -1) {
      clearBinderFocus({ silent: true });
    } else {
      binderFocusPosition = nextFocusPosition;
      binderTargetTurn = getBinderTurnForPosition(binderFocusPosition);
    }
  } else if (binderFocusPosition >= binderVisibleIndexes.length) {
    clearBinderFocus({ silent: true });
  }

  const nextKey = indexes
    .map((index) => `${favoriteKeyForIndex(index)}:${templateForBinderCard(index)}`)
    .join("\u001f");
  if (nextKey === binderIndexesKey) {
    updateBinderPageControls();
    return;
  }

  const token = ++binderBuildToken;
  binderIndexesKey = nextKey;
  binderLoading.hidden = false;
  if (!binderPages.length) {
    clearBinderRoot();
    binderRoot.add(createBinderShell());
    renderBinderSceneOnce();
  }

  try {
    const backTexture = await getBinderBackTexture();
    if (token !== binderBuildToken) return;

    clearBinderRoot();
    binderRoot.add(createBinderModel(indexes, getBinderPlaceholderTexture(), backTexture));
    binderPageCount = Math.max(1, Math.ceil(indexes.length / BINDER_PAGE_SLOTS));
    if (isBinderFocused()) {
      binderTargetTurn = getBinderTurnForPosition(binderFocusPosition);
    }
    binderTargetTurn = clamp(binderTargetTurn, 0, binderPageCount);
    binderTurn = clamp(binderTurn, 0, binderPageCount);
    binderLoading.hidden = true;
    updateBinderPageControls();
    resizeBinderRenderer();
    renderBinderSceneOnce();
    loadBinderCardTexturesProgressively(indexes, token);
  } catch (error) {
    console.error(error);
    if (token === binderBuildToken) {
      binderIndexesKey = "";
      binderLoading.hidden = true;
    }
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(1, limit), items.length);

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }));

  return results;
}

async function loadBinderCardTexturesProgressively(indexes, token) {
  const loadOrder = getBinderTextureLoadOrder(indexes);
  try {
    await mapWithConcurrency(loadOrder, BINDER_TEXTURE_CONCURRENCY, async (artIndex) => {
      const texture = await getBinderCardTexture(artIndex);
      if (token !== binderBuildToken) return;
      if (applyBinderTextureToCards(artIndex, texture)) {
        requestBinderRenderOnce();
      }
    });
  } catch (error) {
    if (token === binderBuildToken) {
      console.error(error);
    }
  }
}

function getBinderTextureLoadOrder(indexes) {
  const pageCount = Math.max(1, Math.ceil(indexes.length / BINDER_PAGE_SLOTS));
  const currentTurn = clamp(Math.round(binderTargetTurn), 0, pageCount);
  const centerPage = clamp(currentTurn >= pageCount ? pageCount - 1 : currentTurn, 0, pageCount - 1);
  const seenPages = new Set();
  const positions = [];

  const addPage = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= pageCount || seenPages.has(pageIndex)) return;
    seenPages.add(pageIndex);
    const start = pageIndex * BINDER_PAGE_SLOTS;
    const end = Math.min(start + BINDER_PAGE_SLOTS, indexes.length);
    for (let position = start; position < end; position += 1) {
      positions.push(position);
    }
  };

  if (currentTurn <= 0) {
    addPage(0);
  } else if (currentTurn >= pageCount) {
    addPage(pageCount - 1);
  } else {
    addPage(currentTurn - 1);
    addPage(currentTurn);
  }

  for (let distance = 0; seenPages.size < pageCount && distance <= pageCount; distance += 1) {
    addPage(centerPage + distance);
    addPage(centerPage - distance);
  }

  const seenArt = new Set();
  const ordered = [];
  for (const position of positions) {
    const artIndex = indexes[position];
    if (!Number.isInteger(artIndex) || seenArt.has(artIndex)) continue;
    seenArt.add(artIndex);
    ordered.push(artIndex);
  }
  return ordered;
}

function applyBinderTextureToCards(artIndex, texture) {
  let applied = false;
  for (const card of binderCardMeshes) {
    if (card.userData.artIndex !== artIndex) continue;
    card.material.map = texture;
    card.material.needsUpdate = true;
    applied = true;
  }
  return applied;
}

function clearBinderRoot() {
  if (!binderRoot) return;

  for (const child of binderRoot.children) {
    disposeBinderObject(child);
  }
  binderRoot.clear();
  binderPages = [];
  binderCardMeshes = [];
}

function disposeBinderObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    if (child.geometry && !child.geometry.userData?.sharedBinderGeometry) {
      child.geometry.dispose();
    }
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (material) material.dispose();
    }
  });
}

function createBinderModel(indexes, placeholderTexture, backTexture) {
  const model = new THREE.Group();
  model.add(createBinderShell());

  const materials = createBinderPageMaterials();
  const pageCount = Math.max(1, Math.ceil(indexes.length / BINDER_PAGE_SLOTS));
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const page = createBinderPage(pageIndex, indexes, placeholderTexture, backTexture, materials);
    model.add(page.group);
    binderPages.push(page);
  }

  updateBinderPageTransforms();
  return model;
}

function createBinderShell() {
  const shell = new THREE.Group();
  const coverMaterial = createBinderCoverMaterial();
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x171615,
    roughness: 0.28,
    metalness: 0.68,
    clearcoat: 0.34,
    clearcoatRoughness: 0.22
  });
  const coverWidth = BINDER_PAGE_WIDTH + BINDER_COVER_OVERHANG * 2;
  const coverHeight = BINDER_PAGE_HEIGHT + BINDER_COVER_VERTICAL_OVERHANG;
  const spineHeight = coverHeight - 0.26;
  const coverZ = -0.34;
  const backCoverGeometry = createRoundedCoreGeometry(
    coverWidth,
    coverHeight,
    0.14,
    BINDER_COVER_RADIUS
  );
  const frontCoverGeometry = createRoundedCoreGeometry(
    coverWidth,
    coverHeight,
    0.12,
    BINDER_COVER_RADIUS
  );

  const leftCover = new THREE.Mesh(
    backCoverGeometry,
    coverMaterial
  );
  leftCover.position.set(-BINDER_PAGE_WIDTH / 2 - BINDER_COVER_OVERHANG * 0.42, 0, coverZ);
  shell.add(leftCover);

  const rightCover = new THREE.Mesh(
    backCoverGeometry.clone(),
    coverMaterial.clone()
  );
  rightCover.position.set(BINDER_PAGE_WIDTH / 2 + BINDER_COVER_OVERHANG * 0.42, 0, coverZ);
  shell.add(rightCover);

  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, spineHeight, 0.36, 1, 1, 2),
    coverMaterial.clone()
  );
  spine.position.set(0, 0, coverZ + 0.04);
  shell.add(spine);

  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, 0, -0.12);
  frontPivot.rotation.y = -2.78;
  const frontCover = new THREE.Mesh(
    frontCoverGeometry,
    coverMaterial.clone()
  );
  frontCover.position.x = -coverWidth / 2;
  frontPivot.add(frontCover);
  shell.add(frontPivot);

  const seamMaterial = new THREE.MeshBasicMaterial({
    color: 0x050505,
    depthWrite: true,
    depthTest: true
  });
  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, spineHeight * 0.94, 0.012),
    seamMaterial
  );
  seam.position.set(0, 0, 0.075);
  shell.add(seam);

  for (const y of [-BINDER_PAGE_HEIGHT * 0.32, 0, BINDER_PAGE_HEIGHT * 0.32]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 12, 46), ringMaterial);
    ring.position.set(0, y, 0.065);
    ring.rotation.x = Math.PI / 2;
    ring.scale.x = 0.52;
    shell.add(ring);
  }

  return shell;
}

function createBinderPageMaterials() {
  const plastic = new THREE.MeshBasicMaterial({
    color: 0xdceefa,
    transparent: true,
    opacity: BINDER_PLASTIC_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true
  });
  plastic.forceSinglePass = true;

  const seam = new THREE.MeshBasicMaterial({
    color: 0x111615,
    transparent: true,
    opacity: BINDER_SEAM_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true
  });
  seam.forceSinglePass = true;

  return {
    plastic,
    seam
  };
}

function createBinderPage(pageIndex, indexes, placeholderTexture, backTexture, materials) {
  const group = new THREE.Group();
  group.position.set(0, 0, -pageIndex * BINDER_PAGE_STACK_GAP);
  group.userData.pageIndex = pageIndex;

  const cells = [];
  const cardMeshes = [];
  const columnPivots = createBinderColumnPivots(group);
  for (let row = 0; row < BINDER_ROWS; row += 1) {
    for (let column = 0; column < BINDER_COLUMNS; column += 1) {
      const frontSlot = row * BINDER_COLUMNS + column;
      const backSlot = getBackSideSlot(row, column);
      const cell = createBinderCell(row, column);
      const frontOffset = pageIndex * BINDER_PAGE_SLOTS + frontSlot;
      const backOffset = pageIndex * BINDER_PAGE_SLOTS + BINDER_SIDE_SLOTS + backSlot;
      const frontArtIndex = indexes[frontOffset];
      const backArtIndex = indexes[backOffset];
      const hasFrontCard = Number.isInteger(frontArtIndex);
      const hasBackCard = Number.isInteger(backArtIndex);

      if (hasFrontCard) {
        const card = createBinderCard(placeholderTexture, frontArtIndex, 1, frontOffset);
        cell.group.add(card);
        cardMeshes.push(card);
      }

      if (hasBackCard) {
        const card = createBinderCard(placeholderTexture, backArtIndex, -1, backOffset);
        cell.group.add(card);
        cardMeshes.push(card);
      } else if (hasFrontCard) {
        const card = createBinderCard(backTexture, null, -1);
        cell.group.add(card);
        cardMeshes.push(card);
      }

      addBinderCellToColumn(columnPivots, cell);
      cells.push(cell);
    }
  }

  addBinderPageSheets(group, columnPivots, materials);
  addBinderPageSeams(group, columnPivots, materials.seam);
  return {
    group,
    cells,
    cardMeshes,
    columnPivots,
    pageIndex,
    sheetMeshes: collectBinderSheetMeshes(group)
  };
}

function createBinderColumnPivots(group) {
  const middleCreaseX = getBinderColumnCreaseX(1);
  const outerCreaseX = getBinderColumnCreaseX(2);
  const middlePivot = new THREE.Group();
  const outerPivot = new THREE.Group();

  middlePivot.position.set(middleCreaseX, 0, 0);
  outerPivot.position.set(outerCreaseX - middleCreaseX, 0, 0);
  middlePivot.add(outerPivot);
  group.add(middlePivot);

  return [
    { group, anchorX: 0 },
    { group: middlePivot, anchorX: middleCreaseX },
    { group: outerPivot, anchorX: outerCreaseX }
  ];
}

function getBinderColumnCreaseX(column) {
  return BINDER_PAGE_INNER_MARGIN
    + column * BINDER_CELL_WIDTH
    + (column - 0.5) * BINDER_GRID_GAP;
}

function addBinderCellToColumn(columnPivots, cell) {
  const columnPivot = columnPivots[cell.column] || columnPivots[0];
  cell.group.position.x -= columnPivot.anchorX;
  columnPivot.group.add(cell.group);
}

function getBackSideSlot(row, column) {
  return row * BINDER_COLUMNS + (BINDER_COLUMNS - 1 - column);
}

function createBinderCell(row, column) {
  const group = new THREE.Group();
  const x = BINDER_PAGE_INNER_MARGIN
    + column * (BINDER_CELL_WIDTH + BINDER_GRID_GAP)
    + BINDER_CELL_WIDTH / 2;
  const y = BINDER_PAGE_HEIGHT / 2
    - BINDER_PAGE_VERTICAL_MARGIN
    - row * (BINDER_CELL_HEIGHT + BINDER_GRID_GAP)
    - BINDER_CELL_HEIGHT / 2;

  group.position.set(x, y, 0);

  return { group, row, column };
}

function addBinderPageSheets(group, columnPivots, materials) {
  const frostMaterial = new THREE.MeshBasicMaterial({
    color: 0xf4f8f4,
    map: createBinderSleeveFrostTexture(),
    transparent: true,
    opacity: BINDER_FROST_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true
  });
  frostMaterial.forceSinglePass = true;

  const glossMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: BINDER_GLOSS_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true
  });
  glossMaterial.forceSinglePass = true;

  for (let column = 0; column < BINDER_COLUMNS; column += 1) {
    const columnPivot = columnPivots[column] || columnPivots[0];
    const x = getBinderColumnSheetCenterX(column) - columnPivot.anchorX;

    const plasticMaterial = materials.plastic.clone();
    plasticMaterial.opacity = BINDER_PLASTIC_REST_OPACITY;
    const sheet = new THREE.Mesh(getBinderColumnSheetGeometry(), plasticMaterial);
    sheet.position.set(x, 0, 0.018);
    sheet.renderOrder = 5;
    markBinderSheetLayer(sheet, BINDER_PLASTIC_REST_OPACITY, BINDER_PLASTIC_ACTIVE_OPACITY);
    columnPivot.group.add(sheet);

    const frost = new THREE.Mesh(getBinderColumnSheetGeometry(), frostMaterial.clone());
    frost.position.set(x, 0, 0.049);
    frost.renderOrder = 17;
    markBinderSheetLayer(frost, BINDER_FROST_REST_OPACITY, BINDER_FROST_ACTIVE_OPACITY);
    columnPivot.group.add(frost);

    const gloss = new THREE.Mesh(getBinderColumnGlossGeometry(), glossMaterial.clone());
    gloss.position.set(x, 0, 0.052);
    gloss.renderOrder = 18;
    markBinderSheetLayer(gloss, BINDER_GLOSS_REST_OPACITY, BINDER_GLOSS_ACTIVE_OPACITY);
    columnPivot.group.add(gloss);
  }
}

function getBinderColumnSheetCenterX(column) {
  return BINDER_PAGE_INNER_MARGIN
    + column * (BINDER_CELL_WIDTH + BINDER_GRID_GAP)
    + BINDER_CELL_WIDTH / 2;
}

function getBinderCardGeometry() {
  if (!binderCardGeometry) {
    binderCardGeometry = createRoundedPlaneGeometry(
      BINDER_CARD_WIDTH,
      BINDER_CARD_HEIGHT,
      BINDER_CARD_RADIUS
    );
    binderCardGeometry.userData.sharedBinderGeometry = true;
  }
  return binderCardGeometry;
}

function getBinderColumnSheetGeometry() {
  if (!binderColumnSheetGeometry) {
    binderColumnSheetGeometry = new THREE.PlaneGeometry(
      BINDER_CELL_WIDTH,
      getBinderColumnSheetHeight(),
      1,
      1
    );
    binderColumnSheetGeometry.userData.sharedBinderGeometry = true;
  }
  return binderColumnSheetGeometry;
}

function getBinderColumnGlossGeometry() {
  if (!binderColumnGlossGeometry) {
    binderColumnGlossGeometry = new THREE.PlaneGeometry(
      BINDER_CELL_WIDTH * 0.92,
      getBinderColumnSheetHeight() * 0.95,
      1,
      1
    );
    binderColumnGlossGeometry.userData.sharedBinderGeometry = true;
  }
  return binderColumnGlossGeometry;
}

function getBinderVerticalSeamGeometry() {
  if (!binderVerticalSeamGeometry) {
    binderVerticalSeamGeometry = new THREE.PlaneGeometry(
      0.014,
      BINDER_PAGE_HEIGHT - BINDER_PAGE_VERTICAL_MARGIN * 1.4,
      1,
      1
    );
    binderVerticalSeamGeometry.userData.sharedBinderGeometry = true;
  }
  return binderVerticalSeamGeometry;
}

function getBinderHorizontalSeamGeometry() {
  if (!binderHorizontalSeamGeometry) {
    binderHorizontalSeamGeometry = new THREE.PlaneGeometry(BINDER_CELL_WIDTH, 0.014, 1, 1);
    binderHorizontalSeamGeometry.userData.sharedBinderGeometry = true;
  }
  return binderHorizontalSeamGeometry;
}

function getBinderColumnSheetHeight() {
  return BINDER_ROWS * BINDER_CELL_HEIGHT + (BINDER_ROWS - 1) * BINDER_GRID_GAP;
}

function addBinderPageSeams(group, columnPivots, seamMaterial) {
  for (let column = 1; column < BINDER_COLUMNS; column += 1) {
    const columnPivot = columnPivots[column];
    const material = seamMaterial.clone();
    material.opacity = BINDER_SEAM_REST_OPACITY;
    const seam = new THREE.Mesh(getBinderVerticalSeamGeometry(), material);
    seam.position.set(0, 0, 0.006);
    seam.renderOrder = 20;
    markBinderSheetLayer(seam, BINDER_SEAM_REST_OPACITY, BINDER_SEAM_ACTIVE_OPACITY);
    columnPivot.group.add(seam);
  }

  for (let row = 1; row < BINDER_ROWS; row += 1) {
    const y = BINDER_PAGE_HEIGHT / 2
      - BINDER_PAGE_VERTICAL_MARGIN
      - row * BINDER_CELL_HEIGHT
      - (row - 0.5) * BINDER_GRID_GAP;

    for (let column = 0; column < BINDER_COLUMNS; column += 1) {
      const columnPivot = columnPivots[column] || columnPivots[0];
      const material = seamMaterial.clone();
      material.opacity = BINDER_SEAM_REST_OPACITY;
      const seam = new THREE.Mesh(getBinderHorizontalSeamGeometry(), material);
      seam.position.set(
        BINDER_PAGE_INNER_MARGIN
          + column * (BINDER_CELL_WIDTH + BINDER_GRID_GAP)
          + BINDER_CELL_WIDTH / 2
          - columnPivot.anchorX,
        y,
        0.006
      );
      seam.renderOrder = 20;
      markBinderSheetLayer(seam, BINDER_SEAM_REST_OPACITY, BINDER_SEAM_ACTIVE_OPACITY);
      columnPivot.group.add(seam);
    }
  }
}

function markBinderSheetLayer(mesh, restOpacity, activeOpacity) {
  mesh.userData.binderSheetLayer = true;
  mesh.userData.restOpacity = restOpacity;
  mesh.userData.activeOpacity = activeOpacity;
}

function collectBinderSheetMeshes(group) {
  const sheetMeshes = [];
  group.traverse((child) => {
    if (child.isMesh && child.userData.binderSheetLayer) {
      sheetMeshes.push(child);
    }
  });
  return sheetMeshes;
}

function createBinderCard(texture, artIndex, side, binderPosition = -1) {
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.62,
    roughnessMap: createPaperRoughnessTexture(),
    metalness: 0.01,
    clearcoat: 0.2,
    clearcoatRoughness: 0.52,
    transparent: true,
    opacity: 1,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide
  });
  const card = new THREE.Mesh(
    getBinderCardGeometry(),
    material
  );

  card.position.z = side * BINDER_CARD_LIFT;
  if (side < 0) card.rotation.y = Math.PI;
  card.renderOrder = 12;
  if (Number.isInteger(artIndex)) {
    card.userData.artIndex = artIndex;
    card.userData.binderPosition = binderPosition;
    card.userData.binderCard = true;
    binderCardMeshes.push(card);
  }
  return card;
}

function createBinderCoverMaterial() {
  const map = createBinderCoverTexture();
  return new THREE.MeshStandardMaterial({
    color: 0x11100d,
    map,
    roughness: 0.9,
    metalness: 0.015,
    emissive: 0x040302,
    emissiveIntensity: 0.28
  });
}

function createBinderCoverTexture() {
  if (binderCoverTexture) return binderCoverTexture;

  const size = 256;
  const surface = document.createElement("canvas");
  surface.width = size;
  surface.height = size;
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(size, size);
  let seed = 0x8d4f3b21;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const index = (y * size + x) * 4;
      const grain = (seed >>> 24) % 34;
      const weave = ((x % 9 === 0 || y % 11 === 0) ? 10 : 0);
      const value = 14 + grain + weave;
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 3.2);
  texture.needsUpdate = true;
  binderCoverTexture = texture;
  return binderCoverTexture;
}

function createBinderSleeveFrostTexture() {
  if (binderSleeveFrostTexture) return binderSleeveFrostTexture;

  const size = 192;
  const surface = document.createElement("canvas");
  surface.width = size;
  surface.height = size;
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(size, size);
  let seed = 0xa5847c31;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const index = (y * size + x) * 4;
      const cloudy = 218 + ((seed >>> 24) % 34);
      imageData.data[index] = cloudy;
      imageData.data[index + 1] = cloudy;
      imageData.data[index + 2] = cloudy;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.8, 3.6);
  texture.needsUpdate = true;
  binderSleeveFrostTexture = texture;
  return binderSleeveFrostTexture;
}

async function getBinderCardTexture(artIndex) {
  const templateFile = templateForBinderCard(artIndex);
  const key = `${favoriteKeyForIndex(artIndex)}|${templateFile}|binder`;
  if (binderCardTextureCache.has(key)) return binderCardTextureCache.get(key);

  const promise = createFrontTexture(artItems[artIndex], templateFile, {
    width: BINDER_FACE_WIDTH,
    height: BINDER_FACE_HEIGHT,
    renderer: binderRenderer,
    maxAnisotropy: 4
  }).catch((error) => {
    binderCardTextureCache.delete(key);
    throw error;
  });
  binderCardTextureCache.set(key, promise);
  return promise;
}

function getBinderBackTexture() {
  if (!binderBackTexturePromise) {
    binderBackTexturePromise = createBackTexture({
      width: BINDER_FACE_WIDTH,
      height: BINDER_FACE_HEIGHT,
      renderer: binderRenderer
    });
  }
  return binderBackTexturePromise;
}

function getBinderPlaceholderTexture() {
  if (binderPlaceholderTexture) return binderPlaceholderTexture;

  const surface = document.createElement("canvas");
  surface.width = BINDER_FACE_WIDTH;
  surface.height = BINDER_FACE_HEIGHT;
  const ctx = surface.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, surface.width, surface.height);
  gradient.addColorStop(0, "#1d1b16");
  gradient.addColorStop(0.52, "#25221b");
  gradient.addColorStop(1, "#14130f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, surface.width, surface.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
  for (let y = 0; y < surface.height; y += 3) {
    ctx.fillRect(0, y, surface.width, 1);
  }
  addPaperSurface(ctx, surface.width, surface.height);

  binderPlaceholderTexture = new THREE.CanvasTexture(surface);
  binderPlaceholderTexture.colorSpace = THREE.SRGBColorSpace;
  binderPlaceholderTexture.needsUpdate = true;
  return binderPlaceholderTexture;
}

function templateForBinderCard(artIndex) {
  return getTemplateOverrideForIndex(artIndex)
    || getDefaultTemplateForIndex(artIndex)
    || getHashedTemplateForIndex(artIndex);
}

function getHashedTemplateForIndex(artIndex) {
  const key = favoriteKeyForIndex(artIndex);
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  }
  return TEMPLATE_FILES[Math.abs(hash) % TEMPLATE_FILES.length];
}

function getCardColorNameForArt(artIndex) {
  return TEMPLATE_COLOR_NAMES.get(templateForBinderCard(artIndex)) || "";
}

function startBinderDrag(event) {
  if (!isGalleryOpen || !isBinderMode || binderPageCount < 1) return;

  ensureBinderScene();
  startBinderRenderLoop();
  binderCanvas.setPointerCapture(event.pointerId);
  binderDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    startTurn: binderTargetTurn,
    moved: false
  };
  binderWheelFocusLockUntil = 0;
  event.preventDefault();
}

function updateBinderDrag(event) {
  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;

  const rect = binderCanvas.getBoundingClientRect();
  const deltaX = event.clientX - binderDrag.startX;
  const deltaY = event.clientY - binderDrag.startY;
  binderDrag.lastX = event.clientX;
  binderDrag.moved = binderDrag.moved || Math.hypot(deltaX, deltaY) > 7;

  if (!isBinderFocused()) {
    const pageDelta = -(deltaX / Math.max(rect.width, 1)) / 0.26;
    binderTargetTurn = clamp(binderDrag.startTurn + pageDelta, 0, binderPageCount);
    if (Math.abs(pageDelta) > 0.002) binderBendDirection = Math.sign(pageDelta);
    binderTurn = binderTargetTurn;
    updateBinderPageTransforms();
    updateBinderPageControls();
    renderBinderSceneOnce();
  }
  event.preventDefault();
}

async function endBinderDrag(event) {
  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;

  const wasClick = !binderDrag.moved;
  binderDrag = null;
  if (binderCanvas.hasPointerCapture(event.pointerId)) {
    binderCanvas.releasePointerCapture(event.pointerId);
  }

  if (wasClick) {
    if (handleFocusedBinderCardTap(event)) return;
    selectBinderCard(event);
  } else if (!isBinderFocused()) {
    binderTargetTurn = Math.round(binderTargetTurn);
    updateBinderPageControls();
  }
}

function cancelBinderDrag(event) {
  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;
  binderDrag = null;
  if (!isBinderFocused()) binderTargetTurn = Math.round(binderTargetTurn);
  updateBinderPageControls();
}

function handleBinderWheel(event) {
  if (!isGalleryOpen || !isBinderMode || binderPageCount < 1) return;

  event.preventDefault();
  const wheelDelta = getDominantNormalizedWheelDelta(event);
  if (Math.abs(wheelDelta) < 0.5) return;

  const now = performance.now();
  if (now < binderWheelFocusLockUntil) return;

  if (isBinderFocused()) {
    if (wheelDelta < 0) {
      if (addBinderFocusWheelInDistance(-wheelDelta, now)) {
        binderWheelFocusLockUntil = now + BINDER_CARD_VIEW_TRANSITION_MS + 240;
        resetViewSwitchWheelDistances();
        openFocusedBinderCard().catch(console.error);
      }
      return;
    }

    resetBinderFocusWheelInDistance();
    if (binderCardViewTransitionActive || now < binderFocusZoomOutLockUntil) {
      return;
    }
    binderWheelFocusLockUntil = now + 700;
    clearBinderFocus();
    return;
  }

  resetBinderFocusWheelInDistance();
  if (wheelDelta >= 0) return;
  const hit = getBinderCardHit(event);
  if (!hit) return;

  binderWheelFocusLockUntil = now + 700;
  focusBinderCard(hit.object.userData.binderPosition);
}

function selectBinderCard(event) {
  const hit = getBinderCardHit(event);

  if (!hit) return false;

  const position = hit.object.userData.binderPosition;
  focusBinderCard(position);
  rememberBinderOpenTap(event, position);
  return true;
}

function handleFocusedBinderCardTap(event) {
  if (!isBinderFocused()) return false;

  const hit = getBinderCardHit(event);
  const position = hit?.object?.userData?.binderPosition;
  if (position !== binderFocusPosition) {
    binderLastOpenTap = null;
    return false;
  }

  const now = performance.now();
  const lastTap = binderLastOpenTap;
  rememberBinderOpenTap(event, position, now);

  if (
    lastTap
    && lastTap.position === position
    && now - lastTap.time <= BINDER_DOUBLE_TAP_MS
    && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) <= BINDER_DOUBLE_TAP_DISTANCE
  ) {
    binderLastOpenTap = null;
    openFocusedBinderCard().catch(console.error);
    return true;
  }

  return false;
}

function rememberBinderOpenTap(event, position, time = performance.now()) {
  binderLastOpenTap = {
    position,
    time,
    x: event.clientX,
    y: event.clientY
  };
}

function openFocusedBinderCardFromPointer(event) {
  if (!isBinderFocused() || binderCardViewTransitionActive) return;

  const hit = getBinderCardHit(event);
  if (hit?.object?.userData?.binderPosition !== binderFocusPosition) return;

  event.preventDefault();
  binderLastOpenTap = null;
  openFocusedBinderCard().catch(console.error);
}

function getBinderCardHit(event) {
  if (!binderCamera || !binderCardMeshes.length) return null;

  const rect = binderCanvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, binderCamera);
  return raycaster
    .intersectObjects(binderCardMeshes, false)
    .find((intersection) => (
      Number.isInteger(intersection.object.userData.artIndex)
      && isVisibleThroughParents(intersection.object)
      && isBinderCardOnCurrentPages(intersection.object)
    )) || null;
}

async function cycleBinderTemplateColor(event) {
  if (!isGalleryOpen || !isBinderMode || binderCardViewTransitionActive) return;

  const hit = getBinderCardHit(event);
  const mesh = hit?.object;
  const artIndex = mesh?.userData.artIndex;
  if (!Number.isInteger(artIndex)) return;

  event.preventDefault();
  const nextTemplateFile = getNextTemplateForArt(artIndex, templateForBinderCard(artIndex));
  setTemplateOverrideForIndex(artIndex, nextTemplateFile);

  if (currentArtIndex === artIndex) {
    await applyCardByIndex(artIndex, nextTemplateFile);
  }
  refreshBinderTemplates();
}

function isBinderCardOnCurrentPages(mesh) {
  const position = mesh?.userData?.binderPosition;
  if (!Number.isInteger(position) || position < 0) return false;

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  const isBackSide = sideSlot >= BINDER_SIDE_SLOTS;
  const turn = clamp(binderTurn, 0, binderPageCount);
  const lowerTurn = Math.floor(turn);
  const isTurning = turn - lowerTurn > 0.001 && lowerTurn < binderPageCount;

  if (isTurning && pageIndex === lowerTurn) return true;

  const currentPage = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  return (
    (pageIndex === currentPage - 1 && isBackSide)
    || (pageIndex === currentPage && !isBackSide)
  );
}

function isBinderFocused() {
  return binderFocusPosition >= 0 && binderFocusPosition < binderVisibleIndexes.length;
}

function getFocusedBinderArtIndex() {
  return isBinderFocused() ? binderVisibleIndexes[binderFocusPosition] : null;
}

function getBinderTurnForPosition(position) {
  if (!Number.isInteger(position) || position < 0) {
    return clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  }

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  return clamp(
    pageIndex + (sideSlot >= BINDER_SIDE_SLOTS ? 1 : 0),
    0,
    binderPageCount
  );
}

function focusBinderCard(position, { immediate = false } = {}) {
  if (!Number.isInteger(position) || position < 0 || position >= binderVisibleIndexes.length) {
    return;
  }

  const nextTurn = getBinderTurnForPosition(position);
  if (nextTurn !== binderTargetTurn) binderBendDirection = Math.sign(nextTurn - binderTargetTurn);
  binderFocusPosition = position;
  binderTargetTurn = nextTurn;
  if (immediate) binderTurn = binderTargetTurn;
  document.body.classList.add("binder-focused");
  binderPanel.classList.add("is-focused");
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function clearBinderFocus(options = {}) {
  binderFocusZoomOutLockUntil = 0;
  binderFocusPosition = -1;
  binderLastOpenTap = null;
  document.body.classList.remove("binder-focused");
  if (binderPanel) binderPanel.classList.remove("is-focused");
  binderTargetTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  if (options.silent) return;

  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function lockBinderFocusZoomOut(duration = BINDER_FOCUS_ZOOM_OUT_LOCK_MS) {
  binderFocusZoomOutLockUntil = Math.max(
    binderFocusZoomOutLockUntil,
    performance.now() + duration
  );
}

function moveBinderFocus(direction) {
  const nextPosition = clamp(
    binderFocusPosition + direction,
    0,
    Math.max(0, binderVisibleIndexes.length - 1)
  );
  if (nextPosition === binderFocusPosition) return;

  focusBinderCard(nextPosition);
}

async function openFocusedBinderCard() {
  if (binderCardViewTransitionActive) return;
  resetViewSwitchWheelDistances();

  const artIndex = getFocusedBinderArtIndex();
  if (!Number.isInteger(artIndex)) return;

  const focusedMesh = getBinderFocusedMesh();
  if (!focusedMesh) {
    closeGalleryMode();
    await applyCardByIndex(artIndex, templateForBinderCard(artIndex));
    return;
  }

  await transitionFocusedBinderCardToIndividual(artIndex, templateForBinderCard(artIndex), focusedMesh);
}

async function transitionIndividualCardToFocusedBinder() {
  if (binderCardViewTransitionActive || currentArtIndex === -1) return;

  const artIndex = currentArtIndex;
  lockBinderFocusZoomOut(BINDER_FOCUS_TRANSITION_LOCK_MS);
  const transitionCard = document.createElement("img");
  transitionCard.className = "binder-card-transition-card";
  transitionCard.alt = "";
  transitionCard.decoding = "async";
  transitionCard.src = getIndividualTransitionImageSource();

  const sourceRect = getIndividualCardScreenRect() || getIndividualCardTransitionRect();
  binderCardViewTransitionActive = true;
  document.body.classList.add(
    "binder-card-transitioning",
    "binder-card-transition-away",
    "binder-card-transition-show-card"
  );
  applyTransitionRect(transitionCard, sourceRect);
  document.body.append(transitionCard);
  transitionCard.getBoundingClientRect();

  try {
    const prepared = await openFocusedBinderGalleryForArt(artIndex);
    const focusedMesh = prepared ? getBinderFocusedMesh() : null;
    renderBinderSceneOnce();
    const targetRect = getBinderMeshScreenRect(focusedMesh) || getCenteredFallbackRect();

    requestAnimationFrame(() => {
      document.body.classList.remove(
        "binder-card-transition-away",
        "binder-card-transition-show-card"
      );
      applyTransitionRect(transitionCard, targetRect);
    });

    await delay(BINDER_CARD_VIEW_TRANSITION_MS);
    transitionCard.classList.add("is-dissolving");
    lockBinderFocusZoomOut();
    await delay(220);
  } finally {
    transitionCard.remove();
    document.body.classList.remove(
      "binder-card-transitioning",
      "binder-card-transition-away",
      "binder-card-transition-show-card"
    );
    binderCardViewTransitionActive = false;
  }
}

async function openFocusedBinderGalleryForArt(artIndex) {
  if (!Number.isInteger(artIndex)) return false;

  galleryFavoritesOnly = false;
  isBinderMode = true;
  isGalleryOpen = true;
  document.body.classList.add("gallery-open");
  table.classList.remove("details-open");
  detailsButton.setAttribute("aria-expanded", "false");
  galleryToggleButton.classList.add("is-active");
  galleryToggleButton.setAttribute("aria-pressed", "true");
  galleryPanel.hidden = false;
  hideArtMagnifier();
  updateFavoriteFilterButton();
  updateBinderModeControls();

  const indexes = getGalleryIndexes();
  galleryGrid.replaceChildren();
  galleryGrid.hidden = true;
  binderPanel.hidden = indexes.length === 0;
  galleryEmpty.hidden = indexes.length > 0;
  if (!indexes.length) {
    binderPageControls.hidden = true;
    binderPageStatus.hidden = true;
    stopBinderRenderLoop();
    return false;
  }

  binderPageControls.hidden = false;
  await updateBinderItems(indexes);
  const focusPosition = binderVisibleIndexes.indexOf(artIndex);
  if (focusPosition === -1) return false;

  focusBinderCard(focusPosition, { immediate: true });
  renderBinderSceneOnce();
  return true;
}

async function transitionFocusedBinderCardToIndividual(artIndex, templateFile, focusedMesh) {
  binderCardViewTransitionActive = true;
  const transitionCard = document.createElement("img");
  transitionCard.className = "binder-card-transition-card";
  transitionCard.alt = "";
  transitionCard.decoding = "async";
  transitionCard.src = getBinderTransitionImageSource(focusedMesh, artIndex);

  const sourceRect = getBinderMeshScreenRect(focusedMesh) || getCenteredFallbackRect();
  document.body.classList.add("binder-card-transitioning");
  document.body.classList.remove(
    "binder-card-transition-away",
    "binder-card-transition-show-card"
  );
  applyTransitionRect(transitionCard, sourceRect);
  document.body.append(transitionCard);
  transitionCard.getBoundingClientRect();

  try {
    await applyCardByIndex(artIndex, templateFile);
    updateResponsiveCameraFrame(true);
    if (controls) {
      controls.target.copy(DEFAULT_TARGET);
      controls.target0.copy(DEFAULT_TARGET);
      controls.position0.copy(getDefaultCameraPosition());
    }
    renderSceneOnce();

    const targetRect = getIndividualCardTransitionRect();
    requestAnimationFrame(() => {
      document.body.classList.add("binder-card-transition-away");
      applyTransitionRect(transitionCard, targetRect);
    });

    await delay(BINDER_CARD_VIEW_TRANSITION_MS * 0.46);
    document.body.classList.add("binder-card-transition-show-card");
    await delay(BINDER_CARD_VIEW_TRANSITION_MS * 0.54);

    closeGalleryMode();
    transitionCard.classList.add("is-dissolving");
    await delay(240);
  } finally {
    transitionCard.remove();
    document.body.classList.remove(
      "binder-card-transitioning",
      "binder-card-transition-away",
      "binder-card-transition-show-card"
    );
    binderCardViewTransitionActive = false;
  }
}

function getBinderTransitionImageSource(mesh, artIndex) {
  const image = mesh.material?.map?.image;
  if (image?.toDataURL) {
    try {
      return image.toDataURL("image/png");
    } catch {
      // Fall through to the static crop if the canvas is not exportable.
    }
  }
  return image?.currentSrc || image?.src || artItems[artIndex]?.cropUrl || "";
}

function getIndividualTransitionImageSource() {
  const image = frontMaterial?.map?.image;
  if (image?.toDataURL) {
    try {
      return image.toDataURL("image/png");
    } catch {
      // Fall through to the static crop if the canvas is not exportable.
    }
  }
  return image?.currentSrc || image?.src || artItems[currentArtIndex]?.cropUrl || "";
}

function getBinderMeshScreenRect(mesh) {
  if (!mesh || !binderCamera || !binderCanvas) return null;

  binderRoot.updateMatrixWorld(true);
  const canvasRect = binderCanvas.getBoundingClientRect();
  const corners = [
    new THREE.Vector3(-BINDER_CARD_WIDTH / 2, -BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(BINDER_CARD_WIDTH / 2, -BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(BINDER_CARD_WIDTH / 2, BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(-BINDER_CARD_WIDTH / 2, BINDER_CARD_HEIGHT / 2, 0)
  ].map((corner) => {
    const projected = corner.applyMatrix4(mesh.matrixWorld).project(binderCamera);
    return {
      x: canvasRect.left + (projected.x + 1) * canvasRect.width / 2,
      y: canvasRect.top + (1 - projected.y) * canvasRect.height / 2
    };
  });

  const left = Math.min(...corners.map((corner) => corner.x));
  const right = Math.max(...corners.map((corner) => corner.x));
  const top = Math.min(...corners.map((corner) => corner.y));
  const bottom = Math.max(...corners.map((corner) => corner.y));
  if (right - left < 12 || bottom - top < 12) return null;

  return {
    left,
    top,
    width: right - left,
    height: bottom - top
  };
}

function getIndividualCardScreenRect() {
  if (!cardGroup || !camera || !canvas) return null;

  cardGroup.updateMatrixWorld(true);
  const canvasRect = canvas.getBoundingClientRect();
  const z = CARD_DEPTH / 2 + 0.006;
  const corners = [
    new THREE.Vector3(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, z),
    new THREE.Vector3(CARD_WIDTH / 2, -CARD_HEIGHT / 2, z),
    new THREE.Vector3(CARD_WIDTH / 2, CARD_HEIGHT / 2, z),
    new THREE.Vector3(-CARD_WIDTH / 2, CARD_HEIGHT / 2, z)
  ].map((corner) => {
    const projected = corner.applyMatrix4(cardGroup.matrixWorld).project(camera);
    return {
      x: canvasRect.left + (projected.x + 1) * canvasRect.width / 2,
      y: canvasRect.top + (1 - projected.y) * canvasRect.height / 2
    };
  });

  const left = Math.min(...corners.map((corner) => corner.x));
  const right = Math.max(...corners.map((corner) => corner.x));
  const top = Math.min(...corners.map((corner) => corner.y));
  const bottom = Math.max(...corners.map((corner) => corner.y));
  if (right - left < 12 || bottom - top < 12) return null;

  return {
    left,
    top,
    width: right - left,
    height: bottom - top
  };
}

function getIndividualCardTransitionRect() {
  const sceneTrack = document.querySelector(".scene-track");
  const trackRect = sceneTrack?.getBoundingClientRect() || getCenteredFallbackRect();
  const artRect = fullArtLink.getBoundingClientRect();
  const width = artRect.width || parseFloat(getComputedStyle(table).getPropertyValue("--card-width")) || 320;
  const height = artRect.height || width * 1.4;
  return {
    left: trackRect.left + trackRect.width / 2 - width / 2,
    top: trackRect.top + trackRect.height / 2 - height / 2,
    width,
    height
  };
}

function getCenteredFallbackRect() {
  const width = Math.min(window.innerWidth * 0.42, 360);
  const height = width * 1.4;
  return {
    left: window.innerWidth / 2 - width / 2,
    top: window.innerHeight / 2 - height / 2,
    width,
    height
  };
}

function applyTransitionRect(element, rect) {
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBinderFocusedMesh() {
  if (!isBinderFocused()) return null;
  return binderCardMeshes.find((mesh) => (
    mesh.userData.binderPosition === binderFocusPosition
  )) || null;
}

function isVisibleThroughParents(object) {
  let current = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function turnBinderPage(direction) {
  if (!isGalleryOpen || !isBinderMode || binderPageCount < 1) return;

  if (isBinderFocused()) {
    moveBinderFocus(direction);
    return;
  }

  const currentPage = Math.round(binderTargetTurn);
  const nextTurn = clamp(currentPage + direction, 0, binderPageCount);
  if (nextTurn !== binderTargetTurn) binderBendDirection = Math.sign(nextTurn - binderTargetTurn);
  binderTargetTurn = nextTurn;
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function shuffleBinderSpread() {
  if (!isGalleryOpen || !isBinderMode || isBinderFocused() || binderPageCount < 1) return;

  const currentPage = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  let nextTurn = currentPage;
  if (binderPageCount > 0) {
    while (nextTurn === currentPage) {
      nextTurn = Math.floor(Math.random() * (binderPageCount + 1));
    }
  }

  binderShuffleHistory.push(currentPage);
  if (binderShuffleHistory.length > SHUFFLE_HISTORY_LIMIT) {
    binderShuffleHistory.shift();
  }
  moveBinderToSpread(nextTurn);
}

function applyPreviousBinderSpread() {
  if (!isGalleryOpen || !isBinderMode || isBinderFocused()) return;

  const previousTurn = binderShuffleHistory.pop();
  if (Number.isInteger(previousTurn)) {
    moveBinderToSpread(previousTurn);
  }
}

function moveBinderToSpread(turn) {
  const nextTurn = clamp(Math.round(turn), 0, binderPageCount);
  if (nextTurn !== binderTargetTurn) {
    binderBendDirection = Math.sign(nextTurn - binderTargetTurn) || binderBendDirection;
  }
  binderTargetTurn = nextTurn;
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function snapBinderToWholePage() {
  binderTargetTurn = clamp(Math.round(binderTargetTurn), 0, Math.max(binderPageCount, 0));
  binderTurn = binderTargetTurn;
  updateBinderPageTransforms();
  updateBinderPageControls();
  renderBinderSceneOnce();
}

function updateBinderPageControls() {
  const controlsHidden = !isGalleryOpen || !isBinderMode || binderPanel.hidden || binderPageCount < 1;
  syncBinderStateAttributes();
  binderPageControls.hidden = controlsHidden;
  binderPageStatus.hidden = controlsHidden;
  if (controlsHidden) return;

  const focused = isBinderFocused();
  binderPageControls.classList.toggle("is-focused", focused);
  binderZoomOutButton.hidden = !focused;
  binderOpenCardButton.hidden = !focused;
  binderFavoriteButton.hidden = !focused;
  binderShuffleButton.hidden = focused;
  updateBinderFavoriteButton();
  updateBinderPageStatus(focused);

  if (focused) {
    binderPreviousPageButton.disabled = binderFocusPosition <= 0;
    binderNextPageButton.disabled = binderFocusPosition >= binderVisibleIndexes.length - 1;
    binderPreviousPageButton.setAttribute("title", "Previous card in binder");
    binderPreviousPageButton.setAttribute("aria-label", "Previous card in binder");
    binderNextPageButton.setAttribute("title", "Next card in binder");
    binderNextPageButton.setAttribute("aria-label", "Next card in binder");
    return;
  }

  const currentPage = Math.round(binderTargetTurn);
  binderPreviousPageButton.disabled = currentPage <= 0;
  binderNextPageButton.disabled = currentPage >= binderPageCount;
  binderPreviousPageButton.setAttribute("title", "Previous binder page");
  binderPreviousPageButton.setAttribute("aria-label", "Previous binder page");
  binderNextPageButton.setAttribute("title", "Next binder page");
  binderNextPageButton.setAttribute("aria-label", "Next binder page");
}

function updateBinderPageStatus(focused = isBinderFocused()) {
  if (!binderPageStatus) return;

  if (focused) {
    binderPageStatus.textContent = `${binderFocusPosition + 1} / ${binderVisibleIndexes.length}`;
    return;
  }

  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  const totalPageSides = Math.max(1, binderPageCount * 2);
  if (currentTurn <= 0 || totalPageSides <= 1) {
    binderPageStatus.textContent = `1 / ${totalPageSides}`;
  } else if (currentTurn >= binderPageCount) {
    binderPageStatus.textContent = `${totalPageSides} / ${totalPageSides}`;
  } else {
    const leftPageSide = currentTurn * 2;
    binderPageStatus.textContent = `${leftPageSide}-${leftPageSide + 1} / ${totalPageSides}`;
  }
}

function syncBinderStateAttributes() {
  const signature = [
    binderTurn.toFixed(3),
    binderTargetTurn.toFixed(3),
    binderPageCount,
    binderPages.length,
    isBinderFocused() ? binderFocusPosition : ""
  ].join("|");

  if (signature === binderStateSignature) return;
  binderStateSignature = signature;
  const [turn, targetTurn, pageCount, pageMeshes, focusPosition] = signature.split("|");
  binderPanel.dataset.turn = turn;
  binderPanel.dataset.targetTurn = targetTurn;
  binderPanel.dataset.pageCount = pageCount;
  binderPanel.dataset.maxTurn = pageCount;
  binderPanel.dataset.pageMeshes = pageMeshes;
  binderPanel.dataset.focusPosition = focusPosition;
}

function updateBinderAnimation() {
  if (!binderRenderer || !binderScene || !binderCamera || !isGalleryOpen || !isBinderMode) {
    return false;
  }

  let turnActive = Boolean(binderDrag);
  if (!binderDrag) {
    const delta = binderTargetTurn - binderTurn;
    if (Math.abs(delta) > 0.0015) binderBendDirection = Math.sign(delta);
    binderTurn += delta * 0.16;
    turnActive = Math.abs(delta) >= 0.0015;
    if (!turnActive) binderTurn = binderTargetTurn;
  }

  updateBinderPageTransforms();
  updateBinderCameraFrame(false);
  binderRenderer.render(binderScene, binderCamera);
  const cameraActive = binderCameraReady && (
    binderCamera.position.distanceToSquared(binderDesiredCameraPosition) > 0.00008
    || binderCurrentCameraLookAt.distanceToSquared(binderDesiredCameraLookAt) > 0.00008
  );
  return turnActive || cameraActive || binderCardViewTransitionActive;
}

function updateBinderPageTransforms() {
  const turn = clamp(binderTurn, 0, binderPageCount);
  const lowerTurn = Math.floor(turn);
  const turnFraction = turn - lowerTurn;
  const isTurning = turnFraction > 0.001 && lowerTurn < binderPageCount;
  const activeIndex = isTurning ? lowerTurn : -1;
  const restingTurn = clamp(Math.round(turn), 0, binderPageCount);
  const stackProgress = getBinderStackRestProgress(turnFraction, isTurning);

  for (const page of binderPages) {
    const rawTurn = clamp(turn - page.pageIndex, 0, 1);
    const easedTurn = easeInOut(rawTurn);
    const isActivePage = page.pageIndex === activeIndex;
    const restLayout = isTurning && !isActivePage
      ? getBlendedBinderRestLayout(page.pageIndex, lowerTurn, lowerTurn + 1, stackProgress)
      : getBinderRestPageLayout(page.pageIndex, restingTurn);

    page.group.rotation.y = -Math.PI * easedTurn;

    const activeLift = Math.sin(rawTurn * Math.PI) * BINDER_ACTIVE_PAGE_LIFT;
    const activeRestZ = THREE.MathUtils.lerp(
      BINDER_RIGHT_STACK_Z,
      BINDER_LEFT_STACK_Z,
      easedTurn
    );
    let pageZ;
    if (isActivePage) {
      pageZ = activeRestZ + activeLift;
    } else {
      pageZ = restLayout.z;
    }
    page.group.position.x = 0;
    page.group.position.z = pageZ;
    setBinderPageRenderOrder(
      page,
      getBinderPageRenderOrder(
        isActivePage,
        restLayout.isLeftStack,
        restLayout.leftStackDepth,
        restLayout.rightStackDepth,
        restLayout.isGapRevealPage
      )
    );
    const turnActivity = Math.sin(rawTurn * Math.PI);
    const sheetVisibility = isActivePage
      ? getBinderSheetVisibilityFactor({
        isActivePage,
        isLeftStack: restLayout.isLeftStack,
        leftStackDepth: restLayout.leftStackDepth,
        rightStackDepth: restLayout.rightStackDepth,
        isGapRevealPage: restLayout.isGapRevealPage,
        turnActivity
      })
      : restLayout.sheetVisibility;
    const pageVisibility = isActivePage ? 1 : restLayout.pageVisibility;
    page.group.visible = isActivePage || pageVisibility > 0.001;
    setBinderSheetOpacity(page, turnActivity, sheetVisibility * pageVisibility);
    setBinderPageOpacity(page, pageVisibility);

    applyBinderColumnBend(page, rawTurn);
  }
}

function getBinderRestPageLayout(pageIndex, restTurn) {
  const currentTurn = clamp(Math.round(restTurn), 0, binderPageCount);
  const leftIndex = currentTurn - 1;
  const rightIndex = currentTurn;
  const isLeftStack = pageIndex <= leftIndex;
  const leftStackDepth = Math.max(0, leftIndex - pageIndex);
  const rightStackDepth = Math.max(0, pageIndex - rightIndex);
  const isLeftGapRevealPage = isLeftStack && pageIndex === currentTurn - 2;
  const isRightGapRevealPage = !isLeftStack && pageIndex === currentTurn + 1;
  const isGapRevealPage = isLeftGapRevealPage || isRightGapRevealPage;
  let z;

  if (isLeftGapRevealPage) {
    z = BINDER_LEFT_STACK_Z - BINDER_GAP_REVEAL_STACK_GAP;
  } else if (isRightGapRevealPage) {
    z = BINDER_RIGHT_STACK_Z - BINDER_GAP_REVEAL_STACK_GAP;
  } else if (isLeftStack) {
    z = BINDER_LEFT_STACK_Z - leftStackDepth * BINDER_VISIBLE_STACK_GAP;
  } else {
    z = BINDER_RIGHT_STACK_Z - rightStackDepth * BINDER_VISIBLE_STACK_GAP;
  }

  return {
    isLeftStack,
    leftStackDepth,
    rightStackDepth,
    isGapRevealPage,
    z,
    pageVisibility: getBinderRestPageVisibility(
      getBinderStackDepth({ isLeftStack, leftStackDepth, rightStackDepth })
    ),
    sheetVisibility: getBinderSheetVisibilityFactor({
      isActivePage: false,
      isLeftStack,
      leftStackDepth,
      rightStackDepth,
      isGapRevealPage
    })
  };
}

function getBlendedBinderRestLayout(pageIndex, fromTurn, toTurn, progress) {
  const startLayout = getBinderRestPageLayout(pageIndex, fromTurn);
  const endLayout = getBinderRestPageLayout(pageIndex, toTurn);
  const displayLayout = progress < 0.5 ? startLayout : endLayout;

  return {
    ...displayLayout,
    z: THREE.MathUtils.lerp(startLayout.z, endLayout.z, progress),
    pageVisibility: THREE.MathUtils.lerp(
      startLayout.pageVisibility,
      endLayout.pageVisibility,
      progress
    ),
    sheetVisibility: THREE.MathUtils.lerp(
      startLayout.sheetVisibility,
      endLayout.sheetVisibility,
      progress
    )
  };
}

function getBinderStackDepth({ isLeftStack, leftStackDepth, rightStackDepth }) {
  return isLeftStack ? leftStackDepth : rightStackDepth;
}

function getBinderRestPageVisibility(depth) {
  if (depth <= BINDER_VISIBLE_STACK_DEPTH) return 1;
  if (depth >= BINDER_HIDDEN_STACK_DEPTH) return 0;

  const progress = clamp(
    (depth - BINDER_VISIBLE_STACK_DEPTH) / (BINDER_HIDDEN_STACK_DEPTH - BINDER_VISIBLE_STACK_DEPTH),
    0,
    1
  );
  return Math.pow(1 - progress, BINDER_DEEP_PAGE_FADE_POWER);
}

function getBinderStackRestProgress(turnFraction, isTurning) {
  if (!isTurning) return 0;

  if (binderBendDirection >= 0) {
    return easeInOut(clamp(
      (turnFraction - BINDER_STACK_TRANSITION_START) / (1 - BINDER_STACK_TRANSITION_START),
      0,
      1
    ));
  }

  return 1 - easeInOut(clamp(
    ((1 - BINDER_STACK_TRANSITION_START) - turnFraction) / (1 - BINDER_STACK_TRANSITION_START),
    0,
    1
  ));
}

function getBinderColumnBend(rawTurn) {
  const turnActivity = Math.sin(rawTurn * Math.PI);
  return BINDER_PAGE_COLUMN_BEND * turnActivity * 1.3;
}

function applyBinderColumnBend(page, rawTurn) {
  const bend = getBinderColumnBend(rawTurn) * -Math.sign(binderBendDirection || 1);
  const middlePivot = page.columnPivots?.[1]?.group;
  const outerPivot = page.columnPivots?.[2]?.group;

  if (middlePivot) middlePivot.rotation.y = bend * 0.58;
  if (outerPivot) outerPivot.rotation.y = bend * 0.72;
}

function getBinderStackCoverProgress({
  pageIndex,
  activeIndex,
  easedTurn,
  isTurning,
  forwardTurn
}) {
  if (!isTurning || activeIndex < 0) return 0;

  if (forwardTurn && pageIndex === activeIndex - 1) {
    return easeInOut(clamp(easedTurn, 0, 1));
  }

  if (!forwardTurn && pageIndex === activeIndex + 1) {
    return easeInOut(clamp(1 - easedTurn, 0, 1));
  }

  return 0;
}

function getBinderSheetVisibilityFactor({
  isActivePage,
  isLeftStack,
  leftStackDepth,
  rightStackDepth,
  isGapRevealPage,
  turnActivity = 0,
  stackCoverProgress = 0
}) {
  const focused = isBinderFocused();
  const currentPageFactor = focused ? 0.68 : 1;
  if (stackCoverProgress > 0) {
    return THREE.MathUtils.lerp(
      currentPageFactor,
      getBinderUnderlyingSheetVisibility(1, focused),
      stackCoverProgress
    );
  }

  if (isActivePage) {
    return THREE.MathUtils.lerp(
      currentPageFactor,
      focused ? 0.86 : 1,
      easeInOut(clamp(turnActivity, 0, 1))
    );
  }
  if (isGapRevealPage) return focused ? 0.24 : 0.42;
  if (isLeftStack) {
    if (leftStackDepth === 0) return currentPageFactor;
    return getBinderUnderlyingSheetVisibility(leftStackDepth, focused);
  }
  if (rightStackDepth === 0) return currentPageFactor;
  return getBinderUnderlyingSheetVisibility(rightStackDepth, focused);
}

function getBinderUnderlyingSheetVisibility(depth, focused) {
  const start = focused ? 0.24 : 0.42;
  const falloff = focused ? 0.045 : 0.07;
  const floor = focused ? 0.075 : 0.13;
  return Math.max(floor, start - Math.max(0, depth - 1) * falloff);
}

function setBinderSheetOpacity(page, turnActivity, visibilityFactor = 1) {
  const activity = easeInOut(clamp(turnActivity, 0, 1));
  const visibleOpacity = clamp(visibilityFactor, 0, 1);
  for (const mesh of page.sheetMeshes || []) {
    const material = mesh.material;
    if (!material) continue;
    const opacity = visibleOpacity * THREE.MathUtils.lerp(
      mesh.userData.restOpacity,
      mesh.userData.activeOpacity,
      activity
    );
    if (Math.abs(material.opacity - opacity) > 0.0005) {
      material.opacity = opacity;
    }
  }
}

function setBinderPageOpacity(page, visibilityFactor = 1) {
  const opacity = clamp(visibilityFactor, 0, 1);
  if (Math.abs((page.cardOpacity ?? 1) - opacity) <= 0.0005) return;
  page.cardOpacity = opacity;
  for (const mesh of page.cardMeshes || []) {
    const material = mesh.material;
    if (!material) continue;
    material.opacity = opacity;
  }
}

function getBinderPageRenderOrder(
  isActivePage,
  isLeftStack,
  leftStackDepth,
  rightStackDepth,
  isGapRevealPage = false
) {
  if (isActivePage) return 620;
  if (isGapRevealPage) return 600;
  if (isLeftStack) return (leftStackDepth === 0 ? 620 : 420 - leftStackDepth * 28);
  return rightStackDepth === 0 ? 620 : 300 - rightStackDepth * 28;
}

function updateBinderCameraFrame(immediate = false) {
  if (!binderCamera) return;

  binderDesiredCameraPosition.copy(binderDefaultCameraPosition);
  binderDesiredCameraLookAt.copy(binderDefaultCameraLookAt);

  const focusMesh = getBinderFocusedMesh();
  if (focusMesh && binderRoot) {
    binderRoot.updateMatrixWorld(true);
    focusMesh.getWorldPosition(binderFocusWorldPosition);
    const focusDistance = getBinderFocusDistance();
    binderDesiredCameraLookAt.copy(binderFocusWorldPosition);
    binderDesiredCameraPosition.set(
      binderFocusWorldPosition.x,
      binderFocusWorldPosition.y,
      binderFocusWorldPosition.z + focusDistance
    );
  }

  if (immediate || !binderCameraReady) {
    binderCamera.position.copy(binderDesiredCameraPosition);
    binderCurrentCameraLookAt.copy(binderDesiredCameraLookAt);
    binderCamera.lookAt(binderCurrentCameraLookAt);
    binderCameraReady = true;
    return;
  }

  const alpha = isBinderFocused() ? 0.12 : 0.1;
  binderCamera.position.lerp(binderDesiredCameraPosition, alpha);
  binderCurrentCameraLookAt.lerp(binderDesiredCameraLookAt, alpha);
  binderCamera.lookAt(binderCurrentCameraLookAt);
}

function getBinderFocusDistance() {
  const fov = THREE.MathUtils.degToRad(binderCamera.fov);
  const aspect = Math.max(binderCamera.aspect || 1, 0.1);
  const distanceForHeight = BINDER_CARD_HEIGHT / (2 * Math.tan(fov / 2) * 0.59);
  const distanceForWidth = BINDER_CARD_WIDTH / (2 * Math.tan(fov / 2) * aspect * 0.42);
  return Math.max(distanceForHeight, distanceForWidth) + 0.16;
}

function setBinderPageRenderOrder(page, baseOrder) {
  if (page.renderOrderBase === baseOrder) return;
  page.renderOrderBase = baseOrder;
  page.group.traverse((child) => {
    if (!child.isMesh) return;
    if (child.userData.binderRenderOffset === undefined) {
      child.userData.binderRenderOffset = child.renderOrder || 0;
    }
    child.renderOrder = baseOrder + child.userData.binderRenderOffset;
  });
}

function easeInOut(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function resizeBinderRenderer() {
  if (!binderRenderer || !binderPanel || binderPanel.hidden) return;

  const rect = binderPanel.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  if (!width || !height) return;

  if (width !== binderLastWidth || height !== binderLastHeight) {
    binderRenderer.setSize(width, height, false);
    binderCamera.aspect = width / height;
    binderCamera.updateProjectionMatrix();
    binderLastWidth = width;
    binderLastHeight = height;
  }

  const aspect = width / height;
  const fov = THREE.MathUtils.degToRad(binderCamera.fov);
  const fitHeight = BINDER_PAGE_HEIGHT + (height < 640 ? 1.62 : 1.35);
  const fitWidth = BINDER_PAGE_WIDTH * (width < 620 ? 2.34 : 2.22);
  const distanceForHeight = fitHeight / (2 * Math.tan(fov / 2));
  const distanceForWidth = fitWidth / (2 * Math.tan(fov / 2) * Math.max(aspect, 0.1));
  const distance = Math.max(distanceForHeight, distanceForWidth) + 0.88;
  binderDefaultCameraPosition.set(0, 0.24, distance);
  binderDefaultCameraLookAt.set(0, 0.24, 0);
  updateBinderCameraFrame(!isBinderFocused() || !binderCameraReady);
}

function queueResizeBinderRenderer() {
  if (binderResizeFrame) return;

  binderResizeFrame = requestAnimationFrame(() => {
    binderResizeFrame = 0;
    resizeBinderRenderer();
    renderBinderSceneOnce();
  });
}

function requestBinderRenderOnce() {
  if (
    binderAnimationFrame
    || binderRenderFrame
    || !isGalleryOpen
    || !isBinderMode
    || binderPanel.hidden
  ) {
    return;
  }

  binderRenderFrame = requestAnimationFrame(() => {
    binderRenderFrame = 0;
    renderBinderSceneOnce();
  });
}

function renderBinderSceneOnce() {
  if (!binderRenderer || !binderScene || !binderCamera) return;
  updateBinderPageTransforms();
  updateBinderCameraFrame(true);
  binderRenderer.render(binderScene, binderCamera);
}

function handleSmoothWheelZoom(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  cancelCameraSnap();

  const normalizedDelta = normalizeWheelDelta(event.deltaY || 0, event);

  if (
    normalizedDelta > 0
    && !isGalleryOpen
    && currentArtIndex !== -1
    && !binderCardViewTransitionActive
  ) {
    if (isIndividualAtMaxZoomOut()) {
      if (addIndividualWheelOutDistance(normalizedDelta, performance.now())) {
        smoothZoomVelocity = 0;
        resetViewSwitchWheelDistances();
        transitionIndividualCardToFocusedBinder().catch(console.error);
        return;
      }
    } else {
      resetIndividualWheelOutDistance();
    }
  } else if (normalizedDelta < 0) {
    resetIndividualWheelOutDistance();
  }

  smoothZoomVelocity = clamp(
    smoothZoomVelocity + normalizedDelta * 0.000045,
    -0.18,
    0.18
  );
}

function getWheelDeltaScale(event) {
  return event.deltaMode === 1
    ? 16
    : event.deltaMode === 2
      ? window.innerHeight
      : 1;
}

function normalizeWheelDelta(delta, event) {
  return clamp(delta * getWheelDeltaScale(event), -900, 900);
}

function getDominantNormalizedWheelDelta(event) {
  const delta = Math.abs(event.deltaY || 0) >= Math.abs(event.deltaX || 0)
    ? event.deltaY || 0
    : event.deltaX || 0;
  return normalizeWheelDelta(delta, event);
}

function isIndividualAtMaxZoomOut() {
  if (!camera || !controls) return false;
  const distance = camera.position.distanceTo(controls.target);
  return distance >= controls.maxDistance - INDIVIDUAL_MAX_ZOOM_EPSILON;
}

function addIndividualWheelOutDistance(amount, now) {
  if (now - individualWheelOutLastAt > VIEW_SWITCH_WHEEL_IDLE_MS) {
    individualWheelOutDistance = 0;
  }
  individualWheelOutLastAt = now;
  individualWheelOutDistance += amount;
  return individualWheelOutDistance >= INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD;
}

function addBinderFocusWheelInDistance(amount, now) {
  if (now - binderFocusWheelInLastAt > VIEW_SWITCH_WHEEL_IDLE_MS) {
    binderFocusWheelInDistance = 0;
  }
  binderFocusWheelInLastAt = now;
  binderFocusWheelInDistance += amount;
  return binderFocusWheelInDistance >= BINDER_TO_INDIVIDUAL_WHEEL_THRESHOLD;
}

function resetIndividualWheelOutDistance() {
  individualWheelOutDistance = 0;
  individualWheelOutLastAt = 0;
}

function resetBinderFocusWheelInDistance() {
  binderFocusWheelInDistance = 0;
  binderFocusWheelInLastAt = 0;
}

function resetViewSwitchWheelDistances() {
  resetIndividualWheelOutDistance();
  resetBinderFocusWheelInDistance();
}

function initUploadControls() {
  uploadButton.addEventListener("click", openUploadModal);
  closeUploadButton.addEventListener("click", closeUploadModal);
  uploadModal.addEventListener("click", (event) => {
    if (event.target === uploadModal) closeUploadModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && uploadModal.classList.contains("is-open")) {
      closeUploadModal();
    }
  });

  dropZone.addEventListener("click", () => uploadInput.click());
  uploadInput.addEventListener("change", () => {
    const [file] = uploadInput.files;
    if (file) loadUploadFile(file);
  });

  for (const eventName of ["dragenter", "dragover"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  }

  for (const eventName of ["dragleave", "drop"]) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("is-dragging");
    });
  }

  dropZone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (file) loadUploadFile(file);
  });

  cropZoomInput.addEventListener("input", () => {
    syncCropInputs();
    renderCropPreview();
  });

  cropCanvas.addEventListener("pointerdown", startCropDrag);
  cropCanvas.addEventListener("pointermove", updateCropDrag);
  cropCanvas.addEventListener("pointerup", endCropDrag);
  cropCanvas.addEventListener("pointercancel", endCropDrag);
  createCardButton.addEventListener("click", createCustomCard);
  renderCropPreview();
}

function openUploadModal() {
  uploadModal.classList.add("is-open");
  uploadModal.setAttribute("aria-hidden", "false");
  hideArtMagnifier();
}

function closeUploadModal() {
  uploadModal.classList.remove("is-open");
  uploadModal.setAttribute("aria-hidden", "true");
  dropZone.classList.remove("is-dragging");
}

function createUploadState() {
  return {
    file: null,
    image: null,
    imageUrl: "",
    cropX: 50,
    cropY: 50,
    zoom: 1
  };
}

async function loadUploadFile(file) {
  if (!file.type.startsWith("image/")) return;

  const imageUrl = URL.createObjectURL(file);
  const image = await loadImage(imageUrl);
  uploadState = {
    file,
    image,
    imageUrl,
    cropX: 50,
    cropY: 50,
    zoom: 1
  };

  cropZoomInput.value = "1";
  if (!customTitleInput.value.trim()) {
    customTitleInput.value = cleanBase(file.name);
  }
  dropZoneText.textContent = file.name;
  createCardButton.disabled = false;
  renderCropPreview();
}

function syncCropInputs() {
  uploadState.zoom = Number(cropZoomInput.value);
}

function startCropDrag(event) {
  if (!uploadState.image) return;

  cropCanvas.setPointerCapture(event.pointerId);
  cropDrag = {
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startCropX: uploadState.cropX,
    startCropY: uploadState.cropY
  };
}

function updateCropDrag(event) {
  if (!cropDrag || cropDrag.pointerId !== event.pointerId || !uploadState.image) return;

  const rect = cropCanvas.getBoundingClientRect();
  const crop = getUploadCropRect();
  const maxSourceX = Math.max(uploadState.image.naturalWidth - crop.width, 1);
  const maxSourceY = Math.max(uploadState.image.naturalHeight - crop.height, 1);
  const deltaX = event.clientX - cropDrag.startClientX;
  const deltaY = event.clientY - cropDrag.startClientY;

  uploadState.cropX = clamp(
    cropDrag.startCropX - (deltaX / rect.width) * (crop.width / maxSourceX) * 100,
    0,
    100
  );
  uploadState.cropY = clamp(
    cropDrag.startCropY - (deltaY / rect.height) * (crop.height / maxSourceY) * 100,
    0,
    100
  );
  renderCropPreview();
}

function endCropDrag(event) {
  if (!cropDrag || cropDrag.pointerId !== event.pointerId) return;
  cropDrag = null;
}

function getUploadCropRect() {
  const image = uploadState.image;
  if (!image) return { x: 0, y: 0, width: 1, height: 1 };

  const targetRatio = ART_WINDOW.width / ART_WINDOW.height;
  let width = image.naturalWidth;
  let height = width / targetRatio;

  if (height > image.naturalHeight) {
    height = image.naturalHeight;
    width = height * targetRatio;
  }

  width /= uploadState.zoom;
  height /= uploadState.zoom;

  const maxX = Math.max(image.naturalWidth - width, 0);
  const maxY = Math.max(image.naturalHeight - height, 0);
  return {
    x: maxX * (uploadState.cropX / 100),
    y: maxY * (uploadState.cropY / 100),
    width,
    height
  };
}

function renderCropPreview() {
  const ctx = cropCanvas.getContext("2d");
  ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

  if (!uploadState.image) {
    ctx.fillStyle = "rgba(242, 241, 234, 0.08)";
    ctx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
    ctx.fillStyle = "rgba(242, 241, 234, 0.55)";
    ctx.font = "22px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Crop preview", cropCanvas.width / 2, cropCanvas.height / 2);
    return;
  }

  const crop = getUploadCropRect();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    uploadState.image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );
}

async function createCustomCard() {
  if (!uploadState.image || createCardButton.classList.contains("is-loading")) return;

  createCardButton.disabled = true;
  createCardButton.classList.add("is-loading");

  try {
    await new Promise((resolve) => setTimeout(resolve, 420));

    const title = customTitleInput.value.trim() || cleanBase(uploadState.file.name) || "Untitled";
    const artist = customAuthorInput.value.trim() || "Unknown";
    const year = customDateInput.value.trim();
    const newItem = {
      cropFile: uploadState.file.name,
      fullFile: uploadState.file.name,
      cropUrl: uploadState.imageUrl,
      fullUrl: uploadState.imageUrl,
      favoriteKey: `custom:${Date.now()}:${uploadState.file.name}`,
      title,
      customCrop: getUploadCropRect(),
      meta: {
        artist,
        title,
        year,
        kind: "Legendary Artwork",
        body: year ? `${artist}\nDated ${year}` : artist
      }
    };

    artItems = [...artItems, newItem];
    authorOrder = buildAuthorOrder(artItems);
    renderGallery();
    await applyCardByIndex(artItems.length - 1);
    closeUploadModal();
    resetUploadForm();
  } finally {
    createCardButton.classList.remove("is-loading");
    createCardButton.disabled = !uploadState.image;
  }
}

function resetUploadForm() {
  uploadState = createUploadState();
  uploadInput.value = "";
  dropZoneText.textContent = "Drop or choose an image";
  customTitleInput.value = "";
  customAuthorInput.value = "";
  customDateInput.value = "";
  cropZoomInput.value = "1";
  createCardButton.disabled = true;
  renderCropPreview();
}

function createGlossPlane(normalDirection) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      uCameraPosition: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uNormalDirection: { value: normalDirection }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uCameraPosition;
      uniform float uTime;
      uniform float uNormalDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normal = normalize(vWorldNormal) * uNormalDirection;
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float facing = abs(dot(normal, viewDir));
        float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 1.42);
        vec2 centered = vUv - 0.5;
        float tiltBand = centered.x * viewDir.x * 1.7 + centered.y * viewDir.y * 1.4 + viewDir.z * 0.2;
        float sweep = smoothstep(0.16, 0.0, abs(tiltBand + sin(uTime * 0.45) * 0.025));
        float verticalEdge = smoothstep(0.38, 0.52, abs(centered.x));
        float sheen = clamp(fresnel * 0.24 + sweep * 0.18 + verticalEdge * 0.035, 0.0, 0.52);
        vec3 cool = vec3(0.42, 0.56, 0.66);
        vec3 warm = vec3(0.68, 0.48, 0.22);
        vec3 pearl = vec3(0.68, 0.65, 0.54);
        vec3 color = mix(cool, warm, smoothstep(-0.45, 0.55, centered.x + viewDir.x * 0.55));
        color = mix(color, pearl, sweep * 0.24);
        gl_FragColor = vec4(color, sheen * 0.085);
      }
    `
  });

  return new THREE.Mesh(
    createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS),
    material
  );
}

async function applyRandomCard(options = {}) {
  if (options.rememberCurrent) rememberCurrentShuffleCard();

  const artIndex = randomIndex(artItems.length, currentArtIndex);
  await applyCardByIndex(artIndex);
}

function rememberCurrentShuffleCard() {
  if (currentArtIndex === -1) return;

  shuffleHistory.push({
    artIndex: currentArtIndex,
    templateFile: currentTemplateFile || TEMPLATE_FILES[0]
  });

  if (shuffleHistory.length > SHUFFLE_HISTORY_LIMIT) {
    shuffleHistory.splice(0, shuffleHistory.length - SHUFFLE_HISTORY_LIMIT);
  }
}

async function applyPreviousShuffleCard() {
  const previousCard = shuffleHistory.pop();
  if (!previousCard) return;

  await applyCardByIndex(previousCard.artIndex, previousCard.templateFile);
}

async function cycleTemplateColor(event) {
  event.preventDefault();
  if (currentArtIndex === -1) return;
  if (!isPointerOnCard(event)) return;

  const nextTemplateFile = getNextTemplateForArt(currentArtIndex, currentTemplateFile);
  setTemplateOverrideForIndex(currentArtIndex, nextTemplateFile);
  await applyCardByIndex(currentArtIndex, nextTemplateFile);
  refreshBinderTemplates();
}

function isPointerOnCard(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObject(cardGroup, true).length > 0;
}

async function applyRelativeCard(direction) {
  const currentOrderPosition = authorOrder.indexOf(currentArtIndex);
  const basePosition = currentOrderPosition === -1 ? 0 : currentOrderPosition;
  const nextPosition = modulo(basePosition + direction, authorOrder.length);
  await applyCardByIndex(authorOrder[nextPosition]);
}

async function applyCardByIndex(artIndex, templateFile = null) {
  const token = ++loadToken;
  const item = artItems[artIndex];
  const selectedTemplateFile = getTemplateForArt(artIndex, templateFile);

  const [frontTexture, backTexture] = await Promise.all([
    createFrontTexture(item, selectedTemplateFile),
    createBackTexture()
  ]);

  if (token !== loadToken) {
    frontTexture.dispose();
    backTexture.dispose();
    return;
  }

  currentArtIndex = artIndex;
  currentTemplateFile = selectedTemplateFile;
  resetViewSwitchWheelDistances();
  swapTexture(frontMaterial, frontTexture);
  swapTexture(backMaterial, backTexture);
  frontMaterial.needsUpdate = true;
  backMaterial.needsUpdate = true;

  fullArtLink.href = item.fullUrl;
  fullArtImage.src = item.fullUrl;
  fullArtImage.alt = item.title;
  applyFullArtLayout(item.fullFile);
  updateCardInfo();
  hideArtMagnifier();
}

function updateCardInfo() {
  const item = artItems[currentArtIndex];
  const orderPosition = authorOrder.indexOf(currentArtIndex);
  const displayPosition = orderPosition === -1 ? currentArtIndex + 1 : orderPosition + 1;
  cardFileName.textContent = formatDisplayFileName(item.fullFile);
  cardCounter.textContent = `${displayPosition}/${authorOrder.length}`;
  updateFavoriteControls();
}

function applyFullArtLayout(fullFile) {
  const layout = FULL_ART_LAYOUTS.get(identityKey(fullFile));
  fullArtImage.style.setProperty("--full-art-y-offset", layout?.yOffset || "0");
  fullArtImage.style.setProperty("--full-art-width", layout?.width || "auto");
  fullArtImage.style.setProperty("--full-art-height", layout?.height || "auto");
  fullArtImage.style.setProperty("--full-art-max-width", layout?.maxWidth || "100%");
  fullArtImage.style.setProperty("--full-art-max-height", layout?.maxHeight || "100%");
}

function showArtMagnifier(event) {
  if (!canShowArtMagnifier()) return;
  updateArtMagnifier(event);
  artMagnifier.classList.add("is-visible");
}

function hideArtMagnifier() {
  artMagnifier.classList.remove("is-visible");
}

function updateArtMagnifier(event) {
  if (!canShowArtMagnifier()) {
    hideArtMagnifier();
    return;
  }
  if (!fullArtImage.naturalWidth || !fullArtImage.naturalHeight) return;

  const rect = fullArtImage.getBoundingClientRect();
  const zoom = 3.15;
  const xRatio = (event.clientX - rect.left) / rect.width;
  const yRatio = (event.clientY - rect.top) / rect.height;
  const magnifierSize = artMagnifier.offsetWidth;
  const backgroundWidth = rect.width * zoom;
  const backgroundHeight = rect.height * zoom;
  const backgroundX = magnifierSize / 2 - xRatio * backgroundWidth;
  const backgroundY = magnifierSize / 2 - yRatio * backgroundHeight;

  artMagnifier.style.left = `${event.clientX}px`;
  artMagnifier.style.top = `${event.clientY}px`;
  artMagnifier.style.backgroundImage = `url("${fullArtImage.currentSrc || fullArtImage.src}")`;
  artMagnifier.style.backgroundSize = `${backgroundWidth}px ${backgroundHeight}px`;
  artMagnifier.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
}

function canShowArtMagnifier() {
  return hoverMagnifierQuery.matches;
}

async function createFrontTexture(item, templateFile, options = {}) {
  const [art, template] = await Promise.all([
    loadImage(item.cropUrl),
    loadImage(urlFor("assets/card templates", templateFile))
  ]);

  const surface = document.createElement("canvas");
  const faceWidth = options.width || FACE_WIDTH;
  const faceHeight = options.height || FACE_HEIGHT;
  surface.width = faceWidth;
  surface.height = faceHeight;

  const ctx = surface.getContext("2d");
  const scale = faceWidth / 400;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, faceWidth, faceHeight);

  if (item.customCrop) {
    drawCrop(
      ctx,
      art,
      item.customCrop,
      ART_WINDOW.x * scale,
      ART_WINDOW.y * scale,
      ART_WINDOW.width * scale,
      ART_WINDOW.height * scale
    );
  } else {
    drawCover(
      ctx,
      art,
      ART_WINDOW.x * scale,
      ART_WINDOW.y * scale,
      ART_WINDOW.width * scale,
      ART_WINDOW.height * scale
    );
  }
  ctx.drawImage(template, 0, 0, faceWidth, faceHeight);
  drawCardText(ctx, item.meta, scale);
  addPaperSurface(ctx, faceWidth, faceHeight);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  const anisotropyRenderer = options.renderer || renderer;
  const rendererAnisotropy = anisotropyRenderer?.capabilities?.getMaxAnisotropy?.() || 1;
  texture.anisotropy = Math.min(options.maxAnisotropy || rendererAnisotropy, rendererAnisotropy);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

async function createBackTexture(options = {}) {
  const back = await loadImage(urlFor("assets/card templates", "back.jpg"));
  const surface = document.createElement("canvas");
  const faceWidth = options.width || FACE_WIDTH;
  const faceHeight = options.height || FACE_HEIGHT;
  surface.width = faceWidth;
  surface.height = faceHeight;
  const ctx = surface.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  drawCover(ctx, back, 0, 0, faceWidth, faceHeight, {
    trimX: BACK_TRIM.x,
    trimY: BACK_TRIM.y
  });
  addPaperSurface(ctx, faceWidth, faceHeight);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  const anisotropyRenderer = options.renderer || renderer;
  texture.anisotropy = anisotropyRenderer?.capabilities?.getMaxAnisotropy?.() || 1;
  texture.needsUpdate = true;
  return texture;
}

function drawCardText(ctx, meta, scale) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(23, 19, 14, 0.94)";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
  ctx.shadowBlur = 0.45;
  ctx.shadowOffsetY = 0.3;

  fitText(ctx, meta.title, {
    x: 43,
    y: 46,
    width: 314,
    max: 17.4,
    min: 10.4,
    weight: "700",
    family: "Georgia, 'Times New Roman', serif"
  });

  fitText(ctx, meta.kind, {
    x: 43,
    y: 331,
    width: 314,
    max: 13.2,
    min: 9.4,
    weight: "700",
    family: "Georgia, 'Times New Roman', serif"
  });

  ctx.shadowBlur = 0.2;
  ctx.textBaseline = "top";
  ctx.font = "13px Georgia, 'Times New Roman', serif";
  drawWrappedText(ctx, meta.body, 43, 359, 314, 16.2, 120);
  ctx.restore();
}

function fitText(ctx, text, options) {
  const { x, y, width, max, min, weight, family } = options;
  let size = max;
  while (size > min) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= width) break;
    size -= 0.4;
  }
  ctx.fillText(text, x, y);
}

function drawWrappedText(ctx, text, x, y, width, lineHeight, maxHeight) {
  const paragraphs = text.split("\n");
  let cursorY = y;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= width || !line) {
        line = candidate;
      } else {
        ctx.fillText(line, x, cursorY);
        cursorY += lineHeight;
        line = word;
      }
      if (cursorY - y > maxHeight) return;
    }

    if (line) {
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }
    cursorY += lineHeight * 0.32;
    if (cursorY - y > maxHeight) return;
  }
}

function drawCrop(ctx, image, crop, x, y, width, height) {
  const sx = clamp(crop.x, 0, image.naturalWidth - 1);
  const sy = clamp(crop.y, 0, image.naturalHeight - 1);
  const sw = clamp(crop.width, 1, image.naturalWidth - sx);
  const sh = clamp(crop.height, 1, image.naturalHeight - sy);
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawCover(ctx, image, x, y, width, height, options = {}) {
  const trimX = (options.trimX || 0) * image.naturalWidth;
  const trimY = (options.trimY || 0) * image.naturalHeight;
  let sx = trimX;
  let sy = trimY;
  let sw = image.naturalWidth - trimX * 2;
  let sh = image.naturalHeight - trimY * 2;
  const imageRatio = sw / sh;
  const targetRatio = width / height;

  if (imageRatio > targetRatio) {
    const sourceWidth = sh * targetRatio;
    sx += (sw - sourceWidth) / 2;
    sw = sourceWidth;
  } else {
    const sourceHeight = sw / targetRatio;
    sy += (sh - sourceHeight) / 2;
    sh = sourceHeight;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function addPaperSurface(ctx, width, height) {
  if (!paperNoiseCanvas) {
    paperNoiseCanvas = createPaperNoiseCanvas(width, height);
  }

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.globalCompositeOperation = "soft-light";
  ctx.drawImage(paperNoiseCanvas, 0, 0, width, height);
  ctx.restore();
}

function createPaperNoiseCanvas(width, height) {
  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(width, height);
  let seed = 0x4d595df4;

  for (let y = 0; y < height; y++) {
    const rowFiber = (randomFromSeed() - 0.5) * 10;

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const speckle = randomFromSeed() < 0.024
        ? (randomFromSeed() - 0.5) * 48
        : 0;
      const value = clampByte(128 + (randomFromSeed() - 0.5) * 34 + rowFiber + speckle);
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return surface;

  function randomFromSeed() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
}

function createPaperRoughnessTexture() {
  if (paperRoughnessTexture) return paperRoughnessTexture;

  const size = 256;
  const surface = document.createElement("canvas");
  surface.width = size;
  surface.height = Math.round(size * 1.4);
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(surface.width, surface.height);
  let seed = 0x2c6fe96d;

  for (let i = 0; i < imageData.data.length; i += 4) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const value = 178 + ((seed >>> 24) % 58);
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  paperRoughnessTexture = texture;
  return paperRoughnessTexture;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createRoundedCardShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function createRoundedPlaneGeometry(width, height, radius) {
  const geometry = new THREE.ShapeGeometry(
    createRoundedCardShape(width, height, radius),
    18
  );
  const position = geometry.getAttribute("position");
  const uvs = [];

  for (let i = 0; i < position.count; i++) {
    uvs.push(
      (position.getX(i) + width / 2) / width,
      (position.getY(i) + height / 2) / height
    );
  }

  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function createRoundedCoreGeometry(width, height, depth, radius) {
  const geometry = new THREE.ExtrudeGeometry(
    createRoundedCardShape(width, height, radius),
    {
      depth,
      bevelEnabled: false,
      curveSegments: 18
    }
  );
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function buildArtItems() {
  return ART_GROUPS.flatMap((group) => (
    group.cropFiles.map((cropFile) => {
      const fullFile = findFullFile(cropFile, group.fullFiles);
      const cropMeta = parseName(cropFile);
      const fullMeta = parseName(fullFile);
      const meta = chooseMetadata(cropMeta, fullMeta);
      return {
        cropFile,
        fullFile,
        cropUrl: urlFor(group.cropDirectory, cropFile),
        fullUrl: urlFor(group.fullDirectory, fullFile),
        favoriteKey: `${group.cropDirectory}/${cropFile}`,
        title: meta.title,
        meta
      };
    })
  ));
}

function buildAuthorOrder(items) {
  return items
    .map((_, index) => index)
    .sort((left, right) => {
      const leftMeta = items[left].meta;
      const rightMeta = items[right].meta;
      return compareText(getBodyAuthor(leftMeta), getBodyAuthor(rightMeta))
        || compareText(leftMeta.title, rightMeta.title)
        || compareText(items[left].cropFile, items[right].cropFile);
    });
}

function getBodyAuthor(meta) {
  return (meta.body || meta.artist || "")
    .split("\n")[0]
    .trim();
}

function findFullFile(cropFile, fullFiles = FULL_FILES) {
  const cropKey = identityKey(cropFile);
  const exact = fullFiles.find((file) => identityKey(file) === cropKey);
  if (exact) return exact;

  const contained = fullFiles.find((file) => {
    const fullKey = identityKey(file);
    return fullKey.startsWith(cropKey) || cropKey.startsWith(fullKey);
  });
  if (contained) return contained;

  let best = fullFiles[0];
  let bestScore = -1;
  const cropTokens = tokenSet(cropFile);
  for (const file of fullFiles) {
    const fullTokens = tokenSet(file);
    const score = [...cropTokens].filter((token) => fullTokens.has(token)).length;
    if (score > bestScore) {
      best = file;
      bestScore = score;
    }
  }
  return best;
}

function parseName(fileName) {
  const clean = cleanBase(fileName);
  const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);
  let artist = parts[0] || "Unknown";
  let title = parts.length > 1 ? parts.slice(1).join(", ") : artist;
  let year = "";

  const leadingDateMatch = title.match(/^(~?\d{3,4})\s+(.+)$/);
  const dateMatch = title.match(/\s(~?\d{3,4})(?:[.\s_]*)$/);
  if (leadingDateMatch) {
    year = leadingDateMatch[1];
    title = leadingDateMatch[2].trim();
  } else if (dateMatch) {
    year = dateMatch[1];
    title = title.slice(0, dateMatch.index).trim();
  }

  if (identityKey(fileName) === "landscape1928picasso") {
    artist = "Picasso";
    title = "Landscape";
    year = year || "1928";
  }

  title = title || artist;
  const body = year ? `${artist}\nDated ${year}` : artist;

  return {
    artist,
    title,
    year,
    kind: "Legendary Artwork",
    body
  };
}

function chooseMetadata(cropMeta, fullMeta) {
  if (cropMeta.title === cropMeta.artist && fullMeta.title !== fullMeta.artist) {
    return fullMeta;
  }
  if (!cropMeta.year && fullMeta.year && cropMeta.title === fullMeta.title) {
    return fullMeta;
  }
  return cropMeta;
}

function cleanBase(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/_s\b/g, "'s")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+[.]+$/g, "")
    .trim();
}

function stripExtension(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

function formatDisplayFileName(fileName) {
  return stripExtension(fileName)
    .replace(/_s\b/g, "'s")
    .replace(/_/g, " ");
}

function identityKey(fileName) {
  return cleanBase(fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/unkown/gi, "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function tokenSet(fileName) {
  return new Set(
    cleanBase(fileName)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/unkown/gi, "unknown")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1)
  );
}

function urlFor(directory, fileName) {
  return `${directory}/${encodeURIComponent(fileName)}?v=${ASSET_VERSION}`;
}

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
    image.src = src;
  }).catch((error) => {
    imageCache.delete(src);
    throw error;
  });
  imageCache.set(src, promise);
  return promise;
}

function swapTexture(material, texture) {
  const previous = material.map;
  material.map = texture;
  if (previous) previous.dispose();
}

function randomEntry(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomIndex(max, avoid) {
  if (max <= 1) return 0;
  let next = avoid;
  while (next === avoid) {
    next = Math.floor(Math.random() * max);
  }
  return next;
}

function modulo(value, length) {
  return ((value % length) + length) % length;
}

function compareText(left, right) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function getDefaultCameraPosition() {
  return DEFAULT_TARGET.clone().addScaledVector(
    DEFAULT_CAMERA_DIRECTION,
    defaultCameraRadius
  );
}

function updateResponsiveCameraFrame(forcePosition = false) {
  if (!camera || !scenePanel || !fullArtLink) return;

  const previousRadius = defaultCameraRadius;
  const panelRect = scenePanel.getBoundingClientRect();
  const artRect = fullArtLink.getBoundingClientRect();
  const targetPixelHeight = artRect.height || panelRect.height * 0.62;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  defaultCameraRadius = clamp(
    (CARD_HEIGHT * panelRect.height) / (targetPixelHeight * 2 * Math.tan(fov / 2)),
    5.8,
    22.0
  );

  if (controls) {
    controls.minDistance = defaultCameraRadius * 0.74;
    controls.maxDistance = defaultCameraRadius * 1.36;
    controls.position0.copy(getDefaultCameraPosition());
  }

  const currentRadius = camera.position.distanceTo(DEFAULT_TARGET);
  const shouldReframe = forcePosition
    || currentArtIndex === -1
    || Math.abs(currentRadius - previousRadius) < 0.08;

  if (shouldReframe) {
    camera.position.copy(getDefaultCameraPosition());
    camera.up.copy(DEFAULT_CAMERA_UP);
    camera.lookAt(DEFAULT_TARGET);
  }
}

function resizeRenderer() {
  const rect = scenePanel.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  if (!width || !height) return;

  if (width !== lastRendererWidth || height !== lastRendererHeight) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    lastRendererWidth = width;
    lastRendererHeight = height;
  }

  updateResponsiveCameraFrame();
  if (controls) controls.handleResize();
  renderSceneOnce();
}

function queueResizeRenderer() {
  if (resizeFrame) return;

  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    resizeRenderer();
  });
}

function renderSceneOnce() {
  if (!renderer || !scene || !camera || !frontGloss || !backGloss) return;
  frontGloss.material.uniforms.uCameraPosition.value.copy(camera.position);
  backGloss.material.uniforms.uCameraPosition.value.copy(camera.position);
  renderer.render(scene, camera);
}

function startCameraSnap() {
  const eye = camera.position.clone().sub(controls.target);

  cameraSnap = {
    startedAt: null,
    eye,
    radius: THREE.MathUtils.clamp(
      eye.length(),
      controls.minDistance,
      controls.maxDistance
    ),
    target: controls.target.clone(),
    up: camera.up.clone()
  };
}

function cancelCameraSnap() {
  cameraSnap = null;
}

function updateCameraSnap(time) {
  if (!cameraSnap) return;

  if (cameraSnap.startedAt === null) {
    cameraSnap.startedAt = time;
  }

  const progress = Math.min((time - cameraSnap.startedAt) / SNAP_DURATION, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  controls.target.lerpVectors(cameraSnap.target, DEFAULT_TARGET, eased);
  camera.position.copy(controls.target).addScaledVector(
    slerpDirection(cameraSnap.eye, DEFAULT_CAMERA_DIRECTION, eased),
    cameraSnap.radius
  );
  camera.up.lerpVectors(cameraSnap.up, DEFAULT_CAMERA_UP, eased).normalize();
  camera.lookAt(controls.target);

  if (progress >= 1) {
    const finalRadius = cameraSnap.radius;
    cameraSnap = null;
    controls.target.copy(DEFAULT_TARGET);
    camera.position.copy(DEFAULT_TARGET).addScaledVector(
      DEFAULT_CAMERA_DIRECTION,
      finalRadius
    );
    camera.up.copy(DEFAULT_CAMERA_UP);
    camera.lookAt(DEFAULT_TARGET);
  }
}

function updateSmoothZoom() {
  if (!controls || Math.abs(smoothZoomVelocity) < 0.00001) {
    smoothZoomVelocity = 0;
    return;
  }

  const eye = camera.position.clone().sub(controls.target);
  const distance = eye.length();
  if (distance <= 0.0001) return;

  const nextDistance = clamp(
    distance * Math.exp(smoothZoomVelocity),
    controls.minDistance,
    controls.maxDistance
  );
  camera.position.copy(controls.target).add(
    eye.normalize().multiplyScalar(nextDistance)
  );
  camera.lookAt(controls.target);
  smoothZoomVelocity *= 0.82;
}

function slerpDirection(startVector, endDirection, progress) {
  const startLength = startVector.length();
  const start = startLength > 0.0001
    ? startVector.clone().divideScalar(startLength)
    : endDirection.clone();
  const end = endDirection.clone().normalize();
  const dot = THREE.MathUtils.clamp(start.dot(end), -1, 1);

  if (dot > 0.9995) {
    return start.lerp(end, progress).normalize();
  }

  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const startScale = Math.sin((1 - progress) * theta) / sinTheta;
  const endScale = Math.sin(progress * theta) / sinTheta;

  return start
    .multiplyScalar(startScale)
    .add(end.multiplyScalar(endScale))
    .normalize();
}

function animate(time = 0) {
  requestAnimationFrame(animate);
  controls.update();
  updateSmoothZoom();
  updateCameraSnap(time);

  const seconds = time * 0.001;
  frontGloss.material.uniforms.uTime.value = seconds;
  backGloss.material.uniforms.uTime.value = seconds;
  frontGloss.material.uniforms.uCameraPosition.value.copy(camera.position);
  backGloss.material.uniforms.uCameraPosition.value.copy(camera.position);
  renderer.render(scene, camera);
}
