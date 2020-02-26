import Pickr from '@simonwep/pickr';

export const themes: { [key: string]: Pickr.Options } = {
	classic: {
		el: '',
		theme: 'classic',
		swatches: [
			'rgba(244, 67, 54, 1)',
			'rgba(233, 30, 99, 0.95)',
			'rgba(156, 39, 176, 0.9)',
			'rgba(103, 58, 183, 0.85)',
			'rgba(63, 81, 181, 0.8)',
			'rgba(33, 150, 243, 0.75)',
			'rgba(3, 169, 244, 0.7)',
			'rgba(0, 188, 212, 0.7)',
			'rgba(0, 150, 136, 0.75)',
			'rgba(76, 175, 80, 0.8)',
			'rgba(139, 195, 74, 0.85)',
			'rgba(205, 220, 57, 0.9)',
			'rgba(255, 235, 59, 0.95)',
			'rgba(255, 193, 7, 1)'
		],

		components: {
			preview: true,
			opacity: true,
			hue: true,
			interaction: {
				hex: true,
				rgba: true,
				hsva: true,
				input: true,
				clear: true,
				save: true
			}
		}
	},
	monolith: {
		el: '',
		theme: 'monolith',
		swatches: [
			'rgba(244, 67, 54, 1)',
			'rgba(233, 30, 99, 0.95)',
			'rgba(156, 39, 176, 0.9)',
			'rgba(103, 58, 183, 0.85)',
			'rgba(63, 81, 181, 0.8)',
			'rgba(33, 150, 243, 0.75)',
			'rgba(3, 169, 244, 0.7)'
		],

		defaultRepresentation: 'HEXA',
		components: {
			preview: true,
			opacity: true,
			hue: true,

			interaction: {
				hex: false,
				rgba: false,
				hsva: false,
				input: true,
				clear: true,
				save: true
			}
		}
	},
	nano: {
		el: '',
		theme: 'nano',
		swatches: [
			'#FFFF00',
			'#FFE000',
			'#FFC000',
			'#FFA000',
			'#FF8000',
			'#FF6000',
			'#FF4000',
			'#FF0000',
			'#E00000',
			'#C00000',
			'#FFC0FF',
			'#FFA0FF',
			'#FF80FF',
			'#FF60FF',
			'#FF00FF',
			'#E000FF',
			'#C000FF',
			'#A000FF',
			'#8000FF',
			'#00FFFF',
			'#00E0FF',
			'#00C0FF',
			'#00A0FF',
			'#0080FF',
			'#0060FF',
			'#0000FF',
			'#0000E0',
			'#0000C0',
			'#D0FF00',
			'#A0FF00',
			'#80FF00',
			'#00FF00',
			'#00E000',
			'#00C000',
			'#00A000',
			'#008000',
			'#00A0A0',
			'#A0A000',
			'#A0A0A0',
			'#A0A0E0',
			'#E0A0A0',
			'#A0E0A0'
		],

		defaultRepresentation: 'HEXA',
		components: {
			// Main components
			preview: true,
			opacity: false,
			hue: true,

			// Input / output Options
			interaction: {
				hex: false,
				rgba: false,
				hsla: false,
				hsva: false,
				cmyk: false,
				input: true,
				cancel: true,
				clear: false,
				save: false
			}
		}
	}
};
