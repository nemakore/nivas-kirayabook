const fs = require('fs');

console.log('Building production-ready nivaskirayabook.xml...');

const css = fs.readFileSync('styles.css', 'utf8');
const i18n = fs.readFileSync('i18n.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Extract the body content from index.html (from <div id="privacy-policy-view"> to before <script src="i18n.js">)
const bodyStartMarker = '<div id="privacy-policy-view">';
const bodyEndMarker = '<script src="i18n.js">';

const startIndex = indexHtml.indexOf(bodyStartMarker);
const endIndex = indexHtml.indexOf(bodyEndMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('FAIL: Could not locate body markers in index.html');
  process.exit(1);
}

let bodyHtml = indexHtml.substring(startIndex, endIndex).trim();

// 1. Ensure all <input> tags are self-closing XML: <input ... />
bodyHtml = bodyHtml.replace(/<input(?![^>]*\/>)([^>]*)>/g, '<input$1 />');

// 2. Ensure all <br> tags are self-closing XML: <br />
bodyHtml = bodyHtml.replace(/<br(?![^>]*\/>)[^>]*>/g, '<br />');

// 3. Ensure all <hr> tags are self-closing XML: <hr />
bodyHtml = bodyHtml.replace(/<hr(?![^>]*\/>)[^>]*>/g, '<hr />');

// 4. Ensure all <img> tags are self-closing XML: <img ... />
bodyHtml = bodyHtml.replace(/<img(?![^>]*\/>)([^>]*)>/g, '<img$1 />');

// 5. Convert non-standard HTML entities to numeric XML entities
bodyHtml = bodyHtml.replace(/&copy;/g, '&#169;');
bodyHtml = bodyHtml.replace(/&times;/g, '&#215;');

// 6. Ensure all raw ampersands outside valid XML entities are properly escaped to &amp;
bodyHtml = bodyHtml.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#[xX][0-9a-fA-F]+);)/g, '&amp;');

const xmlContent = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta content='text/html; charset=UTF-8' http-equiv='Content-Type'/>
  <meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <meta content='Nivas KirayaBook - Smart rent collection, electricity bill calculator, and 1-click WhatsApp reminders for landlords.' name='description'/>
  <meta content='#0B0F19' name='theme-color'/>
  <meta content='yes' name='apple-mobile-web-app-capable'/>
  <meta content='black-translucent' name='apple-mobile-web-app-status-bar-style'/>
  <meta content='yes' name='mobile-web-app-capable'/>

  <!-- Google Fonts: Plus Jakarta Sans & Outfit -->
  <link href='https://fonts.googleapis.com' rel='preconnect'/>
  <link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/>
  <link href='https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap' rel='stylesheet'/>

  <!-- Firebase App, Auth & Firestore SDKs (Compat for static/Blogger) -->
  <script src='https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js'></script>
  <script src='https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js'></script>
  <script src='https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'></script>

  <!-- Mandatory Blogger Skin Tag -->
  <b:skin><![CDATA[
  /* Mandatory Blogger b:skin container */

/* --- Blogger Essential Framework Reset for Standalone Web App --- */
#navbar, #navbar-iframe-container, .navbar, .quickedit, .Attribution, #Attribution1, .status-msg-wrap, #header, .header, #footer, .footer {
  display: none !important;
  height: 0 !important;
  visibility: hidden !important;
}
#main-section, .main-section {
  display: none !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-height: 100vh !important;
  background-color: #0B0F19 !important;
}

  ]]></b:skin>

  <link href='icon.svg' rel='icon' type='image/svg+xml'/>
  <link href='icon-192.png' rel='apple-touch-icon'/>
  <link href='manifest.json' rel='manifest'/>

  <!-- Complete Nivas KirayaBook Application Styles -->
  <style type='text/css'>
  /*<![CDATA[*/
${css}
  /*]]>*/
  </style>
</head>

<body>
  <!-- Mandatory Blogger Section & Blog Widget (Hidden so it satisfies Blogger parser without polluting UI) -->
  <b:section class='main-section' id='main-section' showaddelement='no' style='display:none !important;'>
    <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog' version='2'>
      <b:includable id='main' var='top'/>
    </b:widget>
  </b:section>

  <!-- Automatic Route Handler: If URL is /p/privacy-policy.html or contains privacy, show Privacy Policy view -->
  <script type='text/javascript'>
    //<![CDATA[
    (function () {
      var p = window.location.pathname.toLowerCase();
      var h = window.location.hash.toLowerCase();
      if (p.indexOf('privacy') !== -1 || p.indexOf('/p/') !== -1 || h.indexOf('privacy') !== -1) {
        document.documentElement.classList.add('show-privacy-page');
      }
    })();
    //]]>
  </script>

  ${bodyHtml}

  <!-- Multi-Language Localization Engine (i18n.js) -->
  <script type='text/javascript'>
  //<![CDATA[
${i18n}
  //]]>
  </script>

  <!-- Core Application Logic (app.js) -->
  <script type='text/javascript'>
  //<![CDATA[
${app}
  //]]>
  </script>
</body>
</html>
`;

fs.writeFileSync('nivaskirayabook.xml', xmlContent, 'utf8');
console.log('SUCCESS: Generated production-ready nivaskirayabook.xml (' + (Buffer.byteLength(xmlContent) / 1024).toFixed(1) + ' KB)');
