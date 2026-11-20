import DroneImage from "../assets/Images/Projects/AutoBalancingDrone.webp";
import MathsWebsiteImage from "../assets/Images/Projects/MathsWebsite.webp";
import EWasteWebsiteImage from "../assets/Images/Projects/EWasteWebsite.webp";
import WiAttendImage from "../assets/Images/Projects/WiAttendImage.webp";
import SmartHomeImage from "../assets/Images/Projects/SmartHomeImage.webp";
import InvoiceWebsiteImage from "../assets/Images/Projects/InvoiceWebsiteImage.webp";
import RishtaWebsiteImage from "../assets/Images/Projects/RishtaWebsite.gif";
import PaySlipProImage from "../assets/Images/Projects/PaySlipProImage.webp";
import AutoVoyageImage from "../assets/Images/Projects/AutoVoyage.webp";
import InputLeafImage from "../assets/Images/Projects/InputLeaf.webp";
import { blocksFromPlainText } from "../lib/blocksFromPlainText.js";

/**
 * Projects are displayed in ascending `sortOrder` — index 0 is the oldest
 * entry on the constellation, higher indices walk forward in time.
 *
 * `image` is the real screenshot (shown in the case study). `thumb` is the
 * engraved atlas plate (star-map card, Work index, case-study hero), wired
 * up by slug at the bottom of this file. `caseStudy` is optional long-form.
 *
 * @type {import('./content.types.js').Project[]}
 */
export const projects = [
  {
    name: "Maths Website",
    slug: "maths-website",
    tagline: "Statistics tables without the tedium.",
    description:
      "A website that takes the tedium out of statistics. Enter the values of Xi and Fi and get complete tables for mean, median, mode, correlation coefficient and more.",
    body: blocksFromPlainText(
      "Enter Xi and Fi — get mean, median, mode, correlation tables instantly.\n\nFocused UX for students working through statistics coursework.",
    ),
    image: MathsWebsiteImage,
    link: "https://math-app-anasvhora284.netlify.app/",
    year: 2023,
    sortOrder: 0,
    featured: false,
    roles: ["Frontend"],
    stack: ["React", "JavaScript"],
  },
  {
    name: "E-Waste Facility Locator",
    slug: "e-waste-facility-locator",
    tagline: "Rewards for responsible e-waste.",
    description:
      "A platform that rewards people for recycling their e-waste. Users and facilities each get a dashboard to submit, manage and track e-waste with full history, plus an admin side for oversight. Built on the MERN stack.",
    body: blocksFromPlainText(
      "User and admin dashboards for tracking e-waste submissions and facility workflows.\n\nBuilt with the MERN stack — full-stack product thinking.",
    ),
    image: EWasteWebsiteImage,
    link: "https://github.com/anasvhora284/E-Waste-Facility-Locator",
    repoUrl: "https://github.com/anasvhora284/E-Waste-Facility-Locator",
    year: 2023,
    sortOrder: 1,
    featured: true,
    roles: ["Full-stack"],
    stack: ["MongoDB", "Express", "React", "Node.js"],
  },
  {
    name: "Wi-Attend: UI/UX",
    slug: "wi-attend",
    tagline: "WiFi-bounded attendance — hackathon Figma.",
    description:
      "A hackathon Figma design for a WiFi-based college attendance app. Students can mark attendance only when connected to the same WiFi or hotspot as the faculty, with face unlock and a session PIN as extra authentication layers.",
    body: blocksFromPlainText(
      "Hackathon UI/UX for WiFi-bound attendance: same-network check, face unlock, session PIN.\n\nDelivered as a structured Figma prototype.",
    ),
    image: WiAttendImage,
    link: "https://www.figma.com/design/HJxqXuckKDyq9y9ol6YsDf/Attendance_App?node-id=0-1&t=TbYnk9MhcZqhobVk-0",
    year: 2023,
    sortOrder: 2,
    featured: false,
    roles: ["UI/UX"],
    stack: ["Figma", "Product design"],
  },
  {
    name: "Matrimony PWA",
    slug: "matrimony-pwa",
    tagline: "Community matchmaking on the web.",
    description:
      "A matchmaking PWA for the Vhora 68 community. A relative kept candidate profiles in Excel; my brother Ayaz and I turned that into a clean, filterable website. Same stack as the Invoice Generator: React, Vite, Google Apps Script, Excel and MUI.",
    body: blocksFromPlainText(
      "A PWA for the Vhora 68 Rishta community — profiles and filtering from spreadsheet-backed data.\n\nSame stack as Invoice Generator: React, Vite, Google Script, Excel, MUI.",
    ),
    image: RishtaWebsiteImage,
    link: "https://rishta-group-68-samaj.netlify.app/filter",
    year: 2024,
    sortOrder: 3,
    featured: true,
    roles: ["Frontend"],
    stack: ["React", "Vite", "PWA", "MUI"],
  },
  {
    name: "Auto-Balancing Drone",
    slug: "auto-balancing-drone",
    tagline: "Custom flight control with MPU6050.",
    description:
      "A drone without an off-the-shelf flight controller, flown from a phone. Built with an Arduino Uno, NodeMCU, ESCs, 1800KV motors and an MPU-6050, running MultiWii as the flight controller with a WiFi PPM link.",
    body: blocksFromPlainText(
      "Hand-built auto-balancing drone: Arduino Uno, NodeMCU, ESCs, MPU-6050, MultiWii, WiFi PPM from a phone.\n\nPID-style stability without an off-the-shelf flight controller.",
    ),
    image: DroneImage,
    link: "https://drive.google.com/file/d/1vhhIyUH0XxMhNC_BbDJC0rcZ0ZbUsPB6/view",
    year: 2022,
    sortOrder: 4,
    featured: false,
    roles: ["IoT", "Embedded"],
    stack: ["Arduino", "C++", "IoT"],
  },
  {
    name: "Invoice Generator PWA",
    slug: "invoice-generator-pwa",
    tagline: "Donation receipts as a fast PWA.",
    description:
      "A Progressive Web App that organisations use to generate quick receipts for the donations they receive. Clean, simple UI with a password-protected final step that generates the invoice PDF along with the issuer's name. Built with React, Vite, MUI, Google Apps Script and Excel, co-built with Ayaz Vhora.",
    body: blocksFromPlainText(
      "A Progressive Web App for organisations to generate donation receipts quickly.\n\nReact, Vite, MUI, Google Apps Script, and Excel integration — co-built with Ayaz Vhora.",
    ),
    image: InvoiceWebsiteImage,
    link: "https://www.linkedin.com/posts/anas-vhora-28455a1a1_innovation-techforgood-communityempowerment-activity-7180723081395511296-Vzqg/?utm_source=share&utm_medium=member_desktop",
    year: 2024,
    sortOrder: 5,
    featured: true,
    roles: ["Frontend"],
    stack: ["React", "Vite", "PWA", "MUI"],
  },
  {
    name: "Gesture Smart Home",
    slug: "gesture-smart-home",
    tagline: "Top 25 / 300+ at SAP Code Unnati.",
    description:
      "Switch appliances on and off with hand gestures or your voice. Reached the top 25 of 300+ teams at SAP Code Unnati Innovation Marathon 2.0. Runs on a relay module and Arduino Uno driven by any laptop or phone with Python, using a pre-trained hand and voice gesture recognition model.",
    body: blocksFromPlainText(
      "Relay-driven home automation with hand and voice gestures via a pre-trained ML model on Python.\n\nSAP Code Unnati Innovation Marathon 2.0 — top 25 of 300+ teams.",
    ),
    image: SmartHomeImage,
    link: "https://www.linkedin.com/posts/anas-vhora-28455a1a1_innovation-technology-accessibility-activity-7179266835760955392-hRNG/?utm_source=share&utm_medium=member_desktop",
    year: 2023,
    sortOrder: 6,
    featured: true,
    roles: ["IoT", "ML"],
    stack: ["Python", "Arduino", "Machine Learning"],
  },
  {
    name: "Pay Slip Pro",
    slug: "pay-slip-pro",
    tagline: "Salary slips, streamlined for teams.",
    description:
      "Pay Slip Pro is a comprehensive application designed to streamline the process of generating and managing salary slips for employees. Built end-to-end with React Native, React Native Paper, Node.js, Express and MongoDB.",
    body: blocksFromPlainText(
      "Pay Slip Pro streamlines generating and managing employee salary slips.\n\nBuilt with React Native, Node.js, Express, and MongoDB — end-to-end mobile and API work.",
    ),
    image: PaySlipProImage,
    link: "https://lnkd.in/d2wEqVTR",
    year: 2024,
    sortOrder: 7,
    featured: true,
    roles: ["Full-stack", "Mobile"],
    stack: ["React Native", "Node.js", "MongoDB", "Express"],
  },
  {
    name: "Auto Voyage",
    slug: "auto-voyage",
    tagline: "Vehicle service ops, built for Odoo 18.",
    description:
      "Auto Voyage is a comprehensive vehicle service management system for Odoo 18. It handles the full lifecycle — vehicles, service types, providers, contracts, service requests, ratings, and analytics — with a portal for customers, a workflow for providers, and dashboards for managers. Built following Odoo best practices with role-based security and integrations into mail, portal, product, calendar, and account modules.",
    body: blocksFromPlainText(
      "A full vehicle service management suite for Odoo 18 — vehicles, services, providers, contracts, requests, ratings, and manager analytics.\n\nBuilt on Odoo's stack: Python, XML views, ORM, kanban UIs, mail/portal integrations, and a role-based security model.\n\nGuided wizards for common operations, a customer ⇄ provider discussion platform, and a multi-criteria rating system (quality, timeliness, communication, value).",
    ),
    image: AutoVoyageImage,
    caseStudy: {
      problem:
        "Vehicle service businesses juggle customers, providers, contracts and job status across phone calls and spreadsheets. Nobody has one place to see what's booked, who's doing it, and how well it went.",
      built: [
        "An Odoo 18 module covering the full lifecycle: vehicles, service types, providers, contracts, service requests and ratings.",
        "A customer portal to register vehicles, request services and follow progress, and a simple status workflow for providers.",
        "A customer ⇄ provider discussion platform and multi-criteria ratings for quality, timeliness, communication and value.",
        "Manager dashboards and analytics, guided wizards for service assignment, and demo data for every state.",
      ],
      hardPart:
        "Three audiences with different rights in one system. The role-based security model — access rules, record rules and portal access — had to let customers, providers and managers each see exactly their slice, while integrating cleanly with Odoo's mail, portal, product, calendar and accounting apps.",
      outcome:
        "A complete, installable Odoo 18 app that follows Odoo's development guidelines, built from the same toolkit I use daily as an Odoo developer.",
    },
    link: "https://github.com/anasvhora284/auto-voyage",
    repoUrl: "https://github.com/anasvhora284/auto-voyage",
    year: 2025,
    sortOrder: 8,
    featured: true,
    roles: ["Full-stack", "Odoo"],
    stack: ["Odoo 18", "Python", "XML", "PostgreSQL"],
  },
  {
    name: "Input Leaf",
    slug: "input-leaf",
    tagline: "PC mouse & keyboard → Android. 70+ ★ on GitHub.",
    description:
      "Input Leaf is an open-source Android client for Input Leap and Deskflow. Move your cursor off the edge of your monitor and it glides onto your Android phone or tablet over the local network, with no cables and no root. Shizuku-based native input injection, mDNS server discovery, TLS with certificate pinning, and a Material 3 Expressive UI.",
    body: blocksFromPlainText(
      "Open-source Android client (Kotlin) for the Input Leap / Deskflow KVM protocol: share your PC's mouse and keyboard with any Android device over your LAN.\n\nNative low-latency input through Shizuku (or root), with an Accessibility fallback. mDNS auto-discovery, TLS with trust-on-first-use pinning, and exponential-backoff reconnects.\n\nMaterial 3 Expressive UI with dynamic colour, a guided setup flow, and a companion website. My most-starred open-source project.",
    ),
    image: InputLeafImage,
    imageKind: "logo",
    caseStudy: {
      metrics: [
        { value: "3,600+", label: "APK downloads" },
        { value: "77", label: "GitHub stars" },
        { value: "14", label: "releases" },
      ],
      problem:
        "Input Leap and Deskflow let one keyboard and mouse drive several computers, but phones were left out. Existing Android options needed root, a cable, or a paid app, so people kept reaching for the touchscreen in the middle of desk work.",
      built: [
        "A Kotlin client that speaks the Input Leap / Deskflow protocol over TCP, so your cursor glides off the monitor edge and onto the phone.",
        "Native input injection through Shizuku — no root — with a root path and an Accessibility fallback for devices that can't run it.",
        "mDNS discovery, TLS with trust-on-first-use pinning, and exponential-backoff reconnects for flaky Wi-Fi.",
        "A Material 3 Expressive UI with a guided setup flow, plus a companion website for docs and downloads.",
      ],
      hardPart:
        "Making a desktop protocol feel native on Android. Pointer events had to be translated into real system input with no perceptible lag, while surviving battery optimisation, overlay permissions and network drops that kill long-lived sockets.",
      outcome:
        "Shipped as free, open-source software. It has grown through word of mouth to 3,600+ downloads across 14 releases, 77 stars and 11 forks, with issues and feature requests from real users on Windows, macOS and Linux.",
    },
    link: "https://inputleaf.anasvhora.tech/",
    repoUrl: "https://github.com/anasvhora284/input-leaf",
    year: 2026,
    sortOrder: 9,
    featured: true,
    roles: ["Mobile", "Systems"],
    stack: ["Kotlin", "Android", "Shizuku", "Material 3"],
  },
  {
    name: "Kitchen Atelier",
    slug: "kitchen-atelier",
    tagline: "An AI chef in your pocket.",
    description:
      "Kitchen Atelier is an AI recipe studio: a React + TypeScript app with a client-side Gemini tool-calling agent that plans and generates recipes. Ships to web, Android and iOS through Capacitor, with GitHub Actions building every platform on push.",
    body: blocksFromPlainText(
      "AI recipe studio driven by a Gemini tool-calling agent that runs entirely in the browser. No backend server needed.\n\nReact 18, TypeScript, Tailwind, Motion and GSAP on the front end; Capacitor wraps it as native Android and iOS apps.\n\nCI/CD through GitHub Actions builds web, APK and iOS artifacts on every push.",
    ),
    link: "https://github.com/anasvhora284/Kitchen-Altier",
    repoUrl: "https://github.com/anasvhora284/Kitchen-Altier",
    year: 2026,
    sortOrder: 10,
    featured: false,
    roles: ["Full-stack", "AI"],
    stack: ["React", "TypeScript", "Gemini", "Capacitor"],
  },
  {
    name: "Everpal Recovery Tree",
    slug: "everpal-recovery-tree",
    tagline: "OrangeFox + PitchBlack that decrypt on any ROM.",
    description:
      "A unified OrangeFox R12.0 + PitchBlack 4.0 recovery device tree for Xiaomi MT6833 phones (Redmi Note 11T 5G, POCO M4 Pro 5G). It decrypts /data on ROMs where other trees fail by matching the installed ROM's version and security patch before Beanpod keymaster starts.",
    body: blocksFromPlainText(
      "One Android device tree that builds both OrangeFox and PitchBlack recoveries for the Dimensity 810 Xiaomi family: evergo, evergreen, everpal and opal.\n\nSolves FBEv2 + metadata decryption on Beanpod TEE: a pre-decrypt script copies the installed ROM's build version and security patch into recovery before keymaster starts, and service ordering is tuned so gatekeeper and TEE come up first.\n\nThe installer preserves the ROM's first-stage fstab when repacking boot, so ported ROMs don't bootloop.",
    ),
    caseStudy: {
      problem:
        "On Xiaomi's Dimensity 810 phones (Redmi Note 11T 5G, POCO M4 Pro 5G), custom recoveries couldn't decrypt user data once a newer custom ROM was installed. Backups and flashing broke exactly when people needed them.",
      built: [
        "One device tree that builds both OrangeFox R12.0 and PitchBlack 4.0 for all four variants: evergo, evergreen, everpal and opal.",
        "A pre-decrypt script that reads the installed ROM's Android version and security patch and hands them to the recovery before keymaster starts.",
        "Re-ordered init services so the TEE and gatekeeper come up first, and only keymaster waits for the pre-decrypt step.",
        "An installer that keeps the ROM's own first-stage fstab when repacking boot, so ported ROMs don't bootloop.",
      ],
      hardPart:
        "The Beanpod TEE binds encryption keys to the OS version and patch level. A recovery that looks older than the ROM simply can't unwrap the metadata key. Finding that root cause meant reading keymaster and init logs on a device where every failed boot looks the same.",
      outcome:
        "Decryption now works on ROMs where other recovery trees fail, and values are copied, never raised, so keys are never upgraded by accident.",
    },
    link: "https://github.com/anasvhora284/recovery_device_xiaomi_everpal",
    repoUrl: "https://github.com/anasvhora284/recovery_device_xiaomi_everpal",
    year: 2026,
    sortOrder: 11,
    featured: true,
    roles: ["Systems", "Android"],
    stack: ["Android", "Shell", "Makefile", "Linux"],
  },
  {
    name: "Strong Integrity Guide",
    slug: "strong-integrity-guide",
    tagline: "STRONG integrity on a rooted phone, documented.",
    description:
      "A tested, step-by-step guide to passing MEETS_STRONG_INTEGRITY on a rooted Android phone with an unlocked bootloader, using TEESimulator and your own device-minted RKP keybox instead of leaked keyboxes. Covers KernelSU-Next, SUSFS, Zygisk and troubleshooting.",
    body: blocksFromPlainText(
      "A reproducible setup for Play Integrity STRONG on rooted Android: TEESimulator for key attestation, Duck ToolBox to mint your own RKP keybox, plus SUSFS root hiding.\n\nTested on a OnePlus Nord 4 running Android 16 with KernelSU-Next, with clear do's and don'ts on conflicting modules and a troubleshooting section.",
    ),
    link: "https://github.com/anasvhora284/android-strong-integrity-guide",
    repoUrl: "https://github.com/anasvhora284/android-strong-integrity-guide",
    year: 2026,
    sortOrder: 12,
    featured: false,
    roles: ["Android", "Research"],
    stack: ["Android", "KernelSU", "SUSFS", "Zygisk"],
  },
];

/** Star-map card art (engraved atlas plates), matched to projects by slug. */
const thumbs = import.meta.glob("../assets/Images/Thumbs/*.webp", {
  eager: true,
  import: "default",
});
for (const p of projects) {
  p.thumb ??= thumbs[`../assets/Images/Thumbs/${p.slug}.webp`];
}
