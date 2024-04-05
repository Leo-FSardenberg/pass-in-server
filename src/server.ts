import fastify  from "fastify";
import fastifySwagger  from "@fastify/swagger";
import fastifySwaggerUI  from "@fastify/swagger-ui";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { createEvent } from "./routes/create-event";
import { registerInEvent } from "./routes/register-in-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import fastifyCors from "@fastify/cors";

const app = fastify()

app.register(fastifySwagger, {
    swagger: {
        consumes: ['application/json'],
        produces: ['application/json'],
        info: {
            title: 'pass-in',
            description: 'Especificações: API para check-in de atendentes de um evento',
            version: '1.0.0'
        },
    },
    transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
})
app.register(fastifyCors, {
    origin: '*'
})


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(createEvent)
app.register(registerInEvent)
app.register(getEvent)
app.register(getEventAttendees)
app.register(getAttendeeBadge)
app.register(checkIn)

app.listen({port: 3333, host: '0.0.0.0'}).then(() => {
    console.log("it's working")
})