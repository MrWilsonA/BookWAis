using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookWAis.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Speakers",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "SessionID",
                table: "Reservations",
                newName: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_UserId_SessionId",
                table: "Reservations",
                columns: new[] { "UserId", "SessionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_UserId_SessionId",
                table: "Reservations");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Speakers",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "SessionId",
                table: "Reservations",
                newName: "SessionID");
        }
    }
}
