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

import { _GSPS2PDF } from '../lib/worker-init.js';

function App() {
	const pagesPerFile = 50;

	const [uppy] = useState(() => new Uppy());
	const [pdf, setPdf]: [any, any] = useState(false);
	const [totalNumberOfZipFiles, setTotalNumberOfZipFiles] = useState(0);
	const [currentZipBeingProcessed, setCurrentZipBeingProcessed] = useState(0);
	const [totalNumberOfPdfFiles, setTotalNumberOfPdfFiles] = useState(0);
	const [currentPdfBeingProcessed, setCurrentPdfBeingProcessed] = useState(0);

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
		const existingPdfBytes = await pdf.data.arrayBuffer(); // For browser

		const pdfDoc = await PDFDocument.load(existingPdfBytes);
		const numberOfPages = pdfDoc.getPageCount();

		const numberOfZips = Math.ceil(numberOfPages / pagesPerFile);

		setTotalNumberOfPdfFiles(numberOfPages);
		setTotalNumberOfZipFiles(numberOfZips);

		for (let zipIndex = 0; zipIndex < numberOfZips; zipIndex++) {
			const zip = new JSZip();

			for (let pdfIndex = 0; pdfIndex < pagesPerFile; pdfIndex ++) {
				const pdfPage = (zipIndex * pagesPerFile) + pdfIndex;

				setCurrentPdfBeingProcessed(pdfPage + 1)

				if (pdfPage >= numberOfPages) {
					pdfIndex = pagesPerFile;
					return;
				}

				const newPdfDoc = await PDFDocument.create();
				const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pdfPage]);
				newPdfDoc.addPage(copiedPage);

				const pdfBytes = await newPdfDoc.save();

				const pdfBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
				const pdfUrl = URL.createObjectURL(pdfBlob);

				const compressedPdfBlobUrl: any = await _GSPS2PDF({psDataURL: pdfUrl});

				const compressedPdfBytes = await fetch(compressedPdfBlobUrl)
					.then((response) => response.arrayBuffer())

				window.URL.revokeObjectURL(pdfUrl);
				window.URL.revokeObjectURL(compressedPdfBlobUrl as string);

				zip.file(`Page ${pdfPage + 1}.pdf`, compressedPdfBytes);
			}

			const zippedUint8Array = await zip.generateAsync({ type: "uint8array" });

			setCurrentZipBeingProcessed(zipIndex + 1);

			const pageFrom = (zipIndex * pagesPerFile + 1).toString();
			const pageTo = (zipIndex * pagesPerFile + pagesPerFile).toString();

			const blob = new Blob([zippedUint8Array as any], { type: 'application/zip' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `pages_${pageFrom}_to_${pageTo}.zip`;
			a.click();
		}
	}

	return (
		<UppyContextProvider uppy={uppy}>
			<main className="p-5 max-w-xl mx-auto">
				<h1 className="text-4xl font-bold my-4">
					PDF Splitter
				</h1>

				<article>
					<h2 className="text-2xl my-4">With list</h2>

					<div style={
						`display: ${pdf === false ? 'inherit' : 'nonee'}`
					}>
						<Dropzone />
					</div>

					<FilesList />
				</article>
				{ totalNumberOfPdfFiles > 0 && totalNumberOfZipFiles > 0 && (
					<article>
						<p>Processing Page</p>
						<p>{currentPdfBeingProcessed} / {totalNumberOfPdfFiles}</p>
						<p>Processing Zip</p>
						<p>{currentZipBeingProcessed} / { totalNumberOfZipFiles }</p>
					</article>
				)}
			</main>
		</UppyContextProvider>
	);
}

export default App
