/**
 * Two Lives, One Calling — Saul/Paul & Barnabas side by side.
 *
 * Thirteen paired scenes telling both stories in parallel: where each
 * man was at that moment, what he was doing, and whether their roads
 * ran together or apart. Drawn from Pastor Fidele's Barnabas research.
 * Bilingual (EN + Kinyarwanda drafts), coordinate order [lon, lat].
 */

export interface DuoSide {
  lon: number;
  lat: number;
  place: string;
  place_rw: string;
  modern: string;
  text: string;
  text_rw: string;
}

export interface DuoStage {
  id: string;
  year: number;
  yearLabel: string;
  title: string;
  title_rw: string;
  ref: string;
  chapter: number;
  verse: number;
  together: boolean;
  paul: DuoSide;
  barnabas: DuoSide;
}

export const DUO_COLORS = { paul: '#8B4F9F', barnabas: '#D97742' } as const;

export const DUO_STAGES: DuoStage[] = [
  {
    id: 'births', year: 5, yearLabel: 'c. AD 5', together: false,
    title: 'Born across the same sea', title_rw: 'Bavukira hakurya no hakurya y\'inyanja imwe',
    ref: 'Acts 22:3 · 4:36', chapter: 22, verse: 3,
    paul: { lon: 34.8956, lat: 36.9168, place: 'Tarsus, Cilicia', place_rw: 'Taruso, Kilikiya', modern: 'Tarsus, Türkiye',
      text: 'Born Saul in Tarsus — a Hellenistic Jew and a Roman citizen from birth, raised in a famous center of learning and trade.',
      text_rw: 'Avuka yitwa Sawuli i Taruso — Umuyahudi akaba n\'umuturage w\'Abaroma kuva avuka, akurira mu mugi w\'ubumenyi.' },
    barnabas: { lon: 33.9010, lat: 35.1810, place: 'Cyprus (Salamis)', place_rw: 'Kupuro (Salami)', modern: 'near Famagusta, Cyprus',
      text: 'Born Joseph, a Levite of the wealthy Jewish community of Cyprus — at home in the Greek world and in the Scriptures.',
      text_rw: 'Avuka yitwa Yosefu, Umulewi wo mu muryango w\'Abayahudi b\'abakire bo muri Kupuro — azi isi y\'Ikigereki n\'Ibyanditswe.' },
  },
  {
    id: 'training', year: 20, yearLabel: 'c. AD 15–30', together: false,
    title: 'Two kinds of training', title_rw: 'Uburyo bubiri bwo gutozwa',
    ref: 'Acts 22:3 · 4:36', chapter: 22, verse: 3,
    paul: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'Sent to Jerusalem to study under Gamaliel — trained in the strictest tradition of the Pharisees, zealous for the law.',
      text_rw: 'Yoherezwa i Yerusalemu kwiga kuri Gamaliyeli — atozwa umuco ukomeye w\'Abafarisayo, afite ishyaka ry\'amategeko.' },
    barnabas: { lon: 35.2450, lat: 31.7860, place: 'Jerusalem & Cyprus', place_rw: 'Yerusalemu na Kupuro', modern: 'Jerusalem, Israel',
      text: 'Raised a Levite, trained to serve the house of God; his family kept a praying home in Jerusalem — the house of Mary, mother of John Mark.',
      text_rw: 'Arerwa nk\'Umulewi, atozwa gukorera inzu y\'Imana; umuryango we wari ufite urugo rw\'amasengesho i Yerusalemu — urugo rwa Mariya.' },
  },
  {
    id: 'opposite', year: 31, yearLabel: 'AD 30–33', together: false,
    title: 'Opposite answers to Jesus', title_rw: 'Ibisubizo binyuranye kuri Yesu',
    ref: 'Acts 4:36–37 · 7:58', chapter: 4, verse: 36,
    paul: { lon: 35.2380, lat: 31.7800, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'Young Saul guards the cloaks at Stephen\'s stoning and begins dragging believers to prison — zeal turned violent.',
      text_rw: 'Sawuli arinda imyenda igihe Stefano aterwa amabuye, atangira gukurura abizera abajyana muri gereza.' },
    barnabas: { lon: 35.2200, lat: 31.7700, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'Joseph sells his field and lays the money at the apostles\' feet — they rename him Barnabas, Son of Encouragement.',
      text_rw: 'Yosefu agurisha umurima we ashyira amafaranga ku birenge by\'intumwa — zimwita Barinaba, Umwana w\'Ihumure.' },
  },
  {
    id: 'damascus', year: 35.5, yearLabel: 'c. AD 35–37', together: false,
    title: 'Damascus — and discernment', title_rw: 'Damasiko — no kumenya iby\'Imana',
    ref: 'Acts 9:1–19', chapter: 9, verse: 3,
    paul: { lon: 36.3064, lat: 33.5130, place: 'Damascus', place_rw: 'Damasiko', modern: 'Damascus, Syria',
      text: 'The risen Christ stops him on the road: "Saul, Saul…" Blinded, baptized, transformed — then hidden years in Arabia.',
      text_rw: 'Kristo wazutse amuhagarika mu nzira: "Sawuli, Sawuli…" Arahumywa, arabatizwa, arahindurwa — hanyuma imyaka yo kwiherera muri Buharabu.' },
    barnabas: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'In Jerusalem, Barnabas grows into a trusted pillar — generous, Spirit-filled, with eyes that recognize what God is doing.',
      text_rw: 'I Yerusalemu, Barinaba aba inkingi yizewe — w\'umugiraneza, wuzuye Umwuka, ufite amaso amenya umurimo w\'Imana.' },
  },
  {
    id: 'advocate', year: 38, yearLabel: 'c. AD 38', together: true,
    title: 'The advocate — their first meeting', title_rw: 'Umuvuganira — guhura kwabo kwa mbere',
    ref: 'Acts 9:26–27', chapter: 9, verse: 27,
    paul: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'Back in Jerusalem, every door closes — the disciples cannot believe the persecutor is now a brother.',
      text_rw: 'Agarutse i Yerusalemu, imiryango yose iramwugarira — abigishwa ntibemera ko uwarenganyaga ubu ari umuvandimwe.' },
    barnabas: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'One man opens the door: Barnabas takes him, brings him to the apostles, and stakes his own name on Saul\'s conversion.',
      text_rw: 'Umuntu umwe arafungura: Barinaba aramufata, amushyikiriza intumwa, atanga izina rye ku bw\'ihinduka rya Sawuli.' },
  },
  {
    id: 'waiting', year: 41, yearLabel: 'AD 38–44', together: false,
    title: 'The waiting and the working', title_rw: 'Gutegereza no gukora',
    ref: 'Acts 9:30 · 11:22–24', chapter: 11, verse: 22,
    paul: { lon: 34.8956, lat: 36.9168, place: 'Tarsus', place_rw: 'Taruso', modern: 'Tarsus, Türkiye',
      text: 'Sent home to Tarsus for his safety — long, silent years of preparation that the map remembers and we forget.',
      text_rw: 'Yoherezwa iwabo i Taruso kugira ngo akire — imyaka miremire y\'ituze yo gutegurwa.' },
    barnabas: { lon: 36.1612, lat: 36.2021, place: 'Antioch', place_rw: 'Antiyokiya', modern: 'Antakya, Türkiye',
      text: 'Sent to inspect the first Gentile church at Antioch, he sees the grace of God and is glad — the bridge-builder at work.',
      text_rw: 'Yoherejwe gusuzuma itorero rya mbere ry\'Abanyamahanga i Antiyokiya, abona ubuntu bw\'Imana arishima.' },
  },
  {
    id: 'retrieval', year: 45, yearLabel: 'c. AD 45', together: true,
    title: 'The retrieval — Antioch together', title_rw: 'Gushakwa — Antiyokiya bari kumwe',
    ref: 'Acts 11:25–26', chapter: 11, verse: 25,
    paul: { lon: 36.1612, lat: 36.2021, place: 'Antioch', place_rw: 'Antiyokiya', modern: 'Antakya, Türkiye',
      text: 'Found! The forgotten man of Tarsus is brought to the great Gentile church — his calling finally has an address.',
      text_rw: 'Yabonetse! Uwari waribagiranye i Taruso azanwa mu itorero rikomeye ry\'Abanyamahanga — umuhamagaro we ubona aho ukorera.' },
    barnabas: { lon: 36.1612, lat: 36.2021, place: 'Antioch', place_rw: 'Antiyokiya', modern: 'Antakya, Türkiye',
      text: 'Barnabas leaves a thriving revival to go find Saul. A whole year they teach together — and the disciples are first called Christians.',
      text_rw: 'Barinaba asiga ivugabutumwa ajya gushaka Sawuli. Umwaka wose bigisha hamwe — abigishwa bitirirwa Abakristo bwa mbere.' },
  },
  {
    id: 'famine', year: 46.3, yearLabel: 'AD 46', together: true,
    title: 'Grace carried in both hands', title_rw: 'Ubuntu butwawe mu maboko yombi',
    ref: 'Acts 11:29–30', chapter: 11, verse: 29,
    paul: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'Together they carry the famine relief from the Gentile daughter church to the Jewish mother church in Jerusalem.',
      text_rw: 'Bajyana hamwe imfashanyo y\'inzara, bayivana mu itorero ry\'Abanyamahanga bayigeza ku itorero rya Yerusalemu.' },
    barnabas: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'The man who once gave his own field now delivers the nations\' gift — grace flowing back along the road it came.',
      text_rw: 'Uwigeze gutanga umurima we ubu azana impano y\'amahanga — ubuntu busubira inyuma mu nzira bwazanywemo.' },
  },
  {
    id: 'sent', year: 47.5, yearLabel: 'AD 47–48', together: true,
    title: 'Sent out by the Spirit', title_rw: 'Boherezwa n\'Umwuka',
    ref: 'Acts 13:1–12', chapter: 13, verse: 2,
    paul: { lon: 32.4070, lat: 34.7570, place: 'Paphos, Cyprus', place_rw: 'Pafo, Kupuro', modern: 'Paphos, Cyprus',
      text: 'At Paphos, Saul steps forward as Paul — confronting the sorcerer, winning the proconsul. The order of names quietly reverses.',
      text_rw: 'I Pafo, Sawuli atangira kwitwa Pawulo — anesha umurozi, guverineri arizera. Urutonde rw\'amazina rurahinduka.' },
    barnabas: { lon: 32.4070, lat: 34.7570, place: 'Paphos, Cyprus', place_rw: 'Pafo, Kupuro', modern: 'Paphos, Cyprus',
      text: '"Set apart for me Barnabas and Saul." The journey begins on his home island — and the encourager watches his protégé rise, rejoicing.',
      text_rw: '"Muntoranyirize Barinaba na Sawuli." Urugendo rutangirira ku kirwa cye — umuhumuriza areba uwo yatoje azamuka, arishima.' },
  },
  {
    id: 'lystra', year: 48.4, yearLabel: 'AD 48', together: true,
    title: 'Zeus and Hermes', title_rw: 'Zewu na Herume',
    ref: 'Acts 14:8–20', chapter: 14, verse: 12,
    paul: { lon: 32.4537, lat: 37.5786, place: 'Lystra', place_rw: 'Lusitira', modern: 'near Hatunsaray, Türkiye',
      text: 'Hailed as Hermes the spokesman, then stoned and left for dead — he rises and walks straight back into the city.',
      text_rw: 'Bamwita Herume uvuga, hanyuma bamutera amabuye bamusiga nk\'uwapfuye — arahaguruka asubira mu mugi.' },
    barnabas: { lon: 32.4537, lat: 37.5786, place: 'Lystra', place_rw: 'Lusitira', modern: 'near Hatunsaray, Türkiye',
      text: 'Mistaken for Zeus — the commanding presence beside the fiery preacher. He stands with Paul through the stoning.',
      text_rw: 'Bamwita Zewu — uw\'icyubahiro uri iruhande rw\'umubwiriza w\'umuriro. Ahagarara na Pawulo mu kugerwaho n\'amabuye.' },
  },
  {
    id: 'council', year: 49.2, yearLabel: 'AD 49', together: true,
    title: 'Grace defended together', title_rw: 'Ubuntu buvuganirwa hamwe',
    ref: 'Acts 15:1–35', chapter: 15, verse: 12,
    paul: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'Paul testifies that God saves the Gentiles by faith, apart from the works of the law.',
      text_rw: 'Pawulo ahamya ko Imana ikiza Abanyamahanga ku bwo kwizera, atari ku mirimo y\'amategeko.' },
    barnabas: { lon: 35.2298, lat: 31.7767, place: 'Jerusalem', place_rw: 'Yerusalemu', modern: 'Jerusalem, Israel',
      text: 'Barnabas stands beside him before the apostles and elders — and the council agrees: salvation is by grace alone.',
      text_rw: 'Barinaba ahagarara iruhande rwe imbere y\'intumwa n\'abakuru — inama yemeza: agakiza kaza ku buntu gusa.' },
  },
  {
    id: 'parting', year: 50.2, yearLabel: 'c. AD 50', together: false,
    title: 'The sharp parting', title_rw: 'Gutandukana gukomeye',
    ref: 'Acts 15:36–41', chapter: 15, verse: 39,
    paul: { lon: 34.8956, lat: 36.9168, place: 'Syria & Cilicia', place_rw: 'Siriya na Kilikiya', modern: 'Tarsus region, Türkiye',
      text: 'Paul chooses Silas and strengthens the churches overland — and years later asks for Mark again: "he is useful to me."',
      text_rw: 'Pawulo atora Sila, akomeza amatorero ku butaka — nyuma y\'imyaka asaba Mariko: "aramfitiye umumaro."' },
    barnabas: { lon: 33.9010, lat: 35.1810, place: 'Cyprus', place_rw: 'Kupuro', modern: 'Cyprus',
      text: 'Barnabas refuses to abandon John Mark and sails home — one painful disagreement, two mission teams instead of one.',
      text_rw: 'Barinaba yanga kureka Mariko basubira iwabo mu bwato — ukutumvikana kumwe gukomeye, amatsinda abiri y\'ubutumwa aho kuba rimwe.' },
  },
  {
    id: 'legacies', year: 63, yearLabel: 'AD 61–67', together: false,
    title: 'Two legacies', title_rw: 'Imirage ibiri',
    ref: '1 Cor 9:6 · tradition', chapter: 0, verse: 0,
    paul: { lon: 12.4823, lat: 41.8933, place: 'Rome', place_rw: 'Roma', modern: 'Rome, Italy',
      text: 'Chains, epistles, the kingdom preached unhindered at the heart of the empire — tradition says he was beheaded under Nero, his race finished.',
      text_rw: 'Iminyururu, inzandiko, ubwami bubwirizwa nta nkomyi mu mutima w\'ubwami — umugenzo uvuga ko yaciwe umutwe ku ngoma ya Nero.' },
    barnabas: { lon: 33.9010, lat: 35.1810, place: 'Salamis, Cyprus', place_rw: 'Salami, Kupuro', modern: 'near Famagusta, Cyprus',
      text: 'Tradition holds he was martyred at Salamis and buried by Mark — the encourager\'s road ended where it began, and his legacy lives in every life he refused to give up on.',
      text_rw: 'Umugenzo uvuga ko yapfiriye ukwemera i Salami, Mariko amuhamba — inzira y\'umuhumuriza irangirira aho yatangiriye.' },
  },
];
