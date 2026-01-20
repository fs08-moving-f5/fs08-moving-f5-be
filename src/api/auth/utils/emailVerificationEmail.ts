import { EMAIL_VERIFICATION_FRONTEND_PATH } from '../emailVerification/emailVerification.constants';

export const buildEmailVerificationUrl = (frontendOrigin: string, token: string): string => {
  const url = new URL(EMAIL_VERIFICATION_FRONTEND_PATH, frontendOrigin);
  url.searchParams.set('token', token);
  return url.toString();
};

export const buildEmailVerificationMail = (data: {
  to: string;
  verifyUrl: string;
}): { subject: string; html: string } => {
  const preheader = '이메일 인증을 완료하면 서비스 이용이 가능합니다.';

  return {
    subject: '[무빙] 이메일 인증을 완료해주세요',
    html: `
<!doctype html>
<html lang="ko">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>이메일 인증</title>
  </head>
  <body style="margin:0;padding:0;background-color:#ff4d2e;">
    <!-- Preheader (hidden) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ff4d2e;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:100%;">
            <tr>
              <td style="background:#ffffff;border-radius:18px;padding:28px 26px;">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                  <div style="font-weight:800;font-size:20px;letter-spacing:-0.01em;color:#111827;margin:0 0 10px 0;">
                    이메일 인증이 필요합니다
                  </div>
                  <div style="font-size:14px;line-height:1.6;color:#374151;margin:0 0 18px 0;">
                    아래 버튼을 눌러 이메일 인증을 완료해주세요. 인증이 완료되면 로그인이 가능합니다.
                  </div>

                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td align="center" bgcolor="#ff4d2e" style="border-radius:12px;">
                        <a
                          href="${data.verifyUrl}"
                          target="_blank"
                          rel="noreferrer"
                          style="display:inline-block;padding:14px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;"
                        >
                          이메일 인증하기
                        </a>
                      </td>
                    </tr>
                  </table>

                  <div style="font-size:12px;line-height:1.6;color:#6b7280;margin:18px 0 0 0;">
                    버튼이 동작하지 않으면 아래 링크를 복사해 브라우저에 붙여넣어 주세요.
                    <div style="word-break:break-all;margin-top:8px;">
                      <a href="${data.verifyUrl}" style="color:#ff4d2e;text-decoration:underline;">${data.verifyUrl}</a>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:16px 0 0 0;">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.9);">
                  링크는 일정 시간 후 만료됩니다. 본 메일은 발신 전용입니다.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `.trim(),
  };
};
