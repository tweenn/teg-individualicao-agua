const towerBreak = 156;

export default (jobIndex: number) => {
	const realIndex = jobIndex < towerBreak
		? jobIndex
		: jobIndex - towerBreak;

	let apartment: number | string = (realIndex + 1) % 10;
	apartment = apartment === 0
		? 10
		: apartment;
	apartment = `0${apartment}`.slice(-2);

	let floor: number | string = Math.floor(realIndex / 10);
	floor = `0${floor}`.slice(-2);

	const tower = jobIndex < towerBreak
		? 'A'
		: 'B';

	return `${tower}${floor}${apartment}.pdf`;
}
