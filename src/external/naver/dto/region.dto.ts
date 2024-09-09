export class Region {
  si: string;
  gu: string;
  dong: string;

  public constructor(si: string, gu: string, dong: string) {
    this.si = si;
    this.gu = gu;
    this.dong = dong;
  }

  public toString(): string {
    return `${this.si} ${this.gu} ${this.dong}`;
  }
}
