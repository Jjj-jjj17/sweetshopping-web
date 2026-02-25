import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get('email') || 'joseph970913@gmail.com'

    try {
        const { data, error } = await resend.emails.send({
            from: 'SweetShop <onboarding@resend.dev>',
            to: testEmail,
            subject: 'Resend 測試郵件',
            html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>測試成功！</h1>
          <p>如果你收到這封信，代表 Resend 可以發送到：<strong>${testEmail}</strong></p>
          <p>時間：${new Date().toLocaleString('zh-TW')}</p>
        </div>
      `,
        })

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: `Email sent to ${testEmail}`,
            data
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
