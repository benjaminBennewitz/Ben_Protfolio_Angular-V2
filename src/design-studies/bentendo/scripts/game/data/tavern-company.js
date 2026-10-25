/** Lässt den mittleren Barhocker und einen Platz am Würfeltisch für den Spieler frei. */
export const GUEST_SEATS={
  keeper:{chair:'chair-a',facing:'up'},
  reader:{chair:'chair-b',facing:'down'},
  carpenter:{chair:'bar-stool-a',facing:'up'},
  fisher:{chair:'bar-stool-c',facing:'up'},
  weaver:{chair:'chair-c',facing:'up'},
};

export const TAVERN_CONVERSATIONS=[
  {people:['keeper','reader'],lines:[
    ['Die Gilde braucht neue Aushänge.','Dann bitte mit größerer Schrift.'],
    ['Die Tür klemmt nur, wenn jemand zusieht.','Das schreibe ich als Wartungsregel auf.'],
    ['Noch ein Kapitel, dann gehe ich heim.','Das hast du vor drei Kapiteln auch gesagt.'],
    ['Heute bleibt mein Schlüsselbund liegen.','Endlich mal ein ruhiger Abend.'],
  ]},
  {people:['carpenter','fisher'],lines:[
    ['Deine Bank am Ufer wackelt ein wenig.','Das ist kein Wackeln. Das ist Handarbeit.'],
    ['Hast du heute etwas gefangen?','Einen alten Knopf. Sehr ausdauernd war er.'],
    ['Für morgen wünsche ich mir trockenes Holz.','Und ich einen Fisch, der Hunger hat.'],
  ]},
  {people:['weaver','grandmother'],lines:[
    ['Dieser Saum hält bis zum Winter.','Gut. Meine Jacke hört nämlich nicht auf mich.'],
    ['Die Katze lag wieder auf meinem Stoff.','Sie prüft nur die Qualität. Sehr gründlich.'],
    ['Ein gerader Faden macht vieles leichter.','Ein warmer Tee auch.'],
  ]},
  {people:['mara','eda'],lines:[
    ['Morgen sehe ich mir die alten Aufzeichnungen an.','Ich bleibe heute lieber bei meinem Becher.'],
    ['Wie still es draußen geworden ist.','Hier drinnen hört man wenigstens echte Stimmen.'],
  ]},
];
