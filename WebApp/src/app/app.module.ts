import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { GraphicsComponent } from './components/graphics/graphics.component';
import { AppComponent } from './app.component';
import {enableProdMode} from '@angular/core';

@NgModule({
  declarations: [
    AppComponent, GraphicsComponent
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
