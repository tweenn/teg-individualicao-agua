/** biome-ignore-all lint/nursery/useUniqueElementIds: it's fine */
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import Uppy from '@uppy/core';
import {
	Dropzone,
	FilesList,
	UppyContextProvider,
} from '@uppy/react';

import { useEffect, useState } from 'preact/compat';

import copyPdfPage from '../utility/copy-pdf-page.js';
import compressPdf from '../utility/compress-pdf.js';
import downloadZip from '../utility/download-zip.js';

function App() {
	const NUMBER_OF_CONCURRENT_FILES = 10;
	const [uppy] = useState(() => new Uppy());
	const [pdf, setPdf]: [any, any] = useState(false);
	const [totalPdfPages, setTotalPdfPages] = useState(0)
	const [currentPdfPageBeingProcessed, setCurrentPdfPageBeingProcessed] = useState('0');

	useEffect(() => {
		uppy.on('file-added', (_file: any) => {
			const pdfFile = Object.entries(
				uppy.store.getState()?.files || {}
			)
				.map(([_key, value]) => value)
				.filter((file: any) => file.type === 'application/pdf')
				?.[0];

			if (!pdf) {
				setPdf(pdfFile);
			}
		});
	}, []);

	useEffect(() => {
		if (pdf) {
			splitAndZip();
		}
	}, [pdf]);

	const splitAndZip = async () => {
		const existingPdfBytes = await pdf.data.arrayBuffer();

		const pdfDoc = await PDFDocument.load(existingPdfBytes);
		const numberOfPages = pdfDoc.getPageCount();
		setTotalPdfPages(numberOfPages);

		const zip = new JSZip();

		const numberOfJobs = Math.ceil(numberOfPages / NUMBER_OF_CONCURRENT_FILES);

		for (let jobIndex = 0; jobIndex < numberOfJobs; jobIndex ++) {
			const jobsRunning = jobIndex + 1 === numberOfJobs
				? (numberOfPages % NUMBER_OF_CONCURRENT_FILES)
				: NUMBER_OF_CONCURRENT_FILES;

			const pageFrom = (jobIndex * NUMBER_OF_CONCURRENT_FILES) + 1;
			let pageTo = (jobIndex + 1) * NUMBER_OF_CONCURRENT_FILES;
			pageTo = pageTo < numberOfPages
				? pageTo
				: numberOfPages;

			setCurrentPdfPageBeingProcessed(`${pageFrom}~${pageTo}`);

			const promisses = new Array(jobsRunning)
				.fill(true, 0, jobsRunning)
				.map(async (_value, index) => {
					const pdfIndex = jobIndex * NUMBER_OF_CONCURRENT_FILES + index;
					const pdfPage = pdfIndex + 1;

					const pdfBytes = await copyPdfPage(
						pdfDoc,
						[pdfIndex]
					);

					const compressedPdfBytes = await compressPdf(pdfBytes);

					zip.file(`Page ${pdfPage}.pdf`, compressedPdfBytes);
				});

			await Promise.all(promisses);
		}

		const zippedUint8Array = await zip.generateAsync({ type: "uint8array" });

		downloadZip(zippedUint8Array);
	}

	return (
		<UppyContextProvider uppy={uppy}>
			<main className="p-5 max-w-xl mx-auto">
				<h1 className="text-4xl font-bold my-4">
					PDF Splitter
				</h1>

				<article>
					<div style={
						`display: ${pdf === false ? 'inherit' : 'nonee'}`
					}>
						<Dropzone />
					</div>

					<FilesList />
				</article>
				{ totalPdfPages > 0 && (
					<article>
						<p>Processing Page</p>
						<p>{currentPdfPageBeingProcessed} / {totalPdfPages}</p>
					</article>
				)}
			</main>
		</UppyContextProvider>
	);
}

export default App
