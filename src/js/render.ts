import {
	createElement,
	render
} from 'preact';

import App from './components/app';

export default () => {
	render(
		createElement(App, {}),
		document.body
	);
};
