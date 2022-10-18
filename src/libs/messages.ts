export const validationMessages = {
  empty: {
    username: 'نام کاربری الزامیست',
    password: 'رمز عبور الزامیست',
    repeatPassword: 'تکرار رمز عبور الزامیست',
    refreshToken: 'توکن بازیابی الزامیست',
    phoneNumber: 'شماره موبایل الزامیست',
    email: 'آدرس ایمیل الزامیست',
    code: 'کد یکبار مصرف الزامیست',
    articleTitle: 'عنوان برای پست الزامیست',
    articleBody: 'متن بدنه برای پست الزامیست',
    commentBody: 'متن بدنه برای نظرات الزامیست',
    categoryId: 'حداقل یک مورد از لیست ها برای پست جدید باید انتخاب شود',
    articleBanner: 'انتخاب تصویر برای پست الزامیست',
    avatar: 'انتخاب تصویر پروفایل الزامیست',
    follow: 'کاربری که میخواهید دنبال کنید را مشخص کنید',
    reportType: 'نوع گزارش را مشخص کنید',
  },
  length: {
    usernameShort: 'نام کاربری باید حداقل شامل ۴ حرف باشد',
    usernameLong: 'نام کاربری باید حداکثر شامل ۲۰ حرف باشد',
    bioShort: 'متن معرفی شما باید حداقل شامل ۴ حرف باشد',
    bioLong: 'متن معرفی شما باید حداکثر شامل ۱۵۰ حرف باشد',
    displayNameShort: 'نام نمایشی شما باید حداقل شامل ۴ حرف باشد',
    displayNameLong: 'نام نمایشی شما باید حداکثر شامل ۵۰ حرف باشد',
    selectedCategories: 'حداقل یک مورد از لیست ها باید انتخاب شده باشد',
    commentBodyShort: 'متن بدنه نظر شما باید حداقل شامل ۱۰ حرف باشد',
    commentBodyLong: 'متن بدنه نظر شما باید حداکثر شامل ۵۰۰ حرف باشد',
    reportContentShort: 'متن گزارش باید حداقل شامل ۳۰ حرف باشد',
    reportContentLong: 'متن گزارش باید حداکثر شامل ۲۰۰ حرف باشد',
  },
  invalid: {
    username: 'نام کاربری شامل حروف انگلیسی و اعداد می باشد',
    phoneNumber: 'شماره موبایل وارد شده معتبر نیست',
    email: 'آدرس ایمیل وارد شده معتبر نیست',
    code: 'کد یکبار مصرف معتبر نیست',
    password: 'رمزعبور باید حداقل شامل حروف و عدد به طول ۸ کاراکتر باشد',
    repeatPassword: 'رمز عبور و تکرار آن با هم برار نیستند',
    reportType: 'نوع گزارش انتخاب شده نامعتیر است',
    reportContentType: 'نوع گزارش انتخاب شده برای محتوای مورد نظر نامعتیر است',
    statusFilter: 'وضعیت گزارش انتخاب شده نامعتیر است',
  },
  selecting: (name: string) => `انتخاب ${name} الزامیست`,
};

export const exceptionMessages = {
  exist: {
    user: 'کاربر از قبل وجود دارد',
    mobile: 'شماره موبایل مورد نظر قبلا استفاده شده است',
    sameMobile: 'شماره موبایل مورد نظر را قبلا ثبت کرده اید',
    email: 'ایمیل مورد نظر قبلا استفاده شده است',
    sameEmail: 'ایمیل مورد نظر را قبلا ثبت کرده اید',
    articleTitle: 'یک پست با عنوان مورد نظر از قبل وجود دارد',
  },
  notFound: {
    user: 'کاربر مورد نظر پیدا نشد',
    comment: 'کامنت یافت نشد',
    category: 'لیست مورد نظر یافت نشد',
    article: 'پست مورد نظر یافت نشد',
  },
  invalid: {
    jwt: 'دسترسی شما نامعتبر است. لطفا مجدد لاگین کنید',
    code: 'کد وارد شده معتبر نیست',
    imageFileFormat:
      'فرمت فایل انتخاب شده صحیح نمی باشد لطفا یک فایل تصویر انتخاب کنید',
    report: 'گزارش تخلف نامعتبر است',
  },
  notAcceptable: {
    code: 'تا زمان پایان اعتبار کد ارسال شده منتظر بمانید',
  },
  serverError: {
    internal: 'خطایی در سرور رخ داده است',
  },
  permission: {
    main: 'شما دسترسی لازم برای این عملیات را ندارید',
    section: 'شما دسترسی لازم به این قسمت را ندارید',
  },
  forbidden: {
    youBlockedByUser: 'شما توسط کاربر مورد نظر مسدود شده اید',
    youBlockedByAdmin: `شما توسط ادمین مسدود شده اید. لطفا برای رفع مسدودی با ادمین در ارتباط باشید.
    \nadmin@articlesland.ir`,
    youBlockedThisUser: 'شما کاربر مورد نظر را مسدود کرده اید',
    deleteAccount: 'درخواست شما برای حذف اکانت فاقد اعتبار است',
  },
  badRequest: {
    reportContent: 'متن گزارش الزامیست',
  },
};

export const systemMessage = {
  emailSubject: 'کد تایید Articlesland',
};
