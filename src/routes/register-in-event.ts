import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";


export async function registerInEvent(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .post('/events/:eventId/attendees', {
        schema:{ 
        summary: 'registers for an event',
        tags: ['attendees'],
            body: z.object({
                name: z.string().min(4),
                email: z.string().email(),
            }),
            params: z.object({
                eventId: z.string().uuid(),
            }),
            response:{
                201: z.object({
                    attendeeId: z.number(),
                })
            }
        }
    } , async (request, reply) => {
        const { eventId } = request.params
        const { name, email } = request.body

        const attendeeFromEmail = await prisma.attendee.findUnique({
            where:{
               eventId_email: {email, eventId},
            }
        })
        
        const [event, numberOfAttendeesInEvent] = await Promise.all([
            await prisma.event.findUnique({
            where: { id: eventId}
        }),
            await prisma.attendee.count({
            where: {
                eventId
            }})
        ])
        
        if (attendeeFromEmail !== null) {
            throw new BadRequest('this e-mail is already registered to this event')
        }
        
        if(event?.maxAttendees && numberOfAttendeesInEvent > event?.maxAttendees){
            throw new BadRequest("Sorry this event has no remaining vacancies")
        }

        const attendee = await prisma.attendee.create({
            data:{
                name,
                email,
                eventId,
            }
        })
        return reply.status(201).send({ attendeeId: attendee.id })
    })
}