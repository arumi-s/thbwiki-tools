import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type SMWBlobValue = string;
export type SMWNumberValue = number;
export interface SMWTimeValue {
	raw: string;
	timestamp: string;
}
export interface SMWWikiPageValue {
	displaytitle: string;
	exists: '1' | '';
	fulltext: string;
	fullurl: string;
	namespace: number;
}

export type SMWDataValue = SMWBlobValue | SMWNumberValue | SMWTimeValue | SMWWikiPageValue;

export interface SMWPrintouts {
	[prop: string]: Array<SMWDataValue>;
}

export interface SMWWikiPage<P extends SMWPrintouts> extends SMWWikiPageValue {
	printouts: P;
}

export interface SMWResults<P extends SMWPrintouts> {
	[title: string]: SMWWikiPage<P>;
}

export interface SMWResultMeta {
	count: number;
	hash: string;
	offset: number;
	source: string;
	time: string;
}

export interface SMWPrintoutSchema {
	[title: string]: SMWDataValue;
}

export interface SMWApiResult<P extends SMWPrintoutSchema> {
	query: {
		meta: {};
		printrequests: {};
		results: SMWResults<
			{
				[T in keyof P]: Array<P[T]>;
			}
		>;
		serializer: string;
		version: number;
	};
}

export interface ApiRequestParams {
	action: string;
	conditions: string;
	printouts: string;
	parameters: string;
}

@Injectable()
export class WikiApiService {
	constructor(private http: HttpClient) {}

	get<P extends SMWPrintoutSchema>(params?: ApiRequestParams) {
		return this.http
			.get('https://thwiki.cc/api.php', {
				params: {
					...params,
					origin: location.origin,
					format: 'json'
				}
			})
			.toPromise() as Promise<SMWApiResult<P>>;
	}

	suggest(title: string, value: string): Promise<Array<string>> {
		return this.http
			.get('https://thwiki.cc/ajax.php', {
				params: {
					action: 'inopt',
					title,
					value
				},
				responseType: 'text'
			})
			.toPromise()
			.then((result: string) => {
				const html = new DOMParser().parseFromString(result, 'text/html');
				return Array.from(html.querySelectorAll('div'))
					.map(child => child.getAttribute('value') ?? child.textContent ?? '')
					.filter(str => str !== '');
			});
	}
}
