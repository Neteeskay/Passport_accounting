type PrintElementOptions = {
  orientation?: "landscape" | "portrait";
  title: string;
};

export function printElement(element: HTMLElement | null, options: PrintElementOptions) {
  if (!element) {
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.bottom = "0";
  iframe.style.height = "0";
  iframe.style.left = "0";
  iframe.style.opacity = "0";
  iframe.style.position = "fixed";
  iframe.style.width = "0";

  document.body.append(iframe);

  const printDocument = iframe.contentDocument;

  if (!printDocument) {
    iframe.remove();
    return;
  }

  printDocument.open();
  printDocument.write(buildPrintDocument(element.outerHTML, options));
  printDocument.close();

  window.setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 500);
  }, 150);
}

function buildPrintDocument(content: string, options: PrintElementOptions) {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(options.title)}</title>
    ${collectPageStyles()}
    <style>
      @page {
        margin: 10mm;
        size: A4 ${options.orientation ?? "portrait"};
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        background: #ffffff !important;
        color: #1f2430;
        margin: 0;
        min-height: 0;
        width: 100%;
      }

      body {
        padding: 0;
      }

      body > .print-root {
        width: 100%;
      }

      .print-root,
      .print-root * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        visibility: visible !important;
      }

      .print-root {
        max-height: none !important;
        overflow: visible !important;
      }

      .print-root .overflow-y-auto,
      .print-root .overflow-hidden {
        overflow: visible !important;
      }
    </style>
  </head>
  <body>
    <div class="print-root">${content}</div>
  </body>
</html>`;
}

function collectPageStyles() {
  return Array.from(document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
