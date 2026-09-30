using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly MediShieldContext _context;

        // Roles supported by the MediShield AI application
        private static readonly string[] AllowedRoles =
        {
            "Security Admin",
            "SOC Analyst",
            "Doctor",
            "Nurse",
            "Patient"
        };

        public UsersController(MediShieldContext context)
        {
            _context = context;
        }

        // =========================================================
        // GET: api/users
        // =========================================================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role,
                    Department = u.Department,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // =========================================================
        // GET: api/users/{id}
        // =========================================================

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Department = user.Department,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            });
        }

        // =========================================================
        // POST: api/users
        // CREATE USER
        // =========================================================

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(
            [FromBody] CreateUserDto request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Request body is required."
                });
            }

            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Name, email and password are required."
                });
            }

            // Validate role
            if (!AllowedRoles.Contains(request.Role))
            {
                return BadRequest(new
                {
                    message =
                        "Invalid role. Allowed roles are Security Admin, SOC Analyst, Doctor, Nurse, and Patient."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            // Prevent duplicate email
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                return Conflict(new
                {
                    message = "A user with this email already exists."
                });
            }

            var user = new User
            {
                Name = request.Name.Trim(),
                Email = email,
                PasswordHash = HashPassword(request.Password),
                Role = request.Role,
                Department = request.Department?.Trim() ?? "",
                Status = string.IsNullOrWhiteSpace(request.Status)
                    ? "Active"
                    : request.Status.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            var response = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Department = user.Department,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            };

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                response
            );
        }

        // =========================================================
        // PUT: api/users/{id}
        // UPDATE USER
        // =========================================================

        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> UpdateUser(
            int id,
            [FromBody] UpdateUserDto request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    message = "Request body is required."
                });
            }

            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
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

            // Validate role
            if (!AllowedRoles.Contains(request.Role))
            {
                return BadRequest(new
                {
                    message =
                        "Invalid role. Allowed roles are Security Admin, SOC Analyst, Doctor, Nurse, and Patient."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            // Prevent duplicate email
            if (await _context.Users.AnyAsync(
                u => u.Email == email && u.Id != id))
            {
                return Conflict(new
                {
                    message = "Another user already uses this email."
                });
            }

            user.Name = request.Name.Trim();
            user.Email = email;
            user.Role = request.Role;
            user.Department = request.Department?.Trim() ?? "";
            user.Status = string.IsNullOrWhiteSpace(request.Status)
                ? "Active"
                : request.Status.Trim();

            // Password is optional during edit
            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();

            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Department = user.Department,
                Status = user.Status,
                CreatedAt = user.CreatedAt
            });
        }

        // =========================================================
        // DELETE: api/users/{id}
        // =========================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User deleted successfully"
            });
        }

        // =========================================================
        // PASSWORD HASHING
        // =========================================================

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();

            var bytes = Encoding.UTF8.GetBytes(password);

            var hash = sha256.ComputeHash(bytes);

            return Convert.ToHexString(hash);
        }
    }
}