import {LocalStorageRepository} from "./LocalStorageRepository";

describe('LocalStorageRepository', () => {
    describe('readPdf', () => {
        it('should success', async () => {
            const localStorageRepository = new LocalStorageRepository();
            const path = `/home/hiromi/Downloads/pdf3009p.pdf`;
            // const path = `/home/hiromi/Downloads/44_440107.pdf`;
            const res = await localStorageRepository.readPdf(path);

            const resOther = await localStorageRepository.readPdfother(path);
            console.log(resOther)
            expect(res).toEqual({});
            expect(localStorageRepository).toBeDefined();
        });
    })
})

