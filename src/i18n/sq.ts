/**
 * All user-facing text (Albanian). The game is Albanian-only; keep wording in one place.
 * Every string here can be overridden at runtime from the admin dashboard (see texts.ts);
 * sentences with variables are `tpl(...)` templates (syntax in tpl.ts).
 */
import { tpl } from './tpl'

/** Label used for the local player ("You"). */
export const ME = 'Ti'

export const sq = {
  meta: {
    title: 'XING – Luaj Xing me nacut dhe cogat',
    description: 'Loja e njohur shqiptare me letra, tani online. Luaj Xing me nacut dhe cogat, 1 kundër 1 ose 2 kundër 2.',
  },

  names: {
    computer: 'Kompjuteri',
    bot1: 'Drita',
    bot2: 'Arben',
    bot3: 'Ilir',
  },

  common: {
    loading: 'Po ngarkohet…',
    cancel: 'Anulo',
    close: 'Mbyll',
    signOut: 'Dil',
    players2: '2 lojtarë',
    players4: '4 lojtarë',
  },

  landing: {
    headline: 'LUAJ XING ME NACUT DHE COGAT',
    sub: 'Loja e njohur shqiptare me letra, tani online. Hap telefonin, gjej një tavolinë dhe luaj.',
    play: 'Luaj tani',
    login: 'Kam llogari – Hyr',
    howTo: 'Si luhet',
    features: [
      { icon: 'globe', title: 'Online me shokët', text: 'Shtyp “Luaj” dhe prit pak: tavolina mbushet vetë me lojtarë.' },
      { icon: 'users', title: '1 kundër 1 ose 2 kundër 2', text: 'Luaj vetë, ose në çifte me partnerin përballë.' },
      { icon: 'phone', title: 'Në telefon, pa shkarkim', text: 'Hap luajxing.com në shfletues dhe luaj menjëherë.' },
      { icon: 'bot', title: 'Të mungojnë shokët?', text: 'Stërvitu kundër kompjuterit sa herë të duash.' },
    ],
    stepsTitle: 'Mëso për 30 sekonda',
    steps: [
      { title: 'Përputh letrën e sipërme', text: 'Letra me të njëjtin numër merr gjithë pirgun.' },
      { title: 'Jani merr gjithçka', text: 'Jani (J) kap çdo pirg që ka letra.' },
      { title: 'Një letër e vetme? Bëj Xing!', text: 'Kape me letrën e njëjtë dhe merr +10 pikë.' },
      { title: 'Asat, Janët, 10♦ dhe 2♣ japin pikë', text: 'I pari që arrin 101 pikë e fiton lojën.' },
    ],
    finalTitle: 'Gati për një tavolinë?',
    finalText: 'Krijo llogari dhe luaj me nacut dhe cogat.',
  },

  auth: {
    signinTitle: 'Hyr për të luajtur',
    signupTitle: 'Krijo llogarinë tënde',
    resetTitle: 'Rivendos fjalëkalimin',
    username: 'Emri i lojtarit',
    email: 'Email',
    password: 'Fjalëkalimi',
    wait: 'Një çast…',
    signin: 'Hyr',
    signup: 'Krijo llogarinë',
    sendReset: 'Dërgo lidhjen',
    back: 'Kthehu te hyrja',
    create: 'Krijo llogari',
    forgot: 'Harrove fjalëkalimin?',
    home: '← Faqja kryesore',
    shortPassword: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.',
    created: 'Llogaria u krijua. Kontrollo email-in për ta konfirmuar, pastaj hyr.',
    resetSent: 'Nëse ky email ka llogari, lidhja për rivendosje është dërguar.',
    errors: {
      invalid: 'Email ose fjalëkalim i gabuar.',
      unconfirmed: 'Email-i nuk është konfirmuar ende. Kontrollo kutinë postare.',
      exists: 'Ky email ka tashmë një llogari.',
      rate: 'Shumë përpjekje. Provo përsëri pas pak.',
      generic: 'Diçka shkoi keq. Provo përsëri.',
    },
  },

  setup: {
    tagline: 'Loja e njohur shqiptare me letra: kap letrat, përdor Janin dhe bëj Xing.',
    signedIn: tpl<[string]>('I kyçur si {name}', ['name']),
    mode: 'Lloji i lojës',
    mode2: 'Ti kundër kompjuterit',
    mode4: 'Ti & Arben kundër Drita & Ilir',
    playTo: 'Luaj deri në',
    points: tpl<[number]>('{n} pikë', ['n']),
    variants: 'Variante të rregullave',
    jackXing: 'Xing me Jan mbi Jan = 20 pikë',
    jackXingHint: 'Një Jan i vetëm që kapet me një Jan tjetër. Nëse është i fikur, është kapje e zakonshme.',
    finalXing: 'Lejo Xing në letrën e fundit',
    finalXingHint: 'I fikur: letra e fundit e raundit nuk merr kurrë bonus Xing.',
    skill: 'Niveli i kompjuterit',
    normal: 'Normal',
    easy: 'I lehtë',
    sound: 'Efekte zanore',
    playComputer: 'Luaj kundër kompjuterit',
    playOnline: 'Luaj online',
    rules: 'Si luhet',
  },

  game: {
    rules: 'Rregullat',
    settings: 'Cilësimet',
    restart: 'Rifillo',
    leave: 'Largohu',
    toggleSound: 'Ndez/fik zërin',
    restartConfirm: 'Të rifillosh lojën? Pikët aktuale do të humbasin.',
    leaveConfirm: 'Të largohesh nga loja online?',
    round: tpl<[number]>('Raundi {n}', ['n']),
    to: tpl<[number]>('deri në {n}', ['n']),
    cardsTaken: 'Letra të marra këtë raund',
    xingTitle: 'Bonuse Xing (×10 / ×20) në këtë lojë',
    inDeck: 'në pako',
    dealer: tpl<[string]>('Ndan letrat: {name}', ['name']),
    withPartner: tpl<[string]>('(me {name})', ['name']),
    partner: '(partneri)',
    yourTurnPick: 'Radha jote – zgjidh një letër',
    yourMove: 'Radha jote',
    thinking: tpl<[string]>('{name} po mendon…', ['name']),
    roundOver: 'Raundi mbaroi',
    empty: 'Bosh',
    onTable: tpl<[number]>('{n=1?letër|letra} në tavolinë', ['n']),
    top: 'sipër',
    xingChance: 'Mundësi për Xing!',
    history: 'Historia e lëvizjeve',
    roundBegins: tpl<[number]>('Raundi {n} fillon…', ['n']),
    dealtNote: 'U ndanë letra të reja',
    centralStack: 'Pirgu në qendër',
    faceDown: 'letër e kthyer',
  },

  ev: {
    // arguments: who = name, you = true when the player is the viewer (changes the verb form), card, n = cards
    playedEmpty: tpl<[string, boolean, string]>('{who} {you?luajte|luajti} {card} në tavolinë bosh', ['who', 'you', 'card']),
    played: tpl<[string, boolean, string]>('{who} {you?luajte|luajti} {card}', ['who', 'you', 'card']),
    jackXing: tpl<[string, boolean, string]>('{who} {you?bëre|bëri} XING me Jan ({card}): +20!', ['who', 'you', 'card']),
    xing: tpl<[string, boolean, string]>('{who} {you?bëre|bëri} XING me {card}: +10!', ['who', 'you', 'card']),
    tookStack: tpl<[string, boolean, string, number]>(
      '{who} {you?more|mori} pirgun me {card} dhe {you?kape|kapi} {n} {n=1?letër|letra}',
      ['who', 'you', 'card', 'n'],
    ),
    matched: tpl<[string, boolean, string, number]>(
      '{who} {you?përputhe|përputhi} me {card} dhe {you?kape|kapi} {n} {n=1?letër|letra}',
      ['who', 'you', 'card', 'n'],
    ),
  },

  fx: {
    jackXingTitle: 'XING ME JAN! +20',
    jackXingSub: tpl<[string, boolean]>('{who} {you?kape|kapi} një Jan të vetëm me Jan', ['who', 'you']),
    xingTitle: 'XING! +10',
    xingSub: tpl<[string, boolean]>('{who} {you?kape|kapi} një letër të vetme', ['who', 'you']),
    captured: tpl<[string, boolean, number]>('{who} {you?kape|kapi} {n} {n=1?letër|letra}', ['who', 'you', 'n']),
    pointsInStack: tpl<[number]>('{n} pikë në pirg', ['n']),
    lastCards: tpl<[string, boolean]>('Letrat e fundit shkojnë te {you?ty|{who}}', ['who', 'you']),
    lastCardsSub: tpl<[number]>('{n} {n=1?letër mbeti|letra mbetën} në tavolinë (pa bonus)', ['n']),
  },

  results: {
    title: tpl<[number]>('Rezultatet e raundit {n}', ['n']),
    rows: {
      cards: 'Letra të marra',
      aces: 'Asat',
      jacks: 'Janët',
      ten: '10♦',
      two: '2♣',
      majority: 'Më shumë letra',
      cardPoints: 'Pikë nga letrat',
      xing10: 'Xing × 10',
      xing20: 'Xing me Jan × 20',
      total: 'Totali i raundit',
    },
    match: tpl<[number]>('Pikët e lojës ({target})', ['target']),
    leftover: tpl<[number]>('{n} letra mbetën në tavolinë dhe shkuan te kapësi i fundit (pa bonus).', ['n']),
    tie: tpl<[number]>('Të dyja anët arritën {target} me pikë të barabarta – një raund tjetër vendos fituesin.', ['target']),
    next: 'Raundi tjetër',
    waiting: 'Po pritet për lojtarët e tjerë…',
    win: 'Fitove!',
    teamWins: tpl<[string, boolean]>('{name} {single?fiton|fitojnë}', ['name', 'single']),
    summary: tpl<[string, string, number, number, number]>(
      '{a} kundër {b} · {rounds} {rounds=1?raund|raunde} · pikët Xing {x0} – {x1}',
      ['a', 'b', 'rounds', 'x0', 'x1'],
    ),
    finalBreakdown: 'Përmbledhja e raundit të fundit',
    again: 'Luaj përsëri',
    menu: 'Menyja kryesore',
  },

  online: {
    waiting: 'Po pritet për lojtarët…',
    found: 'U gjet loja – po përgatitet tavolina…',
    connecting: 'Po lidhet…',
    queue: tpl<[number, number]>('{have} nga {need} lojtarë në radhë. Loja nis vetë kur tavolina mbushet.', ['have', 'need']),
    left: 'Një lojtar u largua nga loja.',
    noServer: 'Nuk u lidh me serverin. Kontrollo internetin dhe provo përsëri.',
    another: 'Gjej një lojë tjetër',
  },

  daily: {
    name: 'Sfida e Ditës',
    title: tpl<[number]>('Sfida e Ditës #{n}', ['n']),
    blurb: 'E njëjta ndarje për të gjithë sot. Një raund kundër kompjuterit – sa pikë bën?',
    play: 'Luaj sfidën',
    yourResult: 'Rezultati yt sot',
    next: tpl<[number, number]>('Sfida e re pas {h} orë e {m} min', ['h', 'm']),
    win: 'Fitove!',
    loss: 'Humbe këtë herë',
    tie: 'Barazim',
    noXing: 'Pa Xing',
    xingCount: tpl<[number]>('Xing ×{x10}', ['x10']),
    jackCount: tpl<[number]>(' · Xing me Jan ×{x20}', ['x20']),
    share: tpl<[number, number, number, string, string]>(
      'XING · Sfida e Ditës #{n}\nTi {you} – {cpu} Kompjuteri {emoji}\n{xing}\nluajxing.com',
      ['n', 'you', 'cpu', 'emoji', 'xing'],
    ),
    xingLine(x10: number, x20: number): string {
      return x10 + x20 === 0 ? this.noXing : this.xingCount(x10) + (x20 ? this.jackCount(x20) : '')
    },
    shareText(n: number, you: number, cpu: number, outcome: 'win' | 'loss' | 'tie', xing: string): string {
      return this.share(n, you, cpu, outcome === 'win' ? '✅' : outcome === 'loss' ? '❌' : '🤝', xing)
    },
    whatsapp: 'Ndaj në WhatsApp',
    copy: 'Kopjo',
    copied: 'U kopjua ✓',
    menu: 'Menyja kryesore',
    leaveConfirm: 'Të largohesh nga sfida? Rezultati ruhet vetëm kur ta mbarosh.',
  },

  profile: {
    title: 'Profili im',
    menu: 'Profili im',
    loading: 'Po ngarkohen statistikat…',
    error: 'Nuk u ngarkuan statistikat. Provo përsëri.',
    empty: 'Ende s’ke lojra të regjistruara. Luaj një lojë dhe statistikat do të shfaqen këtu.',
    rating: 'Elo online',
    ratingHint: 'Fillon nga 1000 dhe ndryshon me lojërat online.',
    stats: {
      games: 'Lojra',
      wins: 'Fitore',
      losses: 'Humbje',
      winRate: '% fitore',
      xings: 'Xing (+10)',
      jackXings: 'Xing me Jan (+20)',
      streak: 'Seria aktuale',
      bestStreak: 'Seria më e mirë',
      online: 'Lojra online',
      dailyPlayed: 'Sfida të ditës',
      dailyStreak: 'Ditë radhazi',
    },
    achievements: 'Arritjet',
    unlocked: tpl<[number, number]>('{a} nga {b}', ['a', 'b']),
  },

  board: {
    title: 'Top lojtarët',
    menu: 'Top lojtarët',
    week: 'Kjo javë',
    all: 'Gjithë kohës',
    loading: 'Po ngarkohet tabela…',
    error: 'Nuk u ngarkua tabela. Provo përsëri.',
    empty: 'Ende nuk ka lojtarë në tabelë. Luaj online për t’u shfaqur këtu!',
    player: 'Lojtari',
    rating: 'Elo',
    wins: 'Fitore',
    games: 'Lojra',
    note: 'Numërohen vetëm lojërat online, kur të gjithë lojtarët raportojnë të njëjtin rezultat.',
    you: '(ti)',
  },

  ach: {
    first_win: { title: 'Fitorja e parë', text: 'Fito një lojë.' },
    wins_10: { title: '10 fitore', text: 'Fito 10 lojra.' },
    wins_50: { title: '50 fitore', text: 'Fito 50 lojra.' },
    first_xing: { title: 'Xingu i parë', text: 'Bëj një Xing (+10).' },
    xings_10: { title: '10 Xing', text: 'Bëj 10 Xing gjithsej.' },
    xings_25: { title: '25 Xing', text: 'Bëj 25 Xing gjithsej.' },
    jack_xing: { title: 'Xing me Jan', text: 'Kap një Jan të vetëm me Jan (+20).' },
    win_no_xing: { title: 'Fitove pa Xing', text: 'Fito një lojë pa bërë asnjë Xing.' },
    streak_3: { title: 'Seri 3 fitoresh', text: 'Fito 3 lojra radhazi.' },
    streak_5: { title: 'Seri 5 fitoresh', text: 'Fito 5 lojra radhazi.' },
    games_10: { title: '10 lojra', text: 'Luaj 10 lojra.' },
    games_50: { title: '50 lojra', text: 'Luaj 50 lojra.' },
    online_first: { title: 'Loja e parë online', text: 'Luaj një lojë online.' },
    online_win: { title: 'Fitorja e parë online', text: 'Fito një lojë online.' },
    daily_first: { title: 'Sfida e parë', text: 'Luaj Sfidën e Ditës.' },
    daily_3: { title: '3 ditë radhazi', text: 'Luaj Sfidën e Ditës 3 ditë me radhë.' },
    daily_7: { title: 'Një javë radhazi', text: 'Luaj Sfidën e Ditës 7 ditë me radhë.' },
  } as Record<string, { title: string; text: string }>,

  privacy: {
    link: 'Privatësia',
    title: 'Politika e privatësisë',
    updated: 'Përditësuar: 16 tetor 2026',
    intro: 'Kjo faqe shpjegon shkurt çfarë të dhënash përdor loja XING (luajxing.com) dhe pse.',
    sections: [
      {
        h: 'Çfarë të dhënash ruajmë',
        ul: [
          'Llogaria: email-i, fjalëkalimi dhe emri i lojtarit që zgjedh. Fjalëkalimi ruhet i koduar nga shërbimi i hyrjes dhe ne nuk e shohim.',
          'Të dhënat e lojës: sa lojra ke luajtur, fitoret, humbjet, Xing-et, seritë, vlerësimi Elo, arritjet dhe Sfida e Ditës.',
          'Një regjistër të lojërave të përfunduara (data, lloji i lojës dhe rezultati), që përdoret për statistikat javore.',
        ],
      },
      {
        h: 'Pse i përdorim',
        p: [
          'Për të të lejuar të hysh, për profilin dhe arritjet e tua, për tabelën e lojtarëve dhe për statistika të përgjithshme që na ndihmojnë ta përmirësojmë lojën. Nuk i shesim të dhënat e tua.',
        ],
      },
      {
        h: 'Çfarë shohin të tjerët',
        p: [
          'Emri yt i lojtarit shihet nga lojtarët me të cilët luan online dhe te tabela “Top lojtarët” (bashkë me Elo, fitoret dhe numrin e lojërave). Email-i yt nuk shfaqet askund te lojtarët e tjerë.',
          'Emrat e lojtarëve më të mirë të javës mund të publikohen në postime javore në rrjetet sociale.',
        ],
      },
      {
        h: 'Reklamat',
        p: [
          'Faqja shfaq reklama nga A-ADS (a-ads.com), një shërbim i palës së tretë. Ai mund të shohë adresën tënde IP dhe të dhëna të pajisjes, dhe mund të përdorë identifikues ose cookies për të shfaqur reklamat. Ne nuk i kontrollojmë reklamat dhe nuk u japim email-in ose emrin tënd. Për më shumë, shiko politikën e tyre.',
          'Reklamat shfaqen vetëm te faqja kryesore dhe menyja, jo gjatë lojës.',
        ],
      },
      {
        h: 'Ku ruhen të dhënat',
        p: [
          'Të dhënat ruhen te Supabase (hyrja dhe baza e të dhënave), ndërsa faqja shërbehet nga Vercel. Këto shërbime mund të regjistrojnë adresën IP për siguri dhe funksionim.',
        ],
      },
      {
        h: 'Në pajisjen tënde',
        p: [
          'Loja ruan në shfletuesin tënd cilësimet, rezultatin e Sfidës së Ditës dhe sesionin e hyrjes. Vetë loja nuk vendos cookies. Mund t’i fshish këto të dhëna nga cilësimet e shfletuesit.',
        ],
      },
      {
        h: 'Të drejtat e tua',
        p: [
          'Mund të kërkosh të shohësh, të korrigjosh ose të fshish llogarinë dhe të dhënat e tua. Mos ia jep fjalëkalimin tënd askujt, as neve.',
        ],
      },
    ] as { h: string; p?: string[]; ul?: string[] }[],
    contactTitle: 'Kontakti',
    contact: '',
  },

  settingsModal: {
    save: 'Ruaj',
    apply: 'Zbato dhe rifillo lojën',
    note: 'Ndryshimi i llojit të lojës, pikëve ose rregullave nis një lojë të re.',
  },

  rules: {
    title: 'Rregullat e Xing',
    sections: [
      {
        h: 'Letrat dhe lojtarët',
        p: [
          '52 letra, pa xhokerë. Vlen vetëm numri i letrës, kurrë figura (maça, zemra, etj.). Luhet 1 kundër 1, ose 2 kundër 2 me partnerët përballë njëri-tjetrit; partnerët ndajnë letrat e marra dhe pikët.',
        ],
      },
      {
        h: 'Ndarja',
        p: [
          'Në mes vendosen 4 letra (tre të kthyera, një e hapur – kurrë Jan), pastaj çdo lojtar merr 4 letra. Fillon lojtari në të djathtë të atij që ndan; loja vazhdon në drejtim të kundërt të akrepave të orës. Kur mbarojnë letrat në dorë, ndahen sërish nga 4 për secilin nga pakoja (në mes nuk shtohet asgjë), deri sa të mbarojë pakoja.',
        ],
      },
      {
        h: 'Radha jote',
        ol: [
          'Tavolina bosh: letra jote nis një pirg të ri (edhe Jani mbetet aty).',
          'Letër me të njëjtin numër si letra e SIPËRME: merr gjithë pirgun, bashkë me letrën tënde.',
          'Jani (J) merr çdo pirg që ka letra.',
          'Ndryshe, letra jote bëhet letra e re e sipërme.',
        ],
        p: ['Llogaritet vetëm letra e sipërme – nuk mblidhen vlera dhe nuk kapen letra të fshehura poshtë.'],
      },
      {
        h: 'Bonuset Xing',
        ul: [
          '<b>Xing +10:</b> në tavolinë ka vetëm një letër dhe ti e kap me të njëjtin numër (jo me Jan).',
          '<b>Xing me Jan +20:</b> një Jan i vetëm kapet me një Jan tjetër (mund të fiket në cilësime).',
          'Pirgu i parë me 4 letra nuk bën kurrë Xing. Si rregull, letra e fundit e raundit nuk merr bonus Xing.',
        ],
      },
      {
        h: 'Pikët (16 për raund + Xing)',
        table: [
          ['Çdo as / çdo Jan', '1'],
          ['10♦', '3'],
          ['2♣', '2'],
          ['Më shumë letra të marra (26–26 nuk jep asgjë)', '3'],
          ['Xing / Xing me Jan', '10 / 20'],
        ],
        p: [
          'Letrat që mbeten në tavolinë në fund shkojnë te kapësi i fundit, pa bonus. Loja vendoset pas një raundi të plotë: kush arrin pikët e caktuara e fiton, nëse arrijnë të dy fiton ai me më shumë pikë, dhe me pikë të barabarta luhet edhe një raund.',
        ],
      },
    ],
  },
}

export type Dict = typeof sq
