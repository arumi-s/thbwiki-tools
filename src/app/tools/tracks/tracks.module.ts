import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { TracksComponent } from './tracks.component';
import { TracksRoutingModule } from './tracks-routing.module';
import { DropfileModule } from 'src/app/directives/dropfile.module';

@NgModule({
	declarations: [TracksComponent],
	imports: [CommonModule, FormsModule, ClipboardModule, TracksRoutingModule, DropfileModule]
})
export class TracksModule {}
