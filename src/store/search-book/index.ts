import {
  Module, VuexModule, Mutation, Action, getModule,
} from 'vuex-module-decorators'
import { SetSearchBooksObj, SearchBooksPayloadObj } from './types';
import ApiMethods from '../../api/ApiMethods';
import store from '..';


@Module({
  dynamic: true, store, name: 'SearchBookModule', namespaced: true,
})
class SearchBookModule extends VuexModule {
  public keywords: string = ''
  public books: any = []
  public totalItems: number = 0
  public pageIndex: number = 0
  public isLoading: boolean = false
  public isThere: boolean = true

  public get loadable(): boolean {
    return this.totalItems > this.books.length
  }

  @Mutation
  public setSearchBooks(payload: SetSearchBooksObj): void {
    payload.books.forEach((book: any) => {
      this.books.push(book)
    })
    this.pageIndex += 1;
    this.totalItems = payload.totalItems;
  }

  @Mutation
  public setSearchKeywords(payload: string): void {
    this.keywords = payload
  }

  @Mutation
  public resetSearchBooks(): void {
    this.keywords = ''
    this.books = []
    this.totalItems = 0
    this.pageIndex = 0
  }

  @Mutation
  public setLoadingFalse(): void {
    this.isLoading = false
  }

  @Mutation
  public setLoadingTrue(): void {
    this.isLoading = true
  }

  @Mutation
  public setThereOrNot(payload: boolean): void {
    this.isThere = payload
  }

  @Action({})
  public async getGoogleBooks(payload: SearchBooksPayloadObj): Promise<void> {
    const { data, error }: any = await new ApiMethods().fetchGoogleBooksApi(payload);
    this.setLoadingFalse()

    if (data) {
      const info: SetSearchBooksObj = {
        totalItems: 0,
        books: [],
      };
      if (data.totalItems !== 0) {
        info.totalItems = data.totalItems;
        info.books = data.items.map((item: any) => item.volumeInfo);
        this.setSearchBooks(info)
        this.setThereOrNot(true)
      } else {
        this.setSearchBooks(info)
        this.setThereOrNot(false)
      }
    } else {
      this.resetSearchBooks()
    }
  }
}

export default getModule(SearchBookModule)
