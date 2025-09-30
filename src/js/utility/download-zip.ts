export default (
	zippedUint8Array: Uint8Array
) => {
	const blob = new Blob([zippedUint8Array as any], { type: 'application/zip' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `compressed-pages.zip`;
	a.click();
};
