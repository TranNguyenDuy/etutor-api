export class ListQuery {
  constructor(
    public key?: string | undefined,
    public page: number = 0,
    public pageSize: number = 20,
    public sortKey: string = '',
    public sortDirection: string = ''
  ) {
    if (typeof page === "string") this.page = parseInt(page, 10);
    if (typeof pageSize === "string") this.pageSize = parseInt(pageSize, 10);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class ListResponse<T = any> {
  data: T[];
  metadata: ListQuery & { total: number };
}
