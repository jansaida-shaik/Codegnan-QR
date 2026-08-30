# Codegnan QR Standee & Flyer Generator 🎯

A high-resolution, web-based QR Standee and Flyer generator built with modern web technologies. Designed for instant live editing, direct drag-and-drop customization, URL-to-QR generation, and lossless export across PNG, PDF, and JPG formats.

![Codegnan QR Generator Banner](public/Complete%20website%20logo.png)

---

## ✨ Features

- **WYSIWYG Inline Editing**: Click on any text, header, or tagline directly on the standee card to edit in real time.
- **Dynamic QR Code Generation**: Enter any URL or link to instantly generate a high-density, vector-accurate QR code.
- **Dual Logo Selector**: Toggle between the official fixed Codegnan brand logo or upload custom high-res PNG/SVG logos.
- **Multiple Standee & Flyer Formats**:
  - `6×4 Standee` (2:3 aspect ratio, 2400×3600 px high-res print target)
  - `900×1600 Standee` (9:16 aspect ratio, 900×1600 px vertical display target)
  - `1:1 Square Sticker` (1:1 aspect ratio, 1080×1080 px social/sticker target)
  - `A4 Flyer` (3:4 aspect ratio, 1200×1600 px handout target)
- **Multi-Format Lossless Export**:
  - **PNG Image**: Lossless transparency with rounded card corners.
  - **PDF Document**: Print-ready, pixel-perfect vector alignment with zero margin skewing or corner halos.
  - **JPEG Image**: Solid-backed high-contrast raster export.
  - **Direct Print**: Print straight to connected printers via `@media print`.
- **Session Persistence & Instant Reset**: Automatically persists work to `sessionStorage` with a 1-click `[ ↺ Reset ]` action to restore defaults.
- **Single Dedicated Frame Architecture**: Seamless edge rendering without double borders, rings, or anti-aliasing seams.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/codegnan-qr-generator.git

# Navigate to the project directory
cd codegnan-qr-generator

# Install dependencies
npm install
```

### Development

```bash
# Start the local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Compile and bundle assets for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ES Modules), HTML5, Vanilla CSS3 (Custom Design System)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **QR Generation**: [qrcode](https://github.com/soldair/node-qrcode)
- **Rendering & Export**:
  - [html-to-image](https://github.com/bubkoo/html-to-image)
  - [html2canvas](https://html2canvas.hertzen.com/)
  - [jsPDF](https://github.com/parallax/jsPDF)
  - [file-saver](https://github.com/eligrey/FileSaver.js/)

---

## 📁 Project Structure

```text
├── index.html              # Main HTML markup and UI structure
├── package.json            # Project dependencies and npm scripts
├── public/                 # Static public assets (brand logos)
│   └── Complete website logo.png
├── src/
│   ├── main.js             # Core application logic, QR generator & export engine
│   └── style.css           # Complete custom design system and layout rules
├── CONTRIBUTING.md         # Guidelines for open-source contributions
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

---

## 🤝 Contributing

Contributions are welcome! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development workflow, and submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
