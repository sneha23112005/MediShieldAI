namespace backend.Models
{
    public class DashboardStats
    {
        public int Id { get; set; }

        public int SecurityScore { get; set; }

        public int TotalVulnerabilities { get; set; }

        public int CriticalVulnerabilities { get; set; }

        public int HighVulnerabilities { get; set; }

        public int ActiveThreats { get; set; }

        public int SecurityEvents { get; set; }

        public int TotalUsers { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}