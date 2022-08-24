export const generateTemplate = (username: string, code: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  return `
<!DOCTYPE html>
<html
  lang='en'
  xmlns='http://www.w3.org/1999/xhtml'
  xmlns:o='urn:schemas-microsoft-com:office:office'
>
  <head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width,initial-scale=1' />
    <meta name='x-apple-disable-message-reformatting' />
    <title></title>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      table,
      td,
      div,
      h1,
      p {
        font-family: Arial, sans-serif;
      }

      .title {
        color: #ffffff;
        font-size: xx-large;
      }
    </style>
  </head>
  <body style='margin: 0; padding: 0' dir='rtl'>
    <table
      role='presentation'
      style='
        width: 100%;
        border-collapse: collapse;
        border: 0;
        border-spacing: 0;
        background: #ffffff;
      '
    >
      <tr>
        <td align='center' style='padding: 0'>
          <table
            role='presentation'
            style='
              width: 602px;
              border-collapse: collapse;
              border: 1px solid #cccccc;
              border-spacing: 0;
              text-align: left;
            '
          >
            <tr>
              <td
                align='center'
                style='padding: 40px 0 30px 0; background: #4e0099'
              >
                <img src='https://articlesland.ir/assets/images/icon.png' width='200' alt='ArticlesLand'/>
              </td>
            </tr>
            <tr>
              <td style='padding: 36px 30px 42px 30px'>
                <table
                  role='presentation'
                  style='
                    width: 100%;
                    border-collapse: collapse;
                    border: 0;
                    border-spacing: 0;
                  '
                >
                  <tr>
                    <td style='padding: 0; color: #153643'>
                      <h1
                        style='
                          font-size: 24px;
                          margin: 0 0 20px 0;
                          font-family: Arial, sans-serif;
                          text-align: right;
                        '
                      >
                        سلام ${username}
                      </h1>
                      <p
                        style='
                          margin: 0;
                          font-size: 16px;
                          line-height: 24px;
                          font-family: Arial, sans-serif;
                          text-align: right;
                        '
                      >
                        کد تایید شما:
                        <span>${code}</span>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style='padding: 30px; background: #C9AE39; font-weight: bold'>
                <table
                  role='presentation'
                  style='
                    width: 100%;
                    border-collapse: collapse;
                    border: 0;
                    border-spacing: 0;
                    font-size: 9px;
                    font-family: Arial, sans-serif;
                  '
                >
                  <tr>
                    <td style='padding: 0; width: 50%' align='left'>
                      <p
                        style='
                          margin: 0;
                          font-size: 14px;
                          line-height: 16px;
                          font-family: Arial, sans-serif;
                          color: #ffffff;
                          direction: ltr;
                        '
                      >
                        <span style='margin-bottom: 8px; display: block'>
                          &reg; Ali Rajabi Nekoo, Tehran <span>${year}</span>
                        </span>
                        <a
                          href='http://www.articlesland.ir'
                          style='color: #ffffff; text-decoration: underline'
                          >ArticlesLand</a
                        >
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
