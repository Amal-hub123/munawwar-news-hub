const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
console.log('SENDGRID_API_KEY configured:', !!sendgridApiKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const createWelcomeEmail = (name: string, siteUrl: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مرحباً بك في المنحنى</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px 20px; max-width: 600px;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <h1 style="color: #1a1a1a; font-size: 32px; font-weight: bold; margin: 0;">مرحباً ${name}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0;">
              <p style="color: #444; font-size: 16px; line-height: 26px; margin: 0; text-align: right;">
                نحن سعداء بالإعلان عن قبول طلبك للانضمام إلى فريق الكتّاب في منصة المنحنى.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 32px 0;">
              <table cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; width: 100%;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <p style="color: #16a34a; font-size: 20px; font-weight: bold; margin: 0;">
                      تم قبول طلبك بنجاح ✨
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0;">
              <p style="color: #444; font-size: 16px; line-height: 26px; margin: 0; text-align: right;">
                يمكنك الآن تسجيل الدخول إلى حسابك والبدء في كتابة مقالاتك ونشر أخبارك على المنصة.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 32px 0;">
              <a href="${siteUrl}/auth" style="display: inline-block; background-color: #16a34a; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; padding: 14px 32px;">
                تسجيل الدخول الآن
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0;">
              <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 0;">
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 0;">
              <p style="color: #444; font-size: 16px; line-height: 26px; margin: 0; text-align: right;">
                إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0 0;">
              <p style="color: #666; font-size: 14px; line-height: 24px; margin: 0; text-align: right;">
                مع أطيب التحيات،<br>
                فريق المنحنى
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { email, name, siteUrl: customSiteUrl } = await req.json()

    if (!email || !name) {
      console.error('Missing required fields: email or name')
      return new Response(
        JSON.stringify({ error: 'Email and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'SendGrid API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending welcome email to:', email)

    // Use provided siteUrl or fallback
    const siteUrl = customSiteUrl || 'https://almonhna.lovable.app'
    const html = createWelcomeEmail(name, siteUrl)

    // Send email using SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email }],
            subject: '🎉 مرحباً بك في المنحنى - تم قبول طلبك!',
          },
        ],
        from: {
          email: 'noreply@almonhna.com', // يجب أن يكون هذا الإيميل موثق في SendGrid
          name: 'المنحنى',
        },
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    })

    console.log('SendGrid response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid error:', errorText)
      throw new Error(`SendGrid error: ${response.status} - ${errorText}`)
    }

    console.log('Email sent successfully via SendGrid')

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({
        error: {
          message: errorMessage,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
