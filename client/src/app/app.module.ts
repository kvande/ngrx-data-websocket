import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { PersonEntityService } from './services/person-entity.service';
import {
  EntityMetadataMap,
  EntityDataModule,
  EntityDataService,
} from '@ngrx/data';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PersonDataService } from './services/person-data.service';
import { RouteInterceptor } from './app-route.interceptor';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import { ReactiveFormsModule } from '@angular/forms';
import { PersonTemplateService } from './services/person-template-entity.service';
import { PersonTemplateDataService } from './services/person-template-data.service';
import { WebSocketService } from './services/web-socket.service';

const entityMetadata: EntityMetadataMap = {
  persons: {},
  personsTemplate: {}
};


@NgModule({
  declarations: [AppComponent],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25
    }),
    EntityDataModule.forRoot({entityMetadata}),
  ],
  providers: [
    PersonEntityService,
    PersonTemplateService,
    PersonDataService,
    PersonTemplateDataService,
    WebSocketService,
    { provide: HTTP_INTERCEPTORS, useClass: RouteInterceptor, multi: true},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    entityDataService: EntityDataService,
    personDataService: PersonDataService,
    personTemplateDataService: PersonTemplateDataService) {

    entityDataService.registerService('persons', personDataService);
    entityDataService.registerService('personsTemplate', personTemplateDataService);
  }
}
