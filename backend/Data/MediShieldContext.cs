using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class MediShieldContext : DbContext
    {
        public MediShieldContext(DbContextOptions<MediShieldContext> options)
            : base(options)
        {
        }

        // Existing MediShield entities
        public DbSet<User> Users { get; set; }

        public DbSet<DashboardStats> DashboardStats { get; set; }

        public DbSet<Vulnerability> Vulnerabilities { get; set; }

        public DbSet<SecurityEvent> SecurityEvents { get; set; }

        // Hospital Management entities
        public DbSet<Patient> Patients { get; set; }

        public DbSet<Doctor> Doctors { get; set; }

        public DbSet<Nurse> Nurses { get; set; }

        public DbSet<MedicalRecord> MedicalRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // EXISTING MEDISHIELD CONFIGURATION
            // ==========================================

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // ==========================================
            // PATIENT
            // ==========================================

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.PatientId)
                .IsUnique();

            modelBuilder.Entity<Patient>()
                .HasIndex(p => p.Email)
                .IsUnique();

            // ==========================================
            // DOCTOR
            // ==========================================

            modelBuilder.Entity<Doctor>()
                .HasIndex(d => d.DoctorId)
                .IsUnique();

            modelBuilder.Entity<Doctor>()
                .HasIndex(d => d.Email)
                .IsUnique();

            // ==========================================
            // NURSE
            // ==========================================

            modelBuilder.Entity<Nurse>()
                .HasIndex(n => n.NurseId)
                .IsUnique();

            modelBuilder.Entity<Nurse>()
                .HasIndex(n => n.Email)
                .IsUnique();

            // ==========================================
            // MEDICAL RECORD
            // ==========================================

            modelBuilder.Entity<MedicalRecord>()
                .HasIndex(r => r.RecordId)
                .IsUnique();

            // Patient -> Medical Records
            modelBuilder.Entity<MedicalRecord>()
                .HasOne(r => r.Patient)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(r => r.PatientId)
                .HasPrincipalKey(p => p.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Doctor -> Medical Records
            modelBuilder.Entity<MedicalRecord>()
                .HasOne(r => r.Doctor)
                .WithMany(d => d.MedicalRecords)
                .HasForeignKey(r => r.DoctorId)
                .HasPrincipalKey(d => d.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Nurse -> Medical Records
            modelBuilder.Entity<MedicalRecord>()
                .HasOne(r => r.Nurse)
                .WithMany(n => n.MedicalRecords)
                .HasForeignKey(r => r.NurseId)
                .HasPrincipalKey(n => n.NurseId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}