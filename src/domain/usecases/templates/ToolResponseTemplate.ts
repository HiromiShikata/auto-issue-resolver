import {StringConverter} from "../adapter-interfaces/StringConverter";

export const toolResponseTemplate = (toolResponse: string, stringConvertor:StringConverter) :string => {
    // TODO implement this
    // convert to json
    // if not valid json, return toolResponse
    // create text using stringConvertor.jsonToYaml
    console.log(stringConvertor)
    return toolResponse

}
