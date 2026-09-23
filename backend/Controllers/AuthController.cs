
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly MediShieldContext _context;
        private readonly JwtService _jwtService;

        public AuthController(
            MediShieldContext context,
            JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // =========================
        // REGISTER REQUEST
        // =========================

        public class UserRegisterRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // =========================
        // LOGIN REQUEST
        // =========================

        public class UserLoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // =========================
        // REGISTER
        // POST: /auth/register
        // =========================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] UserRegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new
                {
                    message = "All fields (Name, Email, Password) are required."
                });
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var existingUser = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email);

            if (existingUser)
            {
                return BadRequest(new
                {
                    message = "Email is already registered."
                });
            }

            var passwordHash = HashPassword(request.Password);

            // Normal public registration creates a Patient.
            // Doctor, Nurse and Security Admin accounts should
            // be created by an authorized administrator.
            var newUser = new User
            {
                Name = request.Name.Trim(),
                Email = email,
                PasswordHash = passwordHash,
                Role = "Patient",
                Department = "",
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Welcome {newUser.Name}!",
                email = newUser.Email,
                role = newUser.Role,
                status = "Registration Successful"
            });
        }

        // =========================
        // LOGIN
        // POST: /auth/login
        // =========================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] UserLoginRequest request)
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

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var passwordHash = HashPassword(request.Password);

            if (user.PasswordHash != passwordHash)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            // Generate JWT containing the user's identity and role.
            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                message = "Login successful.",
                token = token,

                user = new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    role = user.Role,
                    department = user.Department,
                    status = user.Status
                }
            });
        }

        // =========================
        // PASSWORD HASHING
        // =========================

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();

            var hashedBytes = sha256.ComputeHash(
                Encoding.UTF8.GetBytes(password)
            );

            return Convert.ToHexString(hashedBytes);
        }
    }
}