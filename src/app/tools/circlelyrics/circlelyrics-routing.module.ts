import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CirclelyricsComponent } from './circlelyrics.component';

const routes: Routes = [
	{
		path: '',
		component: CirclelyricsComponent,
		data: { title: '社团歌词进度' }
	},
	{
		path: ':circle',
		component: CirclelyricsComponent,
		data: { title: '社团歌词进度' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CirclelyricsRoutingModule {}
