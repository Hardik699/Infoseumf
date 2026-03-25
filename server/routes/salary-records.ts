import { Router, RequestHandler } from "express";
import { SalaryRecord } from "../models/SalaryRecord";
import { Employee } from "../models/Employee";

const router = Router();

// Get all salary records
const getSalaryRecords: RequestHandler = async (_req, res) => {
  try {
    const records = await SalaryRecord.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch salary records",
    });
  }
};

// Get salary record by ID
const getSalaryRecordById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await SalaryRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary record not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch salary record",
    });
  }
};

// Get salary records by employee ID
const getSalaryRecordsByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year as string;

    let query: any = { employeeId };
    if (year) {
      query.year = parseInt(year, 10);
    }

    const records = await SalaryRecord.find(query).sort({ month: -1 });

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch salary records by employee",
    });
  }
};

// Get salary records by month and year
const getSalaryRecordsByMonth: RequestHandler = async (req, res) => {
  try {
    const { month, year } = req.params;

    const records = await SalaryRecord.find({
      month,
      year: parseInt(year, 10),
    });

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch salary records by month",
    });
  }
};

// Create salary record
const createSalaryRecord: RequestHandler = async (req, res) => {
  try {
    const recordData = req.body;
    
    console.log('=== SERVER: Creating Salary Record ===');
    console.log('Received data:', JSON.stringify(recordData, null, 2));
    console.log('Leave fields:', {
      plTotal: recordData.plTotal,
      plAvailed: recordData.plAvailed,
      plSubsisting: recordData.plSubsisting,
      plLwp: recordData.plLwp,
      clTotal: recordData.clTotal,
      clAvailed: recordData.clAvailed,
      clSubsisting: recordData.clSubsisting,
      clLwp: recordData.clLwp,
      slTotal: recordData.slTotal,
      slAvailed: recordData.slAvailed,
      slSubsisting: recordData.slSubsisting,
      slLwp: recordData.slLwp,
      lwp: recordData.lwp
    });

    const record = new SalaryRecord(recordData);
    await record.save();
    
    console.log('=== SERVER: Record Saved Successfully ===');
    console.log('Saved record ID:', record._id);
    console.log('Saved leave data:', {
      plTotal: record.plTotal,
      plAvailed: record.plAvailed,
      plSubsisting: record.plSubsisting,
      plLwp: record.plLwp,
      clTotal: record.clTotal,
      clAvailed: record.clAvailed,
      clSubsisting: record.clSubsisting,
      clLwp: record.clLwp,
      slTotal: record.slTotal,
      slAvailed: record.slAvailed,
      slSubsisting: record.slSubsisting,
      slLwp: record.slLwp,
      lwp: record.lwp
    });

    res.status(201).json({
      success: true,
      data: record,
      message: "Salary record created successfully",
    });
  } catch (error: any) {
    console.error('=== SERVER: Save Failed ===', error);
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: `A salary record already exists for employee ${recordData.employeeId} in ${recordData.month}. Please update the existing record instead.`,
        isDuplicate: true,
      });
    }

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create salary record",
    });
  }
};

// Update salary record
const updateSalaryRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('=== SERVER: Updating Salary Record ===');
    console.log('Record ID:', id);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    console.log('Leave fields in update:', {
      plTotal: updateData.plTotal,
      plAvailed: updateData.plAvailed,
      plSubsisting: updateData.plSubsisting,
      plLwp: updateData.plLwp,
      clTotal: updateData.clTotal,
      clAvailed: updateData.clAvailed,
      clSubsisting: updateData.clSubsisting,
      clLwp: updateData.clLwp,
      slTotal: updateData.slTotal,
      slAvailed: updateData.slAvailed,
      slSubsisting: updateData.slSubsisting,
      slLwp: updateData.slLwp,
      lwp: updateData.lwp
    });

    const record = await SalaryRecord.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary record not found",
      });
    }

    console.log('=== SERVER: Record Updated Successfully ===');
    console.log('Updated record ID:', record._id);
    console.log('Updated leave data:', {
      plTotal: record.plTotal,
      plAvailed: record.plAvailed,
      plSubsisting: record.plSubsisting,
      plLwp: record.plLwp,
      clTotal: record.clTotal,
      clAvailed: record.clAvailed,
      clSubsisting: record.clSubsisting,
      clLwp: record.clLwp,
      slTotal: record.slTotal,
      slAvailed: record.slAvailed,
      slSubsisting: record.slSubsisting,
      slLwp: record.slLwp,
      lwp: record.lwp
    });

    res.json({
      success: true,
      data: record,
      message: "Salary record updated successfully",
    });
  } catch (error) {
    console.error('=== SERVER: Update Failed ===', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update salary record",
    });
  }
};

// Delete salary record
const deleteSalaryRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await SalaryRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Salary record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete salary record",
    });
  }
};

// Bulk upload salary records
const bulkUploadSalaryRecords: RequestHandler = async (req, res) => {
  try {
    const { records, month, year } = req.body;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: "Invalid records format" });
    }

    for (const row of records) {
      try {
        // Find employee by ID or UAN Number
        const id = row.ID || row.id;
        const uan = row["UAN Number"] || row.uanNumber;

        let employee = null;
        if (id) {
          employee = await Employee.findOne({ employeeId: String(id) });
        }
        if (!employee && uan) {
          employee = await Employee.findOne({ uanNumber: String(uan) });
        }

        if (!employee) {
          results.failed++;
          results.errors.push({
            row: row.Name || row.id || "Unknown",
            error: `Employee not found (ID: ${id}, UAN: ${uan})`,
          });
          continue;
        }

        // Helper to parse float from multiple possible column names
        const pf = (keys: string[]) => {
          for (const k of keys) {
            const v = parseFloat(row[k]);
            if (!isNaN(v) && v !== 0) return v;
          }
          return 0;
        };

        // Map fields - final Excel format
        // Columns: ID, S No, Name, UAN Number, ESIC IP Numbers, Company, Department, Status,
        // CTC, Employer PF, Employer ESIC, Aadhar Card, DOJ, A/C No., IFSC Code,
        // Actual Gross, Actual Basic, Actual HRA, Actual Conveyance, Actual Spl Allowance, Actual Payable Gross,
        // Total Days, Days Worked,
        // Earned Basic, Earned HRA, Earned Conveyance, Earned Spl Allowance, Earned GROSS,
        // Payable PF Info, PF, PF-2, ESIC, ESIC info, ESIC-2, PT,
        // Retention Deduction, Advance Deduction, Adjustment, Deduction, Total Deduction, Net Salary,
        // Incentive1, Incentive2, Final Salary, Bonus, Gratuity, Advance Any, Adjustment Earned, TDS, Salary Paid
        const recordData: any = {
          employeeId: employee._id.toString(),
          month: month || row.Month || new Date().toISOString().substring(0, 7),
          year: year || parseInt(row.Year) || new Date().getFullYear(),
          totalWorkingDays: pf(["Total Days"]) || 30,
          actualWorkingDays: pf(["Days Worked"]),

          // Earnings (Actual) — from Actual* columns
          basic: pf(["Actual Basic"]),
          hra: pf(["Actual HRA"]),
          conveyance: pf(["Actual Conveyance"]),
          specialAllowance: pf(["Actual Spl Allowance"]),
          actualGross: pf(["Actual Gross", "Actual Payable Gross"]),

          // Earnings (Earned) — from Earned* columns
          basicEarned: pf(["Earned Basic"]),
          hraEarned: pf(["Earned HRA"]),
          conveyanceEarned: pf(["Earned Conveyance"]),
          specialAllowanceEarned: pf(["Earned Spl Allowance"]),
          earnedGross: pf(["Earned GROSS"]),

          // Yellow rows — only Earned column shown in slip
          bonus: pf(["Bonus"]),
          bonusEarned: pf(["Bonus"]),
          incentive: pf(["Incentive1"]),
          incentiveEarned: pf(["Incentive1"]),
          incentive2: pf(["Incentive2"]),
          incentive2Earned: pf(["Incentive2"]),
          adjustment: pf(["Adjustment"]),
          adjustmentEarned: pf(["Adjustment Earned", "Adjustment"]),
          retentionBonus: pf(["Retention Any", "Retention ANy"]),
          retentionBonusEarned: pf(["Retention Any", "Retention ANy"]),
          advanceAny: pf(["Advance Any"]),
          advanceAnyEarned: pf(["Advance Any"]),

          // Deductions
          pf: pf(["Payable PF Info", "PF"]),                // Payable PF Info = employee PF deduction
          esic: pf(["ESIC"]),                                // employee ESIC deduction
          pt: pf(["PT"]),
          tds: pf(["TDS"]),
          retention: pf(["Retention Deduction"]),
          advanceAnyDeduction: pf(["Advance Deduction"]),
          adjustmentDeduction: pf(["Adjustment Deduction", "Deduction"]),
          deductions: pf(["Total Deduction"]),

          // Employer contributions (info only, not shown in slip)
          employerPf: pf(["PF-2", "Payable PF Info"]),
          employerEsic: pf(["ESIC-2", "ESIC info"]),

          // Final salary
          netSalary: pf(["Net Salary", "Final Salary", "Salary Paid"]),
          totalSalary: pf(["Salary Paid", "Final Salary", "Net Salary"]),

          // Extra
          ctc: pf(["CTC"]),
          gratuity: pf(["Gratuity"]),
        };

        // Save or update
        await SalaryRecord.findOneAndUpdate(
          { employeeId: recordData.employeeId, month: recordData.month },
          recordData,
          { upsert: true, new: true }
        );

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: row.Name || row.id || "Unknown",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Bulk upload failed",
    });
  }
};

router.post("/", createSalaryRecord);
router.post("/bulk-upload", bulkUploadSalaryRecords);
router.get("/", getSalaryRecords);
router.get("/employee/:employeeId", getSalaryRecordsByEmployeeId);
router.get("/month/:month/:year", getSalaryRecordsByMonth);
router.get("/:id", getSalaryRecordById);
router.put("/:id", updateSalaryRecord);
router.delete("/:id", deleteSalaryRecord);

export { router as salaryRecordsRouter };
