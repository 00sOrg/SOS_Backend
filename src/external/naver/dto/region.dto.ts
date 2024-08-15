
export class Region {
    city: string;
    gu: string;
    dong: string;

    public constructor(city: string, gu: string, dong: string){
        this.city = city;
        this.gu = gu;
        this.dong = dong;
    }
}