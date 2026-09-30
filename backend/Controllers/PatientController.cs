
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/patients")]
    public class PatientController : ControllerBase
    {
        private readonly MediShieldContext _context;
        private readonly JwtService _jwtService;

        public PatientController(
            MediShieldContext context,
            JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // ==========================================
        // PATIENT REGISTER
        // POST: /api/patients/register
        // ==========================================

        public class PatientRegisterRequest
        {
            public string Name { get; set; } = string.Empty;
            public int Age { get; set; }
            public string Gender { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] PatientRegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Name, email and password are required."
                });
            }

            if (request.Age < 0 || request.Age > 120)
            {
                return BadRequest(new
                {
                    message = "Please provide a valid age."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var existingPatient = await _context.Patients
                .AnyAsync(p => p.Email.ToLower() == email);

            if (existingPatient)
            {
                return BadRequest(new
                {
                    message = "Patient email is already registered."
                });
            }

            var lastPatient = await _context.Patients
                .OrderByDescending(p => p.Id)
                .FirstOrDefaultAsync();

            var number = 1;

            if (lastPatient != null &&
                !string.IsNullOrWhiteSpace(lastPatient.PatientId))
            {
                var numericPart = lastPatient.PatientId.Replace("PAT", "");

                if (int.TryParse(numericPart, out var lastNumber))
                {
                    number = lastNumber + 1;
                }
            }

            var patientId = $"PAT{number:D3}";

            var patient = new Patient
            {
                PatientId = patientId,
                Name = request.Name.Trim(),
                Age = request.Age,
                Gender = request.Gender?.Trim() ?? "",
                Phone = request.Phone?.Trim() ?? "",
                Email = email,
                PasswordHash = HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Patients.Add(patient);

            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                message = "Patient registered successfully.",
                patientId = patient.PatientId,
                patient = new
                {
                    patientId = patient.PatientId,
                    name = patient.Name,
                    age = patient.Age,
                    gender = patient.Gender,
                    phone = patient.Phone,
                    email = patient.Email
                }
            });
        }

        // ==========================================
        // PATIENT LOGIN
        // POST: /api/patients/login
        // ==========================================

        public class PatientLoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] PatientLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Email and password are required."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Email.ToLower() == email);

            if (patient == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var passwordHash = HashPassword(request.Password);

            if (patient.PasswordHash != passwordHash)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var jwtUser = new User
            {
                Id = patient.Id,
                Name = patient.Name,
                Email = patient.Email,
                Role = "Patient",
                Department = "Healthcare",
                Status = "Active"
            };

            var token = _jwtService.GenerateToken(jwtUser);

            return Ok(new
            {
                message = "Patient login successful.",
                token = token,
                patient = new
                {
                    patientId = patient.PatientId,
                    name = patient.Name,
                    age = patient.Age,
                    gender = patient.Gender,
                    phone = patient.Phone,
                    email = patient.Email
                }
            });
        }

        // ==========================================
        // GET ALL PATIENTS
        // GET: /api/patients
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllPatients()
        {
            var patients = await _context.Patients
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    patientId = p.PatientId,
                    name = p.Name,
                    age = p.Age,
                    gender = p.Gender,
                    phone = p.Phone,
                    email = p.Email,
                    createdAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(patients);
        }

        // ==========================================
        // GET PATIENT PROFILE
        // GET: /api/patients/{patientId}
        // ==========================================

        [HttpGet("{patientId}")]
        public async Task<IActionResult> GetPatient(string patientId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found."
                });
            }

            return Ok(new
            {
                patientId = patient.PatientId,
                name = patient.Name,
                age = patient.Age,
                gender = patient.Gender,
                phone = patient.Phone,
                email = patient.Email,
                createdAt = patient.CreatedAt
            });
        }

        // ==========================================
        // UPDATE PATIENT
        // PUT: /api/patients/{patientId}
        // ==========================================

        public class UpdatePatientRequest
        {
            public string Name { get; set; } = string.Empty;
            public int Age { get; set; }
            public string Gender { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        [HttpPut("{patientId}")]
        public async Task<IActionResult> UpdatePatient(
            string patientId,
            [FromBody] UpdatePatientRequest request)
        {
            if (string.IsNullOrWhiteSpace(patientId))
            {
                return BadRequest(new
                {
                    message = "Patient ID is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new
                {
                    message = "Name and email are required."
                });
            }

            if (request.Age < 0 || request.Age > 120)
            {
                return BadRequest(new
                {
                    message = "Please provide a valid age."
                });
            }

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var emailExists = await _context.Patients
                .AnyAsync(p =>
                    p.Email.ToLower() == email &&
                    p.PatientId != patientId);

            if (emailExists)
            {
                return BadRequest(new
                {
                    message = "Another patient is already using this email."
                });
            }

            patient.Name = request.Name.Trim();
            patient.Age = request.Age;
            patient.Gender = request.Gender?.Trim() ?? "";
            patient.Phone = request.Phone?.Trim() ?? "";
            patient.Email = email;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Patient updated successfully.",
                patient = new
                {
                    patientId = patient.PatientId,
                    name = patient.Name,
                    age = patient.Age,
                    gender = patient.Gender,
                    phone = patient.Phone,
                    email = patient.Email,
                    createdAt = patient.CreatedAt
                }
            });
        }

        // ==========================================
        // DELETE PATIENT
        // DELETE: /api/patients/{patientId}
        // ==========================================

        [HttpDelete("{patientId}")]
        public async Task<IActionResult> DeletePatient(string patientId)
        {
            if (string.IsNullOrWhiteSpace(patientId))
            {
                return BadRequest(new
                {
                    message = "Patient ID is required."
                });
            }

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found."
                });
            }

            var hasRecords = await _context.MedicalRecords
                .AnyAsync(r => r.PatientId == patientId);

            if (hasRecords)
            {
                return Conflict(new
                {
                    message = "Patient cannot be deleted because medical records are linked to this patient."
                });
            }

            _context.Patients.Remove(patient);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Patient deleted successfully.",
                patientId = patientId
            });
        }

        // ==========================================
        // GET PATIENT MEDICAL RECORDS
        // GET: /api/patients/{patientId}/records
        // ==========================================

        [HttpGet("{patientId}/records")]
        public async Task<IActionResult> GetRecords(string patientId)
        {
            if (string.IsNullOrWhiteSpace(patientId))
            {
                return BadRequest(new
                {
                    message = "Patient ID is required."
                });
            }

            var patientExists = await _context.Patients
                .AnyAsync(p => p.PatientId == patientId);

            if (!patientExists)
            {
                return NotFound(new
                {
                    message = "Patient not found."
                });
            }

            var records = await _context.MedicalRecords
                .Where(r => r.PatientId == patientId)
                .Include(r => r.Doctor)
                .Include(r => r.Nurse)
                .OrderByDescending(r => r.RecordDate)
                .Select(r => new
                {
                    recordId = r.RecordId,
                    doctorId = r.DoctorId,
                    doctorName = r.Doctor != null
                        ? r.Doctor.Name
                        : "",
                    specialization = r.Doctor != null
                        ? r.Doctor.Specialization
                        : "",
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
        // PASSWORD HASHING
        // ==========================================

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();

            var bytes = sha256.ComputeHash(
                Encoding.UTF8.GetBytes(password)
            );

            return Convert.ToHexString(bytes);
        }
    }
}