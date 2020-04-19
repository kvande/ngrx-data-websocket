import { Component, OnInit } from '@angular/core';
import { PersonEntityService } from './services/person-entity.service';
import { Observable } from 'rxjs';
import { Person } from './model/person';
import { map, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PersonTemplateService } from './services/person-template-entity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  /*
    The backend uses the 'person tempate' to generate new person entites.
    First thing that must happen on start up is to set this template in the
    backend. The ui will have means to update this template as the app runs
  */

  public firstName: string;
  public lastName: string;

  public formGroup: FormGroup;
  public persons$: Observable<Array<Person>>;

  constructor(private formBuilder: FormBuilder,
              private personTemplateService: PersonTemplateService,
              private personEntityService: PersonEntityService) {}

  public ngOnInit() {

    this.setupFormGroup();
    this.setInitialState();
    this.startDataRetrieval();
  }

  private setupFormGroup() {

    this.formGroup = this.formBuilder.group({
      firstName: ['John'],
      lastName: ['Smith']
    });

    this.formGroup.valueChanges.subscribe(_ => {
      this.personTemplateService.update({...this.formGroup.value, id: 1});
    });

  }

  private setInitialState() {
    this.personTemplateService.update({firstName: 'John', lastName: 'Smith', id: 1});
  }

  private startDataRetrieval() {

    // 'some one' must do a request to start the 'messsage pump' via web socket
    this.personTemplateService.getAll();
    this.personEntityService.getAll();

    // only show the last entries
    this.persons$ = this.personEntityService.entities$.pipe(
      map(i => i.slice(Math.max(i.length - 5, 1)).reverse())
    );

    // tapping into the store to retrieve the template from there
    this.personTemplateService.entities$.subscribe(i => {

      if (i?.length <= 0) return;

      const {firstName, lastName} = i[0];
      this.firstName = firstName ?? '';
      this.lastName = lastName ?? '';
    });

  }

}
