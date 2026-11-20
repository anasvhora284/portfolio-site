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
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Solo developer"
        },
        {
          "label": "Timeline",
          "value": "Feb – Apr 2023"
        },
        {
          "label": "Stack",
          "value": "React 18, MUI, MUI Data Grid"
        },
        {
          "label": "Status",
          "value": "Live"
        }
      ],
      "metrics": [
        {
          "value": "5",
          "label": "statistics computed"
        },
        {
          "value": "3",
          "label": "step wizard"
        }
      ],
      "problem": "Statistics homework means building the same frequency tables by hand again and again — mean, median, mode, deviation, correlation — where one arithmetic slip ruins the whole sheet.",
      "built": [
        "A three-step wizard: enter X values and frequencies, choose what to compute, see the full table.",
        "Mean, median, mode, standard deviation and correlation coefficient computed from grouped data.",
        "Results laid out in a sortable data grid that paginates once tables get long."
      ],
      "challenges": [
        {
          "title": "Grouped data, not plain lists",
          "detail": "Every formula has to weight values by their frequency, which is exactly where hand calculations go wrong — and, it turns out, where code does too (see below)."
        },
        {
          "title": "Showing the working",
          "detail": "Students need the intermediate columns, not just the answer, so the output is a full table rather than a single number."
        }
      ],
      "outcome": "My first deployed React app — still live on Netlify — and the project where I learned to keep UI state and calculations separate.",
      "issues": [
        "Standard deviation has an operator-precedence bug (divides by 2 instead of taking a square root) and isn't frequency-weighted.",
        "Input rejects spaces, decimals and negative numbers.",
        "No tests; README is still the Create React App template."
      ],
      "nextSteps": [
        "Fix the deviation formula and cover all five statistics with unit tests.",
        "Accept decimals, spaces and negatives.",
        "Move calculations out of render into pure functions."
      ]
    },
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
    tagline: "Every authorised recycler in India, on one map.",
    description:
      "A platform that rewards people for recycling their e-waste. Users and facilities each get a dashboard to submit, manage and track e-waste with full history, plus an admin side for oversight. Built on the MERN stack.",
    body: blocksFromPlainText(
      "User and admin dashboards for tracking e-waste submissions and facility workflows.\n\nBuilt with the MERN stack — full-stack product thinking.",
    ),
    image: EWasteWebsiteImage,
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Full-stack · finished it solo in 2026"
        },
        {
          "label": "Team",
          "value": "Hackathon build with ArkanMalek72, Vaidik1317 and ayazvhora43"
        },
        {
          "label": "Timeline",
          "value": "One-day hackathon, Jun 2024 · completed Nov 2026"
        },
        {
          "label": "Status",
          "value": "Live · MIT"
        }
      ],
      "metrics": [
        {
          "value": "569",
          "label": "authorised recyclers mapped"
        },
        {
          "value": "22",
          "label": "states & UTs covered"
        },
        {
          "value": "3",
          "label": "roles: user, facility, admin"
        }
      ],
      "problem": "Most people don't know where to drop off old electronics, and have no reason to bother. The idea: show every government-authorised recycler near you, and reward people for actually recycling.",
      "built": [
        "A locator with every CPCB-authorised e-waste dismantler and recycler in India on a map — search by city or PIN, 'near me', nearest-first results and directions.",
        "A booking loop: request a pickup or drop-off, the facility accepts it, confirms the weight on collection, and you earn points by device type.",
        "User, facility and admin roles enforced on the server; facilities only see requests sent to them.",
        "A dashboard with real totals, kilograms recycled and a monthly chart.",
        "The original hackathon design — dark navy, glowing green, the hand-and-sprout hero — carried through every new screen."
      ],
      "architecture": "React + MUI front end on Netlify; Express + MongoDB API in Docker on Oracle Cloud's free tier behind Caddy, with MongoDB Atlas as the database. Facility data is built from the official CPCB list by a reproducible script and served by the API.",
      "challenges": [
        {
          "title": "Turning a government PDF into a map",
          "detail": "The CPCB list is a PDF of 569 facilities with free-text addresses. A parsing script rebuilds it as data, cross-checks every state's count against the PDF's own totals, and geocodes addresses once at a polite 1 request per second. Pins are approximate and the UI says so."
        },
        {
          "title": "Finishing someone's hackathon two years later",
          "detail": "The original app crashed on load, rejected correct passwords, let anyone sign up as admin and leaked password hashes. Each was fixed and covered by tests before adding features."
        },
        {
          "title": "Points that can't be gamed",
          "detail": "Points are awarded once, by the facility, on the confirmed weight — guarded by a status check in the database update so a double click can't pay twice."
        }
      ],
      "outcome": "Started as a one-day hackathon prototype in 2024; completed in 2026 as a live, working app with real data, roles and tests.",
      "issues": [
        "Pins are placed at PIN-code, locality or district level, not exact addresses; 37 facilities aren't mapped.",
        "The CPCB list is a 2023 snapshot and needs periodic refreshing.",
        "No password reset or email verification yet."
      ],
      "nextSteps": [
        "Refresh the dataset automatically from CPCB and state boards.",
        "Verified coordinates for each facility.",
        "Password reset by email, and an admin screen to onboard facilities."
      ]
    },
    link: "https://ewaste.anasvhora.tech",
    repoUrl: "https://github.com/anasvhora284/E-Waste-Facility-Locator",
    year: 2024,
    sortOrder: 1,
    featured: true,
    roles: ["Full-stack"],
    stack: ["React", "Express", "MongoDB", "Leaflet", "Docker"],
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
    caseStudy: {
      "facts": [
        {
          "label": "My role",
          "value": "UI/UX design (Figma)"
        },
        {
          "label": "Team",
          "value": "Hackathon team · backend by teammates"
        },
        {
          "label": "Timeline",
          "value": "Nov 2023"
        },
        {
          "label": "Backend",
          "value": "Django REST + MongoDB"
        }
      ],
      "problem": "Roll calls waste lecture time and proxy attendance is easy. Attendance should only be possible for students who are physically in the room.",
      "built": [
        "The full app design in Figma for faculty and student flows.",
        "A presence check: students can mark attendance only on the same Wi-Fi or hotspot as the faculty.",
        "Face unlock and a session PIN as extra layers against proxies.",
        "Handed off to teammates who built the Django REST backend; my code contribution was deployment configuration."
      ],
      "challenges": [
        {
          "title": "Three checks, one tap",
          "detail": "Wi-Fi, face and PIN verification had to feel like a single quick action, not a security gauntlet."
        },
        {
          "title": "Two very different users",
          "detail": "Faculty start and manage sessions; students just need to get in and out in seconds."
        }
      ],
      "outcome": "A complete clickable prototype delivered within the hackathon, which the team built a working API against.",
      "issues": [
        "The backend trusts an IP address sent by the client, so the Wi-Fi check could be spoofed.",
        "The backend repo has no README."
      ],
      "nextSteps": [
        "Verify presence server-side from the request itself (or the access point's BSSID).",
        "Usability-test the flows with students and faculty."
      ]
    },
    link: "https://www.figma.com/design/HJxqXuckKDyq9y9ol6YsDf/Attendance_App?node-id=0-1&t=TbYnk9MhcZqhobVk-0",
    year: 2023,
    sortOrder: 2,
    featured: false,
    roles: ["UI/UX"],
    stack: ["Figma", "Product design", "Django REST"],
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
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Lead developer"
        },
        {
          "label": "Team",
          "value": "With my brother Ayaz and contributors"
        },
        {
          "label": "Timeline",
          "value": "Feb 2024 – present (rebuilt 2026)"
        },
        {
          "label": "Status",
          "value": "Live, used by the community"
        }
      ],
      "metrics": [
        {
          "value": "8,000+",
          "label": "lines of TypeScript"
        },
        {
          "value": "14",
          "label": "database migrations"
        },
        {
          "value": "2",
          "label": "languages (Gujarati, English)"
        }
      ],
      "problem": "A relative ran matchmaking for the Vhora 68 community from an Excel sheet. Finding a match meant scrolling hundreds of rows; adding a profile meant sending details over chat and hoping they were typed in correctly.",
      "built": [
        "Version 1 (2024): a React PWA reading profiles from Google Sheets through Apps Script, with filters.",
        "Version 2 (2026): a full rebuild in TypeScript on Supabase (Postgres, Auth, row-level security).",
        "Browse and filter profiles, plus a swipeable profile stack on phones.",
        "A five-step submission wizard; new profiles wait for admin approval.",
        "Admin tools to approve, reject and edit, a superuser role, and Excel export in Gujarati or English.",
        "Gujarati / English interface with transliteration."
      ],
      "challenges": [
        {
          "title": "The same person, submitted twice",
          "detail": "Duplicate detection ranks possible matches — exact, same name + date of birth, same name + phone — so admins see likely duplicates before approving."
        },
        {
          "title": "Trust by default",
          "detail": "Database triggers force every new submission to pending and row-level security limits admin powers, so the rules hold even if the front end is bypassed."
        },
        {
          "title": "Moving off a spreadsheet",
          "detail": "Migrating from Sheets to Postgres without losing the community's existing data, with scripts for import and maintenance."
        }
      ],
      "outcome": "The community's matchmaking now runs on a real, moderated web app instead of a spreadsheet, and it has kept evolving for over two years.",
      "issues": [
        "No automated tests.",
        "A design-preview route still ships in production."
      ],
      "nextSteps": [
        "Add tests around duplicate detection and the approval flow.",
        "Remove dev-only routes from the production build."
      ]
    },
    link: "https://vhorarishta.anasvhora.tech",
    year: 2024,
    sortOrder: 3,
    featured: true,
    roles: ["Frontend"],
    stack: ["React", "TypeScript", "Supabase", "PWA"],
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
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Solo build"
        },
        {
          "label": "Hardware",
          "value": "Arduino, NodeMCU, ESCs, MPU-6050"
        },
        {
          "label": "Control",
          "value": "Phone / laptop over Wi-Fi"
        }
      ],
      "metrics": [
        {
          "value": "2",
          "label": "nested PID loops"
        },
        {
          "value": "4",
          "label": "motors mixed"
        },
        {
          "value": "2",
          "label": "ms control loop"
        }
      ],
      "problem": "Off-the-shelf flight controllers hide all the interesting parts. I wanted to understand how a quadcopter actually stays level by writing that loop myself.",
      "built": [
        "A quad frame with 1800KV motors and ESCs, an MPU-6050 for orientation and a Wi-Fi board for control.",
        "A cascaded controller: an outer angle loop feeding an inner rate PID, mixed across four motors in X configuration.",
        "A complementary filter blending gyro and accelerometer, with gyro calibration at startup.",
        "A Python desktop app with sliders to tune throttle and PID gains live over Wi-Fi."
      ],
      "challenges": [
        {
          "title": "Tuning in the air",
          "detail": "Re-flashing for every gain change is slow and risky, so gains are sent over Wi-Fi while the drone runs."
        },
        {
          "title": "Noisy sensors",
          "detail": "Gyros drift and accelerometers jitter; the complementary filter trades one off against the other."
        }
      ],
      "outcome": "It flew and self-levelled — and taught me control theory the hard way.",
      "issues": [
        "Looking back at the code: the integral term has no anti-windup, and a variable-shadowing bug weakens the derivative term.",
        "Gains are parsed as integers, so fine values like 0.03 are lost.",
        "The published sketch mixes ESP8266 and ESP32 code and doesn't compile as committed."
      ],
      "nextSteps": [
        "Fix the PID bugs, add anti-windup and float gains.",
        "Pick one board and log flights for offline tuning."
      ]
    },
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
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Lead developer"
        },
        {
          "label": "Team",
          "value": "With my brother Ayaz"
        },
        {
          "label": "Timeline",
          "value": "Feb 2024 · rebuilt Jul 2026"
        },
        {
          "label": "Users",
          "value": "A community organisation's volunteers"
        }
      ],
      "metrics": [
        {
          "value": "71",
          "label": "commits"
        },
        {
          "value": "8",
          "label": "app pages"
        },
        {
          "value": "2",
          "label": "edge functions"
        }
      ],
      "problem": "A community organisation wrote donation receipts by hand. Numbers were skipped or duplicated, and nobody could see totals without going through paper books.",
      "built": [
        "Version 1 (2024): a React PWA that numbered and saved receipts to Google Sheets through Apps Script, then produced a PDF.",
        "Version 2 (2026): a rebuild on Supabase with auth, Postgres and storage.",
        "Invoice history with filters, Excel export and a metrics dashboard.",
        "Admin and generator roles, invite-only accounts with forced password change, and signatures on PDFs.",
        "An import script that moved the old Sheets data into Postgres."
      ],
      "challenges": [
        {
          "title": "Receipt numbers that never collide",
          "detail": "Numbers are issued by a single atomic database function per financial year (April–March), so two volunteers saving at once can't get the same number."
        },
        {
          "title": "Receipts that can't be edited later",
          "detail": "Invoices are created only through one database function, and triggers lock the fields that must never change."
        },
        {
          "title": "Built for volunteers",
          "detail": "Most users are on phones, so the app is a PWA with a floating bottom dock and a short, guided flow."
        }
      ],
      "outcome": "Receipts are now numbered, searchable and exportable instead of written by hand, and the organisation has asked for changes across several rounds.",
      "issues": [
            "Smoke tests only; no tests for database rules yet."
      ],
      "nextSteps": [
                "Add tests for numbering and row-level security."
      ]
    },
    link: "https://invoicechef.anasvhora.tech",
    year: 2024,
    sortOrder: 5,
    featured: true,
    roles: ["Frontend"],
    stack: ["React", "TypeScript", "Supabase", "PWA"],
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
    caseStudy: {
      "facts": [
        {
          "label": "Event",
          "value": "SAP Code Unnati Innovation Marathon 2.0"
        },
        {
          "label": "Result",
          "value": "Top 25 of 300+ teams"
        },
        {
          "label": "Hardware",
          "value": "Arduino Uno + relay module"
        }
      ],
      "metrics": [
        {
          "value": "25",
          "label": "final rank (top)"
        },
        {
          "value": "300+",
          "label": "teams competing"
        }
      ],
      "problem": "Switches are hard to reach for elderly people and people with limited mobility. Smart-home kits are expensive and need an app for everything.",
      "built": [
        "A relay board driven by an Arduino Uno that switches ordinary appliances.",
        "A Python app on any laptop or phone that recognises hand gestures and voice commands with a pre-trained model.",
        "Gesture and voice commands mapped to individual appliances."
      ],
      "outcome": "Placed in the top 25 of 300+ teams at SAP's Code Unnati Innovation Marathon 2.0.",
      "issues": [
        "The source code isn't published."
      ],
      "nextSteps": [
        "Publish the code with wiring diagrams."
      ]
    },
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
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Full-stack developer"
        },
        {
          "label": "Timeline",
          "value": "Nov 2024 – Nov 2025"
        },
        {
          "label": "App",
          "value": "React Native (Android)"
        },
        {
          "label": "API",
          "value": "Node.js, Express, MongoDB"
        }
      ],
      "metrics": [
        {
          "value": "10",
          "label": "app screens"
        },
        {
          "value": "4",
          "label": "API modules"
        }
      ],
      "problem": "Small offices still build salary slips in spreadsheets every month and assemble Form 16 by hand at year end.",
      "built": [
        "Employee management, monthly salary-slip generation and PDF export.",
        "Biometric unlock before a slip is viewed.",
        "An in-app Excel editor and CSV-to-HTML conversion for bulk data.",
        "Form 16: upload, generate, download and email.",
        "Split APKs per CPU architecture."
      ],
      "challenges": [
        {
          "title": "Form 16 from monthly slips",
          "detail": "The year-end calculator gathers twelve monthly slips for the April–March financial year and totals basic, DA, HRA, TA, PF, ESI, loans and tax."
        },
        {
          "title": "Sensitive data on a phone",
          "detail": "Salary slips sit behind biometric authentication and secure storage."
        }
      ],
      "outcome": "A working mobile payroll tool with a deployed API.",
      "issues": [
        "Login isn't token-based yet, so the API relies on network trust.",
        "The app points at a local network address rather than the deployed API.",
        "No tests beyond the template."
      ],
      "nextSteps": [
        "Add JWT authentication to every route.",
        "Configure the API URL per environment.",
        "Unit-test the Form 16 calculator."
      ]
    },
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
      "facts": [
        {
          "label": "Role",
          "value": "Solo developer"
        },
        {
          "label": "Timeline",
          "value": "Mar – Apr 2025"
        },
        {
          "label": "Platform",
          "value": "Odoo 18 (Python, XML, QWeb)"
        },
        {
          "label": "Status",
          "value": "Open source · MPL-2.0"
        }
      ],
      "metrics": [
        {
          "value": "9",
          "label": "data models"
        },
        {
          "value": "33",
          "label": "website & portal routes"
        },
        {
          "value": "19",
          "label": "record rules"
        },
        {
          "value": "10",
          "label": "Odoo apps integrated"
        }
      ],
      "problem": "Vehicle service businesses juggle customers, providers, contracts and job status across phone calls and spreadsheets. Nobody has one place to see what's booked, who's doing it, and how well it went.",
      "built": [
        "Nine models covering vehicles, services, providers, service requests, contracts, ratings and discussions, plus a guided service-assignment wizard.",
        "A public website with service catalogue, provider directory and online booking.",
        "A customer portal to manage vehicles, follow requests, accept or reject contracts, rate services and join discussions.",
        "Printable QWeb PDF reports for service requests and contracts, and demo data for every state."
      ],
      "architecture": "A single installable Odoo 18 module built on the standard stack — ORM models, XML views, QWeb templates and HTTP controllers — and integrated with mail, portal, product, calendar, account, payments and website.",
      "architectureList": [
        "Service requests move draft → confirmed → scheduled → in progress → completed (or cancelled).",
        "Contracts move draft → sent → signed → active → expired.",
        "Five security groups (customer, service provider, user, service manager, administrator) enforced by 19 record rules and 33 access lines."
      ],
      "challenges": [
        {
          "title": "Three audiences, one database",
          "detail": "Customers, providers and managers each need to see exactly their slice. That meant designing groups and record rules first, then checking every portal page against them."
        },
        {
          "title": "Two lifecycles that interact",
          "detail": "Requests and contracts each have their own state machine, and portal actions (accept, reject, rate) have to respect both."
        },
        {
          "title": "Website and back office in sync",
          "detail": "Bookings made on the public site land as real service requests the back office can schedule, assign and report on."
        }
      ],
      "outcome": "A complete, installable Odoo 18 app that follows Odoo's development guidelines — the same toolkit I use every day as an Odoo developer.",
      "issues": [
        "Auto-invoicing on completion is stubbed and not wired to Odoo Accounting yet.",
        "Contracts have signature fields, but the portal doesn't capture e-signatures yet.",
        "No automated tests.",
        "README and manifest still contain template placeholders."
      ],
      "nextSteps": [
        "Generate invoices through account.move when a request completes.",
        "Add portal e-signatures for contracts.",
        "Tighten portal actions (ownership checks, POST-only state changes).",
        "Add TransactionCase and HttpCase tests, plus screenshots in the README."
      ]
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
      "facts": [
        {
          "label": "Role",
          "value": "Creator & maintainer"
        },
        {
          "label": "Team",
          "value": "Me + 6 community contributors"
        },
        {
          "label": "Timeline",
          "value": "Mar 2026 – present"
        },
        {
          "label": "Status",
          "value": "Open source · Apache-2.0"
        }
      ],
      "metrics": [
        {
          "value": "3,600+",
          "label": "APK downloads"
        },
        {
          "value": "77",
          "label": "GitHub stars"
        },
        {
          "value": "14",
          "label": "releases"
        },
        {
          "value": "96%",
          "label": "test coverage"
        }
      ],
      "problem": "Input Leap and Deskflow let one keyboard and mouse drive several computers, but phones and tablets were left out. Existing Android options needed root, a cable or a paid app, so people kept reaching for the touchscreen in the middle of desk work.",
      "built": [
        "A Kotlin client that speaks the Input Leap / Deskflow protocol over TCP, so the cursor glides off the monitor edge and onto the phone.",
        "Three input engines: virtual HID devices through Shizuku or root, an IME for text, and an Accessibility fallback for devices that can't run either.",
        "mDNS server discovery, TLS with trust-on-first-use fingerprint pinning, client certificates and exponential-backoff reconnects.",
        "Clipboard sync, Android TV support, an in-app updater and a Material 3 Expressive UI with a guided setup flow.",
        "A companion website (React 19, prerendered) for docs, guides and downloads."
      ],
      "architecture": "One Android module (~122 Kotlin files, ~20k lines) split by responsibility, with ~13k lines of tests behind it.",
      "architectureList": [
        "protocol — parser and writer for the Input Leap wire format.",
        "network — TLS pinning, client certificates, server scanner and transport prober.",
        "shizuku/uhid — virtual mouse, keyboard and pen devices built on Linux UHID.",
        "inject — Accessibility engine, IME, keysym resolution and Android TV handling.",
        "CI runs 82 JVM test files and emulator tests on every push, with a coverage gate and a nightly smoke test."
      ],
      "challenges": [
        {
          "title": "Real input without root",
          "detail": "Pointer events become virtual HID devices created through Shizuku, so Android treats them like a physical mouse and keyboard. Getting UHID devices ready reliably — and making the reader stoppable — took several rounds of fixes."
        },
        {
          "title": "Devices that refuse to cooperate",
          "detail": "The Shizuku injector wouldn't start on Onyx Boox e-ink tablets. I added an app_process fallback so the engine starts on vendors that block the normal path."
        },
        {
          "title": "Keyboards are never just keyboards",
          "detail": "Keysyms, layouts and IMEs differ between desktops and Android. One layout change had to be reverted after it broke users, which led to a dedicated keysym resolver and more tests."
        },
        {
          "title": "Android TV",
          "detail": "TV launchers ignore normal taps, so clicks go through an Accessibility node clicker with special handling for launcher menus."
        }
      ],
      "outcome": "Grew by word of mouth to 3,600+ downloads across 14 releases, 77 stars and 11 forks. Users report bugs from Onyx Boox, Galaxy Tab, Huawei and TV boxes; 34 issues and 42 pull requests are closed so far.",
      "issues": [
        "Some symbols (numeric keypad, \"@\") still map wrong on certain layouts — the most active open issue.",
        "The Accessibility service listens to every event type, which users link to slowdowns on weaker devices.",
        "targetSdk is 34 while the app compiles against 37.",
        "The website's release list is hand-maintained and lags behind GitHub."
      ],
      "nextSteps": [
        "Fix the remaining keyboard mapping issues.",
        "Narrow the Accessibility event mask.",
        "Raise targetSdk and test on Android 16 devices.",
        "Generate the website's release list from the GitHub API.",
        "Finish the F-Droid submission."
      ]
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
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Solo developer"
        },
        {
          "label": "Timeline",
          "value": "Aug 2026"
        },
        {
          "label": "Platforms",
          "value": "Web, Android, iOS"
        },
        {
          "label": "Status",
          "value": "Prototype"
        }
      ],
      "metrics": [
        {
          "value": "10",
          "label": "agent tools"
        },
        {
          "value": "3",
          "label": "platforms, one codebase"
        },
        {
          "value": "200",
          "label": "lines of proxy, zero deps"
        }
      ],
      "problem": "Recipe apps make you search; you still have to work out what to cook from what's in the fridge, your diet and the time you have. I wanted a kitchen assistant you can just talk to.",
      "built": [
        "A chat-driven recipe studio where a Gemini agent manages your ingredients, diet, chef style, cook time and servings through tool calls.",
        "Recipe generation and refinement, with dish images pulled from Pexels, Unsplash or Edamam — or generated when nothing fits.",
        "One React + TypeScript codebase shipped to web, Android and iOS with Capacitor.",
        "GitHub Actions that build all three platforms on every push."
      ],
      "architecture": "The agent runs in the browser and calls Gemini through a tiny Node proxy I host on Oracle Cloud, so API keys never reach the client. The proxy only allows approved models, caps tokens and request size, rate-limits per visitor and answers only the app's own origins. The app falls back across models when one is overloaded.",
      "challenges": [
        {
          "title": "Keeping the agent in the kitchen",
          "detail": "A strict domain guardrail in the system prompt keeps the assistant on food and declines everything else."
        },
        {
          "title": "Tools instead of free text",
          "detail": "The UI state (ingredients, diet, servings) changes only through tool calls, so the conversation and the screen never disagree."
        },
        {
          "title": "Keys without a backend",
          "detail": "Moving the agent client-side removed the old FastAPI server but exposed API keys. A ~200-line dependency-free proxy fixed that without bringing back a full backend."
        }
      ],
      "outcome": "Live on the web, with Android builds from the same codebase, served through a hardened proxy on Oracle Cloud's free tier.",
      "issues": [
        "Image lookup depends on third-party photo APIs, so some dishes fall back to generated images.",
        "No real tests yet.",
        "The repo is still named \"Kitchen-Altier\" (typo)."
      ],
      "nextSteps": [
                "Publish signed builds through GitHub Releases.",
        "Add tests for the agent tools."
      ]
    },
    link: "https://kitchen.anasvhora.tech",
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
      "facts": [
        {
          "label": "Role",
          "value": "Device-tree maintainer"
        },
        {
          "label": "Timeline",
          "value": "Oct – Nov 2026"
        },
        {
          "label": "Devices",
          "value": "Redmi Note 11T 5G, POCO M4 Pro 5G family"
        },
        {
          "label": "Status",
          "value": "Open source · Apache-2.0"
        }
      ],
      "metrics": [
        {
          "value": "2",
          "label": "recoveries from one tree"
        },
        {
          "value": "4",
          "label": "phone variants"
        },
        {
          "value": "4",
          "label": "build-time checks"
        }
      ],
      "problem": "On Xiaomi's Dimensity 810 phones, custom recoveries couldn't decrypt user data once a newer custom ROM was installed. Backups and flashing broke exactly when people needed them most.",
      "built": [
        "One device tree that builds both OrangeFox R12.0 and PitchBlack 4.0 for evergo, evergreen, everpal and opal — plus an AERA recovery port on Android 16.",
        "A pre-decrypt script that reads the installed ROM's Android version and security patch and hands them to recovery before keymaster starts.",
        "Re-ordered init services so the TEE and gatekeeper come up first and only keymaster waits.",
        "An installer that keeps the ROM's own first-stage fstab when repacking boot, so ported ROMs don't bootloop.",
        "Build scripts with four checks that fail the build if the tree, image, zip or installer patch is wrong."
      ],
      "challenges": [
        {
          "title": "Keys bound to a patch level",
          "detail": "The Beanpod TEE ties encryption keys to the OS version and security patch. A recovery that looks older than the ROM can't unwrap the metadata key, so it copies the ROM's values — never raising them, so keys are never upgraded by accident."
        },
        {
          "title": "A keyring that never appears",
          "detail": "Without a permissive SELinux boot flag, init can't create the fscrypt keyring. Recovery now goes permissive at early-init; normal Android stays enforcing."
        },
        {
          "title": "Every failed boot looks the same",
          "detail": "Finding these causes meant reading keymaster and init logs on a device where a hang, a bootloop and a decrypt failure all show the same splash screen."
        },
        {
          "title": "Porting to Android 16",
          "detail": "The AERA port needed the AIDL boot HAL, a fix for a VINTF-related logo hang, and Wi-Fi bring-up."
        }
      ],
      "outcome": "Decryption now works on ROMs where other recovery trees fail, and the tree builds two recoveries from one source.",
      "issues": [
        "Tested on evergo only so far.",
        "MemeOS installs but doesn't boot after flashing.",
        "No pre-built releases published yet; CI builds aren't running."
      ],
      "nextSteps": [
        "Publish releases with SHA-256 checksums.",
        "Test on evergreen and opal.",
        "Debug the MemeOS boot failure."
      ]
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
    caseStudy: {
      "facts": [
        {
          "label": "Role",
          "value": "Author"
        },
        {
          "label": "Timeline",
          "value": "Nov 2026"
        },
        {
          "label": "Tested on",
          "value": "OnePlus Nord 4, Android 16"
        },
        {
          "label": "Status",
          "value": "v1.0 published"
        }
      ],
      "problem": "Rooted phones fail Play Integrity, which breaks banking and payment apps. Most guides depend on leaked keyboxes that get revoked within days, and contradict each other about which modules to stack.",
      "built": [
        "A tested, step-by-step setup that reaches MEETS_STRONG_INTEGRITY with TEESimulator and a keybox minted from your own device.",
        "A tap-only path using Duck ToolBox for people who don't want to edit files.",
        "A guide to building a KernelSU-Next + SUSFS kernel for root hiding.",
        "Two tools: a vendor-module CRC checker for kernel builds and a script that syncs the verified-boot hash."
      ],
      "challenges": [
        {
          "title": "Settings that silently fail",
          "detail": "TEESimulator only reaches STRONG in generation mode, and its system patch level must match the spoofed fingerprint's security patch exactly."
        },
        {
          "title": "Modules that fight",
          "detail": "The standalone PlayIntegrityFix module couldn't reach the DroidGuard worker on this stack, so the guide uses one fingerprint engine and one keystore hook — and says what to remove."
        },
        {
          "title": "Kernel modules that won't load",
          "detail": "Custom kernels break vendor modules when symbol CRCs drift. The CRC checker compares them before you flash."
        }
      ],
      "outcome": "A reproducible guide that avoids leaked keyboxes entirely.",
      "issues": [
        "Verified on one device so far.",
        "The boot-hash script assumes KernelSU, although Magisk and APatch are listed as supported.",
        "Device-minted keyboxes expire and need to be re-minted every few weeks."
      ],
      "nextSteps": [
        "Detect the root manager automatically in the scripts.",
        "Collect a tested-devices matrix from readers.",
        "Add a licence."
      ]
    },
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
