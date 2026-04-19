import DroneImage from "../assets/Images/Projects/AutoBalancingDrone.jpg";
import MathsWebsiteImage from "../assets/Images/Projects/MathsWebsite.png";
import EWasteWebsiteImage from "../assets/Images/Projects/EWasteWebsite.png";
import WiAttendImage from "../assets/Images/Projects/WiAttendImage.png";
import SmartHomeImage from "../assets/Images/Projects/SmartHomeImage.png";
import InvoiceWebsiteImage from "../assets/Images/Projects/InvoiceWebsiteImage.png";
import RishtaWebsiteImage from "../assets/Images/Projects/RishtaWebsite.gif";
import PaySlipProImage from "../assets/Images/Projects/PaySlipProImage.png";
import AutoVoyageImage from "../assets/Images/Projects/AutoVoyage.png";
import InputLeafImage from "../assets/Images/Projects/InputLeaf.png";
import { blocksFromPlainText } from "../lib/blocksFromPlainText.js";

/**
 * Projects are displayed in ascending `sortOrder` — index 0 is the oldest
 * entry on the constellation, higher indices walk forward in time.
 *
 * Each `image` is the real project screenshot, used inside the detail
 * sidebar (ProjectPanel). The floating preview card on the home-page
 * constellation always renders the shared /project-thumbnail.svg for a
 * consistent branded look — see UniverseCanvas.jsx.
 *
 * @type {import('./content.types.js').Project[]}
 */
export const projects = [
  {
    name: "Maths Website",
    slug: "maths-website",
    tagline: "Statistics tables without the tedium.",
    description:
      "A website to make your calculations easier such as Meand, Median, Mod. What you need to do is just Enter the values of Xi & Fi and get the whole tables of Mean, Median, Mod, Co-relation coefficient & More.",
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
    name: "E - Waste Facility Locator Website",
    slug: "e-waste-facility-locator",
    tagline: "Rewards for responsible e-waste.",
    description:
      "Welcome to the site which gives you reward for giving us your E-Waste. It has a good Ui and also has User/Admin sides also they can Manage / Track the E-Waste they submitted. For both User and Facility side each has a Dashboard to get quick info / History. Has been made out of MERN Stack, My Passion & Love.",
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
      "A Figma Design made during a hackathon. This App is a Wifi Based Attendance app can be used by clg faculty and student. Student can mark attandence only if S/He is connected to same wifi as faculty or faculties hotspot also has a face unlock and a session pin as extra authentication layers.",
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
      "Wanna find a partner for you? Welcome to the Vhora 68 Rishta Site. One of my relative who already had a data of boys and girls in excel. They proposed me to make attractive webiste for them. So We (Me & My Big Brother) decided to make a website for them. it is also of the same tech stack as invoice generator PWA React + Vite, Google Script, Excel & MUI. This also has a simpler yet good looking Site. - By Anas Vhora & Ayaz Vhora",
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
    name: "Auto balancing Drone",
    slug: "auto-balancing-drone",
    tagline: "Custom flight control with MPU6050.",
    description:
      "A Drone which isn't using readymade flight controller? Also using your phone as a controller? There it is An Auto Balancing Drone made using Arduino Uno, Node MCU, ESCs, 1800kv Motors, and an MPU 6050. Also Multi-Wii as a Flight Controller of the drone and a Wifi PPM controller.",
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
      "This is an Invoice generator Progressive Web App which is used by Organisation to generate quick receipts for the donation they recieve. PWA based on React + Vite, Google Script, and Excel and MUI. It has Attractive, Clean and simple UI & A very great UX. at the before reaching the end of journey you need to enter the password to generate Invoice PDF & also the Pdf generator's name. - By Anas Vhora & Ayaz Vhora",
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
    name: "Gesture Based Smart Home Automation",
    slug: "gesture-smart-home",
    tagline: "Top 25 / 300+ at SAP Code Unnati.",
    description:
      "Switch anything on/off by our hand gestures or your voice. A project which reached to top 25 out of 300+ teams. Made it during competition Organized by SAP - Code Unnati Innovation Merathon 2.0. It is based on a Relay module / Ardiuno Uno and any Laptop / Phone with a python installed in it. It has Hand / Voice gestures recognition Pre trained ML Model.",
    body: blocksFromPlainText(
      "Relay-driven home automation with hand and voice gestures via a pre-trained ML model on Python.\n\nSAP Code Unnati Innovation Merathon 2.0 — top 25 of 300+ teams.",
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
      "Pay Slip Pro is a comprehensive application designed to streamline the process of generating and managing salary slips for employees. This project showcases my expertise in both frontend and backend development using modern technologies like React Native, React Navigation, React Native Paper, Axios, Node.js, Express, MongoDB, Git, GitHub, Android Studio, and more.",
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
    tagline: "PC mouse & keyboard → Android, over LAN.",
    description:
      "Input Leaf is an open-source Android client for Input Leap — a KVM software switch that lets you control your Android device with your PC or laptop's mouse and keyboard. Move your cursor to the edge of your screen and it seamlessly crosses to your Android over the local network — no cables, no root, Shizuku-based event injection. Ships a Material UI with live connection statuses, LAN server discovery, quick favourites, and a guided Shizuku setup wizard.",
    body: blocksFromPlainText(
      "Open-source Android client (Kotlin) for the Input Leap KVM protocol — share your PC's mouse and keyboard with any Android device over your local network.\n\nMaterial 3 UI with colour-coded connection statuses, automatic server discovery, favourites for one-tap reconnects, and a guided onboarding flow for Shizuku-based event injection — no root required.\n\nHandles overlay permissions, battery-optimisation dialogs, and reconnect state transitions automatically.",
    ),
    image: InputLeafImage,
    imageKind: "logo",
    link: "https://github.com/anasvhora284/input-leaf",
    repoUrl: "https://github.com/anasvhora284/input-leaf",
    year: 2026,
    sortOrder: 9,
    featured: true,
    roles: ["Mobile", "Systems"],
    stack: ["Kotlin", "Android", "Shizuku", "Material 3"],
  },
];
