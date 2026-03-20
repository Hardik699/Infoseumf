interface PayslipData {
  companyName: string;
  companyAddress: string;
  employeeName: string;
  uanNo: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  employeeCode: string;
  esicNo: string;
  bankAccountNo: string;
  daysInMonth: number;
  leaves: {
    type: string;
    total: number;
    availed: number;
    subsisting: number;
    lwp: number;
  }[];
  totalLeavesTaken: number;
  totalLeaveWithoutPay: number;
  totalPresentDays: number;
  totalDaysPayable: number;
  earnings: {
    name: string;
    actualGross: number;
    earnedGross: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  grossEarnings: number;
  earnedGrossEarnings: number;
  totalDeduction: number;
  netSalaryCredited: number;
  month: number;
  year: number;
  amountInWords: string;
}

export function Payslip({ data }: { data: PayslipData }) {
  const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const fmt = (v: number) => Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const th: React.CSSProperties = {
    backgroundColor: '#1e40af', color: '#fff', fontWeight: 700,
    fontSize: '11px', textTransform: 'uppercase', textAlign: 'center',
    padding: '7px 6px', letterSpacing: '0.5px', border: '1px solid #3b5fc0',
  };
  const td: React.CSSProperties = {
    border: '1px solid #bfdbfe', padding: '7px 10px',
    fontSize: '13px', fontWeight: 600, color: '#1e293b', textAlign: 'center', verticalAlign: 'middle',
  };
  const labelTd: React.CSSProperties = {
    ...td, backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: 700, fontSize: '12px',
  };
  const totalTd: React.CSSProperties = {
    ...td, backgroundColor: '#dbeafe', fontWeight: 800, border: '1px solid #93c5fd',
  };

  return (
    <div style={{ fontFamily: '"Inter","Segoe UI",Arial,sans-serif', backgroundColor: '#fff', maxWidth: '900px', margin: '0 auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '0.3px' }}>{data.companyName}</div>
          <div style={{ fontSize: '11px', color: '#bfdbfe', marginTop: '3px', fontWeight: 500 }}>{data.companyAddress}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Salary Slip</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{monthName}</div>
        </div>
      </div>

      <div style={{ padding: '18px 24px' }}>

        {/* ── Section label helper ── */}
        {/* Employee Information */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
          <div style={{ width: '3px', height: '16px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee Information</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', border: '1px solid #bfdbfe' }}>
          <tbody>
            <tr>
              <td style={labelTd}>Name</td>
              <td style={td}>{data.employeeName}</td>
              <td style={labelTd}>UAN No.</td>
              <td style={td}>{data.uanNo}</td>
            </tr>
            <tr>
              <td style={labelTd}>Department</td>
              <td style={td}>{data.department}</td>
              <td style={labelTd}>ESIC No.</td>
              <td style={td}>{data.esicNo}</td>
            </tr>
            <tr>
              <td style={labelTd}>Designation</td>
              <td style={td}>{data.designation}</td>
              <td style={labelTd}>Bank A/C No.</td>
              <td style={td}>{data.bankAccountNo}</td>
            </tr>
            <tr>
              <td style={labelTd}>Date of Joining</td>
              <td style={td}>{data.dateOfJoining}</td>
              <td style={labelTd}>Days in Month</td>
              <td style={td}>{data.daysInMonth}</td>
            </tr>
            <tr>
              <td style={labelTd}>Employee Code</td>
              <td style={td}>{data.employeeCode}</td>
              <td style={{ ...td, backgroundColor: '#f8fafc' }} colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        {/* Leave Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '16px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leave Details</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', border: '1px solid #bfdbfe' }}>
          <thead>
            <tr>
              <th style={{ ...th, width: '24%' }}>Leave Type</th>
              <th style={{ ...th, width: '24%' }}>Total in Account</th>
              <th style={{ ...th, width: '24%' }}>Availed</th>
              <th style={{ ...th, width: '24%' }}>Subsisting</th>
              <th style={{ ...th, width: '4%' }}>LWP</th>
            </tr>
          </thead>
          <tbody>
            {data.leaves.map((leave, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f0f6ff' }}>
                <td style={td}>{leave.type}</td>
                <td style={td}>{leave.total.toFixed(1)}</td>
                <td style={{ ...td, color: leave.availed > 0 ? '#dc2626' : '#1e293b' }}>{leave.availed.toFixed(1)}</td>
                <td style={td}>{leave.subsisting.toFixed(1)}</td>
                {idx === 0 && (
                  <td rowSpan={3} style={{ ...td, fontWeight: 800, fontSize: '14px', backgroundColor: '#fff' }}>{data.totalLeaveWithoutPay.toFixed(1)}</td>
                )}
              </tr>
            ))}
            <tr style={{ backgroundColor: '#dbeafe' }}>
              <td style={totalTd}>Total Leaves Taken</td>
              <td style={totalTd}>{data.totalLeavesTaken.toFixed(1)}</td>
              <td colSpan={3} style={totalTd}>Total Leave Without Pay: {data.totalLeaveWithoutPay.toFixed(1)}</td>
            </tr>
            <tr style={{ backgroundColor: '#dbeafe' }}>
              <td style={totalTd}>Total Present Days</td>
              <td style={totalTd}>{data.totalPresentDays.toFixed(1)}</td>
              <td colSpan={3} style={totalTd}>Total Days Payable: {data.totalDaysPayable.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>

        {/* Salary Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '16px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary Details</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', border: '1px solid #bfdbfe' }}>
          <colgroup>
            <col style={{ width: '22%' }} /><col style={{ width: '20%' }} /><col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} /><col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr>
              <th colSpan={3} style={{ ...th, background: 'linear-gradient(90deg,#1e40af,#2563eb)', fontSize: '13px', padding: '9px', borderBottom: '2px solid #fff', borderRight: '2px solid #fff' }}>EARNING</th>
              <th colSpan={2} style={{ ...th, background: 'linear-gradient(90deg,#1e40af,#2563eb)', fontSize: '13px', padding: '9px', borderBottom: '2px solid #fff' }}>DEDUCTION</th>
            </tr>
            <tr>
              <th style={{ ...th, borderTop: '2px solid #fff' }}>Component</th>
              <th style={{ ...th, borderTop: '2px solid #fff' }}>Actual</th>
              <th style={{ ...th, borderTop: '2px solid #fff', borderRight: '2px solid #fff' }}>Earned</th>
              <th style={{ ...th, borderTop: '2px solid #fff' }}>Component</th>
              <th style={{ ...th, borderTop: '2px solid #fff' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.earnings.map((earning, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f0f6ff' }}>
                <td style={td}>{earning.name}</td>
                <td style={td}>{fmt(earning.actualGross || 0)}</td>
                <td style={{ ...td, borderRight: '2px solid #bfdbfe' }}>{fmt(earning.earnedGross || 0)}</td>
                <td style={td}>{data.deductions[idx]?.name || ''}</td>
                <td style={td}>{data.deductions[idx]?.amount !== undefined ? fmt(data.deductions[idx].amount) : ''}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: '#dbeafe' }}>
              <td style={totalTd}>Gross Earnings</td>
              <td style={totalTd}>{fmt(data.grossEarnings)}</td>
              <td style={{ ...totalTd, borderRight: '2px solid #93c5fd' }}>{fmt(data.earnedGrossEarnings)}</td>
              <td style={totalTd}>Total Deduction</td>
              <td style={totalTd}>{fmt(data.totalDeduction)}</td>
            </tr>
            <tr style={{ background: 'linear-gradient(90deg,#1e3a8a,#1e40af)' }}>
              <td colSpan={3} style={{ ...td, color: '#fff', backgroundColor: 'transparent', fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px', border: '1px solid #3b5fc0' }}>Net Salary Credited</td>
              <td colSpan={2} style={{ ...td, color: '#fff', backgroundColor: 'transparent', fontWeight: 800, fontSize: '14px', border: '1px solid #3b5fc0' }}>₹ {fmt(data.netSalaryCredited)}</td>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <td colSpan={3} style={{ ...td, fontWeight: 700, color: '#374151', border: '1px solid #e2e8f0' }}>Amount in Words</td>
              <td colSpan={2} style={{ ...td, fontStyle: 'italic', color: '#15803d', fontWeight: 700, border: '1px solid #e2e8f0' }}>{data.amountInWords}</td>
            </tr>
          </tbody>
        </table>

      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
        <img src="https://cdn.builder.io/api/v1/image/assets%2F8012cbea6d4a4d528be55b21ebc4390f%2F5e57f6b47c4249638a8470815ec3ca60?format=webp&width=800&height=1200" alt="Logo" style={{ height: '40px', width: 'auto' }} />
        <p style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>This is a system generated slip</p>
      </div>
    </div>
  );
}
