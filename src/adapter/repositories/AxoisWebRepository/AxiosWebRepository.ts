import axios from 'axios';
import {config} from "dotenv";
import {fetchVisibleTextWithHTMLParser} from "./AxiosWebRepository-fetchVisibleTextWithHTMLParser";

config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

export class AxiosWebRepository {
    search = async (query: string): Promise<{
        link: string;
        textContents: string;
    }[]> => {
        const endpoint = 'https://www.googleapis.com/customsearch/v1';
        const params = {
            key: GOOGLE_API_KEY,
            cx: GOOGLE_CSE_ID,
            q: query
        };

        type GoogleResponse = {
            items: {
                link: string;
            }[];
        };

        try {
            const response = await axios.get<GoogleResponse>(endpoint, { params });
            const results = (await Promise.all(response.data.items.map(async (item) => {
                const visibleText = await fetchVisibleTextWithHTMLParser(item.link);
                return {
                    link: item.link,
                    textContents: visibleText
                };
            })))
                .filter((result)  : result is {
                    link: string;
                    textContents: string;
                }    => result.textContents !== null)
            ;

            return results;

        } catch (error) {
            console.error('Error searching Google or fetching webpage:', error);
            return [];
        }
    }
}
