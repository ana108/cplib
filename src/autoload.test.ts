import * as sinon from 'sinon';
import * as autoload from './autoload';
import { expect } from 'chai';
import 'mocha';

const YEAR = new Date().getFullYear();

describe('Files functionality', () => {
    beforeEach(() => {
    });
    afterEach(() => {
    });
    it('Execute autoload', async () => {
        autoload.e2eProcess();
    });

});