import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Person } from '../model/person';
import { Injectable } from '@angular/core';

@Injectable()
export class PersonTemplateService extends EntityCollectionServiceBase<Person> {

  constructor(ecs: EntityCollectionServiceElementsFactory) {
    super('personsTemplate', ecs);
  }


}



