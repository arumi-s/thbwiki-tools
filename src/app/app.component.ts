import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd, RouterState, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { SvgIconRegistryService } from 'angular-svg-icon';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	loading = false;
	title = 'THBWiki工具箱';

	constructor(public titleService: Title, router: Router, private iconReg: SvgIconRegistryService) {
		this.addIcons('github', 'tracks', 'calline', 'lrctowiki', 'circlelyrics', 'event', 'sort', 'list', 'textcolor');
		router.events.subscribe((event: NavigationEnd | RouteConfigLoadStart | RouteConfigLoadEnd) => {
			if (event instanceof NavigationEnd) {
				const title = this.getTitle(router.routerState, router.routerState.root).join('-');
				this.titleService.setTitle(title === '' ? this.title : title + ' - ' + this.title);
			} else if (event instanceof RouteConfigLoadStart) {
				this.loading = true;
			} else if (event instanceof RouteConfigLoadEnd) {
				this.loading = false;
			}
		});
	}

	addIcons(...names: Array<string>) {
		names.forEach(name => this.iconReg.addSvg(name, require('!!raw-loader?!./icons/' + name + '.svg').default as string));
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
