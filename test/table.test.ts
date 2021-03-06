import Airtable from '../src/airtable';
import axios from 'axios';
// @ts-ignore
import HttpAdapter from 'axios/lib/adapters/http';
import { start } from './server/records.server';
import createRequestBody from './fixtures/records.create';
import updateRequestBody from './fixtures/records.update';

axios.defaults.adapter = HttpAdapter;

describe('Table', function() {
  const BASE_ID = 'abc';
  const TABLE_NAME = 'My Table';
  const API_KEY = 'key123';
  const airtable = new Airtable({
    apiKey: API_KEY,
    endpointUrl: 'http://localhost',
  });
  const base = airtable.base(BASE_ID);

  const table = base.table(TABLE_NAME);

  beforeAll(() => {
    start();
  });

  describe('records()', () => {
    it('returns a list of records', async () => {
      const { records } = await table.records();
      expect(records.length).toBeGreaterThan(0);
    });

    it('queries by field: ["Name, "Client"]', async () => {
      const { records } = await table.records({ fields: ['Name', 'Client'] });
      expect(records.length).toBeGreaterThan(0);
    });

    it('queries by maxRecords of 3', async () => {
      const { records, offset } = await table.records({ maxRecords: 3 });
      expect(records.length).toEqual(3);
      expect(typeof offset).toEqual('string');
    });

    it('queries by pageSize of 1', async () => {
      const { records, offset } = await table.records({ pageSize: 1 });
      expect(records.length).toBeGreaterThan(0);
      expect(typeof offset).toEqual('string');
    });

    it('queries by sort', async () => {
      const { records } = await table.records({
        sort: [{ field: 'Name', direction: 'desc' }],
      });
      expect(records.length).toBeGreaterThan(0);
    });

    it.todo('queries by view');

    it.todo('queries by cellFormat');
  });

  describe('list()', () => {
    it('auto-paginates through the list of records', async () => {
      let count = 0;
      for await (const records of table.list({ pageSize: 1 })) {
        expect(records.length).toBeGreaterThan(0);
        count++;
      }
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('findRecord()', () => {
    it('retrieves a record', async () => {
      const recordId = 'recABcLKRaQWszKp';
      const record = await table.findRecord(recordId);
      expect(record.id).toEqual(recordId);
    });
  });

  describe('createRecord', () => {
    it('creates a single record', async () => {
      const { records } = await table.createRecord(createRequestBody[0]);
      expect(records).toEqual([createRequestBody[0]]);
    });
  });

  describe('createRecords', () => {
    it('creates a batch of records', async () => {
      const { records } = await table.createRecords(createRequestBody);
      expect(records).toEqual(createRequestBody);
    });
  });

  describe('updateRecord', () => {
    it('updates a single record', async () => {
      const { records } = await table.updateRecord(updateRequestBody[0]);
      expect(records).toEqual([updateRequestBody[0]]);
    });
  });

  describe('updateRecords', () => {
    it('updates a batch of records', async () => {
      const { records } = await table.updateRecords(updateRequestBody);
      expect(records).toEqual(updateRequestBody);
    });
  });

  describe('deleteRecords', () => {
    it('deletes a single records', async () => {
      const { records } = await table.deleteRecord('recABcLKRaQWszKp');
      expect(records.length).toEqual(1);
    });
  });

  describe('deleteRecords', () => {
    it('deletes a batch of records', async () => {
      const { records } = await table.deleteRecords([
        'recABcLKRaQWszKp',
        'recAtELIMS1xJOTI',
      ]);
      expect(records.length).toEqual(2);
    });
  });
});
