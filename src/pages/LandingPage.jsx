import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUpRight, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";

const WORK_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", label: "Restaurant", role: "Kitchen & Hospitality" },
  { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", label: "Coffee Shop", role: "Barista" },
  { url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80", label: "Agriculture", role: "Farm Hand" },
  { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", label: "Hotel", role: "Housekeeping" },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", label: "Fine Dining", role: "Chef Assistant" },
  { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", label: "Bar & Lounge", role: "Bartender" },
  { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", label: "Retail", role: "Shop Assistant" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", label: "Surf School", role: "Instructor" },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&q=80",
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80",
  "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=1600&q=80",
];

const LANGS = [
  { code: "EN", label: "English",    flag: "🇬🇧" },
  { code: "ES", label: "Español",    flag: "🇪🇸" },
  { code: "FR", label: "Français",   flag: "🇫🇷" },
  { code: "IT", label: "Italiano",   flag: "🇮🇹" },
  { code: "PT", label: "Português",  flag: "🇧🇷" },
  { code: "JA", label: "日本語",     flag: "🇯🇵" },
];

const WORKER_BGS = ["rgba(232,101,74,.12)","rgba(229,161,0,.12)","rgba(37,99,235,.12)","rgba(27,122,90,.12)","rgba(232,101,74,.12)","rgba(37,99,235,.12)"];
const MANAGER_BGS = ["rgba(232,101,74,.12)","rgba(27,122,90,.12)","rgba(229,161,0,.12)","rgba(37,99,235,.12)","rgba(232,101,74,.12)","rgba(27,122,90,.12)"];
const STEP_ICONS = ["📝","🔍","✅","✈️"];
const STEP_BGS  = ["var(--coral-glow)","var(--ocean-soft)","var(--forest-soft)","var(--gold-soft)"];

const TRANSLATIONS = {
  EN: {
    nav: { login:"Log In", signup:"Sign Up", profile:"My Profile", logout:"Log out" },
    hero: { t1:"Swap your job.", t2:"Keep moving.", sub:"Find someone in another city doing your same role. Swap positions. Travel with a guaranteed job from day one.", s1:"Workers", s2:"Active swaps", s3:"Avg rating" },
    carousel: { label:"Every industry", title:"Swap across any role", sub:"From coffee shops to cattle farms. Pairgo works for any job where one skilled person can step into another's shoes.", count:"08 industries" },
    how: { label:"How it works", title:"Four steps to your next adventure", sub:"No interviews, no uncertainty. Just a verified swap with someone ready to go.", steps:[{t:"Post your swap",d:"Share your current role, skills, and where you want to go next."},{t:"Find your match",d:"Browse verified workers in your target city with matching skills and great ratings."},{t:"Managers approve",d:"Both managers review the candidate's profile and approve. Full transparency."},{t:"Travel & start",d:"Your position is confirmed. Pack your bags and start working from day one."}] },
    cities: { label:"Explore", title:"Popular swap destinations", sub:"The most active cities for job swaps. New destinations are added as the community grows.", count:"06 destinations" },
    ben: { label:"Benefits", title:"Built for both sides", sub:"Whether you're chasing your next adventure or keeping your team running smooth.", tabW:"🎒 For Workers", tabM:"🏢 For Managers", workers:[{icon:"💼",t:"Job on arrival",d:"No more arriving broke. Your position is confirmed before you leave."},{icon:"⭐",t:"Portable reputation",d:"Ratings and verified skills follow you everywhere. Every swap makes you stronger."},{icon:"🌏",t:"Explore confidently",d:"New city, no financial risk. You know your schedule, your manager, your role."},{icon:"🤝",t:"Meet your swap partner",d:"Chat before you swap. Get tips about the city, the job, and the team."},{icon:"📈",t:"Grow your career",d:"Different environments, new skills, a resume that shows real adaptability."},{icon:"🔒",t:"Verified & safe",d:"Every business is ABN-verified. Every worker is ID-checked. Real reviews from real managers."}], managers:[{icon:"⚡",t:"Zero downtime",d:"Worker leaves, replacement arrives the same week. No gap in your roster."},{icon:"✅",t:"Pre-vetted candidates",d:"Verified skills, manager ratings, complete work history — before you approve."},{icon:"💰",t:"Cut recruitment costs",d:"No job ads, no interviews, no trial shifts. We handle the matching."},{icon:"📊",t:"Full transparency",d:"Detailed profiles with reliability scores and real comments from previous employers."},{icon:"🎯",t:"One-click approval",d:"Review the candidate, tap approve. The simplest hiring ever."},{icon:"🔄",t:"Consistent quality",d:"Workers perform because their rating directly affects future swap opportunities."}] },
    proof: { label:"Stories", title:"Real people, real swaps", sub:"Hear from backpackers and managers who tested the concept." },
    cta: { title:"Pairgo is live", sub:"Thousands of workers already swapping across Australia. Your next adventure starts now.", stats:[{val:"2,400+",label:"Workers"},{val:"340+",label:"Swaps done"},{val:"6",label:"Cities"},{val:"4.9★",label:"Avg rating"}] },
  },
  ES: {
    nav: { login:"Iniciar sesión", signup:"Registrarse", profile:"Mi Perfil", logout:"Cerrar sesión" },
    hero: { t1:"Intercambia tu trabajo.", t2:"Sigue moviéndote.", sub:"Encuentra a alguien en otra ciudad que haga tu mismo rol. Intercambia posiciones. Viaja con un trabajo garantizado desde el primer día.", s1:"Trabajadores", s2:"Swaps activos", s3:"Valoración media" },
    carousel: { label:"Todas las industrias", title:"Intercambia en cualquier rol", sub:"De cafeterías a granjas ganaderas. Pairgo funciona para cualquier trabajo donde una persona capacitada pueda ocupar el lugar de otra.", count:"08 industrias" },
    how: { label:"Cómo funciona", title:"Cuatro pasos a tu próxima aventura", sub:"Sin entrevistas, sin incertidumbre. Solo un intercambio verificado con alguien listo para ir.", steps:[{t:"Publica tu swap",d:"Comparte tu rol actual, habilidades y a dónde quieres ir."},{t:"Encuentra tu match",d:"Explora trabajadores verificados en tu ciudad destino con habilidades similares."},{t:"Los managers aprueban",d:"Ambos managers revisan el perfil y aprueban. Transparencia total."},{t:"Viaja y empieza",d:"Tu posición está confirmada. Haz las maletas y trabaja desde el primer día."}] },
    cities: { label:"Explorar", title:"Destinos populares de swap", sub:"Las ciudades más activas para intercambios de trabajo. Se añaden nuevos destinos a medida que crece la comunidad.", count:"06 destinos" },
    ben: { label:"Beneficios", title:"Pensado para todos", sub:"Ya sea que busques aventura o mantener tu equipo en marcha.", tabW:"🎒 Para Trabajadores", tabM:"🏢 Para Managers", workers:[{icon:"💼",t:"Trabajo al llegar",d:"No más llegar sin dinero. Tu puesto está confirmado antes de salir."},{icon:"⭐",t:"Reputación portable",d:"Tus valoraciones y habilidades te siguen a todos lados. Cada swap te hace más fuerte."},{icon:"🌏",t:"Explora con confianza",d:"Nueva ciudad, sin riesgo financiero. Conoces tu horario, tu manager y tu rol."},{icon:"🤝",t:"Conoce a tu compañero",d:"Chatea antes del swap. Obtén consejos sobre la ciudad, el trabajo y el equipo."},{icon:"📈",t:"Crece profesionalmente",d:"Diferentes entornos, nuevas habilidades, un CV que muestra adaptabilidad real."},{icon:"🔒",t:"Verificado y seguro",d:"Cada empresa está verificada. Cada trabajador tiene su ID comprobado. Reseñas reales."}], managers:[{icon:"⚡",t:"Cero tiempo muerto",d:"El trabajador se va, el reemplazo llega la misma semana. Sin huecos en tu equipo."},{icon:"✅",t:"Candidatos pre-evaluados",d:"Habilidades verificadas, valoraciones de managers, historial completo — antes de aprobar."},{icon:"💰",t:"Reduce costes de selección",d:"Sin anuncios, sin entrevistas, sin turnos de prueba. Nosotros hacemos el matching."},{icon:"📊",t:"Transparencia total",d:"Perfiles detallados con puntuaciones de fiabilidad y comentarios reales de empleadores anteriores."},{icon:"🎯",t:"Aprobación en un clic",d:"Revisa al candidato, aprueba. La contratación más sencilla del mundo."},{icon:"🔄",t:"Calidad constante",d:"Los trabajadores rinden porque su valoración afecta directamente sus futuras oportunidades."}] },
    proof: { label:"Historias", title:"Personas reales, swaps reales", sub:"Escucha a mochileros y managers que probaron el concepto." },
    cta: { title:"Pairgo está activo", sub:"Miles de trabajadores ya haciendo swaps en Australia. Tu próxima aventura empieza ahora.", stats:[{val:"2.400+",label:"Trabajadores"},{val:"340+",label:"Swaps realizados"},{val:"6",label:"Ciudades"},{val:"4.9★",label:"Valoración media"}] },
  },
  FR: {
    nav: { login:"Connexion", signup:"S'inscrire", profile:"Mon Profil", logout:"Déconnexion" },
    hero: { t1:"Échangez votre emploi.", t2:"Continuez à voyager.", sub:"Trouvez quelqu'un dans une autre ville qui fait le même travail que vous. Échangez vos postes. Voyagez avec un emploi garanti dès le premier jour.", s1:"Travailleurs", s2:"Échanges actifs", s3:"Note moyenne" },
    carousel: { label:"Toutes les industries", title:"Échangez dans n'importe quel rôle", sub:"Des cafés aux fermes. Pairgo fonctionne pour tout emploi où une personne qualifiée peut remplacer une autre.", count:"08 industries" },
    how: { label:"Comment ça marche", title:"Quatre étapes vers votre aventure", sub:"Pas d'entretiens, pas d'incertitude. Juste un échange vérifié avec quelqu'un prêt à partir.", steps:[{t:"Publiez votre échange",d:"Partagez votre rôle actuel, vos compétences et votre destination souhaitée."},{t:"Trouvez votre match",d:"Parcourez les travailleurs vérifiés dans votre ville cible avec les compétences correspondantes."},{t:"Les managers approuvent",d:"Les deux managers examinent le profil et approuvent. Transparence totale."},{t:"Voyagez et commencez",d:"Votre poste est confirmé. Faites vos valises et travaillez dès le premier jour."}] },
    cities: { label:"Explorer", title:"Destinations populaires", sub:"Les villes les plus actives pour les échanges. De nouvelles destinations sont ajoutées au fil de la croissance.", count:"06 destinations" },
    ben: { label:"Avantages", title:"Conçu pour les deux", sub:"Que vous cherchiez l'aventure ou à maintenir votre équipe opérationnelle.", tabW:"🎒 Pour les Travailleurs", tabM:"🏢 Pour les Managers", workers:[{icon:"💼",t:"Emploi à l'arrivée",d:"Fini d'arriver sans argent. Votre poste est confirmé avant votre départ."},{icon:"⭐",t:"Réputation portable",d:"Vos notes et compétences vous suivent partout. Chaque échange vous renforce."},{icon:"🌏",t:"Explorez en toute confiance",d:"Nouvelle ville, sans risque financier. Vous connaissez votre emploi du temps et votre rôle."},{icon:"🤝",t:"Rencontrez votre partenaire",d:"Chattez avant l'échange. Obtenez des conseils sur la ville, le travail et l'équipe."},{icon:"📈",t:"Développez votre carrière",d:"Nouveaux environnements, nouvelles compétences, un CV qui montre une vraie adaptabilité."},{icon:"🔒",t:"Vérifié et sécurisé",d:"Chaque entreprise est vérifiée. Chaque travailleur est contrôlé. Vrais avis de vrais managers."}], managers:[{icon:"⚡",t:"Zéro temps d'arrêt",d:"Le travailleur part, le remplaçant arrive la même semaine. Aucune lacune dans votre équipe."},{icon:"✅",t:"Candidats pré-vérifiés",d:"Compétences vérifiées, notes de managers, historique complet — avant votre approbation."},{icon:"💰",t:"Réduisez les coûts",d:"Pas d'annonces, pas d'entretiens, pas de périodes d'essai. Nous gérons le matching."},{icon:"📊",t:"Transparence totale",d:"Profils détaillés avec scores de fiabilité et commentaires réels d'anciens employeurs."},{icon:"🎯",t:"Approbation en un clic",d:"Examinez le candidat, approuvez. L'embauche la plus simple qui soit."},{icon:"🔄",t:"Qualité constante",d:"Les travailleurs performent car leur note affecte directement leurs futures opportunités."}] },
    proof: { label:"Témoignages", title:"De vraies personnes, de vrais échanges", sub:"Écoutez les backpackers et managers qui ont testé le concept." },
    cta: { title:"Pairgo est en ligne", sub:"Des milliers de travailleurs échangent déjà à travers l'Australie. Votre prochaine aventure commence maintenant.", stats:[{val:"2 400+",label:"Travailleurs"},{val:"340+",label:"Échanges réalisés"},{val:"6",label:"Villes"},{val:"4.9★",label:"Note moyenne"}] },
  },
  IT: {
    nav: { login:"Accedi", signup:"Registrati", profile:"Il Mio Profilo", logout:"Esci" },
    hero: { t1:"Scambia il tuo lavoro.", t2:"Continua a muoverti.", sub:"Trova qualcuno in un'altra città che fa il tuo stesso lavoro. Scambiate le posizioni. Viaggia con un lavoro garantito dal primo giorno.", s1:"Lavoratori", s2:"Scambi attivi", s3:"Voto medio" },
    carousel: { label:"Ogni settore", title:"Scambia in qualsiasi ruolo", sub:"Dai caffè alle fattorie. Pairgo funziona per qualsiasi lavoro in cui una persona qualificata può sostituire un'altra.", count:"08 settori" },
    how: { label:"Come funziona", title:"Quattro passi verso la tua avventura", sub:"Nessun colloquio, nessuna incertezza. Solo uno scambio verificato con qualcuno pronto a partire.", steps:[{t:"Pubblica il tuo swap",d:"Condividi il tuo ruolo attuale, le tue competenze e dove vuoi andare."},{t:"Trova il tuo match",d:"Cerca lavoratori verificati nella tua città di destinazione con competenze simili."},{t:"I manager approvano",d:"Entrambi i manager esaminano il profilo e approvano. Massima trasparenza."},{t:"Viaggia e inizia",d:"La tua posizione è confermata. Fai i bagagli e inizia a lavorare dal primo giorno."}] },
    cities: { label:"Esplora", title:"Destinazioni popolari", sub:"Le città più attive per gli scambi di lavoro. Nuove destinazioni vengono aggiunte man mano che la comunità cresce.", count:"06 destinazioni" },
    ben: { label:"Vantaggi", title:"Pensato per entrambi", sub:"Che tu stia cercando avventura o mantenendo il tuo team operativo.", tabW:"🎒 Per i Lavoratori", tabM:"🏢 Per i Manager", workers:[{icon:"💼",t:"Lavoro all'arrivo",d:"Niente più arrivi senza soldi. La tua posizione è confermata prima di partire."},{icon:"⭐",t:"Reputazione portabile",d:"Valutazioni e competenze ti seguono ovunque. Ogni scambio ti rende più forte."},{icon:"🌏",t:"Esplora con fiducia",d:"Nuova città, nessun rischio finanziario. Conosci il tuo orario, il manager e il ruolo."},{icon:"🤝",t:"Incontra il tuo partner",d:"Chatta prima dello scambio. Ricevi consigli sulla città, il lavoro e il team."},{icon:"📈",t:"Cresci professionalmente",d:"Ambienti diversi, nuove competenze, un curriculum che mostra vera adattabilità."},{icon:"🔒",t:"Verificato e sicuro",d:"Ogni azienda è verificata. Ogni lavoratore è controllato. Recensioni reali da veri manager."}], managers:[{icon:"⚡",t:"Zero tempi morti",d:"Il lavoratore parte, il sostituto arriva la stessa settimana. Nessuna lacuna nel team."},{icon:"✅",t:"Candidati pre-valutati",d:"Competenze verificate, valutazioni dei manager, storico completo — prima dell'approvazione."},{icon:"💰",t:"Riduci i costi",d:"Nessun annuncio, nessun colloquio, nessun turno di prova. Gestiamo noi il matching."},{icon:"📊",t:"Massima trasparenza",d:"Profili dettagliati con punteggi di affidabilità e commenti reali di datori di lavoro precedenti."},{icon:"🎯",t:"Approvazione in un clic",d:"Esamina il candidato, approva. L'assunzione più semplice di sempre."},{icon:"🔄",t:"Qualità costante",d:"I lavoratori performano perché la valutazione influisce direttamente sulle future opportunità."}] },
    proof: { label:"Storie", title:"Persone reali, scambi reali", sub:"Ascolta i backpacker e i manager che hanno testato il concetto." },
    cta: { title:"Pairgo è live", sub:"Migliaia di lavoratori stanno già scambiando in tutta l'Australia. La tua prossima avventura inizia ora.", stats:[{val:"2.400+",label:"Lavoratori"},{val:"340+",label:"Scambi completati"},{val:"6",label:"Città"},{val:"4.9★",label:"Voto medio"}] },
  },
  PT: {
    nav: { login:"Entrar", signup:"Cadastrar", profile:"Meu Perfil", logout:"Sair" },
    hero: { t1:"Troque seu trabalho.", t2:"Continue se movendo.", sub:"Encontre alguém em outra cidade fazendo a mesma função que você. Troquem de posição. Viaje com um emprego garantido desde o primeiro dia.", s1:"Trabalhadores", s2:"Trocas ativas", s3:"Avaliação média" },
    carousel: { label:"Todas as indústrias", title:"Troque em qualquer função", sub:"De cafeterias a fazendas. O Pairgo funciona para qualquer trabalho em que uma pessoa qualificada possa substituir outra.", count:"08 indústrias" },
    how: { label:"Como funciona", title:"Quatro passos para a sua aventura", sub:"Sem entrevistas, sem incerteza. Apenas uma troca verificada com alguém pronto para ir.", steps:[{t:"Publique seu swap",d:"Compartilhe seu cargo atual, habilidades e para onde quer ir."},{t:"Encontre seu match",d:"Explore trabalhadores verificados na cidade destino com habilidades compatíveis."},{t:"Gerentes aprovam",d:"Ambos os gerentes analisam o perfil e aprovam. Transparência total."},{t:"Viaje e comece",d:"Sua posição está confirmada. Faça as malas e comece a trabalhar desde o primeiro dia."}] },
    cities: { label:"Explorar", title:"Destinos populares", sub:"As cidades mais ativas para trocas de trabalho. Novos destinos são adicionados conforme a comunidade cresce.", count:"06 destinos" },
    ben: { label:"Benefícios", title:"Feito para os dois lados", sub:"Seja você em busca de aventura ou mantendo sua equipe funcionando.", tabW:"🎒 Para Trabalhadores", tabM:"🏢 Para Gerentes", workers:[{icon:"💼",t:"Trabalho na chegada",d:"Chegar sem dinheiro não existe mais. Sua vaga está confirmada antes de sair."},{icon:"⭐",t:"Reputação portátil",d:"Avaliações e habilidades te acompanham em todos os lugares. Cada troca te fortalece."},{icon:"🌏",t:"Explore com confiança",d:"Nova cidade, sem risco financeiro. Você sabe seu horário, gerente e função."},{icon:"🤝",t:"Conheça seu parceiro",d:"Converse antes da troca. Receba dicas sobre a cidade, o trabalho e a equipe."},{icon:"📈",t:"Cresça profissionalmente",d:"Ambientes diferentes, novas habilidades, um currículo que mostra adaptabilidade real."},{icon:"🔒",t:"Verificado e seguro",d:"Cada empresa é verificada. Cada trabalhador tem ID conferido. Avaliações reais."}], managers:[{icon:"⚡",t:"Zero tempo parado",d:"Trabalhador sai, substituto chega na mesma semana. Sem lacunas na equipe."},{icon:"✅",t:"Candidatos pré-avaliados",d:"Habilidades verificadas, avaliações de gerentes, histórico completo — antes de aprovar."},{icon:"💰",t:"Reduza custos",d:"Sem anúncios, sem entrevistas, sem turnos de teste. Cuidamos do matching."},{icon:"📊",t:"Transparência total",d:"Perfis detalhados com pontuações de confiabilidade e comentários reais de empregadores anteriores."},{icon:"🎯",t:"Aprovação em um clique",d:"Analise o candidato, aprove. A contratação mais simples de sempre."},{icon:"🔄",t:"Qualidade constante",d:"Trabalhadores rendem porque a avaliação afeta diretamente as oportunidades futuras."}] },
    proof: { label:"Histórias", title:"Pessoas reais, trocas reais", sub:"Ouça backpackers e gerentes que testaram o conceito." },
    cta: { title:"Pairgo está no ar", sub:"Milhares de trabalhadores já trocando em toda a Austrália. Sua próxima aventura começa agora.", stats:[{val:"2.400+",label:"Trabalhadores"},{val:"340+",label:"Trocas feitas"},{val:"6",label:"Cidades"},{val:"4.9★",label:"Avaliação média"}] },
  },
  JA: {
    nav: { login:"ログイン", signup:"登録", profile:"マイプロフィール", logout:"ログアウト" },
    hero: { t1:"仕事をスワップしよう。", t2:"旅を続けよう。", sub:"同じ職種の人を別の都市で見つけて、ポジションを交換しましょう。初日から仕事が保証された状態で旅ができます。", s1:"ワーカー数", s2:"アクティブなスワップ", s3:"平均評価" },
    carousel: { label:"あらゆる業界", title:"どんな職種でもスワップ", sub:"カフェから農場まで。スキルのある人が別の人の仕事を引き継げるなら、Pairgoはどんな仕事にも対応できます。", count:"08 業界" },
    how: { label:"仕組み", title:"次の冒険への4ステップ", sub:"面接なし、不安なし。準備ができた人との確認済みスワップだけ。", steps:[{t:"スワップを投稿",d:"現在の役職、スキル、行きたい場所を共有しましょう。"},{t:"マッチを見つける",d:"目標都市のスキルが一致する認証済みワーカーを探しましょう。"},{t:"マネージャーが承認",d:"両方のマネージャーが候補者のプロフィールを確認し承認します。完全な透明性。"},{t:"旅して働き始める",d:"ポジションが確定したら荷物をまとめて、初日から働き始めましょう。"}] },
    cities: { label:"探索", title:"人気のスワップ先", sub:"ジョブスワップで最もアクティブな都市。コミュニティの成長とともに新しい目的地が追加されます。", count:"06 目的地" },
    ben: { label:"メリット", title:"両方のために作られた", sub:"次の冒険を追いかけていても、チームを円滑に維持していても。", tabW:"🎒 ワーカー向け", tabM:"🏢 マネージャー向け", workers:[{icon:"💼",t:"到着時から仕事あり",d:"お金なしで到着することはもうありません。出発前にポジションが確定します。"},{icon:"⭐",t:"持ち運べる評価",d:"評価と認証済みスキルはどこへ行っても付いてきます。スワップするたびに強くなります。"},{icon:"🌏",t:"自信を持って探索",d:"新しい都市、金銭的リスクなし。スケジュール、マネージャー、役割がわかっています。"},{icon:"🤝",t:"パートナーと交流",d:"スワップ前にチャットしましょう。都市、仕事、チームについてのヒントを得られます。"},{icon:"📈",t:"キャリアを伸ばす",d:"異なる環境、新しいスキル、真の適応力を示す履歴書。"},{icon:"🔒",t:"認証済みで安全",d:"すべての企業はABN認証済み。すべてのワーカーはID確認済み。本物のレビュー。"}], managers:[{icon:"⚡",t:"ダウンタイムゼロ",d:"ワーカーが去った同じ週に代替者が到着。人員の穴なし。"},{icon:"✅",t:"事前審査済みの候補者",d:"承認前に、検証済みのスキル、マネージャー評価、完全な職歴を確認できます。"},{icon:"💰",t:"採用コストを削減",d:"求人広告なし、面接なし、試用シフトなし。マッチングはPairgoが担当します。"},{icon:"📊",t:"完全な透明性",d:"信頼性スコアと前の雇用主からの本物のコメントを含む詳細なプロフィール。"},{icon:"🎯",t:"ワンクリック承認",d:"候補者を確認して承認するだけ。史上最もシンプルな採用。"},{icon:"🔄",t:"一貫した品質",d:"評価が将来のスワップ機会に直接影響するため、ワーカーは高いパフォーマンスを発揮します。"}] },
    proof: { label:"ストーリー", title:"本物の人々、本物のスワップ", sub:"このコンセプトをテストしたバックパッカーとマネージャーの声を聞きましょう。" },
    cta: { title:"Pairgoはライブ中", sub:"すでに何千ものワーカーがオーストラリア全土でスワップしています。あなたの次の冒険は今始まります。", stats:[{val:"2,400+",label:"ワーカー"},{val:"340+",label:"完了したスワップ"},{val:"6",label:"都市"},{val:"4.9★",label:"平均評価"}] },
  },
};

const CITY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=85", city: "Sydney", jobs: "340+ swaps" },
  { url: "https://images.unsplash.com/photo-1477204606026-62a8ddc840ae?w=900&q=85", city: "Melbourne", jobs: "280+ swaps" },
  { url: "https://images.unsplash.com/photo-1563967949-d97cba787cae?w=900&q=85", city: "Cairns", jobs: "150+ swaps" },
  { url: "https://images.unsplash.com/photo-1649805311860-19ecc244533f?w=900&q=85", city: "Byron Bay", jobs: "120+ swaps" },
  { url: "https://images.unsplash.com/photo-1582761370596-77a6a42350d7?w=900&q=85", city: "Gold Coast", jobs: "190+ swaps" },
  { url: "https://images.unsplash.com/photo-1582224266049-4e6839d9aa45?w=1200&q=85", city: "Perth", jobs: "95+ swaps" },
];

export default function LandingPage({ onViewProfile, onLoginSuccess }) {
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [lang, setLang] = useState("EN");
  const tx = TRANSLATIONS[lang] ?? TRANSLATIONS.EN;
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [role, setRole] = useState("worker");
  const [carouselX, setCarouselX] = useState(0);
  const [visible, setVisible] = useState(new Set());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const observerRefs = useRef({});
  const animFrame = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx((p) => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setVisible((prev) => new Set([...prev, e.target.dataset.section])); }); },
      { threshold: 0.1 }
    );
    Object.values(observerRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let x = 0;
    const speed = 0.25;
    const totalWidth = WORK_PHOTOS.length * 254;
    const tick = () => { if (!pausedRef.current) x = (x + speed) % totalWidth; setCarouselX(x); animFrame.current = requestAnimationFrame(tick); };
    animFrame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  const isV = (id) => visible.has(id);
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 });
  }, []);

  const openLogin = () => { setSignupOpen(false); setLoginOpen(true); };
  const openSignup = () => { setLoginOpen(false); setSignupOpen(true); };

  return (
    <div style={{ background: "#FAFAF7", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        .fu{opacity:0;transform:translateY(44px);transition:opacity .85s cubic-bezier(.16,1,.3,1),transform .85s cubic-bezier(.16,1,.3,1);}
        .fu.v{opacity:1;transform:translateY(0);}
        .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}.d5{transition-delay:.5s}.d6{transition-delay:.6s}
        .nav{position:fixed;top:14px;left:50%;transform:translateX(-50%);width:calc(100% - 48px);max-width:1240px;z-index:100;padding:10px 12px 10px 20px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(32px) saturate(180%);-webkit-backdrop-filter:blur(32px) saturate(180%);background:rgba(13,13,11,.82);border:1px solid rgba(255,255,255,.09);border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06);}
        .nav::before{content:'';position:absolute;inset:-1px;border-radius:21px;padding:1px;background:linear-gradient(135deg,rgba(232,101,74,.18),rgba(255,255,255,.04),transparent 60%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
        .nav-logo{display:flex;align-items:center;gap:10px;font-family:var(--font-d);font-size:25px;font-weight:800;color:#fff;letter-spacing:-1px;text-decoration:none;position:relative;transition:opacity .2s;}
        .nav-logo:hover{opacity:.8;}
        .nav-logo span{color:var(--coral);}
        .nav-logo img{width:34px;height:34px;border-radius:9px;object-fit:cover;}
.nav-links{display:flex;gap:10px;align-items:center;}
        .nav-login{display:flex;align-items:center;padding:9px 18px;border:1px solid rgba(255,255,255,.12);border-radius:100px;font-family:var(--font-b);font-size:13px;font-weight:500;color:rgba(255,255,255,.6);background:transparent;cursor:pointer;transition:all .2s;white-space:nowrap;}
        .nav-login:hover{border-color:rgba(255,255,255,.28);color:#fff;background:rgba(255,255,255,.05);}
        .nav-cta{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,var(--coral),var(--coral-deep))!important;color:#fff!important;padding:9px 20px;border-radius:100px;font-family:var(--font-b)!important;font-size:13px!important;font-weight:600!important;cursor:pointer;border:none;transition:all .25s!important;box-shadow:0 0 20px rgba(232,101,74,.3),inset 0 1px 0 rgba(255,255,255,.15)!important;white-space:nowrap;}
        .nav-cta:hover{box-shadow:0 0 32px rgba(232,101,74,.5),inset 0 1px 0 rgba(255,255,255,.15)!important;transform:scale(1.04)!important;}
        .nav-cta svg{transition:transform .2s;}
        .nav-cta:hover svg{transform:translateX(2px);}
        .nav-sep{width:1px;height:18px;background:rgba(255,255,255,.1);flex-shrink:0;margin:0 2px;}
        .lang-switcher{position:relative;}
        .lang-btn{display:flex;align-items:center;gap:6px;background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:100px;padding:8px 12px;cursor:pointer;transition:all .2s;font-family:var(--font-b);font-size:12px;font-weight:600;color:rgba(255,255,255,.55);}
        .lang-btn:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.9);}
        .lang-btn-chevron{opacity:.4;transition:transform .25s;flex-shrink:0;}
        .lang-btn.open{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.18);color:rgba(255,255,255,.9);}
        .lang-btn.open .lang-btn-chevron{transform:rotate(180deg);opacity:.7;}
        .lang-dropdown{position:absolute;top:calc(100% + 12px);right:0;background:#151513;border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;min-width:174px;box-shadow:0 24px 56px rgba(0,0,0,.55);z-index:200;animation:fadeUp .18s cubic-bezier(.16,1,.3,1);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .lang-opt{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background .15s;}
        .lang-opt:hover{background:rgba(255,255,255,.06);}
        .lang-opt.active{background:rgba(255,255,255,.04);}
        .lang-opt-flag{font-size:15px;line-height:1;flex-shrink:0;}
        .lang-opt-name{font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.65);flex:1;}
        .lang-opt.active .lang-opt-name{color:#fff;font-weight:600;}
        .lang-opt-code{font-family:var(--font-b);font-size:10px;font-weight:700;color:var(--coral);letter-spacing:.5px;}
        @media(max-width:640px){.nav{top:0;left:0;right:0;transform:none;width:100%;max-width:none;border-radius:0;border-left:none;border-right:none;border-top:none;padding:10px 14px;}.nav::before{border-radius:0;}}
        .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#111;}
        .hero-bg{position:absolute;inset:0;transition:opacity 1.2s ease;}
        .hero-bg img{width:100%;height:100%;object-fit:cover;animation:hero-zoom 20s ease-in-out infinite alternate;}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(10,10,8,.88) 0%,rgba(10,10,8,.7) 45%,rgba(10,10,8,.3) 100%);z-index:1;}
        .hero-grain{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E");z-index:2;pointer-events:none;}
        .hero-content{position:relative;z-index:3;max-width:1280px;margin:0 auto;padding:140px 48px 120px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
        .hero-left{max-width:580px;}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:10px 16px 10px 16px;border-radius:100px;font-family:var(--font-b);font-size:13px;font-weight:500;color:#fff;margin-bottom:28px;backdrop-filter:blur(12px);}
        .bdot{width:7px;height:7px;background:var(--coral);border-radius:50%;position:relative;}
        .bdot::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--coral);animation:pulse 2s ease-out infinite;}
        .hero-title{font-family:var(--font-d);font-size:clamp(42px,5.8vw,72px);font-weight:800;color:#fff;line-height:1.04;letter-spacing:-3px;margin-bottom:24px;}
        .hero-title em{font-style:italic;color:var(--coral);font-weight:600;}
        .hero-sub{font-family:var(--font-b);font-size:19px;color:rgba(255,255,255,.5);line-height:1.65;margin-bottom:40px;max-width:460px;}
        .hero-stats{display:flex;align-items:center;gap:28px;margin-top:40px;}
        .hero-stat-divider{width:1px;height:34px;background:rgba(255,255,255,.12);}
        .hero-stat-val{font-family:var(--font-d);font-size:22px;font-weight:800;color:#fff;letter-spacing:-1px;line-height:1;}
        .hero-stat-label{font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.38);font-weight:500;margin-top:4px;}
        .cta-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;max-width:580px;margin:52px auto 0;}
        .cta-stat-val{font-family:var(--font-d);font-size:42px;font-weight:800;color:#fff;letter-spacing:-2px;line-height:1;margin-bottom:8px;}
        .cta-stat-label{font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.55);font-weight:600;text-transform:uppercase;letter-spacing:1.2px;}
        @media(max-width:640px){.cta-stats{grid-template-columns:repeat(2,1fr);gap:24px;}.hero-stats{gap:18px;}}
        .hero-right{position:relative;height:480px;perspective:800px;}
        .hcard{position:absolute;background:#1a1726;border-radius:20px;overflow:hidden;box-shadow:0 24px 56px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.07);}
        .hcard-accent{height:3px;background:linear-gradient(90deg,var(--coral),#a855f7);}
        .hcard-header{padding:16px 18px 14px;border-bottom:1px solid rgba(255,255,255,.07);}
        .hcard-toprow{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
        .hcard-status{display:flex;align-items:center;gap:6px;font-family:var(--font-b);font-size:10px;font-weight:600;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.8px;}
        .hcard-sdot{width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;animation:pulse 2s ease-out infinite;}
        .hcard-match{font-family:var(--font-b);font-size:10px;font-weight:700;color:var(--coral);background:rgba(232,101,74,.12);border:1px solid rgba(232,101,74,.25);border-radius:100px;padding:3px 10px;}
        .hcard-avrow{display:flex;align-items:center;gap:13px;}
        .hcard-av{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:2px solid rgba(255,255,255,.1);}
        .hcard-name{font-family:var(--font-b);font-size:14px;font-weight:700;color:#fff;letter-spacing:-.2px;margin-bottom:3px;}
        .hcard-role{font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.45);margin-bottom:4px;}
        .hcard-rating{display:flex;align-items:center;gap:4px;font-family:var(--font-b);font-size:11px;font-weight:600;color:#f0b429;}
        .hcard-rating span{color:rgba(255,255,255,.35);font-weight:400;}
        .hcard-route{display:flex;align-items:center;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.07);gap:0;}
        .hcard-node{display:flex;flex-direction:column;align-items:center;gap:5px;}
        .hcard-ndot{width:7px;height:7px;border-radius:50%;background:var(--coral);box-shadow:0 0 6px rgba(232,101,74,.6);}
        .hcard-ndot.b{background:#a855f7;box-shadow:0 0 6px rgba(168,85,247,.6);}
        .hcard-nlabel{font-family:var(--font-b);font-size:10px;font-weight:600;color:rgba(255,255,255,.55);white-space:nowrap;}
        .hcard-path{flex:1;height:1px;margin:0 10px;margin-bottom:14px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0px,rgba(255,255,255,.12) 3px,transparent 3px,transparent 7px);}
        .hcard-skills{display:flex;gap:5px;flex-wrap:wrap;padding:12px 18px;}
        .hcard-skill{padding:4px 10px;border-radius:6px;font-family:var(--font-b);font-size:10px;font-weight:600;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);}
        .hero-roles{position:absolute;bottom:0;left:0;right:0;z-index:3;padding:0 48px 32px;border-top:1px solid rgba(255,255,255,.06);}
        .hero-roles-inner{max-width:1280px;margin:0 auto;padding-top:20px;display:flex;align-items:baseline;gap:16px;}
        .hero-roles-label{font-family:var(--font-b);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.2);white-space:nowrap;flex-shrink:0;}
        .hero-roles-list{display:flex;flex-wrap:wrap;gap:6px 0;}
        .hero-roles-sep{color:rgba(255,255,255,.12);margin:0 10px;font-size:11px;}
        .hero-role-item{font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.22);font-weight:400;white-space:nowrap;}
        @media(max-width:640px){.hero-roles{display:none;}}
        .carousel-section{padding:100px 0 80px;background:#fff;}
        .carousel-header{max-width:1280px;margin:0 auto;padding:0 48px 52px;display:flex;justify-content:space-between;align-items:flex-end;}
        .carousel-count{font-family:var(--font-b);font-size:11px;font-weight:700;color:var(--ink-muted);text-transform:uppercase;letter-spacing:2.5px;padding-bottom:6px;}
        .carousel-overflow{overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent 0%,#000 7%,#000 93%,transparent 100%);mask-image:linear-gradient(to right,transparent 0%,#000 7%,#000 93%,transparent 100%);}
        .carousel-track{display:flex;gap:14px;width:max-content;will-change:transform;}
        .carousel-card{width:240px;height:320px;border-radius:16px;overflow:hidden;position:relative;flex-shrink:0;cursor:pointer;transition:transform .65s cubic-bezier(.16,1,.3,1),box-shadow .65s cubic-bezier(.16,1,.3,1);}
        .carousel-card:hover{transform:translateY(-10px);box-shadow:0 40px 80px rgba(0,0,0,.12);}
        .carousel-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.16,1,.3,1);}
        .carousel-card:hover img{transform:scale(1.06);}
        .carousel-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.62) 0%,rgba(0,0,0,.04) 55%,transparent 75%);display:flex;flex-direction:column;justify-content:flex-end;padding:20px 16px;}
        .carousel-label{font-family:var(--font-d);font-size:17px;font-weight:700;color:#fff;letter-spacing:-.3px;line-height:1.2;margin-bottom:5px;}
        .carousel-role{font-family:var(--font-b);font-size:10px;color:var(--coral);font-weight:700;text-transform:uppercase;letter-spacing:1.5px;}
        .how-section{background:#2C2C2A;position:relative;}
        .how-section .stitle{color:#fff;}
        .how-section .ssub{color:rgba(255,255,255,.42);}
        .how-inner{max-width:1280px;margin:0 auto;padding:100px 48px;}
        .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-top:64px;}
        .step{position:relative;padding:36px 28px;border-radius:24px;background:#fff;border:1px solid rgba(255,255,255,.06);transition:all .4s;}
        .step:hover{transform:translateY(-6px);box-shadow:0 24px 64px rgba(0,0,0,.35);border-color:var(--coral);}
        .step-num{font-family:var(--font-d);font-size:56px;font-weight:800;background:linear-gradient(135deg,var(--coral),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;margin-bottom:12px;}
        .step-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;}
        .step-title{font-family:var(--font-d);font-size:22px;font-weight:700;color:var(--ink);margin-bottom:10px;}
        .step-desc{font-family:var(--font-b);font-size:14px;color:var(--ink-muted);line-height:1.6;}
        .step-line{position:absolute;top:60px;right:-20px;width:40px;height:2px;background:linear-gradient(90deg,var(--coral),transparent);opacity:.3;}
        .cities-section{padding:100px 0;background:var(--sand);}
        .cities-header{max-width:1280px;margin:0 auto;padding:0 48px 52px;display:flex;justify-content:space-between;align-items:flex-end;}
        .cities-count{font-family:var(--font-b);font-size:11px;font-weight:700;color:var(--ink-muted);text-transform:uppercase;letter-spacing:2.5px;padding-bottom:6px;}
        .cities-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:270px 270px;gap:14px;max-width:1280px;margin:0 auto;padding:0 48px;}
        .city-card{border-radius:20px;overflow:hidden;position:relative;cursor:pointer;transition:transform .65s cubic-bezier(.16,1,.3,1),box-shadow .65s cubic-bezier(.16,1,.3,1);}
        .city-card-wide{grid-column:span 2;}
        .city-card:hover{transform:translateY(-8px);box-shadow:0 36px 72px rgba(0,0,0,.13);}
        .city-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .9s cubic-bezier(.16,1,.3,1);}
        .city-card:hover img{transform:scale(1.06);}
        .city-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.62) 0%,rgba(0,0,0,.04) 52%,transparent 72%);display:flex;flex-direction:column;justify-content:flex-end;padding:20px;}
        .city-name{font-family:var(--font-d);font-size:22px;font-weight:700;color:#fff;letter-spacing:-.3px;line-height:1;}
        .city-badge{display:inline-flex;align-items:center;background:rgba(232,101,74,.88);padding:4px 11px;border-radius:100px;font-family:var(--font-b);font-size:10px;font-weight:700;color:#fff;margin-top:8px;width:fit-content;letter-spacing:.3px;backdrop-filter:blur(8px);}
        .city-arrow{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;color:#fff;opacity:0;transform:scale(.85);transition:opacity .4s,transform .4s,background .3s;backdrop-filter:blur(8px);}
        .city-card:hover .city-arrow{opacity:1;transform:scale(1);}
        .ben-section{background:var(--ink);position:relative;overflow:hidden;}
        .ben-section::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(232,101,74,.08),transparent 70%);top:-200px;right:-200px;pointer-events:none;}
        .ben-inner{max-width:1280px;margin:0 auto;padding:100px 48px;position:relative;z-index:1;}
        .ben-toggle{display:flex;gap:4px;background:rgba(255,255,255,.05);border-radius:100px;padding:4px;width:fit-content;margin-bottom:56px;}
        .tgl{padding:13px 30px;border-radius:100px;border:none;font-family:var(--font-b);font-size:14px;font-weight:600;cursor:pointer;transition:all .3s;background:transparent;color:rgba(255,255,255,.35);}
        .tgl.on{background:var(--coral);color:#fff;}
        .ben-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .ben-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:36px;transition:all .3s;position:relative;overflow:hidden;}
        .ben-card:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);transform:translateY(-4px);}
        .ben-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--coral),var(--gold));opacity:0;transition:opacity .3s;}
        .ben-card:hover::before{opacity:1;}
        .ben-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:24px;}
        .ben-title{font-family:var(--font-d);font-size:22px;font-weight:700;color:#fff;margin-bottom:10px;}
        .ben-desc{font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.4);line-height:1.65;}
        .proof-section{padding:100px 48px;}
        .proof-inner{max-width:1280px;margin:0 auto;}
        .proof-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:56px;}
        .proof-card{background:#fff;border-radius:24px;padding:36px;border:1px solid rgba(0,0,0,.04);transition:all .4s;}
        .proof-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.05);}
        .proof-card-img{width:100%;height:180px;object-fit:cover;border-radius:16px;margin-bottom:20px;}
        .proof-stars{color:var(--gold);font-size:15px;letter-spacing:2px;margin-bottom:14px;}
        .proof-text{font-family:var(--font-b);font-size:15px;color:var(--ink-soft);line-height:1.7;margin-bottom:20px;}
        .proof-author{display:flex;align-items:center;gap:12px;}
        .proof-av{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;}
        .proof-name{font-family:var(--font-b);font-size:14px;font-weight:600;color:var(--ink);}
        .proof-role{font-family:var(--font-b);font-size:12px;color:var(--ink-muted);}
        .cta-section{position:relative;overflow:hidden;}
        .cta-bg{position:absolute;inset:0;}
        .cta-bg img{width:100%;height:100%;object-fit:cover;}
        .cta-bg-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(232,101,74,.92),rgba(212,80,58,.95));}
        .cta-inner{position:relative;z-index:1;max-width:700px;margin:0 auto;padding:120px 48px;text-align:center;}
        .cta-title{font-family:var(--font-d);font-size:clamp(36px,5vw,56px);font-weight:800;color:#fff;line-height:1.08;letter-spacing:-2px;margin-bottom:20px;}
        .cta-sub{font-family:var(--font-b);font-size:18px;color:rgba(255,255,255,.7);margin-bottom:0;line-height:1.6;}
        .footer{background:var(--ink);padding:48px 48px;border-top:1px solid rgba(255,255,255,.05);}
        .footer-inner{max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;}
        .footer-logo{display:flex;align-items:center;gap:9px;font-family:var(--font-d);font-size:22px;font-weight:800;color:#fff;}
        .footer-logo span{color:var(--coral);}
        .footer-logo img{width:30px;height:30px;border-radius:8px;object-fit:cover;}
        .footer-links{display:flex;gap:24px;}
        .footer-links a{font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.3);text-decoration:none;transition:color .2s;}
        .footer-links a:hover{color:rgba(255,255,255,.6);}
        .footer-copy{font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.2);}
        .slabel{font-family:var(--font-b);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--coral);margin-bottom:12px;}
        .stitle{font-family:var(--font-d);font-size:clamp(32px,4.5vw,52px);font-weight:800;color:var(--ink);line-height:1.08;letter-spacing:-2px;margin-bottom:16px;}
        .ssub{font-family:var(--font-b);font-size:17px;color:var(--ink-muted);line-height:1.65;max-width:520px;}
        @media(max-width:1024px){.hero-content{grid-template-columns:1fr;padding:120px 24px 60px;}.hero-right{display:none;}.steps{grid-template-columns:repeat(2,1fr);}.step-line{display:none;}.cities-grid{grid-template-columns:repeat(2,1fr);grid-template-rows:auto;}.city-card-wide{grid-column:span 2;}.city-card{aspect-ratio:16/9;}.ben-grid{grid-template-columns:1fr 1fr;}.proof-grid{grid-template-columns:1fr;}}
        @media(max-width:640px){.steps{grid-template-columns:1fr;}.cities-grid{grid-template-columns:repeat(2,1fr);grid-template-rows:auto;padding:0 16px;}.city-card-wide{grid-column:span 2;}.city-card{aspect-ratio:4/3;}.ben-grid{grid-template-columns:1fr;}.nav{padding:12px 16px;}.lang-btn span:nth-child(2){display:none;}.carousel-header,.how-inner,.ben-inner,.proof-section,.cities-header,.cta-inner,.footer{padding-left:20px;padding-right:20px;}}
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" style={{ position: "relative" }}>
          <img src="/logo.png" alt="Pairgo logo" />
          pair<span>go</span>
        </div>

        <div className="nav-links">
          {/* Language switcher */}
          <div className="lang-switcher" ref={langRef}>
            <button className={`lang-btn${langOpen ? " open" : ""}`} onClick={() => setLangOpen(o => !o)}>
              <Globe size={13} strokeWidth={1.8} />
              <span>{LANGS.find(l => l.code === lang)?.flag}</span>
              <span style={{ letterSpacing: ".3px" }}>{lang}</span>
              <svg className="lang-btn-chevron" width="9" height="5" viewBox="0 0 9 5" fill="none"><path d="M1 1L4.5 4L8 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {LANGS.map(l => (
                  <div key={l.code} className={`lang-opt${lang === l.code ? " active" : ""}`} onClick={() => { setLang(l.code); setLangOpen(false); }}>
                    <span className="lang-opt-flag">{l.flag}</span>
                    <span className="lang-opt-name">{l.label}</span>
                    <span className="lang-opt-code">{l.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nav-sep" />

          {/* Auth */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={onViewProfile} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 100, padding: "7px 15px 7px 7px", cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.11)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: user.role === "manager" ? "rgba(37,99,235,.25)" : "rgba(232,101,74,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                  {user.role === "manager" ? "🏢" : "🎒"}
                </div>
                <span style={{ fontFamily: "var(--font-b)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>{tx.nav.profile}</span>
              </button>
              <button onClick={logout} className="nav-login">{tx.nav.logout}</button>
            </div>
          ) : (
            <>
              <button onClick={openLogin} className="nav-login">{tx.nav.login}</button>
              <button onClick={openSignup} className="nav-cta">
                {tx.nav.signup}
                <ArrowUpRight size={13} strokeWidth={2.2} />
              </button>
            </>
          )}
        </div>
      </nav>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSuccess={onLoginSuccess} onSwitchToSignup={openSignup} />}
      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} onSuccess={onLoginSuccess} onSwitchToLogin={openLogin} />}

      {/* HERO */}
      <section className="hero" onMouseMove={handleMouseMove} ref={(el) => { observerRefs.current["hero"] = el; }} data-section="hero">
        {HERO_IMAGES.map((src, i) => (<div key={i} className="hero-bg" style={{ opacity: heroIdx === i ? 1 : 0, zIndex: 0 }}><img src={src} alt="" /></div>))}
        <div className="hero-overlay" /><div className="hero-grain" />
        <div className="hero-content">
          <div className="hero-left">
            <h1 className={`hero-title fu d1 ${isV("hero") ? "v" : ""}`}>{tx.hero.t1}<br /><em>{tx.hero.t2}</em></h1>
            <p className={`hero-sub fu d2 ${isV("hero") ? "v" : ""}`}>{tx.hero.sub}</p>
            <div className={`hero-stats fu d3 ${isV("hero") ? "v" : ""}`}>
              {[{ val: "2,400+", label: tx.hero.s1 }, { val: "340+", label: tx.hero.s2 }, { val: "4.9★", label: tx.hero.s3 }].flatMap((s, i) => [
                ...(i > 0 ? [<div key={`d${i}`} className="hero-stat-divider" />] : []),
                <div key={i}><div className="hero-stat-val">{s.val}</div><div className="hero-stat-label">{s.label}</div></div>
              ])}
            </div>
          </div>
          <div className="hero-right" style={{ transform: `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)` }}>
            {[
              { top: 0, left: 20, w: 278, z: 3, name: "Sarah T.", role: "Kitchen Hand", rating: "4.9", from: "Cairns", to: "Melbourne", skills: ["Kitchen","Barista","Food Prep"], match: "97%", emoji: "👩‍🍳", rgb: "232,101,74" },
              { top: 75, left: 148, w: 255, z: 2, name: "Juan M.", role: "Barista", rating: "4.8", from: "Melbourne", to: "Byron Bay", skills: ["Barista","Latte Art"], match: "94%", emoji: "☕", rgb: "110,60,255" },
              { top: 165, left: 36, w: 238, z: 1, name: "Lisa K.", role: "Housekeeper", rating: "4.7", from: "Sydney", to: "Gold Coast", skills: ["Housekeeping","Front Desk"], match: "91%", emoji: "🏨", rgb: "37,170,175" },
            ].map((c, i) => (
              <div key={i} className={`hcard fu d${i + 2} ${isV("hero") ? "v" : ""}`} style={{ top: c.top, left: c.left, width: c.w, zIndex: c.z }}>
                <div className="hcard-accent" />
                <div className="hcard-header">
                  <div className="hcard-toprow">
                    <div className="hcard-status"><div className="hcard-sdot" />Active</div>
                    <div className="hcard-match">{c.match} match</div>
                  </div>
                  <div className="hcard-avrow">
                    <div className="hcard-av" style={{ background: `rgba(${c.rgb},.1)`, boxShadow: `0 0 0 1px rgba(${c.rgb},.28),0 0 18px rgba(${c.rgb},.14)` }}>{c.emoji}</div>
                    <div>
                      <div className="hcard-name">{c.name}</div>
                      <div className="hcard-role">{c.role}</div>
                      <div className="hcard-rating"><em>★</em>{c.rating}</div>
                    </div>
                  </div>
                </div>
                <div className="hcard-route">
                  <div className="hcard-node"><div className="hcard-ndot" /><div className="hcard-nlabel">{c.from}</div></div>
                  <div className="hcard-path" />
                  <div className="hcard-node"><div className="hcard-ndot b" /><div className="hcard-nlabel">{c.to}</div></div>
                </div>
                <div className="hcard-skills">{c.skills.map((s, j) => <span key={j} className="hcard-skill">{s}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-roles">
          <div className="hero-roles-inner">
            <span className="hero-roles-label">Roles</span>
            <div className="hero-roles-list">
              {["Hospitality","Barista","Farm Work","Housekeeping","Kitchen Hand","Retail","Bar & Lounge","Surf Instructor","Tour Guide","Fruit Picking","Dishwasher","Front Desk","Chef Assistant","Cleaner","Waiter"].map((t, i, arr) => (
                <span key={i}><span className="hero-role-item">{t}</span>{i < arr.length - 1 && <span className="hero-roles-sep">·</span>}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CAROUSEL */}
      <section className="carousel-section" ref={(el) => { observerRefs.current["carousel"] = el; }} data-section="carousel">
        <div className="carousel-header">
          <div>
            <div className={`slabel fu ${isV("carousel") ? "v" : ""}`}>{tx.carousel.label}</div>
            <div className={`stitle fu d1 ${isV("carousel") ? "v" : ""}`}>{tx.carousel.title}</div>
            <div className={`ssub fu d2 ${isV("carousel") ? "v" : ""}`}>{tx.carousel.sub}</div>
          </div>
          <div className={`carousel-count fu d3 ${isV("carousel") ? "v" : ""}`}>{tx.carousel.count}</div>
        </div>
        <div className="carousel-overflow"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}>
          <div className="carousel-track" style={{ transform: `translateX(-${carouselX}px)` }}>
            {[...WORK_PHOTOS, ...WORK_PHOTOS].map((p, i) => (
              <div key={i} className="carousel-card">
                <img src={p.url} alt={p.label} />
                <div className="carousel-card-overlay">
                  <div className="carousel-label">{p.label}</div>
                  <div className="carousel-role">{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section" ref={(el) => { observerRefs.current["how"] = el; }} data-section="how">
        <div className="how-inner">
          <div className={`fu ${isV("how") ? "v" : ""}`}>
            <div className="slabel">{tx.how.label}</div>
            <div className="stitle">{tx.how.title}</div>
            <div className="ssub">{tx.how.sub}</div>
          </div>
          <div className="steps">
            {tx.how.steps.map((s, i) => (
              <div key={i} className={`step fu d${i + 1} ${isV("how") ? "v" : ""}`}>
                <div className="step-num">0{i + 1}</div>
                <div className="step-icon" style={{ background: STEP_BGS[i] }}>{STEP_ICONS[i]}</div>
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
                {i < 3 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section id="cities" className="cities-section" ref={(el) => { observerRefs.current["cities"] = el; }} data-section="cities">
        <div className="cities-header">
          <div>
            <div className={`slabel fu ${isV("cities") ? "v" : ""}`}>{tx.cities.label}</div>
            <div className={`stitle fu d1 ${isV("cities") ? "v" : ""}`}>{tx.cities.title}</div>
            <div className={`ssub fu d2 ${isV("cities") ? "v" : ""}`}>{tx.cities.sub}</div>
          </div>
          <div className={`cities-count fu d3 ${isV("cities") ? "v" : ""}`}>{tx.cities.count}</div>
        </div>
        <div className="cities-grid">
          {CITY_IMAGES.map((c, i) => (
            <div key={i} className={`city-card${i === 0 || i === 5 ? " city-card-wide" : ""} fu d${Math.min(i + 1, 6)} ${isV("cities") ? "v" : ""}`}>
              <img src={c.url} alt={c.city} />
              <div className="city-overlay">
                <div className="city-name">{c.city}</div>
                <div className="city-badge">{c.jobs}</div>
              </div>
              <div className="city-arrow"><ArrowUpRight size={14} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="ben-section" ref={(el) => { observerRefs.current["ben"] = el; }} data-section="ben">
        <div className="ben-inner">
          <div className={`fu ${isV("ben") ? "v" : ""}`}>
            <div className="slabel">{tx.ben.label}</div>
            <div className="stitle" style={{ color: "#fff" }}>{tx.ben.title}</div>
            <div className="ssub" style={{ color: "rgba(255,255,255,.4)" }}>{tx.ben.sub}</div>
          </div>
          <div className={`ben-toggle fu d1 ${isV("ben") ? "v" : ""}`}>
            <button className={`tgl ${role === "worker" ? "on" : ""}`} onClick={() => setRole("worker")}>{tx.ben.tabW}</button>
            <button className={`tgl ${role === "manager" ? "on" : ""}`} onClick={() => setRole("manager")}>{tx.ben.tabM}</button>
          </div>
          <div className="ben-grid">
            {(role === "worker" ? tx.ben.workers : tx.ben.managers).map((b, i) => (
              <div key={`${role}-${i}`} className={`ben-card fu d${(i % 3) + 1} ${isV("ben") ? "v" : ""}`}>
                <div className="ben-icon" style={{ background: (role === "worker" ? WORKER_BGS : MANAGER_BGS)[i] }}>{b.icon}</div>
                <div className="ben-title">{b.t}</div>
                <div className="ben-desc">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="proof-section" ref={(el) => { observerRefs.current["proof"] = el; }} data-section="proof">
        <div className="proof-inner">
          <div className={`fu ${isV("proof") ? "v" : ""}`}>
            <div className="slabel">{tx.proof.label}</div>
            <div className="stitle">{tx.proof.title}</div>
            <div className="ssub">{tx.proof.sub}</div>
          </div>
          <div className="proof-grid">
            {[
              { img: "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=600&q=80", text: "I was terrified of leaving Cairns. With Pairgo I found a kitchen hand in Melbourne who wanted my spot. I started working the day after I arrived.", name: "Emma L.", role: "Kitchen Hand • UK", emoji: "👩‍🍳", bg: "var(--coral-glow)" },
              { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80", text: "My biggest headache is replacing backpackers who leave. This solves it. I get someone with verified reviews who I know can do the job from day one.", name: "Tom S.", role: "Manager • Reef Bistro", emoji: "👨‍💼", bg: "var(--ocean-soft)" },
              { img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80", text: "Three swaps done. Byron Bay, Gold Coast, now Sydney. Every time I arrive knowing exactly what to expect. My profile keeps getting stronger.", name: "Lucas M.", role: "Barista • Argentina", emoji: "☕", bg: "var(--gold-soft)" },
            ].map((p, i) => (
              <div key={i} className={`proof-card fu d${i + 1} ${isV("proof") ? "v" : ""}`}>
                <img className="proof-card-img" src={p.img} alt="" />
                <div className="proof-stars">★★★★★</div>
                <div className="proof-text">"{p.text}"</div>
                <div className="proof-author">
                  <div className="proof-av" style={{ background: p.bg }}>{p.emoji}</div>
                  <div><div className="proof-name">{p.name}</div><div className="proof-role">{p.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="cta-section" ref={(el) => { observerRefs.current["cta"] = el; }} data-section="cta">
        <div className="cta-bg"><img src="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&q=80" alt="" /><div className="cta-bg-overlay" /></div>
        <div className="cta-inner">
          <div className={`fu ${isV("cta") ? "v" : ""}`}>
            <div className="cta-title">{tx.cta.title}</div>
            <div className="cta-sub">{tx.cta.sub}</div>
          </div>
          <div className={`cta-stats fu d1 ${isV("cta") ? "v" : ""}`}>
            {tx.cta.stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="cta-stat-val">{s.val}</div>
                <div className="cta-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><img src="/logo.png" alt="Pairgo logo" />pair<span>go</span></div>
          <div className="footer-links"><a href="#">About</a><a href="#">Blog</a><a href="#">Contact</a><a href="#">Privacy</a></div>
          <div className="footer-copy">© 2026 Pairgo. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
