namespace backend.Models
{
    public class Doctor
    {
        public int Id { get; set; }

        public string DoctorId { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Specialization { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<MedicalRecord> MedicalRecords { get; set; }
            = new List<MedicalRecord>();
    }
}