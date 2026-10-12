/** All user-facing text (Albanian). The game is Albanian-only; keep wording in one place. */

/** Label used for the local player ("You"). */
export const ME = 'Ti'

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export const sq = {
  meta: {
    title: 'XING – Luaj Xing me nacut dhe cogat',
    description: 'Loja e njohur shqiptare me letra, tani online. Luaj Xing me nacut dhe cogat, 1 kundër 1 ose 2 kundër 2.',
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
      { icon: '🃏', title: 'Online me shokët', text: 'Shtyp “Luaj” dhe prit pak: tavolina mbushet vetë me lojtarë.' },
      { icon: '🤝', title: '1 kundër 1 ose 2 kundër 2', text: 'Luaj vetë, ose në çifte me partnerin përballë.' },
      { icon: '📱', title: 'Në telefon, pa shkarkim', text: 'Hap luajxing.com në shfletues dhe luaj menjëherë.' },
      { icon: '🤖', title: 'Të mungojnë shokët?', text: 'Stërvitu kundër kompjuterit sa herë të duash.' },
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
    signedIn: (name: string) => `I kyçur si ${name}`,
    mode: 'Lloji i lojës',
    mode2: 'Ti kundër kompjuterit',
    mode4: 'Ti & Arben kundër Drita & Ilir',
    playTo: 'Luaj deri në',
    points: (n: number) => `${n} pikë`,
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
    round: (n: number) => `Raundi ${n}`,
    to: (n: number) => `deri në ${n}`,
    cardsTaken: 'Letra të marra këtë raund',
    xingTitle: 'Bonuse Xing (×10 / ×20) në këtë lojë',
    inDeck: 'në pako',
    dealer: (name: string) => `Ndan letrat: ${name}`,
    withPartner: (name: string) => `(me ${name})`,
    partner: '(partneri)',
    yourTurnPick: 'Radha jote – zgjidh një letër',
    yourMove: 'Radha jote',
    thinking: (name: string) => `${name} po mendon…`,
    roundOver: 'Raundi mbaroi',
    empty: 'Bosh',
    onTable: (n: number) => `${plural(n, 'letër', 'letra')} në tavolinë`,
    top: 'sipër',
    xingChance: 'Mundësi për Xing!',
    history: 'Historia e lëvizjeve',
    roundBegins: (n: number) => `Raundi ${n} fillon…`,
    dealtNote: 'U ndanë letra të reja',
    centralStack: 'Pirgu në qendër',
    faceDown: 'letër e kthyer',
  },

  ev: {
    // verb forms: [ti, ai/ajo]
    playedEmpty: (who: string, you: boolean, card: string) =>
      `${who} ${you ? 'luajte' : 'luajti'} ${card} në tavolinë bosh`,
    played: (who: string, you: boolean, card: string) => `${who} ${you ? 'luajte' : 'luajti'} ${card}`,
    jackXing: (who: string, you: boolean, card: string) =>
      `${who} ${you ? 'bëre' : 'bëri'} XING me Jan (${card}): +20!`,
    xing: (who: string, you: boolean, card: string) => `${who} ${you ? 'bëre' : 'bëri'} XING me ${card}: +10!`,
    tookStack: (who: string, you: boolean, card: string, n: number) =>
      `${who} ${you ? 'more' : 'mori'} pirgun me ${card} dhe ${you ? 'kape' : 'kapi'} ${n} ${plural(n, 'letër', 'letra')}`,
    matched: (who: string, you: boolean, card: string, n: number) =>
      `${who} ${you ? 'përputhe' : 'përputhi'} me ${card} dhe ${you ? 'kape' : 'kapi'} ${n} ${plural(n, 'letër', 'letra')}`,
  },

  fx: {
    jackXingTitle: 'XING ME JAN! +20',
    jackXingSub: (who: string) => `${who} kapi një Jan të vetëm me Jan`,
    xingTitle: 'XING! +10',
    xingSub: (who: string) => `${who} kapi një letër të vetme`,
    captured: (who: string, n: number) => `${who} kapi ${n} ${plural(n, 'letër', 'letra')}`,
    pointsInStack: (n: number) => `${n} ${plural(n, 'pikë', 'pikë')} në pirg`,
    lastCards: (who: string) => `Letrat e fundit shkojnë te ${who}`,
    lastCardsSub: (n: number) => `${n} ${plural(n, 'letër mbeti', 'letra mbetën')} në tavolinë (pa bonus)`,
  },

  results: {
    title: (n: number) => `Rezultatet e raundit ${n}`,
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
    match: (target: number) => `Pikët e lojës (${target})`,
    leftover: (n: number) => `${n} letra mbetën në tavolinë dhe shkuan te kapësi i fundit (pa bonus).`,
    tie: (target: number) => `Të dyja anët arritën ${target} me pikë të barabarta – një raund tjetër vendos fituesin.`,
    next: 'Raundi tjetër',
    waiting: 'Po pritet për lojtarët e tjerë…',
    win: 'Fitove!',
    teamWins: (name: string, singular: boolean) => `${name} ${singular ? 'fiton' : 'fitojnë'}`,
    summary: (a: string, b: string, rounds: number, x0: number, x1: number) =>
      `${a} kundër ${b} · ${rounds} ${plural(rounds, 'raund', 'raunde')} · pikët Xing ${x0} – ${x1}`,
    finalBreakdown: 'Përmbledhja e raundit të fundit',
    again: 'Luaj përsëri',
    menu: 'Menyja kryesore',
  },

  online: {
    waiting: 'Po pritet për lojtarët…',
    found: 'U gjet loja – po përgatitet tavolina…',
    connecting: 'Po lidhet…',
    queue: (have: number, need: number) =>
      `${have} nga ${need} lojtarë në radhë. Loja nis vetë kur tavolina mbushet.`,
    left: 'Një lojtar u largua nga loja.',
    noServer: 'Nuk u lidh me serverin. Kontrollo internetin dhe provo përsëri.',
    another: 'Gjej një lojë tjetër',
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
