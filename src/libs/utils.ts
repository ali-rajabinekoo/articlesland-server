class Utils {
  normalizePhoneNumber(mobile: string): string {
    let newMobile: string = mobile.replace(/^\+98/g, '');
    newMobile = newMobile.replace(/^98/g, '');
    newMobile = newMobile.replace(/09/g, '9');
    return newMobile;
  }
}
export default new Utils();
