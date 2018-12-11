if (Utils.mobileAndTabletcheck()) new Background(document.querySelector('#bg'));

// alert('ok')

// const search = document.querySelector('#search');
// const main = document.querySelector('#main');
const searchResults = document.querySelector('#search-results');
console.log(searchResults)

const connection = new Utils.DataBaseConnection();
connection.promise().then(() => {
    console.log(connection.data)
    Utils.DataBaseConnection.generateSearchResults(searchResults, connection.data);

    console.log(connection.data)
})