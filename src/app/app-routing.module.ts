import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RedirectGuard } from './services/redirect-guard';

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
		path: 'sort',
		loadChildren: () => import('./tools/sort/sort.module').then(m => m.SortModule)
	},
	{
		path: 'list',
		loadChildren: () => import('./tools/list/list.module').then(m => m.ListModule)
	},
	{
		path: 'event',
		loadChildren: () => import('./tools/event/event.module').then(m => m.EventModule)
	},
	{
		path: 'tracks',
		loadChildren: () => import('./tools/tracks/tracks.module').then(m => m.TracksModule)
	},
	{
		path: 'circlelyrics',
		loadChildren: () => import('./tools/circlelyrics/circlelyrics.module').then(m => m.CirclelyricsModule)
	},
	{
		path: 'crop',
		loadChildren: () => import('./tools/crop/crop.module').then(m => m.CropModule)
	},
	{
		path: '**',
		canActivate: [RedirectGuard],
		component: HomeComponent
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
	exports: [RouterModule]
})
export class AppRoutingModule {}
