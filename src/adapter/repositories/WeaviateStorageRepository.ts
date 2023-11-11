// https://console.weaviate.cloud/query
import weaviate, {
  ObjectsBatcher,
  WeaviateClient,
} from 'weaviate-ts-client';

export class WeaviateStorageRepository {
  client: WeaviateClient;

  constructor() {
    this.client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080', // Replace with your endpoint
      // apiKey: new ApiKey('YOUR-WEAVIATE-API-KEY'),  // Replace w/ your Weaviate instance API key
      headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY ?? '' },
    });
    void this.setup();
  }

  setup = async (): Promise<void> => {
    const classObj = {
      class: 'Question',
      vectorizer: 'text2vec-openai', // If set to "none" you must always provide vectors yourself. Could be any other "text2vec-*" also.
      moduleConfig: {
        'text2vec-openai': {},
        'generative-openai': {}, // Ensure the `generative-openai` module is used for generative queries
      },
    };
    try {
      const resQuestion = await this.client.schema
        .classCreator()
        .withClass(classObj)
        .do();
      console.log(resQuestion);
    } catch (e) {
      // noop
    }

    const articleClass = {
      class: 'Article',
      properties: [
        {
          name: 'title',
          dataType: ['text'],
        },
        {
          name: 'body',
          dataType: ['text'],
        },
      ],
    };
    try {
      const resArticle = await this.client.schema
        .classCreator()
        .withClass(articleClass)
        .do();
      console.log(resArticle);
    } catch (e) {
      // noop
    }
  };
  save = async (): Promise<void> => {
    const obj = {
      class: 'Article',
      properties: {
        title: 'How to make a pizza',
        body: 'First, make the dough. Then, add the toppings.',
      },
    };
    const res = await this.client.data
      .creator()
      .withClassName('Article')
      .withProperties(obj.properties)
      .do();

    console.log(res);
  }

  getJsonData = async (): Promise<
    {
      Answer: string;
      Question: string;
      Category: string;
    }[]
  > => {
    const file = await fetch(
      'https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json',
    );
    const isMatchType = (
      data: unknown,
    ): data is {
      Answer: string;
      Question: string;
      Category: string;
    }[] => {
      return (
        Array.isArray(data) &&
        data.every((item) => {
          return (
            typeof item === 'object' &&
            item !== null &&
            'Answer' in item &&
            'Question' in item &&
            'Category' in item
          );
        })
      );
    };
    const data: unknown = await file.json();
    if (isMatchType(data)) {
      return data;
    }
    throw new Error('Invalid data type');
  };

  importQuestions = async () => {
    const data = await this.getJsonData();

    let batcher: ObjectsBatcher = this.client.batch.objectsBatcher();
    let counter = 0;
    const batchSize = 100;

    for (const question of data) {
      const obj = {
        class: 'Question',
        properties: {
          answer: question.Answer,
          question: question.Question,
          category: question.Category,
        },
      };
      const res = await this.client.data
        .creator()
        .withClassName('Question')
        .withProperties(obj.properties)
        .do();

      console.log(res);

      batcher = batcher.withObject(obj);

      if (counter++ == batchSize) {
        const res = await batcher.do();
        console.log(res);

        counter = 0;
        batcher = this.client.batch.objectsBatcher();
      }
    }
    const res = await batcher.do();
    console.log(res.map((item) => JSON.stringify(item)));
  };

  nearTextQuery = async (): Promise<object> => {
    const res = await this.client.graphql
      .get()
      .withClassName('Question')
      .withHybrid({
        query: 'food',
        properties: ['question'],
        alpha: 0.25,
      })
      .withLimit(3)
      .withFields('question answer')
      .do();

    console.log(JSON.stringify(res, null, 2));
    return res;
  };
}
