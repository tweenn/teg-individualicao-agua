import { _GSPS2PDF } from '../lib/worker-init.js';

export default async (
	pdfUintArray: Uint8Array
) => {
	const pdfBlob = new Blob([pdfUintArray as any], { type: 'application/pdf' });
	const pdfUrl = URL.createObjectURL(pdfBlob);

	const compressedPdfBlobUrl: any = await _GSPS2PDF({psDataURL: pdfUrl});

	const compressedPdfBytes = await fetch(compressedPdfBlobUrl)
		.then((response) => response.arrayBuffer())

	window.URL.revokeObjectURL(pdfUrl);
	window.URL.revokeObjectURL(compressedPdfBlobUrl as string);

	return compressedPdfBytes;
};
