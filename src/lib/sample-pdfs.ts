/**
 * Synthetic Sample PDF Generator for In-Browser Testing
 * Generates genuine minimal PDF file streams (with and without outline objects)
 */

export function createSamplePdfBlob(options: {
  title: string;
  withOutlines: boolean;
  pageCount?: number;
}): { file: File; buffer: ArrayBuffer } {
  const pages = options.pageCount || 16;
  const { title, withOutlines } = options;

  let pdfContent = `%PDF-1.4
%âãÏÓ
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R`;

  if (withOutlines) {
    pdfContent += `
  /Outlines 3 0 R`;
  }

  pdfContent += `
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Count ${pages}
  /Kids [ 4 0 R 5 0 R ]
>>
endobj
`;

  if (withOutlines) {
    pdfContent += `3 0 obj
<<
  /Type /Outlines
  /Count 4
  /Title (${title} Table of Contents)
>>
endobj
`;
  }

  // Page 1
  pdfContent += `4 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 6 0 R
  /Resources << >>
>>
endobj
5 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 7 0 R
  /Resources << >>
>>
endobj
6 0 obj
<< /Length 120 >>
stream
BT
/F1 24 Tf
72 700 Td
(${title}) Tj
0 -40 Td
/F1 14 Tf
(Chapter 1: Foundational Architecture & Core Paradigms) Tj
ET
endstream
endobj
7 0 obj
<< /Length 110 >>
stream
BT
/F1 18 Tf
72 700 Td
(Chapter 2: Data Replication and Scalability Invariants) Tj
ET
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000015 00000 n 
0000000100 00000 n 
0000000180 00000 n 
0000000250 00000 n 
0000000340 00000 n 
0000000430 00000 n 
0000000600 00000 n 
trailer
<<
  /Size 8
  /Root 1 0 R
>>
startxref
750
%%EOF`;

  const encoder = new TextEncoder();
  const buffer = encoder.encode(pdfContent).buffer;
  const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${withOutlines ? 'with_outlines' : 'text_only'}.pdf`;
  const file = new File([buffer], fileName, { type: 'application/pdf' });

  return { file, buffer };
}
