import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { WikiApiService, SMWWikiPageValue } from '../../services/wiki-api.service';
import { map, distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';

interface LyricsPage {
	fulltext: string;
	fullurl: string;
	exists: boolean;
	albums: Array<SMWWikiPageValue>;
}

@Component({
	selector: 'app-circlelyrics',
	templateUrl: './circlelyrics.component.html',
	styleUrls: ['./circlelyrics.component.less']
})
export class CirclelyricsComponent implements OnInit, OnDestroy {
	circleInput$ = new BehaviorSubject<string>('');
	circleSuggest$: Observable<Array<string>>;
	circleSub: Subscription;
	list: Array<LyricsPage> = [];
	loading = false;

	constructor(private route: ActivatedRoute, private router: Router, private wikiApi: WikiApiService) {}

	ngOnInit(): void {
		this.circleSub = this.route.paramMap
			.pipe(
				map((params: ParamMap) => (params.has('circle') ? this.trimTitle(params.get('circle') ?? '') : '')),
				distinctUntilChanged()
			)
			.subscribe(circle => this.onCircleChange(circle));
		this.circleSuggest$ = this.circleInput$.pipe(
			debounceTime(200),
			distinctUntilChanged(),
			switchMap(term => this.wikiApi.suggest('制作方建议', term))
		);
	}

	async onCircleChange(circle: string) {
		if (circle === '') return;
		this.loading = true;
		this.list = [];
		this.circleInput$.next(circle);
		const json = await this.wikiApi.get<{ '-曲目歌词': SMWWikiPageValue }>({
			action: 'askargs',
			conditions: '-曲目歌词.制作方:: ' + circle.replace(/\s/, '_'),
			printouts: '-曲目歌词',
			parameters: 'limit=2000'
		});
		const results = json?.query?.results;
		if (results != null) {
			this.list = Object.values(json.query.results).map(row => {
				const exists = row.exists === '1';
				const fullurl = row.fullurl.replace(/\#\d+$/, '');
				return {
					fulltext: row.fulltext,
					fullurl,
					fullurlreal: exists ? fullurl : fullurl + '?action=edit&redlink=1',
					exists,
					albums: row.printouts['-曲目歌词'].map(album => {
						album.fullurl = album.fullurl.replace(/\#\d+$/, '');
						return album;
					})
				};
			});
		}
		this.loading = false;
	}

	query() {
		if (!this.loading) this.router.navigate(['circlelyrics', this.circleInput$.value.trim().replace(/\s/, '_')]);
	}

	ngOnDestroy(): void {
		if (this.circleSub) this.circleSub.unsubscribe();
	}

	trimTitle(circle: string) {
		return circle.replace(/_|\s+/, ' ').trim();
	}

	editUrl(url: string) {
		return url + '?action=edit';
	}

	selectSuggest($event: MouseEvent, value: string) {
		this.circleInput$.next(value);
		($event.target as HTMLElement).blur();
	}
}
