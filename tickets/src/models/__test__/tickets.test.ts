import { Ticket } from "../tickets"


it('implements Optimistic Concurrency Control', async () => {

    // create an instance of a ticket
    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        userId: '234'
    })

    // save it to the database
    await ticket.save()

    // fetch the ticket twice
    const first = await Ticket.findById(ticket.id)
    const second = await Ticket.findById(ticket.id)

    // make two separate changes to the tickets we fetched
    first!.set({ price: 99 })
    second!.set({ price: 34 })

    // save the first fetched ticket
    await first!.save()

    // save the second fetched ticket and expect an error.
    try {
        await second!.save()
    }
    catch(err) {
        return;
    }

    throw new Error("Should not reach this point.")
});




it("increments the version number on multiple saves.", async() => {

    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        userId: '234'
    })
    await ticket.save()
    expect(ticket.version).toEqual(0)

    await ticket.save()
    expect(ticket.version).toEqual(1)

    await ticket.save()
    expect(ticket.version).toEqual(2)
})