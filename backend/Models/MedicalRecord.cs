namespace backend.Models
{
    public class MedicalRecord
    {
        public int Id { get; set; }

        public string RecordId { get; set; } = string.Empty;

        public string PatientId { get; set; } = string.Empty;

        public string DoctorId { get; set; } = string.Empty;

        public string? NurseId { get; set; }

        public string Diagnosis { get; set; } = string.Empty;

        public string Prescription { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public DateTime RecordDate { get; set; } = DateTime.UtcNow;

        public Patient? Patient { get; set; }

        public Doctor? Doctor { get; set; }

        public Nurse? Nurse { get; set; }
    }
}