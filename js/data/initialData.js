/**
 * Pearson Edexcel A-Level Geography Case Study Database
 * Built according to the Edexcel A-Level Geography Specification (9GE0)
 */

export const EDEXCEL_TOPICS = {
  Physical: [
    "Tectonic Processes & Hazards",
    "Coastal Landscapes & Change",
    "The Water Cycle & Water Insecurity",
    "The Carbon Cycle & Energy Security"
  ],
  Human: [
    "Globalisation",
    "Regenerating Places",
    "Superpowers",
    "Health, Human Rights & Intervention",
    "Migration, Identity & Sovereignty"
  ]
};

export const EDEXCEL_PAPERS = {
  'Paper 1': [
    'Tectonic Processes & Hazards',
    'Coastal Landscapes & Change',
    'The Water Cycle & Water Insecurity',
    'The Carbon Cycle & Energy Security'
  ],
  'Paper 2': [
    'Globalisation',
    'Regenerating Places',
    'Superpowers',
    'Health, Human Rights & Intervention',
    'Migration, Identity & Sovereignty'
  ],
  'Paper 3': [
    'Synoptic Investigation (Cross-Theme: Players, Attitudes, Actions & Futures)'
  ]
};

export const SAMPLE_EXAM_QUESTIONS = {
  'Tectonic Processes & Hazards': [
    {
      marks: 12,
      command: 'Assess',
      question: 'Assess the relative importance of warning systems versus physical engineering in reducing the impacts of tectonic hazards.',
      timeMinutes: 18,
      ao1Key: 'Include place-specific statistics (e.g. JMA 8-second early warning, bullet train stops, 40.5m tsunami run-up, $235B loss).',
      ao2Key: 'Evaluate contrast between short-term warning evacuation success and long-term infrastructure limitations (e.g. seawall overtopping, complacency).'
    },
    {
      marks: 20,
      command: 'Evaluate',
      question: 'Evaluate the view that economic development is the most significant factor determining a community\'s resilience to tectonic hazards.',
      timeMinutes: 35,
      ao1Key: 'Compare high-income preparedness (Japan 2011 building codes, aseismic design) with lower-income vulnerability (Haiti 2010).',
      ao2Key: 'Critique the argument: high GDP reduces mortality but exponentially increases absolute economic cost; evaluate governance vs physical magnitude.'
    }
  ],
  'Coastal Landscapes & Change': [
    {
      marks: 12,
      command: 'Assess',
      question: 'Assess the role of human interference in exacerbating coastal erosion along rapidly retreating coastlines.',
      timeMinutes: 18,
      ao1Key: 'Quantify erosion rates (1.8-2.0m/yr boulder clay retreat, £2M Mappleton scheme, 10m/yr down-drift surge).',
      ao2Key: 'Assess terminal groyne syndrome starved sediment down-drift vs physical geology (unconsolidated till, long fetch).'
    },
    {
      marks: 20,
      command: 'Evaluate',
      question: 'Evaluate the extent to which sustainable coastal management schemes can balance economic assets against ecological sustainability.',
      timeMinutes: 35,
      ao1Key: 'Contrast hard engineering (groynes, revetments) with soft engineering / managed realignment (SMP policy units).',
      ao2Key: 'Evaluate cost-benefit ratios: defending high-value infrastructure (gas terminals, roads) vs allowing rural farmland erosion; short vs long-term sea-level rise.'
    }
  ],
  'Regenerating Places': [
    {
      marks: 12,
      command: 'Assess',
      question: 'Assess the reasons why perceptions of urban regeneration schemes vary between different local community groups.',
      timeMinutes: 18,
      ao1Key: 'Use London Docklands and Stratford Olympic legacy data (£7.7B private investment, 120,000 Canary Wharf finance jobs, 47.5% child poverty in Tower Hamlets).',
      ao2Key: 'Assess conflicting stakeholders: affluent inward commuters/professionals vs displaced working-class residents facing gentrification and lack of affordable housing.'
    },
    {
      marks: 20,
      command: 'Evaluate',
      question: 'Evaluate the success of property-led and prestige project regeneration strategies in reducing economic inequality.',
      timeMinutes: 35,
      ao1Key: 'Cite London Docklands LDDC deregulated enterprise zones, Canary Wharf expansion, and London 2012 legacy targets.',
      ao2Key: 'Evaluate trickledown theory limitations: high-skill tertiary jobs vs low-skill local residents; social polarization vs regional GDP growth.'
    }
  ],
  'Superpowers': [
    {
      marks: 12,
      command: 'Assess',
      question: 'Assess the extent to which economic mechanisms (e.g. trade networks, foreign aid) have superseded military power in asserting superpower influence.',
      timeMinutes: 18,
      ao1Key: 'Quote Belt and Road Initiative (BRI) figures ($1.05T+ financing across 140+ countries, $62B CPEC, Hambantota 99-yr lease).',
      ao2Key: 'Assess debt-trap diplomacy allegations and geo-economic soft power vs traditional military power projection (South China Sea bases).'
    },
    {
      marks: 20,
      command: 'Evaluate',
      question: 'Evaluate the environmental, economic, and geopolitical implications of rising emerging superpowers on global stability.',
      timeMinutes: 35,
      ao1Key: 'Include BRI corridors, fossil fuel infrastructure funding, rare earth mineral monopolies, and African resource investment.',
      ao2Key: 'Evaluate multipolar rivalry: economic development in developing global south vs rising carbon emissions, sovereign debt risks, and Western tensions.'
    }
  ],
  'The Water Cycle & Water Insecurity': [
    {
      marks: 12,
      command: 'Assess',
      question: 'Assess the relative importance of physical and human factors in causing acute water insecurity in developed nations.',
      timeMinutes: 18,
      ao1Key: 'California drought statistics: 80% agricultural consumption (almonds/alfalfa), 8.5m San Joaquin aquifer subsidence, Sierra Nevada snowpack decline.',
      ao2Key: 'Assess meteorological drought (ENSO, high-pressure ridges) vs human mismanagement (over-allocation of Colorado River, subsidized farming).'
    },
    {
      marks: 20,
      command: 'Evaluate',
      question: 'Evaluate the sustainability of hard-engineering water mega-projects compared to water conservation and recycling strategies.',
      timeMinutes: 35,
      ao1Key: 'California State Water Project, $1B Carlsbad Desalination plant (200M litres/day, 4 kWh/m3 energy), and Orange County toilet-to-tap recycling.',
      ao2Key: 'Evaluate economic cost, greenhouse gas emissions from reverse osmosis, brine marine damage vs reliability under severe climate change.'
    }
  ],
  'Globalisation': [
    {
      marks: 12,
      command: 'Assess',
      question: 'Assess the role of transnational corporations (TNCs) in driving the global shift of manufacturing to developing and emerging economies.',
      timeMinutes: 18,
      ao1Key: 'Apple & Foxconn data: Zhengzhou iPhone City (350,000 workers, 500k phones/day, 58% Apple gross margin, $22/day starting wages).',
      ao2Key: 'Assess push factors (Western high labor costs, environmental regulations) vs pull factors (SEZs, low wages, government subsidies, containerization).'
    },
    {
      marks: 20,
      command: 'Evaluate',
      question: 'Evaluate the economic benefits against the social and environmental costs of globalisation for emerging host economies.',
      timeMinutes: 35,
      ao1Key: 'Chinese GDP surge and poverty reduction vs Foxconn working conditions (dormitories, working hours) and toxic e-waste.',
      ao2Key: 'Evaluate multiplier effect and industrialization vs labor exploitation, lack of technology transfer (Foxconn retains only ~2-3% of iPhone value), and environmental degradation.'
    }
  ]
};

export const INITIAL_CASE_STUDIES = [
  {
    id: "cs-tohoku-2011",
    title: "2011 Tōhoku Megathrust Earthquake & Tsunami",
    country: "Japan (Tōhoku Region, Honshu)",
    lat: 38.297,
    lng: 142.373,
    category: "Physical",
    topic: "Tectonic Processes & Hazards",
    synopticLinks: [
      "The Carbon Cycle & Energy Security (Japan shut down all 54 nuclear reactors, boosting LNG imports and global carbon emissions)",
      "Globalisation (Global just-in-time automotive supply chain disrupted, e.g. Nissan and Toyota microchip shortages worldwide)",
      "Governance & Hazard Management (Contrasting vulnerability with developing nations like Haiti 2010)"
    ],
    summary: "On 11 March 2011, a 9.0-9.1 Mw megathrust earthquake 130 km offshore Sendai ruptured a 400 km seabed fault, upthrusting the ocean floor by 7-10 m and unleashing a destructive 40-metre tsunami. The event triggered the Level 7 Fukushima Daiichi nuclear catastrophe, testing the world's most sophisticated disaster risk reduction infrastructure.",
    stats: [
      "Mw 9.0–9.1 megathrust earthquake at 14:46 JST, 11 March 2011 (epicentre 130 km east of Sendai, 30 km focal depth)",
      "15,899 confirmed fatalities, 2,529 missing, and 6,157 injured; over 90% of deaths caused by drowning in the tsunami",
      "Maximum tsunami run-up height reached 40.5 metres at Miyako and penetrated up to 10 km inland across the Sendai plain",
      "Estimated economic damage of $235 to $300 billion USD (World Bank), the costliest single natural disaster in global history",
      "Level 7 nuclear disaster at TEPCO's Fukushima Daiichi plant; 154,000 residents evacuated within a 20 km perimeter",
      "Seafloor displacement moved Honshu island 2.4 m eastwards and shifted the Earth's rotational axis by 10 to 25 cm"
    ],
    causes: "Destructive subduction plate boundary where the dense oceanic Pacific Plate subducts beneath the continental Okhotsk microplate (Eurasian/North American plate boundary) along the Japan Trench at 8-9 cm/year. Accumulated elastic strain locked over centuries ruptured catastrophically over a 400 km × 200 km fault zone, displacing billions of cubic metres of water in minutes.",
    impacts: {
      social: "Over 450,000 displaced into cold temporary emergency shelters; lasting psychological trauma, PTSD, and social stigma for Fukushima evacuees; severe mortality skew toward elderly (>65% of casualties were aged 60+).",
      economic: "$235B+ direct loss; complete destruction of Tohoku fishing fleets, ports, and sea-farming kelp beds; agricultural soil salinised across 23,000 hectares; prolonged loss of nuclear power cost Japan over $30B annually in fossil fuel imports.",
      environmental: "Widespread radioactive contamination of soil and coastal waters (15,000+ PBq of Caesium-137 released); coastal land subsidence of up to 1.2 m permanently altered intertidal ecology; 25 million tonnes of marine debris washed into the Pacific Basin."
    },
    management: "Comprehensive Hazard Management Cycle: (1) JMA Early Warning System detected P-waves and broadcast mobile/TV alarms 8 seconds before destructive S-waves arrived, automatically stopping 27 Shinkansen high-speed bullet trains with zero derailments or passenger deaths. (2) Strict building codes under the Building Standard Law (aseismic dampers, deep pile foundations, base isolation) prevented structural collapse in Tokyo skyscrapers 370 km away. (3) 10-metre seawalls and floodgates protected some towns (e.g., Fudai village survived intact due to a 15.5m floodgate built by former mayor Wamura). (4) Post-disaster £12B investment in a 400 km, 12.5-14.7m 'Great Tsunami Wall' and strict relocation of residential zoning to elevated bedrock terraces.",
    evaluation: {
      strengths: [
        "Aseismic building codes saved hundreds of thousands of lives: ground shaking alone caused surprisingly few structural collapses in urban centres like Sendai and Tokyo.",
        "High-tech early warning protocols (JMA EEW) and automated gas/train shutdowns were world-leading, proving high economic development directly mitigates primary hazard risk.",
        "Decades of community disaster education, annual national drills (1 September), and vertical evacuation towers allowed over 95% of the coastal population in the inundation zone to escape in time."
      ],
      limitations: [
        "Dangerous complacency / 'Levee Effect': 10-metre seawalls (such as Kamaishi's $1.5B wall) created a false psychological sense of safety, leading some residents to delay evacuation until the wall was overtopped.",
        "Underestimated maximum hazard magnitude: Coastal defences were engineered for 1-in-100-year historical events rather than low-frequency, high-impact 1-in-1000-year events (the 869 AD Jōgan tsunami precedent was overlooked).",
        "Critical regulatory failure at Fukushima: TEPCO placed emergency diesel backup generators in low-lying seaside basements without adequate waterproofing, directly enabling station blackout and subsequent reactor meltdown.",
        "Ecological and social backlash: The new 400 km concrete seawalls have created 'concrete prisons' blocking ocean views, harming local tourism, and damaging coastal marine ecosystems."
      ]
    },
    examTips: "Perfect for 12/20-mark questions evaluating hazard management efficacy or comparing developed (Japan) vs developing (Haiti 2010 / Indian Ocean 2004) governance and resilience. Emphasize that while economic capital shields against ground shaking, secondary technological cascades (Fukushima) can push even wealthy states beyond their threshold of resilience."
  },
  {
    id: "cs-holderness-coast",
    title: "Holderness Coast: Hard vs. Soft Coastal Management",
    country: "United Kingdom (East Riding of Yorkshire)",
    lat: 53.864,
    lng: -0.138,
    category: "Physical",
    topic: "Coastal Landscapes & Change",
    synopticLinks: [
      "The Carbon Cycle & Climate Change (Sea level rise and increased North Sea storm frequency accelerating erosion rates)",
      "Regenerating Places (Rural deprivation, declining property values, and agricultural land abandonment in peripheral coastal communities)",
      "Governance & SMP Conflict (Cost-Benefit Analysis favoring high-value urban assets over agricultural farmland)"
    ],
    summary: "The Holderness coastline in East Yorkshire is Europe's fastest eroding coastline, retreating an average of 1.8 to 2 metres annually. A combination of soft unconsolidated boulder clay (till), intense North Sea wave energy, and longshore drift has created intense policy conflict between costly hard engineering schemes (Mappleton, Hornsea, Withernsea) and managed retreat.",
    stats: [
      "Average coastal retreat rate of 1.8 to 2 metres per year; over 4 million tonnes of sediment eroded annually",
      "Since Roman times, over 30 historic villages and 4 km of land have been lost to the North Sea (e.g., Auburn, Ravenspurn)",
      "1991 Mappleton Coastal Defence Scheme cost £2.0 million: 2 rock groynes, a rock revetment, and 61,000 tonnes of Larvikite granite imported from Norway",
      "Post-scheme erosion rates south of Mappleton (Great Cowden) surged from 1.5 m/year to over 10 m/year due to sediment starvation",
      "Easington Gas Terminal supplies ~25% of total UK natural gas; protected by a £4.5M rock revetment under a 'Hold the Line' SMP policy",
      "Spurn Point spit at the Humber Estuary breached in 2013 storm surge, destroying the RNLI access road due to reduced updrift sediment feed"
    ],
    causes: "Geology and geomorphology: Glacial till (unconsolidated boulder clay) deposited during the Devensian glaciation lacks structural cohesion, becoming rapidly saturated and prone to rotational slumping and mudslides. Powerful North Sea fetch (500–800 km) produces destructive, high-energy storm waves that scour the cliff base. Dominant northeasterly winds drive rapid southward longshore drift, stripping protective beach sediment away.",
    impacts: {
      social: "Loss of private homes, farms, and caravan parks with zero government compensation (e.g., Golden Sands Holiday Park at Withernsea lost 100+ pitches); immense anxiety and uninsurable property values along cliff-top hamlets.",
      economic: "Millions of pounds spent on piecemeal hard defences; loss of high-grade Grade 2 agricultural land; threat to vital national energy infrastructure (Easington Gas Terminal); plummeting council tax receipts.",
      environmental: "Down-drift sediment starvation causing collapse of Spurn Point spit (an SSSI and RAMSAR wetland); accelerated erosion of Grange Farm and Cowden cliffs; however, eroded sediment feeds Lincolnshire sandbanks and Humber mudflats."
    },
    management: "Shoreline Management Plan (SMP 22): Mixture of strategies: (1) 'Hold the Line' at key economic and population centres: Hornsea (sea walls, groynes), Withernsea (groynes and riprap), and Easington (revetment protecting gas terminals). (2) 'Hold the Line' at Mappleton (1991: £2M spent to protect the B1242 road using 61,000 tonnes of Norwegian granite groynes and cliff regrading). (3) 'Do Nothing' / 'Managed Realignment' across intervening agricultural stretches (e.g. Cowden, Aldbrough) to allow natural sediment replenishment down-estuary.",
    evaluation: {
      strengths: [
        "The Mappleton scheme successfully defended the village and secured the vital B1242 regional transport link, halting cliff retreat directly behind the granite groynes.",
        "Hard engineering at Hornsea and Withernsea protected hundreds of homes, seaside businesses, and municipal infrastructure from immediate collapse.",
        "Protection of Easington Gas Terminal safeguarded a critical UK national energy asset responsible for processing a quarter of British gas imports."
      ],
      limitations: [
        "Terminal Groyne Syndrome: Trapping beach sediment at Mappleton starved beaches to the south (Great Cowden), accelerating downdrift cliff erosion to an unprecedented 10 m/year.",
        "Interfering with the sediment cell: Depriving the wider southern littoral cell of boulder clay sediment threatens the stability of Spurn Head spit and Humber Estuary flood defences.",
        "Cost-Benefit Analysis injustice: High-cost hard engineering is economically justified for dense settlements but denies protection to low-density farming communities, stoking rural social division.",
        "Unsustainability under climate change: Hard sea walls reflect wave energy, scouring beaches down to bare bedrock (beach lowering), necessitating ever-costlier reinforcements."
      ]
    },
    examTips: "Essential for 12/20-mark questions on coastal management conflict and Shoreline Management Plans (SMPs). Always articulate the concept of the 'Sediment Cell'—explain how defending one sub-cell creates severe negative externalities downdrift (Terminal Groyne Syndrome)."
  },
  {
    id: "cs-london-regeneration",
    title: "London Docklands & Stratford Olympic Legacy",
    country: "United Kingdom (East London)",
    lat: 51.504,
    lng: -0.019,
    category: "Human",
    topic: "Regenerating Places",
    synopticLinks: [
      "Globalisation (Foreign direct investment, global capital flows into London property and deregulation of financial services)",
      "Superpowers (London as a global financial 'Alpha++' world city anchoring European commerce)",
      "Health, Human Rights & Spatial Inequality (Contrasting Canary Wharf ultra-wealth with severe child poverty in Tower Hamlets and Newham)"
    ],
    summary: "From 1981 onwards, the closure of London's East End river docks left 22 sq km of derelict industrial brownfield. The Conservative government established the market-led London Docklands Development Corporation (LDDC), transforming the Isle of Dogs into Canary Wharf. Later, the 2012 London Olympic Legacy targeted Stratford, Newham—the UK's most deprived borough—seeking long-term convergence in social and economic opportunity.",
    stats: [
      "LDDC (1981–1998): Leveraged £1.86 billion in public investment into over £7.7 billion in private sector investment across 8.5 sq miles",
      "Created Canary Wharf: 16 million sq ft of prime office/retail space employing over 120,000 workers in top global financial institutions (HSBC, Barclays, Citigroup)",
      "Built 24,000+ new housing units and 2,700 businesses, supported by £770M Docklands Light Railway (DLR) and £3.5B Jubilee Line Extension",
      "Stratford 2012 Olympic Legacy: 560 acres of polluted industrial brownfield transformed into Queen Elizabeth Olympic Park; 2 million tonnes of contaminated soil cleaned",
      "East Village (former athletes' village) delivered 2,818 homes (50% designated 'affordable'), alongside Westfield Stratford City (Europe's largest urban shopping mall, £1.4B)",
      "Persistent inequality: Tower Hamlets still suffers the UK's highest child poverty rate at 47.5% (after housing costs), illustrating deep post-regeneration polarisation"
    ],
    causes: "Industrial de-industrialisation: Containerisation in the 1960s-70s required deep-water docks (Tilbury, Felixstowe), rendering upstream London river docks obsolete. Between 1960 and 1980, over 150,000 jobs vanished in the East End, leaving 60% of male residents unemployed, widespread dereliction, and contaminated toxic soil.",
    impacts: {
      social: "Severe gentrification and social displacement: New luxury riverside apartments were priced far out of reach of original working-class dockworkers; cultural tension between affluent incoming professionals and legacy East End communities; high deprivation persisted in Newham and Tower Hamlets.",
      economic: "Creation of a globally dominant secondary financial core rivalling the historic City of London; massive expansion of knowledge-economy employment; billions injected into East London's tax base.",
      environmental: "Comprehensive remediation of over 200 hectares of heavily contaminated chemical and industrial brownfields; creation of urban parklands, cycle corridors, clean waterways, and BREEAM-certified sustainable architecture."
    },
    management: "Two distinct regeneration models: (1) Market-led UDC approach (LDDC): Enterprise Zone deregulation, tax holidays, fast-track planning permissions, and heavy infrastructure spending (DLR, London City Airport) to lure multinational private capital. (2) Public-Private Partnership Olympic Legacy (LLDC): State-planned holistic regeneration focused on sports legacy, mixed-tenure housing (East Village), education (UCL East, London College of Fashion), and transport hubs (Stratford International).",
    evaluation: {
      strengths: [
        "Unprecedented economic multiplier: Transformed a derelict industrial graveyard into one of the world's most lucrative financial and retail centres, attracting tens of billions in foreign direct investment.",
        "World-class transport connectivity: The DLR, Jubilee Line extension, High Speed 1 (Javelin train), and the Elizabeth Line (Crossrail) permanently connected historically isolated East London into the wider metropolis.",
        "Environmental brownfield decontamination: Remediated millions of tons of heavy metals, hydrocarbons, and industrial blight, converting them into award-winning public parkland (QE Olympic Park)."
      ],
      limitations: [
        "Severe gentrification and displacement: The market-led LDDC strategy prioritized luxury real estate; original dockers lacked the advanced qualifications to access Canary Wharf's high-finance jobs.",
        "Failure to solve local child poverty: Adjacent council estates in Tower Hamlets and Newham remain among the most income-deprived and overcrowded wards in England, demonstrating economic trickle-down failure.",
        "Olympic affordable housing compromise: Targets for 50% affordable housing were repeatedly watered down by private developers citing viability margins, pushing low-income families out.",
        "Corporate vulnerability: In the post-pandemic work-from-home era, Canary Wharf faces rising office vacancy rates (e.g. HSBC announcing departure to St Paul's in 2027)."
      ]
    },
    examTips: "Crucial for 20-mark essays assessing 'Evaluate the success of urban regeneration projects'. Differentiate sharply between economic metrics (which show glittering success) and social equity/lived experience metrics (which reveal entrenched segregation and gentrification). Contrast LDDC's private-sector bias with more inclusive modern regeneration frameworks."
  },
  {
    id: "cs-china-bri",
    title: "China's Belt and Road Initiative (BRI)",
    country: "China & Trans-Eurasian/African Corridor",
    lat: 39.904,
    lng: 116.407,
    category: "Human",
    topic: "Superpowers",
    synopticLinks: [
      "Globalisation (Remaking global trade networks and challenging Bretton Woods institutional hegemony)",
      "The Carbon Cycle & Energy Security (Securing oil pipeline transit through Central Asia/Gwadar while funding coal-fired power stations abroad)",
      "Geopolitical Spheres of Influence (Challenging Western maritime dominance in the Indo-Pacific and South China Sea)"
    ],
    summary: "Unveiled by President Xi Jinping in 2013, the Belt and Road Initiative ('One Belt, One Road') is the world's largest transnational infrastructure project. Spanning over 140 countries and representing over $1 trillion in financing, the BRI combines the overland Silk Road Economic Belt with the 21st Century Maritime Silk Road to project Chinese economic statecraft, lock in natural resources, and rewrite global geopolitical architecture.",
    stats: [
      "Launched in 2013; encompasses over 140 participant countries representing ~63% of the world population and ~32% of global GDP",
      "Cumulative Chinese financial engagement surpassed $1.05 trillion by 2024 (divided between infrastructure construction and non-financial equity investments)",
      "China-Pakistan Economic Corridor (CPEC): $62 billion flagship corridor connecting Xinjiang to Gwadar Port on the Arabian Sea, cutting crude transport distance by 10,000 km",
      "Hambantota Port (Sri Lanka): In 2017, unable to service mounting Chinese sovereign debt, Sri Lanka leased the strategic port and 15,000 acres of land to China Merchants Port for 99 years",
      "Laos-China Railway: $5.9 billion 422 km high-speed electrified railway connecting Kunming to Vientiane, accounting for nearly one-third of Laos's entire GDP",
      "Piraeus Port (Greece): COSCO acquired a 67% majority stake, transforming the Mediterranean port into Europe's 4th busiest container hub and a gateway for Chinese goods into the EU"
    ],
    causes: "Geopolitical and domestic economic imperatives: (1) Overcoming the 'Malacca Dilemma'—over 80% of China's imported oil traverses the narrow, US Navy-patrolled Strait of Malacca; overland corridors (Pakistan, Myanmar) provide strategic energy redundancy. (2) Domestic industrial overcapacity—exporting surplus Chinese steel, cement, engineering conglomerates, and skilled labour abroad. (3) Internationalising the Renminbi (RMB) and positioning China as the central anchor of the Eurasian trading sphere.",
    impacts: {
      social: "Accelerated urbanisation and connectivity in recipient developing countries; however, frequent friction over imported Chinese workers rather than hiring local labour forces, and displacement of indigenous communities along rail/dam corridors.",
      economic: "Modernised trade arteries in Central Asia and East Africa (e.g. Kenya's $3.6B Standard Gauge Railway); on the flip side, acute sovereign debt crises in low-income debtor nations (Sri Lanka, Zambia, Pakistan).",
      environmental: "Significant carbon lock-in through the financing of dozens of coal-fired power plants across Southeast Asia and Africa; ecological fragmentation in biodiversity hotspots (e.g. pristine rainforests traversed in Sumatra and Laos)."
    },
    management: "Institutional governance via Chinese state-backed policy banks (China Development Bank, Exim Bank of China), sovereign wealth funds (Silk Road Fund), and the multilateral Asian Infrastructure Investment Bank (AIIB - $100B capital). Shift since 2021 toward 'Small is Beautiful' and the 'Green Silk Road', scaling back mega-dams in favor of renewable energy, digital telecoms (Digital Silk Road / 5G), and debt restructuring negotiations.",
    evaluation: {
      strengths: [
        "Unmatched infrastructure delivery: Fills a chronic infrastructure deficit in the Global South that Western institutions (World Bank, IMF) had neglected due to bureaucratic hurdles and strict conditionalities.",
        "Strategic geopolitical leverage: Secured China long-term commercial control and naval dual-use potential across strategic maritime choke points (Gwadar, Djibouti, Hambantota, Piraeus).",
        "Economic integration: The Laos-China railway reduced freight costs by 30-50% and turned land-locked Laos into a vibrant land-linked transit corridor, unlocking regional trade."
      ],
      limitations: [
        "'Debt-Trap Diplomacy' scrutiny and fiscal defaults: Sri Lanka's 99-year lease of Hambantota Port sparked intense international outcry and allegations of predatory lending, forcing China into complex debt write-downs.",
        "Geopolitical backlash and containment: Sparked rival Western counter-initiatives (US-led PGII, EU Global Gateway, and India-Middle East-Europe Corridor IMEC) and heightened military tensions with the Quad.",
        "Environmental contradictions: Despite Beijing's 'Green BRI' rhetoric, billions were committed to carbon-intensive infrastructure, accelerating deforestation and fossil-fuel dependence in recipient nations.",
        "Non-performing loans: An estimated $78 billion in BRI loans had to be renegotiated or written down between 2020 and 2023, straining China's own domestic financial resilience."
      ]
    },
    examTips: "Essential for 20-mark essays on 'Superpowers' and 'Globalisation'. Use the BRI to demonstrate how China uses 'smart power' (combining economic loans, trade infrastructure, and institutional finance) rather than direct military intervention to reshape spheres of influence. Contrast with traditional American soft and hard power projection."
  },
  {
    id: "cs-california-water",
    title: "California Water Insecurity & Drought Management",
    country: "United States (California & Colorado River Basin)",
    lat: 36.778,
    lng: -119.417,
    category: "Physical",
    topic: "The Water Cycle & Water Insecurity",
    synopticLinks: [
      "The Carbon Cycle & Climate Change (Anthropogenic climate change causing shrinking Sierra Nevada snowpack and megadroughts)",
      "Globalisation (California produces 80% of global almonds and 1/3 of US vegetables, tying global food supply to local aquifer depletion)",
      "Superpowers & Geopolitics (Interstate conflict over the 1922 Colorado River Compact between 7 Western US states)"
    ],
    summary: "California faces structural hydrological disparity: 75% of annual precipitation falls in the mountainous north, while 80% of water demand lies in the arid agricultural Central Valley and southern urban centres (LA, San Diego). Combined with chronic megadroughts and over-allocation of the Colorado River, the state represents a prime case study of sophisticated engineering versus ecological exhaustion.",
    stats: [
      "Agriculture consumes ~80% of California's developed water supply, supporting a $50+ billion farming industry",
      "Central Valley produces >80% of the world's commercial almonds (requiring ~4.5 litres of water to produce a single almond)",
      "State Water Project (SWP) and Central Valley Project (CVP) span over 1,100 km of aqueducts, dams, and pumping stations (including the Edmonston Pumping Plant lifting water 587 m over the Tehachapi Mountains)",
      "Severe groundwater depletion: San Joaquin Valley has suffered up to 8.5 metres (28 feet) of land subsidence due to unregulated aquifer overdraft",
      "Lake Mead and Lake Powell reservoirs fell below 25% capacity during the 2000-2023 megadrought (the driest 22-year period in 1,200 years)",
      "Carlsbad Desalination Plant (San Diego County) cost $1.0 billion, producing 50 million gallons (190,000 m³) of potable water daily for ~400,000 residents"
    ],
    causes: "Climatic mismatch and human over-allocation: Mediterranean to semi-arid climate with high inter-annual rainfall variability and reliance on winter Sierra Nevada snowpack (which acts as a natural frozen reservoir). Rising global temperatures cause precipitation to fall as rain rather than snow, speeding spring melt and causing summer reservoirs to run dry. The historic 1922 Colorado River Compact over-allocated 17.5 million acre-feet of water based on an unusually wet historical period that never recurred.",
    impacts: {
      social: "Mandatory urban water rationing (20% cuts under Governor Brown); dry domestic wells in disadvantaged Central Valley Latino farmworker communities (e.g. East Porterville); toxic dust storms from shrinking inland lakes (Salton Sea) triggering childhood asthma.",
      economic: "Billions in drought-induced crop losses, fallowed farmland (over 400,000 acres unplanted in 2021), and soaring electricity costs as hydro-power output fell by over 50%.",
      environmental: "Near-extinction of native species like the Delta Smelt and Chinook Salmon due to warm water temperatures and reduced freshwater flow through the Sacramento-San Joaquin Bay Delta; subsidence permanently crushing aquifer storage capacity."
    },
    management: "Multi-tiered management: (1) Megascale Hard Engineering: California State Water Project (SWP) and California Aqueduct transferring billions of m³ south; $1B Carlsbad Desalination Plant powered partly by renewable offsets. (2) Groundwater Regulation: 2014 Sustainable Groundwater Management Act (SGMA) requiring local agencies to bring overdrafted basins into sustainable yield by 2040. (3) Conservation & Recycling: Orange County Groundwater Replenishment System (GWRS) purifies 130 million gallons/day of wastewater into ultra-pure drinking water ('toilet-to-tap'). (4) Agricultural smart irrigation (subsurface drip, soil moisture sensors).",
    evaluation: {
      strengths: [
        "Engineering marvel: The SWP and CVP successfully enabled California to become the world's 5th largest economy and an agricultural titan despite natural semi-desert conditions.",
        "Advanced water recycling and desalination: Orange County's GWRS and Carlsbad Desalination provide climate-resilient baseline water supplies entirely immune to drought cycles.",
        "Groundwater governance: SGMA established historic statutory oversight, stopping decades of unregulated, anarchic 'race-to-the-bottom' private well drilling."
      ],
      limitations: [
        "Desalination's high energy and environmental costs: The Carlsbad plant consumes massive electricity (250 GWh/year) and discharges concentrated toxic brine back into the ocean, threatening marine ecology.",
        "Deep political inertia in water rights: Senior agricultural water rights dating back to the 19th-century 'first in time, first in right' doctrine prevent equitable water reallocation to high-demand urban and conservation areas.",
        "Accelerating climate vulnerability: Desalination and aqueducts cannot offset the catastrophic loss of the Sierra Nevada snowpack, which is projected to decline by 40-60% by 2050 under high-emissions scenarios.",
        "High cost of infrastructure maintenance: Crumbling concrete infrastructure was highlighted by the near-catastrophic Oroville Dam spillway collapse in 2017, costing over $1 billion to repair."
      ]
    },
    examTips: "Essential for 12/20-mark questions evaluating hard vs soft water management in water-insecure regions. Emphasize that supply-side engineering (dams, aqueducts, desalination) ultimately reaches physical, ecological, and economic limits, requiring a shift to demand-side management (SGMA, pricing reform, crop switching)."
  },
  {
    id: "cs-apple-foxconn",
    title: "Apple Inc. & Foxconn: Globalisation & The Global Shift",
    country: "USA & China (Cupertino & Zhengzhou)",
    lat: 34.757,
    lng: 113.665,
    category: "Human",
    topic: "Globalisation",
    synopticLinks: [
      "Superpowers (US-China geopolitical rivalry, decoupling, and technological protectionism)",
      "Health, Human Rights & Intervention (Labour rights violations, working conditions in Special Economic Zones, and corporate codes of conduct)",
      "Regenerating Places (De-industrialisation in the US Rust Belt vs. hyper-rapid urbanisation in Chinese megacities)"
    ],
    summary: "Apple Inc. epitomises the spatial division of labour within modern global production networks. High-value research, silicon architecture, software design, and brand marketing remain concentrated at Apple Park in Cupertino, California, while low-margin assembly is outsourced to Taiwanese contract manufacturer Foxconn (Hon Hai Precision Industry) in Zhengzhou ('iPhone City'), China.",
    stats: [
      "Apple's market capitalization surpassed $3 trillion, making it the most valuable public TNC on Earth",
      "Zhengzhou Foxconn factory complex covers 1.4 square miles, employing up to 350,000 workers and producing up to 500,000 iPhones per day (approx. 50% of global iPhone supply)",
      "Spatial division of profit: Of the retail price of an iPhone, Apple captures ~58% in gross profit margin, component makers (Japan, S. Korea, Taiwan) capture ~30%, while Chinese assembly accounts for less than 3-5% of total value",
      "Foxconn is China's largest private employer, with over 1.2 million workers across its mega-campuses in Shenzhen, Zhengzhou, and Chengdu",
      "In 2010, a spate of 14 Foxconn worker suicides highlighted extreme production pressure, leading to the installation of anti-suicide nets and mandatory psychological counselling",
      "Supply chain diversification: Apple is accelerating investment in India (Foxconn Chennai) and Vietnam, aiming to produce 25% of all iPhones in India by 2027 to mitigate geopolitical risk"
    ],
    causes: "The Global Shift and containerised trade: Rapid container shipping, digital telecommunications, and China's 1978 Open Door Policy (Special Economic Zones with tax exemptions, lax environmental rules, and low labour costs) made outsourcing labour-intensive assembly overwhelmingly lucrative. Foxconn provided unparalleled flexible labour scale, able to mobilise 100,000 assembly line workers overnight for a product launch.",
    impacts: {
      social: "Mass rural-to-urban internal migration of young Chinese 'hukou' workers; grueling 12-hour shifts, cramped dormitories, and mental health crises; creation of a vast emerging Chinese middle class with rising purchasing power.",
      economic: "Enormous positive multiplier effect in Henan province, turning Zhengzhou into an international logistics hub responsible for ~60% of Henan's total exports; however, host countries capture very low tax revenue due to transfer pricing and tax haven routing (Ireland, Jersey).",
      environmental: "High carbon footprint from intercontinental air freight (flying newly manufactured iPhones from Zhengzhou to Western retail stores via chartered Boeing 747s); hazardous electronic waste and high industrial water usage."
    },
    management: "Corporate Social Responsibility (CSR) vs State Governance: (1) Apple established an annual Supplier Responsibility Progress Report auditing working hours, child labour prevention, and fair wage compliance. (2) Foxconn raised baseline wages, introduced automated robotic assembly lines ('Foxbots'), and installed safety netting. (3) 'China Plus One' diversification strategy: relocating production nodes to India (Tamil Nadu) and Vietnam to hedge against strict Chinese COVID-19 lockdowns, trade tariffs, and geopolitical blockades.",
    evaluation: {
      strengths: [
        "Unprecedented consumer access and efficiency: Globalised supply chains generated immense economies of scale, enabling billions of global consumers to access high-performance pocket computers at consumer price points.",
        "Economic development vehicle: Propelled hundreds of thousands of low-income rural Chinese workers into formal industrial employment, transferring manufacturing skills and logistics know-how.",
        "Catalysed green manufacturing targets: Apple's influence pressured 250+ global suppliers (including Foxconn) to commit to 100% renewable electricity for Apple production by 2030."
      ],
      limitations: [
        "Extreme labour exploitation and power asymmetry: The hyper-demanding production cycles demanded by Apple led to documented overtime violations, student intern exploitation, and severe mental distress without independent trade union representation.",
        "Unequal value capture: Captures the vast majority of profit in California and offshore tax shelters, leaving minimal tax revenues in the host manufacturing municipalities that bear the infrastructure and environmental burdens.",
        "Hyper-fragile single-point supply chain risk: Demonstrated during the late 2022 Zhengzhou COVID-19 lockdown riots, which slashed iPhone 14 Pro production by an estimated 20% and cost Apple billions in lost holiday sales.",
        "De-industrialisation in home nations: Led to severe loss of blue-collar electronics manufacturing jobs in the US and Europe, fueling domestic populist discontent and trade protectionism."
      ]
    },
    examTips: "Essential for 12/20-mark questions on 'Globalisation, TNCs and the Global Shift'. Explicitly reference the 'Smile Curve' of high value in R&D/marketing versus low value in manufacturing. Highlight how geopolitical friction (US-China decoupling) is forcing TNCs to shift from 'just-in-time' efficiency to 'just-in-case' resilience."
  }
];
