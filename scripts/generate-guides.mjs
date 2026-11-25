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
    updatedIso: "2026-11-10",
    updatedDisplay: "10 November 2026",
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
    title: "QSO One Guide: App Store Download, Setup & Features",
    updatedIso: "2026-11-26",
    updatedDisplay: "26 November 2026",
    cardTitle: "QSO One setup",
    description: "QSO One is now on the Apple App Store for iPhone and iPad. Get the free app, then follow this setup guide for DMR, EchoLink, AllStarLink, IAX Direct, HF Listen, Beacon, PTT and troubleshooting on iPhone, Android, Windows and Mac beta.",
    keywords: "QSO One guide, QSO One setup, QSO One troubleshooting, QSO One AllStarLink, AllStar Node Mode, AllStar incoming connections, IAX Direct, UDP 4569, port forwarding, CGNAT, NAT loopback, QSO One DMR setup, DMR credentials, DMR TS1 TS2 timeslot, DMR talkgroups, Last Heard, TGIF network, QSO One Beacon rooms, My Rooms, Beacon favourites, QSO One HF Listen FM mode, KiwiSDR noise blanker, starred receivers sync, QSO One PTT, QSO One Android, QSO One iPhone, QSO One Mac, QSO One Mac installation, QSO One App Store, QSO One iPhone download, QSO One iPad download, QSO One TestFlight Mac beta, QSO One audio equipment, QSO One speaker microphone, QSO One Bluetooth headset, QSO One PTT button, QSO One FAQs, QSO One Windows, QSO1, amateur radio app, ZL3TOM",
    asideTitle: "QSO One downloads and Beacon",
    asideHtml: `<p><strong>Latest release:</strong> QSO One <strong>4.3.0</strong> is available. HF Listen adds FM mode, a noise blanker and synced starred receivers, with smarter receiver selection. DMR adds a TS1/TS2 talk-window toggle, an official talkgroup list and Last Heard for another network. The release also includes important Beacon, iPhone, Mac, Android, Bluetooth PTT, Net Finder and connection fixes. Check your platform's official store or updater.</p><p><strong>Support development:</strong> Consider a monthly subscription. The Beacon tier includes your own Beacon room. Subscribe in the app or at <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">qso1.net/support ↗</a>.</p><p class="guide-callout"><strong>Now on the Apple App Store!</strong> QSO One is available for iPhone and iPad. <a href="https://apps.apple.com/app/id6826741189" target="_blank" rel="noopener noreferrer">Get QSO One for iPhone and iPad ↗</a></p><p><strong>Already using TestFlight on iPhone or iPad?</strong> Install the App Store version. The Mac version is coming very soon; please continue using TestFlight on Mac for now.</p><p><a href="https://apps.apple.com/app/id6826741189" target="_blank" rel="noopener noreferrer">Download QSO One from the Apple App Store ↗</a><br><a href="https://testflight.apple.com/join/QkqB2Npv" target="_blank" rel="noopener noreferrer">QSO One TestFlight for Mac ↗</a><br><a href="https://play.google.com/store/apps/details?id=com.qsoone.qso_one" target="_blank" rel="noopener noreferrer">Get QSO One on Google Play ↗</a><br><a href="https://apps.microsoft.com/detail/9NRWFPGK3L3W" target="_blank" rel="noopener noreferrer">Get QSO One for Windows ↗</a><br><a href="https://qso1.net/" target="_blank" rel="noreferrer">Official QSO One website ↗</a></p><hr><p><strong>Beacon — experimental voice network</strong><br>Beacon is available in the QSO One app and in a browser. Manage your own rooms from Menu → My Rooms.</p><a href="https://qso1.net/beacon" target="_blank" rel="noopener noreferrer">Open Beacon ↗</a><br><a href="https://qso1.net/account/rooms" target="_blank" rel="noopener noreferrer">Manage Beacon room subscriptions ↗</a>`,
    contentsHtml: `<nav class="qso-guide-contents" aria-label="QSO One guide contents"><style>.qso-guide-contents{margin:1.5rem 0;padding:1.25rem;border:1px solid #cbd5e1;border-radius:14px;background:#f8fafc}.qso-guide-contents h2{margin:0 0 .35rem}.qso-guide-contents>p{margin:.25rem 0 1rem;color:#475569}.qso-guide-contents h3{font-size:1rem;margin:1rem 0 .45rem}.qso-guide-contents ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:.45rem;list-style:none;padding:0;margin:0}.qso-guide-contents li{margin:0}.qso-guide-contents a{display:block;height:100%;padding:.65rem .8rem;border:1px solid #dbe3ec;border-radius:8px;background:#fff;text-decoration:none}.qso-guide-contents a:hover{text-decoration:underline;background:#eff6ff}.qso-guide-contents a:focus-visible{outline:3px solid #2563eb;outline-offset:2px}</style><h2>Find what you need</h2><p>Start with setup, or jump straight to a feature or fix.</p><h3>Getting started</h3><ul><li><a href="#network-setup">Set up DMR, YSF and M17</a></li><li><a href="#iax-settings">Configure IAX Direct</a></li><li><a href="#mac-install">Install on Mac</a></li><li><a href="#audio-hardware">Audio equipment and PTT</a></li></ul><h3>Features and settings</h3><ul><li><a href="#beacon">Beacon voice network</a></li><li><a href="#privacy-settings">Permissions and privacy</a></li><li><a href="#accessible-use">Accessible operation</a></li><li><a href="#qso-one-faq">Frequently asked questions</a></li></ul><h3>Troubleshooting and support</h3><ul><li><a href="#audio-help">Audio troubleshooting</a></li><li><a href="#ptt-help">PTT and background sessions</a></li><li><a href="#community-troubleshooting">Connection problems</a></li><li><a href="#support-report">Updates and support</a></li><li><a href="#qso-one-community">QSO One community</a></li></ul></nav>`,
    sections: [
      {
        title: "What QSO One is",
        html: `<div class="guide-callout"><strong>New to QSO One?</strong><p>QSO One is a free internet voice app for licensed amateur radio operators. It connects you to services such as AllStarLink, EchoLink, DMR, YSF, M17 and Beacon—without needing a separate radio or hotspot.</p><p><strong>Get started:</strong> <a href="https://apps.apple.com/app/id6826741189" target="_blank" rel="noopener noreferrer">Download for iPhone and iPad ↗</a>. Android and Windows versions are also available; Mac users should continue with TestFlight for now.</p></div><p>Developed by Frank KD8JKK, QSO One uses your device’s microphone, speaker and internet connection to receive and transmit through supported networks. Depending on the destination, your voice may reach other app users, linked nodes or RF repeaters.</p><p>It includes directories, favourites, callsign lookup, contact logging and Net Finder. You need an amateur radio licence and any account required by the network you use. Access is free, with optional contributions to support development.</p><p>It uses your device’s microphone, speaker and internet connection to receive and transmit through these networks without a separate radio, hotspot or Raspberry Pi. Depending on the destination, your voice may reach other app users, linked nodes or RF repeaters. It is useful at home, when travelling, or when a traditional radio setup is difficult to access.</p><p>QSO One also provides directories, favourites, callsign lookup, contact logging and Net Finder. Access is free, with optional contributions to support development. You still need your amateur radio licence and any accounts required by your chosen network.</p>`
      },
      {
        title: "QSO One recent updates and features",
        html: `<div class="guide-callout"><strong>QSO One 4.3.0 — latest release</strong><p style="margin:.45rem 0 0">HF Listen improvements, expanded DMR controls and lists, and fixes across Beacon, PTT, audio and connectivity. Use the button below to open the complete version-by-version changelog.</p></div>
<details class="qso-changelog-toggle"><summary>View full version changelog</summary>
<style>.qso-changelog-toggle{margin:1rem 0}.qso-changelog-toggle>summary{display:inline-flex;align-items:center;cursor:pointer;padding:.8rem 1.1rem;border:1px solid #64748b;border-radius:9px;background:#f1f5f9;color:#172033;font-weight:700}.qso-changelog-toggle>summary:focus-visible{outline:3px solid #2563eb;outline-offset:3px}.qso-changelog-toggle[open]>summary{margin-bottom:.75rem}.qso-changelog-version{border:1px solid #cbd5e1;border-radius:10px;margin:.75rem 0;overflow:hidden}.qso-changelog-version summary{cursor:pointer;padding:.9rem 1rem;background:#f8fafc;font-weight:700;color:#172033}.qso-changelog-version summary:focus-visible{outline:3px solid #2563eb;outline-offset:-3px}.qso-changelog-version-content{padding:.85rem 1rem}.qso-changelog-version-content h3{margin-top:0}</style>
<section id="qso-one-changelog" aria-labelledby="qso-one-changelog-title" style="width:100%;max-width:none;max-height:none;overflow:visible;padding:0;margin:1.5rem 0;border:1px solid #cbd5e1;border-radius:16px;box-shadow:0 4px 18px rgba(0,0,0,.08);color:#172033;background:#fff;">
<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.25rem;background:#f1f5f9;border-bottom:1px solid #cbd5e1;position:sticky;top:0;">
<h2 id="qso-one-changelog-title" style="margin:0;font-size:1.35rem;">QSO One version changelog</h2>

</div>
<div style="padding:1.1rem 1.35rem;overflow-y:auto;">
<p style="margin-top:0;">A version-by-version summary of notable QSO One features and fixes. Release availability can differ between platforms and app stores.</p>
<details class="qso-changelog-version" open><summary>Version 4.3.0 — HF Listen, DMR and reliability improvements</summary><div class="qso-changelog-version-content">
<p><strong>QSO One 4.3.0</strong> improves HF listening, adds DMR controls and talkgroup information, and fixes issues across Beacon, PTT, audio and network connections.</p>
<h3>HF Listen</h3><ul><li><strong>NEW:</strong> FM mode joins the available HF listening modes.</li><li><strong>NEW:</strong> A noise blanker helps reduce pulse-type interference.</li><li><strong>NEW:</strong> Starred receivers synchronise across your devices.</li><li><strong>NEW:</strong> A smarter receiver list and automatic selection of the best receiver when none has been chosen.</li></ul>
<h3>DMR</h3><ul><li><strong>NEW:</strong> Toggle between TS1 and TS2 directly in the talk window.</li><li><strong>NEW:</strong> An official talkgroup list and Last Heard for another DMR network.</li></ul>
<h3>HF Listen fixes</h3><ul><li><strong>FIXED:</strong> Playback now works on iPhone and Mac.</li><li><strong>FIXED:</strong> Relayed KiwiSDR receivers connect again.</li></ul>
<h3>Beacon fixes</h3><ul><li><strong>FIXED:</strong> iPhone audio stays steady when switching rooms.</li><li><strong>FIXED:</strong> Messages read on one device show as read on all devices.</li><li><strong>FIXED:</strong> Replies reach every device after a restore or when moving to a new phone.</li><li><strong>FIXED:</strong> Loud talkers in busy rooms are no longer cut off mid-transmission.</li><li><strong>FIXED:</strong> Resolved a silent-microphone issue on some Android phones.</li></ul>
<h3>PTT, Bluetooth and accessibility</h3><ul><li><strong>FIXED:</strong> iPhone PTT works with VoiceOver and hearing aids.</li><li><strong>FIXED:</strong> iPhone PTT is refused only when another app is genuinely playing audio.</li><li><strong>FIXED:</strong> Bluetooth PTT learning saves the microphone correctly on PoC phones.</li></ul>
<h3>DMR, YSF and connections</h3><ul><li><strong>FIXED:</strong> Linked DMR talkgroups use the correct time slot.</li><li><strong>FIXED:</strong> A configured YSF receive DG-ID plays only that DG-ID, like a Yaesu radio.</li><li><strong>FIXED:</strong> Custom DMR server login and ClearNode IAX connections work correctly.</li></ul>
<h3>Net Finder and On the Net</h3><ul><li><strong>FIXED:</strong> Net Finder no longer freezes on long lists.</li><li><strong>FIXED:</strong> A stuck “transmitting” indicator clears after a connection drop.</li></ul>
<p><strong>Support ongoing development:</strong> Consider a monthly subscription to help fund continued development. At the Beacon tier, you can also get your own Beacon room. Subscribe in the app or visit <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">qso1.net/support</a>.</p></div></details><details class="qso-changelog-version"><summary>Version 4.2.9 — HF Listen, PTT protection, DMR and Beacon upgrades</summary><div class="qso-changelog-version-content">
<p><strong>QSO One 4.2.9</strong> is a substantial update across HF listening, PTT safety, digital voice networks, Beacon rooms and messaging, account handling, and accessibility.</p>
<h3>HF Listen</h3><ul><li><strong>NEW:</strong> HF Listen in Tools lets you listen to KiwiSDR shortwave receivers directly in QSO One.</li>
<li><strong>NEW:</strong> Add a receiver by address, tune by typing or stepping, and select AM, LSB, USB or CW.</li>
<li><strong>NEW:</strong> Net Finder cards for nets with an HF frequency include a Listen on HF button.</li>
<li><strong>NEW:</strong> Share an HF frequency with a link that opens HF Listen.</li></ul>
<h3>PTT</h3><ul><li><strong>NEW:</strong> On EchoLink and DMR, every PTT source waits while another station is talking. On-screen, spacebar, Bluetooth, phone-key and volume-key PTT remain held until the other station stops, so your own over is not cut off.</li>
<li><strong>NEW:</strong> The PTT button and collapsed pill dim while waiting, with an accessible explanation announced by screen readers in every language.</li>
<li><strong>FIXED:</strong> Learning a phone side key also saves the phone's own PTT broadcast, allowing it to key with the screen off.</li>
<li><strong>FIXED:</strong> Learning a BLE button on a microphone that also has classic Bluetooth no longer gets stuck on BLE.</li>
<li><strong>FIXED:</strong> An unknown-type Bluetooth headset is treated as earbuds behind a Bluetooth PTT, keeping the call on the headset and its microphone.</li>
<li><strong>FIXED:</strong> Android TIDRADIO microphones are marked button-only only after they have actually carried call audio.</li>
<li><strong>FIXED:</strong> iPhone TIDRADIO continues working when the app goes into the background.</li></ul>
<h3>D-STAR</h3><ul><li><strong>NEW:</strong> HamThings is available as an experimental D-STAR family, with talkgroups, scan and Net Finder links.</li>
<li><strong>FIXED:</strong> The D-STAR heard list now shows the correct callsign suffix.</li></ul>
<h3>DMR</h3><ul><li><strong>NEW:</strong> DVSPh Network is available as a built-in DMR network.</li>
<li><strong>NEW:</strong> Talkgroup scanning is available on the HamThings Open DMR Terminal, like BrandMeister.</li>
<li><strong>NEW:</strong> Custom DMR servers support optional Options text, which is saved and synced.</li>
<li><strong>FIXED:</strong> Custom DMR servers retry the login key in the alternate format expected by some servers and clearly explain when a login is refused.</li>
<li><strong>FIXED:</strong> Deleting the last custom server also removes its favourite talkgroups.</li>
<li><strong>FIXED:</strong> DMR names now come from RadioID first; the network alias is used only as a fallback.</li>
<li><strong>FIXED:</strong> DMR ESSID stays on each device for TGIF, System X and every ID-only network.</li></ul>
<h3>AllStarLink and IAX</h3><ul><li><strong>FIXED:</strong> Your AllStar node number stays on each device and is never synced.</li>
<li><strong>FIXED:</strong> A LAN router reflecting our own call no longer drops the real call.</li>
<li><strong>FIXED:</strong> Incoming calls are answered more reliably.</li>
<li><strong>FIXED:</strong> A saved IAX Direct node appears only once in Active.</li>
<li><strong>FIXED:</strong> Duplicate IAX nodes are combined, and failed IAX Direct sign-ins explain why they failed.</li>
<li><strong>FIXED:</strong> iPhone devices on IPv6-only cellular networks can reach AllStar and DMR.</li></ul>
<h3>EchoLink, YSF and NXDN</h3><ul><li><strong>FIXED:</strong> A frequency in an EchoLink node's information no longer appears as a station.</li>
<li><strong>FIXED:</strong> EchoLink drops a stale proxy session after repeated failures and selects a fresh one.</li>
<li><strong>NEW:</strong> Enter a YSF DG-ID directly; Net Finder and address connections remember it.</li>
<li><strong>FIXED:</strong> NXDN displays the talker's ID number instead of a guessed callsign.</li></ul>
<h3>Beacon rooms and voice</h3><ul><li><strong>NEW:</strong> Net control can pause any talker for a set time from the person card, talker box or People list.</li>
<li><strong>NEW:</strong> Rooms automatically rejoin after a drop and tolerate network gaps of up to 60 seconds.</li>
<li><strong>NEW:</strong> Blocking someone also mutes and hides that person in rooms.</li>
<li><strong>NEW:</strong> Extra-room packs are available on every platform.</li>
<li><strong>NEW:</strong> The room PTT menu includes RX volume, mute and PTT lock.</li>
<li><strong>NEW:</strong> A person's QSO One name is shown first, and callsign lookup is retried after a slow-network miss.</li>
<li><strong>NEW:</strong> Person cards show callsign lookup details and actions including Log QSO, QRZ and badges.</li>
<li><strong>FIXED:</strong> The microphone turns on when you first key, so your first words are heard.</li>
<li><strong>FIXED:</strong> Only one talker has the floor; an active talker keeps it, while a stuck or silent key is cleared.</li>
<li><strong>FIXED:</strong> Correct handling of TX when the room mutes your microphone, unkeying after a dropped connection, and preventing an open microphone after a quick release.</li>
<li><strong>FIXED:</strong> Joining immediately after leaving no longer kicks you out, and failed joins no longer wedge the app on F400 or slow networks.</li>
<li><strong>FIXED:</strong> Room joining works on Android 7, 8 and 9.</li>
<li><strong>FIXED:</strong> Android continues playing with the screen off.</li>
<li><strong>FIXED:</strong> Each talker is levelled independently; loud and quiet stations sound more even without your own level being pulled down while talking.</li>
<li><strong>FIXED:</strong> Hearing aids remain in use when you join.</li>
<li><strong>FIXED:</strong> Leaving a room yourself ends a scan.</li>
<li><strong>FIXED:</strong> Shutting down from the menu on iPad leaves the room and stops audio and microphone activity.</li>
<li><strong>FIXED:</strong> iPhone follows your selected Beacon output, feeds both car speakers and reports the car microphone picker accurately.</li>
<li><strong>FIXED:</strong> iPhone AirPlay works on every network, and video in other apps no longer pauses every few seconds.</li>
<li><strong>FIXED:</strong> Windows USB audio interfaces use the correct input; silent playback restarts itself; stopping a voice message no longer crashes; and the app starts on trimmed Windows installations.</li>
<li><strong>FIXED:</strong> Tones and chirps follow the room's audio path.</li></ul>
<h3>Beacon messages, feed and map</h3><ul><li><strong>NEW:</strong> Direct messages and group chats reach every device on your account.</li>
<li><strong>NEW:</strong> Notifications open the relevant item—including DMs, calls, requests, groups and friend requests—even when the app was closed.</li>
<li><strong>NEW:</strong> An in-app notice appears when a group message arrives while QSO One is open.</li>
<li><strong>NEW:</strong> The feed has Refresh, inline comments and delete from its menu.</li>
<li><strong>FIXED:</strong> Votes, polls and deletes preserve your place in the feed; a failed vote is rolled back.</li>
<li><strong>NEW:</strong> The map shows connected people in gold and your own position in green; the Friends layer explains when nobody is in view.</li>
<li><strong>NEW:</strong> My rooms has moved into the Menu. Room names appear on net cards, with Share and Invite on your own room page.</li>
<li><strong>FIXED:</strong> The Rooms list and Net Finder scroll to the correct length with a steady scrollbar.</li>
<li><strong>FIXED:</strong> The RX bar no longer blanks; emojis display on iPhone, iPad and Mac; and the chat box clears the keyboard.</li>
<li><strong>FIXED:</strong> Busy and collision notices clear after five seconds.</li>
<li><strong>FIXED:</strong> Wide windows switch to Map, Rooms and Feed tabs when the middle area becomes too narrow.</li></ul>
<h3>Accounts</h3><ul><li><strong>NEW:</strong> A real callsign is required. Accounts without one are sent to the callsign screen, and made-up callsigns are refused.</li>
<li><strong>FIXED:</strong> Changing an email address to one already attached to an account clearly explains the conflict.</li>
<li><strong>FIXED:</strong> Sign-in clearly reports when the sign-in server cannot be reached from your network.</li></ul>
<h3>Net Finder and On the Net</h3><ul><li><strong>NEW:</strong> Live On the Net cards include the favourite star, reminder bell and menu.</li>
<li><strong>NEW:</strong> Recent connections show full Beacon room names and the DMR network.</li>
<li><strong>NEW:</strong> Beacon contacts count towards the All Networks and 10 Countries trophies.</li>
<li><strong>FIXED:</strong> Editing a net's time now saves correctly.</li>
<li><strong>FIXED:</strong> Net chat keeps its scroll position while messages arrive.</li></ul>
<h3>Chat, screens and accessibility</h3><ul><li><strong>NEW:</strong> Chat text can be selected and copied throughout the app. Long-press a room message for Copy and Report.</li>
<li><strong>NEW:</strong> Links can be tapped in every chat, including Beacon, On the Net, EchoLink, M17 and notifications.</li>
<li><strong>FIXED:</strong> Thai text fits on 240 × 320 screens.</li>
<li><strong>FIXED:</strong> The simple layout on wide screens has working gear and network switcher controls, and Tab can reach the switcher.</li>
<li><strong>FIXED:</strong> The UTC clock announces both 24-hour and 12-hour time to screen readers.</li>
<li><strong>FIXED:</strong> The QSO log trash notice closes automatically.</li>
<li><strong>FIXED:</strong> Screen-reader improvements have been made across the app.</li></ul>
<p><strong>Support ongoing development:</strong> Consider a monthly subscription to help fund continued development. At the Beacon tier, you can also get your own Beacon room. Subscribe in the app or visit <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">qso1.net/support</a>.</p></div></details><details class="qso-changelog-version"><summary>Version 4.2.7 — Beacon bug-fix update</summary><div class="qso-changelog-version-content"><ul>
<li><strong>Room sharing and invites:</strong> share public rooms and invite friends from the room menu or About tab. <code>qso1.net/beacon/r/</code> links open QSO One directly in the room. Invitations appear in the notification bell and as push notifications.</li>
<li><strong>Beacon audio:</strong> added separate Beacon audio levels in Settings → Audio; Microphone Gain is currently supported on Android and Windows.</li>
<li><strong>Android and Windows fixes:</strong> fixed crashes when joining busy Android rooms, freezing in large Windows rooms and the room-chat keyboard closing while typing.</li>
<li><strong>Room counts and layout:</strong> counts now represent people rather than connections, so app and website sessions count once. Sidebar counts stay current and the talking box stays pinned at the top of short room cards.</li>
<li><strong>Beacon networking:</strong> fixed Beacon on networks that block its former server addresses and reduced server check-in frequency to lower load.</li>
<li><strong>On the Net:</strong> “Net is live” works regardless of how a public Beacon room was opened (Favorites, Recents, map or Net Finder). Net control can pause or ban Beacon talkers; check-ins use the room’s displayed name and place; Add connection starts on the net’s network.</li>
<li><strong>AllStar and EchoLink:</strong> QSO One asks the home router via UPnP to open incoming ports and repeats the request when Wi-Fi or the local address changes.</li>
<li><strong>DMR:</strong> ADN and HamThings now identify a refused personal password as a password issue rather than a DMR ID registration issue.</li>
<li><strong>Account and notifications:</strong> station profiles remain selected independently on each device. The notification centre adds confirmed Clear all, which also marks Beacon messages and bug-report replies as read.</li>
<li><strong>Accessibility:</strong> screen readers announce Network Health links as links.</li>
</ul></div></details>
<details class="qso-changelog-version"><summary>Version 4.2.6 — Beacon (Experimental)</summary><div class="qso-changelog-version-content"><ul>
<li>Launched Beacon, QSO One’s built-in voice network, with free public rooms for countries, states and counties, plus Worldwide, Ragchew and Echo.</li>
<li>Added a live map and globe, room activity discovery, push-to-talk, audio indicators, private Echo testing, room recording, chat, people and talker lists.</li>
<li>Introduced friends, private and voice messages, group chats for up to 50, private calls, a social feed and Beacon notifications.</li>
<li>Added custom rooms with moderators, private-room allow lists and room management. Beacon Supporters include one room; extra rooms cost $10/month. Public rooms remain free.</li>
<li>Added station profiles, Korean and Simplified Chinese beta languages, custom DMR server networks, AllStar refinements, Windows Bluetooth PTT support and On the Net improvements.</li>
<li>Beacon is also available on the web at <a href="https://qso1.net/beacon" target="_blank" rel="noopener noreferrer">qso1.net/beacon</a> when signed in.</li>
</ul></div></details>
<details class="qso-changelog-version" open><summary>Version 4.2.5 — On the Net planning, speaker microphones and AllStar audio</summary><div class="qso-changelog-version-content">
<ul>
<li><strong>On the Net scheduling:</strong> plan a net ahead by choosing it from Net Finder with search. Net Control starts automatically when the scheduled net begins. Existing listed nets use their Net Finder link, while newly created nets receive a custom link.</li>
<li><strong>TidRadio speaker microphones:</strong> full speaker, microphone and PTT-button operation is now supported on iPhone.</li>
<li><strong>AllStar full duplex:</strong> Bluetooth and wired speaker microphones now support full-duplex audio.</li>
<li><strong>Talkgroup names:</strong> accented talkgroup names are no longer garbled across networks.</li>
<li><strong>Audio and connectivity:</strong> smoother AMBE server audio on weak Wi-Fi and fixes for AllStar freezes.</li>
<li><strong>Bluetooth:</strong> removed disruptive Bluetooth call pop-ups.</li>
<li><strong>Other fixes:</strong> corrected a false clock warning and a TalkBack crash; improved iPhone keyboard dismissal when tapping outside a text field, made M17 setup boxes easier to read, increased speaker output slightly through RX VOL, and fixed a car-kit “call ended” loop, along with many smaller fixes.</li>
</ul>
</div></details><details class="qso-changelog-version"><summary>Version 4.2.4 — Active Now, NXDN and safer transmitting</summary><div class="qso-changelog-version-content">
<ul>
<li><strong>Active Now:</strong> added a QSO One-built activity view for AllStar, IAX Direct, EchoLink, FreeDMR, AmComm, DMR+, D-STAR, P25, NXDN, M17 and YSF/FCS. It shows the network or destination where a current-version QSO One user is transmitting, without identifying the operator. Coverage grows as users update.</li>
<li><strong>AllStar activity:</strong> red microphone indicators identify transmitting QSO One users in connected-node lists, Recently Heard and On the Net check-in lists.</li>
<li><strong>NXDN (Experimental):</strong> added NXDN support, a dedicated parrot and audio-test support.</li>
<li><strong>HamThings DMR (Experimental):</strong> added the HamThings DMR network.</li>
<li><strong>On the Net:</strong> added Emergency Break, shared net-control handover that keeps the net running, Past Nets synchronisation between devices, multi-callsign check-ins and tappable chat links. The running-net screen was tightened so the chat box is no longer hidden behind the PTT bar.</li>
<li><strong>Net-control moderation:</strong> net control and loggers can select a marked callsign to pause its transmission or ban it for 30 seconds up to the remainder of the net.</li>
<li><strong>Accessibility:</strong> major NVDA and Narrator improvements on Windows and better VoiceOver support on iPhone and Mac.</li>
<li><strong>Other additions:</strong> browsing without a callsign (browsing only), Bluetooth LE PTT buttons on Windows and playback of personal recordings inside the app.</li>
<li><strong>Transmit-safety defaults:</strong> everyone was reset to Hold to Talk and a 60-second transmit timeout. A 10-second dead-air cutoff unkeys a silent transmission; DTMF keypad activity is exempt. Android and iPhone AllStar talk-over protection prevents keying over another station unless using earbuds or headphones. Several unintended automatic-transmit paths, mainly involving DMR, were closed.</li>
<li><strong>4.2.4 fixes:</strong> corrected the audio test stopping when the operator is quiet, acceptance of microphones that are silent between words (including noise-gated headsets and muted mixers), and DMR+ Timeslot 2 talkgroup transmission.</li>
<li><strong>Other fixes:</strong> password fields no longer autocorrect; improved sign-in reliability when the computer clock is wrong; fixed startup stalls; improved AllStar recovery after drops and hub refusals; improved DMR+ linking and playback; microphone gain now works with AGC; fixed UNIWA F400 wired speaker-mic and screen-off PTT behaviour; improved TIDRADIO microphone recognition; fixed a Mac microphone crash on wake; improved iPhone Bluetooth microphone recovery and restored iPhone speaker bass; plus brighter, more readable text and buttons.</li>
</ul>
<p><strong>4.2.3 follow-up:</strong> the developer specifically asks users who installed 4.2.3 from the Microsoft Store or qso1.net to update to 4.2.4, which addresses the three issues listed above.</p>
<p><strong>Support development:</strong> the developer invites users to consider a monthly in-app subscription or a contribution through <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">QSO One support</a>.</p>
</div></details><details class="qso-changelog-version"><summary>Version 4.2.0 — Weather, All Favorites and On the Net</summary><div class="qso-changelog-version-content">
<ul>
<li>Added Weather with current conditions, hourly and seven-day forecasts, radar, alerts and Weather Radio (US-focused).</li>
<li>Added All Favorites, bringing saved destinations from different networks into one list with reordering and supported live activity.</li>
<li>Expanded On the Net with special guest check-ins, chat replies and improved emoji support.</li>
<li>Moved Net Finder into On the Net and added experimental BC-TRBO NextGen DMR support.</li>
<li>Fixed issues involving DMR audio, Wi-Fi changes, EchoLink, AllStar/IAX, Windows accessibility tools, USB microphones and notifications.</li>
</ul>
<p><a href="https://www.reddit.com/r/QSOone/comments/1xdpt1g/qso_one_420_weather_and_on_the_net_updates/" target="_blank" rel="noopener noreferrer">Read the developer’s 4.2.0 release notes ↗</a></p>
</div></details><details class="qso-changelog-version"><summary>Version 4.1.9 — Weather Radio and refinements</summary><div class="qso-changelog-version-content">
<ul>
<li>Introduced Weather Radio and moved Net Finder into the On the Net area.</li>
<li>Added experimental BC-TRBO NextGen DMR support.</li>
<li>Improved DMR codec selection, TGIF connection recovery, notifications, small-screen menus and app reliability.</li>
</ul>
<a href="https://www.reddit.com/r/QSOone/comments/1xdexr0/qso_one_419_weather_radio_us_and_more/" target="_blank" rel="noopener noreferrer">Read the developer’s 4.1.9 release notes ↗</a>
</div></details><details class="qso-changelog-version"><summary>Version 4.1.5 — reliability and usability</summary><div class="qso-changelog-version-content">
<ul>
<li>Improved D-STAR and P25 directory refresh, favourites and audio behaviour.</li>
<li>Added DMR scanning and clearer connection warnings.</li>
<li>Improved Windows and Android PTT, Bluetooth, microphone selection and USB AMBE support.</li>
<li>Fixed connection, audio, crash, notification and small-screen issues.</li>
</ul>
<a href="https://www.reddit.com/r/QSOone/comments/1x4xh63/qso_one_415_big_bugs_hopefully_squashed/" target="_blank" rel="noopener noreferrer">Read the developer’s 4.1.5 release notes ↗</a>
</div></details><details class="qso-changelog-version"><summary>Version 4.1.4 — D-STAR and P25</summary><div class="qso-changelog-version-content">
<ul>
<li>Introduced experimental D-STAR reflector support, including REF, XRF, DCS and XLX.</li>
<li>Introduced experimental P25 talkgroups and FCS rooms for System Fusion.</li>
<li>Improved M17 reflector support and made fixes across Windows audio, Bluetooth, logging and Net Finder.</li>
</ul>
<a href="https://www.reddit.com/r/QSOone/comments/1wzvypy/qso_one_414_dstar_and_p25_report_for_duty/" target="_blank" rel="noopener noreferrer">Read the developer’s 4.1.4 release notes ↗</a>
</div></details><details class="qso-changelog-version"><summary>Version 4.1.3 — DMR and connection fixes</summary><div class="qso-changelog-version-content">
<ul>
<li>Fixed BrandMeister audio stuttering after switching between Wi-Fi and mobile data.</li>
<li>Improved DMR+ static talkgroups and corrected connection, registration and directory issues across networks.</li>
<li>Improved Android Bluetooth audio routing and Windows microphone permission handling.</li>
</ul>
<a href="https://www.reddit.com/r/QSOone/comments/1wvi04o/qso_one_413_more_bugs_squashed/" target="_blank" rel="noopener noreferrer">Read the developer’s 4.1.3 release notes ↗</a>
</div></details><details class="qso-changelog-version"><summary>Version 4.1.1 — DMR networks and Net Finder</summary><div class="qso-changelog-version-content">
<ul>
<li>Added experimental DMR+ and ADN Systems, including live Last Heard for ADN Systems.</li>
<li>Added separate login cards and account backup for DMR network credentials.</li>
<li>Added more language options and improvements to audio, PTT, small-screen layouts and connection handling.</li>
<li>Expanded Net Finder to include DMR+ and System X nets.</li>
</ul>
<a href="https://www.reddit.com/r/QSOone/comments/1wshf98/qso_one_411_is_here_changelog/" target="_blank" rel="noopener noreferrer">Read the developer’s 4.1.1 release notes ↗</a>
<hr>
<p><strong>Note:</strong> This is an edited summary, not a verbatim copy of every developer release note. For the most accurate platform-specific information, check the app’s <strong>What’s New</strong> screen and the official QSO One community.</p>
<p><a href="https://www.reddit.com/r/QSOone/" target="_blank" rel="noopener noreferrer">Browse QSO One release announcements on Reddit ↗</a> · <a href="https://qso1.net/" target="_blank" rel="noopener noreferrer">Official QSO One website ↗</a></p>
</div></section></details>`
      },
      {
        id: "beacon",
        title: "Beacon: QSO One's new experimental voice network",
        html: `<div class="guide-callout"><strong>Available in the QSO One app and on the web — experimental:</strong> Beacon, previously known as QSO Earth, is QSO One's own voice network. Open <a href="https://qso1.net/beacon" target="_blank" rel="noopener noreferrer">qso1.net/beacon</a> and sign in with your existing QSO One account.</div>
<p>Beacon combines live voice rooms with social and messaging tools. It is available through the QSO One app and a web browser. As an experimental service, features and behaviour may change as development continues.</p>
<h3>Getting started with Beacon</h3>
<ol class="qso-step-list">
<li>Open Beacon from the QSO One app, or visit <a href="https://qso1.net/beacon" target="_blank" rel="noopener noreferrer">the Beacon website</a> in a supported browser.</li>
<li>Sign in using your existing QSO One account.</li>
<li>When prompted, allow microphone access. Select the microphone and speaker you want to use.</li>
<li>Explore the live globe or room list, then join a public room such as Worldwide or Ragchew.</li>
<li>Listen first. When ready to speak, use the app or browser push-to-talk control. Release the control when you finish transmitting.</li>
</ol>
<h3>Beacon features</h3>
<ul>
<li><strong>Live interactive globe:</strong> explore rooms and activity around the world.</li>
<li><strong>Push-to-talk:</strong> transmit using the controls in the QSO One app or browser.</li>
<li><strong>Room scanner:</strong> scan available rooms and listen to them one at a time.</li>
<li><strong>Social feed:</strong> publish status updates and posts, and see updates from people you follow.</li>
<li><strong>Friends and direct messages:</strong> connect with other users and have private conversations.</li>
<li><strong>Room text chat:</strong> send and read text messages alongside voice activity.</li>
<li><strong>Voice messages:</strong> record and send voice messages directly to friends.</li>
<li><strong>Digital QSL cards:</strong> create and exchange digital QSL cards.</li>
<li><strong>Notifications:</strong> receive activity notifications, including push notifications where supported.</li>
</ul>
<h3>Free public rooms</h3>
<p>Public rooms are available to join for free. QSO One provides Worldwide, Ragchew and Echo, along with dedicated rooms for countries, US states and US counties where available. The Echo room plays your own voice back privately, making it useful for checking your microphone and audio. You can explore rooms near you or visit rooms elsewhere in the world.</p>
<h3>Create and manage your own room</h3>
<p>Supporters can create rooms with a name, location and description, and choose whether a room is public or private. Room owners can appoint moderators, manage an allow list for private rooms and ban disruptive users.</p>
<p>Room subscriptions and available bundles can change. Check the <a href="https://qso1.net/account/rooms" target="_blank" rel="noopener noreferrer">official QSO One room management page</a> for current options, prices and payment details.</p>
<div class="guide-callout"><strong>Experimental service and feedback:</strong> Beacon is still developing, so occasional problems or changes are possible. Report issues through the service or email <a href="mailto:support@qso1.net">support@qso1.net</a>.</div>
<p><a href="https://qso1.net/beacon" target="_blank" rel="noopener noreferrer"><strong>Open Beacon in your browser ↗</strong></a> · <a href="https://qso1.net/account/rooms" target="_blank" rel="noopener noreferrer">Manage your rooms ↗</a></p>`
      },
      {
        title: "QSO One downloads and Beacon",
        html: `<ul><li><strong>iPhone/iPad:</strong> <a href="https://apps.apple.com/app/id6826741189" target="_blank" rel="noopener noreferrer">App Store ↗</a></li><li><strong>Android:</strong> <a href="https://play.google.com/store/apps/details?id=com.qsoone.qso_one" target="_blank" rel="noopener noreferrer">Google Play ↗</a></li><li><strong>Windows:</strong> <a href="https://apps.microsoft.com/detail/9NRWFPGK3L3W" target="_blank" rel="noopener noreferrer">Microsoft Store ↗</a></li><li><strong>Mac:</strong> <a href="https://testflight.apple.com/join/QkqB2Npv" target="_blank" rel="noopener noreferrer">TestFlight beta ↗</a> (Mac release coming soon)</li><li><strong>Beacon:</strong> <a href="https://qso1.net/beacon" target="_blank" rel="noopener noreferrer">Open Beacon ↗</a></li></ul>`
      },
      {
        id: "mac-install",
        title: "Install and use QSO One on Mac",
        html: `<p>QSO One is available for compatible Mac users through Apple's TestFlight beta programme. Beta availability and supported devices can change, so check the current invitation and TestFlight listing.</p>
<h3>What you need</h3>
<ul><li>A compatible Mac and an Apple Account.</li><li>The Apple TestFlight app.</li><li>The QSO One beta invitation: <a href="https://testflight.apple.com/join/QkqB2Npv" target="_blank" rel="noopener noreferrer">Join the QSO One TestFlight beta ↗</a>.</li><li>An internet connection and a working microphone and speaker or headset.</li></ul>
<h3>Installation steps</h3>
<ol><li>Open the QSO One TestFlight invitation on your Mac while signed in with the Apple Account you want to use.</li><li>Accept the invitation and install TestFlight if it is not already installed.</li><li>Open the QSO One listing in TestFlight and install the available beta build.</li><li>Launch QSO One from TestFlight, Launchpad or Applications.</li><li>Allow microphone access when macOS asks for permission.</li><li>Check the selected microphone and speaker before connecting to a network.</li></ol>
<h3>Audio and push-to-talk</h3>
<p>For your first test, use the Mac's built-in microphone and speakers or a wired headset. Confirm that receive audio works, then make a short test transmission when appropriate. Start with the on-screen PTT control before configuring external buttons or specialist audio equipment. Keyboard shortcuts and accessory support can vary by build and device, so check the controls in your installed version.</p>
<div class="guide-callout"><strong>Beta updates:</strong> install Apple beta updates through TestFlight. A new iPhone or iPad build does not necessarily appear on Mac at exactly the same time. If the invitation reports that the beta is unavailable or full, check the current TestFlight listing and official QSO One announcements.</div>`
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
        html: `<ol><li>Allow microphone permission.</li><li>Select the correct microphone and speaker or headset.</li><li>Lower the microphone level if reports say your audio is distorted.</li><li>Receive and listen before transmitting.</li><li>Use headphones if you hear echo or feedback.</li></ol><p>If audio fails, close other voice applications temporarily to check for microphone contention. Some Windows applications can share an input; exclusive access settings can prevent this.</p>`
      },
      {
        id: "audio-hardware",
        title: "Audio equipment, speaker microphones and PTT",
        html: `<p>QSO One can be used with built-in audio, wired headsets, Bluetooth devices, speaker microphones and compatible external push-to-talk controls. Compatibility depends on the operating system, app version, accessory model and connection method. Test each accessory rather than assuming every button or microphone function is supported.</p>
<h3>Wired headsets and microphones</h3>
<ul><li>Connect the headset before starting or reconnecting to QSO One.</li><li>Check that the operating system and app are using the intended microphone and audio output.</li><li>Test received audio, microphone audio and PTT separately.</li><li>If using an adapter, check that it supports the required microphone connection as well as headphones.</li></ul>
<h3>Bluetooth headsets and earbuds</h3>
<ul><li>Pair the headset with your device and check the selected input and output routes.</li><li>Test receiving and transmitting. Some Bluetooth devices change audio quality or routing when their microphone becomes active.</li><li>If audio stops after reconnecting, check the device's Bluetooth settings and select the headset again in the app if necessary.</li><li>For full-duplex operation, test the exact headset, device and network combination. Behaviour can differ between operating systems and accessories.</li></ul>
<h3>Speaker microphones</h3>
<p>A speaker microphone may provide working receive audio and microphone input without its physical PTT button being recognised. TidRadio speaker-microphone support was introduced in an earlier QSO One release, but that does not mean every model, connector or hardware revision has identical support. Check the current release notes and test your particular accessory.</p>
<h3>External PTT buttons</h3>
<ol><li>First confirm that the on-screen PTT control works.</li><li>Connect or pair the external button using the accessory manufacturer's instructions.</li><li>Check the app's available PTT or accessory settings.</li><li>Test both pressing and releasing the button. Confirm that transmission stops immediately when released.</li></ol>
<p>If an external button appears stuck or does not release PTT correctly, disconnect it and use the on-screen control while troubleshooting.</p>
<h3>Microphone level and received volume</h3>
<p>Speak at a consistent distance from the microphone. Reduce microphone gain if your audio clips or distorts, and adjust receive volume to a comfortable level. Headphones can help prevent speaker audio feeding back into the microphone. Change one setting at a time so you can identify what improves the result.</p>
<div class="guide-callout"><strong>Compatibility reminder:</strong> support can change between QSO One releases and accessory revisions. When reporting a problem, include the device model, operating-system version, app version and exact microphone or PTT model.</div>`
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
        id: "network-setup",
        title: "Connect with DMR, System Fusion or M17",
        html: `<h3>DMR: choose the network as well as the talkgroup</h3><p>QSO One supports more than BrandMeister and TGIF. The developer’s release notes confirm the following DMR network choices as checked on 6 October 2026:</p><ul><li><strong>BrandMeister</strong></li><li><strong>TGIF</strong></li><li><strong>FreeDMR</strong> — introduced as experimental support.</li><li><strong>System X (FreeSTAR)</strong> — introduced as experimental support in version 4.0.4.</li><li><strong>AmComm</strong> — introduced as experimental support in version 4.0.4.</li><li><strong>VKDMR (Australia)</strong> — introduced as experimental support in version 4.0.4.</li><li><strong>DMR+</strong> — introduced as experimental support in version 4.1.1.</li><li><strong>ADN Systems</strong> — introduced as experimental support in version 4.1.1, including live Last Heard.</li></ul><div class="guide-callout"><strong>Keep the app current:</strong> experimental networks may have limitations. Check the current network picker and <strong>What’s new</strong> in your installed version. The official website’s older two-network description does not include all of these release additions.</div><ol><li>Obtain your own approved DMR ID from RadioID.</li><li>Open DMR and select the network you want to use.</li><li>Complete that network’s login card with your DMR ID and the credentials it requests. Password requirements differ between networks; your QSO One password is not automatically the network password.</li><li>Choose an available server and the intended talkgroup. Check that network’s talkgroup directory rather than assuming a number has the same meaning on every network.</li><li>Connect, confirm the destination and listen. Use Last Heard or Active Now where the selected network provides them; a live feed is not available on every network.</li><li>Make a short identified transmission when clear, then release PTT and listen for a reply.</li></ol><p>A matching talkgroup number on two networks does not automatically join the same conversation. Any bridge between them depends on the network operators.</p><h3>System Fusion (YSF)</h3><p>Select System Fusion, use your licensed callsign and choose a YSF reflector from the directory. Save favourites and connect before using PTT. Where the reflector uses DG-ID groups, check your transmit and receive DG-ID settings so you send to and hear the intended group. YSF reflector access does not mean every WIRES-X room is directly available.</p><h3>M17</h3><p>Select M17, choose a reflector and module, then connect and listen before transmitting. Your callsign identifies you; QSO One’s M17 connection does not require a separate network registration. M17 uses the open Codec 2 voice codec. Check the module because different modules may carry different conversations.</p>`
      },
      {
        title: "Useful current features",
        html: `<p>Beyond making a connection, QSO One includes tools to help you find activity and keep track of contacts:</p><ul><li><strong>Directories and favourites:</strong> search destinations and save the ones you use regularly.</li><li><strong>DMR activity:</strong> browse talkgroups and view supported live activity feeds. On networks with a live feed, tapping a Last Heard station can take you to its talkgroup. Scanning is network-dependent; check the controls available for your selected network.</li><li><strong>Net Finder:</strong> browse nets and connect to supported destinations. Version 4.1.1 added DMR+ and System X net entries.</li><li><strong>QSO logging:</strong> keep contact records and export ADIF for another logbook. Review imported contacts and record the actual internet/network path accurately.</li><li><strong>Callsign lookup:</strong> view available operator details from a callsign; the information depends on the underlying database.</li><li><strong>Received-audio recording:</strong> save received audio when enabled, with retention settings and starred recordings.</li><li><strong>PTT and audio:</strong> use the on-screen button, Windows spacebar, or compatible Bluetooth, BLE and PoC PTT hardware. Adjust your microphone and receive levels; automatic receive levelling helps with varying audio levels.</li><li><strong>Android background sessions:</strong> a foreground service keeps a connection running while switching apps or locking the screen. Reconnection logic helps when the network changes; check battery settings if your device stops the app.</li></ul><p>Features and hardware behaviour can vary with the app version, device and network. Start with the on-screen PTT button before configuring an external microphone or button.</p>`
      },
      {
        title: "Troubleshooting checklist",
        html: `<ul><li>Confirm your callsign validation or DMR ID approval is complete.</li><li>Check microphone permission and selected audio devices.</li><li>Verify the node number, talkgroup or destination.</li><li>Re-enter private credentials carefully without sharing them.</li><li>Try receive-only first and then one short transmission.</li><li>Check whether the network itself is online before assuming the app is at fault.</li><li>Update QSO One and check the release notes for your platform.</li><li>Send a detailed in-app bug report or contact support if the problem persists.</li></ul>
<h3>Incoming AllStar connections</h3><p>If another AllStar node cannot connect to your QSO One Node Mode station, check <strong>Manage → Block all incoming connections</strong> and make sure blocking is turned off. Then check <strong>Settings → Connection</strong> and confirm the configured listening port. If you are using the usual IAX port, that is commonly <strong>UDP 4569</strong>.</p><p>On a home router, forward the matching <strong>UDP</strong> port to the phone or computer's current local IP address. A DHCP reservation helps keep that address from changing. A TCP-only rule will not provide the required UDP forwarding. Router menus differ, so check the router's own instructions.</p><p><strong>Important:</strong> port forwarding may still fail if your internet provider uses carrier-grade NAT (CGNAT), because your router does not have a directly reachable public IPv4 address. Ask your ISP whether you have a public IPv4 address and whether inbound UDP is allowed. A VPN or 44net route is an advanced alternative and needs correct routing and firewall rules; it is not a simple port-forwarding substitute. On cellular connections, ordinary inbound port forwarding is generally not available, so use a supported connection method such as WT mode where appropriate.</p>
<h3>Testing from the same Wi-Fi network</h3><p>If the calling AllStar node and your QSO One device are on the same home network, testing against your public IP can fail on routers that do not support NAT loopback (also called hairpin NAT). Try from a genuinely external connection, such as switching the phone to cellular, or use the correct local-network route if your setup supports it. A failed ping is not conclusive: many routers and mobile networks block ping even when the required service is reachable.</p>
<h3>DMR login details</h3><p>For a DMR network that requires credentials, open <strong>Settings → Account</strong>, choose <strong>Edit</strong> beside DMR, enter the ID and network-specific login details, then scroll down and press <strong>Save</strong>. The required password depends on the selected DMR network. It may be different from your QSO One account password or your hotspot password.</p>
<h3>TGIF will not connect</h3><p>Check whether TGIF is experiencing an outage before changing QSO One settings. If you use a hotspot, fully power it off and restart it; closing the hotspot app or disconnecting from its screen may not stop the hotspot itself from maintaining a session. Then test again, and if possible compare with another network or a cellular connection. If other DMR networks work while TGIF does not, the issue may be specific to TGIF or its account/session rather than QSO One.</p>
<h3>Beacon stops when the screen turns off</h3><p>First update to the latest QSO One release available for your device. On Android, check the phone's battery optimisation and background-app settings for QSO One, especially on rugged or PoC devices. Some manufacturers apply aggressive power management even when the app is allowed to run in the background. If the problem continues, report the device model, Android version and exact steps to reproduce it.</p>
<h3>Report problems accessibly</h3><p>If you cannot reach the in-app bug-report control—for example, because a screen-reader user cannot navigate that part of Settings—contact <a href="mailto:support@qso1.net">QSO One support by email</a> or use the <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">official support page</a>. Include the app version, device, operating-system version, network, destination and steps to reproduce. Never include passwords or private credentials.</p>`
      },
      {
        title: "Good linked-network operating",
        html: `<p>Pause after keying, keep early transmissions short, and leave a gap between overs. Large talkgroups and linked nodes can cover many repeaters or users, so listen carefully and avoid long tests on busy destinations.</p><div class="radio-example"><small>FIRST CALL</small><pre>ZL3TOM listening through QSO One.</pre></div>`
      }
      ,{
        id: "iax-settings",
        title: "IAX Direct: what goes in each field",
        html: `<p>Ask the server operator for authorised connection details, then open <strong>Networks → IAX Direct → Add Credential</strong>. Do not substitute your website or AllStar portal password.</p><ul><li><strong>Host and port:</strong> the server address and port provided by its owner; the usual IAX port is 4569.</li><li><strong>Node number:</strong> the destination node hosted on that server which you are permitted to access.</li><li><strong>Username and password:</strong> the exact IAX account name and secret, including capitalisation.</li><li><strong>Caller ID name:</strong> use your callsign. If left empty, the app can use your AllStar account callsign; make sure an identity is available.</li><li><strong>Called context:</strong> normally <code>iaxrpt</code>, unless the operator supplies another value.</li></ul><p>An authentication failure usually points to incorrect credentials. A connection that immediately drops can indicate a wrong node, context or server dialplan. Ask the operator to check their configuration rather than repeatedly guessing passwords.</p>
<h3>For AllStar node operators</h3>
<p>On a standard AllStarLink 3 (ASL3) installation, the supplied <code>iaxrpt</code> configuration is normally ready for IAX Direct. The operator generally creates a separate user entry in <code>/etc/asterisk/custom/iax/iaxrpt-users.conf</code>, assigning a unique username and strong secret, then reloads IAX with:</p>
<pre><code>asterisk -rx "iax2 reload"</code></pre>
<p>The standard ASL3 dialplan can route the user to nodes hosted on that server, so a custom dialplan entry is usually unnecessary. Check the actual server configuration before making changes.</p>
<p>HamVOIP and older ASL2 installations may need a manually configured IAX user and a matching dialplan entry for each permitted node. The Called Context entered in QSO One must match the server-side context. QSO One supports IAX2 call tokens; ASL3 operators do not need to disable call-token security for QSO One.</p>
<div class="guide-callout"><strong>Official step-by-step IAX Direct setup</strong><p>The developer's guide covers ASL3, HamVOIP and legacy ASL2 server configuration, the fields to enter in QSO One and common connection errors.</p><p><a href="https://qso1.net/guides/iax-direct" target="_blank" rel="noopener noreferrer">Read the official IAX Direct setup guide ↗</a></p></div>`
      },
      {
        id: "audio-help",
        title: "Audio troubleshooting on Windows and Android",
        html: `<p>Separate receiving from transmitting: can you hear others, and can they hear you? Test on a quiet destination with someone who can give a report.</p><ul><li><strong>No received audio:</strong> check device volume, QSO One’s receive level or mute control, and the selected output. Confirm there is actually activity on the destination. For EchoLink, try the available proxy controls if direct networking fails.</li><li><strong>Others cannot hear you:</strong> check microphone permission, the selected input and whether PTT indicates transmission. On Windows, check system microphone access and choose your actual microphone rather than a loopback input such as Stereo Mix.</li><li><strong>Distorted audio:</strong> reduce input gain, move slightly away from the microphone and ask for another report. A louder signal is not necessarily clearer.</li><li><strong>Echo or feedback:</strong> use headphones and avoid playing received audio back into the microphone.</li><li><strong>Bluetooth trouble:</strong> reconnect the headset and recheck the input/output after changing routes. Bluetooth audio and external PTT compatibility varies by device and app version. Temporarily use the built-in speaker/microphone or a wired headset to isolate the problem.</li><li><strong>Audio stops after switching devices:</strong> disconnect and reconnect the network after selecting the intended audio route. Close other audio apps temporarily if they are holding the microphone.</li></ul><p>Automatic receive levelling can help when stations have different volumes. It cannot repair a poor microphone, clipping or an incorrect audio route.</p>`
      },
      {
        id: "ptt-help",
        title: "PTT buttons, timeouts and background sessions",
        html: `<p>Learn on-screen PTT first. On Windows the spacebar is also supported; check the app’s focus and key behaviour before transmitting. Compatible Bluetooth, BLE and PoC buttons can make operation easier, but verify your particular hardware with the current app instructions.</p><ol><li>Connect to a quiet destination and listen.</li><li>Make a short identified test using on-screen PTT.</li><li>Configure your external button and confirm both key-down and release work.</li><li>Check that transmission stops when you release the button. If it stays keyed, use the on-screen control or disconnect immediately.</li></ol><p>Respect the app and network transmit timeout. Keep overs short and leave a gap; a timeout is a safeguard, not a target transmission length. Avoid enabling volume-key PTT until you know how it behaves with your device.</p><p>On Android, microphone permission is needed for voice. Allow session notifications when requested so you can see an active connection. If connections stop with the screen locked, check QSO One’s battery and background restrictions using your phone’s settings. Keep a visible way to stop transmission when using an external button.</p>`
      },
      {
        title: "Finding nets, logging contacts and replaying audio",
        html: `<p><strong>Net Finder</strong> helps you discover scheduled amateur-radio nets and supported connection destinations. Check the listed time zone, schedule and network before joining; a listing does not guarantee the net is active today. Listen for net control’s instructions before checking in.</p><p><strong>On the Net (QSO One 4.2.5):</strong> plan a net ahead by searching for and selecting it from Net Finder. Net Control becomes available automatically when the scheduled net starts. Listed nets use their Net Finder link; newly created nets receive a custom link you can share with participants.</p><p><strong>Net Runner</strong> provides tools for helping run a net, including roster, session and transcription functions. Check the installed app’s help and release notes for the controls available in your version before relying on it during a live net. Review any automatically recognised callsign against what the operator actually said.</p><p>Use QSO logging for a callsign, time, destination and useful notes, and export ADIF when moving records to another logbook. Record the actual network path; an internet conversation should not be entered as an RF band contact simply because a linked repeater was involved.</p><p>Received-audio recording can help you review a missed callsign or exchange. Check recording, retention and starred-recording settings. Do not assume muting playback disables recording or transcription. Tell participants when you plan to record or transcribe a net, and check the applicable rules before sharing audio.</p>`
      },
      {
        id: "privacy-settings",
        title: "Permissions and privacy: choose deliberately",
        html: `<p>Review the <a href="https://qso1.net/privacy">official QSO One privacy policy</a> and the permissions shown by your installed app. As described in the policy dated 25 September 2026:</p><ul><li>Optional network credential syncing is off until enabled; saved passwords are encrypted.</li><li>QSO log entries are backed up to your account and synced between signed-in devices.</li><li>Connection diagnostics include network and destination information. You can disable the identifying account/callsign component in Settings; anonymous activity is still recorded.</li><li>Android M17 location sharing is optional and off initially.</li><li>The microphone stays open while connected. The policy says untransmitted microphone audio is discarded.</li><li>Bug reports include logs, identity, device details and network information, including IP addresses.</li></ul><p>If a hardware PTT setup asks you to enable an Android accessibility service, read its disclosure and confirm it is needed for that button. This permission does not certify screen reader accessibility. Keep passwords, credentials and private logs out of public screenshots and forum posts.</p>`
      },
      {
        id: "accessible-use",
        title: "Using QSO One with a screen reader or limited mobility",
        html: `<p>Using an app can reduce the need to handle a radio, but accessibility depends on the app version, device and assistive technology. Try Windows Narrator or NVDA, or Android TalkBack, with the actual installed app.</p><ul><li>Before transmitting, test whether you can identify and activate sign-in, network selection, destination selection, connect, PTT and disconnect controls.</li><li>Check how your screen reader announces connected, receiving and transmitting states. Do not rely on colour alone.</li><li>Verify how to release PTT and disconnect using your keyboard, touch gestures or switch device.</li><li>Use favourites to reduce repeated directory navigation. A compatible external PTT button may help with reach or dexterity after its release behaviour has been tested.</li><li>Try system text scaling, magnification and contrast settings. Report clipped text or unlabelled controls with the app version and screen reader name.</li></ul><p>This written guide provides an alternative to the demonstration video. See my <a href="/guides/accessible-amateur-radio">accessible amateur radio guide</a> for more ways to adapt an operating station.</p>`
      },
      {
        id: "support-report",
        title: "Checking updates and reporting a useful problem",
        html: `<p>QSO One is updated through the official store, TestFlight, download site or updater used for your installation. Check the version and build number in the app's information screen, then read the release notes for that platform. Features and fixes can arrive at different times across Android, Windows and Apple builds.</p><p>If a problem persists, use <strong>Settings → Send Bug Report</strong> when it is available in your build, or contact <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">official QSO One support</a>. Include:</p><ul><li>App version/build, operating-system version and device model.</li><li>The network and destination, and whether receiving, transmitting or both are affected.</li><li>Microphone, speaker/headset and external PTT device in use.</li><li>The exact steps to reproduce the issue, what you expected and what actually happened.</li><li>Whether it also happens with on-screen PTT and the built-in audio devices.</li><li>Any error message, with passwords and private account details removed.</li></ul><p>Review the <a href="https://qso1.net/privacy" target="_blank" rel="noopener noreferrer">QSO One privacy policy</a> before sending diagnostics. Logs help the developer see what the app did, but they do not explain what you were trying to do. A clear description makes a bug report much more useful.</p>`
      },
      {
        id: "community-troubleshooting",
        title: "Common connection problems and community tips",
        html: `<p>These practical checks address recurring questions raised by QSO One users. Menu names and behaviour can vary by platform and release, so use the current app version as your reference.</p>
<h3>Allow incoming AllStar connections</h3>
<p>For a QSO One station using <strong>Node Mode</strong>, open <strong>Manage</strong> and check that <strong>Block all incoming connections</strong> is turned off. Then open <strong>Settings → Connection</strong> and confirm the listening port. If you are using the usual IAX port, it is commonly <strong>UDP 4569</strong>.</p>
<p>On a home router, forward the matching <strong>UDP</strong> port to the device's local IP address. A DHCP reservation can stop that address changing. A TCP-only forwarding rule is not sufficient for UDP traffic. Also check that the device firewall allows the app to receive connections.</p>
<div class="guide-callout"><strong>CGNAT can prevent incoming connections:</strong> even a correctly configured router port-forward will not make your device reachable if your ISP places your connection behind carrier-grade NAT. Ask your ISP whether you have a public IPv4 address and whether inbound UDP is permitted. Cellular connections generally do not offer ordinary inbound port forwarding; consider a supported alternative such as WT mode where the destination supports it. VPN/44net routing is an advanced setup requiring correct firewall and routing configuration.</div>
<h3>Calling from the same Wi-Fi network</h3>
<p>If the AllStar node and QSO One device are on the same LAN, a connection made to your public IP may fail on routers without NAT loopback (hairpin NAT). Test from a genuinely external network, such as cellular data, or use the correct local route for your setup. A failed ping to a public IP is not proof that the IAX service is unreachable, because ping is often blocked independently.</p>
<h3>Enter DMR network credentials</h3>
<p>Open <strong>Settings → Account</strong>, select <strong>Edit</strong> beside DMR, enter your DMR ID and the credentials required by the selected network, then scroll down and press <strong>Save</strong>. Network passwords are not necessarily the same as your QSO One account password or hotspot password.</p>
<h3>TGIF connection problems</h3>
<p>Check whether TGIF itself is experiencing an outage before changing app settings. If you use a hotspot, fully power it off and restart it; closing an app or disconnecting from its interface may not stop the hotspot from maintaining a session. Then retry and, if possible, compare with another DMR network or a cellular connection. If other networks work but TGIF does not, the issue may be specific to TGIF or its account/session.</p>
<h3>Beacon rooms and favourites</h3>
<p>In QSO One, <strong>My Rooms</strong> is available from the app's <strong>Menu</strong>. Open it to manage or create your own Beacon room. To remove a room or net from a favourites list, tap its filled <strong>star</strong> again. Menu placement can change between releases.</p>
<h3>Beacon disconnects when the screen turns off</h3>
<p>Update QSO One first. On Android, check battery optimisation and background-app restrictions for QSO One, particularly on rugged and push-to-talk devices where manufacturers may apply aggressive power saving. If it still disconnects, report the device model, Android version and steps to reproduce.</p>
<h3>When you cannot submit an in-app bug report</h3>
<p>If an accessibility issue prevents you reaching the report control, contact <a href="mailto:support@qso1.net">QSO One support by email</a> or use the <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">official support page</a>. Include your app version, device, operating-system version, network, destination and reproduction steps. Do not send passwords or private credentials.</p></details>
`
      },
      {
        id: "qso-one-community",
        title: "Join the QSO One community",
        html: `<p>Connect with other QSO One users, ask questions, share feedback and follow community discussions through these channels:</p>
<ul>
<li><a href="https://discord.gg/4N6Wc3fsEv" target="_blank" rel="noopener noreferrer"><strong>QSO One Discord community</strong></a> — community chat, questions and support.</li>
<li><a href="https://www.facebook.com/groups/1483876283506992" target="_blank" rel="noopener noreferrer"><strong>QSO One Facebook group</strong></a> — connect with other users and discuss the app.</li>
<li><a href="https://www.reddit.com/r/QSOone/" target="_blank" rel="noopener noreferrer"><strong>QSO One on Reddit</strong></a> — discussions, questions and release announcements.</li>
</ul>
<p>For official help with account or technical problems, also see <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">QSO One support</a>.</p>`
      },
      {
        id: "qso-one-faq",
        title: "QSO One frequently asked questions",
        html: `
<style>
.qso-faq-item{margin:0 0 .8rem;border:1px solid #cbd5e1;border-radius:10px;background:#fff;overflow:hidden}
.qso-faq-item summary{cursor:pointer;padding:1rem 1.2rem;font-weight:700;color:#173b32;background:#f1f5f9;list-style:none}
.qso-faq-item summary::-webkit-details-marker{display:none}
.qso-faq-item summary::after{content:"+";float:right;font-size:1.25rem;font-weight:700}
.qso-faq-item[open] summary::after{content:"−"}
.qso-faq-item summary:focus-visible{outline:3px solid #2563eb;outline-offset:-3px}
.qso-faq-answer{padding:.2rem 1.2rem 1rem}
.qso-faq-answer p{margin-bottom:0}
</style>
<details class="qso-faq-item"><summary>Can I install QSO One on a Mac?</summary><div class="qso-faq-answer"><p>The Mac version is not yet publicly released. Mac users can continue using the <a href="https://testflight.apple.com/join/QkqB2Npv" target="_blank" rel="noopener noreferrer">QSO One TestFlight beta</a> until the Mac release is available. See <a href="#mac-install">Install and use QSO One on Mac</a> for the steps and audio setup advice.</p></div></details>
<details class="qso-faq-item"><summary>How do I install QSO One on iPhone or iPad?</summary><div class="qso-faq-answer"><p>Install the public release from the <a href="https://apps.apple.com/app/id6826741189" target="_blank" rel="noopener noreferrer">Apple App Store</a>. If you previously used TestFlight on iPhone or iPad, install the App Store version. Mac users should remain on TestFlight until the Mac release is available.</p></div></details>
<details class="qso-faq-item"><summary>Is QSO One available for Android and Windows?</summary><div class="qso-faq-answer"><p>Yes. Download it from <a href="https://play.google.com/store/apps/details?id=com.qsoone.qso_one" target="_blank" rel="noopener noreferrer">Google Play</a> or the <a href="https://apps.microsoft.com/detail/9NRWFPGK3L3W" target="_blank" rel="noopener noreferrer">Microsoft Store</a>.</p></div></details>
<details class="qso-faq-item"><summary>Can I use Bluetooth headsets and speaker microphones?</summary><div class="qso-faq-answer"><p>Many audio devices can be used, but microphone, speaker and physical PTT-button compatibility varies. See <a href="#audio-hardware">Audio equipment, speaker microphones and PTT</a> and test your exact accessory.</p></div></details>
<details class="qso-faq-item"><summary>How does full-duplex AllStar audio work on mobile?</summary><div class="qso-faq-answer"><p>Audio behaviour depends on the device, operating system, app build and connected accessories. Headphones or earbuds can help prevent received audio feeding back into the microphone. Do not assume every Bluetooth speaker microphone supports every full-duplex arrangement. Test your setup before relying on it.</p></div></details>
<details class="qso-faq-item"><summary>How do I connect to a DMR talkgroup?</summary><div class="qso-faq-answer"><p>Select DMR, choose the network you are registered with, enter the credentials required by that network and select the intended talkgroup. See <a href="#network-setup">Connect with DMR, System Fusion or M17</a>.</p></div></details>
<details class="qso-faq-item"><summary>How do I connect to EchoLink or AllStar?</summary><div class="qso-faq-answer"><p>Use your validated EchoLink account or authorised AllStar connection details, search for the destination and listen before transmitting. See <a href="#network-setup">the network setup sections</a> and <a href="#iax-settings">IAX Direct settings</a>.</p></div></details>
<details class="qso-faq-item"><summary>How do I find or schedule a net?</summary><div class="qso-faq-answer"><p>Use Net Finder to search for nets and check their time, network and joining instructions. A scheduled listing does not guarantee that a net is currently active. Follow the instructions shown for the particular listing.</p></div></details>
<details class="qso-faq-item"><summary>Where can I use Beacon?</summary><div class="qso-faq-answer"><p>Beacon is available in the QSO One app and through <a href="https://qso1.net/beacon" target="_blank" rel="noopener noreferrer">the Beacon website</a>. In the app, open Menu → My Rooms to manage your rooms.</p></div></details>
<details class="qso-faq-item"><summary>Where can I get help or report a problem?</summary><div class="qso-faq-answer"><p>Use the in-app bug-report option when available or visit <a href="https://qso1.net/support" target="_blank" rel="noopener noreferrer">official QSO One support</a>. Include your app version, device, operating-system version and clear steps to reproduce the issue. Never include passwords or private credentials.</p></div></details>`
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
      ["QSO One IAX Direct setup", "https://qso1.net/guides/iax-direct"],
      ["QSO One privacy policy", "https://qso1.net/privacy"],
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
    ["Live Monitor", "/radio-activity", "activity"],
    ["Radio Audio", "/radio-audio", "audio"],
    ["Guides", "/guides", "guides"],
    ["Tools", "/tools", "tools"],
    ["Community", "/community", "community"],
    ["QSL", "/qsl", "qsl"],
    ["Contact", "/contact", "contact"]
  ].map(([label, href, key]) => `<a href="${href}"${key === current ? ' aria-current="page"' : ""}>${label}</a>`).join("");

  return `<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header"><div class="site-container nav-wrap">
  <a class="brand" href="/"><span class="brand-icon">${radioIcon}</span><span><strong>ZL3TOM</strong><small>Amateur Radio</small></span></a>
  <button class="menu-button" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span aria-hidden="true">☰</span></button>
  <nav id="main-navigation" class="main-nav" aria-label="Main navigation">${links}<a class="nav-qrz" href="https://qrz.com/db/ZL3TOM" target="_blank" rel="noreferrer">View ZL3TOM on QRZ <span aria-hidden="true">↗</span></a></nav>
</div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="site-container footer-grid"><div><strong>ZL3TOM</strong><p>Thomas Bernard · ZL3TOM / ZL3KY<br>Christchurch, New Zealand</p></div><div><strong>Quick links</strong><a href="/guides">Guides</a><a href="/tools">Tools</a><a href="/qsl">QSL</a></div><div><strong>Contact</strong><a href="/contact">Contact</a><a href="https://www.qrz.com/db/ZL3TOM" target="_blank" rel="noopener noreferrer">QRZ ↗</a><a href="https://www.facebook.com/zl3tom" target="_blank" rel="me noopener noreferrer">ZL3TOM on Facebook ↗</a></div></div><p class="accessibility-footer-link"><a href="/guides/accessible-amateur-radio#using-this-website">Accessibility and website feedback</a></p></footer>`;
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
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-B4BJQE9ET1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-B4BJQE9ET1');
  </script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="keywords" content="${escapeAttribute(keywords)}">
  <meta name="author" content="Thomas Bernard — ZL3TOM">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="me" href="https://www.facebook.com/zl3tom">
  <link rel="stylesheet" href="/accessibility.css?v=20261006">
  <link rel="stylesheet" href="/style.css?v=20260904-fullfix1">
  <link rel="stylesheet" href="/site-extras.css?v=20260904-fullfix1">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="${type}">
  <meta property="og:locale" content="en_NZ">
  <meta property="og:site_name" content="ZL3TOM Amateur Radio">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://zl3tom.com/social-preview.png">
  <meta property="og:image:secure_url" content="https://zl3tom.com/social-preview.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="ZL3TOM amateur radio website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="https://zl3tom.com/social-preview.png">
  <meta name="twitter:image:alt" content="ZL3TOM amateur radio website">
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
        about: ["Amateur radio", guide.title],
        keywords: guide.keywords
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
  const sections = guide.sections.map((section, index) => `<section class="guide-section"><span class="section-number">${String(index + 1).padStart(2, "0")}</span><div><h2${section.id ? ` id="${section.id}"` : ""}>${section.title}</h2>${section.html}</div></section>`).join("\n");
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
<main id="main" tabindex="-1">
  <section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div class="page-icon">${bookIcon}</div><div><p class="section-kicker">ZL3TOM beginner guide</p><h1>${guide.title}</h1><p>${guide.description}</p></div></div></section>
  <section class="inner-section light"><div class="site-container article-layout">
    <article class="article-content">
      <a class="back-link" href="/guides">← All guides</a>
      ${guide.contentsHtml ? `${guide.contentsHtml}\n      ` : ""}${sections}
      <section class="guide-sources" aria-labelledby="official-sources"><h2 id="official-sources">Official sources</h2><p>Software and network details change. Check these official pages before installing or entering account information.</p><ul>${sources}</ul></section>
      <section class="related-guides" aria-labelledby="related-guides"><h2 id="related-guides">Related guides</h2><div>${related}</div></section>
      <footer class="guide-byline"><p><strong>Written by Thomas Bernard — ZL3TOM</strong></p><p>Last updated: <time datetime="${guide.updatedIso ?? updateIso}">${guide.updatedDisplay ?? updateDisplay}</time></p><p class="accessibility-footer-link"><a href="/guides/accessible-amateur-radio#using-this-website">Accessibility and website feedback</a></p></footer>
    </article>
    <aside class="article-aside"><strong>${guide.asideTitle}</strong>${guide.asideHtml}</aside>
  </div></section>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</main>
${footer()}
${personSchema()}
<script src="/script.js?v=20261006-accessibility" defer></script>
<script src="/accessibility.js?v=20261006" defer></script>
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

// The main Guides index is maintained separately.
// Do not overwrite public/guides.html or public/guides/index.html here.

console.log(`Generated ${generatedGuides.length} individual guide pages. The main Guides index was left untouched.`);
