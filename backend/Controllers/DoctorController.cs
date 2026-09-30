using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/doctors")]
public class DoctorController : ControllerBase
{
    private readonly MediShieldContext _context;

    public DoctorController(MediShieldContext context)
    {
        _context = context;
    }

    // =========================================================
    // REGISTER DOCTOR
    // POST: /api/doctors/register
    // =========================================================
    [HttpPost("register")]
    public async Task<IActionResult> RegisterDoctor(
        [FromBody] RegisterDoctorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Specialization) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Name, specialization, email and password are required."
            });
        }

        var email = request.Email.Trim().ToLower();

        var existingDoctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.Email.ToLower() == email);

        if (existingDoctor != null)
        {
            return Conflict(new
            {
                message = "A doctor with this email already exists."
            });
        }

        var doctor = new Doctor
        {
            DoctorId = await GenerateDoctorId(),
            Name = request.Name.Trim(),
            Specialization = request.Specialization.Trim(),
            Phone = request.Phone?.Trim() ?? "",
            Email = email,
            PasswordHash = HashPassword(request.Password)
        };

        _context.Doctors.Add(doctor);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Doctor registered successfully.",
            doctorId = doctor.DoctorId,
            name = doctor.Name,
            specialization = doctor.Specialization,
            phone = doctor.Phone,
            email = doctor.Email
        });
    }

    // =========================================================
    // DOCTOR LOGIN
    // POST: /api/doctors/login
    // =========================================================
    [HttpPost("login")]
    public async Task<IActionResult> LoginDoctor(
        [FromBody] LoginDoctorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Email and password are required."
            });
        }

        var email = request.Email.Trim().ToLower();

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.Email.ToLower() == email);

        if (doctor == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var passwordHash = HashPassword(request.Password);

        if (doctor.PasswordHash != passwordHash)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        return Ok(new
        {
            message = "Doctor login successful.",
            doctorId = doctor.DoctorId,
            name = doctor.Name,
            specialization = doctor.Specialization,
            phone = doctor.Phone,
            email = doctor.Email,
            role = "Doctor"
        });
    }

    // =========================================================
    // GET ALL DOCTORS
    // GET: /api/doctors
    // =========================================================
    [HttpGet]
    public async Task<IActionResult> GetDoctors()
    {
        var doctors = await _context.Doctors
            .AsNoTracking()
            .Select(d => new
            {
                d.DoctorId,
                d.Name,
                d.Specialization,
                d.Phone,
                d.Email
            })
            .ToListAsync();

        return Ok(doctors);
    }

    // =========================================================
    // GET SINGLE DOCTOR
    // GET: /api/doctors/{doctorId}
    // =========================================================
    [HttpGet("{doctorId}")]
    public async Task<IActionResult> GetDoctor(string doctorId)
    {
        var doctor = await _context.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DoctorId == doctorId);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Doctor not found."
            });
        }

        return Ok(new
        {
            doctor.DoctorId,
            doctor.Name,
            doctor.Specialization,
            doctor.Phone,
            doctor.Email
        });
    }

    // =========================================================
    // GET DOCTOR MEDICAL RECORDS
    // GET: /api/doctors/{doctorId}/records
    // =========================================================
    [HttpGet("{doctorId}/records")]
    public async Task<IActionResult> GetDoctorRecords(string doctorId)
    {
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.DoctorId == doctorId);

        if (!doctorExists)
        {
            return NotFound(new
            {
                message = "Doctor not found."
            });
        }

        var records = await _context.MedicalRecords
            .AsNoTracking()
            .Where(r => r.DoctorId == doctorId)
            .Select(r => new
            {
                r.RecordId,
                r.PatientId,
                r.DoctorId,
                r.NurseId,
                r.Diagnosis,
                r.Prescription,
                r.Notes
            })
            .ToListAsync();

        return Ok(records);
    }

    // =========================================================
    // UPDATE DOCTOR
    // PUT: /api/doctors/{doctorId}
    // =========================================================
    [HttpPut("{doctorId}")]
    public async Task<IActionResult> UpdateDoctor(
        string doctorId,
        [FromBody] UpdateDoctorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Specialization) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new
            {
                message = "Name, specialization and email are required."
            });
        }

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.DoctorId == doctorId);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Doctor not found."
            });
        }

        var email = request.Email.Trim().ToLower();

        var duplicateEmail = await _context.Doctors
            .AnyAsync(d =>
                d.Email.ToLower() == email &&
                d.DoctorId != doctorId);

        if (duplicateEmail)
        {
            return Conflict(new
            {
                message = "Another doctor is already using this email."
            });
        }

        doctor.Name = request.Name.Trim();
        doctor.Specialization = request.Specialization.Trim();
        doctor.Phone = request.Phone?.Trim() ?? "";
        doctor.Email = email;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Doctor updated successfully.",
            doctorId = doctor.DoctorId,
            name = doctor.Name,
            specialization = doctor.Specialization,
            phone = doctor.Phone,
            email = doctor.Email
        });
    }

    // =========================================================
    // DELETE DOCTOR
    // DELETE: /api/doctors/{doctorId}
    // =========================================================
    [HttpDelete("{doctorId}")]
    public async Task<IActionResult> DeleteDoctor(string doctorId)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.DoctorId == doctorId);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Doctor not found."
            });
        }

        var hasMedicalRecords = await _context.MedicalRecords
            .AnyAsync(r => r.DoctorId == doctorId);

        if (hasMedicalRecords)
        {
            return Conflict(new
            {
                message =
                    "This doctor cannot be deleted because medical records are linked to this doctor."
            });
        }

        _context.Doctors.Remove(doctor);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Doctor deleted successfully.",
            doctorId = doctorId
        });
    }

    // =========================================================
    // GENERATE DOCTOR ID
    // =========================================================
    private async Task<string> GenerateDoctorId()
    {
        var doctors = await _context.Doctors
            .Select(d => d.DoctorId)
            .ToListAsync();

        var maxNumber = 0;

        foreach (var id in doctors)
        {
            if (id.StartsWith("DOC") &&
                int.TryParse(id.Substring(3), out var number))
            {
                if (number > maxNumber)
                {
                    maxNumber = number;
                }
            }
        }

        return $"DOC{(maxNumber + 1):D3}";
    }

    // =========================================================
    // PASSWORD HASH
    // =========================================================
    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();

        var bytes = Encoding.UTF8.GetBytes(password);

        var hash = sha256.ComputeHash(bytes);

        return Convert.ToHexString(hash).ToLower();
    }
}

// =============================================================
// REQUEST MODELS
// =============================================================

public class RegisterDoctorRequest
{
    public string Name { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class LoginDoctorRequest
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class UpdateDoctorRequest
{
    public string Name { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}