import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class RedirectGuard implements CanActivate {
	constructor(private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		const newUrl =
			'/' +
			state.url
				.substr(1)
				.replace(/[^a-z0-9].*$/, '')
				.toLowerCase();
		if (newUrl !== state.url) {
			this.router.navigate([newUrl]);
		} else {
			this.router.navigate(['']);
		}
		return true;
	}
}
