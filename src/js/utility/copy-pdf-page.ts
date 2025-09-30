import { PDFDocument } from 'pdf-lib';

export default async (
	originalPdf: PDFDocument,
	pagesToCopy: number[] = []
) => {
	const newPdfDoc = await PDFDocument.create();
	const [copiedPage] = await newPdfDoc.copyPages(originalPdf,pagesToCopy);
	newPdfDoc.addPage(copiedPage);

	return newPdfDoc.save();
};
