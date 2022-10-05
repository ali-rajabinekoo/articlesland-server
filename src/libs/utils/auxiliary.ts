export class Auxiliary {
  HtmlTagsNormalizer(text: string) {
    return text.replace(new RegExp('width:auto;', 'ig'), 'width:100%').trim();
  }
}
