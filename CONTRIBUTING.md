# Contributing to Codegnan QR Generator

Thank you for your interest in contributing to the **Codegnan QR Generator**! This document provides guidelines and instructions for contributing to this open-source project.

---

## 🛠️ Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/codegnan-qr-generator.git
   cd codegnan-qr-generator
   npm install
   ```

2. **Run Locally**
   ```bash
   npm run dev
   ```

3. **Make Changes**
   - Keep JavaScript modular and clean in [`src/main.js`](src/main.js).
   - Use CSS custom properties and structured design tokens in [`src/style.css`](src/style.css).
   - Verify layout responsiveness across Desktop, Tablet, and Mobile viewports.

4. **Verify the Build**
   Ensure the production build succeeds without errors:
   ```bash
   npm run build
   ```

---

## 📋 Pull Request Guidelines

- **Clear Commit Messages**: Write descriptive commit messages explaining *what* was changed and *why*.
- **Scope**: Keep pull requests focused on a single feature or bug fix.
- **Cross-Format Testing**: Always verify exports across all 4 standee formats (`6×4`, `900×1600`, `1:1 Square`, and `A4 Flyer`) and export types (`PNG`, `PDF`, `JPEG`).

---

## 🐛 Reporting Issues

If you find a bug or have a feature request:
1. Check existing issues to see if it has already been reported.
2. Open a new issue with detailed reproduction steps, browser/OS version, and screenshots if applicable.

---

## 📜 Code of Conduct

Please be respectful, collaborative, and constructive when participating in discussions and code reviews.
