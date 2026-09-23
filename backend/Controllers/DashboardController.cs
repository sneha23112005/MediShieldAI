using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
private readonly MediShieldContext _context;

    public DashboardController(MediShieldContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var totalVulnerabilities = await _context.Vulnerabilities.CountAsync();

        var criticalVulnerabilities = await _context.Vulnerabilities
            .CountAsync(v => v.Severity.ToLower() == "critical");

        var highVulnerabilities = await _context.Vulnerabilities
            .CountAsync(v => v.Severity.ToLower() == "high");

        var activeVulnerabilities = await _context.Vulnerabilities
            .CountAsync(v =>
                v.Status.ToLower() != "resolved" &&
                v.Status.ToLower() != "closed");

        var totalUsers = await _context.Users.CountAsync();

        var activeUsers = await _context.Users
            .CountAsync(u => u.Status.ToLower() == "active");

        var administrators = await _context.Users
            .CountAsync(u => u.Role.ToLower() == "security admin");

        // Temporary calculated score.
        // This will later be replaced by a dedicated security scoring system.
        var securityScore = CalculateSecurityScore(
            totalVulnerabilities,
            criticalVulnerabilities,
            highVulnerabilities,
            activeUsers,
            totalUsers
        );

        var dashboard = new
        {
            securityScore,
            criticalThreats = criticalVulnerabilities,
            vulnerabilities = totalVulnerabilities,
            securityEvents = await _context.SecurityEvents.CountAsync(),

            totalUsers,
            activeUsers,
            administrators,

            criticalVulnerabilities,
            highVulnerabilities,
            activeVulnerabilities,

            lastUpdated = DateTime.UtcNow
        };

        return Ok(dashboard);
    }

    private static int CalculateSecurityScore(
        int totalVulnerabilities,
        int criticalVulnerabilities,
        int highVulnerabilities,
        int activeUsers,
        int totalUsers)
    {
        var score = 100;

        score -= criticalVulnerabilities * 10;
        score -= highVulnerabilities * 5;
        score -= Math.Min(totalVulnerabilities, 20);

        if (totalUsers > 0 && activeUsers < totalUsers)
        {
            score -= 5;
        }

        return Math.Clamp(score, 0, 100);
    }
}

}
