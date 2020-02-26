import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RedirectGuard } from './services/redirect-guard';

/*
https://tool.thwiki.cc/calLine.html
https://tool.thwiki.cc/lrctowiki.html
https://tool.thwiki.cc/textcolor.html
*/

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: HomeComponent
	},
	{
		path: 'lrctowiki',
		loadChildren: () => import('./tools/lrctowiki/lrctowiki.module').then(m => m.LrctowikiModule)
	},
	{
		path: 'calline',
		loadChildren: () => import('./tools/calline/calline.module').then(m => m.CallineModule)
	},
	{
		path: 'textcolor',
		loadChildren: () => import('./tools/textcolor/textcolor.module').then(m => m.TextcolorModule)
	},

	{
		path: '**',
		canActivate: [RedirectGuard],
		component: HomeComponent
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
