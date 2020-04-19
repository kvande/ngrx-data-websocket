import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { Person } from '../model/person';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Update } from '@ngrx/entity';
import { WebSocketService } from './web-socket.service';

@Injectable()
export class PersonDataService extends DefaultDataService<Person> {

  constructor(http: HttpClient,
              httpUrlGenerator: HttpUrlGenerator,
              private webSocketService: WebSocketService) {

    super('persons', http, httpUrlGenerator);
  }

  public getAll(): Observable<Array<Person>> {

    return this.webSocketService.socket.pipe(
      filter(({type}) => type === 'persons'),   // this service should only handle messages with type 'person'
      map(({payload: {id, firstName, lastName}}) => ([ { id, firstName, lastName } as Person ]))
    );
  }


  public update(update: Update<Person>) {
    return super.update(update).
    pipe(
      catchError(() => of(undefined))
    );
  }


}
