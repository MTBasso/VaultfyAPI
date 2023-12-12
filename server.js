const app = require('./index')

app.listen(process.env.SERVER_PORT || 3000, () => {
    console.log('Server is running');
})
