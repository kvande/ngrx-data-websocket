import { Injectable } from '@angular/core';
import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { Person } from '../model/person';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { Update } from '@ngrx/entity';
import { WebSocketService } from './web-socket.service';
import { filter, map, tap } from 'rxjs/operators';

@Injectable()
export class PersonTemplateDataService extends DefaultDataService<Person> {

  // remarks; there can only be one template, therefore id = 1 always

  private personsTemplate = 'personsTemplate';

  constructor(httpClient: HttpClient,
              httpUrlGenerator: HttpUrlGenerator,
              private webSocketService: WebSocketService) {

    super('personsTemplate', httpClient, httpUrlGenerator);
  }


  public update(person: Update<Person>): Observable<Person> {

    this.webSocketService.socket.next({type: this.personsTemplate, payload: person });

    const {firstName, lastName} = person.changes;

    return of({
      firstName,
      lastName,
      id: 1
    });
  }

  public getAll(): Observable<Array<Person>> {

    return this.webSocketService.socket.pipe(
      filter(({type}) => type === this.personsTemplate),   // this service should only handle messages with type 'persontTemplate'
      map(({payload: {id, firstName, lastName}}) => ([
        {
          id,
          firstName,
          lastName
        } as Person
      ]))
    );
  }


}


