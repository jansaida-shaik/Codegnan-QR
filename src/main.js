import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

// Storage Keys
const STORAGE_KEYS = {
  CUSTOM_LOGO: 'codegnan_custom_logo',
  IS_FIXED_LOGO: 'codegnan_is_fixed_logo',
  QR: 'codegnan_qr',
  QR_LINK: 'codegnan_qr_link',
  TAGLINE: 'codegnan_tagline',
  SCAN: 'codegnan_scan_text',
  ENQUIRY: 'codegnan_title_enquiry',
  FORM: 'codegnan_title_form',
  LOCATION: 'codegnan_campus_location',
  WEBSITE: 'codegnan_website_url',
  FORMAT: 'codegnan_format'
};

const FIXED_LOGO_PATH = '/Complete website logo.png';

// Format dimension profiles for true pixel-perfect export
const FORMAT_PROFILES = {
  '6x4': {
    name: '6×4 Standee',
    className: 'format-6x4',
    exportWidth: 2400,
    exportHeight: 3600
  },
  '900x1600': {
    name: '900×1600 Standee',
    className: 'format-900x1600',
    exportWidth: 900,
    exportHeight: 1600
  },
  square: {
    name: '1:1 Square Sticker',
    className: 'format-square',
    exportWidth: 1080,
    exportHeight: 1080
  },
  a4: {
    name: 'A4 Flyer',
    className: 'format-a4',
    exportWidth: 1200,
    exportHeight: 1600
  }
};

// DOM Elements
const flyerCard = document.getElementById('flyer-card');

// Format dropdown
const formatDropdownTrigger = document.getElementById('format-dropdown-trigger');
const formatDropdownMenu = document.getElementById('format-dropdown-menu');
const selectedFormatLabel = document.getElementById('selected-format-label');
const dropdownItems = document.querySelectorAll('.dropdown-item:not(.download-option-item)');

// Download & Reset controls
const btnResetAll = document.getElementById('btn-reset-all');
const downloadDropdownTrigger = document.getElementById('download-dropdown-trigger');
const downloadDropdownMenu = document.getElementById('download-dropdown-menu');
const downloadLabel = document.getElementById('download-label');
const downloadOptionItems = document.querySelectorAll('.download-option-item');

// Logo modes
const btnUploadLogoMode = document.getElementById('btn-upload-logo-mode');
const btnFixedLogoMode = document.getElementById('btn-fixed-logo-mode');

// QR link
const qrLinkInput = document.getElementById('qr-link-input');
const btnGenerateQR = document.getElementById('btn-generate-qr');

// Upload triggers
const logoBoxContainer = document.getElementById('logo-box-container');
const logoUpload = document.getElementById('logo-upload');
const logoPlaceholder = document.getElementById('logo-placeholder');
const logoImg = document.getElementById('logo-img');

const qrBoxContainer = document.getElementById('qr-box-container');
const qrUpload = document.getElementById('qr-upload');
const qrPlaceholder = document.getElementById('qr-placeholder');
const qrImg = document.getElementById('qr-img');

// Text fields
const careerTagline = document.getElementById('career-tagline');
const scanText = document.getElementById('scan-text');
const titleEnquiry = document.getElementById('title-enquiry');
const titleForm = document.getElementById('title-form');
const campusLocation = document.getElementById('campus-location');
const websiteUrl = document.getElementById('website-url');

// Toast
const toast = document.getElementById('toast');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');

let currentFormat = '6x4';
let toastTimer = null;

/**
 * Toast Notification
 */
function showToast(msg, isError = false) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.textContent = msg;
  toastIcon.textContent = isError ? '✕' : '✓';
  toast.classList.toggle('error', isError);
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/**
 * Safe Session Storage Helper
 */
function saveSession(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    console.warn('Session storage quota exceeded or unavailable:', err);
  }
}

function getSession(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

/**
 * Format Dropdown open/close
 */
function toggleFormatDropdown(show) {
  if (!formatDropdownMenu || !formatDropdownTrigger) return;
  const willShow = show !== undefined ? show : formatDropdownMenu.classList.contains('hidden');

  if (willShow) {
    formatDropdownMenu.classList.remove('hidden');
    formatDropdownTrigger.classList.add('open');
    formatDropdownTrigger.setAttribute('aria-expanded', 'true');
    toggleDownloadDropdown(false);
  } else {
    formatDropdownMenu.classList.add('hidden');
    formatDropdownTrigger.classList.remove('open');
    formatDropdownTrigger.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Download Dropdown open/close
 */
function toggleDownloadDropdown(show) {
  if (!downloadDropdownMenu || !downloadDropdownTrigger) return;
  const willShow = show !== undefined ? show : downloadDropdownMenu.classList.contains('hidden');

  if (willShow) {
    downloadDropdownMenu.classList.remove('hidden');
    downloadDropdownTrigger.classList.add('open');
    downloadDropdownTrigger.setAttribute('aria-expanded', 'true');
    toggleFormatDropdown(false);
  } else {
    downloadDropdownMenu.classList.add('hidden');
    downloadDropdownTrigger.classList.remove('open');
    downloadDropdownTrigger.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Switch Formats
 */
function setFormat(formatKey, save = true) {
  if (!FORMAT_PROFILES[formatKey]) formatKey = '6x4';
  currentFormat = formatKey;

  const profile = FORMAT_PROFILES[formatKey];

  // Remove existing format classes
  Object.values(FORMAT_PROFILES).forEach((p) => {
    flyerCard.classList.remove(p.className);
  });
  flyerCard.classList.add(profile.className);

  // Update selected dropdown label
  if (selectedFormatLabel) {
    selectedFormatLabel.textContent = profile.name;
  }

  // Update active state in dropdown items
  dropdownItems.forEach((item) => {
    const itemFormat = item.getAttribute('data-format');
    const isSelected = itemFormat === formatKey;
    item.classList.toggle('active', isSelected);
    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  // Close dropdown
  toggleFormatDropdown(false);

  if (save) {
    saveSession(STORAGE_KEYS.FORMAT, formatKey);
    showToast(`Format set to ${profile.name}`);
  }
}

/**
 * Set Logo Mode: 'upload' vs 'fixed'
 */
function setLogoMode(mode, showNotification = true) {
  if (mode === 'fixed') {
    btnFixedLogoMode?.classList.add('active');
    btnUploadLogoMode?.classList.remove('active');

    logoImg.src = FIXED_LOGO_PATH;
    logoImg.classList.remove('hidden');
    if (logoPlaceholder) {
      logoPlaceholder.classList.add('hidden');
    }

    saveSession(STORAGE_KEYS.IS_FIXED_LOGO, 'true');

    if (showNotification) {
      showToast('Fixed Codegnan Logo applied');
    }
  } else {
    btnUploadLogoMode?.classList.add('active');
    btnFixedLogoMode?.classList.remove('active');

    const customLogo = getSession(STORAGE_KEYS.CUSTOM_LOGO);
    if (customLogo && customLogo.trim() !== '') {
      logoImg.src = customLogo;
      logoImg.classList.remove('hidden');
      if (logoPlaceholder) {
        logoPlaceholder.classList.add('hidden');
      }
    } else {
      logoImg.src = '';
      logoImg.classList.add('hidden');
      if (logoPlaceholder) {
        logoPlaceholder.classList.remove('hidden');
      }
    }

    saveSession(STORAGE_KEYS.IS_FIXED_LOGO, 'false');

    if (showNotification) {
      showToast('Upload Logo mode active');
    }
  }
}

/**
 * Generate QR Code directly from URL or Link
 */
async function generateQRFromLink(linkText, showNotification = true) {
  const url = (linkText || qrLinkInput.value || '').trim();

  if (!url) {
    showToast('Please enter a link or URL to generate QR', true);
    qrLinkInput?.focus();
    return;
  }

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 1200,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    qrImg.src = dataUrl;
    qrImg.classList.remove('hidden');
    if (qrPlaceholder) {
      qrPlaceholder.classList.add('hidden');
    }

    saveSession(STORAGE_KEYS.QR, dataUrl);
    saveSession(STORAGE_KEYS.QR_LINK, url);

    if (showNotification) {
      showToast('QR Code generated successfully');
    }
  } catch (err) {
    console.error('QR generation failed:', err);
    showToast('Failed to generate QR code from link', true);
  }
}

/**
 * Load Image File into specified element and persist to sessionStorage
 */
function loadFile(file, imgEl, placeholderEl, label, storageKey) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result;
    if (dataUrl) {
      imgEl.src = dataUrl;
      imgEl.classList.remove('hidden');
      if (placeholderEl) {
        placeholderEl.classList.add('hidden');
      }
      saveSession(storageKey, dataUrl);

      // If custom logo uploaded, set Upload Logo mode
      if (storageKey === STORAGE_KEYS.CUSTOM_LOGO) {
        btnUploadLogoMode?.classList.add('active');
        btnFixedLogoMode?.classList.remove('active');
        saveSession(STORAGE_KEYS.IS_FIXED_LOGO, 'false');
      }

      showToast(`${label} loaded successfully`);
    }
  };
  reader.onerror = () => {
    showToast(`Failed to read ${label}`, true);
  };
  reader.readAsDataURL(file);
}

/**
 * Setup Drag & Drop
 */
function setupDrop(containerEl, inputEl, imgEl, placeholderEl, label, storageKey) {
  containerEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    containerEl.style.opacity = '0.7';
  });

  ['dragleave', 'drop'].forEach((evt) => {
    containerEl.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      containerEl.style.opacity = '1';
    });
  });

  containerEl.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      loadFile(file, imgEl, placeholderEl, label, storageKey);
    }
  });
}

/**
 * Clean up contenteditable single line behavior & sync to sessionStorage
 */
function setupContentEditable() {
  const fields = [
    { el: careerTagline, key: STORAGE_KEYS.TAGLINE },
    { el: scanText, key: STORAGE_KEYS.SCAN },
    { el: titleEnquiry, key: STORAGE_KEYS.ENQUIRY },
    { el: titleForm, key: STORAGE_KEYS.FORM },
    { el: campusLocation, key: STORAGE_KEYS.LOCATION },
    { el: websiteUrl, key: STORAGE_KEYS.WEBSITE }
  ];

  fields.forEach(({ el, key }) => {
    if (!el) return;

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        el.blur();
      }
    });

    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text.replace(/[\r\n]+/g, ' '));
      saveSession(key, el.innerHTML);
    });

    el.addEventListener('input', () => {
      saveSession(key, el.innerHTML);
    });

    el.addEventListener('blur', () => {
      saveSession(key, el.innerHTML);
    });
  });
}

/**
 * Restore state from sessionStorage on page load/refresh
 */
function restoreSessionState() {
  // 1. Restore Format
  const savedFormat = getSession(STORAGE_KEYS.FORMAT);
  if (savedFormat && FORMAT_PROFILES[savedFormat]) {
    setFormat(savedFormat, false);
  } else {
    setFormat('6x4', false);
  }

  // 2. Restore Logo Mode & Image
  const isFixed = getSession(STORAGE_KEYS.IS_FIXED_LOGO);
  if (isFixed === 'true') {
    setLogoMode('fixed', false);
  } else {
    setLogoMode('upload', false);
  }

  // 3. Restore QR Link & QR Code Image
  const savedQRLink = getSession(STORAGE_KEYS.QR_LINK);
  if (savedQRLink && qrLinkInput) {
    qrLinkInput.value = savedQRLink;
  }

  const savedQR = getSession(STORAGE_KEYS.QR);
  if (savedQR && savedQR.trim() !== '') {
    qrImg.src = savedQR;
    qrImg.classList.remove('hidden');
    if (qrPlaceholder) {
      qrPlaceholder.classList.add('hidden');
    }
  } else {
    qrImg.src = '';
    qrImg.classList.add('hidden');
    if (qrPlaceholder) {
      qrPlaceholder.classList.remove('hidden');
    }
  }

  // 4. Restore Custom Texts
  const savedTagline = getSession(STORAGE_KEYS.TAGLINE);
  if (savedTagline && careerTagline) {
    careerTagline.innerHTML = savedTagline;
  }

  const savedScan = getSession(STORAGE_KEYS.SCAN);
  if (savedScan && scanText) {
    scanText.innerHTML = savedScan;
  }

  const savedEnquiry = getSession(STORAGE_KEYS.ENQUIRY);
  if (savedEnquiry && titleEnquiry) {
    titleEnquiry.innerHTML = savedEnquiry;
  }

  const savedForm = getSession(STORAGE_KEYS.FORM);
  if (savedForm && titleForm) {
    titleForm.innerHTML = savedForm;
  }

  const savedLocation = getSession(STORAGE_KEYS.LOCATION);
  if (savedLocation && campusLocation) {
    campusLocation.innerHTML = savedLocation;
  }

  const savedWebsite = getSession(STORAGE_KEYS.WEBSITE);
  if (savedWebsite && websiteUrl) {
    websiteUrl.innerHTML = savedWebsite;
  }
}

/**
 * Helper to get clean plain text from DOM element
 */
function getElementPlainText(el) {
  if (!el) return '';
  return el.innerText || el.textContent || '';
}

/**
 * Sanitize text component for safe, clean filename
 */
function sanitizeSegment(text) {
  if (!text) return '';
  return text
    .replace(/\u00a0/g, ' ') // non-breaking spaces
    .replace(/&nbsp;/gi, ' ')
    .replace(/[|/\\:*?"<>#%&{}\\<>*?/$!'":@+`~=^]/g, ' ') // illegal characters
    .replace(/[^\w\s-]/g, '') // remove non-word / non-ascii symbols
    .trim()
    .replace(/\s+/g, '_') // collapse spaces to single underscore
    .replace(/_+/g, '_'); // collapse consecutive underscores
}

/**
 * Generate dynamic filename using gradient title text, below location text, and format size
 * Example: "Enquiry_Form_Main_Campus_Vijayawada_6x4_Standee_2400x3600.png"
 */
function getDynamicFilename(profile, extension) {
  // 1. Gradient title text (e.g. "Enquiry Form")
  const enquiryText = sanitizeSegment(getElementPlainText(titleEnquiry));
  const formText = sanitizeSegment(getElementPlainText(titleForm));
  const titlePart = [enquiryText, formText].filter(Boolean).join('_') || 'Enquiry_Form';

  // 2. Below location text (e.g. "Main Campus | Vijayawada" -> "Main_Campus_Vijayawada")
  const locationPart = sanitizeSegment(getElementPlainText(campusLocation)) || 'Main_Campus_Vijayawada';

  // 3. Format size (e.g. "6x4_Standee_2400x3600")
  const formatNameClean = sanitizeSegment(profile.name.replace(/[×*]/g, 'x')) || 'Standee';
  const sizePart = `${formatNameClean}_${profile.exportWidth}x${profile.exportHeight}`;

  // Combine components
  const rawParts = [titlePart, locationPart, sizePart].filter(Boolean).join('_');

  // Final clean up
  const cleanName = rawParts.replace(/_+/g, '_').replace(/^_+|_+$/g, '');

  return `${cleanName || 'Codegnan_QR'}.${extension}`;
}

/**
 * Render Card to High-Resolution Canvas
 */
async function renderCardToCanvas(profile) {
  const cardRect = flyerCard.getBoundingClientRect();
  const targetScale = Math.max(
    profile.exportWidth / cardRect.width,
    profile.exportHeight / cardRect.height,
    3
  );

  let canvas;
  try {
    const dataUrl = await toPng(flyerCard, {
      pixelRatio: targetScale,
      cacheBust: true,
      backgroundColor: null
    });
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });
    canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  } catch (err1) {
    console.warn('html-to-image fallback to html2canvas:', err1);
    canvas = await html2canvas(flyerCard, {
      scale: targetScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    });
  }

  return canvas;
}

/**
 * Universal safe download helper
 */
async function saveFileDirectly(blob, filename, mimeType, description) {
  // 1. Try File System Access API if supported (native Save dialog in Chrome/macOS/Windows)
  if ('showSaveFilePicker' in window) {
    try {
      const ext = filename.split('.').pop().toLowerCase();
      const acceptMap = {};
      acceptMap[mimeType] = [`.${ext}`];

      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: description || 'File',
            accept: acceptMap
          }
        ]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      showToast(`Saved ${filename}`);
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled save dialog
        return;
      }
      console.warn('showSaveFilePicker fallback to saveAs:', err);
    }
  }

  // 2. Direct fallback using file-saver
  saveAs(blob, filename);
  showToast(`Downloaded ${filename}`);
}

/**
 * Handle Multi-Format Downloads (PNG, PDF, JPEG, Print)
 */
async function handleExport(exportType = 'png') {
  toggleDownloadDropdown(false);

  if (exportType === 'print') {
    window.print();
    return;
  }

  if (document.activeElement && document.activeElement.getAttribute('contenteditable') === 'true') {
    document.activeElement.blur();
  }

  const profile = FORMAT_PROFILES[currentFormat] || FORMAT_PROFILES['6x4'];

  downloadDropdownTrigger.disabled = true;
  downloadLabel.textContent = 'Exporting...';
  flyerCard.classList.add('capturing');

  try {
    await new Promise((r) => requestAnimationFrame(r));
    const canvas = await renderCardToCanvas(profile);

    if (exportType === 'png') {
      const filename = getDynamicFilename(profile, 'png');
      canvas.toBlob((blob) => {
        if (blob) {
          saveFileDirectly(blob, filename, 'image/png', 'PNG Image');
        } else {
          showToast('Failed to create PNG file', true);
        }
      }, 'image/png');
    } else if (exportType === 'jpeg') {
      const filename = getDynamicFilename(profile, 'jpg');
      const jpgCanvas = document.createElement('canvas');
      jpgCanvas.width = canvas.width;
      jpgCanvas.height = canvas.height;
      const jpgCtx = jpgCanvas.getContext('2d');
      jpgCtx.fillStyle = '#ffffff';
      jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
      jpgCtx.drawImage(canvas, 0, 0);

      jpgCanvas.toBlob((blob) => {
        if (blob) {
          saveFileDirectly(blob, filename, 'image/jpeg', 'JPEG Image');
        } else {
          showToast('Failed to create JPG file', true);
        }
      }, 'image/jpeg', 0.95);
    } else if (exportType === 'pdf') {
      const filename = getDynamicFilename(profile, 'pdf');

      const width = canvas.width;
      const height = canvas.height;
      const isLandscape = width > height;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [width, height]
      });

      pdf.addImage(canvas, 'PNG', 0, 0, width, height, undefined, 'FAST');
      const pdfBlob = pdf.output('blob');
      saveFileDirectly(pdfBlob, filename, 'application/pdf', 'PDF Document');
    }
  } catch (err) {
    console.error('Export failed:', err);
    showToast(`Failed to export ${exportType.toUpperCase()}`, true);
  } finally {
    flyerCard.classList.remove('capturing');
    downloadDropdownTrigger.disabled = false;
    downloadLabel.textContent = 'Download';
  }
}

/**
 * Initialize
 */
function init() {
  // Restore session
  restoreSessionState();

  // Format Dropdown
  if (formatDropdownTrigger) {
    formatDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFormatDropdown();
    });
  }

  dropdownItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const formatKey = item.getAttribute('data-format');
      if (formatKey) {
        setFormat(formatKey, true);
      }
    });
  });

  // Download Dropdown
  if (downloadDropdownTrigger) {
    downloadDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDownloadDropdown();
    });
  }

  downloadOptionItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const exportType = item.getAttribute('data-export-type');
      if (exportType) {
        handleExport(exportType);
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#format-dropdown-container')) {
      toggleFormatDropdown(false);
    }
    if (!e.target.closest('#download-dropdown-container')) {
      toggleDownloadDropdown(false);
    }
  });

  // Close dropdowns on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleFormatDropdown(false);
      toggleDownloadDropdown(false);
    }
  });

  // Reset All to Default
  function resetAllToDefault(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // 1. Clear session storage completely
      try {
        sessionStorage.clear();
      } catch (err) {}

      // 2. Reset format to default 6x4 standee
      setFormat('6x4', false);

      // 3. Reset logo mode to upload placeholder
      setLogoMode('upload', false);
      if (logoImg) {
        logoImg.src = '';
        logoImg.classList.add('hidden');
      }
      if (logoPlaceholder) {
        logoPlaceholder.classList.remove('hidden');
      }

      // 4. Reset QR image and link input
      if (qrImg) {
        qrImg.src = '';
        qrImg.classList.add('hidden');
      }
      if (qrPlaceholder) {
        qrPlaceholder.classList.remove('hidden');
      }
      if (qrLinkInput) {
        qrLinkInput.value = '';
      }

      // 5. Reset all text elements to default
      if (careerTagline) careerTagline.textContent = 'Your Career Starts Here';
      if (scanText) scanText.textContent = 'SCAN TO REGISTER';
      if (titleEnquiry) titleEnquiry.textContent = 'Enquiry';
      if (titleForm) titleForm.textContent = 'Form';
      if (campusLocation) campusLocation.innerHTML = 'Main Campus &nbsp;|&nbsp; Vijayawada';
      if (websiteUrl) websiteUrl.textContent = 'www.codegnan.com';

      // 6. Close any open dropdowns
      toggleFormatDropdown(false);
      toggleDownloadDropdown(false);

      showToast('Reset all elements to default');
    } catch (err) {
      console.error('Reset error:', err);
      showToast('Failed to reset elements', true);
    }
  }

  const resetBtn = document.getElementById('btn-reset-all');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllToDefault);
  }

  // Logo Mode Switchers
  btnUploadLogoMode?.addEventListener('click', () => setLogoMode('upload', true));
  btnFixedLogoMode?.addEventListener('click', () => setLogoMode('fixed', true));

  // QR Link Generator
  btnGenerateQR?.addEventListener('click', () => generateQRFromLink(qrLinkInput.value, true));
  qrLinkInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateQRFromLink(qrLinkInput.value, true);
    }
  });

  // Logo Upload
  logoBoxContainer.addEventListener('click', () => logoUpload.click());
  logoBoxContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logoUpload.click();
    }
  });
  logoUpload.addEventListener('change', () => {
    if (logoUpload.files?.[0]) {
      loadFile(logoUpload.files[0], logoImg, logoPlaceholder, 'Logo', STORAGE_KEYS.CUSTOM_LOGO);
    }
  });

  // QR Upload
  qrBoxContainer.addEventListener('click', () => {
    qrUpload.click();
  });
  qrBoxContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      qrUpload.click();
    }
  });
  qrUpload.addEventListener('change', () => {
    if (qrUpload.files?.[0]) {
      loadFile(qrUpload.files[0], qrImg, qrPlaceholder, 'QR code', STORAGE_KEYS.QR);
    }
  });

  // Drag & Drop
  setupDrop(logoBoxContainer, logoUpload, logoImg, logoPlaceholder, 'Logo', STORAGE_KEYS.CUSTOM_LOGO);
  setupDrop(qrBoxContainer, qrUpload, qrImg, qrPlaceholder, 'QR code', STORAGE_KEYS.QR);

  // Editable setup
  setupContentEditable();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
