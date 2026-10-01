using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookWAis.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationSessionIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Reservations_SessionId",
                table: "Reservations",
                column: "SessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_SessionId",
                table: "Reservations");
        }
    }
}
