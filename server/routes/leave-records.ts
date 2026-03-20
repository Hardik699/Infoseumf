import { Router, RequestHandler } from "express";
import { LeaveRecord } from "../models/LeaveRecord";
import { Employee } from "../models/Employee";

const router = Router();

// Get all leave records
const getLeaveRecords: RequestHandler = async (_req, res) => {
  try {
    const records = await LeaveRecord.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch leave records",
    });
  }
};

// Get leave records by employee ID
const getLeaveRecordsByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year as string;

    let query: any = { employeeId };
    if (year) {
      query.year = parseInt(year, 10);
    }

    const records = await LeaveRecord.find(query).sort({ month: -1 });

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
          : "Failed to fetch leave records by employee",
    });
  }
};

// Get leave records by month and year
const getLeaveRecordsByMonth: RequestHandler = async (req, res) => {
  try {
    const { month, year } = req.params;

    const records = await LeaveRecord.find({
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
          : "Failed to fetch leave records by month",
    });
  }
};

// Create leave record
const createLeaveRecord: RequestHandler = async (req, res) => {
  try {
    const recordData = req.body;

    const record = new LeaveRecord(recordData);
    await record.save();

    res.status(201).json({
      success: true,
      data: record,
      message: "Leave record created successfully",
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: `A leave record already exists for employee ${recordData.employeeId} in ${recordData.month}. Please update the existing record instead.`,
        isDuplicate: true,
      });
    }

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create leave record",
    });
  }
};

// Update leave record
const updateLeaveRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const record = await LeaveRecord.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Leave record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Leave record updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update leave record",
    });
  }
};

// Delete leave record
const deleteLeaveRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await LeaveRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Leave record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Leave record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete leave record",
    });
  }
};

// Bulk upload leave records
const bulkUploadLeaveRecords: RequestHandler = async (req, res) => {
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
        // Find employee: by ID first, then by Name as fallback
        const id = row.ID || row.id;
        const name = row.Name || row.name;

        let employee = null;
        if (id) {
          employee = await Employee.findOne({ employeeId: String(id) });
        }
        if (!employee && name) {
          employee = await Employee.findOne({
            fullName: { $regex: new RegExp(`^${String(name).trim()}$`, "i") },
          });
        }

        if (!employee) {
          results.failed++;
          results.errors.push({
            row: name || id || "Unknown",
            error: `Employee not found (ID: ${id}, Name: ${name})`,
          });
          continue;
        }

        const lwp = parseFloat(row["LWP"]) || 0;

        // All values direct from Excel — no auto-calculate
        const recordData: any = {
          employeeId: employee._id.toString(),
          month: month || new Date().toISOString().substring(0, 7),
          year: year || new Date().getFullYear(),

          // Paid Leave
          plLeaveAvailed: parseFloat(row["PL TOTAL LEAVE TAKEN"]) || 0,
          plSubsistingLeave: parseFloat(row["PL LEAVE BALANCE"]) || 0,
          plTotalLeaveInAccount: parseFloat(row["PL Total Leave In The Account"]) || 0,
          plLwp: lwp, // single LWP column → plLwp

          // Casual Leave
          clLeaveAvailed: parseFloat(row["CL TOTAL LEAVE TAKEN"]) || 0,
          clSubsistingLeave: parseFloat(row["CL LEAVE BALANCE"]) || 0,
          clTotalLeaveInAccount: parseFloat(row["CL Total Leave In The Account"]) || 0,
          clLwp: 0,

          // Sick Leave
          slLeaveAvailed: parseFloat(row["SL TOTAL LEAVE TAKEN"]) || 0,
          slSubsistingLeave: parseFloat(row["SL LEAVE BALANCE"]) || 0,
          slTotalLeaveInAccount: parseFloat(row["SL Total Leave In The Account"]) || 0,
          slLwp: 0,

          lwp,
        };

        // Save or update
        await LeaveRecord.findOneAndUpdate(
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

router.post("/", createLeaveRecord);
router.post("/bulk-upload", bulkUploadLeaveRecords);
router.get("/", getLeaveRecords);
router.get("/employee/:employeeId", getLeaveRecordsByEmployeeId);
router.get("/month/:month/:year", getLeaveRecordsByMonth);
router.delete("/:id", deleteLeaveRecord);
router.put("/:id", updateLeaveRecord);

export { router as leaveRecordsRouter };
