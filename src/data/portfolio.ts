// ─────────────────────────────────────────────────────────────
//  All site content lives here. Edit this file to update the site.
//
//  Media:
//   - `drive` = Google Drive file id. Videos/PDFs are embedded with
//     Drive's preview player, and the card thumbnail is pulled from
//     Drive automatically. The file must be shared as
//     "Anyone with the link can view".
//   - `image` = a local photo in /public (e.g. "/projects/drone.jpg").
//     A local image always wins over the Drive thumbnail.
// ─────────────────────────────────────────────────────────────

export type MediaKind = "video" | "report" | "image" | "folder" | "certificate" | "link";

export interface Media {
  label: string;
  kind: MediaKind;
  drive?: string; // Google Drive file / folder id
  url?: string; // external link
  src?: string; // local file in /public (e.g. "/projects/x.mp4")
}

export interface Experience {
  org: string;
  sub?: string;
  role: string;
  period: string;
  code: string; // little technical tag shown on the card
  domain: "propulsion" | "manufacturing" | "ml" | "software";
  points: string[];
  media?: Media[];
  image?: string;
}

export interface Project {
  slug: string;
  title: string;
  tag: string;
  category: "Aerial Robotics" | "Robotics & AI" | "CFD & ML" | "Manufacturing" | "Software";
  featured?: boolean;
  stack?: string[];
  points: string[];
  award?: string;
  media?: Media[];
  image?: string;
  thumbDrive?: string; // which drive id to use for the cover thumbnail
  video?: string; // silent looping preview shown as the card cover
  wide?: boolean; // full-width cinematic banner card
}

export const profile = {
  name: "Paul Varghese Shibu",
  short: "Paul V. S.",
  title: "Mechanical Engineer",
  tagline: "Propulsion · Aerial Robotics · Automation",
  summary:
    "Mechanical Engineering undergraduate at NIT Calicut (Minor in Robotics) with hands-on experience in CFD, fluid-flow systems, propulsion, manufacturing and experimental testing through internships at ISRO/LPSC, Inbound Aerospace and Wilo Mather and Platt. I work across ANSYS, CAD, CNC manufacturing and machine learning, and lead multidisciplinary technical teams that build and fly real hardware.",
  location: "Muvattupuzha, Kerala, India",
  email: "paulshibupullorkudiyil@gmail.com",
  phone: "+91 9745820228",
  links: {
    linkedin: "https://www.linkedin.com/in/paul-varghese-shibu",
    github: "https://github.com/Paul-V-S-10",
  },
  // Put your photo at /public/profile.jpg and set this to "/profile.jpg"
  photo: "/me/profile-graded.webp" as string,
  // Put your resume at /public/Resume.pdf
  resume: "/Resume.pdf",
};

export const education = [
  {
    school: "National Institute of Technology Calicut",
    degree: "B.Tech in Mechanical Engineering · Minor in Robotics",
    period: "Aug 2023 – May 2027",
    score: "CGPA 8.23",
  },
  {
    school: "St Antony's Public School, Kanjirappally",
    degree: "Higher Secondary Education",
    period: "Jul 2020 – Aug 2022",
    score: "92.8%",
  },
  {
    school: "Nirmala Public School",
    degree: "High School",
    period: "Until 2020",
    score: "96.4%",
  },
];

export const experience: Experience[] = [
  {
    org: "Inbound Aerospace",
    sub: "IIT Madras Research Park",
    role: "Spacecraft Propulsion System Design Intern",
    period: "May 2026 – Jul 2026",
    code: "N₂O · RCS",
    domain: "propulsion",
    points: [
      "Design and development of an N₂O-based green monopropellant reaction control thruster.",
      "CFD optimisation of propellant feed lines to improve flow characteristics and system efficiency.",
      "Designed and fabricated a ground test rig for evaluating pulsed-mode thruster operation.",
      "Cold-flow ground testing of the pulsed thruster; characterised thrust response with load-cell measurements.",
    ],
    media: [{ label: "Test Video", kind: "folder", drive: "1tKziQc1CBDsBcIiODTLgii6VHSxSc0Kq" }],
  },
  {
    org: "ISRO · Liquid Propulsion Systems Centre",
    sub: "Earth Storable Engines and Stages (ESES)",
    role: "Intern",
    period: "Dec 2025 – Jan 2026",
    code: "HRCS · SC-STAGE",
    domain: "propulsion",
    points: [
      "Project: Hot-gas Roll Control System (HRCS) of the semi-cryogenic stage.",
      "Compressible CFD analysis in ANSYS of hot gas tapped from the pre-burner exhaust through an orifice–nozzle setup.",
      "Designed and evaluated orifice geometries for controlled hot-gas flow against pressure-drop and mass-flow requirements.",
    ],
    media: [{ label: "Internship Report", kind: "report", drive: "1JWTEic8mjEZRxv14Rxi1tGSBkEP3Tm7V" }],
  },
  {
    org: "NIT Calicut × Altius Surya Tech Pvt. Ltd.",
    sub: "Under Dr. Sai Saketha",
    role: "Machine Learning Intern",
    period: "Jun 2025 – Aug 2025",
    code: "SARIMAX · PV",
    domain: "ml",
    points: [
      "Built a solar PV energy-forecasting pipeline on three years of real-world generation data using SARIMAX to capture annual seasonality and weather-driven variation.",
      "Integrated the PVGIS API for global irradiance data and used pvlib to simulate realistic energy output.",
    ],
    media: [{ label: "Certificate", kind: "certificate", drive: "1f89D68pE7NrcF_MAnAOwqMHQrD80CaBq" }],
  },
  {
    org: "Wilo Mather and Platt Pumps Ltd.",
    sub: "Machine Shop",
    role: "Mechanical Intern",
    period: "May 2025 – Jun 2025",
    code: "CNC · G/M-CODE",
    domain: "manufacturing",
    points: [
      "Evaluated multi-axis CNC operations (Widma, Trevisan, You Ji) and verified G/M-code toolpaths for pump impellers.",
      "Analysed and simulated CNC code in CAMotics for validation before production.",
      "Determined optimal machine routing — trading off setup time against cycle efficiency across CNC lathes and multi-axis machines.",
    ],
  },
  {
    org: "Progressive Software Solutions & Training",
    role: "Web Developer Intern",
    period: "May 2024 – Aug 2024",
    code: "MERN",
    domain: "software",
    points: ["Built dynamic front-end applications in React.js with Node.js / Express back-end APIs."],
  },
];

export const projects: Project[] = [
  {
    slug: "autonomous-drone",
    title: "Autonomous Drone for Payload Delivery",
    tag: "UAV · ArduPilot · OpenCV",
    category: "Aerial Robotics",
    featured: true,
    stack: ["Pixhawk Cube Orange+", "Raspberry Pi", "Pi Cam", "OpenCV", "Mission Planner"],
    points: [
      "Designed and tuned an autonomous quadcopter running ArduPilot on a Pixhawk Cube Orange+ with a Raspberry Pi companion computer.",
      "Led the mechanical design and 3D printing of custom parts and the payload-dropping mechanism.",
      "Programmed precision-release algorithms and target detection using OpenCV and onboard telemetry.",
    ],
    award: "AIR 2 · Payload Mechanism Design  |  AIR 6 Overall — SAE Autonomous Drone Development Challenge",
    media: [
      { label: "Flight Video", kind: "video", drive: "1ypXLJwmwaJKJwVwJMT_caxh2Dp2EVbWp" },
      { label: "Design Report", kind: "report", drive: "1Oy8AgWo0AvIjoOaG3bxQv7lCyJnuFBH4" },
    ],
    thumbDrive: "1ypXLJwmwaJKJwVwJMT_caxh2Dp2EVbWp",
  },
  {
    slug: "vla-manipulator",
    title: "VLA-Controlled Robotic Manipulator",
    tag: "Final Year Project",
    category: "Robotics & AI",
    featured: true,
    stack: ["LeRobot (Hugging Face)", "OpenVLA", "pi0", "SO-100 Arm"],
    points: [
      "Designed and fabricated a low-cost 5-DOF robotic arm for imitation learning and VLA model deployment.",
      "Deployed an end-to-end LeRobot pipeline mapping natural language + vision to motor actions.",
      "Evaluated pi0 and OpenVLA for spatial reasoning and precise pick-and-place execution.",
    ],
    media: [{ label: "Video Demonstration", kind: "video", drive: "1h5zM7khsdODw1Xy59a6d2OkyevvHhjRv" }],
    thumbDrive: "1h5zM7khsdODw1Xy59a6d2OkyevvHhjRv",
  },
  {
    slug: "fixed-wing",
    title: "Fixed-Wing UAV Development & Missions",
    tag: "Aeromodelling · CFD",
    category: "Aerial Robotics",
    featured: true,
    points: [
      "Developed custom fixed-wing aircraft for payload-delivery missions.",
      "Managed the full cycle — CAD design, fabrication and flight testing.",
    ],
    award: "5th · National Aeromodelling Competition, NITK Surathkal",
    media: [{ label: "Flight Video", kind: "video", drive: "17oCPiMCFiQq41oNDbESnknFx4w5TAuuw" }],
    thumbDrive: "17oCPiMCFiQq41oNDbESnknFx4w5TAuuw",
  },
  {
    slug: "rl-cfd",
    title: "Reinforcement Learning for Flow Optimisation",
    tag: "OpenFOAM · RL · Ongoing",
    category: "CFD & ML",
    featured: true,
    wide: true,
    stack: ["OpenFOAM", "Reinforcement Learning", "Python", "ParaView"],
    points: [
      "Framework coupling RL agents with OpenFOAM for active flow control.",
      "Agents autonomously iterate and evaluate flow fields, accelerating the design–simulation loop.",
      "Training control policies on dynamic simulation data to hit target aerodynamic performance and pressure distributions.",
    ],
    media: [{ label: "Simulation Video", kind: "video", src: "/projects/rl-cfd.mp4" }],
    video: "/projects/rl-cfd-loop.mp4",
    image: "/projects/rl-cfd.jpg",
  },
  {
    slug: "fpv-quad",
    title: "5-inch FPV Quadcopter (6S)",
    tag: "Betaflight · PID Tuning",
    category: "Aerial Robotics",
    stack: ["DreamflyRC F722 FC", "GEPRC BLS 50A 4-in-1 ESC", "XING 2207 1750KV", "SpeedyBee TX800"],
    points: [
      "Built on a Mark 4 V2 carbon-fibre frame, optimising thrust-to-weight for a 6S power system.",
      "Configured flight-controller firmware and PID tuning in Betaflight for stability in high-velocity manoeuvres.",
    ],
    media: [{ label: "Drone Image", kind: "image", drive: "17IqZeoGbllOSFIDyUsBfulrW1hLz0ulP" }],
    thumbDrive: "17IqZeoGbllOSFIDyUsBfulrW1hLz0ulP",
  },
  {
    slug: "am-drone",
    title: "Additive Manufacturing of Autonomous Drone Components",
    tag: "3D Printing · Fusion 360",
    category: "Manufacturing",
    points: [
      "Modelled and printed a multi-tier electronics bay to convert a Mark 4 7-inch FPV frame into an autonomous platform.",
      "Designed aerodynamic propeller ducts for crash protection, reduced tip vortices and added lift.",
      "PLA parts; geometry inspection in Meshmixer and support-free toolpaths in Ultimaker Cura.",
    ],
    media: [{ label: "Project Report", kind: "report", drive: "1JgBy5gEgjJ3xiV5TK5ILkds6sXUSOOb-" }],
    thumbDrive: "1JgBy5gEgjJ3xiV5TK5ILkds6sXUSOOb-",
  },
  {
    slug: "pinn-cfd",
    title: "Physics-Informed Neural Networks for CFD",
    tag: "PyTorch · DeepXDE",
    category: "CFD & ML",
    points: [
      "Solved the Eikonal equation for geometry-agnostic wall-distance fields around complex airfoils.",
      "Solved 2D Navier–Stokes to analyse flow and recirculation past an ellipse.",
      "Inverse PINN recovering unknown Reynolds numbers from sparse wake-clustered data.",
    ],
  },
  {
    slug: "gearless-transmission",
    title: "Gearless 90° Power Transmission",
    tag: "Production Engineering Lab",
    category: "Manufacturing",
    points: [
      "Designed and fabricated a gearless 90° transmission using perpendicular shaft arrangements.",
      "Process planning, machining, drilling, welding and assembly of the base frame and shafts.",
    ],
  },
  {
    slug: "wildlife",
    title: "Wildlife Detection & Alerting System",
    tag: "YOLOv8 · Raspberry Pi",
    category: "Robotics & AI",
    stack: ["OpenCV", "YOLOv8", "Raspberry Pi", "Pi Camera"],
    points: ["Real-time wildlife detection with YOLOv8 and live capture/processing on a Raspberry Pi + Pi Cam."],
  },
  {
    slug: "wind-tunnel",
    title: "Wind Tunnel",
    tag: "Aerodynamics · Exhibition",
    category: "Manufacturing",
    points: ["Built a wind tunnel for a college exhibition demonstrating aerodynamic principles and their applications."],
  },
  {
    slug: "gold-price",
    title: "Gold Price Prediction (Ensemble)",
    tag: "LGBM · CatBoost · XGBoost",
    category: "CFD & ML",
    points: ["Multi-stage stacking pipeline classifying trading actions (Buy / Hold / Sell)."],
  },
  {
    slug: "bike-sharing",
    title: "Smart Bicycle Sharing, NIT Calicut",
    tag: "Mobility · Business Plan",
    category: "Software",
    points: ["Co-developed a business plan for a smart campus bicycle-sharing system (multimodal transportation elective)."],
  },
  {
    slug: "ecommerce",
    title: "E-commerce Web App",
    tag: "Node · Express · React",
    category: "Software",
    points: ["Full-stack shop with auth, carts and checkout on a Node/Express back end."],
  },
];

export const achievements = [
  { value: "AIR 2", label: "Payload Mechanism Design", event: "SAE Autonomous Drone Dev. Challenge", tier: "gold" },
  { value: "AIR 6", label: "Overall", event: "SAE Autonomous Drone Dev. Challenge", tier: "silver" },
  { value: "5th", label: "National Aeromodelling", event: "NITK Surathkal", tier: "bronze" },
] as const;

export const stats = [
  { n: 4, suffix: "", label: "Engineering internships" },
  { n: 115, suffix: "+", label: "IEEE events conducted" },
  { n: 50, suffix: "K+", label: "Participants · IEEE YESS 2025" },
  { n: 28, suffix: "K", label: "Participants · INFINITUM quiz" },
];

export const leadership: {
  org: string;
  role: string;
  period: string;
  points: string[];
  media?: Media[];
}[] = [
  {
    org: "Club Aerounwired",
    role: "Secretary",
    period: "Sep 2024 – Present",
    points: [
      "Led multidisciplinary teams to national podiums — AIR 2 for best payload mechanism and 6th overall at SAE ADDC.",
      "Managed custom fixed-wing development for payload missions, placing 5th at National Aeromodelling, NITK.",
      "Organised Model Rocketry (300+ attendees) and ICARUS fixed-wing (100+) workshops.",
      "Led the design and development of the club website from UI to deployment.",
    ],
    media: [
      { label: "Event", kind: "video", drive: "1CVCMcbm-d_sJJtQeyyFq0TnRucKUyffK" },
      { label: "Fixed-Wing Flight Video", kind: "video", drive: "17oCPiMCFiQq41oNDbESnknFx4w5TAuuw" },
      { label: "Website", kind: "link", url: "https://aerounwired.org/index.html" },
    ],
  },
  {
    org: "IEEE SB NITC",
    role: "Webmaster · Former Technical Coordinator",
    period: "Feb 2025 – Present",
    points: [
      "Conducted 115+ on-campus events coordinating 11 societies.",
      "Managed technical operations for IEEE YESS 2025 (50K+ participants).",
      "Designed and deployed the official NPEC 2025 conference website.",
      "Leading the team building the new student-branch website.",
    ],
    media: [
      { label: "NPEC 2025", kind: "link", url: "https://www.npec2025.com/" },
      { label: "IEEE SB Website", kind: "link", url: "https://ieee-sb-nitc.vercel.app/" },
    ],
  },
  {
    org: "Club Mathematica NITC",
    role: "Treasurer",
    period: "Nov 2024 – Present",
    points: [
      "Conducted INFINITUM, a school quiz with 28,000 participants across South India.",
      "Led Felizora (500+) and Navaragam (600+) from ideation to execution.",
    ],
  },
  {
    org: "Tathva '24",
    role: "Tech & Design Team",
    period: "2024",
    points: ["Helped develop the Tathva '24 website and designed event posters and brochures."],
  },
];

export const skills = [
  { group: "Engineering", items: ["CFD", "CAD", "Additive Manufacturing", "Aerospace Propulsion", "CNC / CAM"] },
  { group: "Software", items: ["ANSYS", "Fluent", "Fusion 360", "SolidWorks", "CAMotics", "OpenFOAM"] },
  { group: "Robotics / UAV", items: ["ArduPilot", "Mission Planner", "DroneKit", "PyMavlink", "Betaflight", "Raspberry Pi", "LeRobot"] },
  { group: "Programming & ML", items: ["Python", "PyTorch", "OpenCV", "Gazebo", "JavaScript", "Git"] },
];

// ── helpers ──
export const driveThumb = (id: string, w = 1200) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
export const driveEmbed = (m: Media) =>
  m.kind === "folder"
    ? `https://drive.google.com/embeddedfolderview?id=${m.drive}#grid`
    : `https://drive.google.com/file/d/${m.drive}/preview`;
export const driveOpen = (m: Media) =>
  m.kind === "folder"
    ? `https://drive.google.com/drive/folders/${m.drive}`
    : `https://drive.google.com/file/d/${m.drive}/view`;
