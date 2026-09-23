namespace backend.Models
{
public class SecurityEvent
{
public int Id { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime DetectedAt { get; set; }

    public string? UserEmail { get; set; }
}

}
