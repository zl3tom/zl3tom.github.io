import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { additionalGuides } from "./more-guides.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const updateIso = "2026-09-03";
const updateDisplay = "3 September 2026";

const existingGuides = [
  {
    slug: "operating-basics",
    title: "Amateur Radio Operating Basics",
    cardTitle: "Operating basics",
    description: "A practical guide to operating confidently across HF, VHF, UHF, repeaters, digital modes, and linked systems."
  },

  {
    slug: "repeaters-and-nets",
    title: "Repeaters and Nets",
    cardTitle: "Repeaters and nets",
    description: "Use amateur radio repeaters and participate in nets confidently, including AllStar and EchoLink linked systems."
  },
  {
    slug: "audio-and-levels",
    title: "Audio and Levels",
    cardTitle: "Audio and levels",
    description: "Quick, practical settings and habits for clean audio on SSB, FM, CW, and digital modes."
  },
  {
    slug: "antenna-basics",
    title: "Antenna Basics",
    cardTitle: "Antenna basics",
    description: "Simple antenna fundamentals that help you get better results without overcomplicating your station."
  },

  {
    slug: "emergency-comms-basics",
    title: "Emergency Communications Basics",
    cardTitle: "Emergency comms basics",
    description: "Clear, calm habits for message passing, priority traffic, and directed amateur radio nets."
  }
];

const hfCqGuide = {
  slug: "hf-cq-and-contacts",
  title: "HF CQ and Contacts",
  cardTitle: "HF CQ and contacts",
  description: "Practical tips for HF calling, answering, handling busy conditions, and finishing a QSO cleanly.",
  keywords: "how to call CQ, HF CQ, amateur radio contacts, ham radio CQ, SSB CQ, single sideband, tune SSB, USB, LSB, Jim W6LG, W6LG, ZL3TOM",
  asideTitle: "Calling CQ",
  asideHtml: "<p>Listen first, keep your call clear, and leave time for stations to answer.</p>",
  sections: [
    { title: "1. Find a clear frequency", html: `<ul><li>Listen for at least 10 to 20 seconds — longer if conditions are busy or weak.</li><li>Check whether the frequency is used for a net, DX activity, or a common calling spot.</li><li>If you are unsure, ask once, then listen again.</li></ul><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>Is this frequency in use, is this frequency in use, ZL3TOM.</pre></div>` },
    { title: "Watch: How I Call CQ", html: `<p>Jim - W6LG demonstrates how he calls CQ in this Ham Radio Basics video.</p><div style="position:relative;width:100%;max-width:760px;aspect-ratio:16/9;margin:1rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/qoGVINMbScU" title="Ham Radio Basics — How I Call CQ by Jim - W6LG" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe></div><p><strong>Video credit:</strong> <a href="https://www.youtube.com/@ham-radio" target="_blank" rel="noopener noreferrer">Jim - W6LG on YouTube ↗</a></p>` },
    { title: "Watch: What is SSB and How to Tune in SSB", html: `<p>Jim - W6LG explains what single sideband (SSB) is and demonstrates how to tune an SSB signal so speech sounds natural.</p><div style="position:relative;width:100%;max-width:760px;aspect-ratio:16/9;margin:1rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/QiQYS9gMDyc" title="Ham Radio Basics — What is SSB and How to Tune in SSB by Jim - W6LG" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe></div><p><strong>Video credit:</strong> <a href="https://www.youtube.com/@ham-radio" target="_blank" rel="noopener noreferrer">Jim - W6LG on YouTube ↗</a></p>` },
    { title: "2. Calling CQ on SSB", html: `<p>Short beats fancy. Repeat your callsign clearly, then listen rather than calling constantly.</p><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>CQ CQ CQ, this is ZL3TOM, ZL3TOM calling CQ and standing by.</pre></div>` },
    { title: "3. Answering a CQ", html: `<p>Say their callsign once, then your callsign once. Slow is smooth; smooth is fast.</p><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>ZL3ABC, this is ZL3TOM.</pre></div>` },
    { title: "4. Your first over", html: `<p>Make the contact easy to log: confirm callsigns, then give a report, your name, and your location.</p><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>ZL3ABC, thanks for the call. You are 5 and 9 in Christchurch. Name Thomas, over.</pre></div>` },
    { title: "5. Signal reports", html: `<ul><li>Give a report that feels fair.</li><li>For a weak signal, explain kindly: ‘You are 4 and 7, readable with a bit of noise.’</li><li>Ask for repeats when needed — never guess a callsign.</li></ul>` },
    { title: "6. Handling pileups", html: `<ul><li>Take one station at a time and confirm the callsign before logging.</li><li>Keep overs short so the frequency keeps flowing.</li><li>If you cannot copy, ask for the callsign again.</li></ul><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>Only the station ending in ABC, again please.</pre></div>` },
    { title: "7. End cleanly", html: `<p>Thank the operator, confirm final callsigns, and say whether you are staying on frequency.</p><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>Thanks for the contact, 73. This is ZL3TOM clear and listening.</pre></div>` }
  ],
  sources: [
    ["Jim - W6LG on YouTube", "https://www.youtube.com/@ham-radio"],
    ["Ham Radio Basics — How I Call CQ", "https://www.youtube.com/watch?v=qoGVINMbScU"],
    ["Ham Radio Basics — What is SSB and How to Tune in SSB", "https://www.youtube.com/watch?v=QiQYS9gMDyc"]
  ],
  related: ["operating-basics", "q-codes-and-jargon", "antenna-basics"]
};

const qCodesGuide = {
  slug: "q-codes-and-jargon",
  title: "Q Codes and Amateur Radio Jargon",
  cardTitle: "Q codes and jargon",
  description: "Common Q codes, amateur radio jargon, and when plain language is the better choice.",
  keywords: "amateur radio Q codes, ham radio jargon, plain language radio, QTH QRM QRN QSB QSY QRZ QSL QRP QRO QRT, ZL3TOM",
  asideTitle: "Good operating",
  asideHtml: "<p>Listen first. Identify clearly. Leave a pause. Be patient and welcoming.</p><a href=\"/contact\">Suggest a guide →</a>",
  sections: [
    {
      title: "Why Q codes exist",
      html: `<p>Q codes are short signals that save time, especially on CW. They are also used on voice and digital, but you only need a handful for most contacts.</p>`
    },
    {
      title: "Watch: Ham Radio Jargon and Plain Language",
      html: `<p>This video is a useful introduction to common ham radio jargon and using plain language on the air.</p><div style="position:relative;width:100%;max-width:760px;aspect-ratio:16/9;margin:1rem 0;"><iframe src="https://www.youtube-nocookie.com/embed/83kToVbuPrY" title="Ham Radio Basics — Ham Radio Jargon and Plain Language by Jim - W6LG" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe></div><p><strong>Video credit:</strong> <a href="https://www.youtube.com/@ham-radio" target="_blank" rel="noopener noreferrer">Jim - W6LG on YouTube ↗</a></p>`
    },
    {
      title: "The most useful Q codes",
      html: `<div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>QTH  location
QRM  interference from other stations
QRN  noise
QSB  fading
QSY  change frequency
QRZ  who is calling me?
QSL  confirmation
QRP  low power
QRO  high power
QRT  stop transmitting</pre></div>`
    },
    {
      title: "How they sound on voice",
      html: `<ul><li>‘QTH Christchurch’ means ‘my location is Christchurch.’</li><li>‘Lots of QRM’ means ‘I have interference from other stations.’</li><li>‘Let’s QSY’ means ‘let’s change frequency.’</li></ul>`
    },
    {
      title: "When plain language is better",
      html: `<ul><li>Plain language sounds natural on repeaters and local chats.</li><li>Explain terms to new operators rather than stacking jargon.</li><li>Simple words can be clearer when copy is weak.</li></ul>`
    },
    {
      title: "Two rules that prevent mistakes",
      html: `<ul><li>If you did not copy a callsign, ask again — do not guess.</li><li>If you are unsure what someone means, ask. Most operators are happy to explain.</li></ul>`
    }
  ],
  sources: [
    ["Jim - W6LG on YouTube", "https://www.youtube.com/@ham-radio"],
    ["Ham Radio Basics — Ham Radio Jargon and Plain Language", "https://www.youtube.com/watch?v=83kToVbuPrY"]
  ],
  related: ["operating-basics", "repeaters-and-nets", "hf-cq-and-contacts"]
};

const newGuides = [
  {
    slug: "echolink-getting-started",
    title: "How to Install and Use EchoLink",
    cardTitle: "EchoLink setup",
    description: "A beginner-friendly EchoLink setup guide for Windows, Android, iPhone and the web, including callsign validation, audio checks and your first contact.",
    keywords: "EchoLink setup, how to install EchoLink, EchoLink validation, EchoLink beginner guide, amateur radio apps, ZL3TOM",
    asideTitle: "ZL3TOM on EchoLink",
    asideHtml: "<p>Find <strong>ZL3TOM-L</strong>, node <strong>304602</strong>.</p><a href=\"/radio-fun\">My station and networks →</a>",
    sections: [
      {
        title: "What EchoLink does",
        html: `<p>EchoLink lets licensed amateur radio operators connect through internet-linked stations. You can use an app directly, or connect through a local repeater or link that is already on EchoLink.</p><p>Callsigns ending in <strong>-L</strong> are link stations and <strong>-R</strong> identifies repeater stations. A plain callsign is normally an individual user.</p>`
      },
      {
        title: "Choose the official version",
        html: `<p>EchoLink is available from the official site for Windows, Android and iOS, with EchoLink Web available in a browser. Download from the official source rather than an unofficial app store listing or download mirror.</p><div class="guide-callout"><strong>Start here:</strong> <a href="https://www.echolink.org/download.htm" target="_blank" rel="noreferrer">Official EchoLink downloads and web access ↗</a></div>`
      },
      {
        title: "Register and validate your callsign",
        html: `<ol><li>Install and open EchoLink, then enter your amateur radio callsign.</li><li>Choose a strong password that you do not reuse elsewhere.</li><li>Complete the official validation process and provide the requested proof of licence.</li><li>Wait until your callsign is approved before trying to connect.</li></ol><p>EchoLink access is for licensed amateur radio operators. Use your own callsign and keep your licence details current.</p>`
      },
      {
        title: "Set up clear audio",
        html: `<ul><li>Allow microphone access when your phone or computer asks.</li><li>Select the correct microphone and speaker or headset.</li><li>Keep the microphone level moderate; loud or distorted audio is harder to understand.</li><li>Use headphones if speaker audio is feeding back into the microphone.</li></ul><p>Listen to a conversation before transmitting. On a linked network, leave a short pause after the other station unkeys so links can reset and another operator can join.</p>`
      },
      {
        title: "Make your first connection",
        html: `<ol><li>Search by callsign, location or node number.</li><li>Select a station and connect.</li><li>Listen first and check the channel is free.</li><li>Press transmit, pause briefly, then give your callsign and say you are listening.</li><li>Release transmit fully when you finish each over.</li><li>Disconnect when your contact is complete.</li></ol><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>ZL3TOM listening through EchoLink.</pre></div>`
      },
      {
        title: "Common EchoLink problems",
        html: `<dl class="guide-definitions"><dt>Callsign not accepted</dt><dd>Complete validation and make sure the callsign matches your licence.</dd><dt>No audio</dt><dd>Check microphone permission, input/output device selection and system volume.</dd><dt>Cannot connect</dt><dd>Try another station and the app's relay or proxy option. Some routers and networks restrict direct connections.</dd><dt>Echo or feedback</dt><dd>Use headphones and lower speaker or microphone volume.</dd></dl>`
      }
    ],
    sources: [
      ["Official EchoLink downloads", "https://www.echolink.org/download.htm"],
      ["Official EchoLink callsign validation", "https://www.echolink.org/validation/"]
    ],
    related: ["repeaters-and-nets", "amateur-radio-apps", "qso-one-guide"]
  },
  {
    slug: "getting-a-dmr-id",
    title: "How to Get a DMR ID for Amateur Radio",
    cardTitle: "Get a DMR ID",
    description: "Learn what a DMR ID is, how licensed amateur radio operators register through RadioID, and where to enter the ID in a radio, hotspot and BrandMeister account.",
    keywords: "get DMR ID, RadioID registration, DMR radio ID, BrandMeister setup, amateur radio DMR beginner, ZL3TOM",
    asideTitle: "Before you start",
    asideHtml: "<p>You need a valid amateur radio callsign and the licence evidence requested by RadioID.</p><a href=\"https://radioid.net/\" target=\"_blank\" rel=\"noreferrer\">Open RadioID ↗</a>",
    sections: [
      {
        title: "What a DMR ID is",
        html: `<p>A DMR ID is a numeric identity associated with a licensed amateur radio operator. Digital Mobile Radio networks use it to identify your transmissions and display your callsign information.</p><p>Your callsign remains your legal on-air identification. The number does not replace good operating practice or the requirements of your local licence.</p>`
      },
      {
        title: "Register through RadioID",
        html: `<ol><li>Go to the official <a href="https://radioid.net/" target="_blank" rel="noreferrer">RadioID website ↗</a>.</li><li>Create an account using your real details and licensed callsign.</li><li>Follow the current application process and upload the licence evidence requested for your country.</li><li>Check every entry before submitting; your callsign and identity need to match the evidence.</li><li>Wait for approval, then record your assigned ID somewhere safe.</li></ol><p>The website and verification steps can change. Follow the instructions shown by RadioID rather than an old screenshot or unofficial video.</p>`
      },
      {
        title: "Put the ID in the right places",
        html: `<ul><li><strong>DMR radio:</strong> enter the ID in your radio's codeplug or programming software.</li><li><strong>Hotspot:</strong> set the same operator ID in the hotspot dashboard. Do not copy another operator's number.</li><li><strong>Network account:</strong> if you use BrandMeister, create or update your self-care profile with the same callsign and ID.</li><li><strong>Software app:</strong> enter your ID only where the official app documentation requests it.</li></ul><p>Back up your codeplug before editing it, and confirm the radio shows your own ID before transmitting.</p>`
      },
      {
        title: "DMR terms you will meet",
        html: `<dl class="guide-definitions"><dt>Talkgroup</dt><dd>A numbered conversation group, such as worldwide BrandMeister talkgroup 91.</dd><dt>Time slot</dt><dd>On many DMR repeaters, two independent voice paths share one radio channel. Use the slot specified by the repeater or talkgroup plan.</dd><dt>Colour code</dt><dd>A DMR access setting, similar in purpose to a repeater access tone. It must match the repeater.</dd><dt>Codeplug</dt><dd>The saved radio configuration containing channels, contacts, zones and your DMR ID.</dd></dl>`
      },
      {
        title: "Protect your accounts",
        html: `<ul><li>Use a unique password for RadioID and each network account.</li><li>Never publish hotspot security passwords or IAX credentials.</li><li>Use the official password-reset process if access is lost.</li><li>Update your record if your callsign changes.</li></ul>`
      },
      {
        title: "Your first DMR contact",
        html: `<p>Load a known local repeater or hotspot channel, select the correct talkgroup, and listen before transmitting. Key up, pause briefly, give your callsign, and say you are listening. Leave extra space between overs because linked networks need time to switch.</p><div class="radio-example"><small>ON-AIR EXAMPLE</small><pre>ZL3TOM listening on talkgroup 91.</pre></div>`
      }
    ],
    sources: [
      ["RadioID official registration and directory", "https://radioid.net/"],
      ["RadioID official FAQ", "https://radioid.net/faq"],
      ["BrandMeister official dashboard", "https://brandmeister.network/"]
    ],
    related: ["digital-voice-for-beginners", "qso-one-guide", "operating-basics"]
  },
  {
    slug: "amateur-radio-apps",
    title: "Useful Amateur Radio Apps for Phone and Computer",
    cardTitle: "Radio apps for phone and PC",
    description: "A practical guide to useful amateur radio apps for logging, programming, APRS, weak-signal modes, EchoLink and linked digital voice on phones and computers.",
    keywords: "best amateur radio apps, ham radio apps Android iPhone Windows, CHIRP WSJT-X APRSdroid Ham2K, EchoLink app, QSO One, ZL3TOM",
    asideTitle: "Install safely",
    asideHtml: "<p>Use the developer's official site or verified app-store listing. Back up settings before updating.</p><a href=\"/guides/operating-basics\">Operating basics →</a>",
    sections: [
      {
        title: "Choose an app for a job",
        html: `<p>The best radio app is the one that solves a clear problem. Start with one logger and the official programming software for your radio, then add tools as your operating interests grow.</p><p>Platform support changes, so check each official download page before installing. Never enter radio-network credentials into an unknown app or website.</p>`
      },
      {
        title: "Programming: CHIRP",
        html: `<p><a href="https://chirpmyradio.com/projects/chirp/wiki/Home" target="_blank" rel="noreferrer">CHIRP ↗</a> is a free, open-source tool that can program many amateur radios. It is useful for organising repeaters, simplex channels and memory names.</p><ul><li>Confirm that your exact radio model is supported.</li><li>Use the correct data cable and driver.</li><li>Download from the radio before editing.</li><li>Save an untouched backup before uploading changes.</li></ul>`
      },
      {
        title: "Weak-signal digital modes: WSJT-X",
        html: `<p><a href="https://wsjtx.github.io/wsjtx/" target="_blank" rel="noreferrer">WSJT-X ↗</a> is desktop software for weak-signal amateur radio communication. It is widely used for modes including FT8 and FT4.</p><p>Accurate computer time, correct radio control, and clean audio levels matter. Check your licence conditions, band plan and frequency before transmitting.</p>`
      },
      {
        title: "APRS: APRSdroid and APRS.fi",
        html: `<p><a href="https://aprsdroid.org/" target="_blank" rel="noreferrer">APRSdroid ↗</a> provides APRS features on Android, including position, nearby stations and messages. <a href="https://aprs.fi/" target="_blank" rel="noreferrer">APRS.fi ↗</a> is a convenient browser map for looking up stations such as <a href="https://aprs.fi/info/a/ZL3TOM" target="_blank" rel="noreferrer">ZL3TOM ↗</a>.</p><p>Think carefully before beaconing a home or private location. Only transmit on amateur frequencies if you are licensed and your setup follows local rules.</p>`
      },
      {
        title: "Portable logging: Ham2K PoLo",
        html: `<p><a href="https://polo.ham2k.com/" target="_blank" rel="noreferrer">Ham2K Portable Logger ↗</a> is designed for portable logging on Android and iOS. It can help organise activations and export contacts for your main log.</p><p>After an activation, review callsigns, UTC times, bands and modes before uploading contacts to an online logbook.</p>`
      },
      {
        title: "Linked voice: EchoLink and QSO One",
        html: `<p><a href="https://www.echolink.org/download.htm" target="_blank" rel="noreferrer">EchoLink ↗</a> connects licensed operators and internet-linked stations. <a href="https://qso1.net/" target="_blank" rel="noreferrer">QSO One ↗</a> combines several linked voice systems in one app, including AllStarLink, EchoLink, DMR, System Fusion and M17.</p><p>Complete any required callsign or network validation first. Treat node and hotspot credentials like passwords.</p>`
      },
      {
        title: "Logging and backups",
        html: `<p>A browser-based logbook such as a self-hosted Cloudlog site can keep contacts in one place. Whatever logger you choose, export regular ADIF backups and store a copy somewhere separate from the device.</p><ul><li>Use UTC for contact times.</li><li>Record the correct callsign, band and mode.</li><li>Add useful notes while the contact is fresh.</li><li>Keep an offline backup of your log.</li></ul>`
      }
    ],
    sources: [
      ["CHIRP official project", "https://chirpmyradio.com/projects/chirp/wiki/Home"],
      ["WSJT-X official site", "https://wsjtx.github.io/wsjtx/"],
      ["APRSdroid official site", "https://aprsdroid.org/"],
      ["Ham2K Portable Logger official site", "https://polo.ham2k.com/"],
      ["EchoLink official downloads", "https://www.echolink.org/download.htm"],
      ["QSO One official site", "https://qso1.net/"]
    ],
    related: ["echolink-getting-started", "qso-one-guide", "audio-and-levels"]
  },
  {
    slug: "digital-voice-for-beginners",
    title: "Digital Voice for Beginners: DMR, D-STAR, C4FM and M17",
    cardTitle: "Digital voice explained",
    description: "A plain-language beginner guide to amateur radio digital voice, comparing DMR, D-STAR, System Fusion C4FM and M17, plus talkgroups, reflectors and hotspots.",
    keywords: "digital voice amateur radio beginners, DMR vs D-STAR vs C4FM, System Fusion, M17, talkgroups reflectors hotspots, ZL3TOM",
    asideTitle: "The simple rule",
    asideHtml: "<p>Your radio, repeater or hotspot and network configuration must use compatible modes and matching settings.</p><a href=\"/guides/getting-a-dmr-id\">Get a DMR ID →</a>",
    sections: [
      {
        title: "What digital voice means",
        html: `<p>A digital voice radio converts microphone audio into data, sends that data by radio, and turns it back into speech at the receiver. The radio signal is still RF; internet links may then connect repeaters, hotspots and rooms around the world.</p><p>Digital voice can sound clean when the signal is adequate, but near the coverage limit it may break up or disappear rather than gradually becoming noisy like analogue FM.</p>`
      },
      {
        title: "DMR",
        html: `<p><strong>Digital Mobile Radio</strong> is widely used by amateur operators. You will meet DMR IDs, talkgroups, time slots, colour codes and codeplugs. BrandMeister and TGIF are examples of networks; their accounts and talkgroup behaviour are separate.</p><p>DMR can be powerful but has the most terminology at the start. Get your DMR ID before programming a network-connected setup.</p>`
      },
      {
        title: "D-STAR",
        html: `<p><strong>D-STAR</strong> means Digital Smart Technology for Amateur Radio. It is an open protocol created for amateur radio and supports callsign-based routing, repeaters and linked reflectors.</p><p>Your callsign registration and routing fields need to be correct. Learn the local repeater's instructions before changing link commands.</p>`
      },
      {
        title: "System Fusion and C4FM",
        html: `<p><strong>System Fusion</strong> is Yaesu's digital system using C4FM modulation. Many compatible repeaters can automatically handle analogue FM and digital C4FM. <strong>WIRES-X</strong> links participating stations through rooms and nodes.</p><p>A radio displaying C4FM does not automatically mean every internet network or room is available; the repeater or hotspot configuration also matters.</p>`
      },
      {
        title: "M17",
        html: `<p><strong>M17</strong> is an open digital radio protocol developed by the amateur radio community. It uses open technology for digital voice and data, with reflectors used for linking.</p><p>Equipment and local coverage may be less common than DMR, D-STAR or System Fusion, so check what is active in your area.</p>`
      },
      {
        title: "Talkgroups, reflectors, rooms and hotspots",
        html: `<dl class="guide-definitions"><dt>Talkgroup</dt><dd>A DMR conversation group selected by number.</dd><dt>Reflector</dt><dd>A shared connection point used by systems such as D-STAR and M17.</dd><dt>Room</dt><dd>A named WIRES-X destination used by System Fusion stations.</dd><dt>Hotspot</dt><dd>A small personal radio-and-internet gateway. Its RF frequency, mode, operator ID and network settings must be configured correctly.</dd></dl>`
      },
      {
        title: "Start without the confusion",
        html: `<ol><li>Find which mode has local repeaters, groups or friends you want to contact.</li><li>Choose one mode first and learn its basic terms.</li><li>Use a known-good codeplug or local club guidance as a reference, but verify every frequency and callsign field.</li><li>Listen before transmitting and leave a pause between overs.</li><li>Keep radio firmware, programming software and codeplug backups organised.</li></ol><div class="guide-callout"><strong>Useful distinction:</strong> EchoLink and AllStar are linked voice systems, but they are not over-the-air digital modulation formats such as DMR, D-STAR, C4FM or M17.</div>`
      }
    ],
    sources: [
      ["Icom: What is D-STAR?", "https://www.icomjapan.com/explore/d-star/"],
      ["Yaesu: What is System Fusion?", "https://systemfusion.yaesu.com/what-is-system-fusion/"],
      ["Yaesu WIRES-X", "https://www.yaesu.com/jp/en/wires-x/index.php"],
      ["M17 Project", "https://m17project.org/"],
      ["BrandMeister network", "https://brandmeister.network/"]
    ],
    related: ["getting-a-dmr-id", "qso-one-guide", "repeaters-and-nets"]
  },
  {
    slug: "accessible-amateur-radio",
    title: "Accessible Amateur Radio: Practical Ways to Get On Air",
    cardTitle: "Accessible amateur radio",
    description: "Practical amateur radio options for disabled operators: accessible controls, screen readers, communication choices, comfortable station layouts and support from clubs.",
    keywords: "accessible amateur radio, disabled radio operators, screen readers, adaptive PTT, inclusive ham radio, ZL3TOM",
    updatedIso: "2026-10-06",
    updatedDisplay: "6 October 2026",
    asideTitle: "Start with your needs",
    asideHtml: `<p>Choose one activity you enjoy, identify the controls or communication barriers, and try a small adjustment first. Ask a club or trusted operator to help you test it.</p><a href="/contact?topic=website">Tell Thomas about an accessibility barrier</a>`,
    sections: [
      {title: "Radio should make room for different people", html: `<p>Disability does not describe a single set of needs. Mobility, dexterity, sight, hearing, speech, fatigue, sensory needs and learning preferences can all affect how someone operates. Start with what you want to do and the adjustments that work for you.</p><p>You do not need an expensive station to begin exploring. Listening, learning, digital contacts and internet-linked systems offer different routes into the hobby. Ask about licensing and operating requirements for the activity you choose.</p>`},
      {title: "Make your station comfortable to operate", html: `<ul><li>Keep essential controls within a comfortable reach. A stable desk, supported microphone and clearly organised cables can reduce handling.</li><li>Try a larger PTT button or supported keyboard control if gripping a handheld is difficult. Check how transmit stops and choose a setup you can release reliably.</li><li>Use a headset, desk microphone or speaker arrangement that suits your hearing, posture and comfort.</li><li>Ask for help with mounting equipment or antenna work that is difficult to do safely.</li><li>Plan breaks and shorter sessions if concentration or fatigue makes long nets difficult.</li></ul><p>A switch, microphone or adapter must be compatible with the equipment or app. Try before buying where possible.</p>`},
      {title: "Screen readers, low vision and software radio", html: `<p>Look for software with labelled controls, keyboard navigation, readable status messages and adjustable text. Try your own screen reader with the actual app before relying on it; features and accessibility can differ between versions.</p><p>Windows users may use Narrator or NVDA, Android users TalkBack, and Apple users VoiceOver. Browser zoom, magnification and operating-system contrast settings may also help.</p><p><a href="/guides/qso-one-guide">QSO One</a> can access several amateur voice networks using a computer or Android device without a separate radio or hotspot. That may reduce physical handling, but it is not a promise that every QSO One control works with every assistive technology. Test sign-in, destination selection, PTT and disconnect first.</p>`},
      {title: "Choose a communication method that suits you", html: `<p>Voice is one option. If speech or hearing makes voice contacts difficult, explore text-based amateur modes and ask a club about compatible software and equipment. Different systems have different requirements, and a chat feature in a voice app is not necessarily carried to radio listeners.</p><p>For voice, prepare a short callsign and introduction, ask people to slow down or repeat details, and tell net control what accommodation would help. You decide how much personal information to share.</p><div class="radio-example"><small>OPTIONAL REQUEST</small><pre>This is ZL3TOM. Please allow me a little extra time to reply. Thank you.</pre></div><p>For hearing access, try clear audio at a comfortable level and compatible equipment. Captions or transcriptions may help where available, but check important callsigns and messages because automatic text can be wrong.</p>`},
      {title: "Ask clubs and net organisers for practical adjustments", html: `<p>Ask about step-free access, accessible toilets, parking close to the venue, seating, quiet space, written instructions and remote participation before visiting. A support person can help with setup or access; the station operator remains responsible for the required operating authorisation.</p><p>Smaller conversations, written setup steps and a named person to contact can make a first session less overwhelming. A good starting point is the <a href="/community">clubs and community page</a>. Explain the adjustment you need rather than feeling obliged to disclose a diagnosis.</p>`},
      {title: "Using this website", html: `<p id="using-this-website">This site includes a skip-to-content link, keyboard controls, visible focus, labelled fields, text alternatives and reduced-motion styles. On the <a href="/guides">Guides page</a>, browse topic sections or use the category and title filters. Calculator results are announced through status messages without moving your focus.</p><p>Use your browser’s zoom or device accessibility settings to adjust reading size. Press Tab to move between controls, Enter to follow links, and Escape to close the navigation or search dialog. Embedded videos and third-party services have their own accessibility behaviour.</p><p>If something blocks you, <a href="/contact?topic=website">send website feedback to Thomas</a>. Include the page, what you were trying to do, and your browser or assistive technology if you are comfortable sharing it. This site has not been independently certified for accessibility; practical feedback helps guide further improvements.</p>`}
    ],
    sources: [
      ["W3C WAI: How people with disabilities use the web", "https://www.w3.org/WAI/people-use-web/"],
      ["QSO One official features", "https://qso1.net/features"],
      ["NZART branches and local clubs", "https://nzart.org.nz/contacts/branches/"]
    ],
    related: ["qso-one-guide", "amateur-radio-apps", "operating-basics"]
  },
  {
    slug: "qso-one-guide",
    title: "QSO One Setup Guide: DMR, EchoLink and AllStar",
    updatedIso: "2026-10-06",
    updatedDisplay: "6 October 2026",
    cardTitle: "QSO One setup",
    description: "A step-by-step QSO One guide for licensed amateur radio operators using EchoLink, AllStarLink, IAX Direct, DMR, System Fusion and M17 on Windows or Android.",
    keywords: "QSO One guide, QSO1 setup, QSO One Android, QSO One Google Play, QSO One EchoLink, QSO One AllStar, QSO One DMR, amateur radio app, ZL3TOM",
    asideTitle: "Current platforms",
    asideHtml: "<p>As checked on 6 October 2026, QSO One is available for Windows and Android. Windows 10/11 64-bit is available from the Microsoft Store, and Android 8.0+ is available from Google Play. iOS, macOS and Linux are listed as coming soon.</p><a href=\"https://apps.microsoft.com/detail/9NRWFPGK3L3W\" target=\"_blank\" rel=\"noopener noreferrer\">Get QSO One from the Microsoft Store ↗</a><br><a href=\"https://play.google.com/store/apps/details?id=com.qsoone.qso_one\" target=\"_blank\" rel=\"noopener noreferrer\">Get QSO One on Google Play ↗</a><br><a href=\"https://qso1.net/\" target=\"_blank\" rel=\"noreferrer\">Official QSO One site ↗</a>",
    sections: [
      {
        title: "What QSO One is",
        html: `<p>QSO One, developed by Frank KD8JKK, is a free internet voice client for licensed amateur radio operators. One app connects to AllStarLink, EchoLink, IAX Direct, DMR, System Fusion (YSF) and M17 on Windows or Android.</p><p>It uses your device’s microphone, speaker and internet connection to receive and transmit through these networks without a separate radio, hotspot or Raspberry Pi. Depending on the destination, your voice may reach other app users, linked nodes or RF repeaters. It is useful at home, when travelling, or when a traditional radio setup is difficult to access.</p><p>QSO One also provides directories, favourites, callsign lookup, contact logging and Net Finder. Access is free, with optional contributions to support development. You still need your amateur radio licence and any accounts required by your chosen network.</p>`
      },
      {
        title: "Download QSO One — now on Google Play",
        html: `<div class="guide-callout"><strong>New for Android:</strong> QSO One is now available from Google Play, making installation and updates much easier on Android devices.</div><ol><li>Start at the <a href="https://qso1.net/" target="_blank" rel="noreferrer">official QSO One website ↗</a>.</li><li><strong>Android:</strong> <a href="https://play.google.com/store/apps/details?id=com.qsoone.qso_one" target="_blank" rel="noopener noreferrer">install QSO One from Google Play ↗</a>. Android 8.0 or later is supported.</li><li><strong>Windows:</strong> <a href="https://apps.microsoft.com/detail/9NRWFPGK3L3W" target="_blank" rel="noopener noreferrer">get QSO One from the Microsoft Store ↗</a>, or use the direct installer offered by QSO One.</li><li>Install updates only from the official site, official app store or app updater.</li></ol><p>QSO One is currently available for Windows and Android. The official site lists iOS, macOS and Linux as coming soon.</p>`
      },
      {
        title: "QSO One video",
        html: `<p>Watch this archived QSO One video for a visual introduction to the app and its amateur-radio network features.</p><div style="position:relative;width:100%;max-width:760px;aspect-ratio:560/384;margin:1rem 0;"><iframe src="https://archive.org/embed/qso-one-every-ham-network-one-app" title="QSO One — Every Ham Network, One App" loading="lazy" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe></div><p><a href="https://archive.org/details/qso-one-every-ham-network-one-app" target="_blank" rel="noopener noreferrer">Watch QSO One on Internet Archive ↗</a></p>`
      },
      {
        title: "How to use QSO One",
        html: `<p>Once QSO One is installed, start with one network and learn the basic receive, connect and PTT controls before adding more.</p><ol><li><strong>Create or sign in to QSO One</strong> using your amateur radio callsign.</li><li><strong>Choose a network</strong> such as AllStarLink, EchoLink, IAX Direct, DMR, System Fusion (YSF) or M17.</li><li><strong>Add the details that network requires.</strong> EchoLink requires a validated EchoLink account. DMR requires your own DMR ID and the credentials requested by your chosen network’s login card; see section 9 for the supported networks. IAX Direct requires credentials supplied by the node operator.</li><li><strong>Select your destination.</strong> Search for an AllStar node or EchoLink station, select a DMR talkgroup, or choose a YSF/M17 reflector.</li><li><strong>Listen first</strong> and make sure the destination is not already in use.</li><li><strong>Press and hold PTT to transmit.</strong> Pause briefly before speaking, identify with your callsign, and release PTT when finished.</li><li><strong>Disconnect when finished</strong> and log the QSO if you want to keep a record.</li></ol><div class="radio-example"><small>SIMPLE FIRST CALL</small><pre>ZL3TOM listening through QSO One.</pre></div><p>On Android, QSO One can keep a session active in the background. Bluetooth, BLE and PoC hardware PTT devices are also supported.</p>`
      },
      {
        title: "Prepare your accounts",
        html: `<ul><li><strong>QSO One:</strong> create or sign in with your licensed callsign as directed by the app.</li><li><strong>EchoLink:</strong> complete callsign validation first.</li><li><strong>DMR:</strong> obtain your own DMR ID from RadioID and configure the network account you intend to use.</li><li><strong>AllStarLink:</strong> use your authorised node details. IAX Direct credentials must come from the node owner.</li></ul><div class="guide-callout"><strong>Keep secrets private:</strong> never publish an IAX password, hotspot security password or network account password.</div>`
      },
      {
        title: "First-run audio setup",
        html: `<ol><li>Allow microphone permission.</li><li>Select the correct microphone and speaker or headset.</li><li>Lower the microphone level if reports say your audio is distorted.</li><li>Receive and listen before transmitting.</li><li>Use headphones if you hear echo or feedback.</li></ol><p>Only one application should control the microphone at a time.</p>`
      },
      {
        title: "Connect with EchoLink",
        html: `<p>Use your validated EchoLink callsign and EchoLink password, then search the directory for a station, link, repeater or conference. Save regular destinations as favourites, connect and listen before transmitting.</p><p>QSO One supports direct UDP connections and automatic proxy fallback. A proxy can help on mobile data or connections where direct UDP is blocked. If a connection appears successful but carries no audio, try another proxy using the app’s controls.</p><div class="radio-example"><small>ZL3TOM EXAMPLE</small><pre>EchoLink node 304602 — ZL3TOM-L</pre></div>`
      },
      {
        title: "Connect with AllStar or IAX Direct",
        html: `<p>AllStarLink offers two connection methods:</p><ul><li><strong>Node Mode:</strong> use your registered AllStarLink node number and credentials for a node connection.</li><li><strong>WT Mode (Web Transceiver):</strong> use your AllStarLink portal account without needing your own registered node. The destination must accept this connection method.</li></ul><p>Search the node directory, save favourites and connect to the destination. DTMF controls can operate supported node functions; follow the node operator’s instructions.</p><p><strong>IAX Direct</strong> connects to a particular server using the host, port, username and secret supplied by its operator. It supports stock ASL3, HamVOIP and legacy ASL2. These credentials are separate from your QSO One account.</p><div class="radio-example"><small>ZL3TOM EXAMPLE</small><pre>AllStar node 40452</pre></div>`
      },
      {
        title: "Connect with DMR, System Fusion or M17",
        html: `<h3>DMR: choose the network as well as the talkgroup</h3><p>QSO One supports more than BrandMeister and TGIF. The developer’s release notes confirm the following DMR network choices as checked on 6 October 2026:</p><ul><li><strong>BrandMeister</strong></li><li><strong>TGIF</strong></li><li><strong>FreeDMR</strong> — introduced as experimental support.</li><li><strong>System X (FreeSTAR)</strong> — introduced as experimental support in version 4.0.4.</li><li><strong>AmComm</strong> — introduced as experimental support in version 4.0.4.</li><li><strong>VKDMR (Australia)</strong> — introduced as experimental support in version 4.0.4.</li><li><strong>DMR+</strong> — introduced as experimental support in version 4.1.1.</li><li><strong>ADN Systems</strong> — introduced as experimental support in version 4.1.1, including live Last Heard.</li></ul><div class="guide-callout"><strong>Keep the app current:</strong> experimental networks may have limitations. Check the current network picker and <strong>What’s new</strong> in your installed version. The official website’s older two-network description does not include all of these release additions.</div><ol><li>Obtain your own approved DMR ID from RadioID.</li><li>Open DMR and select the network you want to use.</li><li>Complete that network’s login card with your DMR ID and the credentials it requests. Password requirements differ between networks; your QSO One password is not automatically the network password.</li><li>Choose an available server and the intended talkgroup. Check that network’s talkgroup directory rather than assuming a number has the same meaning on every network.</li><li>Connect, confirm the destination and listen. Use Last Heard or Active Now where the selected network provides them; a live feed is not available on every network.</li><li>Make a short identified transmission when clear, then release PTT and listen for a reply.</li></ol><p>A matching talkgroup number on two networks does not automatically join the same conversation. Any bridge between them depends on the network operators.</p><h3>System Fusion (YSF)</h3><p>Select System Fusion, use your licensed callsign and choose a YSF reflector from the directory. Save favourites and connect before using PTT. Where the reflector uses DG-ID groups, check your transmit and receive DG-ID settings so you send to and hear the intended group. YSF reflector access does not mean every WIRES-X room is directly available.</p><h3>M17</h3><p>Select M17, choose a reflector and module, then connect and listen before transmitting. Your callsign identifies you; QSO One’s M17 connection does not require a separate network registration. M17 uses the open Codec 2 voice codec. Check the module because different modules may carry different conversations.</p>`
      },
      {
        title: "Useful current features",
        html: `<p>Beyond making a connection, QSO One includes tools to help you find activity and keep track of contacts:</p><ul><li><strong>Directories and favourites:</strong> search destinations and save the ones you use regularly.</li><li><strong>DMR activity:</strong> browse talkgroups and view supported live activity feeds. On networks with a live feed, tapping a Last Heard station can take you to its talkgroup. Scanning is network-dependent; check the controls available for your selected network.</li><li><strong>Net Finder:</strong> browse nets and connect to supported destinations. Version 4.1.1 added DMR+ and System X net entries.</li><li><strong>QSO logging:</strong> keep contact records and export ADIF for another logbook. Review imported contacts and record the actual internet/network path accurately.</li><li><strong>Callsign lookup:</strong> view available operator details from a callsign; the information depends on the underlying database.</li><li><strong>Received-audio recording:</strong> save received audio when enabled, with retention settings and starred recordings.</li><li><strong>PTT and audio:</strong> use the on-screen button, Windows spacebar, or compatible Bluetooth, BLE and PoC PTT hardware. Adjust your microphone and receive levels; automatic receive levelling helps with varying audio levels.</li><li><strong>Android background sessions:</strong> a foreground service keeps a connection running while switching apps or locking the screen. Reconnection logic helps when the network changes; check battery settings if your device stops the app.</li></ul><p>Features and hardware behaviour can vary with the app version, device and network. Start with the on-screen PTT button before configuring an external microphone or button.</p>`
      },
      {
        title: "Troubleshooting checklist",
        html: `<ul><li>Confirm your callsign validation or DMR ID approval is complete.</li><li>Check microphone permission and selected audio devices.</li><li>Verify the node number, talkgroup or destination.</li><li>Re-enter private credentials carefully without sharing them.</li><li>Try receive-only first and then one short transmission.</li><li>Check the official QSO One site for current instructions and support.</li></ul>`
      },
      {
        title: "Good linked-network operating",
        html: `<p>Pause after keying, keep early transmissions short, and leave a gap between overs. Large talkgroups and linked nodes can cover many repeaters or users, so listen carefully and avoid long tests on busy destinations.</p><div class="radio-example"><small>FIRST CALL</small><pre>ZL3TOM listening through QSO One.</pre></div>`
      }
    ],
    sources: [
      ["QSO One official website", "https://qso1.net/"],
      ["QSO One on Google Play", "https://play.google.com/store/apps/details?id=com.qsoone.qso_one"],
      ["QSO One current features", "https://qso1.net/features"],
      ["QSO One official app overview and operating tools", "https://qso1.net/updates/modern-ham-radio-app"],
      ["Developer release notes: FreeDMR (3.7.2)", "https://www.reddit.com/r/QSOone/comments/1v841gp/qso_one_372/"],
      ["Developer release notes: System X, AmComm and VKDMR (4.0.4)", "https://www.reddit.com/r/QSOone/comments/1wmxmof/qso_one_404_system_x_amcomm_and_vkdmr_dmr_are_here/"],
      ["Developer release notes: DMR+ and ADN Systems (4.1.1)", "https://www.reddit.com/r/QSOone/comments/1wshf98/qso_one_411_is_here_changelog/"],
      ["QSO One support and bug reports", "https://qso1.net/faq"],
      ["Download QSO One from the Microsoft Store", "https://apps.microsoft.com/detail/9NRWFPGK3L3W"],
      ["EchoLink official validation", "https://www.echolink.org/validation/"],
      ["RadioID official site", "https://radioid.net/"],
      ["BrandMeister official dashboard", "https://brandmeister.network/"]
    ],
    related: ["echolink-getting-started", "getting-a-dmr-id", "digital-voice-for-beginners"]
  }
];

const priorityGuides = additionalGuides.slice(0, 3);
const extraGuides = additionalGuides.slice(3);
const allGuides = [...priorityGuides, ...existingGuides, hfCqGuide, qCodesGuide, ...newGuides, ...extraGuides];
const generatedGuides = [hfCqGuide, qCodesGuide, ...newGuides, ...additionalGuides];
const bySlug = new Map(allGuides.map((guide) => [guide.slug, guide]));

const radioIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg>`;
const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v16"/><path d="M20 19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a5 5 0 0 0-4 2 5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a5 5 0 0 1 4 2 5 5 0 0 1 4-2z"/></svg>`;

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function header(current = "guides") {
  const links = [
    ["Home", "/", "home"],
    ["About", "/about", "about"],
    ["Radio Fun", "/radio-fun", "radio"],
    ["Guides", "/guides", "guides"],
    ["QSL", "/qsl", "qsl"],
    ["Contact", "/contact", "contact"]
  ].map(([label, href, key]) => `<a href="${href}"${key === current ? ' aria-current="page"' : ""}>${label}</a>`).join("");

  return `<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header"><div class="site-container nav-wrap">
  <a class="brand" href="/" aria-label="ZL3TOM Amateur Radio home"><span class="brand-icon">${radioIcon}</span><span><strong>ZL3TOM</strong><small>Amateur Radio</small></span></a>
  <button class="menu-button" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span aria-hidden="true">☰</span></button>
  <nav id="main-navigation" class="main-nav" aria-label="Main navigation">${links}<a class="nav-qrz" href="https://qrz.com/db/ZL3TOM" target="_blank" rel="noreferrer">View on QRZ <span aria-hidden="true">↗</span></a></nav>
</div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="site-container footer-grid">
  <div><a class="brand footer-brand" href="/"><span class="brand-icon">${radioIcon}</span><span><strong>ZL3TOM</strong><small>On air from Aotearoa</small></span></a><p>Thomas Bernard · ZL3TOM / ZL3KY<br>Christchurch, New Zealand</p></div>
  <div><strong>Explore</strong><a href="/about">About Thomas</a><a href="/radio-fun">Station &amp; networks</a><a href="/guides">Radio guides</a></div>
  <div><strong>Connect</strong><a href="/qsl">QSL confirmation</a><a href="/contact">Contact ZL3TOM</a><a href="https://www.facebook.com/zl3tom" target="_blank" rel="noopener noreferrer">ZL3TOM on Facebook ↗</a><a href="https://aprs.fi/info/a/ZL3TOM" target="_blank" rel="noreferrer">APRS position ↗</a></div>
</div><div class="site-container footer-bottom"><span>© 2026 Thomas Bernard. 73!</span><span>Built for amateur radio operators everywhere.</span></div></footer>`;
}

function personSchema() {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Thomas Bernard",
    alternateName: ["ZL3TOM", "ZL3KY"],
    url: "https://zl3tom.com",
    address: { "@type": "PostalAddress", addressLocality: "Christchurch", addressCountry: "NZ" },
    sameAs: ["https://qrz.com/db/ZL3TOM", "https://aprs.fi/info/a/ZL3TOM", "https://www.facebook.com/zl3tom"]
  })}</script>`;
}

function documentHead({ title, description, canonical, keywords, type = "article" }) {
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="keywords" content="${escapeAttribute(keywords)}">
  <meta name="author" content="Thomas Bernard — ZL3TOM">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="/style.css?v=20260904-fullfix1">
  <link rel="stylesheet" href="/site-extras.css?v=20260904-fullfix1">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="${type}">
  <meta property="og:locale" content="en_NZ">
  <meta property="og:site_name" content="ZL3TOM Amateur Radio">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
</head>`;
}

function guidePage(guide) {
  const canonical = `https://zl3tom.com/guides/${guide.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: guide.title,
        description: guide.description,
        mainEntityOfPage: canonical,
        url: canonical,
        inLanguage: "en-NZ",
        author: { "@type": "Person", name: "Thomas Bernard", alternateName: "ZL3TOM", url: "https://zl3tom.com/about" },
        publisher: { "@type": "Person", name: "Thomas Bernard", alternateName: "ZL3TOM" },
        datePublished: updateIso,
        dateModified: guide.updatedIso ?? updateIso,
        about: ["Amateur radio", guide.title]
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://zl3tom.com/" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://zl3tom.com/guides" },
          { "@type": "ListItem", position: 3, name: guide.title, item: canonical }
        ]
      }
    ]
  };
  const sections = guide.sections.map((section, index) => `<section class="guide-section"><span class="section-number">${String(index + 1).padStart(2, "0")}</span><div><h2>${section.title}</h2>${section.html}</div></section>`).join("\n");
  const sources = guide.sources.map(([label, href]) => `<li><a href="${href}" target="_blank" rel="noreferrer">${label} <span aria-hidden="true">↗</span></a></li>`).join("");
  const related = guide.related.map((slug) => {
    const item = bySlug.get(slug);
    return `<a href="/guides/${slug}"><strong>${item.cardTitle}</strong><span>${item.description}</span></a>`;
  }).join("");

  return `<!doctype html>
<html lang="en-NZ">
${documentHead({ title: `${guide.title} | ZL3TOM`, description: guide.description, canonical, keywords: guide.keywords })}
<body>
${header("guides")}
<main id="main">
  <section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div class="page-icon">${bookIcon}</div><div><p class="section-kicker">ZL3TOM beginner guide</p><h1>${guide.title}</h1><p>${guide.description}</p></div></div></section>
  <section class="inner-section light"><div class="site-container article-layout">
    <article class="article-content">
      <a class="back-link" href="/guides">← All guides</a>
      ${sections}
      <section class="guide-sources" aria-labelledby="official-sources"><h2 id="official-sources">Official sources</h2><p>Software and network details change. Check these official pages before installing or entering account information.</p><ul>${sources}</ul></section>
      <section class="related-guides" aria-labelledby="related-guides"><h2 id="related-guides">Related guides</h2><div>${related}</div></section>
      <footer class="guide-byline"><p><strong>Written by Thomas Bernard — ZL3TOM</strong></p><p>Last updated: <time datetime="${guide.updatedIso ?? updateIso}">${guide.updatedDisplay ?? updateDisplay}</time></p></footer>
    </article>
    <aside class="article-aside"><strong>${guide.asideTitle}</strong>${guide.asideHtml}</aside>
  </div></section>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</main>
${footer()}
${personSchema()}
<script src="/script.js?v=20260904-fullfix1" defer></script>
</body>
</html>\n`;
}

function guidesIndex() {
  const description = "Beginner-friendly amateur radio guides by Thomas Bernard ZL3TOM, including New Zealand and USA band plans, APRS, AllStar, QRZ logging, EchoLink, DMR and operating.";
  const cards = allGuides.map((guide, index) => `<a href="/guides/${guide.slug}" class="guide-card"><div class="guide-card-top"><span>${String(index + 1).padStart(2, "0")}</span>${radioIcon}</div><h2>${guide.cardTitle}</h2><p>${guide.description}</p><em>Read guide →</em></a>`).join("\n");
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ZL3TOM Amateur Radio Guides",
    numberOfItems: allGuides.length,
    itemListElement: allGuides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: guide.title,
      url: `https://zl3tom.com/guides/${guide.slug}`
    }))
  };

  return `<!doctype html>
<html lang="en-NZ">
${documentHead({
    title: "Amateur Radio Beginner Guides | ZL3TOM",
    description,
    canonical: "https://zl3tom.com/guides",
    keywords: "amateur radio beginner guides, New Zealand band plans, USA band plans, APRS guide, AllStarLink, QRZ logging, EchoLink setup, DMR ID, ZL3TOM",
    type: "website"
  })}
<body>
${header("guides")}
<main id="main">
  <section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div class="page-icon">${bookIcon}</div><div><p class="section-kicker">Learn amateur radio</p><h1>Practical amateur radio guides</h1><p>Clear, beginner-friendly advice for getting on air, setting up popular radio apps, and operating with confidence.</p></div></div></section>
  <section class="inner-section light"><div class="site-container">
    <div class="site-search-panel"><form class="site-search" role="search"><label for="site-search-input">Search the ZL3TOM website</label><div><input id="site-search-input" type="search" inputmode="search" autocomplete="off" placeholder="Try EchoLink, DMR, antennas or QSL…"><button type="submit">Search</button></div><p>Search all pages and amateur radio guides.</p></form><div id="site-search-results" class="site-search-results" aria-live="polite"></div></div>
    <div class="guide-intro"><p>These guides are written from an amateur operator's perspective in Christchurch, New Zealand. Start with operating basics or jump straight to the system you want to use.</p></div><div class="guide-card-grid">${cards}</div>
  </div></section>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</main>
${footer()}
${personSchema()}
<script src="/script.js?v=20260904-fullfix1" defer></script>
</body>
</html>\n`;
}

for (const guide of generatedGuides) {
  const html = guidePage(guide);
  await writeFile(path.join(publicRoot, `guides-${guide.slug}.html`), html);
  const friendlyDirectory = path.join(publicRoot, "guides", guide.slug);
  await mkdir(friendlyDirectory, { recursive: true });
  await writeFile(path.join(friendlyDirectory, "index.html"), html);
}

const indexHtml = guidesIndex();
await writeFile(path.join(publicRoot, "guides.html"), indexHtml);
await mkdir(path.join(publicRoot, "guides"), { recursive: true });
await writeFile(path.join(publicRoot, "guides", "index.html"), indexHtml);

console.log(`Generated ${generatedGuides.length} guide pages and an index with ${allGuides.length} guides.`);
