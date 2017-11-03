import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ManagerComponent } from './components/manager/manager.component';
import { AppComponent } from './app.component';
import {enableProdMode} from '@angular/core';

@NgModule({
  declarations: [
    AppComponent, ManagerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
