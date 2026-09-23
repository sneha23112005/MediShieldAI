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

        public DbSet<User> Users { get; set; }

        public DbSet<DashboardStats> DashboardStats { get; set; }
        public DbSet<Vulnerability> Vulnerabilities { get; set; }
        public DbSet<SecurityEvent> SecurityEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}