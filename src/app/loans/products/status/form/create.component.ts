/**
 * Copyright 2017 The Mifos Initiative.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Product} from '../../../../../services/portfolio/domain/product.model';
import {ActivatedRoute, Router} from '@angular/router';
import {TaskDefinition} from '../../../../../services/portfolio/domain/task-definition.model';
import {ProductTaskFormComponent} from './form.component';
import {Subscription} from 'rxjs';
import {PortfolioStore} from '../../store/index';
import * as fromPortfolio from '../../store';
import {CREATE} from '../../store/tasks/task.actions';
import {Error} from '../../../../../services/domain/error.model';


@Component({
  templateUrl: './create.component.html'
})
export class ProductStatusCreateFormComponent implements OnInit, OnDestroy{

  private productSubscription: Subscription;

  private formStateSubscription: Subscription;

  @ViewChild('form') formComponent: ProductTaskFormComponent;

  private product: Product;

  private task: TaskDefinition = {
    identifier: '',
    name: '',
    description: '',
    actions: ['OPEN'],
    fourEyes: false,
    mandatory: false
  };

  constructor(private router: Router, private route: ActivatedRoute, private portfolioStore: PortfolioStore) {}

  ngOnInit(): void {
    this.productSubscription = this.portfolioStore.select(fromPortfolio.getSelectedProduct)
      .subscribe(product => this.product = product);

    this.formStateSubscription = this.portfolioStore.select(fromPortfolio.getProductTaskFormState)
      .subscribe((payload: {error: Error}) => {

        if (!payload.error) return;

        switch(payload.error.status){
          case 400:
            //This should not happen
            break;
          case 409:
            let detailForm = this.formComponent.detailForm;
            let errors = detailForm.get('identifier').errors || {};
            errors['unique'] = true;
            detailForm.get('identifier').setErrors(errors);
            this.formComponent.openDetailsStep();
            break;
        }
      });
  }

  ngOnDestroy(): void {
    this.productSubscription.unsubscribe();
    this.formStateSubscription.unsubscribe();
  }

  onSave(task: TaskDefinition): void {
    this.portfolioStore.dispatch({ type: CREATE, payload: {
      productId: this.product.identifier,
      task: task,
      activatedRoute: this.route
    }});
  }

  onCancel(): void{
    this.navigateAway();
  }

  navigateAway(): void{
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}