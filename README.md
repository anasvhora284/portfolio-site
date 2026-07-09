# 3D Interactive Developer Portfolio

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity-%23F03E2F.svg?style=for-the-badge&logo=sanity&logoColor=white)

An interactive 3D portfolio application built with React, React Three Fiber, Framer Motion, and GSAP. It integrates a headless CMS (Sanity) for dynamic content management and features an immersive audio-visual experience.

## Features

- **3D Rendering**: Implemented using Three.js and React Three Fiber.
- **Animation System**: Scroll and state-based animations managed by GSAP and Framer Motion.
- **Content Management**: Integrated with Sanity CMS for managing projects, skills, and about sections.
- **Spatial Audio**: Configured with Howler.js for interactive sound effects.
- **State Management**: Implemented using Zustand for optimal performance and scalability.
- **Search Engine Optimization**: Configured with React Helmet Async for dynamic metadata generation.

## Technology Stack

- **Frontend**: React 18, Vite, React Router v6
- **3D Graphics**: Three.js, React Three Fiber (R3F), Drei, Postprocessing
- **Animations**: GSAP, Framer Motion
- **State Management**: Zustand
- **Content Management (CMS)**: Sanity
- **Audio**: Howler.js
- **SEO**: React Helmet Async

## Getting Started

### Prerequisites
Ensure that [Node.js](https://nodejs.org/) is installed on your local environment.

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Fetch CMS Content** (Optional, if required for local development)
   ```bash
   npm run content:pull
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` to view the application.

### Content Management Studio
To manage content locally using Sanity Studio:
```bash
npm run studio
```

## Available Scripts

The following scripts are available in the project directory:

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Compiles the application for production deployment.
- `npm run preview`: Previews the compiled production build locally.
- `npm run lint`: Executes ESLint for static code analysis.
- `npm run content:pull`: Synchronizes local content with the CMS.
- `npm run studio`: Initializes the local Sanity Studio instance.

## Contributing
Contributions are welcome. Please open an issue or submit a pull request for any proposed changes.

## License
This project is licensed under the [MIT License](LICENSE).
