import { Verification } from './verification.utils';
import { Views } from './views.utils';

class Index {
  views: Views = new Views();
  verification: Verification = new Verification();
}

export default new Index();
