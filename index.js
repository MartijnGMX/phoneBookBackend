const express = require('express')
const morgan = require('morgan')

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const app = express()

app.use(express.json())

morgan.token('bodyData', function (req, res) {
    return JSON.stringify(req.body)
})

// app.use(morgan('tiny'))
app.use(morgan(':method :url :status :bodyData'))

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:', request.path)
    console.log('Body:', request.body)
    console.log('---')
    next()
}
const unknownEndPoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(requestLogger)

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)

    } else {

        response.statusMessage = 'Person not found!'
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    console.log('request for info received.')
    dateString = new Date().toTimeString()
    console.log(dateString)
    response.send(`
        <div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${dateString}</p>
        </div>
        
        `)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)
    if (person) {
        persons = persons.filter(p => p.id !== id)
        response.status(204).end()
        console.log(`deleted person id=${id}`)
    } else {
        response.statusMessage = `could not delete person id=${id}, not found!`
        response.status(404).end()

        console.log(`could not delete person id=${id}, not found!`)
    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        response.statusMessage = 'name missing'
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        response.statusMessage = 'number missing'
        return response.status(400).json({
            error: 'number missing'
        })
    }
    if (persons.find(p => p.name === body.name)) {
        response.statusMessage = `name ${body.name} already in list!`
        return response.status(400).json({
            error: `name '${body.name}' already in list!`
        })
    }
    const person = {
        id: String(Math.floor(Math.random() * 1000)),
        name: body.name,
        number: body.number,
    }
    persons.push(person)
    response.json(person)
})

app.use(unknownEndPoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Phonebook backend running on port ${PORT} `)
})