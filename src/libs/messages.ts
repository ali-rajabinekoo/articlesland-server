export const validationMessages = {
  empty: {
    username: 'نام کاربری الزامیست',
    password: 'رمز عبور الزامیست',
    repeatPassword: 'تکرار رمز عبور الزامیست',
    phoneNumber: 'شماره موبایل الزامیست',
    code: 'کد یکبار مصرف الزامیست',
    articleTitle: 'عنوان مقاله الزامیست',
    articleBody: 'متن بدنه مقاله الزامیست',
    categoryId: 'انتخاب لیست برای مقاله الزامیست',
    articleBanner: 'انتخاب تصویر برای مقاله الزامیست',
  },
  length: {
    usernameShort: 'نام کاربری باید حداقل شامل ۴ حرف باشد',
    usernameLong: 'نام کاربری باید حداکثر شامل ۲۰ حرف باشد',
  },
  invalid: {
    username: 'نام کاربری شامل حروف انگلیسی و اعداد می باشد',
    phoneNumber: 'شماره موبایل وارد شده معتبر نیست',
    code: 'کد یکبار مصرف معتبر نیست',
    password: 'رمزعبور باید حداقل شامل حروف و عدد به طول ۸ کاراکتر باشد',
    repeatPassword: 'رمز عبور و تکرار آن با هم برار نیستند',
  },
};

export const exceptionMessages = {
  exist: {
    user: 'کاربر از قبل وجود دارد',
    mobile: 'شماره موبایل مورد نظر قبلا استفاده شده است',
    sameMobile: 'شماره موبایل مورد نظر را قبلا ثبت کرده اید',
    email: 'ایمیل مورد نظر قبلا استفاده شده است',
    sameEmail: 'ایمیل مورد نظر را قبلا ثبت کرده اید',
    articleTitle: 'مقاله با عنوان مورد نظر از قبل وجود دارد',
  },
  notFound: {
    user: 'کاربر مورد نظر پیدا نشد',
    category: 'لیست مورد نظر یافت نشد',
    article: 'مقاله مورد نظر یافت نشد',
  },
  invalid: {
    jwt: 'دسترسی شما نامعتبر است. لطفا مجدد لاگین کنید',
    code: 'کد وارد شده معتبر نیست',
    imageFileFormat:
      'فرمت فایل انتخاب شده صحیح نمی باشد لطفا یک فایل تصویر انتخاب کنید',
  },
  notAcceptable: {
    code: 'تا زمان پایان اعتبار کد ارسال شده منتظر بمانید',
  },
  serverError: {
    internal: 'خطایی در سرور رخ داده است',
  },
  permission: {
    main: 'شما دسترسی لازم برای این عملیات را نداید',
  },
};

export const systemMessage = {
  emailSubject: 'کد تایید Articlesland',
};
