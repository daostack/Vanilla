import { autoinject } from 'aurelia-framework';
import { SchemeConfigurator } from './schemeConfigurationBase';

export class UnknownArcScheme implements SchemeConfigurator {

  model: any;

  constructor(
  ) {
  }

  activate(model) {
    this.model = model;
  }

  async getConfigurationHash(orgAddress: string, schemeAddress?: string): Promise<any> {
  }

}
