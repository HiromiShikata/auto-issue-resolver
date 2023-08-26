import { StringConverter } from '../adapter-interfaces/StringConverter';

export const toolResponseTemplate = (
  toolResponse: string,
  stringConverter: StringConverter,
) => {
  let obj: unknown;
  try {
    obj = JSON.parse(toolResponse);
    if (obj === null || typeof obj !== 'object') {
      return toolResponse;
    }
  } catch (e) {
    return toolResponse;
  }
  return stringConverter.jsonToYaml(obj);
};
