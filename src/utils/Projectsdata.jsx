// src/data/projectsData.js
import DroneImage from "../assets/Images/Projects/AutoBalancingDrone.jpg";
import MathsWebsiteImage from "../assets/Images/Projects/MathsWebsite.png";
import EWasteWebsiteImage from "../assets/Images/Projects/EWasteWebsite.png";
import WiAttendImage from "../assets/Images/Projects/WiAttendImage.png";
import SmartHomeImage from "../assets/Images/Projects/SmartHomeImage.png";
import InvoiceWebsiteImage from "../assets/Images/Projects/InvoiceWebsiteImage.png";
import RishtaWebsiteImage from "../assets/Images/Projects/RishtaWebsite.gif";
import PaySlipProImage from "../assets/Images/Projects/PaySlipProImage.png";

const projectsData = [
  {
    name: "Pay Slip Pro",
    description:
      "Pay Slip Pro is a comprehensive application designed to streamline the process of generating and managing salary slips for employees. This project showcases my expertise in both frontend and backend development using modern technologies like React Native, React Navigation, React Native Paper, Axios, Node.js, Express, MongoDB, Git, GitHub, Android Studio, and more.",
    image: PaySlipProImage,
    link: "https://lnkd.in/d2wEqVTR",
  },
  {
    name: "Invoice Generator PWA",
    description:
      "This is an Invoice generator Progressive Web App which is used by Organisation to generate quick receipts for the donation they recieve. PWA based on React + Vite, Google Script, and Excel and MUI. It has Attractive, Clean and simple UI & A very great UX. at the before reaching the end of journey you need to enter the password to generate Invoice PDF & also the Pdf generator's name. - By Anas Vhora & Ayaz Vhora",
    image: InvoiceWebsiteImage,
    link: "https://www.linkedin.com/posts/anas-vhora-28455a1a1_innovation-techforgood-communityempowerment-activity-7180723081395511296-Vzqg/?utm_source=share&utm_medium=member_desktop",
  },
  {
    name: "Matrimony PWA",
    description:
      "Wanna find a partner for you? Welcome to the Vhora 68 Rishta Site. One of my relative who already had a data of boys and girls in excel. They proposed me to make attractive webiste for them. So We (Me & My Big Brother) decided to make a website for them. it is also of the same tech stack as invoice generator PWA React + Vite, Google Script, Excel & MUI. This also has a simpler yet good looking Site. - By Anas Vhora & Ayaz Vhora",
    image: RishtaWebsiteImage,

    link: "https://rishta-group-68-samaj.netlify.app/filter",
  },
  {
    name: "Maths Website",
    description:
      "A website to make your calculations easier such as Meand, Median, Mod. What you need to do is just Enter the values of Xi & Fi and get the whole tables of Mean, Median, Mod, Co-relation coefficient & More.",
    image: MathsWebsiteImage,
    link: "https://math-app-anasvhora284.netlify.app/",
  },
  {
    name: "E - Waste Facility Locator Website",
    description:
      "Welcome to the site which gives you reward for giving us your E-Waste. It has a good Ui and also has User/Admin sides also they can Manage / Track the E-Waste they submitted. For both User and Facility side each has a Dashboard to get quick info / History. Has been made out of MERN Stack, My Passion & Love.",
    image: EWasteWebsiteImage,
    link: "https://github.com/anasvhora284/E-Waste-Facility-Locator",
  },
  {
    name: "Auto balancing Drone",
    description:
      "A Drone which isn't using readymade flight controller? Also using your phone as a controller? There it is An Auto Balancing Drone made using Arduino Uno, Node MCU, ESCs, 1800kv Motors, and an MPU 6050. Also Multi-Wii as a Flight Controller of the drone and a Wifi PPM controller.",
    image: DroneImage,
    link: "https://drive.google.com/file/d/1vhhIyUH0XxMhNC_BbDJC0rcZ0ZbUsPB6/view",
  },
  {
    name: "Gesture Based Smart Home Automation",
    description:
      "Switch anything on/off by our hand gestures or your voice. A project which reached to top 25 out of 300+ teams. Made it during competition Organized by SAP - Code Unnati Innovation Merathon 2.0. It is based on a Relay module / Ardiuno Uno and any Laptop / Phone with a python installed in it. It has Hand / Voice gestures recognition Pre trained ML Model.",
    image: SmartHomeImage,
    link: "https://www.linkedin.com/posts/anas-vhora-28455a1a1_innovation-technology-accessibility-activity-7179266835760955392-hRNG/?utm_source=share&utm_medium=member_desktop",
  },
  {
    name: "Wi-Attend: UI/UX",
    description:
      "A Figma Design made during a hackathon. This App is a Wifi Based Attendance app can be used by clg faculty and student. Student can mark attandence only if S/He is connected to same wifi as faculty or faculties hotspot also has a face unlock and a session pin as extra authentication layers.",
    image: WiAttendImage,
    link: "https://www.figma.com/design/HJxqXuckKDyq9y9ol6YsDf/Attendance_App?node-id=0-1&t=TbYnk9MhcZqhobVk-0",
  },
];

export default projectsData;
