function generateQuote(form, totalPrice) {
  let step = 3;
  let numberedContent = "";

  if (form.incorporation) {
    numberedContent += `<strong>[${step++}] Register Limited company </strong><br/>You can incorporate business through Companies House services - <a href="https://www.gov.uk/limited-company-formation/register-your-company">https://www.gov.uk/limited-company-formation/register-your-company</a>
The Companies House incorporation fee is £50 and can be paid by debit or credit card at the time of incorporation.
Company is usually registered within 24 hours and will usually be set up for Corporation Tax at the same time. <br/><br/>`;
  }

  if (form.mettle_freeAgent) {
    numberedContent += `<strong>[${step++}] Mettle & FreeAgent </strong><br/>You can open a business bank account with Mettle (by Natwest) for your business and you will get access to FreeAgent (accounting software) for free.
You can read more about Mettle here - <a href="https://www.mettle.co.uk">https://www.mettle.co.uk</a>
FreeAgent software is here - <a href="https://www.freeagent.com/en/">https://www.freeagent.com/en/</a><br/><br/>`;
  }

  if (form.virtualAddress) {
    numberedContent += `<strong>[${step++}] Registered Business Address </strong><br/>If you do not want to use your home address to be publicly available (on Companies House) then you can consider the serviced virtual address.
Some options below but you can search on Google and find the one that suits you better or are closest to your location.
      <br/> <a href="https://yourvirtualofficelondon.co.uk">https://yourvirtualofficelondon.co.uk</a>
      <br/> <a href="https://yourvirtualofficelondon.co.uk">https://yourvirtualofficelondon.co.uk</a><br/><br/>`;
  }

  if (form.trustPilot) {
    numberedContent += `<strong>[${step++}] Reviews </strong><br/>100's of clients have trusted Digital Accountant with their Accounting and Taxation needs. Feel free to check reviews from our existing clients.
Trustpilot - <a href="https://uk.trustpilot.com/review/digital-accountant.co.uk">https://uk.trustpilot.com/review/digital-accountant.co.uk</a><br/>`;
  }
  
  let quote = `
     <div>
Hey ${form.clientName},<br/>
I hope you are well.<br/>
It was great to catch up with you. As per our conversation, please see the information regarding ${
    form.tradingName
  }
        <br/>
  

         <strong>[1] Monthly services</strong><br/>
The quote is based on your provided information - <strong>£${totalPrice.toFixed(
    2
  )} + VAT 20%</strong><br/>
(50% will be off for the first 3 Months)<br/>
Services Offered in the quoted price:
<br/>
${
  form.accountingSection
    ? `<strong>Accounting</strong> - This includes accounting advice, Statutory Accounts completion (for businesses ${form.salesRange}/year);<br/>`
    : ``
}
${
  form.bookkeepingSection
    ? `<strong>Bookkeeping</strong> - Reviewing and reconciling ${form.transactionsPerMonth} transactions per month;<br/>`
    : ``
}
${
  form.VATSection
    ? `<strong>VAT Returns</strong> - This includes VAT Returns ${form.range} per ${form.frequency};<br/>`
    : ``
}
${
  form.AssetSection
    ? `<strong>Asset Register</strong> - This includes asset registration of ${form.fixedAssets} assets;<br/>`
    : ``
}
${
  form.payrollSection
    ? `<strong>Payroll</strong> - This includes running payroll for ${form.employeeCount}  employee(s);<br/>`
    : ``
}
${
  form.pensionSection
    ? `<strong>Pension</strong> - This includes handle pension for ${form.pensionEmployeeCount} employee(s);<br/>`
    : ``
}
${
  form.CISSection
    ? `<strong>CIS</strong> - This includes CIS Registration of ${form.contractorsCount} contractors per ${form.reportingFrequency};<br/>`
    : ``
}
${
  form.multiCurrencySection
    ? `<strong>Multi-currency</strong> - This includes transactions in multiple currencies;<br/>`
    : ``
}
${
  form.custom1Section
    ? `<strong>${form.custom1Name}</strong> - ${form.custom1Description};<br/>`
    : ``
}
${
  form.custom2Section
    ? `<strong>${form.custom2Name}</strong> - ${form.custom2Description};<br/>`
    : ``
}
${
  form.pandlePRO
    ? `<strong>Software</strong> - Free access to accounting software Pandle PRO;<br/>`
    : ``
}
Any additional work required which is not covered by the ‘Services Offered’ will be agreed upon with you and charged at an hourly rate of <strong>£33.00 + VAT</strong> or a set fee (Historic work, Registration for or deregistration from VAT/PAYE/CIS/Pension and other taxes, Training, Dealing with queries on your behalf (incl. calls to HMRC), Director Self Assessment, Confirmation Statement, Additional reporting, etc.)
<br/>
<strong>[2] Onboarding fee </strong><br/>
There is a one-off set-up fee of <strong>${
    form.onboardingfee
  }</strong> for new clients.<br/><br/>
${numberedContent}
Let me know if the prices are okay with you and my team will start with the onboarding process.

Kind regards,  
Rita Krekovska ACMA CGMA MiP
Digital Accountant 

E: <a href="mailto:info@digital-accountant.co.uk">info@digital-accountant.co.uk</a>
P: 07757307576
W: <a href="https://www.digital-accountant.co.uk" target="_blank">www.digital-accountant.co.uk</a>
YT: <a href="https://www.youtube.com/c/DigitalAccountant" target="_blank">https://www.youtube.com/c/DigitalAccountant</a>
</div>
`;
  return quote;
}

module.exports = generateQuote;
