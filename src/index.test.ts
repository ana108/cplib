import * as sinon from 'sinon';
import * as index from './index';
import { expect } from 'chai';
import 'mocha';

const YEAR = new Date().getFullYear();

describe('Files functionality', () => {
    let readFileStub;
    beforeEach(() => {
        readFileStub = sinon.stub(index, 'readFile').resolves(['Success']);
    });
    afterEach(() => {
        readFileStub.restore();
    });
    it('Should return a success message', async () => {
        const result = await index.files();
        expect(result).to.equal(`Successfully loaded the data for year ${YEAR}`);
    });

});