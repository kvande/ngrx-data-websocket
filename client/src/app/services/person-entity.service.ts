
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Person } from '../model/person';
import { Injectable } from '@angular/core';

@Injectable()
export class PersonEntityService extends EntityCollectionServiceBase<Person> {

  constructor(ecs: EntityCollectionServiceElementsFactory) {
    super('persons', ecs);

  }



}
