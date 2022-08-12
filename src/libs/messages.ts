export const validationMessages = {
  empty: {
    username: 'نام کاربری الزامیست',
    password: 'رمز عبور الزامیست',
    repeatPassword: 'تکرار رمز عبور الزامیست',
    phoneNumber: 'شماره موبایل الزامیست',
    code: 'کد یکبار مصرف الزامیست',
  },
  invalid: {
    phoneNumber: 'شماره موبایل وارد شده معتبر نیست',
    code: 'کد یکبار مصرف معتبر نیست',
    password:
      'رمز عبور باید ۸ کاراکتر و شامل حروف کوچک ، بزرگ ، اعداد و کاراکتر های ویژه باشد ',
    repeatPassword: 'رمز عبور و تکرار آن با هم برار نیستند',
  },
};

export const exceptionMessages = {
  exist: {
    user: 'کاربر از قبل وجود دارد',
  },
  notFound: {
    user: 'کاربر مورد نظر پیدا نشد',
  },
  invalid: {
    jwt: 'دسترسی شما نامعتبر است. لطفا مجدد لاگین کنید',
  },
  forbidden: {
    user: 'تلاش شما برای ورود غیر مجاز است',
  },
};
