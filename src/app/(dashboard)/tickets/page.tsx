import { Header } from "@/components/layout/header";
import { getTickets, getCurrentUser } from "@/lib/data";
import { currentUser as mockUser } from "@/lib/mock-data";
import { TicketsBoard } from "@/components/tickets/tickets-board";

export default async function TicketsPage() {
  const [tickets, me] = await Promise.all([
    getTickets(),
    getCurrentUser(),
  ]);
  const user = me ?? mockUser;

  return (
    <div>
      <Header
        title="Tickets"
        description={
          user.role === "requester"
            ? "Your support requests"
            : `${tickets.length} tickets in the system`
        }
      />
      <TicketsBoard
        tickets={tickets}
        currentUserId={user.id}
        currentUserRole={user.role}
      />
    </div>
  );
}
