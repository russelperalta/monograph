import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Home')
    .items([
      S.documentTypeListItem('post').title('Works'),
      // S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.documentTypeListItem('category').title('Categories'),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category'].includes(item.getId()!),
      ),
    ])
