import * as sinon from 'sinon';
import 'mocha';
import * as chai from 'chai';
import http from 'http';
import { savePDFS } from './source';
const expect = chai.expect;
const YEAR = new Date().getFullYear();

describe('savePDFS', () => {
    let requestStb;
    before(async () => {
        // requestStb = sinon.stub(http, 'request');
    });
    after(async () => {
        // requestStb.restore();
    });
    it('Create dir and download pdfs', () => {
        savePDFS(YEAR);
        // verify that tmp got created and that there are two pdfs in there
    });
});