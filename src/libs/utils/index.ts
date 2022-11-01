import { Verification } from './verification.utils';
import { Views } from './views.utils';
import { AuxiliaryUtils } from './auxiliary.utils';
import { AdminUtils } from './admin.utils';
import { ShortLinkUtils } from './shortLink.utils';

class Index {
  views: Views = new Views();
  admin: AdminUtils = new AdminUtils();
  verification: Verification = new Verification();
  shortLink: ShortLinkUtils = new ShortLinkUtils();
  auxiliary: AuxiliaryUtils = new AuxiliaryUtils();
}

export default new Index();
