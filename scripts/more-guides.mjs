export const additionalGuides = [
  {
    slug: "amateur-radio-new-zealand",
    title: "Amateur Radio in New Zealand: Beginner Guide",
    cardTitle: "Amateur radio in New Zealand",
    description: "How to get started with amateur radio in New Zealand, including the GAOC, callsigns, the shared GURL, NZART resources and your first station.",
    keywords: "amateur radio New Zealand, ham radio NZ, GAOC exam, New Zealand callsign, RSM GURL, NZART beginner, ZL3TOM",
    asideTitle: "New Zealand starting point",
    asideHtml: "<p>To transmit, you need a current General Amateur Operator's Certificate and a callsign.</p><a href=\"https://www.rsm.govt.nz/licensing/frequencies-for-anyone/amateur-radio-operators\" target=\"_blank\" rel=\"noreferrer\">Read the official RSM guidance ↗</a>",
    sections: [
      {
        title: "How amateur licensing works in New Zealand",
        html: `<p>New Zealand amateur operators share a <strong>General User Radio Licence (GURL)</strong>. You do not apply for a separate station licence or pay an individual radio-licence fee, but you must hold a current General Amateur Operator's Certificate (GAOC) and callsign before transmitting.</p><p>The GURL sets the legal conditions for ordinary amateur operation. It does not authorise every activity: beacons, repeaters and fixed links have separate licensing arrangements.</p>`
      },
      {
        title: "Get your certificate and callsign",
        html: `<ol><li>Learn the radio theory, regulations and safe operating practices covered by the amateur examination.</li><li>Contact an <a href="https://www.rsm.govt.nz/licensing/do-you-need-a-licence/amateur-radio-operator-licensing" target="_blank" rel="noreferrer">Approved Radio Examiner listed by RSM ↗</a>.</li><li>Sit the examination and follow the examiner's current process for obtaining a callsign.</li><li>Check that your certificate and callsign are recorded in the Register of Radio Frequencies.</li></ol><p>An examiner may charge for the examination or callsign process even though the shared GURL itself has no individual licence fee.</p>`
      },
      {
        title: "Choose a sensible first station",
        html: `<p>A VHF/UHF handheld is an accessible way to learn local simplex and repeater operation. Before buying, check which repeaters and activity are actually available around your QTH. An external antenna often improves a handheld more than extra transmitter power.</p><p>HF opens longer-distance contacts but needs more space, antenna planning and attention to propagation. Start with equipment you can operate safely and learn well.</p>`
      },
      {
        title: "Know the difference between rules and band plans",
        html: `<p>The RSM GURL provides the legal authority and conditions. The NZART band plan coordinates how amateurs use the available spectrum so different activities can coexist. Check both before transmitting.</p><div class="guide-callout"><strong>Always check the live documents:</strong> allocations, conditions and coordinated calling or repeater channels can change. A saved screenshot may be out of date.</div>`
      },
      {
        title: "Make your first call",
        html: `<ol><li>Program the correct frequency, mode, repeater offset and access tone where required.</li><li>Listen long enough to be sure the channel is free.</li><li>Give your callsign clearly and say that you are listening.</li><li>Keep the first transmission short and leave a pause between overs.</li><li>Write down the other station's callsign and contact details.</li></ol><div class="radio-example"><small>SIMPLE FIRST CALL</small><pre>ZL3TOM listening.</pre></div>`
      },
      {
        title: "Build good habits from day one",
        html: `<ul><li>Use the minimum power needed for a reliable contact.</li><li>Identify with your callsign and keep transmissions courteous.</li><li>Learn RF exposure, electrical and antenna safety before installing equipment.</li><li>Join a local club or listen to experienced operators.</li><li>Keep the current RSM licence conditions and NZART band plan bookmarked.</li></ul>`
      }
    ],
    sources: [
      ["RSM: Amateur radio operators and the GURL", "https://www.rsm.govt.nz/licensing/frequencies-for-anyone/amateur-radio-operators"],
      ["RSM: Amateur radio operator licensing", "https://www.rsm.govt.nz/licensing/do-you-need-a-licence/amateur-radio-operator-licensing"],
      ["RSM: Current General User Radio Licence notices", "https://www.rsm.govt.nz/about/publications/gazette-notices/general-user-radio-licence-gurl-notices"],
      ["NZART official website", "https://nzart.org.nz/"]
    ],
    related: ["new-zealand-band-plans", "operating-basics", "repeaters-and-nets"]
  },
  {
    slug: "new-zealand-band-plans",
    title: "New Zealand Amateur Radio Band Plans: Beginner Guide",
    cardTitle: "New Zealand band plans",
    description: "A beginner guide to New Zealand amateur radio band plans, legal licence conditions, common HF and VHF/UHF bands, modes and checks before transmitting.",
    keywords: "New Zealand amateur radio band plan, NZ ham radio frequencies, NZART band plan, RSM GURL, HF VHF UHF NZ, ZL3TOM",
    asideTitle: "Use the current plan",
    asideHtml: "<p>NZART's printable band plan was updated in June 2026 when this guide was reviewed.</p><a href=\"https://nzart.org.nz/info/band-plans/\" target=\"_blank\" rel=\"noreferrer\">Open current NZART band plans ↗</a>",
    sections: [
      {
        title: "Licence conditions and band plans are different",
        html: `<p>The RSM Amateur Radio Operators GURL is the legal authority for eligible New Zealand amateurs to transmit. The NZART band plan is the operating coordination guide used to reduce interference between modes and activities.</p><p>A band-plan segment is not permission by itself. Your certificate, the current GURL, equipment and any location-specific restriction still control what you may legally do.</p>`
      },
      {
        title: "A quick orientation to common bands",
        html: `<div class="guide-table-wrap"><table class="guide-table"><thead><tr><th>Band</th><th>Common beginner uses</th></tr></thead><tbody><tr><td>80 m and 40 m</td><td>Regional and longer-range HF voice, CW and digital contacts.</td></tr><tr><td>30 m, 20 m and 17 m</td><td>HF CW, data and international contacts; mode permissions differ by band.</td></tr><tr><td>15 m, 12 m and 10 m</td><td>Long-distance contacts when propagation supports them.</td></tr><tr><td>6 m</td><td>VHF weak-signal, local and occasional long-distance activity.</td></tr><tr><td>2 m and 70 cm</td><td>Local simplex, repeaters, satellites and digital voice.</td></tr><tr><td>23 cm and above</td><td>Repeaters, data, satellites and microwave experimentation.</td></tr></tbody></table></div><p>This table is only an orientation. Use the current NZART plan for actual frequencies, bandwidths, calling channels and repeater allocations.</p>`
      },
      {
        title: "Read the plan before choosing a frequency",
        html: `<ol><li>Find the correct band and mode section.</li><li>Check the authorised frequency range in the current GURL.</li><li>Check the NZART plan for calling frequencies and coordinated mode segments.</li><li>Allow for the full occupied bandwidth of your signal, especially near a band edge.</li><li>Listen for existing activity and identify any local repeater input or output.</li></ol>`
      },
      {
        title: "HF, VHF and UHF need different habits",
        html: `<p>On HF, propagation, signal bandwidth and international band planning matter. On VHF/UHF, correct repeater offsets, access tones, simplex channels and local coordination are common concerns. Satellite operation needs Doppler adjustment and careful power use.</p><p>The NZART band-usage guide complements the printable plan and explains recommended operating practices for New Zealand.</p>`
      },
      {
        title: "Be especially careful with special allocations",
        html: `<p>Do not assume that a band available in another country has identical New Zealand conditions. Some allocations can have special power, mode, location or interference-protection requirements. The 60-metre area is one example where you should read the current GURL and NZART guidance before transmitting.</p>`
      },
      {
        title: "Five checks before you press PTT",
        html: `<ul><li>Am I authorised for this frequency and operation?</li><li>Is my whole signal inside the permitted band?</li><li>Am I following the current coordinated band plan?</li><li>Is the frequency already in use?</li><li>Are my power, antenna and station settings safe and appropriate?</li></ul>`
      }
    ],
    sources: [
      ["NZART: Current New Zealand band plans", "https://nzart.org.nz/info/band-plans/"],
      ["NZART: Amateur radio band usage guide", "https://nzart.org.nz/info/amateur-radio-band-usage/"],
      ["RSM: Amateur Radio Operators GURL", "https://www.rsm.govt.nz/licensing/frequencies-for-anyone/amateur-radio-operators"],
      ["RSM: Current GURL notices", "https://www.rsm.govt.nz/about/publications/gazette-notices/general-user-radio-licence-gurl-notices"]
    ],
    related: ["amateur-radio-new-zealand", "antenna-basics", "digital-voice-for-beginners"]
  },
  {
    slug: "usa-amateur-radio-band-plans",
    title: "USA Amateur Radio Band Plans: Beginner Guide",
    cardTitle: "USA band plans",
    description: "A worldwide beginner guide to USA amateur radio bands, FCC licence classes, ARRL band plans, visiting privileges and working US stations from any country.",
    keywords: "USA amateur radio band plan, US ham radio frequencies, FCC Part 97, ARRL frequency chart, Technician General Extra bands, international ham radio, visiting USA amateur radio, ZL3TOM",
    asideTitle: "Check before transmitting",
    asideHtml: "<p>US privileges vary by licence class, band and mode. Use the current FCC rules and ARRL chart.</p><a href=\"https://www.arrl.org/graphical-frequency-allocations\" target=\"_blank\" rel=\"noreferrer\">Open the ARRL frequency chart ↗</a>",
    sections: [
      {
        title: "Who this USA band-plan guide is for",
        html: `<p>This guide is for anyone learning the United States amateur allocations: new US licensees, international operators working American stations, visitors planning to operate in the USA, and listeners following US-based nets or events.</p><p>US privileges can differ from those in your own country. A US operator must stay within the frequencies, modes and power limits allowed by FCC rules and their licence class.</p>`
      },
      {
        title: "The three US licence classes",
        html: `<dl class="guide-definitions"><dt>Technician</dt><dd>Entry-level privileges with broad VHF/UHF access and limited privileges on some HF bands.</dd><dt>General</dt><dd>Much wider HF privileges as well as VHF/UHF access.</dd><dt>Amateur Extra</dt><dd>The widest amateur privileges, including additional HF sub-band access.</dd></dl><p>Always use the current FCC and ARRL information because exact frequency and mode privileges matter.</p>`
      },
      {
        title: "Common US amateur bands at a glance",
        html: `<div class="guide-table-wrap"><table class="guide-table"><thead><tr><th>Range group</th><th>Common bands</th><th>Typical activity</th></tr></thead><tbody><tr><td>HF</td><td>160, 80, 40, 30, 20, 17, 15, 12 and 10 m</td><td>Voice, CW, data and long-distance contacts, subject to class and mode limits.</td></tr><tr><td>Low VHF</td><td>6 m</td><td>Local, weak-signal and propagation openings.</td></tr><tr><td>VHF</td><td>2 m and 1.25 m</td><td>Simplex, repeaters, satellites and weak-signal work.</td></tr><tr><td>UHF</td><td>70 cm and higher</td><td>Repeaters, satellites, data, digital voice and experimentation.</td></tr></tbody></table></div><p>This is not a frequency-authorisation table. Consult the current ARRL chart and FCC Part 97 for the precise limits that apply.</p>`
      },
      {
        title: "Allocations and voluntary band plans",
        html: `<p>FCC Part 97 contains the binding rules. ARRL band plans are voluntary operating arrangements that divide bands into commonly used mode and activity segments. Following them reduces avoidable interference, but they do not expand your legal privileges.</p>`
      },
      {
        title: "Avoid band-edge mistakes",
        html: `<ul><li>Check the operator's licence class and the exact authorised sub-band.</li><li>Allow for the entire occupied signal, not just the displayed dial frequency.</li><li>Check mode and emission restrictions.</li><li>Use no more transmitter power than needed for reliable communication.</li><li>Listen before calling and respect established activity.</li></ul>`
      },
      {
        title: "Working US stations from another country",
        html: `<p>You normally operate under the rules that apply at your transmitter, while the US station operates under FCC rules at theirs. Choose a frequency, mode and power level that both stations may legally use, use UTC when arranging or logging the QSO, and leave safe room for the full signal near band edges.</p><p>If you plan to transmit while physically in the United States, check the current FCC rules and any reciprocal operating arrangements before you travel. Your home-country licence does not automatically grant every US privilege.</p>`
      }
    ],
    sources: [
      ["ARRL: US frequency allocations", "https://www.arrl.org/frequency-allocations"],
      ["ARRL: Graphical frequency allocation chart", "https://www.arrl.org/graphical-frequency-allocations"],
      ["ARRL: Voluntary band plans", "https://www.arrl.org/band-plan-1"],
      ["ARRL: US licence classes", "https://www.arrl.org/getting-licensed"],
      ["eCFR: FCC Part 97 Amateur Radio Service", "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-97"]
    ],
    related: ["operating-basics", "hf-cq-and-contacts", "antenna-basics"]
  },
  {
    slug: "aprs-for-beginners",
    title: "APRS for Beginners: Radio, Apps and APRS.fi",
    cardTitle: "APRS for beginners",
    description: "Learn what APRS does, how stations exchange position and status information, ways to receive or transmit, and how to use APRS.fi responsibly.",
    keywords: "APRS for beginners, APRS.fi, APRSdroid, amateur packet radio, APRS beacon, APRS callsign SSID, ZL3TOM APRS",
    asideTitle: "Find ZL3TOM on APRS",
    asideHtml: "<p>View station reports and APRS information for callsign <strong>ZL3TOM</strong>.</p><a href=\"https://aprs.fi/info/a/ZL3TOM\" target=\"_blank\" rel=\"noreferrer\">Open ZL3TOM on APRS.fi ↗</a>",
    sections: [
      {
        title: "APRS is more than a moving map",
        html: `<p>APRS—the Automatic Packet Reporting System—exchanges local, real-time amateur-radio information. Position reports are familiar, but the system also supports station status, short messages, objects, weather data and queries using standard packet formats.</p>`
      },
      {
        title: "Start by receiving",
        html: `<p>Open <a href="https://aprs.fi/" target="_blank" rel="noreferrer">APRS.fi ↗</a> and search for a callsign or your local area. Watching stations first helps you understand symbols, paths, comments and how often different station types beacon.</p><p>A receive-capable radio and packet decoder can also show local RF activity without transmitting.</p>`
      },
      {
        title: "Ways to use APRS",
        html: `<ul><li><strong>APRS-capable radio:</strong> combines a radio, GPS and packet modem in one unit.</li><li><strong>Radio plus TNC:</strong> a separate terminal node controller or sound-card modem encodes and decodes packets.</li><li><strong>Phone app:</strong> software such as APRSdroid can display or gate information using supported radio or internet connections.</li><li><strong>Web map:</strong> APRS.fi is useful for viewing data that has reached the APRS-IS internet system.</li></ul>`
      },
      {
        title: "Configure a station carefully",
        html: `<ol><li>Enter your own licensed callsign and choose an appropriate SSID for the station type.</li><li>Select the frequency and packet settings specified by the current local band plan.</li><li>Choose a symbol and short comment that accurately describe the station.</li><li>Use a conservative beacon rate and a path suited to the local network.</li><li>Test locally and check whether your packets are being heard.</li></ol><p>Long or aggressive paths and rapid beacons can congest the shared channel. Follow local digipeater guidance.</p>`
      },
      {
        title: "Protect privacy and safety",
        html: `<div class="guide-callout"><strong>Remember:</strong> APRS position reports may become publicly visible and remain available through internet services. Do not beacon a private home location, vulnerable person, or sensitive journey without informed permission.</div><p>Keep attention on driving, mount equipment safely and never operate a phone by hand while moving.</p>`
      },
      {
        title: "If your station does not appear",
        html: `<ul><li>Confirm your callsign, SSID, symbol and packet format.</li><li>Check the local frequency, audio level and squelch.</li><li>Listen for packet activity and confirm an iGate is within range.</li><li>Reduce path complexity while testing.</li><li>Remember that APRS.fi only shows packets that reach APRS-IS; absence from the map does not always mean no RF station heard you.</li></ul>`
      }
    ],
    sources: [
      ["APRS official information", "https://www.aprs.org/"],
      ["APRS.fi map and station information", "https://aprs.fi/"],
      ["APRSdroid official website", "https://aprsdroid.org/"]
    ],
    related: ["new-zealand-band-plans", "amateur-radio-apps", "operating-basics"]
  },
  {
    slug: "allstarlink-for-beginners",
    title: "AllStarLink for Beginners: Nodes and Good Operating",
    cardTitle: "AllStarLink for beginners",
    description: "Understand AllStarLink nodes, linked radio contacts, connecting and disconnecting, operator etiquette, basic node setup and security.",
    keywords: "AllStarLink beginner guide, AllStar node, node 40452, linked amateur radio, AllStar etiquette, app_rpt, ZL3TOM",
    asideTitle: "ZL3TOM AllStar node",
    asideHtml: "<p>My multimode system includes AllStar node <strong>40452</strong>.</p><a href=\"http://165.22.121.189/link.php?nodes=40452\" target=\"_blank\" rel=\"noreferrer\">Open the AllStar Dashboard ↗</a>",
    sections: [
      {
        title: "What AllStarLink is",
        html: `<p>AllStarLink connects amateur repeaters, remote-base stations and personal nodes using voice over IP. The network is based on Asterisk and the amateur-radio app_rpt system. A node normally has a unique number that operators use as its network address.</p>`
      },
      {
        title: "Nodes, links and the RF side",
        html: `<dl class="guide-definitions"><dt>Node</dt><dd>A registered AllStar system identified by a node number.</dd><dt>Link</dt><dd>A network connection between two or more nodes.</dd><dt>Radio interface</dt><dd>Hardware that connects the node computer to a radio or repeater.</dd><dt>Permanent connection</dt><dd>A link configured to reconnect or remain connected; use only where the node owners permit it.</dd></dl>`
      },
      {
        title: "Make a linked contact",
        html: `<ol><li>Listen on the local node or repeater and identify any existing conversation.</li><li>Use the connection method and control codes published by that node's owner.</li><li>After connecting, pause so the network path can settle.</li><li>Give your callsign, say which node you are using, and make a short call.</li><li>Leave gaps between overs so another station can break in.</li><li>Disconnect using the local node's documented command when you finish.</li></ol><p>DTMF commands vary. Never assume one node uses the same controls as another.</p>`
      },
      {
        title: "ZL3TOM node 40452",
        html: `<p>AllStar node <strong>40452</strong> and EchoLink node <strong>304602 (ZL3TOM-L)</strong> are the two linked-radio nodes in my multimode system.</p><div class="guide-callout"><a href="http://165.22.121.189/link.php?nodes=40452" target="_blank" rel="noreferrer"><strong>Open the ZL3TOM AllStar Dashboard for node 40452 ↗</strong></a></div>`
      },
      {
        title: "If you want to build your own node",
        html: `<p>Start with the current AllStarLink registration and installation information. A typical node needs a supported computer, a radio interface, suitable RF equipment, reliable power and internet, and correct audio and signalling configuration.</p><p>Test locally at low power, confirm your audio levels and station identification, and follow the frequency coordination or band plan that applies in your area.</p>`
      },
      {
        title: "Keep the node secure",
        html: `<ul><li>Never publish IAX, SSH, web-admin or hotspot passwords.</li><li>Keep the operating system and AllStar software updated.</li><li>Restrict administration to trusted addresses or a VPN where practical.</li><li>Back up the working configuration before making changes.</li><li>Use only credentials and node numbers assigned or authorised for you.</li></ul>`
      }
    ],
    sources: [
      ["AllStarLink official website", "https://www.allstarlink.org/"],
      ["AllStarLink official community and support", "https://community.allstarlink.org/"]
    ],
    related: ["qso-one-guide", "echolink-getting-started", "repeaters-and-nets"]
  },
  {
    slug: "logging-contacts-on-qrz",
    title: "How to Log Amateur Radio Contacts on QRZ",
    cardTitle: "Log contacts on QRZ",
    description: "A step-by-step QRZ Logbook guide covering contact details, confirmation matching, UTC time, editing, ADIF imports and linked-network notes.",
    keywords: "how to log QSO on QRZ, QRZ Logbook guide, QRZ confirmation, ADIF import, log EchoLink DMR contact, UTC QSO time, ZL3TOM",
    asideTitle: "ZL3TOM QSL requests",
    asideHtml: "<p>Worked ZL3TOM? Send the callsign, UTC time, band, mode or linked network.</p><a href=\"/qsl\">Request a QSL confirmation →</a>",
    sections: [
      {
        title: "Write down the contact first",
        html: `<p>Record the other station's callsign, UTC date and time, band, mode, signal report and any useful notes. UTC avoids confusion between time zones and date changes. Check the callsign while the contact is still fresh.</p>`
      },
      {
        title: "Add a QSO in QRZ Logbook",
        html: `<ol><li>Sign in to QRZ and open your logbook.</li><li>Select <strong>Enter Call</strong> or use the Add QSO option from a callsign page.</li><li>Enter the contacted callsign.</li><li>Complete the sender, receiver and QSL information requested.</li><li>Check the UTC date, time, band and mode carefully.</li><li>Save the record.</li></ol><p>QRZ's screens can change, so use its current help pages if a button has moved.</p>`
      },
      {
        title: "How QRZ confirmation matching works",
        html: `<p>Each operator logs the QSO independently. QRZ matches key information including both callsigns, the UTC date and time, band and mode. Its current guide allows a time difference of up to 30 minutes, but entering the most accurate time gives the best chance of a clean match.</p>`
      },
      {
        title: "EchoLink, DMR, QSO One and linked contacts",
        html: `<p>Log the actual contact details consistently and use the comments or notes field to record the network, talkgroup, room or node—for example EchoLink 304602, DMR TG 91, AllStar 40452 or QSO One.</p><div class="guide-callout"><strong>Agree on the details:</strong> QRZ confirmation depends on matching band and mode. For an internet-only contact without a normal RF band, check QRZ's current accepted fields and agree with the other operator on what both of you will record.</div>`
      },
      {
        title: "Correct mistakes carefully",
        html: `<p>QRZ says a logged callsign cannot be edited; if it is wrong, delete the record and enter it again. Fields used by an already confirmed match can also be restricted. Review the official FAQ before changing a confirmed QSO.</p>`
      },
      {
        title: "Import with ADIF and keep a backup",
        html: `<p>If another logger exports ADIF, use QRZ Logbook's Settings and Import function. Check your callsign, date range and time handling before importing a large file. Keep the original ADIF as a backup and inspect the import report for duplicates or rejected records.</p><p>A good master log protects your contact history even if you later change websites or software.</p>`
      }
    ],
    sources: [
      ["QRZ Logbook 3 FAQ", "https://www.qrz.com/docs/logbook30/faq"],
      ["QRZ Logbook confirmations and matching", "https://www.qrz.com/docs/logbook30/start"],
      ["QRZ Logbook ADIF import guide", "https://www.qrz.com/docs/logbook30/adif-import"]
    ],
    related: ["operating-basics", "q-codes-and-jargon", "qso-one-guide"]
  }
];
