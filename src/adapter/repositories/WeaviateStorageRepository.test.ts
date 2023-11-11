import { WeaviateStorageRepository } from './WeaviateStorageRepository';
import { config } from 'dotenv';

config();
describe('WeaviateStorageRepository', () => {
  it('should success', async () => {
    const weaviateStorageRepository = new WeaviateStorageRepository();
    await weaviateStorageRepository.importQuestions();
    const res = await weaviateStorageRepository.nearTextQuery();
    expect(res).toEqual({});
    expect(weaviateStorageRepository).toBeDefined();
  });
});
