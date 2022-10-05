import { Verification } from './verification.utils';
import { Views } from './views.utils';
import { Auxiliary } from './auxiliary';

class Index {
  views: Views = new Views();
  verification: Verification = new Verification();
  auxiliary: Auxiliary = new Auxiliary();
}

export default new Index();
