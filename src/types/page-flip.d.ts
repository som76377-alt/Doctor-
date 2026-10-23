declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, options: Record<string, unknown>);
    loadFromHTML(pages: HTMLElement[]): void;
    getCurrentPageIndex(): number;
    flip(page: number, corner?: string): void;
    flipPrev(corner?: string): void;
    flipNext(corner?: string): void;
    update(): void;
    on(
      event: "flip",
      callback: (event: { data: number }) => void,
    ): void;
    on(
      event: "init",
      callback: (event: { data?: { page?: number } }) => void,
    ): void;
  }
}
