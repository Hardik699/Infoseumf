import { Router, RequestHandler } from "express";
import { Employee } from "../models/Employee";
import { SalaryRecord } from "../models/SalaryRecord";
import { LeaveRecord } from "../models/LeaveRecord";
import { Settings } from "../models/Settings";
import archiver from "archiver";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import PDFDocument from "pdfkit";

const router = Router();

// Helper function to convert number to words
function numToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return '';
  let words = '';

  if (num >= 10000000) {
    words += numToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    words += numToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    words += numToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num >= 10) {
    words += teens[num - 10] + ' ';
    return words;
  }
  if (num > 0) {
    words += ones[num] + ' ';
  }
  return words;
}

function convertNumberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  return numToWords(num).trim() + ' Rupees Only';
}

// Generate HTML for payslip - exact same format as Payslip component
async function generatePayslipHTML(employee: any, salaryRecord: any, leaveRecord: any, month: string): Promise<string> {
  const formatCurrency = (val: number) => Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const monthDate = new Date(month + '-01');
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Fetch logo from database
  let logoDataUrl = "";
  try {
    const logoSetting = await Settings.findOne({ key: "company-logo" });
    if (logoSetting && logoSetting.value) {
      logoDataUrl = logoSetting.value;
    }
  } catch (error) {
    console.error("Failed to fetch logo:", error);
  }

  const leaves = [
    { type: 'PL', total: leaveRecord?.plTotalLeaveInAccount || 0, availed: leaveRecord?.plLeaveAvailed || 0, subsisting: leaveRecord?.plSubsistingLeave || 0, lwp: leaveRecord?.plLwp || 0 },
    { type: 'CL', total: leaveRecord?.clTotalLeaveInAccount || 0, availed: leaveRecord?.clLeaveAvailed || 0, subsisting: leaveRecord?.clSubsistingLeave || 0, lwp: leaveRecord?.clLwp || 0 },
    { type: 'SL', total: leaveRecord?.slTotalLeaveInAccount || 0, availed: leaveRecord?.slLeaveAvailed || 0, subsisting: leaveRecord?.slSubsistingLeave || 0, lwp: leaveRecord?.slLwp || 0 }
  ];

  const totalLeavesTaken = (leaveRecord?.plLeaveAvailed || 0) + (leaveRecord?.clLeaveAvailed || 0) + (leaveRecord?.slLeaveAvailed || 0);
  const totalLwp = (leaveRecord?.plLwp || 0) + (leaveRecord?.clLwp || 0) + (leaveRecord?.slLwp || 0);

  // Shared style snippets
  const TH = `background:#1e40af;color:#fff;font-weight:700;font-size:9px;text-transform:uppercase;text-align:center;padding:6px 5px;border:1px solid #3b5fc0;vertical-align:middle;`;
  const TD = `border:1px solid #bfdbfe;padding:6px 8px;font-size:9px;font-weight:600;color:#1e293b;text-align:center;vertical-align:middle;`;
  const LBL = `${TD}background:#eff6ff;color:#1e40af;font-weight:700;`;
  const TOTAL = `${TD}background:#dbeafe;font-weight:800;border:1px solid #93c5fd;`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Inter','Segoe UI',Arial,sans-serif; background:#fff; color:#000; font-size:9px; }
table { width:100%; border-collapse:collapse; margin:0 0 10px 0; }
.st { table-layout:fixed; }
</style></head><body>

<!-- Header -->
<div style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
  <div>
    <div style="font-size:14px;font-weight:800;color:#fff;">INFOSEUM IT OPC PVT LTD.</div>
    <div style="font-size:8px;color:#bfdbfe;margin-top:2px;font-weight:500;">Imperial Heights -701, Near Akshar Chowk, Atladra, Vadodara-390012, Gujarat</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:8px;color:#93c5fd;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Salary Slip</div>
    <div style="font-size:12px;font-weight:800;color:#fff;margin-top:1px;">${monthName}</div>
  </div>
</div>

<div style="padding:12px 18px;">

<!-- Employee Information -->
<div style="display:flex;align-items:center;gap:6px;margin:8px 0 5px;"><div style="width:3px;height:13px;background:#2563eb;border-radius:2px;"></div><span style="font-size:9px;font-weight:800;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">Employee Information</span></div>
<table style="border:1px solid #bfdbfe;">
<tr><td style="${LBL}width:25%;">Name</td><td style="${TD}width:25%;">${employee.fullName}</td><td style="${LBL}width:25%;">UAN No.</td><td style="${TD}width:25%;">${employee.uanNumber || 'N/A'}</td></tr>
<tr><td style="${LBL}">Department</td><td style="${TD}">${employee.department}</td><td style="${LBL}">ESIC No.</td><td style="${TD}">${employee.esic || 'N/A'}</td></tr>
<tr><td style="${LBL}">Designation</td><td style="${TD}">${employee.position}</td><td style="${LBL}">Bank A/C No.</td><td style="${TD}">${employee.accountNumber || 'N/A'}</td></tr>
<tr><td style="${LBL}">Date of Joining</td><td style="${TD}">${employee.joiningDate || 'N/A'}</td><td style="${LBL}">Days in Month</td><td style="${TD}">${salaryRecord.totalWorkingDays || 30}</td></tr>
<tr><td style="${LBL}">Employee Code</td><td style="${TD}">${employee.employeeId}</td><td colspan="2" style="${TD}background:#f8fafc;"></td></tr>
</table>

<!-- Leave Details -->
<div style="display:flex;align-items:center;gap:6px;margin:8px 0 5px;"><div style="width:3px;height:13px;background:#2563eb;border-radius:2px;"></div><span style="font-size:9px;font-weight:800;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">Leave Details</span></div>
<table style="border:1px solid #bfdbfe;">
<tr><th style="${TH}width:24%;">Leave Type</th><th style="${TH}width:24%;">Total in Account</th><th style="${TH}width:24%;">Availed</th><th style="${TH}width:24%;">Subsisting</th><th style="${TH}width:4%;">LWP</th></tr>
<tr style="background:#fff;"><td style="${TD}">${leaves[0].type}</td><td style="${TD}">${leaves[0].total.toFixed(1)}</td><td style="${TD}color:${leaves[0].availed>0?'#dc2626':'#1e293b'};">${leaves[0].availed.toFixed(1)}</td><td style="${TD}">${leaves[0].subsisting.toFixed(1)}</td><td rowspan="3" style="${TD}font-weight:800;font-size:10px;">${totalLwp.toFixed(1)}</td></tr>
<tr style="background:#f0f6ff;"><td style="${TD}">${leaves[1].type}</td><td style="${TD}">${leaves[1].total.toFixed(1)}</td><td style="${TD}color:${leaves[1].availed>0?'#dc2626':'#1e293b'};">${leaves[1].availed.toFixed(1)}</td><td style="${TD}">${leaves[1].subsisting.toFixed(1)}</td></tr>
<tr style="background:#fff;"><td style="${TD}">${leaves[2].type}</td><td style="${TD}">${leaves[2].total.toFixed(1)}</td><td style="${TD}color:${leaves[2].availed>0?'#dc2626':'#1e293b'};">${leaves[2].availed.toFixed(1)}</td><td style="${TD}">${leaves[2].subsisting.toFixed(1)}</td></tr>
<tr><td style="${TOTAL}">Total Leaves Taken</td><td style="${TOTAL}">${totalLeavesTaken.toFixed(1)}</td><td colspan="3" style="${TOTAL}">Total Leave Without Pay: ${totalLwp.toFixed(1)}</td></tr>
<tr><td style="${TOTAL}">Total Present Days</td><td style="${TOTAL}">${(salaryRecord.actualWorkingDays||0).toFixed(1)}</td><td colspan="3" style="${TOTAL}">Total Days Payable: ${(salaryRecord.actualWorkingDays||0).toFixed(1)}</td></tr>
</table>

<!-- Salary Details -->
<div style="display:flex;align-items:center;gap:6px;margin:8px 0 5px;"><div style="width:3px;height:13px;background:#2563eb;border-radius:2px;"></div><span style="font-size:9px;font-weight:800;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">Salary Details</span></div>
<table class="st" style="border:1px solid #bfdbfe;">
<colgroup><col style="width:22%;"/><col style="width:20%;"/><col style="width:20%;"/><col style="width:20%;"/><col style="width:18%;"/></colgroup>
<tr><th colspan="3" style="${TH}font-size:11px;padding:8px;border-right:2px solid #fff;border-bottom:2px solid #fff;">EARNING</th><th colspan="2" style="${TH}font-size:11px;padding:8px;border-bottom:2px solid #fff;">DEDUCTION</th></tr>
<tr><th style="${TH}border-top:2px solid #fff;">Component</th><th style="${TH}border-top:2px solid #fff;">Actual</th><th style="${TH}border-top:2px solid #fff;border-right:2px solid #fff;">Earned</th><th style="${TH}border-top:2px solid #fff;">Component</th><th style="${TH}border-top:2px solid #fff;">Amount</th></tr>
<tr style="background:#fff;"><td style="${TD}">Basic</td><td style="${TD}">${formatCurrency(salaryRecord.basic||0)}</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.basicEarned||0)}</td><td style="${TD}">PF</td><td style="${TD}">${formatCurrency(salaryRecord.pf||0)}</td></tr>
<tr style="background:#f0f6ff;"><td style="${TD}">HRA</td><td style="${TD}">${formatCurrency(salaryRecord.hra||0)}</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.hraEarned||0)}</td><td style="${TD}">ESIC</td><td style="${TD}">${formatCurrency(salaryRecord.esic||0)}</td></tr>
<tr style="background:#fff;"><td style="${TD}">Conveyance</td><td style="${TD}">${formatCurrency(salaryRecord.conveyance||0)}</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.conveyanceEarned||0)}</td><td style="${TD}">PT</td><td style="${TD}">${formatCurrency(salaryRecord.pt||0)}</td></tr>
<tr style="background:#f0f6ff;"><td style="${TD}">Sp. Allowance</td><td style="${TD}">${formatCurrency(salaryRecord.specialAllowance||0)}</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.specialAllowanceEarned||0)}</td><td style="${TD}">TDS</td><td style="${TD}">${formatCurrency(salaryRecord.tds||0)}</td></tr>
<tr style="background:#fff;"><td style="${TD}">Bonus</td><td style="${TD}">0.00</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.bonusEarned||0)}</td><td style="${TD}">Retention Deduction</td><td style="${TD}">${formatCurrency(salaryRecord.retention||0)}</td></tr>
<tr style="background:#f0f6ff;"><td style="${TD}">Incentive</td><td style="${TD}">0.00</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.incentiveEarned||0)}</td><td style="${TD}">Advance Any</td><td style="${TD}">${formatCurrency(salaryRecord.advanceAnyDeduction||0)}</td></tr>
<tr style="background:#fff;"><td style="${TD}">Incentive 2</td><td style="${TD}">0.00</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.incentive2Earned||0)}</td><td style="${TD}">Adjustment Deduction</td><td style="${TD}">${formatCurrency(salaryRecord.adjustmentDeduction||0)}</td></tr>
<tr style="background:#fff;"><td style="${TD}">Adjustment</td><td style="${TD}">0.00</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.adjustmentEarned||salaryRecord.adjustment||0)}</td><td style="${TD}"></td><td style="${TD}"></td></tr>
<tr style="background:#f0f6ff;"><td style="${TD}">Retention Any</td><td style="${TD}">0.00</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.retentionBonus||0)}</td><td style="${TD}"></td><td style="${TD}"></td></tr>
<tr style="background:#fff;"><td style="${TD}">Advance Any</td><td style="${TD}">0.00</td><td style="${TD}border-right:2px solid #bfdbfe;">${formatCurrency(salaryRecord.advanceAnyEarned||salaryRecord.advanceAny||0)}</td><td style="${TD}"></td><td style="${TD}"></td></tr>
<tr><td style="${TOTAL}">Gross Earnings</td><td style="${TOTAL}">${formatCurrency((salaryRecord.basic||0)+(salaryRecord.hra||0)+(salaryRecord.conveyance||0)+(salaryRecord.specialAllowance||0)+(salaryRecord.bonus||0)+(salaryRecord.incentive||0)+(salaryRecord.incentive2||0)+(salaryRecord.adjustment||0)+(salaryRecord.retentionBonus||0)+(salaryRecord.advanceAny||0))}</td><td style="${TOTAL}border-right:2px solid #93c5fd;">${formatCurrency((salaryRecord.basicEarned||0)+(salaryRecord.hraEarned||0)+(salaryRecord.conveyanceEarned||0)+(salaryRecord.specialAllowanceEarned||0)+(salaryRecord.bonusEarned||0)+(salaryRecord.incentiveEarned||0)+(salaryRecord.incentive2Earned||0)+(salaryRecord.adjustmentEarned||salaryRecord.adjustment||0)+(salaryRecord.retentionBonus||0)+(salaryRecord.advanceAnyEarned||salaryRecord.advanceAny||0))}</td><td style="${TOTAL}">Total Deduction</td><td style="${TOTAL}">${formatCurrency((salaryRecord.pf||0)+(salaryRecord.esic||0)+(salaryRecord.pt||0)+(salaryRecord.tds||0)+(salaryRecord.retention||0)+(salaryRecord.advanceAnyDeduction||0)+(salaryRecord.adjustmentDeduction||0))}</td></tr>
<tr style="background:linear-gradient(90deg,#1e3a8a,#1e40af);"><td colspan="3" style="border:1px solid #3b5fc0;padding:7px 8px;font-weight:800;color:#fff;text-align:center;font-size:10px;">Net Salary Credited</td><td colspan="2" style="border:1px solid #3b5fc0;padding:7px 8px;font-weight:800;color:#fff;text-align:center;font-size:10px;">&#8377; ${formatCurrency(((salaryRecord.basicEarned||0)+(salaryRecord.hraEarned||0)+(salaryRecord.conveyanceEarned||0)+(salaryRecord.specialAllowanceEarned||0)+(salaryRecord.bonusEarned||0)+(salaryRecord.incentiveEarned||0)+(salaryRecord.incentive2Earned||0)+(salaryRecord.adjustmentEarned||salaryRecord.adjustment||0)+(salaryRecord.retentionBonus||0)+(salaryRecord.advanceAnyEarned||salaryRecord.advanceAny||0))-((salaryRecord.pf||0)+(salaryRecord.esic||0)+(salaryRecord.pt||0)+(salaryRecord.tds||0)+(salaryRecord.retention||0)+(salaryRecord.advanceAnyDeduction||0)+(salaryRecord.adjustmentDeduction||0)))}</td></tr>
<tr style="background:#f8fafc;"><td colspan="3" style="${TD}font-weight:700;color:#374151;">Amount in Words</td><td colspan="2" style="${TD}font-style:italic;color:#15803d;font-weight:700;">${convertNumberToWords(Math.round(((salaryRecord.basicEarned||0)+(salaryRecord.hraEarned||0)+(salaryRecord.conveyanceEarned||0)+(salaryRecord.specialAllowanceEarned||0)+(salaryRecord.bonusEarned||0)+(salaryRecord.incentiveEarned||0)+(salaryRecord.incentive2Earned||0)+(salaryRecord.adjustmentEarned||salaryRecord.adjustment||0)+(salaryRecord.retentionBonus||0)+(salaryRecord.advanceAnyEarned||salaryRecord.advanceAny||0))-((salaryRecord.pf||0)+(salaryRecord.esic||0)+(salaryRecord.pt||0)+(salaryRecord.tds||0)+(salaryRecord.retention||0)+(salaryRecord.advanceAnyDeduction||0)+(salaryRecord.adjustmentDeduction||0))))}</td></tr>
</table>

</div>

<!-- Footer -->
<div style="border-top:1px solid #e2e8f0;padding:8px 18px;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;">
  ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" style="height:30px;width:auto;">` : '<div></div>'}
  <p style="font-size:8px;color:#9ca3af;font-style:italic;margin:0;">This is a system generated slip</p>
</div>

</body></html>`;
}

// Bulk download endpoint
const bulkDownloadSlips: RequestHandler = async (req, res) => {
  let browser;
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ success: false, message: 'Month parameter required (YYYY-MM)' });
    }

    console.log(`Generating bulk slips for: ${month}`);
    const employees = await Employee.find({ status: 'active' });
    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No active employees' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`All_Salary_Slips_${month}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    // Launch browser once for all employees (HUGE speed improvement)
    // Use different approach for local vs serverless
    const isLocal = process.env.NODE_ENV !== 'production' || process.platform === 'win32';
    
    if (isLocal) {
      // Local development - use regular puppeteer with bundled Chromium
      const puppeteerRegular = await import('puppeteer');
      browser = await puppeteerRegular.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } else {
      // Production/Serverless - use chromium
      browser = await puppeteer.launch({ 
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }

    let processed = 0, skipped = 0;
    
    // Process employees in batches of 3 for speed
    const batchSize = 3;
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (employee) => {
        try {
          const salaryRecord = await SalaryRecord.findOne({ employeeId: employee._id.toString(), month });
          if (!salaryRecord) { 
            skipped++; 
            return; 
          }
          
          const leaveRecord = await LeaveRecord.findOne({ employeeId: employee._id.toString(), month });
          const html = await generatePayslipHTML(employee, salaryRecord, leaveRecord, month);
          
          let password = String(employee.uanNumber || "000000").replace(/\D/g, '').slice(-6);
          if (password.length < 6) password = password.padStart(6, '0');
          
          // Create new page for this employee
          const page = await browser!.newPage();
          
          // Set viewport to portrait A4 with proper content fitting
          await page.setViewport({
            width: 595,  // A4 width in pixels at 72 DPI (portrait)
            height: 842, // A4 height in pixels at 72 DPI (portrait)
            deviceScaleFactor: 2  // Higher quality
          });
          
          await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 5000 });
          
          // Wait for content to render
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get actual content height to avoid blank space
          const contentHeight = await page.evaluate(() => {
            return document.body.scrollHeight;
          });
          
          // Use actual content height or A4 height, whichever is smaller
          const finalHeight = Math.min(contentHeight + 20, 842);
          
          const screenshot = await page.screenshot({ 
            type: 'jpeg',
            quality: 95,
            fullPage: false,
            clip: {
              x: 0,
              y: 0,
              width: 595,
              height: finalHeight
            }
          });
          await page.close();

          // Create PDF with password
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({
              size: "A4",
              userPassword: password,
              ownerPassword: `OWN_${password}_SECURE_2024`,
              permissions: {
                copying: false,
                modifying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: false,
                documentAssembly: false,
              },
            });

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
            const pageWidth = doc.page.width - 40;
            const pageHeight = doc.page.height - 40;
            doc.image(screenshot, 20, 20, {
              fit: [pageWidth, pageHeight],
              align: "center",
              valign: "center",
            });
            doc.end();
          });

          archive.append(pdfBuffer, { name: `${employee.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${month}.pdf` });
          processed++;
          console.log(`Processed: ${employee.fullName}`);
        } catch (error) {
          console.error(`Error: ${employee.fullName}`, error);
          skipped++;
        }
      }));
    }

    await browser.close();
    console.log(`Complete: ${processed} processed, ${skipped} skipped`);
    await archive.finalize();
  } catch (error) {
    if (browser) await browser.close();
    console.error('Bulk download error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed' });
  }
};

router.get("/bulk-download", bulkDownloadSlips);
export { router as salarySlipsRouter };
