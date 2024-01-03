import {AxiosWebRepository} from "./AxiosWebRepository";

describe('AxiosWebRepository', () => {
    describe('search', () => {
        it('should success', async () => {
            const axiosWebRepository = new AxiosWebRepository();
            const res = await axiosWebRepository.search('美容医療　最新 再生医療');
            console.log(res)
            expect(res).toEqual({});
            expect(axiosWebRepository).toBeDefined();
        });
    })
})

