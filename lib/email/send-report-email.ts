import "server-only";

import {Resend} from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendReportsReadyEmail(args:{to:string;organizationName:string;reportName:string;downloadUrl:string}){
    const from = process.env.EMAIL_FROM;

    if(!resend || !from){
        throw new Error("Email provider is not configured");
    }

    await resend.emails.send({from,to:args.to,subject:`${args.organizationName} report is ready`,html:
        `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2 style="margin-bottom: 12px;">Your report is ready</h2>
        <p><strong>${args.reportName}</strong> has been generated successfully.</p>
        <p>
          <a
            href="${args.downloadUrl}"
            style="
              display: inline-block;
              padding: 10px 16px;
              background: #111;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Download PDF
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Sent from Client Reporting Dashboard
        </p>
      </div>
        `,
    })
}