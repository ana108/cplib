import * as sinon from 'sinon';
import * as index from './index';
import { expect } from 'chai';
import 'mocha';

describe('Files functionality', () => {
    let readFileStub;
    beforeEach(() => {
        readFileStub = sinon.stub(index, 'readFile').resolves(['Success']);
    });
    afterEach(() => {
        readFileStub.restore();
    });
    it('should return hello world', async () => {
        const result = await index.files();
        // console.log(JSON.stringify([["Success"], ["Success"], ["Success"], ["Success"], ["Success"], ["Success"]]));
        expect(result.length).to.equal(6);
    });

});