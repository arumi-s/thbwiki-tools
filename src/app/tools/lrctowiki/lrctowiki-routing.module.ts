import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LrctowikiComponent } from './lrctowiki.component';

const routes: Routes = [
	{
		path: '',
		component: LrctowikiComponent,
		data: { title: '歌词文本转换' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class LrctowikiRoutingModule {}
