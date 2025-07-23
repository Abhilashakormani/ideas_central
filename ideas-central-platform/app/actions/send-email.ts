import { Resend } from "resend"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  // Ensure the API key is available before initializing Resend
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set. Cannot send email.")
    return { success: false, message: "Email service not configured." }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const { data, error } = await resend.emails.send({
      from: "Ideas Central <onboarding@resend.dev>", // Replace with your verified domain
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, message: error.message }
    }

    console.log("Email sent successfully:", data)
    return { success: true, message: "Email sent successfully!" }
  } catch (error) {
    console.error("Unexpected error sending email:", error)
    return { success: false, message: "An unexpected error occurred while sending email." }
  }
}
