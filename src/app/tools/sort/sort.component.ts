import { Component, OnInit } from '@angular/core';
import pinyin from 'chinese-to-pinyin';
import naturalCompare from 'natural-compare';

interface WikiTemplateParams {
	[key: string]: string;
}
interface WikiTemplate {
	name: string;
	text: string;
	sorter?: any;
	params: WikiTemplateParams;
}

const convertMethods: {
	[key: string]: (a: string) => any;
} = {
	文字: text => {
		return text.replace(/\s{2,}/g, ' ');
	},
	拼音: text => {
		return pinyin(text, {
			toneToNumber: true,
			keepRest: true
		}).replace(/\s{2,}/g, ' ');
	},
	数值: text => {
		return parseFloat(text) || 0;
	}
};

const sortMethods: {
	[key: string]: (a: any, b: any) => number;
} = {
	文字: (a: string, b: string) => {
		return naturalCompare(a, b);
	},
	拼音: (a: string, b: string) => {
		return naturalCompare(a, b);
	},
	数值: (a: number, b: number) => {
		return a - b;
	}
};

@Component({
	selector: 'app-sort',
	templateUrl: './sort.component.html',
	styleUrls: ['./sort.component.less']
})
export class SortComponent implements OnInit {
	name = '';
	method = '拼音';
	params: Array<[string, number]> = [];
	methods: Array<string> = Object.keys(sortMethods);
	templates: Array<WikiTemplate> = [];
	text = '';

	constructor() {}

	ngOnInit(): void {}

	sort() {
		this.templates.forEach(template => {
			template.sorter = convertMethods[this.method](template.params[this.name] ?? '');
			console.log(template.sorter);
		});
		this.templates.sort((a, b) => sortMethods[this.method](a.sorter, b.sorter));
		let head = '';
		this.text = this.templates
			.map(template => {
				let text = '';
				let newhead: string = template.sorter.toString().substr(0, 1);
				if (newhead === '') newhead = '?';
				if (head !== newhead) {
					text += '<!-- ' + newhead.toUpperCase() + ' -->\n';
					head = newhead;
				}
				return text + template.text;
			})
			.join('\n');
	}

	updateParams() {
		this.templates = this.extractTemplates(this.text);
		const params: Array<string> = [];
		this.templates.forEach(template => {
			Object.keys(template.params).forEach(key => {
				if (!params.includes(key)) params.push(key);
			});
		});
		this.params = params.map(key => {
			const count = this.templates.reduce(
				(c, template) => c + (template.params[key] != null && template.params[key].trim() !== '' ? 1 : 0),
				0
			);
			return [key, count];
		});
		this.params.sort((a, b) => b[1] - a[1]);

		this.name = this.params?.[0]?.[0] || '';
	}

	extractTemplates(text: string): Array<WikiTemplate> {
		text = text.replace(/<!--.*?-->/g, '');
		return text
			.split(/(?:^|\}\})\s*(?:\{\{|$)/)
			.filter(s => s.trim() !== '')
			.map(s => {
				const args = s.split(/(\|[^\|=\{\}]+=)/g);
				const params: WikiTemplateParams = {};
				const name = args.shift() || '';
				let key = '';
				for (let index = 0; index < args.length; index++) {
					const arg = args[index];
					if (arg.startsWith('|') && arg.endsWith('=')) {
						if (key !== '') params[key] = '';
						key = arg.substring(1, arg.length - 1).trim();
					} else {
						if (key !== '') {
							params[key] = arg.trim();
							key = '';
						}
					}
				}
				return {
					name,
					text: '{{' + s + '}}',
					params
				};
			});
	}
}
