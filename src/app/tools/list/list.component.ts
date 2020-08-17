import { Component, OnInit } from '@angular/core';
import naturalCompare from 'natural-compare';

type Action = (list: Array<string>) => Array<string>;

const Actions: { [name: string]: Action } = {
	lowercase: list => list.map((v, i, a) => v.toLowerCase()),
	uppercase: list => list.map((v, i, a) => v.toUpperCase()),
	uppercaseword: list => list.map((v, i, a) => v.toLowerCase().replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g, s => s.toUpperCase())),
	count: list => {
		const map: { [key: string]: number } = {};
		list.forEach(v => {
			map[v] = (map[v] || 0) + 1;
		});
		return Object.keys(map)
			.sort((a, b) => map[b] - map[a])
			.map(key => `${key}: ${map[key]}`);
	},
	sort: list => list.sort(),
	natural_sort: list => list.sort(naturalCompare),
	reverse: list => list.reverse(),
	shuffle: list => {
		for (let i = list.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = list[i];
			list[i] = list[j];
			list[j] = temp;
		}
		return list;
	},
	remove_empty: list => list.filter((v, i, a) => v !== ''),
	trim: list => list.map((v, i, a) => v.trim()),
	keep_number: list => list.filter((v, i, a) => v !== '' && !isNaN(+v)),
	keep_ascii: list => list.filter((v, i, a) => v !== '' && !/[^\x00-\x7f]/.test(v)),
	keep_unique: list => list.filter((v, i, a) => a.indexOf(v) === i),
	keep_duplicate: list => list.filter((v, i, a) => a.indexOf(v) !== i)
};

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit {
	name = '';
	text = '';

	constructor() {}

	ngOnInit(): void {}

	pipe(name: string) {
		if (Actions.hasOwnProperty(name)) {
			this.text = Actions[name](this.text.split(/\r?\n/)).join('\n');
		}
	}
}
