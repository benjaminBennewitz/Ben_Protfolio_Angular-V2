import { prop } from './town.js';

export const VILLAGE_SIZE = {width:34,height:32};
export const GARDENS = [
  {x:8,y:7,w:2,h:1,kind:'f'},
  {x:2,y:15,w:2,h:2,kind:'f'}, {x:8,y:2,w:1,h:5,kind:'f'},
  {x:14,y:16,w:2,h:3,kind:'h'}, {x:2,y:17,w:6,h:4,kind:'t'},
  {x:30,y:9,w:2,h:3,kind:'f'}, {x:19,y:28,w:4,h:2,kind:'f'},
  {x:26,y:25,w:6,h:5,kind:'t'}, {x:31,y:17,w:1,h:5,kind:'h'},
  {x:19,y:2,w:7,h:2,kind:'h'}, {x:19,y:4,w:7,h:1,kind:'t'},
  {x:26,y:2,w:6,h:2,kind:'t'}, {x:23,y:5,w:2,h:3,kind:'h'},
  {x:23,y:8,w:3,h:4,kind:'t'}, {x:2,y:4,w:6,h:4,kind:'t'},
  {x:25,y:14,w:4,h:4,kind:'t'}, {x:19,y:20,w:4,h:2,kind:'t'},
];

/** Ergänzt kurze Alltagsbegegnungen, Tiere und benannte Hauszugänge. */
export function createResidents() {
  return [
    prop('weaver-door','Webstube',28,8,'door','travel',{to:'village-weaver',text:'Im Fenster liegen Stoffballen. Von drinnen hört man den gleichmäßigen Schlag eines Webstuhls.'}),
    prop('home-door','Wohnhaus',28,22,'door','travel',{to:'village-home',text:'Auf dem Türschild steht: Familie Moos. Daneben hängt ein kleiner Kranz.'}),
    prop('workshop-door','Werkstatt',5,25,'door','travel',{to:'village-workshop',text:'Zwischen Werkzeug und Holzspänen steht eine halbfertige Bank. Der Handwerker ist am Kanal.'}),
    prop('market-door','Marktlager',21,25,'door','travel',{to:'village-market',text:'Kartoffeln, Mehlsäcke und Reisekisten. Für heute ist der Markt geschlossen.'}),
    prop('fisher','Anglerin',20,19,'resident','talk',{appearance:[0,320],text:'Seit das Wehr klemmt, beißt hier nichts mehr. Jedenfalls ist das meine Erklärung.',flowText:'Das Wasser läuft wieder. Jetzt brauche ich wohl eine neue Erklärung, wenn nichts anbeißt.'}),
    prop('weaver','Weberin',29,10,'resident','talk',{appearance:[156,496],text:'Die Banner an der Gilde? Meine Arbeit. Der Hausmeister bestellt jedes Jahr neue.'}),
    prop('carpenter','Handwerker',22,16,'resident','talk',{appearance:[156,144],text:'Das Rad hört man sonst bis zu meiner Werkstatt. Heute ist es seltsam still.',flowText:'Da ist es ja wieder, das alte Mühlrad. Klingt gleich viel mehr nach Bruchstein.'}),
    prop('reader','Leserin',7,28,'resident','talk',{appearance:[312,304],text:'Ich lese gerade einen Reisebericht. So erlebt man Abenteuer mit trockenen Füßen.'}),
    prop('dog','Hund',25,24,'dog','inspect',{route:[[25,24],[25,25],[26,25],[26,24]],text:'Er spitzt die Ohren. Mit einem Ast könntest du hier mit ihm spielen.'}),
    ...createWildlife(),
    prop('cat-east','Katze',30,23,'cat','inspect',{route:[[30,23],[31,23],[31,24],[30,24]],text:'Sie bewacht den Hauseingang. Vermutlich hält sie sich für die Eigentümerin.'}),
  ];
}

/** Platziert die neuen Kleintiere bei Bäumen, hoher Wiese und Vorräten. */
function createWildlife() {
  return [
    prop('squirrel','Eichhörnchen',27,15,'wildlife','inspect',{animal:'squirrel',route:[[27,15],[28,15],[28,16],[27,16]],text:'Es hält kurz inne und mustert dich. Dann wird die Suche nach Nüssen fortgesetzt.'}),
    prop('hedgehog','Igel',5,18,'wildlife','inspect',{animal:'hedgehog',route:[[5,18],[6,18],[6,19],[5,19]],text:'Im hohen Gras raschelt es. Ein Igel schiebt sich gemütlich zwischen den Halmen hindurch.'}),
    prop('mouse','Maus',19,28,'wildlife','inspect',{animal:'mouse',route:[[19,28],[20,28],[20,29],[19,29]],text:'Ein schneller Blick, ein Zucken der Nase. Die Vorräte im Lager scheinen interessant zu sein.'}),
    prop('squirrel-north','Eichhörnchen',27,2,'wildlife','inspect',{animal:'squirrel',route:[[27,2],[28,2],[29,2],[29,3],[28,3],[27,3]],text:'Zwischen den Halmen hält es eine Nuss fest. Ein kurzer Laut, dann wird weitergesucht.'}),
    prop('mouse-mill','Maus',25,8,'wildlife','inspect',{animal:'mouse',route:[[25,8],[25,9],[24,9],[24,8]],text:'Sie huscht im Gras hinter der Mühle umher. Offenbar kennt sie jedes Versteck.'}),
  ];
}
