import { Component, OnInit } from '@angular/core';
import Pickr from '@simonwep/pickr';
import { FormGroup, FormControl } from '@angular/forms';

type Color = [number, number, number];
function lerp(fr: number, to: number, x: number): number {
	return (1 - x) * fr + x * to;
}
function lerpColor(fr: Color, to: Color, x: number): Color {
	return [lerp(fr[0], to[0], x), lerp(fr[1], to[1], x), lerp(fr[2], to[2], x)];
}

@Component({
	selector: 'app-textcolor',
	templateUrl: './textcolor.component.html',
	styleUrls: ['./textcolor.component.less']
})
export class TextcolorComponent implements OnInit {
	form: FormGroup;
	text = '请输入文本';
	result = '';

	constructor() {
		this.form = new FormGroup({
			background: new FormControl('#FFFFFF'),
			start: new FormControl('#FF0000'),
			end: new FormControl('#0000FF')
		});
	}

	ngOnInit(): void {
		this.update();
	}

	formColor(color: string | Pickr.HSVaColor): string {
		if (color) {
			if (typeof color === 'string') {
				return color;
			} else {
				return `#${(color as Pickr.HSVaColor).toHEXA().join('')}`;
			}
		}
		return '';
	}

	update(): void {
		const start = this.toRGB(this.form.get('start')?.value);
		const end = this.toRGB(this.form.get('end')?.value);
		const bg = this.formColor(this.form.get('background')?.value);
		const trueStart = this.trueColor(start);
		const trueEnd = this.trueColor(end);
		const length = Math.max(this.text.length - 1, 1);
		this.result = this.text
			.split('')
			.map((char, index) => {
				const colorStop = this.fakeColor(lerpColor(trueStart, trueEnd, index / length));
				return `<span style="color:${this.toHEX(colorStop)}">${char}</span>`;
			})
			.join('');
		if (bg !== '#ffffff') {
			this.result = `<span style="background-color:${bg}">${this.result}</span>`;
		}
	}

	toRGB(color: string | Pickr.HSVaColor): Color {
		if (typeof color === 'string') {
			const m = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
			if (m) {
				return [parseInt(m[1], 16) || 0, parseInt(m[2], 16) || 0, parseInt(m[3], 16) || 0];
			}
		} else {
			return (color as Pickr.HSVaColor).toRGBA() as Color;
		}
		return [0, 0, 0];
	}

	toHEX(color: Color) {
		return (
			'#' +
			Math.floor(color[0])
				.toString(16)
				.padStart(2, '0') +
			Math.floor(color[1])
				.toString(16)
				.padStart(2, '0') +
			Math.floor(color[2])
				.toString(16)
				.padStart(2, '0')
		);
	}

	trueColor(color: Color): Color {
		return [color[0] * color[0], color[1] * color[1], color[2] * color[2]];
	}

	fakeColor(color: Color): Color {
		return [Math.sqrt(color[0]), Math.sqrt(color[1]), Math.sqrt(color[2])];
	}
}
