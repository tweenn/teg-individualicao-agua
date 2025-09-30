import { PDFDocument } from 'pdf-lib';

import copyPdfPage from './copy-pdf-page.js';
import compressPdf from './compress-pdf.js';

import pdfNameProcessor from './pdf-name-processor.js';

export default (
	jobIndex: number,
	numberOfJobs: number,
	numberOfPages: number,
	pdfDoc: PDFDocument
) => {
	const NUMBER_OF_CONCURRENT_FILES = parseInt(import.meta?.env?.VITE_NUMBER_OF_CONCURRENT_JOBS || 10);

	const jobsRunning = jobIndex + 1 === numberOfJobs
		? (numberOfPages % NUMBER_OF_CONCURRENT_FILES)
		: NUMBER_OF_CONCURRENT_FILES;

	return new Array(jobsRunning)
		.fill(true, 0, jobsRunning)
		.map(async (_value, index) => {
			const pdfIndex = jobIndex * NUMBER_OF_CONCURRENT_FILES + index;

			const pdfBytes = await copyPdfPage(
				pdfDoc,
				[pdfIndex]
			);

			const compressedPdfBytes = await compressPdf(pdfBytes);

			const name = pdfNameProcessor(pdfIndex);

			return {
				name,
				bin: compressedPdfBytes
			}
		});
}
