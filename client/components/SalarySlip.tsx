import React from "react";
import { cn, convertNumberToWords } from "@/lib/utils";

interface SalarySlipProps {
  employee: any;
  record: any;
  leaveRecord?: any;
  className?: string;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({ employee, record, leaveRecord, className }) => {
  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const earningRows = [
    { label: "Basic", actual: record.basic, earned: record.basicEarned },
    { label: "HRA", actual: record.hra, earned: record.hraEarned },
    { label: "Conveyance", actual: record.conveyance, earned: record.conveyanceEarned },
    { label: "Sp. Allowance", actual: record.specialAllowance, earned: record.specialAllowanceEarned },
    { label: "Bonus", actual: record.bonus, earned: record.bonusEarned },
    { label: "Incentive", actual: record.incentive, earned: record.incentiveEarned },
    { label: "Adjustment", actual: record.adjustment, earned: record.adjustmentEarned },
    { label: "Retention Any", actual: record.retentionBonus, earned: record.retentionBonusEarned },
    { label: "Advance Any", actual: record.advanceAny, earned: record.advanceAnyEarned },
  ];

  const deductionRows = [
    { label: "PF", amount: record.pf },
    { label: "ESIC", amount: record.esic },
    { label: "PT", amount: record.pt },
    { label: "TDS", amount: record.tds },
    { label: "Retention", amount: record.retention },
    { label: "", amount: null },
    { label: "", amount: null },
    { label: "", amount: null },
    { label: "", amount: null },
  ];

  const netSalary = record.netSalary || record.totalSalary || 0;

  return (
    <div className={cn("bg-white text-black p-6 font-sans text-xs", className)}>
      {/* Employee Information Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1e40af] mb-4 border-b-2 border-[#4a86e8] pb-1 uppercase">Employee Information</h2>
        <table style={{width: '100%', borderCollapse: 'collapse', border: '2px solid #1e3a8a', boxShadow: '0 2px 8px rgba(37,99,235,0.15)'}}>
          <tbody>
            <tr style={{backgroundColor: '#ffffff'}}>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', width: '25%', textAlign: 'center'}}>Name:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center', width: '25%'}}>{employee?.fullName}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', width: '25%', textAlign: 'center'}}>UAN No:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center', width: '25%'}}>{employee?.uanNumber || "N/A"}</td>
            </tr>
            <tr style={{backgroundColor: '#f0f6ff'}}>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', textAlign: 'center'}}>Department:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{employee?.department}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', textAlign: 'center'}}>ESIC No:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{employee?.esic || "N/A"}</td>
            </tr>
            <tr style={{backgroundColor: '#ffffff'}}>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', textAlign: 'center'}}>Designation:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{employee?.position}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', textAlign: 'center'}}>Days in Month:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{record.totalWorkingDays || 30}</td>
            </tr>
            <tr style={{backgroundColor: '#f0f6ff'}}>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', textAlign: 'center'}}>Joining Date:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{employee?.joiningDate}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '800', color: '#1e40af', backgroundColor: '#eff6ff', textAlign: 'center'}}>Employee Code:</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{employee?.employeeId}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Salary Details Table */}
      <table className="w-full border-collapse" style={{tableLayout: 'fixed'}}>
        <colgroup>
          <col style={{width: '20%'}} />
          <col style={{width: '20%'}} />
          <col style={{width: '20%'}} />
          <col style={{width: '20%'}} />
          <col style={{width: '20%'}} />
        </colgroup>
        <thead>
          <tr>
            <th colSpan={3} style={{background: 'linear-gradient(135deg, #4a86e8 0%, #2563eb 100%)', color: '#ffffff', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center', padding: '12px 8px', letterSpacing: '0px', border: '2px solid #1e3a8a', borderBottom: '3px solid #ffffff'}}>EARNING</th>
            <th colSpan={2} style={{background: 'linear-gradient(135deg, #4a86e8 0%, #2563eb 100%)', color: '#ffffff', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center', padding: '12px 8px', letterSpacing: '0px', border: '2px solid #1e3a8a', borderLeft: '4px solid #ffffff', borderBottom: '3px solid #ffffff'}}>DEDUCTION</th>
          </tr>
          <tr>
            <th style={{backgroundColor: '#1e40af', color: '#ffffff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', borderTop: '3px solid #ffffff'}}>COMPONENT</th>
            <th style={{backgroundColor: '#1e40af', color: '#ffffff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', borderTop: '3px solid #ffffff'}}>ACTUAL</th>
            <th style={{backgroundColor: '#1e40af', color: '#ffffff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', borderTop: '3px solid #ffffff'}}>EARNED</th>
            <th style={{backgroundColor: '#1e40af', color: '#ffffff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', borderLeft: '4px solid #ffffff', borderTop: '3px solid #ffffff'}}>COMPONENT</th>
            <th style={{backgroundColor: '#1e40af', color: '#ffffff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', borderTop: '3px solid #ffffff'}}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {earningRows.map((row, idx) => (
            <tr key={idx} style={{backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f0f6ff'}}>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '700', color: '#1e293b', textAlign: 'center'}}>{row.label}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{row.actual !== undefined ? formatCurrency(row.actual) : "0.00"}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{row.earned !== undefined ? formatCurrency(row.earned) : "0.00"}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '700', color: '#1e293b', textAlign: 'center'}}>{deductionRows[idx]?.label}</td>
              <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{deductionRows[idx]?.amount !== null ? formatCurrency(deductionRows[idx].amount) : "0.00"}</td>
            </tr>
          ))}
          <tr style={{backgroundColor: '#dbeafe'}}>
            <td style={{border: '2px solid #3b82f6', padding: '9px 10px', fontWeight: '800', color: '#1e293b', textAlign: 'center', textTransform: 'uppercase'}}>Gross Earnings</td>
            <td style={{border: '2px solid #3b82f6', padding: '9px 8px', fontWeight: '800', color: '#1e293b', textAlign: 'center'}}>{formatCurrency(record.actualGross)}</td>
            <td style={{border: '2px solid #3b82f6', padding: '9px 8px', fontWeight: '800', color: '#1e293b', textAlign: 'center'}}>{formatCurrency(record.earnedGross)}</td>
            <td style={{border: '2px solid #3b82f6', padding: '9px 10px', fontWeight: '800', color: '#1e293b', textAlign: 'center', textTransform: 'uppercase'}}>Total Deduction</td>
            <td style={{border: '2px solid #3b82f6', padding: '9px 8px', fontWeight: '800', color: '#1e293b', textAlign: 'center'}}>{formatCurrency(record.deductions)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style={{background: 'linear-gradient(135deg, #1c4587 0%, #1e40af 100%)'}}>
            <td colSpan={3} style={{border: '2px solid #1e3a8a', padding: '11px 16px', fontWeight: '800', color: '#ffffff', textAlign: 'center', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase'}}>Net Salary Credited</td>
            <td colSpan={2} style={{border: '2px solid #1e3a8a', padding: '11px 16px', fontWeight: '800', color: '#ffffff', textAlign: 'center', fontSize: '13px'}}>₹ {formatCurrency(netSalary)}</td>
          </tr>
          <tr style={{backgroundColor: '#f8fafc'}}>
            <td colSpan={3} style={{border: '2px solid #93c5fd', padding: '11px 16px', fontWeight: '700', color: '#374151', textAlign: 'center'}}>Amount (in words)</td>
            <td colSpan={2} style={{border: '2px solid #93c5fd', padding: '11px 16px', fontStyle: 'italic', color: '#15803d', fontWeight: '700', textAlign: 'center'}}>
              {convertNumberToWords(netSalary)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Leave Details Section */}
      {leaveRecord && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-[#1e40af] mb-4 border-b-2 border-[#4a86e8] pb-1 uppercase">Leave Details</h2>
          <table style={{width: '100%', borderCollapse: 'collapse', border: '2px solid #1e3a8a', boxShadow: '0 2px 8px rgba(37,99,235,0.15)'}}>
            <thead>
              <tr>
                <th style={{backgroundColor: '#1e40af', color: '#fff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', width: '25%'}}>LEAVE TYPE</th>
                <th style={{backgroundColor: '#1e40af', color: '#fff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', width: '25%'}}>TOTAL LEAVE IN THE ACCOUNT</th>
                <th style={{backgroundColor: '#1e40af', color: '#fff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', width: '25%'}}>LEAVE AVAILED</th>
                <th style={{backgroundColor: '#1e40af', color: '#fff', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', textAlign: 'center', padding: '8px 6px', letterSpacing: '1px', border: '2px solid #1e3a8a', width: '25%'}}>SUBSISTING LEAVE</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{backgroundColor: '#ffffff'}}>
                <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '700', color: '#1e293b', textAlign: 'center'}}>PL (Paid Leave)</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{leaveRecord.plTotalLeaveInAccount || 0}</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', textAlign: 'center', color: (leaveRecord.plLeaveAvailed || 0) > 0 ? '#dc2626' : '#1e293b'}}>{leaveRecord.plLeaveAvailed || 0}</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{leaveRecord.plSubsistingLeave || 0}</td>
              </tr>
              <tr style={{backgroundColor: '#f0f6ff'}}>
                <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '700', color: '#1e293b', textAlign: 'center'}}>CL (Casual Leave)</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{leaveRecord.clTotalLeaveInAccount || 0}</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', textAlign: 'center', color: (leaveRecord.clLeaveAvailed || 0) > 0 ? '#dc2626' : '#1e293b'}}>{leaveRecord.clLeaveAvailed || 0}</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{leaveRecord.clSubsistingLeave || 0}</td>
              </tr>
              <tr style={{backgroundColor: '#ffffff'}}>
                <td style={{border: '2px solid #93c5fd', padding: '7px 10px', fontWeight: '700', color: '#1e293b', textAlign: 'center'}}>SL (Sick Leave)</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{leaveRecord.slTotalLeaveInAccount || 0}</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', textAlign: 'center', color: (leaveRecord.slLeaveAvailed || 0) > 0 ? '#dc2626' : '#1e293b'}}>{leaveRecord.slLeaveAvailed || 0}</td>
                <td style={{border: '2px solid #93c5fd', padding: '7px 8px', fontWeight: '600', color: '#1e293b', textAlign: 'center'}}>{leaveRecord.slSubsistingLeave || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
