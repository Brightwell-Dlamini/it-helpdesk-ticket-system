import { Header } from "@/components/layout/header";
import { getTickets } from "@/lib/data";
import { TicketsBoard } from "@/components/tickets/tickets-board";

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div>
      <Header
        title="Tickets"
        description={`${tickets.length} tickets in the system`}
      />
      <TicketsBoard tickets={tickets} />
    </div>
  );
}
