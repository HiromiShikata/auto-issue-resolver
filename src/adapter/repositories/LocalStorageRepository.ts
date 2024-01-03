import PdfParse from 'pdf-parse';
import * as pdfjs from 'pdfjs-dist';


import * as fs from 'fs';
export class LocalStorageRepository {
    readPdf = async (path: string): Promise<string> => {
        const pdf = await pdfjs.getDocument(path).promise;
        let finalText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            for (const item of content.items) {
                if ('str' in item) {
                    finalText += item.str;
                }
            }
        }
        return finalText;


    }
    readPdfother = async (path: string): Promise<string> => {
        const dataBuffer = fs.readFileSync(path);

        const res  = await PdfParse(dataBuffer);
        return res.text;

    }
}
