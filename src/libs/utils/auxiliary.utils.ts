export class AuxiliaryUtils {
  HtmlTagsNormalizer(text: string) {
    return text.replace(new RegExp('width:auto;', 'ig'), 'width:100%').trim();
  }
}
