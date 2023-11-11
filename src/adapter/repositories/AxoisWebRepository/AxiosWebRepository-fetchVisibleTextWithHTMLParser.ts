import axios from 'axios';
import { config } from "dotenv";
import { parse } from 'node-html-parser';

config();

export const fetchVisibleTextWithHTMLParser = async (url: string): Promise<string|null> => {
    try {

    const response = await axios.get<string>(url);
    const root = parse(response.data);

    const header = root.querySelector('header');
    const footer = root.querySelector('footer');

    if (header) header.remove();
    if (footer) footer.remove();

    const textContents = root.structuredText.trim();

    return textContents;
    }catch (error) {
        console.error('Error fetching webpage:', error);
        return null;

    }
}
