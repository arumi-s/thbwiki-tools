import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd, RouterState } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	title = 'THBWiki工具';

	constructor(public titleService: Title, router: Router) {
		router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				const title = this.getTitle(router.routerState, router.routerState.root).join('-');
				this.titleService.setTitle(title === '' ? this.title : title);
			}
		});
	}

	getTitle(state: RouterState, parent: ActivatedRoute | null) {
		const data: Array<string> = [];
		if (parent && parent.snapshot.data && parent.snapshot.data.title) {
			data.push(parent.snapshot.data.title);
		}

		if (state && parent) {
			data.push(...this.getTitle(state, parent.firstChild));
		}
		return data;
	}
}
