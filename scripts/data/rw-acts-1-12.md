# Claude Prompt: Add Draft Kinyarwanda Acts 1–12 Scripture Text

Please update the Acts Platform Kinyarwanda Scripture dataset.

Repository:
https://github.com/fidelebolton/Acts-platform

Live site:
https://acts-platform.netlify.app/

## Goal
Replace the Kinyarwanda placeholder Scripture text for Acts 1–12 with the draft Kinyarwanda translation below. Keep Acts 13–28 as placeholders for now.

## Copyright / source rules
- Do **not** use Bibiliya Yera or any copyrighted Kinyarwanda Bible text.
- Do **not** scrape YouVersion, Bible.com, Bible Gateway, Bible apps, or any online Kinyarwanda Bible.
- This is a **new draft Kinyarwanda translation based on a public-domain English Bible source**.
- Label it clearly in the site as a draft, not as Bibiliya Yera.
- Do not call the translated Kinyarwanda text “World English Bible,” because it is a derivative translation/adaptation.

Recommended attribution label in Kinyarwanda:

> Inyandiko y’agateganyo mu Kinyarwanda, ihinduwe hashingiwe ku mwandiko wa Bibiliya y’Icyongereza iri muri public domain. Si Bibiliya Yera. Iyi nyandiko iracyakeneye gusuzumwa.

Recommended short footer source label:

> Ibyanditswe: Inyandiko y’agateganyo y’Ikinyarwanda — igomba gusuzumwa

## Implementation instructions
1. Open the existing Kinyarwanda Scripture file, likely:
   - `public/data/scripture/rw/acts.json`
2. Replace only Acts chapters 1–12 with real verse blocks from the draft below.
3. Keep existing Kinyarwanda UI, panel names, and map/timeline translation unchanged.
4. Keep English mode unchanged.
5. Do not silently fall back to English when Kinyarwanda is selected.
6. For Acts 13–28, keep the current placeholder text.
7. Preserve the existing schema:
   - heading blocks: `{ type: "heading", text: "..." }`
   - verse blocks: `{ type: "verse", chapter, number, text, html, panel, id }`
   - ids should be like `act-1-1`, `act-2-14`, etc.
8. `html` may be the same as `text`, but escape quotation marks properly if using JSON.
9. After implementation, run:
   - `npm install`
   - `npm run build`
10. Report every file changed and confirm the build passes.

---

# Draft Kinyarwanda Scripture Text: Ibyakozwe n’Intumwa 1–12

## Ibyakozwe n’Intumwa 1

### Intangiriro

1 Mu gitabo cya mbere nanditse, Tewofilo, navuze ibyerekeye ibyo Yesu yatangiye gukora no kwigisha byose,

2 kugeza ku munsi yazamuriweho mu ijuru, amaze guha amategeko intumwa yari yaratoranyije, abinyujije mu Mwuka Wera.

3 Na bo yabiyeretse ari muzima nyuma yo kubabazwa kwe, abereka ibimenyetso byinshi bitabeshya. Yababonekeye mu gihe cy’iminsi mirongo ine, ababwira iby’Ubwami bw’Imana.

4 Igihe yari ateraniye hamwe na bo, yabategetse ati: “Ntimuzave i Yerusalemu, ahubwo mutegereze isezerano rya Data, iryo mwanyumvanye.

5 Kuko Yohana yabatirishije amazi, ariko mwe muzabatirishwa Umwuka Wera mu minsi mike iri imbere.”

### Kuzamuka kwa Yesu mu ijuru

6 Nuko bamaze guteranira hamwe, baramubaza bati: “Mwami, iki ni cyo gihe ugiye kugaruriramo Isirayeli ubwami?”

7 Arababwira ati: “Si ibyanyu kumenya ibihe cyangwa ibihe byagenwe, ibyo Data yashyize mu bubasha bwe bwite.

8 Ariko muzahabwa imbaraga Umwuka Wera nabazaho, kandi muzambera abagabo bo kumpamya i Yerusalemu, no muri Yudaya yose, no muri Samariya, no kugeza ku mpera y’isi.”

9 Amaze kuvuga ibyo, azamurwa babireba, maze igicu kimukura imbere y’amaso yabo.

10 Bakiri bahanze amaso mu ijuru, uko yagendaga, dore abagabo babiri bambaye imyenda yera bahagarara iruhande rwabo.

11 Barababwira bati: “Bagabo b’i Galilaya, ni iki gitumye muhagarara mureba mu ijuru? Uyu Yesu, ubakuweho akajyanwa mu ijuru, azagaruka atyo nk’uko mumubonye ajya mu ijuru.”

### Matia atoranywa gusimbura Yuda

12 Nuko basubira i Yerusalemu bavuye ku musozi witwa Elayono, uri hafi ya Yerusalemu, ku rugendo rwemewe ku munsi w’Isabato.

13 Bamaze kuhagera, bazamuka mu cyumba cyo hejuru bari bacumbitsemo. Abo ni Petero, Yohana, Yakobo, Andereya, Filipo, Tomasi, Barutolomayo, Matayo, Yakobo mwene Alufayo, Simoni Zelote, na Yuda mwene Yakobo.

14 Aba bose bakomezaga gusenga bahuje umutima, bari kumwe n’abagore, na Mariya nyina wa Yesu, hamwe na bene se.

15 Muri iyo minsi, Petero arahaguruka hagati y’abigishwa, umubare w’abantu bari bateraniye hamwe wari nka ijana na makumyabiri, aravuga ati:

16 “Bagabo bene Data, byari ngombwa ko Ibyanditswe bisohora, ibyo Umwuka Wera yavugiye mbere mu kanwa ka Dawidi ku byerekeye Yuda, wabaye umuyobozi w’abafashe Yesu.

17 Kuko yari abarirwaga muri twe, kandi yari yarahawe umugabane muri uyu murimo.”

18 Uwo muntu yaguze umurima akoresheje igihembo cyo gukiranirwa kwe. Nuko agwa acuritse, araturika hagati, amara ye yose arasohoka.

19 Ibyo bimenyekana ku bantu bose batuye i Yerusalemu, bituma uwo murima mu rurimi rwabo witwa Akeludama, ni ukuvuga “Umurima w’amaraso.”

20 “Kuko byanditswe mu gitabo cya Zaburi ngo: ‘Inzu ye ibe umusaka, kandi ntihakagire uyituramo.’ Kandi ngo: ‘Undi afate inshingano ye.’

21 Ni cyo gituma, mu bagabo twagendanaga igihe cyose Umwami Yesu yinjiraga kandi agasohoka muri twe,

22 uhereye ku mubatizo wa Yohana kugeza ku munsi yakuriweho akajyanwa mu ijuru, hagomba kuba umwe muri bo uba umugabo wo guhamya hamwe natwe izuka rye.”

23 Nuko bashyira imbere babiri: Yozefu witwaga Barisaba, wari ufite irindi zina rya Yusito, na Matia.

24 Barasenga bati: “Mwami, wowe umenya imitima ya bose, erekana uwo watoranyije muri aba bombi,

25 kugira ngo afate umwanya muri uyu murimo w’ubutumwa, uwo Yuda yaretse akajya mu mwanya we bwite.”

26 Nuko babagabanyaho ubufindo, ubufindo bugwa kuri Matia, abarirwa hamwe n’intumwa cumi n’imwe.

---

## Ibyakozwe n’Intumwa 2

### Umwuka Wera kuri Pentekote

1 Umunsi wa Pentekote ugeze, bose bari bateraniye hamwe ahantu hamwe bahuje umutima.

2 Nuko bitunguranye haturuka mu ijuru ijwi rimeze nk’iry’umuyaga ukomeye uhuha, ryuzura inzu yose bari bicayemo.

3 Babona indimi zimeze nk’umuriro, zigabanywa, ururimi rumwe rujya kuri buri wese muri bo.

4 Bose buzuzwa Umwuka Wera, batangira kuvuga mu zindi ndimi, nk’uko Umwuka yabahaga kuzivuga.

5 I Yerusalemu hari Abayuda, abantu bubaha Imana, bavuye mu mahanga yose ari munsi y’ijuru.

6 Iryo jwi ryumvikanye, imbaga y’abantu iraterana, irumirwa, kuko buri wese yumvaga bavuga mu rurimi rwe bwite.

7 Bose baratangara cyane, barumirwa, barabazanya bati: “Aba bose bavuga si Abagalilaya?

8 None se ni gute buri wese muri twe abumva bavuga mu rurimi rwe kavukire?

9 Abapariti, Abamedi, Abelamu, n’abatuye Mezopotamiya, Yudaya, Kapadokiya, Ponto na Aziya,

10 Furigiya na Pamfiliya, Egiputa n’ibice bya Libiya biherereye hafi ya Kurene, n’abashyitsi bavuye i Roma, Abayuda n’abahindukiriye idini ryabo,

11 Abakirete n’Abarabu, turabumva bavuga mu ndimi zacu imirimo ikomeye y’Imana!”

12 Bose baratangara, barayoberwa, barabazanya bati: “Ibi bivuze iki?”

13 Ariko abandi barabaseka bati: “Basinze divayi nshya.”

### Petero abwira imbaga y’abantu

14 Ariko Petero arahagarara hamwe na ba bandi cumi n’umwe, arangurura ijwi arababwira ati: “Bagabo b’i Yudaya namwe mwese mutuye i Yerusalemu, ibi mubimenye kandi mwumve amagambo yanjye.

15 Aba ntibasinze nk’uko mubitekereza, kuko ari isaha ya gatatu y’umunsi.

16 Ahubwo ibi ni byo byavuzwe n’umuhanuzi Yoweli ati:

17 ‘Mu minsi y’imperuka, ni ko Imana ivuga, nzasuka Umwuka wanjye ku bantu bose. Abahungu banyu n’abakobwa banyu bazahanura, abasore banyu bazabona iyerekwa, kandi abakambwe banyu bazarota inzozi.

18 No ku bagaragu banjye b’abagabo n’abagore, muri iyo minsi nzabasukaho Umwuka wanjye, na bo bazahanura.

19 Nzerekana ibitangaza hejuru mu ijuru, n’ibimenyetso hasi ku isi: amaraso, umuriro, n’ibicu by’umwotsi.

20 Izuba rizahinduka umwijima, ukwezi guhinduke amaraso, mbere y’uko umunsi ukomeye kandi ufite ubwiza w’Umwami uza.

21 Kandi umuntu wese uzambaza izina ry’Umwami azakizwa.’

22 “Bagabo b’Abisirayeli, nimwumve aya magambo: Yesu w’i Nazareti, umugabo Imana yabahamirishije imirimo ikomeye, ibitangaza n’ibimenyetso Imana yamukoresheje hagati yanyu, nk’uko namwe mubizi,

23 uwo muntu, watanzwe hakurikijwe inama yagenwe n’ubumenyi bw’Imana bwa mbere, mwaramufashe mumubambisha amaboko y’abantu batagira amategeko, muramwica.

24 Ariko Imana yaramuzuye, imubohora imigozi y’urupfu, kuko bitashobokaga ko urupfu rumugumana.

25 Kuko Dawidi amuvugaho ati: ‘Nabonaga Umwami imbere yanjye iteka ryose, kuko ari iburyo bwanjye kugira ngo ntanyeganyezwa.

26 Ni cyo gituma umutima wanjye wishimye, ururimi rwanjye rukanezerwa; kandi umubiri wanjye uzaruhukira mu byiringiro.

27 Kuko utazasiga ubugingo bwanjye ikuzimu, kandi ntuzemera ko Uwera wawe abona kubora.

28 Wamenyesheje inzira z’ubugingo; uzanyuzuzamo umunezero imbere yawe.’

29 “Bene Data, reka mbabwire ntihishira ibyerekeye sogokuruza Dawidi: yarapfuye, arahambwa, kandi imva ye iri iwacu kugeza n’uyu munsi.

30 Nuko rero, kuko yari umuhanuzi, kandi yari azi ko Imana yamurahiriye indahiro ko izashyira umwe mu rubyaro rwe ku ntebe ye y’ubwami,

31 yabibonye mbere, avuga iby’izuka rya Kristo, ko atarekewe ikuzimu kandi ko umubiri we utabonye kubora.

32 Uwo Yesu Imana yaramuzuye, kandi ibyo twese turi abagabo bo kubihamya.

33 Nuko amaze kuzamurwa akajya iburyo bw’Imana, kandi amaze guhabwa na Data isezerano ry’Umwuka Wera, asutse ibyo mureba kandi mwumva ubu.

34 Kuko Dawidi atazamutse ngo ajye mu ijuru, ariko ubwe avuga ati: ‘Umwami yabwiye Umwami wanjye ati: Icara iburyo bwanjye,

35 kugeza aho nzashyirira abanzi bawe munsi y’ibirenge byawe.’

36 “Nuko inzu yose ya Isirayeli imenye neza ko Imana yagize Umwami na Kristo uwo Yesu mwabambye.”

### Abantu ibihumbi bitatu bizera

37 Bamaze kubyumva, bacumitwa mu mitima, babwira Petero n’izindi ntumwa bati: “Bagabo bene Data, dukore iki?”

38 Petero arababwira ati: “Mwihane, kandi buri wese muri mwe abatizwe mu izina rya Yesu Kristo kugira ngo mubabarirwe ibyaha byanyu, namwe muzahabwa impano y’Umwuka Wera.

39 Kuko isezerano ari iryanyu n’abana banyu, n’abari kure bose, abo Umwami Imana yacu azihamagarira.”

40 Kandi n’andi magambo menshi arabahamiriza, arabinginga ati: “Mukizwe muri uru rubyaro rugoramye.”

41 Nuko abemeye ijambo rye barabatizwa, uwo munsi hiyongeraho abantu bagera ku bihumbi bitatu.

### Ubuzima bw’abizera ba mbere

42 Bakomezaga gushishikarira inyigisho z’intumwa, gusabana, kumanyagura umutsima, no gusenga.

43 Ubwoba butera buri wese, kandi ibitangaza n’ibimenyetso byinshi bikorerwa mu ntumwa.

44 Abizeye bose bari hamwe, bagasangira ibyo batunze byose.

45 Bagurishaga ibyabo n’ibintu byabo, bakabigabanya bose, hakurikijwe uko umuntu wese akeneye.

46 Buri munsi bakomezaga guteranira mu rusengero bahuje umutima; bagamanyaguriraga umutsima mu ngo zabo, bagasangira ibyokurya bishimye kandi bafite imitima itunganye,

47 bashima Imana, bagakundwa n’abantu bose. Kandi Umwami yongeraga buri munsi ku iteraniro abari gukizwa.

---

## Ibyakozwe n’Intumwa 3

### Umuntu wamugaye akizwa ku irembo ry’urusengero

1 Petero na Yohana bazamukaga bajya mu rusengero ku isaha yo gusenga, isaha ya cyenda.

2 Hari umuntu wari waravutse amugaye, bahekwaga buri munsi bakamushyira ku irembo ry’urusengero ryitwaga Ryiza, kugira ngo asabe imfashanyo abinjiraga mu rusengero.

3 Abonye Petero na Yohana bagiye kwinjira mu rusengero, abasaba imfashanyo.

4 Petero, ari kumwe na Yohana, amuhanze amaso aramubwira ati: “Turebe.”

5 Na we arabitaho, yiteze ko hari icyo bamuha.

6 Ariko Petero aravuga ati: “Ifeza n’izahabu nta byo mfite; ariko icyo mfite ni cyo nguha. Mu izina rya Yesu Kristo w’i Nazareti, haguruka ugende!”

7 Amufata ukuboko kw’iburyo, aramuhagurutsa. Ako kanya ibirenge bye n’amagufwa y’ibirenge bye birakomera.

8 Asimbuka, arahagarara, atangira kugenda; yinjirana na bo mu rusengero agenda, asimbuka, ashima Imana.

9 Abantu bose bamubona agenda kandi ashima Imana.

10 Bamenya ko ari we wajyaga yicara ku Irembo Ryiza ry’urusengero asaba imfashanyo, buzuye gutangara no kumirwa kubera ibyari bimubayeho.

### Petero yigisha muri Portiko ya Salomo

11 Wa muntu wari wakijijwe akomeje gufata Petero na Yohana, abantu bose birukira aho bari muri portiko yitwaga iya Salomo, batangaye cyane.

12 Petero abibonye, abwira abantu ati: “Bagabo b’Abisirayeli, ni iki gitumye mutangarira uyu muntu? Kuki muduhanze amaso nk’aho ari imbaraga zacu cyangwa kubaha Imana kwacu byatumye agenda?

13 Imana ya Aburahamu, Isaka na Yakobo, Imana ya ba sogokuruza, yahaye icyubahiro Umugaragu wayo Yesu, uwo mwatanze mukamwihakana imbere ya Pilato, nubwo yari yemeje kumurekura.

14 Ariko mwe mwihakanye Uwera kandi Ukiranuka, musaba ko murekurirwa umwicanyi,

15 mwica Umuyobozi w’ubugingo, uwo Imana yazuye mu bapfuye; natwe turi abagabo bo kubihamya.

16 Kubwo kwizera izina rye, izina rye ni ryo ryakomeje uyu muntu mureba kandi muzi. Kandi kwizera guturuka kuri we ni ko kwamuhaye gukira kuzima imbere yanyu mwese.

17 “None rero bene Data, nzi ko mwabikoze mubitewe n’ubujiji, nk’uko n’abatware banyu babikoze.

18 Ariko ibyo Imana yari yaravuze mbere mu kanwa k’abahanuzi bayo bose, ko Kristo yagombaga kubabazwa, yabisohoje ityo.

19 Nuko mwihane, muhindukire, kugira ngo ibyaha byanyu bihanagurwe, bityo ibihe byo guhemburwa bituruke imbere y’Umwami,

20 kandi yohereze Kristo Yesu, wari warabatoranyirijwe mbere.

21 Ijuru rigomba kumwakira kugeza ku bihe byo gusubizaho ibintu byose, ibyo Imana yavugiye kera mu kanwa k’abahanuzi bayo bera.

22 Kuko Mose yabwiye ba sogokuruza ati: ‘Umwami Imana azabahagurukiriza umuhanuzi uva muri bene wanyu, umeze nkanjye. Muzamwumvire mu byo azababwira byose.

23 Kandi umuntu wese utazumvira uwo muhanuzi azarimburwa akurwe muri ubwo bwoko.’

24 Koko rero, abahanuzi bose, uhereye kuri Samweli n’abamukurikiye, uko bavuze, na bo batangaje iby’iyi minsi.

25 Muri abana b’abahanuzi n’isezerano Imana yagiranye na ba sogokuruza, ibwira Aburahamu iti: ‘Mu rubyaro rwawe ni mo imiryango yose yo ku isi izaherwa umugisha.’

26 Imana, imaze kuzura Umugaragu wayo, yamwohereje kuri mwe mbere kugira ngo ibahe umugisha, ihindura buri wese muri mwe akava mu bibi bye.”

---

## Ibyakozwe n’Intumwa 4

### Petero na Yohana imbere y’Inama

1 Bakivugana n’abantu, abatambyi, umukuru w’abarinzi b’urusengero, n’Abasadukayo barabegera.

2 Barababajwe cyane n’uko bigishaga abantu, batangaza ko muri Yesu harimo izuka ry’abapfuye.

3 Barabafata, babashyira mu buroko kugeza bukeye, kuko hari hamaze kuba nimugoroba.

4 Ariko benshi mu bumvise ijambo barizeye, umubare w’abagabo uba nka ibihumbi bitanu.

5 Bukeye, abatware babo, abakuru n’abanditsi bateranira i Yerusalemu.

6 Ana umutambyi mukuru yari ahari, hamwe na Kayafa, Yohana, Alegizandero, n’abandi bose bo mu muryango w’umutambyi mukuru.

7 Bashyize Petero na Yohana hagati yabo, barababaza bati: “Ibi mwabikoze ku bw’izihe mbaraga, cyangwa mu izina rya nde?”

8 Nuko Petero, yuzuye Umwuka Wera, arababwira ati: “Batware b’abantu namwe bakuru ba Isirayeli,

9 niba uyu munsi tubazwa iby’igikorwa cyiza cyakorewe umuntu wari urwaye, n’uburyo uyu muntu yakijijwe,

10 nimubimenye mwese, n’abantu bose ba Isirayeli babimenye, ko mu izina rya Yesu Kristo w’i Nazareti, uwo mwabambye, uwo Imana yazuye mu bapfuye, ari we utumye uyu muntu ahagarara imbere yanyu ari muzima.

11 Uwo ni we buye mwebwe abubatsi mwahinyuye, ariko ryahindutse irikomeza imfuruka.

12 Nta wundi hari agakiza, kuko nta rindi zina munsi y’ijuru ryahawe abantu dukwiriye gukirizwamo.”

13 Babonye ubushizi bw’amanga bwa Petero na Yohana, kandi bamenye ko ari abantu batize kandi basanzwe, baratangara; bamenya ko babanaga na Yesu.

14 Kandi babonye wa muntu wakijijwe ahagaze hamwe na bo, babura icyo babavugaho.

15 Nuko babategeka kuva mu Nama, bajya inama ubwabo,

16 bati: “Aba bantu tubagire dute? Kuko ikimenyetso kizwi cyakorewe muri bo, kiragaragara ku batuye i Yerusalemu bose, kandi ntidushobora kugihakana.

17 Ariko kugira ngo ibyo bitarushaho gukwirakwira mu bantu, tubakangishe tuti ntibazongere kuvuga iri zina ku muntu uwo ari we wese.”

18 Barabahamagara, babategeka kutazongera kuvuga cyangwa kwigisha na gato mu izina rya Yesu.

19 Ariko Petero na Yohana barabasubiza bati: “Niba ari byo bikwiye imbere y’Imana kubumvira mwe kuruta Imana, nimubisuzume ubwanyu.

20 Kuko tudashobora kureka kuvuga ibyo twabonye n’ibyo twumvise.”

21 Bamaze kongera kubakangisha, barabarekura, babuze uburyo bwo kubahana kubera abantu, kuko bose bahimbazaga Imana ku byabaye.

22 Kuko umuntu wari wakorewe icyo gitangaza cyo gukizwa yari amaze imyaka irenga mirongo ine.

### Abizera basenga basaba gushira amanga

23 Bamaze kurekurwa, basubira kuri bagenzi babo, bababwira ibyo abatambyi bakuru n’abakuru bababwiye byose.

24 Babyumvise, bose bahuje umutima, barangururira Imana ijwi bati: “Mwami, ni wowe Mana waremye ijuru n’isi n’inyanja n’ibirimo byose.

25 Wavugiye mu kanwa k’umugaragu wawe Dawidi uti: ‘Ni iki gitumye amahanga arakara, n’abantu bagatekereza ibitagira umumaro?

26 Abami b’isi barahagurutse, abatware bateranira hamwe kurwanya Umwami no kurwanya Uwo yasize.’

27 Koko rero, muri uyu mujyi Herode na Pontiyo Pilato bateraniye hamwe n’Abanyamahanga n’abantu ba Isirayeli kurwanya Umugaragu wawe wera Yesu, uwo wasize,

28 kugira ngo bakore ibyo ukuboko kwawe n’inama yawe byari byaragenye mbere ko bizabaho.

29 None, Mwami, reba iterabwoba ryabo, kandi uhe abagaragu bawe kuvuga ijambo ryawe bashize amanga rwose,

30 urambura ukuboko kwawe gukiza, kugira ngo ibimenyetso n’ibitangaza bikorwe mu izina ry’Umugaragu wawe wera Yesu.”

31 Bamaze gusenga, aho bari bateraniye haratigita; bose buzuzwa Umwuka Wera, bavuga ijambo ry’Imana bashize amanga.

### Abizera basangira ibyo batunze

32 Imbaga y’abizeye yari ihuje umutima n’ubugingo; nta n’umwe wavugaga ko ikintu atunze ari icye wenyine, ahubwo bari basangiye byose.

33 Intumwa zahamije izuka ry’Umwami Yesu zifite imbaraga nyinshi, kandi ubuntu bwinshi bwari kuri bo bose.

34 Nta muntu wari ukennye muri bo, kuko abari bafite imirima cyangwa amazu babigurishaga, bakazana ibiguzi by’ibyagurishijwe,

35 bakabishyira ku birenge by’intumwa; bikagabanywa buri wese hakurikijwe icyo akeneye.

36 Yozefu, uwo intumwa zitaga Barinaba, bisobanurwa ngo “Umwana wo Gukomeza Abandi,” yari Umulewi, wavukiye i Kupuro.

37 Yari afite umurima, arawugurisha, azana amafaranga ayashyira ku birenge by’intumwa.

---

## Ibyakozwe n’Intumwa 5

### Ananiya na Safira

1 Ariko umuntu witwaga Ananiya, hamwe n’umugore we Safira, agurisha ubutaka yari afite.

2 Agumana igice cy’igiciro, umugore we na we abizi; azana igice kimwe agishyira ku birenge by’intumwa.

3 Ariko Petero aravuga ati: “Ananiya, ni iki cyatumye Satani yuzura umutima wawe kugira ngo ubeshye Umwuka Wera, ugumane igice cy’igiciro cy’ubutaka?

4 Igihe bwari bukiri ubwawe, ntibwari ubwawe? Kandi bumaze kugurishwa, amafaranga ntiyari mu bubasha bwawe? Ni iki cyatumye utekereza iki kintu mu mutima wawe? Si abantu ubeshye, ahubwo ubeshye Imana.”

5 Ananiya yumvise ayo magambo, aragwa, arapfa. Ubwoba bwinshi butera ababyumvise bose.

6 Abasore barahaguruka, bamuzinga, baramusohora, baramuhamba.

7 Hashize nk’amasaha atatu, umugore we arinjira, atazi ibyabaye.

8 Petero aramubaza ati: “Mbwira, mwagurishije ubwo butaka amafaranga angana atyo?” Aravuga ati: “Yego, ni ayo.”

9 Petero aramubwira ati: “Ni iki cyatumye mwumvikana kugerageza Umwuka w’Umwami? Dore ibirenge by’abahambye umugabo wawe biri ku muryango, kandi nawe bagiye kugusohora.”

10 Ako kanya agwa ku birenge bye, arapfa. Abasore binjiye basanga yapfuye, baramusohora, bamuhamba iruhande rw’umugabo we.

11 Ubwoba bwinshi butera itorero ryose n’abumvise ibyo byose.

### Ibimenyetso n’ibitangaza

12 Mu maboko y’intumwa hakorerwaga ibimenyetso n’ibitangaza byinshi mu bantu; bose bateraniraga muri portiko ya Salomo bahuje umutima.

13 Mu bandi nta n’umwe watinyukaga kwifatanya na bo, ariko abantu barabubahaga cyane.

14 Abizeraga Umwami barushagaho kwiyongera, imbaga y’abagabo n’abagore.

15 Bagezaga abarwayi mu mihanda, bakabarambika ku buriri no ku ntebe, kugira ngo nibura igicucu cya Petero kimanukire kuri bamwe muri bo igihe anyuzeho.

16 N’abantu benshi baturukaga mu mijyi ikikije Yerusalemu, bazana abarwayi n’abababazwaga n’imyuka mibi, bose bagakira.

### Intumwa zitotezwa

17 Ariko umutambyi mukuru arahaguruka, hamwe n’abo bari kumwe bose, bo mu gice cy’Abasadukayo, buzuye ishyari.

18 Bafata intumwa, bazishyira mu nzu y’imbohe rusange.

19 Ariko nijoro umumarayika w’Umwami akingura imiryango ya gereza, arabasohora, arababwira ati:

20 “Nimugende, muhagarare mu rusengero, mubwire abantu amagambo yose y’ubu bugingo.”

21 Babyumvise, binjira mu rusengero mu museke, barigisha. Ariko umutambyi mukuru n’abo bari kumwe baraza, bahamagara Inama n’abakuru bose b’Abisirayeli, bohereza muri gereza ngo bazanwe.

22 Ariko abarinzi bagezeyo ntibabasanga muri gereza; bagaruka babaha raporo bati:

23 “Twasanze gereza ifunze neza, n’abarinzi bahagaze imbere y’imiryango, ariko dukinguye ntitwasangamo umuntu.”

24 Umutambyi mukuru, umukuru w’abarinzi b’urusengero, n’abatambyi bakuru bumvise ayo magambo, barayoberwa cyane bibaza icyo ibyo byazavamo.

25 Haza umuntu arababwira ati: “Dore abantu mwashyize muri gereza bahagaze mu rusengero bigisha abantu.”

26 Nuko umukuru w’abarinzi ajyana n’abarinzi, arabazana, ariko batabakoresheje urugomo, kuko batinyaga ko abantu babatera amabuye.

27 Bamaze kubazana, babahagarika imbere y’Inama. Umutambyi mukuru arababaza ati:

28 “Ntitwabategetse bikomeye kutigisha muri iri zina? Dore mwujuje Yerusalemu inyigisho zanyu, kandi mushaka kudushyiraho amaraso y’uwo muntu.”

29 Petero n’intumwa barasubiza bati: “Dukwiriye kumvira Imana kuruta abantu.

30 Imana ya ba sogokuruza yazuye Yesu, uwo mwishe mumumanitse ku giti.

31 Imana yamuzamuriye iburyo bwayo, imugira Umuyobozi n’Umukiza, kugira ngo ihe Isirayeli kwihana no kubabarirwa ibyaha.

32 Natwe turi abagabo bo guhamya ibyo; kandi n’Umwuka Wera, uwo Imana yahaye abayumvira, ni umuhamya wabyo.”

33 Babyumvise, bacumitwa mu mitima, biyemeza kubica.

34 Ariko umwe mu Bafarisayo witwaga Gamaliyeli, umwigisha w’amategeko wubahwaga n’abantu bose, arahaguruka mu Nama, ategeka ko intumwa zisohorwa akanya gato.

35 Arababwira ati: “Bagabo b’Abisirayeli, mwitondere ibyo mugiye gukorera aba bantu.

36 Kuko mbere y’iyi minsi, Teyuda yarahagurutse yiyerekana nk’umuntu ukomeye, abantu bagera kuri magana ane baramukurikira. Yicwa, abamwumviraga bose baratatana, biba ubusa.

37 Nyuma ye, Yuda w’Umunyagalilaya yahagurutse mu minsi yo kubarura abantu, akurura bamwe bamukurikira. Na we yarapfuye, abamwumviraga bose baratatana.

38 None ndababwira nti: mureke aba bantu, mubarekure. Kuko niba iyi nama cyangwa uyu murimo bituruka ku bantu, bizasenyerwa.

39 Ariko niba bituruka ku Mana, ntimuzashobora kubisenya, kandi mwazasangwa murwanya Imana.”

40 Baramwumvira. Bahamagara intumwa, barazikubita, bazitegeka kutazongera kuvuga mu izina rya Yesu, barazirekura.

41 Nuko ziva imbere y’Inama zishimye kuko zari zibonwe ko zikwiriye gusuzugurirwa izina rya Yesu.

42 Kandi buri munsi, mu rusengero no mu ngo, ntizigeze zihagarika kwigisha no kubwiriza Yesu, Kristo.

---

## Ibyakozwe n’Intumwa 6

### Abantu barindwi batoranywa

1 Muri iyo minsi, uko umubare w’abigishwa wagendaga wiyongera, Abayuda bavuga Ikigiriki bitotombera Abaheburayo, kuko abapfakazi babo birengagizwaga mu igaburo rya buri munsi.

2 Cumi na babiri bahamagara imbaga y’abigishwa, baravuga bati: “Ntibikwiriye ko tureka ijambo ry’Imana ngo tujye kugabura ku meza.

3 Nuko rero bene Data, mutoranye muri mwe abagabo barindwi bavugwa neza, buzuye Umwuka Wera n’ubwenge, tubashyire kuri uyu murimo.

4 Ariko twe tuzakomeza kwitangira gusenga no gukorera ijambo.”

5 Iryo jambo rinezeza imbaga yose. Batoranya Sitefano, umugabo wuzuye kwizera n’Umwuka Wera, na Filipo, Prokoro, Nikanori, Timoni, Parimena, na Nikolawo, uwahindukiriye idini ry’Abayuda wo muri Antiyokiya.

6 Babashyira imbere y’intumwa; zimaze gusenga, zibarambikaho ibiganza.

7 Ijambo ry’Imana riragwira, umubare w’abigishwa urushaho kwiyongera cyane i Yerusalemu, kandi abatambyi benshi bumvira kwizera.

### Sitefano afatwa

8 Sitefano, yuzuye kwizera n’imbaraga, yakoraga ibitangaza n’ibimenyetso bikomeye mu bantu.

9 Ariko bamwe bo mu isinagogi yitwaga iy’Ababohowe, n’abo muri Kurene, abo muri Alegizandiriya, n’abo muri Kilikiya na Aziya barahaguruka bajya impaka na Sitefano.

10 Ntibashobora gutsinda ubwenge n’Umwuka yavuganaga.

11 Nuko bashukashuka abantu mu ibanga ngo bavuge bati: “Twamwumvise avuga amagambo yo gutuka Mose n’Imana.”

12 Bateranya abantu, abakuru n’abanditsi; baraza bamufata, bamujyana imbere y’Inama.

13 Bashyiraho abagabo b’ibinyoma bavuga bati: “Uyu muntu ntahwema kuvuga amagambo yo gutuka aha hantu hera n’amategeko.

14 Kuko twamwumvise avuga ko uyu Yesu w’i Nazareti azasenya aha hantu, agahindura imigenzo Mose yaduhaye.”

15 Abari bicaye mu Nama bose bamuhanze amaso, babona mu maso he hasa n’aha malayika.

---

## Ibyakozwe n’Intumwa 7

### Sitefano asubiza Inama

1 Umutambyi mukuru aravuga ati: “Ibyo ni ko biri?”

2 Sitefano aravuga ati: “Bagabo bene Data na ba data, nimwumve. Imana y’icyubahiro yabonekeye sogokuruza Aburahamu igihe yari muri Mezopotamiya, ataratura i Harani,

3 iramubwira iti: ‘Va mu gihugu cyawe no muri bene wanyu, ujye mu gihugu nzakwereka.’

4 Nuko ava mu gihugu cy’Abakaludaya, atura i Harani. Se amaze gupfa, Imana imwimurira muri iki gihugu mutuyemo ubu.

5 Ntiyamuhaye umurage muri cyo, habe n’aho gushyira ikirenge; ariko yamusezeranyije ko izakimuha ngo abe gakondo ye, n’urubyaro rwe nyuma ye, nubwo icyo gihe nta mwana yari afite.

6 Imana yavuze itya: ko urubyaro rwe ruzaba abasuhuke mu gihugu kitari icyabo, bakabagira abacakara, bakabagirira nabi imyaka magana ane.

7 Imana iravuga iti: ‘Igihugu bazaba barabereye abacakara nzagihana; hanyuma bazasohoka bansengere aha hantu.’

8 Imuha isezerano ryo gukebwa. Nuko Aburahamu abyara Isaka, amukeba ku munsi wa munani. Isaka abyara Yakobo, Yakobo abyara ba sekuruza cumi na babiri.

9 “Ba sekuruza, bagiriye Yozefu ishyari, bamugurisha ajyanwa muri Egiputa. Ariko Imana yari kumwe na we,

10 imukiza imibabaro ye yose, imuha ubutoni n’ubwenge imbere ya Farawo, umwami wa Egiputa. Farawo amugira umutware wa Egiputa n’inzu ye yose.

11 Nuko inzara itera mu gihugu cyose cya Egiputa n’i Kanani, habaho umubabaro mwinshi. Ba sogokuruza bacu babura ibyokurya.

12 Ariko Yakobo yumvise ko muri Egiputa hari ingano, yohereza ba sogokuruza bacu ubwa mbere.

13 Ubwa kabiri, Yozefu yimenyesha bene se, n’umuryango wa Yozefu umenyekana kuri Farawo.

14 Yozefu atumira se Yakobo na bene wabo bose, abantu mirongo irindwi na batanu.

15 Yakobo amanuka muri Egiputa, apfirayo, we na ba sogokuruza bacu.

16 Bajyanwa i Shekemu, bashyirwa mu mva Aburahamu yari yaraguze ku giciro cy’ifeza ku bana ba Hamori w’i Shekemu.

17 “Igihe cy’isezerano Imana yari yararahiriye Aburahamu cyegereje, ubwoko burakura, bugwira muri Egiputa,

18 kugeza igihe undi mwami utari uzi Yozefu yimukiye ku ngoma muri Egiputa.

19 Uwo mwami agirira nabi ubwoko bwacu, agirira ba sogokuruza nabi, abahatira guta abana babo b’impinja kugira ngo batabaho.

20 Muri icyo gihe Mose aravuka, yari mwiza cyane imbere y’Imana. Arererwa mu rugo rwa se amezi atatu.

21 Amaze gutabwa, umukobwa wa Farawo aramutora, amurera nk’umwana we.

22 Mose yigishwa ubwenge bwose bw’Abanyegiputa, agira imbaraga mu magambo no mu bikorwa.

23 Agejeje imyaka mirongo ine, bimujya mu mutima gusura bene wabo, abana ba Isirayeli.

24 Abonye umwe muri bo arenganwa, aramutabara, ahorera uwarenganywaga, akubita Umunyegiputa.

25 Yibwiraga ko bene wabo bari gusobanukirwa ko Imana ibaha gukizwa ibinyujije mu kuboko kwe, ariko ntibabyumva.

26 Bukeye, abona babiri muri bo barwana; ashaka kubunga, arababwira ati: ‘Bagabo, muri bene wanyu. Ni iki gitumye mugirirana nabi?’

27 Ariko uwagiriraga nabi mugenzi we aramusunika, aravuga ati: ‘Ni nde wagushyizeho ngo utubere umutware n’umucamanza?

28 Urashaka kunyica nk’uko wishe Umunyegiputa ejo?’

29 Mose yumvise iryo jambo, arahunga, aba umusuhuke mu gihugu cya Midiyani, aho yabyariye abahungu babiri.

30 “Imyaka mirongo ine ishize, umumarayika w’Umwami amubonekera mu butayu bw’umusozi wa Sinayi, mu muriro wagurumanaga mu gihuru.

31 Mose abibonye, atangazwa n’ibyo abonye. Ageze hafi kubireba, ijwi ry’Umwami rimugeraho riti:

32 ‘Ndi Imana ya ba sogokuruza: Imana ya Aburahamu, Imana ya Isaka, n’Imana ya Yakobo.’ Mose aratitira, ntiyatinyuka kureba.

33 Umwami aramubwira ati: ‘Kuramo inkweto zawe, kuko aho uhagaze ari ahantu hera.

34 Nabonye rwose imibabaro y’ubwoko bwanjye buri muri Egiputa, numvise gutaka kwabo, kandi ndamanutse ngo mbakize. None ngwino, ngutume muri Egiputa.’

35 “Uwo Mose banze bavuga bati: ‘Ni nde wagushyizeho ngo utubere umutware n’umucamanza?’ ni we Imana yohereje ngo abe umutware n’umukiza, ibinyujije mu kuboko kwa marayika wamubonekeye mu gihuru.

36 Uwo ni we wabakuye hanze, akora ibitangaza n’ibimenyetso muri Egiputa, mu Nyanja Itukura, no mu butayu imyaka mirongo ine.

37 Uwo Mose ni we wabwiye abana ba Isirayeli ati: ‘Umwami Imana azabahagurukiriza umuhanuzi uva muri bene wanyu, umeze nkanjye.’

38 Uwo ni we wari mu iteraniro ryo mu butayu, ari kumwe na marayika wavuganaga na we ku musozi wa Sinayi, n’aba sogokuruza bacu; yakiriye amagambo mazima kugira ngo ayaduhe.

39 Ba sogokuruza bacu ntibashatse kumwumvira; baramwanze, basubira mu mitima yabo muri Egiputa,

40 babwira Aroni bati: ‘Dukorere imana zizatuyobora, kuko uyu Mose wadukuye mu gihugu cya Egiputa tutazi ibyamubayeho.’

41 Muri iyo minsi bacura inyana, bayituraho igitambo, bishimira imirimo y’amaboko yabo.

42 Ariko Imana irabahindukira, ibareka gukorera ingabo zo mu ijuru, nk’uko byanditswe mu gitabo cy’abahanuzi ngo: ‘Mbese mwa nzu ya Isirayeli mwe, ni jye mwatambiye amatungo n’ibitambo mu myaka mirongo ine mu butayu?

43 Ahubwo mwikoreye ihema rya Moloki n’inyenyeri y’imana yanyu Refani, ibishushanyo mwakoze kugira ngo mubisenge; ni cyo gituma nzabajyana kure, hakurya ya Babiloni.’

44 “Ba sogokuruza bacu bari bafite ihema ry’ubuhamya mu butayu, nk’uko uwavuganaga na Mose yamutegetse kurikora akurikije urugero yari yabonye.

45 Na ryo ba sogokuruza bacu, igihe cyabo kigeze, barizinjirana hamwe na Yosuwa ubwo binjiraga mu gihugu cy’amahanga Imana yirukanye imbere yabo, kugeza mu minsi ya Dawidi.

46 Dawidi yabonye ubutoni imbere y’Imana, asaba ko yabonera Imana ya Yakobo ubuturo.

47 Ariko Salomo ni we wayubakiye inzu.

48 Nyamara Isumbabyose ntiba mu nzu zubatswe n’amaboko, nk’uko umuhanuzi avuga ati:

49 ‘Ijuru ni intebe yanjye y’ubwami, isi ni intebe y’ibirenge byanjye. Ni iyihe nzu muzanyubakira? ni ko Umwami avuga. Cyangwa aho nzaruhukira ni hehe?

50 Mbese ukuboko kwanjye si ko kwaremye ibyo byose?’

51 “Mwa bantu bafite amajosi anangira, mudakebwe mu mitima no mu matwi, muhora murwanya Umwuka Wera. Nk’uko ba sogokuruza banyu babigenzaga, ni ko namwe mubigenza.

52 Ni uwuhe muhanuzi ba sogokuruza banyu batatoteje? Bishe abahanuye mbere ukuza k’Uwera Ukiranuka; none namwe mwabaye abamugambaniye n’abamwishe.

53 Mwakiriye amategeko mwahawe binyujijwe mu bamarayika, ariko ntimwayitondeye.”

### Sitefano yicwa amabuye

54 Babyumvise, bacumitwa mu mitima, bamugugunira amenyo.

55 Ariko we, yuzuye Umwuka Wera, ahanga amaso mu ijuru, abona icyubahiro cy’Imana na Yesu ahagaze iburyo bw’Imana.

56 Aravuga ati: “Dore, ndabona ijuru rikingutse, n’Umwana w’Umuntu ahagaze iburyo bw’Imana.”

57 Nuko barataka n’ijwi rirenga, bipfuka amatwi, bamwirukira bose hamwe.

58 Baramujyana hanze y’umujyi, bamutera amabuye. Abahamya bashyira imyenda yabo ku birenge by’umusore witwaga Sawuli.

59 Batera Sitefano amabuye, asenga avuga ati: “Mwami Yesu, akira umwuka wanjye.”

60 Arapfukama, ataka n’ijwi rirenga ati: “Mwami, ntubabaraho iki cyaha.” Amaze kuvuga atyo, arasinzira.

---

## Ibyakozwe n’Intumwa 8

### Itorero ritotezwa kandi ritatana

1 Sawuli yari yemeye urupfu rwa Sitefano. Kuri uwo munsi, itotezwa rikomeye ritera itorero ryari i Yerusalemu. Bose baratatana bajya mu turere twa Yudaya na Samariya, keretse intumwa.

2 Abantu bubaha Imana bahamba Sitefano, bamuririra cyane.

3 Ariko Sawuli yangizaga itorero, yinjira mu nzu ku nzu, akurubana abagabo n’abagore akabajyana muri gereza.

4 Nuko abatatanye bagenda babwiriza ijambo aho banyuraga hose.

### Filipo i Samariya

5 Filipo amanuka ajya mu mujyi wa Samariya, abatangariza Kristo.

6 Imbaga y’abantu yumviraga ibivugwa na Filipo ihuje umutima, kuko bumvaga kandi bakabona ibimenyetso yakoraga.

7 Imyuka mibi yavaga muri benshi bari bayifite, itaka n’ijwi rirenga; kandi benshi bari baramugaye cyangwa baremaye barakizwa.

8 Muri uwo mujyi habaho umunezero mwinshi.

### Simoni Umupfumu

9 Hari umuntu witwaga Simoni, wari usanzwe akora ubupfumu muri uwo mujyi, agatangaza abantu b’i Samariya, yiyerekana nk’umuntu ukomeye.

10 Bose, uhereye ku muto ukageza ku mukuru, baramwumviraga bavuga bati: “Uyu muntu ni imbaraga ikomeye y’Imana.”

11 Baramwumviraga kuko yari amaze igihe kirekire abatangaza n’ubupfumu bwe.

12 Ariko bamaze kwizera Filipo wabwirizaga ubutumwa bwiza bw’Ubwami bw’Imana n’izina rya Yesu Kristo, barabatizwa, abagabo n’abagore.

13 Simoni ubwe na we arizera. Amaze kubatizwa, akomezanya na Filipo; abonye ibimenyetso n’ibitangaza bikomeye bikorwa, aratangara.

14 Intumwa zari i Yerusalemu zumvise ko Samariya yakiriye ijambo ry’Imana, ziboherereza Petero na Yohana.

15 Bagezeyo, barabasengera kugira ngo bakire Umwuka Wera,

16 kuko yari ataraza kuri n’umwe muri bo; bari barabatijwe gusa mu izina ry’Umwami Yesu.

17 Nuko babarambikaho ibiganza, bakira Umwuka Wera.

18 Simoni abonye ko Umwuka Wera atangwa binyujijwe mu kurambikaho ibiganza by’intumwa, abazanira amafaranga,

19 aravuga ati: “Nanjye nimumpa ubwo bubasha, kugira ngo uwo nzarambikaho ibiganza wese azakire Umwuka Wera.”

20 Ariko Petero aramubwira ati: “Ifeza yawe irimbukane nawe, kuko wibwiye ko impano y’Imana yabonwa n’amafaranga!

21 Nta mugabane cyangwa uruhare ufite muri iki kintu, kuko umutima wawe utatunganye imbere y’Imana.

22 Nuko ihane ubu bubi bwawe, usabe Umwami, ahari ngo igitekerezo cy’umutima wawe kibabarirwe.

23 Kuko mbona uri mu burozi bw’umururazi no mu ngoyi yo gukiranirwa.”

24 Simoni aramusubiza ati: “Nimunsabire ku Mwami, kugira ngo hatagira na kimwe mu byo muvuze kimbaho.”

25 Nuko bamaze guhamya no kuvuga ijambo ry’Umwami, basubira i Yerusalemu, bagenda babwiriza Ubutumwa Bwiza mu midugudu myinshi y’Abasamariya.

### Filipo n’umukozi w’Umunyetiyopiya

26 Nuko umumarayika w’Umwami abwira Filipo ati: “Haguruka, ujye mu majyepfo, ku nzira imanuka iva i Yerusalemu ijya i Gaza. Iyo nzira inyura mu butayu.”

27 Arahaguruka aragenda. Dore hari umugabo w’Umunyetiyopiya, inkone ikomeye yari munsi ya Kandake, umwamikazi w’Abanyetiyopiya, akaba yari umubitsi w’ubutunzi bwe bwose. Yari yaje i Yerusalemu gusenga,

28 none yari asubiye iwabo, yicaye mu igare rye, asoma umuhanuzi Yesaya.

29 Umwuka abwira Filipo ati: “Egera iryo gare, ugendane na ryo.”

30 Filipo arirukanka aramwegura, amwumva asoma umuhanuzi Yesaya, aramubaza ati: “Mbese urumva ibyo usoma?”

31 Na we aravuga ati: “Nabishobora nte ntariho unsobanurira?” Yinginga Filipo ngo yurire, yicarane na we.

32 Igice cy’Ibyanditswe yasomaga ni iki ngo: “Yajyanywe nk’intama ijyanwa kubagwa; kandi nk’uko umwana w’intama uceceka imbere y’umukemura ubwoya, ni ko na we atabumbuye akanwa ke.

33 Mu gucishwa bugufi kwe, urubanza rwe rwavanyweho. Ni nde uzavuga iby’urubyaro rwe? Kuko ubuzima bwe bwakuwe ku isi.”

34 Iyo nkone ibaza Filipo iti: “Ndakwinginze, uyu muhanuzi avuga nde? Arivugaho cyangwa avuga undi?”

35 Filipo abumbura akanwa, ahera kuri icyo Cyanditswe, amubwiriza Yesu.

36 Bakigenda mu nzira, bagera ku mazi. Iyo nkone iravuga iti: “Dore amazi! Ni iki kimbuza kubatizwa?”

37 Filipo aravuga ati: “Niwizera n’umutima wawe wose, birashoboka.” Na we asubiza ati: “Nizeye ko Yesu Kristo ari Umwana w’Imana.”

38 Ategeka ko igare rihagarara. Bombi bamanuka mu mazi, Filipo n’inkone, arayibatiza.

39 Bamaze kuva mu mazi, Umwuka w’Umwami ajyana Filipo; iyo nkone ntiyongera kumubona, ikomeza inzira yayo yishimye.

40 Ariko Filipo aboneka muri Azoto; agenda anyura mu mijyi yose, abwiriza Ubutumwa Bwiza kugeza ageze i Kayisariya.

---

## Ibyakozwe n’Intumwa 9

### Sawuli ahinduka

1 Ariko Sawuli, akigumya guhumeka iterabwoba n’ubwicanyi ku bigishwa b’Umwami, ajya ku mutambyi mukuru,

2 amusaba inzandiko zo kujyana mu masinagogi y’i Damasiko, kugira ngo nabona abagendera mu Nzira, abagabo cyangwa abagore, ababohe abazane i Yerusalemu.

3 Akigenda, yegera Damasiko; nuko umucyo uturuka mu ijuru umurabagirana iruhande rwe.

4 Agwa hasi, yumva ijwi rimubwira riti: “Sawuli, Sawuli, ni iki gitumye untoteza?”

5 Arabaza ati: “Uri nde, Mwami?” Umwami aravuga ati: “Ndi Yesu, uwo utoteza.

6 Ariko haguruka, winjire mu mujyi, uzabwirwa icyo ukwiriye gukora.”

7 Abagabo bari bagendanye na we bahagarara batavuga, bumva ijwi ariko nta muntu babona.

8 Sawuli arahaguruka ava hasi; ahumura amaso ye, ariko ntiyagira icyo abona. Bamufata ukuboko, bamujyana i Damasiko.

9 Amara iminsi itatu atabona, ntiyarya kandi ntiyanywa.

### Ananiya yoherezwa kuri Sawuli

10 I Damasiko hari umwigishwa witwaga Ananiya. Umwami aramubwira mu iyerekwa ati: “Ananiya!” Na we aravuga ati: “Dore ndi hano, Mwami.”

11 Umwami aramubwira ati: “Haguruka ujye mu muhanda witwa Ugororotse, ushakire mu nzu ya Yuda umuntu witwa Sawuli w’i Taruso, kuko dore arasenga.

12 Kandi mu iyerekwa yabonye umuntu witwa Ananiya yinjira, akamurambikaho ibiganza kugira ngo ahumuke.”

13 Ariko Ananiya arasubiza ati: “Mwami, numvise benshi bavuga iby’uyu muntu, n’ibibi byinshi yakoreye abera bawe i Yerusalemu.

14 Kandi hano afite ububasha yahawe n’abatambyi bakuru bwo kuboha abantu bose bambaza izina ryawe.”

15 Ariko Umwami aramubwira ati: “Genda, kuko uwo ari igikoresho natoranyije cyo gutwara izina ryanjye imbere y’amahanga, n’abami, n’abana ba Isirayeli.

16 Kuko nzamwereka ibintu byinshi akwiriye kubabazwa ku bw’izina ryanjye.”

17 Ananiya aragenda, yinjira muri iyo nzu. Amurambikaho ibiganza, aravuga ati: “Muvandimwe Sawuli, Umwami Yesu, wakubonekeye mu nzira wazagamo, yantumye kugira ngo uhumuke, kandi wuzure Umwuka Wera.”

18 Ako kanya ibintu bimeze nk’ibishishwa biva ku maso ye, arahumuka. Arahaguruka, arabatizwa.

19 Amaze kurya, arakomera. Amara iminsi mike ari kumwe n’abigishwa b’i Damasiko.

### Sawuli abwiriza i Damasiko

20 Ako kanya atangira gutangaza Kristo mu masinagogi, avuga ko ari Umwana w’Imana.

21 Abamwumvaga bose baratangara bati: “Uyu si wa wundi wangizaga i Yerusalemu abambazaga iri zina? Kandi yaje hano ashaka kubabohesha ngo abajyane ku batambyi bakuru!”

22 Ariko Sawuli arushaho gukomera, ayobya Abayuda bari batuye i Damasiko, abahamiriza ko Yesu ari Kristo.

23 Hashize iminsi myinshi, Abayuda bagambanira kumwica.

24 Ariko umugambi wabo umenyekana kuri Sawuli. Barindaga amarembo ku manywa na nijoro kugira ngo bamwice.

25 Ariko abigishwa be bamufata nijoro, bamumanurira mu gihome bamushyize mu gitebo.

### Sawuli i Yerusalemu

26 Sawuli ageze i Yerusalemu, ashaka kwifatanya n’abigishwa, ariko bose baramutinya, ntibizera ko ari umwigishwa.

27 Ariko Barinaba aramufata, amujyana ku ntumwa, azisobanurira uko yabonye Umwami mu nzira, uko yamuvugishije, n’uko i Damasiko yabwirizaga ashize amanga mu izina rya Yesu.

28 Nuko abana na bo, yinjira kandi asohoka i Yerusalemu,

29 abwiriza ashize amanga mu izina ry’Umwami Yesu. Yavuganaga kandi akajya impaka n’Abayuda bavuga Ikigiriki, ariko bo bashakaga kumwica.

30 Bene Data babyumvise, bamumanura i Kayisariya, bamwohereza i Taruso.

31 Nuko amatorero yose yo muri Yudaya, Galilaya na Samariya agira amahoro, arubakwa. Bagendaga bubaha Umwami, kandi bahumurizwa n’Umwuka Wera, baragwira.

### Petero akiza Ayineya na Tabita

32 Petero agenda mu turere twose, amanukira no ku bera bari batuye i Lida.

33 Ahasanga umuntu witwaga Ayineya, wari amaze imyaka umunani aryamye ku buriri kuko yari yaramugaye.

34 Petero aramubwira ati: “Ayineya, Yesu Kristo aragukijije. Haguruka, wikorere uburiri bwawe.” Ako kanya arahaguruka.

35 Abari batuye i Lida no muri Sharoni bose baramubona, bahindukirira Umwami.

36 I Yopa hari umwigishwa witwaga Tabita, bisobanurwa ngo Doruka. Uwo mugore yari yuzuye imirimo myiza n’ibikorwa by’imbabazi yakoraga.

37 Muri iyo minsi ararwara, arapfa. Bamaze kumwoza, bamushyira mu cyumba cyo hejuru.

38 Kuko Lida yari hafi ya Yopa, abigishwa bumvise ko Petero ari yo, bamutumaho abagabo babiri bamwinginga bati: “Ntutinde kuza iwacu.”

39 Petero arahaguruka ajyana na bo. Agezeyo, bamujyana mu cyumba cyo hejuru. Abapfakazi bose bamuhagarara iruhande barira, bamwereka amakanzu n’imyenda Doruka yari yarakoze akiri kumwe na bo.

40 Petero abasohora bose, arapfukama, arasenga. Ahindukirira umurambo, aravuga ati: “Tabita, haguruka!” Arahumuka, abonye Petero aricara.

41 Amuha ukuboko, aramuhagurutsa. Ahamagara abera n’abapfakazi, amubereka ari muzima.

42 Ibyo bimenyekana i Yopa hose, benshi bizera Umwami.

43 Petero amara iminsi myinshi i Yopa, acumbitse kwa Simoni umukannyi w’impu.

---

## Ibyakozwe n’Intumwa 10

### Koruneliyo ahamagara Petero

1 I Kayisariya hari umuntu witwaga Koruneliyo, umutware w’abasirikare ijana bo mu mutwe witwaga Ubutaliyani.

2 Yari umuntu wubaha Imana, ayitinya hamwe n’abo mu rugo rwe bose; yagiriraga abantu imfashanyo nyinshi, kandi yasengaga Imana iteka.

3 Ahagana ku isaha ya cyenda y’umunsi, abona neza mu iyerekwa umumarayika w’Imana amusanga, aramubwira ati: “Koruneliyo!”

4 Amuhanze amaso, agira ubwoba, aravuga ati: “Ni iki, Mwami?” Aramubwira ati: “Amasengesho yawe n’imfashanyo zawe byazamutse imbere y’Imana biba urwibutso.

5 None tuma abantu i Yopa, bazane Simoni witwa Petero.

6 Acumbitse kwa Simoni umukannyi w’impu, ufite inzu ku nyanja.”

7 Umumarayika wamuvugishije amaze kugenda, Koruneliyo ahamagara abagaragu be babiri n’umusirikare wubaha Imana wo mu bamukoreraga buri gihe.

8 Amaze kubasobanurira byose, abatumaho i Yopa.

### Iyerekwa rya Petero

9 Bukeye, mu gihe bari mu rugendo begereye umujyi, Petero azamuka hejuru y’inzu gusenga, ahagana saa sita.

10 Agira inzara, yifuza kurya; ariko bakiri gutegura, agwa mu iyerekwa.

11 Abona ijuru rikingutse, n’ikintu kimanuka kimeze nk’umwenda munini, kimanurirwa ku isi gifashwe ku mpande enye.

12 Muri cyo harimo inyamaswa zose zifite amaguru ane zo ku isi, inyamaswa zo mu gasozi, ibikururuka hasi, n’inyoni zo mu kirere.

13 Ijwi riramubwira riti: “Haguruka, Petero, ubage urye!”

14 Ariko Petero aravuga ati: “Oya, Mwami, kuko ntigeze ndya ikintu gisanzwe cyangwa gihumanye.”

15 Ijwi riramubwira ubwa kabiri riti: “Icyo Imana yejeje, ntukacyite igihumanye.”

16 Ibyo biba inshuro eshatu, ako kanya icyo kintu gisubizwa mu ijuru.

17 Petero akibaza cyane mu mutima icyo iryo yerekwa yabonye risobanura, dore abagabo batumwe na Koruneliyo, bamaze kubaza inzu ya Simoni, bahagarara ku muryango.

18 Barahamagara, babaza niba Simoni witwa Petero acumbitse aho.

19 Petero akitekereza kuri iryo yerekwa, Umwuka aramubwira ati: “Dore, abagabo batatu baragushaka.

20 Haguruka, umanuke, ugendane na bo nta gushidikanya, kuko ari jye wabatutse.”

21 Petero amanukira abo bagabo, aravuga ati: “Dore ndi uwo mushaka. Ni iki cyabazanye?”

22 Baravuga bati: “Koruneliyo, umutware w’abasirikare ijana, umuntu ukiranuka kandi wubaha Imana, uvugwa neza n’ishyanga ryose ry’Abayuda, yategetswe n’umumarayika wera kugutumira mu rugo rwe, kugira ngo yumve amagambo uzavuga.”

23 Nuko arabinjiza, arabacumbikira. Bukeye, Petero arahaguruka ajyana na bo, kandi bamwe muri bene Data b’i Yopa baramuherekeza.

### Petero mu rugo rwa Koruneliyo

24 Bukeye binjira i Kayisariya. Koruneliyo yari abategereje, yahamagaje bene wabo n’inshuti ze za hafi.

25 Petero yinjiye, Koruneliyo aramusanganira, amugwa ku birenge, aramuramya.

26 Ariko Petero aramuhagurutsa, aravuga ati: “Haguruka! Nanjye ndi umuntu.”

27 Akivugana na we, arinjira, asanga abantu benshi bateraniye hamwe.

28 Arababwira ati: “Mwebwe ubwanyu muzi ko bitemewe ku Muyuda kwifatanya cyangwa gusura umuntu wo mu rindi shyanga. Ariko Imana yanyeretse ko ntagomba kwita umuntu uwo ari we wese uwanduye cyangwa uhumanye.

29 Ni cyo cyatumye nza ntitotomba, ubwo natumirwaga. None ndabaza: ni iki cyatumye muntumiza?”

30 Koruneliyo aravuga ati: “Hashize iminsi ine kugeza kuri iyi saha, nari nsenga mu nzu yanjye ku isaha ya cyenda, maze dore umuntu wari wambaye imyenda irabagirana ahagarara imbere yanjye,

31 aravuga ati: ‘Koruneliyo, isengesho ryawe ryumviswe, n’imfashanyo zawe zibutswe imbere y’Imana.

32 Nuko tuma i Yopa, uhamagare Simoni witwa Petero. Acumbitse mu nzu ya Simoni umukannyi w’impu, ku nyanja. Naza azakuvugisha.’

33 Nuko mpita ngutumaho, kandi wakoze neza kuza. None twese turi hano imbere y’Imana, kugira ngo twumve ibyo Umwami yagutegetse byose.”

### Petero abwiriza Abanyamahanga

34 Petero abumbura akanwa, aravuga ati: “Ni ukuri menye ko Imana itarobanura ku butoni.

35 Ahubwo mu mahanga yose, uyitinya agakora ibyo gukiranuka iramwemera.

36 Ijambo yohereje ku bana ba Isirayeli, abwiriza ubutumwa bwiza bw’amahoro binyujijwe muri Yesu Kristo — ni we Mwami wa bose —

37 namwe murazi ibyabaye, byatangarijwe muri Yudaya yose, bihereye i Galilaya nyuma y’umubatizo Yohana yabwirizaga:

38 uko Imana yasize Yesu w’i Nazareti Umwuka Wera n’imbaraga, akagenda akora ibyiza, akiza abo Satani yari yaratsikamiye bose, kuko Imana yari kumwe na we.

39 Natwe turi abagabo bo guhamya ibyo yakoze byose mu gihugu cy’Abayuda no muri Yerusalemu. Na we baramwishe bamumanitse ku giti.

40 Imana yamuzuye ku munsi wa gatatu, imuha kugaragara,

41 atagaragarira abantu bose, ahubwo agaragarira abagabo Imana yari yaratoranyije mbere, ari bo twe twaryanye kandi tukanywana na we amaze kuzuka mu bapfuye.

42 Yadutegetse kubwiriza abantu no guhamya ko ari we Imana yashyizeho kuba Umucamanza w’abazima n’abapfuye.

43 Abahanuzi bose bamuhamya, ko umuntu wese umwizera azahabwa kubabarirwa ibyaha mu izina rye.”

### Abanyamahanga bahabwa Umwuka Wera

44 Petero akivuga ayo magambo, Umwuka Wera amanukira abumvaga ijambo bose.

45 Abizera b’abakebwe bari bazanye na Petero baratangara, kuko impano y’Umwuka Wera yari isutswe no ku Banyamahanga.

46 Kuko bumvaga bavuga mu ndimi, bahimbaza Imana. Nuko Petero aravuga ati:

47 “Mbese hari uwabuza aba bantu kubatizwa mu mazi, ko bakiriye Umwuka Wera nk’uko natwe twamwakiriye?”

48 Ategeka ko babatizwa mu izina rya Yesu Kristo. Nuko bamusaba kugumana na bo iminsi mike.

---

## Ibyakozwe n’Intumwa 11

### Petero asobanurira Itorero rya Yerusalemu

1 Intumwa na bene Data bari muri Yudaya bumva ko Abanyamahanga na bo bakiriye ijambo ry’Imana.

2 Petero amaze kuzamuka ajya i Yerusalemu, abo mu bakebwe bajya impaka na we,

3 bavuga bati: “Winjiye mu bantu badakebwe, usangira na bo!”

4 Ariko Petero atangira kubasobanurira byose mu buryo bukurikiranye, aravuga ati:

5 “Nari mu mujyi wa Yopa nsenga, nuko mu iyerekwa mbona ikintu kimanuka kimeze nk’umwenda munini umanurwa uvuye mu ijuru ufashwe ku mpande enye, ugera aho ndi.

6 Nkimuhanze amaso, nditegereza, mbona inyamaswa zifite amaguru ane zo ku isi, inyamaswa zo mu gasozi, ibikururuka hasi, n’inyoni zo mu kirere.

7 Numva n’ijwi rimbwira riti: ‘Haguruka, Petero, ubage urye!’

8 Ariko ndavuga nti: ‘Oya, Mwami, kuko ikintu gihumanye cyangwa kitari cyera kitigeze kinjira mu kanwa kanjye.’

9 Ariko ijwi risubiza ubwa kabiri rivuye mu ijuru riti: ‘Icyo Imana yejeje, ntukacyite igihumanye.’

10 Ibyo biba inshuro eshatu, maze byose bisubizwa mu ijuru.

11 Ako kanya, abagabo batatu bahagarara imbere y’inzu nari ndimo, boherejwe kuri jye bavuye i Kayisariya.

12 Umwuka ambwira kugendana na bo ntarobanura. Bene Data batandatu na bo baramperekeza, twinjira mu nzu y’uwo muntu.

13 Atubwira uko yabonye umumarayika ahagaze mu nzu ye amubwira ati: ‘Tuma i Yopa, uzane Simoni witwa Petero.

14 Azakubwira amagambo uzakizwamo, wowe n’abo mu rugo rwawe bose.’

15 Nkigitangira kuvuga, Umwuka Wera amanukira kuri bo nk’uko yatumanukiyeho mu ntangiriro.

16 Nuko nibuka ijambo ry’Umwami, uko yavuze ati: ‘Yohana yabatirishije amazi, ariko mwe muzabatirishwa Umwuka Wera.’

17 None niba Imana yarabahaye impano imwe nk’iyo yaduhaye igihe twizeraga Umwami Yesu Kristo, jye nari nde ngo mbashe kurwanya Imana?”

18 Babyumvise, baraceceka, bahimbaza Imana bavuga bati: “Nuko rero Imana yahaye n’Abanyamahanga kwihana kubageza ku bugingo!”

### Itorero ryo muri Antiyokiya

19 Abari baratatanye kubera itotezwa ryabaye ku bwa Sitefano, baragenda bagera i Foyinike, i Kupuro, no muri Antiyokiya, batabwira ijambo umuntu uwo ari we wese keretse Abayuda bonyine.

20 Ariko bamwe muri bo, abagabo b’i Kupuro n’i Kurene, bageze muri Antiyokiya, bavugana n’Abagiriki, bababwiriza Umwami Yesu.

21 Ukuboko k’Umwami kwari kumwe na bo, abantu benshi barizera, bahindukirira Umwami.

22 Inkuru yabo igera mu matwi y’itorero ryari i Yerusalemu, bohereza Barinaba ngo agere muri Antiyokiya.

23 Agezeyo, abonye ubuntu bw’Imana, arishima; abasaba bose gukomeza kwizirika ku Mwami bafite umutima uhamye.

24 Kuko yari umuntu mwiza, wuzuye Umwuka Wera no kwizera; kandi abantu benshi bongererwa Umwami.

25 Barinaba ajya i Taruso gushaka Sawuli.

26 Amaze kumubona, amuzana muri Antiyokiya. Bamara umwaka wose bateranira hamwe n’itorero, bigisha abantu benshi. Abigishwa batangiriye kwitwa Abakristo muri Antiyokiya.

27 Muri iyo minsi, abahanuzi bamanuka bavuye i Yerusalemu bajya muri Antiyokiya.

28 Umwe muri bo witwaga Agabo arahaguruka, amenyesha abihishuriwe n’Umwuka ko hazabaho inzara ikomeye ku isi yose. Ibyo byabaye mu minsi ya Kilawudiyo.

29 Nuko abigishwa, uko buri wese yari ashoboye, biyemeza kohereza imfashanyo kuri bene Data bari batuye muri Yudaya.

30 Ibyo barabikora, bohereza iyo mfashanyo ku bakuru b’itorero, bayinyujije mu maboko ya Barinaba na Sawuli.

---

## Ibyakozwe n’Intumwa 12

### Yakobo yicwa, Petero afungwa

1 Muri icyo gihe, Umwami Herode arambura ukuboko agirira nabi bamwe bo mu itorero.

2 Yicisha Yakobo, mwene se wa Yohana, inkota.

3 Abonye ko ibyo byashimishije Abayuda, akomeza afata na Petero. Icyo gihe cyari iminsi y’Imitsima Itasembuwe.

4 Amaze kumufata, amushyira muri gereza, amushyikiriza imitwe ine y’abasirikare bane bane ngo bamurinde, agambiriye kumusohorera abantu nyuma ya Pasika.

5 Nuko Petero agumishwa muri gereza, ariko itorero rikomeza kumusengera ku Mana ridacogora.

### Petero akurwa muri gereza

6 Muri iryo joro Herode yari agiye kumusohora, Petero yari asinziriye hagati y’abasirikare babiri, aboshywe iminyururu ibiri; abarinzi na bo bari imbere y’umuryango barinda gereza.

7 Dore umumarayika w’Umwami arahagarara iruhande rwe, umucyo urarabagirana mu cyumba. Akubita Petero mu rubavu, aramukangura ati: “Haguruka vuba!” Iminyururu imuva ku maboko.

8 Umumarayika aramubwira ati: “Kenyera, wambare inkweto zawe.” Arabikora. Aramubwira ati: “Ambara umwitero wawe, unkurikire.”

9 Arasohoka, aramukurikira, ariko ntiyamenya ko ibyo umumarayika akora ari ukuri; yibwiraga ko ari iyerekwa.

10 Bamaze kurenga umurindi wa mbere n’uwa kabiri, bagera ku irembo ry’icyuma rijya mu mujyi; ryikingura ubwaryo. Barasohoka, banyura mu muhanda umwe, ako kanya umumarayika amuvaho.

11 Petero agarutse ubwenge, aravuga ati: “Noneho menye by’ukuri ko Umwami yohereje umumarayika we, akankiza ukuboko kwa Herode n’ibyo Abayuda bari bategereje byose.”

12 Amaze kubitekerezaho, ajya mu nzu ya Mariya, nyina wa Yohana witwaga Mariko, aho abantu benshi bari bateraniye basenga.

13 Petero akomanze ku rugi rw’irembo, umuja witwaga Roda araza ngo yumve.

14 Amenye ijwi rya Petero, kubera ibyishimo ntiyakingura irembo, ahubwo ariruka ajya kubabwira ko Petero ahagaze imbere y’irembo.

15 Baramubwira bati: “Urasaze!” Ariko akomeza kubemeza ko ari ko biri. Baravuga bati: “Ni marayika we.”

16 Ariko Petero akomeza gukomanga. Bamaze gukingura, baramubona, baratangara.

17 Abamunyisha ukuboko ngo baceceke, abasobanurira uko Umwami yamukuye muri gereza. Aravuga ati: “Mubwire Yakobo na bene Data ibi bintu.” Nuko arasohoka ajya ahandi.

18 Bukeye bwaho, haba urujijo rukomeye mu basirikare bibaza ibyabaye kuri Petero.

19 Herode amaze kumushaka akamubura, abaza abarinzi, ategeka ko bicwa. Nuko amanuka ava muri Yudaya ajya i Kayisariya, ahaguma.

### Urupfu rwa Herode

20 Herode yari yarakariye cyane abantu b’i Tiro n’i Sidoni. Bamugeraho bahuje umutima; bamaze kugirana ubucuti na Bulasito, umukozi wihariye w’umwami, basaba amahoro, kuko igihugu cyabo cyagaburirwaga n’igihugu cy’umwami.

21 Ku munsi wagenwe, Herode yambara imyambaro ya cyami, yicara ku ntebe y’ubwami, abaha ijambo.

22 Abantu batera hejuru bati: “Ni ijwi ry’imana, si iry’umuntu!”

23 Ako kanya umumarayika w’Umwami aramukubita, kuko atahaye Imana icyubahiro. Arywa n’inyo, arapfa.

24 Ariko ijambo ry’Imana rirakura kandi riragwira.

25 Barinaba na Sawuli barangije umurimo wabo, basubira i Yerusalemu, bajyanye na Yohana witwaga Mariko.

---

# Final note for the site
Please add this visible note somewhere small near the Scripture footer in Kinyarwanda mode:

> Icyitonderwa: Uyu mwandiko w’Ibyakozwe n’Intumwa 1–12 ni inyandiko y’agateganyo y’Ikinyarwanda yakozwe hashingiwe ku mwandiko wa Bibiliya y’Icyongereza iri muri public domain. Si Bibiliya Yera, kandi ugomba gusuzumwa mbere yo gukoreshwa nk’umwandiko wa nyuma.
