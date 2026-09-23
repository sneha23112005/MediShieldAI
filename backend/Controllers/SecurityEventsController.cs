using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
[ApiController]
[Route("api/[controller]")]
public class SecurityEventsController : ControllerBase
{
private readonly MediShieldContext _context;

    public SecurityEventsController(MediShieldContext context)
    {
        _context = context;
    }

    // GET: api/SecurityEvents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SecurityEvent>>> GetSecurityEvents()
    {
        var events = await _context.SecurityEvents
            .OrderByDescending(e => e.DetectedAt)
            .ToListAsync();

        return Ok(events);
    }

    // GET: api/SecurityEvents/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SecurityEvent>> GetSecurityEvent(int id)
    {
        var securityEvent = await _context.SecurityEvents.FindAsync(id);

        if (securityEvent == null)
        {
            return NotFound();
        }

        return Ok(securityEvent);
    }

    // POST: api/SecurityEvents
    [HttpPost]
    public async Task<ActionResult<SecurityEvent>> CreateSecurityEvent(
        SecurityEvent securityEvent)
    {
        securityEvent.DetectedAt = DateTime.UtcNow;

        _context.SecurityEvents.Add(securityEvent);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSecurityEvent),
            new { id = securityEvent.Id },
            securityEvent);
    }

    // PUT: api/SecurityEvents/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSecurityEvent(
        int id,
        SecurityEvent securityEvent)
    {
        if (id != securityEvent.Id)
        {
            return BadRequest();
        }

        var existingEvent = await _context.SecurityEvents.FindAsync(id);

        if (existingEvent == null)
        {
            return NotFound();
        }

        existingEvent.EventType = securityEvent.EventType;
        existingEvent.Severity = securityEvent.Severity;
        existingEvent.Description = securityEvent.Description;
        existingEvent.Source = securityEvent.Source;
        existingEvent.Status = securityEvent.Status;
        existingEvent.UserEmail = securityEvent.UserEmail;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/SecurityEvents/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSecurityEvent(int id)
    {
        var securityEvent = await _context.SecurityEvents.FindAsync(id);

        if (securityEvent == null)
        {
            return NotFound();
        }

        _context.SecurityEvents.Remove(securityEvent);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

}
