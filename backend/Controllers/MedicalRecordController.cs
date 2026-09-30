
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/medical-records")]
    public class MedicalRecordController : ControllerBase
    {
        private readonly MediShieldContext _context;

        public MedicalRecordController(MediShieldContext context)
        {
            _context = context;
        }

        // ==========================================
        // CREATE MEDICAL RECORD
        // POST: /api/medical-records/add
        // ==========================================

        public class CreateMedicalRecordRequest
        {
            public string PatientId { get; set; } = string.Empty;
            public string DoctorId { get; set; } = string.Empty;
            public string? NurseId { get; set; }
            public string Diagnosis { get; set; } = string.Empty;
            public string Prescription { get; set; } = string.Empty;
            public string Notes { get; set; } = string.Empty;
        }

        [HttpPost("add")]
        public async Task<IActionResult> CreateRecord(
            [FromBody] CreateMedicalRecordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PatientId) ||
                string.IsNullOrWhiteSpace(request.DoctorId) ||
                string.IsNullOrWhiteSpace(request.Diagnosis))
            {
                return BadRequest(new
                {
                    message = "Patient ID, Doctor ID and diagnosis are required."
                });
            }

            // Check patient
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.PatientId == request.PatientId);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found."
                });
            }

            // Check doctor
            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.DoctorId == request.DoctorId);

            if (doctor == null)
            {
                return NotFound(new
                {
                    message = "Doctor not found."
                });
            }

            // Check nurse if supplied
            if (!string.IsNullOrWhiteSpace(request.NurseId))
            {
                var nurseExists = await _context.Nurses
                    .AnyAsync(n => n.NurseId == request.NurseId);

                if (!nurseExists)
                {
                    return NotFound(new
                    {
                        message = "Nurse not found."
                    });
                }
            }

            // Generate REC001, REC002, REC003...
            var lastRecord = await _context.MedicalRecords
                .OrderByDescending(r => r.Id)
                .FirstOrDefaultAsync();

            var number = 1;

            if (lastRecord != null &&
                !string.IsNullOrWhiteSpace(lastRecord.RecordId))
            {
                var numericPart = lastRecord.RecordId
                    .Replace("REC", "");

                if (int.TryParse(numericPart, out var lastNumber))
                {
                    number = lastNumber + 1;
                }
            }

            var recordId = $"REC{number:D3}";

            var record = new MedicalRecord
            {
                RecordId = recordId,
                PatientId = request.PatientId.Trim(),
                DoctorId = request.DoctorId.Trim(),
                NurseId = string.IsNullOrWhiteSpace(request.NurseId)
                    ? null
                    : request.NurseId.Trim(),
                Diagnosis = request.Diagnosis.Trim(),
                Prescription = request.Prescription?.Trim() ?? "",
                Notes = request.Notes?.Trim() ?? "",
                RecordDate = DateTime.UtcNow
            };

            _context.MedicalRecords.Add(record);

            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                message = "Medical record created successfully.",
                record = new
                {
                    recordId = record.RecordId,
                    patientId = record.PatientId,
                    doctorId = record.DoctorId,
                    nurseId = record.NurseId,
                    diagnosis = record.Diagnosis,
                    prescription = record.Prescription,
                    notes = record.Notes,
                    recordDate = record.RecordDate
                }
            });
        }

        // ==========================================
        // GET ALL MEDICAL RECORDS
        // GET: /api/medical-records
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllRecords()
        {
            var records = await _context.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .Include(r => r.Nurse)
                .OrderByDescending(r => r.RecordDate)
                .Select(r => new
                {
                    recordId = r.RecordId,

                    patientId = r.PatientId,
                    patientName = r.Patient != null
                        ? r.Patient.Name
                        : "",

                    doctorId = r.DoctorId,
                    doctorName = r.Doctor != null
                        ? r.Doctor.Name
                        : "",

                    nurseId = r.NurseId,
                    nurseName = r.Nurse != null
                        ? r.Nurse.Name
                        : null,

                    diagnosis = r.Diagnosis,
                    prescription = r.Prescription,
                    notes = r.Notes,
                    recordDate = r.RecordDate
                })
                .ToListAsync();

            return Ok(records);
        }

        // ==========================================
        // GET RECORD BY ID
        // GET: /api/medical-records/REC001
        // ==========================================

        [HttpGet("{recordId}")]
        public async Task<IActionResult> GetRecord(string recordId)
        {
            var record = await _context.MedicalRecords
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
                .Include(r => r.Nurse)
                .Where(r => r.RecordId == recordId)
                .Select(r => new
                {
                    recordId = r.RecordId,

                    patient = r.Patient == null
                        ? null
                        : new
                        {
                            patientId = r.Patient.PatientId,
                            name = r.Patient.Name,
                            age = r.Patient.Age,
                            gender = r.Patient.Gender,
                            phone = r.Patient.Phone,
                            email = r.Patient.Email
                        },

                    doctor = r.Doctor == null
                        ? null
                        : new
                        {
                            doctorId = r.Doctor.DoctorId,
                            name = r.Doctor.Name,
                            specialization = r.Doctor.Specialization
                        },

                    nurse = r.Nurse == null
                        ? null
                        : new
                        {
                            nurseId = r.Nurse.NurseId,
                            name = r.Nurse.Name,
                            department = r.Nurse.Department
                        },

                    diagnosis = r.Diagnosis,
                    prescription = r.Prescription,
                    notes = r.Notes,
                    recordDate = r.RecordDate
                })
                .FirstOrDefaultAsync();

            if (record == null)
            {
                return NotFound(new
                {
                    message = "Medical record not found."
                });
            }

            return Ok(record);
        }

        // ==========================================
        // DELETE MEDICAL RECORD
        // DELETE: /api/medical-records/REC001
        // ==========================================

        [HttpDelete("{recordId}")]
        public async Task<IActionResult> DeleteRecord(string recordId)
        {
            var record = await _context.MedicalRecords
                .FirstOrDefaultAsync(r => r.RecordId == recordId);

            if (record == null)
            {
                return NotFound(new
                {
                    message = "Medical record not found."
                });
            }

            _context.MedicalRecords.Remove(record);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Medical record deleted successfully.",
                recordId = recordId
            });
        }
    }
}