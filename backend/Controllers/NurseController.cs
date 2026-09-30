using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/nurses")]
    public class NurseController : ControllerBase
    {
        private readonly MediShieldContext _context;
        private readonly JwtService _jwtService;

        public NurseController(
            MediShieldContext context,
            JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // ==========================================
        // NURSE REGISTER
        // POST: /api/nurses/register
        // ==========================================

        public class NurseRegisterRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Department { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] NurseRegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Department))
            {
                return BadRequest(new
                {
                    message = "Name, email, password and department are required."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var existingNurse = await _context.Nurses
                .AnyAsync(n => n.Email.ToLower() == email);

            if (existingNurse)
            {
                return Conflict(new
                {
                    message = "Nurse email is already registered."
                });
            }

            var lastNurse = await _context.Nurses
                .OrderByDescending(n => n.Id)
                .FirstOrDefaultAsync();

            var number = 1;

            if (lastNurse != null &&
                !string.IsNullOrWhiteSpace(lastNurse.NurseId))
            {
                var numericPart = lastNurse.NurseId.Replace("NUR", "");

                if (int.TryParse(numericPart, out var lastNumber))
                {
                    number = lastNumber + 1;
                }
            }

            var nurseId = $"NUR{number:D3}";

            var nurse = new Nurse
            {
                NurseId = nurseId,
                Name = request.Name.Trim(),
                Department = request.Department.Trim(),
                Phone = request.Phone?.Trim() ?? "",
                Email = email,
                PasswordHash = HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Nurses.Add(nurse);

            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                message = "Nurse registered successfully.",
                nurseId = nurse.NurseId,
                nurse = new
                {
                    nurseId = nurse.NurseId,
                    name = nurse.Name,
                    department = nurse.Department,
                    phone = nurse.Phone,
                    email = nurse.Email
                }
            });
        }

        // ==========================================
        // NURSE LOGIN
        // POST: /api/nurses/login
        // ==========================================

        public class NurseLoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] NurseLoginRequest request)
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

            var nurse = await _context.Nurses
                .FirstOrDefaultAsync(n => n.Email.ToLower() == email);

            if (nurse == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var passwordHash = HashPassword(request.Password);

            if (nurse.PasswordHash != passwordHash)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var jwtUser = new User
            {
                Id = nurse.Id,
                Name = nurse.Name,
                Email = nurse.Email,
                Role = "Nurse",
                Department = nurse.Department,
                Status = "Active"
            };

            var token = _jwtService.GenerateToken(jwtUser);

            return Ok(new
            {
                message = "Nurse login successful.",
                token = token,
                nurse = new
                {
                    nurseId = nurse.NurseId,
                    name = nurse.Name,
                    department = nurse.Department,
                    phone = nurse.Phone,
                    email = nurse.Email
                }
            });
        }

        // ==========================================
        // GET ALL NURSES
        // GET: /api/nurses
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAllNurses()
        {
            var nurses = await _context.Nurses
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    nurseId = n.NurseId,
                    name = n.Name,
                    department = n.Department,
                    phone = n.Phone,
                    email = n.Email,
                    createdAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(nurses);
        }

        // ==========================================
        // GET NURSE PROFILE
        // GET: /api/nurses/{nurseId}
        // ==========================================

        [HttpGet("{nurseId}")]
        public async Task<IActionResult> GetNurse(string nurseId)
        {
            if (string.IsNullOrWhiteSpace(nurseId))
            {
                return BadRequest(new
                {
                    message = "Nurse ID is required."
                });
            }

            var nurse = await _context.Nurses
                .FirstOrDefaultAsync(n => n.NurseId == nurseId);

            if (nurse == null)
            {
                return NotFound(new
                {
                    message = "Nurse not found."
                });
            }

            return Ok(new
            {
                nurseId = nurse.NurseId,
                name = nurse.Name,
                department = nurse.Department,
                phone = nurse.Phone,
                email = nurse.Email,
                createdAt = nurse.CreatedAt
            });
        }

        // ==========================================
        // UPDATE NURSE
        // PUT: /api/nurses/{nurseId}
        // ==========================================

        public class UpdateNurseRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Department { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        [HttpPut("{nurseId}")]
        public async Task<IActionResult> UpdateNurse(
            string nurseId,
            [FromBody] UpdateNurseRequest request)
        {
            if (string.IsNullOrWhiteSpace(nurseId))
            {
                return BadRequest(new
                {
                    message = "Nurse ID is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Department))
            {
                return BadRequest(new
                {
                    message = "Name, email and department are required."
                });
            }

            var nurse = await _context.Nurses
                .FirstOrDefaultAsync(n => n.NurseId == nurseId);

            if (nurse == null)
            {
                return NotFound(new
                {
                    message = "Nurse not found."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var emailExists = await _context.Nurses
                .AnyAsync(n =>
                    n.Email.ToLower() == email &&
                    n.NurseId != nurseId);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Another nurse already uses this email."
                });
            }

            nurse.Name = request.Name.Trim();
            nurse.Department = request.Department.Trim();
            nurse.Phone = request.Phone?.Trim() ?? "";
            nurse.Email = email;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Nurse updated successfully.",
                nurse = new
                {
                    nurseId = nurse.NurseId,
                    name = nurse.Name,
                    department = nurse.Department,
                    phone = nurse.Phone,
                    email = nurse.Email,
                    createdAt = nurse.CreatedAt
                }
            });
        }

        // ==========================================
        // DELETE NURSE
        // DELETE: /api/nurses/{nurseId}
        // ==========================================

        [HttpDelete("{nurseId}")]
        public async Task<IActionResult> DeleteNurse(string nurseId)
        {
            if (string.IsNullOrWhiteSpace(nurseId))
            {
                return BadRequest(new
                {
                    message = "Nurse ID is required."
                });
            }

            var nurse = await _context.Nurses
                .FirstOrDefaultAsync(n => n.NurseId == nurseId);

            if (nurse == null)
            {
                return NotFound(new
                {
                    message = "Nurse not found."
                });
            }

            var hasRecords = await _context.MedicalRecords
                .AnyAsync(r => r.NurseId == nurseId);

            if (hasRecords)
            {
                return Conflict(new
                {
                    message = "Nurse cannot be deleted because medical records are linked to this nurse."
                });
            }

            _context.Nurses.Remove(nurse);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Nurse deleted successfully.",
                nurseId = nurseId
            });
        }

        // ==========================================
        // GET NURSE MEDICAL RECORDS
        // GET: /api/nurses/{nurseId}/records
        // ==========================================

        [HttpGet("{nurseId}/records")]
        public async Task<IActionResult> GetRecords(string nurseId)
        {
            if (string.IsNullOrWhiteSpace(nurseId))
            {
                return BadRequest(new
                {
                    message = "Nurse ID is required."
                });
            }

            var nurseExists = await _context.Nurses
                .AnyAsync(n => n.NurseId == nurseId);

            if (!nurseExists)
            {
                return NotFound(new
                {
                    message = "Nurse not found."
                });
            }

            var records = await _context.MedicalRecords
                .Where(r => r.NurseId == nurseId)
                .Include(r => r.Patient)
                .Include(r => r.Doctor)
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
                    specialization = r.Doctor != null
                        ? r.Doctor.Specialization
                        : "",
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