import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const BASE_URL = 'https://docbuilder.mysalesforce.in';

const ROUTES = [
  {
    path: '/',
    title: 'DocBuilder - Free Online PDF & Image Tools | 100% On-Device & Private',
    description: 'Convert, compress, merge, split and edit documents directly in your browser. Zero cloud uploads, no registration, no subscriptions. Your files stay on your device.',
    h1: 'Your Documents. Your Privacy. Your Control.',
    tagline: 'Free Online PDF & Image Tools. Convert, compress, merge, split and edit documents directly in your browser. No registration. No subscriptions. Your files stay on your device.',
    category: 'Document & Image Studio',
    priority: '1.0',
    instructions: [
      { step: 1, title: 'Select or Drop Files', desc: 'Drag and drop your PDF or image files directly into the workspace, or paste from your clipboard.' },
      { step: 2, title: 'Choose Action or Format', desc: 'Switch between Format Transcoder, Doc Studio & Sign, or PDF Merge & Split tools.' },
      { step: 3, title: 'Process On-Device & Download', desc: 'All operations execute in your browser memory via WebAssembly. Export single files or batch ZIPs instantly.' },
    ],
    features: [
      '100% On-Device Processing — Zero cloud uploads',
      'No registration, paywalls, or subscriptions',
      'Instant WebAssembly & Canvas rendering speed',
      'Doc Studio & Sign with digital signature pad',
      'Multi-page PDF Merge & Split capabilities',
      'Supports WEBP, AVIF, PNG, JPG, PDF, SVG, ICO, BMP, HEIC',
    ],
    supportedInputs: ['PDF', 'PNG', 'JPG', 'JPEG', 'WEBP', 'AVIF', 'HEIC', 'HEIF', 'SVG', 'BMP', 'ICO'],
    supportedOutputs: ['PDF', 'PNG', 'JPG', 'WEBP', 'AVIF', 'SVG', 'BMP', 'ICO', 'ZIP'],
    limitations: [
      'Processing speed depends on your local device CPU and RAM',
      'PDF-to-Word DOCX conversion is not currently available (100% on-device fidelity constraint)',
    ],
    faqs: [
      {
        q: 'Are my documents uploaded to a remote server?',
        a: 'No. DocBuilder processes all files 100% locally on your computer or phone using in-browser WebAssembly and Canvas APIs. Your files never leave your device memory.',
      },
      {
        q: 'Is DocBuilder completely free to use?',
        a: 'Yes, DocBuilder is 100% free with unlimited conversions, exports, and document editing. There are no subscriptions, paywalls, or account registrations.',
      },
      {
        q: 'Can DocBuilder work offline?',
        a: 'Yes. Once loaded, DocBuilder operates entirely in client-side memory without needing an active internet connection.',
      },
      {
        q: 'What is the maximum file size supported?',
        a: 'Since processing occurs in device RAM, DocBuilder comfortably handles documents and image batches up to several hundred megabytes depending on your available device memory.',
      },
    ],
  },
  {
    path: '/merge-pdf',
    title: 'Merge PDF Files Online – Free, Private & On-Device | DocBuilder',
    description: 'Combine multiple PDF documents into a single organized file directly in your browser. 100% on-device processing with zero server uploads and no file limits.',
    h1: 'Merge PDF Files Online – Fast, Private & Free',
    tagline: 'Combine multiple contracts, reports, or invoices into one clean PDF document. All merging runs in browser memory on your device.',
    category: 'PDF Tools',
    priority: '0.9',
    instructions: [
      { step: 1, title: 'Upload PDFs', desc: 'Select or drag two or more PDF files from your computer or phone.' },
      { step: 2, title: 'Arrange Order', desc: 'Use the up/down controls or drag handles to organize the sequence of documents.' },
      { step: 3, title: 'Combine & Download', desc: 'Click "Merge Pages" to compile and save your merged PDF instantly.' },
    ],
    features: [
      'Zero server uploads — 100% confidential and private',
      'Flexible page sequencing and ordering',
      'Instant in-memory compilation via pdf-lib',
      'No file quantity limits or watermarks added',
    ],
    supportedInputs: ['PDF (.pdf)'],
    supportedOutputs: ['Combined PDF (.pdf)'],
    limitations: ['Encrypted/password-protected PDFs must be unlocked before merging'],
    faqs: [
      {
        q: 'Can I reorder PDFs before combining them?',
        a: 'Yes. You can reorder files up and down to define the exact sequence of pages in the output document.',
      },
      {
        q: 'Are merged PDFs stored on any server?',
        a: 'Never. All page copying and document assembly occurs entirely in your browser memory using WebAssembly.',
      },
      {
        q: 'Is there a limit on how many PDFs I can merge?',
        a: 'No. You can merge as many PDF files as your local device RAM permits.',
      },
    ],
  },
  {
    path: '/split-pdf',
    title: 'Split PDF Pages Online – Free & Private Page Extractor | DocBuilder',
    description: 'Extract specific pages or page ranges from any PDF document on-device. Zero cloud uploads, no account registration, and instant export.',
    h1: 'Split & Extract PDF Pages Online',
    tagline: 'Extract specific pages or custom ranges from any PDF document without sending confidential data to remote servers.',
    category: 'PDF Tools',
    priority: '0.9',
    instructions: [
      { step: 1, title: 'Choose PDF File', desc: 'Select the PDF document from your device.' },
      { step: 2, title: 'Specify Page Numbers', desc: 'Enter specific pages or ranges to extract (e.g., "1, 3-5, 8").' },
      { step: 3, title: 'Extract & Save', desc: 'Download your new extracted PDF document immediately.' },
    ],
    features: [
      'Supports individual pages and page intervals (e.g. 1-4, 7, 10-12)',
      '100% on-device page isolation',
      'Preserves original vector clarity and text formatting',
      'Zero data collection or file retention',
    ],
    supportedInputs: ['PDF (.pdf)'],
    supportedOutputs: ['Extracted PDF (.pdf)'],
    limitations: ['Page numbers must be within the actual page count of the source document'],
    faqs: [
      {
        q: 'How do I specify ranges of pages?',
        a: 'Use commas and hyphens, for example: "1, 3-5, 9". DocBuilder extracts and combines those exact pages in order.',
      },
      {
        q: 'Does splitting a PDF reduce quality?',
        a: 'No. The underlying vector graphics, embedded fonts, and text objects are copied lossless directly into the new PDF.',
      },
    ],
  },
  {
    path: '/image-to-pdf',
    title: 'Image to PDF Converter Online – Free, Private JPG & PNG to PDF | DocBuilder',
    description: 'Convert JPG, PNG, WEBP, and HEIC images into high-quality PDF documents. Custom page sizing (A4, Letter, Fit), orientation, and zero cloud uploads.',
    h1: 'Convert Images to PDF Online',
    tagline: 'Turn receipts, photos, scans, and graphic designs into clean, professional PDF documents right in your browser.',
    category: 'Image Tools',
    priority: '0.9',
    instructions: [
      { step: 1, title: 'Add Images', desc: 'Drop one or multiple photos, scans, or diagrams into DocBuilder.' },
      { step: 2, title: 'Configure Page Layout', desc: 'Select page format (A4, US Letter, or Fit to Image), orientation, and margins.' },
      { step: 3, title: 'Generate PDF', desc: 'Save as a combined multi-page PDF or individual files.' },
    ],
    features: [
      'Supports PNG, JPG, WEBP, AVIF, BMP, and Apple HEIC',
      'Page size options: A4, US Letter, and Fit to Canvas',
      'Portrait and Landscape orientation toggle',
      'Batch processing with zero cloud data transfer',
    ],
    supportedInputs: ['PNG', 'JPG', 'JPEG', 'WEBP', 'AVIF', 'HEIC', 'BMP'],
    supportedOutputs: ['PDF (.pdf)'],
    limitations: ['Very large batches of 100+ high-res photos depend on device memory'],
    faqs: [
      {
        q: 'Can I combine multiple photos into a single PDF document?',
        a: 'Yes. Upload multiple images and select PDF as the target format to combine them into one document.',
      },
      {
        q: 'Can I set standard A4 paper dimensions?',
        a: 'Yes. In the conversion settings, choose A4 or US Letter and adjust margins to fit your printing requirements.',
      },
    ],
  },
  {
    path: '/pdf-to-jpg',
    title: 'PDF to JPG Converter Online – Extract PDF Pages to Images | DocBuilder',
    description: 'Convert PDF document pages into high-resolution JPG or PNG images on-device. Multi-page PDFs automatically packaged as a ZIP archive.',
    h1: 'Convert PDF Pages to JPG & PNG Online',
    tagline: 'Extract crisp, high-DPI image files from any PDF presentation, ticket, or agreement without server uploads.',
    category: 'PDF Tools',
    priority: '0.9',
    instructions: [
      { step: 1, title: 'Upload PDF Document', desc: 'Drag and drop your PDF file into the converter stage.' },
      { step: 2, title: 'Select Target Image Format', desc: 'Choose JPG, PNG, or WEBP with custom DPI and quality settings.' },
      { step: 3, title: 'Export Images', desc: 'Single-page PDFs download immediately; multi-page documents export as an organized ZIP.' },
    ],
    features: [
      'High-definition canvas rendering up to 300 DPI',
      'Automatic ZIP archiving for multi-page documents',
      '100% client-side PDF rasterization',
      'Supports JPG, PNG, and modern WEBP targets',
    ],
    supportedInputs: ['PDF (.pdf)'],
    supportedOutputs: ['JPG (.jpg)', 'PNG (.png)', 'WEBP (.webp)', 'ZIP (.zip)'],
    limitations: ['Text becomes rasterized pixels in the exported image files'],
    faqs: [
      {
        q: 'How are multi-page PDFs handled?',
        a: 'DocBuilder renders each page as an individual image file and packages all pages into a single ZIP archive for one-click downloading.',
      },
      {
        q: 'Can I adjust the image resolution?',
        a: 'Yes. You can configure DPI from 72 up to 300 DPI in the settings drawer for crisp printing or compact web sharing.',
      },
    ],
  },
  {
    path: '/compress-pdf',
    title: 'Compress PDF Online – Reduce PDF File Size Privately | DocBuilder',
    description: 'Compress and optimize PDF documents directly in your browser. Balance file weight and visual fidelity without sending files to the cloud.',
    h1: 'Compress PDF Documents Online',
    tagline: 'Reduce PDF file size for email attachments and portal uploads while maintaining document readability.',
    category: 'Optimization Tools',
    priority: '0.8',
    instructions: [
      { step: 1, title: 'Choose Your PDF', desc: 'Drop your oversized PDF into DocBuilder.' },
      { step: 2, title: 'Adjust Quality Budget', desc: 'Use the quality slider to adjust the compression factor.' },
      { step: 3, title: 'Download Compressed File', desc: 'Export your streamlined PDF document on-device.' },
    ],
    features: [
      'Interactive quality tuning from 10% to 100%',
      'Hardware-accelerated client-side rendering',
      'Zero server uploads — confidential agreements stay secure',
      'Real-time before/after preview',
    ],
    supportedInputs: ['PDF (.pdf)', 'Images'],
    supportedOutputs: ['Compressed PDF (.pdf)', 'Optimized Images'],
    limitations: ['Extreme compression (<20%) may soften fine line art or small text'],
    faqs: [
      {
        q: 'How does DocBuilder compress documents on-device?',
        a: 'DocBuilder re-samples and re-encodes embedded image streams and page geometries using optimized canvas compression buffers in memory.',
      },
      {
        q: 'Will my document quality degrade?',
        a: 'You have full control. At 80-85% quality, documents look virtually identical to the original while reducing size significantly.',
      },
    ],
  },
  {
    path: '/pdf-editor',
    title: 'Free PDF Editor & Digital Signer Online | DocBuilder',
    description: 'Edit, annotate, digitally sign, watermark, rotate, and manage PDF pages online. 100% on-device baking with ISO 32000 interactive popover notes.',
    h1: 'Free Online PDF Editor, Signer & Annotation Studio',
    tagline: 'Sign contracts, insert text notes, drop Help (i) popovers, apply watermarks, and rotate or delete pages with zero cloud storage.',
    category: 'Document Studio',
    priority: '0.9',
    instructions: [
      { step: 1, title: 'Open Document', desc: 'Load any PDF or image document into Doc Studio.' },
      { step: 2, title: 'Annotate & Sign', desc: 'Type text, draw digital signatures, drop interactive Help (i) popups, or toggle watermarks.' },
      { step: 3, title: 'Manage Pages & Export', desc: 'Rotate pages, delete unwanted pages, and click "Export PDF" to bake all edits permanently.' },
    ],
    features: [
      'Digital signature pad with Navy and Black ink presets',
      'Interactive Help (i) pins with native ISO 32000 PDF annotations',
      'Click-to-type customizable text annotations',
      'Page rotation and deletion with full Undo & Redo',
      'Custom watermark engine (CONFIDENTIAL, APPROVED, DRAFT)',
      '100% on-device baking via pdf-lib',
    ],
    supportedInputs: ['PDF (.pdf)', 'PNG', 'JPG', 'WEBP'],
    supportedOutputs: ['Baked PDF (.pdf)'],
    limitations: ['Editing pre-existing embedded text directly like a word processor is not supported; annotations are layered and baked onto the document'],
    faqs: [
      {
        q: 'Are my signatures stored anywhere?',
        a: 'No. Signatures are drawn onto an in-memory canvas and baked directly into the PDF binary. They are never transmitted over any network.',
      },
      {
        q: 'What is the Help (i) icon feature?',
        a: 'It drops an information badge onto the document. In Adobe Acrobat, Apple Preview, or Chrome PDF reader, clicking the badge pops open the note containing your text.',
      },
      {
        q: 'Can I undo my changes?',
        a: 'Yes. Doc Studio provides undo and redo controls so you can safely iterate on annotations and page modifications.',
      },
    ],
  },
  {
    path: '/webp-to-png',
    title: 'WEBP to PNG Converter Online – Free, Private & High-Fidelity | DocBuilder',
    description: 'Convert Google WebP images to transparent, lossless PNG format in your browser. Batch conversion, zero cloud uploads, and instant download.',
    h1: 'Convert WEBP to PNG Online – Fast & Lossless',
    tagline: 'Transcode modern WEBP graphics into universally compatible PNG images with full alpha transparency support.',
    category: 'Image Tools',
    priority: '0.8',
    instructions: [
      { step: 1, title: 'Select WEBP Images', desc: 'Drag and drop your .webp files into the converter.' },
      { step: 2, title: 'Verify Settings', desc: 'Inspect the live split-screen preview and dimensions.' },
      { step: 3, title: 'Download PNG', desc: 'Save single images or download your entire batch as a ZIP.' },
    ],
    features: [
      'Preserves full alpha transparency channel',
      'Instant client-side canvas decoding',
      'Batch conversion and ZIP packaging',
      'No file size restrictions or usage caps',
    ],
    supportedInputs: ['WEBP (.webp)'],
    supportedOutputs: ['PNG (.png)', 'ZIP (.zip)'],
    limitations: ['Animated WebP frames convert the primary still frame into PNG'],
    faqs: [
      {
        q: 'Does converting WebP to PNG preserve transparency?',
        a: 'Yes. PNG supports 32-bit RGBA color, so transparent backgrounds from WebP graphics remain completely intact.',
      },
      {
        q: 'Is there a limit on how many images I can convert?',
        a: 'No. You can convert individual images or entire batches simultaneously.',
      },
    ],
  },
  {
    path: '/avif-to-jpg',
    title: 'AVIF to JPG Converter Online – Free & Private | DocBuilder',
    description: 'Convert modern AVIF images into universally supported JPEG files directly in your browser. 100% on-device processing with zero data uploads.',
    h1: 'Convert AVIF to JPG Online',
    tagline: 'Make next-generation AVIF images compatible with all operating systems, image viewers, and photo editing software.',
    category: 'Image Tools',
    priority: '0.8',
    instructions: [
      { step: 1, title: 'Upload AVIF Files', desc: 'Select or drag your .avif images into DocBuilder.' },
      { step: 2, title: 'Adjust JPG Quality', desc: 'Fine-tune JPEG quality and background color settings.' },
      { step: 3, title: 'Download JPG', desc: 'Export your converted JPEG files instantly.' },
    ],
    features: [
      'Converts AVIF into universal JPEG format',
      'Hardware-accelerated browser decoding',
      'Custom quality tuning from 10% to 100%',
      'Zero server uploads — 100% private',
    ],
    supportedInputs: ['AVIF (.avif)'],
    supportedOutputs: ['JPG (.jpg)', 'ZIP (.zip)'],
    limitations: ['JPEG does not support alpha transparency (transparent areas fill with clean white background)'],
    faqs: [
      {
        q: 'Why convert AVIF to JPG?',
        a: 'While AVIF provides superior web compression, many older image editors, legacy OS viewers, and online forms only accept JPG or PNG.',
      },
      {
        q: 'Are my private photos uploaded to a conversion server?',
        a: 'No. The conversion is performed exclusively on your device using HTML5 Canvas.',
      },
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy & On-Device Security Guarantee | DocBuilder',
    description: 'Learn how DocBuilder protects your privacy with 100% on-device document processing. Zero server uploads, zero cookies, and zero tracking.',
    h1: 'Privacy Policy & Security Architecture',
    tagline: 'Your Documents Never Leave Your Device. Read our technical privacy architecture and on-device data guarantee.',
    category: 'Legal & Trust',
    priority: '0.5',
    instructions: [],
    features: [
      'Zero Cloud Uploads: Documents are decoded and transformed entirely in local memory',
      'No Persistent Storage: Files exist only in volatile RAM during your active session',
      'Zero Third-Party Trackers: No Google Analytics, no telemetry, no tracking pixels',
      'Zero Cookies: We do not set identifying cookies or profiling sessions',
    ],
    supportedInputs: [],
    supportedOutputs: [],
    limitations: [],
    faqs: [
      {
        q: 'Do you store copies of documents or photos?',
        a: 'No. We do not operate file conversion servers or databases. When you close your browser tab, all memory is instantly purged by the browser engine.',
      },
      {
        q: 'Does DocBuilder make external network requests when opening files?',
        a: 'No. All font rendering, character maps (cmaps), WebAssembly modules, and icon assets are hosted locally on our static origin.',
      },
    ],
  },
  {
    path: '/terms',
    title: 'Terms of Service | DocBuilder',
    description: 'Read the Terms of Service for DocBuilder, a free, client-side document workspace and converter.',
    h1: 'Terms of Service',
    tagline: 'Transparent, fair terms for a free, on-device utility.',
    category: 'Legal & Trust',
    priority: '0.5',
    instructions: [],
    features: [
      'Free for personal, academic, and commercial use',
      'Client-side utility provided as-is without warranties',
      'Users retain 100% full intellectual property rights to their files',
    ],
    supportedInputs: [],
    supportedOutputs: [],
    limitations: [],
    faqs: [],
  },
  {
    path: '/about',
    title: 'About DocBuilder – The Private, On-Device Document Workspace',
    description: 'Learn about the mission, engineering architecture, and open technology powering DocBuilder.',
    h1: 'About DocBuilder',
    tagline: 'Reimagining document tools for a privacy-first web. No servers. No paywalls. Pure client-side speed.',
    category: 'Legal & Trust',
    priority: '0.6',
    instructions: [],
    features: [
      'Built with React 18, TypeScript, Vite, and WebAssembly',
      'Engineered for desktop and mobile browsers, iOS, and Android',
      'Created to eliminate privacy risks of uploading confidential documents to cloud converters',
    ],
    supportedInputs: [],
    supportedOutputs: [],
    limitations: [],
    faqs: [],
  },
  {
    path: '/contact',
    title: 'Contact & Feedback | DocBuilder',
    description: 'Get in touch with the DocBuilder team for support, feature suggestions, or bug reports.',
    h1: 'Contact Us & Community Feedback',
    tagline: 'We welcome bug reports, format suggestions, and developer feedback.',
    category: 'Legal & Trust',
    priority: '0.5',
    instructions: [],
    features: [
      'Public GitHub issue tracker for transparency',
      'Feature requests welcome for additional client-side formats',
    ],
    supportedInputs: [],
    supportedOutputs: [],
    limitations: [],
    faqs: [],
  },
];

function generateSemanticContent(route) {
  const instructionsHtml = route.instructions.length > 0
    ? `
      <section style="margin-top: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; color: #f8fafc;">How to Use ${route.h1}</h2>
        <ol style="display: grid; gap: 0.75rem; padding-left: 1.25rem; color: #cbd5e1;">
          ${route.instructions.map(i => `<li><strong>${i.title}:</strong> ${i.desc}</li>`).join('\n          ')}
        </ol>
      </section>
    `
    : '';

  const featuresHtml = route.features.length > 0
    ? `
      <section style="margin-top: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; color: #f8fafc;">Key Features & Privacy Highlights</h2>
        <ul style="display: grid; gap: 0.5rem; padding-left: 1.25rem; color: #cbd5e1;">
          ${route.features.map(f => `<li>${f}</li>`).join('\n          ')}
        </ul>
      </section>
    `
    : '';

  const formatsHtml = (route.supportedInputs.length > 0 || route.supportedOutputs.length > 0)
    ? `
      <section style="margin-top: 2rem; background: rgba(15, 23, 42, 0.6); padding: 1.25rem; border-radius: 1rem; border: 1px solid rgba(51, 65, 85, 0.6);">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #f8fafc;">Supported Formats</h3>
        ${route.supportedInputs.length > 0 ? `<p style="font-size: 0.875rem; color: #94a3b8;"><strong>Supported Inputs:</strong> ${route.supportedInputs.join(', ')}</p>` : ''}
        ${route.supportedOutputs.length > 0 ? `<p style="font-size: 0.875rem; color: #94a3b8; margin-top: 0.25rem;"><strong>Supported Outputs:</strong> ${route.supportedOutputs.join(', ')}</p>` : ''}
        ${route.limitations.length > 0 ? `<p style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.5rem; font-style: italic;"><strong>Technical notes:</strong> ${route.limitations.join('; ')}</p>` : ''}
      </section>
    `
    : '';

  const faqsHtml = route.faqs.length > 0
    ? `
      <section style="margin-top: 2.5rem;">
        <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; color: #f8fafc;">Frequently Asked Questions</h2>
        <dl style="display: grid; gap: 1rem;">
          ${route.faqs.map(f => `
            <div style="background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 0.75rem; border: 1px solid rgba(51, 65, 85, 0.6);">
              <dt style="font-weight: 700; color: #e2e8f0; font-size: 0.95rem;">${f.q}</dt>
              <dd style="color: #94a3b8; margin-top: 0.35rem; font-size: 0.875rem; line-height: 1.5;">${f.a}</dd>
            </div>
          `).join('\n          ')}
        </dl>
      </section>
    `
    : '';

  return `
    <article style="max-width: 56rem; margin: 0 auto; padding: 5rem 1rem 3rem 1rem; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif;">
      <header style="margin-bottom: 2rem;">
        <p style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); margin-bottom: 0.75rem;">
          100% On-Device Processing • Zero Cloud Uploads
        </p>
        <h1 style="font-size: 2rem; font-weight: 900; line-height: 1.2; color: #ffffff; letter-spacing: -0.02em;">${route.h1}</h1>
        <p style="font-size: 1rem; color: #94a3b8; margin-top: 0.75rem; line-height: 1.6;">${route.tagline}</p>
      </header>
      ${instructionsHtml}
      ${featuresHtml}
      ${formatsHtml}
      ${faqsHtml}
      <footer style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(51, 65, 85, 0.6); font-size: 0.85rem; color: #64748b;">
        <p>DocBuilder: The Private On-Device Document Workspace. Permanent URL: <a href="${BASE_URL}" style="color: #818cf8; text-decoration: underline;">${BASE_URL}</a></p>
      </footer>
    </article>
  `;
}

function generateStructuredData(route) {
  const canonicalUrl = `${BASE_URL}${route.path === '/' ? '' : route.path}`;

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'DocBuilder',
    'url': canonicalUrl,
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'All (Web, iOS, Android)',
    'description': route.description,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'browserRequirements': 'Requires JavaScript. Requires HTML5 Canvas & WebAssembly.',
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'DocBuilder',
        'item': `${BASE_URL}/`,
      },
      ...(route.path !== '/' ? [
        {
          '@type': 'ListItem',
          'position': 2,
          'name': route.h1,
          'item': canonicalUrl,
        }
      ] : []),
    ],
  };

  const schemas = [webAppSchema, breadcrumbsSchema];

  if (route.faqs && route.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': route.faqs.map((f) => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': f.a,
        },
      })),
    });
  }

  return schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n    ');
}

async function runPrerender() {
  console.log('⚡ Starting DocBuilder SEO Prerender Engine...');

  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`dist/index.html not found! Run "vite build" before prerendering.`);
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf-8');
  const today = new Date().toISOString().split('T')[0];

  for (const route of ROUTES) {
    const canonicalUrl = `${BASE_URL}${route.path === '/' ? '' : route.path}`;
    const semanticContent = generateSemanticContent(route);
    const structuredData = generateStructuredData(route);

    let html = baseHtml;

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

    // Update description meta
    html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${route.description}" />`);

    // Update canonical link
    html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

    // Update Open Graph tags
    html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${route.title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${route.description}" />`);
    html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

    // Update Twitter Card tags
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${route.title}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${route.description}" />`);

    // Inject structured data right before </head>
    html = html.replace('</head>', `    ${structuredData}\n  </head>`);

    // Inject prerendered semantic content inside <div id="root">
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);

    if (route.path === '/') {
      fs.writeFileSync(indexPath, html, 'utf-8');
      console.log(`✓ Prerendered root / -> dist/index.html`);
    } else {
      const targetDir = path.join(DIST_DIR, route.path.substring(1));
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
      console.log(`✓ Prerendered route ${route.path} -> dist${route.path}/index.html`);
    }
  }

  // Generate 404.html (SPA fallback for GitHub Pages)
  fs.copyFileSync(indexPath, path.join(DIST_DIR, '404.html'));
  console.log('✓ Generated dist/404.html (SPA fallback)');

  // Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(r => `  <url>
    <loc>${BASE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.path === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log('✓ Generated dist/sitemap.xml and public/sitemap.xml');

  // Generate robots.txt
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'robots.txt'), robotsTxt, 'utf-8');
  console.log('✓ Generated dist/robots.txt and public/robots.txt');

  // Ensure CNAME and .nojekyll exist in dist
  fs.writeFileSync(path.join(DIST_DIR, 'CNAME'), 'docbuilder.mysalesforce.in\n', 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf-8');
  console.log('✓ Verified dist/CNAME and dist/.nojekyll');

  console.log('🎉 Prerender complete: All 13 verified routes statically generated with SEO metadata & JSON-LD schemas!');
}

runPrerender().catch((err) => {
  console.error('Prerender error:', err);
  process.exit(1);
});
