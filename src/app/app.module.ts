import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StarRatingModule } from 'angular-rating-star';
import { BarRatingModule } from "ngx-bar-rating";
import { RatingModule } from "ngx-rating";
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';
import { NgForm ,Validators, FormBuilder, FormGroup} from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { CalendarModule } from '@progress/kendo-angular-dateinputs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BarRatingModule,
    StarRatingModule,
    RatingModule,
    NgSqUiModule,
    DateInputsModule,
    CalendarModule
  ],
  providers: [
  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
